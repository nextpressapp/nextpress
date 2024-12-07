import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ReactNode } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <SidebarProvider>
      <AppSidebar session={session} />
      <main className="border w-full">
        <SidebarTrigger />
        {children}
      </main>
    </SidebarProvider>
  );
}
