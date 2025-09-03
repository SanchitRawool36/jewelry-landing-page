import React from 'react'

const items = [
  { t: 'BIS Hallmarked', s: 'Assured Purity' },
  { t: 'Free Shipping', s: 'Easy Returns' },
  { t: 'Lifetime Service', s: 'Cleaning & Polishing' },
  { t: 'Secure Payment', s: 'Multiple Options' },
]

export default function TrustBar(){
  return (
    <section className="bg-[#0d0d0d] text-white">
      <div className="px-4 md:px-8 py-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        {items.map((it, i) => (
          <div key={i} className="card p-4 bg-black/40 border border-white/10">
            <div className="text-[#ccb755] font-semibold">{it.t}</div>
            <div className="text-slate-400 text-sm">{it.s}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
