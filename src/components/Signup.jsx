import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "./useAuth";
import { Mail, Lock, User, ArrowRight, Leaf, AlertCircle, ShieldCheck, Eye, EyeOff, Sparkles, ChevronLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Signup = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const premiumEase = [0.25, 1, 0.5, 1];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signup(email, password, displayName);
      navigate("/");
    } catch {
      setError("We encountered an error initializing your profile. Please check your data and retry.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-[#6b4f3a] flex relative overflow-hidden selection:bg-[#976E2A] selection:text-[#FFFDF6] pt-16 md:pt-0">

      {/* Background Texture Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/p6-grain.png')] mix-blend-multiply" />

      <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-20 flex flex-col lg:flex-row items-center justify-between gap-16 min-h-screen relative z-10 py-20 lg:py-0">

        {/* LEFT COLUMN: BRAND NARRATIVE */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: premiumEase }}
          className="lg:w-1/2 space-y-12"
        >
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-3 text-[14px] font-poppins font-bold uppercase tracking-[0.4em] text-[#6b4f3a] hover:text-[#976E2A] transition-colors group">
              <div className="w-8 h-8 rounded-full bg-[#6b4f3a]/5 flex items-center justify-center border border-[#6b4f3a]/10">
                <Leaf size={14} className="text-[#976E2A]" />
              </div>
              <span>Vedamya Foods</span>
            </Link>

            <h1 className="text-4xl md:text-5xl xl:text-6xl font-poppins capitalize  font-bold text-[#6b4f3a] leading-[1.05] tracking-tight">
              Start your <br />
              journey to <br />
              <span className="text-[#976E2A]">wellness.</span>
            </h1>

            <div className="w-20 h-px bg-[#976E2A]/30" />

            <p className="text-lg md:text-xl text-[#6b4f3a]/70 font-poppins leading-relaxed max-w-md">
              Create an account to track your orders, save your wishlist, and enjoy a faster checkout experience.
            </p>
          </div>
        </motion.div>

        {/* RIGHT COLUMN: REGISTRY CARD */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: premiumEase, delay: 0.2 }}
          className="lg:w-[500px] w-full"
        >
          <div className="bg-[#FFFDF6] border border-[#E3DBC5] mb-20 mt-35 rounded-[48px] p-10 md:p-14 shadow-[0_40px_100px_rgba(32,59,35,0.06)] relative overflow-hidden group">

            {/* Card Header Emblem */}
            <div className="flex flex-col items-center mb-12 text-center">
              <div className="w-20 h-20 rounded-3xl bg-[#FAF4E3] border border-[#E3DBC5] flex items-center justify-center mb-6 shadow-sm rotate-3">
                <Leaf size={32} className="text-[#6b4f3a] fill-current opacity-80" />
              </div>
              <h2 className="text-4xl font-poppins font-bold text-[#6b4f3a] tracking-tight mb-3">
                Create Account
              </h2>
              <p className="text-base text-[#6b4f3a]/50 font-poppins leading-relaxed">
                Join us today for a premium experience.
              </p>
            </div>

            {/* Error Message Diagnostics */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-8 overflow-hidden"
                >
                  <div className="p-5 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-4 text-red-700 text-base font-medium">
                    <AlertCircle size={18} className="shrink-0 text-red-500" />
                    <span>Failed to create account. Please try again.</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Identity Block */}
              <div className="space-y-2">
                <label className="text-[14px] font-poppins font-bold uppercase tracking-[0.2em] text-[#6b4f3a]/40 ml-1">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-[#6b4f3a]/30">
                    <User size={20} strokeWidth={1.5} />
                  </div>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full pl-16 pr-6 py-5 rounded-2xl bg-[#FFFDF6] border border-[#E3DBC5] focus:border-[#6b4f3a] outline-none transition-all duration-300 font-poppins text-lg text-[#6b4f3a] placeholder:text-[#6b4f3a]/20 shadow-sm"
                    required
                  />
                </div>
              </div>

              {/* Endpoint Block */}
              <div className="space-y-2">
                <label className="text-[14px] font-poppins font-bold uppercase tracking-[0.2em] text-[#6b4f3a]/40 ml-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-[#6b4f3a]/30">
                    <Mail size={20} strokeWidth={1.5} />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full pl-16 pr-6 py-5 rounded-2xl bg-[#FFFDF6] border border-[#E3DBC5] focus:border-[#6b4f3a] outline-none transition-all duration-300 font-poppins text-lg text-[#6b4f3a] placeholder:text-[#6b4f3a]/20 shadow-sm"
                    required
                    maxLength={30}
                  />
                </div>
              </div>

              {/* Cipher Block */}
              <div className="space-y-2">
                <label className="text-[14px] font-poppins font-bold uppercase tracking-[0.2em] text-[#6b4f3a]/40 ml-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-[#6b4f3a]/30">
                    <Lock size={20} strokeWidth={1.5} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    className="w-full pl-16 pr-14 py-5 rounded-2xl bg-[#FFFDF6] border border-[#E3DBC5] focus:border-[#6b4f3a] outline-none transition-all duration-300 font-poppins text-lg text-[#6b4f3a] placeholder:text-[#6b4f3a]/20 shadow-sm"
                    required
                    maxLength={30}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-6 top-1/2 -translate-y-1/2 text-[#6b4f3a]/20 hover:text-[#6b4f3a] transition-colors"
                   >
                    {showPassword ? <EyeOff size={20} strokeWidth={1.5} /> : <Eye size={20} strokeWidth={1.5} />}
                  </button>
                </div>
              </div>

              {/* Main Committal Action */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-16 rounded-2xl bg-[#6b4f3a] text-white font-poppins font-bold text-lg uppercase tracking-[0.2em] shadow-xl hover:bg-[#2E1A0C] transition-all duration-300 flex items-center justify-center gap-4 disabled:opacity-50 mt-6"
              >
                {loading ? (
                  <div className="w-6 h-6 border-3 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight size={20} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-12 text-center">
              <p className="text-base text-[#6b4f3a]/60 font-poppins">
                Already have an account?{" "}
                <Link to="/login" className="text-[#976E2A] font-bold hover:text-[#6b4f3a] underline underline-offset-4 ml-1">
                  Login here
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Footer Branding Detail */}
      <div className="absolute bottom-10 left-0 w-full px-6 md:px-12 pointer-events-none flex justify-between items-center z-10 opacity-40">
        <div className="text-[14px] font-poppins font-bold uppercase tracking-[0.3em]">
          © 2026 VEDAMYA FOODS
        </div>
        <div className="w-12 h-px bg-[#6b4f3a]/20" />
      </div>
    </div>
  );
};

export default Signup;
