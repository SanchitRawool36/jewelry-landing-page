import React, { useEffect, useState } from 'react'

export default function GoldRateWidget(){
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [unit, setUnit] = useState('g') // 'g' | '10g'

  async function load(){
    setLoading(true); setError(null)
    try {
      const res = await fetch('/assets/gold-rate.json', { cache: 'no-store' })
      if (!res.ok) throw new Error('Failed to load')
      const json = await res.json()
      setData(json)
    } catch (e) {
      setError('Unable to fetch gold rates. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(()=>{ load() }, [])

  const toUnit = (v) => unit === '10g' ? v * 10 : v
  const fmt = (v) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: (data?.currency || 'INR'), maximumFractionDigits: 0 }).format(v)

  return (
    <section className="px-4 md:px-8 py-12" style={{background:'#f7f3ea', color:'#3a2a1a'}}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Gold rate today</h2>
        <div className="flex items-center gap-2">
          <div className="segmented" role="group" aria-label="Rate unit">
            {['g','10g'].map(u => (
              <button key={u} className="seg-btn" aria-pressed={unit===u} onClick={()=>setUnit(u)}>{u}</button>
            ))}
          </div>
          <button className="btn" onClick={load}>Refresh</button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4 border border-[#e6dcc3]">
          <div className="text-sm text-slate-700">24K ({unit})</div>
          <div className="text-xl font-semibold mt-1" style={{color:'#3a2a1a'}}>{loading ? '—' : (data ? fmt(toUnit(data.perGram['24k'])) : '—')}</div>
        </div>
        <div className="card p-4 border border-[#e6dcc3]">
          <div className="text-sm text-slate-700">22K ({unit})</div>
          <div className="text-xl font-semibold mt-1" style={{color:'#3a2a1a'}}>{loading ? '—' : (data ? fmt(toUnit(data.perGram['22k'])) : '—')}</div>
        </div>
        <div className="card p-4 border border-[#e6dcc3]">
          <div className="text-sm text-slate-700">Last updated</div>
          <div className="text-base mt-1 text-slate-800">{loading ? '—' : (data ? new Date(data.lastUpdated).toLocaleString() : '—')}</div>
          {error && <div className="text-xs text-red-600 mt-2">{error}</div>}
        </div>
      </div>
      <div className="text-xs text-slate-700 mt-3">Note: Rates are indicative. Contact store for final pricing.</div>
    </section>
  )
}
