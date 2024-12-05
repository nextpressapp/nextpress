'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { toast } from '@/hooks/use-toast'

interface PostFormProps {
    post?: {
        id: string
        title: string
        content: string
        published: boolean
    }
}

export default function PostForm({ post }: PostFormProps) {
    const [title, setTitle] = useState(post?.title || '')
    const [content, setContent] = useState(post?.content || '')
    const [published, setPublished] = useState(post?.published || false)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const response = await fetch('/api/posts', {
                method: post ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: post?.id, title, content, published }),
            })

            if (response.ok) {
                toast({
                    title: post ? "Post updated" : "Post created",
                    description: post ? "Your post has been updated successfully." : "Your post has been created successfully.",
                })
                router.push('/admin/posts')
            } else {
                const data = await response.json()
                toast({
                    title: "Error",
                    description: data.error || "An error occurred while saving the post.",
                    variant: "destructive",
                })
            }
        } catch (error) {
            console.error('Post save error:', error)
            toast({
                title: "Error",
                description: "An error occurred while saving the post.",
                variant: "destructive",
            })
        }
    }

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
                <Label htmlFor="content">Content</Label>
                <Textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                    rows={10}
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
            <Button type="submit">{post ? 'Update' : 'Create'} Post</Button>
        </form>
    )
}

