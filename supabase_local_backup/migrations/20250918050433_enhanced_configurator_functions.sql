-- Enhanced Configurator Functions for Dynamic Option Availability
-- Supports progressive narrowing, option state tracking, and smart guidance
-- Version: 2.0

-- ============================================================================
-- 1. Dynamic Option Availability with Progressive Narrowing
-- ============================================================================

-- Get available options for a product line with current selection state
create or replace function get_dynamic_options(
  p_product_line_id integer,
  p_current_selections jsonb default '{}'::jsonb
)
returns table (
  collection_name text,
  option_id integer,
  option_name text,
  option_sku_code text,
  option_metadata jsonb,
  availability_state text, -- 'available', 'disabled', 'hidden'
  sku_count integer,       -- number of SKUs this option would yield
  is_forced boolean,       -- true if this is the only available option for this collection
  selection_priority integer -- lower number = higher priority for selection
)
language plpgsql
as $$
declare
  rec record;
  collection_cursor cursor for
    select unnest(array[
      'products', 'mirror_styles', 'light_directions', 'sizes',
      'light_outputs', 'color_temperatures', 'drivers',
      'mounting_options', 'accessories', 'frame_colors',
      'hanging_techniques', 'frame_thicknesses'
    ]) as collection;
begin
  -- For each collection, determine available options
  for rec in collection_cursor loop
    case rec.collection
      when 'products' then
        return query
        select
          'products'::text,
          p.id,
          p.name,
          p.sku_code,
          jsonb_build_object(
            'active', p.active,
            'sort', p.sort,
            'description', coalesce(p.description, ''),
            'product_line', p.product_line
          ),
          case
            when available_count.cnt > 0 then 'available'
            else 'hidden'
          end::text,
          available_count.cnt::integer,
          (total_available.total_cnt = 1)::boolean,
          coalesce(p.sort, 999)::integer
        from products p
        cross join lateral (
          select count(*)::integer as cnt
          from sku_index si
          where si.product_line_id = p_product_line_id
            and si.product_id = p.id
            and (
              (p_current_selections->>'mirror_style_id') is null
              or si.mirror_style_id = (p_current_selections->>'mirror_style_id')::integer
            )
            and (
              (p_current_selections->>'light_direction_id') is null
              or si.light_direction_id = (p_current_selections->>'light_direction_id')::integer
            )
            and (
              (p_current_selections->>'size_id') is null
              or si.size_id = (p_current_selections->>'size_id')::integer
            )
            and (
              (p_current_selections->>'light_output_id') is null
              or si.light_output_id = (p_current_selections->>'light_output_id')::integer
            )
            and (
              (p_current_selections->>'color_temperature_id') is null
              or si.color_temperature_id = (p_current_selections->>'color_temperature_id')::integer
            )
            and (
              (p_current_selections->>'driver_id') is null
              or si.driver_id = (p_current_selections->>'driver_id')::integer
            )
            and (
              (p_current_selections->>'mounting_option_id') is null
              or si.mounting_option_id = (p_current_selections->>'mounting_option_id')::integer
            )
            and (
              (p_current_selections->>'accessory_id') is null
              or si.accessory_id = (p_current_selections->>'accessory_id')::integer
            )
            and (
              (p_current_selections->>'frame_color_id') is null
              or si.frame_color_id = (p_current_selections->>'frame_color_id')::integer
            )
            and (
              (p_current_selections->>'hanging_technique_id') is null
              or si.hanging_technique_id = (p_current_selections->>'hanging_technique_id')::integer
            )
            and (
              (p_current_selections->>'frame_thickness_id') is null
              or si.frame_thickness_id = (p_current_selections->>'frame_thickness_id')::integer
            )
        ) available_count
        cross join lateral (
          select count(distinct si2.product_id)::integer as total_cnt
          from sku_index si2
          where si2.product_line_id = p_product_line_id
            and (
              (p_current_selections->>'mirror_style_id') is null
              or si2.mirror_style_id = (p_current_selections->>'mirror_style_id')::integer
            )
            and (
              (p_current_selections->>'light_direction_id') is null
              or si2.light_direction_id = (p_current_selections->>'light_direction_id')::integer
            )
            and (
              (p_current_selections->>'size_id') is null
              or si2.size_id = (p_current_selections->>'size_id')::integer
            )
            and (
              (p_current_selections->>'light_output_id') is null
              or si2.light_output_id = (p_current_selections->>'light_output_id')::integer
            )
            and (
              (p_current_selections->>'color_temperature_id') is null
              or si2.color_temperature_id = (p_current_selections->>'color_temperature_id')::integer
            )
            and (
              (p_current_selections->>'driver_id') is null
              or si2.driver_id = (p_current_selections->>'driver_id')::integer
            )
            and (
              (p_current_selections->>'mounting_option_id') is null
              or si2.mounting_option_id = (p_current_selections->>'mounting_option_id')::integer
            )
            and (
              (p_current_selections->>'accessory_id') is null
              or si2.accessory_id = (p_current_selections->>'accessory_id')::integer
            )
            and (
              (p_current_selections->>'frame_color_id') is null
              or si2.frame_color_id = (p_current_selections->>'frame_color_id')::integer
            )
            and (
              (p_current_selections->>'hanging_technique_id') is null
              or si2.hanging_technique_id = (p_current_selections->>'hanging_technique_id')::integer
            )
            and (
              (p_current_selections->>'frame_thickness_id') is null
              or si2.frame_thickness_id = (p_current_selections->>'frame_thickness_id')::integer
            )
        ) total_available
        where p.product_line = p_product_line_id
          and p.active is true;

      when 'sizes' then
        return query
        select
          'sizes'::text,
          s.id,
          s.name,
          s.sku_code,
          jsonb_build_object(
            'width', s.width,
            'height', s.height,
            'active', s.active,
            'sort', s.sort,
            'description', coalesce(s.description, '')
          ),
          case
            when available_count.cnt > 0 then 'available'
            else 'disabled'
          end::text,
          available_count.cnt::integer,
          (total_available.total_cnt = 1)::boolean,
          coalesce(s.sort, 999)::integer
        from sizes s
        cross join lateral (
          select count(*)::integer as cnt
          from sku_index si
          where si.product_line_id = p_product_line_id
            and si.size_id = s.id
            and (
              (p_current_selections->>'product_id') is null
              or si.product_id = (p_current_selections->>'product_id')::integer
            )
            and (
              (p_current_selections->>'mirror_style_id') is null
              or si.mirror_style_id = (p_current_selections->>'mirror_style_id')::integer
            )
            and (
              (p_current_selections->>'light_direction_id') is null
              or si.light_direction_id = (p_current_selections->>'light_direction_id')::integer
            )
            and (
              (p_current_selections->>'light_output_id') is null
              or si.light_output_id = (p_current_selections->>'light_output_id')::integer
            )
            and (
              (p_current_selections->>'color_temperature_id') is null
              or si.color_temperature_id = (p_current_selections->>'color_temperature_id')::integer
            )
            and (
              (p_current_selections->>'driver_id') is null
              or si.driver_id = (p_current_selections->>'driver_id')::integer
            )
            and (
              (p_current_selections->>'mounting_option_id') is null
              or si.mounting_option_id = (p_current_selections->>'mounting_option_id')::integer
            )
            and (
              (p_current_selections->>'accessory_id') is null
              or si.accessory_id = (p_current_selections->>'accessory_id')::integer
            )
            and (
              (p_current_selections->>'frame_color_id') is null
              or si.frame_color_id = (p_current_selections->>'frame_color_id')::integer
            )
            and (
              (p_current_selections->>'hanging_technique_id') is null
              or si.hanging_technique_id = (p_current_selections->>'hanging_technique_id')::integer
            )
            and (
              (p_current_selections->>'frame_thickness_id') is null
              or si.frame_thickness_id = (p_current_selections->>'frame_thickness_id')::integer
            )
        ) available_count
        cross join lateral (
          select count(distinct si2.size_id)::integer as total_cnt
          from sku_index si2
          where si2.product_line_id = p_product_line_id
            and si2.size_id is not null
            and (
              (p_current_selections->>'product_id') is null
              or si2.product_id = (p_current_selections->>'product_id')::integer
            )
            and (
              (p_current_selections->>'mirror_style_id') is null
              or si2.mirror_style_id = (p_current_selections->>'mirror_style_id')::integer
            )
            and (
              (p_current_selections->>'light_direction_id') is null
              or si2.light_direction_id = (p_current_selections->>'light_direction_id')::integer
            )
            and (
              (p_current_selections->>'light_output_id') is null
              or si2.light_output_id = (p_current_selections->>'light_output_id')::integer
            )
            and (
              (p_current_selections->>'color_temperature_id') is null
              or si2.color_temperature_id = (p_current_selections->>'color_temperature_id')::integer
            )
            and (
              (p_current_selections->>'driver_id') is null
              or si2.driver_id = (p_current_selections->>'driver_id')::integer
            )
            and (
              (p_current_selections->>'mounting_option_id') is null
              or si2.mounting_option_id = (p_current_selections->>'mounting_option_id')::integer
            )
            and (
              (p_current_selections->>'accessory_id') is null
              or si2.accessory_id = (p_current_selections->>'accessory_id')::integer
            )
            and (
              (p_current_selections->>'frame_color_id') is null
              or si2.frame_color_id = (p_current_selections->>'frame_color_id')::integer
            )
            and (
              (p_current_selections->>'hanging_technique_id') is null
              or si2.hanging_technique_id = (p_current_selections->>'hanging_technique_id')::integer
            )
            and (
              (p_current_selections->>'frame_thickness_id') is null
              or si2.frame_thickness_id = (p_current_selections->>'frame_thickness_id')::integer
            )
        ) total_available
        where s.active is true;

      when 'frame_colors' then
        return query
        select
          'frame_colors'::text,
          fc.id,
          fc.name,
          fc.sku_code,
          jsonb_build_object(
            'hex_code', fc.hex_code,
            'active', fc.active,
            'sort', fc.sort,
            'description', coalesce(fc.description, '')
          ),
          case
            when available_count.cnt > 0 then 'available'
            else 'disabled'
          end::text,
          available_count.cnt::integer,
          (total_available.total_cnt = 1)::boolean,
          coalesce(fc.sort, 999)::integer
        from frame_colors fc
        cross join lateral (
          select count(*)::integer as cnt
          from sku_index si
          where si.product_line_id = p_product_line_id
            and si.frame_color_id = fc.id
            and (
              (p_current_selections->>'product_id') is null
              or si.product_id = (p_current_selections->>'product_id')::integer
            )
            and (
              (p_current_selections->>'mirror_style_id') is null
              or si.mirror_style_id = (p_current_selections->>'mirror_style_id')::integer
            )
            and (
              (p_current_selections->>'light_direction_id') is null
              or si.light_direction_id = (p_current_selections->>'light_direction_id')::integer
            )
            and (
              (p_current_selections->>'size_id') is null
              or si.size_id = (p_current_selections->>'size_id')::integer
            )
            and (
              (p_current_selections->>'light_output_id') is null
              or si.light_output_id = (p_current_selections->>'light_output_id')::integer
            )
            and (
              (p_current_selections->>'color_temperature_id') is null
              or si.color_temperature_id = (p_current_selections->>'color_temperature_id')::integer
            )
            and (
              (p_current_selections->>'driver_id') is null
              or si.driver_id = (p_current_selections->>'driver_id')::integer
            )
            and (
              (p_current_selections->>'mounting_option_id') is null
              or si.mounting_option_id = (p_current_selections->>'mounting_option_id')::integer
            )
            and (
              (p_current_selections->>'accessory_id') is null
              or si.accessory_id = (p_current_selections->>'accessory_id')::integer
            )
            and (
              (p_current_selections->>'hanging_technique_id') is null
              or si.hanging_technique_id = (p_current_selections->>'hanging_technique_id')::integer
            )
            and (
              (p_current_selections->>'frame_thickness_id') is null
              or si.frame_thickness_id = (p_current_selections->>'frame_thickness_id')::integer
            )
        ) available_count
        cross join lateral (
          select count(distinct si2.frame_color_id)::integer as total_cnt
          from sku_index si2
          where si2.product_line_id = p_product_line_id
            and si2.frame_color_id is not null
            and (
              (p_current_selections->>'product_id') is null
              or si2.product_id = (p_current_selections->>'product_id')::integer
            )
            and (
              (p_current_selections->>'mirror_style_id') is null
              or si2.mirror_style_id = (p_current_selections->>'mirror_style_id')::integer
            )
            and (
              (p_current_selections->>'light_direction_id') is null
              or si2.light_direction_id = (p_current_selections->>'light_direction_id')::integer
            )
            and (
              (p_current_selections->>'size_id') is null
              or si2.size_id = (p_current_selections->>'size_id')::integer
            )
            and (
              (p_current_selections->>'light_output_id') is null
              or si2.light_output_id = (p_current_selections->>'light_output_id')::integer
            )
            and (
              (p_current_selections->>'color_temperature_id') is null
              or si2.color_temperature_id = (p_current_selections->>'color_temperature_id')::integer
            )
            and (
              (p_current_selections->>'driver_id') is null
              or si2.driver_id = (p_current_selections->>'driver_id')::integer
            )
            and (
              (p_current_selections->>'mounting_option_id') is null
              or si2.mounting_option_id = (p_current_selections->>'mounting_option_id')::integer
            )
            and (
              (p_current_selections->>'accessory_id') is null
              or si2.accessory_id = (p_current_selections->>'accessory_id')::integer
            )
            and (
              (p_current_selections->>'hanging_technique_id') is null
              or si2.hanging_technique_id = (p_current_selections->>'hanging_technique_id')::integer
            )
            and (
              (p_current_selections->>'frame_thickness_id') is null
              or si2.frame_thickness_id = (p_current_selections->>'frame_thickness_id')::integer
            )
        ) total_available
        where fc.active is true;

      -- Add similar patterns for other collections...
      -- This is a pattern that would be repeated for each collection type
      else
        -- Skip unknown collections
        continue;
    end case;
  end loop;
