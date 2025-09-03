import React from 'react'
import ShinyText from './ShinyText'
import GooeyNav from './GooeyNav'

export default function Navbar(){
  return (
  <header className="sticky top-0 z-50 relative py-4 px-4 md:px-8 overflow-hidden bg-[#f7f3ea] border-b border-[#e6dcc3]">
      {/* Subtle Royal Glow */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: `radial-gradient(900px 400px at 80% 10%, rgba(203,178,106,0.25), transparent 60%)`,
          pointerEvents: 'none',
        }}
      />

      <div className="relative z-10">
        {/* Top row: brand and desktop nav */}
        <div className="flex items-center justify-between gap-4">
          <div className="font-bold text-lg">
            <ShinyText text="Aura Jewelers" speed={4} baseColor="#3a2a1a" />
          </div>
          <div className="hidden md:block">
            <div style={{ height: 64, display: 'flex', alignItems: 'center' }}>
              <GooeyNav
                items={[
                  { label: 'Products', href: '#products' },
                  { label: 'About', href: '#about' },
                  { label: 'Contact', href: '#contact' },
                ]}
                particleCount={12}
                particleDistances={[90, 10]}
                particleR={100}
                initialActiveIndex={0}
                animationTime={600}
                timeVariance={300}
                colors={[1,2,3,1,2,3,1,4]}
                className="light"
              />
            </div>
          </div>
          <div className="hidden md:block text-sm text-slate-700">Free shipping over 1000rs</div>
        </div>

        {/* Mobile full-width GooeyNav */}
    <div className="md:hidden w-full mt-3">
          <div style={{ height: 80, position: 'relative', borderRadius: 12, padding: '8px 12px' }}>
            <GooeyNav
              items={[
                { label: 'Products', href: '#products' },
                { label: 'About', href: '#about' },
                { label: 'Contact', href: '#contact' },
              ]}
              particleCount={10}
              particleDistances={[80, 10]}
              particleR={80}
              initialActiveIndex={0}
              animationTime={600}
              timeVariance={300}
      colors={[1,2,3,1,2,3,1,4]}
      className="light"
            />
          </div>
        </div>
      </div>
    </header>
  )
}
