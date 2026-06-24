import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, User, Search, Menu, X, Leaf, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0); // This should normally come from context

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Shop', path: '/shop' },
    { name: 'Flavours', path: '/flavours' },
    { name: 'Benefits', path: '/benefits' },
    { name: 'How to Make', path: '/how-to-make' },
    { name: 'Reviews', path: '/reviews' },
    { name: 'About Us', path: '/about' },
  ];

  return (
    <nav className="fixed top-0 left-0 w-full z-50">
      {/* Top Announcement Bar */}
      <div className="bg-[#4A5D4E] text-[#FDFBF7] py-2.5 px-4 overflow-hidden">
        <div className="max-w-7xl mx-auto flex justify-between items-center text-sm md:text-sm font-medium tracking-wide">
          <div className="flex items-center gap-2">
            <Leaf size={14} />
            <span>100% Natural Ingredients</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full border border-white flex items-center justify-center text-sm">✓</span>
            <span>No Preservatives</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap size={14} />
            <span>High in Protein & Fiber</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center">🚚</span>
            <span>Delivered Across India</span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className={`transition-all duration-300 px-6 md:px-12 py-3 ${
        isScrolled ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-[#FDFBF7]'
      }`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-[#4A5D4E] rounded-full flex items-center justify-center p-1.5">
                <img src="https://cdn-icons-png.flaticon.com/512/3035/3035083.png" alt="Sattu Logo" className="w-full h-full invert" />
              </div>
              <div className="flex flex-col -space-y-1">
                <span className="text-2xl font-bold tracking-tight text-[#4A5D4E]">SATTU</span>
                <span className="text-[14px] tracking-[0.2em] font-medium text-[#4A5D4E] flex items-center gap-1">
                  <span className="h-[1px] w-2 bg-[#4A5D4E]"></span>DRINK<span className="h-[1px] w-2 bg-[#4A5D4E]"></span>
                </span>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                to={link.path}
                className="text-sm font-semibold text-[#4A5D4E] hover:text-[#6D4C3D] transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Icons */}
          <div className="flex items-center gap-5">
            <button className="text-[#4A5D4E] hover:scale-110 transition-transform">
              <Search size={22} />
            </button>
            <Link to="/account" className="text-[#4A5D4E] hover:scale-110 transition-transform">
              <User size={22} />
            </Link>
            <Link to="/cart" className="relative group">
              <div className="text-[#4A5D4E] transition-colors">
                <ShoppingCart size={22} />
              </div>
              <span className="absolute -top-2 -right-2 bg-[#4A5D4E] text-white text-[14px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount || 2}
              </span>
            </Link>
            <button 
              className="lg:hidden text-[#4A5D4E]"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 bg-brand-cream z-[60] flex flex-col p-8 lg:hidden"
          >
            <div className="flex justify-between items-center mb-12">
              <div className="flex items-center gap-2">
                <Leaf className="text-brand-olive" size={24} />
                <span className="font-bold text-xl tracking-tight">SATTU DRINK</span>
              </div>
              <button onClick={() => setIsMobileMenuOpen(false)}>
                <X size={28} className="text-brand-olive" />
              </button>
            </div>
            
            <div className="flex flex-col gap-8">
              {navLinks.map((link, idx) => (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Link 
                    to={link.path}
                    className="text-3xl font-poppins text-brand-olive hover:text-brand-brown transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                </motion.div>
              ))}
            </div>

            <div className="mt-auto pt-12 border-t border-brand-olive/10 flex flex-col gap-6">
              <Link to="/account" className="flex items-center gap-4 text-brand-olive text-lg">
                <User size={24} /> My Account
              </Link>
              <div className="flex gap-6">
                {/* Social icons could go here */}
              </div>
              <p className="text-brand-olive/40 text-sm">© 2025 Sattu Drink. All Rights Reserved.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
