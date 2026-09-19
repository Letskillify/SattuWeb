import React from 'react';
import { Sparkles, Calendar, ShieldCheck, Plus, Package, Boxes } from 'lucide-react';

const AdminHeader = ({ activeItem, onOpenSattuModal, onOpenOtherModal }) => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return (
    <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-5 pb-6 border-b border-[#E5DEC9]">
      {/* Title & Subtitle */}
      <div className="space-y-1.5">
        <div className="flex flex-wrap items-center gap-3">
          <span className="px-3 py-1 rounded-full bg-[#D9A036]/15 text-[#976E2A] text-xs font-poppins font-black uppercase tracking-widest border border-[#D9A036]/30 flex items-center gap-1.5 shadow-2xs">
            <Sparkles size={13} className="text-[#D9A036]" /> Admin Control Center
          </span>
          <span className="text-xs sm:text-sm text-[#7A6E63] font-semibold flex items-center gap-1.5">
            <Calendar size={14} className="text-[#976E2A]" /> {currentDate}
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-poppins font-black text-[#2A1B12] tracking-tight">
          {activeItem}
        </h1>
      </div>

      {/* Operational Badge & Quick Action Buttons */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Store Status Pill */}
        <div className="flex items-center gap-3 px-4.5 py-2.5 rounded-2xl bg-white shadow-xs border border-[#E5DEC9]/80 backdrop-blur-md">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <span className="text-xs sm:text-sm font-bold text-[#2A1B12]">
            Store Status: <span className="text-emerald-700 font-extrabold">Operational</span>
          </span>
        </div>

        {/* Quick Action Buttons depending on page */}
        {(activeItem === "Sattu Products" || activeItem === "Products" || activeItem === "Dashboard") && onOpenSattuModal && (
          <button
            type="button"
            onClick={onOpenSattuModal}
            className="px-5 py-3 rounded-2xl bg-[#6b4f3a] text-white text-xs sm:text-sm font-extrabold shadow-md shadow-[#6b4f3a]/25 hover:bg-[#2A1B12] hover:scale-[1.02] active:scale-100 transition-all flex items-center gap-2.5 cursor-pointer"
          >
            <Package size={17} />
            <span>Add Sattu Product</span>
          </button>
        )}

        {(activeItem === "Other Products" || activeItem === "Dashboard") && onOpenOtherModal && (
          <button
            type="button"
            onClick={onOpenOtherModal}
            className="px-5 py-3 rounded-2xl bg-[#976E2A] text-white text-xs sm:text-sm font-extrabold shadow-md shadow-[#976E2A]/25 hover:bg-[#2A1B12] hover:scale-[1.02] active:scale-100 transition-all flex items-center gap-2.5 cursor-pointer"
          >
            <Boxes size={17} />
            <span>Add Other Product</span>
          </button>
        )}
      </div>
    </header>
  );
};

export default AdminHeader;
