# Admin drafts and publication

Owner-approved flow: automatic private drafts, one-action publication, quiet navigation once edits are safe, device recovery while disconnected, and individual publication from a work detail.

Works, Website & CV and the visual editor share a two-second autosave pause. The toolbar exposes storage status, a retry action only after a failed save, and Publish. Publish sends the latest content directly; no preliminary Save draft action is required. Validation, authentication, origin checks and optimistic revisions still apply. Draft validation can reject incomplete or malformed fields; the device copy is retained so editing can continue.

Work detail publication submits only the selected record. Its draft and published versions update together in one database write. Other drafts, pending removals and public ordering remain unchanged. New works are prepared for visibility by default but stay private until publication; existing hidden records retain an explicit hidden-state action. Collection publication remains separate, reviews changed records/order and can be cancelled. Website & CV and homepage visual publication retain a scope review because they can publish multiple sections. A visual case editor publishes only its selected work.

Responses never replace text typed after a save started. Uploads pause saving/publication. Switching from a form to its visual editor waits for the current save and saves any newer edits before navigation. Visual text inputs commit as they are edited so a focused textarea is included in both autosave and Publish.

Device backups use localStorage and a sessionStorage tab identity. Separate tabs normally receive separate backup keys; if tab storage is unavailable, the surface uses its single-key fallback. A reload in the same tab restores an unacknowledged draft when its server revision still matches. Reconnecting retries private synchronization; publication never occurs automatically. If the server has advanced, the editor offers backup download and the latest server version instead of overwriting it. JSON key order and server timestamp normalization are not treated as content changes.

Navigation/logout guards register only edits that are neither acknowledged by the server nor held in the current device copy. Storage failure keeps the exit warning. These backups require browser storage; this change does not add an offline application shell or make a page available for a first load without a connection.

## Verification

52 targeted tests cover selected publication isolation, ordering, conflicts, validation, backups, timestamp/key normalization, authentication, private media, visual publication and CMS reliability. Browser checks used real editor components with intercepted local fixture APIs: direct work publication made a single publish request; draft saves left public data intact; offline drafts recovered after reload and resynchronized; failure/retry and typing during a slow save retained the latest text; Website and visual publication accepted unsaved content; bulk confirmation cancellation retained the public snapshot; a changed server revision made no automatic write. The 390px toolbar remained inside the viewport with a 44px Publish target.

The temporary fixture route was removed before the production build. Its source was saved outside the application under the task outputs for reproducibility. No real content was edited or published during browser QA.

Production build passed, including TypeScript and all 18 static pages. Existing multiple-lockfile and Browserslist advisories remain. No QA route appears in the build.
