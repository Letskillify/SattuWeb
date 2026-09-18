import React, { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useAuth } from "./useAuth";
import { 
  Mail, 
  Lock, 
  ArrowRight, 
  Leaf, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  RefreshCw,
  KeyRound,
  ShieldCheck,
  Sparkles,
  Check,
  Star,
  Package,
  Clock,
  ShieldAlert
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Login = () => {
  const { login, loginWithCustomToken, loginWithGoogle, sendPasswordReset } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Mode: 'otp' | 'password'
  const [authMode, setAuthMode] = useState("otp");

  // Step: 1 = Email Entry, 2 = OTP Entry, 3 = New User Password Setup
  const [step, setStep] = useState(1);

  // Form Fields
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Verification Tokens & State
  const [verifiedToken, setVerifiedToken] = useState("");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // Cooldown timer
  const [cooldown, setCooldown] = useState(0);

  const redirectPath = searchParams.get("redirect") || "/";
  const premiumEase = [0.16, 1, 0.3, 1];

  // Resend cooldown timer effect
  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  // Pre-fill email from URL query param
  useEffect(() => {
    const paramEmail = searchParams.get("email");
    if (paramEmail) {
      setEmail(paramEmail);
    }
  }, [searchParams]);

  // Handle OTP 6-Digit input changes
  const handleOtpChange = (element, index) => {
    const val = element.value;
    if (val && !/^\d+$/.test(val)) return false;

    const newOtp = [...otp];
    newOtp[index] = val ? val.slice(-1) : "";
    setOtp(newOtp);

    // Auto-focus next input
    if (val && element.nextSibling) {
      element.nextSibling.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && e.target.previousSibling) {
      e.target.previousSibling.focus();
    }
  };

  // Paste handler for full 6-digit OTP
  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim().slice(0, 6);
    if (/^\d+$/.test(pastedData)) {
      const newOtp = ["", "", "", "", "", ""];
      pastedData.split("").forEach((char, idx) => {
        if (idx < 6) newOtp[idx] = char;
      });
      setOtp(newOtp);
    }
  };

  // STEP 1: Send OTP to Email
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    setError("");
    setSuccessMsg("");
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const text = await res.text();
      let data = {};
      try { data = text ? JSON.parse(text) : {}; } catch (err) { data = {}; }

      if (!res.ok) {
        throw new Error(data.error || `Unable to send verification code (Server ${res.status}).`);
      }

      setSuccessMsg(`Verification code sent to ${email.trim()}`);
      setStep(2);
      setCooldown(data.cooldown || 30);
    } catch (err) {
      setError(err.message || "Failed to send verification code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    setError("");
    setSuccessMsg("");

    const fullOtp = otp.join("");
    if (fullOtp.length !== 6) {
      setError("Please enter the complete 6-digit verification code.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), otp: fullOtp }),
      });

      const text = await res.text();
      let data = {};
      try { data = text ? JSON.parse(text) : {}; } catch (err) { data = {}; }

      if (!res.ok) {
        throw new Error(data.error || `Verification failed (Server ${res.status}).`);
      }

      // Log in user directly with their verified email address
      await loginWithCustomToken(data.customToken, data.email || email.trim());
      navigate(redirectPath);
    } catch (err) {
      setError(err.message || "Failed to verify code. Please check and try again.");
    } finally {
      setLoading(false);
    }
  };

  // STEP 3: Complete Signup for New User (Create Password or Skip)
  const handleCompleteSignup = async (skipPassword = false) => {
    setError("");
    setSuccessMsg("");

    if (!skipPassword) {
      if (!password || password.length < 8) {
        setError("Password must be at least 8 characters long.");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
    }

    setLoading(true);
    try {
      const res = await fetch("/api/complete-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          verifiedToken,
          password: skipPassword ? null : password,
        }),
      });

      const text = await res.text();
      let data = {};
      try { data = text ? JSON.parse(text) : {}; } catch (err) { data = {}; }

      if (!res.ok) {
        throw new Error(data.error || `Account creation failed (Server ${res.status}).`);
      }

      await loginWithCustomToken(data.customToken, data.email || email.trim());
      navigate(redirectPath);
    } catch (err) {
      setError(err.message || "Failed to finalize account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // PASSWORD LOGIN METHOD
  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setLoading(true);
    try {
      await login(email.trim(), password);
      navigate(redirectPath);
    } catch (err) {
      setError("Incorrect email or password. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  // FORGOT PASSWORD
  const handleForgotPassword = async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please enter your email address first.");
      return;
    }
    setError("");
    setSuccessMsg("");
    setLoading(true);
    try {
      await sendPasswordReset(email.trim());
      setSuccessMsg("Password reset email sent! Check your inbox.");
    } catch (err) {
      setError("Could not send password reset email. Please verify your email.");
    } finally {
      setLoading(false);
    }
  };

  // GOOGLE LOGIN
  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      await loginWithGoogle();
      navigate(redirectPath);
    } catch (err) {
      setError("Google authentication was cancelled or failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-[#4A3525] flex relative overflow-hidden selection:bg-[#976E2A] selection:text-[#FFFDF6] pt-28 sm:pt-36 lg:pt-44 pb-16 lg:pb-24">
      {/* Dynamic Ambient Blur Glows */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[#976E2A]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-0 w-[500px] h-[500px] bg-[#4A5D4E]/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Grain Overlay */}
      <div className="absolute inset-0 opacity-[0.035] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/p6-grain.png')] mix-blend-multiply" />

      <div className="max-w-[1340px] w-full mx-auto px-4 md:px-8 lg:px-12 flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16 relative z-10 my-auto">
        
        {/* LEFT COLUMN: BRAND HERO SHOWCASE */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: premiumEase }}
          className="lg:w-1/2 space-y-8 text-center lg:text-left"
        >
          {/* Brand Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#976E2A]/10 border border-[#976E2A]/20 backdrop-blur-md">
            <Sparkles size={14} className="text-[#976E2A] animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#976E2A]">
              Traditional Vedic Superfood
            </span>
          </div>

          {/* Main Headline */}
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-semibold text-[#4A3525] leading-[1.1] tracking-tight">
              Pure energy <br className="hidden lg:block" />
              rooted in <span className="italic font-normal text-[#976E2A] underline decoration-[#976E2A]/30 decoration-wavy underline-offset-8">tradition.</span>
            </h1>
            <p className="text-base md:text-lg text-[#6b4f3a]/80 font-sans leading-relaxed max-w-lg mx-auto lg:mx-0 font-normal">
              Welcome to Vedamya Foods. Log in with your email OTP to track guest orders, manage saved profiles, and enjoy artisanal wellness products.
            </p>
          </div>

          {/* Feature Highlights Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 max-w-lg mx-auto lg:mx-0">
            <div className="p-4 rounded-2xl bg-[#FFFDF6]/80 border border-[#E3DBC5]/60 backdrop-blur-sm shadow-xs flex flex-col items-center lg:items-start text-center lg:text-left gap-2 group hover:border-[#976E2A]/40 transition-all duration-300">
              <div className="w-9 h-9 rounded-xl bg-[#976E2A]/10 flex items-center justify-center text-[#976E2A]">
                <ShieldCheck size={18} />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#4A3525]">Instant OTP</h4>
                <p className="text-[11px] text-[#6b4f3a]/70">Passwordless sign in</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#FFFDF6]/80 border border-[#E3DBC5]/60 backdrop-blur-sm shadow-xs flex flex-col items-center lg:items-start text-center lg:text-left gap-2 group hover:border-[#976E2A]/40 transition-all duration-300">
              <div className="w-9 h-9 rounded-xl bg-[#4A5D4E]/10 flex items-center justify-center text-[#4A5D4E]">
                <Package size={18} />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#4A3525]">Order Sync</h4>
                <p className="text-[11px] text-[#6b4f3a]/70">Guest orders connected</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#FFFDF6]/80 border border-[#E3DBC5]/60 backdrop-blur-sm shadow-xs flex flex-col items-center lg:items-start text-center lg:text-left gap-2 group hover:border-[#976E2A]/40 transition-all duration-300">
              <div className="w-9 h-9 rounded-xl bg-[#976E2A]/10 flex items-center justify-center text-[#976E2A]">
                <Star size={18} />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#4A3525]">100% Pure</h4>
                <p className="text-[11px] text-[#6b4f3a]/70">Stone ground recipes</p>
              </div>
            </div>
          </div>

          {/* Social Proof Bar */}
          <div className="pt-4 flex items-center justify-center lg:justify-start gap-4 border-t border-[#E3DBC5]/40">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full border-2 border-[#FAF4E3] bg-[#6b4f3a] text-white flex items-center justify-center text-xs font-bold">R</div>
              <div className="w-8 h-8 rounded-full border-2 border-[#FAF4E3] bg-[#976E2A] text-white flex items-center justify-center text-xs font-bold">A</div>
              <div className="w-8 h-8 rounded-full border-2 border-[#FAF4E3] bg-[#4A5D4E] text-white flex items-center justify-center text-xs font-bold">S</div>
            </div>
            <div className="text-xs text-[#6b4f3a]/80 font-sans">
              <div className="flex items-center gap-1 text-amber-600 font-bold">
                <Star size={12} fill="currentColor" />
                <Star size={12} fill="currentColor" />
                <Star size={12} fill="currentColor" />
                <Star size={12} fill="currentColor" />
                <Star size={12} fill="currentColor" />
                <span className="text-[#4A3525] ml-1">4.9/5 Rating</span>
              </div>
              <span>Trusted by 15,000+ conscious families</span>
            </div>
          </div>
        </motion.div>

        {/* RIGHT COLUMN: LUXURY AUTHENTICATION CARD */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: premiumEase, delay: 0.15 }}
          className="lg:w-[480px] w-full"
        >
          <div className="bg-[#FFFDF6]/95 backdrop-blur-xl border border-[#E3DBC5] rounded-[32px] md:rounded-[40px] p-6 sm:p-10 shadow-[0_30px_90px_-15px_rgba(107,79,58,0.12)] relative overflow-hidden">
            
            {/* Ambient inner glow header */}
            <div className="absolute -top-20 -left-20 w-48 h-48 bg-[#976E2A]/10 rounded-full blur-2xl pointer-events-none" />

            {/* Header Brand Emblem */}
            <div className="flex flex-col items-center mb-6 text-center relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#FAF4E3] to-[#FFFDF6] border border-[#E3DBC5] flex items-center justify-center mb-3 shadow-xs">
                <Leaf size={24} className="text-[#976E2A]" />
              </div>

              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#4A3525] tracking-tight mb-1">
                {step === 3 ? "Setup Password" : authMode === "password" ? "Password Login" : "Welcome Back"}
              </h2>

              <p className="text-xs sm:text-sm text-[#6b4f3a]/70 font-sans max-w-xs">
                {step === 1 && authMode === "otp" && "Enter your email for instant 6-digit OTP login"}
                {step === 2 && `Enter code sent to ${email}`}
                {step === 3 && "Create a password for faster login next time"}
                {authMode === "password" && step === 1 && "Sign in with your registered password"}
              </p>
            </div>

            {/* Step Progress Dots */}
            {authMode === "otp" && (
              <div className="flex items-center justify-center gap-2 mb-6">
                <div className={`h-1.5 rounded-full transition-all duration-300 ${step >= 1 ? "w-8 bg-[#976E2A]" : "w-2 bg-[#E3DBC5]"}`} />
                <div className={`h-1.5 rounded-full transition-all duration-300 ${step >= 2 ? "w-8 bg-[#976E2A]" : "w-2 bg-[#E3DBC5]"}`} />
                <div className={`h-1.5 rounded-full transition-all duration-300 ${step >= 3 ? "w-8 bg-[#976E2A]" : "w-2 bg-[#E3DBC5]"}`} />
              </div>
            )}

            {/* Authentication Mode Switcher (OTP vs Password) */}
            {step === 1 && (
              <div className="bg-[#FAF4E3] p-1.5 rounded-2xl border border-[#E3DBC5] flex mb-6 relative">
                <button
                  type="button"
                  onClick={() => setAuthMode("otp")}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 relative z-10 ${
                    authMode === "otp" ? "bg-white text-[#4A3525] shadow-sm border border-[#E3DBC5]/80" : "text-[#6b4f3a]/60 hover:text-[#4A3525]"
                  }`}
                >
                  <Mail size={14} className={authMode === "otp" ? "text-[#976E2A]" : ""} />
                  <span>Email OTP</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode("password")}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 relative z-10 ${
                    authMode === "password" ? "bg-white text-[#4A3525] shadow-sm border border-[#E3DBC5]/80" : "text-[#6b4f3a]/60 hover:text-[#4A3525]"
                  }`}
                >
                  <KeyRound size={14} className={authMode === "password" ? "text-[#976E2A]" : ""} />
                  <span>Password</span>
                </button>
              </div>
            )}

            {/* Notifications */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-5 p-3.5 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3 text-red-800 text-xs sm:text-sm font-medium"
                >
                  <AlertCircle size={18} className="shrink-0 text-red-600 mt-0.5" />
                  <span>{error}</span>
                </motion.div>
              )}

              {successMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-5 p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-start gap-3 text-emerald-900 text-xs sm:text-sm font-medium"
                >
                  <CheckCircle2 size={18} className="shrink-0 text-emerald-600 mt-0.5" />
                  <span>{successMsg}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* OTP AUTHENTICATION FLOW */}
            {authMode === "otp" && (
              <>
                {/* STEP 1: Enter Email */}
                {step === 1 && (
                  <form onSubmit={handleSendOtp} className="space-y-5">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-sans font-bold uppercase tracking-[0.2em] text-[#6b4f3a]/70 ml-1">
                        Email Address
                      </label>
                      <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6b4f3a]/40 group-focus-within:text-[#976E2A] transition-colors">
                          <Mail size={18} strokeWidth={1.75} />
                        </div>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="name@example.com"
                          className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-[#FAF5EC] border border-[#E3DBC5] focus:border-[#976E2A] focus:bg-white focus:ring-4 focus:ring-[#976E2A]/10 outline-none transition-all duration-300 font-sans text-sm sm:text-base text-[#4A3525] placeholder:text-[#6b4f3a]/30 shadow-inner"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full h-13 rounded-2xl bg-gradient-to-r from-[#6b4f3a] to-[#4A3525] hover:from-[#4A3525] hover:to-[#2E1A0C] text-white font-sans font-bold text-xs sm:text-sm uppercase tracking-[0.2em] shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <span>Send Code</span>
                          <ArrowRight size={16} />
                        </>
                      )}
                    </button>
                  </form>
                )}

                {/* STEP 2: Enter 6-Digit OTP */}
                {step === 2 && (
                  <form onSubmit={handleVerifyOtp} className="space-y-5">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center px-1">
                        <label className="text-[11px] font-sans font-bold uppercase tracking-[0.2em] text-[#6b4f3a]/70">
                          6-Digit Code
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setStep(1);
                            setOtp(["", "", "", "", "", ""]);
                          }}
                          className="text-xs font-bold text-[#976E2A] hover:underline"
                        >
                          Change Email
                        </button>
                      </div>

                      {/* 6 Digit Input Grid */}
                      <div className="flex justify-between gap-1.5 sm:gap-2">
                        {otp.map((digit, index) => (
                          <input
                            key={index}
                            type="text"
                            inputMode="numeric"
                            maxLength="1"
                            value={digit}
                            onChange={(e) => handleOtpChange(e.target, index)}
                            onKeyDown={(e) => handleKeyDown(e, index)}
                            onPaste={handleOtpPaste}
                            onFocus={(e) => e.target.select()}
                            className="w-10 h-13 sm:w-12 sm:h-14 text-center text-xl font-bold font-mono bg-[#FAF5EC] border border-[#E3DBC5] rounded-xl focus:border-[#976E2A] focus:bg-white focus:ring-4 focus:ring-[#976E2A]/10 outline-none transition-all shadow-inner text-[#4A3525]"
                          />
                        ))}
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading || otp.join("").length !== 6}
                      className="w-full h-13 rounded-2xl bg-gradient-to-r from-[#6b4f3a] to-[#4A3525] hover:from-[#4A3525] hover:to-[#2E1A0C] text-white font-sans font-bold text-xs sm:text-sm uppercase tracking-[0.2em] shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <span>Verify & Login</span>
                          <ShieldCheck size={16} />
                        </>
                      )}
                    </button>

                    {/* Resend OTP Cooldown */}
                    <div className="text-center pt-1">
                      {cooldown > 0 ? (
                        <p className="text-xs text-[#6b4f3a]/70">
                          Resend code in <span className="font-bold text-[#976E2A] font-mono">{cooldown}s</span>
                        </p>
                      ) : (
                        <button
                          type="button"
                          onClick={handleSendOtp}
                          disabled={loading}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#976E2A] hover:text-[#4A3525] transition-colors"
                        >
                          <RefreshCw size={13} />
                          <span>Resend OTP</span>
                        </button>
                      )}
                    </div>
                  </form>
                )}

                {/* STEP 3: Password Setup (Optional) */}
                {step === 3 && (
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-sans font-bold uppercase tracking-[0.2em] text-[#6b4f3a]/70 ml-1">
                        New Password (Min 8 chars)
                      </label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6b4f3a]/40">
                          <Lock size={18} strokeWidth={1.75} />
                        </div>
                        <input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-12 pr-10 py-3.5 rounded-2xl bg-[#FAF5EC] border border-[#E3DBC5] focus:border-[#976E2A] focus:bg-white outline-none transition-all font-sans text-sm text-[#4A3525]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6b4f3a]/40 hover:text-[#4A3525]"
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-sans font-bold uppercase tracking-[0.2em] text-[#6b4f3a]/70 ml-1">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6b4f3a]/40">
                          <Lock size={18} strokeWidth={1.75} />
                        </div>
                        <input
                          type={showPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-[#FAF5EC] border border-[#E3DBC5] focus:border-[#976E2A] focus:bg-white outline-none transition-all font-sans text-sm text-[#4A3525]"
                        />
                      </div>
                    </div>

                    <div className="space-y-2.5 pt-2">
                      <button
                        type="button"
                        onClick={() => handleCompleteSignup(false)}
                        disabled={loading || !password || password.length < 8}
                        className="w-full h-13 rounded-2xl bg-gradient-to-r from-[#6b4f3a] to-[#4A3525] text-white font-sans font-bold text-xs uppercase tracking-[0.2em] shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {loading ? (
                          <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            <span>Save & Log In</span>
                            <ArrowRight size={16} />
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCompleteSignup(true)}
                        disabled={loading}
                        className="w-full h-11 rounded-2xl bg-[#FAF4E3] border border-[#E3DBC5] text-[#4A3525] font-sans font-bold text-xs uppercase tracking-[0.15em] hover:bg-[#E3DBC5]/50 transition-all flex items-center justify-center"
                      >
                        Skip for Now
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* PASSWORD LOGIN FORM */}
            {authMode === "password" && (
              <form onSubmit={handlePasswordLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-sans font-bold uppercase tracking-[0.2em] text-[#6b4f3a]/70 ml-1">
                    Email Address
                  </label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6b4f3a]/40 group-focus-within:text-[#976E2A] transition-colors">
                      <Mail size={18} strokeWidth={1.75} />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-[#FAF5EC] border border-[#E3DBC5] focus:border-[#976E2A] focus:bg-white focus:ring-4 focus:ring-[#976E2A]/10 outline-none transition-all font-sans text-sm text-[#4A3525]"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[11px] font-sans font-bold uppercase tracking-[0.2em] text-[#6b4f3a]/70">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="text-xs font-bold text-[#976E2A] hover:underline"
                    >
                      Forgot?
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6b4f3a]/40">
                      <Lock size={18} strokeWidth={1.75} />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-12 pr-10 py-3.5 rounded-2xl bg-[#FAF5EC] border border-[#E3DBC5] focus:border-[#976E2A] focus:bg-white outline-none transition-all font-sans text-sm text-[#4A3525]"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6b4f3a]/40 hover:text-[#4A3525]"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-13 rounded-2xl bg-gradient-to-r from-[#6b4f3a] to-[#4A3525] hover:from-[#4A3525] hover:to-[#2E1A0C] text-white font-sans font-bold text-xs sm:text-sm uppercase tracking-[0.2em] shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Login with Password</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* DIVIDER & SOCIAL PROVIDER */}
            {step === 1 && (
              <div className="mt-6 space-y-5">
                <div className="flex items-center gap-3">
                  <div className="h-px bg-[#E3DBC5] flex-1" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#6b4f3a]/50">OR</span>
                  <div className="h-px bg-[#E3DBC5] flex-1" />
                </div>

                {/* Google Sign In */}
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full h-12 rounded-2xl bg-white border border-[#E3DBC5] text-[#4A3525] font-sans font-bold text-xs uppercase tracking-wider hover:bg-[#FAF5EC] transition-all flex items-center justify-center gap-3 shadow-xs hover:border-[#976E2A]/50 cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </button>
              </div>
            )}

            {/* SWITCH TO SIGNUP */}
            <div className="mt-6 text-center pt-4 border-t border-[#E3DBC5]/50">
              <p className="text-xs sm:text-sm text-[#6b4f3a]/70 font-sans">
                Don't have an account?{" "}
                <Link to="/signup" className="text-[#976E2A] font-bold hover:text-[#4A3525] underline underline-offset-4 ml-1">
                  Create Account Free
                </Link>
              </p>
            </div>

          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default Login;
