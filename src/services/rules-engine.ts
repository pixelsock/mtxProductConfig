// Rules Processing Engine for Product Configuration
import { Rule, getRules } from './supabase';

// Accessor for rule actions – expects `then_that` (no legacy fallback)
function getRuleActions(rule: any): any {
  return rule && (rule as any).then_that ? (rule as any).then_that : null;
}

/**
 * Evaluates if a rule's conditions match the current configuration
 * @param rule The rule to evaluate
 * @param config The current configuration state
 * @returns true if the rule conditions match
 */
export function evaluateRuleConditions(rule: Rule, config: any): boolean {
  if (!rule.if_this) return false;
  
  try {
    // Evaluate the Directus filter format conditions
    return evaluateDirectusFilter(rule.if_this, config);
  } catch (error) {
    console.warn(`Failed to evaluate rule "${rule.name}":`, error);
    return false;
  }
}

/**
 * Recursively evaluates Directus filter conditions
 */
function evaluateDirectusFilter(filter: any, data: any): boolean {
  if (!filter || typeof filter !== 'object') return false;

  // Handle _and operator
  if (filter._and && Array.isArray(filter._and)) {
    return filter._and.every((subFilter: any) => evaluateDirectusFilter(subFilter, data));
  }

  // Handle _or operator
  if (filter._or && Array.isArray(filter._or)) {
    return filter._or.some((subFilter: any) => evaluateDirectusFilter(subFilter, data));
  }

  // Helper: generic emptiness
  const isEmptyVal = (v: any) => {
    if (v === null || v === undefined) return true;
    if (typeof v === 'string') return v.length === 0;
    if (Array.isArray(v)) return v.length === 0;
    if (typeof v === 'object') return Object.keys(v).length === 0;
    return false;
  };

  // Handle field comparisons
  for (const field in filter) {
    if (field.startsWith('_')) continue; // Skip operators we've already handled
    
    const fieldFilter = filter[field];
    // Field aliasing to match app config keys
    const aliasMap: Record<string, string> = {
      mounting_option: 'mounting',
      accessory: 'accessories'
    };
    const effectiveField = aliasMap[field] || field;
    
    // Handle nested field access with flattened fallback (e.g., product_line.sku_code → product_line_sku_code)
    const fieldPath = effectiveField.split('.');
    let value = data;
    for (const pathPart of fieldPath) {
      value = value?.[pathPart];
    }
    if (value === undefined && fieldPath.length > 1) {
      const flatKey = fieldPath.join('_');
      value = data?.[flatKey];
    }
    
    // Extract numeric value from objects if needed
    let compareValue = value;
    if (typeof value === 'object' && value !== null) {
      if ('id' in value) {
        compareValue = value.id;
      } else if (typeof value.toString === 'function' && value.toString() !== '[object Object]') {
        compareValue = value.toString();
      }
    }
    
    console.log(`    Evaluating field "${field}": value=${compareValue} (original: ${typeof value === 'object' ? JSON.stringify(value) : value}), filter=${JSON.stringify(fieldFilter)}`);
    
    if (typeof fieldFilter === 'object' && fieldFilter !== null) {
      // Handle comparison operators
      if (fieldFilter._empty !== undefined) {
        const empty = isEmptyVal(value);
        const expected = !!fieldFilter._empty;
        if (empty !== expected) return false;
      }
      if (fieldFilter._nempty !== undefined) {
        const empty = isEmptyVal(value);
        const expectedNot = !!fieldFilter._nempty;
        if ((empty === true) === expectedNot) return false;
      }
      if (fieldFilter._eq !== undefined) {
        let matches = compareValue == fieldFilter._eq; // default
        // Special: accessories array membership
        if (effectiveField === 'accessories' && Array.isArray(value)) {
          const target = parseInt(fieldFilter._eq as any, 10);
          const arrNums = value.map((v: any) => typeof v === 'string' ? parseInt(v, 10) : v).filter((n: any) => Number.isFinite(n));
          matches = arrNums.includes(target);
        }
        console.log(`      _eq comparison: ${compareValue} == ${fieldFilter._eq} = ${matches}`);
        if (!matches) return false;
      }
      if (fieldFilter._neq !== undefined) {
        let matches = compareValue != fieldFilter._neq;
        if (effectiveField === 'accessories' && Array.isArray(value)) {
          const target = parseInt(fieldFilter._neq as any, 10);
          const arrNums = value.map((v: any) => typeof v === 'string' ? parseInt(v, 10) : v).filter((n: any) => Number.isFinite(n));
          matches = !arrNums.includes(target);
        }
        if (!matches) return false;
      }
      if (fieldFilter._in && Array.isArray(fieldFilter._in)) {
        const arr = fieldFilter._in;
        if (effectiveField === 'accessories' && Array.isArray(value)) {
          const targets = arr.map((x: any) => parseInt(x, 10)).filter((n: any) => Number.isFinite(n));
          const arrNums = value.map((v: any) => typeof v === 'string' ? parseInt(v, 10) : v).filter((n: any) => Number.isFinite(n));
          const intersects = targets.some((t: number) => arrNums.includes(t));
          if (!intersects) return false;
        } else {
          if (!arr.some((v: any) => v == compareValue)) return false;
        }
      }
      if (fieldFilter._nin && Array.isArray(fieldFilter._nin)) {
        const arr = fieldFilter._nin;
        if (effectiveField === 'accessories' && Array.isArray(value)) {
          const targets = arr.map((x: any) => parseInt(x, 10)).filter((n: any) => Number.isFinite(n));
          const arrNums = value.map((v: any) => typeof v === 'string' ? parseInt(v, 10) : v).filter((n: any) => Number.isFinite(n));
          const intersects = targets.some((t: number) => arrNums.includes(t));
          if (intersects) return false;
        } else {
          if (arr.some((v: any) => v == compareValue)) return false;
        }
      }
      if (fieldFilter._gt !== undefined) {
        if (!(compareValue > fieldFilter._gt)) return false;
      }
      if (fieldFilter._gte !== undefined) {
        if (!(compareValue >= fieldFilter._gte)) return false;
      }
      if (fieldFilter._lt !== undefined) {
        if (!(compareValue < fieldFilter._lt)) return false;
      }
      if (fieldFilter._lte !== undefined) {
        if (!(compareValue <= fieldFilter._lte)) return false;
      }
      if (fieldFilter._contains !== undefined) {
        if (typeof compareValue !== 'string' || !compareValue.includes(fieldFilter._contains)) return false;
      }
      if (fieldFilter._ncontains !== undefined) {
        if (typeof compareValue === 'string' && compareValue.includes(fieldFilter._ncontains)) return false;
      }
      
      // Recursively evaluate nested filters
      if (!fieldFilter._eq && !fieldFilter._neq && !fieldFilter._in && !fieldFilter._nin &&
          !fieldFilter._gt && !fieldFilter._gte && !fieldFilter._lt && !fieldFilter._lte &&
          !fieldFilter._contains && !fieldFilter._ncontains) {
        if (!evaluateDirectusFilter(fieldFilter, value || {})) return false;
      }
    } else {
      // Direct equality check
      if (value != fieldFilter) return false;
    }
  }
  
  return true;
}

