import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session || !["ADMIN", "MANAGER"].includes(session.user.role)) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const { label, url } = await req.json();

  const lastItem = await prisma.menuItem.findFirst({
    where: { menuId: params.id },
    orderBy: { order: "desc" },
  });

  const order = lastItem ? lastItem.order + 1 : 0;

  const menuItem = await prisma.menuItem.create({
    data: {
      label,
      url,
      order,
      menuId: params.id,
    },
  });

  return NextResponse.json(menuItem);
}
