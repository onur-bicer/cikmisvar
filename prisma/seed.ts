import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const adminEmail = 'admin@cikmisvar.com'
    const adminPassword = 'adminpassword123'
    const hashedAdminPassword = await bcrypt.hash(adminPassword, 10)

    const admin = await prisma.user.upsert({
        where: { email: adminEmail },
        update: {},
        create: {
            email: adminEmail,
            name: 'Admin User',
            password: hashedAdminPassword,
            role: 'admin',
        },
    })

    console.log({ admin })
    console.log('Admin user created/verified successfully')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
