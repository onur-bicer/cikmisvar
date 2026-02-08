
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic"; // Ensure this is not cached statically

export async function GET() {
    try {
        const popular = await prisma.searchHistory.groupBy({
            by: ['term'],
            _count: {
                term: true,
            },
            orderBy: {
                _count: {
                    term: 'desc',
                },
            },
            take: 10, // Get top 10
        });

        // Format for frontend
        const formatted = popular.map((item, index) => ({
            id: `pop-${index}`,
            query: item.term,
            count: item._count.term,
            label: item.term // Use term as label for now
        }));

        return NextResponse.json(formatted);
    } catch (error) {
        console.error("Error fetching popular searches:", error);
        return NextResponse.json({ message: "Error fetching popular searches" }, { status: 500 });
    }
}
