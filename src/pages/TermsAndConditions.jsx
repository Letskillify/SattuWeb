import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Scale, Gavel, Handshake, AlertCircle } from 'lucide-react';

const TermsAndConditions = () => {
    const premiumEase = [0.25, 1, 0.5, 1];

    return (
        <div className="min-h-screen bg-[#FAF4E3] text-[#6b4f3a] font-poppins selection:bg-[#976E2A] selection:text-[#FAF4E3]">
            {/* --- HERO SECTION --- */}
            <section className="relative pt-32 pb-20 overflow-hidden border-b border-[#E3DBC5]">
                {/* Background Text Overlay */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[15vw] font-bold text-[#6b4f3a]/[0.02] whitespace-nowrap pointer-events-none select-none tracking-tight uppercase z-0">
                    AGREEMENT
                </div>
                
                <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: premiumEase }}
                        className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-[#976E2A]/5 border border-[#976E2A]/20 mb-8"
                    >
                        <Scale size={14} className="text-[#976E2A]" />
                        <span className="text-[12px] font-bold uppercase tracking-[0.2em] text-[#976E2A]">Ethical Commerce</span>
                    </motion.div>
                    
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: premiumEase, delay: 0.1 }}
                        className="text-5xl md:text-7xl font-bold tracking-tight mb-8"
                    >
                        Terms & <span className="text-[#976E2A] italic">Conditions</span>
                    </motion.h1>
                    
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: premiumEase, delay: 0.2 }}
                        className="text-lg md:text-xl text-[#605948]/70 max-w-2xl mx-auto leading-relaxed"
                    >
                        Understanding the mutual commitment between Vedamya Foods and our esteemed community of wellness seekers.
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
                                Acceptance of Terms
                            </h2>
                            <div className="prose prose-stone max-w-none text-[#605948] leading-[1.8] space-y-4 font-medium">
                                <p>By accessing and using the Vedamya Foods website, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions. These terms apply to all visitors, users, and others who access or use our services.</p>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-4">
                                <span className="w-8 h-8 rounded-lg bg-[#6b4f3a] text-white flex items-center justify-center text-sm">02</span>
                                Use of Website
                            </h2>
                            <div className="prose prose-stone max-w-none text-[#605948] leading-[1.8] space-y-4 font-medium">
                                <p>You may use our website for lawful purposes only. You are prohibited from:</p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>Using the site in any way that violates applicable local, national, or international laws.</li>
                                    <li>Engaging in unauthorized data collection or "scraping."</li>
                                    <li>Attempting to interfere with the proper working of the website.</li>
                                </ul>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-4">
                                <span className="w-8 h-8 rounded-lg bg-[#6b4f3a] text-white flex items-center justify-center text-sm">03</span>
                                Product Information & Pricing
                            </h2>
                            <div className="prose prose-stone max-w-none text-[#605948] leading-[1.8] space-y-4 font-medium">
                                <p>Vedamya Foods strives to be as accurate as possible with product descriptions and pricing. However, we do not warrant that product descriptions or other content are accurate, complete, or error-free. We reserve the right to correct any errors and to change or update information at any time without prior notice.</p>
                                <div className="bg-[#FFFDF6] border border-[#E3DBC5] p-6 rounded-2xl flex items-start gap-4 mt-8">
                                    <AlertCircle size={24} className="text-[#976E2A] mt-1 shrink-0" />
                                    <p className="text-sm italic">Pricing for our products is subject to change. We reserve the right at any time to modify or discontinue the service without notice.</p>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-4">
                                <span className="w-8 h-8 rounded-lg bg-[#6b4f3a] text-white flex items-center justify-center text-sm">04</span>
                                Intellectual Property
                            </h2>
                            <div className="prose prose-stone max-w-none text-[#605948] leading-[1.8] space-y-4 font-medium">
                                <p>All content included on this site, such as text, graphics, logos, images, and software, is the property of Vedamya Foods or its content suppliers and protected by international copyright laws.</p>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-4">
                                <span className="w-8 h-8 rounded-lg bg-[#6b4f3a] text-white flex items-center justify-center text-sm">05</span>
                                Limitation of Liability
                            </h2>
                            <div className="prose prose-stone max-w-none text-[#605948] leading-[1.8] space-y-4 font-medium">
                                <p>Vedamya Foods shall not be liable for any direct, indirect, incidental, special, or consequential damages resulting from the use or inability to use our products or website.</p>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-4">
                                <span className="w-8 h-8 rounded-lg bg-[#6b4f3a] text-white flex items-center justify-center text-sm">06</span>
                                Governing Law
                            </h2>
                            <p className="text-[#605948] leading-[1.8] font-medium">These terms shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law provisions.</p>
                        </section>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default TermsAndConditions;
