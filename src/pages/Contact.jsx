import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, Instagram, Twitter, Facebook, ArrowUpRight, X, CheckCircle, Leaf } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PageHeader from '../components/Sattu/PageHeader';

const Contact = () => {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [activeChannel, setActiveChannel] = useState(null);

  const premiumEase = [0.25, 1, 0.5, 1];

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setFormSubmitted(true);
    setTimeout(() => setFormSubmitted(false), 5000);
  };

  const communicationChannels = [
    { icon: <Mail size={20} />, label: "Electronic Mail", val: "hello@sattudrink.com", href: "mailto:hello@sattudrink.com" },
    { icon: <Phone size={20} />, label: "Direct Telephony", val: "+91 98765 43210", href: "tel:+919876543210" },
    { icon: <MapPin size={20} />, label: "Apothecary Base", val: "Patna, Bihar, India", href: "#" }
  ];

  return (
    <div className="min-h-screen bg-transparent">
      <PageHeader
        title="Dialogue"
        subtitle="Communications Portal"
        breadcrumbItems={[
          { label: "Home", path: "/" },
          { label: "Contact Us" },
        ]}
      />

      {/* Heritage Detail Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/p6-grain.png')] mix-blend-multiply"></div>

      {/* Premium Elegant Submission Notification System */}
      <AnimatePresence>
        {formSubmitted && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
            className="fixed bottom-12 left-1/2 z-50 bg-[#6b4f3a] border border-[#FAF4E3]/10 text-[#FAF4E3] px-8 py-5 rounded-[24px] shadow-2xl flex items-center gap-6 backdrop-blur-xl max-w-md w-[90%]"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#FAF4E3]/10 flex items-center justify-center text-[#976E2A]">
              <CheckCircle size={24} />
            </div>
            <p className="text-sm font-poppins font-medium tracking-wide flex-1 leading-relaxed">Inquiry successfully logged into our digital registry. Our specialists will respond shortly.</p>
            <button onClick={() => setFormSubmitted(false)} className="opacity-40 hover:opacity-100 transition-opacity p-2">
              <X size={20} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 relative z-10 py-24">
        <div className="grid lg:grid-cols-12 gap-20 items-start">

          {/* ================= LEFT COLUMN: CHANNELS ================= */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: premiumEase }}
            className="lg:col-span-5 space-y-16"
          >
            <div className="space-y-6">
              <div className="flex items-center gap-3 text-[#976E2A]">
                <Leaf size={16} className="fill-current rotate-45" />
                <div className="h-[1px] w-12 bg-[#976E2A]/30" />
                <span className="text-[14px] font-poppins font-bold uppercase tracking-[0.35em]">Get In Touch</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-poppins font-bold text-[#6b4f3a] leading-tight uppercase">
                Initiate a <br />
                <span className="text-4xl md:text-5xl font-poppins font-bold text-[#6b4f3a] leading-tight uppercase">Global Inquiry</span>
              </h2>

            </div>

            <div className="space-y-6">
              {communicationChannels.map((item, i) => (
                <a
                  href={item.href}
                  key={i}
                  onMouseEnter={() => setActiveChannel(i)}
                  onMouseLeave={() => setActiveChannel(null)}
                  className="flex items-center gap-8 p-8 bg-[#FFFDF6] border border-[#E3DBC5] rounded-[32px] hover:border-[#976E2A]/50 hover:shadow-2xl transition-all duration-500 group"
                >
                  <div className="w-16 h-16 rounded-2xl bg-[#FAF4E3] border border-[#E3DBC5] text-[#6b4f3a] group-hover:bg-[#6b4f3a] group-hover:text-white flex items-center justify-center transition-all duration-500 shrink-0">
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <p className="text-[14px] font-poppins font-bold uppercase tracking-[0.2em] text-[#976E2A] mb-1">{item.label}</p>
                    <p className="text-xl font-poppins font-bold text-[#6b4f3a] tracking-tight">{item.val}</p>
                  </div>
                  <ArrowUpRight size={20} className={`text-[#976E2A] transition-all duration-500 ${activeChannel === i ? 'rotate-45 scale-125' : ''}`} />
                </a>
              ))}
            </div>
          </motion.div>

          {/* ================= RIGHT COLUMN: FORM ================= */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: premiumEase }}
            className="lg:col-span-7"
          >
            <div className="bg-[#FFFDF6] border-[1.5px] border-[#E3DBC5] rounded-[48px] p-10 md:p-16 shadow-2xl relative overflow-hidden group">
              <form className="space-y-10" onSubmit={handleFormSubmit}>
                <div className="grid sm:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[14px] font-poppins font-bold uppercase tracking-widest text-[#976E2A] ml-1">Your Identity</label>
                    <input
                      type="text"
                      required
                      className="w-full bg-[#FAF4E3]/30 border border-[#E3DBC5] rounded-2xl px-6 py-5 text-sm font-poppins font-medium text-[#6b4f3a] outline-none focus:border-[#976E2A]/40 focus:bg-white transition-all shadow-inner"
                      placeholder="Full Name"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[14px] font-poppins font-bold uppercase tracking-widest text-[#976E2A] ml-1">Electronic Mail</label>
                    <input
                      type="email"
                      required
                      className="w-full bg-[#FAF4E3]/30 border border-[#E3DBC5] rounded-2xl px-6 py-5 text-sm font-poppins font-medium text-[#6b4f3a] outline-none focus:border-[#976E2A]/40 focus:bg-white transition-all shadow-inner"
                      placeholder="email@example.com"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[14px] font-poppins font-bold uppercase tracking-widest text-[#976E2A] ml-1">Inquiry Parameter</label>
                  <select className="w-full bg-[#FAF4E3]/30 border border-[#E3DBC5] rounded-2xl px-6 py-5 text-sm font-poppins font-medium text-[#6b4f3a] outline-none focus:border-[#976E2A]/40 focus:bg-white transition-all shadow-inner appearance-none cursor-pointer">
                    <option>Product Composition</option>
                    <option>Order Status</option>
                    <option>B2B Procurement</option>
                    <option>General Inquiry</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="text-[14px] font-poppins font-bold uppercase tracking-widest text-[#976E2A] ml-1">Narrative Formulation</label>
                  <textarea
                    rows="5"
                    required
                    className="w-full bg-[#FAF4E3]/30 border border-[#E3DBC5] rounded-2xl px-6 py-6 text-sm font-poppins font-medium text-[#6b4f3a] outline-none focus:border-[#976E2A]/40 focus:bg-white transition-all resize-none shadow-inner"
                    placeholder="Elaborate on your requirements..."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full h-18 rounded-2xl bg-[#6b4f3a] text-[#FAF4E3] font-poppins font-bold text-sm uppercase tracking-[0.3em] shadow-xl hover:bg-[#C45525] transition-all duration-500 flex items-center justify-center gap-4 group"
                >
                  <Send size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-500" />
                  <span>Transmit Protocol</span>
                </button>
              </form>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
};

export default Contact;
