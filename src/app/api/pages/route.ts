import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { PrismaClient } from '@prisma/client'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

const prisma = new PrismaClient()

export async function GET(req: Request) {
    const session = await getServerSession(authOptions)

    if (!session) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const pages = await prisma.page.findMany({
        where: {
            OR: [
                { published: true },
                { authorId: session.user.id }
            ]
        },
        include: { author: { select: { name: true } } }
    })

    return NextResponse.json(pages)
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)

    if (!session || !['ADMIN', 'EDITOR'].includes(session.user.role)) {
        return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    const { title, content, slug, published } = await req.json()

    const page = await prisma.page.create({
        data: {
            title,
            content,
            slug,
            published,
            authorId: session.user.id
        }
    })

    return NextResponse.json(page)
}

