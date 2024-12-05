'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

interface Event {
    id: string
    title: string
    published: boolean
}

interface EventListProps {
    initialEvents: Event[]
}

export default function EventList({ initialEvents }: EventListProps) {
    const [events] = useState(initialEvents)
    const router = useRouter()

    const refreshEvents = () => {
        router.refresh()
    }

    return (
        <div>
            <Button onClick={refreshEvents} className="mb-4">Refresh Events</Button>
            <ul>
                {events.map((event) => (
                    <li key={event.id} className="mb-2">
                        {event.title} - {event.published ? 'Published' : 'Draft'}
                    </li>
                ))}
            </ul>
        </div>
    )
}

