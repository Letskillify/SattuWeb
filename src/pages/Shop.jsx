import React, { useState, useEffect } from "react";
import { db } from "../components/Firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { Search, Heart, ArrowUpRight, X, Sparkles, Star, ShoppingBag } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import PageHeader from "../components/Sattu/PageHeader";
import { useStore } from "../components/StoreProvider";

const ProductCard = ({ product, idx, triggerToast }) => {
  const navigate = useNavigate();
  const { addToCart, addToWishlist, removeFromWishlist, wishlist, cart } = useStore();
  const isWishlisted = wishlist.some(item => item.id === product.id);
  const isInCart = cart.some(item => item.id === product.id);

  // Dynamic Price Calculations
  const displayPrice = product.price;
  const originalPrice = product.mrp || Math.round(product.price * 1.25);
  const savingsAmount = originalPrice - displayPrice;
  const savingsPercent = Math.round((savingsAmount / originalPrice) * 100);

  const handleAction = async (e, type) => {
    e.stopPropagation();
    if (type === 'cart') {
      if (isInCart) return;
      await addToCart(product);
      triggerToast("Added to your selection!");
    } else {
      if (isWishlisted) {
        await removeFromWishlist(product.id);
        triggerToast("Removed from wishlist");
      } else {
        await addToWishlist(product);
        triggerToast("Added to wishlist!");
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: idx * 0.05 }}
      onClick={() => navigate(`/product/${product.id}`)}
      className="bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] p-5 relative cursor-pointer hover:shadow-md transition-all duration-300 flex flex-col h-full border border-gray-100/60"
    >
      {/* 100% Accurate Top-Left Discount Badge */}
      {savingsPercent > 0 && (
        <div className="absolute top-0 left-4 bg-[#6b4f3a] text-white px-2.5 py-2.5 flex flex-col items-center justify-center text-center rounded-b-sm z-10 min-w-[38px]">
          <span className="text-[14px] font-sans font-bold leading-none tracking-tight">{savingsPercent}%</span>
          <span className="text-[14px] font-poppins font-bold uppercase tracking-tighter mt-0.5">OFF</span>
        </div>
      )}

      {/* Structured Image block containing the Pouch Graphic */}
      <div className="relative w-full aspect-square flex items-center justify-center bg-transparent mb-3 overflow-hidden">
        <img
          src={product.image || product.images?.[0]}
          alt={product.name}
          className="w-auto h-full max-h-full object-contain transition-transform duration-500 group-hover:scale-102"
        />
      </div>

      {/* Content Meta Layer */}
      <div className="flex flex-col flex-grow">
        {/* Category Flavour Label */}
        <span className="text-[14px] font-poppins font-semibold uppercase tracking-wider text-gray-400 mb-0.5">
          {product.flavor || "Dry Fruit"}
        </span>
        
        {/* Product Headline Title */}
        <h3 className="text-base font-poppins font-bold text-[#2E1A0C] mb-1 tracking-tight leading-snug line-clamp-1">
          {product.name}
        </h3>

        {/* Ratings block */}
        <div className="flex items-center gap-1 mb-1">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={13} className="fill-[#F5A623] text-[#F5A623]" />
            ))}
          </div>
          <span className="text-[14px] font-sans font-bold text-gray-700 ml-0.5">4.5</span>
          <span className="text-[14px] font-sans text-gray-400">({product.reviewsCount || 125})</span>
        </div>

        {/* Net Quantity/Weight Metric Container */}
        <span className="text-[14px] font-sans font-medium text-gray-400 mb-3 block">
          {product.weight || "500g"}
        </span>

        {/* Pricing Layout Structure */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className="text-xl font-sans font-extrabold text-[#2E1A0C]">
            &nbsp;₹{displayPrice}
          </span>
          <span className="text-[14px] text-gray-400 line-through font-sans font-medium">
            ₹{originalPrice}
          </span>
          <div className="bg-[#EAF7ED] text-[#218742] text-[14px] font-sans font-bold px-2 py-0.5 rounded-sm tracking-wide">
            Save ₹{savingsAmount} ({savingsPercent}%)
          </div>
        </div>
      </div>

      {/* Fully Aligned Action Row Elements */}
      <div className="flex items-center gap-2 w-full mt-auto">
        <button
          onClick={(e) => handleAction(e, 'cart')}
          disabled={isInCart}
          className={`flex-1 text-[14px] font-poppins font-bold uppercase tracking-wider py-2.5 px-4 rounded transition-all duration-200 flex items-center justify-center gap-2 ${
            isInCart
              ? "bg-gray-100 text-gray-400 cursor-default"
              : "bg-[#6b4f3a] text-white hover:bg-[#25160C] shadow-sm"
          }`}
        >
          <span>{isInCart ? "IN BAG" : "ADD TO CART"}</span>
          <ShoppingBag size={13} strokeWidth={2.5} />
        </button>

        <button
          onClick={(e) => handleAction(e, 'wishlist')}
          className={`p-2.5 border rounded-md flex items-center justify-center transition-colors duration-200 h-[37px] w-[37px] ${
            isWishlisted
              ? "bg-[#5C0612] text-white border-[#5C0612]"
              : "bg-white text-gray-400 border-gray-200 hover:text-gray-600 hover:bg-gray-50"
          }`}
        >
          <Heart size={15} fill={isWishlisted ? "currentColor" : "none"} strokeWidth={2.2} />
        </button>
      </div>
    </motion.div>
  );
};

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFlavor, setSelectedFlavor] = useState("All");
  const [feedbackMessage, setFeedbackMessage] = useState(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlSearch = searchParams.get("search") || "";

  const { wishlist, cart } = useStore();

  useEffect(() => {
    if (urlSearch) {
      setSearchTerm(urlSearch);
    }
  }, [urlSearch]);

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

  const flavors = ["All", "Classic Roasted", "Elaichi", "Rose", "Dry Fruit", "Chocolate", "Namkeen Spicy"];

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFlavor =
      selectedFlavor === "All" ||
      (p.flavor && p.flavor.toLowerCase() === selectedFlavor.toLowerCase());
    return matchesSearch && matchesFlavor;
  });

  return (
    <div className="min-h-screen bg-transparent">
      <PageHeader
        title="Premium Sattu"
        subtitle="Heritage Selection"
        breadcrumbItems={[
          { label: "Home", path: "/" },
          { label: "Shop" },
        ]}
      />

      {/* Heritage Detail Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/p6-grain.png')] mix-blend-multiply"></div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 relative z-10 pb-24 pt-12">
        {/* Filters & Search - Matching Homepage Spacing */}
        <div className="flex flex-col lg:flex-row gap-8 mb-20 items-start lg:items-end">
          <div className="w-full lg:w-1/3 space-y-3">
            <label className="text-[14px] font-poppins font-bold uppercase tracking-widest text-[#976E2A] ml-1">Search Our Blends</label>
            <div className="relative group">
              <Search
                className="absolute left-5 top-1/2 -translate-y-1/2 text-[#976E2A]"
                size={18}
              />
              <input
                type="text"
                placeholder="Pure heritage sattu..."
                className="w-full bg-[#FFFDF6] border border-[#E3DBC5] rounded-[20px] pl-12 pr-6 py-5 text-[14px] font-poppins font-medium text-[#6b4f3a] outline-none shadow-sm focus:border-[#976E2A] transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="w-full lg:w-2/3 space-y-3">
            <label className="text-[14px] font-poppins font-bold uppercase tracking-widest text-[#976E2A] ml-1">Filter by Flavor</label>
            <div className="flex flex-wrap gap-3">
              {flavors.map((flavor) => (
                <button
                  key={flavor}
                  onClick={() => setSelectedFlavor(flavor)}
                  className={`px-6 py-3 rounded-xl text-[14px] font-poppins font-bold uppercase tracking-widest transition-all duration-300 border ${selectedFlavor === flavor
                    ? "bg-[#6b4f3a] text-[#FAF4E3] border-[#6b4f3a] shadow-lg shadow-[#6b4f3a]/10"
                    : "bg-[#FFFDF6] text-[#605948] border-[#E3DBC5] hover:border-[#976E2A]/40"
                    }`}
                >
                  {flavor}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Product Collection Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-[450px] bg-white border border-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-12">
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

        {/* Empty Filter Landing */}
        {!loading && filteredProducts.length === 0 && (
          <div className="text-center py-28 bg-[#FFFDF6] rounded-[48px] border-[1.5px] border-dashed border-[#E3DBC5] max-w-xl mx-auto shadow-sm">
            <div className="w-16 h-16 rounded-full bg-[#FAF4E3] border border-[#E3DBC5] flex items-center justify-center text-[#976E2A] mx-auto mb-6">
              <Search size={24} strokeWidth={1.5} />
            </div>
            <h3 className="text-2xl font-poppins font-bold text-[#6b4f3a] mb-2">
              No Blends Found
            </h3>
            <p className="text-sm text-[#605948] font-poppins font-medium max-w-xs mx-auto leading-relaxed">
              We couldn't find any heritage blends matching your criteria.
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedFlavor("All");
              }}
              className="mt-8 inline-flex items-center gap-2 text-[14px] font-poppins font-bold uppercase tracking-[0.2em] text-[#976E2A] hover:text-[#6b4f3a] transition-colors pb-1 border-b border-dashed border-[#976E2A]"
            >
              <span>Reset Selection</span>
              <ArrowUpRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Feedback Toast */}
      <AnimatePresence>
        {feedbackMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 20, x: "-50%" }}
            className="fixed bottom-12 left-1/2 z-50 bg-[#6b4f3a] border border-[#FAF4E3]/10 text-[#FAF4E3] px-8 py-5 rounded-[24px] shadow-2xl flex items-center gap-6 backdrop-blur-xl max-w-md w-[90%]"
          >
            <div className="w-10 h-10 rounded-xl bg-[#FAF4E3]/10 flex items-center justify-center text-[#976E2A]">
              <Sparkles size={20} />
            </div>
            <p className="text-sm font-poppins font-medium tracking-wide flex-1">{feedbackMessage}</p>
            <button
              onClick={() => setFeedbackMessage(null)}
              className="opacity-40 hover:opacity-100 transition-opacity"
            >
              <X size={20} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Shop;
