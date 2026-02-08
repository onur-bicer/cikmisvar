import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "admin") {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const reports = await (prisma.report as any).findMany({
            include: {
                file: {
                    select: {
                        id: true,
                        courseId: true,
                        universityId: true,
                        filePath: true,
                        status: true,
                        course: { select: { name: true } },
                        university: { select: { name: true } },
                    }
                },
                user: {
                    select: {
                        name: true,
                        email: true,
                    }
                }
            },
            orderBy: { createdAt: "desc" },
        });

        // Flatten for easier frontend use
        const flattenedReports = reports.map((report: any) => ({
            ...report,
            file: {
                ...report.file,
                courseName: (report.file as any).course.name,
                universityName: (report.file as any).university.name,
                previewUrl: `/api/files/preview/${report.fileId}`, // Proxy or direct link
            }
        }));

        return NextResponse.json(flattenedReports);
    } catch (error) {
        console.error("Fetch reports error:", error);
        return NextResponse.json(
            { message: "Something went wrong" },
            { status: 500 }
        );
    }
}
