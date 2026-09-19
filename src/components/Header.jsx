import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { User, Search, Menu, X, Leaf, Heart, ArrowRight, ShoppingBag, Sparkles, Home, Store, Boxes } from 'lucide-react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from './useAuth';
import { useStore } from './StoreProvider';
import { db } from './Firebase';
import { doc, onSnapshot } from 'firebase/firestore';

const DEFAULT_TICKERS = [
  "100% Certified Organic Foods",
  "Stone-Ground · Sun-Dried · Pure Heritage Nutrition",
  "Premium Roasted Sattu & Organic Staples",
  "Free Express Shipping Above ₹999"
];

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  const { cart, wishlist } = useStore();
  const { scrollY } = useScroll();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [tickerMessages, setTickerMessages] = useState(DEFAULT_TICKERS);
  const [tickerEnabled, setTickerEnabled] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "homepage"), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data.tickerMessages && data.tickerMessages.length > 0) {
          setTickerMessages(data.tickerMessages);
        }
        if (data.tickerEnabled !== undefined) {
          setTickerEnabled(data.tickerEnabled);
        }
      }
    }, (err) => {
      console.log("Using default ticker settings");
    });
    return () => unsub();
  }, []);

  const cartCount = cart.length;
  const wishlistCount = wishlist.length;

  // Smooth architectural scroll transformations
  const headerHeight = useTransform(scrollY, [0, 80], ['84px', '70px']);
  const headerBg = useTransform(
    scrollY,
    [0, 80],
    ['rgba(253, 246, 233, 0.65)', 'rgba(253, 246, 233, 0.96)']
  );
  const headerBorder = useTransform(
    scrollY,
    [0, 80],
    ['rgba(229, 222, 201, 0.4)', 'rgba(217, 160, 54, 0.35)']
  );
  const logoScale = useTransform(scrollY, [0, 80], [1, 0.95]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Sattu Shop', path: '/shop' },
    { name: 'Products', path: '/products' },
    { name: 'About Us', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  const menuVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.06, duration: 0.5, ease: [0.215, 0.610, 0.355, 1.000] }
    })
  };

  const mobileNavItems = [
    { name: 'Products', icon: Boxes, path: '/products' },
    { name: 'Shop', icon: Store, path: '/shop' },
    { name: 'Wishlist', icon: Heart, path: '/wishlist', count: wishlistCount },
    { name: 'Home', icon: Home, path: '/' },
    { name: 'Selection', icon: ShoppingBag, path: '/cart', count: cartCount },
    { name: 'Registry', icon: User, path: '/account' },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-[100] transition-all duration-500">
        {/* Ticker Announcement */}
        {tickerEnabled !== false && (
          <div className="bg-[#2A1B12] text-[#FDF6E9] py-2 px-4 overflow-hidden relative border-b border-[#D9A036]/30 select-none hidden md:block">
            <div className="absolute inset-0 opacity-[0.06] pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:12px_12px]" />
            <motion.div
              animate={{ x: [0, -1400] }}
              transition={{ repeat: Infinity, duration: 35, ease: "linear" }}
              className="flex gap-16 whitespace-nowrap items-center text-xs sm:text-sm font-poppins font-extrabold tracking-wider uppercase text-[#D9A036] relative z-10"
            >
              {[...tickerMessages, ...tickerMessages, ...tickerMessages].map((msg, i) => (
                <span key={i} className="flex items-center gap-2.5 text-[#FDF6E9]">
                  {i % 2 === 0 ? <Leaf size={13} className="text-[#D9A036]" /> : <Sparkles size={13} className="text-[#D9A036]" />}
                  <span>{msg}</span>
                </span>
              ))}
            </motion.div>
          </div>
        )}

        {/* Main Header */}
        <motion.nav
          style={{
            height: headerHeight,
            backgroundColor: headerBg,
            borderBottomWidth: '1px',
            borderBottomColor: headerBorder,
            backdropFilter: 'blur(20px)'
          }}
          className="px-4 sm:px-8 md:px-12 flex items-center transition-all duration-500 shadow-2xs"
        >
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between">

            {/* Logo */}
            <motion.div style={{ scale: logoScale }}>
              <Link to="/" className="flex items-center gap-3.5 group relative z-[110]">
                {/* Logo Container */}
                <div className="w-11 h-11 md:w-13 md:h-13 rounded-2xl bg-white border border-[#E5DEC9] p-1 flex items-center justify-center shadow-xs group-hover:border-[#D9A036] transition-colors">
                  <img
                    src="https://res.cloudinary.com/duzwys877/image/upload/v1782295170/logo_rwarlx.png"
                    alt="Vedamya Foods Logo"
                    className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                
                {/* Typography Container */}
                <div className="flex flex-col justify-center border-l-2 border-[#6b4f3b]/20 pl-3.5 py-0.5">
                  <span className="text-[21px] md:text-[26px] font-poppins font-black text-[#2A1B12] leading-none tracking-tight uppercase group-hover:text-[#6b4f3b] transition-colors">
                    Vedamya
                  </span>
                  <span className="text-[13px] md:text-[15px] font-poppins font-extrabold text-[#976E2A] leading-none tracking-wider uppercase mt-0.5">
                    Foods
                  </span>
                </div>
              </Link>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-2 xl:gap-3">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`px-4.5 py-2.5 rounded-2xl text-[16px] xl:text-[17px] font-black uppercase tracking-wider transition-all relative group cursor-pointer ${
                      isActive
                        ? "text-[#2A1B12] bg-[#D9A036]/20 border border-[#D9A036]/40 shadow-xs"
                        : "text-[#4A3425] hover:text-[#2A1B12] hover:bg-[#6b4f3b]/10"
                    }`}
                  >
                    <span className="relative z-10">{link.name.toUpperCase()}</span>
                    {isActive && (
                      <motion.span
                        layoutId="luxuryNavBg"
                        className="absolute inset-0 bg-[#D9A036]/15 rounded-2xl"
                      />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Desktop Action Icons */}
            <div className="hidden md:flex items-center gap-3">
              <motion.button 
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsSearchOpen(true)}
                className="w-10.5 h-10.5 rounded-2xl bg-white/90 border border-[#E5DEC9] text-[#2A1B12] hover:border-[#D9A036] hover:text-[#976E2A] flex items-center justify-center transition-all shadow-xs cursor-pointer"
                title="Search Products"
              >
                <Search size={19} strokeWidth={2.2} />
              </motion.button>

              <Link 
                to="/wishlist" 
                className="relative w-10.5 h-10.5 rounded-2xl bg-white/90 border border-[#E5DEC9] text-[#2A1B12] hover:border-[#D9A036] hover:text-[#976E2A] flex items-center justify-center transition-all shadow-xs"
                title="Wishlist"
              >
                <Heart size={19} strokeWidth={2.2} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-[#D9A036] text-[#2A1B12] text-xs font-black h-5 w-5 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              <Link 
                to="/account" 
                className="w-10.5 h-10.5 rounded-2xl bg-white/90 border border-[#E5DEC9] text-[#2A1B12] hover:border-[#D9A036] hover:text-[#976E2A] flex items-center justify-center transition-all shadow-xs"
                title="Account"
              >
                <User size={19} strokeWidth={2.2} />
              </Link>

              {/* Animated Cart Button */}
              <motion.div
                whileHover={{ scale: 1.07 }}
                whileTap={{ scale: 0.95 }}
                animate={cartCount > 0 ? { y: [0, -4, 0] } : { y: [0, -2, 0] }}
                transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                className="relative"
              >
                <Link 
                  to="/cart" 
                  className="relative bg-gradient-to-r from-[#6b4f3a] via-[#523d2d] to-[#2A1B12] text-white px-5 py-2.5 rounded-2xl shadow-[0_4px_20px_rgba(107,79,58,0.35)] hover:shadow-[0_6px_25px_rgba(217,160,54,0.45)] transition-all flex items-center gap-2.5 font-black text-sm uppercase tracking-wider cursor-pointer border-2 border-[#D9A036]/50 overflow-hidden group"
                >
                  {/* Continuous Shine Effect */}
                  <motion.span
                    animate={{ x: ["-100%", "200%"] }}
                    transition={{ repeat: Infinity, duration: 3, ease: "easeInOut", repeatDelay: 1 }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12"
                  />

                  {/* Pulsing Outer Glow */}
                  <span className="absolute -inset-0.5 bg-gradient-to-r from-[#D9A036]/60 via-[#6b4f3a]/40 to-[#D9A036]/60 rounded-2xl blur-xs opacity-80 group-hover:opacity-100 transition duration-500 animate-pulse -z-10" />

                  {/* Cart Icon with Wiggle Animation */}
                  <motion.div
                    animate={cartCount > 0 ? { rotate: [0, -12, 12, -6, 6, 0] } : { rotate: [0, -5, 5, 0] }}
                    transition={{ repeat: Infinity, duration: 2.5, repeatDelay: 1.5 }}
                  >
                    <ShoppingBag size={20} strokeWidth={2.4} className="text-[#D9A036] relative z-10 group-hover:scale-110 transition-transform" />
                  </motion.div>

                  <span className="relative z-10 font-black text-[15px] tracking-wider text-white">
                    CART
                  </span>

                  {cartCount > 0 && (
                    <motion.span
                      key={cartCount}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: [1, 1.35, 1], opacity: 1 }}
                      transition={{ duration: 0.35, ease: "backOut" }}
                      className="relative z-10 bg-[#D9A036] text-[#1A1009] text-xs font-black min-w-[22px] h-[22px] px-1.5 rounded-full flex items-center justify-center shadow-md border border-white/50 animate-bounce"
                    >
                      {cartCount}
                    </motion.span>
                  )}
                </Link>
              </motion.div>
            </div>

            {/* Mobile Menu Trigger */}
            <div className="md:hidden flex items-center gap-2.5">
              <button 
                onClick={() => setIsSearchOpen(true)}
                className="text-[#2A1B12] p-2.5 bg-white/90 rounded-2xl border border-[#E5DEC9] shadow-2xs"
              >
                <Search size={20} />
              </button>
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="text-[#2A1B12] p-2.5 bg-white/90 rounded-2xl border border-[#E5DEC9] shadow-2xs"
              >
                <Menu size={20} />
              </button>
            </div>
          </div>
        </motion.nav>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              className="fixed inset-0 bg-[#FDF6E9] z-[200] flex flex-col pt-[80px]"
            >
              <div className="w-full px-6 h-[80px] flex items-center justify-between border-b border-[#6b4f3b]/10 absolute top-0 left-0">
                <span className="text-xl font-poppins font-black text-[#2A1B12] uppercase tracking-tight">Navigation</span>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="bg-[#6b4f3b] text-white p-2.5 rounded-full shadow-md"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="px-8 py-10 space-y-6 flex-1 overflow-y-auto">
                {navLinks.map((link, idx) => (
                  <motion.div key={link.name} variants={menuVariants} custom={idx} initial="hidden" animate="visible">
                    <Link 
                      to={link.path} 
                      className="text-2xl sm:text-3xl font-poppins font-black text-[#2A1B12] flex items-center justify-between py-2 border-b border-[#6b4f3b]/10"
                    >
                      <span>{link.name}</span>
                      <ArrowRight size={22} className="text-[#D9A036]" />
                    </Link>
                  </motion.div>
                ))}
              </div>

              <div className="p-8 border-t border-[#6b4f3b]/10 text-[#6b4f3b]/70 text-xs sm:text-sm font-extrabold uppercase tracking-wider text-center">
                © 2026 VEDAMYA FOODS • PURE HERITAGE NUTRITION
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search Overlay */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-[#1A1009]/60 backdrop-blur-md z-[300] flex items-start justify-center pt-24 px-6"
              onClick={() => setIsSearchOpen(false)}
            >
              <motion.div
                initial={{ y: -40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -40, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-2xl bg-[#FAF4E3] rounded-[36px] p-8 shadow-2xl relative border border-[#D9A036]/30"
              >
                <button 
                  onClick={() => setIsSearchOpen(false)}
                  className="absolute top-6 right-6 p-2 rounded-full hover:bg-[#6b4f3b]/10 text-[#6b4f3b] transition-colors cursor-pointer"
                >
                  <X size={22} />
                </button>

                <div className="space-y-7">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-[#6b4f3b] text-white flex items-center justify-center shadow-md">
                      <Search size={22} />
                    </div>
                    <div>
                      <h3 className="text-xl sm:text-2xl font-poppins font-black text-[#2A1B12]">Quick Product Search</h3>
                      <p className="text-xs sm:text-sm text-[#6b4f3b]/70 font-semibold mt-0.5">Find heritage sattu blends & organic items</p>
                    </div>
                  </div>

                  <form onSubmit={handleSearch} className="relative">
                    <input
                      autoFocus
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search for sattu, makhana, spices..."
                      className="w-full bg-[#FFFDF6] border border-[#E3DBC5] focus:border-[#6b4f3b] focus:ring-1 focus:ring-[#6b4f3b] outline-none py-4 pl-6 pr-16 rounded-2xl text-sm sm:text-base font-poppins font-semibold text-[#2A1B12] shadow-inner transition-all"
                    />
                    <button 
                      type="submit"
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-xl bg-[#6b4f3b] text-white flex items-center justify-center hover:bg-[#2A1B12] transition-colors shadow-md cursor-pointer"
                    >
                      <ArrowRight size={20} />
                    </button>
                  </form>

                  <div className="flex flex-wrap gap-2 pt-3 border-t border-[#6b4f3b]/10">
                    <span className="text-xs font-extrabold uppercase text-[#6b4f3b]/60 mr-1 flex items-center">Popular:</span>
                    {['Classic', 'Elaichi', 'Dry Fruit', 'Rose', 'Chocolate', 'Makhana'].map(tag => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => {
                          setSearchQuery(tag);
                          navigate(`/shop?search=${encodeURIComponent(tag)}`);
                          setIsSearchOpen(false);
                          setSearchQuery("");
                        }}
                        className="px-4 py-2 rounded-xl bg-white border border-[#E3DBC5] text-[#6b4f3b] hover:text-white hover:border-[#6b4f3b] hover:bg-[#6b4f3b] transition-all text-xs font-extrabold uppercase tracking-wider cursor-pointer shadow-2xs"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* MOBILE BOTTOM DOCK NAVIGATION */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-[420px] h-[72px] bg-white/95 backdrop-blur-xl rounded-[26px] border border-[#E5DEC9] md:hidden z-[150] shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex items-center justify-around px-4">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className="relative flex flex-col items-center justify-center group"
            >
              <motion.div
                whileTap={{ scale: 0.9 }}
                className={`p-3 rounded-2xl transition-all duration-300 ${isActive
                  ? "bg-[#6b4f3a]/10 text-[#6b4f3a]"
                  : "text-[#6b4f3a]/50 hover:text-[#6b4f3a]"
                  }`}
              >
                <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />

                {/* Count Badge for Cart/Wishlist */}
                {item.count > 0 && (
                  <span className="absolute top-1.5 right-1.5 bg-[#D9A036] text-[#1A1009] text-xs font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                    {item.count}
                  </span>
                )}
              </motion.div>

              {/* Active Indicator Bar */}
              {isActive && (
                <motion.div
                  layoutId="activeDockDot"
                  className="absolute -bottom-1 w-1.5 h-1.5 bg-[#6b4f3a] rounded-full"
                />
              )}
            </Link>
          );
        })}
      </nav>
    </>
  );
};

export default Header;
