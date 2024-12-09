import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import MDEditor from "@uiw/react-md-editor";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";

interface EventDetailsModalProps {
  event: {
    id: string;
    title: string;
    description: string;
    start: Date;
    end: Date;
    location?: string;
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EventDetailsModal({ event, isOpen, onClose }: EventDetailsModalProps) {
  if (!event) return null;
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{event.title}</DialogTitle>
          <DialogDescription>
            {format(event.start, "PPP HH:mm")} - {format(event.end, "PPP HH:mm")}
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <MDEditor.Markdown source={event.description} />
          {event.location && (
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              <strong>Location:</strong> {event.location}
            </p>
          )}
        </div>
        <div className="mt-6 flex justify-end">
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
