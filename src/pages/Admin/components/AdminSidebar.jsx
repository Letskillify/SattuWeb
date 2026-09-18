import React from 'react';
import {
  LayoutDashboard,
  Package,
  Boxes,
  ShoppingCart,
  Tags,
  Users,
  Leaf,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  LogOut
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../components/useAuth';

const navGroups = [
  {
    title: "Overview",
    items: [
      { name: "Dashboard", icon: LayoutDashboard, badge: null },
    ]
  },
  {
    title: "Inventory",
    items: [
      { name: "Sattu Products", icon: Package, badge: "Sattu" },
      { name: "Other Products", icon: Boxes, badge: "Organic" },
      { name: "Flavors", icon: Tags, badge: null },
    ]
  },
  {
    title: "Store Activity",
    items: [
      { name: "Orders", icon: ShoppingCart, badge: "Live" },
      { name: "Users", icon: Users, badge: null },
    ]
  }
];

const AdminSidebar = ({ activeItem, setActiveItem }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (logout) await logout();
    navigate("/admin/login");
  };

  return (
    <aside className="w-72 bg-[#2A1B12] text-[#F3EFE6] flex flex-col min-h-screen border-r border-[#3E2B1E] shadow-2xl shrink-0 z-30 select-none">
      
      {/* BRAND HEADER */}
      <div className="px-6 py-6 border-b border-[#3E2B1E] bg-[#23150E]/80 backdrop-blur-md">
        <Link to="/" className="flex items-center gap-3.5 group">
          <div className="relative">
            <img
              src="https://res.cloudinary.com/duzwys877/image/upload/v1782295170/logo_rwarlx.png"
              alt="Vedamya Logo"
              className="h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-[#D9A036] text-[#2A1B12] flex items-center justify-center text-[9px] font-extrabold shadow-sm">
              <Leaf size={10} strokeWidth={3} />
            </div>
          </div>
          <div>
            <h2 className="text-lg font-poppins font-black text-white tracking-tight leading-none uppercase">
              Vedamya
            </h2>
            <p className="text-[11px] font-poppins font-bold uppercase tracking-[0.25em] text-[#D9A036] mt-1">
              Admin Console
            </p>
          </div>
        </Link>
      </div>

      {/* NAVIGATION GROUPS */}
      <nav className="flex-1 px-4 py-6 space-y-6 overflow-y-auto scrollbar-none">
        {navGroups.map((group) => (
          <div key={group.title} className="space-y-1.5">
            <p className="px-4 text-[10px] font-poppins font-black uppercase tracking-[0.3em] text-[#A69280]/70">
              {group.title}
            </p>

            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive =
                  item.name === activeItem ||
                  (item.name === "Sattu Products" && activeItem === "Products");
                const Icon = item.icon;

                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => setActiveItem(item.name)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all duration-200 group ${
                      isActive
                        ? "bg-[#D9A036] text-[#1A1009] shadow-lg shadow-[#D9A036]/20 font-extrabold translate-x-1"
                        : "text-[#D5C9BD] hover:bg-[#3E2B1E]/60 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        size={18}
                        strokeWidth={isActive ? 2.5 : 1.8}
                        className={`transition-colors ${
                          isActive ? "text-[#1A1009]" : "text-[#D9A036]/70 group-hover:text-[#D9A036]"
                        }`}
                      />
                      <span>{item.name}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {item.badge && !isActive && (
                        <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#3E2B1E] text-[#D9A036] border border-[#523A2A]">
                          {item.badge}
                        </span>
                      )}
                      {isActive && (
                        <ChevronRight size={14} className="text-[#1A1009]" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* LIVE STORE LINK */}
        <div className="pt-4 border-t border-[#3E2B1E]">
          <Link
            to="/products"
            target="_blank"
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-[#352317] hover:bg-[#452F20] text-[#D9A036] text-xs font-bold transition-all border border-[#523A2A]/50 group"
          >
            <span className="flex items-center gap-2.5">
              <ExternalLink size={15} />
              <span>View Web Store</span>
            </span>
            <ChevronRight size={14} className="opacity-50 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </nav>

      {/* ADMIN PROFILE CARD & LOGOUT */}
      <div className="p-4 border-t border-[#3E2B1E] bg-[#23150E]">
        <div className="flex items-center justify-between p-3 rounded-xl bg-[#2A1B12] border border-[#3E2B1E]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#D9A036]/20 border border-[#D9A036]/40 text-[#D9A036] flex items-center justify-center font-bold text-xs">
              <ShieldCheck size={18} />
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white truncate">
                {user?.email?.split("@")[0] || "Manager"}
              </p>
              <p className="text-[10px] text-[#A69280] flex items-center gap-1 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Super Admin
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="p-2 text-[#A69280] hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
            title="Sign Out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
