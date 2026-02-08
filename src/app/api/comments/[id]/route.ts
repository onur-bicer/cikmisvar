import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

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

        // Check if comment exists
        const comment = await prisma.comment.findUnique({
            where: { id: params.id },
            include: { file: true }, // To potentially check file ownership too if needed
        });

        if (!comment) {
            return NextResponse.json({ message: "Comment not found" }, { status: 404 });
        }

        // Check permissions: Owner or Admin
        // Allow deletion if:
        // 1. User is the comment author
        // 2. User is an admin
        // 3. User is the uploader of the file the comment is on (optional, but good for moderation)
        const isAuthor = comment.userId === userId;
        const isAdmin = userRole === "admin";
        const isFileOwner = comment.file.uploaderId === userId;

        if (!isAuthor && !isAdmin && !isFileOwner) {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        // Delete from DB
        await prisma.comment.delete({
            where: { id: params.id },
        });

        return NextResponse.json({ message: "Comment deleted successfully" });
    } catch (error) {
        console.error("Error deleting comment:", error);
        return NextResponse.json({ message: "Error deleting comment" }, { status: 500 });
    }
}
