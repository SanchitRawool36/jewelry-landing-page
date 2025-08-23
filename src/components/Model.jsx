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

export default function Model({ src, low, isMobile, onModelReady, finish = 'polished', shine = 1.2 }){
  // Delegate to specific components to honor hooks rules
  if (typeof src === 'string' && src.toLowerCase().endsWith('.glb')) {
  return <GLBModel src={src} low={low} isMobile={isMobile} onModelReady={onModelReady} finish={finish} shine={shine} />
  }
  if (src && typeof src === 'object' && src.obj && src.mtl) {
  return <OBJModel src={src} isMobile={isMobile} onModelReady={onModelReady} finish={finish} shine={shine} />
  }
  if (src && typeof src === 'object' && src.builtin === 'nails') {
    return <NailsModel isMobile={isMobile} onModelReady={onModelReady} finish={finish} shine={shine} />
  }
  return null
}

function GLBModel({ src, low, isMobile, onModelReady, finish = 'polished', shine = 1.2 }){
  const modelRef = useRef()
  const gltf = useGLTF(isMobile && low ? low : src)

  useEffect(() => {
    if (!gltf || !gltf.scene) return
    // Normalize and center once per model instance or device class change
  normalizeAndCenter(gltf.scene, isMobile ? 0.6 : 0.9)
    if (onModelReady) onModelReady(gltf.scene)
  }, [gltf])

  useEffect(() => {
    if (!gltf || !gltf.scene) return
    gltf.scene.traverse((c) => {
      if (c.isMesh && c.material) {
        const { metalness, roughness } = finishParams(finish)
        if ('metalness' in c.material) c.material.metalness = metalness
        if ('roughness' in c.material) c.material.roughness = roughness
        c.material.envMapIntensity = shine
        if ('clearcoat' in c.material) {
          c.material.clearcoat = finish === 'polished' ? 0.6 : 0.1
          c.material.clearcoatRoughness = finish === 'polished' ? 0.05 : 0.25
        }
        c.castShadow = true
        c.receiveShadow = true
      }
    })
  }, [gltf, finish, shine])

  return gltf ? <primitive ref={modelRef} object={gltf.scene} /> : null
}

function OBJModel({ src, isMobile, onModelReady, finish = 'polished', shine = 1.2 }){
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
  normalizeAndCenter(obj, isMobile ? 0.6 : 0.9)
    if (onModelReady) onModelReady(obj)
  }, [obj])

  useEffect(() => {
    if (!obj) return
    obj.traverse((c) => {
      if (c.isMesh && c.material) {
        const { metalness, roughness } = finishParams(finish)
        if ('metalness' in c.material) c.material.metalness = metalness
        if ('roughness' in c.material) c.material.roughness = roughness
        c.material.envMapIntensity = shine
        c.castShadow = true
        c.receiveShadow = true
      }
    })
  }, [obj, finish, shine])

  return obj ? <primitive ref={modelRef} object={obj} /> : null
}

function finishParams(finish){
  switch(finish){
    case 'matte': return { metalness: 0.5, roughness: 0.6 }
    case 'satin': return { metalness: 0.8, roughness: 0.3 }
    default: return { metalness: 1.0, roughness: 0.15 }
  }
}

function NailsModel({ isMobile, onModelReady, finish = 'polished', shine = 1.2 }){
  const groupRef = useRef()
  useEffect(() => {
    if (!groupRef.current) return
    // Normalize and center the group
  normalizeAndCenter(groupRef.current, isMobile ? 0.6 : 0.9)
    if (onModelReady) onModelReady(groupRef.current)
  }, [groupRef.current, isMobile])

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
            <meshPhysicalMaterial color={color} metalness={0} roughness={Math.min(0.6, roughness + 0.2)} clearcoat={0.6} clearcoatRoughness={0.1} envMapIntensity={shine} />
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
