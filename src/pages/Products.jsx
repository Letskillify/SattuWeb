import React, { useState, useEffect, useMemo } from "react";
import { db } from "../components/Firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import {
  Search,
  Heart,
  ArrowUpRight,
  X,
  Sparkles,
  Star,
  ShoppingBag,
  Filter,
  SlidersHorizontal,
  ChevronRight,
  Leaf,
  Shield,
  Utensils,
  Coffee,
  Info
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import PageHeader from "../components/Sattu/PageHeader";
import { useStore } from "../components/StoreProvider";

const ALL_CATEGORIES = [
  "All",
  "Sattu Mixes",
  "Healthy Snacks",
  "Spices & Herbs",
  "Superfoods & Grains",
  "Oils & Ghee",
  "Pickles & Preserves",
  "Beverages",
  "Organic Staples"
];

const PRICE_RANGES = [
  { label: "All Prices", min: 0, max: Infinity },
  { label: "Under ₹200", min: 0, max: 200 },
  { label: "₹200 - ₹500", min: 200, max: 500 },
  { label: "Above ₹500", min: 500, max: Infinity },
];

const ProductCard = ({ product, idx, triggerToast }) => {
  const navigate = useNavigate();
  const { addToCart, addToWishlist, removeFromWishlist, wishlist, cart } = useStore();
  
  // Normalize variants or default single variant
  const variants = useMemo(() => {
    if (product.variants && product.variants.length > 0) {
      return product.variants;
    }
    return [
      {
        weight: product.net_quantity || product.weight || "Standard",
        price: product.price || 0,
        original_price: product.original_price || product.mrp || Math.round((product.price || 0) * 1.25),
        stock_status: product.stock_status || "In Stock"
      }
    ];
  }, [product]);

  const defaultVariantIdx = useMemo(() => {
    if (!variants || variants.length === 0) return 0;
    const firstInStock = variants.findIndex(v => {
      const count = v.stock_count !== undefined ? Number(v.stock_count) : (v.stock_status === "Out of Stock" ? 0 : 50);
      return count > 0 && v.stock_status !== "Out of Stock";
    });
    return firstInStock !== -1 ? firstInStock : 0;
  }, [variants]);

  const [selectedVariantIdx, setSelectedVariantIdx] = useState(defaultVariantIdx);

  useEffect(() => {
    setSelectedVariantIdx(defaultVariantIdx);
  }, [defaultVariantIdx]);

  const currentVariant = variants[selectedVariantIdx] || variants[0];

  const cartItemId = `${product.id}_${currentVariant.weight}`;
  const existingInCart = cart.find((item) => item.id === cartItemId || item.id === product.id);
  const qtyInCart = existingInCart ? Number(existingInCart.quantity || 1) : 0;
  const isInCart = qtyInCart > 0;
  const isWishlisted = wishlist.some((item) => item.id === product.id);

  const displayPrice = currentVariant.price || product.price || 0;
  const originalPrice = currentVariant.original_price || product.original_price || Math.round(displayPrice * 1.25);
  const savingsAmount = originalPrice > displayPrice ? originalPrice - displayPrice : 0;
  const savingsPercent = originalPrice > displayPrice ? Math.round((savingsAmount / originalPrice) * 100) : 0;
  const stockCount = currentVariant.stock_count !== undefined 
    ? Number(currentVariant.stock_count) 
    : (currentVariant.stock_status === "Out of Stock" ? 0 : 50);
  const isOutOfStock = stockCount <= 0;
  const isMaxInCart = qtyInCart >= stockCount;

  const handleAction = async (e, type) => {
    e.stopPropagation();
    if (type === "cart") {
      if (isOutOfStock || isMaxInCart) return;
      await addToCart(product, 1, currentVariant);
      triggerToast(`Added "${product.name} (${currentVariant.weight})" to cart!`);
    } else {
      if (isWishlisted) {
        await removeFromWishlist(product.id);
        triggerToast("Removed from wishlist");
      } else {
        await addToWishlist(product);
        triggerToast(`Added "${product.name}" to wishlist!`);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: Math.min(idx * 0.05, 0.3) }}
      onClick={() => navigate(`/product/${product.id}`)}
      className="group bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-xl transition-all duration-300 p-5 relative cursor-pointer flex flex-col h-full border border-[#E3DBC5]/60 hover:border-[#6b4f3a]/40"
    >
      {/* Top Left Discount Tag */}
      {savingsPercent > 0 && (
        <div className="absolute top-0 left-4 bg-[#6b4f3a] text-white px-2.5 py-2 flex flex-col items-center justify-center text-center rounded-b-md z-10 min-w-[42px] shadow-sm">
          <span className="text-[13px] font-sans font-black leading-none">{savingsPercent}%</span>
          <span className="text-[9px] font-poppins font-bold uppercase tracking-tighter mt-0.5">OFF</span>
        </div>
      )}

      {/* Numeric Stock Tag */}
      <div className={`absolute top-3 right-3 z-10 text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border shadow-xs ${
        stockCount > 5
          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
          : stockCount > 0
          ? "bg-amber-50 text-amber-700 border-amber-200"
          : "bg-red-50 text-red-600 border-red-200"
      }`}>
        {stockCount > 5
          ? ` in stock`
          : stockCount > 0
          ? `Only ${stockCount} left!`
          : "Out of Stock (0)"}
      </div>

      {/* Image Block */}
      <div className="relative w-full aspect-square flex items-center justify-center bg-[#FDFBF7] rounded-xl mb-3 overflow-hidden p-2">
        <img
          src={product.image || product.images?.[0] || "https://images.unsplash.com/photo-1594488651083-023b857dc3f8?q=80&w=600&auto=format&fit=crop"}
          alt={product.name}
          className="w-auto h-full max-h-full object-contain transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      {/* Content Meta Layer */}
      <div className="flex flex-col flex-grow">
        {/* Category Badge */}
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="text-[10px] font-poppins font-bold uppercase tracking-wider text-[#976E2A] bg-[#976E2A]/10 px-2.5 py-0.5 rounded-full">
            {product.category || (product.productType === "other" ? "Organic Item" : "Sattu Blend")}
          </span>
        </div>

        {/* Product Name */}
        <h3 className="text-base font-poppins font-bold text-[#2E1A0C] mb-1 tracking-tight leading-snug line-clamp-1 group-hover:text-[#6b4f3a] transition-colors">
          {product.name}
        </h3>

        {/* Rating Stars */}
        <div className="flex items-center gap-1.5 mb-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={13}
                className={
                  i < Math.floor(product.rating || 4.5)
                    ? "fill-[#F5A623] text-[#F5A623]"
                    : "fill-gray-200 text-gray-200"
                }
              />
            ))}
          </div>
          <span className="text-[12px] font-sans font-bold text-gray-700">
            {product.rating || "4.5"}
          </span>
          <span className="text-[12px] font-sans text-gray-400">
            ({product.reviewsCount || 84})
          </span>
        </div>

        {/* QUANTITY / WEIGHT VARIANT SELECTOR */}
        {variants.length > 0 && (
          <div className="my-2" onClick={(e) => e.stopPropagation()}>
            <div className="text-[10px] font-bold text-gray-400 uppercase mb-1">Select Quantity / Pack:</div>
            <div className="flex flex-wrap gap-1.5">
              {variants.map((v, vIdx) => (
                <button
                  key={vIdx}
                  type="button"
                  onClick={() => setSelectedVariantIdx(vIdx)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border ${
                    selectedVariantIdx === vIdx
                      ? "bg-[#6b4f3a] text-white border-[#6b4f3a] shadow-xs"
                      : v.stock_status === "Out of Stock"
                      ? "bg-red-50 text-red-400 border-red-200 line-through opacity-70"
                      : "bg-[#FDFBF7] text-[#605948] border-[#E3DBC5] hover:border-[#6b4f3a]"
                  }`}
                >
                  {v.weight}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Pricing Details */}
        <div className="flex items-center gap-2 mb-4 flex-wrap mt-auto pt-2">
          <span className="text-xl font-sans font-extrabold text-[#2E1A0C]">
            ₹{displayPrice}
          </span>
          {originalPrice > displayPrice && (
            <span className="text-[13px] text-gray-400 line-through font-sans font-medium">
              ₹{originalPrice}
            </span>
          )}
          {savingsAmount > 0 && (
            <span className="bg-[#EAF7ED] text-[#218742] text-[11px] font-sans font-bold px-2 py-0.5 rounded tracking-wide">
              Save ₹{savingsAmount}
            </span>
          )}
        </div>
      </div>

      {/* Actions Row */}
      <div className="flex items-center gap-2 w-full mt-auto">
        <button
          onClick={(e) => handleAction(e, "cart")}
          disabled={isOutOfStock || isMaxInCart}
          className={`flex-1 text-[12px] font-poppins font-bold uppercase tracking-wider py-2.5 px-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 ${
            isOutOfStock
              ? "bg-red-100 text-red-500 border border-red-200 cursor-not-allowed"
              : isMaxInCart
              ? "bg-amber-100 text-amber-800 cursor-not-allowed border border-amber-200"
              : isInCart
              ? "bg-[#6b4f3a]/10 text-[#6b4f3a] border border-[#6b4f3a]/30"
              : "bg-[#6b4f3a] text-white hover:bg-[#25160C] shadow-sm"
          }`}
        >
          <span>{isOutOfStock ? "OUT OF STOCK" : isMaxInCart ? "MAX IN BAG" : isInCart ? "ADD MORE" : "ADD TO CART"}</span>
          {!isOutOfStock && !isMaxInCart && <ShoppingBag size={14} strokeWidth={2.5} />}
        </button>

        <button
          onClick={(e) => handleAction(e, "wishlist")}
          className={`p-2.5 border rounded-xl flex items-center justify-center transition-colors duration-200 h-[39px] w-[39px] ${
            isWishlisted
              ? "bg-[#5C0612] text-white border-[#5C0612]"
              : "bg-white text-gray-400 border-gray-200 hover:text-gray-600 hover:bg-gray-50"
          }`}
        >
          <Heart
            size={16}
            fill={isWishlisted ? "currentColor" : "none"}
            strokeWidth={2.2}
          />
        </button>
      </div>
    </motion.div>
  );
};

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedPriceRange, setSelectedPriceRange] = useState(0);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [highRatingOnly, setHighRatingOnly] = useState(false);
  const [sortBy, setSortBy] = useState("featured");

  const [feedbackMessage, setFeedbackMessage] = useState(null);
  const [searchParams] = useSearchParams();
  const urlSearch = searchParams.get("search") || "";
  const urlCategory = searchParams.get("category") || "";

  useEffect(() => {
    if (urlSearch) setSearchTerm(urlSearch);
    if (urlCategory) setSelectedCategory(urlCategory);
  }, [urlSearch, urlCategory]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        setProducts(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const triggerToast = (msg) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  // Filtered & Sorted Products computation
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Search Filter
        const queryLower = searchTerm.toLowerCase().trim();
        const matchesSearch =
          !queryLower ||
          p.name?.toLowerCase().includes(queryLower) ||
          p.description?.toLowerCase().includes(queryLower) ||
          p.ingredients?.toLowerCase().includes(queryLower) ||
          p.category?.toLowerCase().includes(queryLower) ||
          p.flavor?.toLowerCase().includes(queryLower);

        // Category Filter
        let matchesCat = true;
        if (selectedCategory !== "All") {
          if (selectedCategory === "Sattu Mixes") {
            matchesCat = p.productType !== "other" || p.category === "Sattu Mixes";
          } else {
            matchesCat = p.category?.toLowerCase() === selectedCategory.toLowerCase();
          }
        }

        // Price Filter
        const priceRange = PRICE_RANGES[selectedPriceRange];
        const minPrice = p.price || p.variants?.[0]?.price || 0;
        const matchesPrice = minPrice >= priceRange.min && minPrice <= priceRange.max;

        // Stock Filter
        const hasInStockVariant = p.variants
          ? p.variants.some((v) => v.stock_status === "In Stock")
          : p.stock_status === "In Stock";
        const matchesStock = !inStockOnly || hasInStockVariant;

        // Rating Filter
        const matchesRating = !highRatingOnly || (p.rating || 4.5) >= 4.0;

        return matchesSearch && matchesCat && matchesPrice && matchesStock && matchesRating;
      })
      .sort((a, b) => {
        const priceA = a.price || a.variants?.[0]?.price || 0;
        const priceB = b.price || b.variants?.[0]?.price || 0;
        if (sortBy === "price-asc") return priceA - priceB;
        if (sortBy === "price-desc") return priceB - priceA;
        if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);
        if (sortBy === "newest") return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        return 0;
      });
  }, [products, searchTerm, selectedCategory, selectedPriceRange, inStockOnly, highRatingOnly, sortBy]);

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("All");
    setSelectedPriceRange(0);
    setInStockOnly(false);
    setHighRatingOnly(false);
    setSortBy("featured");
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1C2B21]">
      <PageHeader
        title="Our Complete Product Range"
        subtitle="Heritage Sattu Blends & Organic Food Staples"
        breadcrumbItems={[
          { label: "Home", path: "/" },
          { label: "Products" },
        ]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 lg:px-12 py-10">
        
        {/* TOP SEARCH & ACTION BAR */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#E3DBC5]/80 mb-8 space-y-6">
          <div className="flex flex-col lg:flex-row gap-4 justify-between items-center">
            
            {/* Search Input */}
            <div className="relative w-full lg:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#976E2A]" size={18} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search products, ingredients, categories..."
                className="w-full bg-[#FFFDF6] border border-[#E3DBC5] focus:border-[#6b4f3a] outline-none py-3 pl-11 pr-10 rounded-2xl text-sm font-medium text-[#2E1A0C] transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Sort Menu & Toggle Controls */}
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-end">
              <div className="flex items-center gap-2 bg-[#FAF4E3] border border-[#E3DBC5] px-4 py-2.5 rounded-2xl text-xs font-bold text-[#6b4f3a]">
                <SlidersHorizontal size={14} />
                <span>Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent font-bold text-[#6b4f3a] outline-none cursor-pointer"
                >
                  <option value="featured">Featured Blends</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                  <option value="newest">Newest Additions</option>
                </select>
              </div>
            </div>
          </div>

          {/* CATEGORY TABS */}
          <div className="border-t border-[#E3DBC5]/50 pt-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              <span className="text-xs font-bold uppercase tracking-widest text-[#976E2A] shrink-0 mr-2 flex items-center gap-1">
                <Filter size={12} /> Category:
              </span>
              {ALL_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
                    selectedCategory === cat
                      ? "bg-[#6b4f3a] text-white border-[#6b4f3a] shadow-sm"
                      : "bg-[#FFFDF6] text-[#605948] border-[#E3DBC5] hover:border-[#6b4f3a]/40"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* FILTER CRITERIA STRIP (Price Range, Stock, Rating) */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[#E3DBC5]/40 text-xs font-medium">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="text-gray-500 font-semibold mr-1">Price:</span>
                {PRICE_RANGES.map((range, idx) => (
                  <button
                    key={range.label}
                    onClick={() => setSelectedPriceRange(idx)}
                    className={`px-3 py-1 rounded-lg transition-colors ${
                      selectedPriceRange === idx
                        ? "bg-[#976E2A] text-white font-bold"
                        : "bg-[#EFECE6] text-gray-700 hover:bg-[#D9D3C7]"
                    }`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>

              <label className="flex items-center gap-2 cursor-pointer select-none bg-[#EFECE6] px-3 py-1.5 rounded-lg">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="rounded text-[#6b4f3a] focus:ring-0"
                />
                <span className="font-semibold text-gray-800">In Stock Only</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none bg-[#EFECE6] px-3 py-1.5 rounded-lg">
                <input
                  type="checkbox"
                  checked={highRatingOnly}
                  onChange={(e) => setHighRatingOnly(e.target.checked)}
                  className="rounded text-[#6b4f3a] focus:ring-0"
                />
                <span className="font-semibold text-gray-800">4★ & Above</span>
              </label>
            </div>

            <div className="flex items-center gap-4 ml-auto">
              <span className="text-gray-500 font-bold">
                {filteredProducts.length} {filteredProducts.length === 1 ? "Product" : "Products"} Found
              </span>
              {(searchTerm || selectedCategory !== "All" || selectedPriceRange !== 0 || inStockOnly || highRatingOnly) && (
                <button
                  onClick={resetFilters}
                  className="text-[#976E2A] font-bold hover:underline flex items-center gap-1"
                >
                  Reset All
                </button>
              )}
            </div>
          </div>
        </div>

        {/* PRODUCTS GRID */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="h-96 bg-white border border-gray-100 rounded-2xl animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product, idx) => (
              <ProductCard
                key={product.id}
                product={product}
                idx={idx}
                triggerToast={triggerToast}
              />
            ))}
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && filteredProducts.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-[#E3DBC5] max-w-lg mx-auto shadow-sm my-8">
            <div className="w-16 h-16 rounded-full bg-[#FAF4E3] border border-[#E3DBC5] flex items-center justify-center text-[#976E2A] mx-auto mb-4">
              <Search size={24} />
            </div>
            <h3 className="text-xl font-poppins font-bold text-[#6b4f3a] mb-2">
              No Matching Products Found
            </h3>
            <p className="text-sm text-[#707A72] max-w-xs mx-auto mb-6">
              We couldn't find any products matching your specific search or filter criteria.
            </p>
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#6b4f3a] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#25160C] transition-colors"
            >
              <span>Reset Filters</span>
              <ArrowUpRight size={14} />
            </button>
          </div>
        )}
      </div>

      {/* FEEDBACK TOAST */}
      <AnimatePresence>
        {feedbackMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 20, x: "-50%" }}
            className="fixed bottom-12 left-1/2 z-[250] bg-[#6b4f3a] text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 backdrop-blur-xl max-w-md w-[90%]"
          >
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <Sparkles size={16} className="text-[#FAF4E3]" />
            </div>
            <p className="text-xs font-poppins font-medium tracking-wide flex-1">
              {feedbackMessage}
            </p>
            <button
              onClick={() => setFeedbackMessage(null)}
              className="opacity-60 hover:opacity-100 transition-opacity"
            >
              <X size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Products;
