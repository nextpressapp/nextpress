import { db } from "@/db"
import { HeaderClient } from "@/components/site/header-client"

export async function Header() {
  const settings = await db.query.siteSettings.findFirst()
  const siteName = settings?.siteName ?? "NextPress"

  return <HeaderClient siteName={siteName} />
}
