import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const universityId = searchParams.get("universityId");

    if (!universityId) {
        return NextResponse.json(
            { message: "universityId is required" },
            { status: 400 }
        );
    }

    try {
        const departments = await prisma.department.findMany({
            where: {
                universityId,
            },
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
