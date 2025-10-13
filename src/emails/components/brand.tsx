import { Img, Link } from "@react-email/components"

import { theme } from "@/emails/lib/theme"

export function Brand() {
  return (
    <Link href={theme.brand.url} style={{ textDecoration: "none" }}>
      <Img
        src={theme.brand.logo.src}
        alt={theme.brand.logo.alt}
        width={theme.brand.logo.width}
        height={theme.brand.logo.height}
        style={{ display: "block" }}
      />
    </Link>
  )
}
