import { ReactNode } from "react"
import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components"

import { Brand } from "@/emails/components/brand"
import { theme } from "@/emails/lib/theme"

export function Layout({ preview, children }: { preview: string; children: ReactNode }) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={{ margin: 0, background: theme.colors.bg, fontFamily: theme.fontFamily }}>
        <Container
          style={{
            width: "100%",
            maxWidth: 600,
            margin: "0 auto",
            background: theme.colors.card,
            borderRadius: theme.radii.card,
            border: `1px solid ${theme.colors.border}`,
            padding: 24,
          }}
        >
          <Section style={{ paddingBottom: 12 }}>
            <Brand />
          </Section>

          <Section>{children}</Section>

          <Hr style={{ borderColor: theme.colors.border, margin: "24px 0" }} />

          <Section>
            <Text style={{ color: theme.colors.subtext, fontSize: 12, lineHeight: "18px" }}>
              You received this email because you have an account with {theme.brand.name}. If you
              didn’t request this, you can safely ignore this email.
            </Text>
            <Text style={{ color: theme.colors.muted, fontSize: 12, marginTop: 8 }}>
              Need help? <Link href={`mailto:${theme.brand.supportEmail}`}>Contact support</Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}
