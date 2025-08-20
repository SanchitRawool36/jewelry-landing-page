# Jewelry Landing Page — Living Lookbook (Demo)

This repository contains an interactive landing page demo for a jewelry brand.

## Features
- Interactive 3D product viewer (Three.js)
- Product thumbnails generated client-side
- Polished vs Matte material finish toggle
- Mobile-responsive layout with a bottom product tray
- Demo GLB models can be fetched with the included PowerShell script

## Local setup
1. Fetch demo models (optional, run locally on Windows PowerShell):

```powershell
.\scripts\fetch-demo-models.ps1
```

2. Start a local server (one of the following):

```powershell
# Node http-server
npx http-server -p 8080

# or Python
python -m http.server 8080
```

3. Open `http://localhost:8080` in your browser.

## Deploy to Netlify
- Connect this GitHub repository to Netlify and set:
  - Build command: (leave blank)
  - Publish directory: `.`

Netlify will serve the site over HTTPS which is required for WebXR / AR camera access.

## Project overview and plan
See `PROJECT_OVERVIEW.md` for the project plan, timeline, and AR/try-on notes.

