/**
 * Enhanced Rules Engine - 100% Data-Driven
 *
 * Processes rules from the rules table with if_this/then_that JSON logic.
 * Supports complex conditions, actions, and cross-field dependencies.
 *
 * NO HARDCODED RULES - Everything comes from Supabase rules table
 */

import type { Rule } from './enhanced-configurator-client';

export interface RuleCondition {
  field?: string;
  value?: any;
  operator?: 'eq' | 'neq' | 'in' | 'nin' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'empty' | 'nempty';
  and?: RuleCondition[];
  or?: RuleCondition[];
}

export interface RuleAction {
  action: 'disable' | 'enable' | 'hide' | 'show' | 'require' | 'set_value' | 'clear_value';
  field: string;
  value?: any;
  options?: number[] | string[];
}

export interface ProcessedRule {
  id: string;
  name: string;
  priority: number;
  condition: RuleCondition;
  actions: RuleAction[];
}

export interface RuleEvaluationResult {
  disabledOptions: Record<string, number[]>;
  hiddenOptions: Record<string, number[]>;
  requiredFields: string[];
  setValues: Record<string, any>;
  clearedFields: string[];
}

/**
 * Parse and process raw rules from the database
 */
export function processRules(rules: Rule[]): ProcessedRule[] {
  const processed: ProcessedRule[] = [];

  for (const rule of rules) {
    try {
      if (!rule.if_this || !rule.then_that) {
        console.warn('Skipping invalid rule:', rule.id);
        continue;
      }

      const condition = parseCondition(rule.if_this);
      const actions = parseActions(rule.then_that);

      if (!condition || actions.length === 0) {
        console.warn('Failed to parse rule:', rule.id);
        continue;
      }

      processed.push({
        id: rule.id,
        name: rule.name || `Rule ${rule.id}`,
        priority: rule.priority || 0,
        condition,
        actions
      });

    } catch (error) {
      console.error(`Error processing rule ${rule.id}:`, error);
    }
  }

  return processed.sort((a, b) => b.priority - a.priority);
}

/**
 * Parse if_this condition from JSON
 */
function parseCondition(ifThis: any): RuleCondition | null {
  if (!ifThis || typeof ifThis !== 'object') {
    return null;
  }

  // Handle simple field-value conditions
  if (ifThis.field && ifThis.value !== undefined) {
    return {
      field: ifThis.field,
      value: ifThis.value,
      operator: ifThis.operator || 'eq'
    };
  }

  // Handle complex conditions with AND/OR
  const condition: RuleCondition = {};

  if (ifThis.and && Array.isArray(ifThis.and)) {
    condition.and = ifThis.and
      .map(parseCondition)
      .filter((c: RuleCondition | null): c is RuleCondition => c !== null);
  }

  if (ifThis.or && Array.isArray(ifThis.or)) {
    condition.or = ifThis.or
      .map(parseCondition)
      .filter((c: RuleCondition | null): c is RuleCondition => c !== null);
  }

  // Handle direct field conditions at root level
  for (const [key, value] of Object.entries(ifThis)) {
    if (key !== 'and' && key !== 'or' && typeof value !== 'object') {
      condition.field = key;
      condition.value = value;
      condition.operator = 'eq';
      break;
    }
  }

  return Object.keys(condition).length > 0 ? condition : null;
}

/**
 * Parse then_that actions from JSON
 */
function parseActions(thenThat: any): RuleAction[] {
  if (!thenThat || typeof thenThat !== 'object') {
    return [];
  }

  const actions: RuleAction[] = [];

  // Handle array of actions
  if (Array.isArray(thenThat)) {
    for (const actionObj of thenThat) {
      const action = parseAction(actionObj);
      if (action) {
        actions.push(action);
      }
    }
    return actions;
  }

  // Handle single action object
  const action = parseAction(thenThat);
  if (action) {
    actions.push(action);
  }

  // Handle field-level actions
  for (const [field, value] of Object.entries(thenThat)) {
    if (typeof value === 'string') {
      // Handle simple actions like { "frame_colors": "disable" }
      actions.push({
        action: value as RuleAction['action'],
        field
      });
    } else if (typeof value === 'object' && value !== null) {
      // Handle complex actions like { "frame_colors": { "disable": [1, 2, 3] } }
      for (const [subAction, subValue] of Object.entries(value)) {
        actions.push({
          action: subAction as RuleAction['action'],
          field,
          value: subValue,
          options: Array.isArray(subValue) ? subValue : undefined
        });
      }
    }
  }

  return actions;
}

/**
 * Parse individual action object
 */
function parseAction(actionObj: any): RuleAction | null {
  if (!actionObj || typeof actionObj !== 'object') {
    return null;
  }

  if (actionObj.action && actionObj.field) {
    return {
      action: actionObj.action,
      field: actionObj.field,
      value: actionObj.value,
      options: actionObj.options
    };
  }

  return null;
}

/**
 * Evaluate all rules against current configuration
 */
export function evaluateRules(
  rules: ProcessedRule[],
  configuration: Record<string, any>
): RuleEvaluationResult {
  const result: RuleEvaluationResult = {
    disabledOptions: {},
    hiddenOptions: {},
    requiredFields: [],
    setValues: {},
    clearedFields: []
  };

  for (const rule of rules) {
    if (evaluateCondition(rule.condition, configuration)) {
      applyActions(rule.actions, result);
    }
  }

  return result;
}

/**
 * Evaluate a single condition
 */
