import { useThree, useFrame } from '@react-three/fiber'
import { useEffect } from 'react'
import { Vector3 } from 'three'

export default function CameraController({ isMobile }){
  const { camera, gl } = useThree()
  const target = new Vector3(0,0,0)

  useEffect(()=>{
    // dynamic FOV on resize
    function update(){
      const w = window.innerWidth
      if(w < 600){ camera.fov = 48 }
      else if(w < 900){ camera.fov = 44 }
      else { camera.fov = 35 }
      camera.updateProjectionMatrix()
    }
    update()
    window.addEventListener('resize', update)
    return ()=>window.removeEventListener('resize', update)
  },[camera])

  // Do not manage pointer input here; OrbitControls handles rotation/zoom.

  useFrame(()=>{
    // keep looking at origin and clamp distance to avoid drifting out
    const dir = camera.position.clone().sub(target)
    const dist = dir.length()
    const clamped = Math.min(6, Math.max(1, dist))
    if (Math.abs(clamped - dist) > 1e-3) {
      dir.setLength(clamped)
      camera.position.copy(dir.add(target))
    }
    camera.lookAt(target)
  })

  return null
}
