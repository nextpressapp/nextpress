// app/api/manager/settings/route.ts
import { NextResponse } from "next/server"
import { eq } from "drizzle-orm"
import { z } from "zod"

import { db } from "@/db"
import { siteSettings } from "@/db/schema"
import { perm, withPermission } from "@/lib/authz"

const settingsSchema = z.object({
  id: z.string().optional(),
  siteName: z.string().min(1),
  description: z.string().min(1),
  homeTitle: z.string().min(1),
  homeDescription: z.string().min(1),
  aboutTitle: z.string().min(1),
  aboutDescription: z.string().min(1),
})

// Zod error helper (non-deprecated shape)
const zodError = (err: z.ZodError) => {
  const flat = err.flatten((issue) => issue.message)
  return NextResponse.json(
    { error: { formErrors: flat.formErrors, fieldErrors: flat.fieldErrors } },
    { status: 400 }
  )
}

// Read (manager.settings:read)
export const GET = withPermission(perm("manager.settings", "read"), async () => {
  const rows = await db.select().from(siteSettings).limit(1)
  return NextResponse.json(rows[0] ?? null, { status: 200 })
})

// Create/Update single row (manager.settings:write)
export const POST = withPermission(perm("manager.settings", "write"), async ({ req }) => {
  const json = await req.json()
  const parsed = settingsSchema.safeParse(json)
  if (!parsed.success) return zodError(parsed.error)

  const data = parsed.data

  // If id provided, update that row; otherwise upsert the single-settings row
  if (data.id) {
    const [updated] = await db
      .update(siteSettings)
      .set({
        siteName: data.siteName,
        description: data.description,
        homeTitle: data.homeTitle,
        homeDescription: data.homeDescription,
        aboutTitle: data.aboutTitle,
        aboutDescription: data.aboutDescription,
        updatedAt: new Date(),
      })
      .where(eq(siteSettings.id, data.id))
      .returning()

    if (!updated) return new NextResponse("Not found", { status: 404 })
    return NextResponse.json(updated, { status: 200 })
  }

  // No id -> check if one exists, update if so, else insert
  const existing = await db.select().from(siteSettings).limit(1)
  if (existing[0]) {
    const [updated] = await db
      .update(siteSettings)
      .set({
        siteName: data.siteName,
        description: data.description,
        homeTitle: data.homeTitle,
        homeDescription: data.homeDescription,
        aboutTitle: data.aboutTitle,
        aboutDescription: data.aboutDescription,
        updatedAt: new Date(),
      })
      .where(eq(siteSettings.id, existing[0].id))
      .returning()
    return NextResponse.json(updated, { status: 200 })
  }

  const [inserted] = await db
    .insert(siteSettings)
    .values({
      siteName: data.siteName,
      description: data.description,
      homeTitle: data.homeTitle,
      homeDescription: data.homeDescription,
      aboutTitle: data.aboutTitle,
      aboutDescription: data.aboutDescription,
    })
    .returning()

  return NextResponse.json(inserted, { status: 201 })
})
