import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const reportSchema = z.object({
    fileId: z.string().cuid(),
    reason: z.string().min(5),
    description: z.string().optional(),
});

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        const body = await req.json();
        const { fileId, reason, description } = reportSchema.parse(body);

        const report = await prisma.report.create({
            data: {
                fileId,
                reason,
                description,
                userId: (session?.user as any)?.id || null,
            } as any,
        });

        return NextResponse.json(report, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ message: "Invalid data", errors: error.errors }, { status: 400 });
        }
        console.error("Report error:", error);
        return NextResponse.json(
            { message: "Something went wrong" },
            { status: 500 }
        );
    }
}
