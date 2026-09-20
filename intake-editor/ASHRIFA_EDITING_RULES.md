# QAJ Intake — Ashrifa Editing Workspace

## Locked references

- Live production: https://intake.quranarabicjournal.com/
- Vercel project: qaj-registration-brand-preview
- Protected rollback deployment: dpl_C7imT9uckzPcTqfXFRzQpTTn154y
- Editing branch: ashrifa-intake-editor
- Working preview file: intake-editor/PREVIEW.html

## Stable development preview

https://raw.githack.com/saadmfazal/QAJteacher/ashrifa-intake-editor/intake-editor/PREVIEW.html

This is a development preview only. Never treat it as production.

## Files

The live production source was captured directly from the current Vercel deployment on 20 Sep 2026:

- intake-editor/index.html
- intake-editor/styles.css
- intake-editor/app.js
- intake-editor/favicon.svg

These four files are the frozen source mirror.

PREVIEW.html is a self-contained working copy containing the same HTML, CSS and JavaScript. It is the file Ashrifa's ChatGPT should edit during the review session.

## Non-technical editing loop

When Ashrifa requests a change:

1. Understand her request from plain language or screenshot.
2. Modify ONLY `intake-editor/PREVIEW.html` on branch `ashrifa-intake-editor`.
3. Preserve all unrelated behaviour.
4. Commit the change to the same branch.
5. Tell Ashrifa: "Done — refresh the preview."
6. Give the same preview URL above.
7. Never deploy to production during normal editing.

Each new request builds on the previous edits.

If Ashrifa says "undo that", revert only the most recent requested edit, commit, and ask her to refresh the same preview.

## Production rule

Do not modify main.
Do not modify qaj-registration-brand-preview production.
Do not repoint intake.quranarabicjournal.com.
Do not remove the protected deployment.

Only when Ashrifa explicitly says FINAL / APPROVED / MAKE IT LIVE should the approved PREVIEW.html be converted into the final deployment package, tested, and published.

## Safety

The current form is safe-preview only. It must not transmit registration data or uploaded files unless Saad explicitly approves activation as a separate change.
