import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { PrismaClient } from '@prisma/client'
import { authOptions } from '@/lib/auth'

const prisma = new PrismaClient()

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  const { searchParams } = new URL(req.url)
  const authorId = searchParams.get('authorId')

  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  try {
    let whereClause: any = { published: true }

    if (authorId) {
      whereClause = {
        OR: [
          { published: true },
          { authorId: authorId }
        ]
      }
    } else if (session.user.role !== 'ADMIN') {
      whereClause = {
        OR: [
          { published: true },
          { authorId: session.user.id }
        ]
      }
    }

    const events = await prisma.event.findMany({
      where: whereClause,
      select: {
        id: true,
        title: true,
        description: true,
        startDate: true,
        endDate: true,
        location: true,
        published: true,
        author: {
          select: { name: true }
        }
      },
      orderBy: { startDate: 'asc' }
    })

    return NextResponse.json(events)
  } catch (error) {
    console.error('Error fetching events:', error)
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session || !['ADMIN', 'EDITOR'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
  }

  const { title, description, startDate, endDate, location, published } = await req.json()

  // Ensure startDate and endDate are valid ISO-8601 strings
  const validStartDate = new Date(startDate).toISOString()
  const validEndDate = new Date(endDate).toISOString()

  try {
    const event = await prisma.event.create({
      data: {
        title,
        description,
        startDate: validStartDate,
        endDate: validEndDate,
        location,
        published,
        authorId: session.user.id
      }
    })

    return NextResponse.json(event)
  } catch (error) {
    console.error('Error creating event:', error)
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

