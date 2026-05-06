import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: { authUserId: null },
    select: { id: true },
  });

  let linked = 0;
  let skipped = 0;

  for (const user of users) {
    const existing = await prisma.user.findFirst({
      where: { authUserId: user.id },
      select: { id: true },
    });
    if (existing && existing.id !== user.id) {
      skipped += 1;
      continue;
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { authUserId: user.id },
    });
    linked += 1;
  }

  console.log(
    JSON.stringify({
      scanned: users.length,
      linked,
      skipped,
    }),
  );
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