end;
$$;

-- ============================================================================
-- 2. Smart Selection Guidance
-- ============================================================================

-- Suggest next best options based on current selections
create or replace function get_selection_guidance(
  p_product_line_id integer,
  p_current_selections jsonb default '{}'::jsonb
)
returns table (
  guidance_type text,
  collection_name text,
  suggested_option_id integer,
  suggested_option_name text,
  reason text,
  impact_description text,
  resulting_sku_count integer,
  priority_score integer
)
language plpgsql
as $$
declare
  current_sku_count integer;
  total_selections integer;
  missing_selections text[];
begin
  -- Get current SKU count
  select count(*) into current_sku_count
  from sku_index si
  where si.product_line_id = p_product_line_id
    and (
      (p_current_selections->>'product_id') is null
      or si.product_id = (p_current_selections->>'product_id')::integer
    )
    and (
      (p_current_selections->>'mirror_style_id') is null
      or si.mirror_style_id = (p_current_selections->>'mirror_style_id')::integer
    )
    and (
      (p_current_selections->>'light_direction_id') is null
      or si.light_direction_id = (p_current_selections->>'light_direction_id')::integer
    )
    and (
      (p_current_selections->>'size_id') is null
      or si.size_id = (p_current_selections->>'size_id')::integer
    )
    and (
      (p_current_selections->>'light_output_id') is null
      or si.light_output_id = (p_current_selections->>'light_output_id')::integer
    )
    and (
      (p_current_selections->>'color_temperature_id') is null
      or si.color_temperature_id = (p_current_selections->>'color_temperature_id')::integer
    )
    and (
      (p_current_selections->>'driver_id') is null
      or si.driver_id = (p_current_selections->>'driver_id')::integer
    )
    and (
      (p_current_selections->>'mounting_option_id') is null
      or si.mounting_option_id = (p_current_selections->>'mounting_option_id')::integer
    )
    and (
      (p_current_selections->>'accessory_id') is null
      or si.accessory_id = (p_current_selections->>'accessory_id')::integer
    )
    and (
      (p_current_selections->>'frame_color_id') is null
      or si.frame_color_id = (p_current_selections->>'frame_color_id')::integer
    )
    and (
      (p_current_selections->>'hanging_technique_id') is null
      or si.hanging_technique_id = (p_current_selections->>'hanging_technique_id')::integer
    )
    and (
      (p_current_selections->>'frame_thickness_id') is null
      or si.frame_thickness_id = (p_current_selections->>'frame_thickness_id')::integer
    );

  -- Count total selections made
  select jsonb_array_length(jsonb_object_keys(p_current_selections)) into total_selections;

  -- If we have exactly 1 SKU, we're done
  if current_sku_count = 1 then
    return query
    select
      'complete'::text,
      ''::text,
      null::integer,
      ''::text,
      'Configuration is complete - unique SKU found'::text,
      format('Your selections result in exactly one product: %s', si.sku_code),
      1::integer,
      100::integer
    from sku_index si
    where si.product_line_id = p_product_line_id
      and (
        (p_current_selections->>'product_id') is null
        or si.product_id = (p_current_selections->>'product_id')::integer
      )
      and (
        (p_current_selections->>'mirror_style_id') is null
        or si.mirror_style_id = (p_current_selections->>'mirror_style_id')::integer
      )
      and (
        (p_current_selections->>'light_direction_id') is null
        or si.light_direction_id = (p_current_selections->>'light_direction_id')::integer
      )
      and (
        (p_current_selections->>'size_id') is null
        or si.size_id = (p_current_selections->>'size_id')::integer
      )
      and (
        (p_current_selections->>'light_output_id') is null
        or si.light_output_id = (p_current_selections->>'light_output_id')::integer
      )
      and (
        (p_current_selections->>'color_temperature_id') is null
        or si.color_temperature_id = (p_current_selections->>'color_temperature_id')::integer
      )
      and (
        (p_current_selections->>'driver_id') is null
        or si.driver_id = (p_current_selections->>'driver_id')::integer
      )
      and (
        (p_current_selections->>'mounting_option_id') is null
        or si.mounting_option_id = (p_current_selections->>'mounting_option_id')::integer
      )
      and (
        (p_current_selections->>'accessory_id') is null
        or si.accessory_id = (p_current_selections->>'accessory_id')::integer
      )
      and (
        (p_current_selections->>'frame_color_id') is null
        or si.frame_color_id = (p_current_selections->>'frame_color_id')::integer
      )
      and (
        (p_current_selections->>'hanging_technique_id') is null
        or si.hanging_technique_id = (p_current_selections->>'hanging_technique_id')::integer
      )
      and (
        (p_current_selections->>'frame_thickness_id') is null
        or si.frame_thickness_id = (p_current_selections->>'frame_thickness_id')::integer
      );
    return;
  end if;

  -- If we have 0 SKUs, suggest backtracking
  if current_sku_count = 0 then
    return query
    select
      'backtrack'::text,
      ''::text,
      null::integer,
      ''::text,
      'No valid products match current selections'::text,
      'Please modify your selections to find matching products'::text,
      0::integer,
      90::integer;
    return;
  end if;

  -- Find collections that would most narrow down the options
  -- Priority 1: Collections with only one available option (forced selections)
  return query
  select
    'forced'::text,
    collection_info.collection_name,
    collection_info.option_id,
    collection_info.option_name,
    'Only one option available for this attribute'::text,
    format('Selecting %s will reduce options to %s SKUs',
           collection_info.option_name, collection_info.resulting_count),
    collection_info.resulting_count,
    95::integer
  from (
    select * from get_dynamic_options(p_product_line_id, p_current_selections)
    where availability_state = 'available' and is_forced = true
  ) collection_info
  order by collection_info.selection_priority
  limit 3;

  -- Priority 2: Collections that would reduce SKU count most effectively
  return query
  select
    'narrow'::text,
    best_narrowing.collection_name,
    best_narrowing.option_id,
    best_narrowing.option_name,
    'Most effective at narrowing options'::text,
    format('Selecting %s would leave %s products',
           best_narrowing.option_name, best_narrowing.sku_count),
    best_narrowing.sku_count,
    80::integer
  from (
    select
      collection_name,
      option_id,
      option_name,
      sku_count,
      row_number() over (partition by collection_name order by sku_count asc) as rn
    from get_dynamic_options(p_product_line_id, p_current_selections)
    where availability_state = 'available'
      and is_forced = false
      and sku_count > 0
      and sku_count < current_sku_count
  ) best_narrowing
  where best_narrowing.rn = 1
  order by best_narrowing.sku_count asc
  limit 5;

