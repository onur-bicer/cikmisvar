
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "admin") {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const users = await prisma.user.findMany({
            orderBy: {
                createdAt: 'desc',
            },
            select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                role: true,
                createdAt: true,
                _count: {
                    select: {
                        uploads: true,
                        comments: true,
                    }
                }
            }
        });

        return NextResponse.json(users);
    } catch (error) {
        console.error("Error fetching admin users:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
