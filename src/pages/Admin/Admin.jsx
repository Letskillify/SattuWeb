import React, { useState, useEffect } from "react";
import { db } from "../../components/Firebase";
import {
  addDoc,
  collection,
  serverTimestamp,
  getDocs,
  query,
  orderBy,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";

// Cloudinary Helper (also re-exported for backwards compatibility)
import { uploadToCloudinary } from "./cloudinaryUpload";
export { uploadToCloudinary };

// Admin Components
import AdminSidebar from "./components/AdminSidebar";
import AdminHeader from "./components/AdminHeader";
import MetricCards from "./components/MetricCards";
import ProductsTable from "./components/ProductsTable";
import OrdersTable from "./components/OrdersTable";
import UsersTable from "./components/UsersTable";
import AccountsTable from "./components/AccountsTable";
import FlavorsOverview from "./components/FlavorsOverview";
import HomepageManager from "./components/HomepageManager";

// New Core Unified & Management Components
import UnifiedProductForm from "./components/UnifiedProductForm";
export { UnifiedProductForm as ProductForm };
import CategoryManager, { DEFAULT_OTHER_CATEGORIES } from "./components/CategoryManager";
import StockManager from "./components/StockManager";

import { X, Package, Sparkles, Check, AlertCircle } from "lucide-react";
import { useAuth } from "../../components/useAuth";
import { useNavigate } from "react-router-dom";

const Admin = () => {
  const [activeItem, setActiveItem] = useState("Dashboard");
  
  // Single Unified Modal states
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [isEditProductModalOpen, setIsEditProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Data states
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [toastMessage, setToastMessage] = useState(null);

  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const isSavedAdmin = typeof window !== "undefined" && localStorage.getItem("isAdminLoggedIn") === "true";

  useEffect(() => {
    // Only redirect if auth finished loading AND user is not logged in AND no saved admin session
    if (!loading && !user && !isSavedAdmin) {
      navigate("/admin/login");
    }
  }, [user, loading, isSavedAdmin, navigate]);

  // Load products
  const loadProducts = async () => {
    try {
      const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setProducts(list);
    } catch (err) {
      console.error("Error loading products:", err);
    }
  };

  // Load categories
  const loadCategories = async () => {
    try {
      const q = query(collection(db, "categories"), orderBy("name", "asc"));
      const snap = await getDocs(q);
      if (snap.empty) {
        setCategories(DEFAULT_OTHER_CATEGORIES);
      } else {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setCategories(list);
      }
    } catch (err) {
      console.error("Error loading categories:", err);
      setCategories(DEFAULT_OTHER_CATEGORIES);
    }
  };

  // Load users
  const loadUsers = async () => {
    try {
      const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setUsers(list);
    } catch (error) {
      console.log("Note: Users collection may not exist yet or error fetching users");
    }
  };

  useEffect(() => {
    loadProducts();
    loadCategories();
    loadUsers();
  }, []);

  const triggerToast = (msg, type = "success") => {
    setToastMessage({ msg, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Delete product
  const handleDeleteProduct = async (id) => {
    try {
      await deleteDoc(doc(db, "products", id));
      setProducts((prev) => prev.filter((p) => p.id !== id));
      triggerToast("Product removed successfully from catalog!");
    } catch (err) {
      console.error(err);
      triggerToast("Failed to delete product: " + err.message, "error");
    }
  };

  // Edit product clicked
  const handleEditClick = (product) => {
    setEditingProduct(product);
    setIsEditProductModalOpen(true);
  };

  // Single Add Product Submit
  const handleAddProductSubmit = async (docData) => {
    try {
      await addDoc(collection(db, "products"), {
        ...docData,
        createdAt: serverTimestamp(),
      });
      setIsAddProductModalOpen(false);
      await loadProducts();
      triggerToast(`"${docData.name}" has been published to the store!`);
    } catch (err) {
      console.error(err);
      triggerToast("Failed to add product: " + err.message, "error");
    }
  };

  // Single Edit Product Submit
  const handleEditProductSubmit = async (docData) => {
    if (!editingProduct?.id) return;
    try {
      await updateDoc(doc(db, "products", editingProduct.id), docData);
      setIsEditProductModalOpen(false);
      setEditingProduct(null);
      await loadProducts();
      triggerToast(`"${docData.name}" updated successfully!`);
    } catch (err) {
      console.error(err);
      triggerToast("Failed to update product: " + err.message, "error");
    }
  };

  // Dynamic View Switcher
  const renderMainContent = () => {
    switch (activeItem) {
      case "Products":
      case "Sattu Products":
      case "Other Products":
        return (
          <>
            <MetricCards />
            <ProductsTable
              products={products}
              onEdit={handleEditClick}
              onDelete={handleDeleteProduct}
              title="Catalog Inventory"
              subtitle="Browse and manage all Sattu blends & organic products"
              onOpenAddModal={() => setIsAddProductModalOpen(true)}
            />
          </>
        );

      case "Category Manager":
        return (
          <CategoryManager
            products={products}
            onCategoriesUpdated={loadCategories}
          />
        );

      case "Stock Manager":
        return (
          <StockManager
            products={products}
            onProductsUpdated={loadProducts}
            onEditProduct={handleEditClick}
          />
        );

      case "Orders":
        return (
          <>
            <MetricCards />
            <OrdersTable />
          </>
        );

      case "Flavors":
        return (
          <>
            <MetricCards />
            <FlavorsOverview />
          </>
        );

      case "Account":
      case "Accounts":
      case "Users":
        return (
          <>
            <MetricCards />
            <AccountsTable
              users={users}
              onUsersUpdated={loadUsers}
              currentUserEmail={user?.email || (typeof window !== "undefined" ? localStorage.getItem("adminEmail") : "")}
            />
          </>
        );

      case "Homepage Manager":
        return <HomepageManager />;

      case "Dashboard":
      default:
        return (
          <>
            <MetricCards />
            
            {/* Quick Master Catalog Section */}
            <div className="mb-8">
              <ProductsTable
                products={products}
                onEdit={handleEditClick}
                onDelete={handleDeleteProduct}
                title="Store Catalog Overview"
                subtitle="Live status of all store products"
                onOpenAddModal={() => setIsAddProductModalOpen(true)}
              />
            </div>

            {/* Recent Orders Overview */}
            <OrdersTable />
          </>
        );
    }
  };

  if (loading && !isSavedAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF7F2] text-[#2A1B12]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-[#D9A036] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-sans font-bold uppercase tracking-widest text-[#7A6E63]">
            Authenticating Admin Session...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#FAF7F2] text-[#2A1B12] font-sans selection:bg-[#D9A036] selection:text-white">
      {/* SIDEBAR NAVIGATION */}
      <AdminSidebar activeItem={activeItem} setActiveItem={setActiveItem} />

      {/* MAIN ADMIN WORKSPACE */}
      <main className="flex-1 px-6 py-8 md:px-10 lg:px-12 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* TOAST FEEDBACK NOTIFICATION */}
          {toastMessage && (
            <div
              className={`p-4 rounded-2xl flex items-center justify-between text-sm font-bold shadow-lg transition-all animate-fadeIn ${
                toastMessage.type === "error"
                  ? "bg-red-50 text-red-900 border border-red-200"
                  : "bg-emerald-50 text-emerald-900 border border-emerald-200"
              }`}
            >
              <div className="flex items-center gap-2.5">
                {toastMessage.type === "error" ? <AlertCircle size={18} /> : <Check size={18} />}
                <span>{toastMessage.msg}</span>
              </div>
              <button
                onClick={() => setToastMessage(null)}
                className="p-1 hover:opacity-75 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {/* GLOBAL ADMIN HEADER */}
          <AdminHeader
            activeItem={activeItem}
            onOpenAddModal={() => setIsAddProductModalOpen(true)}
            onOpenCategoryManager={() => setActiveItem("Category Manager")}
            onOpenStockManager={() => setActiveItem("Stock Manager")}
          />

          {/* ACTIVE VIEW CONTENT */}
          {renderMainContent()}
        </div>
      </main>

      {/* ========================================================================= */}
      {/* SINGLE UNIFIED ADD PRODUCT MODAL */}
      {/* ========================================================================= */}
      {isAddProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#140D08]/80 backdrop-blur-md p-4">
          <div className="bg-[#FDFBF7] rounded-3xl shadow-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto border border-[#E5DEC9] animate-scaleUp">
            
            {/* Modal Header */}
            <div className="px-8 py-6 border-b border-[#E5DEC9] flex items-center justify-between sticky top-0 bg-[#FDFBF7]/95 backdrop-blur-md z-20">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-[#D9A036]/20 border border-[#D9A036]/40 text-[#976E2A] flex items-center justify-center shadow-xs">
                  <Sparkles size={24} />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-poppins font-black text-[#2A1B12] flex items-center gap-2">
                    Add New Product
                  </h2>
                  <p className="text-xs sm:text-sm text-[#7A6E63] font-semibold mt-0.5">
                    Select Sattu or Other Products to dynamically adapt required fields
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsAddProductModalOpen(false)}
                className="p-2.5 hover:bg-[#E5DEC9] rounded-2xl transition-colors text-[#7A6E63] hover:text-[#2A1B12] cursor-pointer"
              >
                <X size={22} />
              </button>
            </div>

            {/* Unified Upload Form */}
            <div className="px-8 py-7">
              <UnifiedProductForm
                onSuccess={handleAddProductSubmit}
                categories={categories}
                onOpenCategoryManager={() => {
                  setIsAddProductModalOpen(false);
                  setActiveItem("Category Manager");
                }}
              />
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SINGLE UNIFIED EDIT PRODUCT MODAL */}
      {/* ========================================================================= */}
      {isEditProductModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#140D08]/80 backdrop-blur-md p-4">
          <div className="bg-[#FDFBF7] rounded-3xl shadow-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto border border-[#E5DEC9] animate-scaleUp">
            
            {/* Modal Header */}
            <div className="px-8 py-6 border-b border-[#E5DEC9] flex items-center justify-between sticky top-0 bg-[#FDFBF7]/95 backdrop-blur-md z-20">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-[#6b4f3a]/20 border border-[#6b4f3a]/40 text-[#6b4f3a] flex items-center justify-center shadow-xs">
                  <Package size={24} />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-poppins font-black text-[#2A1B12]">
                    Edit: {editingProduct.name}
                  </h2>
                  <p className="text-xs sm:text-sm text-[#7A6E63] font-semibold mt-0.5">
                    Modifying {editingProduct.productType === "other" ? "Other Organic Product" : "Sattu Product"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsEditProductModalOpen(false);
                  setEditingProduct(null);
                }}
                className="p-2.5 hover:bg-[#E5DEC9] rounded-2xl transition-colors text-[#7A6E63] hover:text-[#2A1B12] cursor-pointer"
              >
                <X size={22} />
              </button>
            </div>

            {/* Unified Upload Form in Edit Mode */}
            <div className="px-8 py-7">
              <UnifiedProductForm
                isEdit={true}
                product={editingProduct}
                onSuccess={handleEditProductSubmit}
                categories={categories}
                onOpenCategoryManager={() => {
                  setIsEditProductModalOpen(false);
                  setActiveItem("Category Manager");
                }}
              />
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Admin;