end;
$$;

-- ============================================================================
-- 3. Minimum Selections Tracking
-- ============================================================================

-- Get minimum required selections for a product line
create or replace function get_minimum_selections_required(
  p_product_line_id integer
)
returns table (
  collection_name text,
  is_required boolean,
  reason text,
  unique_options_count integer
)
language plpgsql
as $$
begin
  return query
  with collection_analysis as (
    select
      'products' as collection_name,
      count(distinct si.product_id) as unique_count,
      count(distinct si.product_id) > 1 as has_choices
    from sku_index si
    where si.product_line_id = p_product_line_id

    union all

    select
      'sizes' as collection_name,
      count(distinct si.size_id) as unique_count,
      count(distinct si.size_id) > 1 as has_choices
    from sku_index si
    where si.product_line_id = p_product_line_id
      and si.size_id is not null

    union all

    select
      'frame_colors' as collection_name,
      count(distinct si.frame_color_id) as unique_count,
      count(distinct si.frame_color_id) > 1 as has_choices
    from sku_index si
    where si.product_line_id = p_product_line_id
      and si.frame_color_id is not null

    union all

    select
      'accessories' as collection_name,
      count(distinct si.accessory_id) as unique_count,
      count(distinct si.accessory_id) > 1 as has_choices
    from sku_index si
    where si.product_line_id = p_product_line_id
      and si.accessory_id is not null

    -- Add other collections as needed...
  )
  select
    ca.collection_name,
    ca.has_choices,
    case
      when ca.has_choices then 'Multiple options available - selection required'
      else 'Only one option available - will be auto-selected'
    end,
    ca.unique_count::integer
  from collection_analysis ca
  where ca.unique_count > 0
  order by ca.has_choices desc, ca.collection_name;
