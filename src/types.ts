/**
 * Opencode Gov Mode - Type Definitions
 * 
 * Hierarchical multi-agent system inspired by imperial government structure.
 * Contract for the shipped 1.18.x loader.
 */

// ---------- v1 config shapes (what we mutate in the config hook) ----------

export interface AgentPermission {
  [tool: string]: string | Record<string, string>
}

export interface AgentConfig {
  description?: string
  mode?: "primary" | "subagent" | "all"
  /** v1 config field for the system prompt (NOT `system`). */
  prompt?: string
  model?: string
  color?: string
  hidden?: boolean
  steps?: number
  temperature?: number
  permission?: AgentPermission
  [key: string]: unknown
}

export interface CommandConfig {
  description?: string
  template?: string
  agent?: string
  [key: string]: unknown
}

export interface OpenCodeConfig {
  agent?: Record<string, AgentConfig>
  command?: Record<string, CommandConfig>
  default_agent?: string
  subagent_depth?: number
  [key: string]: unknown
}

// ---------- v1 hooks returned from server() ----------

export interface Hooks {
  config?: (cfg: OpenCodeConfig) => void | Promise<void>
  [hook: string]: unknown
}

// ---------- input passed to server() ----------

export interface PluginInput {
  client: unknown
  project: string
  directory: string
  worktree?: string
  $?: unknown
  serverUrl?: URL
  [key: string]: unknown
}

// ---------- the hybrid plugin object the loader accepts ----------

export interface OpenCodePlugin {
  readonly id: string
  readonly server: (
    input: PluginInput,
    options?: Record<string, unknown>,
  ) => Promise<Hooks>
}

/** Hierarchy levels in the imperial system */
export type HierarchyLevel = 
  | "monarch"      // 君主 - Emperor
  | "prime-minister" // 宰相 - Prime Minister
  | "ministry"     // 六部 - Ministries
  | "governor"     // 地方官 - Regional Governors
  | "official"     // 基层官员 - Local Officials

/** Ministry types (六部) */
export type MinistryType = 
  | "personnel"    // 吏部 - Personnel
  | "finance"      // 户部 - Finance
  | "protocol"     // 礼部 - Protocol
  | "military"     // 兵部 - Military
  | "justice"      // 刑部 - Justice
  | "engineering"  // 工部 - Engineering

/** Imperial decree - task assignment from superior to inferior */
export interface ImperialDecree {
  id: string
  from: string      // Superior agent ID
  to: string        // Inferior agent ID
  task: string      // Task description
  deadline?: string
  priority: "critical" | "high" | "medium" | "low"
  context: string[]  // Files to read
  output: string    // Output file path
  timestamp: number
}

/** Memorial - report from inferior to superior */
export interface Memorial {
  id: string
  from: string      // Inferior agent ID
  to: string        // Superior agent ID
  decreeId: string  // Related decree ID
  status: "completed" | "in-progress" | "blocked" | "failed"
  summary: string
  output?: string   // Output file path
  findings?: string[]
  timestamp: number
}

/** Imperial endorsement - approval from monarch */
export interface ImperialEndorsement {
  id: string
  from: string      // Monarch/Prime Minister ID
  decreeId: string  // Related decree ID
  decision: "approved" | "rejected" | "modified"
  comments?: string
  timestamp: number
}

/** Agent hierarchy node */
export interface HierarchyNode {
  id: string
  name: string
  level: HierarchyLevel
  parentId?: string
  children: string[]
  ministry?: MinistryType
  region?: string
}

/** Blackboard task directory structure */
export interface TaskBoard {
  root: string
  sessionKey: string
  taskSlug: string
  path: string
}

/** Blackboard artifact */
export interface Artifact {
  path: string
  owner: string
  round: number
  content: string
}

/** Dispatch manifest */
export interface DispatchManifest {
  task: string
  reads: string[]
  writeTo: string
}
