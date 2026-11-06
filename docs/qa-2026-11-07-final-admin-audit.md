# Final admin information architecture audit

Read-only audit against commit 8e8e5dd. No CMS data was changed or published.

## Verified publication note

The current database has 14 draft records and 17 published-snapshot records. Item-level review is empty. The existing publication summary identifies three removals: sample-video-5 (Video 05), sample-video-6 (Video 06), and sample-video-7 (Video 07). This does not imply that all three are currently visible to visitors: public readiness filtering is separate.

Overview falls back to “Ada perubahan koleksi yang belum tayang” because it detects an array difference but its review only visits draft items; records absent from draft have no review entry.

## Findings

1. High: Overview notice has no change counts, missing-record details or contextual destination. Its generic text link looks like supporting copy. Use a compact status card with icon, explicit removal count, expandable affected titles and a Tinjau 3 perubahan button.
2. High: PublicationBar discards scope and showPublish inputs. A collection save still publishes the entire snapshot across categories, but the UI no longer communicates this scope. Give collection and item operations distinct labels and review collection differences.
3. High: useManualSave hardcodes online=true and failed=false. Network errors remain handled by the saving callers, but connection/retry state is not represented truthfully by the shared interface. Track real request states and connectivity; retain unsaved content and unsaved-navigation protection.
4. High: VisualEditor still uses useAutoDraft and DraftRecovery, so the old offline-draft mental model remains on live layout routes. Standardize this before claiming the complete CMS has one saving flow.
5. Medium: Simpan & Terbitkan is also used when visibility is disabled, although this operation saves a private record or hides a public record. Use Simpan Perubahan for private records and name a hide operation explicitly.
6. Medium: merged SiteManager does not include the existing Portofolio field group in any of its three group mappings. Those settings become inaccessible. Contact & CV also mixes profile text, contact fields, experience, education and files into a long section. Map every supported field and use short named disclosures for optional CV lists.
7. Medium: editor uses a fixed full-screen layer without moving focus into the editor on opening or providing a dedicated focusable page heading. Tab changes hide panels but do not scroll the internal editor container to their beginning. Complete orientation, focus and internal scroll handling.
8. Medium: AISettings still links to the retired standalone AI Study Case route, which now redirects to the portfolio list. Remove the obsolete cross shortcut.

## Suggested first pass

Address 1–4 together: meaningful pending-change review, honest operation scope, real save-state feedback and a single saving model across editors. Follow with labels, field coverage and focus/navigation. Avoid publishing the three legacy removals during UI verification.

## Implemented after owner approval

All eight findings are addressed in the local implementation:

- One expandable change card replaces both the generic notice and duplicate draft list. The shared publication summary includes missing records and order changes, ignoring timestamps/property ordering.
- Its contextual link opens the collection-change section. That section explains cross-category scope; applying collection changes requires reviewing the exact summary. Item saves continue using the existing selected-work API.
- Manual-save state now observes online/offline browser events and actual caller request/error states. Failed operations retain form values and expose retry through the primary action.
- VisualEditor uses the same manual-save hook, removes the recovery banner and retains unsaved-navigation guards. Its publish review still explains Website & CV or selected-work scope.
- Private saves, public publication and hiding use distinct action labels; private records no longer claim Published after saving.
- All existing site-field groups, including Portofolio, are mapped. CV experience/education are collapsed disclosures.
- Opening the full-screen editor focuses its heading. Explicit tab changes reset the inner scroll position, and validation selects the panel corresponding to the first invalid field.
- The obsolete AISettings shortcut is removed.

Verification uses isolated tests for removal summaries, timestamp normalization, operation labels, publication scope, offline/retry states, and the existing trash/publication boundaries. Browser QA opens and cancels publication review; no pending database change is applied.
