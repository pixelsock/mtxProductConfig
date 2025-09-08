<!-- Powered by BMAD™ Core -->

# Setup GitHub Worktrees Task

## Purpose

Set up GitHub worktrees for parallel development workflows, enabling multiple developers or AI agents to work on different sub-stories simultaneously without conflicts.

## Prerequisites

- Git repository with main branch
- Sub-stories have been created and planned
- Worktree configuration is available
- Sufficient disk space for multiple worktrees

## Inputs

```yaml
required:
  - worktree_config: Configuration from split-story task
  - repository_path: Path to the main repository
  - sub_stories: List of sub-stories to set up worktrees for
```

## Process

### 1. Worktree Directory Setup

**Create worktree directories:**
```bash
# Create worktree base directory
mkdir -p worktrees

# For each sub-story
git worktree add worktrees/{sub_story_name} -b {sub_story_branch}
```

### 2. Branch Management

**Set up branches for each sub-story:**
- Create feature branch for each sub-story
- Set up tracking relationships
- Configure merge strategies
- Set up branch protection rules

### 3. File Ownership Setup

**Configure file ownership:**
- Create `.gitattributes` for conflict resolution
- Set up file locking mechanisms
- Configure merge strategies per file type
- Set up automated conflict detection

### 4. Development Environment

**Set up development environment for each worktree:**
- Install dependencies
- Configure environment variables
- Set up build tools
- Configure IDE/editor settings

### 5. Synchronization Setup

**Configure synchronization:**
- Set up automated sync scripts
- Configure conflict detection
- Set up integration testing
- Configure notification systems

## Output

### Worktree Structure

```
project-root/
├── .git/
├── worktrees/
│   ├── story-1-a/
│   │   ├── src/
│   │   ├── tests/
│   │   └── package.json
│   ├── story-1-b/
│   │   ├── src/
│   │   ├── tests/
│   │   └── package.json
│   └── story-1-c/
│       ├── src/
│       ├── tests/
│       └── package.json
├── scripts/
│   ├── sync-worktrees.sh
│   ├── merge-sub-stories.sh
│   └── conflict-detection.sh
└── .gitattributes
```

### Git Configuration

**`.gitattributes` for conflict resolution:**
```
# Auto-merge strategies
*.js merge=ours
*.ts merge=ours
*.tsx merge=ours
*.json merge=union
*.md merge=union

# Binary files
*.png binary
*.jpg binary
*.svg binary
```

**Branch configuration:**
```bash
# Set up branch tracking
git config branch.{sub_story_branch}.remote origin
git config branch.{sub_story_branch}.merge refs/heads/{sub_story_branch}

# Set up merge strategy
git config merge.ours.driver true
```

### Synchronization Scripts

**`scripts/sync-worktrees.sh`:**
```bash
#!/bin/bash
# Sync all worktrees with main branch

echo "Syncing worktrees with main branch..."

# Update main branch
git checkout main
git pull origin main

# Sync each worktree
for worktree in worktrees/*/; do
    if [ -d "$worktree" ]; then
        echo "Syncing $worktree..."
        cd "$worktree"
        git fetch origin
        git merge origin/main
        cd - > /dev/null
    fi
done

echo "Sync complete!"
```

**`scripts/merge-sub-stories.sh`:**
```bash
#!/bin/bash
# Merge completed sub-stories back to main

echo "Merging sub-stories to main..."

# Switch to main branch
git checkout main

# Merge each completed sub-story
for branch in story-*-*; do
    if git show-ref --verify --quiet refs/heads/$branch; then
        echo "Merging $branch..."
        git merge $branch --no-ff -m "Merge $branch into main"
    fi
done

echo "Merge complete!"
```

### Development Workflow

**For each sub-story worktree:**
1. **Setup:**
   ```bash
   cd worktrees/{sub_story_name}
   npm install
   cp .env.example .env
   ```

2. **Development:**
   ```bash
   # Make changes
   git add .
   git commit -m "Implement {specific feature}"
   git push origin {sub_story_branch}
   ```

3. **Sync with main:**
   ```bash
   # Pull latest changes from main
   git fetch origin
   git merge origin/main
   ```

4. **Integration:**
   ```bash
   # Run integration tests
   npm run test:integration
   
   # Merge to main when ready
   git checkout main
   git merge {sub_story_branch}
   ```

### Conflict Resolution

**Automated conflict detection:**
```bash
#!/bin/bash
# Check for potential conflicts

echo "Checking for conflicts..."

for worktree in worktrees/*/; do
    if [ -d "$worktree" ]; then
        echo "Checking $worktree..."
        cd "$worktree"
        
        # Check for merge conflicts
        if git status | grep -q "both modified"; then
            echo "CONFLICT DETECTED in $worktree"
            git status
        fi
        
        cd - > /dev/null
    fi
done
```

## Quality Assurance

### Worktree Validation

**Each worktree must:**
- Have its own branch
- Be properly configured
- Have all necessary dependencies
- Be able to build and test independently

### Integration Testing

**Cross-worktree testing:**
- Integration tests between worktrees
- Conflict detection and resolution
- Merge testing
- Performance validation

## Monitoring and Maintenance

### Regular Maintenance

**Daily tasks:**
- Sync all worktrees with main
- Check for conflicts
- Run integration tests
- Update documentation

**Weekly tasks:**
- Clean up completed branches
- Optimize worktree performance
- Review conflict patterns
- Update synchronization scripts

### Monitoring

**Track metrics:**
- Merge conflict frequency
- Integration test success rate
- Development velocity
- Code quality metrics

## Key Principles

- **Isolation:** Each worktree is independent
- **Synchronization:** Regular sync with main branch
- **Conflict Prevention:** Proactive conflict detection
- **Integration Planning:** Plan for merging sub-stories
- **Quality Gates:** Validate at each step
- **Automation:** Automate repetitive tasks

