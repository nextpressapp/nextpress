import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Priority } from "@prisma/client";
import { NextResponse } from "next/server";
import { TicketWithComments } from "@/types/ticket";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const body = await request.json();

  const ticket = await prisma.ticket.create({
    data: {
      title: body.title,
      description: body.description,
      priority: body.priority as Priority,
      createdById: session.user.id,
    },
    include: {
      comments: {
        include: { user: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  return NextResponse.json(ticket as TicketWithComments);
}
