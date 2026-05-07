# Auth & RBAC Codemap — Session Management, Authentication, and Access Control

**Last Updated:** 2026-05-07  
**Auth Model:** App-managed (Prisma User table) with signed `mc_session` cookie  
**Entry Points:** `lib/auth/index.ts`, `app/auth/actions.ts`, `lib/supabase/middleware.ts`

## Authentication Architecture

```
Request Flow (Session Lifecycle)
    ↓
Browser includes mc_session cookie
    ↓
lib/supabase/middleware.ts (edge middleware)
    └─ Decodes mc_session
    └─ Validates signature
    └─ Attaches to request context
    ↓
Route handler / Server action
    └─ Calls getSession()
    └─ Returns typed session object or null
    └─ RBAC check: requireRole(Role.CUSTOMER)
    ↓
Protected page load / action execution
```

## Session Cookie Format

**Cookie name:** `mc_session`  
**Signature:** HMAC-SHA256(JSON, SESSION_SECRET)  
**Payload (decoded):**

```json
{
  "userId": "cuid-user-id",
  "email": "user@example.com",
  "role": "CUSTOMER",
  "name": "John Doe",
  "iat": 1714999999,
  "exp": 1715086399
}
```

**Flags:**
- `httpOnly: true` — Not accessible to JavaScript (prevents XSS theft)
- `secure: true` — HTTPS only in production
- `sameSite: "lax"` — CSRF protection
- `maxAge: 24 * 60 * 60` — 24-hour expiration (configurable)

## Authentication Flows

### Login Flow

```
User submits login form (email + password)
    ↓
POST /auth/actions.ts → authenticate(email, password)
    ↓
Prisma: User.findUnique({ where: { email } })
    ↓
Password check: verifyPassword(submitted, stored_hash)
    ├─ Success: Continue
    └─ Fail: Throw "Invalid credentials"
    ↓
Create session object:
{
  userId: user.id,
  email: user.email,
  role: user.role,
  name: user.name,
  iat: now(),
  exp: now() + 24h
}
    ↓
Sign with SESSION_SECRET: signSession(session, SECRET)
    ↓
Set mc_session cookie (httpOnly, secure, sameSite=lax)
    ↓
Redirect to role dashboard (e.g., /customer for CUSTOMER role)
```

### Signup Flow

```
User submits signup form (email, password, role, name)
    ↓
POST /auth/actions.ts → signUp(email, password, role, name)
    ↓
Validate:
├─ Email not already in use
├─ Password meets criteria (8+ chars, etc.)
├─ Role in [CUSTOMER, KITCHEN, DRIVER, ADMIN]
└─ Name not empty
    ↓
Hash password: hashPassword(password) → scrypt hash
    ↓
Prisma: User.create({
  email, password: hash, role, name,
  authUserId: null  // TODO: Supabase Auth
})
    ↓
Create + sign session (same as login)
    ↓
Redirect to role dashboard
```

### Logout Flow

```
User clicks "Log Out"
    ↓
POST /auth/actions.ts → logout()
    ↓
Delete mc_session cookie
    ↓
Clear client-side session state (if any)
    ↓
Redirect to /auth/login or /
```

## Session Management Modules

### `lib/auth/session-secret.ts`

Loads and validates SESSION_SECRET from environment:

```typescript
export function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET
  if (!secret) {
    throw new Error("SESSION_SECRET not set in environment")
  }
  if (secret.length < 32) {
    throw new Error("SESSION_SECRET must be at least 32 characters")
  }
  return secret
}
```

### `lib/auth/cookie.ts`

Sign and verify session cookies:

```typescript
import crypto from "crypto"

export interface SessionData {
  userId: string
  email: string
  role: Role
  name: string
  iat: number
  exp: number
}

export function signSession(session: SessionData, secret: string): string {
  const payload = JSON.stringify(session)
  const signature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("base64")
  return `${payload}.${signature}`
}

export function verifySession(signed: string, secret: string): SessionData {
  const [payload, signature] = signed.split(".")
  
  const expectedSig = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("base64")
  
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) {
    throw new Error("Invalid session signature")
  }
  
  const session = JSON.parse(payload) as SessionData
  
  // Check expiration
  if (session.exp < Date.now() / 1000) {
    throw new Error("Session expired")
  }
  
  return session
}
```

### `lib/auth/password.ts`

Scrypt password hashing:

