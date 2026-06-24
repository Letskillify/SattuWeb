import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { User, Search, Menu, X, Leaf, Heart, ArrowRight, ShoppingBag, Sparkles, Home, Store } from 'lucide-react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from './useAuth';
import { useStore } from './StoreProvider';

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

  const cartCount = cart.length;
  const wishlistCount = wishlist.length;

  // Smooth architectural scroll transformations
  const headerHeight = useTransform(scrollY, [0, 80], ['80px', '65px']);
  const headerBg = useTransform(
    scrollY,
    [0, 80],
    ['rgba(253, 246, 233, 0)', 'rgba(253, 246, 233, 0.98)']
  );
  const headerBorder = useTransform(
    scrollY,
    [0, 80],
    ['rgba(139, 115, 85, 0)', 'rgba(217, 160, 54, 0.4)']
  );
  const logoScale = useTransform(scrollY, [0, 80], [1, 0.95]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/shop' },
    { name: 'About us', path: '/about' },
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
        <div className="bg-[#6b4f3a] text-[#FDF6E9] py-2 px-4 overflow-hidden relative border-b border-[#D9A036]/20 select-none hidden md:block">
          <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:12px_12px]" />
          <motion.div
            animate={{ x: [0, -1200] }}
            transition={{ repeat: Infinity, duration: 35, ease: "linear" }}
            className="flex gap-20 whitespace-nowrap items-center text-[14px] font-bold tracking-[0.4em] uppercase font-poppins relative z-10"
          >
            <span className="flex items-center gap-3 text-[#FDF6E9]/90"><Leaf size={10} className="text-[#D9A036]" /> 100% Certified Organic Foods</span>
            <span className="flex items-center gap-3 text-[#FDF6E9]/90"><div className="w-1.5 h-1.5 bg-[#D9A036] rotate-45" /> Stone-Ground · Sun-Dried · Pure Nutrition</span>
            <span className="flex items-center gap-3 text-[#FDF6E9]/90"><Sparkles size={10} className="text-[#D9A036]" /> Premium Sattu · Dry Fruits</span>
            <span className="flex items-center gap-3 text-[#FDF6E9]/90"><div className="w-1.5 h-1.5 bg-[#D9A036] rotate-45" /> Free Shipping Above ₹999</span>
            <span className="flex items-center gap-3 text-[#FDF6E9]/90"><Leaf size={10} className="text-[#D9A036]" /> 100% Certified Organic Foods</span>
          </motion.div>
        </div>

        {/* Main Header */}
        <motion.nav
          style={{
            height: headerHeight,
            backgroundColor: headerBg,
            borderBottomWidth: '1px',
            borderBottomColor: headerBorder,
            backdropFilter: 'blur(30px)'
          }}
          className="px-4 sm:px-8 md:px-12 flex items-center transition-all duration-500"
        >
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between">

            {/* Logo */}
           <motion.div style={{ scale: logoScale }}>
  <Link to="/" className="flex items-center gap-4 group relative z-[110]">
    {/* Logo Image */}
    <img
      src="https://res.cloudinary.com/duzwys877/image/upload/v1782295170/logo_rwarlx.png"
      alt="Vedamya Foods Logo"
      className="h-10 md:h-14 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
    />
    
    {/* Typography Container */}
    <div className="flex flex-col justify-center border-l-2 border-[#6b4f3b]/20 pl-4 py-0.5">
      {/* Brand Primary Name */}
      <span className="text-[20px] md:text-[26px] font-poppins font-black text-[#6b4f3b] leading-none tracking-tight uppercase">
        Vedamya
      </span>
      
      {/* Brand Sub-text - FIXED: Bigger, bolder, and perfectly spaced */}
      <span className="text-[13px] md:text-[16px] font-poppins font-semibold text-[#6b4f3b] leading-none tracking-[0.14em] uppercase ">
        Foods
      </span>
    </div>
  </Link>
