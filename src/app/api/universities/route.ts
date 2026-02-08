import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const universities = await prisma.university.findMany({
            select: {
                id: true,
                name: true,
            },
            orderBy: {
                name: "asc",
            },
        });

        return NextResponse.json(universities);
    } catch (error) {
        return NextResponse.json(
            { message: "Error fetching universities" },
            { status: 500 }
        );
    }
}
