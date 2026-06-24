import React from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Tags,
  Users,
  Leaf
} from 'lucide-react';

const sidebarItems = [
  { name: "Dashboard", icon: LayoutDashboard },
  { name: "Products", icon: Package },
  { name: "Orders", icon: ShoppingCart },
  { name: "Flavors", icon: Tags },
  { name: "Users", icon: Users },
];

const AdminSidebar = ({ activeItem, setActiveItem }) => {
  return (
    <aside className="w-64 border-r border-[#D9D3C7] bg-[#FDFBF7] flex flex-col shadow-sm">
      <div className="px-6 py-6 border-b border-[#D9D3C7]">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-[#6b4f3] text-[#D9A036] flex items-center justify-center shadow-md">
            <Leaf size={20} strokeWidth={2} />
          </div>
          <div>
            <p className="text-base font-poppins font-bold tracking-tight text-[#1C2B21]">
              Sattu Admin
            </p>
            <p className="text-sm text-[#707A72]">Product Management</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {sidebarItems.map((item) => {
          const isActive = item.name === activeItem;
          const Icon = item.icon;
          return (
            <button
              key={item.name}
              type="button"
              onClick={() => setActiveItem(item.name)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive
                  ? "bg-[#6b4f3] text-white shadow-md"
                  : "text-[#4A5D4E] hover:bg-[#EFECE6] hover:text-[#1C2B21]"
                }`}
            >
              <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
              <span>{item.name}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#D9A036]" />
              )}
            </button>
          );
        })}
      </nav>

      <div className="px-5 py-5 border-t border-[#D9D3C7] bg-[#EFECE6]">
        <p className="text-sm font-semibold text-[#1C2B21] mb-1">Session</p>
        <p className="text-sm text-[#707A72]">Changes are auto-saved to Firestore</p>
      </div>
    </aside>
  );
};

export default AdminSidebar;
