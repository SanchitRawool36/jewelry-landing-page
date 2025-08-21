Guidance for mobile assets

- Generate a smaller LOD export for each model (decimate in Blender or export lower poly glb).
- Create basis/ktx2 compressed textures for faster mobile loads and set up KTX2 loader in r3f if needed.
- Place high-res models in `assets/models/<name>/model.glb` and low-res in `assets/models/<name>/model-small.glb`.
- Consider hosting huge assets on a CDN for production and using lazy load + intersection observer to defer loading until in view.
