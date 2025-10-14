#!/usr/bin/env node
import { execSync } from "node:child_process"
import fs from "node:fs"
import path from "node:path"

const msgFile = process.argv[2]
if (!msgFile) process.exit(0)

const msg = fs.readFileSync(msgFile, "utf8").trim()
const firstLine = msg.split("\n")[0] || ""

// Ignore release commits
if (/^chore\(release\):\s*v?\d+\.\d+\.\d+$/i.test(firstLine)) {
  process.exit(0)
}

// Very small Conventional Commit parser
// type[!][(scope)]: subject
const m = firstLine.match(/^(\w+)(!:?|\(.*?\))?:\s+.+$/)
const type = m?.[1] || ""

// Decide bump:
// - feat => minor
// - fix|perf => patch
// - BREAKING (via !) -> treat as minor (you said no majors now)
// - all others => no bump
let bump = null
if (/!/.test(firstLine) || /\bBREAKING CHANGE\b/i.test(msg)) {
  bump = "minor"
} else if (type === "feat") {
  bump = "minor"
} else if (type === "fix" || type === "perf") {
  bump = "patch"
} else {
  // docs/chore/refactor/test/etc => no bump
  process.exit(0)
}

// Read & bump package.json
const pkgPath = path.resolve(process.cwd(), "package.json")
const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"))
const [major, minor, patch] = (pkg.version || "0.0.0").split(".").map((n) => parseInt(n || "0", 10))

let next = { major, minor, patch }
if (bump === "minor") {
  next.minor += 1
  next.patch = 0
} else if (bump === "patch") {
  next.patch += 1
}
const newVersion = `${next.major}.${next.minor}.${next.patch}`
pkg.version = newVersion

// Write back
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n")

// Stage & amend into the same commit (avoid hook recursion via --no-verify)
execSync(`git add ${JSON.stringify(pkgPath)}`, { stdio: "inherit" })
execSync(`git commit --amend --no-edit --no-verify`, { stdio: "inherit" })

// Create an annotated tag on this commit
const tag = `v${newVersion}`
execSync(`git tag -a ${tag} -m "chore(release): ${tag}"`, { stdio: "inherit" })

console.log(`🔖 Version bumped to ${tag} (amended) and tag created.`)
console.log(`   Tip: enable auto-pushing tags with: git config push.followTags true`)
