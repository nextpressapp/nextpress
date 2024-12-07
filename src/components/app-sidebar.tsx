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
  ChevronUp,
  Home,
  LifeBuoy,
  LogOut,
  Settings,
  Shield,
  User2,
  UserPen,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DashboardThemeSwitcher } from "@/app/(dashboard)/dashboard/_components/DashboardThemeSwitcher";
import { Session } from "next-auth";
import {useEffect, useState} from "react";

async function getSiteSettings() {
  const res = await fetch('/api/admin/settings', { cache: 'no-store' })
  return res.json()
}

const items = [
  {
    title: "Home",
    url: "/dashboard",
    icon: Home,
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
  {
    title: "Site Settings",
    url: "/admin/settings",
    icon: Settings,
  },
];

const editorItems = [
  {
    title: "Dashboard",
    url: "/editor",
    icon: Book,
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
  const [settings, setSettings] = useState();
  useEffect(() => {
    const fetchData = async() => {
      try {
        const result = await getSiteSettings();
        setSettings(result);
      } catch (error) {
        console.error('Error etching data:', error);
      }
    }
    fetchData();
  }, [setSettings]);

  return (
    <Sidebar>
      <SidebarHeader />
      <SidebarContent>
        <SidebarGroup className="space-y-4">
          <SidebarGroupLabel className="text-2xl font-bold">
            {settings?.siteName}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
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
            <SidebarGroupLabel className="text-xl font-bold">
              Admin Dashboard
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map((item) => (
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

        {(session?.user.role === "ADMIN" ||
          session?.user.role === "EDITOR") && (
          <SidebarGroup className="space-y-4">
            <SidebarGroupLabel className="text-xl font-bold">
              Editor Dashboard
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {editorItems.map((item) => (
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

        {(session?.user.role === "ADMIN" ||
          session?.user.role === "SUPPORT") && (
          <SidebarGroup className="space-y-4">
            <SidebarGroupLabel className="text-xl font-bold">
              Support Dashboard
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {supportItems.map((item) => (
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
              <DropdownMenuContent
                side="top"
                className="w-[--radix-popper-anchor-width]"
              >
                <DropdownMenuItem asChild>
                  <a href="/dashboard/profile">
                    <UserPen />
                    Profile
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a href="/auth/signout">
                    <LogOut />
                    <span>Sign out</span>
                  </a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
