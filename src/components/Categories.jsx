import React from 'react'

const tiles = [
  { key: 'necklace', title: 'Necklaces', subtitle: 'Statement pieces', bg: 'linear-gradient(135deg, #1a1a1a, #0d0d0d)' },
  { key: 'earrings', title: 'Earrings', subtitle: 'Everyday to bridal', bg: 'linear-gradient(135deg, #1a1a1a, #0b0b0b)' },
  { key: 'pendants', title: 'Pendants', subtitle: 'Subtle elegance', bg: 'linear-gradient(135deg, #1a1a1a, #0a0a0a)' }
]

export default function Categories({ onSelect }){
  return (
    <section className="relative px-4 md:px-8 py-16 bg-black">
      <div className="flex items-end justify-between mb-6">
        <h2 className="text-2xl font-semibold text-white">Explore Collections</h2>
        <a className="text-[#ccb755] hover:underline" href="#products">View all</a>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tiles.map(t => (
          <button
            key={t.key}
            className="relative rounded-xl overflow-hidden group h-40 md:h-56 text-left"
            onClick={() => onSelect?.(t.key)}
            style={{ background: t.bg }}
          >
            <div className="absolute inset-0 opacity-30 group-hover:opacity-50 transition-opacity" style={{background:'radial-gradient(circle at 70% 30%, #ccb755 0%, transparent 60%)'}} />
            <div className="relative z-10 p-4">
              <div className="text-white text-lg font-medium">{t.title}</div>
              <div className="text-slate-400 text-sm">{t.subtitle}</div>
            </div>
          </button>
        ))}
      </div>
    </section>
  )
}
