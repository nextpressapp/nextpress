import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";
import { sendVerificationEmail } from "@/lib/email";
import { rateLimit } from "@/lib/rate-limit";

const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500, // Max 500 users per second
});

export async function POST(req: Request) {
  try {
    await limiter.check(5, "REQUEST_VERIFICATION_RATE_LIMIT"); // 5 requests per minute

    const { email } = await req.json();

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ error: "No user found with this email" }, { status: 404 });
    }

    if (user.emailVerified) {
      return NextResponse.json({ error: "Email is already verified" }, { status: 400 });
    }

    const verificationToken = uuidv4();

    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: verificationToken,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      },
    });

    await sendVerificationEmail(email, verificationToken);

    return NextResponse.json({ message: "Verification email sent successfully" }, { status: 200 });
  } catch (error) {
    console.error("Verification email request failed:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
