import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { PRESSETS } from './presets'

// Minimal MindAR-based try-on for ear anchoring. Loads MindAR from CDN at runtime.
export default function TryOnMindAR({ productId, sourceModel, onClose, onFallback }){
  const containerRef = useRef(null)
  const [errorMsg, setErrorMsg] = useState(null)
  const [running, setRunning] = useState(false)
  const [sizeMul, setSizeMul] = useState(1.0)
  const mindarRef = useRef(null)
  const modelRef = useRef(null)

  // Helper to inject a script
  const loadScript = (src) => new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = src
    s.async = true
    s.onload = resolve
    s.onerror = reject
    document.head.appendChild(s)
  })

  const start = async () => {
    if (!productId || !sourceModel) return
    try {
      if (!window.MINDAR || !window.MINDAR.FACE) {
        await loadScript('https://cdn.jsdelivr.net/npm/mind-ar@1.2.5/dist/mindar-face-three.prod.js')
      }
    } catch (e) {
      setErrorMsg('Failed to load MindAR. Check your network and try again.')
      if (onFallback) onFallback()
      return
    }

  const MINDAR = window.MINDAR
    if (!MINDAR || !MINDAR.FACE || !MINDAR.FACE.MindARThree) {
      setErrorMsg('MindAR not available in this environment.')
      if (onFallback) onFallback()
      return
    }

    const mindarThree = new MINDAR.FACE.MindARThree({
      container: containerRef.current,
      filterMinCF: 0.00001,
      filterBeta: 0.001,
    })
    const { renderer, scene, camera } = mindarThree

    // Basic lighting
    const hemi = new THREE.HemisphereLight(0xffffff, 0x333344, 0.7)
    scene.add(hemi)
    const key = new THREE.DirectionalLight(0xffffff, 0.9)
    key.position.set(2, 3, 2)
    scene.add(key)

    // Clone provided model
    const model = sourceModel.clone(true)
    model.traverse(n=>{ if(n.isMesh){ n.castShadow = false; n.frustumCulled = false } })
    modelRef.current = model
    
    // Apply preset-driven scale and offset
    const preset = PRESSETS[productId] || { attach: 'ear', offset: {x:0,y:0,z:0}, scale: 1 }
    const attach = preset.attach || 'ear'
    const baseMul = attach === 'nose' ? 0.18 : attach === 'neck' ? 0.6 : 0.25
    model.scale.setScalar((preset.scale || 1) * baseMul * sizeMul)
    const holder = new THREE.Group()
    holder.add(model)
    model.position.set(preset.offset?.x || 0, preset.offset?.y || 0, preset.offset?.z || 0)
    if (preset.rotationOffset) {
      holder.rotation.set(
        THREE.MathUtils.degToRad(preset.rotationOffset.x || 0),
        THREE.MathUtils.degToRad(preset.rotationOffset.y || 0),
        THREE.MathUtils.degToRad(preset.rotationOffset.z || 0)
      )
    }

  // Choose anchor index per attach type
    const anchorIndex = attach === 'nose' ? 1 : attach === 'neck' ? 152 : 234
  const anchor = mindarThree.addAnchor(anchorIndex)
  anchor.group.add(holder)

    mindarRef.current = mindarThree
    await mindarThree.start()
    setRunning(true)

    renderer.setAnimationLoop(() => {
      if (modelRef.current) {
        const preset = PRESSETS[productId] || { attach: 'ear', scale: 1 }
        const attach = preset.attach || 'ear'
        const baseMul = attach === 'nose' ? 0.18 : attach === 'neck' ? 0.6 : 0.25
        modelRef.current.scale.setScalar((preset.scale || 1) * baseMul * sizeMul)
      }
      renderer.render(scene, camera)
    })
  }

  const stop = async () => {
    try {
      if (mindarRef.current) await mindarRef.current.stop()
    } catch {}
    mindarRef.current = null
    setRunning(false)
  }

  useEffect(() => {
    start()
    return () => { stop() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId, sourceModel])

  return (
    <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div ref={containerRef} style={{position:'absolute',inset:0}} />
      <div style={{position:'absolute',top:'12px',left:'12px',pointerEvents:'auto',zIndex:2, display:'flex', flexDirection: 'column', gap:8}}>
        <button onClick={() => { stop(); onClose && onClose(); }} className="btn" aria-label="Close camera">Close Camera</button>
        <div className="card p-2">
          <div className="text-xs font-medium mb-1">Size</div>
          <input type="range" min={0.5} max={1.5} step={0.01} value={sizeMul} onChange={(e)=>setSizeMul(parseFloat(e.target.value))} style={{width:180}} />
        </div>
      </div>
      {errorMsg && (
        <div className="card" style={{position:'absolute',top:12,right:12}}>{errorMsg}</div>
      )}
    </div>
  )
}
