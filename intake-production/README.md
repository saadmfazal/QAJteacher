# QAJ Intake — production package

This directory contains the isolated QAJ course-registration intake build prepared on 29 September 2026.

## Architecture

- Static, mobile-first form deployed by Vercel.
- Same-origin multipart upload to `/api/intake/submit`.
- Vercel external rewrite forwards the request directly to Supabase Edge Function `qaj-intake-submit-v9`.
- Supabase validates the request, stores files in the private `qaj-registration-files` bucket, then writes `public.qaj_course_registrations`.
- A client-generated `submission_id` makes retries idempotent.

The external rewrite is deliberate: Vercel Functions have a 4.5 MB request-body limit, while QAJ accepts optional audio up to 12 MB. The upload therefore does not pass through a Vercel Function.

## Source files

- `index.html` — Ashrifa-approved interface with the production form contract.
- `production.css` — mobile-safe layout, scrolling and upload-state rules.
- `production.js` — validation, receipt optimization, progress, retry and success handling.
- `vercel.json` — same-origin proxy, cache policy and security headers.
- `supabase/functions/qaj-intake-submit-v9/index.ts` — backend validation, storage and database transaction flow.
- `TESTING.md` — completed backend checks and remaining physical-device gate.
- `LIVE_SUBMISSION_CONTRACT.md` — deployment and rollback contract.

## Important

The current v8 function and existing production Vercel deployment are rollback assets. Do not delete or modify them during v9 rollout.

The database currently has an unrelated permissive anonymous SELECT policy named `o2_read_qaj_student_intake`. It was not changed as part of this upload rebuild. It should be reviewed separately because registration records contain personal information.
