
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// PUT: Update a course
export async function PUT(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if ((session?.user as any)?.role !== "admin") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
        }

        const { name, departmentId } = await req.json();

        if (!name || !departmentId) {
            return NextResponse.json({ message: "Name and Department ID are required" }, { status: 400 });
        }

        const existing = await prisma.course.findFirst({
            where: {
                name,
                departmentId,
                NOT: { id: params.id }
            }
        });

        if (existing) {
            return NextResponse.json({ message: "Course name already exists in this department" }, { status: 400 });
        }

        const course = await prisma.course.update({
            where: { id: params.id },
            data: { name, departmentId }
        });

        return NextResponse.json(course);
    } catch (error) {
        console.error("Error updating course:", error);
        return NextResponse.json({ message: "Error updating course" }, { status: 500 });
    }
}

// DELETE: Delete a course
export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if ((session?.user as any)?.role !== "admin") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
        }

        await prisma.course.delete({
            where: { id: params.id }
        });

        return NextResponse.json({ message: "Course deleted successfully" });
    } catch (error) {
        console.error("Error deleting course:", error);
        if ((error as any).code === 'P2003') {
            return NextResponse.json({ message: "Cannot delete course because it has related files." }, { status: 400 });
        }
        return NextResponse.json({ message: "Error deleting course" }, { status: 500 });
    }
}
