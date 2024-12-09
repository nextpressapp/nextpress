import { TicketForm } from "@/app/(dashboard)/dashboard/tickets/_components/TicketForm";

export default function TicketsCreatePage() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Create New Ticket</h2>
      <TicketForm />
    </div>
  );
}
