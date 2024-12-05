import { PrismaClient } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Calendar } from "lucide-react";

const prisma = new PrismaClient();

export default async function EditorDashboard() {
  const stats = await prisma.$transaction([
    prisma.post.count(),
    prisma.page.count(),
    prisma.event.count(),
  ]);

  const cards = [
    { title: "Posts", value: stats[0], icon: FileText },
    { title: "Pages", value: stats[1], icon: FileText },
    { title: "Events", value: stats[2], icon: Calendar },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Editor Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {cards.map((card, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Recent Posts</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Here you can add a list or table of recent posts.</p>
        </CardContent>
      </Card>
    </div>
  );
}
