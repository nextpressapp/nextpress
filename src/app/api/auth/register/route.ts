import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { sendWelcomeEmail } from '@/lib/email'

const prisma = new PrismaClient()

export async function POST(req: Request) {
  const { name, email, password } = await req.json()

  const existingUser = await prisma.user.findUnique({
    where: { email },
  })

  if (existingUser) {
    return NextResponse.json({ error: 'Email already exists' }, { status: 400 })
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  try {
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    })

    /*
    const verificationToken = await prisma.verificationToken.create({
      data: {
        identifier: user.email,
        token: `${user.id}-${Date.now()}`,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    })
    */

    await sendWelcomeEmail(user.email, user.name || 'User')

    return NextResponse.json({ message: 'User registered successfully. Please check your email to verify your account.' })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({ error: 'An error occurred during registration' }, { status: 500 })
  }
}

