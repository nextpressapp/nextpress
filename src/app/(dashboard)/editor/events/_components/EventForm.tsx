"use client";

import { FormEvent, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import MDEditor from "@uiw/react-md-editor";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface EventFormProps {
  event?: {
    id: string;
    title: string;
    description: string;
    startDate: Date;
    endDate: Date;
    location: string | null;
    published: boolean;
    authorId: string;
  };
}

export default function EventForm({ event }: EventFormProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [title, setTitle] = useState(event?.title || "");
  const [description, setDescription] = useState(event?.description || "");
  const [startDate, setStartDate] = useState(event?.startDate ? formatDateForInput(event.startDate) : "");
  const [endDate, setEndDate] = useState(event?.endDate ? formatDateForInput(event.endDate) : "");
  const [location, setLocation] = useState(event?.location || "");
  const [published, setPublished] = useState(event?.published || false);

  function formatDateForInput(date: Date): string {
    return date.toISOString().slice(0, 16);
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const url = event ? `/api/editor/events/${event.id}` : "/api/editor/events";
      const method = event ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          startDate: new Date(startDate).toISOString(),
          endDate: new Date(endDate).toISOString(),
          location,
          published,
        }),
      });

      if (response.ok) {
        toast({
          title: event ? "Event updated" : "Event created",
          description: event
            ? "Your event has been updated successfully."
            : "Your event has been created successfully.",
        });
        router.push("/editor/events");
      } else {
        const data = await response.json();
        toast({
          title: "Error",
          description: data.error || "An error occurred while saving the event.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Event save error:", error);
      toast({
        title: "Error",
        description: "An error occurred while saving the event.",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input id="title" value={title} onChange={e => setTitle(e.target.value)} />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <MDEditor value={description} onChange={value => setDescription(value || "")} />
      </div>
      <div>
        <Label htmlFor="startDate">Start Date</Label>
        <Input
          id="startDate"
          type="datetime-local"
          value={startDate}
          onChange={e => setStartDate(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="endDate">End Date</Label>
        <Input id="endDate" type="datetime-local" value={endDate} onChange={e => setEndDate(e.target.value)} required />
      </div>
      <div>
        <Label htmlFor="location">Location</Label>
        <Input id="location" value={location} onChange={e => setLocation(e.target.value)} />
      </div>
      <div className="flex items-center space-x-2">
        <Switch id="published" checked={published} onCheckedChange={setPublished} />
        <Label htmlFor="published">Published</Label>
      </div>
      <Button type="submit">{event ? "Update" : "Create"} Event</Button>
    </form>
  );
}
