-- Seed: Dediyagala Stream Ecology visit (16 Sept 2026)
-- Field visits are authored directly as SQL, not through an in-app builder.

do $$
declare
  v_visit_id uuid := gen_random_uuid();
  v_section_id uuid;
begin
  insert into field_visits (id, title, description, objectives, location_name, visit_date, status)
  values (
    v_visit_id,
    'Dediyagala Stream Ecology Survey',
    'Field visit examining stream ecology at Dediyagala stream: habitat comparison, water quality, and biological sampling across multiple sites (e.g. upstream/middle/downstream).',
    'Compare riffle and pool habitats; characterize water quality; survey attached algae and macrobenthos; document flora/fauna adaptations, endemic fish, and organic matter input sources.',
    'Dediyagala Stream',
    date '2026-09-16',
    'published'
  );

  -- Section 1: Site Setup (site-scoped)
  insert into field_visit_sections (id, field_visit_id, title, instructions, order_index)
  values (gen_random_uuid(), v_visit_id, 'Site Setup', 'Add a site for each sampling location (e.g. Upstream, Middle, Downstream) before recording data for it.', 1)
  returning id into v_section_id;

  insert into field_visit_items (section_id, item_type, repeat_scope, label, help_text, order_index, is_required, config) values
  (v_section_id, 'gps', 'site', 'Site GPS location', 'Capture GPS at this sampling site.', 1, true, '{"require_accuracy_under_m": 20}'),
  (v_section_id, 'photo', 'site', 'Cross-section of working area', 'Photo of a sketch or the physical cross-section of the stream at this site.', 2, true, '{"min_count": 1, "max_count": 3}');

  -- Section 2: Riffle vs Pool Comparison (site-scoped)
  insert into field_visit_sections (id, field_visit_id, title, instructions, order_index)
  values (gen_random_uuid(), v_visit_id, 'Riffle vs Pool Comparison', 'Compare a riffle and a pool at this site.', 2)
  returning id into v_section_id;

  insert into field_visit_items (section_id, item_type, repeat_scope, label, help_text, order_index, is_required, config) values
  (v_section_id, 'measurement', 'site', 'Flow velocity — Riffle', 'Time a float over a measured distance to calculate velocity.', 1, true, '{"unit": "m/s", "min": 0, "max": 5, "decimals": 2}'),
  (v_section_id, 'measurement', 'site', 'Flow velocity — Pool', 'Time a float over a measured distance to calculate velocity.', 2, true, '{"unit": "m/s", "min": 0, "max": 5, "decimals": 2}'),
  (v_section_id, 'observation', 'site', 'Substrate characteristics — Riffle', null, 3, true, '{"input": "select", "options": ["bedrock", "boulder", "cobble", "gravel", "sand", "silt", "other"], "allow_other_text": true}'),
  (v_section_id, 'observation', 'site', 'Substrate characteristics — Pool', null, 4, true, '{"input": "select", "options": ["bedrock", "boulder", "cobble", "gravel", "sand", "silt", "other"], "allow_other_text": true}'),
  (v_section_id, 'observation', 'site', 'Sediment type — Riffle', null, 5, true, '{"input": "select", "options": ["bedrock", "boulder", "cobble", "gravel", "sand", "silt", "other"], "allow_other_text": true}'),
  (v_section_id, 'observation', 'site', 'Sediment type — Pool', null, 6, true, '{"input": "select", "options": ["bedrock", "boulder", "cobble", "gravel", "sand", "silt", "other"], "allow_other_text": true}');

  -- Section 3: Water Quality (site-scoped)
  insert into field_visit_sections (id, field_visit_id, title, instructions, order_index)
  values (gen_random_uuid(), v_visit_id, 'Water Quality', 'Record on-site water quality readings for this site.', 3)
  returning id into v_section_id;

  insert into field_visit_items (section_id, item_type, repeat_scope, label, help_text, order_index, is_required, config) values
  (v_section_id, 'measurement', 'site', 'Dissolved Oxygen', null, 1, true, '{"unit": "mg/L", "min": 0, "max": 20, "decimals": 1}'),
  (v_section_id, 'measurement', 'site', 'Temperature', 'Measured on-site.', 2, true, '{"unit": "°C", "min": 10, "max": 40, "decimals": 1}'),
  (v_section_id, 'measurement', 'site', 'pH', null, 3, true, '{"unit": "pH", "min": 0, "max": 14, "decimals": 1}'),
  (v_section_id, 'measurement', 'site', 'Conductivity', null, 4, true, '{"unit": "µS/cm", "min": 0, "max": 2000, "decimals": 0}');

  -- Section 4: Attached Algae (site-scoped, repeatable species list)
  insert into field_visit_sections (id, field_visit_id, title, instructions, order_index)
  values (gen_random_uuid(), v_visit_id, 'Attached Algae', 'Record density of attached algae species found at this site.', 4)
  returning id into v_section_id;

  insert into field_visit_items (section_id, item_type, repeat_scope, label, help_text, order_index, is_required, config) values
  (v_section_id, 'species_list', 'site', 'Attached algae species density', 'Add a row per species/taxon found; enter density directly.', 1, true, '{"density_unit": "individuals/cm²", "fields": ["taxon_name", "density", "notes"]}');

  -- Section 5: Macrobenthos (site-scoped, repeatable species list + notes)
  insert into field_visit_sections (id, field_visit_id, title, instructions, order_index)
  values (gen_random_uuid(), v_visit_id, 'Macrobenthos', 'Sample using the macrobenthos sampler at this site.', 5)
  returning id into v_section_id;

  insert into field_visit_items (section_id, item_type, repeat_scope, label, help_text, order_index, is_required, config) values
  (v_section_id, 'species_list', 'site', 'Macrobenthos species density', 'Add a row per taxon found; enter density directly (individuals/cm²).', 1, true, '{"density_unit": "individuals/cm²", "fields": ["taxon_name", "density", "notes"]}'),
  (v_section_id, 'observation', 'site', 'Adaptation observations', 'e.g. caddisfly larvae, stonefly, mayfly, water penny larvae — note adaptations observed.', 2, false, '{"input": "textarea"}');

  -- Section 6: Flora Observations (visit-level)
  insert into field_visit_sections (id, field_visit_id, title, instructions, order_index)
  values (gen_random_uuid(), v_visit_id, 'Flora Observations', 'General plant adaptation notes for the whole visit.', 6)
  returning id into v_section_id;

  insert into field_visit_items (section_id, item_type, repeat_scope, label, help_text, order_index, is_required, config) values
  (v_section_id, 'observation', 'visit', 'Plant adaptation notes', 'e.g. root/leaf morphology (ribbon-like, wavy margins), species like Lagenandra, bank-stabilizing species (Kola/"Ketala").', 1, false, '{"input": "textarea"}');

  -- Section 7: Broader Stream Observations (visit-level)
  insert into field_visit_sections (id, field_visit_id, title, instructions, order_index)
  values (gen_random_uuid(), v_visit_id, 'Broader Stream Observations', 'Observations for the stream as a whole, not tied to one site.', 7)
  returning id into v_section_id;

  insert into field_visit_items (section_id, item_type, repeat_scope, label, help_text, order_index, is_required, config) values
  (v_section_id, 'species_list', 'visit', 'Endemic fish observed', 'Add a row per species observed.', 1, false, '{"fields": ["taxon_name", "notes"]}'),
  (v_section_id, 'observation', 'visit', 'Organic input sources', 'Note presence of allochthonous (external, e.g. leaf litter) and autochthonous (in-stream, e.g. algae) organic matter.', 2, false, '{"input": "textarea"}');
end $$;
