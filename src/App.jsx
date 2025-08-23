import React, { Suspense, useState } from 'react'
import Navbar from './components/Navbar'
import Viewer from './components/Viewer'

export default function App(){
  const [product, setProduct] = useState(null)
  const products = [
    {
      id: 'nails',
      name: 'Nail Art (3D)',
      priceRs: 1000,
  envMapIntensity: 1.0,
  defaultFinish: 'polished',
      description: '3D procedural nail set for previewing nail art concepts.',
      details: ['Finish: Glossy clearcoat', 'Adjustable length and shape', 'Great for demos'],
      src: { builtin: 'nails' }
    },
    {
      id: 'earrings-l1',
      name: 'Earrings L1',
  priceRs: 1000,
  envMapIntensity: 1.35,
  defaultFinish: 'polished',
  description: 'Elegant earrings with reflective finish and fine detailing.',
  details: ['Material: Gold-tone alloy', 'Stones: Simulated diamonds', 'Weight: ~6g per pair'],
      src: {
        obj: '/3D%20models/Earings_v1_L1.123cd1ee0199-85f3-4569-a594-2d802e2d0baf/11763_earings_v1_L1.obj',
        mtl: '/3D%20models/Earings_v1_L1.123cd1ee0199-85f3-4569-a594-2d802e2d0baf/11763_earings_v1_L1.mtl'
      }
    },
    {
      id: 'earrings-l2',
      name: 'Earrings L2',
  priceRs: 1000,
  envMapIntensity: 1.15,
  defaultFinish: 'satin',
  description: 'Refined second-iteration earrings with subtle facets.',
  details: ['Material: Rose gold-tone alloy', 'Hypoallergenic posts', 'Finish: Satin'],
      src: {
        obj: '/3D%20models/Earings_v1_L2.123cc619898a-791f-410f-bf7a-ec5ea3d1a232/11757_Earings_v1_L2.obj',
        mtl: '/3D%20models/Earings_v1_L2.123cc619898a-791f-410f-bf7a-ec5ea3d1a232/11757_Earings_v1_L2.mtl'
      }
    },
    {
      id: 'necklace-l3',
      name: 'Necklace L3',
  priceRs: 1000,
  envMapIntensity: 1.25,
  defaultFinish: 'polished',
  description: 'Statement necklace with brilliant stone highlights.',
  details: ['Chain length: 45cm', 'Pendant: Center stone accent', 'Finish: Polished'],
      src: {
        obj: '/3D%20models/Necklace_v1_L3.123c0582a019-3350-40e7-aa33-bafa4404b441/11777_necklace_v1_l3.obj',
        mtl: '/3D%20models/Necklace_v1_L3.123c0582a019-3350-40e7-aa33-bafa4404b441/11777_necklace_v1_l3.mtl'
      }
    }
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-stretch">
        <div className="w-full">
          <Suspense fallback={<div className="p-6">Loading viewer...</div>}>
            <Viewer product={product} products={products} onSelect={setProduct} />
          </Suspense>
        </div>
      </main>
    </div>
  )
}
