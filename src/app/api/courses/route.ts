import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q");
    const departmentId = searchParams.get("departmentId");

    try {
        const where: any = {};
        if (departmentId) {
            where.departmentId = departmentId;
        }
        if (q) {
            where.name = { contains: q, mode: "insensitive" };
        }

        const courses = await prisma.course.findMany({
            where,
            select: {
                id: true,
                name: true,
                departmentId: true,
                // Include file count if needed, but for now simple list
                _count: {
                    select: { files: true },
                },
            },
            orderBy: {
                name: "asc",
            },
        });

        // Map to match frontend expected structure if necessary, or just return as is
        // The frontend types has `fileCount`, so we should map it
        const formattedCourses = courses.map((course) => ({
            id: course.id,
            name: course.name,
            departmentId: course.departmentId,
            fileCount: course._count.files,
        }));

        return NextResponse.json(formattedCourses);
    } catch (error) {
        return NextResponse.json(
            { message: "Error fetching courses" },
            { status: 500 }
        );
    }
}
