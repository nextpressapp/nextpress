import { NextResponse } from "next/server"
import { eq } from "drizzle-orm"

import { db } from "@/db"
import { pages } from "@/db/schema"
import { perm, withPermission } from "@/lib/authz"

export const PUT = withPermission(perm("page", "publish"), async ({ req }) => {
  const id = req.url.split("/").slice(-2)[0] // .../pages/[id]/publish
  const { published } = await req.json()
  const [updated] = await db
    .update(pages)
    .set({ published: !!published })
    .where(eq(pages.id, id))
    .returning()
  return NextResponse.json(updated)
})
