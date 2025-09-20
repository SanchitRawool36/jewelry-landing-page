import React, { useMemo, useState } from 'react'

const STORES = [
  { name: 'Sawantwadi Heritage', city: 'Sindhudurg', address: 'Sawantwadi Market', lat: 15.9044, lng: 73.8215 },
  { name: 'Kudal Boutique', city: 'Sindhudurg', address: 'Kudal Market Road', lat: 16.0048, lng: 73.6793 },
  { name: 'Malvan Seaside', city: 'Sindhudurg', address: 'Malvan Bazaar', lat: 16.0598, lng: 73.4703 },
  { name: 'Vengurla Coast', city: 'Sindhudurg', address: 'Vengurla Town Center', lat: 15.8619, lng: 73.6322 },
  { name: 'Kankavli Center', city: 'Sindhudurg', address: 'Kankavli Main Road', lat: 16.2667, lng: 73.7000 },
  { name: 'Devgad Fort View', city: 'Sindhudurg', address: 'Devgad Market', lat: 16.3833, lng: 73.4000 },
]

export default function StoreLocator(){
  const [q, setQ] = useState('')
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return STORES
    return STORES.filter(st => `${st.name} ${st.city} ${st.address}`.toLowerCase().includes(s))
  }, [q])

  const mapsUrl = (lat, lng) => `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`

  return (
    <section className="px-4 md:px-10 py-20" style={{background:'#f7f3ea', color:'#3a2a1a'}} id="stores">
      <div className="max-w-7xl mx-auto">
        {/* Header / Search */}
        <div className="mb-10 grid gap-6 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-4">
            <h2 className="text-3xl md:text-4xl font-serif font-semibold tracking-tight">Find a Store</h2>
            <p className="mt-2 text-sm md:text-base text-[#6f5a44] max-w-sm">Search by city or area to locate your nearest Aura Jewellers boutique.</p>
          </div>
          <div className="lg:col-span-8">
            <div className="flex flex-col sm:flex-row gap-3 lg:justify-end">
              <div className="flex-1 flex gap-3">
                <div className="relative flex-1">
                  <input 
                    className="w-full rounded-md border border-[#e2d7be] bg-white/70 backdrop-blur-sm px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold transition"
                    placeholder="Search city or area" 
                    value={q} 
                    onChange={(e)=>setQ(e.target.value)}
                  />
                  {q && (
                    <button 
                      onClick={()=>setQ('')} 
                      className="absolute inset-y-0 right-2 my-auto h-7 px-2 text-[11px] rounded bg-[#e8dec9] hover:bg-gold/70 hover:text-white transition"
                    >Clear</button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Store Cards */}
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {filtered.map((st, i) => (
            <div
              key={`${st.name}-${i}-${filtered.length}`}
              style={{animationDelay: `${i * 60}ms`}}
              className="group relative rounded-xl border border-[#e6dcc3] bg-white/70 backdrop-blur-sm p-5 shadow-sm hover:shadow-lg transition-all duration-300 animate-storeCard"
            >
              <div className="absolute inset-0 rounded-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-white/0 via-white/20 to-gold/10" />
              <div className="relative">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-lg font-semibold tracking-tight text-[#3d2b18]">{st.name}</h3>
                </div>
                <div className="mt-1 text-sm text-[#6f5a44]">{st.address}, {st.city}</div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <a
                    className="inline-flex items-center gap-1 rounded-md bg-gold/90 text-white text-xs font-medium px-3 py-2 hover:bg-gold focus:outline-none focus:ring-2 focus:ring-gold/40 shadow-sm transition"
                    href={mapsUrl(st.lat, st.lng)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <span>Directions</span>
                  </a>
                  <a
                    className="inline-flex items-center gap-1 rounded-md border border-gold/40 bg-white/60 text-[#5a442d] text-xs font-medium px-3 py-2 hover:bg-gold/10 focus:outline-none focus:ring-2 focus:ring-gold/40 transition"
                    href="#contact"
                  >
                    Contact
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="mt-8 text-center text-sm text-[#6f5a44]">No stores match your search.</div>
        )}
      </div>
      {/* Local animation keyframes */}
      <style>{`
        @keyframes storeCardFadeSlide { 
          0% { opacity: 0; transform: translateY(12px) scale(.98); }
          60% { opacity: 1; }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-storeCard { 
          animation: storeCardFadeSlide .55s cubic-bezier(.22,.61,.36,1) both; 
        }
        @media (prefers-reduced-motion: reduce) { .animate-storeCard { animation: none !important; } }
      `}</style>
    </section>
  )
}
