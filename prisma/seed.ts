import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const hashedPassword = await bcrypt.hash('password123', 10)

    // Users
    const admin = await prisma.user.upsert({
        where: { email: 'admin@cikmisvar.com' },
        update: {},
        create: {
            email: 'admin@cikmisvar.com',
            name: 'Admin User',
            password: hashedPassword,
            role: 'admin',
        },
    })

    const user = await prisma.user.upsert({
        where: { email: 'user@cikmisvar.com' },
        update: {},
        create: {
            email: 'user@cikmisvar.com',
            name: 'Normal User',
            password: hashedPassword,
            role: 'user',
        },
    })

    // Universities
    const uni1 = await prisma.university.create({
        data: {
            name: 'İstanbul Teknik Üniversitesi',
            city: 'İstanbul',
            departments: {
                create: [
                    {
                        name: 'Bilgisayar Mühendisliği',
                        courses: {
                            create: [
                                { name: 'Veri Yapıları' },
                                { name: 'Algoritma Analizi' },
                                { name: 'İşletim Sistemleri' },
                            ],
                        },
                    },
                    {
                        name: 'Makine Mühendisliği',
                        courses: {
                            create: [
                                { name: 'Termodinamik' },
                                { name: 'Akışkanlar Mekaniği' },
                            ],
                        },
                    },
                ],
            },
        },
    })

    // Add files to first course
    const dep1 = await prisma.department.findFirst({ where: { universityId: uni1.id } })
    const course1 = await prisma.course.findFirst({ where: { departmentId: dep1?.id } })

    if (dep1 && course1) {
        await prisma.file.createMany({
            data: [
                {
                    universityId: uni1.id,
                    departmentId: dep1.id,
                    courseId: course1.id,
                    year: 2023,
                    examType: 'FINAL',
                    filePath: '/uploads/sample1.pdf',
                    fileSize: 1024 * 500,
                    uploaderId: admin.id,
                    status: 'approved',
                    views: 120,
                },
                {
                    universityId: uni1.id,
                    departmentId: dep1.id,
                    courseId: course1.id,
                    year: 2022,
                    examType: 'MIDTERM',
                    filePath: '/uploads/sample2.pdf',
                    fileSize: 1024 * 300,
                    uploaderId: user.id,
                    status: 'pending',
                },
            ],
        })
    }

    console.log('Seed data created.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
