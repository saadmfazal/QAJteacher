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

## Synthetic registration IDs cleaned

- `ae638f74-512e-486d-9d88-4532fd764728`
- `fa34a745-3f2d-42ec-a833-6e929d4aebe3`
- `84f0fbc5-d902-4d1e-b9eb-15ffac93ab14`
- `2c5ccd27-165d-4966-9ce4-9e40d47ba64d`
- `7eb7d6ab-4e1e-4a82-b7e4-abf008140354`

Rejected oversized-PDF ID: `14692cad-bd18-4e9c-a20b-274a3ff47caf`.

## Release gate still required

Before the public-domain cutover, complete one real registration on each of:

1. An iPhone/Safari device.
2. An Android/Chrome device, preferably Saad's OnePlus 13.

For each device, confirm receipt selection, visible optimization/upload progress, success only after the server response, one database row, one receipt object, and correct narrow-screen scrolling. Use synthetic details and remove the test records afterward.
