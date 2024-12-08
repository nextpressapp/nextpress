import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
    req: Request
    //{ params }: { params: { id: string } },
) {
    const session = await getServerSession(authOptions);

    if (!session || !["ADMIN", "MANAGER"].includes(session.user.role)) {
        return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    const { items } = await req.json();

    await prisma.$transaction(
        items.map((item: any) =>
            prisma.menuItem.update({
                where: { id: item.id },
                data: { order: item.order },
            })
        )
    );

    return NextResponse.json({ success: true });
}
