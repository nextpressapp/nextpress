'use client'

import { useState, useEffect } from 'react'
import { Calendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
import 'react-big-calendar/lib/css/react-big-calendar.css'

// Setup the localizer for react-big-calendar
const localizer = momentLocalizer(moment)

interface Event {
    id: string
    title: string
    start: Date
    end: Date
    allDay?: boolean
}

export default function EventCalendar() {
    const [events, setEvents] = useState<Event[]>([])

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await fetch('/api/events')
                if (response.ok) {
                    const data = await response.json()
                    const formattedEvents = data.map((event: any) => ({
                        id: event.id,
                        title: event.title,
                        start: new Date(event.startDate),
                        end: new Date(event.endDate),
                        allDay: false, // You can adjust this based on your event data
                    }))
                    setEvents(formattedEvents)
                } else {
                    console.error('Failed to fetch events')
                }
            } catch (error) {
                console.error('Error fetching events:', error)
            }
        }

        fetchEvents()
    }, [])

    return (
        <div style={{ height: '500px' }}>
            <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: '100%' }}
            />
        </div>
    )
}

