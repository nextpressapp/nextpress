"use client"

import { useState } from "react"
import Link from "next/link"
import packageInfo from "@/../package.json"

interface MenuItem {
  id: string
  label: string
  url: string
}

interface Menu {
  id: string
  name: string
  items: MenuItem[]
}

export const Footer = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [footerMenus, setFooterMenus] = useState<Menu[]>([])

  return (
    <footer className="bg-gray-100 py-8 dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div>
            <h3 className="mb-4 text-lg font-semibold">About NextPress</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              NextPress is a modern, flexible CMS built with Next.js, offering powerful content
              management capabilities for your website.
            </p>
          </div>
          {footerMenus.map((menu) => (
            <div key={menu.id}>
              <h3 className="mb-4 text-lg font-semibold">{menu.name}</h3>
              <ul className="space-y-2">
                {menu.items.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={item.url}
                      className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-8 items-center justify-center border-t border-gray-200 pt-8 dark:border-gray-700">
          <p className="text-center text-sm text-gray-600 dark:text-gray-300">
            © {new Date().getFullYear()} NextPress {packageInfo.version}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
