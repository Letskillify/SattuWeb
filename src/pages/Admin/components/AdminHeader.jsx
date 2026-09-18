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
    <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#E5DEC9]">
      {/* Title & Subtitle */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 rounded-full bg-[#D9A036]/10 text-[#976E2A] text-[10px] font-poppins font-black uppercase tracking-widest border border-[#D9A036]/20 flex items-center gap-1">
            <Sparkles size={11} /> Admin Control Center
          </span>
          <span className="text-xs text-[#7A6E63] font-medium flex items-center gap-1">
            <Calendar size={12} /> {currentDate}
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-poppins font-black text-[#2A1B12] tracking-tight">
          {activeItem}
        </h1>
      </div>

      {/* Operational Badge & Quick Action Buttons */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Store Status Pill */}
        <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white shadow-xs border border-[#E5DEC9]">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-bold text-[#2A1B12]">
            Store Status: <span className="text-emerald-700">Operational</span>
          </span>
        </div>

        {/* Quick Action Buttons depending on page */}
        {(activeItem === "Sattu Products" || activeItem === "Products" || activeItem === "Dashboard") && onOpenSattuModal && (
          <button
            type="button"
            onClick={onOpenSattuModal}
            className="px-5 py-2.5 rounded-2xl bg-[#6b4f3a] text-white text-xs font-bold shadow-md shadow-[#6b4f3a]/20 hover:bg-[#2A1B12] transition-all flex items-center gap-2"
          >
            <Package size={15} />
            <span>Add Sattu Product</span>
          </button>
        )}

        {(activeItem === "Other Products" || activeItem === "Dashboard") && onOpenOtherModal && (
          <button
            type="button"
            onClick={onOpenOtherModal}
            className="px-5 py-2.5 rounded-2xl bg-[#976E2A] text-white text-xs font-bold shadow-md shadow-[#976E2A]/20 hover:bg-[#2A1B12] transition-all flex items-center gap-2"
          >
            <Boxes size={15} />
            <span>Add Other Product</span>
          </button>
        )}
      </div>
    </header>
  );
};

export default AdminHeader;
