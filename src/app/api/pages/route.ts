import { NextResponse } from "next/server"

import { db } from "@/db"
import { pages } from "@/db/schema"
import { perm, withPermission } from "@/lib/authz"
import { pageSchema } from "@/lib/validators/page"

const flattenZod = (err: any) => ({
  fieldErrors: err.formErrors?.fieldErrors ?? err.flatten?.().fieldErrors ?? {},
  formErrors: err.formErrors?.formErrors ?? err.flatten?.().formErrors ?? [],
})

// GET (list current user’s pages or all if you prefer)
export const GET = withPermission(perm("page", "view"), async () => {
  const list = await db.query.pages.findMany({
    orderBy: (t, { desc }) => [desc(t.updatedAt)],
  })
  return NextResponse.json(list)
})

// POST (create)
export const POST = withPermission(perm("page", "create"), async ({ req, session }) => {
  const json = await req.json()
  const parsed = pageSchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: flattenZod(parsed.error) }, { status: 400 })
  }
  const data = parsed.data
  try {
    const [p] = await db
      .insert(pages)
      .values({
        ...data,
        userId: session.user.id,
      })
      .returning()
    return NextResponse.json(p, { status: 201 })
  } catch (e: any) {
    // unique slug conflict:
    if (
      String(e?.message || "").includes("unique") ||
      String(e?.message || "").includes("pages_slug_unique")
    ) {
      return NextResponse.json(
        { error: { fieldErrors: { slug: ["Slug already exists"] } } },
        { status: 409 }
      )
    }
    throw e
  }
})
