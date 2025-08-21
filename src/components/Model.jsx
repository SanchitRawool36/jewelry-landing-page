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
    return <GLBModel src={src} low={low} isMobile={isMobile} onModelReady={onModelReady} />
  }
  if (src && typeof src === 'object' && src.obj && src.mtl) {
    return <OBJModel src={src} isMobile={isMobile} onModelReady={onModelReady} />
  }
  return null
}

function GLBModel({ src, low, isMobile, onModelReady, finish = 'polished', shine = 1.2 }){
  const modelRef = useRef()
  const gltf = useGLTF(isMobile && low ? low : src)

  useEffect(() => {
    if (gltf && gltf.scene) {
      normalizeAndCenter(gltf.scene, isMobile ? 0.9 : 1.2)
      gltf.scene.traverse((c) => {
        if (c.isMesh) {
          c.castShadow = true
          c.receiveShadow = true
          if (c.material) {
            const { metalness, roughness } = finishParams(finish)
            c.material.metalness = metalness
            c.material.roughness = roughness
            c.material.envMapIntensity = shine
            if ('clearcoat' in c.material) {
              c.material.clearcoat = finish === 'polished' ? 0.6 : 0.1
              c.material.clearcoatRoughness = finish === 'polished' ? 0.05 : 0.25
            }
          }
        }
      })
      if (onModelReady) onModelReady(gltf.scene)
    }
  }, [gltf, isMobile])

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
    if (obj) {
      normalizeAndCenter(obj, isMobile ? 0.9 : 1.2)
  obj.traverse((c) => {
        if (c.isMesh) {
          c.castShadow = true
          c.receiveShadow = true
          if (c.material) {
    const { metalness, roughness } = finishParams(finish)
    if ('metalness' in c.material) c.material.metalness = metalness
    if ('roughness' in c.material) c.material.roughness = roughness
    c.material.envMapIntensity = shine
          }
        }
      })
      if (onModelReady) onModelReady(obj)
    }
  }, [obj, isMobile])

  return obj ? <primitive ref={modelRef} object={obj} /> : null
}

function finishParams(finish){
  switch(finish){
    case 'matte': return { metalness: 0.5, roughness: 0.6 }
    case 'satin': return { metalness: 0.8, roughness: 0.3 }
    default: return { metalness: 1.0, roughness: 0.15 }
  }
}
