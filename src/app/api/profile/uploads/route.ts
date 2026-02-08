import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const userId = (session.user as any).id;

        const files = await prisma.file.findMany({
            where: { uploaderId: userId },
            orderBy: { createdAt: "desc" },
            include: {
                university: { select: { name: true } },
                department: { select: { name: true } },
                course: { select: { name: true } },
                favorites: {
                    where: { userId }
                },
            },
        });

        const formattedFiles = files.map((file) => ({
            id: file.id,
            uploaderId: file.uploaderId,
            universityId: file.universityId,
            universityName: file.university.name,
            departmentId: file.departmentId,
            departmentName: file.department.name,
            courseId: file.courseId,
            courseName: file.course.name,
            year: file.year,
            examType: file.examType,
            fileSize: file.fileSize,
            uploadedAt: file.createdAt.toISOString(),
            viewCount: file.views,
            previewUrl: file.filePath,
            isFavorite: file.favorites.length > 0,
        }));

        return NextResponse.json(formattedFiles);
    } catch (error) {
        console.error("Error fetching user uploads:", error);
        return NextResponse.json({ message: "Error fetching uploads" }, { status: 500 });
    }
}
