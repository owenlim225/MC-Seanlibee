"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/customer", label: "Customer" },
  { href: "/kitchen", label: "Kitchen" },
  { href: "/driver", label: "Driver" },
  { href: "/admin", label: "Admin" },
];

const ROLE_HREF = {
  CUSTOMER: "/customer",
  KITCHEN: "/kitchen",
  DRIVER: "/driver",
  ADMIN: "/admin",
} as const;

function isActive(linkHref: string, pathname: string | null, roleHref: string): boolean {
  if (!pathname) return linkHref === roleHref;
  if (pathname === linkHref) return true;
  return pathname.startsWith(`${linkHref}/`);
}

export function RoleNav({ active }: { active: keyof typeof ROLE_HREF }) {
  const pathname = usePathname();
  const roleHref = ROLE_HREF[active];

  return (
    <nav aria-label="Role navigation" className="flex flex-wrap gap-2 text-sm">
      {links.map((l) => {
        const activeLink = isActive(l.href, pathname, roleHref);
        return (
          <Link
            key={l.href}
            href={l.href}
            aria-current={activeLink ? "page" : undefined}
            className={`min-h-[44px] inline-flex items-center rounded-md px-2 py-1 ${activeLink ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-950" : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-900"}`}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
