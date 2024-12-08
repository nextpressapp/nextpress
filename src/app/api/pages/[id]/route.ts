import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
    req: Request,
    { params }: { params: { id: string } }
) {
    const session = await getServerSession(authOptions);

    if (
        !session ||
        !["ADMIN", "EDITOR", "MANAGER"].includes(session.user.role)
    ) {
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

    if (
        page.authorId !== session.user.id &&
        session.user.role !== "ADMIN" &&
        session.user.role !== "EDITOR"
    ) {
        return NextResponse.json(
            { error: "Not authorized to edit this page" },
            { status: 403 }
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

export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
) {
    const session = await getServerSession(authOptions);

    if (
        !session ||
        !["ADMIN", "EDITOR", "MANAGER"].includes(session.user.role)
    ) {
        return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    await prisma.page.delete({ where: { id: params.id } });

    return NextResponse.json({ message: "Page deleted successfully" });
}
