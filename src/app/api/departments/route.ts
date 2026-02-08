import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q");
    const universityId = searchParams.get("universityId");

    try {
        const where: any = {};
        if (universityId) {
            where.universityId = universityId;
        }
        if (q) {
            where.name = { contains: q, mode: "insensitive" };
        }

        const departments = await prisma.department.findMany({
            where,
            select: {
                id: true,
                name: true,
                universityId: true,
            },
            orderBy: {
                name: "asc",
            },
        });

        return NextResponse.json(departments);
    } catch (error) {
        return NextResponse.json(
            { message: "Error fetching departments" },
            { status: 500 }
        );
    }
}
