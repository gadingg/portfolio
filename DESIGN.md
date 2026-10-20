---
name: Gading Public Showcase
description: A dark, artwork-led portfolio for creative marketing and practical problem solving.
colors:
  canvas: "#060706"
  surface: "#141613"
  ink: "#f3f0e8"
  secondary: "#b6b8ae"
  accent: "#ff5a1f"
  line: "#33372f"
  control-line: "#7b8073"
  accent-hover: "#ff8153"
  dark-hover: "#252820"
typography:
  display:
    fontFamily: "Manrope, Arial, sans-serif"
    fontSize: "clamp(32px,8.1vw,96px)"
    fontWeight: 800
    lineHeight: 1.08
    letterSpacing: "-.035em"
  headline:
    fontFamily: "Manrope, Arial, sans-serif"
    fontSize: "clamp(32px,4.3vw,58px)"
    fontWeight: 800
    lineHeight: 1.12
    letterSpacing: "-.035em"
  title:
    fontFamily: "Manrope, Arial, sans-serif"
    fontSize: "clamp(27px,3.1vw,42px)"
    fontWeight: 800
    lineHeight: 1.12
    letterSpacing: "-.035em"
  body:
    fontFamily: "Manrope, Arial, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.8
  label:
    fontFamily: "Manrope, Arial, sans-serif"
    fontSize: "12px"
    fontWeight: 700
  button:
    fontFamily: "Manrope, Arial, sans-serif"
    fontSize: "14px"
    fontWeight: 700
    lineHeight: 1.4
    letterSpacing: "normal"
rounded:
  filter: "6px"
  control: "8px"
  artwork: "12px"
spacing:
  compact: "8px"
  control-gap: "12px"
  small: "16px"
  inset: "20px"
  group: "24px"
  block: "32px"
  section-mobile: "64px"
  section-desktop: "104px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.canvas}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "12px 18px"
  button-primary-hover:
    backgroundColor: "{colors.accent-hover}"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "12px 18px"
  button-dark:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "12px 18px"
  filter:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.filter}"
    padding: "9px 14px"
  filter-selected:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.canvas}"
  dialog:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.artwork}"
    padding: "20px"
---

# Design System: Gading Public Showcase

## Overview

**Creative North Star: "The Work Leads"**

A near-black canvas gives actual work the visual space to carry Gading's creative marketing and problem-solving identity. Warm white, broad Manrope lettering, and clear orange actions make the interface confident without competing with the artwork. English headings and action labels sit alongside natural Indonesian explanations.

This records the implemented public showcase, work collections, and case-study system, scoped by the showcase body class. It does not govern the admin or CV surfaces. The palette and component rules are extracted from `public/assets/css/showcase.css`, the public homepage, and the public collection and case-study components; page composition remains in the surface briefs.

**Key Characteristics:**
- Large artwork with captions outside its frame; video thumbnails use a bottom title overlay.
- Confident sans headings and quieter, readable explanations.
- Flat dark surfaces, thin dividers, and compact rectangular controls.
- Orange actions and emphasis, with an orange contact surface.
- Small interaction responses that respect reduced motion.

## Colors

Warm text and vivid orange sit on dark, slightly green neutrals.

### Primary
- **Signal Orange** (`accent`): primary actions, selected emphasis in headings, small functional icons, focus outlines, and the contact section. Its hover variant lightens primary controls.

### Neutral
- **Near-black Canvas** (`canvas`): page foundation, text on orange, and dark actions.
- **Deep Olive Surface** (`surface`): archive, dialogs, and media recovery states.
- **Warm White** (`ink`): headings, main content, and selected filters.
- **Quiet Sage** (`secondary`): explanatory copy, captions, and supporting navigation.
- **Structural Olive** (`line`): section and content dividers.
- **Control Olive** (`control-line`): interactive outlines and link underlines; deliberately clearer than structural dividers.

Artwork also uses cream, sage, lime, and rust as local image-composition colors. These are not additional interface accents.

