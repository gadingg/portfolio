---
name: craft-design-engineering
description: The Unified Design Engineering & Fluid Motion Master System. Encodes Emil Kowalski's craft and invisible details, Apple WWDC fluid interface physics (interruptibility, momentum projection, rubberbanding, optical typography, translucency), and a senior motion audit & execution planning engine. Use when building, polishing, reviewing, or auditing UI components, physics-based springs, gesture-driven interactions, design tokens, micro-animations, or full codebase motion audits.
---

# 💎 Craft Design Engineering & Fluid Motion Master System

A unified, master-tier design engineering skill synthesizing **Emil Kowalski's design craft philosophy**, **Apple's WWDC fluid interface physics**, and **Senior Motion Audit & Execution workflows**.

```
                           ┌───────────────────────────────────────────────────────────┐
                           │         CRAFT DESIGN ENGINEERING MASTER SYSTEM            │
                           └─────────────────────────────┬─────────────────────────────┘
                                                         │
             ┌───────────────────────────────────────────┼───────────────────────────────────────────┐
             ▼                                           ▼                                           ▼
┌─────────────────────────┐                 ┌─────────────────────────┐                 ┌─────────────────────────┐
│   EMIL KOWALSKI CRAFT   │                 │    APPLE FLUID PHYSICS  │                 │   MOTION AUDIT ENGINE   │
│ • Unseen details        │                 │ • 1:1 Direct tracking   │                 │ • 4-Phase audit recon   │
│ • Decision framework    │                 │ • Velocity handoff      │                 │ • 8-Category evaluation │
│ • Custom bezier curves  │                 │ • Momentum projection   │                 │ • High-leverage plans   │
│ • Component micro-feel  │                 │ • Rubberbanding bounds  │                 │ • Before/After tables   │
│ • Non-zero scale ins    │                 │ • Optical typography    │                 │ • Zero-ambiguity specs  │
└─────────────────────────┘                 └─────────────────────────┘                 └─────────────────────────┘
```

---

## 🏛️ 1. Core Philosophy & Taste

### 1.1. Taste is Trained, Not Innate
Good taste is a trained instinct: the ability to recognize what elevates an interface beyond "functional" into "irresistible." In a world where software is easily generated, **craft and taste are the ultimate differentiators**.

### 1.2. Invisible Details Compound
> *"All those unseen details combine to produce something that's just stunning, like a thousand barely audible voices all singing in tune."* — Paul Graham

When an interface responds with zero perceptible latency, tracks a finger 1:1, scales slightly from the exact trigger origin, and cushions gently into place, users don't think about the math. They simply feel that the software is exceptionally well-made.

### 1.3. Beauty is Leverage
Interfaces with thoughtful animations, rich materials, and responsive physical feedback command higher perceived value, inspire trust, and convert better.

---

## ⚡ 2. The Universal Animation Decision Framework

Before writing a single line of CSS transition or spring animation, evaluate these 4 filters in strict order:

```
[1. Frequency Filter] ──► 100+/day? (Command palette, shortcut, hotkey) ──► 🛑 ZERO animation!
                      └──► Tens/day? (Hover, list item) ───────────────► ⚡ Micro (≤150ms)
                      └──► Occasional? (Modal, sheet, toast) ──────────► 🎯 Standard (200-300ms)
                      └──► Rare / First-time? (Celebration, onboarding) ─► ✨ Expressive delight

[2. Purpose Filter]   ──► Why does this move? (Spatial consistency / state change / direct feedback)

[3. Easing Selection] ──► Entering / Exiting? ──► Strong Ease-Out (Fast start, snappy feel)
                      └──► Moving on-screen? ──► Strong Ease-In-Out (Natural acceleration)
                      └──► Gesture / Drag / Momentum? ──► Velocity-Aware Spring (Critically damped)
                      └──► NEVER use ease-in for UI! (Sluggish initial lag)

[4. Speed & Perceived] ─► Standard UI duration must stay ≤ 250ms.
```

### ⏱️ Standard Duration Scale

