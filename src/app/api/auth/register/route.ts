import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { sendVerificationEmail } from "@/lib/email";
import { rateLimit } from "@/lib/rate-limit";
import zxcvbn from "zxcvbn";

const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500, // Max 500 users per second
});

const passwordSchema = z
  .string()
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
    const captchaSession = req.cookies.get("captcha_session")?.value;
    if (!captchaSession) {
      return NextResponse.json(
        { error: "CAPTCHA session not found" },
        { status: 400 },
      );
    }

    const { captcha: storedCaptcha, timestamp } = JSON.parse(captchaSession);
    const currentTime = Date.now();

    if (currentTime - timestamp > 600000) {
      // 10 minutes expiration
      return NextResponse.json(
        { error: "CAPTCHA has expired" },
        { status: 400 },
      );
    }

    if (captcha.toUpperCase() !== storedCaptcha) {
      return NextResponse.json({ error: "Invalid CAPTCHA" }, { status: 400 });
    }

    // Clear the CAPTCHA session after successful verification
    const response = NextResponse.next();
    response.cookies.delete("captcha_session");

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = uuidv4();

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

    return NextResponse.json(
      {
        message:
          "User created successfully. Please check your email to verify your account.",
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json(
      { error: `Something went wrong: ${error}` },
      { status: 500 },
    );
  }
}
