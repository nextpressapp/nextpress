"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { version } from "@/../package.json";
interface MenuItem {
    id: string;
    label: string;
    url: string;
}

interface Menu {
    id: string;
    name: string;
    items: MenuItem[];
}

export function Footer() {
    const [footerMenus, setFooterMenus] = useState<Menu[]>([]);

    useEffect(() => {
        const fetchFooterMenus = async () => {
            try {
                const response = await fetch("/api/menus/footer");
                if (response.ok) {
                    const data = await response.json();
                    setFooterMenus(data);
                }
            } catch (error) {
                console.error("Error fetching footer menus:", error);
            }
        };

        fetchFooterMenus();
    }, []);

    return (
        <footer className="bg-gray-100 dark:bg-gray-800 py-8">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div>
                        <h3 className="text-lg font-semibold mb-4">
                            About NextPress
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                            NextPress is a modern, flexible CMS built with
                            Next.js, offering powerful content management
                            capabilities for your website.
                        </p>
                    </div>
                    {footerMenus.map(menu => (
                        <div key={menu.id}>
                            <h3 className="text-lg font-semibold mb-4">
                                {menu.name}
                            </h3>
                            <ul className="space-y-2">
                                {menu.items.map(item => (
                                    <li key={item.id}>
                                        <Link
                                            href={item.url}
                                            className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
                                        >
                                            {item.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
                <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700 items-center justify-center">
                    <p className="text-sm text-center text-gray-600 dark:text-gray-300">
                        © {new Date().getFullYear()} NextPress {version}. All
                        rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
