/**
 * opencode-gov-mode — OpenCode plugin entry point.
 *
 * Hierarchical multi-agent system inspired by imperial government structure.
 * Adds Emperor, Prime Minister, Six Ministries, Regional Governors,
 * and Local Officials to OpenCode Desktop.
 *
 * Contract with the SHIPPED OpenCode Desktop loader (1.18.x):
 *
 *   export default {
 *     id: "gov-mode",                     → Desktop plugin display name
 *     server: async (input, options) => ({ config(cfg) { ...inject... } })
 *   }
 *
 * `server()` is the ONLY function the loader calls; a `setup` property is
 * silently ignored. The v1 `config` hook receives the merged opencode config
 * and is the supported way to add agents/commands.
 *
 * Options (via the tuple plugin form):
 *   "plugin": [["@te-river/opencode-gov-mode@latest", { "ttlDays": 7 }]]
 * - `ttlDays`      → blackboard auto-cleanup TTL; default 5.
 * - `defaultAgent` → Emperor is the default agent (opt-out: set `false`).
 * - `maxDepth`     → maximum hierarchy nesting depth; default 10.
 */

import type { OpenCodePlugin, OpenCodeConfig, PluginOptions } from "./types.js"
import { agents } from "./agents.js"
import { commands } from "./commands.js"
import {
  startBlackboardMaintenance,
  resolveTtlMs,
  DEFAULT_TTL_DAYS,
} from "./blackboard.js"

/** Runtime addendum to the Emperor prompt: concrete board + TTL. */
function blackboardNote(root: string, ttlDays: number, maxDepth: number): string {
  return [
    "",
    "",
    "## Imperial Government Blackboard — resolved for this workspace",
    `Root directory: \`${root}\``,
    `- Session isolation: on the FIRST board write of this conversation create a session`,
    `  folder \`<root>/<session-key>/\` where <session-key> is a compact clock timestamp`,
    `  (PowerShell: \`Get-Date -Format yyyyMMdd-HHmmss\`; POSIX: \`date +%Y%m%d-%H%M%S\`).`,
    `  Reuse that folder for every later task in the same conversation; never write into`,
    `  a session folder created by a different conversation.`,
    `- Create exactly ONE task sub-directory per multi-agent task: \`<root>/<session-key>/<task-slug>/\`.`,
    `- Task directory structure supports hierarchical organization:`,
    `  - \`monarch/\` — Emperor's work`,
    `  - \`prime-minister/\` — Prime Minister's work`,
    `  - \`ministries/\` — Six Ministries (personnel, finance, protocol, military, justice, engineering)`,
    `  - \`governors/\` — Regional Governors`,
    `  - \`officials/\` — Local Officials`,
    `- Auto-cleanup: the plugin sweeps task directories idle for more than ${ttlDays} days (at startup and hourly).`,
    `  This is the ONLY cleanup path — never delete task or session directories yourself.`,
    `- Maximum hierarchy depth: ${maxDepth} levels.`,
    `  - Monarch (Level 1) → Prime Minister (Level 2) → Ministries (Level 3)`,
    `  - Regional Governors (Level 4) → Local Officials (Level 5)`,
    `  - Additional levels can be created dynamically within the max depth limit.`,
  ].join("\n")
}

/** Hierarchy visualization note */
function hierarchyNote(): string {
  return [
    "",
    "",
    "## Imperial Hierarchy (封建等级制度)",
    "The government follows a strict hierarchical structure:",
    "",
    "1. **Emperor (君主)** — Supreme decision maker",
    "   - Decomposes tasks, dispatches decrees, enforces quality gates",
    "   - Can delegate to ANY level below",
    "",
    "2. **Prime Minister (宰相)** — Chief coordinator",
    "   - Receives imperial decrees, coordinates Six Ministries",
    "   - Manages inter-ministry dependencies",
    "",
    "3. **Six Ministries (六部)** — Domain specialists",
    "   - **Personnel (吏部)** — Agent management, task assignment",
    "   - **Finance (户部)** — Resource management, cost optimization",
    "   - **Protocol (礼部)** — Communication standards, documentation",
    "   - **Military (兵部)** — Fast execution, parallel tasks",
    "   - **Justice (刑部)** — Code review, quality assurance",
    "   - **Engineering (工部)** — Architecture, implementation",
    "",
    "4. **Regional Governors (地方官)** — Project managers",
    "   - Manage specific projects or regions",
    "   - Delegate to Local Officials",
    "",
    "5. **Local Officials (基层官员)** — Task executors",
    "   - Execute specific tasks under supervision",
    "",
    "## Communication Protocols (通信协议)",
    "- **Imperial Decree (圣旨)** — Task assignment from superior to inferior",
    "- **Memorial (奏折)** — Report from inferior to superior",
    "- **Imperial Endorsement (批红)** — Approval/rejection from monarch",
    "- **Court Message (廷寄)** — Urgent横向 communication",
    "- **Petition (请愿)** — Request for higher authority",
    "",
    "## Delegation Rules (委派规则)",
    "- Each level can only delegate to levels below it",
    "- Maximum hierarchy depth is configurable (default: 10)",
    "- Authority levels: Emperor (100) > Prime Minister (80) > Ministries (60) > Governors (40) > Officials (20)",
  ].join("\n")
}

const plugin: OpenCodePlugin = {
  id: "gov-mode",

  server: async (input, options) => {
    // ---------- blackboard maintenance (code-level TTL sweeper) ----------
    const directory =
      typeof input?.directory === "string" && input.directory.length > 0
        ? input.directory
        : process.cwd()
    const ttlMs = resolveTtlMs(options)
    const ttlDays = Math.round(ttlMs / (24 * 60 * 60 * 1000)) || DEFAULT_TTL_DAYS
    const maxDepth = options?.maxDepth ?? 10
    const boardRoot = startBlackboardMaintenance(directory, ttlMs)
    const note = blackboardNote(boardRoot, ttlDays, maxDepth)
    const hierarchy = hierarchyNote()

    return {
      // ---------- v1 config hook: inject agents & commands ----------
      config(cfg: OpenCodeConfig) {
        if (!cfg.agent) cfg.agent = {}
        for (const [name, def] of Object.entries(agents)) {
          // Respect user-defined overrides: never clobber an existing entry.
          if (cfg.agent[name]) continue
          cfg.agent[name] = {
            ...def,
            // Add blackboard and hierarchy notes to Emperor and Prime Minister
            prompt: (name === "monarch" || name === "prime-minister") 
              ? (def.prompt ?? "") + note + hierarchy 
              : def.prompt,
          }
        }

        if (!cfg.command) cfg.command = {}
        for (const [name, def] of Object.entries(commands)) {
          if (cfg.command[name]) continue
          cfg.command[name] = def
        }

        // ---------- make Emperor the default agent (opt-out: defaultAgent:false)
        const promote = options?.defaultAgent !== false
        if (promote && (!cfg.default_agent || cfg.default_agent === "build")) {
          cfg.default_agent = "monarch"
        }
      },
    }
  },
}

export default plugin
