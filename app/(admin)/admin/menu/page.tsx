import { prisma } from "@/lib/prisma";
import {
  deleteMenuItem,
  restoreMenuItemFromArchive,
  updateMenuItemAvailability,
} from "@/app/(admin)/admin/actions";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { SuccessActionForm } from "@/components/feedback/success-action-form";
import { PageHeader } from "@/components/ui/page-header";
import { MenuFormModals } from "@/app/(admin)/admin/menu/menu-form-modals";

export default async function AdminMenuPage() {
  const [categories, archivedMenuItems] = await Promise.all([
    prisma.menuCategory.findMany({
      where: { deletedAt: null },
      orderBy: { sortOrder: "asc" },
      include: {
        itemLinks: {
          where: { menuItem: { deletedAt: null } },
          orderBy: { menuItem: { name: "asc" } },
          include: { menuItem: true },
        },
      },
    }),
    prisma.archivedMenuItem.findMany({
      orderBy: { archivedAt: "desc" },
      select: {
        id: true,
        originalId: true,
        name: true,
        description: true,
        priceCents: true,
        isAvailable: true,
        archivedAt: true,
      },
    }),
  ]);

  const totalItems = categories.reduce((count, category) => count + category.itemLinks.length, 0);
  const categoriesWithItems = categories.filter((category) => category.itemLinks.length > 0).length;
  const focusRingClass =
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-base)]";
  const fieldClass = `rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] transition-colors duration-200 motion-reduce:transition-none ${focusRingClass}`;

  return (
    <div className="flex flex-col gap-8">
      <section id="overview" className="scroll-mt-20 space-y-4">
        <PageHeader title="Menu catalog" description="Categories, items, and mock image uploads." />
        <div className="grid gap-3 sm:grid-cols-3">
          <Card className="flex flex-col gap-1 p-4">
            <span className="text-xs uppercase tracking-wide text-[var(--text-meta)]">Categories</span>
            <span className="text-2xl font-semibold text-[var(--text-primary)]">{categories.length}</span>
          </Card>
          <Card className="flex flex-col gap-1 p-4">
            <span className="text-xs uppercase tracking-wide text-[var(--text-meta)]">Items</span>
            <span className="text-2xl font-semibold text-[var(--text-primary)]">{totalItems}</span>
          </Card>
          <Card className="flex flex-col gap-1 p-4">
            <span className="text-xs uppercase tracking-wide text-[var(--text-meta)]">Active categories</span>
            <span className="text-2xl font-semibold text-[var(--text-primary)]">{categoriesWithItems}</span>
          </Card>
        </div>
      </section>

      <nav
        aria-label="Menu catalog sections"
        className="sticky top-2 z-10 -mx-1 overflow-x-auto rounded-lg border border-zinc-800/80 bg-zinc-950/90 px-1 py-1 backdrop-blur"
      >
        <div className="flex min-w-max items-center">
          <ul className="flex min-w-max items-center gap-1 text-sm">
            {[
              { href: "#overview", label: "Overview" },
              { href: "#category-browser", label: "Category browser" },
              { href: "#archived-menu-items", label: "Archived menu items" },
            ].map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className={`inline-flex rounded-md px-3 py-1.5 text-zinc-300 transition-colors duration-200 hover:bg-zinc-800 hover:text-zinc-100 motion-reduce:transition-none ${focusRingClass}`}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <MenuFormModals
            categories={categories.map((category) => ({ id: category.id, name: category.name }))}
            fieldClass={fieldClass}
            focusRingClass={focusRingClass}
          />
        </div>
      </nav>

      <section id="category-browser" className="scroll-mt-20 flex flex-col gap-5">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">Category browser</h2>
            <p className="text-sm text-[var(--text-meta)]">Browse items by category and run item-level availability actions.</p>
          </div>
          <span className="text-xs text-[var(--text-meta)]">{totalItems} total items</span>
        </div>

        <div className="flex flex-col gap-4">
          {categories.map((category, index) => (
            <details
              key={category.id}
              className="group rounded-lg border border-zinc-300 bg-zinc-100 p-4 open:bg-zinc-200/70"
              open={index === 0}
            >
              <summary
                className={`flex cursor-pointer list-none items-center justify-between gap-3 rounded-md px-1 py-1 text-sm text-[var(--text-primary)] transition-colors duration-200 marker:content-none hover:text-[var(--brand-primary)] motion-reduce:transition-none ${focusRingClass}`}
              >
                <span className="inline-flex items-center gap-2">
                  <span className="font-semibold text-[var(--text-primary)]">{category.name}</span>
                  <span className="rounded-full border border-zinc-400 px-2 py-0.5 text-xs text-[var(--text-meta)]">
                    {category.itemLinks.length} items
                  </span>
                </span>
                <span
                  aria-hidden="true"
                  className="text-xs text-[var(--text-meta)] transition-transform duration-200 group-open:rotate-90 motion-reduce:transition-none"
                >
                  ▶
                </span>
              </summary>

              <div className="mt-3 grid gap-3 md:grid-cols-2">
                {category.itemLinks.map((link) => {
                  const item = link.menuItem;
                  return (
                    <Card
                      key={item.id}
                      className="flex min-h-48 flex-col justify-between gap-4 border-zinc-800/90 p-4 transition-colors duration-200 hover:border-zinc-700 motion-reduce:transition-none"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <CardTitle className="truncate text-base">{item.name}</CardTitle>
                            <CardDescription className="line-clamp-2 text-sm">{item.description}</CardDescription>
                          </div>
                          <span
                            className={`shrink-0 rounded-full border px-2 py-1 text-xs font-medium ${
                              item.isAvailable
                                ? "border-emerald-700/70 text-emerald-700"
                                : "border-zinc-400 text-[var(--text-meta)]"
                            }`}
                          >
                            {item.isAvailable ? "Available" : "Unavailable"}
                          </span>
                        </div>
                        <div className="rounded-md border border-zinc-300 bg-zinc-100 px-2.5 py-1.5 text-xs text-[var(--text-meta)]">
                          Item ID: <span className="font-mono">{item.id}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-end gap-2 border-t border-zinc-300 pt-3">
                        <SuccessActionForm action={updateMenuItemAvailability.bind(null, item.id, !item.isAvailable)}>
                          <Button type="submit" variant="secondary">
                            {item.isAvailable ? "Disable" : "Enable"}
                          </Button>
                        </SuccessActionForm>
                        <SuccessActionForm action={deleteMenuItem.bind(null, item.id)}>
                          <Button type="submit" variant="danger">
                            Delete
                          </Button>
                        </SuccessActionForm>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </details>
          ))}
        </div>
      </section>

      <section id="archived-menu-items" className="scroll-mt-20 flex flex-col gap-4">
        <div>
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Archived menu items</h2>
          <p className="text-sm text-[var(--text-meta)]">Snapshot records for menu items archived by admins.</p>
        </div>
        {archivedMenuItems.length === 0 ? (
          <Card className="p-4 text-sm text-[var(--text-meta)]">No archived menu items yet.</Card>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {archivedMenuItems.map((item) => (
              <Card key={item.id} className="flex flex-col gap-2 p-4">
                <div className="flex items-start justify-between gap-3">
                  <CardTitle className="text-base">{item.name}</CardTitle>
                  <span
                    className={`rounded-full border px-2 py-0.5 text-xs ${
                      item.isAvailable ? "border-emerald-700/70 text-emerald-700" : "border-zinc-400 text-[var(--text-meta)]"
                    }`}
                  >
                    {item.isAvailable ? "Available" : "Unavailable"}
                  </span>
                </div>
                <CardDescription className="line-clamp-2">{item.description}</CardDescription>
                <div className="text-xs text-[var(--text-meta)]">
                  Price: ${(item.priceCents / 100).toFixed(2)} · Archived:{" "}
                  {item.archivedAt.toLocaleString("en-US", { timeZone: "UTC", timeZoneName: "short" })}
                </div>
                <div className="text-xs text-[var(--text-meta)]">Original ID: {item.originalId}</div>
                <div className="flex justify-end pt-1">
                  <SuccessActionForm action={restoreMenuItemFromArchive.bind(null, item.originalId)}>
                    <Button type="submit" variant="secondary">
                      Restore
                    </Button>
                  </SuccessActionForm>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
