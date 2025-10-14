import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { count } from "drizzle-orm"

import { db } from "@/db"
import { events, pages, posts, user } from "@/db/schema"
import { auth } from "@/lib/auth"
import { AdminDashboard } from "@/components/admin/admin-dashboard"

export default async function AdminDashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect("/auth/sign-in")
  }

  const { success } = await auth.api.userHasPermission({
    body: {
      userId: session.user.id,
      permissions: { admin: ["view"] },
    },
  })

  if (!success) redirect("/dashboard")

  const stats = await db.transaction(async (trx) => {
    const [u, p, pa, e] = await Promise.all([
      trx.select({ count: count() }).from(user),
      trx.select({ count: count() }).from(posts),
      trx.select({ count: count() }).from(pages),
      trx.select({ count: count() }).from(events),
    ])

    return {
      users: Number(u[0].count),
      posts: Number(p[0].count),
      pages: Number(pa[0].count),
      events: Number(e[0].count),
    }
  })

  const users = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    })
    .from(user)

  return <AdminDashboard stats={stats} users={users} />
}
