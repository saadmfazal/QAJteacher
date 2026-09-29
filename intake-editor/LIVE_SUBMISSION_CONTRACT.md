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
`7`

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


## Submission transport — locked 28 Sep 2026

The browser must NOT use fetch/XHR to submit the registration.

Reason:
- mobile and in-app browsers intermittently produced "Failed to fetch" before the request reached Supabase
- a relative Vercel submission path also returned 404

Current required transport:
- native HTML multipart POST
- target a hidden iframe named `qaj-intake-submit-frame`
- POST directly to:
  `https://viajmvbwpmkiqxjtgshv.supabase.co/functions/v1/qaj-intake-live?transport=iframe`
- Edge Function responds with an HTML postMessage bridge
- parent page validates the Supabase origin and only shows success after receiving `ok:true`
- preserve the 180-second upload timeout for slower mobile connections

Do not replace this with fetch without a separately tested same-origin submission architecture.


## 29 Sep 2026 — Mobile + submission reliability lock

The production client now uses direct `fetch(FormData)` submission. Do not restore the hidden iframe / `postMessage` submit handshake; it could save successfully on the server while leaving mobile/in-app browsers stuck on "Sending registration…".

Every new submission gets a client-generated UUID in `submission_id`. The Edge Function uses that UUID as the registration row ID. A retry with the same form therefore resolves to the same record instead of creating a duplicate.

Receipt and optional audio uploads run in parallel. The payment receipt is still required before success is shown.

Mobile interaction rules that must be preserved in LIVE:
- no sticky action bars on screens <= 680px
- no backdrop-filter on mobile action/progress bars
- mobile tap targets remain at least 48px high
- touch-action: manipulation on interactive controls
- programme action buttons stack on very narrow screens
- step buttons stack on <= 410px
- mobile scrolling remains inside the form/course panel with momentum scrolling

PREVIEW may stay safe/non-writing, but any future publish must merge PREVIEW content changes into LIVE without removing these reliability/mobile rules.
