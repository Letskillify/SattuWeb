import React, { useEffect, useState } from "react";
import { useAuth } from "../components/useAuth";
import { db } from "../components/Firebase";
import { collection, getDocs, addDoc, serverTimestamp, doc, deleteDoc } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, CreditCard, MapPin, User, Phone, Mail, CheckCircle, Sparkles, X, ShoppingBag, ShieldCheck, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PageHeader from "../components/Sattu/PageHeader";

const Checkout = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    paymentMethod: "online", // Default to online/razorpay
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderStatus, setOrderStatus] = useState(null); // 'success' | 'failed'
  const [feedbackMessage, setFeedbackMessage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Load Razorpay Script
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    const load = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const snap = await getDocs(collection(db, "users", user.uid, "cart"));
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setItems(list);
        
        // Pre-fill user data if available
        setFormData(prev => ({
          ...prev,
          name: user.displayName || "",
          email: user.email || ""
        }));
      } catch (error) {
        console.error("Error loading cart:", error);
      } finally {
        setLoading(false);
      }
    };
    load();

    return () => {
      document.body.removeChild(script);
    };
  }, [user]);

  const triggerToast = (msg) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const total = items.reduce((sum, i) => sum + (Number(i.price) || 0), 0);

  const clearCart = async () => {
    try {
      const snap = await getDocs(collection(db, "users", user.uid, "cart"));
      const deletePromises = snap.docs.map(d => deleteDoc(doc(db, "users", user.uid, "cart", d.id)));
      await Promise.all(deletePromises);
    } catch (e) {
      console.error("Error clearing cart:", e);
    }
  };

  const saveOrder = async (paymentId = "COD", status = "confirmed", paymentStatus = "captured") => {
    try {
      await addDoc(collection(db, "orders"), {
        userId: user.uid,
        userEmail: user.email,
        items: items,
        total: total,
        shipping: formData,
        paymentMethod: formData.paymentMethod,
        paymentId: paymentId,
        status: status,
        paymentStatus: paymentStatus,
        createdAt: serverTimestamp(),
      });
      
      if (status === "confirmed") {
        await clearCart();
        setOrderStatus("success");
      } else {
        setOrderStatus("failed");
      }
    } catch (error) {
      console.error("Error saving order:", error);
      triggerToast("Store entry failed, but payment was successful. Please contact support.");
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (items.length === 0) {
      triggerToast("Your selection is empty!");
      return;
    }
    
    setIsProcessing(true);

    if (formData.paymentMethod === "online") {
      const options = {
        key: "rzp_test_YOUR_KEY_HERE", // Replace with your actual Razorpay Key ID
        amount: total * 100, // amount in paisa
        currency: "INR",
        name: "Vedamya Foods",
        description: "Premium Vedic Nutrition Order",
        image: "https://res.cloudinary.com/duzwys877/image/upload/v1782295170/logo_rwarlx.png",
        handler: async function (response) {
          await saveOrder(response.razorpay_payment_id, "confirmed", "captured");
          setIsProcessing(false);
        },
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone,
        },
        theme: {
          color: "#6b4f3a",
        },
        modal: {
          ondismiss: function() {
            setIsProcessing(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', async function (response){
        await saveOrder(response.error.metadata.payment_id, "failed", "failed");
        setIsProcessing(false);
      });
      rzp.open();
    } else {
      // COD Logic
      await saveOrder("COD", "confirmed", "pending");
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFDF6] flex items-center justify-center">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 border-2 border-[#6b4f3a]/10 rounded-full" />
          <div className="absolute inset-0 border-2 border-t-[#6b4f3a] rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#FFFDF6]">
        <PageHeader title="Checkout" subtitle="Secure Portal" breadcrumbItems={[{ label: "Home", path: "/" }, { label: "Checkout" }]} />
        <div className="flex flex-col items-center justify-center py-32 px-6 text-center">
          <div className="w-20 h-20 bg-[#F8F3E6] rounded-3xl flex items-center justify-center mb-8 text-[#6b4f3a]">
            <ShieldCheck size={40} strokeWidth={1} />
          </div>
          <h2 className="text-3xl font-poppins text-[#2E1A0C] mb-4">Authentication Required</h2>
          <p className="text-[#6b4f3a]/70 max-w-sm mb-10 leading-relaxed font-sans text-[14px]">Please initialize your session to proceed with the procurement of your artisanal blends.</p>
          <Link to="/login" className="px-12 py-4 bg-[#6b4f3a] text-white rounded-xl font-bold uppercase tracking-widest hover:bg-[#2E1A0C] transition-all shadow-lg text-[14px]">Sign In</Link>
        </div>
      </div>
    );
  }

  if (orderStatus === "success") {
    return (
      <div className="min-h-screen bg-[#FAF4E3]">
        <div className="max-w-2xl mx-auto py-32 px-6 text-center">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8 border border-green-100">
            <CheckCircle size={48} className="text-green-600" />
          </motion.div>
          <h2 className="text-4xl font-poppins font-bold text-[#6b4f3a] mb-6 tracking-tight">Order Successful</h2>
          <p className="text-[#6b4f3a]/70 text-[18px] mb-12 leading-relaxed max-w-md mx-auto">Thank you for your purchase. We are preparing your heritage blend for delivery.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/orders" className="px-10 py-4 bg-[#6b4f3a] text-white rounded-xl font-bold uppercase tracking-widest hover:bg-[#976E2A] transition-all text-[14px]">View My Orders</Link>
            <Link to="/shop" className="px-10 py-4 bg-white border border-[#E3DBC5] text-[#6b4f3a] rounded-xl font-bold uppercase tracking-widest hover:bg-gray-50 transition-all text-[14px]">Continue Shopping</Link>
          </div>
        </div>
      </div>
    );
  }

  if (orderStatus === "failed") {
    return (
      <div className="min-h-screen bg-[#FAF4E3]">
        <div className="max-w-2xl mx-auto py-32 px-6 text-center">
          <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-8 border border-red-100">
            <X size={48} className="text-red-600" />
          </div>
          <h2 className="text-4xl font-poppins font-bold text-[#6b4f3a] mb-6 tracking-tight">Payment Failed</h2>
          <p className="text-[#6b4f3a]/70 text-[18px] mb-12 leading-relaxed max-w-md mx-auto">The transaction could not be completed. Please try again or choose another payment method.</p>
          <button onClick={() => setOrderStatus(null)} className="px-12 py-4 bg-[#6b4f3a] text-white rounded-xl font-bold uppercase tracking-widest hover:bg-[#976E2A] transition-all text-[14px]">Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF4E3] selection:bg-[#976E2A] selection:text-white font-poppins">
      <PageHeader 
        title="Checkout" 
        subtitle="Secure Your Order" 
        backUrl="/cart" 
        breadcrumbItems={[
          { label: "Home", path: "/" }, 
          { label: "Cart", path: "/cart" }, 
          { label: "Checkout" }
        ]} 
      />

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-16">
        <div className="grid lg:grid-cols-12 gap-16">
          
          {/* Form Side */}
          <div className="lg:col-span-7 space-y-12">
            <form onSubmit={handlePlaceOrder} className="space-y-12">
              
              {/* Shipping Section */}
              <section className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#6b4f3a] text-white flex items-center justify-center shadow-lg"><MapPin size={20} /></div>
                  <h2 className="text-2xl font-bold text-[#6b4f3a] tracking-tight">Shipping Address</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { label: "Full Name", name: "name", icon: User, placeholder: "Enter your name" },
                    { label: "Email Address", name: "email", icon: Mail, placeholder: "email@example.com" }
                  ].map((field) => (
                    <div key={field.name} className="space-y-2">
                      <label className="text-[12px] font-bold uppercase tracking-widest text-[#976E2A] ml-1">{field.label}</label>
                      <div className="relative">
                        <field.icon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#976E2A]/40" />
                        <input type="text" name={field.name} required value={formData[field.name]} onChange={handleInputChange} className="w-full pl-11 pr-5 py-4 bg-white border border-[#E3DBC5] rounded-xl outline-none focus:border-[#6b4f3a] transition-all text-[15px] text-[#6b4f3a]" placeholder={field.placeholder} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <label className="text-[12px] font-bold uppercase tracking-widest text-[#976E2A] ml-1">Phone Number</label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#976E2A]/40" />
                    <input type="tel" name="phone" required value={formData.phone} onChange={handleInputChange} className="w-full pl-11 pr-5 py-4 bg-white border border-[#E3DBC5] rounded-xl outline-none focus:border-[#6b4f3a] transition-all text-[15px] text-[#6b4f3a] font-sans" placeholder="+91 00000 00000" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[12px] font-bold uppercase tracking-widest text-[#976E2A] ml-1">Full Address</label>
                  <div className="relative">
                    <MapPin size={16} className="absolute left-4 top-4 text-[#976E2A]/40" />
                    <textarea name="address" required rows={3} value={formData.address} onChange={handleInputChange} className="w-full pl-11 pr-5 py-4 bg-white border border-[#E3DBC5] rounded-xl outline-none focus:border-[#6b4f3a] transition-all text-[15px] text-[#6b4f3a]" placeholder="Street name, house number, area" />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {["city", "state", "pincode"].map((field) => (
                    <div key={field} className="space-y-2">
                      <label className="text-[12px] font-bold uppercase tracking-widest text-[#976E2A] ml-1 capitalize">{field}</label>
                      <input type="text" name={field} required value={formData[field]} onChange={handleInputChange} className={`w-full px-5 py-4 bg-white border border-[#E3DBC5] rounded-xl outline-none focus:border-[#6b4f3a] transition-all text-[15px] text-[#6b4f3a] ${field === 'pincode' ? 'font-sans' : ''}`} placeholder={field === 'pincode' ? "000000" : ""} />
                    </div>
                  ))}
                </div>
              </section>

              {/* Payment Section */}
              <section className="space-y-8 pt-6 border-t border-[#E3DBC5]">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#6b4f3a] text-white flex items-center justify-center shadow-lg"><CreditCard size={20} /></div>
                  <h2 className="text-2xl font-bold text-[#6b4f3a] tracking-tight">Payment Method</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { id: "online", label: "Online Payment", desc: "Razorpay (Cards, UPI, Netbanking)", icon: Zap },
                    { id: "cod", label: "Cash on Delivery", desc: "Pay only when delivered", icon: Sparkles }
                  ].map((method) => {
                    const Icon = method.icon;
                    const active = formData.paymentMethod === method.id;
                    return (
                      <button key={method.id} type="button" onClick={() => setFormData(p => ({ ...p, paymentMethod: method.id }))} className={`p-6 rounded-2xl border-2 transition-all flex items-start gap-4 text-left ${active ? 'border-[#6b4f3a] bg-[#FFFBF0]' : 'border-[#E3DBC5]/60 bg-white hover:border-[#6b4f3a]/40'}`}>
                        <div className={`p-3 rounded-xl ${active ? 'bg-[#6b4f3a] text-white' : 'bg-[#FAF4E3] text-[#976E2A]'}`}><Icon size={20} /></div>
                        <div>
                          <p className={`font-bold uppercase tracking-widest text-[13px] ${active ? 'text-[#6b4f3a]' : 'text-[#6b4f3a]/60'}`}>{method.label}</p>
                          <p className="text-[13px] text-[#6b4f3a]/50 font-medium mt-0.5">{method.desc}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </section>

              <button type="submit" disabled={isProcessing} className="w-full h-16 bg-[#6b4f3a] text-white rounded-xl font-bold uppercase tracking-[0.3em] text-[14px] shadow-xl hover:bg-[#976E2A] transition-all disabled:opacity-50 flex items-center justify-center gap-3">
                {isProcessing ? <><div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> Processing Payment...</> : <>Place Order</>}
              </button>
            </form>
          </div>

          {/* Summary Side */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-3xl border border-[#E3DBC5] p-8 shadow-sm sticky top-32">
              <h3 className="text-xl font-bold text-[#6b4f3a] mb-8 tracking-tight">Order Summary</h3>
              
              <div className="space-y-6 mb-8 max-h-[350px] overflow-auto pr-2">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-5">
                    <div className="w-20 h-20 bg-[#FAF4E3] rounded-2xl flex-shrink-0 p-2 border border-[#E3DBC5]/40">
                      <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-1 py-1">
                      <p className="text-[11px] font-bold uppercase tracking-widest text-[#976E2A]">{item.flavor || "Natural Sattu"}</p>
                      <h4 className="text-[15px] font-bold text-[#6b4f3a] mt-0.5 line-clamp-1">{item.name}</h4>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-[14px] font-sans font-bold text-[#6b4f3a]">₹{item.price}</span>
                        <span className="text-[12px] text-[#6b4f3a]/50 font-sans px-2 bg-[#FAF4E3] rounded">x{item.quantity || 1}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4 pt-8 border-t border-dashed border-[#E3DBC5]">
                <div className="flex justify-between text-[14px] font-medium">
                  <span className="text-[#6b4f3a]/60 uppercase tracking-widest">Subtotal</span>
                  <span className="font-sans font-bold text-[#6b4f3a]">₹{total}</span>
                </div>
                <div className="flex justify-between text-[14px] font-medium">
                  <span className="text-[#6b4f3a]/60 uppercase tracking-widest">Delivery Charge</span>
                  <span className="text-emerald-600 font-bold uppercase tracking-widest">Free</span>
                </div>
                <div className="flex justify-between pt-6 border-t border-[#E3DBC5] items-baseline">
                  <span className="text-[15px] font-bold uppercase tracking-widest text-[#6b4f3a]">Total Amount</span>
                  <span className="text-3xl font-bold text-[#6b4f3a] font-sans">₹{total}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {feedbackMessage && (
          <motion.div initial={{ opacity: 0, y: 50, x: '-50%' }} animate={{ opacity: 1, y: 0, x: '-50%' }} exit={{ opacity: 0, y: 20, x: '-50%' }} className="fixed bottom-12 left-1/2 z-50 bg-[#6b4f3a] text-white px-8 py-5 rounded-2xl shadow-2xl flex items-center gap-6 backdrop-blur-xl max-w-md w-[90%] border border-[#976E2A]/30">
            <Sparkles size={20} className="text-[#976E2A]" />
            <p className="text-sm font-bold uppercase tracking-wider flex-1">{feedbackMessage}</p>
            <button onClick={() => setFeedbackMessage(null)} className="opacity-40 hover:opacity-100 transition-opacity"><X size={20} /></button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Checkout;
