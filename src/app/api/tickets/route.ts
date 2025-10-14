import { headers } from "next/headers"
import { NextResponse } from "next/server"

import { db } from "@/db"
import { comments, tickets } from "@/db/schema"
import { auth } from "@/lib/auth"
import { ticketSchema } from "@/lib/validators/ticket"

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 })
  }

  const ok = await auth.api.userHasPermission({
    body: { permissions: { ticket: ["create"] } },
  })
  if (!ok) return new NextResponse("Forbidden", { status: 403 })

  const json = await request.json()
  const parse = ticketSchema.safeParse(json)
  if (!parse.success) {
    return NextResponse.json({ error: parse.error.flatten() }, { status: 400 })
  }
  const { title, description, priority } = parse.data

  const created = await db.transaction(async (trx) => {
    // create ticket and get the inserted row
    const [t] = await trx
      .insert(tickets)
      .values({
        title,
        description,
        priority, // enum already matches (e.g. "MEDIUM")
        createdById: session.user.id,
      })
      .returning()

    // Create an initial comment; skip this block if you don’t want one.
    await trx.insert(comments).values({
      content: description,
      userId: session.user.id,
      ticketId: t.id,
    })

    const full = await trx.query.tickets.findFirst({
      where: (tbl, { eq }) => eq(tbl.id, t.id),
      with: {
        comments: {
          with: { author: true }, // ← matches your `commentRelations`
          orderBy: (c, { desc }) => [desc(c.createdAt)],
        },
        createdBy: true,
      },
    })

    return full!
  })

  return NextResponse.json(created, { status: 201 })
}
