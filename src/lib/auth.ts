import { db } from "@/db"
import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { nextCookies } from "better-auth/next-js"
import { admin, haveIBeenPwned, openAPI, twoFactor } from "better-auth/plugins"
import { sql } from "drizzle-orm"

import * as schema from "@/db/schema"
import { renderEmail } from "@/emails/lib/render=email"
import DeleteAccountVerificationEmail from "@/emails/templates/delete-account-verification-email"
import ResetPasswordEmail from "@/emails/templates/reset-password-email"
import VerificationEmail from "@/emails/templates/verification-email"
import { sendEmail } from "@/lib/email"
import { ac, roles } from "@/lib/permissions"

export const auth = betterAuth({
  appName: "NextPress",
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: schema,
  }),
  databaseHooks: {
    user: {
      create: {
        before: async (incomingUser) => {
          const [{ count }] = await db.select({ count: sql<number>`COUNT(*)` }).from(schema.user)
          if (Number(count) === 0) {
            return {
              data: {
                ...incomingUser,
                role: "admin",
              },
            }
          }
          return
        },
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    requireEmailVerification: true,
    resetPasswordTokenExpiresIn: 60 * 60,
    async sendResetPassword({ user, url }) {
      const html = await renderEmail(ResetPasswordEmail, { url })
      await sendEmail({ to: user.email, subject: "Reset your password", html })
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      const html = await renderEmail(VerificationEmail, { url, userEmail: user.email })
      await sendEmail({
        to: user.email,
        subject: "Verify your email address",
        html,
      })
    },
    sendOnSignIn: true,
    sendOnSignUp: true,
    autoSignInAfterVerification: false,
  },
  user: {
    changeEmail: {
      enabled: true,
      sendChangeEmailVerification: async ({ user, url }) => {
        const html = await renderEmail(VerificationEmail, { url, userEmail: user.email })
        await sendEmail({
          to: user.email,
          subject: "Approve email change",
          html,
        })
      },
    },
    deleteUser: {
      enabled: true,
      sendDeleteAccountVerification: async ({ user, url }) => {
        const html = await renderEmail(DeleteAccountVerificationEmail, {
          url,
          userEmail: user.email,
        })
        await sendEmail({
          to: user.email,
          subject: "Confirm account deletion",
          html,
        })
      },
    },
  },
  plugins: [
    admin({
      ac,
      roles: roles,
      defaultRole: "user",
      adminRoles: ["admin"],
    }),
    haveIBeenPwned({
      customPasswordCompromisedMessage: "Please choose a more secure password.",
    }),
    openAPI(),
    twoFactor(),
    nextCookies(),
  ],
  secret: process.env.BETTER_AUTH_SECRET,
})
