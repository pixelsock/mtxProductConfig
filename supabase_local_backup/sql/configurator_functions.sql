-- Configurator helper functions for SKU-index driven filtering
-- These functions are designed to be idempotent so they can be safely re-run.

-- 1. Bootstrap endpoint: returns product lines, configuration UI, rules, and option metadata
create or replace function configurator_bootstrap()
returns jsonb
language plpgsql
as $$
declare
  result jsonb;
begin
  result := jsonb_build_object(
    'product_lines', (
      select jsonb_agg(pl)
      from (
        select
          p.id,
          p.name,
          p.sku_code,
          coalesce(p.description, '') as description,
          coalesce(count(distinct si.sku_code), 0) as sku_count,
          coalesce(count(distinct si.product_id), 0) as product_count
        from product_lines p
        left join sku_index si on si.product_line_id = p.id
        where p.active is true
        group by p.id
        order by p.sort nulls last, p.name
      ) pl
    ),
    'configuration_ui', (
      select jsonb_agg(cu order by cu.sort nulls last)
      from configuration_ui cu
    ),
    'rules', (
      select jsonb_agg(rule_row order by rule_row.priority nulls last)
      from (
        select
          r.*,
          coalesce(
            (
              select jsonb_agg(row_to_json(ri.*))
              from rules_if_selected ri
              where ri.rule_id = r.id
            ),
            '[]'::jsonb
          ) as if_selected,
          coalesce(
            (
              select jsonb_agg(row_to_json(rr.*))
              from rules_required rr
              where rr.rule_id = r.id
            ),
            '[]'::jsonb
          ) as required,
          coalesce(
            (
              select jsonb_agg(row_to_json(rd.*))
              from rules_disabled rd
              where rd.rule_id = r.id
            ),
            '[]'::jsonb
          ) as disabled
        from rules r
      ) rule_row
    ),
    'option_metadata', (
      select jsonb_object_agg(collection, items)
      from (
        select
          key as collection,
          jsonb_agg(row_to_json(opt_row) order by opt_row.sort nulls last, opt_row.name) as items
        from (
          select 'sizes' as key, s.* from sizes s where s.active is true
          union all select 'frame_colors', fc.* from frame_colors fc where fc.active is true
          union all select 'accessories', a.* from accessories a where a.active is true
          union all select 'drivers', d.* from drivers d where d.active is true
          union all select 'light_outputs', lo.* from light_outputs lo where lo.active is true
          union all select 'color_temperatures', ct.* from color_temperatures ct where ct.active is true
          union all select 'mounting_options', mo.* from mounting_options mo where mo.active is true
          union all select 'hanging_techniques', ht.* from hanging_techniques ht where ht.active is true
          union all select 'mirror_styles', ms.* from mirror_styles ms where ms.active is true
          union all select 'light_directions', ld.* from light_directions ld where ld.active is true
          union all select 'frame_thicknesses', ft.* from frame_thicknesses ft where ft.active is true
          union all select 'products', pr.* from products pr where pr.active is true
        ) opt_row
        group by key
      ) option_sets
    )
  );

  return result;
end;
$$;


-- 2. SKU matrix loader: returns all SKU rows for a product line in a compact form
create or replace function load_sku_matrix(p_product_line_id integer)
returns table (
  sku_code text,
  product_id integer,
  mirror_style_id integer,
  light_direction_id integer,
  size_id integer,
  light_output_id integer,
  color_temperature_id integer,
  driver_id integer,
  mounting_option_id integer,
  accessory_id integer,
  frame_color_id integer,
  hanging_technique_id integer,
  frame_thickness_id integer
)
language sql
as $$
  select
    si.sku_code,
    si.product_id,
    si.mirror_style_id,
    si.light_direction_id,
    si.size_id,
    si.light_output_id,
    si.color_temperature_id,
    si.driver_id,
    si.mounting_option_id,
    si.accessory_id,
    si.frame_color_id,
    si.hanging_technique_id,
    si.frame_thickness_id
  from sku_index si
  where si.product_line_id = p_product_line_id
  order by si.product_id, si.sku_code;
$$;


-- 3. Final validation helper: confirms a complete selection maps to a SKU
create or replace function validate_configuration(
  p_product_id integer,
  p_selections jsonb
)
returns table (
  is_valid boolean,
  sku_code text,
  sku jsonb
)
language plpgsql
as $$
begin
  return query
  select
    count(*) > 0 as is_valid,
    max(si.sku_code) as sku_code,
    case
      when count(*) > 0 then to_jsonb(si)
      else null
    end as sku
  from sku_index si
  where si.product_id = p_product_id
    and (
      (p_selections->>'mirror_style_id') is null
      or si.mirror_style_id = (p_selections->>'mirror_style_id')::integer
    )
    and (
      (p_selections->>'light_direction_id') is null
      or si.light_direction_id = (p_selections->>'light_direction_id')::integer
    )
    and (
      (p_selections->>'size_id') is null
      or si.size_id = (p_selections->>'size_id')::integer
    )
    and (
      (p_selections->>'light_output_id') is null
      or si.light_output_id = (p_selections->>'light_output_id')::integer
    )
    and (
      (p_selections->>'color_temperature_id') is null
      or si.color_temperature_id = (p_selections->>'color_temperature_id')::integer
    )
    and (
      (p_selections->>'driver_id') is null
      or si.driver_id = (p_selections->>'driver_id')::integer
    )
    and (
      (p_selections->>'mounting_option_id') is null
      or si.mounting_option_id = (p_selections->>'mounting_option_id')::integer
    )
    and (
      (p_selections->>'accessory_id') is null
      or si.accessory_id = (p_selections->>'accessory_id')::integer
    )
    and (
      (p_selections->>'frame_color_id') is null
      or si.frame_color_id = (p_selections->>'frame_color_id')::integer
    )
    and (
      (p_selections->>'hanging_technique_id') is null
      or si.hanging_technique_id = (p_selections->>'hanging_technique_id')::integer
    )
    and (
      (p_selections->>'frame_thickness_id') is null
      or si.frame_thickness_id = (p_selections->>'frame_thickness_id')::integer
    );
end;
$$;
