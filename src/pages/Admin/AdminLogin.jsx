import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth } from "../../components/Firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Shield, Lock, Mail, ArrowRight, AlertCircle, Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const premiumEase = [0.25, 1, 0.5, 1];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/admin");
    } catch (err) {
      console.error(err);
      setError("Invalid administrative credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF4E3] text-[#6b4f3a] flex items-center justify-center relative overflow-hidden selection:bg-[#976E2A] selection:text-white p-6">
      {/* Subtle Background Textures */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/p6-grain.png')] mix-blend-multiply" />
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#976E2A]/5 rounded-full blur-[100px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: premiumEase }}
        className="w-full max-w-[460px]"
      >
        <div className="bg-white border border-[#E3DBC5] rounded-[36px] p-8 md:p-12 shadow-[0_20px_50px_rgba(107,79,58,0.1)] relative">
          
          <div className="flex flex-col items-center mb-10 text-center">
            <div className="w-18 h-18 rounded-3xl bg-[#FAF4E3] border border-[#E3DBC5] flex items-center justify-center mb-5 shadow-xs">
              <Shield size={32} className="text-[#6b4f3a]" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-poppins font-black text-[#6b4f3a] tracking-tight">Admin Portal</h2>
            <p className="text-xs sm:text-sm text-[#6b4f3a]/60 font-poppins font-semibold mt-1">Authorized Access Only</p>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-8"
              >
                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 text-red-600 text-xs sm:text-sm font-semibold">
                  <AlertCircle size={18} className="shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-poppins font-extrabold uppercase tracking-wider text-[#976E2A] ml-1">Email</label>
              <div className="relative">
                <div className="absolute left-4.5 top-1/2 -translate-y-1/2 text-[#6b4f3a]/40">
                  <Mail size={20} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@vedamya.com"
                  className="w-full pl-13 pr-4 py-4 rounded-2xl bg-[#FAF4E3]/40 border border-[#E3DBC5] focus:border-[#6b4f3a] outline-none transition-all font-poppins text-sm text-[#6b4f3a] font-medium"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-poppins font-extrabold uppercase tracking-wider text-[#976E2A] ml-1">Password</label>
              <div className="relative">
                <div className="absolute left-4.5 top-1/2 -translate-y-1/2 text-[#6b4f3a]/40">
                  <Lock size={20} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-13 pr-12 py-4 rounded-2xl bg-[#FAF4E3]/40 border border-[#E3DBC5] focus:border-[#6b4f3a] outline-none transition-all font-poppins text-sm text-[#6b4f3a] font-medium"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4.5 top-1/2 -translate-y-1/2 text-[#6b4f3a]/40 hover:text-[#6b4f3a] cursor-pointer"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 rounded-2xl bg-[#6b4f3a] text-white font-poppins font-black text-xs sm:text-sm uppercase tracking-widest shadow-lg hover:shadow-[#6b4f3a]/25 hover:scale-[1.02] active:scale-100 transition-all flex items-center justify-center gap-3 mt-5 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-[#E3DBC5]/50 text-center">
            <p className="text-xs sm:text-sm text-[#6b4f3a]/60 font-poppins font-semibold">
              Need account? <Link to="/admin/signup" className="text-[#976E2A] font-extrabold hover:underline">Register Admin</Link>
            </p>
          </div>
        </div>
      </motion.div>

      {/* Brand Watermark */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 opacity-30">
        <p className="text-xs font-poppins font-extrabold uppercase tracking-[0.4em]">VEDAMYA FOODS • ADMIN</p>
      </div>
    </div>
  );
};

export default AdminLogin;
