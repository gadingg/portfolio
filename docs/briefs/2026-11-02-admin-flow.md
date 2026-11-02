# Admin flow refinement

Mode: Operate. Owner edits and publishes a personal portofolio.
Preserve the incumbent navy/amber CMS, Manrope, draft recovery, and scoped publishing.
Direction: ENERGY 1 / RHYTHM 1 / MOTION 1. Calm working surfaces with one next action.

## Decisions

- Keep navigation labels and add relevant icons so destinations remain understandable.
- Use 44px icon controls for repeated edit/open/media/regenerate actions; retain accessible names, focus and tooltips.
- Keep text on primary actions and unfamiliar operations; do not make the CMS an unexplained icon grid.
- Remove duplicated saved statuses, redundant stat explanations and repeated missing-date notices.
- Show publication controls when changes exist. Keep failure recovery and publication scope visible when relevant.
- Read Works and Site initial snapshots on the server after session verification. Hydrate draft, published and revision together; skip the initial client fetch.
- Retain client fetches for explicit recovery. Route errors use the existing retry boundary.
- Use route-specific skeletons and the same skeleton for client-only initialization. Screen readers receive one status; visible loading copy does not follow the skeleton.
- Keep image lazy loading independent from page initialization. Responsive small thumbnails avoid fetching original-size artwork in admin lists.
- Remove nested blur from operational cards. Surface borders organize content without decorative motion.

## References

Style UI (https://style.ai.id/) directory reviewed: shadcn/ui, Motion Primitives and other component resources. Applied disclosure, tooltip, skeleton and action-hierarchy patterns within existing components; no new component or animation dependency.
Find Skills discovery: skills.sh lists vercel-labs/agent-skills web-design-guidelines and React best practices. Existing Impeccable and Antislop instructions cover this refinement; no extra skill installation.

## Validation boundary

Run typecheck, production build, existing tests and new initial-data/publication-state tests.
Use authenticated local browser for read-only route, disclosure and media-picker checks.
Do not publish, generate AI output, upload assets, change keys or mutate owner content during QA.
