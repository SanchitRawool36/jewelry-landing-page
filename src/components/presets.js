// Per-product anchor and camera presets for try-on alignment
export const PRESSETS = {
  ring: {
    attach: 'ear', // attach to ear landmarks
    offset: { x: 0, y: -0.02, z: 0 },
    scale: 1.0,
    camera: { fov: 60, positionZ: 3 }
  },
  necklace: {
  attach: 'neck', // MindAR: anchor near chin (152)
  offset: { x: 0, y: -0.22, z: 0 },
  rotationOffset: { x: 5, y: 0, z: 0 },
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
  offset: { x: 0.0, y: -0.02, z: 0 },
  scale: 0.6,
    camera: { fov: 60, positionZ: 3 }
  },
  'earrings-l2': {
    attach: 'ear',
  offset: { x: 0.0, y: -0.02, z: 0 },
  scale: 0.6,
    camera: { fov: 60, positionZ: 3 }
  },
  'necklace-l3': {
  attach: 'neck',
  offset: { x: 0, y: -0.22, z: 0 },
  rotationOffset: { x: 5, y: 0, z: 0 },
    scale: 1.15,
    camera: { fov: 48, positionZ: 3.8 }
  }
  ,
  // Optional preset for nose ring
  'nose-ring': {
    attach: 'nose',
    offset: { x: 0.0, y: 0.02, z: 0 },
    scale: 1.0,
    camera: { fov: 55, positionZ: 3.2 }
  }
}
