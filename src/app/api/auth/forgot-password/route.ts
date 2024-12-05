import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { sendPasswordResetEmail } from '@/lib/email' // Updated import

const prisma = new PrismaClient()

export async function POST(req: Request) {
  const { email } = await req.json()

  const user = await prisma.user.findUnique({
    where: { email },
  })

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const resetToken = await prisma.verificationToken.create({
    data: {
      identifier: user.email,
      token: `${user.id}-${Date.now()}`,
      expires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    },
  })

  await sendPasswordResetEmail(user.email, user.name || 'User', resetToken.token) // Updated sendEmail call

  return NextResponse.json({ message: 'Password reset email sent' })
}

