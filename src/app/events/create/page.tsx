'use client'

import { useRouter } from 'next/navigation'
import CreateEventForm from '@/components/CreateEventForm'
import { useToast } from '@/hooks/use-toast'

export default function CreateEventPage() {
    const router = useRouter()
    const { toast } = useToast()

    const handleCreateEvent = async (eventData: any) => {
        try {
            const response = await fetch('/api/events', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(eventData),
            })

            if (response.ok) {
                toast({
                    title: 'Event created',
                    description: 'Your event has been created successfully.',
                })
                router.push('/events')
            } else {
                const data = await response.json()
                throw new Error(data.error || 'Failed to create event')
            }
        } catch (error) {
            console.error('Error creating event:', error)
            toast({
                title: 'Error',
                description: error instanceof Error ? error.message : 'An unexpected error occurred',
                variant: 'destructive',
            })
        }
    }

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-2xl font-bold mb-4">Create New Event</h1>
            <CreateEventForm onSubmit={handleCreateEvent} />
        </div>
    )
}

