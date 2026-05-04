export const ROLE_VALUES = ["CUSTOMER", "KITCHEN", "DRIVER", "ADMIN"] as const;

export type AppRole = (typeof ROLE_VALUES)[number];

export function isAppRole(value: string): value is AppRole {
  return (ROLE_VALUES as readonly string[]).includes(value);
}
