import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth, db } from "../../components/Firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { UserPlus, Lock, Mail, ArrowRight, AlertCircle, Eye, EyeOff, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const AdminSignup = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const premiumEase = [0.25, 1, 0.5, 1];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await updateProfile(user, { displayName: name });
      await setDoc(doc(db, "users", user.uid), {
        name,
        email,
        role: "admin",
        createdAt: new Date().toISOString()
      });
      navigate("/admin");
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to create administrator account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF4E3] text-[#6b4f3a] flex items-center justify-center p-6 relative overflow-hidden selection:bg-[#976E2A] selection:text-white">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/p6-grain.png')] mix-blend-multiply" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#976E2A]/5 rounded-full blur-[100px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: premiumEase }}
        className="w-full max-w-[440px]"
      >
        <div className="bg-white border border-[#E3DBC5] rounded-[32px] p-8 md:p-10 shadow-[0_20px_50px_rgba(107,79,58,0.08)]">
          
          <div className="flex flex-col items-center mb-10 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#FAF4E3] border border-[#E3DBC5] flex items-center justify-center mb-5">
              <UserPlus size={28} className="text-[#6b4f3a]" />
            </div>
            <h2 className="text-2xl font-poppins font-bold text-[#6b4f3a] tracking-tight">Admin Registration</h2>
            <p className="text-sm text-[#6b4f3a]/50 font-poppins mt-1">Initialize System Credentials</p>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 font-poppins"
              >
                <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-600 text-[13px] font-medium">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-5 font-poppins">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-widest text-[#976E2A] ml-1">Admin Identity</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6b4f3a]/30">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full Name"
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-[#FAF4E3]/30 border border-[#E3DBC5] focus:border-[#6b4f3a] outline-none text-sm text-[#6b4f3a]"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-widest text-[#976E2A] ml-1">Secure Email</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6b4f3a]/30">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@vedamya.com"
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-[#FAF4E3]/30 border border-[#E3DBC5] focus:border-[#6b4f3a] outline-none text-sm text-[#6b4f3a]"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-widest text-[#976E2A] ml-1">Universal Key</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6b4f3a]/30">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 8 characters"
                  className="w-full pl-12 pr-12 py-3.5 rounded-xl bg-[#FAF4E3]/30 border border-[#E3DBC5] focus:border-[#6b4f3a] outline-none text-sm text-[#6b4f3a]"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6b4f3a]/20 hover:text-[#6b4f3a]"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 rounded-xl bg-[#6b4f3a] text-white font-bold text-sm uppercase tracking-widest shadow-lg hover:shadow-[#6b4f3a]/20 hover:scale-[1.02] active:scale-100 transition-all flex items-center justify-center gap-3 mt-4 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Create Admin</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-[#E3DBC5]/50 text-center">
            <p className="text-xs text-[#6b4f3a]/40 font-poppins">
              Already registered? <Link to="/admin/login" className="text-[#976E2A] font-bold hover:underline">Log In</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminSignup;
