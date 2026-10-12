import React, { useState, useEffect } from 'react';
import { db } from '../../../components/Firebase';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  orderBy
} from 'firebase/firestore';
import {
  FolderPlus,
  Edit2,
  Trash2,
  Search,
  Plus,
  X,
  Check,
  AlertTriangle,
  Boxes,
  Sparkles,
  Layers,
  ArrowRight,
  RefreshCw,
  FolderTree
} from 'lucide-react';

export const DEFAULT_OTHER_CATEGORIES = [
  { name: "Healthy Snacks", slug: "healthy-snacks", description: "Roasted chips, makhanas, multigrain bites & trail mixes", icon: "🍿", badge: "Snacks" },
  { name: "Spices & Herbs", slug: "spices-herbs", description: "Authentic single-origin ground spices and therapeutic herbs", icon: "🌶️", badge: "Spices" },
  { name: "Superfoods & Grains", slug: "superfoods-grains", description: "Millets, ancient grains, quinoa, chia seeds & raw seeds", icon: "🌾", badge: "Superfoods" },
  { name: "Oils & Ghee", slug: "oils-ghee", description: "Wood-pressed / cold-pressed oils & traditional A2 desi bilona ghee", icon: "🫒", badge: "Oils & Ghee" },
  { name: "Pickles & Preserves", slug: "pickles-preserves", description: "Sun-cooked traditional village pickles and fruit preserves", icon: "🏺", badge: "Preserves" },
  { name: "Beverages", slug: "beverages", description: "Herbal tisanes, traditional thandai, organic green tea & sattu premixes", icon: "🍵", badge: "Drinks" },
  { name: "Organic Staples", slug: "organic-staples", description: "Unpolished dals, stone-ground flours, jaggery and Himalayan salts", icon: "🍯", badge: "Staples" },
  { name: "Other Food Items", slug: "other-food-items", description: "Curated organic pantry essentials and seasonal treats", icon: "✨", badge: "General" }
];

