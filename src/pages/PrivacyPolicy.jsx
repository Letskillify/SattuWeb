import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, FileText, ChevronRight } from 'lucide-react';

const PrivacyPolicy = () => {
    const premiumEase = [0.25, 1, 0.5, 1];

    return (
        <div className="min-h-screen bg-[#FAF4E3] text-[#6b4f3a] font-poppins selection:bg-[#976E2A] selection:text-[#FAF4E3]">
            {/* --- HERO SECTION --- */}
            <section className="relative pt-32 pb-20 overflow-hidden border-b border-[#E3DBC5]">
                {/* Background Text Overlay */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[15vw] font-bold text-[#6b4f3a]/[0.02] whitespace-nowrap pointer-events-none select-none tracking-tight uppercase z-0">
                    PRIVACY
                </div>
                
                <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: premiumEase }}
                        className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-[#976E2A]/5 border border-[#976E2A]/20 mb-8"
                    >
                        <Shield size={14} className="text-[#976E2A]" />
                        <span className="text-[12px] font-bold uppercase tracking-[0.2em] text-[#976E2A]">Protection & Trust</span>
                    </motion.div>
                    
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: premiumEase, delay: 0.1 }}
                        className="text-5xl md:text-7xl font-bold tracking-tight mb-8"
                    >
                        Privacy <span className="text-[#976E2A] italic">Policy</span>
                    </motion.h1>
                    
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: premiumEase, delay: 0.2 }}
                        className="text-lg md:text-xl text-[#605948]/70 max-w-2xl mx-auto leading-relaxed"
                    >
                        Your trust is our legacy. Learn how we handle your information with the same integrity we apply to our heritage products.
                    </motion.p>
                </div>
            </section>

            {/* --- CONTENT SECTION --- */}
            <section className="py-24 relative overflow-hidden">
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/p6-grain.png')] z-0 mix-blend-multiply" />
                
                <div className="max-w-4xl mx-auto px-6 relative z-10">
                    <div className="space-y-16">
                        <section>
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-4">
                                <span className="w-8 h-8 rounded-lg bg-[#6b4f3a] text-white flex items-center justify-center text-sm">01</span>
                                Information Collection
                            </h2>
                            <div className="prose prose-stone max-w-none text-[#605948] leading-[1.8] space-y-4 font-medium">
                                <p>We collect personal information that you provide to us when you register on our website, place an order, subscribe to our newsletter, or contact us. This may include your name, email address, phone number, shipping address, and payment information.</p>
                                <p>We also automatically collect certain information when you visit our site, such as your IP address, browser type, and device information to improve your experience.</p>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-4">
                                <span className="w-8 h-8 rounded-lg bg-[#6b4f3a] text-white flex items-center justify-center text-sm">02</span>
                                Use of Information
                            </h2>
                            <div className="prose prose-stone max-w-none text-[#605948] leading-[1.8] space-y-4 font-medium">
                                <p>Vedamya Foods uses your information to:</p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>Process and fulfill your orders efficiently.</li>
                                    <li>Communicate with you regarding order status and promotions.</li>
                                    <li>Improve our products and website functionality.</li>
                                    <li>Comply with legal obligations and prevent fraud.</li>
                                </ul>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-4">
                                <span className="w-8 h-8 rounded-lg bg-[#6b4f3a] text-white flex items-center justify-center text-sm">03</span>
                                Data Protection
                            </h2>
                            <div className="prose prose-stone max-w-none text-[#605948] leading-[1.8] space-y-4 font-medium">
                                <p>We implement a variety of security measures to maintain the safety of your personal information. Your data is contained behind secured networks and is only accessible by a limited number of persons who have special access rights to such systems.</p>
                                <div className="bg-[#FFFDF6] border border-[#E3DBC5] p-6 rounded-2xl flex items-start gap-4 mt-8">
                                    <Lock size={24} className="text-[#976E2A] mt-1 shrink-0" />
                                    <p className="text-sm italic">All sensitive/credit information you supply is encrypted via Secure Socket Layer (SSL) technology and processed through recognized payment gateways.</p>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-4">
                                <span className="w-8 h-8 rounded-lg bg-[#6b4f3a] text-white flex items-center justify-center text-sm">04</span>
                                Cookies
                            </h2>
                            <div className="prose prose-stone max-w-none text-[#605948] leading-[1.8] space-y-4 font-medium">
                                <p>Our website uses cookies to enhance your browsing experience. These are small files that a site or its service provider transfers to your computer's hard drive through your web browser that enables the site's or service provider's systems to recognize your browser and capture and remember certain information.</p>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-4">
                                <span className="w-8 h-8 rounded-lg bg-[#6b4f3a] text-white flex items-center justify-center text-sm">05</span>
                                Contact Us
                            </h2>
                            <p className="text-[#605948] leading-[1.8] font-medium">If there are any questions regarding this privacy policy, you may contact us using the information in our footer.</p>
                        </section>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default PrivacyPolicy;
