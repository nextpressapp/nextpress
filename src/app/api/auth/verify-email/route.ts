import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  console.log("Token:", token);

  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  try {
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    });

    console.log(verificationToken);
    if (!verificationToken) {
      return NextResponse.json({ error: "Invalid token" }, { status: 400 });
    }

    if (verificationToken.expires < new Date()) {
      await prisma.verificationToken.delete({ where: { token } });
      return NextResponse.json({ error: "Token expired" }, { status: 400 });
    }

    await prisma.user.update({
      where: { email: verificationToken.identifier },
      data: { emailVerified: new Date() },
    });

    await prisma.verificationToken.delete({ where: { token } });

    console.log("I GET HERE");
    return NextResponse.redirect(
      process.env.NEXT_PUBLIC_APP_URL + "/auth/login",
      { status: 307 },
    );
  } catch (e) {
    console.error("Verification error:", e);
    return NextResponse.json(
      { error: "An error occurred during verification" },
      { status: 500 },
    );
  }
}
