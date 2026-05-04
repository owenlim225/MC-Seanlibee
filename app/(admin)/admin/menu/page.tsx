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
    orderBy: { sortOrder: "asc" },
    include: { items: { orderBy: { name: "asc" } } },
  });

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Menu catalog" description="Categories, items, and mock image uploads." />

      <Card className="flex flex-col gap-4">
        <CardTitle>New category</CardTitle>
        <form action={createCategory} className="grid gap-3 md:grid-cols-3">
          <label className="flex flex-col gap-1 text-sm">
            Name
            <input name="name" className="rounded-md border border-zinc-300 bg-transparent px-3 py-2 dark:border-zinc-700" />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Sort order
            <input
              name="sortOrder"
              type="number"
              defaultValue={0}
              className="rounded-md border border-zinc-300 bg-transparent px-3 py-2 dark:border-zinc-700"
            />
          </label>
          <div className="flex items-end">
            <Button type="submit" className="w-full md:w-auto">
              Create
            </Button>
          </div>
        </form>
      </Card>

      <Card className="flex flex-col gap-4">
        <CardTitle>New menu item</CardTitle>
        <CardDescription>Price is entered in dollars — stored as cents.</CardDescription>
        <form action={createMenuItem} className="grid gap-3 md:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm md:col-span-2">
            Name
            <input name="name" required className="rounded-md border border-zinc-300 bg-transparent px-3 py-2 dark:border-zinc-700" />
          </label>
          <label className="flex flex-col gap-1 text-sm md:col-span-2">
            Description
            <textarea
              name="description"
              rows={3}
              className="rounded-md border border-zinc-300 bg-transparent px-3 py-2 dark:border-zinc-700"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Category
            <select
              name="categoryId"
              required
              className="rounded-md border border-zinc-300 bg-transparent px-3 py-2 dark:border-zinc-700"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Price (USD)
            <input
              name="price"
              type="number"
              inputMode="decimal"
              step="0.01"
              required
              className="rounded-md border border-zinc-300 bg-transparent px-3 py-2 dark:border-zinc-700"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm md:col-span-2">
            Image (optional)
            <input name="image" type="file" accept="image/*" />
          </label>
          <Button type="submit" className="md:col-span-2">
            Save item
          </Button>
        </form>
      </Card>

      <div className="flex flex-col gap-6">
        {categories.map((category) => (
          <section key={category.id} className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">{category.name}</h2>
              <span className="text-xs text-zinc-500">{category.items.length} items</span>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {category.items.map((item) => (
                <Card key={item.id} className="flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle>{item.name}</CardTitle>
                      <CardDescription>{item.description}</CardDescription>
                    </div>
                    <div className="text-xs text-zinc-500">{item.id}</div>
                  </div>
                  <div className="flex flex-wrap gap-2">
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
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
