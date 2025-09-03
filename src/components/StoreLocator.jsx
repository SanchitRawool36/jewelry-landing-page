import React, { useMemo, useState } from 'react'

const STORES = [
  { name: 'Main Bazaar', city: 'New Delhi', address: 'Connaught Place', lat: 28.6315, lng: 77.2167 },
  { name: 'Bandra West', city: 'Mumbai', address: 'Linking Road', lat: 19.0606, lng: 72.8365 },
  { name: 'MG Road', city: 'Bengaluru', address: 'MG Road', lat: 12.9738, lng: 77.6092 },
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
    <section className="px-4 md:px-8 py-16 bg-black text-white" id="stores">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Find a store</h2>
        <div className="flex gap-2">
          <input className="input" placeholder="Search city or area" value={q} onChange={(e)=>setQ(e.target.value)} />
          <button className="btn" onClick={()=>setQ('')}>Clear</button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filtered.map((st, i) => (
          <div key={i} className="card p-4 bg-black/40 border border-white/10">
            <div className="text-lg font-semibold">{st.name}</div>
            <div className="text-slate-300 text-sm">{st.address}, {st.city}</div>
            <div className="mt-3 flex gap-2">
              <a className="btn btn-primary" href={mapsUrl(st.lat, st.lng)} target="_blank" rel="noreferrer">Directions</a>
              <a className="btn" href="#contact">Contact</a>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
