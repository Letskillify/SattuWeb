import React from 'react';
import { motion } from 'framer-motion';
import { Leaf, Sparkles, Shield, Sprout, Heart, Compass, CheckCircle2, Award, ArrowRight, ShieldCheck, Sun } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/Sattu/PageHeader';

const About = () => {
  const premiumEase = [0.16, 1, 0.3, 1];

  return (
    <div className="min-h-screen relative bg-[#FAF7F2] text-[#2A1B12] selection:bg-[#D9A036] selection:text-[#2A1B12] font-poppins pb-24">
      <PageHeader
        title="About Vedamya Foods"
        subtitle="Pure by Nature • Crafted with Care"
        image="https://res.cloudinary.com/duzwys877/image/upload/v1782293898/b1_plystv.png"
        breadcrumbItems={[
          { label: "Home", path: "/" },
          { label: "About Us" },
        ]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 relative z-10 py-12 md:py-16 space-y-16 sm:space-y-24">

        {/* EDITORIAL MANIFESTO PANEL */}
        <section className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: premiumEase }}
            className="bg-white border-2 border-[#D9A036]/40 rounded-3xl p-8 md:p-14 text-center relative overflow-hidden shadow-2xl shadow-[#2A1B12]/5"
          >
            <div className="flex items-center justify-center gap-3 text-[#D9A036] mb-6">
              <div className="w-8 h-[2px] bg-[#D9A036]/40" />
              <Leaf size={18} className="fill-current rotate-45 text-[#D9A036]" />
              <div className="w-8 h-[2px] bg-[#D9A036]/40" />
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#2A1B12] uppercase tracking-tight mb-6 leading-tight">
              Reviving True Vedic Nutrition for Modern Living
            </h2>

            <p className="text-base sm:text-lg md:text-xl font-bold leading-relaxed text-[#6b4f3a] tracking-wide max-w-3xl mx-auto">
              In today's fast-paced world, finding food that is 100% pure has become a rare privilege. At Vedamya Foods, we bring stone-ground, 100% organic, chemical-free nutrition straight from nature to your table—crafted with the same warmth and authenticity as traditional Indian households.
            </p>
          </motion.div>
        </section>

        {/* HERITAGE STATS IMPACT STRIP */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[
            { value: "100%", label: "Certified Organic", icon: Award },
            { value: "0%", label: "Refined Sugar or Additives", icon: ShieldCheck },
            { value: "50,000+", label: "Delighted Families Served", icon: Heart },
            { value: "Stone-Ground", label: "Slow Processed Heritage Sattu", icon: Sun }
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08, duration: 0.6, ease: premiumEase }}
                className="bg-white rounded-2xl border-2 border-[#6b4f3a]/15 p-5 text-center shadow-lg hover:border-[#D9A036] transition-all flex flex-col items-center justify-center"
              >
                <div className="w-10 h-10 rounded-xl bg-[#FAF7F2] border border-[#D9A036]/40 flex items-center justify-center text-[#D9A036] mb-3">
                  <Icon size={20} />
                </div>
                <h4 className="text-xl sm:text-2xl font-black text-[#2A1B12] leading-tight mb-1">{stat.value}</h4>
                <p className="text-xs font-black uppercase tracking-wider text-[#6b4f3a]">{stat.label}</p>
              </motion.div>
            );
          })}
        </section>

        {/* CORE PILLARS MATRIX */}
        <section className="space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-black uppercase tracking-widest text-[#D9A036] bg-[#FAF7F2] px-3 py-1 rounded-full border border-[#D9A036]/30 inline-block">
              Our Uncompromising Promise
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#2A1B12] tracking-tight uppercase">
              What Sets Vedamya Foods Apart?
            </h2>
            <div className="w-16 h-1 bg-[#D9A036] mx-auto rounded-full" />
          </div>

          <div className="grid sm:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto">
            {[
              {
                icon: Sprout,
                title: "100% Organic & Chemical-Free",
                desc: "From organic farms directly to your pantry, our products contain zero synthetic chemicals, artificial colors, or chemical preservatives."
              },
              {
                icon: Shield,
                title: "Zero Refined White Sugar",
                desc: "We enforce a strict NO to refined white sugar. We use only nature's cleanest unrefined ingredients like organic jaggery and natural stevia."
              },
              {
                icon: Sparkles,
                title: "Traditional Stone-Ground Milling",
                desc: "Slow roasted and stone-ground in small hygienic batches to lock in vital dietary fibers, natural proteins, and micronutrients."
              },
              {
                icon: Compass,
                title: "Wholesome Clean Range",
                desc: "From our nutrient-dense flavoured Sattu mixes to everyday wellness staples, every product is formulated for genuine long-term vitality."
              }
            ].map((pillar, i) => {
              const Icon = pillar.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.6, ease: premiumEase }}
                  className="bg-white rounded-3xl p-6 sm:p-8 flex items-start gap-5 border-2 border-[#6b4f3a]/15 hover:border-[#D9A036] hover:shadow-2xl transition-all duration-300 group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#FAF7F2] border-2 border-[#D9A036]/40 p-2 shrink-0 flex items-center justify-center text-[#6b4f3a] group-hover:bg-[#6b4f3a] group-hover:text-white transition-colors duration-300 shadow-sm">
                    <Icon size={22} />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-base sm:text-lg font-black text-[#2A1B12] tracking-wide uppercase group-hover:text-[#D9A036] transition-colors">
                      {pillar.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#6b4f3a] leading-relaxed font-medium">
                      {pillar.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* CALL TO ACTION BANNER */}
        <section className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-r from-[#6b4f3a] via-[#4a3425] to-[#2A1B12] rounded-3xl p-8 sm:p-12 text-center border-2 border-[#D9A036]/50 shadow-2xl relative overflow-hidden">
            <div className="relative z-10 space-y-6 max-w-2xl mx-auto">
              <span className="text-xs font-black uppercase tracking-widest text-[#D9A036] bg-[#2A1B12]/60 px-4 py-1.5 rounded-full border border-[#D9A036]/40 inline-block">
                Taste Pure Wellness
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
                Ready to Experience 100% Authentic Heritage Sattu?
              </h3>
              <p className="text-sm sm:text-base text-gray-200 font-medium">
                Order your fresh batch of stone-ground Sattu mixes today and enjoy express delivery anywhere in India.
              </p>
              <div className="pt-2">
                <Link
                  to="/shop"
                  className="inline-flex items-center gap-3 px-8 py-4 bg-[#D9A036] hover:bg-white text-[#2A1B12] font-black text-xs sm:text-sm uppercase tracking-widest rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-white/50 group"
                >
                  <span>Shop Organic Blends</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default About;
