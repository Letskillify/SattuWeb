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
  Plus, 
  Minus, 
  Lock, 
  CheckCircle2, 
  Leaf 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PageHeader from "../components/Sattu/PageHeader";
import { useStore } from "../components/StoreProvider";
import { useAuth } from "../components/useAuth";

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, loading } = useStore();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // State for optional gift note interaction
  const [isGiftNoteOpen, setIsGiftNoteOpen] = useState(false);
  const [giftNote, setGiftNote] = useState("");

  const total = cart.reduce((sum, item) => sum + ((Number(item.price) || 0) * (item.quantity || 1)), 0);
  const premiumEase = [0.16, 1, 0.3, 1];

  const handleCheckout = () => {
    if (!user) {
      navigate("/login?redirect=checkout");
    } else {
      navigate("/checkout");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex flex-col items-center justify-center relative overflow-hidden">
        <div className="relative flex flex-col items-center gap-4">
          <div className="relative w-14 h-14">
            <div className="absolute inset-0 border-4 border-[#6b4f3a]/20 rounded-full" />
            <div className="absolute inset-0 border-4 border-t-[#D9A036] rounded-full animate-spin" />
          </div>
          <div className="text-center space-y-1">
            <p className="text-sm font-black uppercase tracking-widest text-[#2A1B12]">
              Loading Your Cart...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative bg-[#FAF7F2] text-[#2A1B12] selection:bg-[#D9A036] selection:text-[#2A1B12] font-poppins pb-24">
      <PageHeader
        title="Shopping Cart"
        subtitle="Review Your Selections"
        breadcrumbItems={[
          { label: "Home", path: "/" },
          { label: "Shop", path: "/shop" },
          { label: "Cart" },
        ]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

          {/* MAIN CART ITEMS LIST */}
          <div className="lg:col-span-8 w-full space-y-6">
            <AnimatePresence mode="popLayout">
              {cart.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5, ease: premiumEase }}
                  className="bg-white border-2 border-[#6b4f3a]/15 rounded-3xl p-10 sm:p-16 text-center shadow-xl shadow-[#2A1B12]/5 max-w-xl mx-auto flex flex-col items-center"
                >
                  <div className="w-20 h-20 rounded-full bg-[#FAF7F2] border-2 border-[#D9A036]/40 flex items-center justify-center text-[#6b4f3a] mb-6 shadow-md">
                    <ShoppingBag size={36} strokeWidth={1.8} className="text-[#D9A036]" />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-[#2A1B12] uppercase tracking-tight mb-3">
                    Your Cart is Empty
                  </h3>
                  <p className="text-sm text-[#6b4f3a] font-medium max-w-xs mb-8 leading-relaxed">
                    You haven't added any products to your cart yet. Explore our organic sattu blends and healthy staples.
                  </p>
                  <Link
                    to="/shop"
                    className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#6b4f3a] to-[#2A1B12] text-white font-black text-xs sm:text-sm uppercase tracking-widest rounded-2xl hover:shadow-xl hover:scale-105 transition-all duration-300 shadow-md border border-[#D9A036]/40 group"
                  >
                    <span>Explore Products</span>
                    <ArrowRight size={16} className="text-[#D9A036] group-hover:translate-x-1 transition-transform" />
                  </Link>
                </motion.div>
              ) : (
                <div className="space-y-6">
                  {/* Cart Header Unit */}
                  <div className="flex items-center justify-between border-b-2 border-[#6b4f3a]/15 pb-4 px-1">
                    <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-[#2A1B12] flex items-center gap-2">
                      <ShoppingBag className="w-5 h-5 text-[#D9A036]" />
                      <span>Your Cart Items ({cart.length})</span>
                    </h2>
                    <Link to="/shop" className="text-xs font-black uppercase text-[#6b4f3a] hover:text-[#D9A036] hover:underline flex items-center gap-1">
                      <span>Add More Items</span>
                      <ChevronRight size={14} />
                    </Link>
                  </div>

                  {/* CART ITEMS STACK */}
                  <motion.div layout className="space-y-4">
                    <AnimatePresence mode="popLayout">
                      {cart.map((item, idx) => {
                        const maxStock = item.stock_count !== undefined ? Number(item.stock_count) : 50;
                        const isMaxReached = (item.quantity || 1) >= maxStock;
                        const itemPrice = Number(item.price) || 0;
                        const itemTotal = itemPrice * (item.quantity || 1);

                        return (
                          <motion.div
                            key={`${item.id}-${idx}`}
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -30 }}
                            transition={{ duration: 0.4, ease: premiumEase }}
                            className="group relative bg-white rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row items-center gap-5 sm:gap-6 border-2 border-[#6b4f3a]/15 hover:border-[#D9A036]/50 transition-all duration-300 shadow-lg shadow-[#2A1B12]/5"
                          >
                            {/* Product Thumbnail Frame */}
                            <Link 
                              to={`/product/${item.productId || item.id}`} 
                              className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-[#FAF7F2] border border-[#6b4f3a]/15 p-2 shrink-0 flex items-center justify-center shadow-inner group-hover:border-[#D9A036]/40 transition-colors"
                            >
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-contain filter drop-shadow-sm group-hover:scale-105 transition-transform duration-500"
                                onError={(e) => { e.target.src = "https://via.placeholder.com/100?text=Vedamya"; }}
                              />
                            </Link>

                            {/* Product Info Matrix */}
                            <div className="flex-1 text-center sm:text-left space-y-1.5 w-full">
                              <div className="flex items-center justify-center sm:justify-start gap-2">
                                <span className="text-[11px] font-black uppercase tracking-wider text-[#D9A036] bg-[#FAF7F2] px-2.5 py-0.5 rounded-md border border-[#6b4f3a]/15">
                                  {item.flavor || "Natural Sattu"} {item.weight ? `• ${item.weight}` : ""}
                                </span>
                              </div>

                              <h3 className="text-base sm:text-lg font-black text-[#2A1B12] leading-snug line-clamp-1">
                                {item.name}
                              </h3>

                              <div className="flex items-center justify-center sm:justify-start gap-2 pt-0.5">
                                <span className="text-base sm:text-xl font-black text-[#2A1B12]">
                                  ₹{itemPrice.toLocaleString("en-IN")}
                                </span>
                                <span className="text-xs text-[#6b4f3a] font-bold">each</span>
                              </div>

                              {isMaxReached && (
                                <span className="text-[11px] font-bold text-amber-800 bg-amber-100/90 border border-amber-300 px-2.5 py-0.5 rounded-md inline-block mt-1">
                                  Maximum available stock reached ({maxStock} unit{maxStock > 1 ? "s" : ""})
                                </span>
                              )}
                            </div>

                            {/* Quantity Controls & Stepper */}
                            <div className="flex sm:flex-col items-center justify-between sm:justify-center gap-4 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                              <div className="flex items-center border-2 border-[#6b4f3a]/25 rounded-2xl overflow-hidden bg-[#FAF7F2] shadow-xs">
                                <button 
                                  onClick={() => updateQuantity(item.id, -1)}
                                  className="w-9 h-9 flex items-center justify-center text-[#6b4f3a] hover:bg-[#6b4f3a]/15 transition-colors font-bold cursor-pointer"
                                  title="Decrease Quantity"
                                >
                                  <Minus size={15} />
                                </button>
                                <span className="w-10 text-center text-sm font-black text-[#2A1B12]">
                                  {item.quantity || 1}
                                </span>
                                <button 
                                  onClick={() => updateQuantity(item.id, 1)}
                                  disabled={isMaxReached}
                                  title={isMaxReached ? "Maximum stock reached" : "Increase Quantity"}
                                  className={`w-9 h-9 flex items-center justify-center transition-colors font-bold ${
                                    isMaxReached 
                                      ? "text-gray-300 cursor-not-allowed opacity-40" 
                                      : "text-[#6b4f3a] hover:bg-[#6b4f3a]/15 cursor-pointer"
                                  }`}
                                >
                                  <Plus size={15} />
                                </button>
                              </div>

                              {/* Item Total Price */}
                              <div className="text-right sm:text-center">
                                <p className="text-xs text-[#6b4f3a] font-bold uppercase tracking-wider">Item Total</p>
                                <p className="text-lg font-black text-[#2A1B12]">
                                  ₹{itemTotal.toLocaleString("en-IN")}
                                </p>
                              </div>
                            </div>

                            {/* Trash Delete Action */}
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 flex items-center justify-center transition-all duration-200 cursor-pointer shrink-0"
                              title="Remove Item"
                              aria-label="Remove item"
                            >
                              <Trash2 size={18} />
                            </button>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* ORDER SUMMARY SIDEBAR */}
          {cart.length > 0 && (
            <aside className="lg:col-span-4 w-full sticky top-28">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: premiumEase }}
                className="bg-white rounded-3xl border-2 border-[#D9A036]/40 p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden"
              >
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-[#6b4f3a]/15">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#D9A036]" />
                    <h2 className="text-lg sm:text-xl font-black uppercase tracking-tight text-[#2A1B12]">
                      Order Summary
                    </h2>
                  </div>
                  <span className="text-xs font-black uppercase bg-[#FAF7F2] px-2.5 py-1 rounded-full text-[#6b4f3a] border border-[#6b4f3a]/20">
                    {cart.length} Item{cart.length !== 1 ? "s" : ""}
                  </span>
                </div>

                {/* Ledger Calculations */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm font-bold text-[#6b4f3a]">
                    <span className="uppercase tracking-wider">Subtotal</span>
                    <span className="text-[#2A1B12] font-black text-lg">
                      ₹{total.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-sm font-bold text-[#6b4f3a]">
                    <span className="uppercase tracking-wider">Express Delivery</span>
                    <span className="text-emerald-700 font-black uppercase bg-emerald-100 px-2.5 py-0.5 rounded-md text-xs">
                      FREE
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-sm font-bold text-[#6b4f3a]">
                    <span className="uppercase tracking-wider">Taxes & GST</span>
                    <span className="text-emerald-700 font-bold text-xs uppercase bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      INCLUDED
                    </span>
                  </div>

                  {/* OPTIONAL GIFT NOTE ADD-ON */}
                  <div className="pt-3 border-t border-[#6b4f3a]/15">
                    <button 
                      onClick={() => setIsGiftNoteOpen(!isGiftNoteOpen)}
                      className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#6b4f3a] hover:text-[#D9A036] transition-colors cursor-pointer"
                    >
                      <Gift size={15} className="text-[#D9A036]" />
                      <span>{isGiftNoteOpen ? "− Remove Gift Message" : "+ Add Complimentary Gift Message"}</span>
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
                            placeholder="Type your gift message for the recipient here..."
                            maxLength={180}
                            className="w-full h-20 bg-[#FAF7F2] border-2 border-[#6b4f3a]/25 rounded-2xl p-3 text-xs font-bold text-[#2A1B12] placeholder-[#6b4f3a]/50 focus:outline-none focus:border-[#D9A036] focus:bg-white resize-none"
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* TOTAL AMOUNT DIVIDER */}
                  <div className="pt-4 border-t-2 border-[#2A1B12] flex justify-between items-baseline">
                    <div>
                      <span className="text-sm font-black text-[#2A1B12] uppercase tracking-wider block">
                        Total Amount
                      </span>
                      <span className="text-[11px] text-emerald-700 font-bold block mt-0.5">
                        ✓ Includes all taxes & free shipping
                      </span>
                    </div>
                    <span className="text-3xl sm:text-4xl font-black text-[#2A1B12] tracking-tight">
                      ₹{total.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                {/* CHECKOUT NOW PRIMARY BUTTON */}
                <button
                  onClick={handleCheckout}
                  className="w-full py-4.5 bg-gradient-to-r from-[#6b4f3a] via-[#523d2d] to-[#2A1B12] text-white font-black text-sm sm:text-base uppercase tracking-widest rounded-2xl hover:shadow-2xl hover:scale-[1.01] active:scale-95 transition-all duration-300 shadow-xl flex items-center justify-center gap-2.5 border-2 border-[#D9A036]/50 cursor-pointer group"
                >
                  <Lock size={18} className="text-[#D9A036]" />
                  <span>Proceed to Checkout</span>
                  <ArrowRight size={18} className="text-[#D9A036] group-hover:translate-x-1 transition-transform" />
                </button>

                {/* TRUST BADGES */}
                <div className="grid grid-cols-1 gap-3 pt-4 border-t border-[#6b4f3a]/15 text-xs font-extrabold text-[#6b4f3a]">
                  <div className="flex items-center gap-3 bg-[#FAF7F2] p-3 rounded-2xl border border-[#6b4f3a]/10">
                    <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-black text-[#2A1B12]">100% Secure Encrypted Checkout</p>
                      <p className="text-[11px] text-[#6b4f3a] font-medium">SSL Encrypted Payment Gateway</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 bg-[#FAF7F2] p-3 rounded-2xl border border-[#6b4f3a]/10">
                    <Truck className="w-5 h-5 text-[#D9A036] flex-shrink-0" />
                    <div>
                      <p className="text-xs font-black text-[#2A1B12]">Express Doorstep Shipping</p>
                      <p className="text-[11px] text-[#6b4f3a] font-medium">Shipped directly from our facility</p>
                    </div>
                  </div>
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