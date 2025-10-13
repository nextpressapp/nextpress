import nodemailer, { type TransportOptions } from "nodemailer"

function boolFromEnv(v: string | undefined, def = false) {
  if (v == null) return def
  return ["1", "true", "yes", "on"].includes(v.toLowerCase())
}

const isDev = process.env.NODE_ENV !== "production"
const host = process.env.SMTP_HOST || "localhost"
const port = Number(process.env.SMTP_PORT || (isDev ? 1025 : 587))
const secure = boolFromEnv(process.env.SMTP_SECURE, false) // true for 465, false otherwise

const transportOpts: TransportOptions = {
  host,
  port,
  secure,
  ...(process.env.SMTP_USER && process.env.SMTP_PASSWORD
    ? {
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      }
    : {}),
  ...(isDev ? { ignoreTLS: true, tls: { rejectUnauthorized: false } } : {}),
  // @ts-expect-error TS2353
  debug: isDev,
}

const transporter = nodemailer.createTransport(transportOpts)

async function ensureTransportReady() {
  try {
    await transporter.verify()
    if (isDev) {
      console.log(
        // @ts-expect-error TS7053
        `[mail] transport verified: ${host}:${port} secure=${secure} auth=${!!transportOpts["auth"]}`
      )
    }
  } catch (err) {
    console.error("[mail] transport verify failed:", err)
    throw err
  }
}

export interface EmailOptions {
  to: string | string[]
  subject: string
  html: string
  from?: string
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  const fromEmail = options.from || process.env.EMAIL_FROM || "noreply@blackstone-security.com"

  await ensureTransportReady()

  try {
    const info = await transporter.sendMail({
      from: fromEmail,
      to: options.to,
      subject: options.subject,
      html: options.html,
    })

    if (isDev) {
      console.log("[mail] accepted:", info.accepted)
      console.log("[mail] rejected:", info.rejected)
      console.log("[mail] messageId:", info.messageId)
      console.log("[mail] envelope:", info.envelope)
      console.log("[mail] response:", info.response)
    }

    return (info.accepted?.length || 0) > 0 && (info.rejected?.length || 0) === 0
  } catch (error) {
    const e = error as any

    console.error("[mail] send failed:", {
      name: e?.name,
      code: e?.code,
      command: e?.command,
      response: e?.response,
      responseCode: e?.responseCode,
      message: e?.message,
    })

    return false
  }
}
