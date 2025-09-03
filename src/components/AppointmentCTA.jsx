import React from 'react'

export default function AppointmentCTA(){
  return (
    <section className="relative px-4 md:px-8 py-16 overflow-hidden" style={{background:'#f7f3ea'}}>
      <div className="relative z-10 card p-6 border border-[#e6dcc3]">
        <div className="text-[#3a2a1a] text-xl font-semibold">Book a personalized consultation</div>
        <div className="text-slate-700 mt-1">In-store or virtual—our experts will help you pick the perfect piece.</div>
        <div className="mt-4 flex gap-3">
          <a className="btn btn-primary" href="#contact">Book Appointment</a>
          <a className="btn" href="#products">Browse Collections</a>
        </div>
      </div>
    </section>
  )
}
