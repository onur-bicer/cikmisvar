import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = 'admin@cikmisvar.com'
  const password = 'adminpassword123'
  const hashedPassword = await bcrypt.hash(password, 10)

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      role: 'admin',
      password: hashedPassword, // Ensure password is correct if user exists
    },
    create: {
      email,
      name: 'System Admin',
      password: hashedPassword,
      role: 'admin',
    },
  })

  console.log({ user })
  console.log('Admin user created/updated successfully')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
