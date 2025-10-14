import { NextResponse } from "next/server"
import { eq } from "drizzle-orm"

import { db } from "@/db"
import { tickets } from "@/db/schema"
import { perm, withPermissionOrOwner } from "@/lib/authz"
import { ticketSchema } from "@/lib/validators/ticket"

const zodError = (err: import("zod").ZodError) => {
  const flat = err.flatten((issue) => issue.message)
  return NextResponse.json(
    { error: { formErrors: flat.formErrors, fieldErrors: flat.fieldErrors } },
    { status: 400 }
  )
}

export const PUT = withPermissionOrOwner(
  perm("ticket", "update"),
  async ({ req }) => {
    const id = req.url.split("/").pop()!
    const row = await db.query.tickets.findFirst({
      where: (t, { eq }) => eq(t.id, id),
      columns: { createdById: true },
    })
    return row?.createdById ?? null
  },
  async ({ req }) => {
    const id = req.url.split("/").pop()!
    const json = await req.json()
    const parsed = ticketSchema.safeParse(json)
    if (!parsed.success) return zodError(parsed.error)

    const { title, description, priority } = parsed.data

    const [updated] = await db
      .update(tickets)
      .set({ title, description, priority, updatedAt: new Date() })
      .where(eq(tickets.id, id))
      .returning()

    if (!updated) return new NextResponse("Not found", { status: 404 })

    const full = await db.query.tickets.findFirst({
      where: (t, { eq }) => eq(t.id, id),
      with: {
        comments: { with: { author: true }, orderBy: (c, { desc }) => [desc(c.createdAt)] },
        createdBy: true,
      },
    })

    return NextResponse.json(full, { status: 200 })
  }
)

export const DELETE = withPermissionOrOwner(
  perm("ticket", "delete"),
  async ({ req }) => {
    const id = req.url.split("/").pop()!
    const row = await db.query.tickets.findFirst({
      where: (t, { eq }) => eq(t.id, id),
      columns: { createdById: true },
    })
    return row?.createdById ?? null
  },
  async ({ req }) => {
    const id = req.url.split("/").pop()!
    const res = await db.delete(tickets).where(eq(tickets.id, id)).returning()
    if (res.length === 0) return new NextResponse("Not found", { status: 404 })
    return new NextResponse(null, { status: 204 })
  }
)
