import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(
    req: Request,
    { params }: { params: { id: string } }
) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const { reason } = await req.json();

        if (!reason) {
            return NextResponse.json({ message: "Reason is required" }, { status: 400 });
        }

        await prisma.report.create({
            data: {
                fileId: params.id,
                reason,
            },
        });

        return NextResponse.json({ message: "Report submitted" }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ message: "Error submitting report" }, { status: 500 });
    }
}
