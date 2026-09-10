# PRD — GADING PERSONAL PORTFOLIO CMS
## Public Portfolio + Study Case CMS + Admin Dashboard

---

# 01. PROJECT OVERVIEW

## 1.1 Project Name

Gading Personal Portfolio CMS

## 1.2 Project Goal

Transform the existing static personal portfolio website into a production-ready, dynamic portfolio platform that consists of:

1. Public-facing personal portfolio.
2. Dynamic Recent Works / Portfolio section.
3. Dynamic Study Case detail pages.
4. Private admin dashboard.
5. CRUD portfolio management.
6. Medium-style Study Case editor.
7. Image/media management.
8. Draft and Published states.
9. Featured project management.
10. Flexible card rendering system that allows the visual card design to be replaced later, including an Animos-inspired motion/card presentation.

The final application must be deployable to Vercel and must not require manual HTML editing every time the owner wants to add or update a portfolio project.

---

# 02. IMPORTANT IMPLEMENTATION PRINCIPLE

DO NOT rebuild the existing portfolio from scratch.

The current `index.html` is the visual foundation.

Preserve and reuse the existing:

- visual identity
- typography hierarchy
- spacing system
- dark/light theme
- Hero section
- navigation
- reveal animations
- responsive behavior
- visual gallery/carousel
- Web Apps section
- Contact section
- general visual language

The existing Recent Works section currently contains hardcoded project cards and should be converted from static HTML into dynamic data-driven rendering.

The existing Web Apps section also currently contains hardcoded cards and should be prepared for future dynamic content.

---

# 03. CORE PRODUCT CONCEPT

The application has two completely different experiences.

## PUBLIC EXPERIENCE

Route:

`/`

Purpose:

Showcase Gading's professional work, projects, digital products, campaigns, and detailed case studies.

Public users must NEVER see:

- admin navigation
- admin dashboard
- database controls
- edit buttons
- delete buttons
- draft content
- unpublished content
- admin PIN
- admin API secrets

## ADMIN EXPERIENCE

Routes:

`/admintgadink`

`/admintgadink/dashboard`

Purpose:

Allow the portfolio owner to manage all portfolio content without touching source code.

Admin capabilities:

- login
- view portfolio statistics
- create Study Case
- edit Study Case
- delete Study Case
- save draft
- publish
- unpublish
- feature/unfeature
- change ordering
- upload cover image
- upload content images
- manage tags
- manage categories
- preview before publishing
- logout

---

# 04. RECOMMENDED TECH STACK

Use:

- Next.js
- App Router
- TypeScript
- React
- Tailwind CSS only if it can coexist cleanly with the existing styling
- Supabase PostgreSQL
- Supabase Storage
- Supabase Auth or a secure server-side authentication layer
- Vercel deployment

Use server/client separation and cookie-based session handling.

Do not expose secrets to the browser.

Server-only secrets must never use:

`NEXT_PUBLIC_*`

Recommended environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=

SUPABASE_SERVICE_ROLE_KEY=

ADMIN_PIN_HASH=

NEXT_PUBLIC_SITE_URL=
```

Never hardcode the admin PIN inside:

- React components
- client JavaScript
- HTML
- CSS
- public JSON
- Git repository
- API response
- browser localStorage

---

# 05. ADMIN AUTHENTICATION

## 5.1 Admin URL

Admin login:

`/admintgadink`

Admin dashboard:

`/admintgadink/dashboard`

The admin URL must not appear anywhere in the public navigation.

## 5.2 Login UI

Create a minimal premium login screen.

Visual direction:

- dark/neutral background
- centered card
- subtle border
- clean typography
- no unnecessary illustrations
- no emoji
- responsive
- keyboard accessible

Content:

```text
GADING
PRIVATE ACCESS

Enter your access PIN

[ • • • • • • ]

[ ENTER DASHBOARD ]
```

PIN input:

- type=password
- numeric input
- maximum length 6
- autofocus
- allow Enter key
- hide actual PIN characters
- clear error state after retry if appropriate

## 5.3 PIN

The initial configured PIN is:

`170402`

IMPORTANT:

This value is only the initial secret configuration.

Do not put the literal PIN in frontend code.

Store a secure hash in:

`ADMIN_PIN_HASH`

The backend must verify the submitted PIN against the server-side hash.

## 5.4 Authentication Flow

```text
User opens /admintgadink
        ↓
PIN screen
        ↓
User enters PIN
        ↓
POST /api/admin/auth
        ↓
Server validates PIN
        ↓
If invalid:
    return generic error
        ↓
If valid:
    create secure authenticated session
        ↓
