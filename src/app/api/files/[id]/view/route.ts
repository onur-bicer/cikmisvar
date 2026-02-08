
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        await prisma.file.update({
            where: { id: params.id },
            data: { views: { increment: 1 } },
        });

        return NextResponse.json({ message: "View count incremented" });
    } catch (error) {
        console.error("Error incrementing view count:", error);
        return NextResponse.json({ message: "Error incrementing view count" }, { status: 500 });
    }
}
