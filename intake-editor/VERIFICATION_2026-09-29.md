# QAJ Intake Production Verification — 2026-09-29

Production Edge Function: `qaj-intake-live` v7

## End-to-end backend tests

Two independent live smoke runs were executed against the real production Edge Function.

Each run verified:
- live HTML serves the v7 mobile/reliability contract
- public domain wrapper is reachable and does not use iframe rendering
- CORS preflight for intake.quranarabicjournal.com
- real multipart registration with required payment receipt
- same-submission UUID retry returns the same registration
- receipt + optional audio upload
- missing receipt is rejected without creating a registration

Across both runs:
- 6 expected successful POSTs returned HTTP 200
- 2 expected missing-receipt tests returned HTTP 400
- successful v7 POST average execution time: 1170 ms
- successful v7 POST maximum execution time: 1761 ms
- no HTTP 5xx responses in the test set

Database/storage verification:
- successful rows landed in `public.qaj_course_registrations`
- source = `intake_2026_web`
- intake_status = `pending`
- payment receipt paths were written
- optional audio path was written when supplied
- retrying the same UUID produced one row, not a duplicate
- missing-receipt submission produced no row
- Storage objects existed in `qaj-registration-files`

Cleanup:
- all synthetic test registration rows removed
- all synthetic test Storage objects removed
- remaining synthetic rows: 0
- remaining synthetic Storage objects: 0

Temporary smoke-test endpoints were redeployed inert (HTTP 410 behavior only).

## Mobile/browser interaction tests

The production v7 client mechanics were exercised in Chromium mobile emulation with touch enabled.

Profiles:
- Android phone: 360 x 740
- iPhone Instagram in-app-browser UA: 390 x 844
- large iPhone/Safari UA: 430 x 932
- iPad/Safari UA: 768 x 1024

For each profile:
- all 4 programme cards rendered
- More Info and Register buttons were hit-tested
- programme info dialog opened
- info-page registration control was hit-tested
- registration dialog opened
- Back/Continue controls were hit-tested
- the flow progressed through learner -> placement -> payment
- payment receipt File object was attached
- final Submit control was hit-tested
- simulated successful server response produced the success screen
- client-generated submission UUID was present

Interactive hit-test total:
- 17 checks per profile
- 68 / 68 passed

Mobile-specific computed-style verification:
- <= 680 px: step action bars are static, not sticky
- <= 680 px: progress bar is relative, not sticky
- mobile action/progress backdrop filters are disabled
- <= 410 px: Back/Continue/Submit stack vertically
- tap controls remain at least 48 px high
- iPhone Instagram profile passed the complete interaction flow

## Slow/failure UX tests

iPhone Instagram profile:
- simulated a 9-second submission
- at 8 seconds the page displayed "Still uploading securely..."
- Submit remained disabled while the request was active
- form was marked aria-busy
- once the response arrived, success screen displayed and Submit state reset

Failure/retry test:
- simulated a failed network request
- completed form remained visible
- retry-safe message displayed
- Submit became usable again
- submission UUID remained unchanged
- retry with a successful response completed normally

## Result

All tested production boundaries passed:
UI interaction -> client submit -> Edge Function -> database -> Storage -> response -> success state.

This report covers automated production/browser-emulation verification. It is not a substitute for every physical-device/browser combination, but it specifically includes the iPhone Instagram in-app-browser profile that motivated the mobile repair.


# Addendum — v8 root transport fix

A real failed Android Chrome session was identified in production logs at about 08:31 UTC:
- the form GET requests reached qaj-intake-live v7
- there was no subsequent POST or OPTIONS request from that device
- therefore the failure happened in the browser before Supabase received the upload

v8 replaced cross-origin fetch submission with native HTML multipart form submission.

Live v8 smoke test results:
- native valid POST: HTTP 303 to official QAJ domain with qaj_submit=ok
- retry with the same UUID: HTTP 303 qaj_submit=ok and one row only
- no-JavaScript/page fallback: HTTP 200 text/html containing "Registration received"
- missing receipt through native transport: HTTP 303 qaj_submit=error
- valid rows contained payment_receipt_path
- invalid missing-receipt ID produced no row
- all synthetic rows and Storage objects were removed after the test
- remaining synthetic rows: 0
- remaining synthetic Storage objects: 0
- temporary v8 smoke endpoint disabled after verification

Success redirect target was separately checked and returns HTTP 200 from:
https://intake.quranarabicjournal.com/?qaj_submit=ok&id=...

This v8 transport is based on ordinary browser form submission and HTTP redirect behavior, not CORS-dependent fetch or cross-window postMessage.
