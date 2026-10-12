import React from 'react';
import {
  Sparkles,
  Calendar,
  Plus,
  Package,
  FolderTree,
  Warehouse
} from 'lucide-react';

const AdminHeader = ({
  activeItem,
  onOpenAddModal,
  onOpenCategoryManager,
  onOpenStockManager
}) => {
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
            <Sparkles size={13} className="text-[#D9A036]" /> Vedamya Admin Suite
          </span>
          <span className="text-xs sm:text-sm text-[#7A6E63] font-semibold flex items-center gap-1.5">
            <Calendar size={14} className="text-[#976E2A]" /> {currentDate}
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-poppins font-black text-[#2A1B12] tracking-tight">
          {activeItem}
        </h1>
      </div>

      {/* Operational Badge & Primary Action Button */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Store Status Pill */}
        <div className="hidden sm:flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white shadow-xs border border-[#E5DEC9] backdrop-blur-md">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-bold text-[#2A1B12]">
            Storefront: <span className="text-emerald-700 font-extrabold">Active</span>
          </span>
        </div>

        {/* Quick shortcut to Category Manager if not already there */}
        {activeItem !== "Category Manager" && onOpenCategoryManager && (
          <button
            type="button"
            onClick={onOpenCategoryManager}
            className="px-4 py-3 rounded-2xl bg-white text-[#7A6E63] hover:text-[#2A1B12] hover:bg-[#FAF7F2] border border-[#E5DEC9] text-xs sm:text-sm font-extrabold transition-all flex items-center gap-2 cursor-pointer shadow-xs"
            title="Open Category Manager"
          >
            <FolderTree size={16} className="text-[#976E2A]" />
            <span className="hidden md:inline">Categories</span>
          </button>
        )}

        {/* Quick shortcut to Stock Manager if not already there */}
        {activeItem !== "Stock Manager" && onOpenStockManager && (
          <button
            type="button"
            onClick={onOpenStockManager}
            className="px-4 py-3 rounded-2xl bg-white text-[#7A6E63] hover:text-[#2A1B12] hover:bg-[#FAF7F2] border border-[#E5DEC9] text-xs sm:text-sm font-extrabold transition-all flex items-center gap-2 cursor-pointer shadow-xs"
            title="Open Stock Manager"
          >
            <Warehouse size={16} className="text-[#6b4f3a]" />
            <span className="hidden md:inline">Stock</span>
          </button>
        )}

        {/* PRIMARY ACTION: SINGLE ADD PRODUCT BUTTON */}
        {onOpenAddModal && (
          <button
            type="button"
            onClick={onOpenAddModal}
            className="px-5 py-3 rounded-2xl bg-[#D9A036] text-[#1A1009] text-xs sm:text-sm font-poppins font-black shadow-lg shadow-[#D9A036]/25 hover:bg-[#C68A27] hover:scale-[1.02] active:scale-100 transition-all flex items-center gap-2.5 cursor-pointer"
          >
            <Plus size={18} strokeWidth={3} />
            <span>Add New Product</span>
          </button>
        )}
      </div>
    </header>
  );
};

export default AdminHeader;
