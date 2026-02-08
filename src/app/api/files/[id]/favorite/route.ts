import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(
    req: Request,
    { params }: { params: { id: string } }
) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const userId = session.user.id;
        const fileId = params.id;

        // Toggle favorite
        const existingInterest = await prisma.favorite.findUnique({
            where: { userId_fileId: { userId, fileId } },
        });

        if (existingInterest) {
            await prisma.favorite.delete({
                where: { userId_fileId: { userId, fileId } },
            });
            return NextResponse.json({ message: "Removed from favorites", isFavorite: false });
        } else {
            await prisma.favorite.create({
                data: { userId, fileId },
            });
            return NextResponse.json({ message: "Added to favorites", isFavorite: true });
        }
    } catch (error) {
        return NextResponse.json({ message: "Error toggling favorite" }, { status: 500 });
    }
}