redirect /admintgadink/dashboard
```

Do not use localStorage as the sole authentication mechanism.

Use secure, HTTP-only cookies/session handling.

Recommended cookie properties:

- HttpOnly
- Secure in production
- SameSite=Lax or stricter where appropriate
- reasonable expiration
- server-side validation

## 5.5 Failed Login Protection

Implement basic brute-force protection.

Requirements:

- rate limit login attempts
- temporarily block repeated failed attempts
- never reveal whether a particular secret exists
- generic error message:

`Invalid access PIN.`

---

# 06. PUBLIC WEBSITE INFORMATION ARCHITECTURE

Main public route:

`/`

Recommended sections:

1. Hero
2. About / Positioning
3. Recent Works
4. Study Cases
5. Visual & Motion Gallery
6. Web Apps / Digital Products
7. Contact

Current sections can remain visually similar.

The biggest change is:

STATIC CONTENT

becomes

DYNAMIC CONTENT.

---

# 07. HERO

Preserve the current Hero structure.

Current messaging and visual direction should remain unless explicitly changed later.

Do not redesign the Hero unnecessarily.

Make editable personal information possible in the future, but this is NOT required for MVP.

---

# 08. RECENT WORKS

Current hardcoded Recent Works cards must be converted into dynamic cards.

These should become database records instead of hardcoded HTML.

---

# 09. PORTFOLIO CARD SYSTEM

## 9.1 Main Principle

Separate:

DATA

from

VISUAL COMPONENT.

Do NOT store HTML markup inside the database for cards.

Database stores content.

React components determine presentation.

Example:

```text
Portfolio Data
      ↓
PortfolioCardRenderer
      ↓
Card Variant
      ↓
Rendered Card
```

## 9.2 Card Variants

Prepare architecture for:

```text
default
featured
wide
compact
minimal
motion
```

The MVP only needs:

- default
- featured
- wide

But architecture must allow additional variants later.

---

# 10. ANIMOS-INSPIRED SECTION

Reference:

https://animos.app/

The purpose is NOT to embed Animos itself.

The purpose is to create a portfolio card/media presentation that can visually accommodate motion-based work.

Therefore:

DO NOT depend on the Animos website being available at runtime.

DO NOT iframe the entire Animos website.

DO NOT make the portfolio dependent on Animos.

Instead create an independent component:

`MotionPortfolioCard`

Possible media types:

- image
- GIF
- MP4
- WebM

Possible behavior:

- static poster initially
- autoplay muted video when visible
- pause when outside viewport
- hover interaction on desktop
- tap interaction on mobile
- respect `prefers-reduced-motion`

Example:

```text
[ MOTION PORTFOLIO CARD ]

┌───────────────────────────────┐
│                               │
│       PROJECT PREVIEW         │
│        image / video          │
│                               │
└───────────────────────────────┘

AI CREATIVE WORKFLOW

Property Visual Production System

VIEW CASE ↗
```

Do not load heavy video files unnecessarily.

Use:

- lazy loading
- poster images
- compressed video
- responsive media
- preload metadata only when useful

---

# 11. STUDY CASE DETAIL PAGE

Every published portfolio project may have a detail page.

URL:

`/work/[slug]`

Example:

`/work/meta-ads-campaign-workflow`

Slug must be unique.

---

# 12. STUDY CASE VISUAL STYLE

The detail page should feel closer to:

- Medium
- editorial website
- premium design case study
- magazine article

It should NOT look like:

- generic SaaS dashboard
- blog template
- WordPress article
- huge card UI

---

# 13. STUDY CASE STRUCTURE

Recommended public structure:

```text
CATEGORY

PROJECT TITLE

Short project introduction.

AUTHOR
Gading Utama

YEAR
2026

SERVICES
Marketing Communication
Graphic Design
Performance Marketing

[ COVER IMAGE / VIDEO ]

OVERVIEW

The project background...

THE PROBLEM

...

THE APPROACH

...

THE PROCESS

01
Research

02
Strategy

03
Design

04
Implementation

[ MEDIA ]

[ MEDIA ]

RESULTS

+XX%
CTR

-XX%
CPC

+XX
Leads

KEY TAKEAWAYS

...

NEXT PROJECT →
```

The actual sections must be dynamic.

Do not hardcode them into the page.

---

# 14. STUDY CASE CONTENT MODEL

Use a block-based content system.

A Study Case contains:

```text
metadata
+
content blocks
```

Example:

```json
{
  "type": "heading",
  "level": 2,
  "content": "The Problem"
}
```

```json
{
  "type": "paragraph",
  "content": "..."
}
```

```json
{
  "type": "image",
  "url": "...",
  "alt": "..."
}
```

---

# 15. CONTENT BLOCK TYPES

MVP must support:

## 15.1 Heading

Fields:

- text
- level

Allowed:

- H2
- H3

## 15.2 Paragraph

Fields:

- rich text content

## 15.3 Image

Fields:

- image URL
- alt text
- caption
- optional width mode

Width modes:

- standard
- wide
- full

## 15.4 Image Gallery

Fields:

- multiple images
- captions

Display:

Responsive grid.

## 15.5 Video

Fields:

- video URL
- poster
- caption

Supported:

- MP4
- WebM

## 15.6 Quote

Fields:

- quote
- attribution

## 15.7 Metrics

Example:

```text
+32%
CTR

-18%
CPC

