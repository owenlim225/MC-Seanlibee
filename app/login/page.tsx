import { redirect } from "next/navigation";

export default async function LegacyLoginRoute({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const sp = await searchParams;
  const params = new URLSearchParams();
  if (sp.next) params.set("next", sp.next);
  if (sp.error) params.set("error", sp.error);
  const query = params.toString();
  redirect(query ? `/auth/login?${query}` : "/auth/login");
}
