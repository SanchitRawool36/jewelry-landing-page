import React, { Suspense, useState } from 'react'
import Navbar from './components/Navbar'
import GooeyNav from './components/GooeyNav'
import Viewer from './components/Viewer'
import AnnouncementBar from './components/AnnouncementBar'
import Hero from './components/Hero'
import Categories from './components/Categories'
import TrustBar from './components/TrustBar'
import AppointmentCTA from './components/AppointmentCTA'
import Testimonials from './components/Testimonials'
import Footer from './components/Footer'
import StoreLocator from './components/StoreLocator'
import GoldRateWidget from './components/GoldRateWidget'

export default function App(){
  const [product, setProduct] = useState(null)
  const products = [
    {
      id: 'nails',
      name: 'Nail Art (3D)',
      priceRs: 1000,
  envMapIntensity: 1.0,
  defaultFinish: 'polished',
  clearcoat: 0.7,
  clearcoatRoughness: 0.08,
  displayScale: 1.0,
  shadow: { scale: 2.5, opacity: 0.22 },
  description: '3D procedural nail set for previewing nail art concepts.',
  details: ['Finish: Glossy clearcoat', 'Adjustable length and shape', 'Great for demos'],
  src: { builtin: 'nails' }
    },
    {
      id: 'earrings-l1',
  name: 'Regal Teardrop Earrings',
  priceRs: 1000,
  envMapIntensity: 1.35,
  defaultFinish: 'polished',
  clearcoat: 0.65,
  clearcoatRoughness: 0.07,
  displayScale: 1.0,
  shadow: { scale: 3.2, opacity: 0.28 },
  description: 'Elegant earrings with reflective finish and fine detailing.',
  details: ['Material: Gold-tone alloy', 'Stones: Simulated diamonds', 'Weight: ~6g per pair'],
      src: {
        obj: '/3D%20models/Earings_v1_L1.123cd1ee0199-85f3-4569-a594-2d802e2d0baf/11763_earings_v1_L1.obj',
        mtl: '/3D%20models/Earings_v1_L1.123cd1ee0199-85f3-4569-a594-2d802e2d0baf/11763_earings_v1_L1.mtl'
      }
    },
    {
      id: 'earrings-l2',
  name: 'Rose Gold Halo Earrings',
  priceRs: 1000,
  envMapIntensity: 1.15,
  defaultFinish: 'satin',
  clearcoat: 0.35,
  clearcoatRoughness: 0.18,
  displayScale: 0.95,
  shadow: { scale: 2.8, opacity: 0.22 },
  description: 'Refined second-iteration earrings with subtle facets.',
  details: ['Material: Rose gold-tone alloy', 'Hypoallergenic posts', 'Finish: Satin'],
      src: {
        obj: '/3D%20models/Earings_v1_L2.123cc619898a-791f-410f-bf7a-ec5ea3d1a232/11757_Earings_v1_L2.obj',
        mtl: '/3D%20models/Earings_v1_L2.123cc619898a-791f-410f-bf7a-ec5ea3d1a232/11757_Earings_v1_L2.mtl'
      }
    },
    {
      id: 'necklace-l3',
  name: 'Queen Necklace',
  priceRs: 1000,
  envMapIntensity: 1.25,
  defaultFinish: 'polished',
  clearcoat: 0.7,
  clearcoatRoughness: 0.09,
  displayScale: 1.1,
  shadow: { scale: 4.2, opacity: 0.32 },
  description: 'Statement necklace with brilliant stone highlights.',
  details: ['Chain length: 45cm', 'Pendant: Center stone accent', 'Finish: Polished'],
      src: {
        obj: '/3D%20models/Necklace_v1_L3.123c0582a019-3350-40e7-aa33-bafa4404b441/11777_necklace_v1_l3.obj',
        mtl: '/3D%20models/Necklace_v1_L3.123c0582a019-3350-40e7-aa33-bafa4404b441/11777_necklace_v1_l3.mtl'
      }
    }
  ]

  return (
  <div className="min-h-screen w-full relative bg-white">
      {/* App Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
    <AnnouncementBar />
    <Navbar />
    <Hero onShopNow={() => document.querySelector('#products')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
      onTryNow={() => document.querySelector('.viewer-root')?.scrollIntoView({ behavior: 'smooth', block: 'start' })} />
        <main className="flex-1 flex items-stretch">
          <div className="min-h-screen relative w-full bg-black">
            {/* Soft Dark Yellow Glow only behind the 3D viewer */}
            <div
              className="absolute inset-0 z-0"
              style={{
                backgroundImage: 'radial-gradient(circle at center, #ccb755 0%, transparent 70%)',
                opacity: 0.6,
                mixBlendMode: 'screen',
                pointerEvents: 'none',
              }}
            />
            <div className="relative z-10">
              <Suspense fallback={<div className="p-6">Loading viewer...</div>}>
                <Viewer product={product} products={products} onSelect={setProduct} />
              </Suspense>
            </div>
          </div>
        </main>
  <Categories onSelect={(key)=> document.querySelector('#products')?.scrollIntoView({ behavior: 'smooth' })} />
  <TrustBar />
        {/* Sections for navbar anchors */}
        <section id="products" className="relative px-4 md:px-8 py-16 bg-black overflow-hidden">
          {/* Prismatic Aurora Burst - Multi-layered Gradient */}
          <div
            className="absolute inset-0 z-0"
            style={{
              background: `
                radial-gradient(ellipse 120% 80% at 70% 20%, rgba(255, 20, 147, 0.15), transparent 50%),
                radial-gradient(ellipse 100% 60% at 30% 10%, rgba(0, 255, 255, 0.12), transparent 60%),
                radial-gradient(ellipse 90% 70% at 50% 0%, rgba(138, 43, 226, 0.18), transparent 65%),
                radial-gradient(ellipse 110% 50% at 80% 30%, rgba(255, 215, 0, 0.08), transparent 40%),
                #000000
              `,
              pointerEvents: 'none',
            }}
          />
          <div className="relative z-10">
            <h2 className="text-2xl font-semibold mb-4 text-white">Products</h2>
            <p className="text-slate-300 mb-4">Explore our curated collection. Select a product above to view it in 3D and try it on.</p>
            <ul className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {products.map(p => (
                <li key={p.id} className="card p-4 flex flex-col gap-2">
                  <div className="font-medium">{p.name}</div>
                  {p.description && <div className="text-sm text-slate-600">{p.description}</div>}
                  <div className="flex items-center gap-2 mt-2">
                    <button className="btn" onClick={()=>setProduct(p)}>View</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="about" className="relative px-4 md:px-8 py-16 bg-black overflow-hidden">
          {/* Prismatic Aurora Burst - Multi-layered Gradient */}
          <div
            className="absolute inset-0 z-0"
            style={{
              background: `
                radial-gradient(ellipse 120% 80% at 70% 20%, rgba(255, 20, 147, 0.15), transparent 50%),
                radial-gradient(ellipse 100% 60% at 30% 10%, rgba(0, 255, 255, 0.12), transparent 60%),
                radial-gradient(ellipse 90% 70% at 50% 0%, rgba(138, 43, 226, 0.18), transparent 65%),
                radial-gradient(ellipse 110% 50% at 80% 30%, rgba(255, 215, 0, 0.08), transparent 40%),
                #000000
              `,
              pointerEvents: 'none',
            }}
          />
          <div className="relative z-10">
            <h2 className="text-2xl font-semibold mb-4 text-white">About</h2>
            <p className="max-w-3xl text-slate-300">We craft immersive 3D jewelry experiences. Try on pieces in real time using your camera, explore materials and finishes, and discover how each item feels before you buy.</p>
            <div className="mt-6" style={{ height: '220px', position: 'relative' }}>
              <GooeyNav
                items={[
                  { label: 'Products', href: '#products' },
                  { label: 'About', href: '#about' },
                  { label: 'Contact', href: '#contact' },
                ]}
                particleCount={12}
                particleDistances={[90, 10]}
                particleR={100}
                initialActiveIndex={1}
                animationTime={600}
                timeVariance={300}
                colors={[1,2,3,1,2,3,1,4]}
              />
            </div>
          </div>
        </section>

        <section id="contact" className="relative px-4 md:px-8 py-16 bg-black overflow-hidden">
          {/* Prismatic Aurora Burst - Multi-layered Gradient */}
          <div
            className="absolute inset-0 z-0"
            style={{
              background: `
                radial-gradient(ellipse 120% 80% at 70% 20%, rgba(255, 20, 147, 0.15), transparent 50%),
                radial-gradient(ellipse 100% 60% at 30% 10%, rgba(0, 255, 255, 0.12), transparent 60%),
                radial-gradient(ellipse 90% 70% at 50% 0%, rgba(138, 43, 226, 0.18), transparent 65%),
                radial-gradient(ellipse 110% 50% at 80% 30%, rgba(255, 215, 0, 0.08), transparent 40%),
                #000000
              `,
              pointerEvents: 'none',
            }}
          />
          <div className="relative z-10">
            <h2 className="text-2xl font-semibold mb-4 text-white">Contact</h2>
            <div className="grid gap-4 max-w-xl">
              <a className="btn" href="mailto:hello@example.com">Email: hello@example.com</a>
              <a className="btn" href="tel:+10000000000">Phone: +1 000 000 0000</a>
            </div>
          </div>
        </section>
  <GoldRateWidget />
  <StoreLocator />
  <AppointmentCTA />
  <Testimonials />
  <Footer />
      </div>
    </div>
  )
}
