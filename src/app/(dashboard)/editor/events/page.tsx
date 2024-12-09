import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import EventList from "@/app/(dashboard)/editor/events/_components/EventList";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function EditorEventsPage() {
  const session = await getServerSession(authOptions);

  if (!session || !["ADMIN", "MANAGER", "EDITOR"].includes(session.user.role)) {
    redirect("/");
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Manage Events</h2>
      <Link href="/editor/events/create">
        <Button>Create New Event</Button>
      </Link>
      <EventList />
    </div>
  );
}
