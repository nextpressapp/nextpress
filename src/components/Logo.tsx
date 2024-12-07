"use client";

import { Blocks } from "lucide-react";
import { useEffect, useState } from "react";
import { SiteSettings } from "@/app/(dashboard)/manager/settings/page";

async function getSiteSettings() {
  const res = await fetch("/api/admin/settings", { cache: "no-store" });
  return res.json();
}

export const Logo = () => {
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
    <div className={`flex flex-row items-center justify-center px-5`}>
      <div className="me-2 flex h-[40px] items-center justify-center rounded-md bg-zinc-950 text-white dark:bg-white dark:text-zinc-950">
        <Blocks className="h-10 w-10" />
      </div>
      <h5 className="text-foreground text-2xl font-bold leading-5 dark:text-white">
        {settings?.siteName}
      </h5>
    </div>
  );
};
