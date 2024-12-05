import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";import PageForm from "@/components/PageForm";

export default async function CreatePagePage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Create New Page</h2>
      <PageForm />
    </div>
  );
}
