import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PostsTable from "@/app/(dashboard)/editor/posts/_components/PostsTable";

export default async function EditorPostsPage() {
  const session = await getServerSession(authOptions);

  if (!session || !["ADMIN", "MANAGER", "EDITOR"].includes(session.user.role)) {
    redirect("/");
  }

  const posts = await prisma.post.findMany({
    include: { author: { select: { name: true } } },
  });

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Manage Posts</h2>
      <PostsTable posts={posts} />
    </div>
  );
}
