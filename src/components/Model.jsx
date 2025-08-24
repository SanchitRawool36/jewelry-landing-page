import React, { useRef, useEffect, useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import { useLoader } from '@react-three/fiber'
import * as THREE from 'three'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js'

function normalizeAndCenter(gltfScene, targetSize = 1.2){
  const box = new THREE.Box3().setFromObject(gltfScene)
  const size = box.getSize(new THREE.Vector3())
  const maxDim = Math.max(size.x, size.y, size.z)
  const scale = targetSize / maxDim
  gltfScene.scale.setScalar(scale)
  box.setFromObject(gltfScene)
  const center = box.getCenter(new THREE.Vector3())
  gltfScene.position.sub(center)
}

// Ensure a mesh uses a PBR material so finish controls (metalness/roughness) work.
function ensurePhysicalMaterial(mesh) {
  if (!mesh || !mesh.material) return
  const mat = mesh.material
  // Handle multi-material meshes
  if (Array.isArray(mat)) {
    mesh.material = mat.map((m) => toPhysical(m))
    return
  }
  if (!mat.isMeshPhysicalMaterial && !mat.isMeshStandardMaterial) {
    mesh.material = toPhysical(mat)
  }
}

function toPhysical(oldMat) {
  // Reuse common texture slots if present
  const phys = new THREE.MeshPhysicalMaterial({
    color: oldMat.color ? oldMat.color.clone() : new THREE.Color('#d4af37'),
    map: oldMat.map || null,
    normalMap: oldMat.normalMap || null,
    roughnessMap: oldMat.roughnessMap || null,
    metalnessMap: oldMat.metalnessMap || null,
    aoMap: oldMat.aoMap || null,
    emissiveMap: oldMat.emissiveMap || null,
    envMap: oldMat.envMap || null,
    transparent: !!oldMat.transparent,
    opacity: oldMat.opacity !== undefined ? oldMat.opacity : 1,
    side: oldMat.side !== undefined ? oldMat.side : THREE.FrontSide,
  })
  // Dispose the old material to free GPU memory
  if (typeof oldMat.dispose === 'function') {
    oldMat.dispose()
  }
  return phys
}

export default function Model({ src, low, isMobile, onModelReady, finish = 'polished', shine = 1.2, clearcoat = 0.6, clearcoatRoughness = 0.08, displayScale = 1.0 }){
  // Delegate to specific components to honor hooks rules
  if (typeof src === 'string' && src.toLowerCase().endsWith('.glb')) {
    return <GLBModel src={src} low={low} isMobile={isMobile} onModelReady={onModelReady} finish={finish} shine={shine} clearcoat={clearcoat} clearcoatRoughness={clearcoatRoughness} displayScale={displayScale} />
  }
  if (src && typeof src === 'object' && src.obj && src.mtl) {
    return <OBJModel src={src} isMobile={isMobile} onModelReady={onModelReady} finish={finish} shine={shine} clearcoat={clearcoat} clearcoatRoughness={clearcoatRoughness} displayScale={displayScale} />
  }
  if (src && typeof src === 'object' && src.builtin === 'nails') {
    return <NailsModel isMobile={isMobile} onModelReady={onModelReady} finish={finish} shine={shine} clearcoat={clearcoat} clearcoatRoughness={clearcoatRoughness} displayScale={displayScale} />
  }
  return null
}

function GLBModel({ src, low, isMobile, onModelReady, finish = 'polished', shine = 1.2, clearcoat = 0.6, clearcoatRoughness = 0.08, displayScale = 1.0 }){
  const modelRef = useRef()
  const gltf = useGLTF(isMobile && low ? low : src)

  useEffect(() => {
    if (!gltf || !gltf.scene) return
    // Normalize and center once per model instance or device class change
    normalizeAndCenter(gltf.scene, (isMobile ? 0.6 : 0.9) * displayScale)
    if (onModelReady) onModelReady(gltf.scene)
  }, [gltf, displayScale, isMobile])

  useEffect(() => {
    if (!gltf || !gltf.scene) return
    gltf.scene.traverse((c) => {
      if (c.isMesh && c.material) {
  // GLB should already be PBR, but just in case for odd assets
  ensurePhysicalMaterial(c)
        const { metalness, roughness } = finishParams(finish)
        if (Array.isArray(c.material)) {
          c.material.forEach((m) => {
            if ('metalness' in m) m.metalness = metalness
            if ('roughness' in m) m.roughness = roughness
            if ('envMapIntensity' in m) m.envMapIntensity = shine
            if ('clearcoat' in m) m.clearcoat = clearcoat
            if ('clearcoatRoughness' in m) m.clearcoatRoughness = clearcoatRoughness
            m.needsUpdate = true
          })
        } else {
          if ('metalness' in c.material) c.material.metalness = metalness
          if ('roughness' in c.material) c.material.roughness = roughness
          if ('envMapIntensity' in c.material) c.material.envMapIntensity = shine
          if ('clearcoat' in c.material) c.material.clearcoat = clearcoat
          if ('clearcoatRoughness' in c.material) c.material.clearcoatRoughness = clearcoatRoughness
          c.material.needsUpdate = true
        }
        c.castShadow = true
        c.receiveShadow = true
      }
    })
  }, [gltf, finish, shine, clearcoat, clearcoatRoughness])

  return gltf ? <primitive ref={modelRef} object={gltf.scene} /> : null
}

function OBJModel({ src, isMobile, onModelReady, finish = 'polished', shine = 1.2, clearcoat = 0.6, clearcoatRoughness = 0.08, displayScale = 1.0 }){
  const modelRef = useRef()
  const mtlUrl = src.mtl
  const objUrl = src.obj
  const resourcePath = useMemo(() => mtlUrl.substring(0, mtlUrl.lastIndexOf('/') + 1), [mtlUrl])

  const materials = useLoader(MTLLoader, mtlUrl, (loader) => {
    loader.setResourcePath(resourcePath)
  })
  useEffect(() => {
    if (materials && typeof materials.preload === 'function') materials.preload()
  }, [materials])

  const obj = useLoader(OBJLoader, objUrl, (loader) => {
    if (materials) loader.setMaterials(materials)
  })

  useEffect(() => {
    if (!obj) return
    normalizeAndCenter(obj, (isMobile ? 0.6 : 0.9) * displayScale)
    if (onModelReady) onModelReady(obj)
  }, [obj, displayScale, isMobile])

  useEffect(() => {
    if (!obj) return
    obj.traverse((c) => {
      if (c.isMesh && c.material) {
  // Upgrade Phong (from MTL) to Physical so finish works
  ensurePhysicalMaterial(c)
        const { metalness, roughness } = finishParams(finish)
        if (Array.isArray(c.material)) {
          c.material.forEach((m) => {
            if ('metalness' in m) m.metalness = metalness
            if ('roughness' in m) m.roughness = roughness
            if ('envMapIntensity' in m) m.envMapIntensity = shine
            if ('clearcoat' in m) m.clearcoat = clearcoat
            if ('clearcoatRoughness' in m) m.clearcoatRoughness = clearcoatRoughness
            m.needsUpdate = true
          })
        } else {
          if ('metalness' in c.material) c.material.metalness = metalness
          if ('roughness' in c.material) c.material.roughness = roughness
          if ('envMapIntensity' in c.material) c.material.envMapIntensity = shine
          if ('clearcoat' in c.material) c.material.clearcoat = clearcoat
          if ('clearcoatRoughness' in c.material) c.material.clearcoatRoughness = clearcoatRoughness
          c.material.needsUpdate = true
        }
        c.castShadow = true
        c.receiveShadow = true
      }
    })
  }, [obj, finish, shine, clearcoat, clearcoatRoughness])

  return obj ? <primitive ref={modelRef} object={obj} /> : null
}

function finishParams(finish){
  switch(finish){
    case 'matte':
      // Soft, diffuse look
      return { metalness: 0.9, roughness: 0.7 }
    case 'satin':
      // Brushed look
      return { metalness: 1.0, roughness: 0.35 }
    case 'polished':
    default:
      // Shiny, mirror-like
      return { metalness: 1.0, roughness: 0.08 }
  }
}

function NailsModel({ isMobile, onModelReady, finish = 'polished', shine = 1.2, clearcoat = 0.6, clearcoatRoughness = 0.08, displayScale = 1.0 }){
  const groupRef = useRef()
  useEffect(() => {
    if (!groupRef.current) return
    // Normalize and center the group
    normalizeAndCenter(groupRef.current, (isMobile ? 0.6 : 0.9) * displayScale)
    if (onModelReady) onModelReady(groupRef.current)
  }, [groupRef.current, displayScale, isMobile])

  const { roughness } = finishParams(finish)
  const color = '#f5c6c6' // light blush nail color

  return (
    <group ref={groupRef}>
      {[0,1,2,3,4].map((i) => {
        const x = (i - 2) * 0.22
        const len = 0.4 + i * 0.02
        const rad = 0.07 - i * 0.007
        return (
          <mesh key={i} position={[x, 0, 0]} rotation={[-0.1 + i*0.02, 0, 0]} castShadow receiveShadow>
            {/* Capsule: radius, length, capSegments, radialSegments */}
            <capsuleGeometry args={[rad, len, 6, 12]} />
            <meshPhysicalMaterial color={color} metalness={0} roughness={Math.min(0.6, roughness + 0.2)} clearcoat={clearcoat} clearcoatRoughness={clearcoatRoughness} envMapIntensity={shine} />
          </mesh>
        )
      })}
      {/* Small base to suggest a fingertip under nails */}
      <mesh position={[0, -0.12, -0.05]} rotation={[Math.PI/2, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.5, 0.5, 0.15, 24]} />
        <meshStandardMaterial color="#ffe6d5" metalness={0} roughness={0.7} envMapIntensity={shine*0.5} />
      </mesh>
    </group>
  )
}