**The Action and Emphasis Rule.** Use orange for intentional emphasis and interaction, including the existing full-color contact surface; it is not a blanket restriction to small accents.

## Typography

**Display Font:** Manrope, with Arial and sans-serif fallbacks.
**Body Font:** The same locally hosted Manrope family.

The system pairs broad, tightly spaced headings with relaxed paragraph leading. The source loads regular and extra-bold font files; fallback fonts are compatibility behavior rather than a separate display identity.

### Hierarchy
- **Display:** the fluid, extra-bold hero role in the frontmatter.
- **Headline:** fluid section headings with balanced wrapping.
- **Title:** project headings, using the smaller fluid range.
- **Body:** explanatory paragraphs; their observed maximum widths range from 43ch to 65ch depending on context. Base body defaults are 16px with 1.65 leading; the recurring explanatory role is recorded above.
- **Label:** compact captions and definition labels. Supporting caption lines may use regular weight.
- **Button:** sentence-case, bold action labels with normal tracking.

Case-study page titles use `clamp(34px,5.5vw,72px)` with 1.12 leading above the phone breakpoint. Supporting narrative and dialog headings use smaller role-specific sizes rather than another font family.

Homepage About paragraphs use 16px text with 1.8 leading and 20px paragraph separation above the phone breakpoint. The English statement is the stronger reading anchor: 22px with 1.45 leading from 600px to 959px, increasing to 24px on desktop. View CV remains a minimal inline file-icon link. The factual hero metadata is owner-supplied content; its small type is not a reusable pre-heading pattern.

At widths up to 599px, main section, collection, and case headings follow the existing mobile hero scale: `clamp(32px,8.1vw,48px)`, 1.08 leading, and -.035em tracking. At 390px this is 32px with a 34.56px line height. Main content paragraphs use 15px with 1.8 leading, including About, toolkit explanations, contact, work summaries, and case narrative. About's English statement retains its bold emphasis at body size with a 58ch maximum measure. Works and capability subgroup headings use 24px with 1.25 leading; project and toolkit titles use 20px with 1.3 leading. Metadata, captions, controls, and compact pipeline node labels keep their distinct smaller roles. These phone overrides do not change the hero, desktop scale, fonts, copy, or interactions. See `docs/briefs/2026-10-19-grid-mobile-type.md`.

**The One Family Rule.** Keep display, explanation, navigation, and controls in Manrope; hierarchy comes from scale, weight, spacing, and color.

## Layout

Content shells stop at 1280px. Mobile shells subtract 40px from the viewport; from 600px they subtract 64px. The sticky header is full-width and aligns its desktop contents to the same maximum width.

The system is mobile-first. Work grids use one column below 600px, two from 600px, and three from 960px. At 960px, desktop navigation replaces the menu button, existing case-study feature stories become two columns, and the process pipeline changes from vertical to horizontal. Paragraph columns remain constrained for reading.

The homepage hero uses content-driven height. Selected Works starts 48px after the hero content below 960px and 64px above it; its bottom padding is 64px and 88px respectively. Child groups retain dividers and generous separation. About uses 56px vertical padding below 960px and 72px above it; its capability group follows after 40px and 48px respectively. Process sections retain the mobile and desktop section spacing. Repeated gaps and insets use the frontmatter rhythm. The homepage Visual Design gallery now follows `docs/briefs/2026-10-20-horizontal-design-gallery.md`, superseding its earlier asymmetric composition only.

At viewport widths up to 379px, each Works group heading stacks its View all destination below the title, left-aligned with a 12px gap. This preserves readable titles and comfortable controls on narrow phones.

## Elevation & Depth

Depth comes mainly from tonal surfaces, thin borders, artwork cropping, and space. Buttons have no shadow or backdrop blur. The sticky public header is solid at the top and uses a soft glass surface while scrolling; this owner-approved navigation exception does not extend to cards, buttons, dialogs, or admin surfaces. Dialogs use a dark translucent backdrop (`#060706e8`), a surface fill, and a fine border.

