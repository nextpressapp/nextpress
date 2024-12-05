import { Suspense } from 'react'
import EventCalendar from '@/components/EventCalendar'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import EventForm from '@/components/EventForm'

export default function EventsPage() {
    return (
        <div className="container mx-auto py-8">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Events Calendar</h1>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button>Create New Event</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New Event</DialogTitle>
                        </DialogHeader>
                        <EventForm onSubmit={async (eventData) => {
                            const response = await fetch('/api/events', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(eventData),
                            })
                            if (response.ok) {
                                // Refresh the page to show the new event
                                window.location.reload()
                            } else {
                                console.error('Failed to create event')
                            }
                        }} />
                    </DialogContent>
                </Dialog>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Events Calendar</CardTitle>
                </CardHeader>
                <CardContent>
                    <Suspense fallback={<div>Loading events...</div>}>
                        <EventCalendar />
                    </Suspense>
                </CardContent>
            </Card>
        </div>
    )
}

