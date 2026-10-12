import React, { useState, useMemo } from 'react';
import { db } from '../../../components/Firebase';
import { doc, updateDoc } from 'firebase/firestore';
import {
  Boxes,
  Package,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Plus,
  Minus,
  Save,
  RotateCcw,
  Sparkles,
  Edit,
  ArrowUpDown,
  RefreshCw,
  Check,
  TrendingDown
} from 'lucide-react';

const statusBadgeClasses = (count) => {
  const num = Number(count) || 0;
  if (num <= 0) return "bg-red-50 text-red-700 border-red-200";
  if (num <= 5) return "bg-amber-50 text-amber-800 border-amber-200";
  return "bg-emerald-50 text-emerald-800 border-emerald-200";
};

const StockManager = ({ products = [], onProductsUpdated, onEditProduct }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [productTypeFilter, setProductTypeFilter] = useState("all"); // 'all' | 'sattu' | 'other'
  const [stockStatusFilter, setStockStatusFilter] = useState("all"); // 'all' | 'instock' | 'lowstock' | 'outofstock'
  
  // Local state for modified stocks: maps productId -> updated variants / stock_count
  const [stockDrafts, setStockDrafts] = useState({});
  const [savingId, setSavingId] = useState(null);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  // Get current variants for a product (either draft or original)
  const getProductVariants = (product) => {
    if (stockDrafts[product.id]?.variants) {
      return stockDrafts[product.id].variants;
    }
    if (product.variants && product.variants.length > 0) {
      return product.variants.map(v => ({
        ...v,
        stock_count: v.stock_count !== undefined ? Number(v.stock_count) : (v.stock_status === "Out of Stock" ? 0 : 50)
      }));
    }
    // Fallback for single variant product
    return [
      {
        weight: product.net_quantity || "Standard Pack",
        price: product.price || 0,
        original_price: product.original_price || 0,
        stock_count: product.stock_count !== undefined ? Number(product.stock_count) : (product.stock_status === "Out of Stock" ? 0 : 50)
      }
    ];
  };

  // Modify stock count for a specific product variant
  const handleVariantStockChange = (product, variantIndex, newCount) => {
    const validCount = Math.max(0, Number(newCount) || 0);
    const currentVariants = getProductVariants(product);
    const updatedVariants = currentVariants.map((v, idx) => {
      if (idx === variantIndex) {
        const status = validCount <= 0 ? "Out of Stock" : validCount <= 5 ? "Low Stock" : "In Stock";
        return { ...v, stock_count: validCount, stock_status: status };
      }
      return v;
    });

    setStockDrafts(prev => ({
      ...prev,
      [product.id]: {
        variants: updatedVariants,
        hasChanged: true
      }
    }));
  };

  // Quick adjust: add or subtract delta
  const handleQuickAdjust = (product, variantIndex, delta) => {
    const currentVariants = getProductVariants(product);
    const currentCount = currentVariants[variantIndex]?.stock_count || 0;
    handleVariantStockChange(product, variantIndex, currentCount + delta);
  };

  // Save stock update for a single product to Firestore
  const handleSaveStock = async (product) => {
    const updatedVariants = getProductVariants(product);
    setSavingId(product.id);

    try {
      const primaryVariant = updatedVariants[0];
      const primaryCount = Number(primaryVariant?.stock_count) || 0;
      const primaryStatus = primaryCount <= 0 ? "Out of Stock" : primaryCount <= 5 ? "Low Stock" : "In Stock";

      await updateDoc(doc(db, "products", product.id), {
        variants: updatedVariants,
        stock_count: primaryCount,
        stock_status: primaryStatus,
      });

      // Clear draft flag for this product
      setStockDrafts(prev => {
        const copy = { ...prev };
        delete copy[product.id];
        return copy;
      });

      setFeedback({ type: "success", message: `Inventory saved for "${product.name}"!` });
      if (onProductsUpdated) await onProductsUpdated();
    } catch (err) {
      console.error("Stock update error:", err);
      setFeedback({ type: "error", message: "Failed to update inventory: " + err.message });
    } finally {
      setSavingId(null);
      setTimeout(() => setFeedback({ type: "", message: "" }), 3500);
    }
  };

  // KPI Calculations across entire catalog
  const stats = useMemo(() => {
    let totalItems = products.length;
    let inStockCount = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;
    let totalWarehouseUnits = 0;

    products.forEach(p => {
      const variants = getProductVariants(p);
      let pTotalUnits = 0;
      let pIsOutOfStock = true;
      let pIsLowStock = false;

      variants.forEach(v => {
        const count = Number(v.stock_count) || 0;
        pTotalUnits += count;
        if (count > 0) pIsOutOfStock = false;
        if (count > 0 && count <= 5) pIsLowStock = true;
      });

      totalWarehouseUnits += pTotalUnits;

      if (pIsOutOfStock) {
        outOfStockCount++;
      } else if (pIsLowStock || pTotalUnits <= 5) {
        lowStockCount++;
      } else {
        inStockCount++;
      }
    });

    return { totalItems, inStockCount, lowStockCount, outOfStockCount, totalWarehouseUnits };
  }, [products, stockDrafts]);

  // Filtered Products computation
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      // Search filter
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.name?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p.flavor?.toLowerCase().includes(q);

      // Product Type filter
      const matchesType =
        productTypeFilter === "all" ||
        (productTypeFilter === "sattu" && p.productType !== "other") ||
        (productTypeFilter === "other" && p.productType === "other");

      // Stock status filter
      const variants = getProductVariants(p);
      const totalUnits = variants.reduce((acc, v) => acc + (Number(v.stock_count) || 0), 0);
      
      let matchesStock = true;
      if (stockStatusFilter === "outofstock") {
        matchesStock = totalUnits === 0;
      } else if (stockStatusFilter === "lowstock") {
        matchesStock = totalUnits > 0 && totalUnits <= 10;
      } else if (stockStatusFilter === "instock") {
        matchesStock = totalUnits > 10;
      }

      return matchesSearch && matchesType && matchesStock;
    });
  }, [products, searchQuery, productTypeFilter, stockStatusFilter, stockDrafts]);

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* FEEDBACK TOAST */}
      {feedback.message && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between text-sm font-bold shadow-md transition-all ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-900 border border-emerald-200"
              : "bg-red-50 text-red-900 border border-red-200"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedback.type === "success" ? <Check size={18} /> : <AlertTriangle size={18} />}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback({ type: "", message: "" })} className="p-1 hover:opacity-75">
            <Minus size={16} />
          </button>
        </div>
      )}

      {/* KPI METRICS OVERVIEW */}
      <div className="grid gap-5 grid-cols-2 lg:grid-cols-5">
        
        {/* Total SKUs */}
        <div className="bg-white rounded-3xl border border-[#E5DEC9] p-5 shadow-[0_4px_25px_rgba(0,0,0,0.03)] relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-poppins font-black text-[#7A6E63] uppercase tracking-wider">Total Items</span>
            <div className="w-8 h-8 rounded-xl bg-[#976E2A]/10 text-[#976E2A] flex items-center justify-center">
              <Boxes size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-[#2A1B12]">{stats.totalItems}</div>
          <p className="text-[11px] text-[#A69280] font-semibold mt-1">Catalog SKUs</p>
        </div>

        {/* Total Warehouse Units */}
        <div className="bg-white rounded-3xl border border-[#E5DEC9] p-5 shadow-[0_4px_25px_rgba(0,0,0,0.03)] relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-poppins font-black text-[#7A6E63] uppercase tracking-wider">Total Inventory</span>
            <div className="w-8 h-8 rounded-xl bg-[#6b4f3a]/10 text-[#6b4f3a] flex items-center justify-center">
              <Package size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-[#2A1B12]">{stats.totalWarehouseUnits}</div>
          <p className="text-[11px] text-[#A69280] font-semibold mt-1">Units available</p>
        </div>

        {/* In Stock */}
        <div className="bg-white rounded-3xl border border-emerald-200/80 p-5 shadow-[0_4px_25px_rgba(0,0,0,0.03)] relative overflow-hidden bg-gradient-to-br from-white to-emerald-50/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-poppins font-black text-emerald-800 uppercase tracking-wider">Well Stocked</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-800">{stats.inStockCount}</div>
          <p className="text-[11px] text-emerald-700/80 font-semibold mt-1">Healthy levels</p>
        </div>

        {/* Low Stock */}
        <div className="bg-white rounded-3xl border border-amber-200/80 p-5 shadow-[0_4px_25px_rgba(0,0,0,0.03)] relative overflow-hidden bg-gradient-to-br from-white to-amber-50/40">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-poppins font-black text-amber-800 uppercase tracking-wider">Low Stock</span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <AlertTriangle size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-800">{stats.lowStockCount}</div>
          <p className="text-[11px] text-amber-700/80 font-semibold mt-1">Needs reordering</p>
        </div>

        {/* Out of Stock */}
        <div className="bg-white rounded-3xl border border-red-200/80 p-5 shadow-[0_4px_25px_rgba(0,0,0,0.03)] relative overflow-hidden bg-gradient-to-br from-white to-red-50/40 col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-poppins font-black text-red-800 uppercase tracking-wider">Out of Stock</span>
            <div className="w-8 h-8 rounded-xl bg-red-100 text-red-700 flex items-center justify-center">
              <XCircle size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-red-800">{stats.outOfStockCount}</div>
          <p className="text-[11px] text-red-700/80 font-semibold mt-1">Unavailable now</p>
        </div>

      </div>

      {/* FILTER & CONTROLS TOOLBAR */}
      <div className="bg-white rounded-3xl border border-[#E5DEC9] shadow-[0_4px_25px_rgba(0,0,0,0.03)] p-6 md:p-8 space-y-6">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-poppins font-black text-[#2A1B12] tracking-tight">
              Warehouse Inventory Control
            </h2>
            <p className="text-xs sm:text-sm text-[#7A6E63] font-medium mt-1">
              Adjust stock counts for each size variant on the fly. Changes sync straight into the store catalog.
            </p>
          </div>

          <div className="text-xs font-bold text-[#7A6E63]">
            Showing <strong className="text-[#2A1B12]">{filteredProducts.length}</strong> of {products.length} products
          </div>
        </div>

        {/* FILTER BAR */}
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between pt-2">
          
          {/* Search Input */}
          <div className="relative w-full lg:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#976E2A]" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search product name, category, or flavor..."
              className="w-full bg-[#FAF7F2] border border-[#E5DEC9] focus:border-[#976E2A] focus:bg-white outline-none py-3 pl-11 pr-4 rounded-2xl text-sm font-semibold text-[#2A1B12] transition-all"
            />
          </div>

          {/* Type & Stock Status Segmented Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            
            {/* Product Type Buttons */}
            <div className="flex items-center p-1 bg-[#FAF7F2] border border-[#E5DEC9] rounded-2xl">
              <button
                type="button"
                onClick={() => setProductTypeFilter("all")}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  productTypeFilter === "all"
                    ? "bg-[#6b4f3a] text-white shadow-xs"
                    : "text-[#7A6E63] hover:text-[#2A1B12]"
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setProductTypeFilter("sattu")}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  productTypeFilter === "sattu"
                    ? "bg-[#6b4f3a] text-white shadow-xs"
                    : "text-[#7A6E63] hover:text-[#2A1B12]"
                }`}
              >
                🌾 Sattu
              </button>
              <button
                type="button"
                onClick={() => setProductTypeFilter("other")}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  productTypeFilter === "other"
                    ? "bg-[#6b4f3a] text-white shadow-xs"
                    : "text-[#7A6E63] hover:text-[#2A1B12]"
                }`}
              >
                🌿 Other
              </button>
            </div>

            {/* Stock Level Selector */}
            <div className="flex items-center p-1 bg-[#FAF7F2] border border-[#E5DEC9] rounded-2xl">
              <button
                type="button"
                onClick={() => setStockStatusFilter("all")}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  stockStatusFilter === "all"
                    ? "bg-[#976E2A] text-white shadow-xs"
                    : "text-[#7A6E63] hover:text-[#2A1B12]"
                }`}
              >
                All Status
              </button>
              <button
                type="button"
                onClick={() => setStockStatusFilter("lowstock")}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  stockStatusFilter === "lowstock"
                    ? "bg-amber-600 text-white shadow-xs"
                    : "text-amber-800 hover:text-amber-900"
                }`}
              >
                Low (≤10)
              </button>
              <button
                type="button"
                onClick={() => setStockStatusFilter("outofstock")}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  stockStatusFilter === "outofstock"
                    ? "bg-red-600 text-white shadow-xs"
                    : "text-red-700 hover:text-red-900"
                }`}
              >
                Out of Stock (0)
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* PRODUCTS INVENTORY LIST */}
      <div className="space-y-4">
        {filteredProducts.map((product) => {
          const variants = getProductVariants(product);
          const hasDraftChanges = stockDrafts[product.id]?.hasChanged;
          const isSaving = savingId === product.id;
          const isSattu = product.productType !== "other";

          const totalUnits = variants.reduce((sum, v) => sum + (Number(v.stock_count) || 0), 0);

          return (
            <div
              key={product.id}
              className={`bg-white rounded-3xl border transition-all p-5 md:p-6 shadow-[0_4px_25px_rgba(0,0,0,0.03)] ${
                hasDraftChanges
                  ? "border-[#D9A036] ring-2 ring-[#D9A036]/20 bg-[#FDFBF7]"
                  : "border-[#E5DEC9] hover:border-[#D5C9BD]"
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                
                {/* Left: Product Info */}
                <div className="flex items-center gap-4 min-w-[280px]">
                  <div className="w-16 h-16 rounded-2xl bg-[#FAF7F2] border border-[#E5DEC9] p-1.5 flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
                    <img
                      src={product.image || product.images?.[0] || "https://images.unsplash.com/photo-1594488651083-023b857dc3f8?q=80&w=600&auto=format&fit=crop"}
                      alt={product.name}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          isSattu
                            ? "bg-[#6b4f3a]/10 text-[#6b4f3a]"
                            : "bg-[#976E2A]/10 text-[#976E2A]"
                        }`}
                      >
                        {isSattu ? "🌾 Sattu Blend" : "🌿 Organic"}
                      </span>
                      <span className="text-xs font-bold text-[#7A6E63]">
                        {isSattu ? (product.flavor || "Classic") : (product.category || "General")}
                      </span>
                    </div>

                    <h3 className="font-poppins font-black text-base sm:text-lg text-[#2A1B12] leading-snug">
                      {product.name}
                    </h3>

                    <div className="text-xs font-bold text-[#7A6E63] mt-1 flex items-center gap-2">
                      <span>Total Stock: <strong className="text-[#2A1B12]">{totalUnits} units</strong></span>
                      <span>•</span>
                      <span>₹{product.price || 0}</span>
                    </div>
                  </div>
                </div>

                {/* Middle: Variant Stock Steppers */}
                <div className="flex-1 flex flex-wrap items-center gap-3">
                  {variants.map((v, vIdx) => {
                    const count = Number(v.stock_count) || 0;
                    return (
                      <div
                        key={vIdx}
                        className="bg-[#FAF7F2] border border-[#E5DEC9] rounded-2xl p-3 flex flex-col gap-2 min-w-[170px] flex-1 max-w-xs shadow-2xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-poppins font-black text-xs text-[#2A1B12]">
                            {v.weight || `Tier ${vIdx + 1}`}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${statusBadgeClasses(count)}`}>
                            {count <= 0 ? "Out" : count <= 5 ? "Low" : "In Stock"}
                          </span>
                        </div>

                        {/* Quantity Stepper & Direct Input */}
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleQuickAdjust(product, vIdx, -1)}
                            className="w-8 h-8 rounded-xl bg-white border border-[#E5DEC9] hover:bg-[#E5DEC9] text-[#2A1B12] font-black flex items-center justify-center transition-colors cursor-pointer"
                            title="Decrease by 1"
                          >
                            <Minus size={14} />
                          </button>

                          <input
                            type="number"
                            min="0"
                            value={count}
                            onChange={(e) => handleVariantStockChange(product, vIdx, e.target.value)}
                            className="w-16 text-center bg-white border border-[#E5DEC9] focus:border-[#976E2A] outline-none py-1 rounded-xl text-sm font-black text-[#2A1B12]"
                          />

                          <button
                            type="button"
                            onClick={() => handleQuickAdjust(product, vIdx, 1)}
                            className="w-8 h-8 rounded-xl bg-white border border-[#E5DEC9] hover:bg-[#E5DEC9] text-[#2A1B12] font-black flex items-center justify-center transition-colors cursor-pointer"
                            title="Increase by 1"
                          >
                            <Plus size={14} />
                          </button>

                          {/* Quick shortcuts */}
                          <button
                            type="button"
                            onClick={() => handleQuickAdjust(product, vIdx, 10)}
                            className="px-2 py-1 rounded-lg bg-white border border-[#E5DEC9] hover:bg-[#FAF4E3] text-[10px] font-extrabold text-[#976E2A] cursor-pointer"
                            title="Add 10 units"
                          >
                            +10
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2.5 shrink-0 self-end lg:self-center">
                  {onEditProduct && (
                    <button
                      type="button"
                      onClick={() => onEditProduct(product)}
                      className="p-3 rounded-2xl bg-[#FAF7F2] text-[#7A6E63] hover:text-[#2A1B12] hover:bg-[#E5DEC9] border border-[#E5DEC9] transition-all cursor-pointer"
                      title="Edit Full Product Details"
                    >
                      <Edit size={16} />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleSaveStock(product)}
                    disabled={isSaving}
                    className={`px-5 py-3 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 cursor-pointer shadow-md ${
                      hasDraftChanges
                        ? "bg-[#D9A036] text-[#1A1009] hover:bg-[#C68A27] animate-pulse"
                        : "bg-[#2A1B12] text-white hover:bg-[#1A1009]"
                    }`}
                  >
                    {isSaving ? (
                      <RefreshCw size={15} className="animate-spin" />
                    ) : (
                      <Save size={15} />
                    )}
                    <span>{hasDraftChanges ? "Save Changes" : "Update Stock"}</span>
                  </button>
                </div>

              </div>
            </div>
          );
        })}

        {filteredProducts.length === 0 && (
          <div className="p-12 text-center text-[#7A6E63] bg-white rounded-3xl border border-[#E5DEC9]">
            <Boxes size={36} className="mx-auto text-[#976E2A] opacity-50 mb-3" />
            <p className="font-black text-lg text-[#2A1B12]">No Inventory Items Found</p>
            <p className="text-xs sm:text-sm font-medium mt-1">Adjust your search term or stock status filter.</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default StockManager;
