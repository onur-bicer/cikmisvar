
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const universityId = searchParams.get('universityId');
    const departmentId = searchParams.get('departmentId');

    try {
        if (departmentId) {
            // Fetch courses for a department
            const courses = await prisma.course.findMany({
                where: { departmentId },
                orderBy: { name: 'asc' }
            });
            return NextResponse.json(courses);
        } else if (universityId) {
            // Fetch departments for a university
            const departments = await prisma.department.findMany({
                where: { universityId },
                orderBy: { name: 'asc' }
            });
            return NextResponse.json(departments);
        } else {
            // Fetch all universities (lightweight, maybe just id and name)
            const universities = await prisma.university.findMany({
                select: { id: true, name: true, city: true },
                orderBy: { name: 'asc' }
            });
            return NextResponse.json(universities);
        }
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }
}
