-- site_id is nullable on submission_answers (null = visit-scoped item).
-- Standard SQL unique constraints treat NULL as distinct from NULL, so the
-- original constraint would silently allow duplicate rows for every
-- visit-scoped item. Replace it with a NULLS NOT DISTINCT constraint so
-- upserts on (submission_id, item_id, site_id) behave correctly either way.

alter table submission_answers
  drop constraint submission_answers_submission_id_item_id_site_id_key;

alter table submission_answers
  add constraint submission_answers_submission_id_item_id_site_id_key
  unique nulls not distinct (submission_id, item_id, site_id);
