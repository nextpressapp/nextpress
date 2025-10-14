import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { auth } from "@/lib/auth"
import { NewTicketForm } from "@/components/tickets/new-ticket-form"

export default async function TicketsCreatePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect("/auth/sign-in")
  }

  const { success } = await auth.api.userHasPermission({
    body: {
      userId: session.user.id,
      permissions: { ticket: ["create"] },
    },
  })

  if (!success) redirect("/dashboard/tickets")
  return (
    <div>
      <h2 className="mb-4 text-2xl font-bold">Create New Ticket</h2>
      <NewTicketForm />
    </div>
  )
}
