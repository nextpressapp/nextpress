import {getServerSession} from "next-auth";
import {authOptions} from "@/lib/auth";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import MenuManager from "@/app/(dashboard)/manager/menus/_components/MenuManager";

export default async function MenuManagerPage() {
  const session = await getServerSession(authOptions);
    const isAdmin = session?.user.role === 'ADMIN' || session?.user.role === 'MANAGER';

  return (
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Menu Management</CardTitle>
        </CardHeader>
        <CardContent>
          <MenuManager isAdmin={isAdmin} />
        </CardContent>
      </Card>
  )
}