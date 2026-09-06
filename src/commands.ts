/**
 * Opencode Gov Mode - Command Definitions
 * 
 * Imperial government commands for hierarchical multi-agent collaboration.
 */

import type { CommandConfig } from "./types.js"

/* ------------------------------------------------------------------ */
/*  Core Imperial Commands (核心命令)                                  */
/* ------------------------------------------------------------------ */

const govReign: CommandConfig = {
  description:
    "Emperor begins reign — full hierarchical workflow for complex tasks.",
  agent: "gov",
  template: `Execute the full imperial government workflow for the following task.

## Task
$ARGUMENTS

## Workflow
1. **Imperial Triage** — classify before acting:
   - Question ≠ work order.  Answer questions without touching files.
   - Action request → enter the workflow below.
   - User-stated boundaries are supreme — restate them in every dispatch.
2. **TodoList Creation** — create a todo list for medium-or-larger tasks:
   - Each item is one concrete work package with checkable done-conditions.
   - Keep it LIVE: exactly one in_progress at a time.
   - Mark completed only after actual verification.
3. **Imperial Decree** — dispatch sub-tasks to the appropriate hierarchy:
   - Complex multi-ministry coordination → Prime Minister
   - Domain-specific tasks → appropriate Ministry
   - Project-specific work → Regional Governor
   - Simple execution → Local Official
   - Specialist tasks → Architect, Implementer, Reviewer, Tester, Researcher
4. **Blackboard Coordination** — manage the shared blackboard:
   - One task directory per multi-agent task
   - Every dispatch carries a manifest (Task/Reads/Write to)
   - File ownership: one artifact per agent
   - Writes are frozen: revisions are new round-suffixed files
5. **Imperial Review** — enforce the feedback loop:
   - Reviewer Critical/Major findings → spawn fix tasks
   - Tester product bugs → spawn fix tasks
   - Loop until clean (max 2 loops, then escalate)
6. **Final Report** — structured summary with:
   - Changes made
   - Review/test verdict
   - Remaining assumptions and risks
   - Task blackboard left for TTL sweep`,
}

const govDecree: CommandConfig = {
  description:
    "Issue an imperial decree — create a task assignment for any agent level.",
  agent: "gov",
  template: `Issue an imperial decree for the following task.

## Task
$ARGUMENTS

## Decree Format
1. **Objective** — What must be accomplished.
2. **Target Agent** — Who receives this decree (specify hierarchy level).
3. **Context** — Files to read, background information.
4. **Deliverables** — Expected output format and file path.
5. **Constraints** — Boundaries, deadline, priority.
6. **Escalation** — When and how to escalate blockers.

## Hierarchy Levels
- Prime Minister (宰相) — for complex multi-ministry coordination
- Ministries (六部) — for domain-specific tasks
- Regional Governors (地方官) — for project-specific work
- Local Officials (基层官员) — for simple execution tasks
- Specialists — Architect, Implementer, Reviewer, Tester, Researcher

## Blackboard Protocol
- Create task directory under the session root
- Assign file ownership in the decree
- Specify reads and writes clearly
- Include manifest requirements`,
}

const govReport: CommandConfig = {
  description:
    "Submit a memorial (report) — view progress and status of all tasks.",
  agent: "gov",
  template: `Generate a comprehensive status report for the current session.

## Request
$ARGUMENTS

## Report Format
1. **Session Overview** — Active tasks and their status.
2. **Hierarchy Status** — What each level is working on.
3. **Recent Activity** — Latest decrees and memorials.
4. **Blockers** — Any issues requiring imperial attention.
5. **Next Steps** — Planned actions and priorities.

## Instructions
- Read all active task boards in the session directory.
- Summarize the current state of each task.
- Identify any coordination issues between ministries.
- Provide actionable recommendations.`,
}

const govEndorse: CommandConfig = {
  description:
    "Imperial endorsement — approve, reject, or modify findings.",
  agent: "gov",
  template: `Review and endorse the following finding or recommendation.

## Finding
$ARGUMENTS

## Endorsement Process
1. **Evaluate** — Assess the finding against project goals.
2. **Decide** — Approve, reject, or request modifications.
3. **Document** — Record the decision with rationale.
4. **Dispatch** — If modifications needed, issue new decree.

## Endorsement Types
- **Approved** — Proceed with implementation.
- **Rejected** — Do not implement; document why.
- **Modified** — Implement with specified changes.

## Output Format
- Decision: APPROVED / REJECTED / MODIFIED
- Rationale: Why this decision was made
- Action items: What happens next
- New decrees: Any follow-up tasks issued`,
}

/* ------------------------------------------------------------------ */
/*  Ministry Commands (部门命令)                                       */
/* ------------------------------------------------------------------ */

