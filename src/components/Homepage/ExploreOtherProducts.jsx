import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import {
  Star,
  ShoppingBag,
  ArrowRight,
  Heart,
  X,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Leaf,
  Boxes
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { db } from '../../components/Firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { useStore } from '../../components/StoreProvider';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';

const OtherProductCard = ({ product, idx, triggerToast }) => {
  const navigate = useNavigate();
  const { addToCart, addToWishlist, removeFromWishlist, wishlist, cart } = useStore();

  const variants = React.useMemo(() => {
    if (product.variants && product.variants.length > 0) {
      return product.variants;
    }
    return [
      {
        weight: product.net_quantity || product.weight || "Standard Pack",
        price: product.price || 0,
        original_price: product.original_price || product.mrp || Math.round((product.price || 0) * 1.25),
        stock_status: product.stock_status || "In Stock",
        stock_count: product.stock_count !== undefined ? product.stock_count : 50,
      }
    ];
  }, [product]);

  const defaultVariantIdx = React.useMemo(() => {
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
  const existingInCart = cart.find(item => item.id === cartItemId || item.id === product.id);
  const qtyInCart = existingInCart ? Number(existingInCart.quantity || 1) : 0;
  const isInCart = qtyInCart > 0;
  const isWishlisted = wishlist.some(item => item.id === product.id);

  const displayPrice = currentVariant.price || product.price || 0;
  const originalPrice = currentVariant.original_price || product.mrp || Math.round(displayPrice * 1.25);
  const savingsAmount = originalPrice > displayPrice ? originalPrice - displayPrice : 0;
  const savingsPercent = originalPrice > displayPrice ? Math.round((savingsAmount / originalPrice) * 100) : 0;
  const stockCount = currentVariant.stock_count !== undefined
    ? Number(currentVariant.stock_count)
    : (currentVariant.stock_status === "Out of Stock" ? 0 : 50);
  const isOutOfStock = stockCount <= 0;
  const isMaxInCart = qtyInCart >= stockCount;

  const handleAction = async (e, type) => {
    e.stopPropagation();
    if (type === 'cart') {
      if (isOutOfStock || isMaxInCart) return;
      await addToCart(product, 1, currentVariant);
      triggerToast(`Added ${product.name} to cart!`);
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
      className="bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] p-5 relative cursor-pointer hover:shadow-lg transition-all duration-300 flex flex-col h-full border border-gray-100/70 group"
    >
      {/* Discount Badge */}
      {savingsPercent > 0 && (
        <div className="absolute top-0 left-4 bg-[#6b4f3a] text-white px-2.5 py-2 flex flex-col items-center justify-center text-center rounded-b-sm z-10 min-w-[38px] shadow-xs">
          <span className="text-[13px] font-sans font-bold leading-none tracking-tight">{savingsPercent}%</span>
          <span className="text-[9px] font-poppins font-bold uppercase tracking-tighter mt-0.5">OFF</span>
        </div>
      )}

      {/* Category / Stock Pill */}
      <div className={`absolute top-3 right-3 z-10 text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border ${
        isOutOfStock
          ? "bg-red-50 text-red-600 border-red-200"
          : stockCount <= 5
          ? "bg-amber-50 text-amber-700 border-amber-200"
          : "bg-[#FAF4E3] text-[#976E2A] border-[#E5DEC9]"
      }`}>
        {isOutOfStock
          ? "Out of Stock"
          : stockCount <= 5
          ? `Only ${stockCount} left!`
          : product.category || "Organic"}
      </div>

      {/* Structured Image Block */}
      <div className="relative w-full aspect-square flex items-center justify-center bg-transparent mb-3 overflow-hidden rounded-lg">
        <img
          src={product.image || product.images?.[0] || "https://images.unsplash.com/photo-1594488651083-023b857dc3f8?q=80&w=600&auto=format&fit=crop"}
          alt={product.name}
          className="w-auto h-full max-h-full object-contain transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      {/* Content Meta Layer */}
      <div className="flex flex-col flex-grow">
        <span className="text-[11px] font-poppins font-semibold uppercase tracking-wider text-gray-400 mb-0.5">
          {product.category || "Artisanal Kitchen"}
        </span>

        <h3 className="text-[20px] font-poppins font-bold text-[#2E1A0C] mb-1 tracking-tight leading-snug line-clamp-1 group-hover:text-[#976E2A] transition-colors">
          {product.name}
        </h3>

        {/* Rating Row */}
        <div className="flex items-center gap-1 mb-1">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={13} className="fill-[#F5A623] text-[#F5A623]" />
            ))}
          </div>
          <span className="text-[13px] font-sans font-bold text-gray-700 ml-0.5">{product.rating || "4.8"}</span>
          <span className="text-[13px] font-sans text-gray-400">({product.reviewsCount || 98})</span>
        </div>

        {/* QUANTITY / WEIGHT VARIANT SELECTOR */}
        {variants.length > 0 && (
          <div className="my-2" onClick={(e) => e.stopPropagation()}>
            <div className="text-[10px] font-bold text-gray-400 uppercase mb-1">Select Pack Size:</div>
            <div className="flex flex-wrap gap-1.5">
              {variants.map((v, vIdx) => (
                <button
                  key={vIdx}
                  type="button"
                  onClick={() => setSelectedVariantIdx(vIdx)}
                  className={`px-2.5 py-1 rounded text-xs font-bold transition-all border cursor-pointer ${
                    selectedVariantIdx === vIdx
                      ? "bg-[#6b4f3a] text-white border-[#6b4f3a]"
                      : v.stock_status === "Out of Stock"
                      ? "bg-red-50 text-red-800 border-red-200 line-through opacity-70"
                      : "bg-gray-50 text-gray-600 border-gray-200 hover:border-[#6b4f3a]"
                  }`}
                >
                  {v.weight}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Pricing Layout */}
        <div className="flex items-center gap-2 mb-4 flex-wrap mt-auto pt-2">
          <span className="text-xl font-sans font-extrabold text-[#2E1A0C]">
            ₹{displayPrice}
          </span>
          {originalPrice > displayPrice && (
            <span className="text-[14px] text-gray-400 line-through font-sans font-medium">
              ₹{originalPrice}
            </span>
          )}
          {savingsAmount > 0 && (
            <div className="bg-[#EAF7ED] text-[#218742] text-[11px] font-sans font-bold px-2 py-0.5 rounded-sm tracking-wide">
              Save ₹{savingsAmount}
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 w-full mt-auto">
        <button
          onClick={(e) => handleAction(e, 'cart')}
          disabled={isOutOfStock || isMaxInCart}
          className={`flex-1 text-[13px] font-poppins font-bold uppercase tracking-wider py-2.5 px-4 rounded transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
            isOutOfStock
              ? "bg-red-100 text-red-500 cursor-not-allowed border border-red-200"
              : isMaxInCart
              ? "bg-amber-100 text-amber-800 cursor-not-allowed border border-amber-200"
              : isInCart
              ? "bg-[#6b4f3a]/10 text-[#6b4f3a] border border-[#6b4f3a]/30"
              : "bg-[#6b4f3a] text-white hover:bg-[#25160C] shadow-sm"
          }`}
        >
          <span>{isOutOfStock ? "OUT OF STOCK" : isMaxInCart ? "MAX IN BAG" : isInCart ? "ADD MORE" : "ADD TO CART"}</span>
          {!isOutOfStock && !isMaxInCart && <ShoppingBag size={13} strokeWidth={2.5} />}
        </button>

        <button
          onClick={(e) => handleAction(e, 'wishlist')}
          className={`p-2.5 border rounded-md flex items-center justify-center transition-colors duration-200 h-[37px] w-[37px] cursor-pointer ${
            isWishlisted
              ? "bg-[#5C0612] text-white border-[#5C0612]"
              : "bg-white text-gray-400 border-gray-200 hover:text-gray-600 hover:bg-gray-50"
          }`}
          title="Wishlist"
        >
          <Heart size={15} fill={isWishlisted ? "currentColor" : "none"} strokeWidth={2.2} />
        </button>
      </div>
    </motion.div>
  );
};

const ExploreOtherProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedbackMessage, setFeedbackMessage] = useState(null);
  const swiperRef = useRef(null);

  const triggerToast = (msg) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(null), 3500);
  };

  useEffect(() => {
    const fetchOtherProducts = async () => {
      try {
        const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        const all = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Show ONLY OTHER PRODUCTS (no sattu)
        const otherOnly = all.filter(p => p.productType === "other");
        setProducts(otherOnly);
      } catch (error) {
        console.error("Error fetching other products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOtherProducts();
  }, []);

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Decorative Traditional Organic Harvest Scenery Background Layers */}
      <div
        className="absolute inset-0 bg-cover bg-center mix-blend-multiply opacity-90 pointer-events-none"
        style={{ backgroundImage: "url('https://res.cloudinary.com/luq2xhci/image/upload/v1791792178/VedamyaUpload/z9hyenkekbaszoiskukb.jpg')" }}
      />
      <div className="absolute inset-0 opacity-[0.025] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/p6-grain.png')]" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        
        {/* Header - Decreased Font Size & Refined Luxury Aesthetic */}
        <div className="relative mb-10">
          <div className="text-center max-w-2xl mx-auto px-4">
            
            {/* Top Vintage Ornament Row */}
            <div className="flex items-center justify-center gap-2 mb-2 text-[#976E2A]">
              <span className="text-xs font-poppins opacity-40 tracking-tight">--------⌲</span>
              <Leaf size={14} className="fill-current rotate-45 text-[#976E2A]" />
              <span className="text-xs font-poppins opacity-40 tracking-tight">⌱--------</span>
            </div>

            {/* Decreased font size of heading */}
            <h2 className="text-2xl sm:text-3xl font-poppins font-bold text-[#362214] tracking-[0.06em] uppercase leading-tight mb-2">
              Explore Our Other Products
            </h2>

            {/* Subtitle with side boundary borders */}
            <div className="flex items-center justify-center gap-3 max-w-md mx-auto border-y border-[#362214]/15 py-1.5">
              <span className="text-xs sm:text-[13px] font-poppins font-semibold text-[#6b4f3a] uppercase tracking-[0.25em] whitespace-nowrap">
                Cold-Pressed • Farm-Fresh • Pure
              </span>
            </div>

            {/* Bottom Accent Anchor Diamond */}
            <div className="flex justify-center items-center mt-2.5 text-[#976E2A]">
              <div className="w-10 h-[1px] bg-[#976E2A]/30" />
              <span className="text-[11px] font-poppins mx-2">◆</span>
              <div className="w-10 h-[1px] bg-[#976E2A]/30" />
            </div>

          </div>

          {/* Top-Right "View All" Link & Slider Navigation Controls */}
          <div className="flex items-center gap-2.5 absolute bottom-1 right-0">
            <Link
              to="/products"
              className="hidden md:flex text-[13px] font-poppins font-bold uppercase tracking-[0.12em] text-[#362214] items-center gap-1.5 hover:text-[#5C0612] transition-colors pb-0.5 border-b border-dashed border-[#362214]/40 mr-2"
            >
              <span>View All</span>
              <ArrowRight size={13} strokeWidth={2.5} />
            </Link>

            {/* Previous Slide Button */}
            <button
              type="button"
              onClick={() => swiperRef.current?.slidePrev()}
              aria-label="Previous slide"
              className="w-9 h-9 rounded-full bg-white/95 hover:bg-[#6b4f3a] hover:text-white text-[#6b4f3a] border border-[#E5DEC9] shadow-sm flex items-center justify-center transition-all cursor-pointer active:scale-95"
            >
              <ChevronLeft size={18} strokeWidth={2.2} />
            </button>

            {/* Next Slide Button */}
            <button
              type="button"
              onClick={() => swiperRef.current?.slideNext()}
              aria-label="Next slide"
              className="w-9 h-9 rounded-full bg-white/95 hover:bg-[#6b4f3a] hover:text-white text-[#6b4f3a] border border-[#E5DEC9] shadow-sm flex items-center justify-center transition-all cursor-pointer active:scale-95"
            >
              <ChevronRight size={18} strokeWidth={2.2} />
            </button>
          </div>
        </div>

        {/* Content Slider */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-[430px] bg-white/80 border border-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="!-mr-6 md:!-mr-12 sm:mr-0">
            <Swiper
              onSwiper={(swiper) => {
                swiperRef.current = swiper;
              }}
              modules={[Autoplay, Pagination]}
              spaceBetween={20}
              slidesPerView={1.2}
              pagination={{ clickable: true }}
              autoplay={{ delay: 4500, disableOnInteraction: false }}
              breakpoints={{
                480: { slidesPerView: 1.5, spaceBetween: 16 },
                640: { slidesPerView: 2.2, spaceBetween: 18 },
                868: { slidesPerView: 2.6, spaceBetween: 20 },
                1024: { slidesPerView: 3.2, spaceBetween: 22 },
                1280: { slidesPerView: 4, spaceBetween: 24 }
              }}
              className="pb-16 heritage-swiper px-2"
            >
              {products.map((product, idx) => (
                <SwiperSlide key={product.id} className="h-auto">
                  <OtherProductCard
                    product={product}
                    idx={idx}
                    triggerToast={triggerToast}
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        ) : (
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl border border-[#E5DEC9] p-12 text-center max-w-lg mx-auto space-y-3 shadow-md">
            <Boxes size={40} className="mx-auto text-[#976E2A] opacity-60" />
            <h3 className="text-xl font-poppins font-black text-[#2A1B12]">
              New Organic Products Arriving Soon
            </h3>
            <p className="text-xs sm:text-sm text-[#7A6E63] font-medium">
              We are curating handpicked cold-pressed oils, single-origin spices, and organic snacks. Check back soon!
            </p>
            <div className="pt-3">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#6b4f3a] text-white text-xs font-bold"
              >
                <span>Browse Sattu Blends</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        )}

      </div>

      {/* Global Toast Messaging Interface */}
      <AnimatePresence>
        {feedbackMessage && (
          <motion.div
            initial={{ opacity: 0, y: 30, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 15, x: "-50%" }}
            className="fixed bottom-10 left-1/2 z-[200] bg-[#362214] text-white px-6 py-4 rounded-xl shadow-xl flex items-center gap-4 backdrop-blur-md max-w-sm w-[90%]"
          >
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-[#F5A623]">
              <Sparkles size={16} />
            </div>
            <p className="text-[14px] font-poppins font-medium tracking-wide flex-1">{feedbackMessage}</p>
            <button
              onClick={() => setFeedbackMessage(null)}
              className="opacity-50 hover:opacity-100 transition-opacity cursor-pointer"
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{
        __html: `
        .heritage-swiper .swiper-slide {
          height: auto !important;
          padding-bottom: 30px !important;
        }
        .heritage-swiper .swiper-pagination-bullet {
          background: #362214 !important;
          opacity: 0.25;
          width: 8px;
          height: 8px;
          transition: all 0.3s ease;
        }
        .heritage-swiper .swiper-pagination-bullet-active {
          opacity: 1;
          background: #5C0612 !important;
          width: 22px;
          border-radius: 4px;
        }
        `
      }} />
    </section>
  );
};

export default ExploreOtherProducts;
