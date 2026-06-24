import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { db } from '../components/Firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../components/useAuth';
import {
  Star,
  Shield,
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
  Coffee
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

  const { addToCart, addToWishlist, removeFromWishlist, wishlist, cart } = useStore();
  const isInCart = cart.some(item => item.id === id);
  const isWishlisted = wishlist.some(item => item.id === id);

  const premiumEase = [0.25, 1, 0.5, 1];

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const docRef = doc(db, "products", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProduct({ id: docSnap.id, ...docSnap.data() });
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const triggerToast = (msg) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  const addToCollection = async (type) => {
    if (!product) return;

    if (type === 'cart') {
      if (isInCart) return;
      for (let i = 0; i < quantity; i++) {
        await addToCart(product);
      }
      triggerToast(`${quantity} ${quantity > 1 ? 'items' : 'item'} added to your cart!`);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF4E3] flex flex-col items-center justify-center gap-6 relative">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/p6-grain.png')]" />
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border border-[#E3DBC5] rounded-full" />
          <div className="absolute inset-0 border border-t-[#c89b60] rounded-full animate-spin" />
        </div>
        <p className="text-[14px] font-medium uppercase tracking-[0.4em] text-[#c89b60]">Loading...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#FAF4E3] flex flex-col items-center justify-center text-center p-6 relative">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/p6-grain.png')]" />
        <div className="w-16 h-16 rounded-full bg-[#FFFDF6] border border-[#E3DBC5] flex items-center justify-center text-[#c89b60] mb-6">
          <Info size={20} strokeWidth={1.2} />
        </div>
        <h3 className="text-2xl font-serif text-[#4a3b32] mb-3">Product Not Found</h3>
        <p className="text-sm text-[#4a3b32]/70 max-w-sm mx-auto mb-10 leading-relaxed tracking-wide">
          We couldn't find the requested product in our registry.
        </p>
        <Link to="/shop" className="inline-flex items-center gap-3 px-8 py-4 bg-[#5b4231] text-white font-bold text-[14px] uppercase tracking-[0.2em] rounded-xl hover:bg-[#4a3528] transition-all">
          <span>Return To Shop</span>
          <ChevronRight size={14} />
        </Link>
      </div>
    );
  }

  const accordions = [
    { id: 'description', label: 'DESCRIPTION', icon: Leaf },
    { id: 'ingredients', label: 'INGREDIENTS', icon: Utensils },
    { id: 'nutrition', label: 'NUTRITION INFORMATION', icon: Shield },
    { id: 'preparation', label: 'HOW TO PREPARE', icon: Coffee },
  ];

  return (
    <div
      className="min-h-screen relative pt-8 pb-32 text-[#4a3b32] selection:bg-[#c89b60] selection:text-white bg-cover bg-center font-sans"
      style={{ backgroundImage: "url('/img/b3.png')", backgroundColor: '#FDFBF5' }}
    >
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/p6-grain.png')]" />

      {/* Toast Notification */}
      <AnimatePresence>
        {feedbackMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
            className="fixed bottom-12 left-1/2 z-50 bg-white border border-[#c89b60]/30 text-[#4a3b32] px-6 py-4 rounded-xl shadow-lg flex items-center gap-4 max-w-md w-[90%]"
          >
            <div className="w-8 h-8 rounded-full bg-[#FAF4E3] border border-[#E3DBC5] flex items-center justify-center shrink-0">
              <Sparkles size={14} className="text-[#c89b60]" />
            </div>
            <p className="text-[14px] font-bold uppercase tracking-wider flex-1 mt-0.5">{feedbackMessage}</p>
            <button onClick={() => setFeedbackMessage(null)} className="text-[#4a3b32]/40 hover:text-[#c89b60] transition-colors">
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-[1200px] mx-auto px-6 lg:px-8 relative z-10">
        
        <PageHeader
          breadcrumbItems={[
            { label: "Home", path: "/" },
            { label: "Boutique", path: "/shop" },
            { label: product.name }
          ]}
        />

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 mt-8">
          
          {/* LEFT: IMAGE CARD */}
          <div className="w-full lg:w-1/2 lg:sticky lg:top-10 self-start">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: premiumEase }}
              className="relative w-full aspect-[4/5] sm:aspect-square lg:aspect-[4/5] bg-[#F8F3E6] border-2 border-white rounded-[2.5rem] shadow-sm flex items-center justify-center group overflow-hidden"
            >
              {/* Product Type Pill */}
              <div className="absolute top-6 left-6 z-20">
                <span className="px-5 py-2 rounded-full bg-white/90 backdrop-blur-sm text-[11px] font-bold uppercase tracking-widest text-[#4a3b32] shadow-sm">
                  {product.type || 'DRY FRUIT'}
                </span>
              </div>

              {/* Main Image */}
              <img
                src={product.image || product.images?.[0] || "https://images.unsplash.com/photo-1594488651083-023b857dc3f8?q=80&w=600&auto=format&fit=crop"}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 z-10"
              />

              {/* Bottom Controls (Zoom Button) */}
              <button 
                onClick={() => setShowZoom(true)}
                className="absolute bottom-6 left-6 z-20 bg-white/90 backdrop-blur-sm p-3.5 rounded-full shadow-lg text-[#4a3b32] hover:bg-[#c89b60] hover:text-white transition-all transform hover:scale-110 active:scale-95"
              >
                <Search size={18} />
              </button>

              {/* Pagination Dots */}
              <div className="absolute bottom-8 right-8 z-20 flex gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#4a3b32]"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-white opacity-60"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-white opacity-60"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-white opacity-60"></div>
              </div>
            </motion.div>
          </div>

          {/* RIGHT: DETAILS */}
          <div className="w-full lg:w-1/2 flex flex-col justify-center">
            
            {/* Reviews */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex gap-1 text-[#c89b60]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={15} fill="currentColor" stroke="none" />
                ))}
              </div>
              <span className="text-sm font-medium text-[#8c7361]">
                {product.rating || '4.5'} ({product.reviews_count || '125'} Verified Reviews)
              </span>
            </div>

            {/* Title */}
            <h1 className="text-4xl sm:text-4xl lg:text-5xl font-serif text-[#3e2b1e] mb-4">
              {product.name}
            </h1>

            {/* Subtitle/Description */}
            <p className="text-[#6b4f3a] mb-8 leading-relaxed text-base lg:text-md">
              {product.short_description || "A delicious blend of premium sattu with dry fruits. Rich in protein, fibre & essential nutrients."}
            </p>

            {/* Divider */}
            <div className="flex items-center mb-8">
              <div className="h-px bg-[#E8DCC4] flex-1"></div>
              <Leaf className="mx-4 text-[#c89b60] opacity-60" size={16} />
              <div className="h-px bg-[#E8DCC4] flex-1"></div>
            </div>

            {/* Price Row */}
            <div className="flex flex-wrap items-center gap-5 mb-10">
              <span className="text-3xl lg:text-4xl font-serif text-[#3e2b1e]">₹{product.price || '350'}</span>
              {(product.original_price || '450') && (
                <span className="text-2xl text-[#8c7361] line-through font-serif">₹{product.original_price || '450'}</span>
              )}
              <span className="bg-[#c89b60] text-white px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide shadow-sm">
                Save ₹{(product.original_price || 450) - (product.price || 350)}
              </span>
            </div>

            {/* Quantity & Actions */}
            <div className="mb-14">
              <label className="block text-xs font-bold text-[#8c7361] tracking-[0.2em] mb-4 uppercase">Quantity</label>
              <div className="flex flex-col sm:flex-row items-stretch gap-4">
                
                {/* Quantity Selector */}
                <div className="flex items-center justify-between border border-[#E8DCC4] rounded-xl bg-white px-2 h-14 w-full sm:w-32 shrink-0">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 text-[#6b4f3a] hover:bg-[#F8F3E6] rounded-lg transition-colors"
                  >
                    <Minus size={16}/>
                  </button>
                  <span className="font-semibold text-lg text-[#3e2b1e]">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 text-[#6b4f3a] hover:bg-[#F8F3E6] rounded-lg transition-colors"
                  >
                    <Plus size={16}/>
                  </button>
                </div>

                {/* Add to Cart */}
                <button
                  onClick={() => addToCollection('cart')}
                  className={`flex-1 h-14 rounded-xl font-bold tracking-widest uppercase text-sm transition-all duration-300 flex items-center justify-center gap-3 shadow-md ${
                    isInCart 
                      ? "bg-[#c89b60] text-white cursor-default" 
                      : "bg-[#5b4231] text-white hover:bg-[#4a3528]"
                  }`}
                >
                  {isInCart ? "In Cart" : "Add to Cart"} <ShoppingBag size={18} />
                </button>

                {/* Wishlist */}
                <button
                  onClick={() => addToCollection('wishlist')}
                  className="w-14 h-14 shrink-0 border border-[#E8DCC4] rounded-xl bg-white hover:border-[#5b4231] flex items-center justify-center transition-colors group"
                >
                  <Heart size={20} className="text-[#5b4231] group-hover:scale-110 transition-transform" fill={isWishlisted ? "currentColor" : "none"} />
                </button>
              </div>
            </div>

            {/* Features Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center border-t border-[#E8DCC4] pt-8 mb-12">
              {[
                { icon: Leaf, text: '100% Natural\nIngredients' },
                { icon: FlaskConical, text: 'No Added\nPreservatives' },
                { icon: Dumbbell, text: 'High in\nProtein & Fibre' },
                { icon: Utensils, text: 'Made with\nTraditional Goodness' }
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center gap-3">
                  <div className="text-[#8c7361]">
                    <item.icon size={28} strokeWidth={1.5} />
                  </div>
                  <span className="text-xs font-medium text-[#6b4f3a] whitespace-pre-line leading-relaxed">
                    {item.text}
                  </span>
                </div>
              ))}
            </div>

            {/* ACCORDION SECTION (Moved inside details column) */}
            <div className="flex flex-col gap-4">
              {accordions.map((acc) => (
                <div key={acc.id} className="bg-white/50 backdrop-blur-sm border border-[#E8DCC4]/60 rounded-2xl overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-all hover:bg-white/80">
                  <button
                    onClick={() => setActiveAccordion(activeAccordion === acc.id ? null : acc.id)}
                    className="w-full px-6 py-5 flex items-center justify-between bg-transparent transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <acc.icon className="text-[#8c7361]" size={18} />
                      <span className="font-bold text-[#3e2b1e] tracking-[0.12em] uppercase text-[13px]">{acc.label}</span>
                    </div>
                    <ChevronDown className={`text-[#8c7361] transition-transform duration-300 ${activeAccordion === acc.id ? 'rotate-180' : ''}`} size={16} />
                  </button>
                  
                  <AnimatePresence>
                    {activeAccordion === acc.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-6 pt-2 text-[#6b4f3a] leading-loose text-sm border-t border-[#E8DCC4]/30 mx-4">
                          {acc.id === 'description' && (
                            <p>{product.description || 'Experience the authentic structural purity of premium sattu, hand-selected and native stone-ground to perfection to maximize raw biological availability.'}</p>
                          )}
                          {acc.id === 'ingredients' && (
                            <p className="italic">{product.ingredients || 'Native Roasted Gram (Chana Sattu), Premium Almonds, Cashews, Pistachios, Hand-milled Barley.'}</p>
                          )}
                          {acc.id === 'nutrition' && (
                            <div className="whitespace-pre-line font-medium text-sm text-[#4a3b32]">
                              {product.nutritional_info || 'Per 100g serving:\n\n• Energy: 410 kcal\n• Protein: 22g\n• Dietary Fiber: 12g\n• Carbohydrates: 60g\n• Healthy Fats: 8g'}
                            </div>
                          )}
                          {acc.id === 'preparation' && (
                            <div className="space-y-4">
                              <p className="whitespace-pre-line italic">
                                {product.how_to_prepare || '1. Add 2 tablespoons of Dryfruit Sattu to a glass of chilled water or milk.\n2. Add jaggery or sugar to taste.\n3. Stir well until perfectly blended and enjoy the nutritious drink.'}
                              </p>
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
      </div>

      {/* MOBILE ADD TO CART - FIXED BOTTOM */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[100] bg-white/90 backdrop-blur-xl border-t border-[#E8DCC4] p-4 pb-8 flex items-center gap-3 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-between border border-[#E8DCC4] rounded-xl bg-white px-2 h-16 w-32 shrink-0">
          <button 
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="p-2 text-[#6b4f3a] hover:bg-[#F8F3E6] rounded-lg transition-colors"
          >
            <Minus size={16}/>
          </button>
          <span className="font-bold text-lg text-[#3e2b1e]">{quantity}</span>
          <button 
            onClick={() => setQuantity(quantity + 1)}
            className="p-2 text-[#6b4f3a] hover:bg-[#F8F3E6] rounded-lg transition-colors"
          >
            <Plus size={16}/>
          </button>
        </div>

        <button
          onClick={() => addToCollection('cart')}
          className={`flex-1 h-16 rounded-2xl font-bold tracking-[0.15em] uppercase text-[13px] transition-all duration-300 flex items-center justify-center gap-3 shadow-lg active:scale-[0.98] ${
            isInCart 
              ? "bg-[#c89b60] text-white" 
              : "bg-[#5b4231] text-white"
          }`}
        >
          {isInCart ? "Already in Cart" : "Add to Cart"} <ShoppingBag size={18} />
        </button>
      </div>

      {/* ZOOM MODAL */}
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
              className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors bg-white/10 p-3 rounded-full hover:bg-white/20"
              onClick={(e) => {
                e.stopPropagation();
                setShowZoom(false);
              }}
            >
              <X size={24} />
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
                src={product.image || product.images?.[0] || "https://images.unsplash.com/photo-1594488651083-023b857dc3f8?q=80&w=600&auto=format&fit=crop"}
                alt={product.name}
                className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl"
              />
              <div className="absolute -bottom-12 left-0 right-0 text-center">
                <h2 className="text-white font-serif text-xl sm:text-2xl tracking-wide">{product.name}</h2>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default ProductDetail;