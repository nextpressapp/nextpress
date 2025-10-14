import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { db } from "@/db"
import { auth } from "@/lib/auth"
import { PageManager } from "@/components/editor/pages-manager"

export default async function EditorPages() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/auth/sign-in")

  const rows = await db.query.pages.findMany({
    orderBy: (t, { desc }) => [desc(t.updatedAt)],
  })

  return (
    <div className="mx-auto w-full max-w-6xl">
      <h1 className="mb-6 text-2xl font-semibold">Pages</h1>
      <PageManager initialPages={rows} />
    </div>
  )
}
