import React, { useState, useEffect } from "react";
import { useAuth } from "../components/useAuth";
import { db } from "../components/Firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Package, ChevronRight, ShoppingBag, ArrowLeft, Clock, CheckCircle2, XCircle, MapPin, Truck, Check, ChevronDown, ChevronUp } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
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
  return 0; // Placed / Pending
};

const Orders = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate("/login?redirect=orders");
      return;
    }

    const fetchOrders = async () => {
      try {
        const ordersRef = collection(db, "orders");
        const q = query(
          ordersRef,
          where("userId", "==", user.uid)
        );
        const querySnapshot = await getDocs(q);
        const ordersList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Sort in memory to avoid missing index errors
        ordersList.sort((a, b) => {
          const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0);
          const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0);
          return timeB - timeA;
        });

        setOrders(ordersList);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, navigate]);

  const toggleExpand = (id) => {
    setExpandedOrderId(prev => (prev === id ? null : id));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF4E3] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#6b4f3a]/10 border-t-[#6b4f3a] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF4E3] text-[#6b4f3a] selection:bg-[#976E2A] selection:text-white font-poppins">
      <PageHeader 
        title="My Orders" 
        subtitle="Track your sattu journey & shipments" 
        breadcrumbItems={[
          { label: "Home", path: "/" },
          { label: "Account", path: "/account" },
          { label: "Orders" }
        ]}
      />

      <div className="max-w-4xl mx-auto px-6 py-16">
        <Link to="/account" className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-[#976E2A] mb-8 hover:gap-3 transition-all">
          <ArrowLeft size={14} />
          Back to Account
        </Link>

        {orders.length === 0 ? (
          <div className="bg-white rounded-3xl border border-[#E3DBC5] p-20 text-center shadow-sm">
            <div className="w-20 h-20 bg-[#FAF4E3] rounded-full flex items-center justify-center text-[#976E2A] mx-auto mb-6">
              <ShoppingBag size={32} />
            </div>
            <h2 className="text-2xl font-serif italic mb-4 text-[#6b4f3a]">No orders found</h2>
            <p className="text-sm text-[#6b4f3a]/60 mb-8 max-w-xs mx-auto">
              You haven't placed any orders yet. Start your journey with Vedamya Foods today.
            </p>
            <Link to="/shop" className="inline-flex h-12 px-8 bg-[#6b4f3a] text-white items-center rounded-xl font-bold uppercase tracking-widest hover:bg-[#976E2A] transition-colors">
              Start Shopping
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
                <div key={order.id} className="bg-white rounded-2xl border border-[#E3DBC5] overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div className="p-6 md:p-8">
                    
                    {/* Header bar */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 pb-6 border-b border-[#E3DBC5]/60">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#FAF4E3] rounded-xl flex items-center justify-center text-[#6b4f3a] shrink-0">
                          <Package size={20} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold uppercase tracking-widest text-[#976E2A]">Order Number</span>
                            {order.isGuest === false && (
                              <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-100 font-bold">Verified Account</span>
                            )}
                          </div>
                          <p className="text-base font-bold text-[#6b4f3a]">{orderNum}</p>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-4 items-center">
                        <div className="text-left md:text-right">
                          <p className="text-xs font-bold uppercase tracking-widest text-[#976E2A]">Ordered On</p>
                          <p className="text-sm font-medium text-[#6b4f3a]">
                            {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Recently'}
                          </p>
                        </div>
                        <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2 ${
                          isFailed ? 'bg-red-50 text-red-700 border border-red-100' :
                          currentStageIdx >= 4 ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                          'bg-amber-50 text-amber-700 border border-amber-100'
                        }`}>
                          {isFailed ? <XCircle size={12} /> : 
                           currentStageIdx >= 4 ? <CheckCircle2 size={12} /> : 
                           <Clock size={12} />}
                          {isFailed ? 'Failed' : (order.orderStatus || order.status || 'Processing')}
                        </div>
                      </div>
                    </div>

                    {/* Order Tracking Progress Bar */}
                    {!isFailed && (
                      <div className="mb-8 p-6 bg-[#FAF4E3]/50 border border-[#E3DBC5]/60 rounded-2xl">
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-xs font-bold uppercase tracking-widest text-[#976E2A] flex items-center gap-2">
                            <Truck size={14} /> Order Tracking Status
                          </span>
                          <span className="text-xs font-bold text-[#6b4f3a] capitalize">
                            Status: {TRACKING_STAGES[currentStageIdx]?.label}
                          </span>
                        </div>

                        {/* Progress Stepper */}
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
                                  isCompleted ? 'bg-[#6b4f3a] text-white ring-4 ring-[#FAF4E3]' : 'bg-[#E3DBC5] text-[#6b4f3a]/50'
                                }`}>
                                  {isCompleted ? <Check size={14} /> : idx + 1}
                                </div>
                                <span className={`text-[10px] font-bold uppercase tracking-wider mt-2 hidden sm:block ${
                                  isCompleted ? 'text-[#6b4f3a]' : 'text-[#6b4f3a]/40'
                                }`}>
                                  {stage.label}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Product items list */}
                    <div className="space-y-4">
                      {order.items?.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-4 py-2 border-b border-gray-100 last:border-none">
                          <div className="w-16 h-16 bg-[#FAF4E3]/60 rounded-lg p-2 border border-[#E3DBC5]/40 shrink-0">
                            <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-sm font-bold text-[#6b4f3a]">{item.name}</h4>
                            <p className="text-xs text-[#6b4f3a]/60 font-medium">Qty: {item.quantity || 1} • {item.flavor || 'Classic'} {item.weight ? `(${item.weight})` : ''}</p>
                          </div>
                          <p className="text-sm font-bold text-[#6b4f3a] font-sans">₹{(Number(item.price) || 0) * (Number(item.quantity) || 1)}</p>
                        </div>
                      ))}
                    </div>

                    {/* Expandable Order Details Drawer */}
                    {isExpanded && (
                      <div className="mt-6 pt-6 border-t border-[#E3DBC5]/60 bg-[#FFFDF6] p-6 rounded-2xl border border-[#E3DBC5]/60 space-y-4">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-[#976E2A]">Delivery & Payment Summary</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                          <div>
                            <p className="font-bold text-[#6b4f3a] mb-1">Shipping Address:</p>
                            <p className="text-[#6b4f3a]/80 leading-relaxed">
                              {order.customerName || order.shippingAddress?.name || order.shipping?.name}<br />
                              {order.shippingAddress?.address || order.shipping?.address}<br />
                              {order.shippingAddress?.city || order.shipping?.city}, {order.shippingAddress?.state || order.shipping?.state} - {order.shippingAddress?.pincode || order.shipping?.pincode}<br />
                              Phone: {order.customerPhone || order.shippingAddress?.phone || order.shipping?.phone}
                            </p>
                          </div>
                          <div>
                            <p className="font-bold text-[#6b4f3a] mb-1">Payment Information:</p>
                            <p className="text-[#6b4f3a]/80 leading-relaxed">
                              Method: <strong className="uppercase">{order.paymentMethod || "COD"}</strong><br />
                              Payment Status: <strong className="capitalize">{order.paymentStatus || "pending"}</strong><br />
                              Order Email: <span>{order.customerEmail || order.userEmail}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Footer bar */}
                    <div className="mt-8 pt-6 border-t border-[#E3DBC5]/60 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-[#976E2A]">Total Amount</p>
                        <p className="text-2xl font-bold text-[#6b4f3a] font-sans">₹{order.total}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <button 
                          onClick={() => toggleExpand(order.id)}
                          className="text-xs font-bold uppercase tracking-wider text-[#6b4f3a] hover:text-[#976E2A] flex items-center gap-1.5 px-4 py-2 bg-[#FAF4E3] rounded-xl border border-[#E3DBC5]/60 transition-colors"
                        >
                          <span>{isExpanded ? 'Hide Details' : 'Order Details'}</span>
                          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                        <Link to="/shop" className="text-xs font-bold text-[#976E2A] hover:text-[#6b4f3a] hidden sm:flex items-center gap-1 group">
                          Shop Again
                          <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
