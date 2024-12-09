import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import EventForm from "@/app/(dashboard)/editor/events/_components/EventForm";

export default async function EditEventPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session || !["ADMIN", "MANAGER", "EDITOR"].includes(session.user.role)) {
    redirect("/");
  }

  const event = await prisma.event.findUnique({
    where: { id: params.id },
  });

  if (!event) {
    redirect("/editor/events");
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Edit Event</h1>
      <EventForm event={event} />
    </div>
  );
}
