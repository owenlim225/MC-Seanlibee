import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { addToCart } from "@/app/(customer)/customer/actions";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { MoneyText } from "@/components/ui/money-text";
import { PageHeader } from "@/components/ui/page-header";

export default async function ItemDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await prisma.menuItem.findUnique({
    where: { id },
    include: { category: true },
  });
  if (!item || !item.isAvailable) notFound();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={item.name}
        description={item.category.name}
        actions={
          <Link className="text-sm underline" href="/customer">
            ← Menu
          </Link>
        }
      />

      <Card className="flex flex-col gap-4">
        {item.imageUrl ? (
          <div className="relative aspect-video w-full overflow-hidden rounded-md bg-zinc-100 dark:bg-zinc-800">
            <Image
              src={item.imageUrl}
              alt={item.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 640px"
              priority
            />
          </div>
        ) : null}
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
    </div>
  );
}
