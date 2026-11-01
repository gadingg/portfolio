# About + What I Do refinement

Approved after brainstorming: real-work collage in About and more legible GSAP process scenes for four capability cards. Scope excludes unrelated sections and global tokens.

Implemented: existing headline and CV link retained; default paragraph becomes three action lines. Exact-match About copy migration uses its own version marker so a previously saved public-copy edition can adopt the approved lines without reapplying unrelated defaults. Owner copy and versioned layout edits/removal remain respected.

The collage uses the first ready published design image and app cover. Both use responsive variants and lazy loading; original private files are not copied into static assets. Default layout omits the collage if either work category is unavailable. Desktop places text beside the overlapping images; mobile orders heading, collage, then short text/CV.

Capability motion is now distinct per discipline, with about 1.6–1.8 seconds of finite choreography and larger 24–40px movements. Start at 50% card visibility; a completed sequence can replay on mouse entry, while touch relies on viewport entry. Active sequences do not stack. Existing Works-card motion is preserved. Reduced motion, missing GSAP and CMS preview leave content static and visible. About gets one 1.35-second assembly entrance. No idle/infinite loops, supporting paragraphs, fabricated project claims, new tool names or decorative glass UI were added.

Verification: 148 tests, TypeScript validation, JavaScript syntax check and production build pass. Local HTTP verifies three action lines, four exact capability titles, one collage with two responsive images (both status 200), one browser-progress element, one AI packet, and the unchanged /cv action. Impeccable detector ran once; new font endpoints were aligned to the existing documented ramps and the collage shadow uses the existing canvas color. Existing out-of-scope token advisories were not repaired.

Browser QA is blocked by Work settings disabling local browser use. The supplied user screenshot documents the old flat composition. No after screenshot, computed viewport geometry, visual quality score, or physical-device test is claimed. Preview available at http://localhost:3003/#about. No commit, push, deployment, or CMS publication was performed in this task.


Follow-up approved: final process label is Improve. Design & Build now uses one palette/code symbol derived from the existing Lucide paths, replacing the two separate SVGs. Process-copy migration has its own version and preserves later owner edits. All 149 tests pass. The user explicitly requested commit/push for these changes together with pending About and What I Do work; the earlier local-only status above describes the prior task completion.
