"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Link from "next/link";
import { toast } from "@/hooks/use-toast";

interface Post {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  author: {
    name: string | null;
  };
}

interface PostsTableProps {
  posts: Post[];
}

export default function PostsTable({ posts }: PostsTableProps) {
  const [deletePostId, setDeletePostId] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!deletePostId) return;

    try {
      const response = await fetch(`/api/posts/${deletePostId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast({ title: "Post deleted successfully." });
        // Optional: Reload or refetch the page after deletion
        window.location.reload();
      } else {
        toast({ title: "Error deleting post", variant: "destructive" });
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      toast({ title: "Error deleting post", variant: "destructive" });
    } finally {
      setDeletePostId(null); // Reset dialog state
    }
  };

  return (
    <div>
      <Link href="/editor/posts/create">
        <Button className="mb-4">Create New Post</Button>
      </Link>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>Author</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {posts.map((post) => (
            <TableRow key={post.id}>
              <TableCell>{post.title}</TableCell>
              <TableCell>{post.slug}</TableCell>
              <TableCell>{post.author.name || "Unknown Author"}</TableCell>
              <TableCell>{post.published ? "Published" : "Draft"}</TableCell>
              <TableCell className="flex space-x-2">
                <Link href={`/editor/posts/edit/${post.id}`}>
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                </Link>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setDeletePostId(post.id)} // Open AlertDialog
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AlertDialog
        open={!!deletePostId}
        onOpenChange={(open) => !open && setDeletePostId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to delete this post?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The post and all its related data
              will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletePostId(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
