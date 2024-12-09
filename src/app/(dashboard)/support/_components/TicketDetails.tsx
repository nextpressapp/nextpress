"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TicketWithComments } from "@/types/ticket";
import { Status } from "@prisma/client";

interface TicketDetailsProps {
  ticket: TicketWithComments;
  onStatusChange: (ticketId: string, newStatus: Status) => void;
  onCommentAdd: (ticketId: string, content: string) => void;
}

export function TicketDetails({ ticket, onStatusChange, onCommentAdd }: TicketDetailsProps) {
  const [newComment, setNewComment] = useState("");

  const handleStatusChange = (newStatus: Status) => {
    onStatusChange(ticket.id, newStatus);
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      onCommentAdd(ticket.id, newComment);
      setNewComment("");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{ticket.title}</CardTitle>
        <div className="flex justify-between items-center mt-2">
          <Badge>{ticket.status}</Badge>
          <Select onValueChange={handleStatusChange} defaultValue={ticket.status}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Change status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="OPEN">Open</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="RESOLVED">Resolved</SelectItem>
              <SelectItem value="CLOSED">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <p className="mb-4">{ticket.description}</p>
        <h3 className="font-semibold mb-2">Comments</h3>
        <div className="space-y-2 mb-4">
          {ticket.comments.map(comment => (
            <div key={comment.id} className="bg-muted p-2 rounded">
              <p>{comment.content}</p>
              <p className="text-sm text-muted-foreground">
                By {comment.user.name} on {new Date(comment.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
        <form onSubmit={handleCommentSubmit}>
          <Textarea
            placeholder="Add a comment..."
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            className="mb-2"
          />
          <Button type="submit">Add Comment</Button>
        </form>
      </CardContent>
    </Card>
  );
}
