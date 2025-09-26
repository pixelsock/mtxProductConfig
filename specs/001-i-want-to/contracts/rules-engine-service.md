# API Contract: Rules Engine Service

**Service**: RulesEngineService  
**Version**: 1.0.0  
**Date**: 2025-09-25

## Interface Definition

### validateOptionConfiguration
**Purpose**: Validate if a configuration is allowed by business rules

```typescript
interface ValidateOptionConfigurationRequest {
  productLineId: number;
  productId?: number;
  selectedOptions: Record<string, string>; // collection -> itemId mapping
}

interface ValidateOptionConfigurationResponse {
  success: boolean;
  data: {
    isValid: boolean;
    violations: RuleViolation[];
    suggestions?: OptionSuggestion[];
  };
  error?: string;
}
```

### getApplicableRules
**Purpose**: Retrieve all rules that apply to current product/product line context

```typescript
interface GetApplicableRulesRequest {
  productLineId: number;
  productId?: number;
  context?: Record<string, any>;
}

interface GetApplicableRulesResponse {
  success: boolean;
  data: {
    rules: Database['public']['Tables']['rules']['Row'][];
    totalRules: number;
  };
  error?: string;
}
```

### evaluateRules
**Purpose**: Evaluate rules against current configuration state

```typescript
interface EvaluateRulesRequest {
  rules: Database['public']['Tables']['rules']['Row'][];
  currentState: ConfigurationState;
}

interface EvaluateRulesResponse {
  success: boolean;
  data: {
    allowedCollections: string[];
    disabledItems: Record<string, string[]>; // collection -> disabled item IDs
    requiredSelections: Record<string, string[]>; // collection -> required item IDs
    reasonsMap: Record<string, string>; // itemId -> reason mapping
  };
  error?: string;
}
```

## Supporting Types

### Rule (from Database Schema)
```typescript
interface Rule {
  id: string;
  name: string | null;
  priority: number | null;
  if_this: Json | null; // JSON condition logic
  then_that: Json | null; // JSON action logic
}
```

### ConfigurationState
```typescript
interface ConfigurationState {
  productLineId: number;
  productId?: number;
  selectedOptions: Record<string, string>; // collection -> selected item ID
  availableCollections: string[];
}
```

### RuleViolation
```typescript
interface RuleViolation {
  ruleId: string;
  ruleName: string | null;
  collection: string;
  itemId: string;
  message: string;
  severity: 'error' | 'warning';
}
```

### OptionSuggestion
```typescript
interface OptionSuggestion {
  collection: string;
  itemId: string;
  reason: string;
  confidence: number; // 0-1 scale
}
```

## Rules Engine Logic

### JSON Rule Structure
Based on the existing `rules` table with `if_this` and `then_that` JSON fields:

```typescript
// Example if_this condition structure
interface RuleCondition {
  product_line?: number[];
  product?: number[];
  collections?: {
    [collection: string]: string[]; // collection -> allowed item IDs
  };
  combinations?: {
    [collection1: string]: {
      [collection2: string]: string[]; // interdependent selections
    };
  };
}

// Example then_that action structure  
interface RuleAction {
  type: 'disable' | 'require' | 'suggest' | 'hide';
  target: {
    collection: string;
    items?: string[]; // specific item IDs, or all if omitted
  };
  message: string;
}
```

### Rule Evaluation Process
1. **Load rules** ordered by `priority` (higher priority first)
2. **Parse JSON conditions** from `if_this` field
3. **Evaluate conditions** against current configuration state
4. **Apply actions** from `then_that` field when conditions match
5. **Return filtered options** with reasoning

### Example Rules
```json
// Rule: Disable certain sizes for specific mirror styles
{
  "id": "rule_001",
  "name": "Large sizes not available for beveled mirrors",
  "priority": 100,
  "if_this": {
    "collections": {
      "mirror_styles": ["beveled_style_id"]
    }
  },
  "then_that": {
    "type": "disable",
    "target": {
      "collection": "sizes",
      "items": ["large_size_id", "extra_large_size_id"]
    },
    "message": "Large sizes not available with beveled mirror style"
  }
}
```

## Performance Requirements

### Caching Strategy
- Rules cached globally (10 minutes TTL)
- Rule evaluation results cached by configuration hash (2 minutes TTL)
- Clear cache when rules are updated in admin

### Performance Targets
- Rule loading: < 50ms
- Rule evaluation: < 50ms  
- Total filtering time: < 100ms (including rule evaluation)
- Support up to 200 active rules
- Batch processing for configuration changes

## Business Logic

### Rule Priority Handling
- Higher `priority` values execute first
- Rules with null priority execute last
- Conflicting rules: higher priority wins
- Actions are cumulative unless conflicting

### Rule Types
- **disable**: Remove options from available selections
- **require**: Force selection of specific options
- **suggest**: Recommend options (non-blocking)
- **hide**: Remove from UI but allow if selected programmatically

### Error Handling
- Invalid JSON in rules: Log error and skip rule
- Missing referenced collections/items: Log warning and continue
- Rule evaluation timeout: Return unfiltered options with warning