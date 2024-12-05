import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "@/lib/auth";
const prisma = new PrismaClient();

export async function PUT(
  req: Request,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);

  if (!session || !["ADMIN", "EDITOR"].includes(session.user.role)) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const { title, content, slug, published } = await req.json();

  const page = await prisma.page.findUnique({
    where: { id: params.id },
    select: { authorId: true },
  });

  if (!page) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }

  if (page.authorId !== session.user.id && session.user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Not authorized to edit this page" },
      { status: 403 },
    );
  }

  const updatedPage = await prisma.page.update({
    where: { id: params.id },
    data: {
      title,
      content,
      slug,
      published,
    },
  });

  return NextResponse.json(updatedPage);
}
