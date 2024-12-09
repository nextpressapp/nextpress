"use client";
import { useState } from "react";
import { Status } from "@prisma/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { CommentForm } from "./CommentForm";
import Link from "next/link";
import { TicketWithComments } from "@/types/ticket";

interface TicketListProps {
  initialTickets: TicketWithComments[];
}

export function TicketList({ initialTickets }: TicketListProps) {
  const [tickets, setTickets] = useState<TicketWithComments[]>(initialTickets);

  const updateTicketStatus = async (id: string, newStatus: Status) => {
    const response = await fetch(`/api/tickets/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (response.ok) {
      setTickets(tickets.map(ticket => (ticket.id === id ? { ...ticket, status: newStatus } : ticket)));
    }
  };

  const addComment = async (ticketId: string, content: string) => {
    const response = await fetch(`/api/tickets/${ticketId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, userId: "user_id_here" }), // Replace with actual user ID
    });
    if (response.ok) {
      const newComment = await response.json();
      setTickets(
        tickets.map(ticket =>
          ticket.id === ticketId ? { ...ticket, comments: [newComment, ...ticket.comments] } : ticket
        )
      );
    }
  };

  return (
    <div>
      <Link href="/dashboard/tickets/create">
        <Button className="mb-4">Create New Ticket</Button>
      </Link>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Actions</TableHead>
            <TableHead>Comments</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tickets.map(ticket => (
            <TableRow key={ticket.id}>
              <TableCell>{ticket.title}</TableCell>
              <TableCell>
                <Badge>{ticket.status}</Badge>
              </TableCell>
              <TableCell>
                <Badge variant={ticket.priority === "HIGH" ? "destructive" : "default"}>{ticket.priority}</Badge>
              </TableCell>
              <TableCell>
                {ticket.status === "OPEN" && (
                  <Button onClick={() => updateTicketStatus(ticket.id, "IN_PROGRESS")}>Start Progress</Button>
                )}
                {ticket.status === "IN_PROGRESS" && (
                  <Button onClick={() => updateTicketStatus(ticket.id, "CLOSED")}>Close Ticket</Button>
                )}
              </TableCell>
              <TableCell>
                <Accordion type="single" collapsible>
                  <AccordionItem value="comments">
                    <AccordionTrigger>Comments ({ticket.comments.length})</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        <CommentForm onSubmit={content => addComment(ticket.id, content)} />
                        {ticket.comments.map(comment => (
                          <div key={comment.id} className="bg-gray-100 p-2 rounded">
                            <p>{comment.content}</p>
                            <p className="text-sm text-gray-500">
                              By {comment.user.name} on {new Date(comment.createdAt).toLocaleString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
