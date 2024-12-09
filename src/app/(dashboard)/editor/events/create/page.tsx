import EventForm from "@/app/(dashboard)/editor/events/_components/EventForm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function CreateEventPage() {
  const session = await getServerSession(authOptions);

  if (!session || !["ADMIN", "MANAGER", "EDITOR"].includes(session.user.role)) {
    redirect("/");
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Create New Event</h1>
      <EventForm />
    </div>
  );
}
