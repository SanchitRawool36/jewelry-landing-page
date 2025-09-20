import React from 'react';
import modelImage from '/Images/Model_placeholder/design.jpeg';

const Inspiration = () => {
  return (
    <section className="py-16 bg-paper">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
          <div className="md:w-1/2">
            <img 
              src={modelImage} 
              alt="Model wearing elegant jewelry" 
              className="rounded-lg shadow-2xl w-full h-auto object-cover"
              style={{ maxHeight: '600px' }}
            />
          </div>
          <div className="md:w-1/2 text-center md:text-left">
            <h2 className="text-4xl md:text-5xl font-serif text-gray-800 mb-4">
              Find Your Signature Look
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              Explore our curated collections and find the perfect piece that speaks to your unique style. From timeless classics to modern statements, each design is crafted to inspire.
            </p>
            <button className="btn-primary">
              Explore Collections
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Inspiration;
