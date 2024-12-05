import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";import { PrismaClient } from "@prisma/client";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const prisma = new PrismaClient();

export default async function EditorPostsPage() {
  const session = await getServerSession(authOptions);

  if (
    !session ||
    (session.user.role !== "ADMIN" && session.user.role !== "EDITOR")
  ) {
    redirect("/");
  }

  const posts = await prisma.post.findMany({
    where: {
      authorId: session.user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Manage Posts</h2>
      <Link href="/editor/posts/create">
        <Button className="mb-4">Create New Post</Button>
      </Link>
      <ul>
        {posts.map((post) => (
          <li key={post.id} className="mb-2">
            {post.title} - {post.published ? "Published" : "Draft"}
            <Link href={`/editor/posts/edit/${post.id}`}>
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
