import React from 'react';
import { Leaf } from 'lucide-react';

const SectionHeader = ({ title, subtitle }) => {
  return (
    <div className="text-center max-w-3xl mx-auto mb-10 relative px-4">

      {/* Top Vintage Ornament Row */}
      <div className="flex items-center justify-center gap-2 mb-3 text-[#976E2A]">
        <span className="text-sm font-poppins opacity-40 tracking-tight">--------⌲</span>
        <Leaf size={16} className="fill-current rotate-45" />
        <span className="text-sm font-poppins opacity-40 tracking-tight">⌱--------</span>
      </div>

      {/* Main Title Header */}
      <h2 className="text-3xl sm:text-[44px] font-poppins font-bold text-[#6b4f3a] tracking-[0.08em] uppercase leading-none mb-4">
        {title}
      </h2>

      {/* Subtitle with side boundary borders */}
      <div className="flex items-center justify-center gap-4 max-w-md mx-auto border-y border-[#6b4f3a]/20 py-2">
        <span className="text-[14px] sm:text-sm font-poppins font-bold text-[#6b4f3a] uppercase tracking-[0.3em] whitespace-nowrap">
          {subtitle || "Natural • Nutritious • Wholesome"}
        </span>
      </div>

      {/* Bottom Accent Anchor Diamond */}
      <div className="flex justify-center items-center mt-3 text-[#976E2A]">
        <div className="w-12 h-[1px] bg-[#976E2A]/30" />
        <span className="text-[14px] font-poppins mx-2">◆</span>
        <div className="w-12 h-[1px] bg-[#976E2A]/30" />
      </div>
    </div>
  );
};

export default SectionHeader;
