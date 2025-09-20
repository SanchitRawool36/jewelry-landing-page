import React, { useRef, useEffect, useMemo, useState, useCallback } from 'react'
import { Html } from '@react-three/drei'
import { useGLTF } from '@react-three/drei'
import { useLoader } from '@react-three/fiber'
import * as THREE from 'three'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js'
import { Rhino3dmLoader } from 'three-stdlib';

function normalizeAndCenter(object, targetSize = 1.2){
  const box = new THREE.Box3().setFromObject(object)
  const size = box.getSize(new THREE.Vector3())
  const maxDim = Math.max(size.x, size.y, size.z)
  const scale = targetSize / maxDim
  object.scale.setScalar(scale)
  box.setFromObject(object)
  const center = box.getCenter(new THREE.Vector3())
  object.position.sub(center)
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
  if (typeof src === 'string' && src.toLowerCase().endsWith('.stl')) {
    return <STLModel src={src} isMobile={isMobile} onModelReady={onModelReady} finish={finish} shine={shine} clearcoat={clearcoat} clearcoatRoughness={clearcoatRoughness} displayScale={displayScale} />
  }
  if (src && typeof src === 'object' && src.builtin === 'nails') {
    return <NailsModel isMobile={isMobile} onModelReady={onModelReady} finish={finish} shine={shine} clearcoat={clearcoat} clearcoatRoughness={clearcoatRoughness} displayScale={displayScale} />
  }
  if (typeof src === 'string' && src.toLowerCase().endsWith('.3dm')) {
    return <RhinoModel src={src} isMobile={isMobile} onModelReady={onModelReady} finish={finish} shine={shine} clearcoat={clearcoat} clearcoatRoughness={clearcoatRoughness} displayScale={displayScale} />
  }
  return null
}

function GLBModel({ src, low, isMobile, onModelReady, finish = 'polished', shine = 1.2, clearcoat = 0.6, clearcoatRoughness = 0.08, displayScale = 1.0 }){
  const modelRef = useRef()
  const gltf = useGLTF(isMobile && low ? low : src)

  useEffect(() => {
    if (!gltf || !gltf.scene) return
    // Normalize and center once per model instance or device class change
    const scene = gltf.scene
    normalizeAndCenter(scene, (isMobile ? 0.6 : 0.9) * displayScale)
    if (onModelReady) onModelReady(scene)
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

function STLModel({ src, isMobile, onModelReady, finish = 'polished', shine = 1.2, clearcoat = 0.6, clearcoatRoughness = 0.08, displayScale = 1.0 }){
  const modelRef = useRef()
  const geom = useLoader(STLLoader, src)

  const { metalness, roughness } = finishParams(finish)

  const material = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#d4af37'), // Default gold-like color
    metalness,
    roughness,
    clearcoat,
    clearcoatRoughness,
    envMapIntensity: shine,
  }), [finish, shine, clearcoat, clearcoatRoughness, metalness, roughness]);

  useEffect(() => {
    if (!modelRef.current) return
    normalizeAndCenter(modelRef.current, (isMobile ? 0.6 : 0.9) * displayScale)
    if (onModelReady) onModelReady(modelRef.current)
  }, [geom, displayScale, isMobile])

  return (
    <mesh ref={modelRef} geometry={geom} material={material} castShadow receiveShadow />
  )
}

