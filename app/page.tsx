import Image from "next/image";
import Link from "next/link";

import { FeaturedCategoryRail } from "@/components/customer/category-carousel-rail";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { getSessionLite } from "@/lib/auth";
import { buildFeaturedCategoryRail, type FeaturedCategorySource } from "@/lib/menu/featured-menu-image-quality";
import { prisma } from "@/lib/prisma";

function buildHomepageHighlightCards(featuredCategories: ReturnType<typeof buildFeaturedCategoryRail>) {
  return featuredCategories.slice(0, 3).map((category) => ({
    id: category.id,
    slug: category.slug,
    name: category.name,
    description: `Explore popular ${category.name.toLowerCase()} picks curated for quick ordering.`,
    thumbnailUrl: category.thumbnailUrl,
  }));
}

export default async function Home() {
  const [categories, session] = await Promise.all([
    prisma.menuCategory.findMany({
      where: { deletedAt: null },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        slug: true,
        name: true,
        itemLinks: {
          where: { menuItem: { deletedAt: null } },
          select: {
            menuItem: {
              select: {
                name: true,
                imageUrl: true,
                isAvailable: true,
              },
            },
          },
        },
      },
    }),
    getSessionLite(),
  ]);

  const normalizedCategories: FeaturedCategorySource[] = categories.map((category) => ({
    id: category.id,
    slug: category.slug,
    name: category.name,
    items: category.itemLinks
      .map((link) => link.menuItem)
      .filter((menuItem) => menuItem.isAvailable)
      .map((menuItem) => ({
        name: menuItem.name,
        imageUrl: menuItem.imageUrl,
      })),
  }));

  const featuredCategories = buildFeaturedCategoryRail(normalizedCategories);
  const heroHighlightCards = buildHomepageHighlightCards(featuredCategories);
  const featuredMenuCards = featuredCategories.slice(0, 8);
  const isSignedIn = Boolean(session.user);

  function buildHomepageDestination(categorySlug?: string): string {
    const targetPath = categorySlug ? `/customer?category=${categorySlug}` : "/customer";
    if (isSignedIn) return targetPath;
    return `/auth/login?next=${encodeURIComponent(targetPath)}`;
  }
  // #region agent log
  fetch("http://127.0.0.1:7817/ingest/c3fc8591-bb49-4618-b7bd-5aef2b04dae3", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "7690ea" },
    body: JSON.stringify({
      sessionId: "7690ea",
      runId: "pre-fix",
      hypothesisId: "H1",
      location: "app/page.tsx:57",
      message: "Home render computed featured data",
      data: {
        featuredCount: featuredCategories.length,
        heroCardCount: heroHighlightCards.length,
        hasFeaturedCategoryRailImport: true,
      },
    }),
  }).catch(() => {});
  // #endregion

  return (
    <div className="flex flex-col gap-8">
      <section className="space-y-4">
        <div className="relative w-full overflow-hidden rounded-xl border border-[var(--border-default)] bg-white shadow-sm">
          <div className="relative aspect-[16/7] w-full">
            <Image
              src="https://sdgpxydkqdthgolfmpei.supabase.co/storage/v1/object/public/website-assets/banner.jpg"
              alt="Assorted dishes prepared by MC Seanlibee kitchen team"
              fill
              priority
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 1152px"
            />
          </div>
        </div>
      </section>

      {heroHighlightCards.length > 0 ? (
        <section className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          <h2 className="sr-only">Homepage highlights</h2>
          {heroHighlightCards.map((card) => (
            <Link
              key={card.id}
              href={buildHomepageDestination(card.slug)}
              aria-label={isSignedIn ? `Open ${card.name} menu` : `Open ${card.name} menu, then sign in to continue`}
              className="rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-950"
            >
              <Card
                className="flex h-full cursor-pointer flex-col justify-between gap-4 border-[var(--brand-primary)] !bg-[#B11731] p-6 text-white shadow-none"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-2">
                    <CardTitle className="text-xl leading-tight text-white">{card.name}</CardTitle>
                    <CardDescription className="line-clamp-3 text-base leading-relaxed text-white/90">
                      {card.description}
                    </CardDescription>
                  </div>
                  <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-md border border-white/30 bg-white/10 md:h-28 md:w-28">
                    <Image
                      src={card.thumbnailUrl}
                      alt={card.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 96px, 112px"
                    />
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </section>
      ) : null}

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold tracking-tight text-[var(--text-primary)]">Featured Menu</h2>
        {/* #region agent log */}
        {(() => {
          fetch("http://127.0.0.1:7817/ingest/c3fc8591-bb49-4618-b7bd-5aef2b04dae3", {
            method: "POST",
            headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "7690ea" },
            body: JSON.stringify({
              sessionId: "7690ea",
              runId: "pre-fix",
              hypothesisId: "H2",
              location: "app/page.tsx:121",
              message: "Preparing FeaturedCategoryRail props",
              data: {
                activeSelection: "all",
                hrefBuilderType: "function",
                ariaLabelBuilderType: "function",
              },
            }),
          }).catch(() => {});
          return null;
        })()}
        {/* #endregion */}
        <FeaturedCategoryRail
          categories={featuredMenuCards}
          activeSelection="all"
          signInRedirect={isSignedIn ? undefined : "/auth/login"}
        />
      </section>

      <section className="overflow-hidden rounded-xl border border-[var(--border-default)] bg-white shadow-sm">
        <div className="grid grid-cols-1 items-center gap-6 p-6 md:grid-cols-12 md:gap-10 md:p-10">
          <div className="md:col-span-5">
            <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-zinc-100">
              <Image
                src="https://sdgpxydkqdthgolfmpei.supabase.co/storage/v1/object/public/website-assets/card.webp"
                alt="Mc Seanlibee mascot holding signature menu items"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 480px"
              />
            </div>
          </div>
          <div className="space-y-4 md:col-span-7">
            <h2 className="text-2xl font-bold tracking-tight text-[var(--text-primary)] md:text-3xl">
              Mc Seanlibee: Bringing SARAP to You
            </h2>
            <p className="leading-relaxed text-[var(--text-muted)]">
              Welcome to Mc Seanlibee, your ultimate destination for every craving.
            </p>
            <p className="leading-relaxed text-[var(--text-muted)]">
              Our menu is a celebration of variety, serving up an extensive selection of all your favorite meals under
              one roof. Whether you&apos;re in the mood for our signature crispy fried chicken, hearty burgers, savory
              pasta, or golden fries, we have it all. From local classics to international favorites, Mc Seanlibee offers
              a world of flavors designed to satisfy every palate at prices that make every meal a treat.
            </p>
            <p className="leading-relaxed text-[var(--text-muted)]">
              Explore our diverse menu and discover why we are quickly becoming the go-to spot for those who want
              everything delicious in one place. At Mc Seanlibee, we don&apos;t just serve food; we serve the best
              version of what you&apos;re craving today.
            </p>
            <p className="leading-relaxed text-[var(--text-muted)]">
              So bring your family, gather your friends, or enjoy a satisfying solo feast at a Mc Seanlibee near you.
              Whether you choose to dine-in, swing through our drive-thru, or order for takeout and delivery, we are
              dedicated to excellence. Wherever you are, we commit our best to serving you high-quality, delicious
              meals—because at Mc Seanlibee, bida kana, masarap pa tinda!
            </p>
          </div>
        </div>
        <div className="h-2 bg-[var(--brand-primary)]" aria-hidden="true" />
      </section>
    </div>
  );
}
