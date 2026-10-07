# QAJ recitation recorder — 7 October 2026

Baseline: public intake resolved to Vercel project qaj-intake-gender-rule-v2 (prj_23QwvROOS72OOLQn3s78HFUto1Ij), deployment dpl_A4fCTRuerNTZMAksE7q8M9iRGDZA. The Git source matched production except a final newline. Parent commit 2ee756f276d82814a63f15e0002b1a08df994e12.

Changes: replace the external reference link with an in-page reading and recording dialog; preserve the exact user-supplied Aal-e-Imran reference; keep the five-Ayah assessment scope; add pause/resume, stop, timer, playback, retry, download, and attachment through the existing test_me_audio file input; allow same-origin microphone permission in Permissions-Policy. No production.js, backend, database, receipt or registration transport changes.

Verification: 10 browser checks passed using actual MediaRecorder with generated 440 Hz audio and intercepted XHR submissions (no production test registrations). Capture produces a playable non-empty audio file below 12 MB, and FormData/XHR contain the same attached bytes. Pause freezes timing; resume continues the take. Closing an unused take preserves previously attached audio. Missing required audio blocks progression and expands file upload. Reset releases all tracks and clears audio. Controls remain within the iframe viewport at 320×568, 390×844, 768×1024, 1440×1000 and 844×390. Permission refusal and missing MediaRecorder provide file-upload recovery. Real cloud browser with no microphone correctly displays the missing-microphone message.

Limitations: generated audio tests validate browser capture, encoding and existing frontend submission integration; physical iPhone/Android microphone and durable Storage/database writes were not re-tested. The existing server transport is byte-for-byte unchanged.

Test harness: tests/recorder-check.html is a verification-only route, excluded from the live deployment. It intercepts XHR and never creates real registrations. Run from the intake origin in a temporary verification deployment (serve it as /recorder-check.html); the harness fetches /index.html.

Rollback: assign intake.quranarabicjournal.com to dpl_A4fCTRuerNTZMAksE7q8M9iRGDZA and revert this commit. Keep the prior deployment.
