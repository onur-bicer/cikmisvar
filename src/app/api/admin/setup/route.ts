import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");
    const secret = searchParams.get("secret");

    if (!email || !secret) {
        return NextResponse.json({ message: "Email and secret required" }, { status: 400 });
    }

    if (secret !== process.env.NEXTAUTH_SECRET) {
        return NextResponse.json({ message: "Invalid secret" }, { status: 403 });
    }

    try {
        const user = await prisma.user.update({
            where: { email },
            data: { role: "admin" },
        });

        return NextResponse.json({ message: `User ${user.email} promoted to admin`, user });
    } catch (error) {
        return NextResponse.json({ message: "User not found or error updating" }, { status: 404 });
    }
}
