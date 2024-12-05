import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { PrismaClient } from '@prisma/client'
import { authOptions } from '@/lib/auth'

const prisma = new PrismaClient()

export async function GET(req: Request) {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    try {
        const events = await prisma.event.findMany({
            include: {
                author: {
                    select: { name: true }
                }
            },
            orderBy: { startDate: 'desc' }
        })

        return NextResponse.json(events)
    } catch (error) {
        console.error('Error fetching events:', error)
        return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 })
    } finally {
        await prisma.$disconnect()
    }
}

