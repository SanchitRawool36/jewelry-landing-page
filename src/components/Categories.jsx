import React from 'react';

const categories = [
  { name: 'Rings', image: '/Images/3fd34c6e-c170-4b0e-96ad-d06970451780.jpeg' },
  { name: 'Necklaces', image: '/Images/Gold Finish Jewellery Sets From \'Sparkle By….jpeg' },
  { name: 'Earrings', image: '/Images/Shoot for Dhruvi Jewellery on Behance.jpeg' },
];

const Categories = () => {
  return (
    <section className="py-20 px-4 bg-paper">
      <div className="container mx-auto">
        <h2 className="text-4xl font-serif text-center mb-12">Shop by Category</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.map((category) => (
            <div key={category.name} className="relative group overflow-hidden rounded-lg">
              <img src={category.image} alt={category.name} className="w-full h-80 object-cover transform group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                <h3 className="text-white text-3xl font-serif">{category.name}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;
