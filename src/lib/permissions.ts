import { createAccessControl } from "better-auth/plugins/access"
import { adminAc, defaultStatements } from "better-auth/plugins/admin/access"

const statement = {
  // global navigation
  dashboard: ["view"] as const,

  // helpdesk
  ticket: ["view", "create", "update", "assign", "close", "delete"] as const,

  // content
  page: ["view", "create", "update", "publish", "delete"] as const,
  post: ["view", "create", "update", "publish", "delete"] as const,
  event: ["view", "create", "update", "publish", "delete"] as const,

  // admin / system
  admin: ["view"] as const, // gate entry to /admin

  // manager area
  manager: ["view"] as const,
  "manager.settings": ["read", "write"] as const,
  "manager.menus": ["read", "write"] as const,

  // editor area
  editor: ["view"] as const,

  // support area
  support: ["view"] as const,

  ...defaultStatements,
}

export const ac = createAccessControl(statement)

export const roles = {
  // full platform control
  admin: ac.newRole({
    dashboard: ["view"],
    ticket: ["view", "create", "update", "assign", "close", "delete"],
    page: ["view", "create", "update", "publish", "delete"],
    post: ["view", "create", "update", "publish", "delete"],
    event: ["view", "create", "update", "publish", "delete"],
    admin: ["view"],
    manager: ["view"],
    "manager.settings": ["read", "write"],
    "manager.menus": ["read", "write"],
    editor: ["view"],
    support: ["view"],
    ...adminAc.statements,
  }),

  // product/content owners
  manager: ac.newRole({
    dashboard: ["view"],
    page: ["view", "create", "update", "publish", "delete"],
    post: ["view", "create", "update", "publish", "delete"],
    event: ["view", "create", "update", "publish", "delete"],
    manager: ["view"],
    "manager.settings": ["read", "write"],
    "manager.menus": ["read", "write"],
    // helpdesk visibility
    ticket: ["view"],
  }),

  // writers/editors
  editor: ac.newRole({
    dashboard: ["view"],
    page: ["view", "create", "update", "publish"],
    post: ["view", "create", "update", "publish"],
    event: ["view", "create", "update", "publish"],
    editor: ["view"],
    ticket: ["view"],
  }),

  // support team
  support: ac.newRole({
    dashboard: ["view"],
    support: ["view"],
    ticket: ["view", "create", "update", "close"],
  }),

  // default authenticated user
  user: ac.newRole({
    dashboard: ["view"],
    ticket: ["view", "create"], // can create requests
    page: ["view"],
    post: ["view"],
    event: ["view"],
  }),
}
