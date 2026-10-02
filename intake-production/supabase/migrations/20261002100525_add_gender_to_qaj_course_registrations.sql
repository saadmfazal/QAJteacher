alter table public.qaj_course_registrations
  add column if not exists gender text;

alter table public.qaj_course_registrations
  drop constraint if exists qaj_course_registrations_gender_check;

alter table public.qaj_course_registrations
  add constraint qaj_course_registrations_gender_check
  check (gender is null or gender in ('female', 'male'));
