import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

export default async function EditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (
    !session ||
    (session.user.role !== "ADMIN" && session.user.role !== "EDITOR")
  ) {
    redirect("/");
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen">
        <DashboardSidebar role="EDITOR" />
        <SidebarInset>
          <main className="flex-1 overflow-y-auto p-8">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
