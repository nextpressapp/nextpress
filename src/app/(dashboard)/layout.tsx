import { ReactNode } from "react"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { db } from "@/db"
import { auth } from "@/lib/auth"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { ImpersonationBanner } from "@/components/impersonation-banner"

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/auth/sign-in")

  const settings = await db.query.siteSettings.findFirst()
  const siteName = settings?.siteName ?? "NextPress"
  const role = session.user?.role ?? null

  return (
    <div className="flex min-h-dvh w-full">
      <SidebarProvider>
        <DashboardSidebar role={role} userName={session.user?.name ?? "User"} siteName={siteName} />
        <main className="min-w-0 flex-1">
          <header className="bg-background/80 sticky top-0 z-20 border-b backdrop-blur">
            <SidebarTrigger />
          </header>
          <div className="p-4">
            <ImpersonationBanner />
            {children}
          </div>
        </main>
      </SidebarProvider>
    </div>
  )
}
