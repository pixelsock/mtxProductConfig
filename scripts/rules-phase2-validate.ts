import { initializeDirectusService, getRules } from '../src/services/directus.ts';
import { buildRuleConstraints } from '../src/services/rules-engine.ts';

function serializeConstraints(obj: any) {
  return JSON.stringify(obj, (k, v) => v instanceof Set ? Array.from(v) : v, 2);
}

async function main() {
  await initializeDirectusService();
  const rules = await getRules();

  console.log('Loaded rules:', rules.length);

  const cases = [
    { name: 'L52 Full Frame Inward', ctx: { product_line: 18, mirror_style: 21 } },
    { name: 'L51 Full Frame Inward', ctx: { product_line: 18, mirror_style: 20 } },
  ];

  for (const c of cases) {
    const constraints = buildRuleConstraints(rules, c.ctx);
    console.log(`\nCase: ${c.name}`);
    console.log(serializeConstraints(constraints));
  }

  // Synthetic rule set tests
  const synthetic = [
    {
      name: 'SYN: _and constraints', priority: 1,
      if_this: { product_line: { _eq: 1 } },
      than_that: { light_direction: { _in: [1,2] }, frame_thickness: { _nin: [3] } }
    },
    {
      name: 'SYN: _or union allows', priority: 2,
      if_this: { product_line: { _eq: 1 } },
      than_that: { _or: [ { light_direction: { _in: [2] } }, { light_direction: { _in: [3] } } ] }
    }
  ] as any[];
  const constraints2 = buildRuleConstraints(synthetic as any, { product_line: 1 });
  console.log('\nSynthetic constraints (expect LD allow [1,2,3], FT deny [3]):');
  console.log(serializeConstraints(constraints2));
}

main().catch(err => { console.error(err); process.exit(1); });

