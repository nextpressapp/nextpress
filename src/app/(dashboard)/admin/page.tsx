import { AdminDashboard } from "@/app/(dashboard)/admin/_components/AdminDashboard";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

interface UserListItem {
  id: string;
  name: string | null;
  email: string;
  role: string;
}

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const stats = await prisma.$transaction([
    prisma.user.count(),
    prisma.post.count(),
    prisma.page.count(),
    prisma.event.count(),
  ]);

  const users: UserListItem[] = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true },
  });

  return <AdminDashboard stats={stats} initialUsers={users} />;
}
