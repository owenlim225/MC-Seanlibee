import Image from "next/image";
import Link from "next/link";

type NonFeaturedCategory = {
  id: string;
  slug: string;
  name: string;
  thumbnailUrl?: string;
};

function buildCategoryDestination(slug: string, isAuthenticated: boolean): string {
  const categoryPath = `/customer?category=${slug}`;
  if (isAuthenticated) return categoryPath;
  return `/auth/login?next=${encodeURIComponent(categoryPath)}`;
}

export function NonFeaturedCategoryGrid({
  categories,
  isAuthenticated,
}: {
  categories: NonFeaturedCategory[];
  isAuthenticated: boolean;
}) {
  if (categories.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {categories.slice(0, 8).map((category) => (
        <Link
          key={category.id}
          href={buildCategoryDestination(category.slug, isAuthenticated)}
          className="group relative overflow-hidden rounded-xl border border-[var(--border-default)] bg-white text-left shadow-sm cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] focus-visible:ring-offset-2 motion-safe:transition-transform motion-safe:duration-200 motion-safe:ease-out motion-safe:hover:-translate-y-1 motion-reduce:transform-none"
          aria-label={`Browse ${category.name}`}
        >
          <div className="relative aspect-[4/3] w-full bg-zinc-100">
            {category.thumbnailUrl ? (
              <Image
                src={category.thumbnailUrl}
                alt={category.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
            ) : null}
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent opacity-70 motion-safe:transition-opacity motion-safe:duration-200 group-hover:opacity-100 group-focus-visible:opacity-100" />
            <span className="absolute inset-x-3 bottom-3 text-sm font-semibold text-white drop-shadow-sm">
              {category.name}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
