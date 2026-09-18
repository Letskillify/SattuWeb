import React, { useState, useEffect } from "react";
import { useAuth } from "../components/useAuth";
import { db } from "../components/Firebase";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp
} from "firebase/firestore";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import {
  User,
  Package,
  Heart,
  LogOut,
  ChevronRight,
  Settings,
  ShoppingBag,
  MapPin,
  Award,
  Edit2,
  Trash2,
  Plus,
  Check,
  CheckCircle2,
  Clock,
  Truck,
  AlertTriangle,
  X,
  Sparkles,
  ShieldAlert,
  KeyRound,
  Phone,
  Mail,
  Home,
  Briefcase,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PageHeader from "../components/Sattu/PageHeader";

const TRACKING_STAGES = [
  { id: "placed", label: "Order Placed" },
  { id: "processing", label: "Processing" },
  { id: "packed", label: "Packed" },
  { id: "shipped", label: "Shipped" },
  { id: "delivered", label: "Delivered" },
];

const getStageIndex = (status) => {
  const s = (status || "").toLowerCase();
  if (s === "delivered" || s === "completed") return 4;
  if (s === "shipped" || s === "out for delivery") return 3;
  if (s === "packed") return 2;
  if (s === "processing" || s === "confirmed") return 1;
  return 0;
};

const Account = () => {
  const { user, logout, updateUserPassword, updateUserProfile, deleteUserAccount } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "profile";

  const [activeTab, setActiveTab] = useState(initialTab);
  const [userData, setUserData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [stats, setStats] = useState({ cart: 0, wishlist: 0 });
  const [loading, setLoading] = useState(true);

  // Profile Edit State
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Address State & Modal
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressForm, setAddressForm] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    tag: "Home",
    isDefault: false
  });
  const [isSavingAddress, setIsSavingAddress] = useState(false);

  // Delete Account Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  // Password State
  const [newPassword, setNewPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Toast / Feedback State
  const [feedbackMessage, setFeedbackMessage] = useState(null);

  // Expandable Order State
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  const triggerToast = (msg) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        // 1. Fetch User Profile
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const d = userSnap.data();
          setUserData(d);
          setDisplayName(d.displayName || user.displayName || "");
          setPhone(d.phone || "");
        } else {
          setDisplayName(user.displayName || "");
        }

        // 2. Fetch Saved Addresses
        const addrSnap = await getDocs(collection(db, "users", user.uid, "addresses"));
        const addrList = addrSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAddresses(addrList);

        // 3. Fetch Cart & Wishlist Count
        const cartSnap = await getDocs(collection(db, "users", user.uid, "cart"));
        const wishlistSnap = await getDocs(collection(db, "users", user.uid, "wishlist"));
        setStats({
          cart: cartSnap.size,
          wishlist: wishlistSnap.size
        });

        // 4. Fetch User Orders
        const ordersRef = collection(db, "orders");
        const ordersQuery = query(ordersRef, where("userId", "==", user.uid));
        const ordersSnap = await getDocs(ordersQuery);
        const ordersList = ordersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        ordersList.sort((a, b) => {
          const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0);
          const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0);
          return timeB - timeA;
        });

        setOrders(ordersList);
      } catch (error) {
        console.error("Error fetching account data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, navigate]);

  // Keep tab URL param in sync
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };

  // --- PROFILE UPDATE HANDLER ---
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!displayName.trim()) {
      triggerToast("Name cannot be empty!");
      return;
    }

    setIsSavingProfile(true);
    try {
      await updateUserProfile(displayName.trim());

      // Update phone in Firestore doc
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        phone: phone.trim(),
        updatedAt: serverTimestamp()
      });

      setUserData(prev => ({ ...prev, displayName: displayName.trim(), phone: phone.trim() }));
      triggerToast("Profile updated successfully!");
    } catch (err) {
      console.error("Error updating profile:", err);
      triggerToast(err.message || "Failed to update profile.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  // --- PASSWORD UPDATE HANDLER ---
  const handleSetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 8) {
      triggerToast("Password must be at least 8 characters long.");
      return;
    }

    setPasswordLoading(true);
    try {
      await updateUserPassword(newPassword);
      setUserData(prev => ({ ...prev, hasPassword: true }));
      setNewPassword("");
      triggerToast("Password updated successfully!");
    } catch (err) {
      console.error("Error setting password:", err);
      triggerToast(err.message || "Failed to set password.");
    } finally {
      setPasswordLoading(false);
    }
  };

  // --- ADDRESS HANDLERS ---
  const openAddAddressModal = () => {
    setEditingAddress(null);
    setAddressForm({
      name: userData?.displayName || user?.displayName || "",
      phone: userData?.phone || "",
      address: "",
      city: "",
      state: "",
      pincode: "",
      tag: "Home",
      isDefault: addresses.length === 0
    });
    setShowAddressModal(true);
  };

  const openEditAddressModal = (addr) => {
    setEditingAddress(addr);
    setAddressForm({
      name: addr.name || "",
      phone: addr.phone || "",
      address: addr.address || "",
      city: addr.city || "",
      state: addr.state || "",
      pincode: addr.pincode || "",
      tag: addr.tag || "Home",
      isDefault: addr.isDefault || false
    });
    setShowAddressModal(true);
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    if (!addressForm.name || !addressForm.phone || !addressForm.address || !addressForm.city || !addressForm.state || !addressForm.pincode) {
      triggerToast("Please fill in all complete address details.");
      return;
    }

    setIsSavingAddress(true);
    try {
      const addressesRef = collection(db, "users", user.uid, "addresses");

      // If set as default, reset other addresses' default status
      if (addressForm.isDefault) {
        const snap = await getDocs(addressesRef);
        for (const d of snap.docs) {
          if (d.id !== editingAddress?.id) {
            await updateDoc(doc(db, "users", user.uid, "addresses", d.id), { isDefault: false });
          }
        }
      }

      if (editingAddress) {
        const addrRef = doc(db, "users", user.uid, "addresses", editingAddress.id);
        await updateDoc(addrRef, {
          ...addressForm,
          updatedAt: serverTimestamp()
        });
        setAddresses(prev => prev.map(a => a.id === editingAddress.id ? { ...a, ...addressForm } : (addressForm.isDefault ? { ...a, isDefault: false } : a)));
        triggerToast("Address updated successfully!");
      } else {
        const docRef = await addDoc(addressesRef, {
          ...addressForm,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        const newAddr = { id: docRef.id, ...addressForm };
        setAddresses(prev => addressForm.isDefault ? prev.map(a => ({ ...a, isDefault: false })).concat(newAddr) : [...prev, newAddr]);
        triggerToast("New address added successfully!");
      }

      setShowAddressModal(false);
    } catch (err) {
      console.error("Error saving address:", err);
      triggerToast("Failed to save address. Please try again.");
    } finally {
      setIsSavingAddress(false);
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      await deleteDoc(doc(db, "users", user.uid, "addresses", id));
      setAddresses(prev => prev.filter(a => a.id !== id));
      triggerToast("Address removed.");
    } catch (err) {
      console.error("Error deleting address:", err);
      triggerToast("Failed to delete address.");
    }
  };

  const handleSetDefaultAddress = async (id) => {
    try {
      const snap = await getDocs(collection(db, "users", user.uid, "addresses"));
      for (const d of snap.docs) {
        await updateDoc(doc(db, "users", user.uid, "addresses", d.id), {
          isDefault: d.id === id
        });
      }
      setAddresses(prev => prev.map(a => ({ ...a, isDefault: a.id === id })));
      triggerToast("Default address updated!");
    } catch (err) {
      console.error("Error setting default address:", err);
      triggerToast("Failed to update default address.");
    }
  };

  // --- DELETE ACCOUNT HANDLER ---
  const handleDeleteAccount = async () => {
    if (deleteConfirmText.trim().toUpperCase() !== "DELETE") {
      triggerToast("Please type 'DELETE' to confirm account deletion.");
      return;
    }

    setIsDeletingAccount(true);
    try {
      await deleteUserAccount();
      triggerToast("Your account has been deleted permanently.");
      navigate("/");
    } catch (err) {
      console.error("Error deleting account:", err);
      if (err.code === "auth/requires-recent-login") {
        triggerToast("For security reasons, please log out and log in again before deleting your account.");
      } else {
        triggerToast(err.message || "Failed to delete account. Contact support.");
      }
    } finally {
      setIsDeletingAccount(false);
      setShowDeleteModal(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF4E3] flex items-center justify-center">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 border-2 border-[#6b4f3a]/10 rounded-full" />
          <div className="absolute inset-0 border-2 border-t-[#6b4f3a] rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF4E3] text-[#1C2B21] selection:bg-[#6b4f3a] selection:text-white font-poppins">
      <PageHeader
        title="My Account"
        subtitle="Manage Profile, Complete Addresses & Track Orders"
        breadcrumbItems={[
          { label: "Home", path: "/" },
          { label: "Account" }
        ]}
      />

      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 md:px-12 py-12">

        {/* HERO PROFILE HEADER */}
        <div className="bg-[#6b4f3a] rounded-3xl p-6 sm:p-10 md:p-12 mb-12 relative overflow-hidden shadow-xl text-white">
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px]" />
          <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-[#D9A036]/15 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
              <div className="relative">
                <div className="w-24 h-24 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center overflow-hidden p-1 shadow-inner">
                  {user?.photoURL ? (
                    <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <User size={42} strokeWidth={1.2} className="text-[#FFFDF6]/80" />
                  )}
                </div>
                <div className="absolute -bottom-1.5 -right-1.5 w-8 h-8 bg-[#976E2A] rounded-xl flex items-center justify-center text-white border-2 border-[#6b4f3a] shadow-md">
                  <Award size={15} strokeWidth={1.5} />
                </div>
              </div>

              <div className="space-y-1.5">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[#FFFDF6]">
                  {userData?.displayName || user?.displayName || "Member"}
                </h1>
                <p className="text-sm sm:text-base text-[#FFFDF6]/80 font-medium">{user?.email}</p>
                <div className="flex flex-wrap justify-center sm:justify-start gap-2 pt-1">
                  <span className="px-3 py-1 rounded-lg bg-white/10 border border-white/15 text-[#FFFDF6] text-[11px] font-bold uppercase tracking-widest">
                    Verified Customer
                  </span>
                  <span className="px-3 py-1 rounded-lg bg-[#D9A036] text-[#6b4f3a] text-[11px] font-extrabold uppercase tracking-widest">
                    2,450 Rewards Points
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleLogout}
                className="h-11 px-6 rounded-xl bg-[#FFFDF6] text-[#6b4f3a] font-bold text-xs uppercase tracking-[0.15em] hover:bg-red-50 hover:text-red-600 transition-all duration-300 flex items-center gap-2 shadow-sm"
              >
                <LogOut size={14} strokeWidth={1.8} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>

        {/* QUICK STATS STRIP */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <button
            onClick={() => handleTabChange("orders")}
            className="bg-white p-5 rounded-2xl border border-[#E3DBC5] hover:border-[#6b4f3a] transition-all shadow-xs flex items-center gap-4 text-left group"
          >
            <div className="w-12 h-12 rounded-xl bg-[#FAF4E3] flex items-center justify-center text-[#6b4f3a] group-hover:bg-[#6b4f3a] group-hover:text-white transition-all shrink-0">
              <Package size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#6b4f3a] font-sans">{orders.length}</p>
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#976E2A]">Total Orders</p>
            </div>
          </button>

          <button
            onClick={() => handleTabChange("addresses")}
            className="bg-white p-5 rounded-2xl border border-[#E3DBC5] hover:border-[#6b4f3a] transition-all shadow-xs flex items-center gap-4 text-left group"
          >
            <div className="w-12 h-12 rounded-xl bg-[#FAF4E3] flex items-center justify-center text-[#6b4f3a] group-hover:bg-[#6b4f3a] group-hover:text-white transition-all shrink-0">
              <MapPin size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#6b4f3a] font-sans">{addresses.length}</p>
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#976E2A]">Saved Addresses</p>
            </div>
          </button>

          <Link
            to="/cart"
            className="bg-white p-5 rounded-2xl border border-[#E3DBC5] hover:border-[#6b4f3a] transition-all shadow-xs flex items-center gap-4 text-left group"
          >
            <div className="w-12 h-12 rounded-xl bg-[#FAF4E3] flex items-center justify-center text-[#6b4f3a] group-hover:bg-[#6b4f3a] group-hover:text-white transition-all shrink-0">
              <ShoppingBag size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#6b4f3a] font-sans">{stats.cart}</p>
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#976E2A]">Items in Cart</p>
            </div>
          </Link>

          <Link
            to="/wishlist"
            className="bg-white p-5 rounded-2xl border border-[#E3DBC5] hover:border-[#6b4f3a] transition-all shadow-xs flex items-center gap-4 text-left group"
          >
            <div className="w-12 h-12 rounded-xl bg-[#FAF4E3] flex items-center justify-center text-[#6b4f3a] group-hover:bg-[#6b4f3a] group-hover:text-white transition-all shrink-0">
              <Heart size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#6b4f3a] font-sans">{stats.wishlist}</p>
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#976E2A]">Wishlist Items</p>
            </div>
          </Link>
        </div>

        {/* MAIN NAVIGATION TAB STRIP */}
        <div className="flex border-b border-[#E3DBC5] mb-10 overflow-x-auto scrollbar-none">
          {[
            { id: "profile", label: "Profile & Info", icon: User },
            { id: "addresses", label: "Saved Addresses", icon: MapPin },
            { id: "orders", label: "Order History & Tracking", icon: Package },
            { id: "security", label: "Security & Account", icon: ShieldAlert },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`px-6 py-4 text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2.5 border-b-2 whitespace-nowrap ${
                  active
                    ? "border-[#6b4f3a] text-[#6b4f3a] bg-[#FFFDF6] rounded-t-xl"
                    : "border-transparent text-[#6b4f3a]/60 hover:text-[#6b4f3a]"
                }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB PANELS */}
        <div className="space-y-10">

          {/* TAB 1: PROFILE & PERSONAL INFO */}
          {activeTab === "profile" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid lg:grid-cols-12 gap-10">
              <div className="lg:col-span-7 bg-white rounded-3xl border border-[#E3DBC5] p-8 shadow-sm space-y-6">
                <div className="border-b border-[#E3DBC5] pb-4">
                  <h3 className="text-xl font-bold text-[#6b4f3a]">Personal Information</h3>
                  <p className="text-xs text-[#6b4f3a]/60 font-medium">Update your name, contact phone, and details.</p>
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-[#976E2A]">Full Display Name</label>
                    <div className="relative">
                      <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#976E2A]/50" />
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        required
                        className="w-full pl-11 pr-4 py-3.5 bg-[#FFFDF6] border border-[#E3DBC5] rounded-xl outline-none focus:border-[#6b4f3a] text-sm text-[#6b4f3a] font-medium"
                        placeholder="Enter your name"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-[#976E2A]">Email Address (Account ID)</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#976E2A]/50" />
                      <input
                        type="email"
                        value={user?.email || ""}
                        disabled
                        className="w-full pl-11 pr-4 py-3.5 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-500 font-medium cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-[#976E2A]">Mobile Phone Number</label>
                    <div className="relative">
                      <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#976E2A]/50" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full pl-11 pr-4 py-3.5 bg-[#FFFDF6] border border-[#E3DBC5] rounded-xl outline-none focus:border-[#6b4f3a] text-sm text-[#6b4f3a] font-medium"
                        placeholder="+91 00000 00000"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    className="h-12 px-8 bg-[#6b4f3a] text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-[#976E2A] transition-all disabled:opacity-50 flex items-center gap-2 shadow-sm"
                  >
                    {isSavingProfile ? "Saving Changes..." : "Save Profile"}
                  </button>
                </form>
              </div>

              <div className="lg:col-span-5 space-y-6">
                <div className="bg-[#FFFDF6] rounded-3xl border border-[#E3DBC5] p-8 space-y-4 shadow-sm">
                  <div className="w-12 h-12 rounded-2xl bg-[#FAF4E3] border border-[#E3DBC5] flex items-center justify-center text-[#976E2A]">
                    <Sparkles size={24} />
                  </div>
                  <h4 className="text-lg font-bold text-[#6b4f3a]">Vedamya Loyalty Club</h4>
                  <p className="text-xs text-[#6b4f3a]/70 leading-relaxed">
                    Earn 10 rewards points for every ₹100 spent on our organic heritage blends. Redeem points at checkout for discount vouchers!
                  </p>
                  <div className="pt-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#976E2A] bg-[#976E2A]/10 px-3 py-1.5 rounded-lg border border-[#976E2A]/20">
                      Tier Status: Gold Member
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: ADDRESS BOOK (COMPLETE ADDRESS MANAGEMENT) */}
          {activeTab === "addresses" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-bold text-[#6b4f3a]">My Saved Addresses</h3>
                  <p className="text-xs text-[#6b4f3a]/60 font-medium">Add and manage complete shipping addresses for quick 1-click checkout.</p>
                </div>
                <button
                  onClick={openAddAddressModal}
                  className="h-12 px-6 bg-[#6b4f3a] text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-[#976E2A] transition-all flex items-center gap-2 shadow-sm shrink-0"
                >
                  <Plus size={16} />
                  <span>Add New Address</span>
                </button>
              </div>

              {addresses.length === 0 ? (
                <div className="bg-white rounded-3xl border-2 border-dashed border-[#E3DBC5] p-16 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-[#FAF4E3] border border-[#E3DBC5] flex items-center justify-center text-[#976E2A] mx-auto">
                    <MapPin size={24} />
                  </div>
                  <h4 className="text-xl font-bold text-[#6b4f3a]">No saved addresses yet</h4>
                  <p className="text-xs text-[#6b4f3a]/60 max-w-xs mx-auto">
                    Add a complete shipping address now to auto-fill details during your next checkout.
                  </p>
                  <button
                    onClick={openAddAddressModal}
                    className="inline-flex h-11 px-6 bg-[#6b4f3a] text-white items-center rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-[#976E2A] transition-all"
                  >
                    Add Complete Address
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className={`bg-white rounded-3xl border-2 p-6 transition-all relative flex flex-col justify-between shadow-sm ${
                        addr.isDefault ? "border-[#6b4f3a] bg-[#FFFBF0]" : "border-[#E3DBC5]"
                      }`}
                    >
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="px-3 py-1 rounded-md bg-[#FAF4E3] border border-[#E3DBC5] text-[#6b4f3a] text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                              {addr.tag === "Work" ? <Briefcase size={12} /> : <Home size={12} />}
                              {addr.tag || "Home"}
                            </span>
                            {addr.isDefault && (
                              <span className="px-3 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold uppercase tracking-wider">
                                Default
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openEditAddressModal(addr)}
                              className="p-2 text-gray-400 hover:text-[#6b4f3a] transition-colors"
                              title="Edit Address"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteAddress(addr.id)}
                              className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                              title="Delete Address"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-base font-bold text-[#6b4f3a]">{addr.name}</h4>
                          <p className="text-xs font-semibold text-[#976E2A] mt-0.5">Phone: {addr.phone}</p>
                          <p className="text-sm text-[#6b4f3a]/80 mt-2 leading-relaxed">
                            {addr.address}<br />
                            {addr.city}, {addr.state} - <strong className="font-sans text-xs">{addr.pincode}</strong>
                          </p>
                        </div>
                      </div>

                      <div className="pt-6 border-t border-[#E3DBC5]/50 mt-6 flex justify-between items-center">
                        {!addr.isDefault ? (
                          <button
                            onClick={() => handleSetDefaultAddress(addr.id)}
                            className="text-xs font-bold uppercase tracking-wider text-[#976E2A] hover:underline"
                          >
                            Set as Default Address
                          </button>
                        ) : (
                          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1">
                            <Check size={14} /> Default Shipping Address
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 3: ORDER HISTORY & TRACKING */}
          {activeTab === "orders" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
              <div>
                <h3 className="text-2xl font-bold text-[#6b4f3a]">Order History & Real-Time Tracking</h3>
                <p className="text-xs text-[#6b4f3a]/60 font-medium">Track package status from dispatch to delivery.</p>
              </div>

              {orders.length === 0 ? (
                <div className="bg-white rounded-3xl border-2 border-dashed border-[#E3DBC5] p-16 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-[#FAF4E3] border border-[#E3DBC5] flex items-center justify-center text-[#976E2A] mx-auto">
                    <ShoppingBag size={24} />
                  </div>
                  <h4 className="text-xl font-bold text-[#6b4f3a]">No orders placed yet</h4>
                  <p className="text-xs text-[#6b4f3a]/60 max-w-xs mx-auto">
                    Explore our natural sattu blends and organic staples today.
                  </p>
                  <Link
                    to="/shop"
                    className="inline-flex h-11 px-6 bg-[#6b4f3a] text-white items-center rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-[#976E2A] transition-all"
                  >
                    Browse Shop
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {orders.map((order) => {
                    const orderNum = order.orderNumber || `#${order.id.slice(0, 10).toUpperCase()}`;
                    const isExpanded = expandedOrderId === order.id;
                    const currentStageIdx = getStageIndex(order.orderStatus || order.status);
                    const isFailed = (order.status === "failed" || order.orderStatus === "failed");

                    return (
                      <div key={order.id} className="bg-white rounded-3xl border border-[#E3DBC5] overflow-hidden shadow-sm">
                        <div className="p-6 md:p-8">
                          
                          {/* Top Header */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-[#E3DBC5]">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-xl bg-[#FAF4E3] text-[#6b4f3a] flex items-center justify-center shrink-0">
                                <Package size={20} />
                              </div>
                              <div>
                                <span className="text-xs font-bold uppercase tracking-wider text-[#976E2A]">Order Number</span>
                                <p className="text-base font-bold text-[#6b4f3a]">{orderNum}</p>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-4">
                              <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-[#976E2A]">Ordered Date</p>
                                <p className="text-sm font-semibold text-[#6b4f3a]">
                                  {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "Recently"}
                                </p>
                              </div>

                              <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 border ${
                                isFailed
                                  ? "bg-red-50 text-red-700 border-red-200"
                                  : currentStageIdx >= 4
                                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                  : "bg-amber-50 text-amber-800 border-amber-200"
                              }`}>
                                {isFailed ? <AlertTriangle size={14} /> : currentStageIdx >= 4 ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                                {isFailed ? "Failed" : (order.orderStatus || order.status || "Processing")}
                              </span>
                            </div>
                          </div>

                          {/* Progress Stepper */}
                          {!isFailed && (
                            <div className="mb-8 p-6 bg-[#FAF4E3]/50 border border-[#E3DBC5]/60 rounded-2xl space-y-4">
                              <div className="flex justify-between items-center">
                                <span className="text-xs font-bold uppercase tracking-widest text-[#976E2A] flex items-center gap-2">
                                  <Truck size={16} /> Live Shipment Tracking
                                </span>
                                <span className="text-xs font-bold text-[#6b4f3a]">
                                  Status: {TRACKING_STAGES[currentStageIdx]?.label}
                                </span>
                              </div>

                              <div className="relative flex items-center justify-between">
                                <div className="absolute top-1/2 left-0 right-0 h-1 bg-[#E3DBC5] -translate-y-1/2 z-0" />
                                <div
                                  className="absolute top-1/2 left-0 h-1 bg-[#6b4f3a] -translate-y-1/2 z-0 transition-all duration-500"
                                  style={{ width: `${(currentStageIdx / (TRACKING_STAGES.length - 1)) * 100}%` }}
                                />

                                {TRACKING_STAGES.map((stage, idx) => {
                                  const isCompleted = idx <= currentStageIdx;
                                  return (
                                    <div key={stage.id} className="relative z-10 flex flex-col items-center">
                                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                        isCompleted ? "bg-[#6b4f3a] text-white ring-4 ring-[#FAF4E3]" : "bg-[#E3DBC5] text-[#6b4f3a]/50"
                                      }`}>
                                        {isCompleted ? <Check size={14} /> : idx + 1}
                                      </div>
                                      <span className={`text-[10px] font-bold uppercase tracking-wider mt-2 hidden sm:block ${
                                        isCompleted ? "text-[#6b4f3a]" : "text-[#6b4f3a]/40"
                                      }`}>
                                        {stage.label}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* Line Items */}
                          <div className="space-y-3 mb-6">
                            {order.items?.map((item, idx) => (
                              <div key={idx} className="flex items-center gap-4 py-2 border-b border-gray-100 last:border-none">
                                <div className="w-14 h-14 bg-[#FAF4E3]/60 rounded-lg p-2 border border-[#E3DBC5]/40 shrink-0">
                                  <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                                </div>
                                <div className="flex-1">
                                  <h4 className="text-sm font-bold text-[#6b4f3a]">{item.name}</h4>
                                  <p className="text-xs text-[#6b4f3a]/60">
                                    Qty: {item.quantity || 1} • {item.flavor || "Classic"} {item.weight ? `(${item.weight})` : ""}
                                  </p>
                                </div>
                                <p className="text-sm font-bold text-[#6b4f3a] font-sans">
                                  ₹{(Number(item.price) || 0) * (Number(item.quantity) || 1)}
                                </p>
                              </div>
                            ))}
                          </div>

                          {/* Expandable Order Drawer */}
                          {isExpanded && (
                            <div className="mt-6 pt-6 border-t border-[#E3DBC5] bg-[#FFFDF6] p-6 rounded-2xl border space-y-4">
                              <h4 className="text-xs font-bold uppercase tracking-widest text-[#976E2A]">Detailed Shipping & Payment Breakdown</h4>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                                <div>
                                  <p className="font-bold text-[#6b4f3a] mb-1">Shipping Address:</p>
                                  <p className="text-[#6b4f3a]/80 leading-relaxed">
                                    {order.customerName || order.shippingAddress?.name}<br />
                                    {order.shippingAddress?.address}<br />
                                    {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}<br />
                                    Phone: {order.customerPhone || order.shippingAddress?.phone}
                                  </p>
                                </div>
                                <div>
                                  <p className="font-bold text-[#6b4f3a] mb-1">Payment Summary:</p>
                                  <p className="text-[#6b4f3a]/80 leading-relaxed">
                                    Payment Method: <strong className="uppercase">{order.paymentMethod || "COD"}</strong><br />
                                    Payment Status: <strong className="capitalize">{order.paymentStatus || "pending"}</strong><br />
                                    Subtotal: ₹{order.subtotal || order.total}<br />
                                    Shipping: Free
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Order Footer */}
                          <div className="flex items-center justify-between pt-6 border-t border-[#E3DBC5]">
                            <div>
                              <span className="text-xs font-bold uppercase tracking-wider text-[#976E2A]">Total Paid</span>
                              <p className="text-2xl font-bold text-[#6b4f3a] font-sans">₹{order.total}</p>
                            </div>

                            <button
                              onClick={() => setExpandedOrderId(prev => prev === order.id ? null : order.id)}
                              className="text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl bg-[#FAF4E3] border border-[#E3DBC5] text-[#6b4f3a] hover:bg-[#6b4f3a] hover:text-white transition-all flex items-center gap-1.5"
                            >
                              <span>{isExpanded ? "Hide Details" : "Track & Details"}</span>
                              {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </button>
                          </div>

                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 4: SECURITY & DANGER ZONE (DELETE ACCOUNT) */}
          {activeTab === "security" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid lg:grid-cols-12 gap-10">
              
              {/* Password Section */}
              <div className="lg:col-span-6 bg-white rounded-3xl border border-[#E3DBC5] p-8 shadow-sm space-y-6">
                <div className="border-b border-[#E3DBC5] pb-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FAF4E3] text-[#6b4f3a] flex items-center justify-center">
                    <KeyRound size={20} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#6b4f3a]">Account Password</h3>
                    <p className="text-xs text-[#6b4f3a]/60">Change or set your login password.</p>
                  </div>
                </div>

                <form onSubmit={handleSetPassword} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-[#976E2A]">New Password (min 8 chars)</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      className="w-full px-4 py-3 bg-[#FFFDF6] border border-[#E3DBC5] rounded-xl outline-none focus:border-[#6b4f3a] text-sm text-[#6b4f3a]"
                      placeholder="Enter new password"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="h-12 px-6 bg-[#6b4f3a] text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-[#976E2A] transition-all disabled:opacity-50"
                  >
                    {passwordLoading ? "Updating..." : "Update Password"}
                  </button>
                </form>
              </div>

              {/* Danger Zone: Delete Account */}
              <div className="lg:col-span-6 bg-red-50/50 rounded-3xl border-2 border-red-200 p-8 shadow-sm space-y-6">
                <div className="border-b border-red-200 pb-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
                    <AlertTriangle size={20} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-red-900">Danger Zone</h3>
                    <p className="text-xs text-red-700 font-medium">Permanent account removal.</p>
                  </div>
                </div>

                <p className="text-xs text-red-800 leading-relaxed">
                  Once you delete your account, your profile, order history, and saved shipping addresses will be erased permanently and cannot be recovered.
                </p>

                <button
                  onClick={() => {
                    setDeleteConfirmText("");
                    setShowDeleteModal(true);
                  }}
                  className="h-12 px-6 bg-red-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-red-700 transition-all shadow-sm flex items-center gap-2"
                >
                  <Trash2 size={16} />
                  <span>Delete My Account</span>
                </button>
              </div>

            </motion.div>
          )}

        </div>
      </div>

      {/* --- ADD / EDIT COMPLETE ADDRESS MODAL --- */}
      <AnimatePresence>
        {showAddressModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#FFFDF6] rounded-3xl border-2 border-[#E3DBC5] shadow-2xl max-w-lg w-full p-8 relative my-8"
            >
              <button
                onClick={() => setShowAddressModal(false)}
                className="absolute top-6 right-6 p-2 text-gray-400 hover:text-black transition-colors"
              >
                <X size={20} />
              </button>

              <h3 className="text-2xl font-bold text-[#6b4f3a] mb-2">
                {editingAddress ? "Edit Complete Address" : "Add Complete Address"}
              </h3>
              <p className="text-xs text-[#6b4f3a]/60 mb-6">
                This complete address can be selected for 1-click checkout.
              </p>

              <form onSubmit={handleSaveAddress} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#976E2A]">Receiver Name</label>
                    <input
                      type="text"
                      required
                      value={addressForm.name}
                      onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                      className="w-full px-3 py-2.5 bg-white border border-[#E3DBC5] rounded-xl outline-none focus:border-[#6b4f3a] text-xs text-[#6b4f3a]"
                      placeholder="Full Name"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#976E2A]">Contact Phone</label>
                    <input
                      type="tel"
                      required
                      value={addressForm.phone}
                      onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                      className="w-full px-3 py-2.5 bg-white border border-[#E3DBC5] rounded-xl outline-none focus:border-[#6b4f3a] text-xs text-[#6b4f3a]"
                      placeholder="+91 00000 00000"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#976E2A]">Full Street Address</label>
                  <textarea
                    required
                    rows={3}
                    value={addressForm.address}
                    onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })}
                    className="w-full px-3 py-2.5 bg-white border border-[#E3DBC5] rounded-xl outline-none focus:border-[#6b4f3a] text-xs text-[#6b4f3a]"
                    placeholder="House/Flat No., Building Name, Street, Landmark"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#976E2A]">City</label>
                    <input
                      type="text"
                      required
                      value={addressForm.city}
                      onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                      className="w-full px-3 py-2.5 bg-white border border-[#E3DBC5] rounded-xl outline-none focus:border-[#6b4f3a] text-xs text-[#6b4f3a]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#976E2A]">State</label>
                    <input
                      type="text"
                      required
                      value={addressForm.state}
                      onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                      className="w-full px-3 py-2.5 bg-white border border-[#E3DBC5] rounded-xl outline-none focus:border-[#6b4f3a] text-xs text-[#6b4f3a]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#976E2A]">PIN Code</label>
                    <input
                      type="text"
                      required
                      value={addressForm.pincode}
                      onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                      className="w-full px-3 py-2.5 bg-white border border-[#E3DBC5] rounded-xl outline-none focus:border-[#6b4f3a] text-xs text-[#6b4f3a] font-sans"
                      placeholder="000000"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2">
                    {["Home", "Work", "Other"].map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setAddressForm({ ...addressForm, tag })}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                          addressForm.tag === tag
                            ? "bg-[#6b4f3a] text-white border-[#6b4f3a]"
                            : "bg-white text-gray-600 border-[#E3DBC5]"
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#6b4f3a]">
                    <input
                      type="checkbox"
                      checked={addressForm.isDefault}
                      onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                      className="rounded text-[#6b4f3a]"
                    />
                    <span>Set as Default</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isSavingAddress}
                  className="w-full h-12 bg-[#6b4f3a] text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-[#976E2A] transition-all disabled:opacity-50 mt-4"
                >
                  {isSavingAddress ? "Saving Address..." : "Save Address"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- DELETE ACCOUNT SAFETY CONFIRMATION MODAL --- */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border-2 border-red-300 shadow-2xl max-w-md w-full p-8 relative text-center space-y-6"
            >
              <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                <AlertTriangle size={32} />
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-red-900">Permanently Delete Account?</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  This action is permanent and cannot be undone. All your account records, orders, and saved addresses will be deleted.
                </p>
              </div>

              <div className="space-y-2 text-left">
                <label className="text-[11px] font-bold uppercase tracking-wider text-red-800">
                  Type <strong className="underline">DELETE</strong> to confirm:
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="Type DELETE"
                  className="w-full px-4 py-3 bg-red-50 border border-red-200 rounded-xl outline-none focus:border-red-600 text-sm font-bold text-red-900 text-center uppercase tracking-widest"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>

                <button
                  onClick={handleDeleteAccount}
                  disabled={isDeletingAccount || deleteConfirmText.trim().toUpperCase() !== "DELETE"}
                  className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-red-700 transition-colors disabled:opacity-40"
                >
                  {isDeletingAccount ? "Deleting..." : "Confirm Delete"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FEEDBACK TOAST */}
      <AnimatePresence>
        {feedbackMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 20, x: "-50%" }}
            className="fixed bottom-12 left-1/2 z-[350] bg-[#6b4f3a] text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4 backdrop-blur-xl max-w-md w-[90%] border border-[#976E2A]/30"
          >
            <Sparkles size={20} className="text-[#976E2A]" />
            <p className="text-xs font-bold uppercase tracking-wider flex-1">{feedbackMessage}</p>
            <button onClick={() => setFeedbackMessage(null)} className="opacity-60 hover:opacity-100 transition-opacity">
              <X size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Account;
