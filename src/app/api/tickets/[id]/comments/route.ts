import { NextResponse } from "next/server"

import { db } from "@/db"
import { comments } from "@/db/schema"
import { perm, withPermissionOrOwner } from "@/lib/authz"
import { commentSchema } from "@/lib/validators/ticket"

const zodError = (err: import("zod").ZodError) => {
  const flat = err.flatten((issue) => issue.message)
  return NextResponse.json(
    { error: { formErrors: flat.formErrors, fieldErrors: flat.fieldErrors } },
    { status: 400 }
  )
}

export const POST = withPermissionOrOwner(
  perm("ticket", "update"),
  async ({ req }) => {
    const id = req.url.split("/").slice(-2)[0] // .../tickets/:id/comments
    const row = await db.query.tickets.findFirst({
      where: (t, { eq }) => eq(t.id, id),
      columns: { createdById: true },
    })
    return row?.createdById ?? null
  },
  async ({ req, session }) => {
    const id = req.url.split("/").slice(-2)[0]

    // Ensure ticket exists (and avoid foreign key surprises)
    const ticket = await db.query.tickets.findFirst({
      where: (t, { eq }) => eq(t.id, id),
    })
    if (!ticket) return new NextResponse("Not found", { status: 404 })

    const body = await req.json()
    const parsed = commentSchema.safeParse(body)
    if (!parsed.success) return zodError(parsed.error)

    const { body: content } = parsed.data

    const [inserted] = await db
      .insert(comments)
      .values({ ticketId: id, userId: session.user.id, content })
      .returning()

    const full = await db.query.comments.findFirst({
      where: (c, { eq }) => eq(c.id, inserted.id),
      with: { author: true },
    })

    return NextResponse.json(full, { status: 201 })
  }
)
