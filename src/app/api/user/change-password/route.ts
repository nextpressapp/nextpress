import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

const prisma = new PrismaClient()

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)

    if (!session) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { currentPassword, newPassword } = await req.json()

    try {
        const user = await prisma.user.findUnique({ where: { id: session.user.id } })

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        const isPasswordValid = await bcrypt.compare(currentPassword, user.password)

        if (!isPasswordValid) {
            return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10)

        await prisma.user.update({
            where: { id: session.user.id },
            data: { password: hashedPassword },
        })

        return NextResponse.json({ message: 'Password changed successfully' })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to change password' }, { status: 500 })
    }
}

