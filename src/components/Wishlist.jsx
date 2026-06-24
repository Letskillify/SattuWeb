import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart, Trash2, ShoppingBag, ArrowRight, Sparkles, X, ChevronRight } from "lucide-react";
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
    triggerToast("Moved to your bag!");
  };

  const premiumEase = [0.25, 1, 0.5, 1];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF4E3] flex flex-col items-center justify-center gap-6 relative">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/p6-grain.png')]" />
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border border-[#E3DBC5] rounded-full" />
          <div className="absolute inset-0 border border-t-[#976E2A] rounded-full animate-spin" />
        </div>
        <p className="text-[14px] font-poppins font-bold uppercase tracking-[0.4em] text-[#976E2A]">Curating Catalog...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF4E3] relative selection:bg-[#976E2A] selection:text-[#FFFDF6]">
      <PageHeader
        title="Saved Gems"
        subtitle="Wishlist Archive"
        breadcrumbItems={[
          { label: "Home", path: "/" },
          { label: "Collection", path: "/shop" },
          { label: "Wishlist" },
        ]}
      />

      {/* Heritage Detail Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/p6-grain.png')] mix-blend-multiply"></div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-20 relative z-10">
        {wishlist.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#FFFDF6] rounded-[48px] border-[1.5px] border-dashed border-[#E3DBC5] p-24 text-center shadow-sm max-w-2xl mx-auto"
          >
            <div className="w-24 h-24 rounded-full bg-[#FAF4E3] border border-[#E3DBC5] flex items-center justify-center text-[#976E2A] mx-auto mb-10">
              <Heart size={40} strokeWidth={1} />
            </div>
            <h3 className="text-4xl font-poppins font-bold text-[#6b4f3a] mb-5 tracking-tight">
              Registry Empty
            </h3>
            <p className="text-sm text-[#6b4f3a]/60 font-poppins max-w-sm mx-auto mb-14 leading-relaxed tracking-wide">
              Your personal curator catalog is currently unassigned. Archive your favorite heritage blends here for future acquisition.
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-4 px-12 py-6 bg-[#6b4f3a] text-[#FFFDF6] font-poppins font-bold text-[14px] uppercase tracking-[0.4em] rounded-2xl hover:bg-[#976E2A] transition-all duration-300 shadow-2xl shadow-[#6b4f3a]/10"
            >
              Discover Boutique
              <ArrowRight size={14} />
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-12">
            <div className="flex items-center justify-between border-b border-[#E3DBC5]/60 pb-8">
              <h2 className="text-[14px] font-poppins font-bold uppercase tracking-[0.5em] text-[#976E2A]">
                {wishlist.length} {wishlist.length === 1 ? "Archive Entry" : "Archive Entries"}
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 xl:gap-10">
              {wishlist.map((item, idx) => (
                <motion.div
                  key={`${item.id}-${idx}`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05, duration: 0.8, ease: premiumEase }}
                  className="group relative bg-[#FFFDF6] rounded-[32px] p-6 border border-[#E3DBC5]/60 transition-all duration-500 hover:shadow-[0_20px_50px_rgba(32,59,35,0.06)] flex flex-col"
                >
                  {/* Removal Micro-Action */}
                  <button
                    onClick={() => removeFromWishlist(item.id)}
                    className="absolute top-4 right-4 z-20 w-10 h-10 rounded-xl bg-white/80 backdrop-blur-sm text-[#6b4f3a]/30 hover:bg-red-50 hover:text-red-500 transition-all duration-300 border border-[#E3DBC5]/40 opacity-0 group-hover:opacity-100 transform translate-y-[-10px] group-hover:translate-y-0"
                  >
                    <X size={16} strokeWidth={2} />
                  </button>

                  {/* Arched Architectural Frame */}
                  <div
                    onClick={() => navigate(`/product/${item.id}`)}
                    className="relative aspect-[4/5] rounded-[24px] overflow-hidden bg-[#FAF4E3] mb-8 border border-[#E3DBC5]/30 cursor-pointer p-6 flex items-center justify-center"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-contain filter drop-shadow-xl transition-transform duration-[1.5s] group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-[#6b4f3a]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>

                  <div className="space-y-4 px-1 flex-grow">
                    <span className="text-[14px] font-poppins font-bold uppercase tracking-[0.35em] text-[#C45525]">
                      {item.flavor || "Artisanal Selection"}
                    </span>
                    <h3
                      onClick={() => navigate(`/product/${item.id}`)}
                      className="text-2xl font-poppins font-bold text-[#6b4f3a] tracking-tight hover:text-[#976E2A] transition-colors cursor-pointer"
                    >
                      {item.name}
                    </h3>

                    <div className="pt-6 border-t border-[#E3DBC5]/40 flex items-center justify-between mt-auto">
                      <span className="text-3xl font-poppins font-bold text-[#6b4f3a]">
                        ₹{Number(item.price).toFixed(0)}
                      </span>
                      <button
                        onClick={() => handleMoveToCart(item)}
                        className="w-14 h-14 bg-[#6b4f3a] text-[#FFFDF6] rounded-[18px] flex items-center justify-center hover:bg-[#976E2A] transition-all duration-500 shadow-xl shadow-[#6b4f3a]/10 group/btn"
                      >
                        <ShoppingBag size={20} strokeWidth={1.5} className="group-hover/btn:scale-110 transition-transform" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Premium Toast Notification System */}
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
            <p className="text-[14px] font-poppins font-bold uppercase tracking-widest flex-1">{feedbackMessage}</p>
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

export default Wishlist;
