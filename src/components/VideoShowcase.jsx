import React, { useState, useEffect, useRef } from 'react';

// Public media paths (moved into public/media)
const VIDEO_SOURCES = [
  '/media/d02493b38a39fa1e6ba4186193956699_720w.mp4',
  '/media/855854-hd_1920_1080_24fps.mp4',
  '/media/86beec5fd6b4aa5cea866747326db3f8.mp4'
];

const ROTATE_MS = 14000; // 14s per video

const VideoShowcase = () => {
  const [index, setIndex] = useState(0);
  const [failedSet, setFailedSet] = useState(new Set());
  const [ready, setReady] = useState(false);
  const timerRef = useRef(null);

  // Advance index
  useEffect(()=>{
    timerRef.current && clearTimeout(timerRef.current);
    timerRef.current = setTimeout(()=>{
      setIndex(i => (i + 1) % VIDEO_SOURCES.length);
    }, ROTATE_MS);
    return ()=> timerRef.current && clearTimeout(timerRef.current);
  }, [index]);

  // If active video failed, jump ahead automatically
  useEffect(()=>{
    if (failedSet.has(VIDEO_SOURCES[index]) && failedSet.size < VIDEO_SOURCES.length){
      setIndex(i => (i + 1) % VIDEO_SOURCES.length);
    }
  }, [index, failedSet]);

  const handleError = (src) => {
    setFailedSet(prev => new Set([...prev, src]));
  };

  return (
    <section className="relative py-20 overflow-hidden">
      <div className="absolute inset-0">
        {VIDEO_SOURCES.map((src, i) => {
          const active = i === index && !failedSet.has(src);
          return (
            <video
              key={src}
              src={src}
              autoPlay={active}
              loop
              muted
              playsInline
              onCanPlay={()=> active && setReady(true)}
              onError={()=>handleError(src)}
              className={`absolute w-auto min-w-full min-h-full max-w-none top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-opacity duration-1000 ${active ? 'opacity-100' : 'opacity-0'} ${!ready && active ? 'blur-sm' : ''}`}
            />
          )
        })}
        {failedSet.size === VIDEO_SOURCES.length && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 text-white text-sm font-medium tracking-wide">
            All videos unavailable – static fallback.
          </div>
        )}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {VIDEO_SOURCES.map((src,i)=>(
            <button
              key={src}
              onClick={()=> setIndex(i)}
              className={`w-3 h-3 rounded-full border border-white/60 transition ${i===index ? 'bg-white' : 'bg-white/20 hover:bg-white/40'}`}
              aria-label={`Show video ${i+1}`}
            />
          ))}
        </div>
      </div>
      <div className="absolute inset-0 bg-black/60 z-5"></div>
      <div className="container mx-auto px-4 relative z-10 text-center text-white">
        <h2 className="text-4xl md:text-5xl font-serif mb-6">The Art of Craftsmanship</h2>
        <p className="text-lg max-w-3xl mx-auto mb-8">
          Every piece is a symphony of precision and passion. Witness the dedication that goes into creating your next family heirloom.
        </p>
        <button className="btn-primary">
          Discover Our Process
        </button>
      </div>
    </section>
  );
};

export default VideoShowcase;
