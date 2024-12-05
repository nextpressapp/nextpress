"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import MDEditor from "@uiw/react-md-editor";

interface PostFormProps {
  post?: {
    id: string;
    title: string;
    content: string;
    slug: string;
    published: boolean;
  };
}

export default function PostForm({ post }: PostFormProps) {
  const [title, setTitle] = useState(post?.title || "");
  const [content, setContent] = useState(post?.content || "");
  const [slug, setSlug] = useState(post?.slug || "");
  const [published, setPublished] = useState(post?.published || false);
  const router = useRouter();

  useEffect(() => {
    if (!post) {
      setSlug(generateSlug(title));
    }
  }, [title, post]);

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^\w ]+/g, "")
      .replace(/ +/g, "-");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = post ? `/api/posts/${post.id}` : "/api/posts";
      const method = post ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, slug, published }),
      });

      if (response.ok) {
        toast({
          title: post ? "Post updated" : "Post created",
          description: post
            ? "Your post has been updated successfully."
            : "Your post has been created successfully.",
        });
        router.push("/admin/posts");
      } else {
        const data = await response.json();
        toast({
          title: "Error",
          description: data.error || "An error occurred while saving the post.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Post save error:", error);
      toast({
        title: "Error",
        description: "An error occurred while saving the post.",
        variant: "destructive",
      });
    }
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
        <div data-color-mode="light">
          <MDEditor
            value={content}
            onChange={(value) => setContent(value || "")}
            height={500}
          />
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Switch
          id="published"
          checked={published}
          onCheckedChange={setPublished}
        />
        <Label htmlFor="published">Published</Label>
      </div>
      <Button type="submit">{post ? "Update" : "Create"} Post</Button>
    </form>
  );
}
