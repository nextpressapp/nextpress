import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import PostForm from "@/app/(dashboard)/editor/posts/_components/PostForm";
import { prisma } from "@/lib/prisma";

export default async function EditPostPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session || !["ADMIN", "MANAGER", "EDITOR"].includes(session.user.role)) {
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
