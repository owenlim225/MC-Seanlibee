import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { addToCart } from "@/app/(customer)/customer/actions";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { MoneyText } from "@/components/ui/money-text";
import { PageHeader } from "@/components/ui/page-header";

export default async function CustomerMenuPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const sp = await searchParams;
  const categories = await prisma.menuCategory.findMany({
    orderBy: { sortOrder: "asc" },
    include: { items: { where: { isAvailable: true }, orderBy: { name: "asc" } } },
  });

  const filtered =
    sp.category && sp.category !== "all"
      ? categories.filter((c) => c.id === sp.category)
      : categories;

  // #region agent log
  try {
    const hosts = new Set<string>();
    let invalidUrlCount = 0;
    for (const cat of filtered) {
      for (const item of cat.items) {
        if (!item.imageUrl) continue;
        try {
          hosts.add(new URL(item.imageUrl).hostname);
        } catch {
          invalidUrlCount += 1;
        }
      }
    }
    fetch("http://127.0.0.1:7817/ingest/c3fc8591-bb49-4618-b7bd-5aef2b04dae3", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "bac66b" },
      body: JSON.stringify({
        sessionId: "bac66b",
        location: "app/(customer)/customer/page.tsx:CustomerMenuPage",
        message: "menu imageUrl hostnames for next/image allowlist check",
        data: {
          hosts: [...hosts].sort(),
          invalidUrlCount,
          categoryCount: filtered.length,
        },
        timestamp: Date.now(),
        hypothesisId: "H1-H5",
        runId: "pre-fix",
      }),
    }).catch(() => {});
  } catch {
    /* ignore debug log failures */
  }
  // #endregion

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Menu"
        description="Add dishes to your cart — checkout uses mock Stripe."
        actions={
          <>
            <Link className="text-sm underline" href="/customer/cart">
              Cart
            </Link>
            <Link className="text-sm underline" href="/customer/orders">
              Orders
            </Link>
          </>
        }
      />

      <div className="flex flex-wrap gap-2 text-sm">
        <FilterChip active={!sp.category || sp.category === "all"} href="/customer" label="All" />
        {categories.map((c) => (
          <FilterChip key={c.id} active={sp.category === c.id} href={`/customer?category=${c.id}`} label={c.name} />
        ))}
      </div>

      <div className="flex flex-col gap-6">
        {filtered.map((category) => (
          <section key={category.id} className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold">{category.name}</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {category.items.map((item) => (
                <Card key={item.id} className="flex flex-col gap-3">
                  {item.imageUrl ? (
                    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md bg-zinc-100 dark:bg-zinc-800">
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    </div>
                  ) : null}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle>{item.name}</CardTitle>
                      <CardDescription>{item.description}</CardDescription>
                    </div>
                    <div className="text-sm font-semibold">
                      <MoneyText cents={item.priceCents} />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link className="text-sm underline" href={`/customer/items/${item.id}`}>
                      Details
                    </Link>
                    <form action={addToCart.bind(null, item.id)}>
                      <Button type="submit" variant="secondary">
                        Add to cart
                      </Button>
                    </form>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

function FilterChip({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`rounded-full px-3 py-1 ${active ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-950" : "bg-zinc-100 dark:bg-zinc-900"}`}
    >
      {label}
    </Link>
  );
}
