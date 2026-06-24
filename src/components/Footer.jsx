import React from 'react';
import { Link } from 'react-router-dom';
import {
  Leaf, Instagram, Facebook, Twitter, Youtube,
  ArrowRight, Phone, Mail, MapPin, Truck,
  ShieldCheck, Zap, Clock, TrendingUp, ChevronUp
} from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#EFECE6] pt-24 lg:pt-28 pb-12 overflow-hidden border-t border-[#D9D3C7] tracking-normal">
      <div className="max-w-7xl mx-auto px-6 md:px-12">

        {/* ================= USER BENEFIT STRIP ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-10 gap-x-12 pb-16 border-b border-[#D9D3C7]/80 mb-20">
          <div className="flex items-start gap-4 group">
            <div className="p-3 rounded-xl bg-white text-[#6b4f3] shadow-sm border border-[#D9D3C7]/40">
              <Truck size={20} strokeWidth={1.25} />
            </div>
            <div>
              <h4 className="text-sm font-poppins font-semibold text-[#1C2B21] tracking-wide">Complimentary Shipping</h4>
              <p className="text-sm font-poppins text-[#707A72] mt-1 leading-relaxed">On all curated orders above ₹499</p>
            </div>
          </div>

          <div className="flex items-start gap-4 group">
            <div className="p-3 rounded-xl bg-white text-[#6b4f3] shadow-sm border border-[#D9D3C7]/40">
              <TrendingUp size={20} strokeWidth={1.25} />
            </div>
            <div>
              <h4 className="text-sm font-poppins font-semibold text-[#1C2B21] tracking-wide">Expedited Priority Delivery</h4>
              <p className="text-sm font-poppins text-[#707A72] mt-1 leading-relaxed">Arriving at your doorstep within 3-5 days</p>
            </div>
          </div>

          <div className="flex items-start gap-4 group">
            <div className="p-3 rounded-xl bg-white text-[#6b4f3] shadow-sm border border-[#D9D3C7]/40">
              <ShieldCheck size={20} strokeWidth={1.25} />
            </div>
            <div>
              <h4 className="text-sm font-poppins font-semibold text-[#1C2B21] tracking-wide">Encrypted Checkout</h4>
              <p className="text-sm font-poppins text-[#707A72] mt-1 leading-relaxed">Secure transaction handling via UPI, Cards, & COD</p>
            </div>
          </div>

          <div className="flex items-start gap-4 group">
            <div className="p-3 rounded-xl bg-white text-[#6b4f3] shadow-sm border border-[#D9D3C7]/40">
              <Zap size={20} strokeWidth={1.25} />
            </div>
            <div>
              <h4 className="text-sm font-poppins font-semibold text-[#1C2B21] tracking-wide">100% Pure, Native Wellness</h4>
              <p className="text-sm font-poppins text-[#707A72] mt-1 leading-relaxed">Zero processed elements, chemicals or additives</p>
            </div>
          </div>
        </div>

        {/* ================= MAIN ASYMMETRIC MATRICES ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-y-16 gap-x-16 lg:gap-x-24 mb-20">

          {/* LEFT SIDE: Brand & Structured Navigation Ecosystem (7 Columns) */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-x-12 gap-y-12">

            {/* Column 1: Brand Pitch */}
            <div className="flex flex-col gap-6 sm:col-span-1">
              <Link to="/" className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#6b4f3] rounded-xl flex items-center justify-center p-2.5 shadow-sm">
                  <Leaf className="text-[#D9A036] w-full h-full" strokeWidth={1.5} />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-poppins font-bold tracking-tight text-[#1C2B21]">SATTU</span>
                  <span className="text-[14px] tracking-[0.25em] font-poppins font-bold text-[#D9A036] uppercase">
                    Pure Wellness
                  </span>
                </div>
              </Link>
              <p className="text-[#3E4A41] font-poppins text-[14px] leading-relaxed opacity-90">
                Honoring traditional Indian raw nutrition through highly refined whole foods engineered for today’s active routines.
              </p>
              <div className="flex gap-5 mt-2">
                {[Instagram, Facebook, Youtube, Twitter].map((Icon, i) => (
                  <a key={i} href="#" className="text-[#6b4f3]/70 hover:text-[#D9A036] transition-colors duration-300">
                    <Icon size={18} strokeWidth={1.5} />
                  </a>
                ))}
              </div>
            </div>

            {/* Column 2: Discover Links */}
            <div>
              <h4 className="text-[#1C2B21] font-poppins font-semibold text-sm uppercase tracking-[0.2em] mb-6">Ecosystem</h4>
              <div className="flex flex-col gap-3.5">
                {['Home', 'Shop Flavours', 'Product Benefits', 'How to Formulation', 'Verified Reviews', 'Contact Portfolio'].map((item) => (
                  <Link key={item} to="#" className="text-[#4A574E] hover:text-[#6b4f3] font-poppins text-[14px] transition-colors duration-200 group flex items-center gap-0 hover:gap-1">
                    <span className="transition-all">{item}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Column 3: Corporate/Care Links */}
            <div>
              <h4 className="text-[#1C2B21] font-poppins font-semibold text-sm uppercase tracking-[0.2em] mb-6">Client Services</h4>
              <div className="flex flex-col gap-3.5">
                {['My Account Control', 'Track Realtime Order', 'Shipping Logistics', 'Returns & Exchanges', 'Terms of Service', 'Privacy Charter'].map((item) => (
                  <Link key={item} to="#" className="text-[#4A574E] hover:text-[#6b4f3] font-poppins text-[14px] transition-colors duration-200">
                    {item}
                  </Link>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT SIDE: Connected Newsletter & Concierge Row (5 Columns) */}
          <div className="lg:col-span-5 bg-white/40 border border-[#D9D3C7]/60 rounded-2xl p-8 lg:p-10 flex flex-col justify-between shadow-sm">

            {/* Top Subrow: Editorial Newsletter */}
            <div className="mb-8">
              <h4 className="text-[#1C2B21] font-poppins font-bold text-lg lg:text-xl tracking-tight mb-2">Join the Wellness Circle</h4>
              <p className="text-[14px] text-[#4A574E] mb-6 leading-relaxed font-poppins">
                Subscribe to unlock early batches, seasonal flavor reserves, and curated nutritional strategies.
              </p>

              <div className="flex items-center bg-white border border-[#D9D3C7] rounded-xl p-1.5 shadow-sm focus-within:border-[#6b4f3] focus-within:ring-1 focus-within:ring-[#6b4f3]/20 transition-all">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="w-full text-sm px-3 py-2 bg-transparent focus:outline-none text-[#1C2B21] placeholder-[#707A72]/70 font-poppins"
                />
                <button className="bg-[#6b4f3] text-white px-5 py-2.5 font-poppins font-medium text-sm tracking-wider uppercase rounded-lg hover:bg-[#112517] transition-all duration-300 flex items-center gap-2 flex-shrink-0">
                  <span>Join</span>
                  <ArrowRight size={13} strokeWidth={2} />
                </button>
              </div>
            </div>

            {/* Bottom Subrow: Concierge Contact Details */}
            <div className="pt-8 border-t border-[#D9D3C7]/60 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex flex-col gap-3">
                <span className="text-[14px] font-poppins font-bold uppercase tracking-[0.15em] text-[#D9A036]">Direct Lines</span>
                <a href="tel:+919876543210" className="flex items-center gap-2.5 text-sm font-semibold font-poppins text-[#1C2B21] hover:text-[#D9A036] transition-colors">
                  <Phone size={13} className="text-[#6b4f3]" strokeWidth={2} />
                  <span>+91 98765 43210</span>
                </a>
                <a href="mailto:hello@sattudrink.com" className="flex items-center gap-2.5 text-sm font-poppins text-[#4A574E] hover:text-[#6b4f3] transition-colors">
                  <Mail size={13} className="text-[#6b4f3]" strokeWidth={1.5} />
                  <span>hello@sattudrink.com</span>
                </a>
              </div>

              <div className="flex flex-col gap-3">
                <span className="text-[14px] font-poppins font-bold uppercase tracking-[0.15em] text-[#D9A036]">HQ & Hours</span>
                <div className="flex items-center gap-2.5 text-sm font-poppins text-[#4A574E]">
                  <MapPin size={13} className="text-[#6b4f3]" strokeWidth={1.5} />
                  <span>Bihar, India</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm font-poppins text-[#4A574E]">
                  <Clock size={13} className="text-[#6b4f3]" strokeWidth={1.5} />
                  <span>Mon - Sat: 9 AM - 7 PM</span>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* ================= BOTTOM LEGAL CREDITS BLOCK ================= */}
        <div className="pt-8 border-t border-[#D9D3C7] flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-[#707A72] font-poppins text-sm order-2 md:order-1">
            © {currentYear} Sattu Drink. Executed with premium native integrity. All Rights Reserved.
          </p>

          {/* Grayscale Premium Payment Gateway Vectors */}
          <div className="flex items-center gap-6 order-1 md:order-2">
            <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg" alt="UPI" className="h-4 grayscale opacity-30 hover:opacity-90 transition-all duration-300 cursor-pointer" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="VISA" className="h-3 grayscale opacity-30 hover:opacity-90 transition-all duration-300 cursor-pointer" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-4.5 grayscale opacity-30 hover:opacity-90 transition-all duration-300 cursor-pointer" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/c/cb/Rupay-Logo.svg" alt="RuPay" className="h-4 grayscale opacity-30 hover:opacity-90 transition-all duration-300 cursor-pointer" />
          </div>

          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="w-10 h-10 bg-white border border-[#D9D3C7] text-[#6b4f3] rounded-full flex items-center justify-center hover:bg-[#6b4f3] hover:text-white transition-all duration-300 shadow-sm hover:shadow-md order-3"
            aria-label="Scroll back to top"
          >
            <ChevronUp size={18} strokeWidth={1.5} />
          </button>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