| Element / Interaction | Target Duration | Easing / Spring Mode |
|---|---|---|
| **Button press feedback (`:active`)** | `100ms – 160ms` | `ease-out` / instant scale |
| **Tooltips & Popovers** | `125ms – 200ms` | `cubic-bezier(0.23, 1, 0.32, 1)` |
| **Dropdowns, Menus, Selects** | `150ms – 220ms` | `cubic-bezier(0.23, 1, 0.32, 1)` |
| **Modals, Dialogs, Drawers** | `200ms – 320ms` | `cubic-bezier(0.32, 0.72, 0, 1)` |
| **Theme / Color transitions** | `250ms – 350ms` | `cubic-bezier(0.4, 0, 0.2, 1)` |
| **Drag-to-dismiss / Sheets** | Variable (Physical) | Spring (`bounce: 0.15 - 0.25`) |

---

## 📐 3. Easing & Spring Math Library

### 3.1. Standard CSS Custom Curves
*Never rely on browser default `ease` or `ease-in-out` — they lack punch and feel floaty.*

```css
:root {
  /* Ultra-crisp ease-out for entering UI and menus */
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-out-quint: cubic-bezier(0.23, 1, 0.32, 1);
  
  /* Natural acceleration/deceleration for layout shifts */
  --ease-in-out-smooth: cubic-bezier(0.77, 0, 0.175, 1);
  
  /* Apple-style iOS bottom sheet & drawer curve */
  --ease-drawer-apple: cubic-bezier(0.32, 0.72, 0, 1);

  /* Micro-scale feedback */
  --ease-button-press: cubic-bezier(0.2, 0, 0, 1);
}
```

### 3.2. Apple Spring Parameters (Damping & Response)
Apple formulates springs using **Damping Ratio ($\zeta$)** and **Response ($T_o$)** instead of raw physics stiffness/mass:

- **$\zeta = 1.0$ (Critically Damped):** Smooth, graceful, settles with **zero overshoot**. Default for 90% of UI.
- **$\zeta = 0.8$ (Under-Damped):** Subtle bounce, used **only when preceding gesture had momentum** (flick / throw).
- **Response ($T_o$):** Time to reach target in seconds. Lower = snappier ($0.3s - 0.4s$).

#### Web Parameter Mapping (Motion / Framer Motion / Web Animations)

```javascript
import { animate } from 'motion';

// 1. Standard Critically Damped UI (No overshoot, graceful settle)
export const springDefault = { type: 'spring', duration: 0.35, bounce: 0 };

// 2. Momentum-Driven Interaction (After flick / gesture release)
export const springMomentum = { type: 'spring', duration: 0.42, bounce: 0.2 };

// 3. Snappy Drawer / Sheet Transition
export const springSheet = { type: 'spring', duration: 0.32, bounce: 0.1 };
```

---

## 🖐️ 4. Physical Fluid Interface Mechanics (Apple WWDC 2018–2026)

### 4.1. 1:1 Direct Tracking & Pointer Capture
Touch and element must move together without snapping to center.

```javascript
element.addEventListener('pointerdown', (e) => {
  element.setPointerCapture(e.pointerId);
  // Preserve grab offset so object does not snap to center
  const grabOffsetY = e.clientY - element.getBoundingClientRect().top;
  const history = [{ pos: e.clientY, time: performance.now() }];

  const onPointerMove = (moveEvent) => {
    const currentY = moveEvent.clientY - grabOffsetY;
    element.style.transform = `translate3d(0, ${currentY}px, 0)`;
    
    // Maintain rolling velocity buffer (last 3-5 events)
    history.push({ pos: moveEvent.clientY, time: performance.now() });
    if (history.length > 5) history.shift();
  };

  const onPointerUp = (upEvent) => {
    element.releasePointerCapture(upEvent.pointerId);
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', onPointerUp);

    // Calculate release velocity (px/sec)
    const first = history[0];
    const last = history[history.length - 1];
    const dt = (last.time - first.time) / 1000;
    const velocityY = dt > 0 ? (last.pos - first.pos) / dt : 0;

    // Project momentum and hand off to spring
    handleGestureRelease(element, currentY, velocityY);
  };

  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerUp);
});
```

### 4.2. Momentum Projection Formula (Exponential Decay)
Project where the gesture is heading before snapping:

$$\text{Projected Distance} = \left(\frac{v_0}{1000}\right) \times \frac{d}{1 - d}$$

*(Where $d \approx 0.998$ for standard scroll feel; $0.990$ for snappier mobile feel).*

