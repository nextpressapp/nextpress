"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Laptop, Moon, Sun } from "lucide-react";

export function DashboardThemeSwitcher() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="flex items-center space-x-2 px-3 py-2">
      <button
        onClick={() => setTheme("light")}
        className={`p-2 rounded-md ${theme === "light" ? "bg-gray-200 text-gray-800" : "text-gray-400"}`}
        aria-label="Switch to light theme"
      >
        <Sun size={16} />
      </button>
      <button
        onClick={() => setTheme("dark")}
        className={`p-2 rounded-md ${theme === "dark" ? "bg-gray-700 text-gray-200" : "text-gray-600"}`}
        aria-label="Switch to dark theme"
      >
        <Moon size={16} />
      </button>
      <button
        onClick={() => setTheme("system")}
        className={`p-2 rounded-md ${theme === "system" ? "bg-gray-200 text-gray-800" : "text-gray-600"}`}
        aria-label="Switch to system theme"
      >
        <Laptop size={16} />
      </button>
    </div>
  );
}