/**
 * Applies rule actions/overrides to the configuration
 * @param rule The rule whose actions to apply
 * @param config The configuration to modify
 * @returns Modified configuration
 */
export function applyRuleActions(rule: Rule, config: any): any {
  const actions = getRuleActions(rule);
  if (!actions) return config;

  const modifiedConfig = { ...config };
  // Apply the actions object
  applyActions(actions, modifiedConfig);
  return modifiedConfig;
}

/**
 * Recursively applies actions from than_that object
 */
function applyActions(actions: any, target: any, path: string[] = []): void {
  for (const key in actions) {
    const value = actions[key];
    
    // Handle logical arrays in than_that (e.g., { _and: [ {...}, {...} ] })
    if ((key === '_and' || key === '_or') && Array.isArray(value)) {
      for (const item of value) {
        if (typeof item === 'object' && item !== null) {
          applyActions(item, target, path);
        }
      }
      continue;
    }

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      // Handle nested objects
      if (value._eq !== undefined) {
        // This is a value assignment
        setNestedValue(target, [...path, key], value._eq);
      } else {
        // Recurse into nested structure
        applyActions(value, target, [...path, key]);
      }
    } else {
      // Direct value assignment
      setNestedValue(target, [...path, key], value);
    }
  }
}

/**
 * Sets a value at a nested path in an object
 */