end;
$$;

-- ============================================================================
-- 4. Option Dependencies and Relationships
-- ============================================================================

-- Get option dependencies (which options become available/unavailable based on selection)
create or replace function get_option_dependencies(
  p_product_line_id integer,
  p_collection_name text,
  p_option_id integer
)
returns table (
  affected_collection text,
  affected_option_id integer,
  affected_option_name text,
  dependency_type text, -- 'enables', 'disables', 'requires'
  sku_count_before integer,
  sku_count_after integer
)
language plpgsql
as $$
declare
  test_selections jsonb;
begin
  -- Create test selection with the proposed option
  test_selections := jsonb_build_object(
    case p_collection_name
      when 'products' then 'product_id'
      when 'sizes' then 'size_id'
      when 'frame_colors' then 'frame_color_id'
      when 'accessories' then 'accessory_id'
      when 'drivers' then 'driver_id'
      when 'light_outputs' then 'light_output_id'
      when 'color_temperatures' then 'color_temperature_id'
      when 'mounting_options' then 'mounting_option_id'
      when 'hanging_techniques' then 'hanging_technique_id'
      when 'mirror_styles' then 'mirror_style_id'
      when 'light_directions' then 'light_direction_id'
      when 'frame_thicknesses' then 'frame_thickness_id'
      else 'unknown'
    end,
    p_option_id
  );

  -- Compare option availability before and after the selection
  return query
  with before_selection as (
    select * from get_dynamic_options(p_product_line_id, '{}'::jsonb)
  ),
  after_selection as (
    select * from get_dynamic_options(p_product_line_id, test_selections)
  )
  select
    after_sel.collection_name,
    after_sel.option_id,
    after_sel.option_name,
    case
      when before_sel.availability_state = 'disabled' and after_sel.availability_state = 'available'
        then 'enables'
      when before_sel.availability_state = 'available' and after_sel.availability_state = 'disabled'
        then 'disables'
      when before_sel.sku_count != after_sel.sku_count
        then 'affects'
      else 'no_change'
    end,
    before_sel.sku_count,
    after_sel.sku_count
  from before_selection before_sel
  join after_selection after_sel
    on before_sel.collection_name = after_sel.collection_name
    and before_sel.option_id = after_sel.option_id
  where before_sel.collection_name != p_collection_name
    and (
      before_sel.availability_state != after_sel.availability_state
      or before_sel.sku_count != after_sel.sku_count
    )
  order by
    case when before_sel.availability_state != after_sel.availability_state then 1 else 2 end,
    abs(before_sel.sku_count - after_sel.sku_count) desc;
