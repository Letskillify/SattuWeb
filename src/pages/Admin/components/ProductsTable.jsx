import React, { useState, useMemo } from 'react';
import {
  Edit,
  Trash2,
  Search,
  Filter,
  Package,
  Boxes,
  AlertCircle,
  Sparkles,
  Layers,
  ArrowUpDown
} from 'lucide-react';

const statusBadgeClasses = (count) => {
  const num = Number(count) || 0;
  if (num <= 0) return "bg-red-50 text-red-700 border-red-200";
  if (num <= 5) return "bg-amber-50 text-amber-800 border-amber-200";
  return "bg-emerald-50 text-emerald-800 border-emerald-200";
};

const ProductsTable = ({
  products = [],
  onEdit,
  onDelete,
  title = "Products Catalog",
  subtitle = "Complete inventory of Sattu and organic store products",
  onOpenAddModal
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all"); // 'all' | 'sattu' | 'other'
  const [selectedTag, setSelectedTag] = useState("All");

  // Extract unique categories and flavors
  const tagsList = useMemo(() => {
    const list = new Set(["All"]);
    products.forEach((p) => {
      if (p.productType === "other" && p.category) {
        list.add(p.category);
      } else if (p.productType !== "other" && p.flavor) {
        list.add(p.flavor);
      }
    });
    return Array.from(list);
  }, [products]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.name?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p.flavor?.toLowerCase().includes(q) ||
        p.net_quantity?.toLowerCase().includes(q);

      const matchesType =
        typeFilter === "all" ||
        (typeFilter === "sattu" && p.productType !== "other") ||
        (typeFilter === "other" && p.productType === "other");

      const itemTag = p.productType === "other" ? p.category : p.flavor;
      const matchesTag =
        selectedTag === "All" ||
        (itemTag && itemTag.toLowerCase() === selectedTag.toLowerCase());

      return matchesSearch && matchesType && matchesTag;
    });
  }, [products, searchQuery, typeFilter, selectedTag]);

  return (
    <section className="bg-white rounded-3xl border border-[#E5DEC9] shadow-[0_4px_25px_rgba(0,0,0,0.03)] overflow-hidden">
      
      {/* TABLE HEADER & FILTER TOOLBAR */}
      <div className="p-6 md:p-8 border-b border-[#E5DEC9] bg-[#FDFBF7] space-y-6">
        
        {/* Title row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-3 py-1 rounded-full bg-[#976E2A]/15 text-[#976E2A] text-xs font-poppins font-black uppercase tracking-widest border border-[#976E2A]/30 flex items-center gap-1.5 shadow-2xs">
                <Sparkles size={13} /> Master Catalog
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-poppins font-black text-[#2A1B12] tracking-tight">
              {title}
            </h2>
            <p className="text-xs sm:text-sm text-[#7A6E63] font-semibold mt-1">
              {subtitle}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-4 py-2 rounded-full bg-[#FAF7F2] text-[#976E2A] text-xs sm:text-sm font-extrabold uppercase tracking-widest border border-[#E5DEC9] shadow-2xs">
              {filteredProducts.length} {filteredProducts.length === 1 ? "Product" : "Products"} Listed
            </span>
          </div>
        </div>

        {/* CONTROLS STRIP */}
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between pt-2">
          
          {/* Search Box */}
          <div className="relative w-full lg:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#976E2A]" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, flavor, or category..."
              className="w-full bg-white border border-[#E5DEC9] focus:border-[#976E2A] focus:ring-1 focus:ring-[#976E2A] outline-none py-3 pl-11 pr-4 rounded-2xl text-sm font-semibold text-[#2A1B12] transition-all shadow-xs"
            />
          </div>

          {/* Segmented Type Switcher */}
          <div className="flex items-center gap-2 w-full lg:w-auto overflow-x-auto pb-1 scrollbar-none">
            
            <div className="flex items-center p-1 bg-white border border-[#E5DEC9] rounded-2xl shadow-xs">
              <button
                type="button"
                onClick={() => setTypeFilter("all")}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
                  typeFilter === "all"
                    ? "bg-[#2A1B12] text-white shadow-xs"
                    : "text-[#7A6E63] hover:text-[#2A1B12]"
                }`}
              >
                All Items
              </button>
              <button
                type="button"
                onClick={() => setTypeFilter("sattu")}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                  typeFilter === "sattu"
                    ? "bg-[#6b4f3a] text-white shadow-xs"
                    : "text-[#7A6E63] hover:text-[#2A1B12]"
                }`}
              >
                <Package size={14} />
                <span>Sattu Only</span>
              </button>
              <button
                type="button"
                onClick={() => setTypeFilter("other")}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                  typeFilter === "other"
                    ? "bg-[#976E2A] text-white shadow-xs"
                    : "text-[#7A6E63] hover:text-[#2A1B12]"
                }`}
              >
                <Boxes size={14} />
                <span>Other Products</span>
              </button>
            </div>

            {/* Quick Tag Filter */}
            {tagsList.length > 2 && (
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="bg-white border border-[#E5DEC9] text-xs font-bold text-[#2A1B12] px-3.5 py-2.5 rounded-2xl outline-none shadow-xs cursor-pointer"
              >
                {tagsList.map(t => (
                  <option key={t} value={t}>{t === "All" ? "All Tags & Flavors" : t}</option>
                ))}
              </select>
            )}

          </div>

        </div>

      </div>

      {/* TABLE DATA */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-[#F7F4EE] border-b border-[#E5DEC9]">
            <tr className="text-xs font-poppins font-black text-[#6b4f3a] uppercase tracking-wider">
              <th className="px-6 py-4.5">Product Details</th>
              <th className="px-6 py-4.5">Type & Tag</th>
              <th className="px-6 py-4.5">Pricing</th>
              <th className="px-6 py-4.5">Stock Tiers & Units</th>
              <th className="px-6 py-4.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5DEC9]/60">
            {filteredProducts.map((row) => {
              const isSattu = row.productType !== "other";
              const tagLabel = isSattu ? (row.flavor || "Classic") : (row.category || "General");

              return (
                <tr key={row.id} className="hover:bg-[#FDFBF7] transition-colors group">
                  
                  {/* Product Info */}
                  <td className="px-6 py-4.5 text-[#2A1B12]">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-white border border-[#E5DEC9] p-1.5 flex items-center justify-center shrink-0 overflow-hidden shadow-xs group-hover:border-[#976E2A] transition-colors">
                        <img
                          src={row.image || row.images?.[0] || "https://images.unsplash.com/photo-1594488651083-023b857dc3f8?q=80&w=600&auto=format&fit=crop"}
                          alt={row.name}
                          className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                      <div>
                        <div className="font-poppins font-bold text-sm sm:text-base text-[#2A1B12] group-hover:text-[#6b4f3a] transition-colors">
                          {row.name}
                        </div>
                        <div className="text-xs text-[#7A6E63] font-semibold flex items-center gap-2 mt-1">
                          <span>{row.net_quantity || "Standard Pack"}</span>
                          <span>•</span>
                          <span className="text-[#976E2A] font-extrabold">★ {row.rating || 4.8}</span>
                          {row.tagline && (
                            <>
                              <span>•</span>
                              <span className="text-gray-500 truncate max-w-xs">{row.tagline}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Type & Category/Flavor */}
                  <td className="px-6 py-4.5">
                    <div className="flex flex-col gap-1 items-start">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          isSattu
                            ? "bg-[#6b4f3a]/15 text-[#6b4f3a] border border-[#6b4f3a]/25"
                            : "bg-[#976E2A]/15 text-[#976E2A] border border-[#976E2A]/25"
                        }`}
                      >
                        {isSattu ? "🌾 Sattu" : "🌿 Other Organic"}
                      </span>
                      <span className="text-xs font-bold text-[#2A1B12]">
                        {tagLabel}
                      </span>
                    </div>
                  </td>

                  {/* Pricing */}
                  <td className="px-6 py-4.5">
                    <div className="font-sans font-black text-base text-[#2A1B12]">
                      ₹{Number(row.price || 0).toFixed(0)}
                    </div>
                    {row.original_price > row.price && (
                      <div className="text-xs text-gray-400 line-through font-semibold mt-0.5">
                        MRP ₹{row.original_price}
                      </div>
                    )}
                  </td>

                  {/* Variant Stock Tiers */}
                  <td className="px-6 py-4.5">
                    {row.variants && row.variants.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5 max-w-sm">
                        {row.variants.map((v, i) => {
                          const count = v.stock_count !== undefined ? Number(v.stock_count) : (v.stock_status === "Out of Stock" ? 0 : 50);
                          return (
                            <span
                              key={i}
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-xs font-bold ${statusBadgeClasses(count)}`}
                            >
                              <span className="font-black text-[#2A1B12]">{v.weight || `T${i + 1}`}:</span>
                              <span>{count} units</span>
                            </span>
                          );
                        })}
                      </div>
                    ) : (
                      <span
                        className={`inline-flex items-center px-3.5 py-1.5 rounded-full border text-xs font-bold ${statusBadgeClasses(row.stock_count)}`}
                      >
                        {row.stock_count !== undefined ? `${row.stock_count} units` : (row.stock_status || "In Stock")}
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4.5">
                    <div className="flex justify-end gap-2.5">
                      <button
                        type="button"
                        onClick={() => onEdit(row)}
                        className="p-2.5 rounded-2xl bg-[#F7F4EE] text-[#6b4f3a] hover:bg-[#6b4f3a] hover:text-white border border-[#E5DEC9] transition-all shadow-xs cursor-pointer"
                        title="Edit Product"
                      >
                        <Edit size={17} />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to delete "${row.name}" from catalog?`)) {
                            onDelete(row.id);
                          }
                        }}
                        className="p-2.5 rounded-2xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border border-red-200 transition-all shadow-xs cursor-pointer"
                        title="Delete Product"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </td>

                </tr>
              );
            })}

            {filteredProducts.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-14 text-center text-[#7A6E63]">
                  <div className="max-w-xs mx-auto space-y-2">
                    <AlertCircle size={32} className="mx-auto text-amber-600 opacity-60" />
                    <p className="font-extrabold text-base text-[#2A1B12]">No Products Found</p>
                    <p className="text-xs sm:text-sm font-semibold">
                      No products match your current search or filter criteria.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default ProductsTable;
