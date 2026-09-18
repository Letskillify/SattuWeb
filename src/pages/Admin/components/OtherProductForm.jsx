import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { uploadToCloudinary } from "../Admin";
import { Plus, Trash2, Boxes, Layers, FileText, Image as ImageIcon } from "lucide-react";

const OTHER_CATEGORIES = [
  "Healthy Snacks",
  "Spices & Herbs",
  "Superfoods & Grains",
  "Oils & Ghee",
  "Pickles & Preserves",
  "Beverages",
  "Organic Staples",
  "Other Food Items"
];

const OtherProductForm = ({ onSuccess, isEdit = false, product = null }) => {
  const { register, handleSubmit, reset, formState } = useForm({
    defaultValues: {
      name: product?.name || "",
      category: product?.category || "Healthy Snacks",
      description: product?.description || "",
      price: product?.price || 0,
      original_price: product?.original_price || 0,
      stock_count: product?.stock_count !== undefined ? product.stock_count : (product?.stock_status === "Out of Stock" ? 0 : 50),
      ingredients: product?.ingredients || "",
      nutritional_info: product?.nutritional_info || "",
      net_quantity: product?.net_quantity || "250g",
      how_to_prepare: product?.how_to_prepare || "",
      rating: product?.rating || 4.5,
    },
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [variants, setVariants] = useState(
    product?.variants && product.variants.length > 0
      ? product.variants.map(v => ({
          ...v,
          stock_count: v.stock_count !== undefined ? Number(v.stock_count) : (v.stock_status === "Out of Stock" ? 0 : 50)
        }))
      : [
          {
            weight: product?.net_quantity || "250g",
            price: product?.price || 199,
            original_price: product?.original_price || 249,
            stock_count: 50,
          },
          {
            weight: "500g",
            price: (product?.price || 199) * 1.8,
            original_price: (product?.original_price || 249) * 1.8,
            stock_count: 30,
          },
        ]
  );

  const handleAddVariant = () => {
    setVariants([
      ...variants,
      {
        weight: "1kg",
        price: 449,
        original_price: 549,
        stock_count: 20,
      },
    ]);
  };

  const handleRemoveVariant = (index) => {
    if (variants.length <= 1) return;
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleVariantChange = (index, field, value) => {
    const updated = [...variants];
    updated[index] = {
      ...updated[index],
      [field]: field === "price" || field === "original_price" || field === "stock_count" ? Number(value) || 0 : value,
    };
    setVariants(updated);
  };

  const onSubmit = async (values) => {
    setError("");
    setLoading(true);
    try {
      const files = values.images?.[0] ? Array.from(values.images) : [];
      const uploadUrls = [];
      if (files.length > 0) {
        for (const file of files) {
          const url = await uploadToCloudinary(file);
          uploadUrls.push(url);
        }
      }

      const formattedVariants = variants.map(v => {
        const count = Number(v.stock_count) || 0;
        const status = count <= 0 ? "Out of Stock" : count <= 5 ? "Low Stock" : "In Stock";
        return {
          ...v,
          stock_count: count,
          stock_status: status
        };
      });

      const primaryVariant = formattedVariants[0] || {
        weight: values.net_quantity,
        price: Number(values.price),
        original_price: Number(values.original_price),
        stock_count: Number(values.stock_count) || 0,
        stock_status: (Number(values.stock_count) || 0) <= 0 ? "Out of Stock" : "In Stock"
      };

      const docData = {
        name: values.name,
        category: values.category,
        productType: "other",
        description: values.description,
        price: primaryVariant.price || Number(values.price) || 0,
        original_price: primaryVariant.original_price || Number(values.original_price) || 0,
        stock_count: primaryVariant.stock_count,
        stock_status: primaryVariant.stock_status,
        ingredients: values.ingredients,
        nutritional_info: values.nutritional_info,
        net_quantity: primaryVariant.weight || values.net_quantity,
        how_to_prepare: values.how_to_prepare,
        rating: Number(values.rating) || 4.5,
        variants: formattedVariants,
        images: uploadUrls.length > 0 ? uploadUrls : (product?.images || []),
        image: uploadUrls[0] || (product?.image || ""),
      };

      if (onSuccess) {
        await onSuccess(docData);
      }
      reset();
    } catch (err) {
      setError("Upload failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      
      {/* SECTION 1: BASIC INFO */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-[#E5DEC9]">
          <Boxes className="text-[#976E2A]" size={18} />
          <h3 className="text-xs font-poppins font-black uppercase tracking-widest text-[#2A1B12]">
            1. Organic Item Identity
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#2A1B12] uppercase tracking-wider">
              Product Name
            </label>
            <input
              className="w-full px-4 py-3 rounded-xl border border-[#E5DEC9] focus:border-[#976E2A] focus:ring-1 focus:ring-[#976E2A] outline-none transition-all text-xs font-medium bg-[#FDFBF7]"
              placeholder="e.g. Organic Roasted Makhana"
              {...register("name", { required: true })}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#2A1B12] uppercase tracking-wider">
              Category
            </label>
            <select
              className="w-full px-4 py-3 rounded-xl border border-[#E5DEC9] focus:border-[#976E2A] focus:ring-1 focus:ring-[#976E2A] outline-none transition-all text-xs font-medium bg-[#FDFBF7]"
              {...register("category", { required: true })}
            >
              {OTHER_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[#2A1B12] uppercase tracking-wider">
            Product Description
          </label>
          <textarea
            className="w-full px-4 py-3 rounded-xl border border-[#E5DEC9] focus:border-[#976E2A] focus:ring-1 focus:ring-[#976E2A] outline-none transition-all text-xs font-medium bg-[#FDFBF7] min-h-[80px]"
            placeholder="Detailed description, organic quality highlights..."
            rows={3}
            {...register("description")}
          />
        </div>
      </div>

      {/* SECTION 2: QUANTITY & NUMERIC STOCK VARIANTS */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between pb-2 border-b border-[#E5DEC9]">
          <div className="flex items-center gap-2">
            <Layers className="text-[#976E2A]" size={18} />
            <h3 className="text-xs font-poppins font-black uppercase tracking-widest text-[#2A1B12]">
              2. Quantity & Numeric Stock Variants
            </h3>
          </div>
          <button
            type="button"
            onClick={handleAddVariant}
            className="px-3 py-1.5 rounded-xl bg-[#976E2A]/10 text-[#976E2A] hover:bg-[#976E2A] hover:text-white text-xs font-bold transition-all flex items-center gap-1 border border-[#976E2A]/20"
          >
            <Plus size={14} /> Add Quantity Tier
          </button>
        </div>

        <div className="space-y-3">
          {variants.map((v, idx) => (
            <div
              key={idx}
              className="grid grid-cols-1 sm:grid-cols-5 gap-3 p-4 bg-[#FDFBF7] rounded-2xl border border-[#E5DEC9] items-center"
            >
              <div>
                <label className="text-[10px] font-bold text-[#7A6E63] uppercase block mb-1">
                  Weight / Quantity
                </label>
                <input
                  type="text"
                  value={v.weight}
                  onChange={(e) => handleVariantChange(idx, "weight", e.target.value)}
                  placeholder="e.g. 250g"
                  className="w-full px-3 py-2 rounded-xl border border-[#E5DEC9] text-xs font-bold bg-white"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-[#7A6E63] uppercase block mb-1">
                  Sale Price (₹)
                </label>
                <input
                  type="number"
                  value={v.price}
                  onChange={(e) => handleVariantChange(idx, "price", e.target.value)}
                  placeholder="199"
                  className="w-full px-3 py-2 rounded-xl border border-[#E5DEC9] text-xs font-bold bg-white"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-[#7A6E63] uppercase block mb-1">
                  MRP (₹)
                </label>
                <input
                  type="number"
                  value={v.original_price}
                  onChange={(e) => handleVariantChange(idx, "original_price", e.target.value)}
                  placeholder="249"
                  className="w-full px-3 py-2 rounded-xl border border-[#E5DEC9] text-xs font-bold bg-white"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-[#7A6E63] uppercase block mb-1">
                  Stock Units
                </label>
                <input
                  type="number"
                  min="0"
                  value={v.stock_count}
                  onChange={(e) => handleVariantChange(idx, "stock_count", e.target.value)}
                  placeholder="50"
                  className="w-full px-3 py-2 rounded-xl border border-[#E5DEC9] text-xs font-bold bg-white text-emerald-800"
                />
              </div>
              <div className="flex justify-end sm:pt-4">
                <button
                  type="button"
                  onClick={() => handleRemoveVariant(idx)}
                  disabled={variants.length <= 1}
                  className="p-2 rounded-xl text-red-500 hover:bg-red-100 disabled:opacity-30 transition-colors"
                  title="Remove Tier"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 3: SPECS & NUTRITION */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center gap-2 pb-2 border-b border-[#E5DEC9]">
          <FileText className="text-[#976E2A]" size={18} />
          <h3 className="text-xs font-poppins font-black uppercase tracking-widest text-[#2A1B12]">
            3. Composition & Usage Specs
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#2A1B12] uppercase tracking-wider">
              Rating (0 to 5)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="5"
              className="w-full px-4 py-3 rounded-xl border border-[#E5DEC9] focus:border-[#976E2A] outline-none text-xs font-medium bg-[#FDFBF7]"
              placeholder="4.5"
              {...register("rating")}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#2A1B12] uppercase tracking-wider">
              Ingredients / Composition
            </label>
            <input
              className="w-full px-4 py-3 rounded-xl border border-[#E5DEC9] focus:border-[#976E2A] outline-none text-xs font-medium bg-[#FDFBF7]"
              placeholder="e.g. 100% Organic Fox Nuts, Rock Salt..."
              {...register("ingredients")}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#2A1B12] uppercase tracking-wider">
              Nutritional Facts
            </label>
            <textarea
              className="w-full px-4 py-3 rounded-xl border border-[#E5DEC9] focus:border-[#976E2A] outline-none text-xs font-medium bg-[#FDFBF7] min-h-[70px]"
              placeholder="Per 100g: Protein 14g, Fiber 7g..."
              rows={2}
              {...register("nutritional_info")}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#2A1B12] uppercase tracking-wider">
              Serving / Usage Instructions
            </label>
            <textarea
              className="w-full px-4 py-3 rounded-xl border border-[#E5DEC9] focus:border-[#976E2A] outline-none text-xs font-medium bg-[#FDFBF7] min-h-[70px]"
              placeholder="Ready to eat healthy tea-time snack..."
              rows={2}
              {...register("how_to_prepare")}
            />
          </div>
        </div>
      </div>

      {/* SECTION 4: IMAGE UPLOAD */}
      <div className="space-y-2 pt-2">
        <div className="flex items-center gap-2 pb-2 border-b border-[#E5DEC9]">
          <ImageIcon className="text-[#976E2A]" size={18} />
          <h3 className="text-xs font-poppins font-black uppercase tracking-widest text-[#2A1B12]">
            4. Product Photography
          </h3>
        </div>
        <input
          type="file"
          multiple
          accept="image/*"
          className="w-full px-4 py-3 rounded-xl border border-dashed border-[#976E2A] hover:border-[#2A1B12] transition-colors text-xs file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#976E2A]/10 file:text-[#976E2A] cursor-pointer bg-[#FDFBF7]"
          {...register("images")}
        />
      </div>

      {/* FOOTER ACTIONS */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E5DEC9]">
        {formState.isSubmitted && !loading && !error && (
          <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            Product Saved Successfully
          </span>
        )}
        {error && <span className="text-xs font-bold text-red-600">Error: {error}</span>}
        <button
          type="submit"
          disabled={loading}
          className="px-8 py-3 rounded-2xl bg-[#976E2A] text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-[#976E2A]/20 hover:bg-[#2A1B12] transition-all disabled:opacity-50"
        >
          {loading ? "Saving Details..." : isEdit ? "Update Other Product" : "Publish Other Product"}
        </button>
      </div>
    </form>
  );
};

export default OtherProductForm;