### Shadow Vocabulary
- **Captured interface:** `0 18px 40px #172c2233` under the tilted Listing Hub screenshot. This belongs to the artwork composition, not ordinary controls or content containers.

**The Flat Interface Rule.** Keep interface surfaces flat; preserve the soft screenshot shadow where it expresses the existing artwork treatment.

## Shapes

Controls are compact rounded rectangles, not pills. Work imagery and dialogs use the artwork radius. Retained archive styles use the control radius for imagery and the filter radius for filters. Borders are one pixel. Large artwork clips to its frame; captions remain outside except for the bottom-aligned video title and play label.

Line icons use current color, rounded stroke ends, and a standard 20px size with 1.7 stroke width. Compact contextual icons use 16px or 17px. Pair icons with visible action labels; the lightbox's previous and next controls instead carry accessible names. Carousel pause/resume controls use icons with state-specific `aria-label` and `title` text. The mobile menu trigger and footer social links are also icon-only: 24px Lucide icons inside at least 44px targets, with accessible names and tooltips. These controls have transparent backgrounds and no border or surrounding rectangle.

## Components

### Buttons and text links

Primary, outline, and dark buttons share a minimum 48px height, the button typography, and a 12px icon gap. Outline controls use the control border, then invert to warm white on hover. Dark controls appear on orange and lighten on hover. Pressing a button moves it down one pixel. Disabled buttons reduce opacity to .4 and remove that motion.

The homepage hero primary action is a compact contextual variant: minimum 44px height, 10px by 14px padding, 13px text, and a 10px icon gap. Its secondary destination is an inline text link rather than another filled control.

Text links have a persistent underline, at least 44px height, and change to orange on hover. Action groups wrap rather than conceal labels.

### Collection selection and retained filters

Collection navigation uses outline links that wrap; `aria-current="page"` selects the warm-white fill and dark text. Retained archive filter styles use at least 44px height, a visible outline, and `aria-pressed="true"` for the same selected treatment. Collection links are page destinations rather than in-place archive filters.

### Artwork and content containers

Case-study imagery forms large standalone surfaces beside story copy. Work cards use landscape 4:3 app artwork and 3:4 video thumbnails. Design images retain their intrinsic proportions, transparent frameless containers, and no hover zoom. App and design titles sit below the artwork. Video titles and “Watch video” sit at bottom left over a bottom-only dark scrim; this is a media-readability treatment, not a new interface gradient. Design imagery exposes an “Enlarge” action. Loading, empty, and recovery content retains readable text and a retry action where implemented; missing media gets an explicit message. Example content carries a visible “Data contoh” label.

Website / Apps combines thumbnail, title, description, and arrow CTA into one semantic destination link with no nested controls. Examples without destinations use one button for the whole unit. Hover and keyboard focus turn the title orange; the arrow moves slightly on hover, and pressing the unit offsets it one pixel. Project spacing exceeds the spacing within each unit.

Internal Listing Hub uses a single 4:3 cover presenting All Database and Personal Listing as two mobile apps within the same case study. The cover contains two complete graphite phones with actual white/green interfaces, restrained opposing perspective, and soft physical shadows on a forest-green studio background. These materials belong to the project artwork and do not change public interface tokens. Keep copy outside the thumbnail. The cover, concise Indonesian problem/solution/outcome, and separate app link blocks remain editable through Works CMS. Authored Listing Hub copy uses no em dash or en dash, and makes no unverified quantitative impact claims. See `docs/briefs/2026-10-19-listing-hub-mobile.md` for the asset-specific composition.

PROGRAM MBG uses a 4:3 mobile raster cover built from three real screens: point mechanism, the dominant central leaderboard, and admin input. Complete graphite phones, an indigo studio surface, and soft physical shadows present the original navy, teal, and gold game interface as project artwork only. Its chunky headings, participant photos, and screenshot point totals are not public interface tokens or measured business outcomes. Keep the cover and narrative editable through Works CMS; describe the activity, points, ranking, and admin-processed reward loop without invented results or em dashes and en dashes. The 4:3 cover keeps the full composition visible on cards and case pages. See `docs/briefs/2026-10-19-mbg-mobile.md` for the asset-specific composition.

