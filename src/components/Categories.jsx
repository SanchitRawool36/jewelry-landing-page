import React from 'react'

const tiles = [
  { key: 'necklace', title: 'Necklaces', subtitle: 'Statement pieces' },
  { key: 'earrings', title: 'Earrings', subtitle: 'Everyday to bridal' },
  { key: 'pendants', title: 'Pendants', subtitle: 'Subtle elegance' }
]

export default function Categories({ onSelect }){
  return (
  <section className="relative px-4 md:px-8 py-16" style={{background:'#f7f3ea'}}>
      <div className="flex items-end justify-between mb-6">
        <h2 className="text-2xl font-semibold text-white">Explore Collections</h2>
        <a className="text-[#ccb755] hover:underline" href="#products">View all</a>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tiles.map(t => (
          <button
            key={t.key}
            className="relative rounded-xl overflow-hidden group h-40 md:h-56 text-left bg-white border border-[#e6dcc3]"
            onClick={() => onSelect?.(t.key)}
            style={{}}
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{background:'radial-gradient(circle at 70% 30%, rgba(203,178,106,0.18) 0%, transparent 60%)'}} />
            <div className="relative z-10 p-4">
              <div className="text-[#3a2a1a] text-lg font-medium">{t.title}</div>
              <div className="text-slate-700 text-sm">{t.subtitle}</div>
            </div>
          </button>
        ))}
      </div>
    </section>
  )
}
