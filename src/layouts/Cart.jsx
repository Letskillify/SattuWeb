import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  ShoppingBag, 
  Trash2, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  ArrowRight, 
  Sparkles, 
  ChevronRight, 
  Gift, 
  FileText 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PageHeader from "../components/Sattu/PageHeader";
import { useStore } from "../components/StoreProvider";
import { useAuth } from "../components/useAuth";

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, loading } = useStore();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // State for optional luxury gift note interaction
  const [isGiftNoteOpen, setIsGiftNoteOpen] = useState(false);
  const [giftNote, setGiftNote] = useState("");

  const total = cart.reduce((sum, item) => sum + ((Number(item.price) || 0) * (item.quantity || 1)), 0);
  const premiumEase = [0.16, 1, 0.3, 1]; // Ultra smooth luxury cubic bezier

  const handleCheckout = () => {
    if (!user) {
      navigate("/login?redirect=checkout");
    } else {
      navigate("/checkout");
    }
  };

  // --- EDITORIAL MINIMALIST LOADING STATE ---
  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF4E3] flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/p6-grain.png')]" />
        <div className="relative flex flex-col items-center gap-6">
          <motion.div 
            animate={{ rotation: 360 }}
            transition={{ repeat: Infinity, duration: 1.8, ease: "linear" }}
            className="w-16 h-16 border-t-2 border-[#976E2A] border-r-2 border-r-transparent rounded-full"
          />
          <div className="text-center space-y-1">
            <p className="text-[11px] font-poppins font-bold uppercase tracking-[0.4em] text-[#976E2A]">
              Loading Cart
            </p>
            <p className="text-[13px] font-serif italic text-[#6b4f3a]/60">
              Fetching your items...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen relative bg-cover bg-center text-[#6b4f3a] selection:bg-[#976E2A] selection:text-[#FFFDF6] font-poppins"
      style={{ backgroundImage: "url('/img/b3.png')" }}
    >
      {/* Premium Multi-layered Tonal Overlays */}
      <div className="absolute inset-0 bg-[#FAF4E3]/90 pointer-events-none mix-blend-color-burn" />
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/p6-grain.png')]" />

      <PageHeader
        title="Your Cart"
        subtitle="Manage Selections"
        breadcrumbItems={[
          { label: "Home", path: "/" },
          { label: "Shop", path: "/shop" },
          { label: "Cart" },
        ]}
      />

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

          {/* MAIN CART ARCHIVE AREA */}
          <div className="lg:col-span-8 w-full">
            <AnimatePresence mode="popLayout">
              {cart.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.6, ease: premiumEase }}
                  className="bg-[#FFFDF6] border border-[#E3DBC5]/60 rounded-[24px] p-16 text-center shadow-[0_20px_50px_rgba(32,59,35,0.02)] max-w-xl mx-auto flex flex-col items-center"
                >
                  <div className="w-16 h-16 rounded-full bg-[#FAF4E3] border border-[#E3DBC5]/50 flex items-center justify-center text-[#976E2A] mb-6">
                    <ShoppingBag size={22} strokeWidth={1.2} />
                  </div>
                  <h3 className="text-2xl font-serif italic text-[#6b4f3a] mb-3">
                    Your cart is empty
                  </h3>
                  <p className="text-[13px] text-[#6b4f3a]/60 italic max-w-xs mb-8 leading-relaxed">
                    Looks like you haven't added anything to your cart yet.
                  </p>
                  <Link
                    to="/shop"
                    className="inline-flex items-center gap-3 px-8 py-4 bg-[#6b4f3a] text-[#FFFDF6] font-bold text-[12px] uppercase tracking-[0.3em] rounded-lg hover:bg-[#976E2A] transition-all duration-300 shadow-sm group"
                  >
                    Go Shopping
                    <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </motion.div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-[#E3DBC5]/40 pb-3 px-1">
                    <h2 className="text-[12px] font-bold uppercase tracking-[0.3em] text-[#976E2A]">
                      {cart.length} {cart.length === 1 ? "Item" : "Items"} in your cart
                    </h2>
                  </div>

                  {/* COMPACT ITEM ROW STACK */}
                  <motion.div layout className="space-y-4">
                    <AnimatePresence mode="popLayout">
                      {cart.map((item, idx) => (
                        <motion.div
                          key={`${item.id}-${idx}`}
                          layout
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -30, opacity: 0 }}
                          transition={{ duration: 0.5, ease: premiumEase }}
                          className="group relative bg-[#FFFDF6] rounded-[20px] p-4 flex flex-col sm:flex-row items-center gap-6 border border-[#E3DBC5]/50 hover:border-[#976E2A]/40 transition-all duration-500 shadow-[0_4px_20px_rgba(32,59,35,0.01)] hover:shadow-[0_20px_40px_rgba(151,110,42,0.04)]"
                        >
                          {/* Fine Art Presentation Frame */}
                          <Link to={`/product/${item.id}`} className="w-24 h-28 rounded-[14px] bg-[#FFFDF6] border border-[#E3DBC5]/40 p-2 shrink-0 shadow-[inset_0_2px_8px_rgba(0,0,0,0.01)] group-hover:border-[#976E2A]/20 transition-all duration-500">
                            <div className="w-full h-full overflow-hidden rounded-[10px] bg-[#FAF4E3]/60 flex items-center justify-center p-1 relative">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-contain filter drop-shadow-sm transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                              />
                            </div>
                          </Link>

                          {/* Info Typography Matrix */}
                          <div className="flex-1 text-center sm:text-left space-y-1">
                            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#976E2A]">
                              {item.flavor || "Classic"}
                            </span>
                            <h3 className="text-lg font-bold text-[#6b4f3a] tracking-tight group-hover:text-[#976E2A] transition-colors duration-300">
                              {item.name}
                            </h3>
                            <p className="text-lg font-medium text-[#6b4f3a]/90 pt-1 font-sans">
                              ₹{Number(item.price).toLocaleString("en-IN", { minimumFractionDigits: 0 })}
                            </p>
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex items-center bg-[#FAF4E3]/30 border border-[#E3DBC5]/40 rounded-xl p-1 gap-2">
                             <button 
                               onClick={() => updateQuantity(item.id, -1)}
                               className="w-8 h-8 flex items-center justify-center text-[#6b4f3a]/60 hover:text-[#976E2A] transition-colors"
                             >
                               -
                             </button>
                             <span className="w-6 text-center text-[14px] font-bold font-sans text-[#6b4f3a]">{item.quantity || 1}</span>
                             <button 
                               onClick={() => updateQuantity(item.id, 1)}
                               className="w-8 h-8 flex items-center justify-center text-[#6b4f3a]/60 hover:text-[#976E2A] transition-colors"
                             >
                               +
                             </button>
                          </div>

                          {/* Minimalist Removal Node */}
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="sm:mr-2 p-3.5 rounded-xl bg-[#FAF4E3]/50 text-[#6b4f3a]/40 border border-[#E3DBC5]/30 hover:bg-red-50/60 hover:text-red-600 hover:border-red-100 transition-all duration-300 group/trash"
                            aria-label="Remove item"
                          >
                            <Trash2 size={15} strokeWidth={1.5} className="group-hover/trash:scale-105 transition-transform" />
                          </button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* SUMMARY SIDEBAR */}
          {cart.length > 0 && (
            <aside className="lg:col-span-4 w-full sticky top-32">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: premiumEase }}
                className="bg-[#FFFDF6] rounded-[24px] border border-[#E3DBC5]/70 shadow-[0_30px_70px_rgba(32,59,35,0.04)] p-8 relative overflow-hidden"
              >
                {/* Micro Fine-Art Ornament */}
                <div className="absolute top-0 right-0 p-6 opacity-20 pointer-events-none">
                  <Sparkles size={15} className="text-[#976E2A]" />
                </div>

                <h2 className="text-md font-bold uppercase tracking-wider text-[#6b4f3a] mb-6 border-b border-[#E3DBC5]/40 pb-4">
                  Order Summary
                </h2>

                {/* Ledger Breakdown Row Vectors */}
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-baseline text-[12px] uppercase tracking-widest text-[#6b4f3a]/60 font-sans">
                    <span>Subtotal</span>
                    <span className="text-[#6b4f3a] font-bold">
                      ₹{total.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline text-[12px] uppercase tracking-widest text-[#6b4f3a]/60">
                    <span>Shipping</span>
                    <span className="text-[#976E2A] italic tracking-normal normal-case font-serif text-[13px]">
                      Complimentary
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline text-[12px] uppercase tracking-widest text-[#6b4f3a]/60 font-sans">
                    <span>GST (Included)</span>
                    <span className="text-[#6b4f3a] font-bold">₹0.00</span>
                  </div>

                  {/* PREMIUM OPTIONAL LUXURY ADD-ON (Gift Inscription) */}
                  <div className="pt-2 border-t border-[#E3DBC5]/30">
                    <button 
                      onClick={() => setIsGiftNoteOpen(!isGiftNoteOpen)}
                      className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#976E2A] hover:text-[#6b4f3a] transition-colors"
                    >
                      <Gift size={13} strokeWidth={1.8} />
                      <span>{isGiftNoteOpen ? "Remove gift note" : "Add a gift note"}</span>
                    </button>
                    
                    <AnimatePresence>
                      {isGiftNoteOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3, ease: premiumEase }}
                          className="overflow-hidden mt-3"
                        >
                          <textarea
                            value={giftNote}
                            onChange={(e) => setGiftNote(e.target.value)}
                            placeholder="Write your message here..."
                            maxLength={180}
                            className="w-full h-20 bg-[#FAF4E3]/40 border border-[#E3DBC5]/60 rounded-xl p-3 text-[12px] italic text-[#6b4f3a] placeholder-[#6b4f3a]/30 focus:outline-none focus:border-[#976E2A]/50 resize-none font-sans"
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Vault Valuation Divider Line */}
                  <div className="pt-5 border-t border-dashed border-[#E3DBC5] flex justify-between items-end">
                    <div className="space-y-0.5">
                      <span className="text-[11px] font-bold text-[#976E2A] uppercase tracking-[0.25em] block">
                        Total Value
                      </span>
                      <span className="text-[11px] text-[#6b4f3a]/40 italic font-serif block">
                        Include wrapping
                      </span>
                    </div>
                    <span className="text-3xl font-bold text-[#6b4f3a] tracking-tight font-sans">
                      ₹{total.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                {/* Primary Secure Action Node Button */}
                <button
                  onClick={handleCheckout}
                  className="w-full py-4 bg-[#6b4f3a] text-[#FFFDF6] font-bold text-[12px] uppercase tracking-[0.25em] rounded-xl hover:bg-[#976E2A] hover:shadow-[0_12px_30px_rgba(151,110,42,0.15)] transition-all duration-500 shadow-[0_10px_25px_rgba(32,59,35,0.08)] mb-8 flex items-center justify-center gap-2 group/checkout"
                >
                  <span>Checkout Now</span>
                  <ChevronRight size={14} className="group-hover/checkout:translate-x-1 transition-transform" />
                </button>

                {/* Trust Certificate Stamp Components */}
                <div className="grid grid-cols-1 gap-4 pt-6 border-t border-[#E3DBC5]/40">
                  {[
                    { icon: ShieldCheck, title: "Vault Security", sub: "Pillar Layer Encryption" },
                    { icon: Truck, title: "Priority Delivery", sub: "Climate Controlled Fleet" },
                    { icon: RotateCcw, title: "Registry Guarantee", sub: "30-Day Escrow Window" },
                  ].map((badge, i) => {
                    const Icon = badge.icon;
                    return (
                      <div key={i} className="flex items-center gap-4">
                        <div className="w-9 h-9 rounded-xl bg-[#FAF4E3]/70 border border-[#E3DBC5]/60 flex items-center justify-center text-[#976E2A] shrink-0 shadow-none">
                          <Icon size={15} strokeWidth={1.5} />
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-[11px] font-bold text-[#6b4f3a] uppercase tracking-wider">
                            {badge.title}
                          </p>
                          <p className="text-[12px] font-serif italic text-[#6b4f3a]/40 leading-none">
                            {badge.sub}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;