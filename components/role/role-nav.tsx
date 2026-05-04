import Link from "next/link";

const links = [
  { href: "/customer", label: "Customer" },
  { href: "/kitchen", label: "Kitchen" },
  { href: "/driver", label: "Driver" },
  { href: "/admin", label: "Admin" },
];

export function RoleNav({ active }: { active: "CUSTOMER" | "KITCHEN" | "DRIVER" | "ADMIN" }) {
  const map = {
    CUSTOMER: "/customer",
    KITCHEN: "/kitchen",
    DRIVER: "/driver",
    ADMIN: "/admin",
  } as const;

  return (
    <nav className="flex flex-wrap gap-2 text-sm">
      {links.map((l) => {
        const isActive = l.href === map[active];
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`rounded-md px-2 py-1 ${isActive ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-950" : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-900"}`}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
