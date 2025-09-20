import React from 'react';
// Use public/media path (files were moved from /Videos to /public/media)
const HERO_VIDEO = '/media/855854-hd_1920_1080_24fps.mp4';

const Hero = () => {
  const scrollToProducts = () => {
    const productsSection = document.getElementById('products');
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative h-screen flex items-center justify-center text-center text-white overflow-hidden">
      <video 
        src={HERO_VIDEO}
        autoPlay 
        loop 
        muted 
        playsInline
        preload="auto"
        className="absolute z-0 w-auto min-w-full min-h-full max-w-none object-cover"
        aria-label="Hero background showcase video"
      />
      <div className="absolute inset-0 bg-black/50 z-5"></div>
      <div className="z-10 p-4">
        <h1 className="text-5xl md:text-7xl font-serif font-bold mb-4">
          Elegance in Motion
        </h1>
        <p className="text-lg md:text-xl max-w-2xl mx-auto mb-8">
          Discover timeless designs and see them come to life. Your next treasure awaits.
        </p>
        <button
          onClick={scrollToProducts}
          className="btn-primary text-lg"
        >
          Explore Now
        </button>
      </div>
    </section>
  );
};

export default Hero;
