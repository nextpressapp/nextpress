import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { getToken } from "next-auth/jwt";

const prisma = new PrismaClient();

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

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
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

  // Update the session in the database
  await prisma.session.update({
    where: { sessionToken: token.sessionToken },
    data: { userId: user.id },
  });

  return NextResponse.json(impersonatedSession);
}
