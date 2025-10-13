import { ReactNode } from "react"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { auth } from "@/lib/auth"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { DashboardSidebar } from "@/components/dashboard-sidebar"

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/auth/sign-in")

  const role = session.user?.role ?? null
  return (
    <div className="flex min-h-dvh w-full">
      <SidebarProvider>
        <DashboardSidebar role={role} userName={session.user?.name ?? "User"} />
        <main className="min-w-0 flex-1">
          <header className="bg-background/80 sticky top-0 z-10 border-b backdrop-blur">
            <SidebarTrigger />
          </header>
          <div className="p-4">{children}</div>
        </main>
      </SidebarProvider>
    </div>
  )
}
