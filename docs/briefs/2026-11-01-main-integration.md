# Main integration

Integrate admin-video-publishing with portfolio/main (89661cb), retaining both histories. No force push.

Preserve automatic drafts and offline recovery, per-item publication, explicit active video source, portfolio overview thumbnails, and the approved public copy and collection heading actions. Keep main's AI authoring, editable case layouts and application links, manual homepage selection, scoped publish summaries, and case walkthrough motion. Motion uploads use a separate file-only editor so they do not inherit portfolio Instagram controls. Portfolio video cards retain main's direct Instagram destination and popup-only file playback; active source selection controls the public projection.

Merged collection headings keep counts outside the View all button. Mixed app collections use project counts; collections composed entirely of case studies use case-study counts. Count totals remain independent of homepage featured selections.

Validation: 133 regression tests pass; TypeScript and JavaScript syntax checks pass. Build and production deployment verification are recorded by the completion message. Browser visual QA is unavailable while local browser access is disabled in Work settings.
