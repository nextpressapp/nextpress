import { relations } from "drizzle-orm"
import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core"

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
}

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  role: text("role"),
  banned: boolean("banned").default(false),
  banReason: text("ban_reason"),
  banExpires: timestamp("ban_expires"),
  twoFactorEnabled: boolean("two_factor_enabled").default(false),
})

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  impersonatedBy: text("impersonated_by"),
})

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
})

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
})

export const passkey = pgTable("passkey", {
  id: text("id").primaryKey(),
  name: text("name"),
  publicKey: text("public_key").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  credentialID: text("credential_id").notNull(),
  counter: integer("counter").notNull(),
  deviceType: text("device_type").notNull(),
  backedUp: boolean("backed_up").notNull(),
  transports: text("transports"),
  createdAt: timestamp("created_at"),
  aaguid: text("aaguid"),
})

export const twoFactor = pgTable("two_factor", {
  id: text("id").primaryKey(),
  secret: text("secret").notNull(),
  backupCodes: text("backup_codes").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
})

export const statusEnum = pgEnum("Status", ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"])
export const priorityEnum = pgEnum("Priority", ["LOW", "MEDIUM", "HIGH", "URGENT"])

export const tickets = pgTable(
  "tickets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    status: statusEnum("status").notNull().default("OPEN"),
    priority: priorityEnum("priority").notNull().default("MEDIUM"),
    createdById: text("created_by_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    ...timestamps,
  },
  (t) => ({
    // helpful indexes
    byCreator: index("tickets_created_by_idx").on(t.createdById),
    byStatus: index("tickets_status_idx").on(t.status),
    byPriority: index("tickets_priority_idx").on(t.priority),
    byCreatedAt: index("tickets_created_at_idx").on(t.createdAt),
  })
)

export const comments = pgTable(
  "comments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    content: text("content").notNull(),
    ticketId: uuid("ticket_id")
      .notNull()
      .references(() => tickets.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    ...timestamps,
  },
  (t) => ({
    byTicket: index("comments_ticket_id_idx").on(t.ticketId),
    byUser: index("comments_user_id_idx").on(t.userId),
    byCreatedAt: index("comments_created_at_idx").on(t.createdAt),
  })
)

export const ticketRelations = relations(tickets, ({ one, many }) => ({
  createdBy: one(user, {
    fields: [tickets.createdById],
    references: [user.id],
  }),
  comments: many(comments),
}))

export const commentRelations = relations(comments, ({ one }) => ({
  ticket: one(tickets, {
    fields: [comments.ticketId],
    references: [tickets.id],
  }),
  author: one(user, {
    fields: [comments.userId],
    references: [user.id],
  }),
}))

export const posts = pgTable(
  "posts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    content: text("content"),
    published: boolean("published").default(false),
    userId: text("user_id").references(() => user.id, { onDelete: "cascade" }),
    ...timestamps,
  },
  (t) => ({
    byUser: index("posts_user_id_idx").on(t.userId),
    byPublished: index("posts_published_idx").on(t.published),
    byCreatedAt: index("posts_created_at_idx").on(t.createdAt),
  })
)

export const pages = pgTable(
  "pages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    content: text("content"),
    published: boolean("published").default(false),
    userId: text("user_id").references(() => user.id, { onDelete: "cascade" }),
    ...timestamps,
  },
  (t) => ({
    byUser: index("pages_user_id_idx").on(t.userId),
    byPublished: index("pages_published_idx").on(t.published),
    byCreatedAt: index("pages_created_at_idx").on(t.createdAt),
  })
)

export const events = pgTable(
  "events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    startDate: timestamp("start_date", { withTimezone: true }),
    endDate: timestamp("end_date", { withTimezone: true }),
    location: text("location"),
    published: boolean("published").default(false),
    userId: text("user_id").references(() => user.id, { onDelete: "cascade" }),
    ...timestamps,
  },
  (t) => ({
    byUser: index("events_user_id_idx").on(t.userId),
    byStartDate: index("events_start_date_idx").on(t.startDate),
    byPublished: index("events_published_idx").on(t.published),
  })
)

export const postRelations = relations(posts, ({ one }) => ({
  author: one(user, {
    fields: [posts.userId],
    references: [user.id],
  }),
}))

export const pageRelations = relations(pages, ({ one }) => ({
  author: one(user, {
    fields: [pages.userId],
    references: [user.id],
  }),
}))

export const eventRelations = relations(events, ({ one }) => ({
  author: one(user, {
    fields: [events.userId],
    references: [user.id],
  }),
}))

export const userRelations = relations(user, ({ many }) => ({
  ticketsCreated: many(tickets),
  commentsAuthored: many(comments),
  posts: many(posts),
  pages: many(pages),
  events: many(events),
  // optional: if you often traverse these too
  // accounts: many(account), <= handled by better-auth
  // sessions: many(session),<= handled by better-auth
  // passkeys: many(passkey),<= handled by better-auth
  // twoFactors: many(twoFactor),<= handled by better-auth
}))

export const siteSettings = pgTable("site_settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  siteName: text("site_name").notNull(),
  description: text("description").notNull(),
  homeTitle: text("home_title").notNull(),
  homeDescription: text("home_description").notNull(),
  aboutTitle: text("about_title").notNull(),
  aboutDescription: text("about_description").notNull(),
  ...timestamps,
})
