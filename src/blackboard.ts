/**
 * Opencode Gov Mode - Blackboard System
 * 
 * Shared blackboard for hierarchical agent coordination with support
 * for deep nesting and imperial government structure.
 */

import * as fs from "node:fs"
import * as os from "node:os"
import * as path from "node:path"

/** Default idle time before a task directory is swept: 5 days. */
export const DEFAULT_TTL_DAYS = 5
export const DEFAULT_TTL_MS = DEFAULT_TTL_DAYS * 24 * 60 * 60 * 1000

/** In-process sweep interval. */
const SWEEP_INTERVAL_MS = 60 * 60 * 1000

/** Board root directory name (under .git/, or under tmpdir as fallback). */
const ROOT_NAME = "opencode-gov"

/** Walk upward from `start` to find the git repository root, if any. */
export function findRepoRoot(start: string): string | null {
  let dir = path.resolve(start)
  for (;;) {
    if (fs.existsSync(path.join(dir, ".git"))) return dir
    const parent = path.dirname(dir)
    if (parent === dir) return null
    dir = parent
  }
}

/** Absolute blackboard root for a workspace. */
export function teamRootFor(directory: string): string {
  const repo = findRepoRoot(directory)
  const base = repo ? path.join(repo, ".git") : os.tmpdir()
  return path.join(base, ROOT_NAME)
}

/**
 * Resolve the TTL from plugin options.  Accepts `ttlDays` (or the more
 * explicit `blackboardTtlDays`) as a finite number in (0, 365]; anything
 * else silently falls back to the 5-day default.
 */
export function resolveTtlMs(options: Record<string, unknown> = {}): number {
  const raw = options.ttlDays ?? options.blackboardTtlDays
  if (typeof raw === "number" && Number.isFinite(raw) && raw > 0 && raw <= 365) {
    return raw * 24 * 60 * 60 * 1000
  }
  return DEFAULT_TTL_MS
}

/* ------------------------------------------------------------------ */
/*  Hierarchy-aware directory structure                               */
/* ------------------------------------------------------------------ */

/**
 * Create a hierarchical task directory structure.
 * 
 * Structure:
 * <root>/<session-key>/<task-slug>/
 *   ├── monarch/          # Emperor's work
 *   ├── prime-minister/   # Prime Minister's work
 *   ├── ministries/       # Six Ministries
 *   │   ├── personnel/
 *   │   ├── finance/
 *   │   ├── protocol/
 *   │   ├── military/
 *   │   ├── justice/
 *   │   └── engineering/
 *   ├── governors/        # Regional Governors
 *   │   └── <governor-id>/
 *   └── officials/        # Local Officials
 *       └── <official-id>/
 */
export function createTaskStructure(
  root: string,
  sessionKey: string,
  taskSlug: string
): {
  taskDir: string
  monarchDir: string
  primeMinisterDir: string
  ministriesDir: string
  governorsDir: string
  officialsDir: string
} {
  const taskDir = path.join(root, sessionKey, taskSlug)
  const monarchDir = path.join(taskDir, "monarch")
  const primeMinisterDir = path.join(taskDir, "prime-minister")
  const ministriesDir = path.join(taskDir, "ministries")
  const governorsDir = path.join(taskDir, "governors")
  const officialsDir = path.join(taskDir, "officials")

  // Create all directories
  for (const dir of [monarchDir, primeMinisterDir, ministriesDir, governorsDir, officialsDir]) {
    fs.mkdirSync(dir, { recursive: true })
  }

  // Create ministry subdirectories
  const ministries = ["personnel", "finance", "protocol", "military", "justice", "engineering"]
  for (const ministry of ministries) {
    fs.mkdirSync(path.join(ministriesDir, ministry), { recursive: true })
  }

  return { taskDir, monarchDir, primeMinisterDir, ministriesDir, governorsDir, officialsDir }
}

/**
 * Get or create a ministry directory.
 */
export function getMinistryDir(
  ministriesDir: string,
  ministry: string
): string {
  const dir = path.join(ministriesDir, ministry)
  fs.mkdirSync(dir, { recursive: true })
  return dir
}

/**
 * Get or create a governor directory.
 */
export function getGovernorDir(
  governorsDir: string,
  governorId: string
): string {
  const dir = path.join(governorsDir, governorId)
  fs.mkdirSync(dir, { recursive: true })
  return dir
}

/**
 * Get or create an official directory.
 */
