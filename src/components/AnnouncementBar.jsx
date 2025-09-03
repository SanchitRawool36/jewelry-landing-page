import React from 'react'

export default function AnnouncementBar(){
  return (
    <div className="w-full bg-[#111] text-[#ccb755] text-sm px-4 md:px-8 py-2 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span>Free Shipping & Easy Returns</span>
        <span className="hidden md:inline opacity-60">•</span>
        <span className="hidden md:inline">BIS Hallmarked • Lifetime Service</span>
      </div>
      <div className="hidden md:block opacity-90">Gold Rate Today • EMI Available</div>
    </div>
  )
}