```typescript
import { scryptSync, randomBytes } from "crypto"

const SALT_LENGTH = 16
const KEY_LENGTH = 32
const PEPPER = process.env.PASSWORD_PEPPER || ""

export function hashPassword(password: string): string {
  const salt = randomBytes(SALT_LENGTH).toString("hex")
  const hash = scryptSync(password + PEPPER, salt, KEY_LENGTH).toString("hex")
  return `${salt}:${hash}`
}

export async function verifyPassword(submitted: string, stored: string): Promise<boolean> {
  const [salt, hash] = stored.split(":")
  const submittedHash = scryptSync(submitted + PEPPER, salt, KEY_LENGTH).toString("hex")
  return submittedHash === hash  // Use timing-safe compare in production
}
```

### `lib/auth/provider.ts`

Decode session from cookie:

```typescript
import { cookies } from "next/headers"
import { verifySession, SessionData } from "./cookie"
import { getSessionSecret } from "./session-secret"

export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get("mc_session")?.value
  
  if (!sessionCookie) return null
  
  try {
    const session = verifySession(sessionCookie, getSessionSecret())
    return session
  } catch (error) {
    console.error("Invalid session cookie:", error)
    return null
  }
}
```

### `lib/auth/index.ts`

Public API:

```typescript
export async function getSession() {
  return getSessionFromCookie()
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete("mc_session")
}

export async function createSession(user: User) {
  const session: SessionData = {
    userId: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60 // 24 hours
  }
  
  const signed = signSession(session, getSessionSecret())
  
  const cookieStore = await cookies()
  cookieStore.set("mc_session", signed, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 24 * 60 * 60
  })
  
  return session
}
```

## Role-Based Access Control (RBAC)

### Role Definitions (`lib/roles.ts`)

```typescript
export enum Role {
  CUSTOMER = "CUSTOMER",
  KITCHEN = "KITCHEN",
  DRIVER = "DRIVER",
  ADMIN = "ADMIN"
}

export const ROLE_LABELS: Record<Role, string> = {
  [Role.CUSTOMER]: "Customer",
  [Role.KITCHEN]: "Kitchen Staff",
  [Role.DRIVER]: "Delivery Driver",
  [Role.ADMIN]: "Administrator"
}

export const ROLE_PERMISSIONS: Record<Role, string[]> = {
  [Role.CUSTOMER]: ["browse_menu", "create_order", "view_own_orders"],
  [Role.KITCHEN]: ["view_queue", "update_order_status"],
  [Role.DRIVER]: ["view_deliveries", "claim_delivery", "mark_delivered"],
  [Role.ADMIN]: ["manage_menu", "manage_users", "view_audit_log"]
}
```

### Access Control Helpers (`lib/rbac.ts`)

```typescript
export async function requireRole(...allowedRoles: Role[]): Promise<SessionData> {
  const session = await getSession()
  
  if (!session) {
    throw new Error("Unauthorized: No session")
  }
  
  if (!allowedRoles.includes(session.role)) {
    throw new Error(`Forbidden: Requires one of [${allowedRoles.join(", ")}]`)
  }
  
  return session
}

export async function requireRoleOrAdmin(...roles: Role[]): Promise<SessionData> {
  return requireRole(...roles, Role.ADMIN)
}

export async function isRole(role: Role): Promise<boolean> {
  const session = await getSession()
  return session?.role === role ?? false
}

export async function isCustodian(): Promise<boolean> {
  const session = await getSession()
  return session?.role !== Role.CUSTOMER ?? false
}
```

**Usage in server action:**

```typescript
// app/(admin)/admin/actions.ts

export async function deleteMenuItem(id: string) {
  const session = await requireRole(Role.ADMIN)  // Throws if not admin
  
  // Safe to proceed
  await prisma.menuItem.delete({ where: { id } })
}
```

## Middleware (`lib/supabase/middleware.ts`)

Edge middleware runs on **every request** (before routing):

