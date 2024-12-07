import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { v4 as uuidv4 } from 'uuid';
import { sendVerificationEmail } from "@/lib/email";
import { rateLimit } from "@/lib/rate-limit";
import zxcvbn from 'zxcvbn';

const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500, // Max 500 users per second
});

const passwordSchema = z.string()
    .min(8, "Password must be at least 8 characters long")
    .refine((password) => {
      const result = zxcvbn(password);
      return result.score >= 3;
    }, "Password is too weak. Please choose a stronger password.");

const userSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: passwordSchema,
  captcha: z.string().length(6),
});

export async function POST(req: Request) {
  try {
    await limiter.check(5, "REGISTER_RATE_LIMIT"); // 5 requests per minute

    const body = await req.json();
    const { name, email, password, captcha } = userSchema.parse(body);

    // Verify CAPTCHA
    const cookieStore = cookies();
    const captchaSession = cookieStore.get('captcha_session');
    if (!captchaSession) {
      return NextResponse.json({ error: "CAPTCHA session not found" }, { status: 400 });
    }

    const { value: captchaValue } = captchaSession;
    const { captcha: storedCaptcha, timestamp } = JSON.parse(captchaValue);
    const currentTime = Date.now();

    if (currentTime - timestamp > 600000) { // 10 minutes expiration
      return NextResponse.json({ error: "CAPTCHA has expired" }, { status: 400 });
    }

    console.log(captcha.toString());
    console.log(storedCaptcha);
    if (captcha.toUpperCase() !== storedCaptcha) {
      return NextResponse.json({ error: "Invalid CAPTCHA" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
          { error: "User with this email already exists" },
          { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = uuidv4();

    // Create user without verification token
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    // Create verification token in separate table
    await prisma.verificationToken.create({
      data: {
        identifier: user.email,
        token: verificationToken,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      },
    });

    await sendVerificationEmail(email, verificationToken);

    const response = NextResponse.json(
        { message: "User created successfully. Please check your email to verify your account." },
        { status: 201 }
    );

    // Clear the CAPTCHA session after successful verification
    response.cookies.delete('captcha_session');

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("Registration error:", error);
    return NextResponse.json(
        { error: "Something went wrong" },
        { status: 500 }
    );
  }
}

