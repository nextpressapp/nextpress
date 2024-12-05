import React from 'react'
import nodemailer from 'nodemailer'
import { render } from '@react-email/render'
import { WelcomeEmail } from '@/components/emails/WelcomeEmail'
import { PasswordResetEmail } from '@/components/emails/PasswordResetEmail'

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
})

export async function sendWelcomeEmail(to: string, username: string) {
  const loginUrl = `${process.env.NEXTAUTH_URL}/auth/signin`
  const emailHtml = await render(React.createElement(WelcomeEmail, { username, loginUrl }))

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: `Welcome to NextPress, ${username}!`,
    html: emailHtml,
  })
}

export async function sendPasswordResetEmail(to: string, username: string, token: string) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`
  const emailHtml = await render(React.createElement(PasswordResetEmail, { username, resetUrl }))

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: 'Reset your NextPress password',
    html: emailHtml,
  })
}

