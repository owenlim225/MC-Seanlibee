import { createClient } from "@supabase/supabase-js";
import { PrismaClient, Role } from "@prisma/client";

type ProvisionUserInput = {
  email: string;
  role: Role;
  name: string;
  password: string;
};

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (typeof value === "string" && value.length > 0) return value;
  throw new Error(`Missing required env for e2e: ${name}`);
}

function createAdminSupabaseClient() {
  const url = requiredEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceRoleKey = requiredEnv("SUPABASE_SERVICE_ROLE_KEY");
  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}

async function findAuthUserIdByEmail(email: string): Promise<string | null> {
  const supabase = createAdminSupabaseClient();
  for (let page = 1; page <= 5; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw new Error(`listUsers failed: ${error.message}`);
    const match = data.users.find((u) => (u.email ?? "").toLowerCase() === email.toLowerCase());
    if (match) return match.id;
    if (data.users.length < 200) return null;
  }
  return null;
}

async function getOrCreateAuthUserId(input: ProvisionUserInput): Promise<string> {
  const supabase = createAdminSupabaseClient();

  const existing = await findAuthUserIdByEmail(input.email);
  if (existing) {
    await supabase.auth.admin.updateUserById(existing, {
      password: input.password,
      email_confirm: true,
    });
    return existing;
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email: input.email,
    password: input.password,
    email_confirm: true,
  });
  if (error || !data.user) throw new Error(`createUser failed: ${error?.message ?? "missing user"}`);
  return data.user.id;
}

export async function provisionAppUser(input: ProvisionUserInput): Promise<void> {
  const authUserId = await getOrCreateAuthUserId(input);

  const prisma = new PrismaClient();
  try {
    const existing = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
      select: { id: true, authUserId: true },
    });

    if (existing) {
      await prisma.user.update({
        where: { id: existing.id },
        data: {
          authUserId: existing.authUserId ?? authUserId,
          role: input.role,
          name: input.name,
        },
      });
      return;
    }

    await prisma.user.create({
      data: {
        authUserId,
        email: input.email.toLowerCase(),
        name: input.name,
        role: input.role,
      },
    });
  } finally {
    await prisma.$disconnect();
  }
}

