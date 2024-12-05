import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import PostForm from "@/components/PostForm";

const prisma = new PrismaClient();

export default async function EditPostPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "EDITOR") {
    redirect("/");
  }

  const post = await prisma.post.findUnique({
    where: { id: params.id },
  });

  if (!post) {
    redirect("/editor/posts");
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Edit Post</h2>
      <PostForm post={post} />
    </div>
  );
}
