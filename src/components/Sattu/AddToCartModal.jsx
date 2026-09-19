import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, X, Plus, Minus, CheckCircle2, ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../StoreProvider";

const AddToCartModal = () => {
  const navigate = useNavigate();
  const { addedModalItem, hideAddToCartPopup, addToCart, cart } = useStore();
  const [timerKey, setTimerKey] = useState(0);

  // Extract properties
  const product = addedModalItem?.product;
  const variant = addedModalItem?.variant;
  const initialQty = addedModalItem?.quantity || 1;

  // Auto-close timer logic: 5 seconds
  useEffect(() => {
    if (!addedModalItem) return;
    
    // Reset timer whenever addedModalItem or timerKey changes
    const timer = setTimeout(() => {
      hideAddToCartPopup();
    }, 5000);

    return () => clearTimeout(timer);
  }, [addedModalItem, timerKey, hideAddToCartPopup]);

  // Whenever addedModalItem changes from outside, reset timerKey
  useEffect(() => {
    if (addedModalItem) {
      setTimerKey((prev) => prev + 1);
    }
  }, [addedModalItem?.timestamp, addedModalItem?.product?.id]);

  if (!addedModalItem || !product) return null;

  const variantWeight = variant?.weight || product.net_quantity || product.weight || "500g";
  const cartItemId = variantWeight ? `${product.id}_${variantWeight}` : product.id;
  const existingInCart = cart.find((i) => i.id === cartItemId || i.id === product.id);
  const qtyInCart = existingInCart ? Number(existingInCart.quantity || 1) : initialQty;
  const price = variant?.price || product.price || 0;
  const productImage = product.image || product.images?.[0] || "/placeholder.png";

  const stockCount = variant?.stock_count !== undefined 
    ? Number(variant.stock_count) 
    : (product.stock_count !== undefined ? Number(product.stock_count) : (variant?.stock_status === "Out of Stock" || product.stock_status === "Out of Stock" ? 0 : 50));
  
  const isMaxInCart = qtyInCart >= stockCount;

  const handleAddMore = async () => {
    if (isMaxInCart) return;
    await addToCart(product, 1, variant, false); // pass false to avoid re-triggering modal open event, just update cart
    setTimerKey((prev) => prev + 1); // Reset 5-second timer
  };

  const handleDecrease = async () => {
    if (qtyInCart <= 1) return;
    await addToCart(product, -1, variant, false);
    setTimerKey((prev) => prev + 1); // Reset 5-second timer
  };

  const handleGoToCart = () => {
    hideAddToCartPopup();
    navigate("/cart");
  };

  const handleShopMore = () => {
    hideAddToCartPopup();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 pointer-events-none z-[9999] flex items-end justify-center sm:items-bottom sm:justify-end p-4 sm:p-6">
        <motion.div
          key={addedModalItem?.timestamp || "add-to-cart-popup"}
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 350, damping: 28 }}
          className="pointer-events-auto w-full sm:w-[430px] bg-[#FAF7F2] border-2 border-[#D9A036]/50 rounded-2xl shadow-[0_20px_60px_rgba(42,27,18,0.32)] overflow-hidden relative"
        >
          {/* 5-Second Countdown Progress Bar */}
          <div className="w-full bg-amber-100/60 h-1.5 overflow-hidden">
            <motion.div
              key={timerKey}
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: 5, ease: "linear" }}
              className="h-full bg-gradient-to-r from-[#D9A036] via-[#B8860B] to-[#6b4f3a]"
            />
          </div>

          {/* Popup Content */}
          <div className="p-4 sm:p-5">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#6b4f3a]/10">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-inner">
                  <CheckCircle2 className="w-4 h-4" />
                </span>
                <div>
                  <h4 className="font-extrabold text-[#2A1B12] text-sm sm:text-base leading-tight">
                    Item Added to Cart!
                  </h4>
                  <p className="text-[11px] text-[#6b4f3a]/80 font-medium">Auto-closing in 5 seconds</p>
                </div>
              </div>
              <button
                onClick={handleShopMore}
                className="w-7 h-7 rounded-full bg-gray-200/60 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Product Card Info */}
            <div className="flex gap-3 items-center bg-white p-3 rounded-xl border border-[#6b4f3a]/10 shadow-sm mb-4">
              <div className="w-16 h-16 rounded-lg bg-[#FAF7F2] p-1 flex-shrink-0 border border-gray-100 flex items-center justify-center overflow-hidden">
                <img
                  src={productImage}
                  alt={product.name}
                  className="w-full h-full object-contain hover:scale-105 transition-transform"
                  onError={(e) => { e.target.src = "https://via.placeholder.com/100?text=Vedamya"; }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <h5 className="font-bold text-[#2A1B12] text-sm truncate leading-snug">
                  {product.name}
                </h5>
                <div className="flex items-center gap-2 mt-0.5 text-xs text-[#6b4f3a]">
                  <span className="bg-[#FAF7F2] px-2 py-0.5 rounded font-semibold text-[11px] border border-[#6b4f3a]/15">
                    {variantWeight}
                  </span>
                  <span className="font-extrabold text-[#2A1B12] text-sm">
                    ₹{price}
                  </span>
                </div>
                <p className="text-[11px] text-emerald-700 font-bold mt-1 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#D9A036]" /> In Cart: <span className="font-extrabold">{qtyInCart} unit{qtyInCart > 1 ? "s" : ""}</span>
                </p>
              </div>

              {/* Add More Controls / Quantity Stepper */}
              <div className="flex flex-col items-end gap-1.5">
                <div className="flex items-center border border-[#6b4f3a]/25 rounded-lg overflow-hidden bg-[#FAF7F2]">
                  <button
                    onClick={handleDecrease}
                    disabled={qtyInCart <= 1}
                    className="w-7 h-7 flex items-center justify-center text-[#6b4f3a] hover:bg-[#6b4f3a]/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                    title="Decrease quantity"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-7 text-center font-bold text-xs text-[#2A1B12]">
                    {qtyInCart}
                  </span>
                  <button
                    onClick={handleAddMore}
                    disabled={isMaxInCart}
                    className="w-7 h-7 flex items-center justify-center text-[#6b4f3a] hover:bg-[#6b4f3a]/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                    title="Add More (+1)"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
                <button
                  onClick={handleAddMore}
                  disabled={isMaxInCart}
                  className={`text-[10px] font-extrabold uppercase tracking-wide px-2 py-0.5 rounded transition-all ${
                    isMaxInCart
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-[#6b4f3a] bg-[#D9A036]/20 hover:bg-[#D9A036]/35 active:scale-95"
                  }`}
                >
                  + Add More
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                onClick={handleShopMore}
                className="w-full py-2.5 px-3 rounded-xl border border-[#6b4f3a]/30 text-[#6b4f3a] hover:bg-[#6b4f3a]/10 font-bold text-xs sm:text-sm transition-all text-center flex items-center justify-center active:scale-95"
              >
                Shop More
              </button>
              <button
                onClick={handleGoToCart}
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#6b4f3a] to-[#4a3627] hover:from-[#523d2d] hover:to-[#38281c] text-white font-extrabold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all text-center flex items-center justify-center gap-1.5 active:scale-95 group"
              >
                <ShoppingBag className="w-4 h-4 text-[#D9A036]" />
                <span>Go to Cart</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AddToCartModal;