+47
WhatsApp Leads
```

Fields:

- value
- label
- optional description

## 15.8 Bullet List

Fields:

- list items

## 15.9 Divider

No content.

## 15.10 Link

Fields:

- label
- URL
- optional target behavior

---

# 16. STUDY CASE EDITOR

Admin editor must feel simple.

Avoid a giant intimidating form.

Suggested structure:

```text
NEW STUDY CASE

[ Save Draft ] [ Preview ] [ Publish ]

--------------------------------

Title

[                            ]

Subtitle

[                            ]

Category

[ Select category             ]

Tags

[ Design ] [ Marketing ] [+ ]

Cover

[ Upload Cover ]

--------------------------------

CONTENT

[ Heading Block ]

[ Paragraph Block ]

[ Image Block ]

[ Metrics Block ]

       + ADD BLOCK

--------------------------------

SEO

URL Slug
Meta Title
Meta Description

--------------------------------

[ SAVE DRAFT ] [ PUBLISH ]
```

---

# 17. EDITOR UX

The editor must support:

- add block
- delete block
- duplicate block
- move block up
- move block down
- edit block
- preview block
- autosave draft
- manual save

Do not implement an unnecessarily complicated drag-and-drop editor for MVP unless it can be done reliably.

Simple up/down controls are acceptable.

---

# 18. AUTOSAVE

Draft editor should autosave.

Recommended behavior:

After user stops typing for approximately 1–2 seconds:

```text
Saving...
```

then:

```text
Saved
```

Show timestamp:

```text
Saved 17:42
```

If saving fails:

```text
Unable to save changes.
Retry
```

Never silently lose user input.

---

# 19. DRAFT SYSTEM

Every Study Case has:

```text
DRAFT
PUBLISHED
```

Only PUBLISHED records are visible publicly.

Drafts must never appear in:

- homepage
- public search
- sitemap
- related projects
- RSS
- OG metadata

---

# 20. FEATURED PROJECT

Boolean:

`is_featured`

Featured projects may receive:

- larger card
- priority placement
- featured section
- visual treatment

Admin can toggle:

`Featured`

---

# 21. ORDERING

Add:

`display_order`

Lower number = higher priority.

Admin can reorder projects.

MVP can use:

- move up
- move down

instead of drag-and-drop.

---

# 22. CATEGORIES

Initial categories:

```text
Graphic Design
Marketing Communication
Performance Marketing
Branding
Web Development
Digital Product
AI Creative
Campaign
Other
```

Category list should be stored separately or represented in a controlled configuration.

Admin can select a category.

Do not allow arbitrary malformed category strings.

---

# 23. TAGS

Tags are many-to-many.

Examples:

```text
Meta Ads
Graphic Design
UI/UX
Web App
Google Apps Script
AI
Property
Marketing
Campaign
Automation
```

Admin can add/remove tags.

---

# 24. DATABASE SCHEMA

Recommended main table:

`portfolio_projects`

Fields:

```text
id
title
slug
subtitle
description
category
cover_image_url
cover_image_alt
year
status
is_featured
display_order
created_at
updated_at
published_at
```

Where:

```text
status = draft | published
```

---

# 25. PROJECT CONTENT TABLE

Recommended:

`portfolio_content_blocks`

Fields:

```text
id
project_id
block_type
block_order
content_json
created_at
updated_at
```

Example:

```text
id: UUID
project_id: UUID
block_type: paragraph
block_order: 3
content_json: {...}
```

This makes the content system extensible.

---

# 26. TAG TABLE

`portfolio_tags`

Fields:

```text
id
name
slug
created_at
```

---

# 27. PROJECT TAG RELATION

`portfolio_project_tags`

Fields:

```text
project_id
tag_id
```

Composite unique constraint:

```text
project_id + tag_id
```

---

# 28. MEDIA TABLE

Optional but recommended:

`portfolio_media`

Fields:

```text
id
project_id
type
url
storage_path
filename
alt_text
caption
width
height
duration
created_at
```

Types:

```text
image
video
```

This allows media management to evolve independently from the article content.

---

# 29. ADMIN DASHBOARD

Route:

`/admintgadink/dashboard`

Dashboard layout:

```text
GADING ADMIN

Overview
Portfolio
Media
Settings

-----------------------------

GOOD EVENING, GADING

[ 12 ]
Published

[ 3 ]
Drafts

[ 7 ]
Study Cases

-----------------------------

RECENTLY UPDATED

Project
Status
Updated

...

[ + NEW STUDY CASE ]
```

---

# 30. ADMIN SIDEBAR

Desktop:

```text
GADING ADMIN

Overview

CONTENT
Portfolio
Media

SYSTEM
Settings

