Project Overview — Living Lookbook (Demo)
========================================

This document outlines the plan for a high-impact, modern landing page for your jewelry brand.

1. Project Summary
------------------
Create an immersive and interactive "Living Lookbook" to showcase signature jewelry pieces. The goal is to help customers appreciate the craftsmanship and increase confidence in buying.

2. Key Features & Scope
-----------------------
- Interactive 3D Showcase
  - Animated 3D models of signature pieces.
  - Click & drag to rotate, pinch-to-zoom, close-up inspection.

- Virtual Try-On (AR Feature)
  - A "Try It On" button will activate the device camera.
  - WebAR / WebXR integration overlays the selected piece on the user's live camera feed for a try-before-you-buy experience.

- Responsive & Modern Design
  - Fully responsive for desktop, tablet, and mobile.

3. Timeline (Estimate)
----------------------
- Total: ~8–10 weeks (initial setup, core features, testing, client feedback cycles).

4. Technology & Hosting
-----------------------
- HTML, CSS, JavaScript
- Three.js for 3D rendering
- WebAR SDK (for planned AR/try-on)
- Hosting: Netlify (static hosting, continuous deploy from GitHub)

Demo models
-----------
This repo contains demo models for local testing. These are placeholders — we'll replace them with your real jewelry models later.

How to fetch the demo models (run locally on Windows PowerShell):

1. Open PowerShell in the project root.
2. Run:

    .\scripts\fetch-demo-models.ps1

This will download three small GLB demo models into `assets/models/ring/`, `assets/models/necklace/`, and `assets/models/pendant/` as `model.glb` files. After that, open the site with a local server (Live Server, `python -m http.server`, or `npx http-server`) and test the viewer.

Notes
-----
- Demo models are for functionality and layout testing only. Replace with high-quality jewelry GLB/GLTF when available.
- AR integration will require additional permissions and may need a secure origin (HTTPS) to access the camera — Netlify provides HTTPS by default.
