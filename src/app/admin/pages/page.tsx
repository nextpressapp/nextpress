import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";import { PrismaClient } from "@prisma/client";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const prisma = new PrismaClient();

export default async function AdminPagesPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const pages = await prisma.page.findMany({
    include: { author: { select: { name: true } } },
  });

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Manage Pages</h2>
      <Link href="/admin/pages/create">
        <Button className="mb-4">Create New Page</Button>
      </Link>
      <ul>
        {pages.map((page) => (
          <li key={page.id} className="mb-2">
            {page.title} by {page.author.name} -{" "}
            {page.published ? "Published" : "Draft"}
            <Link href={`/admin/pages/edit/${page.id}`}>
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
