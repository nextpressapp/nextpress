import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url)
    const token = searchParams.get('token')

    if (!token) {
        return NextResponse.json({ error: 'Missing token' }, { status: 400 })
    }

    try {
        const resetToken = await prisma.verificationToken.findUnique({
            where: { token },
        })

        if (!resetToken) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 400 })
        }

        if (resetToken.expires < new Date()) {
            await prisma.verificationToken.delete({ where: { token } })
            return NextResponse.json({ error: 'Token expired' }, { status: 400 })
        }

        return NextResponse.json({ message: 'Token is valid' })
    } catch (error) {
        console.error('Token verification error:', error)
        return NextResponse.json({ error: 'An error occurred during token verification' }, { status: 500 })
    }
}

