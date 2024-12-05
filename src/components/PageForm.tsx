"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import MDEditor from "@uiw/react-md-editor";

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
        router.push("/admin/pages");
      } else {
        const data = await response.json();
        toast({
          title: "Error",
          description: data.error || "An error occurred while saving the page.",
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
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="slug">Slug</Label>
        <Input
          id="slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="content">Content</Label>
        <MDEditor
          value={content}
          onChange={(value) => setContent(value || "")}
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
