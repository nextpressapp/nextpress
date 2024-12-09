import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !["ADMIN", "MANAGER", "EDITOR"].includes(session.user.role)) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  try {
    const events = await prisma.event.findMany({
      include: {
        author: {
          select: { name: true },
        },
      },
      orderBy: { startDate: "desc" },
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !["ADMIN", "EDITOR", "MANAGER"].includes(session.user.role)) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const { title, description, startDate, endDate, location, published } = await req.json();

  const validStartDate = new Date(startDate).toISOString();
  const validEndDate = new Date(endDate).toISOString();

  try {
    const event = await prisma.event.create({
      data: {
        title,
        description,
        startDate: validStartDate,
        endDate: validEndDate,
        location,
        published,
        authorId: session.user.id,
      },
    });

    return NextResponse.json(event);
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}