```javascript
function projectMomentum(initialVelocity, decelerationRate = 0.996) {
  return (initialVelocity / 1000) * decelerationRate / (1 - decelerationRate);
}

function handleGestureRelease(el, currentY, velocityY) {
  const projectedEndpoint = currentY + projectMomentum(velocityY);
  const snapTarget = projectedEndpoint > 150 ? 300 : 0; // Determine target threshold

  // Velocity Handoff to Spring Animation
  animate(el, { y: snapTarget }, {
    type: 'spring',
    velocity: velocityY,
    bounce: Math.abs(velocityY) > 400 ? 0.2 : 0,
    duration: 0.4
  });
}
```

### 4.3. Soft Rubber-Banding Formula
When an element is dragged past scroll/gesture boundaries, apply continuous logarithmic resistance:

$$f(x, d) = \frac{x \times d \times c}{d + c \times |x|}$$

```javascript
function rubberband(overshoot, dimension, constant = 0.55) {
  return (overshoot * dimension * constant) / (dimension + constant * Math.abs(overshoot));
}
```

### 4.4. The Law of Complete Interruptibility
- **Never freeze pointer events** during an active transition.
- **Animate from presentation value:** When a transition is interrupted, query `getComputedStyle(el).transform` and seamlessly start the new animation from that exact live transform with blended velocity.
- **Decompose 2D motion:** Run independent X and Y springs to prevent velocity desync during diagonal swipes.

---

## 🎨 5. Component Craft & Micro-Interactions

### 5.1. Button Press Feedback (`scale(0.97)`)
Every pressable element must give instant tactile confirmation on `:active`:

```css
.btn, .clickable-card {
  transition: transform 140ms cubic-bezier(0.2, 0, 0, 1), 
              background-color 180ms ease, 
              box-shadow 180ms ease;
  will-change: transform;
}

.btn:active, .clickable-card:active {
  transform: scale(0.97);
}
```

### 5.2. Never Animate From `scale(0)`
Elements should emerge naturally from near-full size (`scale(0.92)` to `scale(0.96)`) paired with an opacity crossfade:

```css
/* ❌ AVOID: Exploding from zero reads artificial */
@keyframes badEnter {
  from { transform: scale(0); opacity: 0; }
}

/* ✅ CORRECT: Organic presence arrival */
@keyframes organicEnter {
  from {
    transform: scale(0.95) translateY(4px);
    opacity: 0;
  }
  to {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
}
```

### 5.3. Origin-Aware Popovers & Menus
Set `transform-origin` dynamically to the trigger element's coordinates:

```css
.popover, .dropdown-menu {
  transform-origin: var(--trigger-origin, top center);
}

/* Exception: Modals stay centered */
.modal-card {
  transform-origin: center center;
}
```

### 5.4. Tooltip Smart Hover Skipping
Delay the initial tooltip by `400ms`. Once open, instantly display adjacent tooltips with **`0ms` delay** and no entry transition.

---

## 🪟 6. Translucent Materials, Vibrancy & Optical Typography

### 6.1. Multi-Layered Glassmorphism & Light-Catching Borders
Translucency establishes structural hierarchy without obstructing underlying context:

```css
.glass-header {
  background: rgba(15, 18, 26, 0.82);
  backdrop-filter: blur(20px) saturate(190%);
  -webkit-backdrop-filter: blur(20px) saturate(190%);
  
  /* Top light-catching specular edge */
  border-top: 1px solid rgba(255, 255, 255, 0.12);
  border-bottom: 1px solid rgba(0, 0, 0, 0.35);
  box-shadow: 0 8px 32px -4px rgba(0, 0, 0, 0.35);
}
```

### 6.2. Optical Typography Scaling
Letter-spacing and line-height scale inversely with font size:

```css
/* Display Titles: Tight leading, negative tracking */
.display-title {
  font-size: clamp(2rem, 4vw, 3.5rem);
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -0.028em;
}

/* Body Text: Relaxed leading, neutral tracking */
.body-text {
  font-size: 1rem;
  line-height: 1.6;
  letter-spacing: -0.005em;
}

/* Micro Badges / Captions: Slightly positive tracking for legibility */
.caption-badge {
  font-size: 0.75rem;
  font-weight: 700;
  line-height: 1.3;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
```

---

## ♿ 7. Tri-Signal Accessibility Adaptations

