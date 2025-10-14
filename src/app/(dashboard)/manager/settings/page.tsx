import { db } from "@/db"
import { siteSettings } from "@/db/schema"
import { SettingsForm } from "@/components/manager/settings-form"

export default async function SettingsPage() {
  const settings = await db.select().from(siteSettings).limit(1)
  const first = settings[0] ?? null

  return (
    <div>
      <SettingsForm settings={first ?? undefined} />
    </div>
  )
}
