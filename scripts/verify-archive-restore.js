const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const [users, archivedUsers, menuItems, archivedMenuItems] = await Promise.all([
    prisma.user.findMany({ select: { id: true, deletedAt: true } }),
    prisma.archivedUser.findMany({ select: { originalId: true } }),
    prisma.menuItem.findMany({ select: { id: true, deletedAt: true } }),
    prisma.archivedMenuItem.findMany({ select: { originalId: true } }),
  ]);

  const activeUserIds = new Set(users.filter((u) => u.deletedAt === null).map((u) => u.id));
  const archivedUserOriginalIds = new Set(archivedUsers.map((u) => u.originalId));
  const missingUsers = [...archivedUserOriginalIds].filter((id) => !activeUserIds.has(id));

  const activeMenuItemIds = new Set(menuItems.filter((m) => m.deletedAt === null).map((m) => m.id));
  const archivedMenuItemOriginalIds = new Set(archivedMenuItems.map((m) => m.originalId));
  const missingMenuItems = [...archivedMenuItemOriginalIds].filter((id) => !activeMenuItemIds.has(id));

  console.log(
    JSON.stringify(
      {
        totals: {
          users: users.length,
          archivedUsers: archivedUsers.length,
          menuItems: menuItems.length,
          archivedMenuItems: archivedMenuItems.length,
        },
        coverage: {
          archivedUsersDistinctOriginalIds: archivedUserOriginalIds.size,
          restoredActiveUsersFromArchive: archivedUserOriginalIds.size - missingUsers.length,
          missingUsersFromArchive: missingUsers.length,
          archivedMenuItemsDistinctOriginalIds: archivedMenuItemOriginalIds.size,
          restoredActiveMenuItemsFromArchive: archivedMenuItemOriginalIds.size - missingMenuItems.length,
          missingMenuItemsFromArchive: missingMenuItems.length,
        },
        sampleMissing: {
          users: missingUsers.slice(0, 10),
          menuItems: missingMenuItems.slice(0, 10),
        },
      },
      null,
      2,
    ),
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
