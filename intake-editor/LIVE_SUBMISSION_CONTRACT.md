# CRITICAL — LIVE SUBMISSION CONTRACT (25 Sep 2026)

The production intake form is now LIVE-WRITE, not safe-preview-only.

Production domain:
https://intake.quranarabicjournal.com/

Submission endpoint:
https://viajmvbwpmkiqxjtgshv.supabase.co/functions/v1/qaj-intake-live

Database target:
public.qaj_course_registrations

Receipt/audio bucket:
qaj-registration-files

Production hotfix deployment:
dpl_8fFU7t5h1QGMUj2t1MV6e9GCzWtT

Protected pre-hotfix rollback:
dpl_C7imT9uckzPcTqfXFRzQpTTn154y

IMPORTANT:
- Ashrifa's PREVIEW.html may remain non-writing for safe visual editing.
- Any future production publish MUST preserve the qaj-intake-live submission integration.
- Never publish the old "safe preview" submit handler back to production.
- Do not show a success message unless the server returns ok:true.
- If submission fails, keep the filled form visible and show an error.
- Payment receipt is required and must upload before the user sees final success.
- Production submissions must land in qaj_course_registrations with source=intake_2026_web and intake_status=pending.


## Current production rendering architecture

The live Vercel page is now intentionally a tiny full-screen wrapper that loads the self-contained Supabase Edge Function page:
https://viajmvbwpmkiqxjtgshv.supabase.co/functions/v1/qaj-intake-live

Reason: the prior Vercel asset references broke public CSS/JS loading on mobile. Do not reintroduce cross-deployment CSS/JS asset links.

Any future production publish must either:
1. keep this wrapper architecture, or
2. deploy a fully self-contained production bundle whose CSS/JS are guaranteed to load from the same production deployment.
