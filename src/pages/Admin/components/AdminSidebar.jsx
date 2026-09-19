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
  LogOut,
  LayoutTemplate
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../components/useAuth';

const navGroups = [
  {
    title: "Overview",
    items: [
      { name: "Dashboard", icon: LayoutDashboard, badge: null },
      { name: "Homepage Manager", icon: LayoutTemplate, badge: "Live" },
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
    <aside className="w-72 bg-[#1A110B] text-[#F3EFE6] flex flex-col min-h-screen border-r border-[#332217] shadow-2xl shrink-0 z-30 select-none">
      
      {/* BRAND HEADER */}
      <div className="px-6 py-6 border-b border-[#332217] bg-[#140D08]/90 backdrop-blur-md">
        <Link to="/" className="flex items-center gap-3.5 group">
          <div className="relative">
            <div className="w-11 h-11 rounded-2xl bg-[#2A1B12] border border-[#3E2B1E] flex items-center justify-center p-1 shadow-md group-hover:border-[#D9A036] transition-colors">
              <img
                src="https://res.cloudinary.com/duzwys877/image/upload/v1782295170/logo_rwarlx.png"
                alt="Vedamya Logo"
                className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 h-4 shadow-md w-4 rounded-full bg-[#D9A036] text-[#1A1009] flex items-center justify-center text-[10px] font-black">
              <Leaf size={11} strokeWidth={3} />
            </div>
          </div>
          <div>
            <h2 className="text-xl font-poppins font-black text-white tracking-tight leading-none uppercase">
              Vedamya
            </h2>
            <p className="text-xs font-poppins font-extrabold uppercase tracking-[0.2em] text-[#D9A036] mt-1">
              Admin Console
            </p>
          </div>
        </Link>
      </div>

      {/* NAVIGATION GROUPS */}
      <nav className="flex-1 px-4 py-6 space-y-7 overflow-y-auto scrollbar-none">
        {navGroups.map((group) => (
          <div key={group.title} className="space-y-2">
            <p className="px-4 text-xs font-poppins font-black uppercase tracking-[0.25em] text-[#A69280]/80">
              {group.title}
            </p>

            <div className="space-y-1.5">
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
                    className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-sm font-bold transition-all duration-200 group ${
                      isActive
                        ? "bg-gradient-to-r from-[#D9A036] to-[#C68A27] text-[#1A1009] shadow-lg shadow-[#D9A036]/25 font-black translate-x-1"
                        : "text-[#D5C9BD] hover:bg-[#2A1B12]/80 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <Icon
                        size={20}
                        strokeWidth={isActive ? 2.5 : 2}
                        className={`transition-colors ${
                          isActive ? "text-[#1A1009]" : "text-[#D9A036]/80 group-hover:text-[#D9A036]"
                        }`}
                      />
                      <span>{item.name}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {item.badge && !isActive && (
                        <span className="text-xs font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-[#2A1B12] text-[#D9A036] border border-[#3E2B1E]">
                          {item.badge}
                        </span>
                      )}
                      {isActive && (
                        <ChevronRight size={16} className="text-[#1A1009]" strokeWidth={2.5} />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* LIVE STORE LINK */}
        <div className="pt-5 border-t border-[#332217]">
          <Link
            to="/products"
            target="_blank"
            className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl bg-[#2A1B12] hover:bg-[#382418] text-[#D9A036] text-sm font-bold transition-all border border-[#3E2B1E] group shadow-sm"
          >
            <span className="flex items-center gap-2.5">
              <ExternalLink size={17} />
              <span>View Web Store</span>
            </span>
            <ChevronRight size={16} className="opacity-60 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </nav>

      {/* ADMIN PROFILE CARD & LOGOUT */}
      <div className="p-4 border-t border-[#332217] bg-[#140D08]">
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#1A110B] border border-[#332217]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D9A036]/20 border border-[#D9A036]/40 text-[#D9A036] flex items-center justify-center font-bold text-sm shadow-sm">
              <ShieldCheck size={20} />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-white truncate">
                {user?.email?.split("@")[0] || "Manager"}
              </p>
              <p className="text-xs text-[#A69280] flex items-center gap-1.5 font-semibold mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Super Admin
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="p-2.5 text-[#A69280] hover:text-red-400 hover:bg-red-950/30 rounded-xl transition-colors"
            title="Sign Out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
