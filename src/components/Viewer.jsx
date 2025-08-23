import React, { useRef, useEffect, useState, useMemo, Suspense } from 'react'
import * as THREE from 'three'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, Html, ContactShadows } from '@react-three/drei'
import Model from './Model'
import CameraController from './CameraController'
import TryOn from './TryOn'

function Loader(){
  return <Html center>Loading…</Html>
}

export default function Viewer({ product, products, onSelect }){
  const [isMobile, setIsMobile] = useState(false)
  const [visible, setVisible] = useState(false)
  const containerRef = useRef(null)
  const [overlayOpen, setOverlayOpen] = useState(false)
  const [overlayModel, setOverlayModel] = useState(null)
  const [overlayProduct, setOverlayProduct] = useState(null)
  const [finish, setFinish] = useState('polished') // polished | satin | matte
  const [shine, setShine] = useState(1.2) // env intensity multiplier
  const [sheetOpen, setSheetOpen] = useState(false)
  const [envMode, setEnvMode] = useState('preset') // 'files' | 'preset'
  const envHdrPath = '/assets/env/studio_2k.hdr'

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

  const selected = product || products[0]

  // When selection changes, adopt its defaults if provided
  useEffect(() => {
    if (!selected) return
    if (selected.defaultFinish) setFinish(selected.defaultFinish)
    if (selected.envMapIntensity) setShine(selected.envMapIntensity)
  }, [selected?.id])

  return (
    <div className="viewer-root" ref={containerRef} style={{position:'relative'}}>
  {visible ? (
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
            <Model
              src={selected?.src}
              low={selected?.low}
              isMobile={isMobile}
              finish={finish}
              shine={shine}
              productId={selected?.id}
              onModelReady={(m) => setOverlayModel(m)}
            />
            <ContactShadows position={[0, -0.6, 0]} opacity={0.3} blur={2.5} scale={6} far={3} />
          </Suspense>
          <OrbitControls
            enablePan={false}
            maxPolarAngle={Math.PI * 0.45}
            minDistance={1}
            maxDistance={6}
            target={[0, 0, 0]}
            enableDamping
            makeDefault
          />
          <CameraController isMobile={isMobile} />
        </Canvas>
      ) : (
        <div style={{height: '100%', display:'flex', alignItems:'center', justifyContent:'center'}}><div>Viewer will load when visible</div></div>
      )}

      {/* Desktop overlays: visible only on md+ to avoid covering model on phones */}
      <div className="hidden md:flex absolute left-3 top-4 flex-col md:flex-row gap-3 md:gap-4 z-20">
        <div className="card p-3 shadow-sm max-w-xs">
          <div className="font-semibold mb-1">Products</div>
          {products.map((p) => (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button onClick={() => onSelect(p)} className="btn btn-ghost w-full justify-start">
                {p.name}{p.priceRs ? ` — ${p.priceRs}rs` : ''}
              </button>
              <button onClick={() => { setOverlayProduct(p.id); setOverlayOpen(true) }} className="btn ml-2">Try</button>
            </div>
          ))}
        </div>

        {selected && (
          <div className="card p-3 shadow-sm max-w-sm">
            <div className="text-lg font-semibold flex items-center gap-2">
              <span>{selected.name}</span>
              {selected.priceRs ? (<span className="chip">{selected.priceRs}rs</span>) : null}
            </div>
            {selected.description && <div className="text-sm text-slate-600 mt-1">{selected.description}</div>}
            {selected.details && (
              <ul className="text-sm text-slate-700 list-disc pl-5 mt-2">
                {selected.details.map((d, i) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>
            )}
            <div className="mt-3">
              <div className="text-sm font-medium mb-1">Finish</div>
              <div className="segmented" role="group" aria-label="Finish">
                {['polished', 'satin', 'matte'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFinish(f)}
                    className="seg-btn"
                    aria-pressed={finish === f}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <div className="mt-3">
                <label className="text-sm font-medium">Shine</label>
                <input
                  type="range"
                  min="0.6"
                  max="2"
                  step="0.05"
                  value={shine}
                  onChange={(e) => setShine(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
                {/* Snapshot (2D) feature removed */}
            </div>
          </div>
        )}
      </div>

      {/* Mobile UI: a small button that opens a bottom sheet with products + details */}
      {isMobile && (
        <>
          <div className="md:hidden absolute left-3 top-4 z-20">
            <button className="btn" onClick={() => setSheetOpen(true)} aria-label="Open details">Details</button>
          </div>
          {sheetOpen && (
            <>
              <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setSheetOpen(false)} />
              <div className="sheet z-50">
                <div className="card p-3 shadow-sm max-w-full">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-semibold">Products & Details</div>
                    <button className="btn" onClick={() => setSheetOpen(false)}>Close</button>
                  </div>
                  <div className="flex flex-col gap-3">
                    <div>
                      <div className="font-semibold mb-1">Products</div>
                      {products.map((p) => (
                        <div key={p.id} className="flex items-center gap-2">
                          <button onClick={() => { onSelect(p); }} className="btn btn-ghost w-full justify-start">
                            {p.name}{p.priceRs ? ` — ${p.priceRs}rs` : ''}
                          </button>
                          <button onClick={() => { setOverlayProduct(p.id); setOverlayOpen(true); }} className="btn">Try</button>
                        </div>
                      ))}
                    </div>
                    {selected && (
                      <div>
                        <div className="text-lg font-semibold flex items-center gap-2">
                          <span>{selected.name}</span>
                          {selected.priceRs ? (<span className="chip">{selected.priceRs}rs</span>) : null}
                        </div>
                        {selected.description && <div className="text-sm text-slate-600 mt-1">{selected.description}</div>}
                        {selected.details && (
                          <ul className="text-sm text-slate-700 list-disc pl-5 mt-2">
                            {selected.details.map((d, i) => (
                              <li key={i}>{d}</li>
                            ))}
                          </ul>
                        )}
                        <div className="mt-3">
                          <div className="text-sm font-medium mb-1">Finish</div>
                          <div className="segmented" role="group" aria-label="Finish">
                            {['polished', 'satin', 'matte'].map((f) => (
                              <button
                                key={f}
                                onClick={() => setFinish(f)}
                                className="seg-btn"
                                aria-pressed={finish === f}
                              >
                                {f}
                              </button>
                            ))}
                          </div>
                          <div className="mt-3">
                            <label className="text-sm font-medium">Shine</label>
                            <input
                              type="range"
                              min="0.6"
                              max="2"
                              step="0.05"
                              value={shine}
                              onChange={(e) => setShine(parseFloat(e.target.value))}
                              className="w-full"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      )}

      {overlayOpen && overlayModel && (
        <TryOn productId={overlayProduct} sourceModel={overlayModel} onClose={()=>setOverlayOpen(false)} />
      )}
    </div>
  )
}
