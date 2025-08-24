import React from 'react'

// Usage:
// import ShinyText from './ShinyText'
// <ShinyText text="Just some shiny text!" disabled={false} speed={3} className="custom-class" />

export default function ShinyText({ text, disabled = false, speed = 5, className = '', baseColor = '#0b2545' }){
  const animationDuration = `${speed}s`
  return (
    <span
      className={`bg-clip-text inline-block ${disabled ? '' : 'animate-shine'} ${className}`}
      style={{
        color: baseColor,
        backgroundImage: 'linear-gradient(120deg, rgba(255, 255, 255, 0) 40%, rgba(255, 255, 255, 0.8) 50%, rgba(255, 255, 255, 0) 60%)',
        backgroundSize: '200% 100%',
        WebkitBackgroundClip: 'text',
        animationDuration,
      }}
    >
      {text}
    </span>
  )
}
