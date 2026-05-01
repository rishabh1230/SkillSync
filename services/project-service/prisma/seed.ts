import { PrismaClient, ProjectStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding project-service...');

  await prisma.project.createMany({
    data: [
      {
        title: 'SkillSync',
        description: 'Microservices-based collaboration platform',
        ownerId: 'user_1',
        status: ProjectStatus.DRAFT,
      },
      {
        title: 'Chat App',
        description: 'Realtime chat using WebSockets',
        ownerId: 'user_2',
        status: ProjectStatus.PUBLISHED,
      },
      {
        title: 'Portfolio Builder',
        description: 'Create developer portfolios easily',
        ownerId: 'user_1',
        status: ProjectStatus.DRAFT,
      },
    ],
  });

  console.log('✅ Seeding completed');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });