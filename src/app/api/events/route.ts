import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "@/lib/auth";
const prisma = new PrismaClient();

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const events = await prisma.event.findMany({
    where: {
      OR: [{ published: true }, { authorId: session.user.id }],
    },
    include: { author: { select: { name: true } } },
  });

  return NextResponse.json(events);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !["ADMIN", "EDITOR"].includes(session.user.role)) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const { title, description, startDate, endDate, location, published } =
    await req.json();

  const event = await prisma.event.create({
    data: {
      title,
      description,
      startDate,
      endDate,
      location,
      published,
      authorId: session.user.id,
    },
  });

  return NextResponse.json(event);
}
