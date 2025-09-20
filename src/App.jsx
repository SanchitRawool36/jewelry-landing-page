import React, { Suspense, useState } from 'react'
import Navbar from './components/Navbar'
import Viewer from './components/Viewer'
import AnnouncementBar from './components/AnnouncementBar'
import Hero from './components/Hero'
import Categories from './components/Categories'
import TrustBar from './components/TrustBar'
import AppointmentCTA from './components/AppointmentCTA'
import Footer from './components/Footer'
import StoreLocator from './components/StoreLocator'
import GoldRateWidget from './components/GoldRateWidget'
import Inspiration from './components/Inspiration'
import VideoShowcase from './components/VideoShowcase'
import PhotoLightbox from './components/PhotoLightbox'

export default function App(){
  const [activeProduct, setActiveProduct] = useState('earrings-l1');
  // Image assets (photo-only products) resolved via Vite for bundling
  // Use relative ../ to resolve from /src into top-level Images directory
  const imgSparkle = new URL("../Images/Gold Finish Jewellery Sets From 'Sparkle By….jpeg", import.meta.url).href;
  const imgImitation = new URL("../Images/Imitation jewellery is fashion jewellery and….jpeg", import.meta.url).href;
  const imgDhruvi = new URL("../Images/Shoot for Dhruvi Jewellery on Behance.jpeg", import.meta.url).href;
  const imgChoker = new URL("../Images/Shop online Kalyan latest trendy designs of Choker….jpeg", import.meta.url).href;
  const imgCloseup = new URL("../Images/Photo closeup of luxury jewellery _ Premium Photo….jpeg", import.meta.url).href;
  const imgA = new URL("../Images/3fd34c6e-c170-4b0e-96ad-d06970451780.jpeg", import.meta.url).href;
  const imgB = new URL("../Images/585b7876-6b97-4d85-923f-de3f7a200c0d.jpeg", import.meta.url).href;
  const imgC = new URL("../Images/953530f3-5596-47b3-b91b-7f44ead562f1.jpeg", import.meta.url).href;
  const placeholderImg = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%23f2eee6"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23998866" font-family="sans-serif" font-size="18">Image unavailable</text></svg>';
  const products = [
    {
      id: 'diamond-bracelet',
      name: 'Diamond Tennis Bracelet',
      priceRs: 55000,
      envMapIntensity: 1.5,
      defaultFinish: 'polished',
      clearcoat: 0.8,
      clearcoatRoughness: 0.05,
      displayScale: 1.0,
      shadow: { scale: 3.0, opacity: 0.3 },
      description: 'A timeless classic, this tennis bracelet features a continuous line of brilliant-cut diamonds.',
      details: ['Material: 14K White Gold', 'Diamonds: 5.0ct total weight', 'Clasp: Secure box clasp'],
      src: {
        obj: '/3D%20models/diamond_tennis_bracelet_v1_L2.123c38ac789e-e55e-4130-ac51-9ba7a979c263/13097_diamond_tennis_bracelet_v1_L2.obj',
        mtl: '/3D%20models/diamond_tennis_bracelet_v1_L2.123c38ac789e-e55e-4130-ac51-9ba7a979c263/13097_diamond_tennis_bracelet_v1_L2.mtl'
      }
    },
    {
      id: 'earrings-l1',
  name: 'Aura Teardrop Earrings',
      priceRs: 12000,
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
      priceRs: 15000,
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
      name: 'Queen Anne\'s Necklace',
      priceRs: 28000,
      envMapIntensity: 1.25,
      defaultFinish: 'polished',
      clearcoat: 0.7,
      clearcoatRoughness: 0.09,
      displayScale: 1.1,
      shadow: { scale: 4.2, opacity: 0.32 },
      description: 'A statement necklace with brilliant stone highlights, fit for royalty.',
      details: ['Chain length: 45cm', 'Pendant: Center stone accent', 'Finish: Polished'],
      src: {
        obj: '/3D%20models/Necklace_v1_L3.123c0582a019-3350-40e7-aa33-bafa4404b441/11777_necklace_v1_l3.obj',
        mtl: '/3D%20models/Necklace_v1_L3.123c0582a019-3350-40e7-aa33-bafa4404b441/11777_necklace_v1_l3.mtl'
      }
    },
    {
      id: 'alize-stud',
      name: 'Alize Stud',
      priceRs: 18000,
      envMapIntensity: 1.4,
      defaultFinish: 'polished',
      clearcoat: 0.9,
      clearcoatRoughness: 0.05,
      displayScale: 1.0,
      shadow: { scale: 3.0, opacity: 0.3 },
      description: 'A modern and elegant stud earring.',
      details: ['Material: Sterling Silver', 'Finish: High Polish'],
      src: '/3D%20models/AL1ZE-C1-ST01/AL1ZE-C1-ST01.stl'
    },
    {
      id: 'r3-cuff',
      name: 'R3 Cuff Ring',
      priceRs: 32000,
      envMapIntensity: 1.2,
      defaultFinish: 'satin',
      clearcoat: 0.5,
      clearcoatRoughness: 0.15,
      displayScale: 0.05,
      shadow: { scale: 3.5, opacity: 0.35 },
      description: 'A bold and stylish cuff ring.',
      details: ['Material: 18K Gold Plated', 'Adjustable size'],
      src: '/3D%20models/R3_CU_119/R3_CU_119.stl'
    },
    {
      id: 'erg-1769-ring',
      name: 'ERG-1769 Ring',
      priceRs: 45000,
      envMapIntensity: 1.3,
      defaultFinish: 'polished',
      clearcoat: 0.8,
      clearcoatRoughness: 0.05,
      displayScale: 1.0,
      shadow: { scale: 3.0, opacity: 0.3 },
      description: 'An intricate and beautiful ring.',
      details: ['Material: 14K Gold', 'Gemstone: Diamond'],
      src: '/3D%20models/1MG%20ring%20lot%209/ERG-1769.3dm'
    },
    {
      id: 'dr-6327-ring',
      name: 'DR-6327 Ring',
      priceRs: 62000,
      envMapIntensity: 1.4,
      defaultFinish: 'polished',
      clearcoat: 0.9,
      clearcoatRoughness: 0.05,
      displayScale: 1.0,
      shadow: { scale: 3.0, opacity: 0.3 },
      description: 'A stunning diamond ring.',
      details: ['Material: 18K White Gold', 'Center Stone: 1.5ct Diamond'],
      src: '/3D%20models/DR-6327/DR-6327.3dm'
    },
    {
      id: 'pr-074-ring',
      name: 'PR-074 Ring',
      priceRs: 38000,
      envMapIntensity: 1.2,
      defaultFinish: 'satin',
      clearcoat: 0.5,
      clearcoatRoughness: 0.15,
      displayScale: 1.0,
      shadow: { scale: 3.5, opacity: 0.35 },
      description: 'A classic and elegant ring.',
      details: ['Material: Yellow Gold', 'Band Style: Classic'],
      src: '/3D%20models/PR-074-Y1/PR-074-DIA.3dm'
    }
  ]
  // Separate gallery (photo-only products)
  const photoProducts = [
    { id: 'sparkle-set-photo', name: 'Sparkle Finish Set', priceRs: 21000, description: 'Gold finish jewellery ensemble with radiant reflective surfaces ideal for festive wear.', image: imgSparkle },
    { id: 'imitation-classic-photo', name: 'Classic Fashion Set', priceRs: 8500, description: 'Elegant imitation jewellery set blending everyday versatility with premium styling.', image: imgImitation },
    { id: 'dhruvi-editorial-photo', name: 'Editorial Showcase', priceRs: 14500, description: 'Statement editorial piece emphasizing bold silhouette and faceted brilliance.', image: imgDhruvi },
    { id: 'choker-trendy-photo', name: 'Regal Choker', priceRs: 17500, description: 'Trend-forward choker design with layered accents and royal presence.', image: imgChoker },
    { id: 'macro-closeup-photo', name: 'Macro Gem Cluster', priceRs: 9900, description: 'High clarity cluster composition – ideal for modern bridal or evening pairing.', image: imgCloseup },
    { id: 'assorted-a-photo', name: 'Assorted Style A', priceRs: 7600, description: 'Refined minimalist design focusing on clean contours and subtle shimmer.', image: imgA },
    { id: 'assorted-b-photo', name: 'Assorted Style B', priceRs: 7300, description: 'Lightweight adornment crafted for daily sophistication.', image: imgB },
    { id: 'assorted-c-photo', name: 'Assorted Style C', priceRs: 7900, description: 'Balanced geometry with polished facets and luminous warmth.', image: imgC }
  ];
  const [shine, setShine] = useState(0.8)
  // Lightbox state for photo gallery
  const [lightboxIndex, setLightboxIndex] = useState(null); // null = closed
  const openLightbox = (idx) => setLightboxIndex(idx);
  const closeLightbox = () => setLightboxIndex(null);
  const navigateLightbox = (idx) => setLightboxIndex(idx);

  return (
    <div className="font-sans bg-ivory text-gray-800">
      <div className="paper-overlay" style={{'--paper-overlay-opacity': 0.08}} />
      
      <AnnouncementBar />
      <Navbar />
      <main>
        <Hero />
        <Categories />
        <Inspiration />
        
        <section id="products" className="py-20 px-4">
          <div className="container mx-auto">
            <h2 className="text-4xl font-serif text-center mb-12">Our Collection</h2>
            <Viewer 
              activeProduct={activeProduct} 
              products={products} 
              onSelect={setActiveProduct} 
              shine={shine}
              onShineChange={setShine}
            />
          </div>
        </section>

        {/* Photo Gallery Section */}
        <section id="gallery" className="py-16 px-4 bg-paper/60">
          <div className="container mx-auto">
            <h2 className="text-3xl md:text-4xl font-serif text-center mb-10">Photo Showcase</h2>
            <p className="max-w-2xl mx-auto text-center text-sm md:text-base text-gray-600 mb-12">Curated pieces presented as high-quality photographs. These items are part of our extended catalog and will gain 3D & AR experiences in future updates.</p>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {photoProducts.map((p, i) => (
                <div key={p.id} className="group relative rounded-xl overflow-hidden bg-white border border-gold/20 shadow-sm hover:shadow-lg transition-all">
                  <button type="button" onClick={() => openLightbox(i)} className="aspect-[4/3] w-full bg-gradient-to-br from-gray-200/40 to-gray-100/20 flex items-center justify-center overflow-hidden relative focus:outline-none focus:ring-2 focus:ring-gold/40">
                    <img
                      src={p.image}
                      alt={p.name}
                      width="400"
                      height="300"
                      data-lqip="true"
                      className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500 lqip"
                      loading="lazy"
                      onLoad={(e)=>{ e.currentTarget.classList.add('lqip-loaded'); }}
                      onError={(e)=>{ e.currentTarget.src = placeholderImg; e.currentTarget.classList.add('lqip-loaded'); e.currentTarget.classList.remove('group-hover:scale-[1.04]'); }}
                    />
                    <div className="absolute top-2 left-2 text-[10px] tracking-wide px-2 py-1 rounded bg-black/40 text-white">PHOTO</div>
                    <span className="sr-only">Open {p.name} larger view</span>
                  </button>
                  <div className="p-4 flex flex-col gap-1">
                    <h3 className="font-semibold text-lg leading-tight">{p.name}</h3>
                    <div className="text-gold font-medium text-sm">₹{p.priceRs.toLocaleString()}</div>
                    <p className="text-xs text-gray-600 line-clamp-2">{p.description}</p>
                    <div className="mt-2 flex justify-between items-center text-[11px] text-gray-500">
                      <span>Catalog Item</span>
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity text-gold">Coming to 3D →</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <TrustBar />
        <AppointmentCTA />
        
        <VideoShowcase />

        <section id="about" className="py-20 px-4 bg-paper">
          <div className="container mx-auto text-center max-w-3xl">
            <h2 className="text-4xl font-serif mb-6">A Legacy of Brilliance</h2>
            <p className="text-lg leading-relaxed mb-4">
              For over three generations, Aura Jewellers has been synonymous with unparalleled craftsmanship and timeless design. We travel the world to source the finest materials, transforming them into extraordinary pieces that tell a story. Our commitment is to you, ensuring that every jewel that passes through our hands is a testament to beauty, quality, and a love that lasts forever.
            </p>
          </div>
        </section>

        <div className="grid md:grid-cols-2 gap-8 items-start container mx-auto py-12 px-4">
          <GoldRateWidget />
          <StoreLocator />
        </div>
        
      </main>

      <Footer />

      {lightboxIndex !== null && (
        <PhotoLightbox
          photos={photoProducts}
          index={lightboxIndex}
          onClose={closeLightbox}
          onNavigate={navigateLightbox}
        />
      )}
    </div>
  )
}
