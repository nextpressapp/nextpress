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
        const verificationToken = await prisma.verificationToken.findUnique({
            where: { token },
        })

        if (!verificationToken) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 400 })
        }

        if (verificationToken.expires < new Date()) {
            await prisma.verificationToken.delete({ where: { token } })
            return NextResponse.json({ error: 'Token expired' }, { status: 400 })
        }

        const user = await prisma.user.update({
            where: { email: verificationToken.identifier },
            data: { emailVerified: new Date() },
        })

        await prisma.verificationToken.delete({ where: { token } })

        return NextResponse.json({ message: 'Email verified successfully' })
    } catch (error) {
        console.error('Verification error:', error)
        return NextResponse.json({ error: 'An error occurred during verification' }, { status: 500 })
    }
}

