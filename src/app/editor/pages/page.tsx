import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import PageForm from "@/components/PageForm";
import {Button} from "@/components/ui/button";
import Link from "next/link";

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
        include: { author: { select: { name: true } } },
    });

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Manage Pages</h2>
      <PageForm />
      <ul>
        {pages.map((page) => (
          <li key={page.id} className="mb-2">
            {page.title} - {page.published ? "Published" : "Draft"}
              <Link href={`/editor/pages/edit/${page.id}`}>
                  <Button variant="outline" size="sm" className="ml-2">
                      Edit
                  </Button>
              </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
