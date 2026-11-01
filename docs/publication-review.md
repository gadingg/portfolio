# Draft ordering and publication review

The review now uses icon summaries, project thumbnails and compact change labels. Changed order is presented as individual thumbnail rows with previous and next positions; when there are other changes, this list is expandable. Scope is stated once below the heading. The save toolbar and media, story and CV editors use shorter supporting text. Draft/publish behavior is unchanged by this visual refinement.

- Reordering portfolio cards changes local editing state. Save draft persists it, then publication requires review and explicit confirmation.
- The legacy `order` API action also updates only the draft. Published order, copy and visibility remain unchanged until publication.
- Portfolio review covers the entire collection, including changes in other categories. It lists additions, updates, removals, image changes and order changes. Hidden items remain labeled as hidden.
- Website & CV review lists affected sections and CV fields. The visual editor uses the server-provided summary of its publication scope: the whole site document for homepage edits, or the selected case study only.
- A valid uploaded video uses **Watch video** and opens the existing player popup. Instagram-only cards use **View on Instagram**, link directly to the post in a new tab, and use an external-link icon. Initial HTML and client-rendered cards agree.

Validation: production build and 107 tests passed. Browser QA on a RAM-only fixture verified local reorder without writes, draft save without publishing, cancel without publishing, explicit confirmation applying the new order, and a 390px review dialog without horizontal overflow. A generated local MP4 played automatically after opening its popup (`readyState=4`, `paused=false`), with zero video elements before opening and after closing. No production CMS writes or media uploads were performed for these checks. The fixture server was stopped after testing.
