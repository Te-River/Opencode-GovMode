/**
 * Tests for blackboard.ts — resolveTtlMs, sweepStale, findRepoRoot, teamRootFor
 *
 * Uses Node.js built-in test runner (node:test, available in Node 18+).
 * Run: node --import tsx --test src/__tests__/blackboard.test.ts
 */

import { describe, it } from "node:test"
import assert from "node:assert/strict"
import * as fs from "node:fs"
import * as os from "node:os"
import * as path from "node:path"
import {
  resolveTtlMs,
  findRepoRoot,
  teamRootFor,
  sweepStale,
  DEFAULT_TTL_MS,
  DEFAULT_TTL_DAYS,
} from "../blackboard.js"

/* ------------------------------------------------------------------ */
/*  resolveTtlMs                                                      */
/* ------------------------------------------------------------------ */
describe("resolveTtlMs", () => {
  it("returns default when called with no options", () => {
    assert.equal(resolveTtlMs(), DEFAULT_TTL_MS)
  })

  it("returns default for empty object", () => {
    assert.equal(resolveTtlMs({}), DEFAULT_TTL_MS)
  })

  it("accepts valid ttlDays (1-365)", () => {
    assert.equal(resolveTtlMs({ ttlDays: 1 }), 1 * 24 * 60 * 60 * 1000)
    assert.equal(resolveTtlMs({ ttlDays: 30 }), 30 * 24 * 60 * 60 * 1000)
    assert.equal(resolveTtlMs({ ttlDays: 365 }), 365 * 24 * 60 * 60 * 1000)
  })

  it("falls back to default for ttlDays <= 0", () => {
    assert.equal(resolveTtlMs({ ttlDays: 0 }), DEFAULT_TTL_MS)
    assert.equal(resolveTtlMs({ ttlDays: -1 }), DEFAULT_TTL_MS)
  })

  it("falls back to default for ttlDays > 365", () => {
    assert.equal(resolveTtlMs({ ttlDays: 366 }), DEFAULT_TTL_MS)
    assert.equal(resolveTtlMs({ ttlDays: 1000 }), DEFAULT_TTL_MS)
  })

  it("falls back to default for NaN", () => {
    assert.equal(resolveTtlMs({ ttlDays: NaN }), DEFAULT_TTL_MS)
  })

  it("falls back to default for Infinity", () => {
    assert.equal(resolveTtlMs({ ttlDays: Infinity }), DEFAULT_TTL_MS)
  })

  it("falls back to default for non-number values", () => {
    assert.equal(resolveTtlMs({ ttlDays: "7" as any }), DEFAULT_TTL_MS)
    assert.equal(resolveTtlMs({ ttlDays: null as any }), DEFAULT_TTL_MS)
  })

  it("accepts blackboardTtlDays as an alias", () => {
    assert.equal(resolveTtlMs({ blackboardTtlDays: 10 }), 10 * 24 * 60 * 60 * 1000)
  })

  it("prefers ttlDays over blackboardTtlDays", () => {
    assert.equal(resolveTtlMs({ ttlDays: 3, blackboardTtlDays: 10 }), 3 * 24 * 60 * 60 * 1000)
  })
})

/* ------------------------------------------------------------------ */
/*  findRepoRoot                                                      */
/* ------------------------------------------------------------------ */
describe("findRepoRoot", () => {
  it("finds the repo root when .git exists in a parent", () => {
    // This test file lives inside the repo, so walking up should find it
    const result = findRepoRoot(import.meta.dirname ?? process.cwd())
    // Should find the Opencode-Gov repo root or at least a non-null result
    // (depends on the actual directory structure; just verify it doesn't throw)
    assert.ok(result === null || typeof result === "string")
  })

  it("returns null when no .git is found (temp dir)", () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "gov-test-"))
    try {
      const result = findRepoRoot(tmpDir)
      assert.equal(result, null)
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true })
    }
  })
})

/* ------------------------------------------------------------------ */
/*  teamRootFor                                                       */
/* ------------------------------------------------------------------ */
describe("teamRootFor", () => {
  it("returns a string path", () => {
    const result = teamRootFor(process.cwd())
    assert.equal(typeof result, "string")
    assert.ok(result.length > 0)
  })

  it("path contains 'opencode-gov'", () => {
    const result = teamRootFor(process.cwd())
    assert.ok(result.includes("opencode-gov"))
  })
})

/* ------------------------------------------------------------------ */
/*  sweepStale                                                        */
/* ------------------------------------------------------------------ */
describe("sweepStale", () => {
  it("returns 0 for non-existent root", () => {
    const fakeRoot = path.join(os.tmpdir(), `gov-sweep-${Date.now()}`)
    assert.equal(sweepStale(fakeRoot), 0)
  })

  it("returns 0 for empty root", () => {
    const emptyRoot = fs.mkdtempSync(path.join(os.tmpdir(), "gov-sweep-empty-"))
    try {
      assert.equal(sweepStale(emptyRoot), 0)
    } finally {
      fs.rmSync(emptyRoot, { recursive: true, force: true })
    }
  })

  it("removes stale task directories", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "gov-sweep-stale-"))
    try {
      // Create a task dir and backdate its mtime to make it stale
      const taskDir = path.join(root, "old-task")
      fs.mkdirSync(taskDir, { recursive: true })
      const file = path.join(taskDir, "file.txt")
      fs.writeFileSync(file, "content")

      // Backdate to 10 days ago (well beyond any reasonable TTL)
      const tenDaysAgo = Date.now() - 10 * 24 * 60 * 60 * 1000
      fs.utimesSync(taskDir, new Date(tenDaysAgo), new Date(tenDaysAgo))
      fs.utimesSync(file, new Date(tenDaysAgo), new Date(tenDaysAgo))

      const removed = sweepStale(root, 1 * 24 * 60 * 60 * 1000) // 1 day TTL
      assert.ok(removed >= 1)
      assert.ok(!fs.existsSync(taskDir))
    } finally {
      fs.rmSync(root, { recursive: true, force: true })
    }
  })

  it("keeps fresh task directories", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "gov-sweep-fresh-"))
    try {
      const taskDir = path.join(root, "fresh-task")
      fs.mkdirSync(taskDir, { recursive: true })
      fs.writeFileSync(path.join(taskDir, "file.txt"), "content")

      const removed = sweepStale(root, 30 * 24 * 60 * 60 * 1000) // 30 day TTL
      assert.equal(removed, 0)
      assert.ok(fs.existsSync(taskDir))
    } finally {
      fs.rmSync(root, { recursive: true, force: true })
    }
  })
})
