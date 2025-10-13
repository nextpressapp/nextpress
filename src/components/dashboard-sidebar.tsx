"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import packageInfo from "@/../package.json"
import {
  BadgeHelp,
  Book,
  BookOpen,
  CalendarDays,
  ChevronUp,
  Home,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Menu,
  Settings,
  Shield,
  StickyNote,
  User2,
} from "lucide-react"

import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Logo } from "@/components/logo"

const items = [
  { title: "Home", url: "/", icon: Home },
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Tickets", url: "/dashboard/tickets", icon: LifeBuoy },
]
const adminItems = [{ title: "Dashboard", url: "/admin", icon: Shield }]
const managerItems = [
  { title: "Site Settings", url: "/manager/settings", icon: Settings },
  { title: "Menus", url: "/manager/menus", icon: Menu },
]
const editorItems = [
  { title: "Dashboard", url: "/editor", icon: Book },
  { title: "Pages", url: "/editor/pages", icon: BookOpen },
  { title: "Posts", url: "/editor/posts", icon: StickyNote },
  { title: "Events", url: "/editor/events", icon: CalendarDays },
]
const supportItems = [{ title: "Dashboard", url: "/support", icon: BadgeHelp }]

export function DashboardSidebar({
  role,
  userName,
}: {
  role: "admin" | "manager" | "editor" | "support" | string | null
  userName: string
}) {
  const router = useRouter()

  const isAdmin = role === "admin"
  const isManager = role === "manager"
  const isEditor = role === "editor"
  const isSupport = role === "support"

  const signOut = async () => {
    await authClient.signOut()
    router.replace("/auth/sign-in")
    router.refresh()
  }

  return (
    <Sidebar collapsible="icon" variant="floating">
      <SidebarHeader />
      <SidebarContent>
        <SidebarGroup className="space-y-4">
          <SidebarGroupLabel className="text-2xl font-bold">
            <Logo />
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAdmin && (
          <SidebarGroup className="space-y-6">
            <SidebarGroupLabel className="text-xl font-bold">Admin Dashboard</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {(isAdmin || isManager) && (
          <SidebarGroup className="space-y-4">
            <SidebarGroupLabel className="text-xl font-bold">Manager Dashboard</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {managerItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {(isAdmin || isManager || isEditor) && (
          <SidebarGroup className="space-y-4">
            <SidebarGroupLabel className="text-xl font-bold">Editor Dashboard</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {editorItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {(isAdmin || isManager || isSupport) && (
          <SidebarGroup className="space-y-4">
            <SidebarGroupLabel className="text-xl font-bold">Support Dashboard</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {supportItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  <User2 /> {userName}
                  <ChevronUp className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" className="w-[--radix-popper-anchor-width]">
                <DropdownMenuItem asChild>
                  <Button onClick={signOut}>
                    <LogOut />
                    <span>Sign out</span>
                  </Button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
          Nextpress {packageInfo.version}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
