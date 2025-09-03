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
  const [status, setStatus] = useState('Initializing camera…')
  const lastResultRef = useRef(0)
  const statusRef = useRef(status)
  // Smoothing state
  const smoothRef = useRef({ pos: new THREE.Vector3(0,0,0), scale: 1, rot: new THREE.Quaternion(), t: performance.now() })
  const [showMesh, setShowMesh] = useState(false)
  const [sizeMul, setSizeMul] = useState(0.3)
  const [showCoords, setShowCoords] = useState(false)
  const [showLabels, setShowLabels] = useState(false)
  const [showGrid, setShowGrid] = useState(false)
  const [faceInfo, setFaceInfo] = useState({
    nose: { x: '-', y: '-', z: '-' },
    leftEar: { x: '-', y: '-', z: '-' },
    rightEar: { x: '-', y: '-', z: '-' },
    leftEye: { x: '-', y: '-', z: '-' },
    rightEye: { x: '-', y: '-', z: '-' },
  })
  const [labelPos, setLabelPos] = useState({
    nose: { x: 0.5, y: 0.5 },
    leftEar: { x: 0.4, y: 0.5 },
    rightEar: { x: 0.6, y: 0.5 },
    leftEye: { x: 0.45, y: 0.45 },
    rightEye: { x: 0.55, y: 0.45 },
  })
  const [faceBox, setFaceBox] = useState({ x: 0.35, y: 0.35, w: 0.3, h: 0.3 })

  // mirror status into a ref to minimize unnecessary re-renders inside tight loops
  useEffect(() => { statusRef.current = status }, [status])

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
  setStatus('Loading camera modules…')
  // reset last detection timestamp
  lastResultRef.current = 0

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
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1
  renderer.physicallyCorrectLights = true
    // Clear previous canvas if any
    if (canvasRef.current) {
      while (canvasRef.current.firstChild) canvasRef.current.removeChild(canvasRef.current.firstChild)
      canvasRef.current.appendChild(renderer.domElement)
    }

  const scene = new THREE.Scene()
    // Orthographic camera aligned to normalized device coordinates
    const aspect = initialW / initialH
    const camera = new THREE.OrthographicCamera(-aspect, aspect, 1, -1, 0.01, 100)
    camera.position.set(0,0,3)

    // Clone provided model
  const cloned = sourceModel.clone(true)
  cloned.traverse(n=>{ if(n.isMesh){ n.castShadow = false; n.frustumCulled = false }})
  cloned.visible = false
    scene.add(cloned)

    // Add a simple light rig for shiny PBR materials
    {
      const hemi = new THREE.HemisphereLight(0xffffff, 0x222233, 0.6)
      scene.add(hemi)
      const key = new THREE.DirectionalLight(0xffffff, 1.0)
      key.position.set(2, 3, 2)
      scene.add(key)
      const rim = new THREE.DirectionalLight(0xffe6aa, 0.5)
      rim.position.set(-3, 2, -2)
      scene.add(rim)
    }

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
      const a = w / h
      camera.left = -a
      camera.right = a
      camera.top = 1
      camera.bottom = -1
      camera.updateProjectionMatrix()
    }
    const onResize = () => updateSize()
    overlayRef.current.onResize = onResize
    window.addEventListener('resize', onResize)
    const onMeta = () => { updateSize(); videoRef.current?.removeEventListener('loadedmetadata', onMeta) }
    videoRef.current?.addEventListener('loadedmetadata', onMeta)

    // Init face mesh
  const faceMesh = new FaceMeshCls({locateFile: (f)=>`https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${f}`})
  faceMesh.setOptions({ maxNumFaces: 1, refineLandmarks: true, selfieMode: true, minDetectionConfidence: 0.3, minTrackingConfidence: 0.3 })
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
        height: initialH,
        facingMode: 'user'
      })
      overlayRef.current.mpCamera = mpCamera
      await mpCamera.start()
      setStatus('Camera started. Looking for a face…')
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

  // Status watchdog: update status text based on time since last detection
  useEffect(() => {
    let timer
    if (running) {
      timer = setInterval(() => {
        const now = performance.now()
        const last = lastResultRef.current || 0
        const delta = last === 0 ? Infinity : now - last
        // Only change status if not currently tracking
        if (last === 0) {
          if (statusRef.current !== 'Camera started. Looking for a face…' && statusRef.current !== 'Loading camera modules…') {
            setStatus('Camera started. Looking for a face…')
          }
        } else if (delta > 5000) {
          if (statusRef.current !== 'No face detected') setStatus('No face detected')
        } else if (delta > 1500) {
          if (statusRef.current !== 'Looking for a face…') setStatus('Looking for a face…')
        }
      }, 500)
    }
    return () => { if (timer) clearInterval(timer) }
  }, [running])

  // Allow closing with Esc
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose && onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  function onFaceResults(results, pid){
    const or = overlayRef.current
    if (!or || !or.model) return
    if (!results.multiFaceLandmarks || !results.multiFaceLandmarks[0]) {
      // hide model if no face to prevent floating
      if (or.model) or.model.visible = false
      return
    }
    const lm = results.multiFaceLandmarks[0]
    // Ensure debug helpers match "showMesh" visibility on first creation
    const orRef = overlayRef.current
    if (orRef) {
      if (orRef.debugPoints) orRef.debugPoints.visible = !!showMesh
      if (orRef.debugLines) orRef.debugLines.visible = !!showMesh
    }
  // mark last successful detection time and set status
  lastResultRef.current = performance.now()
  if (statusRef.current !== 'Tracking face') setStatus('Tracking face')
    if (or.model) or.model.visible = true
    const preset = PRESSETS[pid] || PRESSETS['necklace']

    // DT for framerate-compensated smoothing
    const now = performance.now()
    const dt = (now - smoothRef.current.t) / 1000
    smoothRef.current.t = now

  // Prepare convenient landmark vectors (normalized to our overlay space), aspect-aware for ortho cam
  const cam = overlayRef.current.camera
  const ax = (cam && cam.right) ? cam.right : 1
  // Use mirrored X so user motion feels natural with selfie view
  const toVec3 = (p) => new THREE.Vector3(-((p.x - 0.5) * 2) * ax, -((p.y - 0.5) * 2), (p.z || 0) * 2)
    const lEyeOuter = toVec3(lm[33])
    const rEyeOuter = toVec3(lm[263])
    const midEye = lEyeOuter.clone().add(rEyeOuter).multiplyScalar(0.5)
    const nose = toVec3(lm[1])
    const chin = toVec3(lm[152])
    const leftEar = lm[234] ? toVec3(lm[234]) : lEyeOuter
    const rightEar = lm[454] ? toVec3(lm[454]) : rEyeOuter

    // Update a lightweight landmark coordinate panel (0..1 normalized from MediaPipe)
    const to01 = (p) => ({ x: p?.x != null ? p.x.toFixed(2) : '-', y: p?.y != null ? p.y.toFixed(2) : '-', z: p?.z != null ? p.z.toFixed(2) : '-' })
    try {
      setFaceInfo({
        nose: to01(lm[1]),
        leftEar: to01(lm[234]),
        rightEar: to01(lm[454]),
        leftEye: to01(lm[33]),
        rightEye: to01(lm[263])
      })
      // Also update label positions (0..1, raw, not mirrored here since parent is mirrored)
      setLabelPos({
        nose: { x: lm[1]?.x ?? 0.5, y: lm[1]?.y ?? 0.5 },
        leftEar: { x: lm[234]?.x ?? 0.4, y: lm[234]?.y ?? 0.5 },
        rightEar: { x: lm[454]?.x ?? 0.6, y: lm[454]?.y ?? 0.5 },
        leftEye: { x: lm[33]?.x ?? 0.45, y: lm[33]?.y ?? 0.45 },
        rightEye: { x: lm[263]?.x ?? 0.55, y: lm[263]?.y ?? 0.45 },
      })
    } catch {}

    // Optional: update debug points and compute face bounding box
    if (or.debugPoints && or.debugPoints.visible) {
      const arr = or.debugPoints.geometry.attributes.position.array
      let minx = 1, miny = 1, maxx = 0, maxy = 0
      for (let i = 0; i < 468; i++) {
        const p = lm[i]
        const v = toVec3(p)
        arr[i*3+0] = v.x
        arr[i*3+1] = v.y
        arr[i*3+2] = v.z
        if (p) {
          if (p.x < minx) minx = p.x
          if (p.y < miny) miny = p.y
          if (p.x > maxx) maxx = p.x
          if (p.y > maxy) maxy = p.y
        }
      }
      or.debugPoints.geometry.attributes.position.needsUpdate = true
      if (Number.isFinite(minx) && Number.isFinite(miny) && Number.isFinite(maxx) && Number.isFinite(maxy)) {
        const pad = 0.03
        minx = Math.max(0, minx - pad)
        miny = Math.max(0, miny - pad)
        maxx = Math.min(1, maxx + pad)
        maxy = Math.min(1, maxy + pad)
        setFaceBox({ x: minx, y: miny, w: Math.max(0.02, maxx - minx), h: Math.max(0.02, maxy - miny) })
      }
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
  // Orientation basis without extra sign (mirroring handled by toVec3)
  let xAxis = rEyeOuter.clone().sub(lEyeOuter) // left-to-right
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

  // anchor by nose for neck, by ear for earrings, by nostril for nose ring
    if (preset.attach === 'neck'){
      // Anchor around neck line: start near nose but bias towards chin
      const neckAnchor = nose.clone().lerp(chin, 0.6)
      const targetPos = new THREE.Vector3(neckAnchor.x + preset.offset.x, neckAnchor.y + preset.offset.y, preset.offset.z)
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
        const rawS = THREE.MathUtils.clamp(dist3 * 3.2 * preset.scale, 0.35, 3)
  const kS = 1 - Math.pow(1 - 0.2, Math.max(1, dt*60))
  smoothRef.current.scale = THREE.MathUtils.lerp(smoothRef.current.scale || rawS, rawS, kS)
  or.model.scale.setScalar(smoothRef.current.scale)
      }
  } else if (preset.attach === 'ear'){
      // place near ear landmarks
      const left = lm[234]
      const right = lm[454]
      if (left){
  const vL = toVec3(left)
  // Nudge slightly toward face center using eye vector to reduce lateral drift
  const midEye = toVec3(lm[33]).clone().add(toVec3(lm[263])).multiplyScalar(0.5)
  const centerDir = midEye.clone().sub(vL).setZ(0)
  const nudge = centerDir.multiplyScalar(0.10) // 10% toward center
  const targetPos = new THREE.Vector3(vL.x + nudge.x + preset.offset.x, vL.y + nudge.y + preset.offset.y, preset.offset.z)
  const alpha = 0.22
  const k = 1 - Math.pow(1 - alpha, Math.max(1, dt*60))
  smoothRef.current.pos.lerp(targetPos, k)
  or.model.position.copy(smoothRef.current.pos)
      }
      if (left && right){
        const vL = toVec3(left)
        const vR = toVec3(right)
        const dist3 = vL.distanceTo(vR)
  // Smaller baseline for earrings so they look like studs by default
  let rawS = THREE.MathUtils.clamp(dist3 * 1.0 * preset.scale, 0.06, 0.6)
        rawS *= (sizeMul || 1)
  const kS = 1 - Math.pow(1 - 0.2, Math.max(1, dt*60))
  smoothRef.current.scale = THREE.MathUtils.lerp(smoothRef.current.scale || rawS, rawS, kS)
  or.model.scale.setScalar(smoothRef.current.scale)
      }
    } else if (preset.attach === 'nose'){
      // Place near left nostril area relative to head x-axis from eyes
  let xAxis = rEyeOuter.clone().sub(lEyeOuter)
      if (xAxis.lengthSq() < 1e-6) xAxis = new THREE.Vector3(1,0,0)
      xAxis.normalize()
      const base = nose.clone().add(xAxis.clone().multiplyScalar(0.08))
      const targetPos = new THREE.Vector3(base.x + preset.offset.x, base.y + preset.offset.y, preset.offset.z)
      const alpha = 0.22
      const k = 1 - Math.pow(1 - alpha, Math.max(1, dt*60))
      smoothRef.current.pos.lerp(targetPos, k)
      or.model.position.copy(smoothRef.current.pos)
      const vL = toVec3(lm[234] || lm[33])
      const vR = toVec3(lm[454] || lm[263])
      const dist3 = vL.distanceTo(vR)
  // Smaller baseline for nose rings
  let rawS = THREE.MathUtils.clamp(dist3 * (preset.scale || 1) * 0.9, 0.05, 0.35)
  rawS *= (sizeMul || 1)
      const kS = 1 - Math.pow(1 - 0.2, Math.max(1, dt*60))
      smoothRef.current.scale = THREE.MathUtils.lerp(smoothRef.current.scale || rawS, rawS, kS)
      or.model.scale.setScalar(smoothRef.current.scale)
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
      {/* Mirror video+canvas for selfie mode to match landmark coordinates */}
      <div style={{position:'absolute',inset:0,transform:'scaleX(-1)'}}>
        <video ref={videoRef} style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',pointerEvents:'none',zIndex:0}} autoPlay playsInline muted></video>
        <div ref={canvasRef} style={{position:'absolute',inset:0,pointerEvents:'none',zIndex:1}} />
      </div>
      <div style={{position:'absolute',top:'12px',left:'12px',pointerEvents:'auto',zIndex:2, display:'flex', gap:8}}>
        <button onClick={() => { onClose(); }} className="btn" aria-label="Close camera">Close Camera</button>
      </div>
      <div style={{position:'absolute',top:'60px',left:'12px',pointerEvents:'auto',zIndex:2}} className="card p-2">
        <div className="text-xs font-medium mb-1">Size</div>
        <input type="range" min={0.3} max={1.2} step={0.01} value={sizeMul} onChange={(e)=>setSizeMul(parseFloat(e.target.value))} style={{width:180}} />
      </div>
      {showLabels && (
        <div style={{position:'absolute',inset:0,transform:'scaleX(-1)',pointerEvents:'none',zIndex:2}}>
          {[
            { key:'nose', label:'Nose', pos:labelPos.nose },
            { key:'leftEye', label:'LEye', pos:labelPos.leftEye },
            { key:'rightEye', label:'REye', pos:labelPos.rightEye },
            { key:'leftEar', label:'LEar', pos:labelPos.leftEar },
            { key:'rightEar', label:'REar', pos:labelPos.rightEar },
          ].map(it => (
            <span key={it.key}
              style={{
                position:'absolute',
                left: `${(it.pos?.x ?? 0.5) * 100}%`,
                top: `${(it.pos?.y ?? 0.5) * 100}%`,
                transform:'translate(-50%, -120%)',
                background:'rgba(0,0,0,0.6)',
                color:'#fff',
                fontSize:12,
                padding:'2px 6px',
                borderRadius:6,
                whiteSpace:'nowrap'
              }}
            >{it.label}</span>
          ))}
        </div>
      )}
      {showGrid && (
        <div style={{position:'absolute',inset:0,transform:'scaleX(-1)',pointerEvents:'none',zIndex:2}}>
          <div
            style={{
              position:'absolute',
              left: `${faceBox.x * 100}%`,
              top: `${faceBox.y * 100}%`,
              width: `${faceBox.w * 100}%`,
              height: `${faceBox.h * 100}%`,
              border: '1px solid rgba(255,255,255,0.7)',
              boxShadow: '0 0 0 9999px rgba(0,0,0,0.0)',
              borderRadius: 6
            }}
          >
            {/* 3x3 grid lines */}
            <div style={{position:'absolute',left:'33.333%',top:0,bottom:0,width:1,background:'rgba(255,255,255,0.6)'}}></div>
            <div style={{position:'absolute',left:'66.666%',top:0,bottom:0,width:1,background:'rgba(255,255,255,0.6)'}}></div>
            <div style={{position:'absolute',top:'33.333%',left:0,right:0,height:1,background:'rgba(255,255,255,0.6)'}}></div>
            <div style={{position:'absolute',top:'66.666%',left:0,right:0,height:1,background:'rgba(255,255,255,0.6)'}}></div>
            {/* Center crosshair */}
            <div style={{position:'absolute',left:'50%',top:'50%',transform:'translate(-50%,-50%)',width:12,height:12,border:'1px solid rgba(255,255,255,0.75)',borderRadius:2}}></div>
          </div>
        </div>
      )}
      {/* Status chip (top-right) */}
      <div style={{position:'absolute',top:12,right:12,zIndex:2,pointerEvents:'none'}}>
        <div style={{display:'flex',alignItems:'center',gap:8,background:'rgba(17,17,17,0.7)',color:'#fff',padding:'6px 10px',borderRadius:9999,border:'1px solid rgba(255,255,255,0.12)',backdropFilter:'blur(6px)'}}>
          <span style={{display:'inline-block',width:8,height:8,borderRadius:9999,background:(()=>{
            if (status.startsWith('Tracking')) return '#16a34a' // green
            if (status.startsWith('No face')) return '#dc2626' // red
            if (status.startsWith('Loading')) return '#3b82f6' // blue
            return '#f59e0b' // amber for looking
          })()}} />
          <span style={{fontSize:12,opacity:0.95}}>{status}</span>
        </div>
      </div>
      {showCoords && (
        <div style={{position:'absolute',top:52,right:12,zIndex:2,pointerEvents:'auto'}} className="card p-2">
          <div className="text-xs font-medium mb-1">Face points (0–1)</div>
          <div className="text-xs text-slate-700">Nose: {faceInfo.nose.x}, {faceInfo.nose.y}</div>
          <div className="text-xs text-slate-700">LEar: {faceInfo.leftEar.x}, {faceInfo.leftEar.y}</div>
          <div className="text-xs text-slate-700">REar: {faceInfo.rightEar.x}, {faceInfo.rightEar.y}</div>
          <div className="text-xs text-slate-700">LEye: {faceInfo.leftEye.x}, {faceInfo.leftEye.y}</div>
          <div className="text-xs text-slate-700">REye: {faceInfo.rightEye.x}, {faceInfo.rightEye.y}</div>
        </div>
      )}
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
