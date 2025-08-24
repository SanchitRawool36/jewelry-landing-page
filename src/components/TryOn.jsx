import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { PRESSETS } from './presets'

// TryOn: mounts a small Three.js overlay, uses MediaPipe FaceMesh to anchor a cloned model
export default function TryOn({ productId, sourceModel, onClose }){
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [running, setRunning] = useState(false)
  const overlayRef = useRef({ scene: null, camera: null, renderer: null, model: null, faceMesh: null, mpCamera: null, onResize: null, animating: false, debugPoints: null, debugLines: null, connections: null })
  const startingRef = useRef(false)
  const rafRef = useRef(0)

  const [errorMsg, setErrorMsg] = useState(null)
  // Smoothing state
  const smoothRef = useRef({ pos: new THREE.Vector3(0,0,0), scale: 1, rot: new THREE.Quaternion(), t: performance.now() })
  const [showMesh, setShowMesh] = useState(false)

  // Helper to resolve MediaPipe classes from ESM and/or window globals
  function resolveFaceMeshClass(mod){
    if (mod && mod.FaceMesh) return mod.FaceMesh
    const g = window.FaceMesh
    if (g && g.FaceMesh) return g.FaceMesh
    return typeof g === 'function' ? g : null
  }
  function resolveCameraClass(mod){
    if (mod && mod.Camera) return mod.Camera
    return window.Camera || null
  }

  // Stop and cleanup any existing pipeline/renderer
  const stop = () => {
    const or = overlayRef.current
    or.animating = false
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = 0
    }
    if (or.mpCamera) {
      try { or.mpCamera.stop() } catch {}
      or.mpCamera = null
    }
    if (videoRef.current && videoRef.current.srcObject) {
      try { videoRef.current.srcObject.getTracks().forEach(t=>t.stop()) } catch {}
      videoRef.current.srcObject = null
    }
    if (or.renderer) {
      try { or.renderer.dispose() } catch {}
      if (or.renderer.domElement && canvasRef.current) {
        try { canvasRef.current.removeChild(or.renderer.domElement) } catch {}
      }
      or.renderer = null
    }
    if (or.onResize) {
      window.removeEventListener('resize', or.onResize)
      or.onResize = null
    }
    overlayRef.current.scene = null
    overlayRef.current.camera = null
    overlayRef.current.model = null
    overlayRef.current.faceMesh = null
    setRunning(false)
    startingRef.current = false
  }

  // Start pipeline (single-start guarded). Let MediaPipe Camera manage playback to avoid AbortError.
  const start = async () => {
    if (!productId || !sourceModel) return false
    if (startingRef.current || running) return false
    startingRef.current = true
    setErrorMsg(null)

    // Load MediaPipe ESM modules from CDN
    let FaceMeshCls, CameraCls
    try {
      const [faceMeshMod, cameraMod] = await Promise.all([
        import('https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js'),
        import('https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js')
      ])
      FaceMeshCls = resolveFaceMeshClass(faceMeshMod)
      CameraCls = resolveCameraClass(cameraMod)
    } catch (e) {
      if (import.meta.env && import.meta.env.DEV) console.warn('TryOn: failed to load MediaPipe modules', e)
      setErrorMsg('Failed to load camera modules. Check your network and try again.')
      startingRef.current = false
      return false
    }
    if (!FaceMeshCls || !CameraCls) {
      if (import.meta.env && import.meta.env.DEV) console.warn('TryOn: MediaPipe classes not found in modules, attempting globals', { FaceMeshCls, CameraCls, FaceMeshGlobal: window.FaceMesh, CameraGlobal: window.Camera })
      FaceMeshCls = FaceMeshCls || resolveFaceMeshClass(null)
      CameraCls = CameraCls || resolveCameraClass(null)
      if (!FaceMeshCls || !CameraCls) {
        setErrorMsg('Camera modules loaded but not initialized. Please refresh the page and try again.')
        startingRef.current = false
        return false
      }
    }

    // Create overlay renderer with provisional size; will correct on metadata/resize
    const initialW = window.innerWidth
    const initialH = window.innerHeight
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setSize(initialW, initialH)
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio))
    // Clear previous canvas if any
    if (canvasRef.current) {
      while (canvasRef.current.firstChild) canvasRef.current.removeChild(canvasRef.current.firstChild)
      canvasRef.current.appendChild(renderer.domElement)
    }

  const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(50, initialW/initialH, 0.1, 1000)
    camera.position.set(0,0,3)

    // Clone provided model
    const cloned = sourceModel.clone(true)
    cloned.traverse(n=>{ if(n.isMesh){ n.castShadow = false; n.frustumCulled = false }})
    scene.add(cloned)

    // Optional: debug landmark points/lines (visibility toggled later)
    {
      const geom = new THREE.BufferGeometry()
      geom.setAttribute('position', new THREE.BufferAttribute(new Float32Array(468 * 3), 3))
      const pts = new THREE.Points(geom, new THREE.PointsMaterial({ color: 0xffcc00, size: 0.01 }))
      scene.add(pts)
      overlayRef.current.debugPoints = pts
      pts.visible = false
    }
    // Lines for tessellation if available
    {
      const geom = new THREE.BufferGeometry()
      // allocate a generous buffer; will resize when connections known
      geom.setAttribute('position', new THREE.BufferAttribute(new Float32Array(468 * 2 * 3), 3))
      const lines = new THREE.LineSegments(geom, new THREE.LineBasicMaterial({ color: 0x00a2ff, linewidth: 1 }))
      scene.add(lines)
      overlayRef.current.debugLines = lines
      lines.visible = false
    }

    // Store overlay refs
    overlayRef.current.scene = scene
    overlayRef.current.camera = camera
    overlayRef.current.renderer = renderer
    overlayRef.current.model = cloned

    // Handle resize and video metadata to keep aspect correct
    const updateSize = () => {
      const w = videoRef.current?.videoWidth || window.innerWidth
      const h = videoRef.current?.videoHeight || window.innerHeight
      renderer.setSize(w, h)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }
    const onResize = () => updateSize()
    overlayRef.current.onResize = onResize
    window.addEventListener('resize', onResize)
    const onMeta = () => { updateSize(); videoRef.current?.removeEventListener('loadedmetadata', onMeta) }
    videoRef.current?.addEventListener('loadedmetadata', onMeta)

    // Init face mesh
    const faceMesh = new FaceMeshCls({locateFile: (f)=>`https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${f}`})
    faceMesh.setOptions({ maxNumFaces: 1, refineLandmarks: true, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5 })
    // Capture tessellation connections if exported by module/globals
    try {
      const mod = await import('https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js')
      const connections = mod?.FACEMESH_TESSELATION || (window.FACEMESH_TESSELATION || null)
      if (connections && Array.isArray(connections)) overlayRef.current.connections = connections
    } catch {}
    faceMesh.onResults((res)=>onFaceResults(res, productId))
    overlayRef.current.faceMesh = faceMesh

    // Let MediaPipe Camera manage getUserMedia and video.play()
    try {
      const mpCamera = new CameraCls(videoRef.current, {
        onFrame: async ()=>{ await faceMesh.send({image: videoRef.current}) },
        width: initialW,
        height: initialH
      })
      overlayRef.current.mpCamera = mpCamera
      await mpCamera.start()
    } catch (e) {
      if (import.meta.env && import.meta.env.DEV) console.warn('TryOn: mpCamera start failed', e)
      const insecure = location.protocol !== 'https:' && location.hostname !== 'localhost'
      if (e && (e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError')) {
        setErrorMsg('Camera permission denied. Allow access in your browser/site settings and try again.')
      } else if (insecure) {
        setErrorMsg('Camera requires HTTPS. Please use a secure URL (https) or localhost during development.')
      } else {
        setErrorMsg('Unable to start camera. Another app may be using it, or no camera is available.')
      }
      stop()
      return false
    }

    setRunning(true)
    overlayRef.current.animating = true
    renderLoop()
    startingRef.current = false
    return true
  }

  // Auto-start on mount/open
  useEffect(() => {
    // Restart pipeline when product/model changes
    stop()
    start()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId, sourceModel])

  // Cleanup on unmount
  useEffect(() => {
  return () => { stop() }
  }, [])

  // Allow closing with Esc
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose && onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  function onFaceResults(results, pid){
    const or = overlayRef.current
    if (!or || !or.model) return
    if (!results.multiFaceLandmarks || !results.multiFaceLandmarks[0]) return
    const lm = results.multiFaceLandmarks[0]
    const preset = PRESSETS[pid] || PRESSETS['necklace']

    // DT for framerate-compensated smoothing
    const now = performance.now()
    const dt = (now - smoothRef.current.t) / 1000
    smoothRef.current.t = now

    // Prepare convenient landmark vectors (normalized to our overlay space)
  const toVec3 = (p) => new THREE.Vector3((p.x - 0.5) * 2, -(p.y - 0.5) * 2, (p.z || 0) * 2)
    const lEyeOuter = toVec3(lm[33])
    const rEyeOuter = toVec3(lm[263])
    const midEye = lEyeOuter.clone().add(rEyeOuter).multiplyScalar(0.5)
    const nose = toVec3(lm[1])
    const chin = toVec3(lm[152])
    const leftEar = lm[234] ? toVec3(lm[234]) : lEyeOuter
    const rightEar = lm[454] ? toVec3(lm[454]) : rEyeOuter

    // Optional: update debug points
    if (or.debugPoints && or.debugPoints.visible) {
      const arr = or.debugPoints.geometry.attributes.position.array
      for (let i = 0; i < 468; i++) {
        const p = lm[i]
        const v = toVec3(p)
        arr[i*3+0] = v.x
        arr[i*3+1] = v.y
        arr[i*3+2] = v.z
      }
      or.debugPoints.geometry.attributes.position.needsUpdate = true
    }
    if (or.debugLines && or.debugLines.visible && or.connections) {
      const pos = or.debugLines.geometry.attributes.position
      const arr = pos.array
      const conns = or.connections
      // Ensure buffer large enough
      const required = conns.length * 2 * 3
      if (arr.length < required) {
        or.debugLines.geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(required), 3))
      }
      let idx = 0
      for (let i = 0; i < conns.length; i++) {
        const [a, b] = conns[i]
        const va = toVec3(lm[a])
        const vb = toVec3(lm[b])
        arr[idx++] = va.x; arr[idx++] = va.y; arr[idx++] = va.z
        arr[idx++] = vb.x; arr[idx++] = vb.y; arr[idx++] = vb.z
      }
      or.debugLines.geometry.setDrawRange(0, conns.length * 2)
      or.debugLines.geometry.attributes.position.needsUpdate = true
    }

    // Compute head orientation basis from eyes and nose
    // x-axis: from right eye to left eye; y-axis: approx from nose to eyes; z-axis: cross
    let xAxis = rEyeOuter.clone().sub(lEyeOuter).multiplyScalar(-1) // left-to-right
    if (xAxis.lengthSq() < 1e-6) xAxis = new THREE.Vector3(1,0,0)
    xAxis.normalize()
    let yApprox = midEye.clone().sub(nose) // up-ish
    if (yApprox.lengthSq() < 1e-6) yApprox = new THREE.Vector3(0,1,0)
    yApprox.normalize()
    let zAxis = new THREE.Vector3().crossVectors(xAxis, yApprox)
    if (zAxis.lengthSq() < 1e-6) zAxis = new THREE.Vector3(0,0,1)
    zAxis.normalize()
    let yAxis = new THREE.Vector3().crossVectors(zAxis, xAxis).normalize()

    const rotMat = new THREE.Matrix4()
    rotMat.makeBasis(xAxis, yAxis, zAxis) // columns are x,y,z axes
    const targetQuat = new THREE.Quaternion().setFromRotationMatrix(rotMat)

    // Optional per-product rotation offset (Euler degrees)
    if (preset.rotationOffset) {
      const e = new THREE.Euler(
        THREE.MathUtils.degToRad(preset.rotationOffset.x || 0),
        THREE.MathUtils.degToRad(preset.rotationOffset.y || 0),
        THREE.MathUtils.degToRad(preset.rotationOffset.z || 0),
        'XYZ'
      )
      const qOff = new THREE.Quaternion().setFromEuler(e)
      targetQuat.multiply(qOff)
    }

    // Smooth rotation (slerp)
    if (!smoothRef.current.rot || smoothRef.current.rot.w === 0) {
      smoothRef.current.rot = targetQuat.clone()
    } else {
      const alphaR = 0.25
      const kR = 1 - Math.pow(1 - alphaR, Math.max(1, dt*60))
      smoothRef.current.rot.slerp(targetQuat, kR)
    }

    or.model.quaternion.copy(smoothRef.current.rot)

    // anchor by nose for neck, by ear for earrings
    if (preset.attach === 'neck'){
      const x = nose.x; const y = nose.y // already converted above
      const targetPos = new THREE.Vector3((x - 0.5) * 2 + preset.offset.x, -(y - 0.5) * 2 + preset.offset.y, preset.offset.z)
  // Smooth position with exponential lerp
  const alpha = 0.22
  const k = 1 - Math.pow(1 - alpha, Math.max(1, dt*60))
  smoothRef.current.pos.lerp(targetPos, k)
  or.model.position.copy(smoothRef.current.pos)
      // scale by relative face width (approx using ear or eye distance)
      const left = lm[234] || lm[33]
      const right = lm[454] || lm[263]
      if (left && right){
        const vL = toVec3(left)
        const vR = toVec3(right)
        const dist3 = vL.distanceTo(vR)
        const rawS = THREE.MathUtils.clamp(dist3 * 3.5 * preset.scale, 0.35, 3)
  const kS = 1 - Math.pow(1 - 0.2, Math.max(1, dt*60))
  smoothRef.current.scale = THREE.MathUtils.lerp(smoothRef.current.scale || rawS, rawS, kS)
  or.model.scale.setScalar(smoothRef.current.scale)
      }
    } else if (preset.attach === 'ear'){
      // place near ear landmarks
      const left = lm[234]
      const right = lm[454]
      if (left){
        const x = (left.x - 0.5) * 2
        const y = -(left.y - 0.5) * 2
        const targetPos = new THREE.Vector3(x + preset.offset.x, y + preset.offset.y, preset.offset.z)
  const alpha = 0.22
  const k = 1 - Math.pow(1 - alpha, Math.max(1, dt*60))
  smoothRef.current.pos.lerp(targetPos, k)
  or.model.position.copy(smoothRef.current.pos)
      }
      if (left && right){
        const vL = toVec3(left)
        const vR = toVec3(right)
        const dist3 = vL.distanceTo(vR)
        const rawS = THREE.MathUtils.clamp(dist3 * 3.8 * preset.scale, 0.3, 2.5)
  const kS = 1 - Math.pow(1 - 0.2, Math.max(1, dt*60))
  smoothRef.current.scale = THREE.MathUtils.lerp(smoothRef.current.scale || rawS, rawS, kS)
  or.model.scale.setScalar(smoothRef.current.scale)
      }
    }
  }

  function renderLoop(){
    const or = overlayRef.current
    if (!or || !or.renderer || !or.animating) return
    rafRef.current = requestAnimationFrame(renderLoop)
  // Anchored model orientation comes from head pose
    or.renderer.render(or.scene, or.camera)
  }

  return (
    <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center'}}>
      <video ref={videoRef} style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',pointerEvents:'none',zIndex:0}} autoPlay playsInline muted></video>
      <div ref={canvasRef} style={{position:'absolute',inset:0,pointerEvents:'none',zIndex:1}} />
      <div style={{position:'absolute',top:'12px',left:'12px',pointerEvents:'auto',zIndex:2, display:'flex', gap:8}}>
        <button onClick={() => { onClose(); }} className="btn" aria-label="Close camera">Close Camera</button>
        <button onClick={() => {
          setShowMesh((v)=>{
            const next = !v
            const or = overlayRef.current
            if (or) {
              if (or.debugPoints) or.debugPoints.visible = next
              if (or.debugLines) or.debugLines.visible = next
            }
            return next
          })
        }} className="btn" aria-label="Toggle face mesh">{showMesh ? 'Hide Mesh' : 'Show Mesh'}</button>
      </div>
  {/* Start button removed: camera starts automatically when overlay opens */}
      {errorMsg && (
        <div style={{position:'absolute',bottom:12,left:'50%',transform:'translateX(-50%)',pointerEvents:'auto'}} className="card p-3 max-w-md">
          <div className="text-sm text-slate-700">{errorMsg}</div>
          <div className="mt-2 flex gap-2">
            <button className="btn" onClick={()=>setErrorMsg(null)}>Dismiss</button>
            <button className="btn btn-primary" onClick={()=>{ start() }}>Retry</button>
          </div>
        </div>
      )}
    </div>
  )
}
