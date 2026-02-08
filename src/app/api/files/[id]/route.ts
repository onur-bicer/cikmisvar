import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { del } from "@vercel/blob";

export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const userId = (session.user as any).id;
        const userRole = (session.user as any).role;

        // Check if file exists
        const file = await prisma.file.findUnique({
            where: { id: params.id },
        });

        if (!file) {
            return NextResponse.json({ message: "File not found" }, { status: 404 });
        }

        // Check permissions: Owner or Admin
        if (file.uploaderId !== userId && userRole !== "admin") {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        // Delete from Vercel Blob (if it's a blob URL)
        // Check if filePath is a blob URL
        if (file.filePath.startsWith("http")) {
            try {
                await del(file.filePath);
            } catch (error) {
                console.error("Failed to delete blob:", error);
                // Continue deleting from DB even if blob delete fails
            }
        }

        // Delete from DB
        await prisma.file.delete({
            where: { id: params.id },
        });

        return NextResponse.json({ message: "File deleted successfully" });
    } catch (error) {
        console.error("Error deleting file:", error);
        return NextResponse.json({ message: "Error deleting file" }, { status: 500 });
    }
}
