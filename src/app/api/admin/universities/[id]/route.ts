
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// PUT: Update a university
export async function PUT(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if ((session?.user as any)?.role !== "admin") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
        }

        const { name, city } = await req.json();

        if (!name) {
            return NextResponse.json({ message: "Name is required" }, { status: 400 });
        }

        // Check if name is taken by another university
        const existing = await prisma.university.findFirst({
            where: {
                name,
                NOT: { id: params.id }
            }
        });

        if (existing) {
            return NextResponse.json({ message: "University name already exists" }, { status: 400 });
        }

        const university = await prisma.university.update({
            where: { id: params.id },
            data: { name, city }
        });

        return NextResponse.json(university);
    } catch (error) {
        console.error("Error updating university:", error);
        return NextResponse.json({ message: "Error updating university" }, { status: 500 });
    }
}

// DELETE: Delete a university
export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if ((session?.user as any)?.role !== "admin") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
        }

        // Optional: Check if it has related data (departments/files) and prevent deletion?
        // Or let Cascade delete handle it? Schema probably doesn't have Cascade on University relations?
        // Let's check schema.
        // Schema:
        // model University { ... departments Department[] ... files File[] }
        // model Department { ... university University @relation(... fields: [universityId], references: [id]) ... }
        // Default is usually restrict or set null unless Cascade is specified.
        // Let's assume we want to delete everything for now or fail if there are dependents.
        // Prisma throws error on constraint violation.

        // To be safe, let's delete departments first if we want cascade in code,
        // OR rely on Prisma's onDelete: Cascade if configured.
        // Checking schema: Department definition doesn't show onDelete.
        // So we might get an error.

        // Let's try deleting. If it fails due to foreign key constraint, we should probably inform user to delete departments first.
        // Or implement recursive delete here.

        // For now, simple delete.
        await prisma.university.delete({
            where: { id: params.id }
        });

        return NextResponse.json({ message: "University deleted successfully" });
    } catch (error) {
        console.error("Error deleting university:", error);
        // P2003 is foreign key constraint failed
        if ((error as any).code === 'P2003') {
            return NextResponse.json({ message: "Cannot delete university because it has related departments or files." }, { status: 400 });
        }
        return NextResponse.json({ message: "Error deleting university" }, { status: 500 });
    }
}
