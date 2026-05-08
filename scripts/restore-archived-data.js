const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function restoreUsersFromArchive() {
  const archivedUsers = await prisma.archivedUser.findMany({
    orderBy: { archivedAt: "desc" },
  });
  const latestByOriginalId = new Map();
  for (const row of archivedUsers) {
    if (!latestByOriginalId.has(row.originalId)) latestByOriginalId.set(row.originalId, row);
  }

  for (const snapshot of latestByOriginalId.values()) {
    await prisma.user.upsert({
      where: { id: snapshot.originalId },
      create: {
        id: snapshot.originalId,
        authUserId: snapshot.authUserId,
        email: snapshot.email,
        password: snapshot.password,
        role: snapshot.role,
        name: snapshot.name,
        isActive: true,
        deletedAt: null,
      },
      update: {
        authUserId: snapshot.authUserId,
        email: snapshot.email,
        password: snapshot.password,
        role: snapshot.role,
        name: snapshot.name,
        isActive: true,
        deletedAt: null,
      },
    });
  }

  return latestByOriginalId.size;
}

async function restoreMenuItemsFromArchive() {
  const archivedMenuItems = await prisma.archivedMenuItem.findMany({
    orderBy: { archivedAt: "desc" },
  });
  const latestByOriginalId = new Map();
  for (const row of archivedMenuItems) {
    if (!latestByOriginalId.has(row.originalId)) latestByOriginalId.set(row.originalId, row);
  }

  for (const snapshot of latestByOriginalId.values()) {
    await prisma.menuItem.upsert({
      where: { id: snapshot.originalId },
      create: {
        id: snapshot.originalId,
        name: snapshot.name,
        description: snapshot.description,
        priceCents: snapshot.priceCents,
        imageUrl: snapshot.imageUrl,
        isAvailable: snapshot.isAvailable,
        deletedAt: null,
      },
      update: {
        name: snapshot.name,
        description: snapshot.description,
        priceCents: snapshot.priceCents,
        imageUrl: snapshot.imageUrl,
        isAvailable: snapshot.isAvailable,
        deletedAt: null,
      },
    });
  }

  return latestByOriginalId.size;
}

async function main() {
  const [usersRestored, menuItemsRestored] = await Promise.all([
    restoreUsersFromArchive(),
    restoreMenuItemsFromArchive(),
  ]);
  console.log(JSON.stringify({ usersRestored, menuItemsRestored }, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
