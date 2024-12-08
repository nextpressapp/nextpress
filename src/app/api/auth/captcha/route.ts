import { NextResponse } from "next/server";
import crypto from "crypto";

const CAPTCHA_LENGTH = 6;

function generateCaptcha() {
    const characters = "ABCDEF0123456789";
    let captcha = "";
    for (let i = 0; i < CAPTCHA_LENGTH; i++) {
        const randomIndex = crypto.randomInt(0, characters.length);
        captcha += characters[randomIndex];
    }
    return captcha;
}

export async function GET() {
    const captcha = generateCaptcha();

    // In a real-world scenario, you'd want to store this in a database or cache
    // with an expiration time. For simplicity, we'll use a server-side session.
    const session = { captcha, timestamp: Date.now() };

    const response = NextResponse.json({ captcha });
    response.cookies.set("captcha_session", JSON.stringify(session), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 600, // 10 minutes
    });

    return response;
}
