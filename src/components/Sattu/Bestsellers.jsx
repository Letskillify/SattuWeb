import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import { Star, ShoppingBag, ArrowRight, Heart, X, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { db } from '../../components/Firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { useStore } from '../../components/StoreProvider';
import SectionHeader from './SectionHeader';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';

const ProductCard = ({ product, idx, triggerToast }) => {
  const navigate = useNavigate();
  const { addToCart, addToWishlist, removeFromWishlist, wishlist, cart } = useStore();
  const isWishlisted = wishlist.some(item => item.id === product.id);
  const isInCart = cart.some(item => item.id === product.id);

  // Dynamic Price Calculations based on reference card metrics
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

const BestsellerProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedbackMessage, setFeedbackMessage] = useState(null);

  const triggerToast = (msg) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        setProducts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })).slice(0, 4));
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading) {
    return (
      <section className="py-20 relative overflow-hidden bg-[#FAF4E3]/30">
        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-[430px] bg-white border border-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Decorative Traditional Organic Scenery Background Layers */}
      <div
        className="absolute inset-0 bg-cover bg-center mix-blend-multiply opacity-95 pointer-events-none"
        style={{ backgroundImage: "url('https://res.cloudinary.com/duzwys877/image/upload/v1782293898/b1_plystv.png')" }}
      />
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/p6-grain.png')]" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <div className="relative mb-10">
          <SectionHeader
            title="Our Bestsellers"
            subtitle="Shop The Collection"
          />
          <div className="absolute bottom-2 right-0 hidden md:block">
            <Link
              to="/shop"
              className="text-[14px] font-poppins font-bold uppercase tracking-[0.12em] text-[#362214] flex items-center gap-1.5 hover:text-[#5C0612] transition-colors pb-0.5 border-b border-dashed border-[#362214]/40"
            >
              <span>View Shop</span>
              <ArrowRight size={13} strokeWidth={2.5} />
            </Link>
          </div>
        </div>

        {/* Desktop Layout Matrix */}
        <div className="hidden lg:grid grid-cols-4 gap-6">
          {products.map((product, idx) => (
            <ProductCard key={product.id} product={product} idx={idx} triggerToast={triggerToast} />
          ))}
        </div>

        {/* Responsive Touch Carousel System */}
        <div className="block lg:hidden !-mr-6 md:!-mr-12">
          <Swiper
            modules={[Autoplay, Pagination]}
            spaceBetween={16}
            slidesPerView={1.2}
            pagination={{ clickable: true }}
            autoplay={{ delay: 4000, disableOnInteraction: false }}
            breakpoints={{
              480: { slidesPerView: 1.5 },
              640: { slidesPerView: 2.2 },
              868: { slidesPerView: 2.6 },
            }}
            className="pb-14 heritage-swiper"
          >
            {products.map((product, idx) => (
              <SwiperSlide key={product.id} className="h-auto">
                <ProductCard product={product} idx={idx} triggerToast={triggerToast} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>

      {/* Global Context Toast Messaging Interface */}
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
              className="opacity-50 hover:opacity-100 transition-opacity"
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{
        __html: `
        .heritage-swiper .swiper-pagination-bullet {
          background: #362214 !important;
          opacity: 0.2;
          width: 7px;
          height: 7px;
          transition: all 0.3s ease;
        }
        .heritage-swiper .swiper-pagination-bullet-active {
          opacity: 1;
          background: #5C0612 !important;
          width: 20px;
          border-radius: 4px;
        }
        .heritage-swiper .swiper-pagination {
          bottom: 0px !important;
        }
      `}} />
    </section>
  );
};

export default BestsellerProducts;
export { BestsellerProducts as Bestsellers };