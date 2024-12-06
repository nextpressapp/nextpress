"use client";

import { Bell, User } from "lucide-react";
import { ThemeSwitcher } from "@/components/theme-switcher";

export function Header() {
    return (
        <header className="bg-background border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center py-4">
                    <h1 className="text-2xl font-semibold text-foreground">Support</h1>
                    <div className="flex items-center space-x-4">
                        <ThemeSwitcher />
                    </div>
                </div>
            </div>
        </header>
    );
}