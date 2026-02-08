
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET: List all universities
export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if ((session?.user as any)?.role !== "admin") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
        }

        const universities = await prisma.university.findMany({
            orderBy: { name: "asc" },
            include: {
                _count: {
                    select: { departments: true, files: true }
                }
            }
        });

        return NextResponse.json(universities);
    } catch (error) {
        console.error("Error fetching universities:", error);
        return NextResponse.json({ message: "Error fetching universities" }, { status: 500 });
    }
}

// POST: Create a new university
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if ((session?.user as any)?.role !== "admin") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
        }

        const { name, city } = await req.json();

        if (!name) {
            return NextResponse.json({ message: "Name is required" }, { status: 400 });
        }

        const existing = await prisma.university.findUnique({
            where: { name }
        });

        if (existing) {
            return NextResponse.json({ message: "University already exists" }, { status: 400 });
        }

        const university = await prisma.university.create({
            data: {
                name,
                city
            }
        });

        return NextResponse.json(university, { status: 201 });
    } catch (error) {
        console.error("Error creating university:", error);
        return NextResponse.json({ message: "Error creating university" }, { status: 500 });
    }
}
