import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import React from "react";

const { getSessionMock, readCartMock } = vi.hoisted(() => ({
  getSessionMock: vi.fn(),
  readCartMock: vi.fn(),
}));

vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) =>
    React.createElement("a", { href, ...rest }, children),
}));

vi.mock("next/image", () => ({
  default: ({ src, alt, ...rest }: { src: string; alt: string; [key: string]: unknown }) => {
    const sanitizedProps = { ...rest };
    delete sanitizedProps.priority;
    return React.createElement("img", { src, alt, ...sanitizedProps });
  },
}));

vi.mock("@/lib/auth", () => ({
  getSession: getSessionMock,
}));

vi.mock("@/lib/cart-cookie", () => ({
  readCart: readCartMock,
}));

vi.mock("@/app/auth/actions", () => ({
  logoutAction: vi.fn(),
}));

import { SiteHeader } from "@/components/site-header";

describe("SiteHeader auth controls", () => {
  it("renders Login and Sign up when signed out", async () => {
    getSessionMock.mockResolvedValueOnce({ user: null });

    const html = renderToStaticMarkup(await SiteHeader());

    expect(html).toContain('href="/auth/login"');
    expect(html).toContain(">Login<");
    expect(html).toContain('href="/auth/signup"');
    expect(html).toContain(">Sign up<");
    expect(html).not.toContain(">Logout<");
    expect(html).not.toContain('href="/dev/role-switcher"');
    expect(html).not.toContain('href="/dev/multi-role"');
  });

  it("renders user email and Logout when signed in", async () => {
    getSessionMock.mockResolvedValueOnce({
      user: { id: "u1", role: "CUSTOMER", email: "user@example.com", name: "User" },
    });
    readCartMock.mockResolvedValueOnce([
      { menuItemId: "m1", qty: 2 },
      { menuItemId: "m2", qty: 1 },
    ]);

    const html = renderToStaticMarkup(await SiteHeader());

    expect(html).toContain("user@example.com");
    expect(html).toContain(">Logout<");
    expect(html).toContain('href="/customer/cart"');
    expect(html).toContain('href="/customer/orders"');
    expect(html).toContain('data-testid="cart-badge"');
    expect(html).toContain(">3<");
    expect(html).toContain(">Cart<");
    expect(html).not.toContain(">Login<");
    expect(html).not.toContain(">Sign up<");
    expect(html).not.toContain('href="/dev/role-switcher"');
    expect(html).not.toContain('href="/dev/multi-role"');
  });

  it('renders brand lockup markers and no Customer tab', async () => {
    getSessionMock.mockResolvedValueOnce({ user: null });

    const html = renderToStaticMarkup(await SiteHeader());

    expect(html).toContain('data-testid="site-brand"');
    expect(html).toContain("MC Seanlibee");
    expect(html).toContain('src="https://sdgpxydkqdthgolfmpei.supabase.co/storage/v1/object/public/website-assets/logo.webp"');
    expect(html).toContain('alt=""');
    expect(html).not.toContain(">Customer<");
  });

  it("does not render customer cart/orders controls for non-customer role", async () => {
    getSessionMock.mockResolvedValueOnce({
      user: { id: "u2", role: "ADMIN", email: "admin@example.com", name: "Admin" },
    });
    const html = renderToStaticMarkup(await SiteHeader());

    expect(html).toContain(">Logout<");
    expect(html).not.toContain('href="/customer/cart"');
    expect(html).not.toContain('href="/customer/orders"');
  });
});
