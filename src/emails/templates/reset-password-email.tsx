import { Section, Text } from "@react-email/components"

import { Layout } from "@/emails/components/layout"
import { PrimaryButton } from "@/emails/components/primary-button"
import { theme } from "@/emails/lib/theme"

export default function ResetPasswordEmail({ url }: { url: string }) {
  return (
    <Layout preview="Reset your password">
      <Section>
        <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: 600 }}>
          Reset your password
        </Text>
        <Text style={{ color: theme.colors.subtext }}>
          Click the button below to choose a new password.
        </Text>
        <PrimaryButton href={url}>Choose a new password</PrimaryButton>
        <Text style={{ color: theme.colors.subtext, marginTop: 14 }}>
          If you didn’t request this, you can ignore this email.
        </Text>
      </Section>
    </Layout>
  )
}
