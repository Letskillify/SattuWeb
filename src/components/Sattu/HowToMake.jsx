import React from 'react';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import { Leaf } from 'lucide-react';
import SectionHeader from './SectionHeader';
import 'swiper/css';
import 'swiper/css/pagination';

const steps = [
  {
    number: "01",
    title: "Add 2-3 tbsp Sattu Mix",
    subtitle: "Pure traditional roast",
    image: "https://res.cloudinary.com/duzwys877/image/upload/v1782293747/01_vatn0d.png"
  },
  {
    number: "02",
    title: "Add 200ml Water or Milk",
    subtitle: "Chilled or room temp",
    image: "https://res.cloudinary.com/duzwys877/image/upload/v1782294628/02_duvc15.png"
  },
  {
    number: "03",
    title: "Stir Well Until Smooth",
    subtitle: "No lumps, perfect blend",
    image: "https://res.cloudinary.com/duzwys877/image/upload/v1782294639/03_pbisn6.png"
  },
  {
    number: "04",
    title: "Enjoy Your Sattu Drink!",
    subtitle: "Real nutrition unlocked",
    image: "https://res.cloudinary.com/duzwys877/image/upload/v1782293768/04_jlczbm.png"
  }
];

const HowToMake = () => {
  return (
    <section
      className="py-24 relative overflow-hidden bg-cover bg-center border-t border-b border-[#E3DBC5]"
      style={{ backgroundImage: "url('https://res.cloudinary.com/duzwys877/image/upload/v1782293729/b3_iucscy.png')" }}
    >
      {/* Premium Multi-layered Tonal Overlays */}
      <div className="absolute inset-0 bg-[#FAF4E3]/60 pointer-events-none mix-blend-color-burn" />
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/p6-grain.png')]" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">

        {/* Section Title Unit */}
        <SectionHeader
          title="How to Make Sattu Drink"
          subtitle="Crafting the Perfect Blend"
        />

        {/* DESKTOP GALLERY GRID */}
        <div className="hidden lg:grid grid-cols-4 gap-8 relative mt-20">

          {/* Fine Editorial Connecting Track Line */}
          <div className="absolute top-40 left-0 w-full h-[1px] px-32 pointer-events-none">
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
              className="w-full h-full border-b border-dashed border-[#976E2A]/20 origin-left"
            />
          </div>

          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.12, duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
              className="group flex flex-col items-center w-full text-center relative"
            >
              {/* Arched Frame Asset with Decreased Stroke (p-1.5) & Rich Ambient Shadows */}
              <div className="relative w-full aspect-[3/4] max-w-[230px] bg-[#FFFDF6] border border-[#E3DBC5]/80 rounded-t-[120px] rounded-b-[24px] p-1.5 mb-8 transition-all duration-500 group-hover:border-[#976E2A]/40 shadow-[0_20px_40px_rgba(32,59,35,0.06),0_1px_3px_rgba(32,59,35,0.02)] group-hover:shadow-[0_35px_60px_rgba(151,110,42,0.14),0_2px_8px_rgba(151,110,42,0.04)] group-hover:-translate-y-1">

                {/* Internal Image Viewport Mask */}
                <div className="w-full h-full overflow-hidden rounded-t-[115px] rounded-b-[18px] relative bg-[#FAF4E3]">
                  <img
                    src={step.image}
                    alt={step.title}
                    className="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-105"
                  />
                  {/* Subtle grading overlay tint */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#6b4f3a]/10 via-transparent to-transparent opacity-60" />
                </div>

                {/* Floating Wireframe Step Medal */}
                <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-9 h-9 rounded-full bg-[#6b4f3a] border border-[#976E2A]/30 flex items-center justify-center text-white shadow-[0_4px_12px_rgba(32,59,35,0.3)] transition-all duration-300 group-hover:bg-[#976E2A] group-hover:shadow-[0_6px_16px_rgba(151,110,42,0.4)]">
                  <span className="text-[14px] font-sans font-bold tracking-wider">{step.number}</span>
                </div>
              </div>

              {/* Typography Structure */}
              <div className="px-2 mt-2">

                <h3 className="font-poppins text-lg font-bold text-[#6b4f3a] leading-snug tracking-tight group-hover:text-[#976E2A] transition-colors duration-300 mb-1">
                  {step.title}
                </h3>
                <span className="text-[14px] font-poppins font-bold uppercase tracking-[0.25em] text-[#976E2A] block ">
                  {step.subtitle}
                </span>
              </div>

            </motion.div>
          ))}
        </div>

        {/* MOBILE & TABLET SLIDER LAYOUT */}
        <div className="block lg:hidden mt-14">
          <Swiper
            modules={[Autoplay, Pagination]}
            spaceBetween={24}
            slidesPerView={1}
            centeredSlides={true}
            pagination={{ clickable: true }}
            autoplay={{ delay: 4500, disableOnInteraction: false }}
            breakpoints={{
              640: { slidesPerView: 2 },
              768: { slidesPerView: 2.5 },
            }}
            className="pb-16 premium-htw-swiper"
          >
            {steps.map((step) => (
              <SwiperSlide key={step.number} className="h-full">
                <div className="group flex flex-col items-center w-full text-center relative px-2">

                  {/* Matching Mobile Architectural Frame with Premium Adjustments */}
                  <div className="relative w-full aspect-[3/4] max-w-[230px] mx-auto bg-[#FFFDF6] border border-[#E3DBC5]/80 rounded-t-[120px] rounded-b-[24px] p-1.5 mb-8 shadow-[0_16px_32px_rgba(32,59,35,0.05)]">
                    <div className="w-full h-full overflow-hidden rounded-t-[115px] rounded-b-[18px] relative bg-[#FAF4E3]">
                      <img src={step.image} alt={step.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#6b4f3a]/10 via-transparent to-transparent opacity-60" />
                    </div>

                    <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-9 h-9 rounded-full bg-[#6b4f3a] border border-[#976E2A]/30 flex items-center justify-center text-white shadow-[0_4px_12px_rgba(32,59,35,0.2)]">
                      <span className="text-[14px] font-sans font-bold tracking-wider">{step.number}</span>
                    </div>
                  </div>

                  <div className="mt-2">
                    <span className="text-[14px] font-poppins font-bold uppercase tracking-[0.25em] text-[#976E2A] block mb-2">
                      {step.subtitle}
                    </span>
                    <h3 className="font-poppins text-base font-bold text-[#6b4f3a] leading-snug tracking-tight">
                      {step.title}
                    </h3>
                  </div>

                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>

      {/* Reconfigured Minimal Slider Pagination Architecture */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .premium-htw-swiper .swiper-pagination-bullet {
          background: #6b4f3a !important;
          opacity: 0.15;
          width: 6px;
          height: 6px;
          transition: all 0.3s ease;
        }
        .premium-htw-swiper .swiper-pagination-bullet-active {
          opacity: 1;
          background: #976E2A !important;
          width: 20px;
          border-radius: 4px;
        }
        .premium-htw-swiper .swiper-pagination {
          bottom: 4px !important;
        }
      `}} />

      {/* Fine-Art Background Floating Accents */}
      <div className="absolute left-6 bottom-10 opacity-10 rotate-[35deg] hidden lg:block text-[#6b4f3a]">
        <Leaf size={48} strokeWidth={1.2} />
      </div>
      <div className="absolute right-10 top-1/4 opacity-10 -rotate-[15deg] hidden lg:block text-[#6b4f3a]">
        <Leaf size={38} strokeWidth={1.2} />
      </div>
    </section>
  );
};

export default HowToMake;
