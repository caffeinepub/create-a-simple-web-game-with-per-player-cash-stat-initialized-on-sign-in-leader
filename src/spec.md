# Specification

## Summary
**Goal:** Improve the visual fidelity of coins and all core runner canvas objects (track/ground, lane dividers, obstacles, player) while keeping gameplay performance and rules unchanged.

**Planned changes:**
- Upgrade coin rendering in RunnerCanvas3D to a multi-layer, more realistic coin look (rim/edge, inner emboss, highlight, shadow) with a lightweight shimmer/rotation animation that does not affect collision/collection logic.
- Enhance canvas visuals for track/ground, lane dividers, obstacles, and player using richer shading/lighting cues and silhouettes, driven by existing theme CSS variables and remaining legible in light/dark themes.
- Add support for loading static sprite/texture assets from `frontend/public/assets/generated` (e.g., via `drawImage`) with a graceful fallback to the detailed procedural canvas drawing if assets fail to load.
- Update the HUD coin icon to match the new detailed coin style while keeping the existing HUD sizing/layout (32x32 display).

**User-visible outcome:** Coins, obstacles, track, and the player look significantly more detailed and consistent (including the HUD coin icon), with smooth gameplay and no changes to game mechanics.
