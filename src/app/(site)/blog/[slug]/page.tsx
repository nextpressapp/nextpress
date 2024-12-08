import {prisma} from "@/lib/prisma";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {notFound} from "next/navigation";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import {Prism as SyntaxHighlighter} from "react-syntax-highlighter";
import dark from "react-syntax-highlighter/dist/esm/styles/hljs/dark";
import {CopyCodeButton} from "@/app/(site)/[slug]/codeCopyBtn";

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
                            pre: ({ children }) => (
                                <div className="relative">{children}</div>
                            ),
                            code({ className = "", children, ...props }) {
                                const match = /language-(\w+)/.exec(className || "");
                                const code = String(children).replace(/\n$/, "");

                                return match ? (
                                    <div className="relative">
                                        <SyntaxHighlighter
                                            style={dark}
                                            language={match[1]}
                                            PreTag="div"
                                        >
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
                        {post.content}
                    </ReactMarkdown>
                </CardContent>
            </Card>
        </div>
    );
}
