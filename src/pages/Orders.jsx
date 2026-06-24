import React, { useState, useEffect } from "react";
import { useAuth } from "../components/useAuth";
import { db } from "../components/Firebase";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { Package, ChevronRight, ShoppingBag, ArrowLeft, Clock, CheckCircle2, XCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import PageHeader from "../components/Sattu/PageHeader";

const Orders = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

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
          const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
          const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
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
        subtitle="Track your sattu journey" 
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
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-2xl border border-[#E3DBC5] overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
                <div className="p-6 md:p-8">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 pb-6 border-b border-[#E3DBC5]/60">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#FAF4E3] rounded-xl flex items-center justify-center text-[#6b4f3a]">
                        <Package size={20} />
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-[#976E2A]">Order ID</p>
                        <p className="text-sm font-bold text-[#6b4f3a]">#{order.id.slice(0, 10).toUpperCase()}</p>
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
                        order.status === 'confirmed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                        order.status === 'failed' ? 'bg-red-50 text-red-700 border border-red-100' :
                        'bg-amber-50 text-amber-700 border border-amber-100'
                      }`}>
                        {order.status === 'confirmed' ? <CheckCircle2 size={12} /> : 
                         order.status === 'failed' ? <XCircle size={12} /> : 
                         <Clock size={12} />}
                        {order.status}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-4 py-2">
                        <div className="w-16 h-16 bg-[#FAF4E3]/60 rounded-lg p-2 border border-[#E3DBC5]/40 shrink-0">
                          <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-bold text-[#6b4f3a]">{item.name}</h4>
                          <p className="text-xs text-[#6b4f3a]/60 font-medium">Qty: {item.quantity || 1} • {item.flavor || 'Classic'}</p>
                        </div>
                        <p className="text-sm font-bold text-[#6b4f3a] font-sans">₹{item.price}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 pt-6 border-t border-[#E3DBC5]/60 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-[#976E2A]">Total Amount</p>
                      <p className="text-2xl font-bold text-[#6b4f3a] font-sans">₹{order.total}</p>
                    </div>
                    <Link to="/shop" className="text-sm font-bold text-[#976E2A] hover:text-[#6b4f3a] flex items-center gap-1 group">
                      View Similar Products
                      <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
