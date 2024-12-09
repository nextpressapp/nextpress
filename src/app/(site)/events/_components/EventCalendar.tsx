"use client";

import { useState, useEffect } from "react";
import moment from "moment";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { EventDetailsModal } from "@/app/(site)/events/_components/EventDetailsModal";

const localizer = momentLocalizer(moment);

interface Event {
  id: string;
  title: string;
  description: string;
  start: Date;
  end: Date;
  location?: string;
  allDay?: boolean;
}

export default function EventCalendar() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch("/api/events");
        if (response.ok) {
          const data = await response.json();
          const formattedEvents = data.map((event: any) => ({
            id: event.id,
            title: event.title,
            description: event.description,
            start: new Date(event.startDate),
            end: new Date(event.endDate),
            location: event.location,
            allDay: false,
          }));
          setEvents(formattedEvents);
        } else {
          console.error("Failed to fetch events");
        }
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };

    fetchEvents();
  }, []);

  const handleSelectEvent = (event: Event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  return (
    <div style={{ height: "500px" }}>
      <Calendar
        localizer={localizer}
        events={events}
        views={[Views.MONTH]}
        date={date}
        onNavigate={date => {
          setDate(new Date(date));
        }}
        startAccessor="start"
        endAccessor="end"
        style={{ height: "100%", color: "#000", backgroundColor: "#fff" }}
        onSelectEvent={handleSelectEvent}
      />
      <EventDetailsModal event={selectedEvent} isOpen={isModalOpen} onClose={handleCloseModal} />
    </div>
  );
}
