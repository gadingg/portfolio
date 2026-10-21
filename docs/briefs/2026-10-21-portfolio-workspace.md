# Portfolio workspace simplification

Scope approved: fix the list and editor UX findings from the prior audit. Existing dark admin palette and controls retained.

- Collection list prioritizes three lightweight category tabs, search, a single category-specific Add entry and content rows. Mobile tabs use concise labels with complete accessible names and visible counts.
- Add menu separates creating one entry from uploading/selecting multiple media. Upload panel appears on demand or when files enter the list. Existing upload limits and media library remain unchanged.
- Delete moved into item action menus, preserving confirmation and local Undo. Menus dismiss on outside pointer interaction and Escape, returning keyboard focus to the trigger.
- Clean state has only a compact published status. Unsaved or unpublished changes expose the save toolbar. Publish requires saving first and explicitly applies to the entire collection.
- Editor has a live card preview beside the form on wide screens; mobile/tablet uses one column. Existing video thumbnail controls, optional settings and case-study blocks remain available.
- URL query follows selected category/item. Public link uses the published case slug, preserving draft rename safety.

Validation: production build and 33 regression tests passed; scoped Impeccable detector returned no findings. Browser exercised add/upload reveal, editor local copy preview, disabled publish before draft save, cancellation without writes, and responsive list/editor. No production content saved or published during UI QA.
