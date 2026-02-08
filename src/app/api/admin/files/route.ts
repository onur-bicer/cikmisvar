
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "admin") {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const files = await prisma.file.findMany({
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                uploader: {
                    select: {
                        name: true,
                        email: true,
                    }
                },
                course: {
                    select: {
                        name: true,
                        department: {
                            select: {
                                name: true,
                                university: {
                                    select: {
                                        name: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        const formattedFiles = files.map(file => ({
            id: file.id,
            name: file.filePath.split('/').pop(),
            url: file.filePath,
            type: file.examType,
            examType: file.examType,
            year: file.year,
            createdAt: file.createdAt,
            uploader: file.uploader?.name || file.uploader?.email || "Unknown",
            courseName: file.course.name,
            universityName: file.course.department.university.name,
        }));

        return NextResponse.json(formattedFiles);
    } catch (error) {
        console.error("Error fetching admin files:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
