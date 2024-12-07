import { AdminDashboard } from "@/app/(dashboard)/admin/_components/AdminDashboard";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const stats = await prisma.$transaction([
    prisma.user.count(),
    prisma.post.count(),
    prisma.page.count(),
    prisma.event.count(),
  ]);

  return <AdminDashboard stats={stats} />;
}