```typescript
import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
  // 1. Decode session
  const session = await getSession()
  
  // 2. Route-specific guards
  if (pathname.startsWith("/customer")) {
    if (!session || session.role !== Role.CUSTOMER) {
      return NextResponse.redirect(new URL("/auth/login", request.url))
    }
  }
  
  if (pathname.startsWith("/kitchen")) {
    if (!session || session.role !== Role.KITCHEN) {
      return NextResponse.redirect(new URL("/auth/login", request.url))
    }
  }
  
  if (pathname.startsWith("/driver")) {
    if (!session || session.role !== Role.DRIVER) {
      return NextResponse.redirect(new URL("/auth/login", request.url))
    }
  }
  
  if (pathname.startsWith("/admin")) {
    if (!session || session.role !== Role.ADMIN) {
      return NextResponse.redirect(new URL("/auth/login", request.url))
    }
  }
  
  // 3. Allow request to proceed
  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
}
```

## Layout Role Guards

Each role-gated layout checks session in component:

```typescript
// app/(customer)/layout.tsx

import { getSession, redirect } from "@/lib/auth"

export default async function CustomerLayout({ children }) {
  const session = await getSession()
  
  if (!session) {
    redirect("/auth/login")
  }
  
  if (session.role !== Role.CUSTOMER) {
    redirect(`/${session.role.toLowerCase()}`)
  }
  
  return (
    <div>
      <Sidebar user={session} />
      <main>{children}</main>
    </div>
  )
}
```

## Safe URL Redirect (`lib/auth/safe-next-path.ts`)

Prevent open redirects:

```typescript
export function getSafeRedirectPath(path?: string): string {
  if (!path) return "/customer"
  
  // Only allow relative paths starting with /
  if (!path.startsWith("/")) return "/customer"
  
  // Whitelist safe routes
  const safePaths = ["/customer", "/kitchen", "/driver", "/admin", "/auth/login"]
  if (safePaths.some(p => path.startsWith(p))) {
    return path
  }
  
  return "/customer"  // Default fallback
}
```

## Testing Authentication

```typescript
// __tests__/auth.test.ts

import { describe, it, expect, beforeEach } from "vitest"
import { authenticate, logout } from "@/app/auth/actions"
import { hashPassword } from "@/lib/auth/password"

describe("authentication", () => {
  beforeEach(() => {
    // Mock Prisma
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: "user-123",
      email: "test@example.com",
      password: hashPassword("Test123!"),
      role: Role.CUSTOMER,
      name: "Test User"
    })
  })
  
  it("should authenticate valid user", async () => {
    const session = await authenticate("test@example.com", "Test123!")
    expect(session).toBeDefined()
    expect(session.email).toBe("test@example.com")
    expect(session.role).toBe(Role.CUSTOMER)
  })
  
  it("should reject invalid password", async () => {
    await expect(
      authenticate("test@example.com", "WrongPassword")
    ).rejects.toThrow()
  })
  
  it("should clear session on logout", async () => {
    await logout()
    const session = await getSession()
    expect(session).toBeNull()
  })
})
```

## Security Considerations

1. **HTTP-only cookies:** Session stored in httpOnly, secure cookie (not localStorage)
2. **CSRF protection:** `sameSite=lax` prevents cross-site cookie submission
3. **Signature verification:** HMAC prevents tampered session data
4. **Expiration:** Sessions expire after 24 hours (configurable)
5. **Password hashing:** Scrypt with random salt (not MD5 or plain text)
6. **Secure headers:** `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`

## Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `SESSION_SECRET` | Yes | Secret key for signing session cookies (32+ chars) |
| `PASSWORD_PEPPER` | No | Additional secret for password hashing (for defense-in-depth) |

## Related Codemaps

- **[Backend & API](./BACKEND.md)** — Server actions using auth
- **[Frontend](./FRONTEND.md)** — Login/signup pages
- **[Integrations](./INTEGRATIONS.md)** — Future Supabase Auth

## Deployment Notes

1. **Secret rotation:** Change `SESSION_SECRET` will invalidate all existing sessions
2. **Vercel:** Set `SESSION_SECRET` in project environment variables
3. **Local development:** Create `.env.local` with `SESSION_SECRET=your-secret-here`
4. **Testing:** Use fixed secret in test environment for reproducibility

## Future: Supabase Auth Integration

When wiring real Supabase Auth:

1. Replace `lib/auth/provider.ts` with `@supabase/ssr` cookie adapter
2. Replace `lib/auth/password.ts` with Supabase Auth API calls
3. Update middleware to verify Supabase session token
4. Populate `User.authUserId` with Supabase UID
5. Run backfill: `pnpm db:backfill:auth-user-id`

See `docs/follow-up.md` for detailed checklist.

---

**Next:** See [Integrations](./INTEGRATIONS.md) for external service mocks.
