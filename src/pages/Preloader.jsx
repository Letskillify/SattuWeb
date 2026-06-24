import React, { useState, useEffect } from 'react';
import { Leaf } from 'lucide-react';

const PremiumPreloader = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [isLifting, setIsLifting] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const contentTimer = setTimeout(() => setShowContent(true), 150);

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        // Organic non-linear slow-down as it approaches completion
        const remaining = 100 - prev;
        const increment = Math.random() * (remaining > 20 ? 14 : 2.0);
        return Math.min(prev + increment, 100);
      });
    }, 80);

    return () => {
      clearInterval(timer);
      clearTimeout(contentTimer);
    };
  }, []);

  useEffect(() => {
    if (progress === 100) {
      setTimeout(() => {
        setIsLifting(true);
        setTimeout(() => {
          if (onComplete) onComplete();
        }, 1100); // Aligned precisely with curtain slide duration
      }, 500);
    }
  }, [progress, onComplete]);

  // Micro progress ring geometry definitions (Calibrated 1px Hairline Architecture)
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center overflow-hidden pointer-events-none">

      {/* BRAND ARCHITECTURE: Cinematic Split Curtain Matrices */}
      <div className="absolute inset-0 flex flex-col w-full h-full" style={{ pointerEvents: 'auto' }}>
        {/* Top Curtain Panel */}
        <div
          className="w-full h-1/2 bg-[#FAF4E3] border-b border-[#E3DBC5]/30 transition-transform duration-[1100ms] ease-[cubic-bezier(0.85,0,0.15,1)] origin-top"
          style={{ transform: isLifting ? 'translateY(-100%)' : 'translateY(0%)' }}
        />
        {/* Bottom Curtain Panel */}
        <div
          className="w-full h-1/2 bg-[#FAF4E3] border-t border-[#E3DBC5]/30 transition-transform duration-[1100ms] ease-[cubic-bezier(0.85,0,0.15,1)] origin-bottom"
          style={{ transform: isLifting ? 'translateY(100%)' : 'translateY(0%)' }}
        />
      </div>

      {/* SURFACE OVERLAY: Fine Luxury Paper Grain Texture */}
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none mix-blend-multiply transition-opacity duration-700"
        style={{
          backgroundImage: "url('https://www.transparenttextures.com/patterns/p6-grain.png')",
          opacity: isLifting ? 0 : 0.025
        }}
      />

      {/* COMPACTED CENTRAL IDENTITY BLOCK */}
      <div className={`relative flex flex-col items-center z-20 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] ${showContent ? 'opacity-100 scale-100' : 'opacity-0 scale-[0.98]'
        } ${isLifting ? 'opacity-0 -translate-y-8' : ''}`}>

        {/* REFINED MICRO-PROGRESS RING & EMBLEM FRAME */}
        <div className="relative w-36 h-36 md:w-40 md:h-40 mb-6 flex items-center justify-center">

          {/* Concentric Ambient Guide Rings */}
          <div className="absolute inset-2 rounded-full border border-[#E3DBC5]/40" />
          <div className="absolute inset-0 rounded-full border border-dashed border-[#976E2A]/10 scale-[1.04]" />

          {/* Active 1px Golden Progress Track */}
          <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r={radius}
              className="stroke-[#976E2A] transition-all duration-200 ease-out"
              strokeWidth="1.2"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>

          {/* Centered Protected Logo Frame */}
          <div className="w-[78%] h-[78%] rounded-full bg-[#FFFDF6] border border-[#E3DBC5]/60 flex items-center justify-center p-4 shadow-sm">
            <img
              src="https://res.cloudinary.com/duzwys877/image/upload/v1782295170/logo_rwarlx.png"
              alt="Vedamya Foods Logo"
              className="w-full h-full object-contain filter contrast-[1.01]"
            />
          </div>
        </div>

        {/* TYPOGRAPHIC BRAND MATRIX */}
        <div className="text-center space-y-3 flex flex-col items-center">
          <div className="flex flex-col items-center">
            <h1 className="text-xl md:text-2xl font-serif font-bold text-[#6b4f3a] tracking-wide uppercase">
              Vedamya <span className="font-serif italic font-normal text-[#976E2A] lowercase">Foods</span>
            </h1>

            {/* Fine Accent Divider */}
            <div className="flex items-center gap-2 mt-2 w-32 justify-center">
              <div className="h-[0.5px] w-4 bg-[#976E2A]/30" />
              <Leaf size={8} className="text-[#976E2A]/80 fill-current rotate-45" />
              <div className="h-[0.5px] w-4 bg-[#976E2A]/30" />
            </div>
          </div>

          {/* INTERACTIVE KINETIC TEXT ENGINE (Replaces Numerical Counter) */}
          <div className="h-4 overflow-hidden relative w-48 text-center pt-0.5">
            <span className={`absolute inset-x-0 mx-auto text-[14px] font-sans font-bold uppercase tracking-[0.25em] text-[#6b4f3a]/50 transition-all duration-500 ease-out transform ${progress === 100 ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100'
              }`}>
              Nourishing your body
            </span>
            <span className={`absolute inset-x-0 mx-auto text-[14px] font-sans font-bold uppercase tracking-[0.25em] text-[#976E2A] transition-all duration-500 ease-out transform ${progress === 100 ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
              }`}>
              Ready for Vitality
            </span>
          </div>
        </div>

      </div>

      {/* EXTERIOR PERIMETER HAIRLINE GALLERY BORDER */}
      <div
        className="absolute inset-4 md:inset-6 border border-[#E3DBC5]/30 pointer-events-none transition-all duration-1000 z-30"
        style={{
          opacity: isLifting ? 0 : 1,
          transform: isLifting ? 'scale(1.02)' : 'scale(1)'
        }}
      />
    </div>
  );
};

export default PremiumPreloader;