Always adapt to the user's three core OS accessibility preferences:

```css
/* 1. Reduced Motion: Replace movement with instant opacity crossfades */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.15s !important;
    scroll-behavior: auto !important;
  }
  .drawer, .modal-card, .popover {
    transform: none !important;
  }
}

/* 2. Reduced Transparency: Convert glass/blur to solid high-contrast surfaces */
@media (prefers-reduced-transparency: reduce) {
  .glass-header, .modal-card, .popover {
    background: var(--surface) !important;
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
  }
}

/* 3. Increased Contrast: Enforce solid borders and clear separation */
@media (prefers-contrast: more) {
  .card, .btn, .modal-card, .form-control {
    border: 2px solid var(--text-main) !important;
  }
}
```

---

## 🔍 8. Code Review & Motion Audit Engine

### 8.1. Review Output Format (Mandatory Table)
When auditing or reviewing UI code, **always format findings as a markdown table with `Before`, `After`, and `Why`**:

| Before | After | Why |
|---|---|---|
| `transition: all 0.3s ease` | `transition: transform 0.18s var(--ease-out), opacity 0.18s ease` | Avoid `all` to prevent repainting layout; use precise properties and custom curves. |
| `transform: scale(0)` | `transform: scale(0.95); opacity: 0` | Objects in reality do not explode from zero; scale(0.95) creates natural spatial arrival. |
| `ease-in` on dropdown menu | `cubic-bezier(0.23, 1, 0.32, 1)` (180ms) | `ease-in` introduces sluggish initial lag; `ease-out` provides instantaneous reaction. |
| No `:active` press state on button | `transform: scale(0.97)` on `:active` | Buttons must provide immediate tactile feedback when pressed. |
| Static origin on popover | `transform-origin: var(--trigger-x) var(--trigger-y)` | Popovers must visually emerge from their source trigger. |

---

### 8.2. 4-Phase Codebase Motion Audit Workflow

When requested to *"Audit animations"*, *"Improve the motion"*, or *"Audit codebase UI craft"*, execute these 4 phases:

```
[Phase 1: Recon]    ──► Identify stack (Motion, CSS, WAAPI), token conventions, and high-frequency map.
[Phase 2: Audit]    ──► Evaluate the 8 core categories (Purpose, Easing, Physicality, Interruptibility,
                         Performance, Accessibility, Cohesion, Missed Opportunities).
[Phase 3: Vet]      ──► Filter findings by leverage (Impact ÷ Effort), verify exact file:line.
[Phase 4: Plan]     ──► Output prioritized, zero-ambiguity executable plans.
```

#### Leverage Matrix
$$\text{Leverage} = \frac{\text{Perceived Impact on User Experience}}{\text{Engineering Implementation Effort}}$$

- **HIGH Severity:** Laggy `ease-in` on menus, animations on high-frequency shortcut actions, `scale(0)` pops, non-interruptible drag locks.
- **MEDIUM Severity:** Incorrect transform origins, missing velocity handoffs, lack of reduced-motion fallbacks.
- **LOW Severity / Polish:** Stagger delays, blur-masked crossfades, typography tracking adjustments.

---

## 📋 9. Quick Implementation Checklist

When shipping or reviewing any component, check off these 10 Golden Rules:

- [ ] **Instant Touchdown:** Visual reaction begins on `:active` / `pointerdown` (not release).
- [ ] **No `scale(0)`:** Entrances start from `scale(0.92)` to `scale(0.96)`.
- [ ] **Custom Curves:** Uses `--ease-out-quint` or critically damped springs (no default `ease`).
- [ ] **Origin Aware:** Popovers anchor to trigger coordinates; modals remain centered.
- [ ] **Sub-300ms:** Standard UI animations complete in $\le 250\text{ms}$.
- [ ] **Interruptible:** Gestures and transitions can be redirected mid-motion without visual snapping.
- [ ] **Direct Tracking:** Drags stay locked 1:1 to pointer coordinates via `setPointerCapture`.
- [ ] **Momentum Projection:** Flicks project forward with exponential velocity decay.
- [ ] **Optical Type:** Tight leading/tracking on headings, neutral on body, positive on small badges.
- [ ] **Accessible:** Fully supports `prefers-reduced-motion` and `prefers-reduced-transparency`.
