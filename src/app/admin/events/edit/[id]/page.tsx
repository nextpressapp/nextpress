import { getServerSession } from 'next-auth/next'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import EditEventForm from '@/components/EditEventForm'

const prisma = new PrismaClient()

export default async function AdminEditEventPage({ params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
        redirect('/')
    }

    const event = await prisma.event.findUnique({
        where: { id: params.id }
    })

    if (!event) {
        redirect('/admin/events')
    }

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-2xl font-bold mb-4">Edit Event</h1>
            <EditEventForm event={event} />
        </div>
    )
}

