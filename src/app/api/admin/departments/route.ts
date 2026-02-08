
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET: List all departments (optionally filter by universityId)
export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if ((session?.user as any)?.role !== "admin") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const universityId = searchParams.get("universityId");

        const where = universityId ? { universityId } : {};

        const departments = await prisma.department.findMany({
            where,
            orderBy: { name: "asc" },
            include: {
                university: { select: { name: true } },
                _count: {
                    select: { courses: true, files: true }
                }
            }
        });

        return NextResponse.json(departments);
    } catch (error) {
        console.error("Error fetching departments:", error);
        return NextResponse.json({ message: "Error fetching departments" }, { status: 500 });
    }
}

// POST: Create a new department
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if ((session?.user as any)?.role !== "admin") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
        }

        const { name, universityId } = await req.json();

        if (!name || !universityId) {
            return NextResponse.json({ message: "Name and University ID are required" }, { status: 400 });
        }

        const existing = await prisma.department.findUnique({
            where: {
                name_universityId: {
                    name,
                    universityId
                }
            }
        });

        if (existing) {
            return NextResponse.json({ message: "Department already exists in this university" }, { status: 400 });
        }

        const department = await prisma.department.create({
            data: {
                name,
                universityId
            }
        });

        return NextResponse.json(department, { status: 201 });
    } catch (error) {
        console.error("Error creating department:", error);
        return NextResponse.json({ message: "Error creating department" }, { status: 500 });
    }
}
