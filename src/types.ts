/**
 * Opencode Gov Mode - Type Definitions
 * 
 * Hierarchical multi-agent system inspired by imperial government structure.
 */

/** Permission effect values supported by OpenCode v1.18.x */
export type PermissionEffect = "allow" | "ask" | "deny"

/**
 * Bash permission — either a flat effect, or a granular object mapping
 * command patterns to individual effects (e.g. `{ "git log *": "allow", "rm *": "deny" }`).
 */
export type BashPermission = PermissionEffect | Record<string, PermissionEffect>

/** Agent configuration as defined in OpenCode config */
export interface AgentConfig {
  mode: "primary" | "subagent"
  description: string
  prompt: string
  color?: string
  permission?: {
    edit?: PermissionEffect
    bash?: BashPermission
    webfetch?: PermissionEffect
    task?: PermissionEffect
    websearch?: PermissionEffect
    external_directory?: PermissionEffect
  }
  disable?: boolean
}

/** Command configuration as defined in OpenCode config */
export interface CommandConfig {
  description: string
  agent: string
  template: string
}

/** OpenCode config shape (v1.18.x) */
export interface OpenCodeConfig {
  agent?: Record<string, AgentConfig>
  command?: Record<string, CommandConfig>
  default_agent?: string
  subagent_depth?: number  // 0=disable, 1=default, 2+=nested
  [key: string]: unknown
}

/** Plugin options from tuple form */
export interface PluginOptions {
  ttlDays?: number
  defaultAgent?: boolean
  maxDepth?: number
  subagentDepth?: number  // OpenCode subagent_depth: 0=disable, 1=default, 2+=nested
  [key: string]: unknown
}

/** OpenCode plugin contract (v1.18.x) */
export interface OpenCodePlugin {
  id: string
  server: (input: { directory?: string }, options?: PluginOptions) => Promise<{
    config?: (cfg: OpenCodeConfig) => void
  }>
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
