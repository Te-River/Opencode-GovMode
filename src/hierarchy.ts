/**
 * Opencode Gov Mode - Hierarchy Management
 * 
 * Manages the imperial government agent hierarchy, including
 * authority levels, delegation rules, and reporting chains.
 */

import type { HierarchyLevel, MinistryType, HierarchyNode } from "./types.js"

/* ------------------------------------------------------------------ */
/*  Hierarchy Configuration                                           */
/* ------------------------------------------------------------------ */

/** Authority levels for each hierarchy position */
export const AUTHORITY_LEVELS: Record<HierarchyLevel, number> = {
  "monarch": 100,        // 君主 - Supreme authority
  "prime-minister": 80,  // 宰相 - High authority
  "ministry": 60,        // 六部 - Medium authority
  "governor": 40,        // 地方官 - Regional authority
  "official": 20,        // 基层官员 - Limited authority
}

/** Ministry names in Chinese and English */
export const MINISTRY_NAMES: Record<MinistryType, { zh: string; en: string }> = {
  "personnel": { zh: "吏部", en: "Personnel" },
  "finance": { zh: "户部", en: "Finance" },
  "protocol": { zh: "礼部", en: "Protocol" },
  "military": { zh: "兵部", en: "Military" },
  "justice": { zh: "刑部", en: "Justice" },
  "engineering": { zh: "工部", en: "Engineering" },
}

/** Default hierarchy tree */
export const DEFAULT_HIERARCHY: HierarchyNode[] = [
  {
    id: "monarch",
    name: "Emperor (君主)",
    level: "monarch",
    children: ["prime-minister"],
  },
  {
    id: "prime-minister",
    name: "Prime Minister (宰相)",
    level: "prime-minister",
    parentId: "monarch",
    children: [
      "ministry-personnel",
      "ministry-finance",
      "ministry-protocol",
      "ministry-military",
      "ministry-justice",
      "ministry-engineering",
    ],
  },
  {
    id: "ministry-personnel",
    name: "Personnel Ministry (吏部)",
    level: "ministry",
    parentId: "prime-minister",
    ministry: "personnel",
    children: [],
  },
  {
    id: "ministry-finance",
    name: "Finance Ministry (户部)",
    level: "ministry",
    parentId: "prime-minister",
    ministry: "finance",
    children: [],
  },
  {
    id: "ministry-protocol",
    name: "Protocol Ministry (礼部)",
    level: "ministry",
    parentId: "prime-minister",
    ministry: "protocol",
    children: [],
  },
  {
    id: "ministry-military",
    name: "Military Ministry (兵部)",
    level: "ministry",
    parentId: "prime-minister",
    ministry: "military",
    children: [],
  },
  {
    id: "ministry-justice",
    name: "Justice Ministry (刑部)",
    level: "ministry",
    parentId: "prime-minister",
    ministry: "justice",
    children: [],
  },
  {
    id: "ministry-engineering",
    name: "Engineering Ministry (工部)",
    level: "ministry",
    parentId: "prime-minister",
    ministry: "engineering",
    children: [],
  },
]

/* ------------------------------------------------------------------ */
/*  Hierarchy Manager                                                 */
/* ------------------------------------------------------------------ */

export class HierarchyManager {
  private nodes: Map<string, HierarchyNode> = new Map()
  private maxDepth: number

  constructor(maxDepth: number = 10) {
    this.maxDepth = maxDepth
    this.initializeDefaultHierarchy()
  }

  private initializeDefaultHierarchy(): void {
    for (const node of DEFAULT_HIERARCHY) {
      this.nodes.set(node.id, { ...node, children: [...node.children] })
    }
  }

  /**
   * Get a node by ID
   */
  getNode(id: string): HierarchyNode | undefined {
    return this.nodes.get(id)
  }

  /**
   * Get all nodes at a specific hierarchy level
   */
  getNodesByLevel(level: HierarchyLevel): HierarchyNode[] {
    return Array.from(this.nodes.values()).filter(node => node.level === level)
  }

  /**
   * Get children of a node
   */
  getChildren(parentId: string): HierarchyNode[] {
    const parent = this.nodes.get(parentId)
    if (!parent) return []
    return parent.children
      .map(id => this.nodes.get(id))
      .filter((node): node is HierarchyNode => node !== undefined)
  }

  /**
   * Get the parent of a node
   */
  getParent(childId: string): HierarchyNode | undefined {
    const child = this.nodes.get(childId)
    if (!child?.parentId) return undefined
    return this.nodes.get(child.parentId)
  }

  /**
   * Get the authority level of a node
   */
  getAuthorityLevel(nodeId: string): number {
    const node = this.nodes.get(nodeId)
    if (!node) return 0
    return AUTHORITY_LEVELS[node.level] ?? 0
  }

  /**
   * Check if a node can delegate to another node
   */
  canDelegate(fromId: string, toId: string): boolean {
    const fromAuthority = this.getAuthorityLevel(fromId)
    const toAuthority = this.getAuthorityLevel(toId)
    return fromAuthority > toAuthority
  }

  /**
   * Check if a node can create a new node at a specific level
   */
  canCreateNode(creatorId: string, targetLevel: HierarchyLevel): boolean {
    const creatorAuthority = this.getAuthorityLevel(creatorId)
    const targetAuthority = AUTHORITY_LEVELS[targetLevel] ?? 0
    return creatorAuthority > targetAuthority
  }