----------------
View Portfolio
Logout
```

Mobile:

Use collapsible drawer.

Do not make sidebar permanently consume large screen space on mobile.

---

# 31. PORTFOLIO ADMIN LIST

Route:

`/admintgadink/dashboard/portfolio`

Display table/list:

```text
TITLE
CATEGORY
STATUS
FEATURED
UPDATED
ACTIONS
```

Actions:

- Edit
- Preview
- Publish
- Unpublish
- Delete

---

# 32. SEARCH

Admin portfolio list must support search.

Search by:

- title
- category
- tag

Search should be debounced.

---

# 33. FILTER

Filters:

```text
All
Published
Draft
Featured
```

Category filter:

```text
All Categories
Graphic Design
Marketing
Web Development
...
```

---

# 34. DELETE

Delete requires confirmation.

Modal:

```text
Delete Study Case?

This action cannot be undone.

[ Cancel ] [ Delete ]
```

Do not delete immediately when user accidentally clicks the action.

---

# 35. PREVIEW

Admin must be able to preview a Study Case before publishing.

Preferred flow:

```text
Edit
 ↓
Preview
 ↓
Public-style preview
```

Draft preview must not become publicly accessible through an unprotected URL.

Use authenticated preview mechanism.

---

# 36. PUBLIC DATA QUERY

Public website must only retrieve:

```text
status = published
```

Never retrieve all projects and hide drafts with CSS.

Draft filtering must happen at database/server query level.

---

# 37. SEO

Each Study Case should generate:

- title
- description
- canonical URL
- Open Graph title
- Open Graph description
- Open Graph image
- Twitter card metadata

Example:

```text
Meta Ads Campaign Workflow
Gading Utama — Portfolio
```

---

# 38. SLUG

When creating:

Title:

`Meta Ads Campaign Workflow`

Generate:

`meta-ads-campaign-workflow`

Slug must:

- lowercase
- URL-safe
- unique
- no unnecessary special characters

Admin must be able to manually edit slug.

If slug changes after publishing:

Preferred behavior:

Create redirect from previous slug to new slug.

At minimum, show warning:

```text
Changing the URL may break existing links.
```

---

# 39. PUBLIC PERFORMANCE

The portfolio should be fast.

Requirements:

- optimize images
- use responsive image sizing
- lazy-load below-the-fold media
- avoid loading all videos immediately
- avoid unnecessary JavaScript
- server-render public content where practical
- minimize client components
- avoid large animation libraries unless necessary

Do not introduce heavy dependencies for simple interactions.

---

# 40. IMAGE STORAGE

Use Supabase Storage or equivalent object storage.

Recommended buckets:

```text
portfolio-public
```

Potential structure:

```text
projects/
  project-slug/
    cover/
    content/
```

Uploaded assets must have stable URLs.

Do not store image binary data directly in PostgreSQL.

Database stores:

- URL
- storage path
- metadata

---

# 41. IMAGE UPLOAD UX

Admin should support:

- click upload
- drag and drop
- image preview
- upload progress
- error state
- replace image
- remove image

Supported MVP:

- JPG
- JPEG
- PNG
- WebP

Recommended maximum upload size should be enforced.

---

# 42. IMAGE VALIDATION

Before upload:

Check:

- file type
- file size

Do not trust client validation alone.

Server/storage policy must also enforce constraints.

---

# 43. RESPONSIVE DESIGN

Must work properly on:

- 1440px desktop
- 1280px desktop
- 1024px tablet
- 768px tablet
- 390px mobile
- 360px mobile

No horizontal overflow.

---

# 44. MOBILE PUBLIC WEBSITE

Preserve existing mobile behavior.

Navigation becomes compact.

Project cards become:

```text
1 column
```

Study Case article becomes:

```text
single column
```

Images must never overflow viewport.

Metrics can become:

```text
2 columns
```

or:

```text
1 column
```

depending on width.

---

# 45. DARK/LIGHT MODE

Keep the existing theme toggle.

Do not create a second theme system.

All new components must use the existing design tokens where possible.

New admin UI may use a dedicated admin theme but should remain visually consistent with the portfolio brand.

---

# 46. ACCESSIBILITY

Implement:

- semantic HTML
- keyboard navigation
- visible focus states
- proper labels
- alt text
- accessible buttons
- accessible dialogs
- proper heading hierarchy
- reduced-motion support

Do not use clickable `<div>` when a button/link is appropriate.

---

# 47. ANIMATION

Keep the current reveal animation concept.

New animations should be:

- subtle
- fast
- premium
- non-distracting

Respect:

`prefers-reduced-motion`

Do not add animation to every single element.

---

# 48. API ARCHITECTURE

Create server-side endpoints or Server Actions for:

```text
POST   /api/admin/auth
POST   /api/admin/logout

GET    /api/admin/projects
POST   /api/admin/projects

GET    /api/admin/projects/:id
PATCH  /api/admin/projects/:id
DELETE /api/admin/projects/:id

POST   /api/admin/projects/:id/publish
POST   /api/admin/projects/:id/unpublish

POST   /api/admin/media
DELETE /api/admin/media/:id
```

Public:

```text
GET /api/projects
GET /api/projects/:slug
```

However, public pages should preferably fetch directly through server-side data access instead of unnecessarily calling their own API routes.

---

# 49. SERVER-SIDE DATA ACCESS

Create centralized data-access functions.

Example architecture:

```text
lib/
  auth/
  db/
    projects.ts
    tags.ts
    media.ts
  supabase/
    client.ts
    server.ts
