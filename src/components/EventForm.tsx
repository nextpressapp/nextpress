'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'

interface Event {
  id?: string
  title: string
  description: string
  startDate: string
  endDate: string
  location: string
  published: boolean
}

interface EventFormProps {
  event?: Event
  onSubmit: (event: Event) => void
}

export default function EventForm({ event, onSubmit }: EventFormProps) {
  const [title, setTitle] = useState(event?.title || '')
  const [description, setDescription] = useState(event?.description || '')
  const [startDate, setStartDate] = useState(event?.startDate || '')
  const [endDate, setEndDate] = useState(event?.endDate || '')
  const [location, setLocation] = useState(event?.location || '')
  const [published, setPublished] = useState(event?.published || false)
  //const router = useRouter() //removed

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const eventData = {
      id: event?.id,
      title,
      description,
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      location,
      published
    }
    onSubmit(eventData)
  }

  return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
          />
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={5}
          />
        </div>
        <div>
          <Label htmlFor="startDate">Start Date</Label>
          <Input
              id="startDate"
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
          />
        </div>
        <div>
          <Label htmlFor="endDate">End Date</Label>
          <Input
              id="endDate"
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
          />
        </div>
        <div>
          <Label htmlFor="location">Location</Label>
          <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-2">
          <Switch
              id="published"
              checked={published}
              onCheckedChange={setPublished}
          />
          <Label htmlFor="published">Published</Label>
        </div>
        <Button type="submit">{event ? 'Update' : 'Create'} Event</Button>
      </form>
  )
}

