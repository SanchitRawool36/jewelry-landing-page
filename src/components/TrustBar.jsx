import React from 'react'

const items = [
  { t: 'BIS Hallmarked', s: 'Assured Purity' },
  { t: 'Free Shipping', s: 'Easy Returns' },
  { t: 'Lifetime Service', s: 'Cleaning & Polishing' },
  { t: 'Secure Payment', s: 'Multiple Options' },
]

export default function TrustBar(){
  return (
    <section style={{background:'#f7f3ea'}}>
      <div className="px-4 md:px-8 py-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        {items.map((it, i) => (
          <div key={i} className="card p-4 border border-[#e6dcc3]">
            <div className="text-[#3a2a1a] font-semibold">{it.t}</div>
            <div className="text-slate-700 text-sm">{it.s}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
