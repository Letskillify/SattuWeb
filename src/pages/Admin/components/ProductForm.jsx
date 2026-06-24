import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { uploadToCloudinary } from "../Admin";

const SattuProductForm = ({ onSuccess, isEdit = false, product = null }) => {
  const { register, handleSubmit, reset, formState } = useForm({
    defaultValues: {
      name: product?.name || "",
      flavor: product?.flavor || "",
      description: product?.description || "",
      price: product?.price || 0,
      original_price: product?.original_price || 0,
      stock_status: product?.stock_status || "In Stock",
      ingredients: product?.ingredients || "",
      nutritional_info: product?.nutritional_info || "",
      net_quantity: product?.net_quantity || "",
      how_to_prepare: product?.how_to_prepare || "",
      rating: product?.rating || 4.5,
    },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const flavors = [
    "Classic Roasted",
    "Elaichi",
    "Rose",
    "Dry Fruit",
    "Chocolate",
    "Namkeen Spicy"
  ];

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

      const docData = {
        name: values.name,
        flavor: values.flavor,
        description: values.description,
        price: Number(values.price) || 0,
        original_price: Number(values.original_price) || 0,
        stock_status: values.stock_status,
        ingredients: values.ingredients,
        nutritional_info: values.nutritional_info,
        net_quantity: values.net_quantity,
        how_to_prepare: values.how_to_prepare,
        rating: Number(values.rating) || 4.5,
        images: uploadUrls,
        image: uploadUrls[0] || (product?.image || ""),
      };

      if (onSuccess) {
        onSuccess(docData);
      }
      reset();
    } catch (err) {
      setError("Upload failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-[#1C2B21] uppercase tracking-wide">
            Product Name
          </label>
          <input
            className="w-full px-4 py-3 rounded-xl border border-[#D9D3C7] focus:border-[#4A5D4E] focus:ring-1 focus:ring-[#4A5D4E] outline-none transition-all text-sm bg-[#FDFBF7]"
            placeholder="e.g. Premium Elaichi Sattu Mix"
            {...register("name", { required: true })}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-[#1C2B21] uppercase tracking-wide">
            Flavor
          </label>
          <select
            className="w-full px-4 py-3 rounded-xl border border-[#D9D3C7] focus:border-[#4A5D4E] focus:ring-1 focus:ring-[#4A5D4E] outline-none transition-all text-sm bg-[#FDFBF7]"
            {...register("flavor", { required: true })}
          >
            <option value="">Select Flavor</option>
            {flavors.map((flavor) => (
              <option key={flavor} value={flavor}>{flavor}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-[#1C2B21] uppercase tracking-wide">
          Description
        </label>
        <textarea
          className="w-full px-4 py-3 rounded-xl border border-[#D9D3C7] focus:border-[#4A5D4E] focus:ring-1 focus:ring-[#4A5D4E] outline-none transition-all text-sm bg-[#FDFBF7] min-h-[100px]"
          placeholder="Describe the sattu mix, its benefits, and traditional roots..."
          rows={4}
          {...register("description")}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-[#1C2B21] uppercase tracking-wide">
            Original Price (₹)
          </label>
          <input
            type="number"
            className="w-full px-4 py-3 rounded-xl border border-[#D9D3C7] focus:border-[#4A5D4E] focus:ring-1 focus:ring-[#4A5D4E] outline-none transition-all text-sm bg-[#FDFBF7]"
            placeholder="249"
            {...register("original_price")}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-[#1C2B21] uppercase tracking-wide">
            Sale Price (₹)
          </label>
          <input
            type="number"
            className="w-full px-4 py-3 rounded-xl border border-[#D9D3C7] focus:border-[#4A5D4E] focus:ring-1 focus:ring-[#4A5D4E] outline-none transition-all text-sm bg-[#FDFBF7]"
            placeholder="199"
            {...register("price", { required: true })}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-[#1C2B21] uppercase tracking-wide">
            Stock Status
          </label>
          <select
            className="w-full px-4 py-3 rounded-xl border border-[#D9D3C7] focus:border-[#4A5D4E] focus:ring-1 focus:ring-[#4A5D4E] outline-none transition-all text-sm bg-[#FDFBF7]"
            {...register("stock_status")}
          >
            <option value="In Stock">In Stock</option>
            <option value="Low Stock">Low Stock</option>
            <option value="Out of Stock">Out of Stock</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-[#1C2B21] uppercase tracking-wide">
            Net Quantity
          </label>
          <input
            className="w-full px-4 py-3 rounded-xl border border-[#D9D3C7] focus:border-[#4A5D4E] focus:ring-1 focus:ring-[#4A5D4E] outline-none transition-all text-sm bg-[#FDFBF7]"
            placeholder="e.g. 500g"
            {...register("net_quantity")}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-[#1C2B21] uppercase tracking-wide">
            Rating
          </label>
          <input
            type="number"
            step="0.1"
            min="0"
            max="5"
            className="w-full px-4 py-3 rounded-xl border border-[#D9D3C7] focus:border-[#4A5D4E] focus:ring-1 focus:ring-[#4A5D4E] outline-none transition-all text-sm bg-[#FDFBF7]"
            placeholder="4.5"
            {...register("rating")}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-[#1C2B21] uppercase tracking-wide">
          Ingredients
        </label>
        <textarea
          className="w-full px-4 py-3 rounded-xl border border-[#D9D3C7] focus:border-[#4A5D4E] focus:ring-1 focus:ring-[#4A5D4E] outline-none transition-all text-sm bg-[#FDFBF7] min-h-[80px]"
          placeholder="e.g. Roasted Chana Gram, Barley, Salt, Elaichi..."
          rows={3}
          {...register("ingredients")}
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-[#1C2B21] uppercase tracking-wide">
          Nutritional Information
        </label>
        <textarea
          className="w-full px-4 py-3 rounded-xl border border-[#D9D3C7] focus:border-[#4A5D4E] focus:ring-1 focus:ring-[#4A5D4E] outline-none transition-all text-sm bg-[#FDFBF7] min-h-[80px]"
          placeholder="e.g. Per 100g: Protein 20g, Fiber 8g, Carbs 55g..."
          rows={3}
          {...register("nutritional_info")}
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-[#1C2B21] uppercase tracking-wide">
          How to Prepare
        </label>
        <textarea
          className="w-full px-4 py-3 rounded-xl border border-[#D9D3C7] focus:border-[#4A5D4E] focus:ring-1 focus:ring-[#4A5D4E] outline-none transition-all text-sm bg-[#FDFBF7] min-h-[80px]"
          placeholder="e.g. Mix 2 tbsp with cold water/milk, add jaggery to taste..."
          rows={3}
          {...register("how_to_prepare")}
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-[#1C2B21] uppercase tracking-wide">
          Product Images
        </label>
        <div className="relative">
          <input
            type="file"
            multiple
            accept="image/*"
            className="w-full px-4 py-3 rounded-xl border border-dashed border-[#4A5D4E] hover:border-[#6b4f3] transition-colors text-sm file:mr-4 file:py-2 file:px-5 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-[#4A5D4E]/10 file:text-[#4A5D4E] cursor-pointer bg-[#FDFBF7]"
            {...register("images")}
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#D9D3C7] mt-4">
        {formState.isSubmitted && !loading && !error && (
          <span className="flex items-center gap-1.5 text-sm font-bold text-[#4A5D4E]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#4A5D4E]" />
            Product {isEdit ? "Updated" : "Created"} Successfully
          </span>
        )}
        {error && (
          <span className="text-sm font-bold text-red-600">
            Error: {error}
          </span>
        )}
        <button
          type="submit"
          disabled={loading}
          className="px-8 py-3 rounded-xl bg-[#6b4f3] text-white text-sm font-bold shadow-lg shadow-[#6b4f3]/20 hover:bg-[#112517] hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:translate-y-0"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              {isEdit ? "Saving..." : "Uploading..."}
            </span>
          ) : isEdit ? "Save Changes" : "Publish Product"}
        </button>
      </div>
    </form>
  );
};

export default SattuProductForm;