  /**
   * Get the current depth of a node in the hierarchy
   */
  getDepth(nodeId: string): number {
    let depth = 0
    let current = this.nodes.get(nodeId)
    while (current?.parentId) {
      depth++
      current = this.nodes.get(current.parentId)
    }
    return depth
  }

  /**
   * Check if adding a new level would exceed max depth
   */
  wouldExceedMaxDepth(parentId: string): boolean {
    const currentDepth = this.getDepth(parentId)
    return currentDepth + 1 >= this.maxDepth
  }

  /**
   * Add a new node to the hierarchy
   */
  addNode(node: HierarchyNode): boolean {
    // Check max depth
    if (node.parentId && this.wouldExceedMaxDepth(node.parentId)) {
      return false
    }

    // Check authority
    if (node.parentId && !this.canCreateNode(node.parentId, node.level)) {
      return false
    }

    // Add node
    this.nodes.set(node.id, { ...node, children: [...node.children] })

    // Update parent's children list
    if (node.parentId) {
      const parent = this.nodes.get(node.parentId)
      if (parent && !parent.children.includes(node.id)) {
        parent.children.push(node.id)
      }
    }

    return true
  }

  /**
   * Remove a node from the hierarchy
   */
  removeNode(nodeId: string): boolean {
    const node = this.nodes.get(nodeId)
    if (!node) return false

    // Cannot remove monarch
    if (node.level === "monarch") return false

    // Remove from parent's children list
    if (node.parentId) {
      const parent = this.nodes.get(node.parentId)
      if (parent) {
        parent.children = parent.children.filter(id => id !== nodeId)
      }
    }

    // Remove node and all descendants
    this.removeNodeAndDescendants(nodeId)

    return true
  }

  private removeNodeAndDescendants(nodeId: string): void {
    const node = this.nodes.get(nodeId)
    if (!node) return

    // Remove all children first
    for (const childId of [...node.children]) {
      this.removeNodeAndDescendants(childId)
    }

    // Remove the node itself
    this.nodes.delete(nodeId)
  }

  /**
   * Get the delegation path from one node to another
   */
  getDelegationPath(fromId: string, toId: string): string[] | null {
    const from = this.nodes.get(fromId)
    const to = this.nodes.get(toId)
    if (!from || !to) return null

    // Simple case: direct delegation
    if (from.children.includes(toId)) {
      return [fromId, toId]
    }

    // BFS to find path
    const queue: string[][] = [[fromId]]
    const visited = new Set<string>([fromId])

    while (queue.length > 0) {
      const path = queue.shift()!
      const current = path[path.length - 1]
      const currentNode = this.nodes.get(current)

      if (!currentNode) continue

      for (const childId of currentNode.children) {
        if (childId === toId) {
          return [...path, childId]
        }
        if (!visited.has(childId)) {
          visited.add(childId)
          queue.push([...path, childId])
        }
      }
    }

    return null
  }

  /**
   * Get the reporting chain from a node up to the monarch
   */
  getReportingChain(nodeId: string): string[] {
    const chain: string[] = []
    let current = this.nodes.get(nodeId)

    while (current) {
      chain.unshift(current.id)
      if (!current.parentId) break
      current = this.nodes.get(current.parentId)
    }

    return chain
  }

  /**
   * Get all nodes in the hierarchy
   */
  getAllNodes(): HierarchyNode[] {
    return Array.from(this.nodes.values())
  }

  /**
   * Get the hierarchy as a tree string
   */
  getHierarchyTree(): string {
    const lines: string[] = []
    const printNode = (nodeId: string, prefix: string = "", isLast: boolean = true) => {
      const node = this.nodes.get(nodeId)
      if (!node) return

      const connector = isLast ? "└── " : "├── "
      lines.push(`${prefix}${connector}${node.name}`)

      const newPrefix = prefix + (isLast ? "    " : "│   ")
      for (let i = 0; i < node.children.length; i++) {
        printNode(node.children[i], newPrefix, i === node.children.length - 1)
      }
    }

    printNode("monarch")
    return lines.join("\n")
  }
}

/* ------------------------------------------------------------------ */
/*  Utility Functions                                                 */
/* ------------------------------------------------------------------ */

/**
 * Get the appropriate agent name for a hierarchy level
 */
export function getAgentForLevel(level: HierarchyLevel): string {
  switch (level) {
    case "monarch":
      return "monarch"
    case "prime-minister":
      return "prime-minister"
    case "ministry":
      return "ministry-engineering" // Default to engineering
    case "governor":
      return "regional-governor"
    case "official":
      return "local-official"
    default:
      return "local-official"
  }
}

/**
 * Get the hierarchy level for an agent name
 */
export function getLevelForAgent(agentName: string): HierarchyLevel {
  if (agentName === "monarch") return "monarch"
  if (agentName === "prime-minister") return "prime-minister"
  if (agentName.startsWith("ministry-")) return "ministry"
  if (agentName === "regional-governor") return "governor"
  if (agentName === "local-official") return "official"
  return "official"
}

/**
 * Get the ministry type for a ministry agent name
 */
export function getMinistryType(agentName: string): MinistryType | null {
  if (!agentName.startsWith("ministry-")) return null
  const ministry = agentName.replace("ministry-", "") as MinistryType
  return MINISTRY_NAMES[ministry] ? ministry : null
}
