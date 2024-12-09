import { Comment } from "@prisma/client";
import { TicketWithComments } from "@/types/ticket";

export interface DashboardData {
  tickets: TicketWithComments[];
  comments: Comment[];
}
