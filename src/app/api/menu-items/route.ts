import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !["ADMIN", "MANAGER"].includes(session.user.role)) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const { id, label, url, parentId } = await req.json();

  if (!id || !label || !url) {
    return NextResponse.json({ error: "Invalid menu item data" }, { status: 400 });
  }

  try {
    const updatedItem = await prisma.menuItem.update({
      where: { id },
      data: { label, url, parentId: parentId || null },
    });

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error("Error updating menu item:", error);
    return NextResponse.json({ error: "Failed to update menu item" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !["ADMIN", "MANAGER"].includes(session.user.role)) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Menu item ID is required" }, { status: 400 });
  }

  try {
    await prisma.menuItem.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Menu item deleted successfully" });
  } catch (error) {
    console.error("Error deleting menu item:", error);
    return NextResponse.json({ error: "Failed to delete menu item" }, { status: 500 });
  }
}
