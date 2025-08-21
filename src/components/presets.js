// Per-product anchor and camera presets for try-on alignment
export const PRESSETS = {
  ring: {
    attach: 'ear', // attach to ear landmarks
    offset: { x: 0, y: -0.02, z: 0 },
    scale: 1.0,
    camera: { fov: 60, positionZ: 3 }
  },
  necklace: {
    attach: 'neck', // anchor below nose / neck
    offset: { x: 0, y: -0.22, z: 0 },
    scale: 1.2,
    camera: { fov: 48, positionZ: 3.8 }
  },
  pendant: {
    attach: 'neck',
    offset: { x: 0, y: -0.16, z: 0 },
    scale: 1.05,
    camera: { fov: 50, positionZ: 3.5 }
  },
  // Added presets for OBJ assets
  'earrings-l1': {
    attach: 'ear',
    offset: { x: 0.02, y: -0.01, z: 0 },
    scale: 1.0,
    camera: { fov: 60, positionZ: 3 }
  },
  'earrings-l2': {
    attach: 'ear',
    offset: { x: 0.02, y: -0.01, z: 0 },
    scale: 1.0,
    camera: { fov: 60, positionZ: 3 }
  },
  'necklace-l3': {
    attach: 'neck',
    offset: { x: 0, y: -0.2, z: 0 },
    scale: 1.15,
    camera: { fov: 48, positionZ: 3.8 }
  }
}
