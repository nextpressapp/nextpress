'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import EventForm from './EventForm'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"

export default function CreateEventForm() {
    const [isOpen, setIsOpen] = useState(false)
    const router = useRouter()

    const handleSubmit = async (eventData: any) => {
        try {
            const response = await fetch('/api/events', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(eventData),
            })
            if (response.ok) {
                setIsOpen(false)
                router.refresh()
                toast({ title: "Event created successfully" })
            } else {
                throw new Error('Failed to create event')
            }
        } catch (error) {
            console.error('Failed to create event:', error)
            toast({ title: "Failed to create event", variant: "destructive" })
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button>Create New Event</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create New Event</DialogTitle>
                </DialogHeader>
                <EventForm onSubmit={handleSubmit} />
            </DialogContent>
        </Dialog>
    )
}

