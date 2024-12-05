import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";
import PageForm from "@/components/PageForm";

const prisma = new PrismaClient();

export default async function EditorPagesPage() {
  const session = await getServerSession(authOptions);

  if (
    !session ||
    (session.user.role !== "ADMIN" && session.user.role !== "EDITOR")
  ) {
    redirect("/");
  }

  const pages = await prisma.page.findMany({
    where: {
      authorId: session.user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Manage Pages</h2>
      <PageForm />
      <ul>
        {pages.map((page) => (
          <li key={page.id} className="mb-2">
            {page.title} - {page.published ? "Published" : "Draft"}
          </li>
        ))}
      </ul>
    </div>
  );
}
