/**
 * Test script to verify the plugin can be loaded correctly
 */

import plugin from "./dist/index.js";

console.log("Plugin ID:", plugin.id);
console.log("Has server function:", typeof plugin.server === "function");

// Test server function
const mockInput = {
  client: {},
  project: "test-project",
  directory: process.cwd(),
};

try {
  const hooks = await plugin.server(mockInput, {});
  console.log("Server returned hooks:", Object.keys(hooks));
  console.log("Has config hook:", typeof hooks.config === "function");
  
  // Test config hook
  const mockConfig = {};
  hooks.config(mockConfig);
  console.log("Config after hook:", {
    hasAgents: !!mockConfig.agent,
    agentCount: mockConfig.agent ? Object.keys(mockConfig.agent).length : 0,
    hasCommands: !!mockConfig.command,
    commandCount: mockConfig.command ? Object.keys(mockConfig.command).length : 0,
    defaultAgent: mockConfig.default_agent,
    subagentDepth: mockConfig.subagent_depth,
  });
  
  console.log("\n✅ Plugin loads correctly!");
} catch (error) {
  console.error("\n❌ Plugin load failed:", error);
  process.exit(1);
}
