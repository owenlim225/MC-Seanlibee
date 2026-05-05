import Image from "next/image";
import Link from "next/link";
import { addToCart } from "@/app/(customer)/customer/actions";
import { CategoryCarouselRail, FeaturedCategoryRail } from "@/components/customer/category-carousel-rail";
import { PopularCarouselRail } from "@/components/customer/popular-carousel-rail";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { MoneyText } from "@/components/ui/money-text";
import { PageHeader } from "@/components/ui/page-header";
import { selectPopularItems } from "@/lib/menu/select-popular-items";
import { prisma } from "@/lib/prisma";

function firstCategoryThumbnail(items: { name: string; imageUrl: string | null }[]): string | null {
  const sorted = [...items].sort((a, b) => a.name.localeCompare(b.name));
  return sorted.find((item) => item.imageUrl)?.imageUrl ?? null;
}

export default async function CustomerMenuPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const sp = await searchParams;
  const categories = await prisma.menuCategory.findMany({
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      name: true,
      sortOrder: true,
      items: {
        where: { isAvailable: true },
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          description: true,
          priceCents: true,
          imageUrl: true,
        },
      },
    },
  });

  const filtered =
    sp.category && sp.category !== "all"
      ? categories.filter((c) => c.id === sp.category)
      : categories;

  const popularItems = selectPopularItems(categories);

  const featuredCategories = categories.map((c) => ({
    id: c.id,
    name: c.name,
    thumbnailUrl: firstCategoryThumbnail(c.items),
  }));

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

      <CategoryCarouselRail
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        categoryParam={sp.category}
      />

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Featured Menu
          </h2>
          <Link href="/customer" className="text-sm font-semibold text-[#D12E27] hover:underline">
            View All
          </Link>
        </div>
        <FeaturedCategoryRail categories={featuredCategories} />
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Most Popular
          </h2>
          <Link href="/customer" className="text-sm font-semibold text-[#D12E27] hover:underline">
            View All
          </Link>
        </div>
        <PopularCarouselRail items={popularItems} addToCart={addToCart} />
      </section>

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
