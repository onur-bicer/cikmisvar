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
    // Universities
    const { universities } = require('../src/data/universities')

    console.log(`Seeding ${universities.length} universities...`)

    for (const uni of universities) {
        await prisma.university.upsert({
            where: { name: uni.name },
            update: {},
            create: {
                // id: uni.id, // Optional: Keep static IDs if desired, or let DB generate new ones. 
                // Using name as unique key for upsert, but creating with generated ID is safer if IDs match.
                // Let's rely on name uniqueness for now or just create.
                name: uni.name,
                city: uni.city || '',
                departments: {
                    create: uni.departments.map((dep: any) => ({
                        name: dep.name,
                        courses: {
                            create: dep.courses.map((course: any) => ({
                                name: course.name
                            }))
                        }
                    }))
                }
            }
        })

        // Since nested upsert is tricky with arrays, let's just create university if not exists, 
        // then iteratively upsert departments and courses.
        // Actually, for simplicity and since it's a migration, let's look up the university first.

        const dbUni = await prisma.university.upsert({
            where: { name: uni.name },
            update: {},
            create: {
                name: uni.name,
                city: uni.city || ''
            }
        })

        for (const dep of uni.departments) {
            const dbDep = await prisma.department.upsert({
                where: {
                    name_universityId: {
                        name: dep.name,
                        universityId: dbUni.id
                    }
                },
                update: {},
                create: {
                    name: dep.name,
                    universityId: dbUni.id
                }
            })

            for (const course of dep.courses) {
                await prisma.course.upsert({
                    where: {
                        name_departmentId: {
                            name: course.name,
                            departmentId: dbDep.id
                        }
                    },
                    update: {},
                    create: {
                        name: course.name,
                        departmentId: dbDep.id
                    }
                })
            }
        }
    }

    // Dummy files can be removed or updated to fetch a real university if needed for testing.
    // For now, let's keep the seed clean with just the structure.

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
