import React, { useEffect, useState } from 'react';
import { Package, Boxes, ShoppingBag, IndianRupee, TrendingUp, Users } from 'lucide-react';
import { db } from '../../../components/Firebase';
import { collection, getDocs } from 'firebase/firestore';

const MetricCards = () => {
  const [stats, setStats] = useState({
    sattuProducts: 0,
    otherProducts: 0,
    orders: 0,
    revenue: 0,
    users: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [productsSnap, ordersSnap, usersSnap] = await Promise.all([
          getDocs(collection(db, "products")),
          getDocs(collection(db, "orders")),
          getDocs(collection(db, "users"))
        ]);

        const allProducts = productsSnap.docs.map(d => d.data());
        const sattuCount = allProducts.filter(p => p.productType !== "other").length;
        const otherCount = allProducts.filter(p => p.productType === "other").length;

        const totalRevenue = ordersSnap.docs.reduce((acc, doc) => {
          const data = doc.data();
          return data.status === 'confirmed' ? acc + (Number(data.total) || 0) : acc;
        }, 0);

        setStats({
          sattuProducts: sattuCount,
          otherProducts: otherCount,
          orders: ordersSnap.docs.filter(d => d.data().status === 'confirmed').length,
          revenue: totalRevenue,
          users: usersSnap.size
        });
      } catch (error) {
        console.error("Error fetching metrics:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const metricCards = [
    {
      label: "Total Revenue",
      value: loading ? "..." : `₹${stats.revenue.toLocaleString('en-IN')}`,
      hint: "Lifetime confirmed sales",
      trend: "+18.4%",
      icon: IndianRupee,
      color: "from-amber-500 to-amber-700",
      iconBg: "bg-amber-100 text-amber-900 border border-amber-200"
    },
    {
      label: "Sattu Blends",
      value: loading ? "..." : stats.sattuProducts,
      hint: "Traditional sattu catalog",
      trend: "Active Items",
      icon: Package,
      color: "from-emerald-600 to-emerald-800",
      iconBg: "bg-emerald-100 text-emerald-900 border border-emerald-200"
    },
    {
      label: "Other Products",
      value: loading ? "..." : stats.otherProducts,
      hint: "Snacks, spices & organic",
      trend: "Organic Items",
      icon: Boxes,
      color: "from-amber-600 to-[#976E2A]",
      iconBg: "bg-amber-100 text-[#976E2A] border border-amber-200"
    },
    {
      label: "Confirmed Orders",
      value: loading ? "..." : stats.orders,
      hint: `${stats.users} registered users`,
      trend: "Live Orders",
      icon: ShoppingBag,
      color: "from-[#6b4f3a] to-[#2A1B12]",
      iconBg: "bg-[#6b4f3a]/15 text-[#6b4f3a] border border-[#6b4f3a]/20"
    },
  ];

  return (
    <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
      {metricCards.map((card) => {
        const Icon = card.icon;
        return (
          <article
            key={card.label}
            className="bg-white rounded-3xl border border-[#E5DEC9] shadow-[0_4px_25px_rgba(0,0,0,0.03)] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group p-6 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className={`w-13 h-13 rounded-2xl ${card.iconBg} flex items-center justify-center font-bold shadow-xs group-hover:scale-110 transition-transform`}>
                  <Icon size={24} strokeWidth={2.2} />
                </div>
                <span className="inline-flex items-center gap-1.5 text-xs font-poppins font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-3 py-1 rounded-full shadow-2xs">
                  <TrendingUp size={13} /> {card.trend}
                </span>
              </div>

              <p className="text-xs sm:text-sm font-poppins font-bold uppercase tracking-wider text-[#7A6E63] mb-1.5">
                {card.label}
              </p>
              <h3 className="text-3xl lg:text-4xl font-poppins font-black text-[#2A1B12] tracking-tight mb-1">
                {card.value}
              </h3>
            </div>

            <div className="pt-3.5 border-t border-[#F2EDE2] mt-4 flex items-center justify-between">
              <span className="text-xs sm:text-sm text-[#7A6E63] font-semibold">{card.hint}</span>
            </div>

            <div className={`h-1.5 w-full bg-gradient-to-r ${card.color} absolute bottom-0 left-0 right-0`} />
          </article>
        );
      })}
    </section>
  );
};

export default MetricCards;
