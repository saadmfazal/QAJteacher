-- =========================================================
-- QAJ TEACHER PORTAL SUPPORT SQL
-- Run only if these tables do not already exist.
-- This does NOT change the core class/session tables.
-- =========================================================

-- Teacher messages: teachers can message admin/head teacher, and QAJ can publish announcements.
create table if not exists public.qaj_teacher_messages (
  id uuid not null default gen_random_uuid(),
  teacher_tid text not null,
  from_user_id uuid null,
  to_type text not null default 'admin',
  message_type text not null default 'teacher_message',
  subject text null,
  body text not null,
  status text not null default 'sent',
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),

  constraint qaj_teacher_messages_pkey primary key (id),
  constraint qaj_teacher_messages_teacher_tid_fkey
    foreign key (teacher_tid)
    references public.qajp5_teacher_db(tid)
    on delete restrict,
  constraint qaj_teacher_messages_to_type_check
    check (to_type in ('admin', 'head_teacher', 'teacher', 'all_teachers')),
  constraint qaj_teacher_messages_message_type_check
    check (message_type in ('teacher_message', 'admin_reply', 'head_teacher_reply', 'announcement')),
  constraint qaj_teacher_messages_status_check
    check (status in ('draft', 'sent', 'read', 'archived'))
);

create index if not exists qaj_teacher_messages_teacher_idx
on public.qaj_teacher_messages(teacher_tid, created_at desc);

-- Policy/SOP documents shown in the teacher portal.
create table if not exists public.qaj_policy_documents (
  id uuid not null default gen_random_uuid(),
  title text not null,
  body text not null,
  category text null default 'teacher_sop',
  sort_order integer not null default 100,
  is_active boolean not null default true,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),

  constraint qaj_policy_documents_pkey primary key (id)
);

create index if not exists qaj_policy_documents_active_idx
on public.qaj_policy_documents(is_active, sort_order);

-- Updated_at triggers if qaj_set_updated_at exists.
do $$
begin
  if exists (select 1 from pg_proc where proname = 'qaj_set_updated_at') then
    drop trigger if exists qaj_teacher_messages_set_updated_at on public.qaj_teacher_messages;
    create trigger qaj_teacher_messages_set_updated_at
    before update on public.qaj_teacher_messages
    for each row execute function public.qaj_set_updated_at();

    drop trigger if exists qaj_policy_documents_set_updated_at on public.qaj_policy_documents;
    create trigger qaj_policy_documents_set_updated_at
    before update on public.qaj_policy_documents
    for each row execute function public.qaj_set_updated_at();
  end if;
end $$;

-- Enable RLS.
alter table public.qaj_teacher_messages enable row level security;
alter table public.qaj_policy_documents enable row level security;

-- Safe basic RLS policies for teacher portal.
-- Assumption: qaj_user_profiles links auth.uid() to tid.

drop policy if exists "teachers_can_read_own_messages" on public.qaj_teacher_messages;
create policy "teachers_can_read_own_messages"
on public.qaj_teacher_messages
for select
to authenticated
using (
  teacher_tid in (
    select tid from public.qaj_user_profiles
    where user_id = auth.uid()
      and tid is not null
      and is_active = true
  )
);

drop policy if exists "teachers_can_insert_own_messages" on public.qaj_teacher_messages;
create policy "teachers_can_insert_own_messages"
on public.qaj_teacher_messages
for insert
to authenticated
with check (
  teacher_tid in (
    select tid from public.qaj_user_profiles
    where user_id = auth.uid()
      and tid is not null
      and is_active = true
  )
);

drop policy if exists "teachers_can_read_active_policy_documents" on public.qaj_policy_documents;
create policy "teachers_can_read_active_policy_documents"
on public.qaj_policy_documents
for select
to authenticated
using (is_active = true);

-- Optional starter SOP content.
insert into public.qaj_policy_documents (title, body, category, sort_order, is_active)
select 'Teacher Class Entry SOP', 'Submit the class entry after every completed class. Mark attendance accurately, include class notes, and notify the head teacher when student progress or behaviour requires attention.', 'teacher_sop', 10, true
where not exists (select 1 from public.qaj_policy_documents where title = 'Teacher Class Entry SOP');

insert into public.qaj_policy_documents (title, body, category, sort_order, is_active)
select 'Reschedule SOP', 'Any class reschedule must be recorded with the correct date, time, responsible party where required, and a clear reason. Follow QAJ admin instructions before changing class schedules.', 'teacher_sop', 20, true
where not exists (select 1 from public.qaj_policy_documents where title = 'Reschedule SOP');

insert into public.qaj_policy_documents (title, body, category, sort_order, is_active)
select 'Communication SOP', 'Use the portal messages section to contact QAJ admin or the relevant head teacher about class issues, student support, parent concerns, or operational matters.', 'teacher_sop', 30, true
where not exists (select 1 from public.qaj_policy_documents where title = 'Communication SOP');
