import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { sendWelcomeEmail } from '@/lib/email'

const prisma = new PrismaClient()

export async function POST(req: Request) {
    const { email } = await req.json()

    if (!email) {
        return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email },
        })

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        if (user.emailVerified) {
            return NextResponse.json({ error: 'Email already verified' }, { status: 400 })
        }

        await sendWelcomeEmail(user.email, user.name || 'User')

        return NextResponse.json({ message: 'Verification email sent successfully' })
    } catch (error) {
        console.error('Resend verification error:', error)
        return NextResponse.json({ error: 'An error occurred while resending the verification email' }, { status: 500 })
    }
}

