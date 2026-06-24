import React from 'react';
import { motion } from 'framer-motion';
import { Leaf, Sparkles, Shield, Sprout, Heart, Compass } from 'lucide-react';
import PageHeader from '../components/Sattu/PageHeader';

const About = () => {
  const premiumEase = [0.25, 1, 0.5, 1];

  return (
    <div className="min-h-screen relative text-[#6b4f3a] selection:bg-[#976E2A] selection:text-[#FFFDF6]">
      {/* Tonal Heritage Grain Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/p6-grain.png')] mix-blend-multiply z-0"></div>

      <PageHeader
        title="About Us"
        subtitle="Pure by Nature. Crafted with Care."
        image="img/ss.png"
        breadcrumbItems={[
          { label: "Home", path: "/" },
          { label: "About Us" },
        ]}
      />

      <div className="max-w-6xl mx-auto px-6 md:px-12 relative z-10 py-16 md:py-20">

        {/* ================= EDITORIAL MANIFESTO PANEL ================= */}
        <section className="mb-20 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: premiumEase }}
            className="bg-[#FFFDF6] border border-[#E3DBC5] rounded-[32px] p-8 md:p-12 text-center relative overflow-hidden shadow-[0_15px_40px_rgba(32,59,35,0.03)]"
          >
            {/* Fine Art Accent Mark */}
            <div className="flex items-center justify-center gap-3 text-[#976E2A] mb-6">
              <div className="w-6 h-[1px] bg-[#976E2A]/30" />
              <Leaf size={14} className="fill-current rotate-45 opacity-80" />
              <div className="w-6 h-[1px] bg-[#976E2A]/30" />
            </div>

            <p className="text-base md:text-lg font-poppins font-medium leading-[1.75] text-[#6b4f3a]/90 tracking-wide">
              In today’s fast-paced world, finding food that is truly pure has become a luxury. That is why we are here—to bring 100% organic, chemical-free, and wholesome products straight to your doorstep, crafted with the same love and honesty as you would at home.
            </p>
          </motion.div>
        </section>

        {/* ================= PILLARS ARCHITECTURE MATRIX ================= */}
        <section>
          <div className="text-center max-w-xl mx-auto mb-12 space-y-3">
            <span className="text-[14px] font-poppins font-bold uppercase tracking-[0.3em] text-[#976E2A] block">
              The Framework
            </span>
            <h2 className="text-2xl md:text-3xl font-poppins font-bold text-[#6b4f3a] tracking-tight">
              What Makes Us Special?
            </h2>
            <div className="flex justify-center pt-1">
              <div className="w-10 h-[1px] bg-[#976E2A]/40" />
            </div>
          </div>

          {/* Compact 2x2 Architectural Grid Matrix */}
          <div className="grid sm:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {[
              {
                icon: Sprout,
                title: "100% Organic & Chemical-Free:",
                desc: "From fields to your kitchen, our products contain zero synthetic chemicals, artificial additives, or preservatives."
              },
              {
                icon: Shield,
                title: "Zero White Sugar:",
                desc: "We say a strict NO to refined white sugar, using only nature's cleanest, unrefined alternatives."
              },
              {
                icon: Sparkles,
                title: "Homemade Seeds & Superfoods:",
                desc: "Nutrient-dense seeds and everyday staples processed in small, hygienic batches to retain maximum nutrition."
              },
              {
                icon: Compass,
                title: "Wholesome Clean Range:",
                desc: "From our nutrient-packed flavoured Sattu to everyday wellness essentials, everything we offer is designed to nourish your body."
              }
            ].map((pillar, i) => {
              const Icon = pillar.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.7, ease: premiumEase }}
                  className="group relative bg-[#FFFDF6] rounded-[24px] p-6 flex items-start gap-5 transition-all duration-500 border border-[#E3DBC5]/70 hover:border-[#976E2A]/30 hover:shadow-[0_15px_35px_rgba(32,59,35,0.04)]"
                >
                  {/* Strict Micro-Frame (p-1.5) Icon Asset Container */}
                  <div className="w-11 h-11 rounded-xl bg-[#FFFDF6] border border-[#E3DBC5]/60 p-1.5 shrink-0 shadow-sm group-hover:shadow-[0_8px_16px_rgba(151,110,42,0.1)] transition-all duration-500">
                    <div className="w-full h-full rounded-lg bg-[#FAF4E3] flex items-center justify-center text-[#976E2A] group-hover:bg-[#6b4f3a] group-hover:text-[#FFFDF6] transition-colors duration-500">
                      <Icon size={14} strokeWidth={1.8} />
                    </div>
                  </div>

                  {/* High-End Content Layout Group */}
                  <div className="space-y-1.5 pt-0.5">
                    <h3 className="text-sm font-poppins font-bold text-[#6b4f3a] tracking-wide uppercase group-hover:text-[#976E2A] transition-colors duration-300">
                      {pillar.title}
                    </h3>
                    <p className="text-sm text-[#6b4f3a]/75 font-poppins leading-relaxed font-medium">
                      {pillar.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

      </div>
    </div>
  );
};

export default About;
