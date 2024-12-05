'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import MDEditor from '@uiw/react-md-editor'

interface EditEventFormProps {
    event: {
        id: string
        title: string
        description: string
        startDate: string
        endDate: string
        location?: string
        published: boolean
        authorId: string
    }
}

export default function EditEventForm({ event }: EditEventFormProps) {
    const [title, setTitle] = useState(event.title)
    const [description, setDescription] = useState(event.description)
    const [startDate, setStartDate] = useState(formatDateForInput(event.startDate))
    const [endDate, setEndDate] = useState(formatDateForInput(event.endDate))
    const [location, setLocation] = useState(event.location || '')
    const [published, setPublished] = useState(event.published)
    const router = useRouter()
    const { toast } = useToast()

    function formatDateForInput(dateString: string): string {
        const date = new Date(dateString)
        return date.toISOString().slice(0, 16)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const response = await fetch(`/api/events/${event.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    description,
                    startDate: new Date(startDate).toISOString(),
                    endDate: new Date(endDate).toISOString(),
                    location,
                    published,
                    authorId: event.authorId,
                }),
            })

            if (response.ok) {
                toast({
                    title: 'Event updated',
                    description: 'Your event has been updated successfully.',
                })
                router.push('/admin/events')
            } else {
                const data = await response.json()
                toast({
                    title: 'Error',
                    description: data.error || 'Failed to update event',
                    variant: 'destructive',
                })
            }
        } catch (error) {
            console.error('Error updating event:', error)
            toast({
                title: 'Error',
                description: 'An unexpected error occurred',
                variant: 'destructive',
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
                <Label htmlFor="description">Description</Label>
                <MDEditor
                    value={description}
                    onChange={(value) => setDescription(value || '')}
                />
            </div>
            <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                    id="startDate"
                    type="datetime-local"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                />
            </div>
            <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input
                    id="endDate"
                    type="datetime-local"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                />
            </div>
            <div>
                <Label htmlFor="location">Location</Label>
                <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
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
            <Button type="submit">Update Event</Button>
        </form>
    )
}

