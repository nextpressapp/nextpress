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
  LogOut, Menu,
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
import { useEffect, useState } from "react";
import { SiteSettings } from "@/app/(dashboard)/manager/settings/page";

async function getSiteSettings() {
  const res = await fetch("/api/manager/settings", { cache: "no-store" });
  return res.json();
}

const items = [
  {
    title: "Home",
    url: "/",
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
    icon: Menu
  }
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
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getSiteSettings();
        setSettings(result);
      } catch (error) {
        console.error("Error etching data:", error);
      }
    };
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
          session?.user.role === "MANAGER") && (
          <SidebarGroup className="space-y-4">
            <SidebarGroupLabel className="text-xl font-bold">
              Manager Dashboard
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {managerItems.map((item) => (
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
          session?.user.role === "MANAGER" ||
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
          session?.user.role === "MANAGER" ||
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
