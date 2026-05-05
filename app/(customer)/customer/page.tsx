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
import { Prisma } from "@prisma/client";

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
  // #region agent log
  fetch("http://127.0.0.1:7817/ingest/c3fc8591-bb49-4618-b7bd-5aef2b04dae3", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "c61c98" },
    body: JSON.stringify({
      sessionId: "c61c98",
      runId: "pre-fix",
      hypothesisId: "H1",
      location: "app/(customer)/customer/page.tsx:25",
      message: "customer menu page query started",
      data: { categoryParam: sp.category ?? null },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion
  // #region agent log
  fetch("http://127.0.0.1:7817/ingest/c3fc8591-bb49-4618-b7bd-5aef2b04dae3", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "c61c98" },
    body: JSON.stringify({
      sessionId: "c61c98",
      runId: "pre-fix",
      hypothesisId: "H2",
      location: "app/(customer)/customer/page.tsx:40",
      message: "runtime prisma metadata snapshot before findMany",
      data: {
        prismaClientVersion: Prisma.prismaVersion.client,
        menuCategoryFields:
          (prisma as unknown as { _runtimeDataModel?: { models?: Record<string, { fields?: { name: string }[] }> } })
            ._runtimeDataModel?.models?.MenuCategory?.fields?.map((f) => f.name) ?? null,
        hasSlugInRuntimeModel:
          ((prisma as unknown as { _runtimeDataModel?: { models?: Record<string, { fields?: { name: string }[] }> } })
            ._runtimeDataModel?.models?.MenuCategory?.fields?.map((f) => f.name) ?? []
          ).includes("slug"),
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion
  // #region agent log
  fetch("http://127.0.0.1:7817/ingest/c3fc8591-bb49-4618-b7bd-5aef2b04dae3", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "c61c98" },
    body: JSON.stringify({
      sessionId: "c61c98",
      runId: "pre-fix",
      hypothesisId: "H3",
      location: "app/(customer)/customer/page.tsx:60",
      message: "findMany select shape",
      data: { selectedFields: ["id", "slug", "name", "sortOrder", "itemLinks.menuItem.*"] },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion
  let tableProbe:
    | {
        db: string | null;
        schema: string | null;
        menuCategoryPascal: string | null;
        menuCategorySnake: string | null;
      }[]
    | null = null;
  try {
    tableProbe = await prisma.$queryRaw<
      { db: string | null; schema: string | null; menuCategoryPascal: string | null; menuCategorySnake: string | null }[]
    >`SELECT current_database() AS db, current_schema() AS schema, to_regclass('public."MenuCategory"') AS "menuCategoryPascal", to_regclass('public.menu_category') AS "menuCategorySnake"`;
    // #region agent log
    fetch("http://127.0.0.1:7817/ingest/c3fc8591-bb49-4618-b7bd-5aef2b04dae3", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "c61c98" },
      body: JSON.stringify({
        sessionId: "c61c98",
        runId: "pre-fix",
        hypothesisId: "H4",
        location: "app/(customer)/customer/page.tsx:83",
        message: "database table probe results",
        data: tableProbe[0] ?? null,
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
  } catch (error) {
    // #region agent log
    fetch("http://127.0.0.1:7817/ingest/c3fc8591-bb49-4618-b7bd-5aef2b04dae3", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "c61c98" },
      body: JSON.stringify({
        sessionId: "c61c98",
        runId: "pre-fix",
        hypothesisId: "H4",
        location: "app/(customer)/customer/page.tsx:99",
        message: "database table probe failed",
        data: {
          errorName: error instanceof Error ? error.name : typeof error,
          errorMessage: error instanceof Error ? error.message : String(error),
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
  }
  let categories: Awaited<ReturnType<typeof prisma.menuCategory.findMany>>;
  try {
    categories = await prisma.menuCategory.findMany({
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        slug: true,
        name: true,
        sortOrder: true,
        itemLinks: {
          orderBy: { menuItem: { name: "asc" } },
          select: {
            menuItem: {
              select: {
                id: true,
                name: true,
                description: true,
                priceCents: true,
                imageUrl: true,
                isAvailable: true,
              },
            },
          },
        },
      },
    });
  } catch (error) {
    // #region agent log
    fetch("http://127.0.0.1:7817/ingest/c3fc8591-bb49-4618-b7bd-5aef2b04dae3", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "c61c98" },
      body: JSON.stringify({
        sessionId: "c61c98",
        runId: "pre-fix",
        hypothesisId: "H5",
        location: "app/(customer)/customer/page.tsx:82",
        message: "findMany failed",
        data: {
          errorName: error instanceof Error ? error.name : typeof error,
          errorMessage: error instanceof Error ? error.message : String(error),
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
    throw error;
  }
  // #region agent log
  fetch("http://127.0.0.1:7817/ingest/c3fc8591-bb49-4618-b7bd-5aef2b04dae3", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "c61c98" },
    body: JSON.stringify({
      sessionId: "c61c98",
      runId: "pre-fix",
      hypothesisId: "H6",
      location: "app/(customer)/customer/page.tsx:66",
      message: "query completed",
      data: { categoryCount: categories.length },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

  const normalizedCategories = categories.map((category) => ({
    id: category.id,
    slug: category.slug,
    name: category.name,
    sortOrder: category.sortOrder,
    items: category.itemLinks
      .map((link) => link.menuItem)
      .filter((menuItem) => menuItem.isAvailable)
      .map((menuItem) => ({
        id: menuItem.id,
        name: menuItem.name,
        description: menuItem.description,
        priceCents: menuItem.priceCents,
        imageUrl: menuItem.imageUrl,
      })),
  }));

  const filtered =
    sp.category && sp.category !== "all"
      ? normalizedCategories.filter((category) => category.id === sp.category || category.slug === sp.category)
      : normalizedCategories;

  const popularItems = selectPopularItems(normalizedCategories);

  const featuredCategories = normalizedCategories.map((c) => ({
    id: c.id,
    slug: c.slug,
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
        categories={normalizedCategories.map((c) => ({ id: c.id, slug: c.slug, name: c.name }))}
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
