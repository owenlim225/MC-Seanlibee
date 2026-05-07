import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { addToCart } from "@/app/(customer)/customer/actions";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { MoneyText } from "@/components/ui/money-text";
import { PageHeader } from "@/components/ui/page-header";
import { resolveMenuImageUrl } from "@/lib/menu/resolve-menu-image-url";

export default async function ItemDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await prisma.menuItem.findFirst({
    where: { id, deletedAt: null },
    include: {
      categoryLinks: {
        where: { category: { deletedAt: null } },
        include: { category: true },
        orderBy: { category: { sortOrder: "asc" } },
      },
    },
  });
  if (!item || !item.isAvailable) notFound();
  const categoryLabel = item.categoryLinks.map((link) => link.category.name).join(" • ") || "Menu item";
  const categoryIds = item.categoryLinks.map((link) => link.categoryId);
  const sameCategoryItems = await prisma.menuItem.findMany({
    where: {
      deletedAt: null,
      isAvailable: true,
      id: { not: item.id },
      categoryLinks: { some: { categoryId: { in: categoryIds }, category: { deletedAt: null } } },
    },
    select: {
      id: true,
      name: true,
      description: true,
      priceCents: true,
      imageUrl: true,
      categoryLinks: { select: { category: { select: { sortOrder: true, name: true } } } },
    },
    take: 24,
  });
  const recommendations = sameCategoryItems
    .map((candidate) => ({
      ...candidate,
      categorySortOrder: Math.min(...candidate.categoryLinks.map((link) => link.category.sortOrder)),
    }))
    .sort((a, b) => {
      if (a.categorySortOrder !== b.categorySortOrder) return a.categorySortOrder - b.categorySortOrder;
      return a.name.localeCompare(b.name);
    })
    .slice(0, 6);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={item.name}
        description={categoryLabel}
        actions={
          <Link className="text-sm underline" href="/customer">
            ← Menu
          </Link>
        }
      />

      <Card className="flex flex-col gap-4">
        <div className="relative aspect-video w-full overflow-hidden rounded-md bg-zinc-100 dark:bg-zinc-800">
          <Image
            src={resolveMenuImageUrl(item.id, item.imageUrl)}
            alt={item.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 640px"
            priority
          />
        </div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>{item.name}</CardTitle>
            <CardDescription>{item.description}</CardDescription>
          </div>
          <div className="text-lg font-semibold">
            <MoneyText cents={item.priceCents} />
          </div>
        </div>

        <form action={addToCart.bind(null, item.id)}>
          <Button type="submit">Add to cart</Button>
        </form>
      </Card>

      {recommendations.length > 0 ? (
        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">Same category</h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {recommendations.map((recommended) => (
              <Card
                key={recommended.id}
                className="group relative flex h-full flex-col gap-3 p-3 transition hover:border-zinc-300 hover:shadow-md dark:hover:border-zinc-700"
              >
                <Link
                  href={`/customer/items/${recommended.id}`}
                  className="absolute inset-0 z-10 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D12E27] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-950"
                  aria-label={`View details for ${recommended.name}`}
                />
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md bg-zinc-100 dark:bg-zinc-800">
                  <Image
                    src={resolveMenuImageUrl(recommended.id, recommended.imageUrl)}
                    alt={recommended.name}
                    fill
                    className="object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 33vw, 25vw"
                  />
                </div>
                <div className="relative z-20 flex min-h-24 items-start justify-between gap-3">
                  <div className="space-y-1">
                    <CardTitle>{recommended.name}</CardTitle>
                    <CardDescription className="line-clamp-2">{recommended.description}</CardDescription>
                  </div>
                  <div className="text-sm font-semibold">
                    <MoneyText cents={recommended.priceCents} />
                  </div>
                </div>
                <div className="relative z-20 flex items-center justify-between gap-2">
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">Tap card for details</span>
                  <form action={addToCart.bind(null, recommended.id)}>
                    <Button type="submit" variant="secondary">
                      Add to cart
                    </Button>
                  </form>
                </div>
              </Card>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
