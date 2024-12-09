import { prisma } from "@/lib/prisma";
import { Status } from "@prisma/client";
import { NextResponse } from "next/server";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const ticketId = params.id;
  const body = await request.json();
  const { status } = body;

  const updatedTicket = await prisma.ticket.update({
    where: { id: ticketId },
    data: { status: status as Status },
    include: {
      comments: {
        include: { user: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  return NextResponse.json(updatedTicket);
}
