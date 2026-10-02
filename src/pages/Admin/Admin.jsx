import React, { useState, useEffect } from "react";
import axios from "axios";
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

// Import components
import AdminSidebar from "./components/AdminSidebar";
import AdminHeader from "./components/AdminHeader";
import MetricCards from "./components/MetricCards";
import ProductsTable from "./components/ProductsTable";
import OrdersTable from "./components/OrdersTable";
import UsersTable from "./components/UsersTable";
import FlavorsOverview from "./components/FlavorsOverview";
import SattuProductForm from "./components/ProductForm";
import OtherProductForm from "./components/OtherProductForm";
import HomepageManager from "./components/HomepageManager";
import { X, Package, Boxes } from "lucide-react";
import { useAuth } from "../../components/useAuth";
import { useNavigate } from "react-router-dom";

export const uploadToCloudinary = async (file) => {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME ;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET ;
  const assetFolder = import.meta.env.VITE_CLOUDINARY_ASSET_FOLDER ;

  const data = new FormData();
  data.append("file", file);
  data.append("upload_preset", uploadPreset);
  data.append("folder", assetFolder);

  const res = await axios.post(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    data
  );

  return res.data.secure_url;
};

const Admin = () => {
  const [activeItem, setActiveItem] = useState("Dashboard");
  const [isSattuModalOpen, setIsSattuModalOpen] = useState(false);
  const [isOtherModalOpen, setIsOtherModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [users, setUsers] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/admin/login");
    }
  }, [user, navigate]);

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
    loadUsers();
  }, []);

  const handleDeleteProduct = async (id) => {
    await deleteDoc(doc(db, "products", id));
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const handleEditClick = (product) => {
    setEditingProduct(product);
    setIsEditModalOpen(true);
  };

  const handleAddProductSubmit = async (docData) => {
    await addDoc(collection(db, "products"), {
      ...docData,
      createdAt: serverTimestamp(),
    });
    setIsSattuModalOpen(false);
    setIsOtherModalOpen(false);
    await loadProducts();
  };

  const handleEditProductSubmit = async (docData) => {
    if (!editingProduct?.id) return;
    await updateDoc(doc(db, "products", editingProduct.id), docData);
    setIsEditModalOpen(false);
    setEditingProduct(null);
    await loadProducts();
  };

  const sattuProducts = products.filter((p) => p.productType !== "other");
  const otherProducts = products.filter((p) => p.productType === "other");

  const renderMainContent = () => {
    switch (activeItem) {
      case "Sattu Products":
      case "Products":
        return (
          <>
            <MetricCards />
            <ProductsTable
              products={sattuProducts}
              onEdit={handleEditClick}
              onDelete={handleDeleteProduct}
              title="Sattu Blends Catalog"
              subtitle="Manage traditional roasted chana sattu products"
              isOther={false}
            />
          </>
        );

      case "Other Products":
        return (
          <>
            <MetricCards />
            <ProductsTable
              products={otherProducts}
              onEdit={handleEditClick}
              onDelete={handleDeleteProduct}
              title="Other Products Catalog"
              subtitle="Manage snacks, spices, grains, oils, and other food items"
              isOther={true}
            />
          </>
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

      case "Users":
        return (
          <>
            <MetricCards />
            <UsersTable users={users} />
          </>
        );

      case "Homepage Manager":
        return <HomepageManager />;

      default:
        return (
          <>
            <MetricCards />
            <div className="grid gap-8 lg:grid-cols-2 mb-8">
              <ProductsTable
                products={sattuProducts}
                onEdit={handleEditClick}
                onDelete={handleDeleteProduct}
                title="Sattu Blends"
                subtitle="Recent sattu products"
                isOther={false}
              />
              <ProductsTable
                products={otherProducts}
                onEdit={handleEditClick}
                onDelete={handleDeleteProduct}
                title="Other Products"
                subtitle="Recent food & organic items"
                isOther={true}
              />
            </div>
            <OrdersTable />
          </>
        );
    }
  };

  return (
    <div className="min-h-screen flex bg-[#FAF7F2] text-[#2A1B12] font-sans selection:bg-[#D9A036] selection:text-white">
      <AdminSidebar activeItem={activeItem} setActiveItem={setActiveItem} />

      <main className="flex-1 px-6 py-8 md:px-10 lg:px-12 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <AdminHeader
            activeItem={activeItem}
            onOpenSattuModal={() => setIsSattuModalOpen(true)}
            onOpenOtherModal={() => setIsOtherModalOpen(true)}
          />

          {renderMainContent()}
        </div>
      </main>

      {/* Add Sattu Product Modal */}
      {isSattuModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#140D08]/75 backdrop-blur-md p-4">
          <div className="bg-[#FDFBF7] rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-[#E5DEC9]">
            <div className="px-8 py-6 border-b border-[#E5DEC9] flex items-center justify-between sticky top-0 bg-[#FDFBF7]/95 backdrop-blur-md z-10">
              <div>
                <h2 className="text-xl sm:text-2xl font-poppins font-black text-[#2A1B12] flex items-center gap-2.5">
                  <Package className="text-[#6b4f3a]" size={24} />
                  Add New Sattu Product
                </h2>
                <p className="text-xs sm:text-sm text-[#7A6E63] font-semibold mt-1">
                  Configure flavor, description, and numeric stock weight variants
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsSattuModalOpen(false)}
                className="p-2.5 hover:bg-[#E5DEC9] rounded-2xl transition-colors text-[#7A6E63] hover:text-[#2A1B12] cursor-pointer"
              >
                <X size={22} />
              </button>
            </div>
            <div className="px-8 py-6">
              <SattuProductForm onSuccess={handleAddProductSubmit} />
            </div>
          </div>
        </div>
      )}

      {/* Add Other Product Modal */}
      {isOtherModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#140D08]/75 backdrop-blur-md p-4">
          <div className="bg-[#FDFBF7] rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-[#E5DEC9]">
            <div className="px-8 py-6 border-b border-[#E5DEC9] flex items-center justify-between sticky top-0 bg-[#FDFBF7]/95 backdrop-blur-md z-10">
              <div>
                <h2 className="text-xl sm:text-2xl font-poppins font-black text-[#2A1B12] flex items-center gap-2.5">
                  <Boxes className="text-[#976E2A]" size={24} />
                  Add New Other Organic Product
                </h2>
                <p className="text-xs sm:text-sm text-[#7A6E63] font-semibold mt-1">
                  Add snacks, spices, grains, oils, or organic food products
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOtherModalOpen(false)}
                className="p-2.5 hover:bg-[#E5DEC9] rounded-2xl transition-colors text-[#7A6E63] hover:text-[#2A1B12] cursor-pointer"
              >
                <X size={22} />
              </button>
            </div>
            <div className="px-8 py-6">
              <OtherProductForm onSuccess={handleAddProductSubmit} />
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {isEditModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#140D08]/75 backdrop-blur-md p-4">
          <div className="bg-[#FDFBF7] rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-[#E5DEC9]">
            <div className="px-8 py-6 border-b border-[#E5DEC9] flex items-center justify-between sticky top-0 bg-[#FDFBF7]/95 backdrop-blur-md z-10">
              <div>
                <h2 className="text-xl sm:text-2xl font-poppins font-black text-[#2A1B12]">
                  Edit {editingProduct.productType === "other" ? "Other Product" : "Sattu Product"}
                </h2>
                <p className="text-xs sm:text-sm text-[#7A6E63] font-semibold mt-1">
                  Update details & quantity stock tiers for {editingProduct.name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-2.5 hover:bg-[#E5DEC9] rounded-2xl transition-colors text-[#7A6E63] hover:text-[#2A1B12] cursor-pointer"
              >
                <X size={22} />
              </button>
            </div>
            <div className="px-8 py-6">
              {editingProduct.productType === "other" ? (
                <OtherProductForm
                  product={editingProduct}
                  isEdit={true}
                  onSuccess={handleEditProductSubmit}
                />
              ) : (
                <SattuProductForm
                  product={editingProduct}
                  isEdit={true}
                  onSuccess={handleEditProductSubmit}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