end;
$$;

-- ============================================================================
-- 5. Performance and State Summary
-- ============================================================================

-- Get configuration state summary with performance metrics
create or replace function get_configuration_summary(
  p_product_line_id integer,
  p_current_selections jsonb default '{}'::jsonb
)
returns table (
  total_possible_skus integer,
  current_matching_skus integer,
  reduction_percentage numeric,
  selections_made integer,
  required_selections_remaining integer,
  estimated_selections_to_unique integer,
  is_configuration_complete boolean,
  final_sku_code text,
  configuration_state text -- 'starting', 'in_progress', 'narrowing', 'complete', 'invalid'
)
language plpgsql
as $$
declare
  total_skus integer;
  current_skus integer;
  selections_count integer;
  required_remaining integer;
  final_sku text;
begin
  -- Get total possible SKUs for product line
  select count(*) into total_skus
  from sku_index si
  where si.product_line_id = p_product_line_id;

  -- Get current matching SKUs
  select count(*) into current_skus
  from sku_index si
  where si.product_line_id = p_product_line_id
    and (
      (p_current_selections->>'product_id') is null
      or si.product_id = (p_current_selections->>'product_id')::integer
    )
    and (
      (p_current_selections->>'mirror_style_id') is null
      or si.mirror_style_id = (p_current_selections->>'mirror_style_id')::integer
    )
    and (
      (p_current_selections->>'light_direction_id') is null
      or si.light_direction_id = (p_current_selections->>'light_direction_id')::integer
    )
    and (
      (p_current_selections->>'size_id') is null
      or si.size_id = (p_current_selections->>'size_id')::integer
    )
    and (
      (p_current_selections->>'light_output_id') is null
      or si.light_output_id = (p_current_selections->>'light_output_id')::integer
    )
    and (
      (p_current_selections->>'color_temperature_id') is null
      or si.color_temperature_id = (p_current_selections->>'color_temperature_id')::integer
    )
    and (
      (p_current_selections->>'driver_id') is null
      or si.driver_id = (p_current_selections->>'driver_id')::integer
    )
    and (
      (p_current_selections->>'mounting_option_id') is null
      or si.mounting_option_id = (p_current_selections->>'mounting_option_id')::integer
    )
    and (
      (p_current_selections->>'accessory_id') is null
      or si.accessory_id = (p_current_selections->>'accessory_id')::integer
    )
    and (
      (p_current_selections->>'frame_color_id') is null
      or si.frame_color_id = (p_current_selections->>'frame_color_id')::integer
    )
    and (
      (p_current_selections->>'hanging_technique_id') is null
      or si.hanging_technique_id = (p_current_selections->>'hanging_technique_id')::integer
    )
    and (
      (p_current_selections->>'frame_thickness_id') is null
      or si.frame_thickness_id = (p_current_selections->>'frame_thickness_id')::integer
    );

  -- Count selections made
  select jsonb_array_length(jsonb_object_keys(p_current_selections)) into selections_count;

  -- Get final SKU if exactly one match
  if current_skus = 1 then
    select si.sku_code into final_sku
    from sku_index si
    where si.product_line_id = p_product_line_id
      and (
        (p_current_selections->>'product_id') is null
        or si.product_id = (p_current_selections->>'product_id')::integer
      )
      and (
        (p_current_selections->>'mirror_style_id') is null
        or si.mirror_style_id = (p_current_selections->>'mirror_style_id')::integer
      )
      and (
        (p_current_selections->>'light_direction_id') is null
        or si.light_direction_id = (p_current_selections->>'light_direction_id')::integer
      )
      and (
        (p_current_selections->>'size_id') is null
        or si.size_id = (p_current_selections->>'size_id')::integer
      )
      and (
        (p_current_selections->>'light_output_id') is null
        or si.light_output_id = (p_current_selections->>'light_output_id')::integer
      )
      and (
        (p_current_selections->>'color_temperature_id') is null
        or si.color_temperature_id = (p_current_selections->>'color_temperature_id')::integer
      )
      and (
        (p_current_selections->>'driver_id') is null
        or si.driver_id = (p_current_selections->>'driver_id')::integer
      )
      and (
        (p_current_selections->>'mounting_option_id') is null
        or si.mounting_option_id = (p_current_selections->>'mounting_option_id')::integer
      )
      and (
        (p_current_selections->>'accessory_id') is null
        or si.accessory_id = (p_current_selections->>'accessory_id')::integer
      )
      and (
        (p_current_selections->>'frame_color_id') is null
        or si.frame_color_id = (p_current_selections->>'frame_color_id')::integer
      )
      and (
        (p_current_selections->>'hanging_technique_id') is null
        or si.hanging_technique_id = (p_current_selections->>'hanging_technique_id')::integer
      )
      and (
        (p_current_selections->>'frame_thickness_id') is null
        or si.frame_thickness_id = (p_current_selections->>'frame_thickness_id')::integer
      );
  end if;

  -- Count required selections remaining
  select count(*) into required_remaining
  from get_minimum_selections_required(p_product_line_id) req
  where req.is_required = true;

  return query
  select
    total_skus,
    current_skus,
    case when total_skus > 0 then
      round(((total_skus - current_skus)::numeric / total_skus::numeric) * 100, 2)
    else 0 end,
    coalesce(selections_count, 0),
    coalesce(required_remaining, 0),
    case
      when current_skus <= 1 then 0
      when current_skus <= 5 then 1
      when current_skus <= 20 then 2
      else 3
    end,
    (current_skus = 1),
    final_sku,
    case
      when current_skus = 0 then 'invalid'
      when current_skus = 1 then 'complete'
      when selections_count = 0 then 'starting'
      when current_skus <= 10 then 'narrowing'
      else 'in_progress'
    end;
