import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }
  const ticketId = params.id;
  const body = await request.json();
  const { content } = body;

  const newComment = await prisma.comment.create({
    data: {
      content,
      userId: session.user.id,
      ticketId,
    },
    include: {
      user: true,
    },
  });

  return NextResponse.json(newComment);
}
