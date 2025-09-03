import React from 'react'

export default function Footer(){
  return (
    <footer className="px-4 md:px-8 py-10 bg-black text-slate-300">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div>
          <div className="text-white font-semibold mb-2">Shop</div>
          <ul className="space-y-1 text-sm">
            <li><a href="#products" className="hover:underline">All Products</a></li>
            <li><a href="#products" className="hover:underline">Necklaces</a></li>
            <li><a href="#products" className="hover:underline">Earrings</a></li>
          </ul>
        </div>
        <div>
          <div className="text-white font-semibold mb-2">Support</div>
          <ul className="space-y-1 text-sm">
            <li><a href="#contact" className="hover:underline">Contact</a></li>
            <li><a href="#about" className="hover:underline">About</a></li>
            <li><a href="#" className="hover:underline">Shipping & Returns</a></li>
          </ul>
        </div>
        <div className="col-span-2">
          <div className="text-white font-semibold mb-2">Newsletter</div>
          <div className="flex gap-2">
            <input className="input flex-1" placeholder="Your email" />
            <button className="btn btn-primary">Subscribe</button>
          </div>
        </div>
      </div>
      <div className="mt-8 text-xs text-slate-500">© {new Date().getFullYear()} Your Brand. All rights reserved.</div>
    </footer>
  )
}
