'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import MDEditor from '@uiw/react-md-editor'

interface CreateEventFormProps {
    onSubmit: (eventData: any) => Promise<void>
}

export default function CreateEventForm({ onSubmit }: CreateEventFormProps) {
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [location, setLocation] = useState('')
    const [published, setPublished] = useState(false)
    const { toast } = useToast()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            await onSubmit({
                title,
                description,
                startDate: new Date(startDate).toISOString(),
                endDate: new Date(endDate).toISOString(),
                location,
                published,
            })

            toast({
                title: 'Event created',
                description: 'Your event has been created successfully.',
            })

            // Reset form fields
            setTitle('')
            setDescription('')
            setStartDate('')
            setEndDate('')
            setLocation('')
            setPublished(false)
        } catch (error) {
            console.error('Error creating event:', error)
            toast({
                title: 'Error',
                description: 'An unexpected error occurred while creating the event.',
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
            <Button type="submit">Create Event</Button>
        </form>
    )
}

