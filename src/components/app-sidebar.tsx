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
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

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
export function AppSidebar() {
  const { data: session } = useSession();

  if (!session) {
    redirect("/");
  }

  return (
    <Sidebar>
      <SidebarHeader />
      <SidebarContent>
        <SidebarGroup className="space-y-4">
          <SidebarGroupLabel className="text-2xl font-bold">
            NextPress
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
        <SidebarGroup />
      </SidebarContent>
      <SidebarFooter>
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
                {(session.user.role === "EDITOR" ||
                  session.user.role === "ADMIN") && (
                  <DropdownMenuItem asChild>
                    <a href="/editor">
                      <Book />
                      Editor Dashboard
                    </a>
                  </DropdownMenuItem>
                )}

                {(session.user.role === "SUPPORT" ||
                  session.user.role === "ADMIN") && (
                  <DropdownMenuItem asChild>
                    <a href="/support">
                      <BadgeHelp />
                      Support Dashboard
                    </a>
                  </DropdownMenuItem>
                )}

                {session.user.role === "ADMIN" && (
                  <DropdownMenuItem asChild>
                    <a href="/admin">
                      <Shield />
                      Admin Dashboard
                    </a>
                  </DropdownMenuItem>
                )}

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
