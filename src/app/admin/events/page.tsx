import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function AdminEventsPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const events = await prisma.event.findMany({
    include: { author: { select: { name: true } } },
  });

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Manage Events</h2>
      <ul>
        {events.map((event) => (
          <li key={event.id} className="mb-2">
            {event.title} by {event.author.name} -{" "}
            {event.published ? "Published" : "Draft"}
          </li>
        ))}
      </ul>
    </div>
  );
}
