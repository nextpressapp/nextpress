import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const settings = await prisma.siteSettings.findFirst();
  return NextResponse.json(settings);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const newSettings = await request.json();
  const updatedSettings = await prisma.siteSettings.upsert({
    where: { id: newSettings.id || "default" },
    update: newSettings,
    create: {
      ...newSettings,
      id: "default",
    },
  });
  return NextResponse.json(updatedSettings);
}