function setNestedValue(obj: any, path: string[], value: any): void {
  if (path.length === 0) return;

  // Avoid mutating primitive IDs (e.g., product_line: number) into objects
  // If attempting to set a nested property under a primitive, flatten the key instead
  const resolveAssignValue = (v: any) => (v && typeof v === 'object' && v._eq !== undefined ? v._eq : v);

  let current = obj;
  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i];
    const next = current[key];
    const isObject = typeof next === 'object' && next !== null;

    if (!isObject) {
      // Flatten nested assignment to preserve original primitive
      const flatKey = path.slice(0, i + 1).concat(path.slice(i + 1)).join('_');
      current[flatKey] = resolveAssignValue(value);
      return;
    }
    current = next;
  }

  current[path[path.length - 1]] = resolveAssignValue(value);
}

/**
 * Processes all rules against a configuration
 * @param config The current configuration
 * @returns Configuration with all matching rule actions applied
 */
export async function processRules(config: any): Promise<any> {
  try {
    const rules = await getRules();
    let processedConfig = { ...config };
    
    // Apply rules in priority order
    for (const rule of rules) {
      if (evaluateRuleConditions(rule, processedConfig)) {
        console.log(`Applying rule: ${rule.name}`);
        processedConfig = applyRuleActions(rule, processedConfig);
      }
    }
    
    return processedConfig;
  } catch (error) {
    console.error('Failed to process rules:', error);
    return config; // Return original config if rules processing fails
  }
}

/**
 * Extracts SKU override from rule actions
 * @param rule The rule to check
 * @returns SKU override value or null
 */
export function extractSKUOverride(rule: Rule): string | null {
  const actions: any = getRuleActions(rule);
  if (!actions) {
    console.log('    No then_that actions in rule');
    return null;
  }

  console.log('    Extracting SKU from then_that:', JSON.stringify(actions));

  // Check for product_line.sku_code override
  const skuOverride = actions.product_line?.sku_code?._eq;
  if (skuOverride) {
    console.log(`    Found product_line.sku_code override: ${skuOverride}`);
    return skuOverride;
  }
  
  // Check for direct sku_code override
  if (actions.sku_code?._eq) {
    console.log(`    Found direct sku_code override: ${actions.sku_code._eq}`);
    return actions.sku_code._eq;
  }
  
  // Also check for sku_code without _eq (direct assignment)
  if (actions.sku_code && typeof actions.sku_code === 'string') {
    console.log(`    Found direct sku_code string: ${actions.sku_code}`);
    return actions.sku_code;
  }
  
  console.log('    No SKU override found in rule');
  return null;
}

/**
 * Gets the SKU override for a specific configuration
 * @param config The configuration to check
 * @returns SKU override or null if no matching rule
 */
export async function getSKUOverride(config: any): Promise<string | null> {
  try {
    const rules = await getRules();
    
    console.log('🔍 Evaluating rules for SKU override:', {
      rulesCount: rules.length,
      configContext: config
    });
    
    // Find first matching rule with SKU override
    for (const rule of rules) {
      console.log(`\n📋 Checking rule: "${rule.name}"`);
      console.log('  Conditions:', JSON.stringify(rule.if_this, null, 2));
      console.log('  Actions:', JSON.stringify(getRuleActions(rule), null, 2));
      
      const matches = evaluateRuleConditions(rule, config);
      console.log(`  Matches: ${matches}`);
      
      if (matches) {
        const override = extractSKUOverride(rule);
        if (override) {
          console.log(`✅ SKU override from rule "${rule.name}": ${override}`);
          return override;
        }
      }
    }
    
    console.log('❌ No matching rules with SKU override found');
    return null;
  } catch (error) {
    console.error('Failed to get SKU override:', error);
    return null;
  }
}

// =========================
// Constraint extraction API
// =========================

type ConstraintSet = {
  allow?: Set<number>;
  deny?: Set<number>;
};

export type RuleConstraints = Record<string, ConstraintSet>;