```

Do not scatter database queries throughout components.

Use a server-only data access layer for sensitive operations.

---

# 50. AUTHORIZATION

Authentication and authorization are separate concepts.

Every admin mutation must verify:

```text
authenticated
AND
authorized admin
```

Do not trust:

- hidden buttons
- client-side route protection
- localStorage
- query parameters

The server must enforce admin authorization.

---

# 51. RLS / DATABASE SECURITY

If using Supabase:

Enable Row Level Security where appropriate.

Public access:

- published portfolio data only

Admin:

- full CRUD

Do not expose service-role credentials to the browser.

The service role key must remain server-side only.

---

# 52. ADMIN SESSION

Session should survive page refresh.

Expected:

```text
Login
 ↓
Dashboard
 ↓
Refresh
 ↓
Still authenticated
```

Logout:

```text
Logout
 ↓
Session destroyed
 ↓
Redirect /admintgadink
```

If session expires:

```text
Redirect to /admintgadink
```

---

# 53. ADMIN DASHBOARD UX PRINCIPLES

The dashboard should feel:

- simple
- fast
- editorial
- minimal
- practical

Do NOT make it look like:

- enterprise ERP
- complex analytics dashboard
- generic Bootstrap admin template

Primary purpose:

"Manage my portfolio quickly."

---

# 54. DASHBOARD EMPTY STATE

If there are no projects:

```text
Your portfolio is empty.

Start documenting your first project.

[ + CREATE STUDY CASE ]
```

---

# 55. DRAFT EMPTY STATE

If no drafts:

```text
No drafts yet.

Your unfinished Study Cases will appear here.
```

---

# 56. PUBLIC EMPTY STATE

If there are no published projects:

Do not show an awkward empty card grid.

Hide the dynamic project section or show a polished fallback.

---

# 57. ERROR HANDLING

Every asynchronous action must have:

- loading state
- success state
- error state

Examples:

```text
Saving...
Saved
Unable to save.
```

Upload:

```text
Uploading...
Uploaded
Upload failed.
```

Delete:

```text
Deleting...
Deleted
Delete failed.
```

Never leave the user wondering whether an action succeeded.

---

# 58. TOASTS

Use subtle toast notifications.

Examples:

```text
Study Case saved.
Study Case published.
Study Case unpublished.
Study Case deleted.
Image uploaded.
```

Avoid excessive notifications.

---

# 59. SECURITY REQUIREMENTS

Critical:

1. Never expose admin PIN.
2. Never expose service role key.
3. Never store authentication state only in localStorage.
4. Protect admin routes server-side.
5. Protect admin API routes server-side.
6. Validate uploaded files.
7. Sanitize rich text/content.
8. Prevent arbitrary script injection.
9. Validate URLs.
10. Use secure cookies.
11. Rate-limit authentication.
12. Never return secrets in API responses.

---

# 60. CONTENT SANITIZATION

If rich text HTML is introduced:

Sanitize HTML before rendering.

Never blindly use:

`dangerouslySetInnerHTML`

with unsanitized user-generated content.

Prefer structured JSON blocks.

This is one reason the block-based editor is preferred over storing arbitrary HTML.

---

# 61. PUBLIC ROUTING

Required:

```text
/
```

```text
/work/[slug]
```

Optional:

```text
/work
```

which can display all published works.

Admin:

```text
/admintgadink
/admintgadink/dashboard
/admintgadink/dashboard/portfolio
/admintgadink/dashboard/portfolio/new
/admintgadink/dashboard/portfolio/[id]
```

---

# 62. HOME PAGE DATA FLOW

```text
Home Page
   ↓
Query published projects
   ↓
Sort:
featured first
then display_order
then published_at
   ↓
Render card components
```

Do not hardcode project names in JSX.

---

# 63. RECENT WORKS LIMIT

Homepage should not necessarily display every project.

Initial behavior:

Show latest 6 or configured number.

Add:

`VIEW ALL WORK`

if there are more.

---

# 64. FEATURED WORKS

Featured projects can appear at top.

Example:

```text
Featured
[large card]

Other Works
[grid]
```

Do not duplicate the same project unnecessarily.

---

# 65. RELATED STUDY CASES

On a Study Case detail page:

Show 2–3 related projects.

Priority:

1. same category
2. shared tags
3. latest published

Exclude current project.

---

# 66. NEXT PROJECT

At article bottom:

```text
NEXT PROJECT

Property Visual Production System

VIEW CASE →
```

Optional previous project:

```text
← PREVIOUS
```

---

# 67. STUDY CASE READING EXPERIENCE

Article width should be limited for readability.

Suggested:

```text
max-width: 720–800px
```

Hero media can be wider than text.

Use editorial rhythm:

```text
small eyebrow

large title

subtitle

metadata

large cover

