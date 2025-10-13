import { ReactNode } from "react"
import { Button } from "@react-email/components"

import { theme } from "@/emails/lib/theme"

export function PrimaryButton({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Button
      href={href}
      style={{
        background: theme.colors.primary,
        color: theme.colors.primaryText,
        borderRadius: theme.radii.button,
        padding: "12px 18px",
        fontWeight: 600,
        textDecoration: "none",
        display: "inline-block",
      }}
    >
      {children}
    </Button>
  )
}
