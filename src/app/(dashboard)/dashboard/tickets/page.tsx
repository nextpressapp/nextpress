import { db } from "@/db"

export default async function TicketsPage() {
  const [rows] = await db.query.tickets.findMany({
    orderBy: (t, { desc }) => [desc(t.createdAt)],
    with: {
      comments: {
        with: {
          author: true,
        },
        orderBy: (c, { desc }) => [desc(c.createdAt)],
      },
    },
  })

  return (
    <div>
      <pre>{JSON.stringify(rows, null, 2)}</pre>
    </div>
  )
}
