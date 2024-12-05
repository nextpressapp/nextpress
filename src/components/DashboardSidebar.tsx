'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, FileText, Users, Calendar, Settings } from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
} from '@/components/ui/sidebar'

interface DashboardSidebarProps {
  role: 'ADMIN' | 'EDITOR'
}

export function DashboardSidebar({ role }: DashboardSidebarProps) {
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  const menuItems = [
    { href: role === 'ADMIN' ? '/admin' : '/editor', label: 'Dashboard', icon: LayoutDashboard },
    { href: `/${role.toLowerCase()}/posts`, label: 'Posts', icon: FileText },
    { href: `/${role.toLowerCase()}/pages`, label: 'Pages', icon: FileText },
    { href: `/${role.toLowerCase()}/events`, label: 'Events', icon: Calendar },
  ]

  if (role === 'ADMIN') {
    menuItems.push({ href: '/admin/users', label: 'Users', icon: Users })
  }

  menuItems.push({ href: `/${role.toLowerCase()}/settings`, label: 'Settings', icon: Settings })

  return (
      <Sidebar>
        <SidebarHeader>
          <h2 className="text-xl font-bold">{role} Dashboard</h2>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {menuItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={isActive(item.href)}>
                    <Link href={item.href}>
                      <item.icon className="mr-2 h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <SidebarTrigger />
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
  )
}
