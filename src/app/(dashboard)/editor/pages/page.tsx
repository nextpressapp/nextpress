import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import PagesTable from "@/app/(dashboard)/editor/pages/_components/PagesTable";

export default async function EditorPagesPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const pages = await prisma.page.findMany({
    include: { author: { select: { name: true } } },
  });

  const sanitizedPages = pages.map((page) => ({
    ...page,
    author: {
      ...page.author,
      name: page.author.name ?? "Unknown Author",
    },
  }));

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Manage Pages</h2>
      <PagesTable pages={sanitizedPages} />
    </div>
  );
}
