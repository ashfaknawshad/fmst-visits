-- Add the stream depth-profile item to the Dediyagala visit's Site Setup
-- section, and demote the sketch photo to optional context (the numeric
-- profile is now the authoritative cross-section record).

do $$
declare
  v_section_id uuid;
begin
  select fvs.id into v_section_id
  from field_visit_sections fvs
  join field_visits fv on fv.id = fvs.field_visit_id
  where fv.title = 'Dediyagala Stream Ecology Survey'
    and fvs.title = 'Site Setup';

  update field_visit_items
  set is_required = false,
      label = 'Site photo (optional context)',
      help_text = 'Optional: a general photo of the site alongside the measured profile below.'
  where section_id = v_section_id
    and item_type = 'photo';

  insert into field_visit_items (section_id, item_type, repeat_scope, label, help_text, order_index, is_required, config)
  values (
    v_section_id,
    'cross_section',
    'site',
    'Stream depth profile (bank to bank)',
    'Measure depth at regular intervals across the wetted width, from one bank to the other, including the deepest point.',
    3,
    true,
    '{"distance_unit": "m", "depth_unit": "m", "min_points": 3}'
  );
end $$;
