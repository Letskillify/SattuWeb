import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, ArrowUpRight, X, CheckCircle2, Leaf, Clock, Sparkles, MessageSquare, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PageHeader from '../components/Sattu/PageHeader';

const Contact = () => {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [activeChannel, setActiveChannel] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);

  const premiumEase = [0.16, 1, 0.3, 1];

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setFormSubmitted(true);
    setTimeout(() => setFormSubmitted(false), 5000);
  };

  const communicationChannels = [
    { icon: <Mail size={22} />, label: "Email Support", val: "info@vedamyafoods.com", href: "mailto:info@vedamyafoods.com", detail: "Quick response within 24 hours" },
    { icon: <Phone size={22} />, label: "Call & WhatsApp", val: "+91 98765 43210", href: "tel:+919876543210", detail: "Mon-Sat from 9am to 7pm" },
    { icon: <MapPin size={22} />, label: "Headquarters", val: "Indore, Madhya Pradesh, India", href: "#", detail: "Central Production Facility" },
    { icon: <Clock size={22} />, label: "Customer Care Hours", val: "Mon - Sat: 9:00 AM - 7:00 PM", href: "#", detail: "Closed on Sundays & National Holidays" }
  ];

  const faqs = [
    {
      q: "How fast will my order be delivered?",
      a: "We process and dispatch all orders within 24 hours. Express delivery takes 2 to 4 business days depending on your location."
    },
    {
      q: "Are Vedamya Foods products 100% organic?",
      a: "Yes! All our Sattu mixes and grains are stone-ground from 100% certified organic crops with zero artificial additives, preservatives, or refined white sugar."
    },
    {
      q: "Can I place bulk or B2B corporate orders?",
      a: "Absolutely! We supply organic Sattu mixes and wellness hampers for events, corporate gifting, and retail distribution. Select 'Bulk & B2B Procurement' in the contact form."
    },
    {
      q: "How do I track my placed order?",
      a: "Once shipped, you will receive a tracking code via SMS and email. You can also view live order progress on your Orders page."
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2A1B12] selection:bg-[#D9A036] selection:text-[#2A1B12] font-poppins pb-24">
      <PageHeader
        title="Contact Us"
        subtitle="We Are Here to Help You"
        breadcrumbItems={[
          { label: "Home", path: "/" },
          { label: "Contact Us" },
        ]}
      />

      {/* Success Notification */}
      <AnimatePresence>
        {formSubmitted && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
            className="fixed bottom-10 left-1/2 z-[999] bg-[#2A1B12] text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border-2 border-[#D9A036]/50 max-w-md w-[90%]"
          >
            <CheckCircle2 size={24} className="text-emerald-500 shrink-0" />
            <p className="text-xs sm:text-sm font-extrabold uppercase tracking-wider flex-1">
              Thank you! Your message has been received. Our team will get back to you shortly.
            </p>
            <button onClick={() => setFormSubmitted(false)} className="text-gray-400 hover:text-white transition-colors cursor-pointer">
              <X size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 relative z-10 py-12 md:py-16 space-y-16">
        <div className="grid lg:grid-cols-12 gap-10 items-start">

          {/* LEFT COLUMN: CHANNELS */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: premiumEase }}
            className="lg:col-span-5 space-y-8"
          >
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#D9A036] bg-[#FAF7F2] px-3 py-1 rounded-full border border-[#D9A036]/30">
                <Leaf size={14} className="fill-current rotate-45 text-[#D9A036]" />
                <span>Get In Touch</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-[#2A1B12] leading-tight uppercase tracking-tight">
                Let's Start a <br />
                <span className="text-3xl sm:text-4xl font-black text-[#2A1B12] leading-tight uppercase">Conversation</span>
              </h2>
              <p className="text-sm text-[#6b4f3a] font-medium leading-relaxed">
                Have questions about our heritage Sattu mixes, orders, or corporate partnerships? Reach out to us through any of the channels below.
              </p>
            </div>

            <div className="space-y-4">
              {communicationChannels.map((item, i) => (
                <a
                  href={item.href}
                  key={i}
                  onMouseEnter={() => setActiveChannel(i)}
                  onMouseLeave={() => setActiveChannel(null)}
                  className="flex items-center gap-4 p-5 bg-white border-2 border-[#6b4f3a]/15 rounded-2xl hover:border-[#D9A036] hover:shadow-xl transition-all duration-300 group cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#FAF7F2] border border-[#6b4f3a]/15 text-[#6b4f3a] group-hover:bg-[#6b4f3a] group-hover:text-white flex items-center justify-center transition-all duration-300 shrink-0">
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black uppercase tracking-wider text-[#D9A036]">{item.label}</p>
                    <p className="text-sm sm:text-base font-black text-[#2A1B12] truncate">{item.val}</p>
                    <p className="text-[11px] text-[#6b4f3a] font-medium">{item.detail}</p>
                  </div>
                  <ArrowUpRight size={18} className={`text-[#D9A036] transition-transform duration-300 ${activeChannel === i ? 'rotate-45 scale-125' : ''}`} />
                </a>
              ))}
            </div>
          </motion.div>

          {/* RIGHT COLUMN: CONTACT FORM */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: premiumEase }}
            className="lg:col-span-7"
          >
            <div className="bg-white border-2 border-[#6b4f3a]/15 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
              <div className="flex items-center gap-3 pb-4 mb-6 border-b border-[#6b4f3a]/15">
                <div className="w-10 h-10 rounded-xl bg-[#FAF7F2] border border-[#D9A036]/40 text-[#D9A036] flex items-center justify-center">
                  <MessageSquare size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase text-[#2A1B12]">Send Us a Message</h3>
                  <p className="text-xs text-[#6b4f3a] font-medium">Fill in your details and we will reply promptly</p>
                </div>
              </div>

              <form className="space-y-5" onSubmit={handleFormSubmit}>
                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase tracking-wider text-[#2A1B12]">Your Name *</label>
                    <input
                      type="text"
                      required
                      className="w-full bg-[#FAF7F2]/80 border-2 border-[#6b4f3a]/25 rounded-2xl px-4 py-3.5 text-base font-extrabold text-[#2A1B12] outline-none focus:border-[#D9A036] focus:bg-white transition-all shadow-xs"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase tracking-wider text-[#2A1B12]">Email Address *</label>
                    <input
                      type="email"
                      required
                      className="w-full bg-[#FAF7F2]/80 border-2 border-[#6b4f3a]/25 rounded-2xl px-4 py-3.5 text-base font-extrabold text-[#2A1B12] outline-none focus:border-[#D9A036] focus:bg-white transition-all shadow-xs"
                      placeholder="yourname@example.com"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase tracking-wider text-[#2A1B12]">Phone Number</label>
                    <input
                      type="tel"
                      className="w-full bg-[#FAF7F2]/80 border-2 border-[#6b4f3a]/25 rounded-2xl px-4 py-3.5 text-base font-extrabold text-[#2A1B12] outline-none focus:border-[#D9A036] focus:bg-white transition-all shadow-xs"
                      placeholder="+91 98765 43210"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase tracking-wider text-[#2A1B12]">Subject / Topic *</label>
                    <select className="w-full bg-[#FAF7F2]/80 border-2 border-[#6b4f3a]/25 rounded-2xl px-4 py-3.5 text-base font-extrabold text-[#2A1B12] outline-none focus:border-[#D9A036] focus:bg-white transition-all shadow-xs cursor-pointer">
                      <option>Product Inquiries & Flavors</option>
                      <option>Order Tracking & Support</option>
                      <option>Bulk & B2B Procurement</option>
                      <option>General Feedback</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-wider text-[#2A1B12]">Your Message *</label>
                  <textarea
                    rows="4"
                    required
                    className="w-full bg-[#FAF7F2]/80 border-2 border-[#6b4f3a]/25 rounded-2xl px-4 py-3.5 text-base font-extrabold text-[#2A1B12] outline-none focus:border-[#D9A036] focus:bg-white transition-all resize-none shadow-xs"
                    placeholder="Write your query or message here..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4.5 px-6 bg-gradient-to-r from-[#6b4f3a] via-[#523d2d] to-[#2A1B12] text-white font-black text-sm sm:text-base uppercase tracking-widest rounded-2xl shadow-xl hover:shadow-2xl hover:scale-[1.01] active:scale-95 transition-all border-2 border-[#D9A036]/50 flex items-center justify-center gap-2.5 cursor-pointer"
                >
                  <Send size={18} className="text-[#D9A036]" />
                  <span>Send Message</span>
                </button>
              </form>
            </div>
          </motion.div>

        </div>

        {/* FREQUENTLY ASKED QUESTIONS ACCORDION */}
        <section className="pt-10 border-t-2 border-[#6b4f3a]/15 max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-black uppercase tracking-widest text-[#D9A036] bg-[#FAF7F2] px-3 py-1 rounded-full border border-[#D9A036]/30 inline-block">
              Quick Assistance
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-[#2A1B12] uppercase tracking-tight">
              Frequently Asked Questions
            </h3>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border-2 border-[#6b4f3a]/15 overflow-hidden transition-all shadow-sm"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-4 sm:p-5 text-left font-black text-sm sm:text-base text-[#2A1B12] flex items-center justify-between gap-4 cursor-pointer hover:bg-[#FAF7F2]/60 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-5 h-5 text-[#D9A036] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="px-4 sm:px-5 pb-5 text-xs sm:text-sm text-[#6b4f3a] font-medium border-t border-gray-100 pt-3 leading-relaxed"
                      >
                        {faq.a}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </section>

      </div>
    </div>
  );
};

export default Contact;
