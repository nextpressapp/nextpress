import { prisma } from "@/lib/prisma";
import { SupportDashboard } from "@/app/(dashboard)/support/_components/SupportDashboard";

export default async function SupportPage() {
  const tickets = await prisma.ticket.findMany();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Support Dashboard</h1>
      <SupportDashboard tickets={tickets} />
    </div>
  );
}
