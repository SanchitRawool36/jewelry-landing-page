import React from 'react';

// Resolve images through Vite bundler so they get hashed and deployed correctly
const imgRing = new URL('../../Images/3fd34c6e-c170-4b0e-96ad-d06970451780.jpeg', import.meta.url).href;
const imgNecklace = new URL("../../Images/Gold Finish Jewellery Sets From 'Sparkle By….jpeg", import.meta.url).href;
const imgEarrings = new URL('../../Images/Shoot for Dhruvi Jewellery on Behance.jpeg', import.meta.url).href;

const categories = [
  { name: 'Rings', image: imgRing },
  { name: 'Necklaces', image: imgNecklace },
  { name: 'Earrings', image: imgEarrings },
];

const fallbackSvg = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"><rect width="800" height="600" fill="%23f2eee6"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23998866" font-family="sans-serif" font-size="38">Image missing</text></svg>';

const Categories = () => {
  return (
    <section className="py-20 px-4 bg-paper">
      <div className="container mx-auto">
        <h2 className="text-4xl font-serif text-center mb-12">Shop by Category</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.map((category) => (
            <div key={category.name} className="relative group overflow-hidden rounded-lg">
              <img
                src={category.image}
                alt={category.name}
                width={800}
                height={600}
                loading="lazy"
                className="w-full h-80 object-cover transform group-hover:scale-110 transition-transform duration-500"
                onError={(e)=>{ e.currentTarget.src = fallbackSvg; }}
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <h3 className="text-white text-3xl font-serif tracking-wide drop-shadow-md">{category.name}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;
