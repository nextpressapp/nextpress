import { getServerSession } from 'next-auth/next'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import EventList from '@/components/EventList'

const prisma = new PrismaClient()

export default async function EditorEventsPage() {
    const session = await getServerSession(authOptions)

    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'EDITOR')) {
        redirect('/')
    }

    const events = await prisma.event.findMany({
        where: {
            authorId: session.user.id
        },
        orderBy: {
            startDate: 'asc'
        },
        select: {
            id: true,
            title: true,
            startDate: true,
            endDate: true,
            published: true
        }
    })

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Manage Events</h2>
            <EventList authorId={session.user.id} initialEvents={events} />
        </div>
    )
}