const CategoryManager = ({ products = [], onCategoriesUpdated }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    icon: "🌱",
    badge: "Organic",
  });
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Load categories from Firestore (or seed defaults if empty)
  const loadCategories = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "categories"), orderBy("name", "asc"));
      const snap = await getDocs(q);
      
      if (snap.empty) {
        // Fallback / Pre-seed default categories in local state
        setCategories(DEFAULT_OTHER_CATEGORIES.map((c, idx) => ({ id: `default-${idx}`, ...c, isDefault: true })));
      } else {
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setCategories(list);
      }
      if (onCategoriesUpdated) onCategoriesUpdated();
    } catch (err) {
      console.error("Error loading categories:", err);
      // Fallback to defaults
      setCategories(DEFAULT_OTHER_CATEGORIES.map((c, idx) => ({ id: `default-${idx}`, ...c, isDefault: true })));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // Quick seed to Firestore if user clicks "Initialize Default Categories"
  const handleSeedDefaults = async () => {
    setSubmitting(true);
    try {
      for (const cat of DEFAULT_OTHER_CATEGORIES) {
        await addDoc(collection(db, "categories"), {
          ...cat,
          createdAt: serverTimestamp()
        });
      }
      setFeedback({ type: "success", message: "Default categories populated successfully into Firestore!" });
      await loadCategories();
    } catch (err) {
      setFeedback({ type: "error", message: "Failed to seed categories: " + err.message });
    } finally {
      setSubmitting(false);
      setTimeout(() => setFeedback({ type: "", message: "" }), 4000);
    }
  };

  // Open modal for add
  const handleOpenAdd = () => {
    setEditingCategory(null);
    setFormData({
      name: "",
      slug: "",
      description: "",
      icon: "🌿",
      badge: "Organic",
    });
    setIsModalOpen(true);
  };

  // Open modal for edit
  const handleOpenEdit = (cat) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name || "",
      slug: cat.slug || "",
      description: cat.description || "",
      icon: cat.icon || "🌿",
      badge: cat.badge || "Organic",
    });
    setIsModalOpen(true);
  };

  // Form submission (Add or Edit)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setSubmitting(true);
    try {
      const slugVal = formData.slug.trim() || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const payload = {
        name: formData.name.trim(),
        slug: slugVal,
        description: formData.description.trim(),
        icon: formData.icon.trim() || "🌿",
        badge: formData.badge.trim() || "Category",
        updatedAt: serverTimestamp()
      };

      if (editingCategory && !editingCategory.id.startsWith("default-")) {
        // Update in Firestore
        await updateDoc(doc(db, "categories", editingCategory.id), payload);
        setFeedback({ type: "success", message: `Category "${formData.name}" updated successfully!` });
      } else {
        // Add new to Firestore
        await addDoc(collection(db, "categories"), {
          ...payload,
          createdAt: serverTimestamp()
        });
        setFeedback({ type: "success", message: `Category "${formData.name}" created successfully!` });
      }

      setIsModalOpen(false);
      await loadCategories();
    } catch (err) {
      console.error(err);
      setFeedback({ type: "error", message: "Action failed: " + err.message });
    } finally {
      setSubmitting(false);
      setTimeout(() => setFeedback({ type: "", message: "" }), 4000);
    }
  };

  // Delete category
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setSubmitting(true);
    try {
      if (!deleteTarget.id.startsWith("default-")) {
        await deleteDoc(doc(db, "categories", deleteTarget.id));
      } else {
        // Filter out from local state if default
        setCategories(prev => prev.filter(c => c.id !== deleteTarget.id));
      }
      setFeedback({ type: "success", message: `Category "${deleteTarget.name}" deleted successfully.` });
      setDeleteTarget(null);
      await loadCategories();
    } catch (err) {
      setFeedback({ type: "error", message: "Failed to delete: " + err.message });
    } finally {
      setSubmitting(false);
      setTimeout(() => setFeedback({ type: "", message: "" }), 4000);
    }
  };

  // Calculate product count assigned to each category
  const getProductCountForCategory = (catName) => {
    return products.filter(p => p.category?.toLowerCase() === catName?.toLowerCase()).length;
  };

  // Filter categories by search query
  const filteredCategories = categories.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.badge?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* FEEDBACK TOAST */}
      {feedback.message && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between text-sm font-bold shadow-md transition-all ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-900 border border-emerald-200"
              : "bg-red-50 text-red-900 border border-red-200"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedback.type === "success" ? <Check size={18} /> : <AlertTriangle size={18} />}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback({ type: "", message: "" })} className="p-1 hover:opacity-75">
            <X size={16} />
          </button>
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="bg-white rounded-3xl border border-[#E5DEC9] shadow-[0_4px_25px_rgba(0,0,0,0.03)] p-6 md:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-[#E5DEC9]">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="px-3 py-1 rounded-full bg-[#976E2A]/15 text-[#976E2A] text-xs font-poppins font-black uppercase tracking-widest border border-[#976E2A]/30 flex items-center gap-1.5 shadow-2xs">
                <FolderTree size={13} /> Catalog Taxonomy
              </span>
              <span className="text-xs text-[#7A6E63] font-semibold">
                Used in "Other Products" & Store Filters
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-poppins font-black text-[#2A1B12] tracking-tight">
              Category Manager
            </h2>
            <p className="text-sm text-[#7A6E63] font-medium mt-1">
              Add, edit, and organize product categories for organic food items, snacks, spices, oils & beverages.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleOpenAdd}
              className="px-5 py-3 rounded-2xl bg-[#976E2A] text-white text-sm font-extrabold shadow-md shadow-[#976E2A]/25 hover:bg-[#2A1B12] hover:scale-[1.02] active:scale-100 transition-all flex items-center gap-2.5 cursor-pointer"
            >
              <Plus size={18} />
              <span>Add New Category</span>
            </button>

            {categories.some(c => c.isDefault) && (
              <button
                type="button"
                onClick={handleSeedDefaults}
                disabled={submitting}
                className="px-4 py-3 rounded-2xl bg-[#FAF7F2] text-[#6b4f3a] border border-[#E5DEC9] hover:bg-[#E5DEC9] text-xs sm:text-sm font-extrabold transition-all flex items-center gap-2 cursor-pointer"
                title="Save standard categories into Firestore database"
              >
                <RefreshCw size={15} className={submitting ? "animate-spin" : ""} />
                <span>Save Defaults to Database</span>
              </button>
            )}
          </div>
        </div>

        {/* SEARCH & STATS BAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#976E2A]" size={17} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search categories..."
              className="w-full bg-[#FAF7F2] border border-[#E5DEC9] focus:border-[#976E2A] focus:bg-white outline-none py-2.5 pl-11 pr-4 rounded-2xl text-sm font-semibold text-[#2A1B12] transition-all"
            />
          </div>

          <div className="flex items-center gap-3 text-xs font-bold text-[#7A6E63]">
            <span className="px-3.5 py-1.5 rounded-full bg-[#FAF7F2] border border-[#E5DEC9]">
              Total Categories: <strong className="text-[#2A1B12]">{categories.length}</strong>
            </span>
            <span className="px-3.5 py-1.5 rounded-full bg-[#FAF7F2] border border-[#E5DEC9]">
              Matching: <strong className="text-[#976E2A]">{filteredCategories.length}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* CATEGORIES GRID */}
      {loading ? (
        <div className="p-12 text-center text-[#7A6E63] bg-white rounded-3xl border border-[#E5DEC9]">
          <RefreshCw size={24} className="animate-spin mx-auto text-[#976E2A] mb-3" />
          <p className="font-bold text-sm">Loading categories from database...</p>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="p-12 text-center text-[#7A6E63] bg-white rounded-3xl border border-[#E5DEC9]">
          <Layers size={36} className="mx-auto text-[#976E2A] opacity-50 mb-3" />
          <p className="font-black text-lg text-[#2A1B12]">No Categories Found</p>
          <p className="text-xs sm:text-sm font-medium mt-1">Try a different search or create a new category.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredCategories.map((cat) => {
            const productCount = getProductCountForCategory(cat.name);
            return (
              <div
                key={cat.id}
                className="bg-white rounded-3xl border border-[#E5DEC9] p-6 shadow-[0_4px_25px_rgba(0,0,0,0.03)] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
              >
                {/* Decorative Top Accent */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#D9A036] via-[#B88222] to-[#6b4f3a] opacity-80" />

                <div>
                  <div className="flex items-start justify-between gap-3 mb-4 pt-1">
                    <div className="w-13 h-13 rounded-2xl bg-[#FAF7F2] border border-[#E5DEC9] flex items-center justify-center text-2xl shadow-xs group-hover:scale-110 group-hover:bg-[#FAF4E3] transition-all">
                      {cat.icon || "🌿"}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(cat)}
                        className="p-2 rounded-xl text-[#7A6E63] hover:text-[#976E2A] hover:bg-[#FAF7F2] transition-colors cursor-pointer"
                        title="Edit Category"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(cat)}
                        className="p-2 rounded-xl text-[#7A6E63] hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        title="Delete Category"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#976E2A]/10 text-[#976E2A] text-[11px] font-extrabold uppercase tracking-wider">
                      {cat.badge || "Category"}
                    </span>
                    {cat.isDefault && (
                      <span className="text-[10px] text-[#A69280] font-bold uppercase tracking-wider">
                        Default
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-poppins font-black text-[#2A1B12] group-hover:text-[#976E2A] transition-colors leading-snug">
                    {cat.name}
                  </h3>

                  <p className="text-xs text-[#7A6E63] font-medium mt-2 line-clamp-2 leading-relaxed">
                    {cat.description || "General category for organic store products."}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-[#E5DEC9]/70 flex items-center justify-between text-xs font-bold">
                  <span className="text-[#7A6E63]">Assigned Products:</span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-black ${
                      productCount > 0
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        : "bg-gray-100 text-gray-500 border border-gray-200"
                    }`}
                  >
                    {productCount} {productCount === 1 ? "Product" : "Products"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT CATEGORY MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#140D08]/75 backdrop-blur-md p-4">
          <div className="bg-[#FDFBF7] rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-[#E5DEC9] animate-scaleUp">
            
            <div className="px-7 py-5 border-b border-[#E5DEC9] flex items-center justify-between sticky top-0 bg-[#FDFBF7]/95 backdrop-blur-md z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#976E2A]/15 text-[#976E2A] flex items-center justify-center font-bold">
                  <FolderPlus size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-poppins font-black text-[#2A1B12]">
                    {editingCategory ? "Edit Category" : "Add New Category"}
                  </h3>
                  <p className="text-xs text-[#7A6E63] font-semibold mt-0.5">
                    Define name, emoji icon, badge, and description
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-[#E5DEC9] rounded-2xl transition-colors text-[#7A6E63] hover:text-[#2A1B12] cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-7 space-y-5">
              
              {/* Category Name & Emoji Icon */}
              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-3 space-y-1.5">
                  <label className="text-xs font-poppins font-black text-[#2A1B12] uppercase tracking-wider">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Cold-Pressed Oils & Ghee"
                    className="w-full bg-white border border-[#E5DEC9] focus:border-[#976E2A] focus:ring-1 focus:ring-[#976E2A] outline-none px-4 py-3 rounded-2xl text-sm font-bold text-[#2A1B12]"
                  />
                </div>

                <div className="col-span-1 space-y-1.5">
                  <label className="text-xs font-poppins font-black text-[#2A1B12] uppercase tracking-wider text-center block">
                    Icon
                  </label>
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    placeholder="🌿"
                    className="w-full text-center text-xl bg-white border border-[#E5DEC9] focus:border-[#976E2A] outline-none py-2.5 rounded-2xl font-bold"
                  />
                </div>
              </div>

              {/* Badge Tag & URL Slug */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-poppins font-black text-[#2A1B12] uppercase tracking-wider">
                    Badge Label
                  </label>
                  <input
                    type="text"
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    placeholder="e.g. Superfoods"
                    className="w-full bg-white border border-[#E5DEC9] focus:border-[#976E2A] outline-none px-4 py-3 rounded-2xl text-sm font-semibold text-[#2A1B12]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-poppins font-black text-[#2A1B12] uppercase tracking-wider">
                    URL Slug (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="auto-generated"
                    className="w-full bg-white border border-[#E5DEC9] focus:border-[#976E2A] outline-none px-4 py-3 rounded-2xl text-sm font-semibold text-[#2A1B12]"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-poppins font-black text-[#2A1B12] uppercase tracking-wider">
                  Category Description
                </label>
                <textarea
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Provide a clear description of items that belong in this category..."
                  className="w-full bg-white border border-[#E5DEC9] focus:border-[#976E2A] outline-none p-4 rounded-2xl text-sm font-medium text-[#2A1B12] resize-none"
                />
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-[#E5DEC9] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-3 rounded-2xl bg-white border border-[#E5DEC9] hover:bg-[#FAF7F2] text-sm font-extrabold text-[#7A6E63] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-3 rounded-2xl bg-[#976E2A] text-white text-sm font-black shadow-md hover:bg-[#2A1B12] transition-all cursor-pointer flex items-center gap-2"
                >
                  {submitting && <RefreshCw size={15} className="animate-spin" />}
                  <span>{editingCategory ? "Update Category" : "Save Category"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#140D08]/75 backdrop-blur-md p-4">
          <div className="bg-[#FDFBF7] rounded-3xl shadow-2xl max-w-md w-full border border-red-200 p-6 space-y-5 animate-scaleUp">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center font-bold shrink-0">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h4 className="text-lg font-poppins font-black text-[#2A1B12]">
                  Delete Category?
                </h4>
                <p className="text-xs text-[#7A6E63] font-semibold mt-0.5">
                  Are you sure you want to remove "{deleteTarget.name}"?
                </p>
              </div>
            </div>

            {getProductCountForCategory(deleteTarget.name) > 0 && (
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold flex items-center gap-2.5">
                <AlertTriangle size={16} className="text-amber-700 shrink-0" />
                <span>
                  Warning: <strong>{getProductCountForCategory(deleteTarget.name)}</strong> existing products are currently assigned to this category.
                </span>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E5DEC9]">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2.5 rounded-2xl bg-white border border-[#E5DEC9] text-xs sm:text-sm font-bold text-[#7A6E63] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={submitting}
                className="px-5 py-2.5 rounded-2xl bg-red-600 text-white text-xs sm:text-sm font-black shadow-md hover:bg-red-700 transition-all cursor-pointer flex items-center gap-2"
              >
                {submitting && <RefreshCw size={14} className="animate-spin" />}
                <span>Delete Category</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default CategoryManager;
