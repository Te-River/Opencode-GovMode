/**
 * opencode-gov-mode — OpenCode plugin entry point.
 *
 * Contract with the SHIPPED OpenCode Desktop loader (1.18.x, verified by
 * reading the binary's own applyPlugin/readV1Plugin code):
 *
 *   export default {
 *     id: "gov-mode",                      → Desktop plugin display name
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
 * - `subagentDepth` → max subagent nesting depth; default 9.
 */

import type { OpenCodePlugin, OpenCodeConfig } from "./types.js"
import { agents } from "./agents.js"
import { commands } from "./commands.js"
import {
  startBlackboardMaintenance,
  resolveTtlMs,
  DEFAULT_TTL_DAYS,
} from "./blackboard.js"

/** Runtime addendum to the Emperor prompt: concrete board + TTL. */
function blackboardNote(root: string, ttlDays: number): string {
  return [
    "",
    "",
    "## Gov Blackboard — resolved for this workspace",
    `Root directory: \`${root}\``,
    `- Session isolation: on the FIRST board write of this conversation create a session`,
    `  folder \`<root>/<session-key>/\` where <session-key> is a compact clock timestamp`,
    `  (PowerShell: \`Get-Date -Format yyyyMMdd-HHmmss\`; POSIX: \`date +%Y%m%d-%H%M%S\`).`,
    `  Reuse that folder for every later task in the same conversation; never write into`,
    `  a session folder created by a different conversation.`,
    `- Create exactly ONE task sub-directory per multi-agent task: \`<root>/<session-key>/<task-slug>/\`.`,
    `- Auto-cleanup: the plugin sweeps task directories idle for more than ${ttlDays} days (at startup and hourly).`,
    `  This is the ONLY cleanup path — never delete task or session directories yourself.`,
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
    const boardRoot = startBlackboardMaintenance(directory, ttlMs)
    const note = blackboardNote(boardRoot, ttlDays)

    return {
      // ---------- v1 config hook: inject agents & commands ----------
      config(cfg: OpenCodeConfig) {
        if (!cfg.agent) cfg.agent = {}
        for (const [name, def] of Object.entries(agents)) {
          // Respect user-defined overrides: never clobber an existing entry.
          if (cfg.agent[name]) continue
          cfg.agent[name] = {
            ...def,
            prompt: name === "gov" ? (def.prompt ?? "") + note : def.prompt,
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
          cfg.default_agent = "gov"
        }

        // ---------- configure subagent depth for hierarchical delegation ----------
        // Default: 9 for maximum fun! (0=disable, 1=default, 2-9=nested levels)
        const subagentDepth = (options?.subagentDepth as number) ?? 9
        if (!cfg.subagent_depth) {
          cfg.subagent_depth = subagentDepth
        }
      },
    }
  },
}

export default plugin
