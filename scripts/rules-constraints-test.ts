import { buildRuleConstraints, applyConstraintsToIds } from '../src/services/rules-engine.ts';

function serialize(obj: any) {
  return JSON.stringify(obj, (k, v) => v instanceof Set ? Array.from(v) : v, 2);
}

// Synthetic rules focusing on _neq and _nin semantics
const rules = [
  {
    name: 'deny single LD via _neq', priority: 1,
    if_this: { product_line: { _eq: 1 } },
    than_that: { light_direction: { _neq: 2 } }
  },
  {
    name: 'deny multiple FT via _nin', priority: 1,
    if_this: { product_line: { _eq: 1 } },
    than_that: { frame_thickness: { _nin: [3, 4] } }
  }
] as any[];

// Simulated availability from products (ids per field)
const ids = {
  light_direction: [1, 2, 3],
  frame_thickness: [1, 2, 3, 4, 5]
} as Record<string, number[]>;

// Universe provider (used when ids[field] is empty)
const universe = (field: string): number[] => ids[field] || [];

const constraints = buildRuleConstraints(rules as any, { product_line: 1 });
console.log('Constraints built (expect LD deny [2], FT deny [3,4]):');
console.log(serialize(constraints));

const pruned = applyConstraintsToIds(ids, constraints, universe);
console.log('\nPruned availability (expect LD [1,3], FT [1,2,5]):');
console.log(JSON.stringify(pruned, null, 2));

