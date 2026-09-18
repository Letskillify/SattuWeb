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
      iconBg: "bg-amber-100 text-amber-800"
    },
    {
      label: "Sattu Blends",
      value: loading ? "..." : stats.sattuProducts,
      hint: "Traditional sattu items",
      trend: "Active Catalog",
      icon: Package,
      color: "from-emerald-600 to-emerald-800",
      iconBg: "bg-emerald-100 text-emerald-800"
    },
    {
      label: "Other Products",
      value: loading ? "..." : stats.otherProducts,
      hint: "Snacks, spices & grains",
      trend: "Organic Items",
      icon: Boxes,
      color: "from-amber-600 to-[#976E2A]",
      iconBg: "bg-amber-100 text-[#976E2A]"
    },
    {
      label: "Confirmed Orders",
      value: loading ? "..." : stats.orders,
      hint: `${stats.users} registered customers`,
      trend: "Live",
      icon: ShoppingBag,
      color: "from-[#6b4f3a] to-[#2A1B12]",
      iconBg: "bg-[#6b4f3a]/10 text-[#6b4f3a]"
    },
  ];

  return (
    <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
      {metricCards.map((card) => {
        const Icon = card.icon;
        return (
          <article
            key={card.label}
            className="bg-white rounded-2xl border border-[#E5DEC9] shadow-[0_4px_25px_rgba(0,0,0,0.03)] hover:shadow-lg transition-all duration-300 relative overflow-hidden group p-6 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-2xl ${card.iconBg} flex items-center justify-center font-bold shadow-xs group-hover:scale-105 transition-transform`}>
                  <Icon size={22} strokeWidth={2.2} />
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] font-poppins font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full">
                  <TrendingUp size={12} /> {card.trend}
                </span>
              </div>

              <p className="text-xs font-poppins font-bold uppercase tracking-wider text-[#7A6E63] mb-1">
                {card.label}
              </p>
              <h3 className="text-3xl font-poppins font-black text-[#2A1B12] tracking-tight mb-1">
                {card.value}
              </h3>
            </div>

            <div className="pt-3 border-t border-[#F2EDE2] mt-4 flex items-center justify-between">
              <span className="text-xs text-[#7A6E63] font-medium">{card.hint}</span>
            </div>

            <div className={`h-1 w-full bg-gradient-to-r ${card.color} absolute bottom-0 left-0 right-0`} />
          </article>
        );
      })}
    </section>
  );
};

export default MetricCards;
