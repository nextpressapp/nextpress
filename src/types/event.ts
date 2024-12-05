export interface Event {
    id?: string;
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    location: string;
    published: boolean;
    authorId?: string;
}

export interface CalendarEvent extends Event {
    start: Date;
    end: Date;
}