const govMinistry: CommandConfig = {
  description:
    "Dispatch task to a specific Ministry (六部).",
  agent: "gov",
  template: `Dispatch the following task to the appropriate Ministry.

## Task
$ARGUMENTS

## Ministry Selection Guide
- **Personnel (吏部)** — Agent management, task assignment, hierarchy
- **Finance (户部)** — Resource management, cost optimization, token budget
- **Protocol (礼部)** — Communication standards, formatting, documentation
- **Military (兵部)** — Fast execution, parallel tasks, deployment
- **Justice (刑部)** — Code review, quality assurance, security audits
- **Engineering (工部)** — Architecture, implementation, technical design

## Dispatch Format
1. **Target Ministry** — Which ministry receives this task.
2. **Task Description** — Clear, specific deliverables.
3. **Context** — Background and relevant files.
4. **Constraints** — Boundaries and requirements.
5. **Output** — Expected format and location.`,
}

const govGovernor: CommandConfig = {
  description:
    "Dispatch task to a Regional Governor (地方官).",
  agent: "gov",
  template: `Dispatch the following task to a Regional Governor.

## Task
$ARGUMENTS

## Governor Assignment
1. **Region/Project** — Which project or region this governor manages.
2. **Task Description** — Clear, specific deliverables.
3. **Local Officials** — Available officials for delegation.
4. **Resources** — Budget and time constraints.
5. **Escalation Path** — When to escalate to Prime Minister.

## Governor Responsibilities
- Decompose tasks for local officials
- Monitor progress and provide guidance
- Collect and synthesize results
- Report back through the hierarchy`,
}

const govOfficial: CommandConfig = {
  description:
    "Dispatch task to a Local Official (基层官员).",
  agent: "gov",
  template: `Dispatch the following task to a Local Official.

## Task
$ARGUMENTS

## Official Assignment
1. **Task Description** — Clear, specific deliverables.
2. **Context** — Background and relevant files.
3. **Constraints** — Boundaries and requirements.
4. **Output** — Expected format and location.

## Official Responsibilities
- Execute assigned tasks precisely
- Report progress to supervisor
- Flag blockers immediately
- Maintain quality standards`,
}

/* ------------------------------------------------------------------ */
/*  Specialist Commands (专业命令)                                     */
/* ------------------------------------------------------------------ */

const govPlan: CommandConfig = {
  description:
    "Create a detailed implementation plan — architecture, task breakdown, and risk analysis.",
  agent: "architect",
  template: `Analyze the following task and produce a detailed implementation plan.

## Task
$ARGUMENTS

## Required Output
1. **Overview** — What we are building and why.
2. **Architecture** — Module structure, key interfaces, data flow.
3. **File manifest** — Every file to create or modify, with a one-line summary.
4. **Task breakdown** — Ordered steps the implementer can execute, noting dependencies.
5. **Risks & open questions** — Anything uncertain.

Read existing project files as needed to ground your plan in reality.
Do not write implementation code — only the plan.`,
}

const govImplement: CommandConfig = {
  description:
    "Implement a feature or task — write production code following the project's conventions.",
  agent: "implementer",
  template: `Implement the following task.  Follow the project's existing code style and conventions.

## Task
$ARGUMENTS

## Rules
- Read relevant existing files before writing code.
- Handle errors properly.
- After finishing, list every file you created or modified.`,
}

const govReview: CommandConfig = {
  description:
    "Review code for correctness, security, performance, and maintainability.",
  agent: "reviewer",
  template: `Perform a thorough code review on the following scope.

## Scope
$ARGUMENTS

If no specific scope is given, review all recently modified files in the project.

Use the standard review checklist:
- 🔴 Critical (must fix)
- 🟡 Warning (should fix)
- 🔵 Suggestion (nice to have)
- ✅ Praise (good patterns)

Include file paths, line numbers, and concrete fix suggestions.`,
}

const govTest: CommandConfig = {
  description:
    "Generate comprehensive tests — unit, integration, and edge-case coverage.",
  agent: "tester",
  template: `Write comprehensive tests for the following scope.

## Scope
$ARGUMENTS

If no specific scope is given, identify the most recently modified source files and write tests for them.

## Requirements
- Use the project's existing test framework and conventions.
- Cover happy path, edge cases, and error paths.
- Each test must be deterministic and test exactly one behavior.
- Use descriptive test names.`,
}

const govResearch: CommandConfig = {
  description:
    "Research a topic — libraries, APIs, best practices, or documentation.",
  agent: "researcher",
  template: `Research the following topic and provide actionable findings.

## Topic
$ARGUMENTS

## Required Output
1. **Summary** — Key findings in 2-3 sentences.
2. **Details** — Structured findings with sources.
3. **Recommendation** — What the team should do, with trade-offs.
4. **Sources** — Links or file paths consulted.

Cite your sources.  Do not fabricate URLs or API details.`,
}

/* ------------------------------------------------------------------ */
/*  Export all commands keyed by name                                 */
/* ------------------------------------------------------------------ */
export const commands: Record<string, CommandConfig> = {
  // Core Imperial Commands
  "gov-reign": govReign,
  "gov-decree": govDecree,
  "gov-report": govReport,
  "gov-endorse": govEndorse,
  
  // Ministry Commands
  "gov-ministry": govMinistry,
  "gov-governor": govGovernor,
  "gov-official": govOfficial,
  
  // Specialist Commands
  "gov-plan": govPlan,
  "gov-implement": govImplement,
  "gov-review": govReview,
  "gov-test": govTest,
  "gov-research": govResearch,
}
