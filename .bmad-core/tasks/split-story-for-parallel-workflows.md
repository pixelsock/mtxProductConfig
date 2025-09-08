<!-- Powered by BMAD™ Core -->

# Split Story for Parallel Workflows Task

## Purpose

Split a validated story into multiple sub-stories optimized for parallel development using GitHub worktrees, ensuring minimal conflicts and clear ownership boundaries.

## Prerequisites

- Story has been evaluated for parallelization potential
- Parallelization assessment shows High or Medium potential
- File conflicts have been identified and are manageable

## Inputs

```yaml
required:
  - story_file: Path to the original story
  - parallelization_report: Output from evaluate-story-parallelization task
  - project_structure: Current project file structure
  - worktree_config: GitHub worktree configuration
```

## Process

### 1. Sub-story Planning

**Based on parallelization report:**
- Identify optimal split points
- Define clear ownership boundaries
- Plan dependency sequencing
- Assign worktree assignments

### 2. File Ownership Assignment

**Distribute files among sub-stories:**
- **Primary Files:** Core files for each sub-story
- **Shared Files:** Files that need coordination
- **Read-only Files:** Files that can be accessed by multiple sub-stories
- **Excluded Files:** Files that should not be modified

### 3. Dependency Management

**Map sub-story dependencies:**
- **Sequential Dependencies:** Sub-stories that must complete in order
- **Parallel Dependencies:** Sub-stories that can run simultaneously
- **Integration Points:** Where sub-stories will connect
- **Synchronization Points:** Regular merge/sync checkpoints

### 4. Sub-story Creation

**For each sub-story:**
- Extract relevant tasks and subtasks
- Define clear acceptance criteria
- Set up worktree-specific context
- Plan integration requirements

### 5. Conflict Prevention Setup

**Establish safeguards:**
- File ownership locks
- Merge conflict prevention
- Integration testing strategy
- Communication protocols

## Output

### Sub-story Files

Create separate story files for each sub-story:

```markdown
# Story {epic}.{story}.{sub_id}: {Sub-story Title}

## Status: Draft

## Story
As a {user_type},
I want {specific_capability},
So that {value_delivered}.

## Context
**Parent Story:** {original_story_id}
**Worktree:** {worktree_name}
**Parallel Development:** Yes
**Dependencies:** {list of dependent sub-stories}

## Sub-story Scope
**Primary Focus:** {specific component/feature}
**File Ownership:** {list of owned files}
**Integration Points:** {where this connects to other sub-stories}

## Acceptance Criteria
1. {Sub-story specific AC 1}
2. {Sub-story specific AC 2}
3. Integration with {other_sub_story} works correctly
4. No regression in existing functionality

## Tasks / Subtasks
- [ ] Task 1: {Sub-story specific task}
- [ ] Task 2: {Sub-story specific task}
- [ ] Task 3: Integration testing with {other_sub_story}
- [ ] Task 4: Merge preparation and conflict resolution

## Parallel Development Notes
**Coordination Required:**
- Sync with {other_sub_story} on {specific_integration_point}
- Merge conflicts possible in: {list of shared files}
- Integration testing needed with: {other_sub_stories}

**Worktree Setup:**
- Clone repository to: {worktree_path}
- Branch: {sub_story_branch}
- Sync schedule: {daily/weekly/as_needed}

## Definition of Done
- [ ] All sub-story acceptance criteria met
- [ ] Integration with other sub-stories verified
- [ ] No merge conflicts with other sub-stories
- [ ] Code reviewed and approved
- [ ] Integration tests pass
- [ ] Ready for parent story integration
```

### Worktree Configuration

```yaml
worktrees:
  {sub_story_a}:
    path: "worktree-a"
    branch: "story-{epic}-{story}-a"
    files: ["{list of owned files}"]
    dependencies: []
    
  {sub_story_b}:
    path: "worktree-b"
    branch: "story-{epic}-{story}-b"
    files: ["{list of owned files}"]
    dependencies: ["{sub_story_a}"]
    
  {sub_story_c}:
    path: "worktree-c"
    branch: "story-{epic}-{story}-c"
    files: ["{list of owned files}"]
    dependencies: ["{sub_story_a}", "{sub_story_b}"]
```

### Integration Plan

```markdown
# Integration Plan for Story {epic}.{story}

## Integration Sequence
1. **Phase 1:** Complete {sub_story_a} (no dependencies)
2. **Phase 2:** Complete {sub_story_b} (depends on A)
3. **Phase 3:** Complete {sub_story_c} (depends on A & B)
4. **Phase 4:** Integration testing and merge

## Synchronization Points
- **Daily:** Sync all worktrees with main branch
- **Milestone:** Integration testing after each sub-story completion
- **Final:** Merge all sub-stories back to main

## Conflict Resolution
- **File Conflicts:** {resolution_strategy}
- **Integration Issues:** {troubleshooting_approach}
- **Merge Conflicts:** {merge_strategy}

## Testing Strategy
- **Unit Tests:** Each sub-story tests its own components
- **Integration Tests:** Cross-sub-story integration testing
- **System Tests:** Full story integration testing
```

## Quality Assurance

### Sub-story Validation

**Each sub-story must:**
- Have clear, testable acceptance criteria
- Own specific files without overlap
- Have defined integration points
- Include conflict prevention measures

### Integration Validation

**Overall integration must:**
- Complete all original story requirements
- Maintain system integrity
- Pass all integration tests
- Meet performance requirements

## Risk Mitigation

### Conflict Prevention
- Clear file ownership boundaries
- Regular synchronization
- Automated conflict detection
- Communication protocols

### Integration Safety
- Incremental integration testing
- Rollback procedures
- Quality gates at each phase
- Continuous integration monitoring

## Key Principles

- **Clear Ownership:** Each sub-story owns specific files
- **Minimal Overlap:** Reduce shared file modifications
- **Regular Sync:** Frequent synchronization to prevent drift
- **Integration Planning:** Plan for combining sub-story outputs
- **Quality Gates:** Validate at each integration point
- **Conflict Prevention:** Proactive conflict detection and resolution

