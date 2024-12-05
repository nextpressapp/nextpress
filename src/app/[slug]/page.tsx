import { PrismaClient } from "@prisma/client";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ReactMarkdown from "react-markdown";

const prisma = new PrismaClient();

async function getPage(slug: string) {
  const page = await prisma.page.findUnique({
    where: { slug },
    include: { author: { select: { name: true } } },
  });
  if (!page || !page.published) {
    notFound();
  }
  return page;
}

export default async function PageContent({
  params,
}: {
  params: { slug: string };
}) {
  const page = await getPage(params.slug);

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">{page.title}</CardTitle>
          <p className="text-sm text-muted-foreground">
            Last updated on {new Date(page.updatedAt).toLocaleDateString()}
          </p>
        </CardHeader>
        <CardContent>
          <ReactMarkdown className="prose max-w-none">
            {page.content}
          </ReactMarkdown>
        </CardContent>
      </Card>
    </div>
  );
}
