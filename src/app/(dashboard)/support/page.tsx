import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { db } from "@/db"
import { auth } from "@/lib/auth"
import { SupportTicketsManager } from "@/components/support/support-tickets-manager"

export default async function SupportPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/auth/sign-in")

  // Gate by role; tweak as needed
  const role = session.user?.role
  const isAgent = role === "support" || role === "manager" || role === "admin"
  if (!isAgent) redirect("/dashboard")

  const tickets = await db.query.tickets.findMany({
    orderBy: (t, { desc }) => [desc(t.createdAt)],
    with: {
      createdBy: true,
      comments: {
        with: { author: true },
        orderBy: (c, { desc }) => [desc(c.createdAt)],
      },
    },
  })

  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Support</h1>
      </div>

      <SupportTicketsManager initialTickets={tickets} />
    </div>
  )
}
