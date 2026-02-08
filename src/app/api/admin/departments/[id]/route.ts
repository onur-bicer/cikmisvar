
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// PUT: Update a department
export async function PUT(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if ((session?.user as any)?.role !== "admin") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
        }

        const { name, universityId } = await req.json();

        if (!name || !universityId) {
            return NextResponse.json({ message: "Name and University ID are required" }, { status: 400 });
        }

        // Check uniqueness
        const existing = await prisma.department.findFirst({
            where: {
                name,
                universityId,
                NOT: { id: params.id }
            }
        });

        if (existing) {
            return NextResponse.json({ message: "Department name already exists in this university" }, { status: 400 });
        }

        const department = await prisma.department.update({
            where: { id: params.id },
            data: { name, universityId }
        });

        return NextResponse.json(department);
    } catch (error) {
        console.error("Error updating department:", error);
        return NextResponse.json({ message: "Error updating department" }, { status: 500 });
    }
}

// DELETE: Delete a department
export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if ((session?.user as any)?.role !== "admin") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
        }

        await prisma.department.delete({
            where: { id: params.id }
        });

        return NextResponse.json({ message: "Department deleted successfully" });
    } catch (error) {
        console.error("Error deleting department:", error);
        if ((error as any).code === 'P2003') {
            return NextResponse.json({ message: "Cannot delete department because it has related courses or files." }, { status: 400 });
        }
        return NextResponse.json({ message: "Error deleting department" }, { status: 500 });
    }
}
