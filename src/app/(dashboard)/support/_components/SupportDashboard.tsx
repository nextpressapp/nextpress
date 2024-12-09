import { Ticket } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SupportDashboardProps {
  tickets: Ticket[];
}

export function SupportDashboard({ tickets }: SupportDashboardProps) {
  const openTickets = tickets.filter(ticket => ticket.status === "OPEN").length;
  const inProgressTickets = tickets.filter(ticket => ticket.status === "IN_PROGRESS").length;
  const closedTickets = tickets.filter(ticket => ticket.status === "CLOSED").length;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{openTickets}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">In Progress Tickets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{inProgressTickets}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Closed Tickets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{closedTickets}</div>
        </CardContent>
      </Card>
    </div>
  );
}