body
```

---

# 68. PROJECT METADATA

Each project should support:

```text
Year
Category
Services
Client / Company
Role
Duration
```

Not every field needs to be displayed if empty.

Do not show empty labels.

---

# 69. ADMIN PROJECT FORM

Fields:

### Required

- title
- category
- slug
- cover image
- description
- status

### Optional

- subtitle
- year
- services
- client
- role
- duration
- tags
- SEO title
- SEO description

---

# 70. PROJECT STATUS UI

Use small badges:

```text
Published
Draft
```

Featured:

```text
Featured
```

Avoid excessive color.

---

# 71. VERSION / UPDATE TRACKING

At minimum store:

```text
created_at
updated_at
published_at
```

Display:

```text
Updated Aug 29, 2026
```

No full version history required for MVP.

---

# 72. SETTINGS

Minimal admin settings page.

MVP:

```text
Site URL
Portfolio title
Default SEO description
```

Do NOT build a massive CMS settings system.

---

# 73. FUTURE-READY SETTINGS

Architecture should allow future fields:

- social links
- email
- location
- hero text
- skill chips

But do not implement all of them in MVP unless needed.

---

# 74. FILE STRUCTURE

Recommended structure:

```text
app/
  page.tsx

  work/
    [slug]/
      page.tsx

  admintgadink/
    page.tsx
    dashboard/
      page.tsx
      portfolio/
        page.tsx
        new/
          page.tsx
        [id]/
          page.tsx

  api/
    admin/
      auth/
      logout/
      projects/
      media/

components/
  public/
    Hero.tsx
    RecentWorks.tsx
    PortfolioCard.tsx
    MotionPortfolioCard.tsx
    StudyCaseArticle.tsx
    Gallery.tsx
    Apps.tsx
    Contact.tsx

  admin/
    AdminSidebar.tsx
    ProjectTable.tsx
    ProjectForm.tsx
    ContentEditor.tsx
    ContentBlock.tsx
    MediaUploader.tsx
    DashboardStats.tsx

lib/
  auth/
  db/
  supabase/
  validation/

types/
  portfolio.ts
```

Adapt this structure to the actual existing project if it is already partially converted to Next.js.

---

# 75. TYPE DEFINITIONS

Create strict TypeScript types.

Example conceptual model:

```ts
type ProjectStatus = 'draft' | 'published';

type ContentBlockType =
  | 'heading'
  | 'paragraph'
  | 'image'
  | 'gallery'
  | 'video'
  | 'quote'
  | 'metrics'
  | 'list'
  | 'divider'
  | 'link';
```

Do not use:

```ts
any
```

for core portfolio data.

---

# 76. VALIDATION

Use schema validation such as Zod.

Validate:

- project title
- slug
- category
- status
- URLs
- content blocks
- media metadata

Validation must exist on server side.

Client-side validation is only for UX.

---

# 77. SEO INDEXING RULES

Published Study Cases:

`index`

Drafts:

`noindex`

Admin:

`noindex`

Do not expose admin pages to search engines.

---

# 78. SITEMAP

Generate dynamic sitemap containing:

- homepage
- published Study Cases

Do not include drafts.

---

# 79. ROBOTS

Admin route should be excluded from indexing.

Example concept:

```text
Disallow: /admintgadink
```

But do not rely on robots.txt as security.

Authentication remains mandatory.

---

# 80. ANALYTICS

Do not implement a complicated analytics dashboard in MVP.

Optional:

- Vercel Analytics
- basic page view tracking

This is secondary to portfolio CMS functionality.

---

# 81. PERFORMANCE TARGET

Target:

- fast first render
- no layout shift caused by images
- optimized image dimensions
- minimal client JS
- lazy-loaded media
- no unnecessary third-party scripts

Do not load every portfolio video on initial page load.

---

# 82. DEPLOYMENT

Target:

Vercel.

Production environment must have:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
SUPABASE_SERVICE_ROLE_KEY
ADMIN_PIN_HASH
NEXT_PUBLIC_SITE_URL
```

Never commit:

`.env.local`

to Git.

Create:

`.env.example`

without real secrets.

---

# 83. DATABASE MIGRATION

Create a reproducible SQL migration.

Do not manually create database structures without documenting them.

Migration must include:

- tables
- indexes
- constraints
- RLS policies
- storage policies if applicable

---

# 84. SEED DATA

Create initial seed records based on the current portfolio cards.

Initial projects can include:

```text
PROGRAM MBG Real-Time Leaderboard
Meta Ads Campaign Workflow
Property Visual Production System
Content Activation for Property Agents
Hot Listing Promotion Ecosystem
Campaign Recap System
```

Preserve their existing descriptions where appropriate.

Replace placeholder images with actual uploaded assets when available.

---

# 85. IMPORTANT: EXISTING WEB APPS SECTION

Do NOT force the existing Web Apps section into the Study Case system immediately.

For MVP:

Keep Web Apps visually intact.

Prepare an abstraction so it can become dynamic later.

Future:

`digital_products` CMS.