export function evaluateCondition(
  condition: RuleCondition,
  configuration: Record<string, any>
): boolean {
  // Handle AND conditions
  if (condition.and) {
    return condition.and.every(c => evaluateCondition(c, configuration));
  }

  // Handle OR conditions
  if (condition.or) {
    return condition.or.some(c => evaluateCondition(c, configuration));
  }

  // Handle simple field condition
  if (condition.field) {
    const fieldValue = configuration[condition.field];
    const expectedValue = condition.value;
    const operator = condition.operator || 'eq';

    switch (operator) {
      case 'eq':
        return fieldValue === expectedValue;

      case 'neq':
        return fieldValue !== expectedValue;

      case 'in':
        return Array.isArray(expectedValue) && expectedValue.includes(fieldValue);

      case 'nin':
        return Array.isArray(expectedValue) && !expectedValue.includes(fieldValue);

      case 'gt':
        return Number(fieldValue) > Number(expectedValue);

      case 'gte':
        return Number(fieldValue) >= Number(expectedValue);

      case 'lt':
        return Number(fieldValue) < Number(expectedValue);

      case 'lte':
        return Number(fieldValue) <= Number(expectedValue);

      case 'contains':
        return String(fieldValue).includes(String(expectedValue));

      case 'empty':
        return !fieldValue || fieldValue === '' || (Array.isArray(fieldValue) && fieldValue.length === 0);

      case 'nempty':
        return fieldValue && fieldValue !== '' && (!Array.isArray(fieldValue) || fieldValue.length > 0);

      default:
        console.warn('Unknown operator:', operator);
        return false;
    }
  }

  return false;
}

/**
 * Apply rule actions to the result
 */
function applyActions(actions: RuleAction[], result: RuleEvaluationResult): void {
  for (const action of actions) {
    switch (action.action) {
      case 'disable':
        if (!result.disabledOptions[action.field]) {
          result.disabledOptions[action.field] = [];
        }
        if (action.options) {
          result.disabledOptions[action.field].push(...action.options.map(Number));
        }
        break;

      case 'hide':
        if (!result.hiddenOptions[action.field]) {
          result.hiddenOptions[action.field] = [];
        }
        if (action.options) {
          result.hiddenOptions[action.field].push(...action.options.map(Number));
        }
        break;

      case 'require':
        if (!result.requiredFields.includes(action.field)) {
          result.requiredFields.push(action.field);
        }
        break;

      case 'set_value':
        result.setValues[action.field] = action.value;
        break;

      case 'clear_value':
        if (!result.clearedFields.includes(action.field)) {
          result.clearedFields.push(action.field);
        }
        break;

      case 'enable':
        // Remove from disabled list
        if (result.disabledOptions[action.field] && action.options) {
          result.disabledOptions[action.field] = result.disabledOptions[action.field]
            .filter(id => !action.options!.map(Number).includes(id));
        }
        break;

      case 'show':
        // Remove from hidden list
        if (result.hiddenOptions[action.field] && action.options) {
          result.hiddenOptions[action.field] = result.hiddenOptions[action.field]
            .filter(id => !action.options!.map(Number).includes(id));
        }
        break;

      default:
        console.warn('Unknown action:', action.action);
    }
  }
}

/**
 * Get human-readable description of a rule
 */
export function getRuleDescription(rule: ProcessedRule): string {
  const conditionText = getConditionDescription(rule.condition);
  const actionsText = rule.actions.map(getActionDescription).join(', ');

  return `${rule.name}: IF ${conditionText} THEN ${actionsText}`;
}

/**
 * Get description of a condition
 */
function getConditionDescription(condition: RuleCondition): string {
  if (condition.and) {
    return `(${condition.and.map(getConditionDescription).join(' AND ')})`;
  }

  if (condition.or) {
    return `(${condition.or.map(getConditionDescription).join(' OR ')})`;
  }

  if (condition.field) {
    const op = condition.operator || 'eq';
    const opText = {
      eq: '=',
      neq: '≠',
      in: 'in',
      nin: 'not in',
      gt: '>',
      gte: '≥',
      lt: '<',
      lte: '≤',
      contains: 'contains',
      empty: 'is empty',
      nempty: 'is not empty'
    }[op] || op;

    return `${condition.field} ${opText} ${condition.value}`;
  }

  return 'unknown condition';
}

/**
 * Get description of an action
 */
function getActionDescription(action: RuleAction): string {
  const target = action.options
    ? `${action.field}[${action.options.join(',')}]`
    : action.field;

  switch (action.action) {
    case 'disable':
      return `disable ${target}`;
    case 'hide':
      return `hide ${target}`;
    case 'require':
      return `require ${action.field}`;
    case 'set_value':
      return `set ${action.field} = ${action.value}`;
    case 'clear_value':
      return `clear ${action.field}`;
    default:
      return `${action.action} ${target}`;
  }
}

/**
 * Debug utility to log rule evaluation
 */
export function debugRuleEvaluation(
  rules: ProcessedRule[],
  configuration: Record<string, any>
): void {
  console.group('🔍 Rule Evaluation Debug');
  console.log('Configuration:', configuration);

  for (const rule of rules) {
    const matches = evaluateCondition(rule.condition, configuration);
    console.log(
      `${matches ? '✅' : '❌'} ${rule.name} (priority: ${rule.priority})`,
      matches ? '- APPLIED' : '- SKIPPED'
    );

    if (matches) {
      console.log(`  Actions: ${rule.actions.map(getActionDescription).join(', ')}`);
    }
  }

  console.groupEnd();
}