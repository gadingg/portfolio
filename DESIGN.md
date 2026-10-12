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
    fontSize: "clamp(40px,8.25vw,96px)"
    fontWeight: 800
    lineHeight: 1.05
    letterSpacing: "-.04em"
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

This records the implemented public showcase and case-study system, scoped by the showcase body class. It does not govern the legacy admin or CV surfaces. The palette and component rules are extracted from `public/assets/css/showcase.css`, the public homepage, and the public case-study components; page composition remains in the surface brief.

**Key Characteristics:**
- Large artwork with captions outside its frame.
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

Case-study page titles use `clamp(34px,5.5vw,72px)` with 1.12 leading. Supporting narrative and dialog headings use smaller role-specific sizes rather than another font family.

**The One Family Rule.** Keep display, explanation, navigation, and controls in Manrope; hierarchy comes from scale, weight, spacing, and color.

## Layout

Content shells stop at 1280px. Mobile shells subtract 40px from the viewport; from 600px they subtract 64px. The sticky header is full-width and aligns its desktop contents to the same maximum width.

The system is mobile-first. At 600px, the artwork strip becomes three unequal columns and the archive becomes three columns; below that the archive has two columns and the first strip piece spans both columns. At 960px, desktop navigation replaces the menu button, feature stories become two columns, and alternating features place their artwork on opposite sides. Paragraph columns remain constrained for reading.

Major work, tools, and process sections move from the mobile section spacing to the desktop section spacing. Archive and about sections use 88px vertical padding on desktop. Repeated gaps and insets use the frontmatter rhythm; section composition can choose larger observed gaps of 70px or 100px.

## Elevation & Depth

Depth comes mainly from tonal surfaces, thin borders, artwork cropping, and space. The header and buttons explicitly have no shadow or backdrop blur. Dialogs use a dark translucent backdrop (`#060706e8`), a surface fill, and a fine border.

### Shadow Vocabulary
- **Captured interface:** `0 18px 40px #172c2233` under the tilted Listing Hub screenshot. This belongs to the artwork composition, not ordinary controls or content containers.

**The Flat Interface Rule.** Keep interface surfaces flat; preserve the soft screenshot shadow where it expresses the existing artwork treatment.

## Shapes

Controls are compact rounded rectangles, not pills. The control radius also frames archive imagery; larger artwork and dialogs use the artwork radius. Filters use the smaller filter radius. Borders are one pixel. Large artwork clips to its frame while captions remain outside.

Line icons use current color, rounded stroke ends, and a standard 20px size with 1.7 stroke width. Compact contextual icons use 16px or 17px. Pair icons with visible action labels; the lightbox's previous and next controls instead carry accessible names.

## Components

### Buttons and text links

Primary, outline, and dark buttons share a minimum 48px height, the button typography, and a 12px icon gap. Outline controls use the control border, then invert to warm white on hover. Dark controls appear on orange and lighten on hover. Pressing a button moves it down one pixel. Disabled buttons reduce opacity to .4 and remove that motion.

Text links have a persistent underline, at least 44px height, and change to orange on hover. Action groups wrap rather than conceal labels.

### Filter chips

Archive filters have at least 44px height and a visible outline. `aria-pressed="true"` selects the warm-white fill and dark text. Their appearance represents an actual selectable filter, not decorative metadata.

### Artwork and content containers

Project imagery forms large standalone surfaces beside story copy. Archive tiles use variable portrait and square proportions, with titles and categories below. The visible “Enlarge image” action sits over the image. Loading, empty, and recovery content retains readable text and a retry action where implemented; missing media gets an explicit message.

### Navigation

The header remains opaque and sticky. Desktop links are quiet until hovered; the contact destination has stronger weight. Mobile navigation opens a native dialog with large stacked links, separating rules, and a labelled close button. Preserve the skip link and native dialog keyboard behavior.

### Dialogs and disclosures

Menu and image dialogs share the surface, border, inset, and large corner treatment. Widths are constrained to 540px and 1100px respectively and to the viewport minus 24px; their maximum height is the viewport minus 24px. The lightbox contains images without cropping and exposes previous/next controls.

Capability disclosures use native details/summary, horizontal rules, and a minimum 64px summary height. Open summaries turn orange and rotate the plus icon 45 degrees.

### Interaction states

Focus outlines are orange, three pixels wide with a five-pixel offset; the contact surface changes the outline to near-black for visibility. Common color transitions take .2s. Artwork transforms take .6–.7s with the custom ease recorded in the sidecar. Hover image transformations run only on hover-capable devices when reduced motion is not requested. Reduced motion removes animations and transitions and disables smooth scrolling.

## Do's and Don'ts

### Do:
- **Do** preserve separate structural and interactive border colors.
- **Do** keep actual artwork prominent, with captions outside its frame.
- **Do** retain visible action labels, keyboard focus, and explicit loading or failure messages.
- **Do** respect reduced motion and let mobile action groups wrap.

### Don't:
- **Don't** turn local artwork colors into new interface accents.
- **Don't** apply the screenshot shadow to ordinary buttons, navigation, or content rows.
- **Don't** import legacy admin or CV styling into the public showcase system.
- **Don't** promote small pre-heading context lines or artwork kickers into a reusable heading pattern; these existing exceptions are not canonized by this document.
