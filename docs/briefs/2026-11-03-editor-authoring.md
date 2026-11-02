# Portfolio authoring

Mode: Operate. Preserve navy/amber, Manrope, autosave/recovery, scoped publication and the approved trash workflow.

The collection's primary Add action creates one item of the selected type. Web apps start with a draft case study; new videos explicitly start with the file source. Bulk import is a separate collection action and states that every file creates one portfolio item.

WorkEditor is a single-column typed form. Web apps show title, summary, cover and the three narrative fields. Designs show title and artwork. Videos show title, one selected source, one player and a compact thumbnail control. Supporting content, AI, page layout and technical settings are optional disclosures.

The existing draft representation remains unchanged. Type changes require confirmation and retain archived case content. Demo flags remain stored but are not exposed in the ordinary authoring flow.

One media picker contains Upload new, existing assets and, where appropriate, direct video links. Main form previews and library images use responsive, lazy image variants. The media library does not preload every video just to render its list.

The sidebar card preview is removed. Design/video card previews open in a native dialog. Case-study previews reserve a tab during the click, save pending changes and then navigate to the authenticated preview. If saving fails the empty tab closes; blocked popups fall back to same-tab navigation after saving. The application's frame/security headers remain unchanged.

One publication control shows Terbitkan for a first publication and Perbarui for an existing live item. Hiding retains its explicit action. Field validation opens the relevant disclosure and focuses the affected field; motion preference controls scrolling.

Why these choices:
- Single-column typed forms reduce simultaneous decisions and preserve reading order on mobile.
- Disclosures retain capabilities without making every setting a prerequisite.
- Relevant media icons supplement short action labels; familiar primary actions retain visible text.
- Navy/amber and Manrope preserve the incumbent identity without new global tokens.
- No decorative animation; progress, native dialogs and focus feedback communicate real state.

Verification: component and persistence tests, typecheck, production build, and authenticated read-only desktop/mobile browser checks. No production content was published or deleted during browser QA.