---

# 86. IMPORTANT: EXISTING GALLERY

Preserve the existing gallery/carousel interaction model where possible.

Do not replace it with a generic carousel library unless necessary.

---

# 87. CARD DESIGN REPLACEMENT REQUIREMENT

The architecture must allow replacing:

```text
PortfolioCard.tsx
```

without modifying:

- database
- API
- Study Case
- admin dashboard
- project editor

Example:

```text
PortfolioCardV1
PortfolioCardAnimos
PortfolioCardBento
```

Renderer:

```ts
getPortfolioCardVariant(project.variant)
```

---

# 88. ADMIN PREVIEW

Preview must use the same rendering component as public page.

Do NOT create a completely separate preview implementation.

Concept:

```text
Project Data
    ↓
StudyCaseRenderer
    ↓
Public Page
    OR
Admin Preview
```

This prevents mismatch between preview and actual published result.

---

# 89. PUBLISH FLOW

When user clicks:

`PUBLISH`

Show confirmation:

```text
Publish Study Case?

This will make the project visible publicly.

[ Cancel ] [ Publish ]
```

After publishing:

```text
Published successfully.
```

Then show:

```text
VIEW LIVE CASE →
```

---

# 90. UNPUBLISH FLOW

Confirmation:

```text
Unpublish Study Case?

The project will no longer be visible publicly.

[ Cancel ] [ Unpublish ]
```

After success:

Status becomes:

`Draft`

---

# 91. DELETE FLOW

Delete must not be reversible in MVP.

Therefore use strong confirmation.

For extra safety:

Require typing project title for deletion if feasible.

Example:

```text
Type:

META ADS CAMPAIGN WORKFLOW

to confirm deletion.
```

---

# 92. ADMIN LOGOUT

Logout button always visible.

After logout:

```text
/admintgadink
```

Do not redirect to dashboard.

---

# 93. NO EMOJI UI

Do not use emoji for UI icons.

Use:

- SVG
- CSS
- lightweight icon library
- inline icon components

Icons should be:

- minimal
- consistent
- accessible

---

# 94. ERROR PAGES

Create:

`404`

for public missing Study Cases.

Create admin-specific error states.

Public 404 should remain visually consistent with the portfolio.

Example:

```text
404

This project doesn't exist.

[ BACK TO WORKS ]
```

---

# 95. LOADING STATES

Public:

Use subtle skeletons only where necessary.

Study Case:

- title skeleton
- metadata skeleton
- cover skeleton
- content skeleton

Admin:

- table skeleton
- dashboard statistic skeleton
- editor loading state

Avoid giant loading spinners.

---

# 96. SECURITY ACCEPTANCE CRITERIA

The implementation is NOT complete if:

- PIN appears in frontend bundle
- PIN appears in source code
- service-role key appears in frontend
- draft content is accessible publicly
- admin API can be called without authentication
- admin dashboard can be accessed by manipulating frontend state
- deleting project requires no confirmation
- arbitrary unsafe HTML executes

---

# 97. FUNCTIONAL ACCEPTANCE CRITERIA

## Authentication

Given:

`/admintgadink`

When valid PIN is entered:

Then:

`/admintgadink/dashboard`

is displayed.

When invalid PIN is entered:

Then:

login remains displayed and generic error is shown.

## Create

Admin creates:

```text
Title
Category
Cover
Description
Content
```

Clicks:

`Save Draft`

Then project appears in Draft list.

## Publish

Admin opens draft.

Clicks:

`Publish`.

Then:

- status becomes published
- published_at is populated
- project appears on public homepage
- project gets public slug
- project becomes indexable

## Unpublish

Admin clicks:

`Unpublish`.

Then:

- project disappears from public website
- status becomes draft

## Edit

Admin changes title.

Clicks Save.

Then public page reflects updated title.

## Delete

Admin deletes project.

Then:

- project disappears from admin list
- project is no longer publicly accessible
- associated content blocks are removed or safely orphan-prevented
- media cleanup should be handled safely

---

# 98. PUBLIC ACCEPTANCE CRITERIA

Homepage:

- loads successfully
- existing visual style remains
- Recent Works is database-driven
- only published projects appear
- featured projects have featured treatment
- card links point to `/work/[slug]`

Study Case:

- title works
- cover works
- metadata works
- content blocks render
- images render responsively
- videos work
- metrics work
- related projects work
- previous/next navigation works
- SEO metadata exists

---

# 99. ADMIN ACCEPTANCE CRITERIA

Dashboard:

- protected
- statistics display correctly
- project list works
- search works
- filtering works
- create works
- edit works
- delete works
- publish works
- unpublish works
- preview works
- logout works

Editor:

- blocks can be added
- blocks can be edited
- blocks can be removed
- blocks can be reordered
- autosave works
- manual save works
- publish works

---

# 100. RESPONSIVE ACCEPTANCE CRITERIA

Test on:

```text
Desktop 1440
Desktop 1280
Tablet 1024
Tablet 768
Mobile 390
Mobile 360
```

