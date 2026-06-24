import { Star } from "lucide-react";
import { motion } from 'framer-motion';
import SectionHeader from './SectionHeader';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const testimonials = [
  {
    name: "Rohit Sharma",
    role: "Verified Buyer",
    text: "The pure, unadulterated taste of tradition. This Sattu has become my daily ritual for natural energy and gut health.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&h=200&auto=format&fit=crop"
  },
  {
    name: "Ananya Verma",
    role: "Verified Buyer",
    text: "Perfect for the hot Indian climate. It keeps me hydrated and full for hours. Absolutely world-class quality.",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&h=200&auto=format&fit=crop"
  },
  {
    name: "Karan Patel",
    role: "Fitness Enthusiast",
    text: "As a fitness professional, I value raw potency. This is the cleanest protein source I've ever integrated into my diet.",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&h=200&auto=format&fit=crop"
  },
  {
    name: "Meera Iyer",
    role: "Health Coach",
    text: "Finally, a brand that respects Vedic production methods. The stone-ground quality is evident in every single sip.",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&h=200&auto=format&fit=crop"
  }
];

const Testimonials = () => {
  return (
    <section 
      className="py-24 relative overflow-hidden bg-[#FDFBF7]"
    >
      {/* ---------- RESPONSIVE BACKGROUND IMAGES ---------- */}
      {/* Mobile background (visible only on screens < 768px) */}
      <div 
        className="absolute inset-0 opacity-[0.9] pointer-events-none block md:hidden"
        style={{ 
          backgroundImage: "url('https://res.cloudinary.com/duzwys877/image/upload/v1782295023/WhatsApp_Image_2026-06-24_at_15.26.25_wak18c.jpg')",  // ← Replace with your mobile image path
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'sepia(30%) brightness(1.1)'
        }} 
      />

      {/* Desktop background (visible only on screens >= 768px) */}
      <div 
        className="absolute inset-0 opacity-[0.9] pointer-events-none hidden md:block"
        style={{ 
          backgroundImage: "url('https://res.cloudinary.com/duzwys877/image/upload/v1782294871/b2_o8oxcn.png')", // ← Replace with your desktop image path
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'sepia(30%) brightness(1.1)'
        }} 
      />

      {/* SUBTLE GRAIN OVERLAY (kept common for both) */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/p6-grain.png')]" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        
        <SectionHeader 
          title="Trusted by Thousands" 
          subtitle="Real Stories • Pure Satisfaction"
        />

        <div className="relative px-4 sm:px-12">
          <Swiper
            modules={[Autoplay, Pagination, Navigation]}
            spaceBetween={30}
            slidesPerView={1}
            navigation={{
              nextEl: '.testimonial-next',
              prevEl: '.testimonial-prev',
            }}
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            pagination={{ clickable: true, el: '.testimonial-pagination' }}
            breakpoints={{
              768: { slidesPerView: 2 },
              1200: { slidesPerView: 3 },
            }}
            className="overflow-visible"
          >
            {testimonials.map((item, index) => (
              <SwiperSlide key={index}>
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  className="relative h-[480px] flex flex-col items-center justify-center group"
                >
                  {/* THE IMPERIAL ARCH SHAPE COMPONENT */}
                  <div className="absolute inset-0 z-0 drop-shadow-[0_15px_30px_rgba(0,0,0,0.06)]">
                    <svg viewBox="0 0 400 500" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-sm transition-transform duration-500 group-hover:scale-[1.02]">
                      <path 
                        d="M200 0 C240 0 270 15 290 35 C310 55 325 80 335 110 C345 80 360 55 380 35 C400 15 430 0 470 0 L400 0 Z" 
                        fill="transparent" 
                      />
                      {/* Custom Dome Path */}
                      <path d="M200 5C260 5 310 25 340 55C370 85 385 115 395 155C400 175 400 195 400 215V465C400 487.091 382.091 505 360 505H40C17.9086 505 0 487.091 0 465V215C0 195 0 175 5 155C15 115 30 85 60 55C90 25 140 5 200 5Z" fill="#FDF6E9" />
                      
                      {/* Scallops - Top Arch Circles */}
                      <circle cx="200" cy="18" r="45" fill="#FDF6E9" />
                      <circle cx="130" cy="40" r="40" fill="#FDF6E9" />
                      <circle cx="270" cy="40" r="40" fill="#FDF6E9" />
                      <circle cx="75" cy="85" r="35" fill="#FDF6E9" />
                      <circle cx="325" cy="85" r="35" fill="#FDF6E9" />

                      {/* Accent Stroke */}
                      <path d="M200 12C140 12 90 32 60 62C30 92 15 122 5 162C0 182 0 202 0 222V460C0 478 15 493 33 495 C33 480 48 465 65 465 H335 C352 465 367 480 367 495 C385 493 400 478 400 460 V222C400 202 400 182 395 162C385 122 370 92 340 62C310 32 260 12 200 12Z" stroke="#D9A036" strokeWidth="0.8" strokeOpacity="0.25" fill="transparent" />
                    </svg>
                  </div>

                  {/* CARD CONTENT */}
                  <div className="relative z-10 flex flex-col items-center text-center px-10">
                    {/* Stars */}
                    <div className="flex gap-1.5 mb-8">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={15} className="fill-[#D9A036] text-[#D9A036]" strokeWidth={0} />
                      ))}
                    </div>

                    {/* Testimonial text with inline quotes */}
                    <div className="relative mb-12">
                      <span className="absolute -top-6 -left-4 text-4xl font-poppins text-[#D9A036]/20">“</span>
                      <p className="text-[15px] md:text-[17px] font-poppins font-medium text-[#11261C] leading-[1.7] italic tracking-tight">
                        {item.text}
                      </p>
                      <div className="w-12 h-[1px] bg-[#D9A036]/20 mx-auto mt-6" />
                      <span className="absolute -bottom-10 -right-4 text-4xl font-poppins text-[#D9A036]/20">”</span>
                    </div>

                    {/* Brand Footer Slot */}
                    <div className="flex items-center gap-4 pt-4">
                      <div className="w-14 h-14 rounded-full border border-[#D9A036]/30 p-1 shadow-sm bg-white/50">
                        <img src={item.avatar} className="w-full h-full object-cover rounded-full" alt={item.name} />
                      </div>
                      <div className="text-left">
                        <h4 className="font-poppins font-bold text-sm text-[#11261C] tracking-tight">{item.name}</h4>
                        <p className="text-[14px] font-poppins font-black text-[#D9A036] uppercase tracking-[0.2em]">{item.role}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* CUSTOM NAVIGATION CONTROLS */}
          <button className="testimonial-prev absolute top-1/2 -left-4 md:-left-12 -translate-y-1/2 w-12 h-12 rounded-full bg-white border border-[#D9A036]/20 shadow-lg flex items-center justify-center text-[#11261C] hover:bg-[#11261C] hover:text-white transition-all z-20 cursor-pointer group">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <button className="testimonial-next absolute top-1/2 -right-4 md:-right-12 -translate-y-1/2 w-12 h-12 rounded-full bg-white border border-[#D9A036]/20 shadow-lg flex items-center justify-center text-[#11261C] hover:bg-[#11261C] hover:text-white transition-all z-20 cursor-pointer group">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
          </button>

          {/* CUSTOM PAGINATION */}
          <div className="testimonial-pagination flex justify-center gap-2 mt-16 !relative"></div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .testimonial-pagination .swiper-pagination-bullet {
          width: 8px;
          height: 8px;
          background: #11261C;
          opacity: 0.15;
          margin: 0 6px !important;
          transition: all 0.4s ease;
        }
        .testimonial-pagination .swiper-pagination-bullet-active {
          width: 28px;
          border-radius: 4px;
          background: #D9A036;
          opacity: 1;
        }
      `}} />
    </section>
  );
};

export default Testimonials;
