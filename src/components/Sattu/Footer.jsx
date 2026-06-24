import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Instagram,
  Facebook,
  Twitter,
  Youtube,
  ArrowUpRight,
  Phone,
  Mail,
  MapPin,
  Leaf
} from 'lucide-react';

// Heritage-style floral accent item updated to match our exact theme colors
const DividerFlower = () => (
  <div className="flex items-center justify-center gap-1 text-[#976E2A] opacity-80">
    <Leaf size={10} className="rotate-[-30deg] fill-current" />
    <Leaf size={12} className="fill-current -translate-y-0.5" />
    <Leaf size={10} className="rotate-[30deg] scale-x-[-1] fill-current" />
  </div>
);

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    explore: [
      { name: 'Home ', path: '/' },
      { name: 'Shop ', path: '/shop' },
      { name: 'About us', path: '/about' },
    ],
    essential: [
      { name: 'My Profile', path: '/account' },
      { name: 'Order History', path: '/orders' },
      { name: 'Contact Support', path: '/contact' },
    ],
    legal: [
      { name: 'Privacy Policy', path: '/privacy-policy' },
      { name: 'Terms of Service', path: '/terms-conditions' },
    ]
  };

  return (
    <footer className="relative bg-[#FAF4E3] text-[#6b4f3a] pt-16 pb-8 overflow-hidden font-poppins border-t border-[#E3DBC5] selection:bg-[#976E2A] selection:text-white">

      {/* --- BACKGROUND ORNAMENTATION --- */}
      {/* Large Muted Watermark Text */}


      {/* Subtle Grain Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/p6-grain.png')] z-0 mix-blend-multiply" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 relative z-10">

        {/* --- MAIN NAVIGATION GRID SECTION --- */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-12 gap-y-12 pb-16">

          {/* Brand Pillar Column */}
          <div className="col-span-2 lg:col-span-4 flex flex-col gap-5">
            <Link to="/" className="flex flex-col gap-1.5">
              <div className="flex items-center gap-3">
                <img src="https://res.cloudinary.com/duzwys877/image/upload/v1782295170/logo_rwarlx.png" alt="Vedamya Foods Logo" className="h-9 w-auto contrast-125" />
                <span className="text-2xl font-poppins font-bold tracking-tight text-[#6b4f3a] uppercase">
                  Vedamya Foods
                </span>
              </div>
              <span className="text-base text-[#976E2A] font-poppins font-bold tracking-[0.35em] uppercase">
                Nutrition • Purely Vedic
              </span>
            </Link>

            <p className="text-base text-[#605948] leading-relaxed max-w-xs italic font-medium">
              "Crafted with reverence to authentic Vedic traditions. Operating at the intersection of purity and modern wellness."
            </p>

            {/* Social Links Package */}
            {/* <div className="flex gap-3 pt-2">
              {[Instagram, Facebook, Youtube, Twitter].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-full border border-[#E3DBC5] bg-[#FFFDF6] flex items-center justify-center text-[#6b4f3a]/70 hover:bg-[#6b4f3a] hover:text-[#FAF4E3] hover:border-[#6b4f3a] transition-all duration-400 shadow-sm"
                >
                  <Icon size={14} strokeWidth={2} />
                </a>
              ))}
            </div> */}
          </div>

          {/* Boutique Navigation Links */}
          <div className="col-span-1 lg:col-span-2 lg:col-start-6">
            <h4 className="text-base font-poppins font-bold uppercase tracking-[0.25em] text-[#976E2A] mb-6">
              Links
            </h4>
            <ul className="flex flex-col gap-3.5">
              {footerLinks.explore.map((link) => (
                <li key={link.name}>
                  <Link to={link.path} className="text-base font-poppins font-semibold text-[#605948] hover:text-[#976E2A] transition-colors flex items-center group">
                    <span className="w-0 overflow-hidden group-hover:w-3 transition-all duration-300 opacity-70">▹</span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Essentials Navigation Links */}
          <div className="col-span-1 lg:col-span-2">
            <h4 className="text-base font-poppins font-bold uppercase tracking-[0.25em] text-[#976E2A] mb-6">
              Essential
            </h4>
            <ul className="flex flex-col gap-3.5">
              <li>
                <Link to="/account" className="text-base font-poppins font-semibold text-[#605948] hover:text-[#976E2A] transition-colors flex items-center group">
                  <span className="w-0 overflow-hidden group-hover:w-3 transition-all duration-300 opacity-70">▹</span>
                  My Account
                </Link>
              </li>
              <li>
                <Link to="/orders" className="text-base font-poppins font-semibold text-[#605948] hover:text-[#976E2A] transition-colors flex items-center group">
                  <span className="w-0 overflow-hidden group-hover:w-3 transition-all duration-300 opacity-70">▹</span>
                  My Orders
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-base font-poppins font-semibold text-[#605948] hover:text-[#976E2A] transition-colors flex items-center group">
                  <span className="w-0 overflow-hidden group-hover:w-3 transition-all duration-300 opacity-70">▹</span>
                  Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Direct Contact Metadata Column */}
          <div className="col-span-2 md:col-span-1 lg:col-span-3">
            <h4 className="text-base font-poppins font-bold uppercase tracking-[0.25em] text-[#976E2A] mb-6">
              Connect With Us
            </h4>
            <div className="flex flex-col gap-4">

              <a href="tel:+919876543210" className="group flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#FFFDF6] flex items-center justify-center border border-[#E3DBC5] group-hover:bg-[#976E2A]/10 group-hover:border-[#976E2A]/40">
                  <Phone size={13} className="text-[#976E2A]" />
                </div>
                <span className="text-base font-poppins font-semibold text-[#605948] group-hover:text-[#6b4f3a] transition-colors">
                  +91 98765 43210
                </span>
              </a>

              <a href="mailto:vedamyafoods@gmail.com" className="group flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#FFFDF6] flex items-center justify-center border border-[#E3DBC5] group-hover:bg-[#976E2A]/10 group-hover:border-[#976E2A]/40">
                  <Mail size={13} className="text-[#976E2A]" />
                </div>
                <span className="text-base font-poppins font-semibold text-[#605948] group-hover:text-[#6b4f3a] transition-colors">
                  vedamyafoods@gmail.com
                </span>
              </a>

              <div className="group flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#FFFDF6] flex items-center justify-center border border-[#E3DBC5]">
                  <MapPin size={13} className="text-[#976E2A]" />
                </div>
                <span className="text-base font-poppins font-medium text-[#605948]/80 leading-relaxed">
                  Flagship Studio, Gaya, Bihar <br /> Republic of India
                </span>
              </div>

            </div>
          </div>
        </div>

        {/* --- BOTTOM ROW SECTION: LEGAL MATRIX & COPYRIGHT --- */}
        <div className="pt-4 border-t border-[#E3DBC5] flex flex-col lg:flex-row justify-between items-center gap-4 text-sm font-poppins font-bold uppercase tracking-widest text-[#605948]/70">

          {/* Left Section: Legal & Copyright */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2 order-2 lg:order-1">
            <p className="text-[#605948]/50">
              © {currentYear} Vedamya Foods
            </p>
            {footerLinks.legal.map(link => (
              <Link key={link.name} to={link.path} className="hover:text-[#976E2A] transition-colors">
                {link.name}
              </Link>
            ))}
          </div>

          {/* Center Section: Compact Payment Gateways */}
          <div className="flex items-center gap-4 opacity-40 hover:opacity-70 transition-opacity mix-blend-multiply order-1 lg:order-2">
            <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg" alt="UPI" className="h-3" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="VISA" className="h-2" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-3.5" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/c/cb/Rupay-Logo.svg" alt="RuPay" className="h-3" />
          </div>

          {/* Right Section: Credits & Top Trigger */}
          <div className="flex items-center gap-6 order-3">
            <a
              href="https://letskillify.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#976E2A]/70 hover:text-[#6b4f3a] transition-colors tracking-[0.15em] text-xs"
            >
              Designed by Letskillify
            </a>

            <div className="h-3 w-px bg-[#E3DBC5]" />

            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="group flex items-center gap-2 text-[#605948]/50 hover:text-[#976E2A] transition-colors"
            >
              <span>Top</span>
              <div className="w-6 h-6 rounded-full border border-[#E3DBC5] bg-[#FFFDF6] flex items-center justify-center text-[#976E2A] group-hover:bg-[#6b4f3a] group-hover:border-[#6b4f3a] group-hover:text-[#FAF4E3] transition-all duration-300">
                <ArrowUpRight size={10} className="-rotate-45 group-hover:rotate-0 transition-transform" />
              </div>
            </button>
          </div>

        </div>

        {/* Center Base Accent Icon Wrap */}
        <div className="mt-8 pt-2">
          <DividerFlower />
        </div>

      </div>
    </footer>
  );
};

export default Footer;
