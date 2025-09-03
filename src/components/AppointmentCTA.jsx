import React from 'react'

export default function AppointmentCTA(){
  return (
    <section className="relative px-4 md:px-8 py-16 bg-black overflow-hidden">
      <div className="absolute inset-0" style={{background:'radial-gradient(800px 400px at 80% 30%, rgba(204,183,85,0.15), transparent 60%)'}} />
      <div className="relative z-10 card p-6 bg-black/40 border border-white/10">
        <div className="text-white text-xl font-semibold">Book a personalized consultation</div>
        <div className="text-slate-300 mt-1">In-store or virtual—our experts will help you pick the perfect piece.</div>
        <div className="mt-4 flex gap-3">
          <a className="btn btn-primary" href="#contact">Book Appointment</a>
          <a className="btn" href="#products">Browse Collections</a>
        </div>
      </div>
    </section>
  )
}
