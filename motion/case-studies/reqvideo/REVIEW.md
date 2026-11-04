# Live UI motion review

Reviewed 2026-11-04. Four distinct live UI states with authored transitions. No portfolio thumbnail is used. No submitted forms, saved sample tasks, or invented outcomes.

HyperFrames check passed, including runtime and layout. Inspected snapshots at 0, 3.3, 6.3, 9.3 and 11.99 seconds and the loop transition. The active screen has full contrast; neighboring portrait screens are subdued. Original screen proportions are retained.

FFprobe verified H.264, 30 fps, 12 seconds, one video stream and no audio. MP4 faststart verified. First/last encoded-frame difference is recorded in the local validation report. No sound was created or listened to.

Intentional warning: duplicate_media_discovery_risk. Repeated static images are cyclic clones required for the matching loop state; there is no duplicate audio or video.

Weakest shot: The live request form header contains its own responsive clipping; it is preserved rather than redrawn. Current scheduling is empty, so no confirmed schedule is implied.

Existing lazy loading, reduced-motion poster behavior, muted playback and responsive selection are unchanged. New asset paths match the public API configuration. No new production upload or publish was performed.

Additional intentional warning: gsap_timeline_set_initial_hide. Only inner screen elements start transparent for crossfades; the first screen is explicitly visible at time zero. Timed clip wrappers remain visible and the 0-second rendered frame was inspected.
