import { cookies } from "next/headers";

export type CartLine = { menuItemId: string; qty: number; notes?: string };

export const CART_MAX_NOTES_LENGTH = 500;

const CART = "mc_cart";

/** Parse validated cart lines from decoded JSON (for tests + readCart). */
export function parseCartLines(parsed: unknown): CartLine[] {
  if (!Array.isArray(parsed)) return [];
  return parsed
    .map((row) => {
      if (!row || typeof row !== "object") return null;
      const menuItemId = (row as { menuItemId?: unknown }).menuItemId;
      const qty = (row as { qty?: unknown }).qty;
      const notesRaw = (row as { notes?: unknown }).notes;
      if (typeof menuItemId !== "string" || typeof qty !== "number") return null;
      if (!Number.isFinite(qty) || qty <= 0) return null;
      const qtyInt = Math.floor(qty);
      let notesTrimmed = "";
      if (typeof notesRaw === "string") {
        notesTrimmed = notesRaw.trim().slice(0, CART_MAX_NOTES_LENGTH);
      }
      const base: CartLine = { menuItemId, qty: qtyInt };
      return notesTrimmed.length > 0 ? { ...base, notes: notesTrimmed } : base;
    })
    .filter((x): x is CartLine => Boolean(x));
}

/** Trim + cap note text for persistence (cookie + checkout). */
export function sanitizeCartNoteInput(raw: unknown): string | undefined {
  const s = typeof raw === "string" ? raw.trim().slice(0, CART_MAX_NOTES_LENGTH) : "";
  return s.length > 0 ? s : undefined;
}

export async function readCart(): Promise<CartLine[]> {
  const raw = (await cookies()).get(CART)?.value;
  if (!raw) return [];
  try {
    return parseCartLines(JSON.parse(raw));
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
