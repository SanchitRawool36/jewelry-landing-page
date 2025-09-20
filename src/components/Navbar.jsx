import React, { useState } from 'react';
import ShinyText from './ShinyText';

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const navItems = [
    { label: 'Home', href: '#' },
    { label: 'Products', href: '#products' },
    { label: 'About', href: '#about' },
    { label: 'Contact', href: '#contact' },
  ];

  return (
    <header className="sticky top-0 left-0 right-0 z-[100] bg-ivory/80 backdrop-blur-sm border-b border-gold/20 text-gray-800 shadow-md">
      <div className="container mx-auto flex items-center justify-between p-4">
        <div className="text-2xl md:text-3xl font-serif font-bold leading-tight max-w-[60%] md:max-w-none">
          <ShinyText text="Aura Jewellers" baseColor="#4A4A4A" shineColor="#D4AF37" />
        </div>
        <nav className="hidden sm:block">
          <ul className="flex space-x-6">
            {navItems.map((item) => (
              <li key={item.label}>
                <a href={item.href} className="font-sans hover:text-gold transition-colors duration-300">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <button
          className="sm:hidden px-3 py-2 rounded border border-gold/40 text-sm focus:outline-none focus:ring-2 focus:ring-gold/60"
          aria-label="Menu"
          aria-expanded={open}
          onClick={() => setOpen(o=>!o)}
        >
          {open ? 'Close' : 'Menu'}
        </button>
      </div>
      {/* Mobile menu panel */}
      <div
        className={`sm:hidden overflow-hidden transition-[max-height] duration-300 ease-in-out bg-ivory/95 border-t border-gold/20 ${open ? 'max-h-64' : 'max-h-0'}`}
      >
        <ul className="flex flex-col py-2 px-4 gap-1">
          {navItems.map(item => (
            <li key={item.label}>
              <a
                href={item.href}
                className="block w-full px-3 py-2 rounded text-sm font-sans hover:bg-gold/10 active:bg-gold/20"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
};

export default Navbar;
