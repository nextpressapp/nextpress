import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import EventForm from "@/components/EventForm";

const prisma = new PrismaClient();

export default async function EditorEventsPage() {
  const session = await getServerSession(authOptions);

  if (
    !session ||
    (session.user.role !== "ADMIN" && session.user.role !== "EDITOR")
  ) {
    redirect("/");
  }

  const events = await prisma.event.findMany({
    where: {
      authorId: session.user.id,
    },
    orderBy: {
      startDate: "asc",
    },
  });

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Manage Events</h2>
      <EventForm />
      <ul>
        {events.map((event) => (
          <li key={event.id} className="mb-2">
            {event.title} - {event.published ? "Published" : "Draft"}
          </li>
        ))}
      </ul>
    </div>
  );
}
