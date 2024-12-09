import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import dark from "react-syntax-highlighter/dist/esm/styles/hljs/dark";
import { CopyCodeButton } from "@/app/(site)/[slug]/codeCopyBtn";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import Link from "next/link";

async function getPosts() {
  const posts = await prisma.post.findMany({
    where: { published: true },
    include: { author: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
  return posts;
}

export default async function BlogPage() {
  const posts = await getPosts();
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Blog Posts</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map(post => (
          <Card key={post.id}>
            <CardHeader>
              <CardTitle>{post.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">
                By {post.author.name} on {new Date(post.createdAt).toLocaleDateString()}
              </p>
              <p className="line-clamp-3">
                <ReactMarkdown
                  className="prose text-black dark:text-white prose-headings:mt-8 prose-headings:font-semibold prose-headings:text-black prose-h1:text-5xl prose-h2:text-4xl prose-h3:text-3xl prose-h4:text-2xl prose-h5:text-xl prose-h6:text-lg dark:prose-headings:text-white"
                  rehypePlugins={[rehypeRaw]}
                  remarkPlugins={[remarkGfm]}
                  components={{
                    a: ({ href, children, ...props }) => (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-black dark:text-white"
                        {...props}
                      >
                        {children}
                      </a>
                    ),
                    pre: ({ children }) => <div className="relative">{children}</div>,
                    code({ className = "", children, ...props }) {
                      const match = /language-(\w+)/.exec(className || "");
                      const code = String(children).replace(/\n$/, "");

                      return match ? (
                        <div className="relative">
                          <SyntaxHighlighter style={dark} language={match[1]} PreTag="div">
                            {code}
                          </SyntaxHighlighter>
                          <CopyCodeButton code={code} />
                        </div>
                      ) : (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      );
                    },
                  }}
                >
                  {post.content.replace(/<[^>]+>/g, "")}
                </ReactMarkdown>
              </p>
            </CardContent>
            <CardFooter>
              <Link href={`/blog/${post.slug}`} passHref>
                <Button>Read More</Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
