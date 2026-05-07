import Image from "next/image";
import Link from "next/link";
import { BookOpen, Cloud, LogIn, UserPlus } from "lucide-react";
import type { ComponentType } from "react";

type FooterLinkItem = {
  label: string;
  href?: string;
};

type FooterLinkColumn = {
  heading: string;
  items: ReadonlyArray<FooterLinkItem>;
};

const FOOTER_LINK_COLUMNS: ReadonlyArray<FooterLinkColumn> = [
  {
    heading: "Account",
    items: [
      { label: "Login", href: "/auth/login" },
      { label: "Sign up", href: "/auth/signup" },
      { label: "Orders", href: "/customer/orders" },
      { label: "Cart", href: "/customer/cart" },
    ],
  },
  {
    heading: "Operations",
    items: [
      { label: "Dashboard", href: "/admin" },
      { label: "Menu", href: "/admin/menu" },
      { label: "Users", href: "/admin/users" },
      { label: "Audit", href: "/admin/audit" },
    ],
  },
  {
    heading: "Roles",
    items: [
      { label: "Customer", href: "/customer" },
      { label: "Kitchen", href: "/kitchen" },
      { label: "Driver", href: "/driver" },
      { label: "Admin", href: "/admin" },
    ],
  },
  {
    heading: "Developer",
    items: [
      { label: "Dev role switcher", href: "/dev/role-switcher" },
      { label: "Mock Stripe Checkout" },
      { label: "Multi-role iframe lab", href: "/dev/multi-role" },
    ],
  },
];

const APP_BADGE_ITEMS: ReadonlyArray<{ label: string; href: string }> = [
  { label: "Login", href: "/auth/login" },
  { label: "Sign up", href: "/auth/signup" },
];

const BOTTOM_ICON_LINKS: ReadonlyArray<
  FooterLinkItem & { ariaLabel: string; icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }> }
> = [
  {
    label: "Next.js",
    href: "https://nextjs.org/docs/app/api-reference/cli/create-next-app",
    ariaLabel: "Open Next.js documentation",
    icon: BookOpen,
  },
  {
    label: "Google Fonts",
    href: "https://fonts.google.com",
    ariaLabel: "Open Google Fonts",
    icon: BookOpen,
  },
  {
    label: "Supabase",
    href: "https://sdgpxydkqdthgolfmpei.supabase.co/storage/v1/object/public/website-assets/logo.webp",
    ariaLabel: "Open Supabase asset",
    icon: Cloud,
  },
];

function FooterLink({ item }: { item: FooterLinkItem }) {
  if (!item.href) {
    return <span className="text-sm text-white/80">{item.label}</span>;
  }

  const isExternal = item.href.startsWith("http");
  const commonClassName =
    "text-sm text-white/90 underline-offset-4 transition-colors duration-200 hover:text-white hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--brand-primary)]";

  if (isExternal) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noreferrer"
        className={commonClassName}
        aria-label={item.label}
      >
        {item.label}
      </a>
    );
  }

  return (
    <Link href={item.href} className={commonClassName}>
      {item.label}
    </Link>
  );
}

export function SiteFooter() {
  const copyrightYear = new Date().getFullYear();

  return (
    <footer className="mt-8 bg-[var(--brand-primary)] text-[var(--brand-primary-foreground)]" aria-label="Site footer">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8">
        <section
          className="grid gap-8 border-b border-white/20 pb-8 md:grid-cols-2 lg:grid-cols-4"
          aria-label="Footer links"
        >
          {FOOTER_LINK_COLUMNS.map((column) => (
            <div key={column.heading} className="space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-white">{column.heading}</h2>
              <ul className="space-y-2">
                {column.items.map((item) => (
                  <li key={`${column.heading}-${item.label}`}>
                    <FooterLink item={item} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        <section className="grid gap-6 border-b border-white/20 pb-8 md:grid-cols-2 md:items-end" aria-label="Brand and app links">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Image
                src="https://sdgpxydkqdthgolfmpei.supabase.co/storage/v1/object/public/website-assets/logo.webp"
                alt=""
                width={36}
                height={36}
              />
              <p className="text-base font-semibold">MC Seanlibee</p>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-white/80">
              Multi-role food ordering MVP with mocked integrations
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-white">App</h2>
            <div className="flex flex-wrap gap-3" aria-label="App links">
              {APP_BADGE_ITEMS.map((item) => {
                const Icon = item.label === "Login" ? LogIn : UserPlus;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="inline-flex items-center gap-2 rounded-md border border-white/40 px-3 py-2 text-sm text-white transition-colors duration-200 hover:border-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--brand-primary)]"
                    aria-label={item.label}
                  >
                    <Icon className="size-4" aria-hidden />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        <section
          className="flex flex-col gap-3 text-sm text-white/85 sm:flex-row sm:items-center sm:justify-between"
          aria-label="Legal and external links"
        >
          <p>{`© ${copyrightYear} MC Seanlibee`}</p>
          <div className="flex items-center gap-2" aria-label="External links">
            {BOTTOM_ICON_LINKS.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={item.ariaLabel}
                  className="inline-flex items-center justify-center rounded-md border border-white/30 p-2 text-white transition-colors duration-200 hover:border-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--brand-primary)]"
                  title={item.label}
                >
                  <Icon className="size-4" aria-hidden />
                </a>
              );
            })}
          </div>
        </section>
      </div>
    </footer>
  );
}
