import { prisma } from "@/lib/prisma";
import { TicketList } from "@/app/(dashboard)/dashboard/tickets/_components/TicketList";
import { TicketWithComments } from "@/types/ticket";

export default async function TicketsPage() {
  const tickets = await prisma.ticket.findMany({
    include: {
      comments: {
        include: { user: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Manage Tickets</h1>
      <TicketList initialTickets={tickets as TicketWithComments[]} />
    </div>
  );
}
