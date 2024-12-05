import { PrismaClient } from "@prisma/client";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ReactMarkdown from "react-markdown";

const prisma = new PrismaClient();

async function getPost(slug: string) {
  const post = await prisma.post.findUnique({
    where: { slug },
    include: { author: { select: { name: true } } },
  });
  if (!post || !post.published) {
    notFound();
  }
  return post;
}

export default async function BlogPostPage({
  params,
}: {
  params: { slug: string };
}) {
  const post = await getPost(params.slug);

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">{post.title}</CardTitle>
          <p className="text-sm text-muted-foreground">
            By {post.author.name} on{" "}
            {new Date(post.createdAt).toLocaleDateString()}
          </p>
        </CardHeader>
        <CardContent>
          <ReactMarkdown className="prose max-w-none">
            {post.content}
          </ReactMarkdown>
        </CardContent>
      </Card>
    </div>
  );
}
