import { Hr, Link, Section, Text } from "@react-email/components"

import { Layout } from "@/emails/components/layout"
import { PrimaryButton } from "@/emails/components/primary-button"
import { theme } from "@/emails/lib/theme"

export interface DeleteAccountVerificationEmailProps {
  url: string
  userEmail: string
}

export default function DeleteAccountVerificationEmail({
  url,
  userEmail,
}: DeleteAccountVerificationEmailProps) {
  // Subtle "danger" callout using inline colors to avoid adding new tokens
  const dangerBg = "#FEF2F2" // red-50
  const dangerText = "#991B1B" // red-800
  const dangerBorder = "#FECACA" // red-200

  return (
    <Layout preview="Confirm account deletion">
      <Section
        style={{
          backgroundColor: dangerBg,
          border: `1px solid ${dangerBorder}`,
          borderRadius: 8,
          padding: 16,
          marginBottom: 16,
        }}
      >
        <Text style={{ color: dangerText, fontSize: 16, fontWeight: 600, margin: 0 }}>
          You’re about to delete your account
        </Text>
        <Text style={{ color: dangerText, marginTop: 6 }}>
          Deleting your account will permanently remove your profile, settings, and data. This
          action cannot be undone.
        </Text>
      </Section>

      <Section>
        <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: 600 }}>
          Confirm account deletion
        </Text>

        <Text style={{ color: theme.colors.subtext }}>
          Hi, to confirm that <strong style={{ color: theme.colors.text }}>{userEmail}</strong> is
          requesting to delete their account, please click the button below.
        </Text>

        <PrimaryButton href={url}>Confirm account deletion</PrimaryButton>

        <Text style={{ color: theme.colors.subtext, marginTop: 14 }}>
          Or paste this link into your browser:
          <br />
          <Link href={url} style={{ color: theme.colors.primary }}>
            {url}
          </Link>
        </Text>

        <Hr style={{ borderColor: theme.colors.border, margin: "20px 0" }} />

        <Text style={{ color: theme.colors.muted, fontSize: 12 }}>
          This link expires soon. If you didn’t request this, you can safely ignore this email —
          your account won’t be deleted.
        </Text>
      </Section>
    </Layout>
  )
}
