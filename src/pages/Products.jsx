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
  ChevronDown,
  Leaf,
  ShieldCheck,
  Tag,
  RotateCcw,
  Check,
  Grid,
  LayoutGrid
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

const FLAVORS = [
  "All",
  "Classic Roasted",
  "Elaichi",
  "Rose",
  "Dry Fruit",
  "Chocolate",
  "Namkeen Spicy"
];

const WEIGHT_OPTIONS = ["All Sizes", "250g", "500g", "1kg"];

const PRICE_RANGES = [
  { label: "All Prices", min: 0, max: Infinity },
  { label: "Under ₹200", min: 0, max: 200 },
  { label: "₹200 - ₹500", min: 200, max: 500 },
  { label: "Above ₹500", min: 500, max: Infinity },
];

const ProductCard = ({ product, idx, triggerToast, gridCols }) => {
  const navigate = useNavigate();
  const { addToCart, addToWishlist, removeFromWishlist, wishlist, cart } = useStore();
  
  // Normalize variants or default single variant
  const variants = useMemo(() => {
    if (product.variants && product.variants.length > 0) {
      return product.variants;
    }
    return [
      {
        weight: product.net_quantity || product.weight || "500g",
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
      transition={{ delay: Math.min(idx * 0.04, 0.25) }}
      onClick={() => navigate(`/product/${product.id}`)}
      className="group bg-white rounded-3xl shadow-[0_4px_25px_rgba(0,0,0,0.04)] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-5 relative cursor-pointer flex flex-col h-full border border-[#E5DEC9]/80 hover:border-[#976E2A]"
    >
      {/* Top Left Discount Tag */}
      {savingsPercent > 0 && (
        <div className="absolute top-0 left-4 bg-[#6b4f3a] text-white px-3 py-2 flex flex-col items-center justify-center text-center rounded-b-xl z-10 min-w-[44px] shadow-sm">
          <span className="text-sm font-sans font-black leading-none">{savingsPercent}%</span>
          <span className="text-[9px] font-poppins font-extrabold uppercase tracking-tighter mt-0.5">OFF</span>
        </div>
      )}

      {/* Numeric Stock Tag */}
      <div className={`absolute top-3 right-3 z-10 text-xs font-extrabold uppercase px-3 py-1 rounded-full border shadow-2xs ${
        stockCount > 5
          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
          : stockCount > 0
          ? "bg-amber-50 text-amber-800 border-amber-200"
          : "bg-red-50 text-red-600 border-red-200"
      }`}>
        {stockCount > 5
          ? "In Stock"
          : stockCount > 0
          ? `Only ${stockCount} left!`
          : "Out of Stock"}
      </div>

      {/* Product Image Block */}
      <div className="relative w-full aspect-square flex items-center justify-center bg-[#FDFBF7] rounded-2xl mb-4 overflow-hidden p-3 border border-[#F2EDE2]">
        <img
          src={product.image || product.images?.[0] || "https://images.unsplash.com/photo-1594488651083-023b857dc3f8?q=80&w=600&auto=format&fit=crop"}
          alt={product.name}
          className="w-auto h-full max-h-full object-contain transition-transform duration-500 group-hover:scale-108"
        />
      </div>

      {/* Content Meta Layer */}
      <div className="flex flex-col flex-grow">
        {/* Category & Flavor Badge */}
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <span className="text-xs font-poppins font-extrabold uppercase tracking-wider text-[#976E2A] bg-[#FAF4E3] border border-[#E5DEC9] px-3 py-1 rounded-full">
            {product.category || (product.productType === "other" ? "Organic Item" : "Sattu Blend")}
          </span>
          {product.flavor && (
            <span className="text-xs font-bold text-[#7A6E63] truncate">
              {product.flavor}
            </span>
          )}
        </div>

        <h3 className="text-base sm:text-lg font-poppins font-black text-[#2A1B12] mb-1.5 tracking-tight leading-snug line-clamp-1 group-hover:text-[#6b4f3a] transition-colors">
          {product.name}
        </h3>

        {/* Rating Stars */}
        <div className="flex items-center gap-1.5 mb-2.5">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={14}
                className={
                  i < Math.floor(product.rating || 4.5)
                    ? "fill-[#F5A623] text-[#F5A623]"
                    : "fill-gray-200 text-gray-200"
                }
              />
            ))}
          </div>
          <span className="text-xs font-sans font-bold text-[#2A1B12]">
            {product.rating || "4.5"}
          </span>
          <span className="text-xs font-sans text-gray-400 font-semibold">
            ({product.reviewsCount || 84})
          </span>
        </div>

        {/* QUANTITY / WEIGHT VARIANT SELECTOR */}
        {variants.length > 0 && (
          <div className="my-2.5" onClick={(e) => e.stopPropagation()}>
            <div className="text-xs font-extrabold text-[#7A6E63] uppercase tracking-wider mb-1.5">Select Pack Size:</div>
            <div className="flex flex-wrap gap-1.5">
              {variants.map((v, vIdx) => (
                <button
                  key={vIdx}
                  type="button"
                  onClick={() => setSelectedVariantIdx(vIdx)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                    selectedVariantIdx === vIdx
                      ? "bg-[#6b4f3a] text-white border-[#6b4f3a] shadow-2xs font-extrabold"
                      : v.stock_status === "Out of Stock"
                      ? "bg-red-50 text-red-400 border-red-200 line-through opacity-70"
                      : "bg-[#FDFBF7] text-[#2A1B12] border-[#E5DEC9] hover:border-[#6b4f3a]"
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
          <span className="text-xl sm:text-2xl font-sans font-black text-[#2A1B12]">
            ₹{displayPrice}
          </span>
          {originalPrice > displayPrice && (
            <span className="text-xs sm:text-sm text-gray-400 line-through font-sans font-semibold">
              ₹{originalPrice}
            </span>
          )}
          {savingsAmount > 0 && (
            <span className="bg-[#EAF7ED] text-[#218742] text-xs font-sans font-extrabold px-2.5 py-0.5 rounded-lg tracking-wide border border-emerald-200/60">
              Save ₹{savingsAmount}
            </span>
          )}
        </div>
      </div>

      {/* Actions Row */}
      <div className="flex items-center gap-2.5 w-full mt-auto">
        <button
          onClick={(e) => handleAction(e, "cart")}
          disabled={isOutOfStock || isMaxInCart}
          className={`flex-1 text-xs font-poppins font-extrabold uppercase tracking-wider py-3 px-3 rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
            isOutOfStock
              ? "bg-red-100 text-red-500 border border-red-200 cursor-not-allowed"
              : isMaxInCart
              ? "bg-amber-100 text-amber-800 cursor-not-allowed border border-amber-200"
              : isInCart
              ? "bg-[#6b4f3a]/15 text-[#6b4f3a] border border-[#6b4f3a]/30"
              : "bg-[#6b4f3a] text-white hover:bg-[#2A1B12] shadow-md shadow-[#6b4f3a]/20"
          }`}
        >
          <span>{isOutOfStock ? "OUT OF STOCK" : isMaxInCart ? "MAX IN BAG" : isInCart ? "ADD MORE" : "ADD TO CART"}</span>
          {!isOutOfStock && !isMaxInCart && <ShoppingBag size={15} strokeWidth={2.5} />}
        </button>

        <button
          onClick={(e) => handleAction(e, "wishlist")}
          className={`p-3 border rounded-2xl flex items-center justify-center transition-all duration-200 h-[44px] w-[44px] shrink-0 cursor-pointer ${
            isWishlisted
              ? "bg-[#5C0612] text-white border-[#5C0612]"
              : "bg-[#FDFBF7] text-gray-500 border-[#E5DEC9] hover:text-[#6b4f3a] hover:border-[#6b4f3a]"
          }`}
        >
          <Heart
            size={18}
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
  const [selectedFlavor, setSelectedFlavor] = useState("All");
  const [selectedPriceRange, setSelectedPriceRange] = useState(0);
  const [minPriceInput, setMinPriceInput] = useState("");
  const [maxPriceInput, setMaxPriceInput] = useState("");
  const [selectedWeight, setSelectedWeight] = useState("All Sizes");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [onSaleOnly, setOnSaleOnly] = useState(false);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState("featured");
  
  // Mobile Filter Drawer Toggle
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  // Grid layout view (3 or 4 columns)
  const [gridCols, setGridCols] = useState(3);

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

  // Active Filters Count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedCategory !== "All") count++;
    if (selectedFlavor !== "All") count++;
    if (selectedPriceRange !== 0 || minPriceInput || maxPriceInput) count++;
    if (selectedWeight !== "All Sizes") count++;
    if (inStockOnly) count++;
    if (onSaleOnly) count++;
    if (minRating > 0) count++;
    if (searchTerm) count++;
    return count;
  }, [selectedCategory, selectedFlavor, selectedPriceRange, minPriceInput, maxPriceInput, selectedWeight, inStockOnly, onSaleOnly, minRating, searchTerm]);

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

        // Flavor Filter
        const matchesFlavor =
          selectedFlavor === "All" ||
          (p.flavor && p.flavor.toLowerCase() === selectedFlavor.toLowerCase());

        // Price Filter
        let minBound = 0;
        let maxBound = Infinity;
        if (minPriceInput !== "") minBound = Number(minPriceInput) || 0;
        if (maxPriceInput !== "") maxBound = Number(maxPriceInput) || Infinity;

        if (minPriceInput === "" && maxPriceInput === "") {
          const rangePreset = PRICE_RANGES[selectedPriceRange];
          minBound = rangePreset.min;
          maxBound = rangePreset.max;
        }

        const minProductPrice = p.price || p.variants?.[0]?.price || 0;
        const matchesPrice = minProductPrice >= minBound && minProductPrice <= maxBound;

        // Weight Filter
        const matchesWeight =
          selectedWeight === "All Sizes" ||
          p.net_quantity?.toLowerCase().includes(selectedWeight.toLowerCase()) ||
          p.variants?.some((v) => v.weight?.toLowerCase().includes(selectedWeight.toLowerCase()));

        // Stock Filter
        const hasInStockVariant = p.variants
          ? p.variants.some((v) => {
              const count = v.stock_count !== undefined ? Number(v.stock_count) : (v.stock_status === "Out of Stock" ? 0 : 50);
              return count > 0 && v.stock_status !== "Out of Stock";
            })
          : (p.stock_count !== undefined ? p.stock_count > 0 : p.stock_status !== "Out of Stock");
        const matchesStock = !inStockOnly || hasInStockVariant;

        // Discount / On Sale Filter
        const isOnSale = p.original_price > p.price || p.variants?.some(v => v.original_price > v.price);
        const matchesSale = !onSaleOnly || isOnSale;

        // Rating Filter
        const matchesRating = (p.rating || 4.5) >= minRating;

        return matchesSearch && matchesCat && matchesFlavor && matchesPrice && matchesWeight && matchesStock && matchesSale && matchesRating;
      })
      .sort((a, b) => {
        const priceA = a.price || a.variants?.[0]?.price || 0;
        const priceB = b.price || b.variants?.[0]?.price || 0;
        const discountA = (a.original_price || priceA) - priceA;
        const discountB = (b.original_price || priceB) - priceB;

        if (sortBy === "price-asc") return priceA - priceB;
        if (sortBy === "price-desc") return priceB - priceA;
        if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);
        if (sortBy === "newest") return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        if (sortBy === "discount") return discountB - discountA;
        return 0;
      });
  }, [products, searchTerm, selectedCategory, selectedFlavor, selectedPriceRange, minPriceInput, maxPriceInput, selectedWeight, inStockOnly, onSaleOnly, minRating, sortBy]);

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("All");
    setSelectedFlavor("All");
    setSelectedPriceRange(0);
    setMinPriceInput("");
    setMaxPriceInput("");
    setSelectedWeight("All Sizes");
    setInStockOnly(false);
    setOnSaleOnly(false);
    setMinRating(0);
    setSortBy("featured");
  };

  // Render Sidebar Filter Panel
  const FilterSidebarContent = () => (
    <div className="space-y-6 text-[#2A1B12]">
      {/* Sidebar Title & Reset Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#E5DEC9]">
        <h3 className="text-base sm:text-lg font-poppins font-black flex items-center gap-2 text-[#2A1B12]">
          <Filter size={18} className="text-[#976E2A]" /> Filter Catalog
        </h3>
        {activeFiltersCount > 0 && (
          <button
            type="button"
            onClick={resetFilters}
            className="text-xs font-extrabold text-[#976E2A] hover:text-[#2A1B12] flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw size={12} /> Clear ({activeFiltersCount})
          </button>
        )}
      </div>

      {/* 1. CATEGORIES */}
      <div className="space-y-2.5">
        <label className="text-xs font-poppins font-extrabold uppercase tracking-wider text-[#976E2A] block">
          Product Category
        </label>
        <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1 scrollbar-none">
          {ALL_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`w-full text-left px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-between cursor-pointer ${
                selectedCategory === cat
                  ? "bg-[#6b4f3a] text-white font-extrabold shadow-2xs"
                  : "bg-[#FDFBF7] text-[#2A1B12] hover:bg-[#FAF4E3] border border-[#E5DEC9]/60"
              }`}
            >
              <span>{cat}</span>
              {selectedCategory === cat && <Check size={15} />}
            </button>
          ))}
        </div>
      </div>

      {/* 2. FLAVOR / BLEND TYPE */}
      <div className="space-y-2.5 pt-2 border-t border-[#E5DEC9]/60">
        <label className="text-xs font-poppins font-extrabold uppercase tracking-wider text-[#976E2A] block">
          Flavor & Blend
        </label>
        <div className="flex flex-wrap gap-1.5">
          {FLAVORS.map((flavor) => (
            <button
              key={flavor}
              type="button"
              onClick={() => setSelectedFlavor(flavor)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                selectedFlavor === flavor
                  ? "bg-[#976E2A] text-white border-[#976E2A] shadow-2xs"
                  : "bg-white text-[#2A1B12] border-[#E5DEC9] hover:border-[#976E2A]"
              }`}
            >
              {flavor}
            </button>
          ))}
        </div>
      </div>

      {/* 3. PRICE RANGE */}
      <div className="space-y-3 pt-2 border-t border-[#E5DEC9]/60">
        <label className="text-xs font-poppins font-extrabold uppercase tracking-wider text-[#976E2A] block">
          Price Range
        </label>

        {/* Preset Range Buttons */}
        <div className="grid grid-cols-2 gap-2">
          {PRICE_RANGES.map((range, idx) => (
            <button
              key={range.label}
              type="button"
              onClick={() => {
                setSelectedPriceRange(idx);
                setMinPriceInput("");
                setMaxPriceInput("");
              }}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer text-center ${
                selectedPriceRange === idx && minPriceInput === "" && maxPriceInput === ""
                  ? "bg-[#6b4f3a] text-white border-[#6b4f3a]"
                  : "bg-[#FDFBF7] text-[#2A1B12] border-[#E5DEC9]"
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>

        {/* Min / Max Inputs */}
        <div className="flex items-center gap-2 pt-1">
          <input
            type="number"
            placeholder="Min ₹"
            value={minPriceInput}
            onChange={(e) => {
              setMinPriceInput(e.target.value);
              setSelectedPriceRange(0);
            }}
            className="w-1/2 px-3 py-2 rounded-xl border border-[#E5DEC9] text-xs font-bold bg-white outline-none focus:border-[#6b4f3a]"
          />
          <span className="text-xs font-bold text-[#7A6E63]">-</span>
          <input
            type="number"
            placeholder="Max ₹"
            value={maxPriceInput}
            onChange={(e) => {
              setMaxPriceInput(e.target.value);
              setSelectedPriceRange(0);
            }}
            className="w-1/2 px-3 py-2 rounded-xl border border-[#E5DEC9] text-xs font-bold bg-white outline-none focus:border-[#6b4f3a]"
          />
        </div>
      </div>

      {/* 4. PACK / WEIGHT VARIANT */}
      <div className="space-y-2.5 pt-2 border-t border-[#E5DEC9]/60">
        <label className="text-xs font-poppins font-extrabold uppercase tracking-wider text-[#976E2A] block">
          Pack Weight
        </label>
        <div className="grid grid-cols-2 gap-2">
          {WEIGHT_OPTIONS.map((w) => (
            <button
              key={w}
              type="button"
              onClick={() => setSelectedWeight(w)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                selectedWeight === w
                  ? "bg-[#976E2A] text-white border-[#976E2A]"
                  : "bg-[#FDFBF7] text-[#2A1B12] border-[#E5DEC9]"
              }`}
            >
              {w}
            </button>
          ))}
        </div>
      </div>

      {/* 5. STOCK & SPECIAL OFFERS */}
      <div className="space-y-2.5 pt-2 border-t border-[#E5DEC9]/60">
        <label className="text-xs font-poppins font-extrabold uppercase tracking-wider text-[#976E2A] block">
          Availability & Offers
        </label>
        <div className="space-y-2">
          <label className="flex items-center gap-2.5 cursor-pointer select-none text-xs sm:text-sm font-semibold text-[#2A1B12]">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="w-4 h-4 rounded text-[#6b4f3a] focus:ring-0 accent-[#6b4f3a]"
            />
            <span>In Stock Items Only</span>
          </label>
          <label className="flex items-center gap-2.5 cursor-pointer select-none text-xs sm:text-sm font-semibold text-[#2A1B12]">
            <input
              type="checkbox"
              checked={onSaleOnly}
              onChange={(e) => setOnSaleOnly(e.target.checked)}
              className="w-4 h-4 rounded text-[#6b4f3a] focus:ring-0 accent-[#6b4f3a]"
            />
            <span className="flex items-center gap-1.5">
              <Tag size={13} className="text-[#976E2A]" /> On Sale / Discounted
            </span>
          </label>
        </div>
      </div>

      {/* 6. RATING FILTER */}
      <div className="space-y-2.5 pt-2 border-t border-[#E5DEC9]/60">
        <label className="text-xs font-poppins font-extrabold uppercase tracking-wider text-[#976E2A] block">
          Customer Rating
        </label>
        <div className="space-y-1.5">
          {[
            { label: "All Ratings", min: 0 },
            { label: "4.5★ & Above", min: 4.5 },
            { label: "4.0★ & Above", min: 4.0 },
          ].map((r) => (
            <button
              key={r.label}
              type="button"
              onClick={() => setMinRating(r.min)}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between border cursor-pointer ${
                minRating === r.min
                  ? "bg-[#6b4f3a] text-white border-[#6b4f3a]"
                  : "bg-white text-[#2A1B12] border-[#E5DEC9]"
              }`}
            >
              <span>{r.label}</span>
              {minRating === r.min && <Check size={14} />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2A1B12]">
      <PageHeader
        title="Our Heritage Product Range"
        subtitle="Roasted Sattu Blends, Organic Foods & Pure Spices"
        breadcrumbItems={[
          { label: "Home", path: "/" },
          { label: "Products" },
        ]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-10 py-8 md:py-12">
        
        {/* TOP MAIN BAR (Search, Mobile Drawer Trigger, Sort & Active Filter Tags) */}
        <div className="bg-white rounded-3xl p-5 md:p-6 shadow-xs border border-[#E5DEC9] mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            
            {/* Search Input Box */}
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#976E2A]" size={18} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search sattu, snacks, spices..."
                className="w-full bg-[#FAF7F2] border border-[#E5DEC9] focus:border-[#6b4f3a] focus:ring-1 focus:ring-[#6b4f3a] outline-none py-3 pl-11 pr-10 rounded-2xl text-sm font-semibold text-[#2A1B12] transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#2A1B12]"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Mobile Filter Drawer Trigger & Sort Controls */}
            <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
              {/* Mobile Filter Drawer Button */}
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(true)}
                className="lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#6b4f3a] text-white text-xs sm:text-sm font-extrabold shadow-sm"
              >
                <SlidersHorizontal size={16} />
                <span>Filters</span>
                {activeFiltersCount > 0 && (
                  <span className="bg-[#D9A036] text-[#1A1009] text-xs font-black px-2 py-0.5 rounded-full">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              {/* Sort Selection Menu */}
              <div className="flex items-center gap-2 bg-[#FAF7F2] border border-[#E5DEC9] px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold text-[#6b4f3a]">
                <span className="text-[#7A6E63] hidden sm:inline">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent font-extrabold text-[#2A1B12] outline-none cursor-pointer"
                >
                  <option value="featured">Featured Blends</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                  <option value="discount">Highest Discount</option>
                  <option value="newest">Newest Arrivals</option>
                </select>
              </div>

              {/* Desktop Grid Layout Switcher */}
              <div className="hidden xl:flex items-center gap-1 bg-[#FAF7F2] border border-[#E5DEC9] p-1 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setGridCols(3)}
                  className={`p-2 rounded-xl transition-all ${
                    gridCols === 3 ? "bg-[#6b4f3a] text-white shadow-2xs" : "text-[#7A6E63] hover:text-[#2A1B12]"
                  }`}
                  title="3 Columns"
                >
                  <Grid size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setGridCols(4)}
                  className={`p-2 rounded-xl transition-all ${
                    gridCols === 4 ? "bg-[#6b4f3a] text-white shadow-2xs" : "text-[#7A6E63] hover:text-[#2A1B12]"
                  }`}
                  title="4 Columns"
                >
                  <LayoutGrid size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* ACTIVE FILTER PILLS STRIP */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-[#E5DEC9]/60 text-xs font-semibold">
              <span className="text-[#7A6E63] font-bold mr-1">Active Filters:</span>

              {selectedCategory !== "All" && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#6b4f3a]/15 text-[#6b4f3a] font-bold border border-[#6b4f3a]/30">
                  Category: {selectedCategory}
                  <X size={13} className="cursor-pointer" onClick={() => setSelectedCategory("All")} />
                </span>
              )}

              {selectedFlavor !== "All" && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#976E2A]/15 text-[#976E2A] font-bold border border-[#976E2A]/30">
                  Flavor: {selectedFlavor}
                  <X size={13} className="cursor-pointer" onClick={() => setSelectedFlavor("All")} />
                </span>
              )}

              {selectedPriceRange !== 0 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#FAF4E3] text-[#2A1B12] font-bold border border-[#E5DEC9]">
                  {PRICE_RANGES[selectedPriceRange].label}
                  <X size={13} className="cursor-pointer" onClick={() => setSelectedPriceRange(0)} />
                </span>
              )}

              {(minPriceInput !== "" || maxPriceInput !== "") && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#FAF4E3] text-[#2A1B12] font-bold border border-[#E5DEC9]">
                  ₹{minPriceInput || "0"} - ₹{maxPriceInput || "Max"}
                  <X size={13} className="cursor-pointer" onClick={() => { setMinPriceInput(""); setMaxPriceInput(""); }} />
                </span>
              )}

              {selectedWeight !== "All Sizes" && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#FAF4E3] text-[#2A1B12] font-bold border border-[#E5DEC9]">
                  Weight: {selectedWeight}
                  <X size={13} className="cursor-pointer" onClick={() => setSelectedWeight("All Sizes")} />
                </span>
              )}

              {inStockOnly && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
                  In Stock Only
                  <X size={13} className="cursor-pointer" onClick={() => setInStockOnly(false)} />
                </span>
              )}

              {onSaleOnly && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-50 text-amber-800 font-bold border border-amber-200">
                  On Sale
                  <X size={13} className="cursor-pointer" onClick={() => setOnSaleOnly(false)} />
                </span>
              )}

              {minRating > 0 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-50 text-amber-800 font-bold border border-amber-200">
                  {minRating}★ & Above
                  <X size={13} className="cursor-pointer" onClick={() => setMinRating(0)} />
                </span>
              )}

              <button
                type="button"
                onClick={resetFilters}
                className="text-[#976E2A] font-extrabold hover:underline ml-2 cursor-pointer"
              >
                Reset All
              </button>
            </div>
          )}
        </div>

        {/* MAIN LAYOUT: SIDEBAR FILTER (LEFT) + PRODUCTS GRID (RIGHT) */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* DESKTOP STICKY SIDEBAR */}
          <aside className="hidden lg:block w-72 shrink-0 sticky top-28 bg-white rounded-3xl p-6 border border-[#E5DEC9] shadow-xs">
            <FilterSidebarContent />
          </aside>

          {/* MAIN PRODUCT CATALOG GRID AREA */}
          <main className="flex-1 w-full">
            
            {/* Results Header Count */}
            <div className="flex items-center justify-between mb-5">
              <span className="text-xs sm:text-sm font-poppins font-extrabold text-[#7A6E63] uppercase tracking-wider">
                Showing <span className="text-[#2A1B12] font-black">{filteredProducts.length}</span> {filteredProducts.length === 1 ? "Product" : "Products"}
              </span>
            </div>

            {/* PRODUCT GRID */}
            {loading ? (
              <div className={`grid gap-6 ${gridCols === 4 ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"}`}>
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="h-96 bg-white border border-[#E5DEC9] rounded-3xl animate-pulse"
                  />
                ))}
              </div>
            ) : (
              <div className={`grid gap-6 ${gridCols === 4 ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"}`}>
                {filteredProducts.map((product, idx) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    idx={idx}
                    triggerToast={triggerToast}
                    gridCols={gridCols}
                  />
                ))}
              </div>
            )}

            {/* EMPTY STATE */}
            {!loading && filteredProducts.length === 0 && (
              <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-[#E5DEC9] max-w-lg mx-auto shadow-xs my-8 p-8">
                <div className="w-16 h-16 rounded-3xl bg-[#FAF4E3] border border-[#E5DEC9] flex items-center justify-center text-[#976E2A] mx-auto mb-4">
                  <Search size={28} />
                </div>
                <h3 className="text-xl font-poppins font-black text-[#2A1B12] mb-2">
                  No Matching Products Found
                </h3>
                <p className="text-xs sm:text-sm text-[#7A6E63] font-medium max-w-xs mx-auto mb-6">
                  We couldn't find any products matching your selected search or filter criteria.
                </p>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-[#6b4f3a] text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider hover:bg-[#2A1B12] transition-colors cursor-pointer shadow-md shadow-[#6b4f3a]/20"
                >
                  <span>Reset All Filters</span>
                  <RotateCcw size={15} />
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* MOBILE FILTER OVERLAY DRAWER */}
      <AnimatePresence>
        {isMobileFilterOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#140D08]/70 backdrop-blur-md z-[250] flex justify-end"
            onClick={() => setIsMobileFilterOpen(false)}
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-white h-full overflow-y-auto p-6 flex flex-col shadow-2xl"
            >
              <div className="flex items-center justify-between pb-4 border-b border-[#E5DEC9] mb-6">
                <h3 className="text-lg font-poppins font-black text-[#2A1B12] flex items-center gap-2">
                  <Filter size={20} className="text-[#976E2A]" /> Filter Products
                </h3>
                <button
                  type="button"
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="p-2 rounded-2xl bg-[#FAF7F2] text-[#7A6E63] hover:text-[#2A1B12] cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1">
                <FilterSidebarContent />
              </div>

              <div className="pt-6 border-t border-[#E5DEC9] mt-6">
                <button
                  type="button"
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="w-full py-3.5 rounded-2xl bg-[#6b4f3a] text-white text-xs sm:text-sm font-extrabold uppercase tracking-wider shadow-lg shadow-[#6b4f3a]/25 hover:bg-[#2A1B12] transition-all cursor-pointer"
                >
                  Apply Filters ({filteredProducts.length} Results)
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FEEDBACK TOAST */}
      <AnimatePresence>
        {feedbackMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 20, x: "-50%" }}
            className="fixed bottom-12 left-1/2 z-[300] bg-[#2A1B12] text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 backdrop-blur-xl max-w-md w-[90%] border border-[#D9A036]/30"
          >
            <div className="w-9 h-9 rounded-xl bg-[#D9A036]/20 text-[#D9A036] flex items-center justify-center shrink-0 border border-[#D9A036]/30">
              <Sparkles size={18} />
            </div>
            <p className="text-xs sm:text-sm font-poppins font-semibold tracking-wide flex-1">
              {feedbackMessage}
            </p>
            <button
              onClick={() => setFeedbackMessage(null)}
              className="opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
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
