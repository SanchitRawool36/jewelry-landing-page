import React, { useRef, useEffect, useState, useMemo, Suspense } from 'react'
import * as THREE from 'three'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, Html, ContactShadows } from '@react-three/drei'
import Model from './Model'
import CameraController from './CameraController'
import TryOn from './TryOn'
import TryOnMindAR from './TryOnMindAR'
import { PRESSETS } from './presets'

function Loader(){
  return (
    <Html center>
      <div className="flex flex-col items-center gap-3">
        <div className="relative w-40 h-40 rounded-full overflow-hidden bg-gradient-to-br from-gray-300/40 to-gray-100/20">
          <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-white/40 to-transparent translate-x-[-100%] animate-[shimmer_1.4s_infinite]"></div>
        </div>
        <div className="text-xs tracking-wide text-gray-400 font-semibold">Preparing Model…</div>
        <style>{`@keyframes shimmer { 0% {transform:translateX(-100%);} 100% {transform:translateX(100%);} }`}</style>
      </div>
    </Html>
  )
}

export default function Viewer({ activeProduct, products, onSelect }){
  const [isMobile, setIsMobile] = useState(false)
  const [visible, setVisible] = useState(false)
  const containerRef = useRef(null)
  const [overlayOpen, setOverlayOpen] = useState(false)
  const [overlayModel, setOverlayModel] = useState(null)
  const [overlayProduct, setOverlayProduct] = useState(null)
  const [overlayFallback, setOverlayFallback] = useState(false)
  const [finish, setFinish] = useState('polished') // polished | satin | matte
  const [shine, setShine] = useState(1.2) // env intensity multiplier
  const [sheetOpen, setSheetOpen] = useState(false)
  const [envMode, setEnvMode] = useState('preset') // 'files' | 'preset'
  const envHdrPath = '/assets/env/studio_2k.hdr'
  const [perf, setPerf] = useState({ lastProduct: null, start: 0, end: 0, dur: 0, history: [], warn: false, rt: null, suggestGLB: false, median: 0 })
  const [showPerf, setShowPerf] = useState(false)

  useEffect(()=>{
    const mq = window.matchMedia('(max-width:900px)')
    const update = ()=>setIsMobile(mq.matches)
    update()
    mq.addEventListener('change', update)

    // IntersectionObserver for lazy init of Canvas
    const obs = new IntersectionObserver((entries)=>{
      entries.forEach(en=>{ if(en.isIntersecting) setVisible(true) })
    }, { root: null, threshold: 0.05 })
    if(containerRef.current) obs.observe(containerRef.current)

    return ()=>{ mq.removeEventListener('change', update); if(containerRef.current) obs.disconnect() }
  },[])

  // Prefer local HDRI if valid; fallback to preset if missing or malformed
  useEffect(() => {
    let cancelled = false
    async function probeHDR(url){
      try {
        const res = await fetch(url)
        if (!res.ok) return false
        const buf = await res.arrayBuffer()
        const bytes = new Uint8Array(buf.slice(0, 16))
        const header = Array.from(bytes).map(b=>String.fromCharCode(b)).join('')
        // Radiance .hdr files start with "#?RADIANCE" or similar
        return header.includes('#?RADIANCE') || header.includes('RADIANCE')
      } catch { return false }
    }
    probeHDR(envHdrPath).then(valid => { if (!cancelled) setEnvMode(valid ? 'files' : 'preset') })
    return () => { cancelled = true }
  }, [])

  const selected = useMemo(() => products.find(p => p.id === activeProduct), [products, activeProduct]);

  // Load persisted perf history once
  useEffect(()=>{
    try {
      const raw = sessionStorage.getItem('perfHistoryV1')
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) {
          setPerf(p=>({ ...p, history: parsed.slice(0,50) }))
        }
      }
    } catch {}
  },[])

  // Start timing when product changes and canvas visible
  useEffect(() => {
    if (!visible || !selected) return
    setPerf(p => ({ ...p, lastProduct: selected.id, start: performance.now(), end: 0, dur: 0 }))
  }, [selected?.id, visible])

  // When selection changes, adopt its defaults if provided
  useEffect(() => {
    if (!selected) return
    if (selected.defaultFinish) setFinish(selected.defaultFinish)
    if (selected.envMapIntensity) setShine(selected.envMapIntensity)
  }, [selected?.id])

  const isPhoto = selected && selected.productKind === 'photo';

  return (
    <div className="viewer-root flex flex-col lg:grid lg:grid-cols-3 gap-6 lg:gap-8" ref={containerRef} style={{position:'relative'}}>
      <div className="lg:col-span-2 h-[55vh] sm:h-[60vh] lg:h-[80vh] rounded-lg bg-paper shadow-inner relative order-1 flex items-center justify-center overflow-hidden">
        {isPhoto ? (
          selected?.image ? (
            <div className="w-full h-full flex items-center justify-center p-4">
              <img src={selected.image} alt={selected.name} className="max-h-full max-w-full object-contain rounded-lg shadow-md" loading="lazy" />
              <div className="absolute top-3 left-3 text-[11px] px-2 py-1 rounded bg-black/40 text-white tracking-wide">PHOTO</div>
            </div>
          ) : (
            <div className="text-xs text-gray-500">No image available.</div>
          )
        ) : visible ? (
          <Canvas
            shadows
            dpr={Math.min(2, window.devicePixelRatio)}
            camera={{ fov: isMobile ? 45 : 35, position: [0, 0, 3] }}
            gl={{
              physicallyCorrectLights: true,
              outputColorSpace: THREE.SRGBColorSpace,
              toneMapping: THREE.ACESFilmicToneMapping,
              toneMappingExposure: 1
            }}
          >
            <ambientLight intensity={0.5} />
            <directionalLight position={[5, 8, 4]} intensity={0.9} castShadow />
            <pointLight position={[-3, 2, 3]} intensity={0.6} />
            <pointLight position={[3, -1, -2]} intensity={0.5} />

            <Suspense fallback={<Loader />}>
              {envMode === 'files' ? (
                <Environment key="hdr-files" files={envHdrPath} background={false} blur={0.05} rotation={[0, Math.PI/4, 0]} />
              ) : (
                <Environment key="hdr-preset" preset="studio" background={false} blur={0.05} rotation={[0, Math.PI/4, 0]} />
              )}
              {/* Future GLB migration: once 3DM assets are converted, just point product.src to a .glb and remove Rhino fallback paths. */}
              <Model
                src={selected?.src}
                low={selected?.low}
                isMobile={isMobile}
                finish={finish}
                shine={shine}
                clearcoat={selected?.clearcoat}
                clearcoatRoughness={selected?.clearcoatRoughness}
                displayScale={selected?.displayScale}
                productId={selected?.id}
                onModelReady={(m) => {
                  setOverlayModel(m)
                  setPerf(p => {
                    const end = performance.now();
                    const dur = p.start ? end - p.start : 0;
                    const entry = { id: selected?.id, ms: Math.round(dur), at: Date.now() };
                    const history = [entry, ...p.history].slice(0, 50);
                    // Persist
                    try { sessionStorage.setItem('perfHistoryV1', JSON.stringify(history)) } catch {}
                    // Compute median
                    const sorted = history.map(h=>h.ms).slice().sort((a,b)=>a-b);
                    const mid = sorted.length ? (sorted[Math.floor(sorted.length/2)]) : 0;
                    const warn = dur > 2000;
                    // Resource Timing (best-effort)
                    let rt = null;
                    try {
                      // Normalize src which can be a string (stl/3dm) or an object (obj+mtl)
                      const rawSrc = selected?.src;
                      let canonicalSrc = '';
                      if (typeof rawSrc === 'string') {
                        canonicalSrc = rawSrc;
                      } else if (rawSrc && typeof rawSrc === 'object') {
                        canonicalSrc = rawSrc.obj || rawSrc.mtl || Object.values(rawSrc)[0] || '';
                      }
                      const lowerSrc = canonicalSrc.toLowerCase();
                      // pick last performance entry containing file name (after possible query param)
                      const fname = lowerSrc.split('/').pop().split('?')[0];
                      const entries = performance.getEntriesByType('resource').filter(e=> e.name.includes(fname));
                      if (entries.length) {
                        const e = entries[entries.length-1];
                        rt = {
                          transfer: Math.round(e.transferSize||0),
                          encoded: Math.round(e.encodedBodySize||0),
                          decoded: Math.round(e.decodedBodySize||0),
                          ttfb: e.responseStart - e.requestStart,
                          download: e.responseEnd - e.responseStart
                        }
                      }
                    } catch {}
                    // Reuse canonicalSrc for extension checks
                    const rawSrc2 = selected?.src;
                    let canonicalSrc2 = '';
                    if (typeof rawSrc2 === 'string') {
                      canonicalSrc2 = rawSrc2;
                    } else if (rawSrc2 && typeof rawSrc2 === 'object') {
                      canonicalSrc2 = rawSrc2.obj || rawSrc2.mtl || Object.values(rawSrc2)[0] || '';
                    }
                    const is3dm = canonicalSrc2.toLowerCase().endsWith('.3dm');
                    const suggestGLB = is3dm && dur > mid && history.length > 4; // after some baseline
                    return { ...p, end, dur, history, warn, rt, suggestGLB, median: mid };
                  })
                }}
              />
              <ContactShadows
                position={[0, -0.6, 0]}
                opacity={selected?.shadow?.opacity ?? 0.3}
                blur={2.5}
                scale={selected?.shadow?.scale ?? 6}
                far={3}
              />
            </Suspense>
            <OrbitControls
              enablePan={false}
              maxPolarAngle={Math.PI / 1.9}
              minDistance={1}
              maxDistance={4}
              target={[0, 0, 0]}
              enableDamping
              autoRotate={false}
              makeDefault
            />
            <CameraController isMobile={isMobile} />
          </Canvas>
        ) : <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">Initializing Viewer…</div>}
      </div>

      <div className="lg:col-span-1 p-4 order-2 w-full">
        {!isPhoto && (
          <div className="mb-6">
            <h3 className="text-2xl font-serif mb-4">Controls</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Finish</label>
                <div className="flex items-center gap-2 mt-1">
                  {['polished', 'satin', 'matte'].map((f) => (
                    <button
                      key={f}
                      onClick={() => setFinish(f)}
                      className={`px-4 py-2 text-sm rounded-md transition-colors ${finish === f ? 'bg-gold text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                    >
                      {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Shine</label>
                <input
                  type="range"
                  min="0.1"
                  max="2.5"
                  step="0.01"
                  value={shine}
                  onChange={(e) => setShine(parseFloat(e.target.value))}
                  className="w-full mt-1"
                />
              </div>
            </div>
          </div>
        )}
        <div className="mb-4 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <button onClick={()=>setShowPerf(s=>!s)} className="text-xs px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 transition-colors">{showPerf ? 'Hide' : 'Show'} Performance</button>
            {perf.dur > 0 && (
              <span className={`text-[11px] ${perf.warn ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>Last: {Math.round(perf.dur)} ms {perf.warn && ' (slow)'}</span>
            )}
          </div>
          {perf.suggestGLB && (
            <div className="text-[11px] leading-snug p-2 rounded bg-amber-50 border border-amber-300 text-amber-800">
              This 3DM model loaded slower than your median (~{perf.median} ms). Converting to GLB could improve performance. See MODEL_OPTIMIZATION.md.
            </div>
          )}
        </div>
        {showPerf && (
          <div className="mb-6 bg-white/70 backdrop-blur-sm rounded p-2 border border-gray-200 max-h-48 overflow-y-auto text-[11px] font-mono space-y-2">
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-gray-600">
              <span>Median: {perf.median} ms</span>
              {perf.rt && <span>DL: {Math.round(perf.rt.download)} ms</span>}
              {perf.rt && <span>TTFB: {Math.round(perf.rt.ttfb)} ms</span>}
              {perf.rt && perf.rt.transfer > 0 && <span>Transfer: {perf.rt.transfer} B</span>}
            </div>
            <div className="font-semibold">History (latest first)</div>
            <ul className="space-y-0.5">
              {perf.history.map(h => <li key={h.id + h.ms + h.at}>{h.id}: {h.ms} ms</li>)}
            </ul>
          </div>
        )}

        <h3 className="text-2xl font-serif mb-4">Our Products</h3>
  <div className="flex flex-col gap-4 max-h-[40vh] sm:max-h-[45vh] lg:max-h-[50vh] overflow-y-auto pr-1 sm:pr-2">
          {products.map(p => (
            <div 
              key={p.id} 
              className={`p-4 rounded-lg cursor-pointer transition-all duration-300 ${activeProduct === p.id ? 'bg-gold/20 shadow-md' : 'bg-paper hover:bg-gold/10'}`}
              onClick={() => onSelect(p.id)}
            >
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-lg">{p.name}</h4>
                <p className="font-sans text-gray-600">₹{p.priceRs.toLocaleString()}</p>
              </div>
              {p.productKind === 'photo' ? (
                <div className="mt-2 text-[11px] text-gray-500 flex items-center gap-1">
                  <span className="inline-block px-2 py-0.5 rounded bg-gray-300/40 text-gray-700">Photo Only</span>
                </div>
              ) : (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setOverlayProduct(p.id);
                    setOverlayOpen(true);
                  }} 
                  className="text-sm text-gold font-semibold mt-2"
                >
                  Try On
                </button>
              )}
              {p.id.endsWith('-ring') && (
                <div className="mt-2 text-[11px] leading-snug text-gray-500">
                  Face Try-On positions this ring relative to head landmarks. True hand try-on coming soon.
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      {!isPhoto && overlayOpen && (
        <TryOn
          productId={overlayProduct}
          sourceModel={overlayModel}
          onClose={() => setOverlayOpen(false)}
        />
      )}
    </div>
  )
}