export function getOfficialDir(
  officialsDir: string,
  officialId: string
): string {
  const dir = path.join(officialsDir, officialId)
  fs.mkdirSync(dir, { recursive: true })
  return dir
}

/* ------------------------------------------------------------------ */
/*  TTL Sweeper (automatic cleanup)                                   */
/* ------------------------------------------------------------------ */

/** Latest mtime within `dir`, looking through `levels` sub-directory
 *  layers (artifacts live one level below a task dir, so 1 suffices per
 *  task and 2 from the session/root level). */
function lastActivity(dir: string, levels = 0): number {
  try {
    let latest = fs.statSync(dir).mtimeMs
    for (const entry of fs.readdirSync(dir)) {
      try {
        const child = path.join(dir, entry)
        const seen =
          fs.statSync(child).isDirectory() && levels > 0
            ? lastActivity(child, levels - 1)
            : fs.statSync(child).mtimeMs
        if (seen > latest) latest = seen
      } catch {
        /* raced — ignore */
      }
    }
    return latest
  } catch {
    return 0
  }
}

/** True when a directory tree shows no activity within the TTL. */
function isStale(dir: string, now: number, ttlMs: number, levels: number): boolean {
  const seen = lastActivity(dir, levels)
  return seen !== 0 && now - seen > ttlMs
}

/**
 * Remove idle boards under `root`.  Understands two layouts:
 * 
 * - Session-partitioned `<root>/<session-key>/<task>/`: stale tasks are
 *   pruned individually under a still-live session; an entirely idle session
 *   folder goes as a whole.
 * 
 * - Legacy flat `<root>/<task>/`: unchanged semantics — and if such a dir
 *   unexpectedly contains sub-directories, idle ones are pruned by the same
 *   rule (hardest case, counted as task dirs).
 * 
 * Returns the number of task directories reclaimed; a wholesale session
 * remove counts its task dirs (min 1, so a ghost empty stale session dir
 * also counts 1).  Never throws.
 */
export function sweepStale(root: string, ttlMs = DEFAULT_TTL_MS): number {
  let entries: string[]
  try {
    entries = fs.readdirSync(root)
  } catch {
    return 0 // root does not exist — nothing to sweep
  }
  const now = Date.now()
  let removed = 0
  for (const entry of entries) {
    const dir = path.join(root, entry)
    try {
      if (!fs.statSync(dir).isDirectory()) continue
      if (isStale(dir, now, ttlMs, 2)) {
        // Entire tree idle: prune per-task dirs, or a flat task dir.
        let tasks = 0
        for (const child of fs.readdirSync(dir)) {
          try {
            const task = path.join(dir, child)
            if (fs.statSync(task).isDirectory()) tasks++
          } catch {
            /* raced — skip this task */
          }
        }
        fs.rmSync(dir, { recursive: true, force: true })
        removed += Math.max(1, tasks)
        continue
      }
      // Live tree: prune per-task dirs (session layout; legacy flat dirs have
      // no direct directory children, so this loop is a no-op for them).
      for (const child of fs.readdirSync(dir)) {
        const task = path.join(dir, child)
        try {
          if (!fs.statSync(task).isDirectory()) continue
          if (isStale(task, now, ttlMs, 1)) {
            fs.rmSync(task, { recursive: true, force: true })
            removed++
          }
        } catch {
          /* raced — skip this task */
        }
      }
    } catch {
      /* stat / readdir failure on a single entry — skip it */
    }
  }
  return removed
}

let maintenanceStarted = false

/**
 * Start blackboard maintenance (idlewithin the process) and return
 * the resolved board root.  Runs a startup sweep (catches leftovers from
 * crashes / force-kills) plus an ungard'd hourly interval so the timer
 * never keeps the process alive on its own.
 * 
 * Placing the board inside `.git/` guarantees the user's working tree
 * and commits are never polluted; for non-git workspaces we fall back
 * to the OS temp dir.
 */
export function startBlackboardMaintenance(
  directory: string,
  ttlMs = DEFAULT_TTL_MS,
): string {
  const root = teamRootFor(directory)
  if (!maintenanceStarted) {
    maintenanceStarted = true
    sweepStale(root, ttlMs)
    const timer = setInterval(() => sweepStale(root, ttlMs), SWEEP_INTERVAL_MS)
    if (typeof timer.unref === "function") timer.unref()
  }
  return root
}
