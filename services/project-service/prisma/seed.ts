import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  await prisma.project.create({
    data: {
      userId: "user_1",
      description: "First project",
      tagline: "Test project"
    }
  })
}

main()
  .then(() => {
    console.log("Seeding completed")
  })
  .catch((e) => {
    console.error(e)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })