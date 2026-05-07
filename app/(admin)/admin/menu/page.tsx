import { prisma } from "@/lib/prisma";
import {
  createCategory,
  createMenuItem,
  deleteMenuItem,
  updateMenuItemAvailability,
} from "@/app/(admin)/admin/actions";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";

export default async function AdminMenuPage() {
  const categories = await prisma.menuCategory.findMany({
    where: { deletedAt: null },
    orderBy: { sortOrder: "asc" },
    include: {
      itemLinks: {
        where: { menuItem: { deletedAt: null } },
        orderBy: { menuItem: { name: "asc" } },
        include: { menuItem: true },
      },
    },
  });

  const totalItems = categories.reduce((count, category) => count + category.itemLinks.length, 0);
  const categoriesWithItems = categories.filter((category) => category.itemLinks.length > 0).length;
  const focusRingClass =
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950";
  const fieldClass = `rounded-md border border-zinc-300 bg-transparent px-3 py-2 transition-colors duration-200 motion-reduce:transition-none dark:border-zinc-700 ${focusRingClass}`;

  return (
    <div className="flex flex-col gap-8">
      <section id="overview" className="scroll-mt-20 space-y-4">
        <PageHeader title="Menu catalog" description="Categories, items, and mock image uploads." />
        <div className="grid gap-3 sm:grid-cols-3">
          <Card className="flex flex-col gap-1 p-4">
            <span className="text-xs uppercase tracking-wide text-zinc-500">Categories</span>
            <span className="text-2xl font-semibold text-zinc-100">{categories.length}</span>
          </Card>
          <Card className="flex flex-col gap-1 p-4">
            <span className="text-xs uppercase tracking-wide text-zinc-500">Items</span>
            <span className="text-2xl font-semibold text-zinc-100">{totalItems}</span>
          </Card>
          <Card className="flex flex-col gap-1 p-4">
            <span className="text-xs uppercase tracking-wide text-zinc-500">Active categories</span>
            <span className="text-2xl font-semibold text-zinc-100">{categoriesWithItems}</span>
          </Card>
        </div>
      </section>

      <nav
        aria-label="Menu catalog sections"
        className="sticky top-2 z-10 -mx-1 overflow-x-auto rounded-lg border border-zinc-800/80 bg-zinc-950/90 px-1 py-1 backdrop-blur"
      >
        <ul className="flex min-w-max items-center gap-1 text-sm">
          {[
            { href: "#overview", label: "Overview" },
            { href: "#new-category", label: "Category form" },
            { href: "#new-item", label: "Item form" },
            { href: "#category-browser", label: "Category browser" },
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
      </nav>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card id="new-category" className="scroll-mt-20 flex flex-col gap-4 p-5">
          <div className="space-y-1">
            <CardTitle>New category</CardTitle>
            <CardDescription>Create category names and ordering used by the storefront menu.</CardDescription>
          </div>
          <form action={createCategory} className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-sm md:col-span-2">
              <span className="font-medium text-zinc-200">Name</span>
              <input name="name" required className={fieldClass} />
            </label>
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium text-zinc-200">Sort order</span>
              <input name="sortOrder" type="number" defaultValue={0} className={fieldClass} />
            </label>
            <div className="flex items-end">
              <Button type="submit" className="w-full md:w-auto">
                Create
              </Button>
            </div>
          </form>
        </Card>

        <Card id="new-item" className="scroll-mt-20 flex flex-col gap-4 p-5">
          <div className="space-y-1">
            <CardTitle>New menu item</CardTitle>
            <CardDescription>Price is entered in dollars and stored as cents for consistency.</CardDescription>
          </div>
          <form action={createMenuItem} className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-sm md:col-span-2">
              <span className="font-medium text-zinc-200">Name</span>
              <input name="name" required className={fieldClass} />
            </label>
            <label className="flex flex-col gap-1.5 text-sm md:col-span-2">
              <span className="font-medium text-zinc-200">Description</span>
              <textarea name="description" rows={3} className={fieldClass} />
            </label>
            <div className="flex flex-col gap-1.5 text-sm">
              <label htmlFor="categoryIds" className="flex items-center justify-between gap-3">
                <span className="font-medium text-zinc-200">Categories</span>
                <span className="text-xs text-zinc-500">{categories.length} available</span>
              </label>
              <select
                id="categoryIds"
                name="categoryIds"
                multiple
                required
                size={Math.min(categories.length, 7)}
                className={`${fieldClass} min-h-44`}
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-zinc-500">Select one or more categories (Ctrl/Cmd + click for multi-select).</p>
            </div>
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium text-zinc-200">Price (USD)</span>
              <input name="price" type="number" inputMode="decimal" step="0.01" required className={fieldClass} />
            </label>
            <label className="flex flex-col gap-1.5 text-sm md:col-span-2">
              <span className="font-medium text-zinc-200">Image (optional)</span>
              <input name="image" type="file" accept="image/*" className={`rounded-md text-sm text-zinc-300 file:mr-3 file:rounded-md file:border-0 file:bg-zinc-800 file:px-3 file:py-1.5 file:text-zinc-100 hover:file:bg-zinc-700 ${focusRingClass}`} />
            </label>
            <Button type="submit" className="md:col-span-2">
              Save item
            </Button>
          </form>
        </Card>
      </div>

      <section id="category-browser" className="scroll-mt-20 flex flex-col gap-5">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-zinc-100">Category browser</h2>
            <p className="text-sm text-zinc-500">Browse items by category and run item-level availability actions.</p>
          </div>
          <span className="text-xs text-zinc-500">{totalItems} total items</span>
        </div>

        <div className="flex flex-col gap-4">
          {categories.map((category, index) => (
            <details
              key={category.id}
              className="group rounded-lg border border-zinc-800 bg-zinc-950/40 p-4 open:bg-zinc-950/60"
              open={index === 0}
            >
              <summary
                className={`flex cursor-pointer list-none items-center justify-between gap-3 rounded-md px-1 py-1 text-sm transition-colors duration-200 marker:content-none hover:text-zinc-100 motion-reduce:transition-none ${focusRingClass}`}
              >
                <span className="inline-flex items-center gap-2">
                  <span className="font-semibold text-zinc-200">{category.name}</span>
                  <span className="rounded-full border border-zinc-700 px-2 py-0.5 text-xs text-zinc-400">
                    {category.itemLinks.length} items
                  </span>
                </span>
                <span
                  aria-hidden="true"
                  className="text-xs text-zinc-500 transition-transform duration-200 group-open:rotate-90 motion-reduce:transition-none"
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
                            <CardDescription className="line-clamp-2 text-sm text-zinc-400">{item.description}</CardDescription>
                          </div>
                          <span
                            className={`shrink-0 rounded-full border px-2 py-1 text-xs font-medium ${
                              item.isAvailable
                                ? "border-emerald-700/70 text-emerald-400"
                                : "border-zinc-700 text-zinc-400"
                            }`}
                          >
                            {item.isAvailable ? "Available" : "Unavailable"}
                          </span>
                        </div>
                        <div className="rounded-md border border-zinc-800 bg-zinc-900/40 px-2.5 py-1.5 text-xs text-zinc-500">
                          Item ID: <span className="font-mono">{item.id}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-end gap-2 border-t border-zinc-800 pt-3">
                        <form action={updateMenuItemAvailability.bind(null, item.id, !item.isAvailable)}>
                          <Button type="submit" variant="secondary">
                            {item.isAvailable ? "Disable" : "Enable"}
                          </Button>
                        </form>
                        <form action={deleteMenuItem.bind(null, item.id)}>
                          <Button type="submit" variant="danger">
                            Delete
                          </Button>
                        </form>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
