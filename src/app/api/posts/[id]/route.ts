import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);

  if (!session || !["ADMIN", "EDITOR", "MANAGER"].includes(session.user.role)) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const { title, content, slug, published } = await req.json();

  const post = await prisma.post.findUnique({
    where: { id: params.id },
    select: { authorId: true },
  });

  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  if (post.authorId !== session.user.id && session.user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Not authorized to edit this post" },
      { status: 403 },
    );
  }

  const updatedPost = await prisma.post.update({
    where: { id: params.id },
    data: {
      title,
      content,
      slug,
      published,
    },
  });

  return NextResponse.json(updatedPost);
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);

  if (!session || !["ADMIN", "EDITOR"].includes(session.user.role)) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  await prisma.post.delete({ where: { id: params.id } });

  return NextResponse.json({ error: "Post deleted successfully" });
}