Meta Ads Report uses a 4:3 close-up cover of a single white/silver framed display. A static, elevated white panel magnifies the existing Rekap Iklan menu and real batch metrics, while the underlying dashboard stays visible but subdued. Preserve actual screenshot labels, figures, and blue/green accents; the panel is an artwork focus treatment, not a new application feature or command menu. Soft physical shadows and white/silver materials belong to this artwork only; the portfolio retains its dark/orange identity and Manrope. The cover and concise description remain editable through Works CMS, while the existing case narrative, claims, and blocks remain intact. This supersedes the prior two-MacBook composition. See `docs/briefs/2026-10-19-meta-report-focus.md` for the asset-specific composition.

Daily App Gading replaces the portfolio name Mega App Gading. Its 4:3 cover uses one regular diagonal grid plane of actual white interface panels on pale white/silver. Every panel has parallel edges, uniform gutters, matching radii, and the same rotation, with no overlap or independently floating screens. The large central-lower Kanban panel anchors the composition, with Prompt Generator upper left, Link Library upper right, Watermark Generator lower right, and cropped neighboring tiles. Uniform soft physical shadows and original small purple, blue, and teal UI accents belong to the artwork, not public interface tokens. No device frames are used. This owner correction supersedes the former floating three-panel collage. Cover, title, description, and case content remain editable through Works CMS; existing case narrative is retained with the name updated. The canonical route is `/work/daily-app-gading`, with `/work/mega-app-gading` retained as a legacy alias. Keep the stable internal item ID and external application destination. See `docs/briefs/2026-10-19-grid-mobile-type.md` for the current artwork composition.

The homepage Visual Design gallery is a single horizontal rail containing all published design works in their existing CMS order. Artwork frames share a common height and natural ratio-derived widths, with consistent gaps (16px), no stagger, borders, padding, crop, stretch, or hover zoom. After images load, the first image ratio and rail width determine the common height: below 768px the first piece targets 84% of rail width; from 768px it targets one third-and-a-bit (1/3.4). Height is bounded between 180px and 420px, so the visible count and next-piece preview depend on actual artwork ratios. The overflow stays inside the rail. Titles (16px, 1.4 leading) sit 12px below artwork, followed by compact category captions (12px) after 4px. The View all link remains beside the section heading with a minimum 44px target and 24px heading-to-artwork spacing, including narrow screens.

Touch swipe and trackpad use native horizontal scrolling with proximity snapping; mouse drag begins after a 6px threshold, temporarily disables snap, and suppresses the trailing click. Ordinary artwork clicks open the existing lightbox. Separate title links retain available detail destinations and minimum 44px targets. A focusable named rail supports Arrow keys, Home, and End. A quiet Drag / Swipe to explore hint appears only when the rail overflows. Hover-capable artwork fades subtly to .88 opacity and uses a zoom-in cursor; focus remains visible. Reduced motion removes smooth programmatic scrolling and the hover transition. No visible Enlarge action, autoplay, slide counter, or carousel controls appear. Demo labels are omitted from design presentation without changing stored data. Stored CMS homepage layouts receive the same gallery behavior through the public renderer. These rules are scoped to homepage Visual Design; the design archive retains its grid and video retains its carousel. Current browser captures were unavailable, so this source-derived update does not assert visual finish approval.

Branding & Video retains scroll snapping, previous/next buttons, arrow keys, a position indicator, and five-second advancement with an icon-only pause/resume control. Hover and focus pause advancement only within the artwork list; the separate controls do not hold the timer paused. Resume starts a fresh five-second interval even while its control retains focus. Touch interaction pauses the carousel; hidden tabs, offscreen content, and open dialogs suspend advancement. Reduced motion starts the carousel paused and removes smooth movement; explicit Resume permits automatic advancement. Collection pages reuse the cards in a grid.

