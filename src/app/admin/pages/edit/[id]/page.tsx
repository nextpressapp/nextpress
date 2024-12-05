import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";
import PageForm from "@/components/PageForm";

const prisma = new PrismaClient();

export default async function EditPagePage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const page = await prisma.page.findUnique({
    where: { id: params.id },
  });

  if (!page) {
    redirect("/admin/pages");
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Edit Page</h2>
      <PageForm page={page} />
    </div>
  );
}
