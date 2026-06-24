import React from 'react';
import { CheckCircle2 } from 'lucide-react';

const AdminHeader = ({ activeItem }) => {
  return (
    <header className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-3xl font-poppins font-bold tracking-tight text-[#1C2B21]">
          {activeItem}
        </h1>
        <p className="mt-2 text-sm font-medium tracking-wide text-[#4A5D4E] uppercase">
          Sattu Drink Management
        </p>
      </div>
      <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white shadow-sm border border-[#D9D3C7]">
        <CheckCircle2 size={18} className="text-[#4A5D4E]" />
        <span className="text-sm font-medium text-[#1C2B21]">
          Store Status: <span className="text-[#4A5D4E] font-bold">Operational</span>
        </span>
      </div>
    </header>
  );
};

export default AdminHeader;
