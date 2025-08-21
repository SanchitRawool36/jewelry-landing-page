import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { PRESSETS } from './presets'

// TryOn: mounts a small Three.js overlay, uses MediaPipe FaceMesh to anchor a cloned model
export default function TryOn({ productId, sourceModel, onClose }){
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [running, setRunning] = useState(false)
  const overlayRef = useRef({ scene: null, camera: null, renderer: null, model: null, faceMesh: null, mpCamera: null })

  useEffect(()=>{
    let mounted = true
    if (!productId || !sourceModel) return
    (async ()=>{
      // dynamic import of MediaPipe scripts via CDN
      if (!window.FaceMesh) {
        await import('https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js')
        await import('https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js')
      }

      // start webcam
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false })
        if (!mounted) return
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      } catch (e) {
        console.warn('TryOn: camera start failed', e)
        return
      }

      // create small overlay renderer
      const width = videoRef.current.videoWidth || window.innerWidth
      const height = videoRef.current.videoHeight || window.innerHeight
      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
      renderer.setSize(width, height)
      renderer.setPixelRatio(Math.min(2, window.devicePixelRatio))
      canvasRef.current.appendChild(renderer.domElement)

      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(50, width/height, 0.1, 1000)
      camera.position.set(0,0,3)

      // clone provided model
      const cloned = sourceModel.clone(true)
      cloned.traverse(n=>{ if(n.isMesh){ n.castShadow = false; n.frustumCulled = false }})
      scene.add(cloned)

      // store overlay refs
      overlayRef.current = { scene, camera, renderer, model: cloned }

      // init face mesh
      const faceMesh = new window.FaceMesh.FaceMesh({locateFile: (f)=>`https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${f}`})
      faceMesh.setOptions({ maxNumFaces: 1, refineLandmarks: true, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5 })
      faceMesh.onResults((res)=>onFaceResults(res, productId))
      overlayRef.current.faceMesh = faceMesh

      const mpCamera = new window.Camera(videoRef.current, { onFrame: async ()=>{ await faceMesh.send({image: videoRef.current}) }, width: width, height: height })
      overlayRef.current.mpCamera = mpCamera
      mpCamera.start()

      setRunning(true)
      renderLoop()
    })()

    return ()=>{
      mounted = false
      // stop media and dispose
      const or = overlayRef.current
      if (or.mpCamera) or.mpCamera.stop()
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(t=>t.stop())
      }
      if (or.renderer) {
        or.renderer.dispose()
        if (or.renderer.domElement && canvasRef.current) canvasRef.current.removeChild(or.renderer.domElement)
      }
    }
  }, [productId, sourceModel])

  function onFaceResults(results, pid){
    const or = overlayRef.current
    if (!or || !or.model) return
    if (!results.multiFaceLandmarks || !results.multiFaceLandmarks[0]) return
    const lm = results.multiFaceLandmarks[0]
    const preset = PRESSETS[pid] || PRESSETS['necklace']

    // anchor by nose for neck, by ear for earrings
    if (preset.attach === 'neck'){
      const nose = lm[1]
      const x = (nose.x - 0.5) * 2
      const y = -(nose.y - 0.5) * 2
      or.model.position.set(x + preset.offset.x, y + preset.offset.y, preset.offset.z)
      // scale by relative face width (approx using ear or eye distance)
      const left = lm[234] || lm[33]
      const right = lm[454] || lm[263]
      if (left && right){
        const dist = Math.hypot(left.x - right.x, left.y - right.y)
        const s = THREE.MathUtils.clamp(dist * 3.5 * preset.scale, 0.4, 3)
        or.model.scale.setScalar(s)
      }
    } else if (preset.attach === 'ear'){
      // place near ear landmarks
      const left = lm[234]
      const right = lm[454]
      if (left){
        const x = (left.x - 0.5) * 2
        const y = -(left.y - 0.5) * 2
        or.model.position.set(x + preset.offset.x, y + preset.offset.y, preset.offset.z)
      }
      if (left && right){
        const dist = Math.hypot(left.x - right.x, left.y - right.y)
        const s = THREE.MathUtils.clamp(dist * 3.8 * preset.scale, 0.35, 2.5)
        or.model.scale.setScalar(s)
      }
    }
  }

  function renderLoop(){
    const or = overlayRef.current
    if (!or || !or.renderer) return
    requestAnimationFrame(renderLoop)
    if (or.model) or.model.rotation.y += 0.005
    or.renderer.render(or.scene, or.camera)
  }

  return (
    <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',pointerEvents:'none'}}>
      <video ref={videoRef} style={{position:'absolute',width:'100%',height:'100%',objectFit:'cover'}} autoPlay playsInline muted></video>
      <div ref={canvasRef} style={{position:'absolute',inset:0}} />
      <div style={{position:'absolute',top:12,left:12,pointerEvents:'auto'}}>
        <button onClick={() => { onClose(); }} className="btn">Close</button>
      </div>
    </div>
  )
}
