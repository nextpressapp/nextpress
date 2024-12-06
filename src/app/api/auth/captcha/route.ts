import { NextResponse } from "next/server";
import { createCanvas } from "canvas";
import crypto from "crypto";

const CAPTCHA_LENGTH = 6;

function generateCaptcha() {
  const canvas = createCanvas(200, 100);
  const ctx = canvas.getContext("2d");

  // Fill background
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, 200, 100);

  // Generate random string
  const captchaText = crypto
    .randomBytes(CAPTCHA_LENGTH)
    .toString("hex")
    .slice(0, CAPTCHA_LENGTH)
    .toUpperCase();

  // Draw text
  ctx.font = "bold 30px Arial";
  ctx.fillStyle = "black";
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";

  // Add some noise
  /*
    for (let i = 0; i < 50; i++) {
        ctx.fillStyle = `rgba(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255},0.5)`;
        ctx.fillRect(Math.random() * 200, Math.random() * 100, 2, 2);
    }
    */

  // Draw distorted text

  for (let i = 0; i < captchaText.length; i++) {
    ctx.save();
    ctx.translate(30 * i + 30, 50);
    ctx.rotate((Math.random() - 0.5) * 0.4);
    ctx.fillText(captchaText[i], 0, 0);
    ctx.restore();
  }

  // Add lines for additional security

  ctx.strokeStyle = "rgba(0,0,0,0.3)";
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(0, Math.random() * 100);
    ctx.lineTo(200, Math.random() * 100);
    ctx.stroke();
  }

  return { image: canvas.toDataURL(), text: captchaText };
}

export async function GET() {
  const { image, text } = generateCaptcha();

  // In a real-world scenario, you'd want to store this in a database or cache
  // with an expiration time. For simplicity, we'll use a server-side session.
  const session = { captcha: text, timestamp: Date.now() };

  const response = NextResponse.json({ image });
  response.cookies.set("captcha_session", JSON.stringify(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 600, // 10 minutes
  });

  return response;
}
