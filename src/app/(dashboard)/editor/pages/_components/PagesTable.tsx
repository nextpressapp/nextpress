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

interface Page {
    id: string;
    title: string;
    slug: string;
    published: boolean;
    author: {
        name: string | null;
    };
}

interface PagesTableProps {
    pages: Page[];
}

export default function PagesTable({ pages }: PagesTableProps) {
    const [deletePageId, setDeletePageId] = useState<string | null>(null);

    const handleDelete = async () => {
        if (!deletePageId) return;

        try {
            const response = await fetch(`/api/pages/${deletePageId}`, {
                method: "DELETE",
            });

            if (response.ok) {
                toast({ title: "Page deleted successfully." });
                // Optional: Reload or refetch the page after deletion
                window.location.reload();
            } else {
                toast({ title: "Error deleting page", variant: "destructive" });
            }
        } catch (error) {
            console.error("Error deleting page:", error);
            toast({ title: "Error deleting page", variant: "destructive" });
        } finally {
            setDeletePageId(null); // Reset dialog state
        }
    };

    return (
        <div>
            <Link href="/editor/pages/create">
                <Button className="mb-4">Create New Page</Button>
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
                    {pages.map(page => (
                        <TableRow key={page.id}>
                            <TableCell>{page.title}</TableCell>
                            <TableCell>{page.slug}</TableCell>
                            <TableCell>
                                {page.author.name || "Unknown Author"}
                            </TableCell>
                            <TableCell>
                                {page.published ? "Published" : "Draft"}
                            </TableCell>
                            <TableCell className="flex space-x-2">
                                <Link href={`/editor/pages/edit/${page.id}`}>
                                    <Button variant="outline" size="sm">
                                        Edit
                                    </Button>
                                </Link>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => setDeletePageId(page.id)} // Open AlertDialog
                                >
                                    Delete
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <AlertDialog
                open={!!deletePageId}
                onOpenChange={open => !open && setDeletePageId(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Are you sure you want to delete this page?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. The page and all its
                            related data will be permanently deleted.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel
                            onClick={() => setDeletePageId(null)}
                        >
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
