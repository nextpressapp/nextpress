import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session || !["ADMIN", "EDITOR", "MANAGER"].includes(session.user.role)) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const { title, description, startDate, endDate, location, published } = await req.json();

  try {
    const event = await prisma.event.findUnique({
      where: { id: params.id },
      select: { authorId: true },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const updatedEvent = await prisma.event.update({
      where: { id: params.id },
      data: {
        title,
        description,
        startDate,
        endDate,
        location,
        published,
      },
    });

    return NextResponse.json(updatedEvent);
  } catch (error) {
    console.error("Error updating event:", error);
    return NextResponse.json({ error: "Failed to update event" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session || !["ADMIN", "EDITOR", "MANAGER"].includes(session.user.role)) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  try {
    const event = await prisma.event.findUnique({
      where: { id: params.id },
      select: { authorId: true },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    await prisma.event.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("Error deleting event:", error);
    return NextResponse.json({ error: "Failed to delete event" }, { status: 500 });
  }
}
