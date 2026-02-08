
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: {
                _count: {
                    select: {
                        uploads: true,
                        favorites: true,
                    }
                },
                uploads: {
                    select: {
                        views: true,
                    }
                }
            }
        });

        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        const totalViews = user.uploads.reduce((acc, file) => acc + file.views, 0);

        return NextResponse.json({
            uploadCount: user._count.uploads,
            favoriteCount: user._count.favorites,
            totalViews: totalViews,
        });

    } catch (error) {
        console.error("Error fetching profile stats:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
