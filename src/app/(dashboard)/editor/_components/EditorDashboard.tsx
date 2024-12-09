"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, FileText, StickyNote } from "lucide-react";

export function EditorDashboard({ stats }: { stats: number[] }) {
  const cards = [
    { title: "Posts", value: stats[0], icon: StickyNote },
    { title: "Pages", value: stats[1], icon: FileText },
    { title: "Events", value: stats[2], icon: Calendar },
  ];

  return (
    <div>
      <h1 className="text-3xl font-semibold mb-8">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map((card, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
