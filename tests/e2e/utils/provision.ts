import { PrismaClient, Role } from "@prisma/client";
import { hashPassword } from "@/lib/auth/password";

type ProvisionUserInput = {
  email: string;
  role: Role;
  name: string;
  password: string;
};

export async function provisionAppUser(input: ProvisionUserInput): Promise<void> {
  const normalizedEmail = input.email.toLowerCase();
  const hashedPassword = hashPassword(input.password);

  const prisma = new PrismaClient();
  try {
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, authUserId: true },
    });

    if (existing) {
      await prisma.user.update({
        where: { id: existing.id },
        data: {
          authUserId: existing.authUserId ?? existing.id,
          password: hashedPassword,
          role: input.role,
          name: input.name,
          isActive: true,
          deletedAt: null,
        },
      });
      return;
    }

    const created = await prisma.user.create({
      data: {
        email: normalizedEmail,
        password: hashedPassword,
        name: input.name,
        role: input.role,
        isActive: true,
      },
      select: { id: true },
    });

    await prisma.user.update({
      where: { id: created.id },
      data: { authUserId: created.id },
    });
  } finally {
    await prisma.$disconnect();
  }
}

