# CRITICAL — LIVE SUBMISSION CONTRACT

## Current locked sources — 25 Sep 2026

Ashrifa approved visual/content source:
- `intake-editor/PREVIEW.html`
- restored from `QAJ_FINAL_FOR_SAAD.zip`
- source note states: FINAL VERSION APPROVED BY ASHRIFA
- last Ashrifa local edit: `0b3ed0a Prevent suggested badge overlap`

Production derivative:
- `intake-editor/LIVE.html`
- same Ashrifa-approved UI/content
- only submission plumbing and submission-state copy differ from PREVIEW

## Production

Public domain:
https://intake.quranarabicjournal.com/

Vercel project:
`qaj-registration-brand-preview`

Current rendering architecture:
- the Vercel production page is a small shell
- it fetches the self-contained HTML from the Supabase Edge Function
- it writes that HTML into the same document
- do NOT use an iframe
- do NOT restore the old cross-deployment CSS/JS asset setup

Live Edge Function:
`qaj-intake-live`

Current Edge Function version:
`3`

Database target:
`public.qaj_course_registrations`

Storage bucket:
`qaj-registration-files`

Production source tag:
`intake_2026_web`

New submissions must start with:
`intake_status = pending`

## Non-negotiable publishing rules

1. Never publish the old safe-preview submit handler to production.
2. Never rebuild production from the pre-Ashrifa Vercel baseline.
3. Future visual/content edits begin from `intake-editor/PREVIEW.html`.
4. When publishing, carry those approved edits into `intake-editor/LIVE.html` while preserving the real submission integration.
5. Show success only after the server returns `ok: true`.
6. On failure, keep the completed form visible and show an error.
7. Payment receipt remains required.
8. Preserve receipt/audio upload to `qaj-registration-files`.
9. Preserve database writes to `qaj_course_registrations`.
10. Before every production publish, verify mobile + desktop, all four programme families, registration flow, conditional questions, final payment step, and live submission plumbing.

## Recovery

Pre-Ashrifa baseline deployment:
`dpl_C7imT9uckzPcTqfXFRzQpTTn154y`

This is rollback/reference only. It is NOT the current approved design source.
