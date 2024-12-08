import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import PostForm from "@/app/(dashboard)/editor/posts/_components/PostForm";

export default async function CreatePostPage() {
  const session = await getServerSession(authOptions);

  if (!session || !["ADMIN", "MANAGER", "EDITOR"].includes(session.user.role)) {
    redirect("/");
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Create New Post</h2>
      <PostForm />
    </div>
  );
}
