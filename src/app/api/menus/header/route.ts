import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const headerMenu = await prisma.menu.findFirst({
      where: { name: "Header" },
      include: {
        items: {
          orderBy: { order: "asc" },
          include: {
            children: {
              orderBy: { order: "asc" },
            },
          },
        },
      },
    });

    if (!headerMenu) {
      return NextResponse.json({ error: "Header menu not found" }, { status: 404 });
    }

    return NextResponse.json(headerMenu);
  } catch (error) {
    console.error("Error fetching header menu:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