function RhinoModel({ src, isMobile, onModelReady, finish = 'polished', shine = 1.2, clearcoat = 0.6, clearcoatRoughness = 0.08, displayScale = 1.0 }) {
  const modelRef = useRef();
  const [error, setError] = useState(null); // { type, message }
  const [timedOut, setTimedOut] = useState(false);
  const [ready, setReady] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [preflightStatus, setPreflightStatus] = useState('pending'); // pending | ok | missing | network
  const [manualBlobUrl, setManualBlobUrl] = useState(null);
  const [fetchingManual, setFetchingManual] = useState(false);
  const [candidateIndex, setCandidateIndex] = useState(0);
  const candidates = useMemo(() => {
    const orig = src;
    let encoded;
    try {
      const u = new URL(orig, window.location.origin);
      encoded = u.pathname.split('/').map(seg => encodeURIComponent(decodeURIComponent(seg))).join('/');
    } catch {
      encoded = src.split('/').map(seg => encodeURIComponent(seg)).join('/');
    }
    const slugged = orig.replace(/\s+/g,'-');
    return Array.from(new Set([orig, encoded, slugged]));
  }, [src]);
  const activeSrc = candidates[candidateIndex] || src;

  // Preflight HEAD for existence when attempt changes
  useEffect(() => {
    let cancelled = false;
    setPreflightStatus('pending');
    // Diagnostic: log preflight
    // eslint-disable-next-line no-console
    console.log('[Rhino][preflight] HEAD', activeSrc);
    fetch(activeSrc, { method: 'HEAD' }).then(r => {
      if (cancelled) return;
      if (r.ok) setPreflightStatus('ok');
      else if (r.status === 404) setPreflightStatus('missing');
      else setPreflightStatus('network');
    }).catch(() => { if (!cancelled) setPreflightStatus('network'); });
    return () => { cancelled = true; };
  }, [activeSrc, attempt]);

  // Only attempt loader if preflight ok
  let rhinoObject = null;
  const effectiveSrc = manualBlobUrl || (activeSrc + `?v=${attempt}`);
  if (preflightStatus === 'ok' && !error) {
    try {
      rhinoObject = useLoader(Rhino3dmLoader, effectiveSrc, loader => {
        loader.setLibraryPath('/libs/');
      });
    } catch (e) {
      if (!error) {
        // eslint-disable-next-line no-console
        console.warn('[Rhino][loader] primary load error', e);
        setError({ type: 'load', message: e.message || 'Failed to load model' });
      }
    }
  }

  useEffect(() => {
    if (preflightStatus !== 'ok') return;
    const t = setTimeout(() => {
      if (!ready) setTimedOut(true);
    }, 8000);
    return () => clearTimeout(t);
  }, [ready, preflightStatus, attempt]);

  useEffect(() => {
    if (!rhinoObject || error) return;
    try {
      normalizeAndCenter(rhinoObject, (isMobile ? 0.6 : 0.9) * displayScale);
      if (onModelReady) onModelReady(rhinoObject);
      setReady(true);
      setTimedOut(false);
    } catch (e) {
      setError({ type: 'process', message: e.message || 'Failed processing model' });
    }
  }, [rhinoObject, displayScale, isMobile, error]);

  useEffect(() => {
    if (!rhinoObject || error) return;
    try {
      rhinoObject.traverse((c) => {
        if (c.isMesh) {
          c.material = new THREE.MeshPhysicalMaterial({
            color: '#d4af37',
            metalness: 1.0,
            roughness: 0.08,
            clearcoat,
            clearcoatRoughness,
            envMapIntensity: shine,
          });
          c.castShadow = true;
          c.receiveShadow = true;
        }
      });
    } catch (e) {
      setError({ type: 'material', message: e.message || 'Failed applying materials' });
    }
  }, [rhinoObject, finish, shine, clearcoat, clearcoatRoughness, error]);

  const retry = useCallback(() => {
    setError(null);
    setTimedOut(false);
    setReady(false);
    setAttempt(a => a + 1);
    setManualBlobUrl(null);
  }, []);

  const manualFetch = useCallback(async () => {
    if (fetchingManual) return;
    try {
      setFetchingManual(true);
      // eslint-disable-next-line no-console
  console.log('[Rhino][manual-fetch] start', activeSrc);
  const res = await fetch(activeSrc);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = await res.arrayBuffer();
      const blob = new Blob([buf], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      setManualBlobUrl(url);
      setError(null);
      setTimedOut(false);
      setReady(false);
      setAttempt(a => a + 1); // trigger re-load with blob
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('[Rhino][manual-fetch] failed', e);
      setError({ type: 'manual-fetch', message: e.message || 'Manual fetch failed' });
    } finally {
      setFetchingManual(false);
    }
  }, [activeSrc, fetchingManual]);

  useEffect(() => {
    if (preflightStatus === 'missing' && candidateIndex < candidates.length - 1) {
      console.warn('[Rhino][candidate] advancing', activeSrc, '->', candidates[candidateIndex+1]);
      setCandidateIndex(i => i + 1);
      setPreflightStatus('pending');
      setError(null);
    }
  }, [preflightStatus, candidateIndex, candidates, activeSrc]);

  const messageFromState = () => {
    if (error) return error.message;
    if (preflightStatus === 'missing') return 'Model file not found (404)';
    if (preflightStatus === 'network') return 'Network error fetching model';
    if (timedOut && !ready) return 'Loading is taking longer than expected';
    return 'Loading model...';
  };

  if (error || preflightStatus !== 'ok' || (timedOut && !ready)) {
    return (
      <group>
        <mesh>
          <boxGeometry args={[0.6,0.25,0.6]} />
          <meshStandardMaterial color={error ? '#b91c1c' : '#d97706'} emissive={error ? '#450a0a' : '#92400e'} emissiveIntensity={0.4} />
        </mesh>
        <Html center style={{ pointerEvents: 'auto' }}>
          <div style={{ background:'rgba(20,20,20,0.85)', padding:'10px 14px', borderRadius:8, maxWidth:200, fontSize:12, color:'#f5f5f5', textAlign:'center', fontFamily:'sans-serif' }}>
            <div style={{ marginBottom:6 }}>{messageFromState()}</div>
            <div style={{ display:'flex', gap:6, justifyContent:'center', flexWrap:'wrap' }}>
              <button onClick={retry} style={{ background:'#d4af37', color:'#222', fontWeight:600, padding:'4px 10px', borderRadius:4, border:'none', cursor:'pointer' }}>Retry</button>
              {preflightStatus === 'missing' && candidateIndex < candidates.length - 1 && (
                <button onClick={()=>setCandidateIndex(i=>i+1)} style={{ background:'#4b5563', color:'#fff', fontWeight:600, padding:'4px 10px', borderRadius:4, border:'none', cursor:'pointer' }}>Try Alt Path</button>
              )}
              {preflightStatus === 'ok' && !manualBlobUrl && (
                <button disabled={fetchingManual} onClick={manualFetch} style={{ background:'#926f1e', opacity:fetchingManual?0.7:1, color:'#fff', fontWeight:600, padding:'4px 10px', borderRadius:4, border:'none', cursor:'pointer' }}>{fetchingManual?'Fetching…':'Manual Fetch'}</button>
              )}
            </div>
          </div>
        </Html>
      </group>
    );
  }

  if (!rhinoObject) {
    return (
      <mesh rotation={[Math.PI/2,0,0]}>
        <ringGeometry args={[0.3,0.35,32]} />
        <meshBasicMaterial color="#d4af37" wireframe />
      </mesh>
    );
  }

  return <primitive ref={modelRef} object={rhinoObject} />;
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
