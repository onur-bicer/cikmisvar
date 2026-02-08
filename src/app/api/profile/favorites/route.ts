import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const userId = (session.user as any).id;

        const favorites = await prisma.favorite.findMany({
            where: { userId },
            include: {
                file: {
                    include: {
                        university: { select: { name: true } },
                        department: { select: { name: true } },
                        course: { select: { name: true } },
                        favorites: {
                            where: { userId }
                        }
                    }
                }
            },
            orderBy: { file: { createdAt: "desc" } } // This might not work directly, technically it's a join
        });

        const formattedFiles = favorites.map((fav) => {
            const file = fav.file;
            return {
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
                isFavorite: true, // It's from the favorites table
            };
        });

        return NextResponse.json(formattedFiles);
    } catch (error) {
        console.error("Error fetching user favorites:", error);
        return NextResponse.json({ message: "Error fetching favorites" }, { status: 500 });
    }
}
