import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { db } from '../components/Firebase';
import { doc, getDoc, collection, getDocs, query, orderBy } from 'firebase/firestore';
import { useAuth } from '../components/useAuth';
import {
  Star,
  ShieldCheck,
  Heart,
  ShoppingBag,
  Info,
  Leaf,
  Sparkles,
  ChevronRight,
  ChevronDown,
  X,
  Search,
  Minus,
  Plus,
  FlaskConical,
  Dumbbell,
  Utensils,
  Coffee,
  Clock,
  Droplet,
  Flame,
  Boxes,
  Calendar,
  CheckCircle2,
  Award,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from "../components/StoreProvider";
import PageHeader from "../components/Sattu/PageHeader";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeAccordion, setActiveAccordion] = useState('description');
  const [quantity, setQuantity] = useState(1);
  const [feedbackMessage, setFeedbackMessage] = useState(null);
  const [showZoom, setShowZoom] = useState(false);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState([]);

  const { addToCart, addToWishlist, removeFromWishlist, wishlist, cart } = useStore();

  const premiumEase = [0.25, 1, 0.5, 1];

  // Fetch Product
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, "products", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProduct({ id: docSnap.id, ...docSnap.data() });
        } else {
          setProduct(null);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  // Fetch Related Products based on product type
  useEffect(() => {
    if (!product) return;
    const fetchRelated = async () => {
      try {
        const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        const isOther = product.productType === "other";
        const related = all
          .filter(p => p.id !== product.id && (isOther ? p.productType === "other" : p.productType !== "other"))
          .slice(0, 4);
        setRelatedProducts(related);
      } catch (err) {
        console.error("Error fetching related products:", err);
      }
    };
    fetchRelated();
  }, [product]);

  // Determine Product Type
  const isOtherProduct = product?.productType === "other";

  // Gallery Images
  const galleryImages = useMemo(() => {
    if (product?.images && Array.isArray(product.images) && product.images.length > 0) {
      return product.images;
    }
    if (product?.image) {
      return [product.image];
    }
    return ["https://images.unsplash.com/photo-1594488651083-023b857dc3f8?q=80&w=600&auto=format&fit=crop"];
  }, [product]);

  const activeImage = galleryImages[activeImageIdx] || galleryImages[0];

  // Variants Calculation
  const variants = useMemo(() => {
    if (product?.variants && product.variants.length > 0) {
      return product.variants;
    }
    if (!product) return [];
    return [
      {
        weight: product.net_quantity || product.weight || (isOtherProduct ? "Standard Pack" : "500g"),
        price: product.price || 0,
        original_price: product.original_price || product.mrp || Math.round((product.price || 0) * 1.25),
        stock_status: product.stock_status || "In Stock",
        stock_count: product.stock_count !== undefined ? product.stock_count : 50
      }
    ];
  }, [product, isOtherProduct]);

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

  const currentVariant = variants[selectedVariantIdx] || variants[0] || {};
  const currentPrice = currentVariant.price || product?.price || 0;
  const currentOriginalPrice = currentVariant.original_price || product?.original_price || Math.round(currentPrice * 1.25);
  const savingsAmount = currentOriginalPrice > currentPrice ? currentOriginalPrice - currentPrice : 0;
  const savingsPercent = currentOriginalPrice > currentPrice ? Math.round((savingsAmount / currentOriginalPrice) * 100) : 0;

  const stockCount = currentVariant.stock_count !== undefined 
    ? Number(currentVariant.stock_count) 
    : (currentVariant.stock_status === "Out of Stock" ? 0 : 50);
  const isOutOfStock = stockCount <= 0;

  const cartItemId = `${product?.id}_${currentVariant.weight || ''}`;
  const existingInCart = cart.find(i => i.id === cartItemId || i.id === product?.id);
  const qtyInCart = existingInCart ? Number(existingInCart.quantity || 1) : 0;
  const isInCart = qtyInCart > 0;
  const maxAvailableToAdd = Math.max(0, stockCount - qtyInCart);
  const isMaxInCart = qtyInCart >= stockCount;
  const isWishlisted = wishlist.some(item => item.id === product?.id);

  const triggerToast = (msg) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  const handleBuyNow = () => {
    if (!product || isOutOfStock || isMaxInCart) return;
    if (!user) {
      navigate(`/login?redirect=product/${id}`);
      return;
    }
    
    const buyNowItem = {
      id: `${product.id}_${currentVariant.weight || ''}`,
      productId: product.id,
      name: product.name,
      price: currentPrice,
      weight: currentVariant.weight || product.net_quantity || "",
      image: activeImage,
      flavor: product.flavor || "",
      stock_count: stockCount,
      quantity: Math.min(quantity, maxAvailableToAdd > 0 ? maxAvailableToAdd : 1)
    };

    navigate('/checkout', { state: { buyNowItem } });
  };

  const addToCollection = async (type) => {
    if (!product) return;

    if (type === 'cart') {
      if (isOutOfStock) return;
      if (isMaxInCart) {
        triggerToast(`That's all stock left (${stockCount} units in your cart)`);
        return;
      }
      const actualQtyToAdd = Math.min(quantity, maxAvailableToAdd);
      await addToCart(product, actualQtyToAdd, currentVariant);
      triggerToast(`Added ${actualQtyToAdd} × ${product.name} to cart!`);
    } else {
      if (isWishlisted) {
        await removeFromWishlist(product.id);
        triggerToast("Removed from your wishlist!");
      } else {
        await addToWishlist(product);
        triggerToast("Added to your wishlist!");
      }
    }
  };

  // Dynamic Accordions according to product type
  const accordions = useMemo(() => {
    if (isOtherProduct) {
      return [
        { id: 'description', label: 'DESCRIPTION & ORIGIN', icon: Leaf },
        { id: 'ingredients', label: 'INGREDIENTS & PURITY', icon: Utensils },
        { id: 'storage', label: 'STORAGE & SHELF LIFE', icon: Clock },
        { id: 'nutrition', label: 'NUTRITIONAL & HEALTH VALUE', icon: ShieldCheck },
      ];
    } else {
      return [
        { id: 'description', label: 'DESCRIPTION & HERITAGE', icon: Leaf },
        { id: 'preparation', label: 'HOW TO PREPARE', icon: Coffee },
        { id: 'ingredients', label: 'INGREDIENTS', icon: Utensils },
        { id: 'nutrition', label: 'NUTRITION INFORMATION', icon: ShieldCheck },
      ];
    }
  }, [isOtherProduct]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF4E3] flex flex-col items-center justify-center gap-6 relative">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/p6-grain.png')]" />
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border border-[#E3DBC5] rounded-full" />
          <div className="absolute inset-0 border border-t-[#976E2A] rounded-full animate-spin" />
        </div>
        <p className="text-[13px] font-sans font-bold uppercase tracking-[0.3em] text-[#976E2A]">
          Loading Product Details...
        </p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#FAF4E3] flex flex-col items-center justify-center text-center p-6 relative">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/p6-grain.png')]" />
        <div className="w-16 h-16 rounded-full bg-[#FFFDF6] border border-[#E3DBC5] flex items-center justify-center text-[#976E2A] mb-6">
          <Info size={24} strokeWidth={1.5} />
        </div>
        <h3 className="text-2xl font-serif font-bold text-[#362214] mb-3">Product Not Found</h3>
        <p className="text-sm text-[#7A6E63] max-w-sm mx-auto mb-8 leading-relaxed">
          The requested item may have been moved or is currently unavailable.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#6b4f3a] text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-[#2A1B12] transition-all"
          >
            <span>Browse Sattu Blends</span>
            <ChevronRight size={14} />
          </Link>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#6b4f3a] border border-[#E5DEC9] font-bold text-xs uppercase tracking-wider rounded-xl hover:border-[#6b4f3a] transition-all"
          >
            <span>Browse Organic Products</span>
            <ChevronRight size={14} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen relative pt-6 pb-28 text-[#362214] selection:bg-[#976E2A] selection:text-white bg-cover bg-center font-sans"
      style={{ backgroundImage: "url('/img/b3.png')", backgroundColor: '#FDFBF7' }}
    >
      <div className="absolute inset-0 opacity-[0.035] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/p6-grain.png')]" />

      {/* Toast Notification */}
      <AnimatePresence>
        {feedbackMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
            className="fixed bottom-12 left-1/2 z-50 bg-[#2A1B12] text-white border border-[#D9A036]/40 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 max-w-md w-[90%] backdrop-blur-md"
          >
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 text-[#D9A036]">
              <Sparkles size={16} />
            </div>
            <p className="text-xs sm:text-sm font-bold tracking-wide flex-1">{feedbackMessage}</p>
            <button onClick={() => setFeedbackMessage(null)} className="text-white/60 hover:text-white transition-colors cursor-pointer">
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-[1240px] mx-auto px-5 sm:px-8 relative z-10">
        
        {/* BREADCRUMB HEADER - DYNAMIC ACCORDING TO SATTU VS OTHER */}
        <PageHeader
          breadcrumbItems={[
            { label: "Home", path: "/" },
            isOtherProduct
              ? { label: "Organic Products", path: "/products" }
              : { label: "Sattu Blends", path: "/shop" },
            { label: product.name }
          ]}
        />

        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 mt-6">
          
          {/* ================= LEFT COLUMN: PRODUCT IMAGES ================= */}
          <div className="w-full lg:w-1/2 lg:sticky lg:top-8 self-start space-y-4">
            
            {/* Main Stage Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: premiumEase }}
              className="relative w-full aspect-square sm:aspect-[4/4.2] bg-white border-2 border-white rounded-[2.2rem] shadow-[0_8px_30px_rgba(0,0,0,0.06)] flex items-center justify-center group overflow-hidden"
            >
              {/* Product Badge Pill */}
              <div className="absolute top-5 left-5 z-20 flex flex-col gap-2 items-start">
                <span className="px-4 py-1.5 rounded-full bg-white/95 backdrop-blur-md text-[11px] font-poppins font-black uppercase tracking-wider text-[#362214] shadow-sm border border-[#E5DEC9]">
                  {isOtherProduct
                    ? (product.category || 'Organic Pantry')
                    : (product.flavor || 'Authentic Sattu')}
                </span>

                {savingsPercent > 0 && (
                  <span className="px-3 py-1 rounded-full bg-[#976E2A] text-white text-[10px] font-poppins font-black uppercase tracking-wider shadow-sm">
                    {savingsPercent}% OFF
                  </span>
                )}
              </div>

              {/* Main Image View */}
              <img
                src={activeImage}
                alt={product.name}
                className="w-full h-full object-contain p-6 sm:p-8 transition-transform duration-700 ease-out group-hover:scale-106 z-10"
              />

              {/* Zoom Button */}
              <button 
                type="button"
                onClick={() => setShowZoom(true)}
                title="Click to zoom image"
                className="absolute bottom-5 right-5 z-20 bg-white/95 backdrop-blur-md p-3 rounded-full shadow-md text-[#362214] hover:bg-[#976E2A] hover:text-white transition-all transform hover:scale-110 active:scale-95 cursor-pointer border border-[#E5DEC9]"
              >
                <Search size={17} />
              </button>
            </motion.div>

            {/* Thumbnail Row (if multiple images exist) */}
            {galleryImages.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {galleryImages.map((imgUrl, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveImageIdx(i)}
                    className={`w-18 h-18 rounded-2xl border-2 overflow-hidden bg-white shrink-0 transition-all cursor-pointer p-1 ${
                      activeImageIdx === i
                        ? "border-[#976E2A] shadow-md scale-102"
                        : "border-[#E5DEC9] opacity-70 hover:opacity-100 hover:border-[#6b4f3a]"
                    }`}
                  >
                    <img src={imgUrl} alt={`Thumbnail ${i + 1}`} className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            )}

            {/* Back to Catalog Quick Link */}
            <div className="pt-2">
              <Link
                to={isOtherProduct ? "/products" : "/shop"}
                className="inline-flex items-center gap-2 text-xs font-poppins font-bold uppercase tracking-wider text-[#7A6E63] hover:text-[#976E2A] transition-colors"
              >
                <ArrowLeft size={14} />
                <span>Back to {isOtherProduct ? "Organic Products" : "Sattu Shop"}</span>
              </Link>
            </div>

          </div>

          {/* ================= RIGHT COLUMN: PRODUCT DETAILS ================= */}
          <div className="w-full lg:w-1/2 flex flex-col justify-start">
            
            {/* Reviews & Stock Badge */}
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <div className="flex gap-1 text-[#F5A623]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={15} fill="currentColor" stroke="none" />
                ))}
              </div>
              <span className="text-xs sm:text-sm font-bold text-[#7A6E63]">
                {product.rating || '4.9'} ({product.reviews_count || product.reviewsCount || '140'}+ Verified Reviews)
              </span>
              
              <span className={`text-[11px] font-black uppercase px-3 py-1 rounded-full border ${
                stockCount > 5
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : stockCount > 0
                  ? "bg-amber-50 text-amber-800 border-amber-200"
                  : "bg-red-50 text-red-800 border-red-200"
              }`}>
                {stockCount > 5 ? `In Stock` : stockCount > 0 ? `Only ${stockCount} Units Left!` : "Out of Stock"}
              </span>
            </div>

            {/* Product Title */}
            <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-serif font-black text-[#2A1B12] leading-tight mb-3">
              {product.name}
            </h1>

            {/* Tagline / Subtitle Banner - Customized for Product Type */}
            {isOtherProduct ? (
              product.tagline ? (
                <div className="mb-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#FAF4E3] border border-[#E5DEC9] text-[#976E2A] text-xs font-poppins font-bold">
                  <Sparkles size={14} className="shrink-0" />
                  <span>{product.tagline}</span>
                </div>
              ) : null
            ) : (
              <div className="mb-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#FAF4E3] border border-[#E5DEC9] text-[#976E2A] text-xs font-poppins font-bold">
                <Flame size={14} className="shrink-0" />
                <span>{product.roastingStyle || "Traditional Sand-Roasted & Stone-Ground Chana Sattu"}</span>
              </div>
            )}

            {/* Product Description */}
            <p className="text-[#6b4f3a] mb-6 leading-relaxed text-sm sm:text-base">
              {product.short_description || product.description || (
                isOtherProduct
                  ? "Handcrafted with traditional purity, sourced directly from certified organic farms."
                  : "A nutrient-dense superfood blend of premium stone-ground sattu packed with clean plant protein and dietary fibre."
              )}
            </p>

            {/* ================= KEY ATTRIBUTE STATS (SATTU VS OTHER) ================= */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6">
              {isOtherProduct ? (
                <>
                  <div className="bg-white/80 p-3 rounded-2xl border border-[#E5DEC9] text-center shadow-xs">
                    <Boxes size={18} className="mx-auto text-[#976E2A] mb-1" />
                    <span className="block text-[10px] font-bold text-[#7A6E63] uppercase">Category</span>
                    <span className="block text-xs font-black text-[#2A1B12] truncate mt-0.5">{product.category || "Pantry"}</span>
                  </div>
                  <div className="bg-white/80 p-3 rounded-2xl border border-[#E5DEC9] text-center shadow-xs">
                    <Calendar size={18} className="mx-auto text-[#976E2A] mb-1" />
                    <span className="block text-[10px] font-bold text-[#7A6E63] uppercase">Shelf Life</span>
                    <span className="block text-xs font-black text-[#2A1B12] mt-0.5">{product.shelfLife || "12 Months"}</span>
                  </div>
                  <div className="bg-white/80 p-3 rounded-2xl border border-[#E5DEC9] text-center shadow-xs">
                    <ShieldCheck size={18} className="mx-auto text-emerald-700 mb-1" />
                    <span className="block text-[10px] font-bold text-[#7A6E63] uppercase">Quality</span>
                    <span className="block text-xs font-black text-[#2A1B12] mt-0.5">100% Organic</span>
                  </div>
                  <div className="bg-white/80 p-3 rounded-2xl border border-[#E5DEC9] text-center shadow-xs">
                    <Leaf size={18} className="mx-auto text-emerald-700 mb-1" />
                    <span className="block text-[10px] font-bold text-[#7A6E63] uppercase">Chemicals</span>
                    <span className="block text-xs font-black text-[#2A1B12] mt-0.5">Zero Additives</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-white/80 p-3 rounded-2xl border border-[#E5DEC9] text-center shadow-xs">
                    <Dumbbell size={18} className="mx-auto text-[#976E2A] mb-1" />
                    <span className="block text-[10px] font-bold text-[#7A6E63] uppercase">Protein</span>
                    <span className="block text-xs font-black text-[#2A1B12] mt-0.5">{product.proteinPer100g || "24.5g / 100g"}</span>
                  </div>
                  <div className="bg-white/80 p-3 rounded-2xl border border-[#E5DEC9] text-center shadow-xs">
                    <Leaf size={18} className="mx-auto text-emerald-700 mb-1" />
                    <span className="block text-[10px] font-bold text-[#7A6E63] uppercase">Dietary Fiber</span>
                    <span className="block text-xs font-black text-[#2A1B12] mt-0.5">{product.fiberPer100g || "18g / 100g"}</span>
                  </div>
                  <div className="bg-white/80 p-3 rounded-2xl border border-[#E5DEC9] text-center shadow-xs">
                    <Flame size={18} className="mx-auto text-amber-600 mb-1" />
                    <span className="block text-[10px] font-bold text-[#7A6E63] uppercase">Energy</span>
                    <span className="block text-xs font-black text-[#2A1B12] mt-0.5">{product.energyKcal || "395 kcal"}</span>
                  </div>
                  <div className="bg-white/80 p-3 rounded-2xl border border-[#E5DEC9] text-center shadow-xs">
                    <ShieldCheck size={18} className="mx-auto text-[#976E2A] mb-1" />
                    <span className="block text-[10px] font-bold text-[#7A6E63] uppercase">Origin</span>
                    <span className="block text-xs font-black text-[#2A1B12] mt-0.5">Native Bihar</span>
                  </div>
                </>
              )}
            </div>

            {/* ================= PACK SIZE / VARIANT TIERS ================= */}
            {variants.length > 0 && (
              <div className="mb-6 bg-white/80 p-4 rounded-2xl border border-[#E5DEC9]">
                <div className="flex items-center justify-between mb-2.5">
                  <label className="block text-xs font-poppins font-black text-[#7A6E63] tracking-wider uppercase">
                    Select Pack Size / Quantity:
                  </label>
                  <span className="text-[11px] font-semibold text-[#976E2A]">
                    {currentVariant.weight} selected
                  </span>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {variants.map((v, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedVariantIdx(idx)}
                      className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-poppins font-bold transition-all border flex items-center gap-2 cursor-pointer ${
                        selectedVariantIdx === idx
                          ? "bg-[#6b4f3a] text-white border-[#6b4f3a] shadow-sm scale-102"
                          : v.stock_status === "Out of Stock"
                          ? "bg-red-50 text-red-400 border-red-200 line-through opacity-70"
                          : "bg-white text-[#2A1B12] border-[#E5DEC9] hover:border-[#6b4f3a]"
                      }`}
                    >
                      <span>{v.weight}</span>
                      <span className={`text-[11px] px-1.5 py-0.5 rounded font-black ${
                        selectedVariantIdx === idx
                          ? "bg-white/20 text-white"
                          : "bg-[#FAF4E3] text-[#976E2A]"
                      }`}>
                        ₹{v.price}
                      </span>
                      {v.stock_status && v.stock_status !== "In Stock" && (
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
                          {v.stock_status}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ================= PRICING ROW ================= */}
            <div className="flex flex-wrap items-center gap-4 mb-6 pb-6 border-b border-[#E5DEC9]">
              <span className="text-3xl sm:text-4xl font-sans font-black text-[#2A1B12]">
                ₹{currentPrice}
              </span>
              {currentOriginalPrice > currentPrice && (
                <span className="text-xl text-[#7A6E63] line-through font-sans font-medium">
                  ₹{currentOriginalPrice}
                </span>
              )}
              {savingsAmount > 0 && (
                <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-3.5 py-1 rounded-full text-xs font-black tracking-wide shadow-2xs">
                  Save ₹{savingsAmount} ({savingsPercent}% OFF)
                </span>
              )}
            </div>

            {/* ================= QUANTITY & ACTION BUTTONS ================= */}
            <div className="mb-8 space-y-4">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-poppins font-black text-[#7A6E63] tracking-wider uppercase">
                  Item Count
                </label>
                {isMaxInCart && (
                  <span className="text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                    That's all stock left ({stockCount} in cart)
                  </span>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                
                {/* Quantity Counter */}
                <div className="flex items-center justify-between border border-[#E5DEC9] rounded-2xl bg-white px-3.5 h-13 w-full sm:w-36 shrink-0 shadow-2xs">
                  <button 
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-1.5 text-[#6b4f3a] hover:bg-[#FAF4E3] rounded-xl transition-colors cursor-pointer"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="font-poppins font-bold text-base text-[#2A1B12]">{quantity}</span>
                  <button 
                    type="button"
                    onClick={() => setQuantity(prev => (maxAvailableToAdd > 0 ? Math.min(prev + 1, maxAvailableToAdd) : prev))}
                    disabled={quantity >= maxAvailableToAdd || isMaxInCart || isOutOfStock}
                    className={`p-1.5 rounded-xl transition-colors ${
                      quantity >= maxAvailableToAdd || isMaxInCart || isOutOfStock
                        ? "text-gray-300 cursor-not-allowed opacity-40"
                        : "text-[#6b4f3a] hover:bg-[#FAF4E3] cursor-pointer"
                    }`}
                  >
                    <Plus size={16} />
                  </button>
                </div>

                {/* Add to Cart Button */}
                <button
                  type="button"
                  onClick={() => addToCollection('cart')}
                  disabled={isOutOfStock || isMaxInCart}
                  className={`flex-1 h-13 rounded-2xl font-poppins font-black uppercase tracking-wider text-xs sm:text-sm transition-all duration-300 flex items-center justify-center gap-2.5 border cursor-pointer ${
                    isOutOfStock
                      ? "bg-red-50 text-red-600 border-red-200 cursor-not-allowed"
                      : isMaxInCart
                      ? "bg-amber-50 text-amber-800 border-amber-200 cursor-not-allowed"
                      : isInCart 
                      ? "bg-[#976E2A] text-white border-[#976E2A]" 
                      : "bg-white text-[#6b4f3a] border-[#6b4f3a] hover:bg-[#FAF4E3]"
                  }`}
                >
                  <span>{isOutOfStock ? "Out of Stock" : isMaxInCart ? "Max In Bag" : isInCart ? "Add More" : "Add to Cart"}</span>
                  {!isOutOfStock && !isMaxInCart && <ShoppingBag size={16} />}
                </button>

                {/* Buy Now Button */}
                <button
                  type="button"
                  onClick={handleBuyNow}
                  disabled={isOutOfStock || isMaxInCart}
                  className={`flex-1 h-13 rounded-2xl font-poppins font-black uppercase tracking-wider text-xs sm:text-sm transition-all duration-300 flex items-center justify-center gap-2.5 shadow-md cursor-pointer ${
                    isOutOfStock || isMaxInCart
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-[#2A1B12] text-white hover:bg-[#180E09] active:scale-[0.98]"
                  }`}
                >
                  <span>Buy Now</span>
                  <ChevronRight size={16} />
                </button>

                {/* Wishlist Button */}
                <button
                  type="button"
                  onClick={() => addToCollection('wishlist')}
                  className="w-13 h-13 shrink-0 border border-[#E5DEC9] rounded-2xl bg-white hover:border-[#6b4f3a] flex items-center justify-center transition-colors cursor-pointer group shadow-2xs"
                  title="Save to Wishlist"
                >
                  <Heart size={18} className="text-[#6b4f3a] group-hover:scale-110 transition-transform" fill={isWishlisted ? "currentColor" : "none"} />
                </button>

              </div>
            </div>

            {/* ================= QUALITY GUARANTEES ================= */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center border-t border-[#E5DEC9] pt-6 mb-8">
              {isOtherProduct ? (
                [
                  { icon: Leaf, text: 'Direct Farm\nSourcing' },
                  { icon: FlaskConical, text: 'Zero Chemical\nAdditives' },
                  { icon: Award, text: 'Traditional\nArtisanal Make' },
                  { icon: ShieldCheck, text: 'FSSAI\nQuality Tested' }
                ].map((item, i) => (
                  <div key={i} className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-[#FAF4E3] border border-[#E5DEC9] flex items-center justify-center text-[#976E2A]">
                      <item.icon size={18} />
                    </div>
                    <span className="text-[11px] font-bold text-[#6b4f3a] whitespace-pre-line leading-tight">
                      {item.text}
                    </span>
                  </div>
                ))
              ) : (
                [
                  { icon: Leaf, text: '100% Native\nRoasted Gram' },
                  { icon: FlaskConical, text: 'No Artificial\nPreservatives' },
                  { icon: Dumbbell, text: 'High Bio-Available\nPlant Protein' },
                  { icon: Utensils, text: 'Traditional Bihar\nStone Roast' }
                ].map((item, i) => (
                  <div key={i} className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-[#FAF4E3] border border-[#E5DEC9] flex items-center justify-center text-[#976E2A]">
                      <item.icon size={18} />
                    </div>
                    <span className="text-[11px] font-bold text-[#6b4f3a] whitespace-pre-line leading-tight">
                      {item.text}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* ================= DYNAMIC ACCORDIONS ================= */}
            <div className="flex flex-col gap-3">
              {accordions.map((acc) => (
                <div key={acc.id} className="bg-white/90 backdrop-blur-sm border border-[#E5DEC9] rounded-2xl overflow-hidden shadow-2xs transition-all hover:border-[#976E2A]/50">
                  <button
                    type="button"
                    onClick={() => setActiveAccordion(activeAccordion === acc.id ? null : acc.id)}
                    className="w-full px-5 py-4.5 flex items-center justify-between bg-transparent transition-colors cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-3">
                      <acc.icon className="text-[#976E2A]" size={17} />
                      <span className="font-poppins font-black text-[#2A1B12] tracking-wider uppercase text-xs sm:text-[13px]">{acc.label}</span>
                    </div>
                    <ChevronDown className={`text-[#7A6E63] transition-transform duration-300 ${activeAccordion === acc.id ? 'rotate-180 text-[#976E2A]' : ''}`} size={16} />
                  </button>
                  
                  <AnimatePresence>
                    {activeAccordion === acc.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-5 pt-1 text-[#6b4f3a] leading-relaxed text-xs sm:text-sm border-t border-[#E5DEC9]/50 mx-2">
                          
                          {/* DESCRIPTION ACCORDION */}
                          {acc.id === 'description' && (
                            <p>{product.description || (
                              isOtherProduct
                                ? 'Pure, unadulterated organic food crafted with traditional Indian care. Handcrafted in small batches to preserve vital micro-nutrients and natural flavors.'
                                : 'Experience the authentic structural purity of premium sattu, hand-selected and native stone-ground to perfection to maximize raw biological availability.'
                            )}</p>
                          )}

                          {/* INGREDIENTS ACCORDION */}
                          {acc.id === 'ingredients' && (
                            <div className="space-y-2">
                              <p className="font-medium">
                                {product.ingredients || (
                                  isOtherProduct
                                    ? '100% Single-origin natural organic ingredients with zero fillers or synthetic preservatives.'
                                    : 'Native Roasted Gram (Chana Sattu), Hand-milled grains.'
                                )}
                              </p>
                              <div className="flex items-center gap-2 text-[11px] text-[#976E2A] font-bold mt-2">
                                <CheckCircle2 size={13} />
                                <span>Pure Vegetarian • Non-GMO • Chemical Free</span>
                              </div>
                            </div>
                          )}

                          {/* HOW TO PREPARE ACCORDION (Sattu only) */}
                          {acc.id === 'preparation' && (
                            <div className="space-y-3">
                              <p className="whitespace-pre-line leading-loose">
                                {product.how_to_prepare || 
`1. Add 2-3 tablespoons of Sattu into a glass of chilled water, buttermilk, or milk.
2. For Sweet: Add jaggery (gud) or honey and a pinch of cardamom.
3. For Savory: Add chilled water, roasted cumin powder (jeera), black salt, and a squeeze of fresh lemon.
4. Stir well until completely smooth and drink fresh for instant biological hydration.`}
                              </p>
                            </div>
                          )}

                          {/* STORAGE ACCORDION (Other products only) */}
                          {acc.id === 'storage' && (
                            <div className="space-y-3">
                              <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#E5DEC9] space-y-1.5">
                                <span className="block text-xs font-black uppercase text-[#2A1B12]">Storage Instructions:</span>
                                <p className="text-xs text-[#7A6E63]">
                                  {product.storageInstructions || "Store in an airtight container in a cool, dry place away from direct sunlight and humidity."}
                                </p>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-[#976E2A] font-bold">
                                <Clock size={14} />
                                <span>Shelf Life: {product.shelfLife || "12 Months from packaging date"}</span>
                              </div>
                            </div>
                          )}

                          {/* NUTRITION ACCORDION */}
                          {acc.id === 'nutrition' && (
                            <div className="whitespace-pre-line font-medium text-xs sm:text-sm text-[#362214]">
                              {product.nutritional_info || (
                                isOtherProduct
                                  ? "100% pure organic food product with zero artificial preservatives, zero refined sugars, and zero chemical additives."
                                  : "Per 100g serving:\n\n• Energy: 395 kcal\n• Protein: 24.5g\n• Dietary Fiber: 18g\n• Carbohydrates: 58g\n• Healthy Fats: 5.5g\n• Iron & Calcium: High"
                              )}
                            </div>
                          )}

                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* ================= RELATED PRODUCTS SECTION ================= */}
        {relatedProducts.length > 0 && (
          <div className="mt-20 pt-12 border-t border-[#E5DEC9]">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-[11px] font-poppins font-black uppercase tracking-[0.2em] text-[#976E2A]">
                  {isOtherProduct ? "More From Our Pantry" : "More Sattu Blends"}
                </span>
                <h2 className="text-2xl sm:text-3xl font-serif font-black text-[#2A1B12] mt-1">
                  {isOtherProduct ? "You May Also Like" : "Explore More Blends"}
                </h2>
              </div>
              <Link
                to={isOtherProduct ? "/products" : "/shop"}
                className="text-xs font-poppins font-bold uppercase tracking-wider text-[#6b4f3a] hover:text-[#976E2A] flex items-center gap-1.5 transition-colors"
              >
                <span>View Full Collection</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((rel) => (
                <div
                  key={rel.id}
                  onClick={() => {
                    navigate(`/product/${rel.id}`);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="bg-white rounded-2xl p-5 border border-[#E5DEC9] shadow-xs hover:shadow-md transition-all duration-300 cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    <div className="w-full aspect-square rounded-xl bg-[#FAF7F2] p-3 flex items-center justify-center mb-3 overflow-hidden">
                      <img
                        src={rel.image || rel.images?.[0] || "https://images.unsplash.com/photo-1594488651083-023b857dc3f8?q=80&w=600&auto=format&fit=crop"}
                        alt={rel.name}
                        className="w-full h-full object-contain group-hover:scale-108 transition-transform duration-500"
                      />
                    </div>
                    <span className="text-[10px] font-poppins font-bold uppercase text-[#976E2A] tracking-wider block mb-1">
                      {rel.category || rel.flavor || (rel.productType === "other" ? "Organic" : "Sattu")}
                    </span>
                    <h3 className="font-poppins font-bold text-sm text-[#2A1B12] line-clamp-1 group-hover:text-[#976E2A] transition-colors mb-2">
                      {rel.name}
                    </h3>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#E5DEC9]/60">
                    <span className="text-base font-sans font-black text-[#2A1B12]">
                      ₹{rel.price || 199}
                    </span>
                    <span className="text-[11px] font-poppins font-bold text-[#6b4f3a] group-hover:underline flex items-center gap-1">
                      <span>View</span>
                      <ChevronRight size={12} />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* ================= MOBILE FIXED BOTTOM ADD TO CART BAR ================= */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[100] bg-white/95 backdrop-blur-2xl border-t border-[#E5DEC9] px-4 pt-3 pb-6 shadow-[0_-10px_30px_rgba(0,0,0,0.08)]">
        <div className="flex items-center gap-3">
          {/* Quantity Selector */}
          <div className="flex items-center justify-between border border-[#E5DEC9] rounded-xl bg-[#FAF7F2] px-2.5 h-12 w-28 shrink-0">
            <button 
              type="button"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="p-1 text-[#6b4f3a] active:bg-[#FAF4E3] rounded-lg"
            >
              <Minus size={15}/>
            </button>
            <span className="font-bold text-sm text-[#2A1B12]">{quantity}</span>
            <button 
              type="button"
              onClick={() => setQuantity(prev => (maxAvailableToAdd > 0 ? Math.min(prev + 1, maxAvailableToAdd) : prev))}
              disabled={quantity >= maxAvailableToAdd || isMaxInCart || isOutOfStock}
              className="p-1 text-[#6b4f3a] active:bg-[#FAF4E3] rounded-lg disabled:opacity-40"
            >
              <Plus size={15}/>
            </button>
          </div>

          {/* Add to Cart */}
          <button
            type="button"
            onClick={() => addToCollection('cart')}
            disabled={isOutOfStock || isMaxInCart}
            className={`flex-1 h-12 rounded-xl font-poppins font-black uppercase text-xs tracking-wider transition-all flex items-center justify-center gap-2 border ${
              isInCart 
                ? "bg-[#976E2A] text-white border-[#976E2A]" 
                : "bg-white text-[#6b4f3a] border-[#6b4f3a]"
            }`}
          >
            <span>{isInCart ? "Add More" : "Add to Cart"}</span>
            <ShoppingBag size={15} />
          </button>

          {/* Buy Now */}
          <button
            type="button"
            onClick={handleBuyNow}
            disabled={isOutOfStock || isMaxInCart}
            className="flex-1 h-12 bg-[#2A1B12] text-white rounded-xl font-poppins font-black uppercase text-xs tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-md"
          >
            <span>Buy Now</span>
            <ChevronRight size={15} />
          </button>
        </div>
      </div>

      {/* ================= FULL SCREEN ZOOM MODAL ================= */}
      <AnimatePresence>
        {showZoom && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 sm:p-8"
            onClick={() => setShowZoom(false)}
          >
            <motion.button
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors bg-white/10 p-3 rounded-full hover:bg-white/20 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setShowZoom(false);
              }}
            >
              <X size={22} />
            </motion.button>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative max-w-full max-h-full cursor-zoom-out"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={activeImage}
                alt={product.name}
                className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
              />
              <div className="absolute -bottom-10 left-0 right-0 text-center">
                <h2 className="text-white font-serif font-bold text-lg sm:text-xl tracking-wide">{product.name}</h2>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default ProductDetail;