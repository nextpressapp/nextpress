"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export function TicketForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, priority }), // Replace with actual user ID
      });
      if (response.ok) {
        toast({ title: "Successfully created ticket" });

        router.push("/dashboard/tickets");
      } else {
        toast({ title: "Error Creating Ticket", variant: "destructive" });
      }
    } catch (error) {
      console.error("Error Creating Ticket:", error);
      toast({ title: "Error creating ticket", variant: "destructive" });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input placeholder="Ticket Title" value={title} onChange={e => setTitle(e.target.value)} required />
      <Textarea
        placeholder="Ticket Description"
        value={description}
        onChange={e => setDescription(e.target.value)}
        required
      />
      <Select onValueChange={setPriority} defaultValue={priority}>
        <SelectTrigger>
          <SelectValue placeholder="Select Priority" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="LOW">Low</SelectItem>
          <SelectItem value="MEDIUM">Medium</SelectItem>
          <SelectItem value="HIGH">High</SelectItem>
          <SelectItem value="URGENT">Urgent</SelectItem>
        </SelectContent>
      </Select>
      <Button type="submit">Submit Ticket</Button>
    </form>
  );
}
