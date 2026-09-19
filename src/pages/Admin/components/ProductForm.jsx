import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { uploadToCloudinary } from "../Admin";
import { Plus, Trash2, Package, Layers, FileText, Image as ImageIcon } from "lucide-react";

const SattuProductForm = ({ onSuccess, isEdit = false, product = null }) => {
  const { register, handleSubmit, reset, formState } = useForm({
    defaultValues: {
      name: product?.name || "",
      flavor: product?.flavor || "",
      description: product?.description || "",
      price: product?.price || 0,
      original_price: product?.original_price || 0,
      stock_count: product?.stock_count !== undefined ? product.stock_count : (product?.stock_status === "Out of Stock" ? 0 : 50),
      ingredients: product?.ingredients || "",
      nutritional_info: product?.nutritional_info || "",
      net_quantity: product?.net_quantity || "500g",
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
            price: product?.price || 149,
            original_price: product?.original_price || 199,
            stock_count: 50,
          },
          {
            weight: "500g",
            price: (product?.price || 149) * 1.8,
            original_price: (product?.original_price || 199) * 1.8,
            stock_count: 30,
          },
        ]
  );

  const flavors = [
    "Classic Roasted",
    "Elaichi",
    "Rose",
    "Dry Fruit",
    "Chocolate",
    "Namkeen Spicy",
  ];

  const handleAddVariant = () => {
    setVariants([
      ...variants,
      {
        weight: "1kg",
        price: 399,
        original_price: 499,
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
        flavor: values.flavor,
        productType: "sattu",
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-7">
      
      {/* SECTION 1: BASIC INFO */}
      <div className="space-y-4">
        <div className="flex items-center gap-2.5 pb-2.5 border-b border-[#E5DEC9]">
          <Package className="text-[#6b4f3a]" size={20} />
          <h3 className="text-xs sm:text-sm font-poppins font-black uppercase tracking-wider text-[#2A1B12]">
            1. Basic Product Identity
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-extrabold text-[#2A1B12] uppercase tracking-wider block">
              Product Name
            </label>
            <input
              className="w-full px-4 py-3.5 rounded-2xl border border-[#E5DEC9] focus:border-[#6b4f3a] focus:ring-1 focus:ring-[#6b4f3a] outline-none transition-all text-sm font-semibold bg-[#FDFBF7]"
              placeholder="e.g. Premium Elaichi Sattu Mix"
              {...register("name", { required: true })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-extrabold text-[#2A1B12] uppercase tracking-wider block">
              Flavor Category
            </label>
            <select
              className="w-full px-4 py-3.5 rounded-2xl border border-[#E5DEC9] focus:border-[#6b4f3a] focus:ring-1 focus:ring-[#6b4f3a] outline-none transition-all text-sm font-semibold bg-[#FDFBF7]"
              {...register("flavor", { required: true })}
            >
              <option value="">Select Flavor</option>
              {flavors.map((flavor) => (
                <option key={flavor} value={flavor}>
                  {flavor}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs sm:text-sm font-extrabold text-[#2A1B12] uppercase tracking-wider block">
            Product Description
          </label>
          <textarea
            className="w-full px-4 py-3.5 rounded-2xl border border-[#E5DEC9] focus:border-[#6b4f3a] focus:ring-1 focus:ring-[#6b4f3a] outline-none transition-all text-sm font-semibold bg-[#FDFBF7] min-h-[90px]"
            placeholder="Describe traditional roasting, nutritional benefits..."
            rows={3}
            {...register("description")}
          />
        </div>
      </div>

      {/* SECTION 2: QUANTITY & NUMERIC STOCK VARIANTS */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-[#E5DEC9]">
          <div className="flex items-center gap-2.5">
            <Layers className="text-[#976E2A]" size={20} />
            <h3 className="text-xs sm:text-sm font-poppins font-black uppercase tracking-wider text-[#2A1B12]">
              2. Quantity & Numeric Stock Variants
            </h3>
          </div>
          <button
            type="button"
            onClick={handleAddVariant}
            className="px-4 py-2 rounded-2xl bg-[#6b4f3a]/15 text-[#6b4f3a] hover:bg-[#6b4f3a] hover:text-white text-xs sm:text-sm font-extrabold transition-all flex items-center gap-1.5 border border-[#6b4f3a]/30 self-start sm:self-auto cursor-pointer"
          >
            <Plus size={16} /> Add Quantity Tier
          </button>
        </div>

        <div className="space-y-3.5">
          {variants.map((v, idx) => (
            <div
              key={idx}
              className="grid grid-cols-1 sm:grid-cols-5 gap-3.5 p-4 md:p-5 bg-[#FDFBF7] rounded-3xl border border-[#E5DEC9] items-center"
            >
              <div>
                <label className="text-xs font-extrabold text-[#7A6E63] uppercase block mb-1.5">
                  Weight / Quantity
                </label>
                <input
                  type="text"
                  value={v.weight}
                  onChange={(e) => handleVariantChange(idx, "weight", e.target.value)}
                  placeholder="e.g. 250g"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5DEC9] text-sm font-bold bg-white"
                />
              </div>
              <div>
                <label className="text-xs font-extrabold text-[#7A6E63] uppercase block mb-1.5">
                  Sale Price (₹)
                </label>
                <input
                  type="number"
                  value={v.price}
                  onChange={(e) => handleVariantChange(idx, "price", e.target.value)}
                  placeholder="149"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5DEC9] text-sm font-bold bg-white"
                />
              </div>
              <div>
                <label className="text-xs font-extrabold text-[#7A6E63] uppercase block mb-1.5">
                  MRP (₹)
                </label>
                <input
                  type="number"
                  value={v.original_price}
                  onChange={(e) => handleVariantChange(idx, "original_price", e.target.value)}
                  placeholder="199"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5DEC9] text-sm font-bold bg-white"
                />
              </div>
              <div>
                <label className="text-xs font-extrabold text-[#7A6E63] uppercase block mb-1.5">
                  Stock Units
                </label>
                <input
                  type="number"
                  min="0"
                  value={v.stock_count}
                  onChange={(e) => handleVariantChange(idx, "stock_count", e.target.value)}
                  placeholder="50"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5DEC9] text-sm font-black bg-white text-emerald-800"
                />
              </div>
              <div className="flex justify-end sm:pt-4">
                <button
                  type="button"
                  onClick={() => handleRemoveVariant(idx)}
                  disabled={variants.length <= 1}
                  className="p-2.5 rounded-xl text-red-600 hover:bg-red-100 disabled:opacity-30 transition-colors cursor-pointer"
                  title="Remove Tier"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 3: SPECS & NUTRITION */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center gap-2.5 pb-2.5 border-b border-[#E5DEC9]">
          <FileText className="text-[#6b4f3a]" size={20} />
          <h3 className="text-xs sm:text-sm font-poppins font-black uppercase tracking-wider text-[#2A1B12]">
            3. Ingredients & Preparation Specs
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-extrabold text-[#2A1B12] uppercase tracking-wider block">
              Rating (0 to 5)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="5"
              className="w-full px-4 py-3.5 rounded-2xl border border-[#E5DEC9] focus:border-[#6b4f3a] outline-none text-sm font-semibold bg-[#FDFBF7]"
              placeholder="4.5"
              {...register("rating")}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-extrabold text-[#2A1B12] uppercase tracking-wider block">
              Ingredients
            </label>
            <input
              className="w-full px-4 py-3.5 rounded-2xl border border-[#E5DEC9] focus:border-[#6b4f3a] outline-none text-sm font-semibold bg-[#FDFBF7]"
              placeholder="e.g. Roasted Chana Gram, Barley, Elaichi..."
              {...register("ingredients")}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-extrabold text-[#2A1B12] uppercase tracking-wider block">
              Nutritional Facts
            </label>
            <textarea
              className="w-full px-4 py-3.5 rounded-2xl border border-[#E5DEC9] focus:border-[#6b4f3a] outline-none text-sm font-semibold bg-[#FDFBF7] min-h-[80px]"
              placeholder="Per 100g: Protein 20g, Fiber 8g..."
              rows={2}
              {...register("nutritional_info")}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-extrabold text-[#2A1B12] uppercase tracking-wider block">
              How to Prepare
            </label>
            <textarea
              className="w-full px-4 py-3.5 rounded-2xl border border-[#E5DEC9] focus:border-[#6b4f3a] outline-none text-sm font-semibold bg-[#FDFBF7] min-h-[80px]"
              placeholder="Mix 2 tbsp in chilled water or milk..."
              rows={2}
              {...register("how_to_prepare")}
            />
          </div>
        </div>
      </div>

      {/* SECTION 4: IMAGE UPLOAD */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center gap-2.5 pb-2.5 border-b border-[#E5DEC9]">
          <ImageIcon className="text-[#976E2A]" size={20} />
          <h3 className="text-xs sm:text-sm font-poppins font-black uppercase tracking-wider text-[#2A1B12]">
            4. Product Photography
          </h3>
        </div>
        <input
          type="file"
          multiple
          accept="image/*"
          className="w-full px-4 py-3.5 rounded-2xl border border-dashed border-[#6b4f3a] hover:border-[#2A1B12] transition-colors text-xs sm:text-sm file:mr-4 file:py-2.5 file:px-4.5 file:rounded-xl file:border-0 file:text-xs sm:file:text-sm file:font-bold file:bg-[#6b4f3a]/15 file:text-[#6b4f3a] cursor-pointer bg-[#FDFBF7]"
          {...register("images")}
        />
      </div>

      {/* FOOTER ACTIONS */}
      <div className="flex flex-wrap items-center justify-end gap-4 pt-5 border-t border-[#E5DEC9]">
        {formState.isSubmitted && !loading && !error && (
          <span className="text-xs sm:text-sm font-extrabold text-emerald-700 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            Product Saved Successfully
          </span>
        )}
        {error && <span className="text-xs sm:text-sm font-extrabold text-red-600">Error: {error}</span>}
        <button
          type="submit"
          disabled={loading}
          className="px-8 py-3.5 rounded-2xl bg-[#6b4f3a] text-white text-xs sm:text-sm font-extrabold uppercase tracking-wider shadow-lg shadow-[#6b4f3a]/25 hover:bg-[#2A1B12] transition-all disabled:opacity-50 cursor-pointer"
        >
          {loading ? "Saving Details..." : isEdit ? "Update Sattu Product" : "Publish Sattu Product"}
        </button>
      </div>
    </form>
  );
};

export default SattuProductForm;
