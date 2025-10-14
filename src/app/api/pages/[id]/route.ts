import { NextResponse } from "next/server"
import { eq } from "drizzle-orm"

import { db } from "@/db"
import { pages } from "@/db/schema"
import { perm, withPermissionOrOwner } from "@/lib/authz"
import { pageSchema } from "@/lib/validators/page"

const flattenZod = (err: any) => ({
  fieldErrors: err.formErrors?.fieldErrors ?? err.flatten?.().fieldErrors ?? {},
  formErrors: err.formErrors?.formErrors ?? err.flatten?.().formErrors ?? [],
})

export const PUT = withPermissionOrOwner(
  perm("page", "update"),
  async ({ req }) => {
    const id = req.url.split("/").pop()!
    const row = await db.query.pages.findFirst({ where: (t, { eq }) => eq(t.id, id) })
    return row?.userId ?? null
  },
  async ({ req }) => {
    const id = req.url.split("/").pop()!
    const json = await req.json()
    const parsed = pageSchema.partial({ slug: true }).safeParse(json) // allow slug change? keep strict if not
    if (!parsed.success) {
      return NextResponse.json({ error: flattenZod(parsed.error) }, { status: 400 })
    }
    const [updated] = await db.update(pages).set(parsed.data).where(eq(pages.id, id)).returning()
    return NextResponse.json(updated)
  }
)

export const DELETE = withPermissionOrOwner(
  perm("page", "delete"),
  async ({ req }) => {
    const id = req.url.split("/").pop()!
    const row = await db.query.pages.findFirst({ where: (t, { eq }) => eq(t.id, id) })
    return row?.userId ?? null
  },
  async ({ req }) => {
    const id = req.url.split("/").pop()!
    await db.delete(pages).where(eq(pages.id, id))
    return new NextResponse(null, { status: 204 })
  }
)
