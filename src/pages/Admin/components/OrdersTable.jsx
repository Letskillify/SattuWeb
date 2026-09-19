import React, { useEffect, useState } from 'react';
import { db } from '../../../components/Firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { ShoppingBag, CreditCard, Clock, CheckCircle, XCircle } from 'lucide-react';

const statusBadgeClasses = (status) => {
  switch (status?.toLowerCase()) {
    case "confirmed":
    case "completed":
      return "bg-emerald-50 text-emerald-800 border-emerald-200/80";
    case "failed":
    case "cancelled":
      return "bg-red-50 text-red-700 border-red-200/80";
    default:
      return "bg-amber-50 text-amber-800 border-amber-200/80";
  }
};

const OrdersTable = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const q = query(collection(db, "orders"), orderBy("createdAt", "desc"), limit(10));
        const snap = await getDocs(q);
        setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  return (
    <section className="bg-white rounded-3xl border border-[#E5DEC9] shadow-[0_4px_25px_rgba(0,0,0,0.03)] overflow-hidden">
      <div className="p-6 md:p-8 border-b border-[#E5DEC9] bg-[#FDFBF7] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-poppins font-black text-[#2A1B12] tracking-tight">Recent Transactions</h2>
          <p className="text-xs sm:text-sm text-[#7A6E63] font-semibold mt-1">Latest customer orders & payment records</p>
        </div>
        <span className="px-4 py-2 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs sm:text-sm font-extrabold uppercase tracking-wider self-start sm:self-auto shadow-2xs">
          {orders.length} Recent Orders
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-[#F7F4EE] border-b border-[#E5DEC9]">
            <tr className="text-xs font-poppins font-black text-[#6b4f3a] uppercase tracking-wider">
              <th className="px-6 py-4.5">Order ID</th>
              <th className="px-6 py-4.5">Customer Details</th>
              <th className="px-6 py-4.5">Total Amount</th>
              <th className="px-6 py-4.5">Payment Method</th>
              <th className="px-6 py-4.5">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5DEC9]/60">
            {loading ? (
              <tr>
                <td colSpan="5" className="px-6 py-14 text-center text-gray-500 font-semibold text-sm">Loading orders...</td>
              </tr>
            ) : orders.length > 0 ? (
              orders.map((order) => (
                <tr key={order.id} className="hover:bg-[#FDFBF7] transition-colors font-sans">
                  <td className="px-6 py-4.5 font-poppins font-bold text-sm text-[#2A1B12]">
                    <div className="flex items-center gap-2.5">
                      <ShoppingBag size={16} className="text-[#976E2A]" />
                      <span>#{order.id.slice(0, 8).toUpperCase()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4.5">
                    <p className="text-[#2A1B12] font-bold text-sm">{order.shipping?.name || "Member Customer"}</p>
                    <p className="text-xs text-[#7A6E63] font-semibold mt-0.5">{order.userEmail || "Guest checkout"}</p>
                  </td>
                  <td className="px-6 py-4.5 text-[#2A1B12] font-black text-base">
                    ₹{order.total || 0}
                  </td>
                  <td className="px-6 py-4.5 text-[#7A6E63] font-extrabold text-xs uppercase tracking-wider">
                    <span className="flex items-center gap-2">
                      <CreditCard size={15} className="text-[#976E2A]" />
                      {order.paymentMethod || "COD / Online"}
                    </span>
                  </td>
                  <td className="px-6 py-4.5">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-xs font-extrabold uppercase tracking-wider ${statusBadgeClasses(order.status)}`}
                    >
                      {order.status === "confirmed" ? <CheckCircle size={14} /> : <Clock size={14} />}
                      {order.status || "Pending"}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-6 py-14 text-center text-gray-500 font-semibold text-sm">No recent transactions recorded yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default OrdersTable;
