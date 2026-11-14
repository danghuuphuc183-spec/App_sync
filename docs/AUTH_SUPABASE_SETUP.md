# Supabase Auth setup

The app uses Supabase Auth for Google OAuth and verified Vietnamese phone OTP. The dedicated-project schema uses `public.profiles`; the temporary learning-management project uses `public.synesis_profiles`. Credentials stay in Supabase Auth; the app never stores passwords or OTP codes in its profile table.

## Temporary 10-account pilot

The user requested a temporary pilot on project `uubnsfmahhdiemhcaisn` (`quan-ly-hoc-tap`). The pilot data is isolated in `public.synesis_profiles`; the existing learning-management tables are unchanged. Migrations `synesis_demo_profiles_limit` and `synesis_before_user_created_cap` are applied. RLS allows each user to access only their own profile, and the profile trigger refuses an 11th profile.

The **Before User Created** Auth Hook is enabled and points to `public.hook_limit_synesis_signups`. It caps new Auth users at 10, including concurrent signups. The cap applies to all Auth users in this Supabase project, so disable the hook after the pilot or before another app begins using Auth here. The project had zero Auth users when this pilot was configured.

The local `.env.local` points to this project and is git-ignored. Google sign-in still requires the owner to enable Google and enter OAuth credentials in Supabase; phone OTP requires an SMS provider. Do not paste OAuth client secrets or SMS provider secrets into this repository.

## Local development

1. Start Docker Desktop, then run `supabase start` and `supabase db reset`. Local-only test login: `+84912345678`, OTP `123456`; `supabase/config.toml` explicitly labels these as local test values. Never push that Auth config to the hosted project.
2. Copy `.env.example` to `.env.local`. For local development, set `NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to the `anon key` printed by `supabase start`.
3. Run `pnpm dev`. Local SMS can be inspected in Supabase Studio/Inbucket. Local phone sign-up is enabled and the resend cooldown is 60 seconds.
4. Do not use `SUPABASE_SERVICE_ROLE_KEY` in the browser. The app only uses the public anon key and RLS.

## Hosted Supabase project before production

1. In `.env.local`, set `NEXT_PUBLIC_SUPABASE_URL` to the hosted project URL and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` to its `sb_publishable_...` key (Dashboard → Connect or Project Settings → API Keys). Restart `pnpm dev` after changing environment variables. Never put a `service_role` or `sb_secret_...` key in a `NEXT_PUBLIC_` variable.
2. Apply the checked-in profile migration with `supabase link --project-ref <project-ref>` followed by `supabase db push`. The profile table links to `auth.users`, has RLS enabled, and lets each authenticated user read/write only the row whose `id` matches `auth.uid()`.
3. In **Authentication → Sign In / Providers → Google**, enable Google and configure the Google OAuth client ID and secret. Add the Supabase callback URL shown in the dashboard to the Google OAuth client's authorized redirect URIs.
4. In **Authentication → URL Configuration**, set the production Site URL and allow only the exact production callback `https://<app-domain>/auth/callback` plus required preview URLs. Do not allow arbitrary redirects.
5. In **Authentication → Sign In / Providers → Phone**, enable phone sign-up and configure a production SMS provider. Confirm it delivers to Vietnamese mobile networks and that the sender/template meets provider and local requirements.
6. In **Authentication → Rate Limits**, set SMS sends, OTP verifications, and sign-in/sign-up attempts to the lowest levels that support expected legitimate use. The UI's 60-second resend timer is only a usability limit; Supabase's server-side limits are the enforcement boundary.
7. In **Authentication → CAPTCHA**, enable Cloudflare Turnstile. Add the Turnstile site key as `NEXT_PUBLIC_TURNSTILE_SITE_KEY` to the app deployment and the Turnstile secret to Supabase. Production phone OTP requests are blocked in the app unless a CAPTCHA token is supplied.
8. Keep anonymous sign-in disabled. Review RLS on every table before public sign-up and verify production Auth audit logs and alerts.

Google OAuth and SMS credentials are project-specific and are intentionally not committed to this repository. Until the hosted project settings, credentials, and environment variables are configured, real sign-in cannot succeed.
