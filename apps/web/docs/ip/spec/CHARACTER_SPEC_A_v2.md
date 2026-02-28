# CHARACTER_SPEC_A_v2 (LINE Sticker - Cute Chibi)

## Goal
Produce a consistent chibi IP for LINE stickers: clean, crisp, not blurry, not cropped, not distorted.
Output assets must be easy to recombine later (base body + facial parts + props + cats).

## Style Lock
- Style: high-end chibi anime illustration, glossy hair, soft gradient shading, crisp linework, premium sticker look
- Rendering: sharp edges, no watercolor blur, no noisy texture, no “AI smudge”
- Lighting: warm studio/key light + soft rim light; highlights on hair and accessories
- Background: transparent (PNG). No big white canvas margins.
- Composition: character centered, safe padding so no part touches edges.

## Character Identity (Joanna IP)
- Vibe: elegant/cute, quiet but playful (“悶騷可愛”)
- Age impression: ~25 vibe (youthful), but refined/knowledgeable
- Signature: warm brown wavy hair + flower hair accessory + dangling charm + gold accents
- Outfit (default): light beige coat over black dress/top, small necklace, subtle earrings

## Color Palette (Primary)
- Hair: warm chestnut brown with golden highlights
- Eyes: warm amber/brown, big chibi eyes with glossy catchlights
- Accent: milk-tea gold / champagne gold (metallic feel)
- Skin: soft peach, light blush
- Black: clean deep black for dress/top, avoid crushed noisy blacks

## Sticker Readability Rules (LINE)
- Must read at small size (96x74 tab).
- Avoid tiny details-only expressions; use strong silhouette + clear mouth/eyes shapes.
- Text bubble/words must not overlap face or be clipped.
- Keep 8–12% safe padding from all edges for 370x320 canvas outputs.

## Modular Asset Plan (A)
### 1) Base Body (neutral)
- Pose: half-body (bust to mid-torso) + variant (head-only)
- Arms: neutral resting; separate hand variants later
- Output: transparent PNG, 2048x2048 master

### 2) Face Parts (separate layers concept)
Eyes set (at least 12):
- happy closed, happy open, sparkle, wink, surprised, angry, sleepy, sad, smug, nervous, love, determined
Mouth set (at least 12):
- smile, open laugh, small “o”, pout, gritted, flat, shy smile, crying, yelling, sleepy, smirk, “sorry” mouth
Brows set (optional 8):
- neutral, raised, angry, sad, surprised, worried, smug, determined

### 3) Hand/Prop Modules (transparent)
- Coffee cup (steam)
- Microphone (stage)
- Guitar pick / bass hint / keyboard hint (simple icon-like)
- Small “code window” HUD (minimal)
- Magic sparkle/sigil (subtle)

### 4) Cats (3 separate characters, transparent)
A) 樂樂 (female, Virgo 8/27)
- Breed: British Shorthair
- Color: pure glossy black (very dark, reflective)
- Personality: looks fierce but actually timid
B) 圓圓 (male, Virgo 8/30)
- Breed: British Shorthair
- Color: white base with dark/gray outer coat; looks near-black but lighter than 樂樂
C) 黏黏 (male, Pisces 3/24)
- Breed: British Shorthair
- Color: solid blue/gray (“藍貓”)
Notes:
- Make each cat readable at sticker size; keep iconic shapes.

## Hard Constraints (DO NOT)
- Do NOT change face proportions across stickers (eyes size/spacing, chin, nose).
- Do NOT crop hair tips, flower accessory, or text bubbles.
- Do NOT stretch/warp to fit canvas; always scale proportionally.
- Do NOT generate low-res then upscale; generate crisp master first.
- Do NOT add heavy background textures (keeps sticker clean).

## Output Targets
- Master: PNG transparent, 2048x2048 (or higher if available)
- LINE main: 370x320 PNG transparent (no crop)
- LINE tab: 96x74 PNG transparent (simplify details if needed)

## Versioning
- This file is the single source of truth. Any style change must bump version (A_v3…).
