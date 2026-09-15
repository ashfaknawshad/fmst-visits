-- Storage bucket for field photos. Private bucket; access scoped to the
-- owning submission via the first path segment ({submission_id}/{uuid}.ext).

insert into storage.buckets (id, name, public)
values ('field-photos', 'field-photos', false)
on conflict (id) do nothing;

create policy "field-photos: owner access"
  on storage.objects for all
  using (
    bucket_id = 'field-photos'
    and exists (
      select 1 from public.field_visit_submissions s
      where s.id::text = (storage.foldername(name))[1]
        and s.student_id = auth.uid()
    )
  )
  with check (
    bucket_id = 'field-photos'
    and exists (
      select 1 from public.field_visit_submissions s
      where s.id::text = (storage.foldername(name))[1]
        and s.student_id = auth.uid()
    )
  );
