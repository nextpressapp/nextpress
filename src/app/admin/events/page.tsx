import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import {Button} from "@react-email/components";
import AdminEventList from "@/components/admin/AdminEventList";


export default async function AdminEventsPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    redirect("/");
  }

  return (
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Manage Events</h1>
          <Link legacyBehavior href="/events/create">
            <Button>Create New Event</Button>
          </Link>
        </div>
        <AdminEventList />
      </div>
  )

}
