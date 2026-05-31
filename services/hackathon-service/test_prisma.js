const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const userId = "d7a8b604-632e-40a4-bd91-6c3dbe316054"; // taking an arbitrary user id we found earlier
    const registrations = await prisma.hackathonRegistration.findMany({
      where: { userId },
      include: { 
        hackathon: {
          include: {
            submissions: {
              where: {
                team: { members: { some: { userId } } }
              },
              include: { team: true }
            }
          }
        } 
      },
      orderBy: { registeredAt: 'desc' },
    });
    console.log("SUCCESS!", JSON.stringify(registrations, null, 2));
  } catch (err) {
    console.error("ERROR!", err);
  } finally {
    await prisma.$disconnect();
  }
}
main();
