import "server-only"

import { headers as nextHeaders } from "next/headers"
import { NextResponse } from "next/server"

import { auth } from "@/lib/auth"

// Permissions map: { resource: ["action1", "action2"] }
export type PermissionShape = Record<string, ReadonlyArray<string>>

/** Convenience: perm("ticket", "create", "update") -> { ticket: ["create","update"] } */
export function perm<R extends string, A extends readonly string[]>(resource: R, ...actions: A) {
  // Use a mapped type instead of a blunt cast to Record<...>
  return { [resource]: actions } as { [K in R]: A }
}

async function getSessionOr403() {
  const session = await auth.api.getSession({ headers: await nextHeaders() })
  if (!session) return NextResponse.json({ error: "Not authorized" }, { status: 403 })
  return session
}

/**
 * Guard a route by Better Auth permissions.
 * Usage:
 *   export const POST = withPermission(perm("ticket","create"), async ({ req, session }) => {...})
 */
export function withPermission<P extends PermissionShape>(
  permissions: P,
  handler: (ctx: {
    req: Request
    session: NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>
  }) => Promise<Response> | Response
) {
  return async (req: Request) => {
    const session = await getSessionOr403()
    if (session instanceof NextResponse) return session

    const ok = await auth.api.userHasPermission({
      body: { userId: session.user.id, permissions },
    })
    if (!ok) return new NextResponse("Forbidden", { status: 403 })

    return handler({ req, session })
  }
}

/**
 * Allow if the user has the permission OR is the owner of the resource.
 * getOwnerId(ctx) must fetch and return the resource ownerId (string).
 */
export function withPermissionOrOwner<P extends PermissionShape>(
  permissions: P,
  getOwnerId: (ctx: {
    req: Request
    session: NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>
  }) => Promise<string | null>,
  handler: (ctx: {
    req: Request
    session: NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>
  }) => Promise<Response> | Response
) {
  return async (req: Request) => {
    const session = await getSessionOr403()
    if (session instanceof NextResponse) return session

    const ok = await auth.api.userHasPermission({
      body: { userId: session.user.id, permissions },
    })

    if (!ok) {
      const ownerId = await getOwnerId({ req, session })
      if (!ownerId || ownerId !== session.user.id) {
        return new NextResponse("Forbidden", { status: 403 })
      }
    }

    return handler({ req, session })
  }
}
