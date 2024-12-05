import { getServerSession } from 'next-auth/next'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import UserList from '@/components/admin/UserList'

const prisma = new PrismaClient()

interface UserListItem {
  id: string
  name: string | null
  email: string
  role: string
}

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/')
  }

  try {
    const users: UserListItem[] = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true }
    })

    return (
        <div className="container mx-auto py-8">
          <h1 className="text-3xl font-bold mb-8">User Management</h1>
          <UserList initialUsers={users} />
        </div>
    )
  } catch (error) {
    console.error('Error fetching users:', error)
    return (
        <div className="container mx-auto py-8">
          <h1 className="text-3xl font-bold mb-8">User Management</h1>
          <p>An error occurred while fetching users. Please try again later.</p>
        </div>
    )
  } finally {
    await prisma.$disconnect()
  }
}

