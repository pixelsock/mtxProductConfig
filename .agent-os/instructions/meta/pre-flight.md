---
description: Common Pre-Flight Steps for Agent OS Instructions
globs:
alwaysApply: false
version: 1.0
encoding: UTF-8
---

# Pre-Flight Rules

- IMPORTANT: For any step that specifies a subagent in the subagent="" XML attribute you MUST use the specified subagent to perform the instructions for that step.

- Process XML blocks sequentially

- Read and execute every numbered step in the process_flow EXACTLY as the instructions specify.

- If you need clarification on any details of your current task, stop and ask the user specific numbered questions and then continue once you have all of the information you need.

- Use exact templates as provided

- Always consult the `docs/` directory before making changes:
  - Use `docs/api-checks.md` to validate Directus endpoints, schemas, and assets from the terminal.
  - Update `docs/api-checks.md` after any schema/rules change or when adding new validation commands.
  - Prefer terminal checks (cURL/Node, MCP tools) over writing new test files.
