<!-- Powered by BMAD™ Core -->

# Parallel Workflow Checklist

## Purpose

Validate that stories are properly prepared for parallel development workflows using GitHub worktrees, ensuring minimal conflicts and optimal development efficiency.

## Checklist Sections

### 1. Story Parallelization Assessment

**Story Analysis:**
- [ ] Story has been evaluated for parallelization potential
- [ ] Parallelization potential is High or Medium
- [ ] File conflicts have been identified and are manageable
- [ ] Dependencies between tasks are clearly mapped
- [ ] Integration points are well-defined

**Conflict Detection:**
- [ ] File ownership boundaries are clear
- [ ] No overlapping file modifications between sub-stories
- [ ] Shared data dependencies are minimal
- [ ] API changes are isolated to specific sub-stories
- [ ] Build artifacts don't conflict

### 2. Sub-story Structure

**Sub-story Creation:**
- [ ] Each sub-story has clear, focused scope
- [ ] Sub-stories are independent where possible
- [ ] Dependencies between sub-stories are minimal
- [ ] Each sub-story has its own acceptance criteria
- [ ] Integration requirements are clearly defined

**File Ownership:**
- [ ] Each sub-story owns specific files
- [ ] No file ownership conflicts between sub-stories
- [ ] Shared files are read-only or properly coordinated
- [ ] File modifications are isolated by component/feature
- [ ] Clear file ownership documentation exists

### 3. Worktree Configuration

**GitHub Worktrees Setup:**
- [ ] Worktree directories are properly created
- [ ] Each sub-story has its own branch
- [ ] Branch tracking is configured correctly
- [ ] Merge strategies are set up appropriately
- [ ] Conflict resolution is automated where possible

**Development Environment:**
- [ ] Each worktree has complete development environment
- [ ] Dependencies are installed in each worktree
- [ ] Environment variables are configured
- [ ] Build tools are available in each worktree
- [ ] Testing framework is set up

### 4. Synchronization and Integration

**Synchronization Setup:**
- [ ] Automated sync scripts are created
- [ ] Regular synchronization schedule is defined
- [ ] Conflict detection is automated
- [ ] Integration testing is configured
- [ ] Notification systems are set up

**Integration Planning:**
- [ ] Integration sequence is clearly defined
- [ ] Synchronization points are scheduled
- [ ] Merge strategy is documented
- [ ] Rollback procedures are defined
- [ ] Quality gates are established

### 5. Quality Assurance

**Testing Strategy:**
- [ ] Unit tests are isolated per sub-story
- [ ] Integration tests cover cross-sub-story interactions
- [ ] System tests validate complete story functionality
- [ ] Performance tests are included
- [ ] Regression tests are automated

**Code Quality:**
- [ ] Code review process is defined for each sub-story
- [ ] Coding standards are enforced
- [ ] Static analysis is configured
- [ ] Security scanning is included
- [ ] Documentation is updated

### 6. Risk Management

**Conflict Prevention:**
- [ ] File locking mechanisms are in place
- [ ] Merge conflict prevention is configured
- [ ] Communication protocols are established
- [ ] Escalation procedures are defined
- [ ] Monitoring is set up

**Contingency Planning:**
- [ ] Rollback procedures are tested
- [ ] Alternative approaches are documented
- [ ] Emergency merge procedures exist
- [ ] Recovery procedures are defined
- [ ] Lessons learned are captured

### 7. Documentation and Communication

**Documentation:**
- [ ] Worktree setup is documented
- [ ] Development workflow is documented
- [ ] Integration procedures are documented
- [ ] Troubleshooting guide exists
- [ ] Best practices are documented

**Communication:**
- [ ] Team communication protocols are established
- [ ] Status reporting is automated
- [ ] Progress tracking is configured
- [ ] Issue escalation is defined
- [ ] Knowledge sharing is facilitated

### 8. Performance and Monitoring

**Performance Monitoring:**
- [ ] Development velocity is tracked
- [ ] Merge conflict frequency is monitored
- [ ] Integration test success rate is measured
- [ ] Code quality metrics are collected
- [ ] Resource usage is monitored

**Optimization:**
- [ ] Worktree performance is optimized
- [ ] Sync frequency is tuned
- [ ] Conflict resolution is automated
- [ ] Integration testing is optimized
- [ ] Development workflow is streamlined

## Validation Criteria

### Pass Criteria
- All checklist items are completed
- No critical conflicts identified
- Integration plan is feasible
- Quality gates are established
- Risk mitigation is adequate

### Fail Criteria
- Critical file conflicts exist
- Integration plan is not feasible
- Quality gates are missing
- Risk mitigation is inadequate
- Documentation is incomplete

## Escalation

**Escalate to Architect if:**
- Complex architectural changes are needed
- Integration patterns require redesign
- Performance issues are identified
- Security concerns are raised

**Escalate to Product Owner if:**
- Story scope needs adjustment
- Business requirements are unclear
- Priority conflicts exist
- Resource allocation is needed

## Key Principles

- **Safety First:** Only parallelize when safe to do so
- **Clear Boundaries:** Define strict ownership and responsibilities
- **Regular Sync:** Maintain synchronization to prevent drift
- **Quality Gates:** Validate at each integration point
- **Conflict Prevention:** Proactive conflict detection and resolution
- **Continuous Improvement:** Learn from each parallel workflow

