/**
 * Tests for index.ts — config() hook behavior
 *
 * Uses Node.js built-in test runner (node:test, available in Node 18+).
 * Run: node --import tsx --test src/__tests__/index.test.ts
 */

import { describe, it } from "node:test"
import assert from "node:assert/strict"
import plugin from "../index.js"
import type { OpenCodeConfig } from "../types.js"

/* ------------------------------------------------------------------ */
/*  Plugin shape                                                      */
/* ------------------------------------------------------------------ */
describe("plugin", () => {
  it("exports the correct plugin id", () => {
    assert.equal(plugin.id, "gov-mode")
  })

  it("has a server function", () => {
    assert.equal(typeof plugin.server, "function")
  })
})

/* ------------------------------------------------------------------ */
/*  config() hook — agent injection                                   */
/* ------------------------------------------------------------------ */
describe("config() hook", () => {
  async function getConfig(
    options: Record<string, unknown> = {}
  ): Promise<OpenCodeConfig> {
    const ctx = await plugin.server({ directory: process.cwd() }, options as any)
    const cfg: OpenCodeConfig = {}
    ctx.config?.(cfg)
    return cfg
  }

  it("injects all government agents into an empty config", async () => {
    const cfg = await getConfig()
    // Core agents
    assert.ok(cfg.agent?.["monarch"], "should inject monarch")
    assert.ok(cfg.agent?.["prime-minister"], "should inject prime-minister")
    // Ministries
    assert.ok(cfg.agent?.["ministry-personnel"], "should inject ministry-personnel")
    assert.ok(cfg.agent?.["ministry-finance"], "should inject ministry-finance")
    assert.ok(cfg.agent?.["ministry-protocol"], "should inject ministry-protocol")
    assert.ok(cfg.agent?.["ministry-military"], "should inject ministry-military")
    assert.ok(cfg.agent?.["ministry-justice"], "should inject ministry-justice")
    assert.ok(cfg.agent?.["ministry-engineering"], "should inject ministry-engineering")
    // Hierarchical levels
    assert.ok(cfg.agent?.["regional-governor"], "should inject regional-governor")
    assert.ok(cfg.agent?.["local-official"], "should inject local-official")
    // Specialists
    assert.ok(cfg.agent?.["architect"], "should inject architect")
    assert.ok(cfg.agent?.["implementer"], "should inject implementer")
    assert.ok(cfg.agent?.["reviewer"], "should inject reviewer")
    assert.ok(cfg.agent?.["tester"], "should inject tester")
    assert.ok(cfg.agent?.["researcher"], "should inject researcher")
  })

  it("does not clobber user-defined agents", async () => {
    const cfg: OpenCodeConfig = {
      agent: {
        monarch: {
          mode: "primary",
          description: "User-defined monarch override",
          prompt: "custom prompt",
        },
      },
    }
    const ctx = await plugin.server({ directory: process.cwd() })
    ctx.config?.(cfg)
    // User's definition should be preserved
    assert.equal(cfg.agent?.["monarch"]?.description, "User-defined monarch override")
  })

  it("promotes monarch to default_agent when no default is set", async () => {
    const cfg: OpenCodeConfig = {}
    const ctx = await plugin.server({ directory: process.cwd() })
    ctx.config?.(cfg)
    assert.equal(cfg.default_agent, "monarch")
  })

  it("promotes monarch when default_agent is 'build'", async () => {
    const cfg: OpenCodeConfig = { default_agent: "build" }
    const ctx = await plugin.server({ directory: process.cwd() })
    ctx.config?.(cfg)
    assert.equal(cfg.default_agent, "monarch")
  })

  it("does not override a non-build user default_agent", async () => {
    const cfg: OpenCodeConfig = { default_agent: "custom-agent" }
    const ctx = await plugin.server({ directory: process.cwd() })
    ctx.config?.(cfg)
    assert.equal(cfg.default_agent, "custom-agent")
  })

  it("does not promote monarch when defaultAgent option is false", async () => {
    const cfg: OpenCodeConfig = {}
    const ctx = await plugin.server({ directory: process.cwd() }, { defaultAgent: false })
    ctx.config?.(cfg)
    assert.equal(cfg.default_agent, undefined)
  })

  it("monarch prompt includes blackboard note", async () => {
    const cfg = await getConfig()
    const prompt = cfg.agent?.["monarch"]?.prompt ?? ""
    assert.ok(prompt.includes("Imperial Government Blackboard"), "should mention blackboard")
    assert.ok(prompt.includes("Root directory:"), "should include resolved root")
  })

  it("monarch prompt includes hierarchy note", async () => {
    const cfg = await getConfig()
    const prompt = cfg.agent?.["monarch"]?.prompt ?? ""
    assert.ok(prompt.includes("Imperial Hierarchy"), "should mention hierarchy")
  })

  it("prime-minister prompt includes both notes", async () => {
    const cfg = await getConfig()
    const prompt = cfg.agent?.["prime-minister"]?.prompt ?? ""
    assert.ok(prompt.includes("Imperial Government Blackboard"), "should mention blackboard")
    assert.ok(prompt.includes("Imperial Hierarchy"), "should mention hierarchy")
  })

  it("specialist agents do NOT get blackboard/hierarchy notes appended", async () => {
    const cfg = await getConfig()
    // Architect should NOT have hierarchy note
    const archPrompt = cfg.agent?.["architect"]?.prompt ?? ""
    assert.ok(!archPrompt.includes("Imperial Hierarchy"), "architect should not have hierarchy note")
  })

  it("injects all government commands", async () => {
    const cfg = await getConfig()
    assert.ok(cfg.command?.["gov-reign"], "should inject gov-reign")
    assert.ok(cfg.command?.["gov-decree"], "should inject gov-decree")
    assert.ok(cfg.command?.["gov-report"], "should inject gov-report")
    assert.ok(cfg.command?.["gov-endorse"], "should inject gov-endorse")
    assert.ok(cfg.command?.["gov-ministry"], "should inject gov-ministry")
    assert.ok(cfg.command?.["gov-governor"], "should inject gov-governor")
    assert.ok(cfg.command?.["gov-official"], "should inject gov-official")
    assert.ok(cfg.command?.["gov-plan"], "should inject gov-plan")
    assert.ok(cfg.command?.["gov-implement"], "should inject gov-implement")
    assert.ok(cfg.command?.["gov-review"], "should inject gov-review")
    assert.ok(cfg.command?.["gov-test"], "should inject gov-test")
    assert.ok(cfg.command?.["gov-research"], "should inject gov-research")
  })

  it("does not clobber user-defined commands", async () => {
    const cfg: OpenCodeConfig = {
      command: {
        "gov-reign": { description: "user override", agent: "custom", template: "custom" },
      },
    }
    const ctx = await plugin.server({ directory: process.cwd() })
    ctx.config?.(cfg)
    assert.equal(cfg.command?.["gov-reign"]?.description, "user override")
  })

  it("sets subagent_depth to 2 by default for hierarchical delegation", async () => {
    const cfg: OpenCodeConfig = {}
    const ctx = await plugin.server({ directory: process.cwd() })
    ctx.config?.(cfg)
    assert.equal(cfg.subagent_depth, 2)
  })

  it("does not override user-defined subagent_depth", async () => {
    const cfg: OpenCodeConfig = { subagent_depth: 3 }
    const ctx = await plugin.server({ directory: process.cwd() })
    ctx.config?.(cfg)
    assert.equal(cfg.subagent_depth, 3)
  })

  it("respects subagentDepth option", async () => {
    const cfg: OpenCodeConfig = {}
    const ctx = await plugin.server({ directory: process.cwd() }, { subagentDepth: 3 })
    ctx.config?.(cfg)
    assert.equal(cfg.subagent_depth, 3)
  })
})
