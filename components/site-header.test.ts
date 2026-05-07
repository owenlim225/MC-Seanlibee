import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import React from "react";

const { getSessionMock } = vi.hoisted(() => ({
  getSessionMock: vi.fn(),
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

    const html = renderToStaticMarkup(await SiteHeader());

    expect(html).toContain("user@example.com");
    expect(html).toContain(">Logout<");
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
});
