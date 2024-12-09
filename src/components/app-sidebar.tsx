"use client";

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
} from "@/components/ui/sidebar";
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
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DashboardThemeSwitcher } from "@/app/(dashboard)/dashboard/_components/DashboardThemeSwitcher";
import { Session } from "next-auth";
import { Logo } from "@/components/Logo";
import packageInfo from "@/../package.json";

const items = [
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Tickets",
    url: "/dashboard/tickets",
    icon: LifeBuoy,
  },
];

const adminItems = [
  {
    title: "Dashboard",
    url: "/admin",
    icon: Shield,
  },
];

const managerItems = [
  {
    title: "Site Settings",
    url: "/manager/settings",
    icon: Settings,
  },
  {
    title: "Menus",
    url: "/manager/menus",
    icon: Menu,
  },
];

const editorItems = [
  {
    title: "Dashboard",
    url: "/editor",
    icon: Book,
  },
  {
    title: "Pages",
    url: "/editor/pages",
    icon: BookOpen,
  },
  {
    title: "Posts",
    url: "/editor/posts",
    icon: StickyNote,
  },
  {
    title: "Events",
    url: "/editor/events",
    icon: CalendarDays,
  },
];

const supportItems = [
  {
    title: "Dashboard",
    url: "/support",
    icon: BadgeHelp,
  },
];

export function AppSidebar({ session }: { session: Session | null }) {
  return (
    <Sidebar>
      <SidebarHeader />
      <SidebarContent>
        <SidebarGroup className="space-y-4">
          <SidebarGroupLabel className="text-2xl font-bold">
            <Logo />
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map(item => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {session?.user.role === "ADMIN" && (
          <SidebarGroup className="space-y-4">
            <SidebarGroupLabel className="text-xl font-bold">Admin Dashboard</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map(item => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <a href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {(session?.user.role === "ADMIN" || session?.user.role === "MANAGER") && (
          <SidebarGroup className="space-y-4">
            <SidebarGroupLabel className="text-xl font-bold">Manager Dashboard</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {managerItems.map(item => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <a href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {(session?.user.role === "ADMIN" || session?.user.role === "MANAGER" || session?.user.role === "EDITOR") && (
          <SidebarGroup className="space-y-4">
            <SidebarGroupLabel className="text-xl font-bold">Editor Dashboard</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {editorItems.map(item => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <a href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {(session?.user.role === "ADMIN" || session?.user.role === "MANAGER" || session?.user.role === "SUPPORT") && (
          <SidebarGroup className="space-y-4">
            <SidebarGroupLabel className="text-xl font-bold">Support Dashboard</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {supportItems.map(item => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <a href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter>
        <DashboardThemeSwitcher />
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  <User2 /> {session?.user.name}
                  <ChevronUp className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" className="w-[--radix-popper-anchor-width]">
                <DropdownMenuItem asChild>
                  <a href="/auth/signout">
                    <LogOut />
                    <span>Sign out</span>
                  </a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
          Nextpress {packageInfo.version}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