end;
$$;

-- ============================================================================
-- 6. Optimization Indexes for Performance
-- ============================================================================

-- Create indexes to optimize the dynamic option queries
-- These should be run after the functions are created

-- Core SKU index filtering
create index if not exists idx_sku_index_product_line_filtering
on sku_index (product_line_id, product_id, size_id, frame_color_id);

-- Option availability lookups
create index if not exists idx_sku_index_option_availability
on sku_index (product_line_id, mirror_style_id, light_direction_id);

-- SKU counting and aggregation
create index if not exists idx_sku_index_comprehensive
on sku_index (product_line_id, product_id, mirror_style_id, light_direction_id,
              size_id, light_output_id, color_temperature_id, driver_id,
              mounting_option_id, accessory_id, frame_color_id,
              hanging_technique_id, frame_thickness_id);

-- Individual collection lookups
create index if not exists idx_sku_index_by_collection_product_line
on sku_index (product_line_id, size_id) where size_id is not null;

create index if not exists idx_sku_index_by_collection_frame_color
on sku_index (product_line_id, frame_color_id) where frame_color_id is not null;

create index if not exists idx_sku_index_by_collection_accessory
on sku_index (product_line_id, accessory_id) where accessory_id is not null;

-- Comments for maintenance
comment on function get_dynamic_options(integer, jsonb) is
'Returns all available options for each collection with availability state, SKU counts, and selection priority. Core function for progressive narrowing UI.';

comment on function get_selection_guidance(integer, jsonb) is
'Provides smart suggestions for next selections based on current configuration state. Helps guide users toward optimal configuration paths.';

comment on function get_minimum_selections_required(integer) is
'Identifies which collections require user selection vs auto-selection for a product line. Essential for UI flow planning.';

comment on function get_option_dependencies(integer, text, integer) is
'Shows impact of selecting a specific option on other collections. Useful for explaining choice consequences to users.';

comment on function get_configuration_summary(integer, jsonb) is
'Provides comprehensive state summary including progress metrics, completion status, and performance indicators.';