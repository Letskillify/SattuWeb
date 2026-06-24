import React from 'react';
import { motion } from 'framer-motion';
import {
  Dumbbell,
  Sprout,
  Leaf,
  Snowflake,
  Utensils,
  DotSquare,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

import SectionHeader from './SectionHeader';

const benefits = [
  {
    num: "01",
    title: "High in Protein",
    desc: "Builds strength naturally from within.",
    icon: <img src="https://res.cloudinary.com/duzwys877/image/upload/v1781441466/body_dzurv4.svg" alt="Body Shape" className="w-20 h-20 object-contain" />,
    isGreen: true,
  },
  {
    num: "02",
    title: "Rich in Fiber",
    desc: "Supports seamless digestion & gut health.",
    icon: <img src="https://res.cloudinary.com/duzwys877/image/upload/v1781441581/leafes_kx6mzs.svg" alt="Body Shape" className="w-20 h-20 object-contain" />,
    isGreen: false,
  },
  {
    num: "03",
    title: "100% Natural",
    desc: "Zero chemicals, absolute purity guaranteed.",
    icon: <img src="https://res.cloudinary.com/duzwys877/image/upload/v1781441161/b1_ltomv8.svg" alt="Body Shape" className="w-20 h-20 object-contain" />,
    isGreen: true,
  },
  {
    num: "04",
    title: "Cooling Effect",
    desc: "Perfect hydration for the Indian climate.",
    icon: <img src="https://res.cloudinary.com/duzwys877/image/upload/v1781441161/b2_s1suqm.svg" alt="Body Shape" className="w-20 h-20 object-contain" />,
    isGreen: false,
  },
  {
    num: "05",
    title: "Keeps You Full",
    desc: "Sustained energy that helps manage weight.",
    icon: <img src="https://res.cloudinary.com/duzwys877/image/upload/v1781441161/spoon_taz39x.svg" alt="Body Shape" className="w-20 h-20 object-contain" />,
    isGreen: true,
  },
];

const BenefitsStrip = () => {
  return (
    <section className="py-20 bg-[#FAF4E3] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">

        <SectionHeader
          title="The Goodness Of Sattu"
          subtitle="Natural • Nutritious • Wholesome"
        />

        {/* --- SWIPER SLIDER REPLACING GRID --- */}
        <div className="relative group px-4">
          <Swiper
            modules={[Autoplay, Pagination, Navigation]}
            spaceBetween={24}
            slidesPerView={1}
            autoplay={{
              delay: 4000,
              disableOnInteraction: false,
            }}
            pagination={{
              clickable: true,
              el: '.benefits-pagination',
            }}
            navigation={{
              prevEl: '.benefit-prev',
              nextEl: '.benefit-next',
            }}
            breakpoints={{
              640: {
                slidesPerView: 2,
              },
              1024: {
                slidesPerView: 5,
              },
            }}
            className="!py-12"
          >
            {benefits.map((benefit, index) => {

              const themeColor = benefit.isGreen ? 'text-[#6b4f3a]' : 'text-[#976E2A]';
              const badgeBg = benefit.isGreen ? 'bg-[#6b4f3a]' : 'bg-[#976E2A]';
              const dashBorder = benefit.isGreen ? 'border-[#6b4f3a]/30' : 'border-[#976E2A]/30';

              return (
                <SwiperSlide key={benefit.num} className="h-auto">
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className="group h-full relative bg-[#FFFDF6] border-[1.5px] border-[#E3DBC5] rounded-[32px] p-6 pt-12 flex flex-col items-center text-center transition-all duration-300 hover:border-[#976E2A]/60 shadow-sm"
                  >

                    {/* 1. Numerical Counter Top Badge */}
                    <div className={`absolute -top-6 left-1/2 transform -translate-x-1/2 w-14 h-14 ${badgeBg} rounded-full flex items-center justify-center text-white text-[35px] font-poppins font-bold shadow-sm z-20`}>
                      {benefit.num}
                    </div>

                    {/* 2. Concentric Center Circle with Flanking React Icon Leaves */}
                    <div className={`relative w-24 h-24 rounded-full border border-dashed ${dashBorder} flex items-center justify-center mb-2`}>

                      <div className={`absolute inset-1 rounded-full border ${benefit.isGreen ? 'border-[#6b4f3a]/10' : 'border-[#976E2A]/10'}`} />

                      <div className={`absolute -left-3 top-1/2 -translate-y-1/2 -rotate-45 ${themeColor} opacity-40`}>
                        <Leaf size={12} className="fill-current" />
                      </div>

                      <div className={`absolute -right-3 top-1/2 -translate-y-1/2 rotate-45 scale-x-[-1] ${themeColor} opacity-40`}>
                        <Leaf size={12} className="fill-current" />
                      </div>

                      <div className={`${themeColor} relative z-10 transition-transform duration-300 group-hover:scale-105`}>
                        {benefit.icon}
                      </div>
                    </div>

                    {/* 3. Serif Main Header Title */}
                    <h3 className="text-xl font-poppins font-bold text-[#6b4f3a] tracking-tight leading-tight mb-2 min-h-[48px] flex items-center justify-center">
                      {benefit.title}
                    </h3>

                    {/* 4. Muted Organic Body Text Description */}
                    <p className="text-sm font-poppins font-medium text-[#605948] leading-relaxed max-w-[160px]">
                      {benefit.desc}
                    </p>

                    {/* 5. Bottom Card Anchored Triple Leaf Ornament */}
                    <div className={`mt-auto pt-6 flex items-center justify-center gap-0.5 ${themeColor} opacity-60`}>
                      <Leaf size={10} className="rotate-[-30deg] fill-current" />
                      <Leaf size={12} className="fill-current -translate-y-1" />
                      <Leaf size={10} className="rotate-[30deg] scale-x-[-1] fill-current" />
                    </div>

                  </motion.div>
                </SwiperSlide>
              );
            })}
          </Swiper>

          {/* Custom Navigation Buttons */}
          <button className="benefit-prev absolute left-[-20px] top-1/2 -translate-y-1/2 z-30 w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center text-[#6b4f3a] hover:bg-[#6b4f3a] hover:text-white transition-all duration-300 opacity-0 group-hover:opacity-100 hidden md:flex">
            <ChevronLeft size={20} />
          </button>
          <button className="benefit-next absolute right-[-20px] top-1/2 -translate-y-1/2 z-30 w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center text-[#6b4f3a] hover:bg-[#6b4f3a] hover:text-white transition-all duration-300 opacity-0 group-hover:opacity-100 hidden md:flex">
            <ChevronRight size={20} />
          </button>

          {/* Custom Pagination */}
          <div className="benefits-pagination flex justify-center gap-2 mt-4" />
        </div>

        <style dangerouslySetInnerHTML={{
          __html: `
          .benefits-pagination .swiper-pagination-bullet {
            width: 10px;
            height: 10px;
            background: #E3DBC5;
            opacity: 1;
            transition: all 0.3s ease;
          }
          .benefits-pagination .swiper-pagination-bullet-active {
            background: #976E2A;
            width: 25px;
            border-radius: 5px;
          }
        `}} />

      </div>
    </section>
  );
};

export default BenefitsStrip;
