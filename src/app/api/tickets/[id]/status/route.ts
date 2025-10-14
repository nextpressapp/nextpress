import { NextResponse } from "next/server"
import { eq } from "drizzle-orm"
import { z } from "zod"

import { db } from "@/db"
import { tickets } from "@/db/schema"
import { perm, withPermission } from "@/lib/authz"

const statusSchema = z.object({
  status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"]),
})

const zodError = (err: import("zod").ZodError) => {
  const flat = err.flatten((issue) => issue.message)
  return NextResponse.json(
    { error: { formErrors: flat.formErrors, fieldErrors: flat.fieldErrors } },
    { status: 400 }
  )
}

export const PUT = withPermission(perm("ticket", "close", "update"), async ({ req }) => {
  const id = req.url.split("/").slice(-2)[0]
  const body = await req.json()
  const parsed = statusSchema.safeParse(body)
  if (!parsed.success) return zodError(parsed.error)

  const [updated] = await db
    .update(tickets)
    .set({ status: parsed.data.status, updatedAt: new Date() })
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
})
