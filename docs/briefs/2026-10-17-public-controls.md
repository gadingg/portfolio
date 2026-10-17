# Public navigation, social links, and carousel repair

Mode: Experience. Extend the existing portfolio; preserve its typography, orange contact surface, artwork, and collection composition.

User direction: show the hamburger icon without a rectangle or border. Replace visible Instagram text with its icon and add LinkedIn. Restore automatic slides and Pause/Resume.

LinkedIn supplied by the owner: https://www.linkedin.com/in/gadingutama/ (share tracking removed). Keep both destinations editable in Website & CV. Existing stored layouts must receive the current controls without a manual rebuild.

The header menu and footer social controls use Lucide icons, accessible names, tooltips, visible keyboard focus, and 44px targets. Other action labels remain intact.

Visual Design and Branding & Video advance every five seconds while visible. Hover/focus pauses apply to artwork, not the separate control bar. Resume starts a fresh five-second interval even when its button retains focus. Touch interaction and reduced-motion preferences start/preserve a pause; an explicit Resume can opt in. Hidden tabs, offscreen lists, and open dialogs suspend automatic movement.

Validation: regression coverage for both carousel types, pause/resume, focus, touch, reduced motion, legacy layouts, missing LinkedIn fields, and explicit empty destinations; production build; desktop/mobile browser checks. Antislop runs after implementation, following the user's session choice.
