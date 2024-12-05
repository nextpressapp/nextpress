'use client'

import { useState, useEffect } from 'react'
import { Calendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import EventForm from './EventForm'
import { useToast } from "@/hooks/use-toast"
import { useSession } from 'next-auth/react'
import { Event, CalendarEvent } from '@/types/event'

const localizer = momentLocalizer(moment)

export default function EventCalendar() {
    const [events, setEvents] = useState<CalendarEvent[]>([])
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
    const { toast } = useToast()
    const { data: session } = useSession()

    useEffect(() => {
        fetchEvents()
    }, [])

    const fetchEvents = async () => {
        try {
            const response = await fetch('/api/events')
            if (response.ok) {
                const data: Event[] = await response.json()
                const formattedEvents: CalendarEvent[] = data.map((event) => ({
                    ...event,
                    start: new Date(event.startDate),
                    end: new Date(event.endDate),
                }))
                setEvents(formattedEvents)
            } else {
                console.error('Failed to fetch events')
            }
        } catch (error) {
            console.error('Error fetching events:', error)
        }
    }

    const handleSelectEvent = (event: CalendarEvent) => {
        setSelectedEvent(event)
    }

    const handleEventUpdate = async (updatedEvent: Event) => {
        try {
            const response = await fetch(`/api/events/${updatedEvent.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedEvent),
            })

            if (response.ok) {
                const updatedCalendarEvent: CalendarEvent = {
                    ...updatedEvent,
                    start: new Date(updatedEvent.startDate),
                    end: new Date(updatedEvent.endDate),
                }
                setEvents(events.map(event => event.id === updatedEvent.id ? updatedCalendarEvent : event))
                setSelectedEvent(null)
                toast({ title: "Event updated successfully" })
            } else {
                toast({ title: "Failed to update event", variant: "destructive" })
            }
        } catch (error) {
            console.error('Error updating event:', error)
            toast({ title: "Error updating event", variant: "destructive" })
        }
    }

    const handleEventCreate = async (newEvent: Event) => {
        try {
            const response = await fetch('/api/events', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newEvent),
            })

            if (response.ok) {
                const createdEvent: Event = await response.json()
                const newCalendarEvent: CalendarEvent = {
                    ...createdEvent,
                    start: new Date(createdEvent.startDate),
                    end: new Date(createdEvent.endDate),
                }
                setEvents([...events, newCalendarEvent])
                toast({ title: "Event created successfully" })
            } else {
                toast({ title: "Failed to create event", variant: "destructive" })
            }
        } catch (error) {
            console.error('Error creating event:', error)
            toast({ title: "Error creating event", variant: "destructive" })
        }
    }

    const handleEventDelete = async (eventId: string) => {
        if (confirm('Are you sure you want to delete this event?')) {
            try {
                const response = await fetch(`/api/events/${eventId}`, {
                    method: 'DELETE',
                })

                if (response.ok) {
                    setEvents(events.filter(event => event.id !== eventId))
                    setSelectedEvent(null)
                    toast({ title: "Event deleted successfully" })
                } else {
                    toast({ title: "Failed to delete event", variant: "destructive" })
                }
            } catch (error) {
                console.error('Error deleting event:', error)
                toast({ title: "Error deleting event", variant: "destructive" })
            }
        }
    }

    const canEditEvent = (event: CalendarEvent) => {
        return session?.user.role === 'ADMIN' || session?.user.role === 'EDITOR' || event.authorId === session?.user.id
    }

    return (
        <div style={{ height: '500px' }}>
            <Dialog>
                <DialogTrigger asChild>
                    <Button className="mb-4">Create New Event</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create New Event</DialogTitle>
                    </DialogHeader>
                    <EventForm onSubmit={handleEventCreate} />
                </DialogContent>
            </Dialog>

            <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: '100%' }}
                onSelectEvent={handleSelectEvent}
            />
            {selectedEvent && (
                <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{selectedEvent.title}</DialogTitle>
                        </DialogHeader>
                        <div>
                            <p><strong>Start:</strong> {moment(selectedEvent.startDate).format('MMMM D, YYYY h:mm A')}</p>
                            <p><strong>End:</strong> {moment(selectedEvent.endDate).format('MMMM D, YYYY h:mm A')}</p>
                            <p><strong>Location:</strong> {selectedEvent.location}</p>
                            <p><strong>Description:</strong> {selectedEvent.description}</p>
                        </div>
                        {canEditEvent(selectedEvent) && (
                            <div className="flex justify-end space-x-2 mt-4">
                                <Button onClick={() => handleEventDelete(selectedEvent.id!)} variant="destructive">Delete</Button>
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button>Edit</Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Edit Event</DialogTitle>
                                        </DialogHeader>
                                        <EventForm event={selectedEvent} onSubmit={handleEventUpdate} />
                                    </DialogContent>
                                </Dialog>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            )}
        </div>
    )
}