Must have:

- no horizontal overflow
- no clipped text
- no broken cards
- usable editor
- usable upload UI
- usable navigation
- usable modal/dialog
- usable article reading experience

---

# 101. DEPLOYMENT ACCEPTANCE CRITERIA

Before deployment:

Run:

```text
npm run lint
npm run build
```

No build errors.

No TypeScript errors.

No exposed secrets.

No console errors caused by the implementation.

Verify production environment variables.

Deploy to Vercel.

Test:

```text
/
```

```text
/admintgadink
```

```text
/admintgadink/dashboard
```

```text
/work/[slug]
```

---

# 102. IMPLEMENTATION ORDER

Antigravity MUST implement in this order.

## STEP 1

Inspect existing project.

Do not immediately rewrite.

Understand:

- current HTML
- CSS
- JavaScript
- assets
- theme system
- responsive rules
- carousel
- reveal animation

## STEP 2

Convert project to the required Next.js architecture only if necessary.

Preserve existing visual output.

## STEP 3

Implement Supabase connection.

## STEP 4

Create database schema.

## STEP 5

Create admin authentication.

## STEP 6

Create admin dashboard shell.

## STEP 7

Implement portfolio CRUD.

## STEP 8

Implement content block editor.

## STEP 9

Implement media upload.

## STEP 10

Convert static Recent Works into dynamic database-driven cards.

## STEP 11

Create Study Case public pages.

## STEP 12

Implement Animos-inspired motion card architecture.

## STEP 13

Implement SEO.

## STEP 14

Optimize performance.

## STEP 15

Run complete production QA.

---

# 103. DO NOT DO THESE THINGS

Do NOT:

- rewrite the design unnecessarily
- remove the existing theme system
- remove existing animations without reason
- hardcode projects again
- store portfolio data in localStorage
- store the admin PIN in frontend code
- expose Supabase service role key
- use fake authentication
- make drafts publicly accessible
- create a huge overcomplicated CMS
- install unnecessary libraries
- use emoji as UI icons
- introduce a heavy rich text editor unless necessary
- embed Animos as a runtime dependency
- create a second unrelated design system
- replace the current portfolio visual identity

---

# 104. MVP PRIORITY

## P0 — MUST HAVE

- Vercel-ready architecture
- Supabase
- Admin PIN authentication
- Protected admin dashboard
- Portfolio CRUD
- Draft / Published
- Study Case detail page
- Cover image
- Content blocks
- Image upload
- Dynamic Recent Works
- Slug
- SEO basics
- Responsive
- Logout

## P1 — SHOULD HAVE

- Featured projects
- Tags
- Categories
- Search
- Filters
- Autosave
- Preview
- Previous / Next project
- Related projects
- Motion card
- Video/WebM support

## P2 — FUTURE

- Full media library
- Version history
- Analytics
- Social sharing management
- Dynamic Hero CMS
- Dynamic Web Apps CMS
- Drag-and-drop editor
- Multiple admin users
- Google OAuth
- Custom domains/settings

---

# 105. DEFINITION OF DONE

The project is considered complete when:

1. Existing public portfolio remains visually recognizable.
2. Recent Works is no longer hardcoded.
3. Admin can log in using protected authentication.
4. Admin PIN is never exposed client-side.
5. Admin can create Study Cases.
6. Admin can edit Study Cases.
7. Admin can delete Study Cases.
8. Admin can save drafts.
9. Admin can publish.
10. Admin can unpublish.
11. Admin can upload cover images.
12. Admin can upload content images.
13. Public users only see published content.
14. Each Study Case has a unique slug.
15. Each Study Case has a Medium-inspired reading experience.
16. Card rendering is separated from portfolio data.
17. Animos-inspired motion/card presentation can be added without changing the database architecture.
18. Responsive behavior works.
19. Dark/light theme remains functional.
20. SEO metadata is generated dynamically.
21. Admin routes are protected.
22. Production build succeeds.
23. Vercel deployment succeeds.
24. No secrets are exposed.
25. No critical console errors remain.

---

# 106. FINAL IMPLEMENTATION DIRECTIVE TO ANTIGRAVITY

Treat this PRD as an implementation specification.

Before changing code:

1. Inspect the existing codebase.
2. Identify which parts of the existing portfolio can be reused.
3. Do not blindly replace the existing HTML/CSS.
4. Create a migration plan.
5. Implement incrementally.
6. After each major phase, verify that the existing public design still works.
7. Prioritize functionality and security over unnecessary visual changes.
8. Use strict TypeScript.
9. Keep components modular.
10. Keep database access server-side where sensitive.
11. Keep public portfolio rendering lightweight.
12. Keep admin UI separate from public UI.
13. Do not expose secrets.
14. Do not hardcode portfolio content.
15. Do not introduce unnecessary dependencies.

The final result should feel like:

> An editorial-quality personal portfolio powered by a lightweight private CMS.

It should NOT feel like:

> A generic admin dashboard attached to a portfolio website.
