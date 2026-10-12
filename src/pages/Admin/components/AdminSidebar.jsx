import React from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Tags,
  Users,
  Leaf,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  LogOut,
  LayoutTemplate,
  FolderTree,
  Warehouse,
  Sparkles
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../components/useAuth';

const navGroups = [
  {
    title: "Overview",
    items: [
      { id: "Dashboard", name: "Dashboard", icon: LayoutDashboard },
      { id: "Homepage Manager", name: "Homepage Manager", icon: LayoutTemplate, badge: "Live", badgeType: "success" },
    ]
  },
  {
    title: "Catalog",
    items: [
      { id: "Products", name: "All Products", icon: Package },
      { id: "Category Manager", name: "Category Manager", icon: FolderTree },
    ]
  },
  {
    title: "Inventory",
    items: [
      { id: "Stock Manager", name: "Stock Manager", icon: Warehouse, badge: "Live", badgeType: "warning" },
      { id: "Flavors", name: "Flavors & Blends", icon: Tags },
    ]
  },
  {
    title: "Store Activity",
    items: [
      { id: "Orders", name: "Orders & Sales", icon: ShoppingCart },
      { id: "Account", name: "Account", icon: Users },
    ]
  }
];

const AdminSidebar = ({ activeItem, setActiveItem }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    localStorage.removeItem("isAdminLoggedIn");
    localStorage.removeItem("adminEmail");
    localStorage.removeItem("adminLoginTime");
    if (logout) await logout();
    navigate("/admin/login");
  };

  return (
    <aside className="w-[280px] bg-gradient-to-b from-[#180E09] via-[#130B06] to-[#0D0704] text-[#EFEBE4] flex flex-col min-h-screen border-r border-[#2A1B12] shadow-[4px_0_30px_rgba(0,0,0,0.5)] shrink-0 z-30 select-none font-sans">
      
      {/* 1. BRAND HEADER */}
      <div className="px-6 py-6 border-b border-[#26180F] bg-[#140C07]/90 backdrop-blur-md">
        <Link to="/" className="flex items-center gap-3.5 group">
          
          {/* Logo Icon with Gold Glow */}
          <div className="relative">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#26170E] to-[#1A0F09] border border-[#3D281A] flex items-center justify-center p-1.5 shadow-md group-hover:border-[#D9A036]/70 group-hover:shadow-[0_0_15px_rgba(217,160,54,0.2)] transition-all duration-300">
              <img
                src="https://res.cloudinary.com/duzwys877/image/upload/v1782295170/logo_rwarlx.png"
                alt="Vedamya Logo"
                className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-[#D9A036] text-[#140C07] flex items-center justify-center shadow-md">
              <Leaf size={10} strokeWidth={3} />
            </div>
          </div>

          {/* Brand Name & Tag */}
          <div className="overflow-hidden">
            <div className="flex items-center gap-1.5">
              <h2 className="text-base font-serif font-black text-white tracking-wider uppercase leading-none">
                Vedamya
              </h2>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#D9A036]" />
            </div>
            <p className="text-[10px] font-sans font-semibold uppercase tracking-[0.22em] text-[#D9A036] mt-1 opacity-90">
              Admin Suite
            </p>
          </div>

        </Link>
      </div>

      {/* 2. NAVIGATION LINKS */}
      <nav className="flex-1 px-3.5 py-6 space-y-6 overflow-y-auto scrollbar-none">
        {navGroups.map((group) => (
          <div key={group.title} className="space-y-1">
            
            {/* Group Header */}
            <p className="px-3.5 pb-1 text-[10px] font-sans font-bold uppercase tracking-[0.25em] text-[#8C7A6B]/75">
              {group.title}
            </p>

            {/* Navigation Items */}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive =
                  item.id === activeItem ||
                  (item.id === "Products" && (activeItem === "Sattu Products" || activeItem === "Other Products")) ||
                  (item.id === "Orders" && activeItem === "Orders") ||
                  (item.id === "Account" && (activeItem === "Account" || activeItem === "Accounts" || activeItem === "Users")) ||
                  (item.id === "Flavors" && activeItem === "Flavors");

                const Icon = item.icon;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveItem(item.id)}
                    className={`w-full relative flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13px] transition-all duration-200 group cursor-pointer ${
                      isActive
                        ? "bg-[#24160D] border border-[#D9A036]/40 text-white font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_4px_16px_rgba(0,0,0,0.35)]"
                        : "text-[#B8A798] hover:text-white hover:bg-[#1C1109] font-medium border border-transparent"
                    }`}
                  >
                    {/* Glowing Left Indicator on Active */}
                    {isActive && (
                      <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-[#D9A036] shadow-[0_0_10px_#D9A036]" />
                    )}

                    {/* Icon + Label */}
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon
                        size={17}
                        strokeWidth={isActive ? 2.3 : 1.9}
                        className={`transition-colors shrink-0 ${
                          isActive
                            ? "text-[#E5B252]"
                            : "text-[#8C7A6B] group-hover:text-[#D9A036]"
                        }`}
                      />
                      <span className="truncate tracking-wide">{item.name}</span>
                    </div>

                    {/* Right Badges / Chevron */}
                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      {item.badge && !isActive && (
                        <span
                          className={`text-[9px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full flex items-center gap-1 ${
                            item.badgeType === "success"
                              ? "bg-emerald-950/70 text-emerald-400 border border-emerald-800/40"
                              : "bg-[#2A1B12] text-[#D9A036] border border-[#3E2B1E]"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              item.badgeType === "success"
                                ? "bg-emerald-400 animate-pulse"
                                : "bg-[#D9A036]"
                            }`}
                          />
                          {item.badge}
                        </span>
                      )}

                      {isActive && (
                        <ChevronRight
                          size={14}
                          strokeWidth={2.5}
                          className="text-[#D9A036] opacity-90"
                        />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

          </div>
        ))}

        {/* 3. STORE FRONT LINK CARD */}
        <div className="pt-3 border-t border-[#26180F]">
          <Link
            to="/products"
            target="_blank"
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#1A1009] hover:bg-[#25170D] text-[#D9A036] text-xs font-semibold transition-all border border-[#332014] hover:border-[#D9A036]/40 group shadow-xs"
          >
            <span className="flex items-center gap-2.5">
              <ExternalLink size={14} className="opacity-80 group-hover:opacity-100" />
              <span>Preview Live Store</span>
            </span>
            <ChevronRight
              size={14}
              className="opacity-50 group-hover:translate-x-0.5 transition-transform"
            />
          </Link>
        </div>
      </nav>

      {/* 4. ADMIN USER PROFILE FOOTER */}
      <div className="p-3.5 pb-8 border-t border-[#26180F] bg-[#100905]">
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#170E08] border border-[#26180F]">
          
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Avatar Pill */}
            <div className="w-8 h-8 rounded-lg bg-[#2A1B12] border border-[#D9A036]/30 text-[#D9A036] flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
              <ShieldCheck size={16} />
            </div>

            {/* User Info */}
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate leading-tight">
                {user?.email?.split("@")[0] || "Administrator"}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] text-[#8C7A6B] font-medium leading-none">
                  Super Admin
                </span>
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="p-1.5 text-[#8C7A6B] hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors cursor-pointer shrink-0"
            title="Sign Out"
          >
            <LogOut size={15} />
          </button>

        </div>
      </div>

    </aside>
  );
};

export default AdminSidebar;
