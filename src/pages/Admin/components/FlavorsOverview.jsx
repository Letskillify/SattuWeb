import React from 'react';
import { Sparkles, Leaf, Coffee, Cookie, Flame, Droplets } from 'lucide-react';

const flavorStats = [
  { name: "Classic Roasted", count: 4, icon: Leaf, color: "text-emerald-800", bg: "bg-emerald-100 border-emerald-300" },
  { name: "Elaichi", count: 2, icon: Sparkles, color: "text-amber-800", bg: "bg-amber-100 border-amber-300" },
  { name: "Rose", count: 2, icon: Droplets, color: "text-pink-800", bg: "bg-pink-100 border-pink-300" },
  { name: "Dry Fruit", count: 2, icon: Cookie, color: "text-amber-900", bg: "bg-amber-100 border-amber-400" },
  { name: "Chocolate", count: 1, icon: Coffee, color: "text-[#2A1B12]", bg: "bg-[#2A1B12]/15 border-[#2A1B12]/30" },
  { name: "Namkeen Spicy", count: 1, icon: Flame, color: "text-orange-800", bg: "bg-orange-100 border-orange-300" },
];

const FlavorsOverview = () => {
  return (
    <section className="bg-white rounded-3xl border border-[#E5DEC9] shadow-[0_4px_25px_rgba(0,0,0,0.03)] p-6 md:p-8">
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-poppins font-black text-[#2A1B12] tracking-tight">
          Flavors & Variants Distribution
        </h2>
        <p className="text-xs sm:text-sm text-[#7A6E63] font-semibold mt-1">
          Catalog inventory breakdown by signature blend flavor
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {flavorStats.map((flavor) => {
          const Icon = flavor.icon;
          return (
            <div
              key={flavor.name}
              className="rounded-3xl border border-[#E5DEC9] bg-[#FDFBF7] p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl border ${flavor.bg} ${flavor.color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-2xs`}>
                  <Icon size={24} strokeWidth={2.2} />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-poppins font-bold text-[#2A1B12]">{flavor.name}</h3>
                  <p className="text-xs sm:text-sm font-extrabold text-[#976E2A] mt-1">{flavor.count} Products Registered</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default FlavorsOverview;
