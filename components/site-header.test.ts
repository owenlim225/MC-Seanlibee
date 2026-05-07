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
  });

  it('renders "MC Seanlibee" title and no Customer tab', async () => {
    getSessionMock.mockResolvedValueOnce({ user: null });

    const html = renderToStaticMarkup(await SiteHeader());

    expect(html).toContain("MC Seanlibee");
    expect(html).not.toContain(">Customer<");
  });
});
