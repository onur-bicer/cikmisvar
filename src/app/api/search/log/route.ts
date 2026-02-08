
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        const { term } = await req.json();

        if (!term || typeof term !== "string" || term.trim().length < 2) {
            return NextResponse.json({ message: "Invalid search term" }, { status: 400 });
        }

        // Get IP address from headers (basic approximation)
        const ip = req.headers.get("x-forwarded-for") || "unknown";

        await prisma.searchHistory.create({
            data: {
                term: term.trim(),
                userId: (session?.user as any)?.id || null, // Optional chaining for guest users
                ipAddress: ip,
            },
        });

        return NextResponse.json({ message: "Search logged" });
    } catch (error) {
        console.error("Error logging search:", error);
        return NextResponse.json({ message: "Error logging search" }, { status: 500 });
    }
}
