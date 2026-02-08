
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        await prisma.file.update({
            where: { id: params.id },
            data: { downloads: { increment: 1 } },
        });

        return NextResponse.json({ message: "Download count incremented" });
    } catch (error) {
        console.error("Error incrementing download count:", error);
        return NextResponse.json({ message: "Error incrementing download count" }, { status: 500 });
    }
}
