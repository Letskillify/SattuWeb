import React, { useState, useMemo } from 'react';
import { Edit, Trash2, Search, Filter, Package, AlertCircle } from 'lucide-react';

const statusBadgeClasses = (count) => {
  const num = Number(count) || 0;
  if (num <= 0) return "bg-red-50 text-red-700 border-red-200";
  if (num <= 5) return "bg-amber-50 text-amber-800 border-amber-200";
  return "bg-emerald-50 text-emerald-800 border-emerald-200";
};

const ProductsTable = ({
  products,
  onEdit,
  onDelete,
  title = "Sattu Products Catalog",
  subtitle = "Manage traditional roasted chana sattu products",
  isOther = false
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");

  // Extract unique categories or flavors for filter bar
  const categoriesList = useMemo(() => {
    const list = new Set(["All"]);
    products.forEach((p) => {
      const tag = isOther ? p.category : p.flavor;
      if (tag) list.add(tag);
    });
    return Array.from(list);
  }, [products, isOther]);

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

      const tag = isOther ? p.category : p.flavor;
      const matchesFilter =
        selectedFilter === "All" ||
        (tag && tag.toLowerCase() === selectedFilter.toLowerCase());

      return matchesSearch && matchesFilter;
    });
  }, [products, searchQuery, selectedFilter, isOther]);

  return (
    <section className="bg-white rounded-3xl border border-[#E5DEC9] shadow-[0_4px_25px_rgba(0,0,0,0.03)] overflow-hidden">
      
      {/* TABLE HEADER BAR */}
      <div className="p-6 border-b border-[#E5DEC9] bg-[#FDFBF7] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-poppins font-black text-[#2A1B12] tracking-tight">
              {title}
            </h2>
            <p className="text-xs text-[#7A6E63] font-medium mt-1">{subtitle}</p>
          </div>
          <span className="px-4 py-1.5 rounded-full bg-[#976E2A]/10 text-[#976E2A] text-xs font-extrabold uppercase tracking-widest border border-[#976E2A]/20 self-start sm:self-auto">
            {filteredProducts.length} {filteredProducts.length === 1 ? "Item" : "Items"} Listed
          </span>
        </div>

        {/* SEARCH & CATEGORY FILTER STRIP */}
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between pt-2">
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#976E2A]" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by product name..."
              className="w-full bg-white border border-[#E5DEC9] focus:border-[#6b4f3a] outline-none py-2.5 pl-10 pr-4 rounded-xl text-xs font-semibold text-[#2A1B12] transition-all"
            />
          </div>

          {/* Filter Pills */}
          {categoriesList.length > 1 && (
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 scrollbar-none">
              <span className="text-[11px] font-bold uppercase text-gray-400 mr-1 flex items-center gap-1 shrink-0">
                <Filter size={12} /> Filter:
              </span>
              {categoriesList.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedFilter(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 border ${
                    selectedFilter === cat
                      ? "bg-[#6b4f3a] text-white border-[#6b4f3a]"
                      : "bg-white text-gray-600 border-[#E5DEC9] hover:border-[#6b4f3a]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* TABLE BODY */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-xs">
          <thead className="bg-[#F7F4EE] border-b border-[#E5DEC9]">
            <tr className="text-[11px] font-poppins font-black text-[#6b4f3a] uppercase tracking-widest">
              <th className="px-6 py-4">Product Info</th>
              <th className="px-6 py-4">{isOther ? "Category" : "Flavor"}</th>
              <th className="px-6 py-4">Pricing</th>
              <th className="px-6 py-4">Stock Tiers (Units)</th>
              <th className="px-6 py-4 text-right">Manage Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5DEC9]/60">
            {filteredProducts.map((row) => (
              <tr key={row.id} className="hover:bg-[#FDFBF7] transition-colors group">
                
                {/* Product Info */}
                <td className="px-6 py-4 text-[#2A1B12]">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-white border border-[#E5DEC9] p-1 flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
                      <img
                        src={row.image || row.images?.[0] || "https://images.unsplash.com/photo-1594488651083-023b857dc3f8?q=80&w=600&auto=format&fit=crop"}
                        alt={row.name}
                        className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    <div>
                      <div className="font-poppins font-bold text-sm text-[#2A1B12] group-hover:text-[#6b4f3a] transition-colors">
                        {row.name}
                      </div>
                      <div className="text-[11px] text-[#7A6E63] font-medium flex items-center gap-2 mt-0.5">
                        <span>{row.net_quantity || "Standard Pack"}</span>
                        <span>•</span>
                        <span className="text-[#976E2A] font-bold">★ {row.rating || 4.5}</span>
                      </div>
                    </div>
                  </div>
                </td>

                {/* Category / Flavor */}
                <td className="px-6 py-4">
                  <span className="px-3 py-1 rounded-full bg-[#FAF4E3] text-[#976E2A] border border-[#E5DEC9] text-[11px] font-bold uppercase tracking-wider">
                    {isOther ? (row.category || "General Organic") : (row.flavor || "Classic")}
                  </span>
                </td>

                {/* Pricing */}
                <td className="px-6 py-4">
                  <div className="font-sans font-extrabold text-sm text-[#2A1B12]">
                    ₹{Number(row.price || 0).toFixed(0)}
                  </div>
                  {row.original_price > row.price && (
                    <div className="text-[11px] text-gray-400 line-through font-medium">
                      MRP ₹{row.original_price}
                    </div>
                  )}
                </td>

                {/* Numeric Stock Tiers */}
                <td className="px-6 py-4">
                  {row.variants && row.variants.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 max-w-xs">
                      {row.variants.map((v, i) => {
                        const count = v.stock_count !== undefined ? Number(v.stock_count) : (v.stock_status === "Out of Stock" ? 0 : 50);
                        return (
                          <span
                            key={i}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-bold ${statusBadgeClasses(count)}`}
                          >
                            <span className="font-black text-[#2A1B12]">{v.weight || `T${i + 1}`}:</span>
                            <span>{count} units</span>
                            <span className="opacity-60">₹{v.price}</span>
                          </span>
                        );
                      })}
                    </div>
                  ) : (
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full border text-[11px] font-bold ${statusBadgeClasses(row.stock_count)}`}
                    >
                      {row.stock_count !== undefined ? `${row.stock_count} units` : (row.stock_status || "In Stock")}
                    </span>
                  )}
                </td>

                {/* Actions */}
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => onEdit(row)}
                      className="p-2.5 rounded-xl bg-[#F7F4EE] text-[#6b4f3a] hover:bg-[#6b4f3a] hover:text-white border border-[#E5DEC9] transition-all shadow-xs"
                      title="Edit Product"
                    >
                      <Edit size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to delete "${row.name}"?`)) {
                          onDelete(row.id);
                        }
                      }}
                      className="p-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border border-red-200 transition-all shadow-xs"
                      title="Delete Product"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {filteredProducts.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-[#7A6E63]">
                  <div className="max-w-xs mx-auto space-y-2">
                    <AlertCircle size={28} className="mx-auto text-amber-600 opacity-60" />
                    <p className="font-bold text-sm text-[#2A1B12]">No Products Found</p>
                    <p className="text-xs">No products match your current search or filter criteria.</p>
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
