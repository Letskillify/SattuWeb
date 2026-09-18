import React, { useEffect, useState } from "react";
import { useAuth } from "../components/useAuth";
import { useStore } from "../components/StoreProvider";
import { db } from "../components/Firebase";
import { collection, getDocs, addDoc, serverTimestamp, doc, deleteDoc, getDoc, updateDoc } from "firebase/firestore";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, CreditCard, MapPin, User, Phone, Mail, CheckCircle, Sparkles, X, ShoppingBag, ShieldCheck, Zap, UserPlus, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PageHeader from "../components/Sattu/PageHeader";

const Checkout = () => {
  const { user } = useAuth();
  const { clearCart: clearStoreCart } = useStore();
  const location = useLocation();
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [saveNewAddress, setSaveNewAddress] = useState(false);

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
  const [createdOrder, setCreatedOrder] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState(null);

  useEffect(() => {
    // Load Razorpay Script
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    const load = async () => {
      try {
        // Check for Buy Now item in state
        if (location.state?.buyNowItem) {
          setItems([location.state.buyNowItem]);
        } else if (user) {
          const snap = await getDocs(collection(db, "users", user.uid, "cart"));
          const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
          setItems(list);
        } else {
          const guestCart = JSON.parse(localStorage.getItem("guest_cart") || "[]");
          setItems(guestCart);
        }
        
        // Fetch saved addresses & Pre-fill default address if available
        if (user) {
          try {
            const addrSnap = await getDocs(collection(db, "users", user.uid, "addresses"));
            const addrList = addrSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
            setSavedAddresses(addrList);

            const defaultAddr = addrList.find((a) => a.isDefault) || addrList[0];
            if (defaultAddr) {
              setSelectedAddressId(defaultAddr.id);
              setFormData((prev) => ({
                ...prev,
                name: defaultAddr.name || user.displayName || "",
                email: user.email || "",
                phone: defaultAddr.phone || "",
                address: defaultAddr.address || "",
                city: defaultAddr.city || "",
                state: defaultAddr.state || "",
                pincode: defaultAddr.pincode || ""
              }));
            } else {
              setFormData((prev) => ({
                ...prev,
                name: user.displayName || prev.name || "",
                email: user.email || prev.email || ""
              }));
            }
          } catch (addrErr) {
            console.error("Error fetching saved addresses:", addrErr);
          }
        }
      } catch (error) {
        console.error("Error loading cart:", error);
      } finally {
        setLoading(false);
      }
    };
    load();

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [user, location.state]);

  const triggerToast = (msg) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectSavedAddress = (addr) => {
    setSelectedAddressId(addr.id);
    setFormData((prev) => ({
      ...prev,
      name: addr.name || prev.name,
      phone: addr.phone || prev.phone,
      address: addr.address || prev.address,
      city: addr.city || prev.city,
      state: addr.state || prev.state,
      pincode: addr.pincode || prev.pincode
    }));
  };

  const total = items.reduce((sum, i) => sum + (Number(i.price) || 0) * (i.quantity || 1), 0);

  const clearCartData = async () => {
    try {
      if (user) {
        const snap = await getDocs(collection(db, "users", user.uid, "cart"));
        const deletePromises = snap.docs.map(d => deleteDoc(doc(db, "users", user.uid, "cart", d.id)));
        await Promise.all(deletePromises);
      } else {
        localStorage.removeItem("guest_cart");
      }
      clearStoreCart();
    } catch (e) {
      console.error("Error clearing cart:", e);
    }
  };

  const deductInventory = async (orderedItems) => {
    try {
      for (const item of orderedItems) {
        const prodId = item.productId || item.id?.split('_')[0];
        if (!prodId) continue;
        const productRef = doc(db, "products", prodId);
        const productSnap = await getDoc(productRef);
        if (!productSnap.exists()) continue;

        const pData = productSnap.data();
        const orderedQty = Number(item.quantity) || 1;

        if (pData.variants && pData.variants.length > 0) {
          const updatedVariants = pData.variants.map((v) => {
            const vWeight = v.weight || pData.net_quantity || pData.weight || "";
            if (vWeight === item.weight || pData.variants.length === 1) {
              const currentStock = v.stock_count !== undefined ? Number(v.stock_count) : 50;
              const newStock = Math.max(0, currentStock - orderedQty);
              return {
                ...v,
                stock_count: newStock,
                stock_status: newStock <= 0 ? "Out of Stock" : newStock <= 5 ? "Low Stock" : "In Stock"
              };
            }
            return v;
          });

          const totalVariantStock = updatedVariants.reduce((sum, v) => sum + (Number(v.stock_count) || 0), 0);
          await updateDoc(productRef, {
            variants: updatedVariants,
            stock_count: totalVariantStock,
            stock_status: totalVariantStock <= 0 ? "Out of Stock" : totalVariantStock <= 5 ? "Low Stock" : "In Stock"
          });
        } else {
          const currentStock = pData.stock_count !== undefined ? Number(pData.stock_count) : 50;
          const newStock = Math.max(0, currentStock - orderedQty);
          await updateDoc(productRef, {
            stock_count: newStock,
            stock_status: newStock <= 0 ? "Out of Stock" : newStock <= 5 ? "Low Stock" : "In Stock"
          });
        }
      }
    } catch (err) {
      console.error("Error updating product stock after checkout:", err);
    }
  };

  const saveOrder = async (paymentId = "COD", status = "confirmed", paymentStatus = "captured") => {
    try {
      const normalizedEmail = formData.email.trim().toLowerCase();
      const orderNumber = "ORD-2026-" + Math.floor(100000 + Math.random() * 900000);

      const orderData = {
        orderNumber: orderNumber,
        userId: user ? user.uid : null,
        isGuest: !user,
        customerEmail: normalizedEmail,
        userEmail: normalizedEmail, // backward compatibility
        customerName: formData.name.trim(),
        customerPhone: formData.phone.trim(),
        items: items,
        subtotal: total,
        shippingCost: 0,
        discount: 0,
        total: total,
        paymentMethod: formData.paymentMethod,
        paymentId: paymentId,
        paymentStatus: paymentStatus,
        orderStatus: "processing",
        status: status, // backward compatibility
        shippingAddress: {
          name: formData.name.trim(),
          email: normalizedEmail,
          phone: formData.phone.trim(),
          address: formData.address.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          pincode: formData.pincode.trim(),
        },
        shipping: {
          name: formData.name.trim(),
          email: normalizedEmail,
          phone: formData.phone.trim(),
          address: formData.address.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          pincode: formData.pincode.trim(),
          paymentMethod: formData.paymentMethod,
        },
        emailStatus: {
          customer: "pending",
          admin: "pending"
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, "orders"), orderData);

      // Optionally save new address to profile if checked
      if (user && saveNewAddress) {
        try {
          await addDoc(collection(db, "users", user.uid, "addresses"), {
            name: formData.name.trim(),
            phone: formData.phone.trim(),
            address: formData.address.trim(),
            city: formData.city.trim(),
            state: formData.state.trim(),
            pincode: formData.pincode.trim(),
            tag: "Home",
            isDefault: savedAddresses.length === 0,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
        } catch (addrSaveErr) {
          console.error("Error saving address to user profile:", addrSaveErr);
        }
      }

      if (status === "confirmed") {
        await deductInventory(items);
        if (!location.state?.buyNowItem) {
          await clearCartData();
        }
        
        setCreatedOrder({
          id: docRef.id,
          orderNumber,
          customerEmail: normalizedEmail
        });

        // Trigger order confirmation email API asynchronously
        fetch("/api/send-order-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: docRef.id,
            order: {
              orderId: docRef.id,
              orderNumber,
              customerEmail: normalizedEmail,
              customerName: formData.name.trim(),
              customerPhone: formData.phone.trim(),
              items: items,
              subtotal: total,
              total: total,
              paymentMethod: formData.paymentMethod,
              shippingAddress: orderData.shippingAddress
            }
          })
        }).catch(err => console.error("Error sending order email:", err));

        setOrderStatus("success");
      } else {
        setOrderStatus("failed");
      }
    } catch (error) {
      console.error("Error saving order:", error);
      triggerToast("Store entry failed, but payment was processed. Please contact support.");
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (isProcessing) return;

    if (items.length === 0) {
      triggerToast("Your selection is empty!");
      return;
    }

    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      triggerToast("Please enter a valid email address!");
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

      try {
        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', async function (response){
          await saveOrder(response.error.metadata.payment_id, "failed", "failed");
          setIsProcessing(false);
        });
        rzp.open();
      } catch (err) {
        console.error("Razorpay error fallback:", err);
        // Fallback for dev testing if Razorpay key is invalid
        await saveOrder("ONLINE_DEMO_PAYMENT", "confirmed", "captured");
        setIsProcessing(false);
      }
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

  if (orderStatus === "success") {
    return (
      <div className="min-h-screen bg-[#FAF4E3] font-poppins">
        <div className="max-w-2xl mx-auto py-24 px-6 text-center">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-8 border border-emerald-100 shadow-sm">
            <CheckCircle size={48} className="text-emerald-600" />
          </motion.div>
          <h2 className="text-4xl font-bold text-[#6b4f3a] mb-4 tracking-tight">Order Successful ✓</h2>
          <p className="text-sm font-bold uppercase tracking-widest text-[#976E2A] mb-2">Order #{createdOrder?.orderNumber}</p>
          <p className="text-[#6b4f3a]/70 text-[16px] mb-8 leading-relaxed max-w-md mx-auto">
            Thank you for your purchase. Confirmation email has been sent to <strong>{createdOrder?.customerEmail}</strong>.
          </p>

          {/* GUEST USER CTA FOR ACCOUNT CREATION & TRACKING */}
          {!user && (
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="bg-[#FFFDF6] border-2 border-[#E3DBC5] rounded-3xl p-8 mb-10 text-left shadow-sm">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-[#FAF4E3] text-[#6b4f3a] flex items-center justify-center border border-[#E3DBC5]">
                  <UserPlus size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#6b4f3a]">Create an Account to Track Order</h3>
                  <p className="text-xs text-[#6b4f3a]/60">Link this order automatically to your profile</p>
                </div>
              </div>
              <p className="text-sm text-[#6b4f3a]/80 mb-6 leading-relaxed">
                Sign up with <strong>{createdOrder?.customerEmail}</strong> to easily view your order status, track shipments, and manage future orders in one place.
              </p>
              <button
                onClick={() => navigate(`/login?email=${encodeURIComponent(createdOrder?.customerEmail || "")}&redirect=/orders`)}
                className="w-full h-14 bg-[#6b4f3a] text-white rounded-xl font-bold uppercase tracking-widest hover:bg-[#976E2A] transition-all text-[13px] flex items-center justify-center gap-2 shadow-md"
              >
                <span>Create Account with {createdOrder?.customerEmail}</span>
                <ArrowLeft size={16} className="rotate-180" />
              </button>
            </motion.div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <Link to="/orders" className="px-10 py-4 bg-[#6b4f3a] text-white rounded-xl font-bold uppercase tracking-widest hover:bg-[#976E2A] transition-all text-[14px]">View My Orders</Link>
            ) : null}
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
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#6b4f3a] text-white flex items-center justify-center shadow-lg"><MapPin size={20} /></div>
                    <h2 className="text-2xl font-bold text-[#6b4f3a] tracking-tight">Shipping Details</h2>
                  </div>
                  {!user ? (
                    <span className="text-xs font-bold text-[#976E2A] bg-[#FFFDF6] px-3 py-1.5 rounded-full border border-[#E3DBC5]">
                      Guest Checkout Mode
                    </span>
                  ) : (
                    <Link to="/account?tab=addresses" className="text-xs font-bold text-[#976E2A] hover:underline">
                      Manage Account Addresses →
                    </Link>
                  )}
                </div>

                {/* SAVED ADDRESSES QUICK SELECTOR */}
                {user && savedAddresses.length > 0 && (
                  <div className="space-y-3 bg-[#FFFDF6] p-5 rounded-2xl border border-[#E3DBC5] shadow-xs">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold uppercase tracking-widest text-[#976E2A]">Select Saved Shipping Address</label>
                      <span className="text-[11px] text-gray-500 font-medium">1-Click Auto Fill</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {savedAddresses.map((addr) => {
                        const isSelected = selectedAddressId === addr.id;
                        return (
                          <button
                            key={addr.id}
                            type="button"
                            onClick={() => handleSelectSavedAddress(addr)}
                            className={`p-4 rounded-xl border-2 text-left transition-all relative ${
                              isSelected ? "border-[#6b4f3a] bg-white shadow-xs" : "border-[#E3DBC5]/60 bg-white/60 hover:border-[#6b4f3a]/40"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-xs text-[#6b4f3a]">{addr.name}</span>
                              {addr.tag && (
                                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-[#FAF4E3] text-[#976E2A]">
                                  {addr.tag}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-[#6b4f3a]/80 line-clamp-2 leading-relaxed">
                              {addr.address}, {addr.city}, {addr.state} - {addr.pincode}
                            </p>
                            <p className="text-[11px] font-semibold text-[#976E2A] mt-1">Phone: {addr.phone}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[12px] font-bold uppercase tracking-widest text-[#976E2A] ml-1">Full Name</label>
                    <div className="relative">
                      <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#976E2A]/40" />
                      <input type="text" name="name" required value={formData.name} onChange={handleInputChange} className="w-full pl-11 pr-5 py-4 bg-white border border-[#E3DBC5] rounded-xl outline-none focus:border-[#6b4f3a] transition-all text-[15px] text-[#6b4f3a]" placeholder="Enter your full name" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[12px] font-bold uppercase tracking-widest text-[#976E2A] ml-1">Email Address (For Order Updates)</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#976E2A]/40" />
                      <input type="email" name="email" required value={formData.email} onChange={handleInputChange} className="w-full pl-11 pr-5 py-4 bg-white border border-[#E3DBC5] rounded-xl outline-none focus:border-[#6b4f3a] transition-all text-[15px] text-[#6b4f3a]" placeholder="email@example.com" />
                    </div>
                  </div>
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
                    <textarea name="address" required rows={3} value={formData.address} onChange={handleInputChange} className="w-full pl-11 pr-5 py-4 bg-white border border-[#E3DBC5] rounded-xl outline-none focus:border-[#6b4f3a] transition-all text-[15px] text-[#6b4f3a]" placeholder="House/Flat No., Building Name, Street, Landmark" />
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

                {user && (
                  <label className="flex items-center gap-2.5 cursor-pointer pt-2 select-none text-xs font-bold text-[#6b4f3a]">
                    <input
                      type="checkbox"
                      checked={saveNewAddress}
                      onChange={(e) => setSaveNewAddress(e.target.checked)}
                      className="rounded text-[#6b4f3a] focus:ring-0 w-4 h-4"
                    />
                    <span>Save this complete address to my account profile for future orders</span>
                  </label>
                )}
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
                        <div className={`p-3 rounded-xl ${active ? 'bg-[#6b4f3a] text-[#FAF4E3]' : 'bg-[#FAF4E3] text-[#976E2A]'}`}><Icon size={20} /></div>
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
                {isProcessing ? <><div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> Processing Order...</> : <>Place Order</>}
              </button>
            </form>
          </div>

          {/* Summary Side */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-3xl border border-[#E3DBC5] p-8 shadow-sm sticky top-32">
              <h3 className="text-xl font-bold text-[#6b4f3a] mb-8 tracking-tight">Order Summary</h3>
              
              <div className="space-y-6 mb-8 max-h-[350px] overflow-auto pr-2">
                {items.length === 0 ? (
                  <p className="text-sm text-[#6b4f3a]/60 italic py-4">Your selection is empty.</p>
                ) : (
                  items.map((item) => (
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
                  ))
                )}
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
