---
description: Refine and improve existing Agent OS configuration
globs:
alwaysApply: false
version: 1.0
encoding: UTF-8
---

# Refine Existing Agent OS Project

## Overview

Analyze and refine an existing Agent OS installation to ensure completeness, accuracy, and optimal configuration. This workflow improves project standards, documentation, and structure based on lessons learned and current best practices.

<pre_flight_check>
  EXECUTE: @.agent-os/instructions/meta/pre-flight.md
</pre_flight_check>

<process_flow>

<step number="1" subagent="context-fetcher" name="analyze_current_installation">

### Step 1: Analyze Current Installation

Use the context-fetcher subagent to analyze the existing Agent OS setup and identify areas for improvement.

<analysis_areas>
  <directory_structure>
    - Check for missing Agent OS directories (.agent-os/instructions, standards, recaps)
    - Verify Claude Code integration (.claude/commands, agents)
    - Assess completeness of product documentation
  </directory_structure>
  <documentation_accuracy>
    - Compare tech-stack.md with actual package.json and dependencies
    - Verify mission.md reflects current product state
    - Check roadmap.md alignment with completed work
  </documentation_accuracy>
  <configuration_consistency>
    - Validate standards match project conventions
    - Check instructions are project-appropriate
    - Ensure commands are properly configured
  </configuration_consistency>
</analysis_areas>

<instructions>
  ACTION: Perform comprehensive analysis of existing Agent OS installation
  IDENTIFY: Missing components, outdated documentation, configuration gaps
  DOCUMENT: Current state and improvement opportunities
</instructions>

</step>

<step number="2" subagent="file-creator" name="update_directory_structure">

### Step 2: Update Directory Structure

Use the file-creator subagent to create missing directories and ensure complete Agent OS structure.

<required_structure>
  .agent-os/
  ├── instructions/         # Core workflow instructions
  ├── standards/           # Code style and best practices
  ├── product/            # Product documentation
  ├── specs/              # Feature specifications
  └── recaps/             # Execution summaries

  .claude/                # Claude Code integration
  ├── commands/           # Slash commands
  └── agents/             # Specialized agents
</required_structure>

<update_actions>
  - CREATE: Missing directories with proper permissions
  - COPY: Global standards to project-specific location
  - SYNC: Instructions from latest Agent OS version
  - VALIDATE: Directory structure completeness
</update_actions>

</step>

<step number="3" subagent="context-fetcher" name="validate_tech_stack">

### Step 3: Validate Technical Stack Documentation

Use the context-fetcher subagent to compare documented tech stack with actual project implementation.

<validation_targets>
  <package_analysis>
    - Parse package.json for actual dependencies
    - Identify framework versions and build tools
    - Check for discrepancies with tech-stack.md
  </package_analysis>
  <codebase_analysis>
    - Analyze import patterns and module usage
    - Identify state management solutions
    - Check deployment configuration
  </codebase_analysis>
</validation_targets>

<correction_strategy>
  IF discrepancies_found:
    UPDATE tech-stack.md to reflect actual implementation
    PRESERVE project-specific customizations
    DOCUMENT migration paths and future considerations
  ELSE:
    CONFIRM accuracy and completeness
</correction_strategy>

</step>

<step number="4" subagent="file-creator" name="update_product_documentation">

### Step 4: Update Product Documentation

Use the file-creator subagent to refine product documentation based on current implementation and lessons learned.

<documentation_updates>
  <mission_refinement>
    - Verify product description matches current state
    - Update feature lists with completed work
    - Refine user personas based on development insights
  </mission_refinement>
  <roadmap_alignment>
    - Mark completed phases and features
    - Add "Phase 0: Already Completed" for existing work
    - Adjust future phases based on technical discoveries
  </roadmap_alignment>
  <technical_decisions>
    - Document architectural choices made during development
    - Record trade-offs and alternatives considered
    - Update future migration paths
  </technical_decisions>
</documentation_updates>

</step>

<step number="5" subagent="file-creator" name="enhance_claude_integration">

### Step 5: Enhance Claude Code Integration

Use the file-creator subagent to ensure comprehensive Claude Code command and agent setup.

<claude_enhancements>
  <command_completeness>
    - Verify all core Agent OS commands are present
    - Create project-specific commands as needed
    - Update command descriptions for clarity
  </command_completeness>
  <agent_optimization>
    - Ensure all specialized agents are available
    - Add project-specific agents if beneficial
    - Verify agent configurations are current
  </agent_optimization>
</claude_enhancements>

</step>

<step number="6" subagent="context-fetcher" name="validate_standards_alignment">

### Step 6: Validate Standards Alignment

Use the context-fetcher subagent to ensure project standards match actual coding patterns and preferences.

<standards_validation>
  <code_style_check>
    - Compare standards with actual code formatting
    - Identify inconsistencies in naming conventions
    - Check import patterns and file organization
  </code_style_check>
  <best_practices_review>
    - Validate practices against current implementation
    - Update recommendations based on project experience
    - Document project-specific variations
  </best_practices_review>
</standards_validation>

</step>

<step number="7" name="generate_improvement_summary">

### Step 7: Generate Improvement Summary

Create a comprehensive summary of refinements made and recommendations for ongoing maintenance.

<summary_components>
  <changes_made>
    - List all structural improvements
    - Document updated files and their changes
    - Highlight major corrections or additions
  </changes_made>
  <recommendations>
    - Suggest maintenance practices
    - Identify future improvement opportunities
    - Provide guidance for team adoption
  </recommendations>
  <next_steps>
    - Outline immediate actions needed
    - Suggest review process for changes
    - Recommend periodic refinement schedule
  </next_steps>
</summary_components>

</step>

</process_flow>

<post_flight_check>
  EXECUTE: @.agent-os/instructions/meta/post-flight.md
</post_flight_check>