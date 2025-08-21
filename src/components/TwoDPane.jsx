import React, { useRef, useState, useEffect } from 'react'

export default function TwoDPane({ src, onClose }){
  const imgRef = useRef(null)
  const containerRef = useRef(null)
  const [state, setState] = useState({ x: 0, y: 0, scale: 1 })
  const [drag, setDrag] = useState(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    function onWheel(e) {
      e.preventDefault()
      const delta = -e.deltaY
      const factor = delta > 0 ? 1.1 : 0.9
      setState((s) => {
        const newScale = Math.min(5, Math.max(0.5, s.scale * factor))
        return { ...s, scale: newScale }
      })
    }
    function onDown(e) {
      const pt = e.touches ? e.touches[0] : e
      setDrag({ sx: pt.clientX, sy: pt.clientY, x: state.x, y: state.y })
    }
    function onMove(e) {
      if (!drag) return
      const pt = e.touches ? e.touches[0] : e
      const dx = pt.clientX - drag.sx
      const dy = pt.clientY - drag.sy
      setState((s) => ({ ...s, x: drag.x + dx, y: drag.y + dy }))
    }
    function onUp() { setDrag(null) }

    container.addEventListener('wheel', onWheel, { passive: false })
    container.addEventListener('mousedown', onDown)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    container.addEventListener('touchstart', onDown, { passive: false })
    container.addEventListener('touchmove', onMove, { passive: false })
    container.addEventListener('touchend', onUp)
    return () => {
      container.removeEventListener('wheel', onWheel)
      container.removeEventListener('mousedown', onDown)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
      container.removeEventListener('touchstart', onDown)
      container.removeEventListener('touchmove', onMove)
      container.removeEventListener('touchend', onUp)
    }
  }, [drag, state.x, state.y])

  return (
    <div ref={containerRef} className="absolute inset-0 bg-slate-100 overflow-hidden">
      <img
        ref={imgRef}
        src={src}
        alt="Snapshot"
        style={{
          transform: `translate(${state.x}px, ${state.y}px) scale(${state.scale})`,
          transformOrigin: 'center center'
        }}
        className="select-none pointer-events-none max-w-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        draggable={false}
      />
      <div className="absolute top-3 right-3 flex gap-2">
        <button onClick={onClose} className="btn btn-primary">Back to 3D</button>
        <a
          href={src}
          download="snapshot.png"
          className="btn"
        >Download</a>
      </div>
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-xs text-slate-600 bg-white/80 px-2 py-1 rounded">
        Tip: Scroll to zoom, drag to pan
      </div>
    </div>
  )
}
