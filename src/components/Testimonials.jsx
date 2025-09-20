import React from 'react';

const testimonials = [
  {
    quote: "The virtual try-on is a game-changer! I found the perfect necklace without leaving my home. The quality is exceptional.",
    name: 'Jessica L.',
    location: 'New York, NY'
  },
  {
    quote: "I was hesitant to buy fine jewelry online, but the attention to detail and customer service were outstanding. My ring is a dream.",
    name: 'David M.',
    location: 'London, UK'
  },
  {
    quote: "A truly luxurious experience from start to finish. The craftsmanship is evident in every facet of my earrings.",
    name: 'Priya K.',
    location: 'Mumbai, IN'
  }
];

const Testimonials = () => {
  return (
    <section className="py-20 px-4 bg-ivory">
      <div className="container mx-auto">
        <h2 className="text-4xl font-serif text-center mb-12">Client Testimonials</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-paper p-8 rounded-lg shadow-sm">
              <p className="text-lg italic mb-6">"{testimonial.quote}"</p>
              <p className="font-bold font-serif text-gold-dark">{testimonial.name}</p>
              <p className="text-sm text-gray-500">{testimonial.location}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
