
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        const userId = (session?.user as any)?.id;

        // Get IP for guest tracking (fallback)
        const ip = req.headers.get("x-forwarded-for") || "unknown";

        let searchTerms: string[] = [];

        if (userId) {
            // Get recent searches for logged-in user
            const history = await prisma.searchHistory.findMany({
                where: { userId },
                orderBy: { createdAt: "desc" },
                take: 5,
                select: { term: true }
            });
            searchTerms = history.map(h => h.term);
        } else {
            // Get recent searches for guest (by IP)
            const history = await prisma.searchHistory.findMany({
                where: { ipAddress: ip, userId: null },
                orderBy: { createdAt: "desc" },
                take: 5,
                select: { term: true }
            });
            searchTerms = history.map(h => h.term);
        }

        // Remove duplicates and empty terms
        searchTerms = [...new Set(searchTerms)].filter(Boolean);

        let recommendedFiles: any[] = [];
        const excludeIds: string[] = [];

        // If we have history, find matching files
        if (searchTerms.length > 0) {
            for (const term of searchTerms) {
                if (recommendedFiles.length >= 6) break;

                const files = await prisma.file.findMany({
                    where: {
                        OR: [
                            { course: { name: { contains: term, mode: "insensitive" } } },
                            { university: { name: { contains: term, mode: "insensitive" } } },
                            { department: { name: { contains: term, mode: "insensitive" } } },
                        ],
                        NOT: { id: { in: excludeIds } }
                    },
                    include: {
                        university: { select: { name: true } },
                        department: { select: { name: true } },
                        course: { select: { name: true } },
                    },
                    take: 2,
                    orderBy: { views: "desc" }
                });

                recommendedFiles.push(...files);
                files.forEach(f => excludeIds.push(f.id));
            }
        }

        // Fill remaining spots with popular files
        if (recommendedFiles.length < 6) {
            const popularFiles = await prisma.file.findMany({
                where: {
                    NOT: { id: { in: excludeIds } }
                },
                include: {
                    university: { select: { name: true } },
                    department: { select: { name: true } },
                    course: { select: { name: true } },
                },
                orderBy: { views: "desc" },
                take: 6 - recommendedFiles.length
            });
            recommendedFiles.push(...popularFiles);
        }

        // Format response
        const formattedFiles = recommendedFiles.map((file) => ({
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
        }));

        return NextResponse.json(formattedFiles);

    } catch (error) {
        console.error("Error fetching recommended files:", error);
        return NextResponse.json({ message: "Error fetching recommendations" }, { status: 500 });
    }
}
