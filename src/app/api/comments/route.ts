import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/comments?fileId=xxx - Get comments for a file
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const fileId = searchParams.get("fileId");

    if (!fileId) {
        return NextResponse.json({ message: "fileId is required" }, { status: 400 });
    }

    try {
        const comments = await prisma.comment.findMany({
            where: { fileId },
            include: {
                user: {
                    select: { name: true, avatar: true }
                }
            },
            orderBy: { createdAt: "desc" }
        });

        const formattedComments = comments.map(comment => ({
            id: comment.id,
            text: comment.text,
            userName: comment.user.name || "Anonim",
            avatar: comment.user.avatar,
            createdAt: comment.createdAt.toISOString()
        }));

        return NextResponse.json(formattedComments);
    } catch (error) {
        console.error("Error fetching comments:", error);
        return NextResponse.json({ message: "Error fetching comments" }, { status: 500 });
    }
}

// POST /api/comments - Add a comment
export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const { fileId, text } = await req.json();

        if (!fileId || !text?.trim()) {
            return NextResponse.json({ message: "fileId and text are required" }, { status: 400 });
        }

        const comment = await prisma.comment.create({
            data: {
                text: text.trim(),
                fileId,
                userId: session.user.id
            },
            include: {
                user: {
                    select: { name: true, avatar: true }
                }
            }
        });

        return NextResponse.json({
            id: comment.id,
            text: comment.text,
            userName: comment.user.name || "Anonim",
            avatar: comment.user.avatar,
            createdAt: comment.createdAt.toISOString()
        }, { status: 201 });
    } catch (error) {
        console.error("Error creating comment:", error);
        return NextResponse.json({ message: "Error creating comment" }, { status: 500 });
    }
}
