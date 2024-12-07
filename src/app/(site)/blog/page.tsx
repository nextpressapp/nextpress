import {prisma} from "@/lib/prisma";
import {Card, CardHeader, CardTitle} from "@/components/ui/card";

async function getPosts() {
    const posts = await prisma.post.findMany({
        where: {published: true},
        include: {author: {select: {name: true}}},
        orderBy: {createdAt: "desc"},
    });
    console.log(JSON.stringify(posts));
    return posts;
}

export default async function BlogPage() {
  const posts = await getPosts();
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Blog Posts</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {JSON.stringify(posts, null, 2)}
        {posts.map((post) => (
          <Card key={post.id}>
            <CardHeader>
              <CardTitle>{post.title}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
