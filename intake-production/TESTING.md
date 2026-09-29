# QAJ intake v9 test record

Test date: 29 September 2026

## Automated and live-backend checks completed

- JavaScript syntax check passed with Node.js.
- Supabase `qaj-intake-submit-v9` health request returned HTTP 200.
- All four programme families submitted successfully: THAJ, BIS, QAYH and QA.
- A Thajweedh `Test me` registration stored the conditional WAV audio file successfully.
- A normal JPEG payment receipt stored successfully.
- Repeating the same `submission_id` returned `duplicate_safe_retry: true`; the database still contained one row and storage contained one receipt.
- A 3 MB PDF receipt was rejected with HTTP 413; no database row or storage object was created.
- Success-path timing observed: storage 1150.1 ms, database 1509.5 ms, total 2669.9 ms.
- Duplicate-safe retry observed: total 914.9 ms.
- Five synthetic registrations and six synthetic storage objects were verified, then removed.
- Cleanup verification returned zero remaining synthetic rows and zero remaining synthetic objects.
- Temporary cleanup function was disabled after verification.

## Isolated Vercel staging verification

- Staging URL: `https://qaj-intake-v9-vercel-drop.vercel.app/`
- Vercel project: `qaj-intake-v9-vercel-drop`
- Deployment: `dpl_2tUuSbKFnscrBi3atZFgMFq7Xewg`
- Same-origin API health request returned HTTP 200 with `qaj-intake-submit-v9`.
- A browser-origin multipart submission passed through the Vercel rewrite and returned HTTP 200.
- Repeating staging submission `1b8b3786-5f09-4275-b2ac-dbed0e97e71b` returned `duplicate_safe_retry: true`.
- Supabase contained exactly one registration row and one receipt object before cleanup.
- The synthetic staging row and receipt were removed; verification returned zero rows and zero objects.
- The temporary cleanup function was returned to its disabled HTTP 410 state.
- Desktop browser inspection found no horizontal overflow and all four `Register now` controls were 48 px tall.

## Synthetic registration IDs cleaned

- `ae638f74-512e-486d-9d88-4532fd764728`
- `fa34a745-3f2d-42ec-a833-6e929d4aebe3`
- `84f0fbc5-d902-4d1e-b9eb-15ffac93ab14`
- `2c5ccd27-165d-4966-9ce4-9e40d47ba64d`
- `7eb7d6ab-4e1e-4a82-b7e4-abf008140354`
- `1b8b3786-5f09-4275-b2ac-dbed0e97e71b`

Rejected oversized-PDF ID: `14692cad-bd18-4e9c-a20b-274a3ff47caf`.

## Release gate still required

The public-domain cutover was completed on 29 September 2026 after explicit approval. Complete post-cutover validation on each of:

1. An iPhone/Safari device.
2. An Android/Chrome device, preferably Saad's OnePlus 13.

For each device, confirm receipt selection, visible optimization/upload progress, success only after the server response, one database row, one receipt object, and correct narrow-screen scrolling. Use synthetic details and remove the test records afterward.

## Public-domain cutover verification

- `https://intake.quranarabicjournal.com/` serves the same v9 artifact as the isolated staging URL.
- Public-domain API health returned HTTP 200 and `qaj-intake-submit-v9`.
- A production-origin multipart registration created exactly one database row and one receipt object.
- The cutover verification row and receipt were removed afterward.
- The 12 requested records named `Trial 1` through `Trial 12` remain available for review.

## Android connection-interruption recovery

- A physical Android submission reached the confirmation step but reported that the connection was interrupted.
- Supabase logs contained no matching request, while Vercel reported no runtime error. This isolated the failure to the browser-to-Vercel external rewrite leg, before the request reached Supabase.
- The browser now sends multipart uploads directly to `qaj-intake-submit-v9` over the function's strict allowed-origin CORS path.
- The XHR timeout was increased from 120 seconds to 300 seconds and the client reports `v9-direct-mobile`.
- `production.js?v=20260929-v2` provides an explicit cache break for phones that cached the first v9 script.
- Corrected Vercel project: `qaj-intake-v9-mobile-fix`
- Corrected deployment: `dpl_7qP8RFziU19h9JhfzQTADSngsFpY`
- A production-origin Android-style request with both receipt and WAV audio returned HTTP 200 in about 4.1 seconds.
- A corrected-preview-origin Android-style request with both receipt and WAV audio returned HTTP 200 in about 3.0 seconds.
- Both recovery-test registrations and all four associated storage objects were removed afterward.
- The temporary cleanup function was returned to its disabled HTTP 410 state.
- The public domain was moved to the corrected project and verified to serve the v2 script and direct Supabase endpoint.
- A final retry on Saad's physical Android device remains required; an iPhone/Safari test also remains outstanding.
