'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from '@/hooks/use-toast'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface Event {
    id: string
    title: string
    startDate: Date
    endDate: Date
    published: boolean
}

interface EventListProps {
    authorId: string
    initialEvents: Event[]
}

export default function EventList({ authorId, initialEvents }: EventListProps) {
    const [events, setEvents] = useState<Event[]>(initialEvents)
    const router = useRouter()
    const { toast } = useToast()

    useEffect(() => {
        if (initialEvents.length === 0) {
            const fetchEvents = async () => {
                try {
                    const response = await fetch(`/api/events?authorId=${authorId}`)
                    if (response.ok) {
                        const data = await response.json()
                        setEvents(data.map((event: any) => ({
                            ...event,
                            startDate: new Date(event.startDate),
                            endDate: new Date(event.endDate)
                        })))
                    } else {
                        console.error('Failed to fetch events')
                    }
                } catch (error) {
                    console.error('Error fetching events:', error)
                }
            }

            fetchEvents()
        }
    }, [authorId, initialEvents])

    const handleDelete = async (id: string) => {
        try {
            const response = await fetch(`/api/events/${id}`, {
                method: 'DELETE',
            })

            if (response.ok) {
                setEvents(events.filter(event => event.id !== id))
                toast({
                    title: 'Event deleted',
                    description: 'The event has been successfully deleted.',
                })
            } else {
                toast({
                    title: 'Error',
                    description: 'Failed to delete the event.',
                    variant: 'destructive',
                })
            }
        } catch (error) {
            console.error('Error deleting event:', error)
            toast({
                title: 'Error',
                description: 'An unexpected error occurred while deleting the event.',
                variant: 'destructive',
            })
        }
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {events.map((event) => (
                    <TableRow key={event.id}>
                        <TableCell>{event.title}</TableCell>
                        <TableCell>{event.startDate.toLocaleString()}</TableCell>
                        <TableCell>{event.endDate.toLocaleString()}</TableCell>
                        <TableCell>{event.published ? 'Published' : 'Draft'}</TableCell>
                        <TableCell>
                            <div className="flex space-x-2">
                                <Link href={`/events/edit/${event.id}`}>
                                    <Button variant="outline">Edit</Button>
                                </Link>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive">Delete</Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This action cannot be undone. This will permanently delete the event.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDelete(event.id)}>
                                                Delete
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}

