import React from 'react'
import ShinyText from './ShinyText'

export default function Hero({ onShopNow, onTryNow }){
  return (
    <section className="relative overflow-hidden" style={{background:'#f7f3ea'}}>
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(1200px 600px at 70% 20%, rgba(204,183,85,0.18), transparent 60%)`,
          pointerEvents: 'none'
        }}
      />
      <div className="relative z-10 px-4 md:px-8 py-20 md:py-28 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <ShinyText className="text-4xl md:text-6xl font-semibold" baseColor="#3a2a1a">
            Timeless Elegance, Modern Shine
          </ShinyText>
          <p className="mt-4 text-slate-700 max-w-xl">
            Discover regal designs crafted to perfection. Explore finishes, adjust shine, and try them on—right from your screen.
          </p>
          <div className="mt-6 flex gap-3">
            <button className="btn btn-primary" onClick={onShopNow}>Shop Now</button>
            <button className="btn" onClick={onTryNow}>Try On</button>
          </div>
        </div>
        <div className="relative">
          <div className="absolute -inset-6 rounded-full opacity-30" style={{background:'radial-gradient(circle at 40% 40%, #ccb755 0%, transparent 60%)'}} />
          <div className="relative card p-6">
            <div className="text-sm text-slate-800">Preview in 3D • Finish & Shine Controls</div>
            <div className="mt-3 text-xs text-slate-600">Use the controls above the viewer to customize the look.</div>
          </div>
        </div>
      </div>
    </section>
  )
}
