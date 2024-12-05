import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { PrismaClient } from '@prisma/client'
import { authOptions } from '@/lib/auth'

const prisma = new PrismaClient()

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session || !['ADMIN', 'EDITOR'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
  }

  const { label, url } = await req.json()

  const lastItem = await prisma.menuItem.findFirst({
    where: { menuId: params.id },
    orderBy: { order: 'desc' }
  })

  const order = lastItem ? lastItem.order + 1 : 0

  const menuItem = await prisma.menuItem.create({
    data: {
      label,
      url,
      order,
      menuId: params.id
    }
  })

  return NextResponse.json(menuItem)
}

