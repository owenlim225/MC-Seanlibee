export const ROLE_VALUES = ["CUSTOMER", "KITCHEN", "DRIVER", "ADMIN"] as const;

export type AppRole = (typeof ROLE_VALUES)[number];

export function isAppRole(value: string): value is AppRole {
  return (ROLE_VALUES as readonly string[]).includes(value);
}

/** Default landing route for each role after sign-in. */
export const ROLE_HOME: Readonly<Record<AppRole, string>> = {
  CUSTOMER: "/customer",
  KITCHEN: "/kitchen",
  DRIVER: "/driver",
  ADMIN: "/admin",
};
