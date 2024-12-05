import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import MenuManager from "@/components/MenuManager"
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

export default async function AdminSettings() {
  const session = await getServerSession(authOptions)
  const isAdmin = session?.user.role === 'ADMIN'

  return (
      <div>
        <h1 className="text-3xl font-bold mb-8">Admin Settings</h1>
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Site Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div>
                <Label htmlFor="siteName">Site Name</Label>
                <Input id="siteName" defaultValue="NextPress" />
              </div>
              <div>
                <Label htmlFor="siteDescription">Site Description</Label>
                <Input id="siteDescription" defaultValue="A WordPress clone built with Next.js" />
              </div>
              <Button type="submit">Save Changes</Button>
            </form>
          </CardContent>
        </Card>
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Menu Management</CardTitle>
          </CardHeader>
          <CardContent>
            <MenuManager isAdmin={isAdmin} />
          </CardContent>
        </Card>
      </div>
  )
}

