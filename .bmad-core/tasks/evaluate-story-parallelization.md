<!-- Powered by BMAD™ Core -->

# Evaluate Story Parallelization Task

## Purpose

Analyze a story to determine if it can be safely split into parallel sub-stories for GitHub worktree workflows without causing conflicts or dependencies.

## Inputs

```yaml
required:
  - story_file: Path to the story file to evaluate
  - project_structure: Current project file structure and dependencies
  - existing_stories: List of other stories in progress or planned
```

## Process

### 1. Story Analysis

**Read and analyze the story:**
- Extract all tasks and subtasks
- Identify file dependencies and modifications
- Map component interactions and data flow
- Assess complexity and scope

### 2. Parallelization Assessment

**Evaluate parallelization potential:**

**High Parallelization Potential:**
- Independent file modifications (different directories/components)
- No shared data dependencies
- Clear separation of concerns
- Different technology stacks or layers

**Medium Parallelization Potential:**
- Some shared files but different sections
- Read-only dependencies on shared data
- Sequential dependencies that can be managed

**Low/No Parallelization Potential:**
- Heavy file overlap and conflicts
- Complex data dependencies
- Shared state modifications
- Sequential workflow requirements

### 3. Conflict Detection

**Identify potential conflicts:**
- **File Conflicts:** Same files modified by different sub-stories
- **Data Conflicts:** Shared data structures or state
- **Integration Conflicts:** API changes affecting multiple components
- **Build Conflicts:** Shared build artifacts or configurations
- **Test Conflicts:** Shared test files or test data

### 4. Dependency Mapping

**Map story dependencies:**
- **Internal Dependencies:** Tasks that must complete before others
- **External Dependencies:** Dependencies on other stories
- **Resource Dependencies:** Shared resources or services
- **Timing Dependencies:** Order-sensitive operations

### 5. Risk Assessment

**Evaluate parallelization risks:**
- **Merge Conflicts:** Likelihood of Git merge conflicts
- **Integration Issues:** Problems when combining sub-story outputs
- **Testing Complexity:** Increased testing overhead
- **Coordination Overhead:** Communication and synchronization needs

## Output

### Parallelization Report

```markdown
# Story Parallelization Analysis: {Story Title}

## Parallelization Potential: {High/Medium/Low}

### Analysis Summary
- **Total Tasks:** {number}
- **Parallelizable Tasks:** {number}
- **Conflicting Tasks:** {number}
- **Sequential Dependencies:** {number}

### Recommended Approach
- **Split Strategy:** {Independent/Sequential/Mixed}
- **Number of Sub-stories:** {recommended count}
- **Worktree Assignment:** {suggested worktree structure}

### Identified Conflicts
- **File Conflicts:** {list of conflicting files}
- **Data Dependencies:** {shared data structures}
- **Integration Points:** {API or service dependencies}

### Risk Assessment
- **Merge Risk:** {High/Medium/Low}
- **Integration Risk:** {High/Medium/Low}
- **Coordination Overhead:** {High/Medium/Low}

### Recommendations
- **Proceed with Parallelization:** {Yes/No/Conditional}
- **Required Safeguards:** {specific measures needed}
- **Alternative Approach:** {if parallelization not recommended}
```

### Sub-story Structure (if recommended)

```yaml
sub_stories:
  - id: "{story_id}.a"
    title: "{Sub-story A Title}"
    focus: "{specific component/feature}"
    files: ["{list of files to modify}"]
    dependencies: []
    worktree: "worktree-a"
    
  - id: "{story_id}.b"
    title: "{Sub-story B Title}"
    focus: "{specific component/feature}"
    files: ["{list of files to modify}"]
    dependencies: ["{story_id}.a"]
    worktree: "worktree-b"
```

## Decision Criteria

### Proceed with Parallelization if:
- Parallelization Potential is High or Medium
- File conflicts are minimal or manageable
- Clear separation of concerns exists
- Merge risk is Low or Medium

### Do NOT parallelize if:
- Heavy file overlap (>50% shared files)
- Complex data dependencies
- Sequential workflow requirements
- High merge conflict risk

## Integration with GitHub Worktrees

**Worktree Structure:**
```
project-root/
├── worktree-a/     # Sub-story A
├── worktree-b/     # Sub-story B
└── worktree-c/     # Sub-story C
```

**Coordination Requirements:**
- Clear file ownership boundaries
- Regular synchronization points
- Conflict resolution procedures
- Integration testing strategy

## Key Principles

- **Safety First:** Only parallelize when conflicts are minimal
- **Clear Boundaries:** Define strict file and component ownership
- **Regular Sync:** Establish synchronization checkpoints
- **Conflict Prevention:** Proactive conflict detection and resolution
- **Integration Planning:** Plan for combining sub-story outputs

