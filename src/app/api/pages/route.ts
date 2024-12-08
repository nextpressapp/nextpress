import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (
        !session ||
        !["ADMIN", "EDITOR", "MANAGER"].includes(session.user.role)
    ) {
        return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    const { title, content, slug, published } = await req.json();

    const page = await prisma.page.create({
        data: {
            title,
            content,
            slug,
            published,
            authorId: session.user.id,
        },
    });

    return NextResponse.json(page);
}
