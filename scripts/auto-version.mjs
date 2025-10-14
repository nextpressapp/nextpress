#!/usr/bin/env node
import { execSync } from "node:child_process"
import { readFileSync, writeFileSync } from "node:fs"
import path from "node:path"

/** Run a command and return trimmed stdout */
const sh = (cmd, opts = {}) =>
  execSync(cmd, { stdio: ["pipe", "pipe", "inherit"], encoding: "utf8", ...opts }).trim()

const repoRoot = sh("git rev-parse --show-toplevel")
process.chdir(repoRoot)

// 1) Find last tag (fallback to v0.0.0)
let lastTag
try {
  lastTag = sh("git describe --tags --abbrev=0")
} catch {
  lastTag = "v0.0.0"
}

// 2) Get commit subjects since last tag
let commits = []
try {
  const range = lastTag === "v0.0.0" ? "" : `${lastTag}..HEAD`
  const raw = sh(`git log ${range} --format=%s`)
  commits = raw ? raw.split("\n") : []
} catch {
  commits = []
}

// If there are no commits since the last tag, nothing to bump
if (commits.length === 0) {
  process.exit(0)
}

// 3) Decide bump type (feat -> minor, else patch). Ignore majors for now.
const hasFeat = commits.some((s) => /^feat(\(.+\))?:/i.test(s))
const bump = hasFeat ? "minor" : "patch"

// 4) Read package.json and compute next version
const pkgPath = path.join(repoRoot, "package.json")
const pkg = JSON.parse(readFileSync(pkgPath, "utf8"))
const [maj, min, pat] = pkg.version.split(".").map((n) => parseInt(n, 10))

let nextVersion
if (bump === "minor") nextVersion = `${maj}.${min + 1}.0`
else nextVersion = `${maj}.${min}.${pat + 1}`

// 5) Apply bump to package.json without creating a commit/tag yet
pkg.version = nextVersion
writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n", "utf8")

// 6) Commit and tag. Set env var so pre-commit allows this change.
try {
  sh("git add package.json")
  // Allow version edit for this commit only
  execSync(`ALLOW_VERSION_BUMP=1 git commit -m "chore(release): v${nextVersion}"`, {
    stdio: "inherit",
  })
  // Create/replace annotated tag
  // If a tag exists, move it (optional). Safer: create a new one and let push fail if it already exists.
  sh(`git tag -a v${nextVersion} -m "v${nextVersion}"`)
} catch (e) {
  console.error("Failed to commit/tag version bump:", e?.message || e)
  process.exit(1)
}

console.log(`Bumped version to v${nextVersion}.`)
/**
 * Exit with 10 so the pre-push hook can abort the current push
 * and ask the developer to push again (including the new commit+tag).
 */
process.exit(10)
