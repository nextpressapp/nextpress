import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";import { DashboardSidebar } from "@/components/DashboardSidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Footer } from "@/components/Footer";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen">
        <DashboardSidebar role="ADMIN" />
        <SidebarInset>
          <main className="flex-1 overflow-y-auto p-8">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