function mergeConstraintSets(base: ConstraintSet, add: ConstraintSet, mode: 'and' | 'or'): ConstraintSet {
  const out: ConstraintSet = { allow: undefined, deny: undefined };
  // allow merging
  if (mode === 'and') {
    if (base.allow && add.allow) {
      out.allow = new Set([...base.allow].filter(x => add.allow!.has(x)));
    } else if (base.allow && !add.allow) {
      out.allow = new Set(base.allow);
    } else if (!base.allow && add.allow) {
      out.allow = new Set(add.allow);
    }
  } else {
    if (base.allow || add.allow) out.allow = new Set([...(base.allow || new Set()), ...(add.allow || new Set())]);
  }
  // deny merging (union in both cases)
  const unionDeny = new Set([...(base.deny || new Set()), ...(add.deny || new Set())]);
  if (unionDeny.size) out.deny = unionDeny;
  return out;
}

function collectConstraintsFromNode(node: any, into: RuleConstraints, mode: 'and' | 'or' = 'and') {
  if (!node || typeof node !== 'object') return;
  for (const [key, val] of Object.entries(node)) {
    if (key === '_and' && Array.isArray(val)) {
      val.forEach(child => collectConstraintsFromNode(child, into, 'and'));
      continue;
    }
    if (key === '_or' && Array.isArray(val)) {
      const childConstraints: RuleConstraints[] = [];
      for (const child of val) {
        const acc: RuleConstraints = {};
        collectConstraintsFromNode(child, acc, 'and');
        childConstraints.push(acc);
      }
      const fields = new Set(childConstraints.flatMap(c => Object.keys(c)));
      for (const f of fields) {
        let merged: ConstraintSet = {};
        for (const c of childConstraints) {
          if (!c[f]) continue;
          merged = mergeConstraintSets(merged, c[f]!, 'or');
        }
        if (merged.allow?.size || merged.deny?.size) {
          into[f] = into[f] ? mergeConstraintSets(into[f]!, merged, mode) : merged;
        }
      }
      continue;
    }
    if (val && typeof val === 'object') {
      const field = key === 'mounting_option' ? 'mounting' : key;
      const allowVals: number[] = [];
      const denyVals: number[] = [];
      if ((val as any)._eq !== undefined) allowVals.push(parseInt((val as any)._eq as any, 10));
      if (Array.isArray((val as any)._in)) allowVals.push(...(val as any)._in.map((x: any) => parseInt(x, 10)));
      if ((val as any)._neq !== undefined) denyVals.push(parseInt((val as any)._neq as any, 10));
      if (Array.isArray((val as any)._nin)) denyVals.push(...(val as any)._nin.map((x: any) => parseInt(x, 10)));
      if (allowVals.length || denyVals.length) {
        const set: ConstraintSet = {};
        if (allowVals.length) set.allow = new Set(allowVals.filter(Number.isFinite));
        if (denyVals.length) set.deny = new Set(denyVals.filter(Number.isFinite));
        into[field] = into[field] ? mergeConstraintSets(into[field]!, set, mode) : set;
      } else {
        // nested
        collectConstraintsFromNode(val, into, mode);
      }
    }
  }
}

export function buildRuleConstraints(rules: Rule[], config: any): RuleConstraints {
  const constraints: RuleConstraints = {};
  const ordered = [...rules].sort((a, b) => (a.priority ?? Number.MAX_SAFE_INTEGER) - (b.priority ?? Number.MAX_SAFE_INTEGER));
  for (const rule of ordered) {
    if (!evaluateRuleConditions(rule, config)) continue;
    const acc: RuleConstraints = {};
    collectConstraintsFromNode(getRuleActions(rule) || {}, acc, 'and');
    for (const [field, set] of Object.entries(acc)) {
      constraints[field] = constraints[field]
        ? mergeConstraintSets(constraints[field]!, set as ConstraintSet, 'and')
        : (set as ConstraintSet);
    }
  }
  return constraints;
}

export function applyConstraintsToIds(ids: Record<string, number[]>, constraints: RuleConstraints, getAllIds: (field: string) => number[]): Record<string, number[]> {
  const out: Record<string, number[]> = { ...ids };
  for (const [field, set] of Object.entries(constraints)) {
    const base = (out[field] && out[field]!.length > 0) ? new Set(out[field]) : new Set(getAllIds(field));
    if (set.allow && set.allow.size) {
      for (const v of Array.from(base)) if (!set.allow.has(v)) base.delete(v);
    }
    if (set.deny && set.deny.size) {
      for (const v of set.deny) base.delete(v);
    }
    out[field] = Array.from(base.values());
  }
  return out;
}
