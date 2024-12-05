import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { PrismaClient } from '@prisma/client'
import { authOptions } from '@/lib/auth'

const prisma = new PrismaClient()

export async function PUT(req: Request, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions)

    if (!session) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { id } = params
    const { title, description, startDate, endDate, location, published } = await req.json()

    try {
        const event = await prisma.event.findUnique({ where: { id } })

        if (!event) {
            return NextResponse.json({ error: 'Event not found' }, { status: 404 })
        }

        if (event.authorId !== session.user.id && !['ADMIN', 'EDITOR'].includes(session.user.role)) {
            return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
        }

        const updatedEvent = await prisma.event.update({
            where: { id },
            data: {
                title,
                description,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                location,
                published
            }
        })

        return NextResponse.json(updatedEvent)
    } catch (error) {
        console.error('Error updating event:', error)
        return NextResponse.json({ error: 'Failed to update event' }, { status: 500 })
    } finally {
        await prisma.$disconnect()
    }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions)

    if (!session) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { id } = params

    try {
        const event = await prisma.event.findUnique({ where: { id } })

        if (!event) {
            return NextResponse.json({ error: 'Event not found' }, { status: 404 })
        }

        if (event.authorId !== session.user.id && !['ADMIN', 'EDITOR'].includes(session.user.role)) {
            return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
        }

        await prisma.event.delete({ where: { id } })

        return NextResponse.json({ message: 'Event deleted successfully' })
    } catch (error) {
        console.error('Error deleting event:', error)
        return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 })
    } finally {
        await prisma.$disconnect()
    }
}

