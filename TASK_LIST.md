# Task List

This document tracks concrete tasks, their status, and outcomes so we can maintain context across conversations. Phases align with docs/PROJECT_PLAN.md. For schema reference, see `schema.json` (Directus `/schema/snapshot`).

## Legend
- [x] complete
- [ ] pending
- [~] in progress

---

## Phase 1 — Directus Metadata Conventions

- [x] Fetch Directus schema snapshot to `schema.json` (reference for collections/fields)
- [x] Create `TASK_LIST.md` and align with project plan
- [x] Update `AGENTS.md` to reflect Directus-only stack and workflow
- [~] Scaffold OptionRegistry: read `configuration_ui` and expose option set metadata
- [x] Implement dynamic container: `DynamicOptionsContainer` uses OptionRegistry to load option sets declared in `configuration_ui` intersected with product line defaults
- [x] Support `configuration_ui.item` as the target option collection key (falls back to `collection`)
- [~] Validation script: `npm run validate:configuration-ui` (requires API key with read access to `configuration_ui` and `product_lines`)
- [ ] Define extended `configuration_ui` fields (docs request to Directus admin):
  - `label`, `value_field`, `display_field`, `image_field`
  - `status_mode` (status|active|none), `published_values` (json)
  - `sort_field`, `group`, `section_label`, `section_sort`
- [ ] Generic `getOptions(optionSet, filters?)` with status/active filtering and sorting
- [ ] Status filtering conventions documented and enforced centrally

Deliverables:
- OptionRegistry module in `src/services/option-registry.ts`
- Minimal usage example in services or components (follow-up task)

---

## Phase 2 — Dynamic UI from configuration_ui

- [ ] Map `ui_type` → component types; drive props via OptionRegistry
- [ ] Add grouping/sections support (optional fields above)
- [ ] Backward compatibility with current `getConfigurationUi()`

---

## Phase 3 — Rules Engine Generalization

- [ ] Canonical field addressing scheme for rules
- [ ] Core actions (require/disable/hide/set default) generalized
- [ ] `scripts/rules-phase2-validate.sh` successor: rules validator using schema.json

---

## Phase 4 — SKU Generation as Content

- [ ] Define `sku_formulas` (or per-product_line formula) content model
- [ ] Implement safe SKU formula evaluator (no eval)
- [ ] Add `sku_mappings` for exceptions

---

## Phase 5 — Images and Layers via Metadata

- [ ] Define `image_layers` content model (conditions, z-order, blend)
- [ ] Renderer reads layers and conditions from Directus

---

## Phase 6 — Realtime + Cache Invalidation

- [ ] Subscribe to `configuration_ui`, `rules`, and option collections
- [ ] Invalidate OptionRegistry/data caches on change (fallback polling)

---

## Phase 7 — Cleanup + Docs

- [ ] Replace per-collection fetchers with generic `getOptions`
- [ ] Consolidate validators; enforce status filtering centrally
- [ ] Admin guide: adding option sets, rules, SKU formulas, images
