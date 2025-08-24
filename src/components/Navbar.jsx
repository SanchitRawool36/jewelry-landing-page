import React from 'react'
import ShinyText from './ShinyText'
import GooeyNav from './GooeyNav'

export default function Navbar(){
  return (
  <header className="sticky top-0 z-50 relative py-4 px-4 md:px-8 overflow-hidden bg-black border-b border-white/10">
      {/* Prismatic Aurora Burst - Multi-layered Gradient */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: `
            radial-gradient(ellipse 120% 80% at 70% 20%, rgba(255, 20, 147, 0.15), transparent 50%),
            radial-gradient(ellipse 100% 60% at 30% 10%, rgba(0, 255, 255, 0.12), transparent 60%),
            radial-gradient(ellipse 90% 70% at 50% 0%, rgba(138, 43, 226, 0.18), transparent 65%),
            radial-gradient(ellipse 110% 50% at 80% 30%, rgba(255, 215, 0, 0.08), transparent 40%),
            #000000
          `,
          pointerEvents: 'none',
        }}
      />

      <div className="relative z-10">
        {/* Top row: brand and desktop nav */}
        <div className="flex items-center justify-between gap-4">
          <div className="font-bold text-lg">
            <ShinyText text="Aura Jewelers" speed={4} baseColor="#ffffff" />
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
              />
            </div>
          </div>
          <div className="hidden md:block text-sm text-slate-300">Free shipping over 1000rs</div>
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
            />
          </div>
        </div>
      </div>
    </header>
  )
}