Works card descriptions show the opening sentence and occupy at most two lines, with overflow clipped by an ellipsis. The Selected Works introduction has the same two-line limit. Full descriptions remain available in the CMS and case studies; this is a compact preview treatment rather than a content limit.

Req Take Video uses a 4:3 white/silver studio cover with two real browser panels: a dominant schedule panel at left/back and a supporting pending-request panel at right/front. Keep the original teal interface, schedule details, request card, pagination, and submit action. Restrained shared perspective, fine silver-white browser chrome, and soft physical shadows belong to the artwork only. Exclude the former aqua environment, rings, podium/stage, ribbons, and sparkles. The complete cover uses contain framing on cards and case pages, and remains editable through Works CMS. Preserve the existing project title, slug, case narrative, and application destination. See `docs/briefs/2026-10-19-req-take-video.md` for the asset-specific composition.

### Navigation

Case-study continuation is one **Explore More Work** section in both standard and custom-layout cases. The next project follows the existing source order and is featured first; one optional alternative uses the first remaining related project, excluding the next destination. Each preview is one semantic link containing artwork, title, a two-line description, and an arrow CTA, with no nested actions. Preserve source project text, images, and destinations. The owner-requested **UP NEXT** cue belongs only to the featured navigation card, paired with **Explore next case study**; it is functional navigation context rather than a reusable section eyebrow.

The continuation section has content-driven height and no dividers. On mobile it follows the case content by 48px, places cards 24px below the heading, and separates cards by 32px. The featured preview stacks artwork and text; its optional alternative places a compact thumbnail beside text. At 960px the section starts after 64px, heading spacing becomes 28px, and the pair uses a 1.4:1 grid with both previews stacked vertically within their columns. Preview titles use 20px, with a 24px featured title on desktop; summaries use 15px with 1.8 leading. The 13px CTA has a minimum 44px visual action height. Hover and keyboard focus turn titles orange; hover-capable pointers can move the arrow 3px, pressing quietens the copy, and reduced motion removes transitions. Retain the shared orange focus outline. This replaces separate Next Case Study and Keep Exploring navigation, without changing other section composition. See `docs/briefs/2026-10-20-case-navigation.md`.

The header remains sticky and solid at the top. Beyond 16px of scroll, supported browsers use a near-black translucent surface (`rgba(6,7,6,.76)`), 16px backdrop blur with 120% saturation, and a quiet bottom rule (`rgba(243,240,232,.14)`). Returning to the top restores the solid canvas. The same treatment covers homepage, collection, and case-study headers, including restored scroll positions. Unsupported browsers retain the opaque header; forced colors use a solid system canvas and system text divider. The .22s background and border-color transition is removed for reduced motion. Header geometry, touch targets, links, and dialog behavior do not change between states. Desktop links are quiet until hovered; the contact destination has stronger weight. Below the desktop breakpoint, header vertical padding is 8px around its 44px controls, giving a 60px header, with a 26px wordmark. A borderless hamburger icon opens mobile navigation. Its 44px target contains a 24px icon, turns orange on hover, and keeps the shared keyboard-focus outline. Mobile navigation opens a native dialog with large stacked links, separating rules, and a labelled close button. Preserve the skip link and native dialog keyboard behavior.

Footer Instagram and LinkedIn links use the same 24px icon scale and minimum 44px targets, arranged with a 12px gap. They inherit dark text on the orange contact surface and reduce opacity on hover. Retain accessible destination names, tooltips, and the contact surface's dark focus outline. An empty configured destination omits its link.

### Dialogs and disclosures

Menu, retained image, and work dialogs share the surface, border, inset, and large corner treatment. Widths are constrained to 540px, 1100px, and 1000px respectively and to the viewport minus 24px; their maximum height is the viewport minus 24px. Image previews contain images without cropping and expose previous/next controls. Work dialogs restore focus to the trigger on close. Video embeds load on selection and retain an external Instagram link.

Capability disclosures use native details/summary, horizontal rules, and a minimum 64px summary height. Open summaries turn orange and rotate the plus icon 45 degrees.

### Interaction states

