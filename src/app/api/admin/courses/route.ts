
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET: List all courses (optionally filter by departmentId)
export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if ((session?.user as any)?.role !== "admin") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const departmentId = searchParams.get("departmentId");

        const where = departmentId ? { departmentId } : {};

        const courses = await prisma.course.findMany({
            where,
            orderBy: { name: "asc" },
            include: {
                department: {
                    select: {
                        name: true,
                        university: { select: { name: true } }
                    }
                },
                _count: {
                    select: { files: true }
                }
            }
        });

        return NextResponse.json(courses);
    } catch (error) {
        console.error("Error fetching courses:", error);
        return NextResponse.json({ message: "Error fetching courses" }, { status: 500 });
    }
}

// POST: Create a new course
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if ((session?.user as any)?.role !== "admin") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
        }

        const { name, departmentId } = await req.json();

        if (!name || !departmentId) {
            return NextResponse.json({ message: "Name and Department ID are required" }, { status: 400 });
        }

        const existing = await prisma.course.findUnique({
            where: {
                name_departmentId: {
                    name,
                    departmentId
                }
            }
        });

        if (existing) {
            return NextResponse.json({ message: "Course already exists in this department" }, { status: 400 });
        }

        const course = await prisma.course.create({
            data: {
                name,
                departmentId
            }
        });

        return NextResponse.json(course, { status: 201 });
    } catch (error) {
        console.error("Error creating course:", error);
        return NextResponse.json({ message: "Error creating course" }, { status: 500 });
    }
}