</motion.div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className="px-6 py-2 text-[14px] font-bold uppercase tracking-[0.35em] text-[#6b4f3b]/80 relative group transition-all"
                >
                  <span className="relative z-10 group-hover:text-[#6b4f3b]">{link.name}</span>
                  {location.pathname === link.path && (
                    <motion.span
                      layoutId="luxuryNavBg"
                      className="absolute inset-0 bg-[#D9A036]/[0.05] rounded-sm"
                    />
                  )}
                </Link>
              ))}
            </div>

            {/* Desktop Action Icons */}
            <div className="hidden md:flex items-center gap-4">
              <motion.button 
                whileHover={{ scale: 1.1 }} 
                onClick={() => setIsSearchOpen(true)}
                className="text-[#6b4f3a] p-1.5"
              >
                <Search size={20} />
              </motion.button>
              <Link to="/wishlist" className="relative text-[#6b4f3a] p-1.5">
                <Heart size={20} />
                {wishlistCount > 0 && <span className="absolute top-0 right-0 bg-[#D9A036] text-white text-[14px] w-4 h-4 rounded-full flex items-center justify-center">{wishlistCount}</span>}
              </Link>
              <Link to="/account" className="text-[#6b4f3a] p-1.5"><User size={20} /></Link>
              <Link to="/cart" className="relative bg-[#6b4f3a] text-white p-2 rounded-xl shadow-lg shadow-[#6b4f3a]/20">
                <ShoppingBag size={18} />
                {cartCount > 0 && <span className="absolute -top-1 -right-1 bg-[#D9A036] text-white text-[14px] w-4 h-4 rounded-full flex items-center justify-center">{cartCount}</span>}
              </Link>
            </div>

            {/* Mobile Menu Trigger */}
            <div className="md:hidden flex items-center gap-3">
              <button 
                onClick={() => setIsSearchOpen(true)}
                className="text-[#6b4f3b] p-2 bg-[#6b4f3b]/5 rounded-xl border border-[#6b4f3b]/10"
              >
                <Search size={20} />
              </button>
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="text-[#6b4f3b] p-2 bg-[#6b4f3b]/5 rounded-xl border border-[#6b4f3b]/10"
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
              <div className="w-full px-6 h-[80px] flex items-center justify-between border-b border-[#6b4f3b]/5 absolute top-0 left-0">
                <span className="text-xl font-poppins font-black text-[#6b4f3b] uppercase tracking-tight">Archives</span>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="bg-[#6b4f3b] text-white p-2 rounded-full"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="px-10 py-10 space-y-8 flex-1">
                {navLinks.map((link, idx) => (
                  <motion.div key={link.name} variants={menuVariants} custom={idx} initial="hidden" animate="visible">
                    <Link to={link.path} className="text-3xl font-poppins font-bold text-[#6b4f3] flex items-center justify-between">
                      {link.name}
                      <ArrowRight size={20} className="text-[#D9A036]" />
                    </Link>
                  </motion.div>
                ))}
              </div>

              <div className="p-10 border-t border-[#6b4f3b]/5 text-[#6b4f3b]/40 text-[14px] font-bold uppercase tracking-[0.3em]">
                © 2026 VEDAMYA FOODS • PURE NUTRITION
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
              className="fixed inset-0 bg-[#6b4f3b]/40 backdrop-blur-md z-[300] flex items-start justify-center pt-24 px-6"
              onClick={() => setIsSearchOpen(false)}
            >
              <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -50, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-2xl bg-[#FAF4E3] rounded-[32px] p-8 shadow-2xl relative border border-[#D9A036]/20"
              >
                <button 
                  onClick={() => setIsSearchOpen(false)}
                  className="absolute top-6 right-6 p-2 rounded-full hover:bg-[#6b4f3b]/5 text-[#6b4f3b] transition-colors"
                >
                  <X size={20} />
                </button>

                <div className="space-y-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#6b4f3b] text-white flex items-center justify-center">
                      <Search size={18} />
                    </div>
                    <div>
                      <h3 className="text-xl font-poppins font-bold text-[#6b4f3b]">Quick Search</h3>
                      <p className="text-[14px] text-[#6b4f3b]/60 font-medium">Find your favorite heritage blends</p>
                    </div>
                  </div>

                  <form onSubmit={handleSearch} className="relative">
                    <input
                      autoFocus
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search for sattu, dry fruits..."
                      className="w-full bg-[#FFFDF6] border border-[#E3DBC5] focus:border-[#6b4f3b] outline-none py-4 pl-6 pr-14 rounded-2xl text-[14px] font-poppins font-semibold text-[#6b4f3b] shadow-inner transition-all"
                    />
                    <button 
                      type="submit"
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-[#6b4f3b] text-white flex items-center justify-center hover:bg-[#976E2A] transition-colors shadow-lg"
                    >
                      <ArrowRight size={18} />
                    </button>
                  </form>

                  <div className="flex flex-wrap gap-2 pt-2 border-t border-[#6b4f3b]/10">
                    {['Classic', 'Elaichi', 'Dry Fruit', 'Rose', 'Chocolate'].map(tag => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => {
                          setSearchQuery(tag);
                          navigate(`/shop?search=${encodeURIComponent(tag)}`);
                          setIsSearchOpen(false);
                          setSearchQuery("");
                        }}
                        className="px-4 py-2 rounded-xl bg-white border border-[#E3DBC5] text-[#6b4f3b]/60 hover:text-[#6b4f3b] hover:border-[#6b4f3b] hover:bg-[#FAF4E3] transition-all text-xs font-bold uppercase tracking-widest"
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
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[400px] h-[70px] bg-white/95 backdrop-blur-xl rounded-[24px] border border-black md:hidden z-[150] shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex items-center justify-around px-4">
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
                  ? "bg-black/5 text-black"
                  : "text-black/40 hover:text-black"
                  }`}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />

                {/* Count Badge for Cart/Wishlist */}
                {item.count > 0 && (
                  <span className="absolute top-1.5 right-1.5 bg-[#C45525] text-white text-[14px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-white shadow-sm">
                    {item.count}
                  </span>
                )}
              </motion.div>

              {/* Active Indicator Bar */}
              {isActive && (
                <motion.div
                  layoutId="activeDockDot"
                  className="absolute -bottom-1 w-1 h-1 bg-black rounded-full"
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
