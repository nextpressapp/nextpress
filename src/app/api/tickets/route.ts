import { NextResponse } from "next/server"

import { db } from "@/db"
import { comments, tickets } from "@/db/schema"
import { perm, withPermission } from "@/lib/authz"
import { ticketSchema } from "@/lib/validators/ticket"

export const POST = withPermission(perm("ticket", "create"), async ({ req, session }) => {
  const json = await req.json()
  const parsed = ticketSchema.safeParse(json)

  if (!parsed.success) {
    // ✅ new overload: map issues -> message (no deprecated signature)
    const flat = parsed.error.flatten((issue) => issue.message)
    return NextResponse.json(
      { error: { formErrors: flat.formErrors, fieldErrors: flat.fieldErrors } },
      { status: 400 }
    )
  }

  const { title, description, priority } = parsed.data

  const created = await db.transaction(async (trx) => {
    const [t] = await trx
      .insert(tickets)
      .values({ title, description, priority, createdById: session.user.id })
      .returning()

    await trx.insert(comments).values({
      content: description,
      userId: session.user.id,
      ticketId: t.id,
    })

    const full = await trx.query.tickets.findFirst({
      where: (tbl, { eq }) => eq(tbl.id, t.id),
      with: {
        comments: { with: { author: true }, orderBy: (c, { desc }) => [desc(c.createdAt)] },
        createdBy: true,
      },
    })

    return full!
  })

  return NextResponse.json(created, { status: 201 })
})
