"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DateRange } from "react-day-picker";
import { DashboardData } from "@/types/dashboard";
import { DateRangePicker } from "@/app/(dashboard)/support/_components/DateRangePicker";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { TicketDetails } from "@/app/(dashboard)/support/_components/TicketDetails";
import { Status } from "@prisma/client";
import { TicketWithComments } from "@/types/ticket";

export function SupportDashboard() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().setDate(new Date().getDate() - 7)),
    to: new Date(),
  });
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const response = await fetch(
        `/api/support?from=${dateRange?.from?.toISOString()}&to=${dateRange?.to?.toISOString()}`
      );
      const data = await response.json();
      setDashboardData(data);
    };

    fetchDashboardData();
  }, [dateRange]);

  const handleStatusChange = async (ticketId: string, newStatus: Status) => {
    const response = await fetch(`/api/tickets/${ticketId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });

    if (response.ok) {
      // Update the local state
      setDashboardData(prevData => {
        if (!prevData) return null;
        return {
          ...prevData,
          tickets: prevData.tickets.map(ticket => (ticket.id === ticketId ? { ...ticket, status: newStatus } : ticket)),
        };
      });
    }
  };

  const handleCommentAdd = async (ticketId: string, content: string) => {
    const response = await fetch(`/api/tickets/${ticketId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });

    if (response.ok) {
      const newComment = await response.json();
      // Update the local state
      setDashboardData(prevData => {
        if (!prevData) return null;
        return {
          ...prevData,
          tickets: prevData.tickets.map((ticket: TicketWithComments) =>
            ticket.id === ticketId ? { ...ticket, comments: [newComment, ...ticket.comments] } : ticket
          ),
        };
      });
    }
  };

  if (!dashboardData) return <div>Loading...</div>;

  const { tickets, comments } = dashboardData;

  const openTickets = tickets.filter(ticket => ticket.status === "OPEN").length;
  const inProgressTickets = tickets.filter(ticket => ticket.status === "IN_PROGRESS").length;
  const closedTickets = tickets.filter(ticket => ticket.status === "CLOSED").length;
  const resolvedTickets = tickets.filter(ticket => ticket.status === "RESOLVED").length;

  const ticketsOpenedInRange = tickets.filter(
    ticket =>
      new Date(ticket.createdAt) >= (dateRange?.from || new Date()) &&
      new Date(ticket.createdAt) <= (dateRange?.to || new Date())
  ).length;

  const ticketsClosedInRange = tickets.filter(
    ticket =>
      ticket.status === "CLOSED" &&
      new Date(ticket.updatedAt) >= (dateRange?.from || new Date()) &&
      new Date(ticket.updatedAt) <= (dateRange?.to || new Date())
  ).length;

  const commentsAddedInRange = comments.filter(
    comment =>
      new Date(comment.createdAt) >= (dateRange?.from || new Date()) &&
      new Date(comment.createdAt) <= (dateRange?.to || new Date())
  ).length;

  const averageResolutionTime =
    tickets
      .filter(ticket => ticket.status === "RESOLVED")
      .reduce((acc, ticket) => {
        const createdAt = new Date(ticket.createdAt);
        const updatedAt = new Date(ticket.updatedAt);
        return acc + (updatedAt.getTime() - createdAt.getTime());
      }, 0) /
    resolvedTickets /
    (1000 * 60 * 60); // Convert to hours

  const averageCloseTime =
    tickets
      .filter(ticket => ticket.status === "CLOSED")
      .reduce((acc, ticket) => {
        const createdAt = new Date(ticket.createdAt);
        const updatedAt = new Date(ticket.updatedAt);
        return acc + (updatedAt.getTime() - createdAt.getTime());
      }, 0) /
    closedTickets /
    (1000 * 60 * 60); // Convert to hours

  const chartData = [
    { name: "Open", tickets: openTickets },
    { name: "In Progress", tickets: inProgressTickets },
    { name: "Resolved", tickets: resolvedTickets },
    { name: "Closed", tickets: closedTickets },
  ];

  const selectedTicket = tickets.find(ticket => ticket.id === selectedTicketId);

  return (
    <div className="space-y-4">
      <DateRangePicker onRangeChange={setDateRange} />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
            <CardTitle className="text-sm font-medium">Resolved Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resolvedTickets}</div>
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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tickets Opened in Range</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ticketsOpenedInRange}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tickets Closed in Range</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ticketsClosedInRange}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Comments Added in Range</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{commentsAddedInRange}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Resolution Time (hours)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageResolutionTime.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Closed Time (hours)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageCloseTime.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Ticket Status Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="tickets" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Recent Tickets</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {tickets.slice(0, 5).map(ticket => (
              <li
                key={ticket.id}
                className="cursor-pointer hover:bg-muted p-2 rounded"
                onClick={() => setSelectedTicketId(ticket.id)}
              >
                {ticket.title} - {ticket.status}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
      {selectedTicket && (
        <TicketDetails ticket={selectedTicket} onStatusChange={handleStatusChange} onCommentAdd={handleCommentAdd} />
      )}
    </div>
  );
}
