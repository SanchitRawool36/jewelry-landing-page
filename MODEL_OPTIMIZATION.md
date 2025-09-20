# Model Optimization & Conversion Guide

This document explains how to optimize and convert your current jewelry assets (.OBJ/.MTL, .STL, .3DM) into web‑friendly GLB/GLTF for faster loading and lower memory footprint.

## Why Convert to GLB?
- Single binary payload (geometry + materials + textures) reduces HTTP round trips.
- Smaller total size after DRACO / Meshopt compression.
- Faster parsing in browsers vs multi‑file + legacy formats.
- Simplifies pipeline (no MTL path issues, no Rhino WASM dependency).

## Recommended Pipeline Overview
1. Source CAD (Rhino / STL / OBJ) → Clean in Blender (or Rhino) → Export `.glb` (with Draco).
2. Run `gltf-transform` for post‑compression (optional Meshopt + texture resizing).
3. Place final `.glb` into `public/assets/models/` and update product `src` paths.

## 1. Import & Clean
Open in Blender:
- Delete hidden / construction layers.
- Apply transforms (Object > Apply > All Transforms).
- Merge loose parts if appropriate (reduces draw calls).
- Recalculate normals (Shift+N) if shading artifacts appear.
- Shade Smooth + add custom autosmooth angle (30–45°) for jewelry edges.

For Rhino (.3dm):
- In Rhino: `ReduceMesh` (target 30–60k tris for earrings / rings, 80–120k for intricate necklaces).
- Export as OBJ or directly as STL if letting Blender convert.

## 2. Material Setup
Jewelry usually uses PBR metallic workflow:
- BaseColor: gold (#d4af37), rose (#b76e79), white (#d9d9d9).
- Metalness: 1.0
- Roughness: 0.05–0.25 (polished → matte scale)
- Optional: Clearcoat 0.6–1.0 with Clearcoat Roughness 0.05–0.15

In Blender Principled BSDF:
- Metallic = 1
- Roughness adjust per finish
- Transmission for gems (IOR ~2.4, roughness low) – OR keep stones separate for later environment intensity tweaks.

## 3. Export GLB (Blender)
File > Export > glTF 2.0 (.glb)
Settings:
- Format: GLB Binary
- Include: Selected Objects (if you isolated asset)
- +Y Up (default ok)
- Apply Modifiers: ON
- Transform: +Y Up (or leave default if scene aligned)
- Geometry → Compression: Draco (if available in your Blender build)
  - Position Quantization: 14–16
  - Normal Quantization: 10–12
  - Texture Coords: 12
  - Generic: 12
- Materials: Export
- UVs: Enabled

If Blender build lacks Draco, skip here and do compression post-process.

## 4. Post Optimize (gltf-transform)
Install:
```
npm install -D @gltf-transform/cli
```
Example command chain:
```
npx gltf-transform optimize ring.glb ring.opt.glb \
  --compress draco \
  --draco.quantizePosition 16 \
  --draco.quantizeTexcoord 12 \
  --draco.quantizeNormal 10 \
  --texture-compress webp --texture-webp-quality 85
```
Add Meshopt (better runtime decode) after installing encoder:
```
npm install meshoptimizer
npx gltf-transform optimize ring.glb ring.meshopt.glb --compress meshopt
```
Pick one (Draco OR Meshopt). Meshopt has faster decode; Draco usually slightly smaller.

## 5. Texture Strategy
- Use 1k (1024px) maps for small items (studs, rings), 2k for hero necklace/bracelet.
- Prefer roughness+metalness packed (R = metalness, G = roughness) to reduce HTTP requests (advanced—supported by custom material code if you implement).
- Convert PNG to WebP except for textures needing lossless transparency.

## 6. File Size Targets
| Asset Type | Target (Uncompressed) | Optimized GLB |
|------------|----------------------|---------------|
| Simple Ring | 500–800 KB | 150–400 KB |
| Detailed Ring | 1.2–2.0 MB | 400–900 KB |
| Stud / Earring Pair | 1.5–2.5 MB | 600 KB–1.2 MB |
| Bracelet / Necklace | 3–5 MB | 1–2.2 MB |

## 7. Updating the App
After placing `public/assets/models/ring01.glb`:
```js
// In App.jsx product src
src: '/assets/models/ring01.glb'
```
`Model.jsx` already routes .glb through the GLBModel path.

## 8. Removing Rhino Dependency (Optional)
Once all .3dm converted:
- Remove `rhino3dm` & `three-stdlib` Rhino loader usage.
- Delete `/public/libs/rhino3dm.wasm` if unused.
- Simplify `vite.config.js` (remove COOP/COEP lines if only added for Rhino/WASM, unless still needed for other features like WebXR).

## 9. Future: Hand Tracking for Rings
For realistic finger try-on:
- MediaPipe Hands (21 landmarks) → fit ring to proximal phalanx circle.
- Depth estimation: infer from relative finger width scaling.
- Safety: fallback UI message if only face tracker available.

## 10. QA Checklist Before Replacing
- Centered bounding box after conversion? (No offset drift)
- Correct scale relative to existing items.
- Material reflections similar or improved.
- Triangle count reduction ≥40% from original.
- Load time improvement observed in Network tab.

## 11. Optional Automation Script
Create `scripts/convert-models.md` to track each source→optimized mapping & target size.

---
Questions or want an automated conversion pipeline (Blender headless + CLI)? We can script that next.
