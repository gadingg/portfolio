# Arctic Sprint cleanup

Removed legacy orange UI declarations from the public CSS and global body background. Public body canvas now follows the validated palette. Admin operational colors and project artwork remain unchanged.

Meta Ads / Daily App: desktop and mobile built-in media resolve to new -clean MP4 and poster URLs. A four-step overlay follows video currentTime, resets on metadata/loop and uses the live palette gradient. Custom uploads, disabled motion, supplied copy and unrelated videos remain untouched. Archived media are retained for compatibility.

HyperFrames CLI could not be installed because npm returned ECONNRESET. FFmpeg locally re-encoded only the existing progress-strip region to its surrounding background; all source motion, UI captures, typography and duration were retained. Source HyperFrames compositions no longer bake in the progress strip. Reproducible command: node scripts/build-palette-motion.cjs. Four videos remain 12 seconds, 1920x1080 / 1080x1350, approximately 0.84-1.56 MB. Sampled decoded frames at 9.5 seconds contain zero warm pixels in the replaced strips; decoded desktop frame visually inspected.

Browser QA at localhost:3024: Meta Ads desktop 1280px loads the clean video and renders Arctic Sprint progress. Daily App mobile 390px loads its clean mobile video; indicator advanced to step two at 3.36 seconds. No horizontal overflow; body background-image is none. Theme and configuration tests cover legacy remapping, immutable inputs, custom uploads, disabled motion, schema injection validation, save/publication boundaries and custom palettes.

Antislop after gate: PASS for scoped correction. ENERGY 1 / RHYTHM 2 / MOTION 1. Existing motion retained, without added controls, helper text, libraries or decoration. No production writes or deployment performed in this task.
