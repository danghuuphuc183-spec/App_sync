-- Temporary SYNESIS pilot profile store isolated from the learning-management schema.
create table if not exists public.synesis_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null check (char_length(display_name) between 2 and 40),
  email text,
  phone text,
  auth_provider text not null check (auth_provider in ('google', 'phone', 'email', 'apple', 'facebook')),
  name_completed boolean not null default false,
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint synesis_profiles_email_lowercase check (email is null or email = lower(email))
);

create index if not exists synesis_profiles_email_idx on public.synesis_profiles (email) where email is not null;
create index if not exists synesis_profiles_phone_idx on public.synesis_profiles (phone) where phone is not null;

alter table public.synesis_profiles enable row level security;

drop policy if exists "SYNESIS users can read own profile" on public.synesis_profiles;
create policy "SYNESIS users can read own profile"
  on public.synesis_profiles for select to authenticated
  using (id = (select auth.uid()));

drop policy if exists "SYNESIS users can create own profile" on public.synesis_profiles;
create policy "SYNESIS users can create own profile"
  on public.synesis_profiles for insert to authenticated
  with check (id = (select auth.uid()));

drop policy if exists "SYNESIS users can update own profile" on public.synesis_profiles;
create policy "SYNESIS users can update own profile"
  on public.synesis_profiles for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

revoke all on public.synesis_profiles from anon;
grant select, insert, update on public.synesis_profiles to authenticated;

-- Hard cap the temporary pilot at ten distinct profile records. The advisory lock
-- serializes concurrent inserts so simultaneous signups cannot both claim slot 10.
create or replace function public.enforce_synesis_profile_limit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_profiles bigint;
begin
  if not exists (select 1 from public.synesis_profiles where id = new.id) then
    perform pg_catalog.pg_advisory_xact_lock(74182, 10);
    select count(*) into current_profiles from public.synesis_profiles;
    if current_profiles >= 10 then
      raise exception using errcode = 'P0001', message = 'SYNESIS_REGISTRATION_LIMIT_REACHED';
    end if;
  end if;
  return new;
end;
$$;

revoke all on function public.enforce_synesis_profile_limit() from public, anon, authenticated;
drop trigger if exists synesis_profile_limit_before_insert on public.synesis_profiles;
create trigger synesis_profile_limit_before_insert
  before insert on public.synesis_profiles
  for each row execute function public.enforce_synesis_profile_limit();
