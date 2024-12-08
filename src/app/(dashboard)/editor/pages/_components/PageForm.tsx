"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import MDEditor from "@uiw/react-md-editor";
import rehypeSanitize from "rehype-sanitize";
import {
    getCommands,
    getExtraCommands,
} from "@uiw/react-md-editor/commands-cn";
import { useTheme } from "next-themes";

interface PageFormProps {
    page?: {
        id: string;
        title: string;
        content: string;
        slug: string;
        published: boolean;
    };
}

export default function PageForm({ page }: PageFormProps) {
    const { theme } = useTheme();
    const [title, setTitle] = useState(page?.title || "");
    const [content, setContent] = useState(page?.content || "");
    const [slug, setSlug] = useState(page?.slug || "");
    const [published, setPublished] = useState(page?.published || false);
    const router = useRouter();

    useEffect(() => {
        if (!page) {
            setSlug(generateSlug(title));
        }
    }, [title, page]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = page ? `/api/pages/${page.id}` : "/api/pages";
            const method = page ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, content, slug, published }),
            });

            if (response.ok) {
                toast({
                    title: page ? "Page updated" : "Page created",
                    description: page
                        ? "Your page has been updated successfully."
                        : "Your page has been created successfully.",
                });
                router.push("/editor/pages");
            } else {
                const data = await response.json();
                toast({
                    title: "Error",
                    description:
                        data.error ||
                        "An error occurred while saving the page.",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error("Page save error:", error);
            toast({
                title: "Error",
                description: "An error occurred while saving the page.",
                variant: "destructive",
            });
        }
    };

    const generateSlug = (text: string) => {
        return text
            .toLowerCase()
            .replace(/[^\w ]+/g, "")
            .replace(/ +/g, "-");
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <Label htmlFor="title">Title</Label>
                <Input
                    id="title"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    required
                />
            </div>
            <div>
                <Label htmlFor="slug">Slug</Label>
                <Input
                    id="slug"
                    value={slug}
                    onChange={e => setSlug(e.target.value)}
                    required
                />
            </div>
            <div data-color-mode={theme}>
                <Label htmlFor="content">Content</Label>
                <MDEditor
                    value={content}
                    height={800}
                    onChange={value => setContent(value || "")}
                    commands={[...getCommands()]}
                    extraCommands={[...getExtraCommands()]}
                    previewOptions={{
                        rehypePlugins: [[rehypeSanitize]],
                    }}
                />
            </div>
            <div className="flex items-center space-x-2">
                <Switch
                    id="published"
                    checked={published}
                    onCheckedChange={setPublished}
                />
                <Label htmlFor="published">Published</Label>
            </div>
            <Button type="submit">{page ? "Update" : "Create"} Page</Button>
        </form>
    );
}
