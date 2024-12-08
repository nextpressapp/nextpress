"use client";
import Link from "next/link";
import { useSession } from "next-auth/react";

import { ThemeSwitcher } from "@/components/theme-switcher";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

interface MenuItem {
  id: string;
  label: string;
  url: string;
  children: MenuItem[];
}

interface Menu {
  id: string;
  name: string;
  items: MenuItem[];
}

export function Header() {
  const { data: session, status } = useSession();
  const [menu, setMenu] = useState<Menu | null>(null);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await fetch("/api/menus/header");
        if (response.ok) {
          const data = await response.json();
          setMenu(data);
        }
      } catch (error) {
        console.error("Error fetching header menus:", error);
      }
    };

    fetchMenu();
  }, []);

  const renderMenuItem = (item: MenuItem) => {
    if (item.children.length > 0) {
      return (
        <DropdownMenu key={item.id}>
          <DropdownMenuTrigger className="flex items-center px-3 py-2 text-sm font-medium">
            {item.label}
            <ChevronDown className="ml-1 h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {item.children.map((child) => (
              <DropdownMenuItem key={child.id}>
                <Link href={child.url} className="w-full">
                  {child.label}
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }

    return (
      <Link
        key={item.id}
        href={item.url}
        className="px-3 py-2 text-sm font-medium"
      >
        <Button variant="outline" className="rounded">
          {item.label}
        </Button>
      </Link>
    );
  };

  return (
    <header className="py-4 border-b bg-gray-100 dark:bg-gray-800 ">
      <div className="container flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold">
          <Logo />
        </Link>
        <nav className="flex items-center space-x-4">
          {menu && menu.items.map(renderMenuItem)}
          <Link href="/blog" className="px-3 py-2 text-sm font-medium">
            <Button variant="outline" className="rounded">
              Blog
            </Button>
          </Link>
          <Link href="/events" className="px-3 py-2 text-sm font-medium">
            <Button variant="outline" className="rounded">
              Events
            </Button>
          </Link>
          <ThemeSwitcher />
          {status === "authenticated" && session?.user ? (
            <>
              <Link href="/dashboard">
                <Button variant="outline" className="rounded">
                  Dashboard
                </Button>
              </Link>
              <Link
                href="/auth/signout"
                className="px-3 py-2 text-sm font-medium"
              >
                <Button variant="outline" className="rounded">
                  Sign Out
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/auth/login">
                <Button variant="outline" className="rounded">
                  Log in
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button variant="outline" className="rounded">
                  Register
                </Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
