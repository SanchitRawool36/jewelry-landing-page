import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-paper py-12 px-4">
      <div className="container mx-auto text-center text-gray-600">
  <p className="font-serif text-2xl mb-4">Aura Jewellers</p>
        <div className="flex justify-center space-x-6 mb-6">
          <a href="#products" className="hover:text-gold-dark transition-colors">Collection</a>
          <a href="#about" className="hover:text-gold-dark transition-colors">About</a>
          <a href="#contact" className="hover:text-gold-dark transition-colors">Contact</a>
        </div>
  <p className="text-sm">&copy; {new Date().getFullYear()} Aura Jewellers. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
