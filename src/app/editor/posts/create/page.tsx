import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import PostForm from "@/components/PostForm";

export default async function CreatePostPage() {
  const session = await getServerSession(authOptions);

  console.log(JSON.stringify(session));
  if (!session || session.user.role !== "EDITOR") {
    redirect("/");
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Create New Post</h2>
      <PostForm />
    </div>
  );
}
