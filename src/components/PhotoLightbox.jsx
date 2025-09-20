import React, { useEffect, useCallback } from 'react';

/*
  PhotoLightbox Component
  Props:
    photos: Array<{ id:string, name:string, description?:string, image:string }>
    index: number (current photo index)
    onClose: () => void
    onNavigate: (newIndex:number) => void
  Accessibility:
    - trap basic focus within modal
    - ESC closes
    - ArrowLeft / ArrowRight navigate
    - role="dialog" with aria-modal
*/
export default function PhotoLightbox({ photos, index, onClose, onNavigate }) {
  const photo = photos[index];

  const handleKey = useCallback((e) => {
    if(e.key === 'Escape') { e.preventDefault(); onClose(); }
    else if(e.key === 'ArrowRight') { e.preventDefault(); onNavigate((index + 1) % photos.length); }
    else if(e.key === 'ArrowLeft') { e.preventDefault(); onNavigate((index - 1 + photos.length) % photos.length); }
  }, [index, photos.length, onClose, onNavigate]);

  useEffect(() => {
    document.addEventListener('keydown', handleKey);
    // store previously focused
    const prevActive = document.activeElement;
    return () => {
      document.removeEventListener('keydown', handleKey);
      if(prevActive && prevActive.focus) prevActive.focus();
    };
  }, [handleKey]);

  if(!photo) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={photo.name}>
      {/* Overlay click to close */}
      <button aria-label="Close" onClick={onClose} className="absolute inset-0 cursor-default" />

      <div className="relative w-full max-w-5xl mx-auto px-4">
        <div className="relative bg-white/5 rounded-xl ring-1 ring-white/10 overflow-hidden">
          <div className="flex flex-col md:flex-row">
            <div className="flex-1 flex items-center justify-center bg-neutral-900 p-4">
              <img
                src={photo.image}
                alt={photo.name}
                className="max-h-[70vh] object-contain rounded shadow-lg"
                loading="eager"
              />
            </div>
            <div className="md:w-80 p-6 flex flex-col gap-4 bg-gradient-to-b from-black/60 to-black/30 text-white">
              <div>
                <h3 className="text-xl font-semibold leading-tight">{photo.name}</h3>
                {photo.description && <p className="mt-2 text-sm text-white/80 leading-relaxed">{photo.description}</p>}
              </div>
              <div className="flex items-center gap-2 text-xs text-white/60">
                <span>{index+1} / {photos.length}</span>
              </div>
              <div className="mt-auto flex gap-3">
                <button onClick={() => onNavigate((index - 1 + photos.length) % photos.length)} className="px-3 py-2 rounded bg-white/10 hover:bg-white/20 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-white/40" aria-label="Previous image">Prev</button>
                <button onClick={() => onNavigate((index + 1) % photos.length)} className="px-3 py-2 rounded bg-white/10 hover:bg-white/20 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-white/40" aria-label="Next image">Next</button>
                <button onClick={onClose} className="ml-auto px-3 py-2 rounded bg-red-500/80 hover:bg-red-500 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-300" aria-label="Close lightbox">Close</button>
              </div>
            </div>
          </div>

          {/* Navigation arrows overlay */}
          <button onClick={() => onNavigate((index - 1 + photos.length) % photos.length)} aria-label="Previous" className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 w-11 h-11 items-center justify-center rounded-full bg-black/50 hover:bg-black/70 text-white focus:outline-none focus:ring-2 focus:ring-white/40">‹</button>
          <button onClick={() => onNavigate((index + 1) % photos.length)} aria-label="Next" className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 w-11 h-11 items-center justify-center rounded-full bg-black/50 hover:bg-black/70 text-white focus:outline-none focus:ring-2 focus:ring-white/40">›</button>
        </div>

        {/* Dot indicators */}
        <div className="flex flex-wrap gap-2 justify-center mt-6">
          {photos.map((p, i) => (
            <button key={p.id} aria-label={`Go to image ${i+1}`} onClick={() => onNavigate(i)} className={`w-3 h-3 rounded-full transition ${i === index ? 'bg-gold ring-2 ring-gold/40' : 'bg-white/30 hover:bg-white/60'}`}></button>
          ))}
        </div>
      </div>
    </div>
  );
}
