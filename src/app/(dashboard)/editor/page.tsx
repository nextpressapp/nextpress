import { prisma } from "@/lib/prisma";
import { EditorDashboard } from "@/app/(dashboard)/editor/_components/EditorDashboard";

export default async function EditorDashboardPage() {
  const stats = await prisma.$transaction([
    prisma.post.count(),
    prisma.page.count(),
    prisma.event.count(),
  ]);

  return <EditorDashboard stats={stats} />;
}
