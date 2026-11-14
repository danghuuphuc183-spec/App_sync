-- Enforce the temporary 10-account pilot cap before Supabase Auth creates a user.
-- The reservation rows protect against concurrent signups and expire if Auth aborts.
create table if not exists public.synesis_signup_reservations (
  user_id uuid primary key,
  reserved_at timestamptz not null default now()
);

alter table public.synesis_signup_reservations enable row level security;
revoke all on public.synesis_signup_reservations from public, anon, authenticated, supabase_auth_admin;
grant usage on schema public to supabase_auth_admin;

create or replace function public.hook_limit_synesis_signups(event jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_user_id uuid;
  existing_users bigint;
  pending_signups bigint;
begin
  new_user_id := nullif(event->'user'->>'id', '')::uuid;
  if new_user_id is null then
    return jsonb_build_object(
      'error', jsonb_build_object(
        'http_code', 400,
        'message', 'SYNESIS_SIGNUP_INVALID_EVENT'
      )
    );
  end if;

  perform pg_catalog.pg_advisory_xact_lock(74182, 11);

  if exists (select 1 from auth.users where id = new_user_id) then
    return '{}'::jsonb;
  end if;

  if exists (
    select 1 from public.synesis_signup_reservations
    where user_id = new_user_id and reserved_at > pg_catalog.now() - interval '30 minutes'
  ) then
    return '{}'::jsonb;
  end if;

  delete from public.synesis_signup_reservations
  where reserved_at <= pg_catalog.now() - interval '30 minutes';

  select count(*) into existing_users from auth.users;
  select count(*) into pending_signups
  from public.synesis_signup_reservations as r
  where not exists (select 1 from auth.users as u where u.id = r.user_id);

  if existing_users + pending_signups >= 10 then
    return jsonb_build_object(
      'error', jsonb_build_object(
        'http_code', 429,
        'message', 'SYNESIS_DEMO_CAP_REACHED: Đợt thử nghiệm đã đủ 10 tài khoản.'
      )
    );
  end if;

  insert into public.synesis_signup_reservations (user_id, reserved_at)
  values (new_user_id, pg_catalog.now())
  on conflict (user_id) do update set reserved_at = excluded.reserved_at;

  return '{}'::jsonb;
end;
$$;

revoke all on function public.hook_limit_synesis_signups(jsonb) from public, anon, authenticated;
grant execute on function public.hook_limit_synesis_signups(jsonb) to supabase_auth_admin;

comment on function public.hook_limit_synesis_signups(jsonb) is
  'Before User Created hook: temporarily limits this project to 10 Auth users. Disable after the SYNESIS pilot.';
