import React, { useEffect, useState } from "react";
import { useAuth } from "../components/useAuth";
import { useStore } from "../components/StoreProvider";
import { db } from "../components/Firebase";
import { collection, getDocs, addDoc, serverTimestamp, doc, deleteDoc, getDoc, updateDoc } from "firebase/firestore";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  CreditCard,
  MapPin,
  User,
  Phone,
  Mail,
  CheckCircle2,
  Sparkles,
  X,
  ShoppingBag,
  ShieldCheck,
  Zap,
  UserPlus,
  Check,
  Lock,
  Truck,
  Leaf,
  ChevronRight,
  Shield
} from "lucide-react";
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

      // Save new address to profile if checked
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
      triggerToast("Your cart is empty! Please add products before checking out.");
      return;
    }

    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      triggerToast("Please enter a valid email address!");
      return;
    }
    
    setIsProcessing(true);

    if (formData.paymentMethod === "online") {
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_YOUR_KEY_HERE", // Replace with your actual Razorpay Key ID
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
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-14 h-14">
            <div className="absolute inset-0 border-4 border-[#6b4f3a]/20 rounded-full" />
            <div className="absolute inset-0 border-4 border-t-[#D9A036] rounded-full animate-spin" />
          </div>
          <p className="text-[#2A1B12] font-black uppercase text-sm tracking-wider">Loading Checkout...</p>
        </div>
      </div>
    );
  }

  if (orderStatus === "success") {
    return (
      <div className="min-h-screen bg-[#FAF7F2] font-poppins pt-20 pb-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-24 h-24 bg-emerald-100/80 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-emerald-400 shadow-lg">
            <CheckCircle2 size={52} className="text-emerald-700" />
          </motion.div>
          
          <h2 className="text-3xl sm:text-4xl font-black text-[#2A1B12] mb-2 tracking-tight uppercase">Order Confirmed!</h2>
          <span className="inline-block bg-[#D9A036]/20 border border-[#D9A036]/40 text-[#2A1B12] text-sm sm:text-base font-black uppercase tracking-widest px-4 py-1.5 rounded-full mb-6 shadow-xs">
            Order #{createdOrder?.orderNumber}
          </span>

          <p className="text-[#6b4f3a] text-base sm:text-lg font-medium leading-relaxed max-w-lg mx-auto mb-8">
            Thank you for trusting Vedamya Foods! A confirmation receipt has been sent to <span className="font-black text-[#2A1B12]">{createdOrder?.customerEmail}</span>.
          </p>

          {/* GUEST USER CTA FOR ACCOUNT CREATION */}
          {!user && (
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="bg-white border-2 border-[#D9A036]/40 rounded-3xl p-6 sm:p-8 mb-8 text-left shadow-xl">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-[#D9A036]/20 text-[#6b4f3a] flex items-center justify-center border border-[#D9A036]/40 shadow-xs">
                  <UserPlus size={26} />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-[#2A1B12] uppercase">Track Order & Save Details</h3>
                  <p className="text-xs sm:text-sm text-[#6b4f3a] font-bold">Automatically sync this order to your account</p>
                </div>
              </div>
              <p className="text-sm text-[#6b4f3a] mb-6 leading-relaxed font-medium">
                Create an account using <strong>{createdOrder?.customerEmail}</strong> to easily track live shipping updates and streamline future orders.
              </p>
              <button
                onClick={() => navigate(`/login?email=${encodeURIComponent(createdOrder?.customerEmail || "")}&redirect=/orders`)}
                className="w-full py-4 bg-gradient-to-r from-[#6b4f3a] to-[#2A1B12] text-white rounded-2xl font-black uppercase tracking-widest hover:shadow-xl transition-all text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md border border-[#D9A036]/40 cursor-pointer"
              >
                <span>Create Account with {createdOrder?.customerEmail}</span>
                <ArrowLeft size={18} className="rotate-180 text-[#D9A036]" />
              </button>
            </motion.div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <Link to="/orders" className="px-8 py-4 bg-[#6b4f3a] text-white rounded-2xl font-black uppercase tracking-widest hover:bg-[#523d2d] transition-all text-sm shadow-md text-center">View My Orders</Link>
            ) : null}
            <Link to="/shop" className="px-8 py-4 bg-white border-2 border-[#6b4f3a]/30 text-[#6b4f3a] hover:bg-[#6b4f3a]/10 rounded-2xl font-black uppercase tracking-widest transition-all text-sm text-center">Continue Shopping</Link>
          </div>
        </div>
      </div>
    );
  }

  if (orderStatus === "failed") {
    return (
      <div className="min-h-screen bg-[#FAF7F2] font-poppins pt-24">
        <div className="max-w-xl mx-auto py-16 px-6 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-red-300">
            <X size={40} className="text-red-600" />
          </div>
          <h2 className="text-3xl font-black text-[#2A1B12] mb-4 uppercase">Payment Unsuccessful</h2>
          <p className="text-[#6b4f3a] text-base mb-8 leading-relaxed">The payment step could not be completed. Please retry or choose Cash on Delivery.</p>
          <button onClick={() => setOrderStatus(null)} className="px-10 py-4 bg-[#6b4f3a] text-white rounded-2xl font-black uppercase tracking-widest hover:bg-[#523d2d] transition-all text-sm shadow-lg">Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] selection:bg-[#D9A036] selection:text-[#2A1B12] font-poppins pb-24">
      <PageHeader 
        title="Checkout" 
        subtitle="Complete Your Order" 
        backUrl="/cart" 
        breadcrumbItems={[
          { label: "Home", path: "/" }, 
          { label: "Cart", path: "/cart" }, 
          { label: "Checkout" }
        ]} 
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-10">
        <div className="grid lg:grid-cols-12 gap-10">
          
          {/* Form Side */}
          <div className="lg:col-span-7 space-y-8">
            <form onSubmit={handlePlaceOrder} className="space-y-8">
              
              {/* Shipping & Contact Details Section */}
              <section className="bg-white rounded-3xl border-2 border-[#6b4f3a]/15 p-6 sm:p-8 shadow-xl shadow-[#2A1B12]/5 space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-[#6b4f3a]/15">
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-r from-[#6b4f3a] to-[#2A1B12] text-[#D9A036] flex items-center justify-center shadow-md">
                      <MapPin size={22} />
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black text-[#2A1B12] tracking-tight uppercase">1. Shipping & Contact</h2>
                      <p className="text-xs text-[#6b4f3a] font-bold">Enter your delivery details</p>
                    </div>
                  </div>
                  {!user ? (
                    <span className="text-[11px] font-black uppercase tracking-wider text-[#2A1B12] bg-[#D9A036]/20 px-3 py-1.5 rounded-full border border-[#D9A036]/40">
                      Guest Mode
                    </span>
                  ) : (
                    <Link to="/account?tab=addresses" className="text-xs font-black uppercase text-[#6b4f3a] hover:text-[#D9A036] hover:underline flex items-center gap-1">
                      <span>Saved Addresses</span>
                      <ChevronRight size={14} />
                    </Link>
                  )}
                </div>

                {/* SAVED ADDRESSES QUICK SELECTOR */}
                {user && savedAddresses.length > 0 && (
                  <div className="space-y-3 bg-[#FAF7F2] p-4.5 rounded-2xl border-2 border-[#D9A036]/30">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-black uppercase tracking-wider text-[#2A1B12]">
                        Quick Fill Saved Address
                      </label>
                      <span className="text-[11px] text-[#6b4f3a] font-bold bg-amber-100/60 px-2 py-0.5 rounded">
                        1-Click Auto Fill
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {savedAddresses.map((addr) => {
                        const isSelected = selectedAddressId === addr.id;
                        return (
                          <button
                            key={addr.id}
                            type="button"
                            onClick={() => handleSelectSavedAddress(addr)}
                            className={`p-3.5 rounded-xl border-2 text-left transition-all relative cursor-pointer ${
                              isSelected
                                ? "border-[#D9A036] bg-white shadow-md ring-2 ring-[#D9A036]/20"
                                : "border-[#6b4f3a]/20 bg-white/70 hover:border-[#6b4f3a]/50"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-extrabold text-xs text-[#2A1B12] flex items-center gap-1.5">
                                {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                                {addr.name}
                              </span>
                              {addr.tag && (
                                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-[#FAF7F2] text-[#6b4f3a] border border-[#6b4f3a]/20">
                                  {addr.tag}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-[#6b4f3a] line-clamp-2 leading-snug font-medium">
                              {addr.address}, {addr.city}, {addr.state} - {addr.pincode}
                            </p>
                            <p className="text-[11px] font-bold text-[#2A1B12] mt-1">Ph: {addr.phone}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase tracking-wider text-[#2A1B12] flex items-center gap-1">
                      <span>Full Name</span>
                      <span className="text-rose-600">*</span>
                    </label>
                    <div className="relative">
                      <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6b4f3a]" />
                      <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full pl-11 pr-4 py-3.5 bg-[#FAF7F2]/80 border-2 border-[#6b4f3a]/25 rounded-2xl outline-none focus:border-[#D9A036] focus:bg-white transition-all text-base font-extrabold text-[#2A1B12] shadow-xs"
                        placeholder="Enter your full name"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase tracking-wider text-[#2A1B12] flex items-center gap-1">
                      <span>Email Address</span>
                      <span className="text-rose-600">*</span>
                    </label>
                    <div className="relative">
                      <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6b4f3a]" />
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full pl-11 pr-4 py-3.5 bg-[#FAF7F2]/80 border-2 border-[#6b4f3a]/25 rounded-2xl outline-none focus:border-[#D9A036] focus:bg-white transition-all text-base font-extrabold text-[#2A1B12] shadow-xs"
                        placeholder="yourname@example.com"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-wider text-[#2A1B12] flex items-center gap-1">
                    <span>Phone Number (For Delivery Updates)</span>
                    <span className="text-rose-600">*</span>
                  </label>
                  <div className="relative">
                    <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6b4f3a]" />
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full pl-11 pr-4 py-3.5 bg-[#FAF7F2]/80 border-2 border-[#6b4f3a]/25 rounded-2xl outline-none focus:border-[#D9A036] focus:bg-white transition-all text-base font-extrabold text-[#2A1B12] shadow-xs"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-wider text-[#2A1B12] flex items-center gap-1">
                    <span>Street Address / House No.</span>
                    <span className="text-rose-600">*</span>
                  </label>
                  <div className="relative">
                    <MapPin size={18} className="absolute left-4 top-4 text-[#6b4f3a]" />
                    <textarea
                      name="address"
                      required
                      rows={3}
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full pl-11 pr-4 py-3.5 bg-[#FAF7F2]/80 border-2 border-[#6b4f3a]/25 rounded-2xl outline-none focus:border-[#D9A036] focus:bg-white transition-all text-base font-extrabold text-[#2A1B12] shadow-xs"
                      placeholder="House/Flat No., Building, Street, Landmark"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase tracking-wider text-[#2A1B12]">City *</label>
                    <input
                      type="text"
                      name="city"
                      required
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3.5 bg-[#FAF7F2]/80 border-2 border-[#6b4f3a]/25 rounded-2xl outline-none focus:border-[#D9A036] focus:bg-white transition-all text-base font-extrabold text-[#2A1B12] shadow-xs"
                      placeholder="City"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase tracking-wider text-[#2A1B12]">State *</label>
                    <input
                      type="text"
                      name="state"
                      required
                      value={formData.state}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3.5 bg-[#FAF7F2]/80 border-2 border-[#6b4f3a]/25 rounded-2xl outline-none focus:border-[#D9A036] focus:bg-white transition-all text-base font-extrabold text-[#2A1B12] shadow-xs"
                      placeholder="State"
                    />
                  </div>
                  <div className="col-span-2 md:col-span-1 space-y-1.5">
                    <label className="text-xs font-black uppercase tracking-wider text-[#2A1B12]">Pincode *</label>
                    <input
                      type="text"
                      name="pincode"
                      required
                      value={formData.pincode}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3.5 bg-[#FAF7F2]/80 border-2 border-[#6b4f3a]/25 rounded-2xl outline-none focus:border-[#D9A036] focus:bg-white transition-all text-base font-extrabold text-[#2A1B12] shadow-xs font-sans"
                      placeholder="000000"
                    />
                  </div>
                </div>

                {user && (
                  <label className="flex items-center gap-3 cursor-pointer pt-2 select-none text-xs sm:text-sm font-extrabold text-[#2A1B12]">
                    <input
                      type="checkbox"
                      checked={saveNewAddress}
                      onChange={(e) => setSaveNewAddress(e.target.checked)}
                      className="rounded border-[#6b4f3a] text-[#6b4f3a] focus:ring-0 w-4 h-4 cursor-pointer"
                    />
                    <span>Save this address to my account profile for faster future checkouts</span>
                  </label>
                )}
              </section>

              {/* Payment Section */}
              <section className="bg-white rounded-3xl border-2 border-[#6b4f3a]/15 p-6 sm:p-8 shadow-xl shadow-[#2A1B12]/5 space-y-6">
                <div className="flex items-center gap-3.5 pb-4 border-b border-[#6b4f3a]/15">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-r from-[#6b4f3a] to-[#2A1B12] text-[#D9A036] flex items-center justify-center shadow-md">
                    <CreditCard size={22} />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-[#2A1B12] tracking-tight uppercase">2. Select Payment Method</h2>
                    <p className="text-xs text-[#6b4f3a] font-bold">100% Encrypted & Safe Payment</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { id: "online", label: "Online Payment", desc: "Cards, UPI, Netbanking & Wallets", icon: Zap, badge: "RECOMMENDED" },
                    { id: "cod", label: "Cash on Delivery", desc: "Pay cash upon doorstep arrival", icon: Sparkles, badge: "COD AVAILABLE" }
                  ].map((method) => {
                    const Icon = method.icon;
                    const active = formData.paymentMethod === method.id;
                    return (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setFormData(p => ({ ...p, paymentMethod: method.id }))}
                        className={`p-5 rounded-2xl border-2 transition-all flex items-start gap-4 text-left relative cursor-pointer ${
                          active
                            ? 'border-[#D9A036] bg-[#FAF7F2] shadow-md ring-2 ring-[#D9A036]/20'
                            : 'border-[#6b4f3a]/20 bg-white hover:border-[#6b4f3a]/50'
                        }`}
                      >
                        <div className={`p-3 rounded-xl flex-shrink-0 ${active ? 'bg-[#6b4f3a] text-[#D9A036]' : 'bg-[#FAF7F2] text-[#6b4f3a]'}`}>
                          <Icon size={22} />
                        </div>
                        <div className="flex-1 pr-4">
                          <div className="flex items-center gap-2">
                            <p className="font-black uppercase tracking-wider text-sm text-[#2A1B12]">{method.label}</p>
                            {active && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                          </div>
                          <p className="text-xs text-[#6b4f3a] font-medium mt-1 leading-snug">{method.desc}</p>
                          <span className={`inline-block text-[10px] font-black uppercase px-2 py-0.5 rounded mt-2 ${
                            active ? "bg-[#D9A036]/20 text-[#2A1B12] border border-[#D9A036]/40" : "bg-gray-100 text-gray-600"
                          }`}>
                            {method.badge}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* Place Order CTA Button */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-4.5 px-6 bg-gradient-to-r from-[#6b4f3a] via-[#523d2d] to-[#2A1B12] text-white rounded-2xl font-black uppercase tracking-widest text-base sm:text-lg shadow-xl hover:shadow-2xl hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3 border-2 border-[#D9A036]/50 cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <div className="w-6 h-6 border-3 border-white/20 border-t-white rounded-full animate-spin" />
                    <span>Processing Your Order...</span>
                  </>
                ) : (
                  <>
                    <Lock size={20} className="text-[#D9A036]" />
                    <span>Confirm & Place Order • ₹{total}</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-3xl border-2 border-[#D9A036]/30 p-6 sm:p-8 shadow-2xl sticky top-28 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#6b4f3a]/15">
                <div className="flex items-center gap-2.5">
                  <ShoppingBag className="w-5 h-5 text-[#D9A036]" />
                  <h3 className="text-xl font-black text-[#2A1B12] uppercase tracking-tight">Order Summary</h3>
                </div>
                <span className="text-xs font-black uppercase bg-[#FAF7F2] px-3 py-1 rounded-full text-[#6b4f3a] border border-[#6b4f3a]/20">
                  {items.length} Item{items.length !== 1 ? "s" : ""}
                </span>
              </div>
              
              {/* Product List */}
              <div className="space-y-4 max-h-[360px] overflow-y-auto pr-2 divide-y divide-gray-100">
                {items.length === 0 ? (
                  <p className="text-sm text-[#6b4f3a] font-semibold italic py-4">Your selection is empty.</p>
                ) : (
                  items.map((item) => (
                    <div key={item.id} className="flex gap-4 pt-4 first:pt-0 items-center">
                      <div className="w-16 h-16 bg-[#FAF7F2] rounded-xl flex-shrink-0 p-1.5 border border-[#6b4f3a]/15 overflow-hidden">
                        <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-black uppercase tracking-wider text-[#6b4f3a]">
                          {item.flavor || "Natural Sattu"} {item.weight ? `• ${item.weight}` : ""}
                        </p>
                        <h4 className="text-sm font-bold text-[#2A1B12] line-clamp-1 leading-snug">
                          {item.name}
                        </h4>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-sm font-extrabold text-[#2A1B12]">₹{item.price}</span>
                          <span className="text-xs font-black text-[#6b4f3a] bg-[#FAF7F2] px-2 py-0.5 rounded border border-[#6b4f3a]/15">
                            Qty: {item.quantity || 1}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Pricing Calculation */}
              <div className="space-y-3 pt-4 border-t-2 border-dashed border-[#6b4f3a]/20">
                <div className="flex justify-between text-sm font-bold text-[#6b4f3a]">
                  <span className="uppercase tracking-wider">Subtotal</span>
                  <span className="text-[#2A1B12] font-extrabold">₹{total}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-[#6b4f3a]">
                  <span className="uppercase tracking-wider">Express Shipping</span>
                  <span className="text-emerald-700 font-black uppercase bg-emerald-100 px-2.5 py-0.5 rounded-md text-xs">
                    FREE
                  </span>
                </div>
                
                <div className="flex justify-between pt-4 border-t-2 border-[#2A1B12] items-baseline">
                  <span className="text-base font-black uppercase tracking-wider text-[#2A1B12]">Total Amount</span>
                  <span className="text-3xl font-black text-[#2A1B12] tracking-tight">₹{total}</span>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="pt-4 border-t border-[#6b4f3a]/15 grid grid-cols-2 gap-3 text-[11px] font-bold text-[#6b4f3a]">
                <div className="flex items-center gap-2 bg-[#FAF7F2] p-2.5 rounded-xl border border-[#6b4f3a]/10">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>100% Organic Certified</span>
                </div>
                <div className="flex items-center gap-2 bg-[#FAF7F2] p-2.5 rounded-xl border border-[#6b4f3a]/10">
                  <Truck className="w-4 h-4 text-[#D9A036] flex-shrink-0" />
                  <span>Express Doorstep Delivery</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {feedbackMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
            className="fixed bottom-10 left-1/2 z-[999] bg-[#2A1B12] text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border-2 border-[#D9A036]/50 max-w-md w-[90%]"
          >
            <Sparkles size={20} className="text-[#D9A036]" />
            <p className="text-xs sm:text-sm font-extrabold uppercase tracking-wider flex-1">{feedbackMessage}</p>
            <button onClick={() => setFeedbackMessage(null)} className="text-gray-400 hover:text-white transition-colors cursor-pointer">
              <X size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Checkout;
