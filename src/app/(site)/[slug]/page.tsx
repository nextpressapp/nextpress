import { Metadata } from "next"
import { unstable_cache as cache } from "next/cache"
import dynamic from "next/dynamic"

import { db } from "@/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// load client viewer only on the client so styles/extensions match preview
const ClientTipTapViewer = dynamic(
  () => import("@/components/editor/tip-tap-viewer").then((m) => m.TipTapViewer),
  { ssr: true }
)

const getPage = cache(
  async (slug: string) => {
    return db.query.pages.findFirst({ where: (p, { eq }) => eq(p.slug, slug) })
  },
  ["page-by-slug"],
  { tags: ["pages"] }
)

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const page = await getPage(slug)
  if (!page) return {}
  return { title: page.title, description: page.description }
}

export default async function PageContent({ params }: { params: { slug: string } }) {
  const page = await getPage(params.slug)
  if (!page) return <div className="container mx-auto py-8">Not found</div>

  let json: any = { type: "doc", content: [{ type: "paragraph" }] }
  try {
    json = page.content ? JSON.parse(page.content) : json
  } catch {
    // keep default
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">{page.title}</CardTitle>
          <p className="text-muted-foreground text-sm">
            Last updated on {new Date(page.updatedAt).toLocaleDateString()}
          </p>
        </CardHeader>
        <CardContent>
          <ClientTipTapViewer json={json} />
        </CardContent>
      </Card>
    </div>
  )
}
