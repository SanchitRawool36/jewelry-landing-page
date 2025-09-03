import React from 'react'

const quotes = [
  { q: 'The try-on felt magical—helped me choose the perfect pair!', a: 'Aarav K.' },
  { q: 'Shine and finish controls are brilliant for visualizing styles.', a: 'Meera S.' },
  { q: 'Loved the experience. Smooth and intuitive on mobile too.', a: 'Priya D.' },
]

export default function Testimonials(){
  return (
    <section className="px-4 md:px-8 py-16" style={{background:'#f7f3ea'}}>
      <h2 className="text-2xl font-semibold mb-6" style={{color:'#3a2a1a'}}>What customers say</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {quotes.map((t, i) => (
          <div key={i} className="card p-5 border border-[#e6dcc3]">
            <div className="text-slate-800">“{t.q}”</div>
            <div className="text-slate-600 text-sm mt-3">— {t.a}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
