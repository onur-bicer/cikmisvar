import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

// GET /api/files - Search and Filter
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q");
    const universityId = searchParams.get("universityId");
    const departmentId = searchParams.get("departmentId");
    const courseId = searchParams.get("courseId");
    const year = searchParams.get("year");
    const examType = searchParams.get("examType");
    const sort = searchParams.get("sort") || "recent"; // recent, popular

    const where: any = {
        // Show all files for now (both approved and pending)
    };

    if (q) {
        where.OR = [
            { course: { name: { contains: q, mode: "insensitive" } } },
            { university: { name: { contains: q, mode: "insensitive" } } },
        ];
    }

    if (universityId) where.universityId = universityId;
    if (departmentId) where.departmentId = departmentId;
    if (courseId) where.courseId = courseId;
    if (year) where.year = parseInt(year);
    if (examType) where.examType = examType;

    const orderBy =
        sort === "popular" ? { views: "desc" } : { createdAt: "desc" };

    try {
        const files = await prisma.file.findMany({
            where,
            orderBy: orderBy as any,
            include: {
                university: { select: { name: true } },
                department: { select: { name: true } },
                course: { select: { name: true } },
            },
            take: 50, // Limit results
        });

        const formattedFiles = files.map((file) => ({
            id: file.id,
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
        }));

        return NextResponse.json(formattedFiles);
    } catch (error) {
        return NextResponse.json(
            { message: "Error fetching files" },
            { status: 500 }
        );
    }
}

// POST /api/files - Upload File
export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const formData = await req.formData();
        const pdf = formData.get("pdf") as File;
        const universityId = formData.get("universityId") as string;
        const departmentId = formData.get("departmentId") as string;
        const courseId = formData.get("courseId") as string;
        const year = parseInt(formData.get("year") as string);
        const examType = formData.get("examType") as string;

        if (!pdf || !universityId || !departmentId || !courseId || !year || !examType) {
            return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
        }

        // Validate MIME type
        if (pdf.type !== "application/pdf") {
            return NextResponse.json({ message: "Only PDF files are allowed" }, { status: 400 });
        }

        // Validate Size (e.g., 10MB)
        if (pdf.size > 10 * 1024 * 1024) {
            return NextResponse.json({ message: "File size too large (max 10MB)" }, { status: 400 });
        }

        // Save File Locally
        const buffer = Buffer.from(await pdf.arrayBuffer());
        const fileName = `${uuidv4()}-${pdf.name.replace(/[^a-zA-Z0-9.-]/g, "")}`;
        const uploadDir = path.join(process.cwd(), "public", "uploads");

        // Ensure dir exists
        await mkdir(uploadDir, { recursive: true });

        const filePath = path.join(uploadDir, fileName);
        await writeFile(filePath, buffer);

        // Save to DB
        const file = await prisma.file.create({
            data: {
                universityId,
                departmentId,
                courseId,
                year,
                examType,
                filePath: `/uploads/${fileName}`,
                fileSize: pdf.size,
                uploaderId: session.user.id,
                status: "pending",
            },
        });

        return NextResponse.json(file, { status: 201 });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json({ message: "Error uploading file" }, { status: 500 });
    }
}