Focus outlines are orange, three pixels wide with a five-pixel offset; the contact surface changes the outline to near-black for visibility. Common color transitions take .2s. Artwork transforms take .5–.7s with the custom ease recorded in the sidecar. Hover image transformations run only on hover-capable devices when reduced motion is not requested. Reduced motion removes animations and transitions and disables smooth scrolling.

### Process pipeline

How I Work uses a continuous pipe with rounded elbows connecting five compact process modules. Each module carries a 24px Lucide icon, a subdued tabular sequence number from 01 to 05, and the existing title. There is no supporting introduction or step paragraph. The pipe has a structural outer stroke, a dark inner channel, and a thin orange progress core; this geometry belongs to the process component rather than general navigation or content rows.

Below 960px, modules alternate left and right along the vertical pipe within a 650px section. From 960px, modules alternate above and below the horizontal pipe within a 280px section. Modules use the artwork corner radius, a fine outline, and a flat canvas fill. Reached modules gain an orange outline and icon; future modules retain quiet icons.

GSAP ScrollTrigger fills the pipe in direct relation to native scrolling, with .35s scrub catch-up and no pinning. A small bright packet follows the leading edge only while progress lies between the endpoints. Reverse scrolling reverses both fill and packet; there is no idle loop. Without JavaScript or with reduced motion, the fully connected static pipe and all titles remain visible without the packet. This presentation is also applied to stored homepage layouts without changing their saved step titles. The surface-specific revision is recorded in `docs/briefs/2026-10-17-pipe-refinement.md`.

## Do's and Don'ts

### Do:
- **Do** preserve separate structural and interactive border colors.
- **Do** keep actual artwork prominent, with captions outside its frame except for the video thumbnail's bottom title overlay.
- **Do** retain visible action labels, keyboard focus, and explicit loading or failure messages; menu, social, and carousel pause/resume controls use icons with accessible names and tooltips, with state-specific names for pause/resume.
- **Do** respect reduced motion and let mobile action groups wrap.
- **Do** preserve PROGRAM MBG's three real mobile screens in its 4:3 cover, keep its navy, teal, and gold inside the artwork, and retain CMS editing of cover and narrative. Treat screenshot points as interface content rather than outcome metrics; authored copy uses no em dash or en dash.
- **Do** present Meta Ads Report as a single white/silver display close-up with a static magnified Rekap Iklan panel over a subdued real dashboard. Use existing batch metrics and blue/green accents without inventing application features. Keep the cover and description CMS editable, preserve existing case claims and blocks, and retain the portfolio's dark/orange interface.
- **Do** use Daily App Gading as the portfolio name, preserve its aligned diagonal white/silver grid with parallel panels and uniform gaps, and keep original UI accents confined to artwork. Retain editable CMS fields, the existing narrative, and the legacy Mega App route alias.

- **Do** keep Req Take Video's two browser panels on a white/silver studio background with the larger schedule at left and the supporting request panel at right. Preserve teal UI and actual content, soft physical shadows, 4:3 contain framing, CMS image editing, and the existing title, slug, case narrative, and destination. Keep aqua environments, rings, stages, and sparkles out of this artwork.

### Don't:
- **Don't** turn local artwork colors into new interface accents.
- **Don't** apply the screenshot shadow to ordinary buttons, navigation, or content rows.
- **Don't** import legacy admin or CV styling into the public showcase system.
- **Don't** promote small pre-heading context lines or artwork kickers into a reusable heading pattern; these existing exceptions are not canonized by this document.

## Admin refinement, 18 October 2026

The public tokens above remain unchanged. The separate admin Overview and related control refinement is documented in [docs/design/admin-overview.md](docs/design/admin-overview.md); its dark/amber identity follows the existing admin surface.

Live editor: panel konten dan daftar bagian mengikuti identitas admin incumbent (Manrope, #151713, #f3f0e8, amber #d9a64b). Lihat `docs/briefs/2026-10-18-live-editor.md`. Pengaturan teknis disembunyikan; tampilan publik tidak didesain ulang.
