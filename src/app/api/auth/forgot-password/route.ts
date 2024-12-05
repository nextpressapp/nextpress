import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { sendEmail } from "@/lib/email";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const { email } = await req.json();

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const resetToken = await prisma.verificationToken.create({
    data: {
      identifier: user.email,
      token: `${user.id}-${Date.now()}`,
      expires: new Date(Date.now() + 1 * 60 * 60 * 1000), // 1 hour
    },
  });

  const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken.token}`;

  await sendEmail({
    to: user.email,
    subject: "Reset your password",
    html: `
      <h1>Reset Your Password</h1>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}">${resetUrl}</a>
    `,
  });

  return NextResponse.json({ message: "Password reset email sent" });
}
