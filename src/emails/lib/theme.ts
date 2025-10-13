export const theme = {
  brand: {
    name: "NextPress",
    url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    supportEmail: "support@blackstone-security.com",
    logo: {
      src:
        process.env.NEXT_PUBLIC_EMAIL_LOGO_URL ||
        "https://placehold.co/160x40/111/fff?text=NextPress",
      alt: "NextPress",
      width: 160,
      height: 40,
    },
  },
  colors: {
    bg: "#0B0F19",
    card: "#111827",
    text: "#E5E7EB",
    subtext: "#A1A1AA",
    primary: "#6EE7B7",
    primaryText: "#06291E",
    border: "#1F2937",
    muted: "#9CA3AF",
  },
  radii: {
    card: 16,
    button: 10,
  },
  fontFamily:
    "Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, 'Apple Color Emoji', 'Segoe UI Emoji'",
} as const
