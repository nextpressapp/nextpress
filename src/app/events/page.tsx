import { Suspense } from 'react'
import EventCalendar from '@/components/EventCalendar'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function EventsPage() {
    return (
        <div className="container mx-auto py-8">
            <h1 className="text-2xl font-bold mb-4">Events Calendar</h1>
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

