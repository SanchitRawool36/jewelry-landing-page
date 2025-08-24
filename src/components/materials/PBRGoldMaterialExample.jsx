import React from 'react'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'

/**
 * Example: Use this in your model traversal or as a direct child of a mesh to apply real PBR textures.
 *
 * <mesh ...>
 *   <PBRGoldMaterialExample />
 * </mesh>
 */
export default function PBRGoldMaterialExample({
  baseColorUrl = '/textures/jewelry_basecolor.jpg',
  mrUrl = '/textures/jewelry_metallicroughness.jpg',
  normalUrl = '/textures/jewelry_normal.jpg',
  aoUrl = '/textures/jewelry_ao.jpg',
  roughness = 0.12,
  envIntensity = 1.2,
  clearcoat = 0.6,
  clearcoatRoughness = 0.08,
}) {
  const [baseColor, mr, normal, ao] = useTexture([
    baseColorUrl, mrUrl, normalUrl, aoUrl
  ])
  baseColor.colorSpace = THREE.SRGBColorSpace
  return (
    <meshPhysicalMaterial
      map={baseColor}
      metalnessMap={mr}
      roughnessMap={mr}
      normalMap={normal}
      aoMap={ao}
      metalness={1.0}
      roughness={roughness}
      clearcoat={clearcoat}
      clearcoatRoughness={clearcoatRoughness}
      envMapIntensity={envIntensity}
    />
  )
}
