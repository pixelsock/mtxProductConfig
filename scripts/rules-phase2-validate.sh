#!/usr/bin/env bash
set -euo pipefail

BASE_URL=${VITE_DIRECTUS_URL:-"https://pim.dude.digital"}
API_KEY=${VITE_DIRECTUS_API_KEY:-"SatmtC2cTo-k-V17usWeYpBcc6hbtXjC"}

echo "== Fetching current rules =="
curl -sS -H "Accept: application/json" "$BASE_URL/items/rules?limit=500" | jq '.data | length as $n | "Rules count: \($n)"'

echo "== Creating test rule (narrow scope) =="
NOWTS=$(date +%s)
RULE_NAME="TEST: L52 only indirect ($NOWTS)"
CREATE_PAYLOAD=$(cat <<JSON
{
  "name": "$RULE_NAME",
  "priority": 9999,
  "if_this": {"_and":[{"product_line":{"_eq":18}},{"mirror_style":{"_in":[21]}}]},
  "than_that": {"light_direction":{"_in":[2]}}
}
JSON
)

CREATED=$(curl -sS -X POST "$BASE_URL/items/rules" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $API_KEY" \
  -d "$CREATE_PAYLOAD")
echo "$CREATED" | jq '.'

RULE_ID=$(echo "$CREATED" | jq -r '.data.id // empty')
if [[ -z "$RULE_ID" ]] ; then
  echo "Failed to create test rule; aborting validation" >&2
  exit 1
fi

echo "== Confirming test rule exists =="
curl -sS "$BASE_URL/items/rules/$RULE_ID" -H "Accept: application/json" | jq '.'

echo "== Validating constraints apply for L52I (product_line=18, mirror_style=21) =="
node -e '
  (async () => {
    const { initializeDirectusService, getRules } = await import("../src/services/directus.ts");
    const { buildRuleConstraints } = await import("../src/services/rules-engine.ts");
    await initializeDirectusService();
    const rules = await getRules();
    const constraints = buildRuleConstraints(rules, { product_line: 18, mirror_style: 21 });
    console.log(JSON.stringify(constraints, (k,v)=> v instanceof Set ? Array.from(v) : v, 2));
  })();
'

echo "== Cleanup: deleting test rule =="
curl -sS -X DELETE "$BASE_URL/items/rules/$RULE_ID" -H "Authorization: Bearer $API_KEY" -H "Accept: application/json" | jq '.'

echo "Done."

