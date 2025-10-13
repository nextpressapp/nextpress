import { Hr, Link, Section, Text } from "@react-email/components"

import { Layout } from "@/emails/components/layout"
import { PrimaryButton } from "@/emails/components/primary-button"
import { theme } from "@/emails/lib/theme"

export interface VerificationEmailProps {
  url: string
  userEmail: string
}

export default function VerificationEmail({ url, userEmail }: VerificationEmailProps) {
  return (
    <Layout preview="Verify your email address">
      <Section>
        <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: 600 }}>
          Verify your email
        </Text>
        <Text style={{ color: theme.colors.subtext }}>
          Hi, we just need to confirm that{" "}
          <strong style={{ color: theme.colors.text }}>{userEmail}</strong> belongs to you.
        </Text>
        <PrimaryButton href={url}>Verify email</PrimaryButton>
        <Text style={{ color: theme.colors.subtext, marginTop: 14 }}>
          Or paste this link into your browser:
          <br />
          <Link href={url} style={{ color: theme.colors.primary }}>
            {url}
          </Link>
        </Text>
        <Hr style={{ borderColor: theme.colors.border, margin: "20px 0" }} />
        <Text style={{ color: theme.colors.muted, fontSize: 12 }}>
          This link expires soon. If it doesn’t work, request a new one from the sign‑in page.
        </Text>
      </Section>
    </Layout>
  )
}
