import { Ticket, Comment, User, Status, Priority } from "@prisma/client";

export interface TicketWithComments extends Omit<Ticket, "status" | "priority"> {
  status: Status;
  priority: Priority;
  comments: (Comment & { user: User })[];
  createdBy: User;
}
