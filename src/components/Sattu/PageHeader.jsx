import React from "react";
import { Link } from "react-router-dom";
import { Home, ChevronRight, Leaf } from "lucide-react";
import { motion } from "framer-motion";

/**
 * PageHeader Component
 * A premium breadcrumb-focused header with heritage aesthetics.
 * Built with the provided design specifications including the heritage background image.
 */
const PageHeader = ({ breadcrumbItems = [] }) => {
  return (
    <section className="relative w-full h-[140px] md:h-[60px] flex items-center justify-center overflow-hidden bg-[#] mt-[45px] md:mt-[120px]">

      {/* 
          Main Heritage Banner Background 
          Image uses path from public directory: /img/background.jpeg
      */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-90 transition-transform duration-1000"

      />

      {/* Tonal Luxury Grain Overlay for texture depth and tactile feel */}
      <div className="absolute inset-0 opacity-[0.05]  pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/p6-grain.png')] mix-blend-multiply" />

      {/* Decorative Gradient Scrim for subtle framing */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#FAF4E3]/20 via-transparent to-[#FAF4E3]/20 pointer-events-none" />

      {/* Breadcrumbs Logic Matrix */}
      <div className="container mx-auto px-6 relative z-10 flex flex-col items-center bg-[#faf4e3]">
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2.5 md:gap-5 text-[#6b4f3a] font-poppins font-bold text-[14px] md:text-sm uppercase tracking-[0.2em] md:tracking-[0.25em]"
        >
          {breadcrumbItems.map((item, index) => {
            const isLast = index === breadcrumbItems.length - 1;
            const isFirst = index === 0;

            if (isLast) {
              return (
                <React.Fragment key={index}>
                  {index > 0 && (
                    <ChevronRight size={13} className="text-[#6b4f3a]/40" strokeWidth={3} />
                  )}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="inline-flex items-center gap-2  backdrop-blur-[1px] text-[#bf8d2d] px-5 md:px-7 py-1.5 md:py-2.5 rounded-full text-[14px] md:text-[14px] font-poppins font-bold uppercase tracking-[0.3em]  transition-all duration-400 ease-out"
                  >
                    <Leaf size={14} className="fill-current rotate-45 opacity-90" strokeWidth={1.5} />
                    <span className="whitespace-nowrap tracking-[0.1em]">{item.label}</span>
                  </motion.div>
                </React.Fragment>
              );
            }

            return (
              <React.Fragment key={index}>
                <Link
                  to={item.path || "#"}
                  className="flex items-center gap-2 hover:text-[#976E2A] transition-all duration-300 group"
                >
                  {isFirst && (
                    <Home size={18} className="text-[#6b4f3a] group-hover:-translate-y-0.5 transition-transform" strokeWidth={2} />
                  )}
                  <span className="hover:underline underline-offset-4 decoration-[#976E2A]/30 transition-all">{item.label}</span>
                </Link>
                <ChevronRight size={13} className="text-[#6b4f3a]/40" strokeWidth={3} />
              </React.Fragment>
            );
          })}
        </nav>
      </div>
    </section>
  );
};

export default PageHeader;

