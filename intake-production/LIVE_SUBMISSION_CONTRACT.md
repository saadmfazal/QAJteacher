# QAJ intake v9 — deployment contract

Prepared: 29 September 2026

## Candidate production architecture

- Browser endpoint: `/api/intake/submit`
- Transport: same-origin `XMLHttpRequest` multipart upload with real progress events
- Vercel behavior: external rewrite to Supabase; no Vercel Function body handling
- Supabase Edge Function: `qaj-intake-submit-v9`
- Database: `public.qaj_course_registrations`
- Storage bucket: `qaj-registration-files` (private)
- Source tag: `intake_2026_web`
- Initial intake status: `pending`

## Isolated staging deployment

- Public staging URL: `https://qaj-intake-v9-vercel-drop.vercel.app/`
- Vercel project: `qaj-intake-v9-vercel-drop`
- Vercel project ID: `prj_l6eJ7lV8zez7TYwormlb5gWPHqJ1`
- Vercel deployment ID: `dpl_2tUuSbKFnscrBi3atZFgMFq7Xewg`
- Supabase Edge Function: `qaj-intake-submit-v9`, version 2
- The existing public domain remains on v8 until the physical-device release gate passes.

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

## Production rollback

Until v9 has passed real iPhone and Android submissions, the public domain must remain on the existing v8 implementation.

- Public domain: `https://intake.quranarabicjournal.com/`
- Existing Vercel project: `qaj-registration-brand-preview`
- Existing production deployment: `dpl_9VMEUYf7z7v2w6U4w2kRXpNcua4r`
- Existing live Supabase function: `qaj-intake-live`, version 8
- Older pre-Ashrifa reference deployment: `dpl_C7imT9uckzPcTqfXFRzQpTTn154y`

Rollback means restoring the existing production deployment/domain mapping and continuing to use `qaj-intake-live` v8. Do not delete v8 during rollout.

## Security follow-up

The upload rebuild does not modify database policies. The existing anonymous SELECT policy `o2_read_qaj_student_intake` should be reviewed and restricted in a separately approved change because the registration table contains personal data.
