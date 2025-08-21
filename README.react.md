# React + r3f version

This repo contains a Vite + React + Tailwind setup that replaces the legacy static site.

Quick start:

1. npm install
2. npm run dev

Notes:
- The 3D viewer uses @react-three/fiber and @react-three/drei.
- Mobile handling: Camera FOV adjusts on resize, Model component loads `low` fallback when `isMobile`.
- Touch gestures implemented in `CameraController.jsx` using raw touch events (pinch + drag).
