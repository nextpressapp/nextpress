import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getToken } from "next-auth/jwt";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const { userId } = await req.json();

  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const token = await getToken({ req: req as NextRequest, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    console.error("Token is missing");
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  // Create a new session for the impersonated user
  const impersonatedSession = {
    ...session,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    impersonatedBy: session.user.id,
  };

  // Update the user's sessions to expire them
  await prisma.session.updateMany({
    where: { userId: session.user.id },
    data: { expires: new Date() },
  });

  // Create a new session for the impersonated user
  await prisma.session.create({
    data: {
      sessionToken: `imp_${Date.now()}`,
      userId: user.id,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
    },
  });

  return NextResponse.json(impersonatedSession);
}
