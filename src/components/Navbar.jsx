import React, {useState} from 'react'

export default function Navbar(){
  const [open, setOpen] = useState(false)
  return (
  <header className="bg-white shadow-sm py-4 px-4 md:px-8 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="font-bold text-lg">Aura Jewelers</div>
        <nav className="hidden md:flex gap-4 text-sm text-slate-700">
          <a href="#" className="hover:underline">Products</a>
          <a href="#" className="hover:underline">About</a>
          <a href="#" className="hover:underline">Contact</a>
        </nav>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden md:block text-sm text-slate-600">Free shipping over $100</div>
        <button className="md:hidden btn btn-ghost p-2" onClick={()=>setOpen(v=>!v)} aria-label="menu">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M4 6h16M4 12h16M4 18h16" stroke="#0b2545" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      </div>

      {/* mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 bg-black/40">
          <div className="absolute right-0 top-0 card w-64 h-full p-4">
            <button className="btn mb-4" onClick={()=>setOpen(false)}>Close</button>
            <nav className="flex flex-col gap-3 text-slate-700">
              <a className="btn btn-ghost justify-start" href="#">Products</a>
              <a className="btn btn-ghost justify-start" href="#">About</a>
              <a className="btn btn-ghost justify-start" href="#">Contact</a>
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}
