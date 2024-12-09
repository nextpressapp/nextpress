import { NextResponse } from "next/server";
import { DashboardData } from "@/types/dashboard";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request): Promise<NextResponse<DashboardData>> {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const fromDate = from ? new Date(from) : new Date(0);
  const toDate = to ? new Date(to) : new Date();

  const tickets = await prisma.ticket.findMany({
    where: {
      createdAt: {
        gte: fromDate,
        lte: toDate,
      },
    },
    include: {
      comments: {
        include: {
          user: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
      createdBy: true,
    },
  });

  const comments = await prisma.comment.findMany({
    where: {
      createdAt: {
        gte: fromDate,
        lte: toDate,
      },
    },
    include: {
      user: true,
    },
  });

  return NextResponse.json({ tickets, comments });
}
