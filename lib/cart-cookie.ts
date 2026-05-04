import { cookies } from "next/headers";

export type CartLine = { menuItemId: string; qty: number };

const CART = "mc_cart";

export async function readCart(): Promise<CartLine[]> {
  const raw = (await cookies()).get(CART)?.value;
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((row) => {
        if (!row || typeof row !== "object") return null;
        const menuItemId = (row as { menuItemId?: unknown }).menuItemId;
        const qty = (row as { qty?: unknown }).qty;
        if (typeof menuItemId !== "string" || typeof qty !== "number") return null;
        if (!Number.isFinite(qty) || qty <= 0) return null;
        return { menuItemId, qty: Math.floor(qty) };
      })
      .filter((x): x is CartLine => Boolean(x));
  } catch {
    return [];
  }
}

export async function writeCart(lines: CartLine[]): Promise<void> {
  (await cookies()).set(CART, JSON.stringify(lines), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearCart(): Promise<void> {
  (await cookies()).delete(CART);
}
