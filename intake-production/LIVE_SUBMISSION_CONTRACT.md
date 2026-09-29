# QAJ intake v9 — deployment contract

Prepared: 29 September 2026

## Production architecture

- Browser endpoint: `https://viajmvbwpmkiqxjtgshv.supabase.co/functions/v1/qaj-intake-submit-v9`
- Transport: direct cross-origin `XMLHttpRequest` multipart upload with real progress events
- Origin control: the Supabase function permits only the production and approved Vercel verification origins
- Vercel behavior: static hosting only; multipart bodies do not traverse a Vercel rewrite
- Supabase Edge Function: `qaj-intake-submit-v9`
- Database: `public.qaj_course_registrations`
- Storage bucket: `qaj-registration-files` (private)
- Source tag: `intake_2026_web`
- Initial intake status: `pending`

## Superseded isolated staging deployment

- Public staging URL: `https://qaj-intake-v9-vercel-drop.vercel.app/`
- Vercel project: `qaj-intake-v9-vercel-drop`
- Vercel project ID: `prj_l6eJ7lV8zez7TYwormlb5gWPHqJ1`
- Vercel deployment ID: `dpl_2tUuSbKFnscrBi3atZFgMFq7Xewg`
- Supabase Edge Function: `qaj-intake-submit-v9`, version 2
- This deployment is retained as a rollback/reference artifact and is no longer attached to the public domain.

## Required behavior

1. A payment receipt is required.
2. Images are optimized in the browser when practical; PDFs over 2 MB are blocked.
3. Optional audio is capped at 12 MB.
4. The server validates declared type and file signature.
5. Files are stored before the database record is written.
6. `submission_id` is a UUID and is reused after a retry so duplicate submissions resolve safely.
7. The completed form remains visible after an error.
8. Success is shown only after the server returns JSON with `ok: true`.
9. Starting a new registration generates a new `submission_id`.
10. The mobile form has one vertical scroll surface, no sticky action bar, safe-area padding and touch targets of at least 48 px.

## Upload limits

| Upload | Browser rule | Server rule |
|---|---:|---:|
| Receipt image | optimize toward 900 KB | 6 MB maximum |
| Receipt PDF | 2 MB maximum | 2 MB maximum |
| Test-me audio | 12 MB maximum | 12 MB maximum |

## Production deployment and rollback

The public domain was moved to v9 on 29 September 2026 after explicit approval.

- Public domain: `https://intake.quranarabicjournal.com/`
- Active Vercel project: `qaj-intake-v9-mobile-fix`
- Active Vercel project ID: `prj_DQXpZAxy6PHZJWmZJ17Gn5QPoUfa`
- Active deployment: `dpl_7qP8RFziU19h9JhfzQTADSngsFpY`
- Active Supabase function: `qaj-intake-submit-v9`, version 3
- Superseded v9 project: `qaj-intake-v9-vercel-drop`
- Superseded v9 deployment: `dpl_2tUuSbKFnscrBi3atZFgMFq7Xewg`
- Previous Vercel project: `qaj-registration-brand-preview`
- Previous production deployment: `dpl_9VMEUYf7z7v2w6U4w2kRXpNcua4r`
- Previous Supabase function: `qaj-intake-live`, version 8
- Older pre-Ashrifa reference deployment: `dpl_C7imT9uckzPcTqfXFRzQpTTn154y`

The immediate rollback target is the preserved `qaj-intake-v9-vercel-drop` project. The older v8 project `qaj-registration-brand-preview` remains a second rollback option with `qaj-intake-live` v8. Do not delete either rollback version until physical Android and iPhone validation is complete.

## Android upload recovery

The first public v9 used a Vercel external rewrite for multipart uploads. A real Android failure produced no Supabase request and no Vercel runtime error, showing that the connection was interrupted before the backend. The corrected deployment removes that network hop: uploads go directly from the browser to the Supabase function, retain UUID-based safe retry behavior, allow up to 300 seconds, and use a versioned script URL to bypass stale mobile caches.

## Security follow-up

The upload rebuild does not modify database policies. The existing anonymous SELECT policy `o2_read_qaj_student_intake` should be reviewed and restricted in a separately approved change because the registration table contains personal data.
