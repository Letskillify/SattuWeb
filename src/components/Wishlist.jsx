import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart, Trash2, ShoppingBag, ArrowRight, Sparkles, X, ChevronRight, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PageHeader from "./Sattu/PageHeader";
import { useStore } from "./StoreProvider";

const Wishlist = () => {
  const { wishlist, removeFromWishlist, addToCart, loading } = useStore();
  const navigate = useNavigate();
  const [feedbackMessage, setFeedbackMessage] = useState(null);

  const triggerToast = (msg) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  const handleMoveToCart = async (product) => {
    await addToCart(product);
    await removeFromWishlist(product.id);
    triggerToast(`Moved "${product.name}" to your cart!`);
  };

  const premiumEase = [0.16, 1, 0.3, 1];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex flex-col items-center justify-center gap-4 relative">
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 border-4 border-[#6b4f3a]/20 rounded-full" />
          <div className="absolute inset-0 border-4 border-t-[#D9A036] rounded-full animate-spin" />
        </div>
        <p className="text-xs font-black uppercase tracking-widest text-[#2A1B12]">Loading Saved Items...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] relative selection:bg-[#D9A036] selection:text-[#2A1B12] font-poppins pb-24">
      <PageHeader
        title="My Wishlist"
        subtitle="Saved Gems & Favorites"
        breadcrumbItems={[
          { label: "Home", path: "/" },
          { label: "Shop", path: "/shop" },
          { label: "Wishlist" },
        ]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-12 relative z-10">
        {wishlist.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl border-2 border-[#6b4f3a]/15 p-10 sm:p-16 text-center shadow-xl shadow-[#2A1B12]/5 max-w-xl mx-auto flex flex-col items-center"
          >
            <div className="w-20 h-20 rounded-full bg-[#FAF7F2] border-2 border-[#D9A036]/40 flex items-center justify-center text-[#6b4f3a] mb-6 shadow-md">
              <Heart size={36} strokeWidth={1.8} className="text-rose-500 fill-rose-100" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-[#2A1B12] uppercase tracking-tight mb-3">
              Your Wishlist is Empty
            </h3>
            <p className="text-sm text-[#6b4f3a] font-medium max-w-xs mb-8 leading-relaxed">
              Explore our collection of authentic heritage Sattu blends and save your favorites here.
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#6b4f3a] to-[#2A1B12] text-white font-black text-xs sm:text-sm uppercase tracking-widest rounded-2xl hover:shadow-xl hover:scale-105 transition-all duration-300 shadow-md border border-[#D9A036]/40 group"
            >
              <span>Browse Products</span>
              <ArrowRight size={16} className="text-[#D9A036] group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-8">
            {/* Header Unit */}
            <div className="flex items-center justify-between border-b-2 border-[#6b4f3a]/15 pb-4 px-1">
              <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-[#2A1B12] flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
                <span>Saved Items ({wishlist.length})</span>
              </h2>
              <Link to="/shop" className="text-xs font-black uppercase text-[#6b4f3a] hover:text-[#D9A036] hover:underline flex items-center gap-1">
                <span>Continue Shopping</span>
                <ChevronRight size={14} />
              </Link>
            </div>

            {/* Compact High-Density Product Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {wishlist.map((item, idx) => {
                const itemPrice = Number(item.price) || 0;
                const originalPrice = Math.round(itemPrice * 1.25);
                const productImage = item.image || item.images?.[0] || "/placeholder.png";

                return (
                  <motion.div
                    key={`${item.id}-${idx}`}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04, duration: 0.4, ease: premiumEase }}
                    className="group relative bg-white rounded-2xl p-3.5 sm:p-4 border-2 border-[#6b4f3a]/15 hover:border-[#D9A036]/60 transition-all duration-300 shadow-md hover:shadow-xl flex flex-col justify-between"
                  >
                    {/* Trash Delete Action Button */}
                    <button
                      onClick={() => removeFromWishlist(item.id)}
                      className="absolute top-3 right-3 z-20 w-8 h-8 rounded-xl bg-white/90 text-gray-400 hover:text-rose-600 hover:bg-rose-50 border border-gray-200 flex items-center justify-center transition-all shadow-xs"
                      title="Remove from wishlist"
                    >
                      <Trash2 size={14} />
                    </button>

                    <div>
                      {/* Product Image Frame */}
                      <div
                        onClick={() => navigate(`/product/${item.id}`)}
                        className="relative w-full aspect-square rounded-xl bg-[#FAF7F2] mb-3 border border-[#6b4f3a]/10 cursor-pointer p-3 flex items-center justify-center overflow-hidden"
                      >
                        <img
                          src={productImage}
                          alt={item.name}
                          className="w-full h-full object-contain filter drop-shadow-sm group-hover:scale-108 transition-transform duration-500"
                          onError={(e) => { e.target.src = "https://via.placeholder.com/150?text=Vedamya"; }}
                        />
                      </div>

                      {/* Info & Typography */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-wider text-[#D9A036] bg-[#FAF7F2] px-2 py-0.5 rounded border border-[#6b4f3a]/10 inline-block">
                          {item.flavor || "Natural Sattu"}
                        </span>
                        <h3
                          onClick={() => navigate(`/product/${item.id}`)}
                          className="text-xs sm:text-sm font-black text-[#2A1B12] line-clamp-1 hover:text-[#D9A036] transition-colors cursor-pointer leading-snug"
                        >
                          {item.name}
                        </h3>

                        <div className="flex items-center gap-2 pt-1">
                          <span className="text-base sm:text-lg font-black text-[#2A1B12]">
                            ₹{itemPrice}
                          </span>
                          {originalPrice > itemPrice && (
                            <span className="text-xs text-gray-400 line-through font-medium">
                              ₹{originalPrice}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Button: Move to Cart */}
                    <div className="pt-3 mt-3 border-t border-gray-100 flex items-center gap-2">
                      <button
                        onClick={() => handleMoveToCart(item)}
                        className="w-full py-2 px-3 bg-gradient-to-r from-[#6b4f3a] to-[#2A1B12] hover:from-[#523d2d] hover:to-[#1A1009] text-white rounded-xl font-black text-[11px] sm:text-xs uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer border border-[#D9A036]/30"
                      >
                        <ShoppingBag size={13} className="text-[#D9A036]" />
                        <span>Move to Bag</span>
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {feedbackMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 20, x: "-50%" }}
            className="fixed bottom-10 left-1/2 z-[999] bg-[#2A1B12] text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border-2 border-[#D9A036]/50 max-w-md w-[90%]"
          >
            <Sparkles size={20} className="text-[#D9A036]" />
            <p className="text-xs sm:text-sm font-extrabold uppercase tracking-wider flex-1">{feedbackMessage}</p>
            <button onClick={() => setFeedbackMessage(null)} className="text-gray-400 hover:text-white transition-colors cursor-pointer">
              <X size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Wishlist;
