import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (
        !session ||
        !["ADMIN", "EDITOR", "MANAGER"].includes(session.user.role)
    ) {
        return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    const { title, content, slug, published } = await req.json();

    const post = await prisma.post.create({
        data: {
            title,
            content,
            slug,
            published,
            authorId: session.user.id,
        },
    });

    return NextResponse.json(post);
}
