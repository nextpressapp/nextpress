import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ReactMarkdown from "react-markdown";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { CopyCodeButton } from "./codeCopyBtn";
import rehypeRaw from "rehype-raw";
import dark from "react-syntax-highlighter/dist/esm/styles/hljs/dark";

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

export default async function PageContent({ params }: { params: { slug: string } }) {
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
              strong: ({ children }) => (
                <strong className="relative text-black dark:text-white font-bold">{children}</strong>
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
            {page.content}
          </ReactMarkdown>
        </CardContent>
      </Card>
    </div>
  );
}
