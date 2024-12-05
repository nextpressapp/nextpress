import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
    try {
        const footerMenus = await prisma.menu.findMany({
            where: {
                name: {
                    in: ['Quick Links', 'Legal', 'Social']
                }
            },
            include: {
                items: {
                    orderBy: { order: 'asc' },
                }
            }
        })

        return NextResponse.json(footerMenus)
    } catch (error) {
        console.error('Error fetching footer menus:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    } finally {
        await prisma.$disconnect()
    }
}
