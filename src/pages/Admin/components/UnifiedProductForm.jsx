import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { uploadToCloudinary } from "../cloudinaryUpload";
import {
  Package,
  Boxes,
  Plus,
  Trash2,
  Image as ImageIcon,
  Check,
  AlertCircle,
  Sparkles,
  Layers,
  Leaf,
  FileText,
  Utensils,
  ShieldCheck,
  Flame,
  Droplet,
  FolderPlus,
  Info,
  DollarSign,
  UploadCloud,
  X
} from "lucide-react";

const SATTU_FLAVORS = [
  "Classic Roasted",
  "Elaichi",
  "Rose",
  "Dry Fruit",
  "Chocolate",
  "Namkeen Spicy",
  "Barley Sattu Mix",
  "Jowar Sattu Blend"
];

const ROASTING_TECHNIQUES = [
  "Traditional Sand-Roasted & Stone-Ground",
  "Slow Wood-Fired Roasted",
  "Double-Roasted Extra Fine",
  "Cold-Pounded Desi Chana"
];

const DEFAULT_CATEGORIES = [
  "Healthy Snacks",
  "Spices & Herbs",
  "Superfoods & Grains",
  "Oils & Ghee",
  "Pickles & Preserves",
  "Beverages",
  "Organic Staples",
  "Other Food Items"
];

const UnifiedProductForm = ({
  onSuccess,
  isEdit = false,
  product = null,
  categories = [],
  onOpenCategoryManager
}) => {
  // Determine initial product type: 'sattu' or 'other'
  const initialType = product?.productType === "other" ? "other" : "sattu";
  const [productType, setProductType] = useState(initialType);

  // Form setup
  const { register, handleSubmit, reset, setValue, watch, formState } = useForm({
    defaultValues: {
      name: product?.name || "",
      tagline: product?.tagline || "",
      description: product?.description || "",
      rating: product?.rating || 4.8,
      isFeatured: product?.isFeatured || false,
      
      // Sattu specific
      flavor: product?.flavor || "Classic Roasted",
      roastingStyle: product?.roastingStyle || "Traditional Sand-Roasted & Stone-Ground",
      proteinPer100g: product?.proteinPer100g || "24.5g",
      fiberPer100g: product?.fiberPer100g || "18g",
      energyKcal: product?.energyKcal || "395 kcal",
      how_to_prepare: product?.how_to_prepare || "",
      sattuBenefits: product?.sattuBenefits || "Instant Natural Energy, Gut Friendly, Rich in Plant Protein",
      
      // Other products specific
      category: product?.category || "Healthy Snacks",
      subCategory: product?.subCategory || "",
      storageInstructions: product?.storageInstructions || "Store in an airtight container in a cool, dry place.",
      shelfLife: product?.shelfLife || "6 Months",
      
      // Common
      ingredients: product?.ingredients || "",
      nutritional_info: product?.nutritional_info || "",
      net_quantity: product?.net_quantity || (initialType === "sattu" ? "500g" : "250g"),
      price: product?.price || 199,
      original_price: product?.original_price || 249,
      stock_count: product?.stock_count !== undefined ? product.stock_count : 50,
    },
  });

  // Category list merging
  const availableCategories = categories.length > 0
    ? categories.map(c => typeof c === 'string' ? c : c.name)
    : DEFAULT_CATEGORIES;

  // Variants state (Price, MRP, Weight, Stock count)
  const [variants, setVariants] = useState(() => {
    if (product?.variants && product.variants.length > 0) {
      return product.variants.map(v => ({
        ...v,
        stock_count: v.stock_count !== undefined ? Number(v.stock_count) : (v.stock_status === "Out of Stock" ? 0 : 50)
      }));
    }
    if (initialType === "sattu") {
      return [
        { weight: "250g", price: 149, original_price: 199, stock_count: 50 },
        { weight: "500g", price: 269, original_price: 349, stock_count: 40 },
        { weight: "1kg", price: 499, original_price: 649, stock_count: 25 },
      ];
    }
    return [
      { weight: "250g", price: 199, original_price: 249, stock_count: 50 },
      { weight: "500g", price: 349, original_price: 449, stock_count: 30 },
    ];
  });

  // Image handling state
  const [existingImages, setExistingImages] = useState(
    product?.images && product.images.length > 0
      ? product.images
      : product?.image
      ? [product.image]
      : []
  );
  const [newImageFiles, setNewImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Update default how_to_prepare when Sattu flavor changes if empty
  const currentFlavor = watch("flavor");
  useEffect(() => {
    if (productType === "sattu" && !product?.how_to_prepare) {
      if (currentFlavor === "Namkeen Spicy") {
        setValue("how_to_prepare", "Spiced Cooler: Mix 2-3 tbsp Sattu in 250ml chilled water or buttermilk. Add roasted cumin, rock salt, chopped mint, and fresh lemon juice. Stir well and serve.");
      } else if (currentFlavor === "Chocolate" || currentFlavor === "Elaichi" || currentFlavor === "Rose") {
        setValue("how_to_prepare", "Sweet Power Shake: Blend 2-3 tbsp Sattu with 250ml chilled milk or water. Sweeten with jaggery, honey or mishri. Top with crushed dry fruits.");
      } else {
        setValue("how_to_prepare", "Classic Drink: Mix 2 tbsp Sattu in a glass of cold water with jaggery/salt according to preference. Stir thoroughly for a nutritious instant meal.");
      }
    }
  }, [currentFlavor, productType, setValue, product]);

  // Handle local file selection
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setNewImageFiles(prev => [...prev, ...files]);

    const newPreviews = files.map(f => URL.createObjectURL(f));
    setImagePreviews(prev => [...prev, ...newPreviews]);
  };

  const handleRemoveExistingImage = (idx) => {
    setExistingImages(prev => prev.filter((_, i) => i !== idx));
  };

  const handleRemoveNewImage = (idx) => {
    setNewImageFiles(prev => prev.filter((_, i) => i !== idx));
    setImagePreviews(prev => prev.filter((_, i) => i !== idx));
  };

  // Variant operations
  const handleAddVariant = () => {
    setVariants(prev => [
      ...prev,
      {
        weight: "1kg",
        price: 399,
        original_price: 499,
        stock_count: 20,
      }
    ]);
  };

  const handleRemoveVariant = (idx) => {
    if (variants.length <= 1) return;
    setVariants(prev => prev.filter((_, i) => i !== idx));
  };

  const handleVariantChange = (idx, field, value) => {
    setVariants(prev => {
      const next = [...prev];
      next[idx] = {
        ...next[idx],
        [field]: field === "price" || field === "original_price" || field === "stock_count"
          ? Number(value) || 0
          : value
      };
      return next;
    });
  };

  // Submit Handler
  const onSubmit = async (values) => {
    setError("");
    setLoading(true);

    try {
      // 1. Upload new files to Cloudinary
      const uploadedUrls = [];
      for (const file of newImageFiles) {
        const url = await uploadToCloudinary(file);
        uploadedUrls.push(url);
      }

      const allImages = [...existingImages, ...uploadedUrls];
      const mainImage = allImages[0] || "https://images.unsplash.com/photo-1594488651083-023b857dc3f8?q=80&w=600&auto=format&fit=crop";

      // 2. Format variants with stock statuses
      const formattedVariants = variants.map(v => {
        const count = Number(v.stock_count) || 0;
        const status = count <= 0 ? "Out of Stock" : count <= 5 ? "Low Stock" : "In Stock";
        return {
          weight: v.weight || "Standard",
          price: Number(v.price) || 0,
          original_price: Number(v.original_price) || 0,
          stock_count: count,
          stock_status: status
        };
      });

      const primaryVariant = formattedVariants[0] || {
        weight: values.net_quantity,
        price: Number(values.price) || 0,
        original_price: Number(values.original_price) || 0,
        stock_count: Number(values.stock_count) || 0,
        stock_status: (Number(values.stock_count) || 0) <= 0 ? "Out of Stock" : "In Stock"
      };

      // 3. Assemble document data
      const docData = {
        name: values.name.trim(),
        productType: productType, // 'sattu' or 'other'
        tagline: values.tagline?.trim() || "",
        description: values.description?.trim() || "",
        rating: Number(values.rating) || 4.8,
        isFeatured: Boolean(values.isFeatured),
        
        // Pricing & primary stock
        price: primaryVariant.price,
        original_price: primaryVariant.original_price,
        net_quantity: primaryVariant.weight,
        stock_count: primaryVariant.stock_count,
        stock_status: primaryVariant.stock_status,
        variants: formattedVariants,

        // Images
        images: allImages,
        image: mainImage,

        // Common details
        ingredients: values.ingredients?.trim() || "",
        nutritional_info: values.nutritional_info?.trim() || "",
        how_to_prepare: values.how_to_prepare?.trim() || "",
      };

      // Dynamic payload fields based on product type
      if (productType === "sattu") {
        docData.flavor = values.flavor;
        docData.category = "Sattu Mixes";
        docData.roastingStyle = values.roastingStyle;
        docData.proteinPer100g = values.proteinPer100g;
        docData.fiberPer100g = values.fiberPer100g;
        docData.energyKcal = values.energyKcal;
        docData.sattuBenefits = values.sattuBenefits;
      } else {
        docData.category = values.category;
        docData.flavor = values.flavor || "Natural";
        docData.subCategory = values.subCategory?.trim() || "";
        docData.storageInstructions = values.storageInstructions?.trim() || "";
        docData.shelfLife = values.shelfLife?.trim() || "";
      }

      if (onSuccess) {
        await onSuccess(docData);
      }
      reset();
    } catch (err) {
      console.error(err);
      setError("Product submission failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 animate-fadeIn">
      
      {/* ERROR ALERT */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-sm font-bold flex items-center gap-3">
          <AlertCircle size={20} className="text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. PRODUCT TYPE SELECTOR - DYNAMIC TOGGLE */}
      {/* ========================================================================= */}
      <div className="bg-[#FAF7F2] p-5 rounded-3xl border border-[#E5DEC9] space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-poppins font-black text-[#2A1B12] uppercase tracking-wider flex items-center gap-2">
            <Sparkles size={14} className="text-[#976E2A]" />
            Select Product Type *
          </label>
          <span className="text-xs text-[#7A6E63] font-semibold">
            Adapts form fields & catalog taxonomy
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          
          {/* OPTION 1: SATTU PRODUCT */}
          <button
            type="button"
            onClick={() => setProductType("sattu")}
            className={`p-4 rounded-2xl border-2 text-left transition-all duration-200 flex items-start gap-3.5 cursor-pointer ${
              productType === "sattu"
                ? "bg-white border-[#6b4f3a] shadow-md ring-2 ring-[#6b4f3a]/15 text-[#2A1B12]"
                : "bg-white/60 border-[#E5DEC9] hover:bg-white text-[#7A6E63]"
            }`}
          >
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                productType === "sattu"
                  ? "bg-[#6b4f3a] text-white shadow-xs"
                  : "bg-[#E5DEC9] text-[#6b4f3a]"
              }`}
            >
              <Package size={22} />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-poppins font-black text-sm sm:text-base text-[#2A1B12]">
                  🌾 Sattu Product
                </span>
                {productType === "sattu" && (
                  <span className="w-2 h-2 rounded-full bg-[#6b4f3a] animate-pulse" />
                )}
              </div>
              <p className="text-xs text-[#7A6E63] font-medium mt-0.5 leading-relaxed">
                Authentic roasted chana superfood blends, signature flavors & drink recipes.
              </p>
            </div>
          </button>

          {/* OPTION 2: OTHER ORGANIC PRODUCTS */}
          <button
            type="button"
            onClick={() => setProductType("other")}
            className={`p-4 rounded-2xl border-2 text-left transition-all duration-200 flex items-start gap-3.5 cursor-pointer ${
              productType === "other"
                ? "bg-white border-[#976E2A] shadow-md ring-2 ring-[#976E2A]/15 text-[#2A1B12]"
                : "bg-white/60 border-[#E5DEC9] hover:bg-white text-[#7A6E63]"
            }`}
          >
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                productType === "other"
                  ? "bg-[#976E2A] text-white shadow-xs"
                  : "bg-[#E5DEC9] text-[#976E2A]"
              }`}
            >
              <Boxes size={22} />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-poppins font-black text-sm sm:text-base text-[#2A1B12]">
                  🌿 Other Products
                </span>
                {productType === "other" && (
                  <span className="w-2 h-2 rounded-full bg-[#976E2A] animate-pulse" />
                )}
              </div>
              <p className="text-xs text-[#7A6E63] font-medium mt-0.5 leading-relaxed">
                Snacks, spices, cold-pressed oils, superfoods, pickles & organic pantry staples.
              </p>
            </div>
          </button>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. BASIC PRODUCT IDENTITY */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        <div className="flex items-center gap-2.5 pb-2.5 border-b border-[#E5DEC9]">
          <FileText className="text-[#976E2A]" size={20} />
          <h3 className="text-base font-poppins font-black text-[#2A1B12]">
            1. Product Title & Core Information
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Product Name */}
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-poppins font-black text-[#2A1B12] uppercase tracking-wider">
              Product Name *
            </label>
            <input
              type="text"
              required
              {...register("name", { required: true })}
              placeholder={productType === "sattu" ? "e.g. Royal Elaichi Roasted Chana Sattu" : "e.g. Organic Cold-Pressed Mustard Oil"}
              className="w-full bg-white border border-[#E5DEC9] focus:border-[#976E2A] focus:ring-1 focus:ring-[#976E2A] outline-none px-4 py-3 rounded-2xl text-sm font-bold text-[#2A1B12] shadow-2xs"
            />
          </div>

          {/* Promotional Tagline / Ribbon */}
          <div className="space-y-1.5">
            <label className="text-xs font-poppins font-black text-[#2A1B12] uppercase tracking-wider">
              Tagline / Badge Highlight
            </label>
            <input
              type="text"
              {...register("tagline")}
              placeholder={productType === "sattu" ? "e.g. High Plant Protein • Pure Desi Chana" : "e.g. 100% Cold-Pressed • Traditional Wood Kolhu"}
              className="w-full bg-white border border-[#E5DEC9] focus:border-[#976E2A] outline-none px-4 py-3 rounded-2xl text-sm font-semibold text-[#2A1B12] shadow-2xs"
            />
          </div>

          {/* Rating */}
          <div className="space-y-1.5">
            <label className="text-xs font-poppins font-black text-[#2A1B12] uppercase tracking-wider">
              Customer Rating (1.0 to 5.0)
            </label>
            <input
              type="number"
              step="0.1"
              min="1"
              max="5"
              {...register("rating")}
              className="w-full bg-white border border-[#E5DEC9] focus:border-[#976E2A] outline-none px-4 py-3 rounded-2xl text-sm font-bold text-[#2A1B12] shadow-2xs"
            />
          </div>
        </div>

        {/* Detailed Description */}
        <div className="space-y-1.5">
          <label className="text-xs font-poppins font-black text-[#2A1B12] uppercase tracking-wider">
            Detailed Description
          </label>
          <textarea
            rows="3"
            {...register("description")}
            placeholder={
              productType === "sattu"
                ? "Describe aroma, traditional roasting, taste notes, and digestive health benefits..."
                : "Describe ingredients, origin, processing method, and culinary suggestions..."
            }
            className="w-full bg-white border border-[#E5DEC9] focus:border-[#976E2A] outline-none p-4 rounded-2xl text-sm font-medium text-[#2A1B12] shadow-2xs resize-none"
          />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. DYNAMIC FIELDS SECTION (ADAPTS ACCORDING TO SATTU VS OTHER) */}
      {/* ========================================================================= */}
      {productType === "sattu" ? (
        
        /* ---------------- SATTU SPECIFIC FIELDS ---------------- */
        <div className="space-y-5 bg-[#FAF4E3]/40 p-6 rounded-3xl border border-[#D9A036]/30">
          <div className="flex items-center justify-between pb-3 border-b border-[#E5DEC9]">
            <div className="flex items-center gap-2.5">
              <Leaf className="text-[#6b4f3a]" size={20} />
              <h3 className="text-base font-poppins font-black text-[#2A1B12]">
                2. Traditional Sattu Specifications
              </h3>
            </div>
            <span className="px-3 py-1 rounded-full bg-[#6b4f3a]/10 text-[#6b4f3a] text-xs font-black uppercase tracking-wider">
              Authentic Sattu Fields
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* Signature Blend / Flavor */}
            <div className="space-y-1.5">
              <label className="text-xs font-poppins font-black text-[#2A1B12] uppercase tracking-wider">
                Signature Blend / Flavor *
              </label>
              <select
                {...register("flavor")}
                className="w-full bg-white border border-[#E5DEC9] focus:border-[#6b4f3a] outline-none px-4 py-3 rounded-2xl text-sm font-bold text-[#2A1B12] shadow-2xs"
              >
                {SATTU_FLAVORS.map(flavor => (
                  <option key={flavor} value={flavor}>{flavor}</option>
                ))}
              </select>
            </div>

            {/* Roasting Style */}
            <div className="space-y-1.5">
              <label className="text-xs font-poppins font-black text-[#2A1B12] uppercase tracking-wider">
                Roasting & Grinding Process
              </label>
              <select
                {...register("roastingStyle")}
                className="w-full bg-white border border-[#E5DEC9] focus:border-[#6b4f3a] outline-none px-4 py-3 rounded-2xl text-sm font-bold text-[#2A1B12] shadow-2xs"
              >
                {ROASTING_TECHNIQUES.map(tech => (
                  <option key={tech} value={tech}>{tech}</option>
                ))}
              </select>
            </div>

            {/* Sattu Nutritional Highlights (Protein / Fiber / Energy) */}
            <div className="space-y-1.5">
              <label className="text-xs font-poppins font-black text-[#2A1B12] uppercase tracking-wider">
                Protein per 100g
              </label>
              <input
                type="text"
                {...register("proteinPer100g")}
                placeholder="e.g. 24.5g Plant Protein"
                className="w-full bg-white border border-[#E5DEC9] focus:border-[#6b4f3a] outline-none px-4 py-3 rounded-2xl text-sm font-bold text-[#2A1B12] shadow-2xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-poppins font-black text-[#2A1B12] uppercase tracking-wider">
                Dietary Fiber per 100g
              </label>
              <input
                type="text"
                {...register("fiberPer100g")}
                placeholder="e.g. 18g Dietary Fiber"
                className="w-full bg-white border border-[#E5DEC9] focus:border-[#6b4f3a] outline-none px-4 py-3 rounded-2xl text-sm font-bold text-[#2A1B12] shadow-2xs"
              />
            </div>

          </div>

          {/* Sattu Recipe / How to prepare */}
          <div className="space-y-1.5">
            <label className="text-xs font-poppins font-black text-[#2A1B12] uppercase tracking-wider flex items-center gap-2">
              <Utensils size={14} className="text-[#6b4f3a]" />
              How to Prepare & Consume (Traditional Recipe)
            </label>
            <textarea
              rows="3"
              {...register("how_to_prepare")}
              placeholder="e.g. Mix 2 tbsp Sattu in chilled water or buttermilk. Add roasted cumin, rock salt, mint, and lemon juice..."
              className="w-full bg-white border border-[#E5DEC9] focus:border-[#6b4f3a] outline-none p-4 rounded-2xl text-sm font-medium text-[#2A1B12] shadow-2xs resize-none"
            />
          </div>

          {/* Sattu Ingredients */}
          <div className="space-y-1.5">
            <label className="text-xs font-poppins font-black text-[#2A1B12] uppercase tracking-wider">
              Ingredients Listing
            </label>
            <input
              type="text"
              {...register("ingredients")}
              placeholder="e.g. 100% Desi Roasted Chana (Chickpeas), Green Cardamom, Natural Spices"
              className="w-full bg-white border border-[#E5DEC9] focus:border-[#6b4f3a] outline-none px-4 py-3 rounded-2xl text-sm font-semibold text-[#2A1B12] shadow-2xs"
            />
          </div>

        </div>

      ) : (

        /* ---------------- OTHER PRODUCTS SPECIFIC FIELDS ---------------- */
        <div className="space-y-5 bg-[#FAF4E3]/40 p-6 rounded-3xl border border-[#976E2A]/30">
          <div className="flex items-center justify-between pb-3 border-b border-[#E5DEC9]">
            <div className="flex items-center gap-2.5">
              <Boxes className="text-[#976E2A]" size={20} />
              <h3 className="text-base font-poppins font-black text-[#2A1B12]">
                2. Category & Organic Specifications
              </h3>
            </div>
            <span className="px-3 py-1 rounded-full bg-[#976E2A]/10 text-[#976E2A] text-xs font-black uppercase tracking-wider">
              Other Product Fields
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* Category Selector with Category Manager shortcut button */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-poppins font-black text-[#2A1B12] uppercase tracking-wider">
                  Product Category *
                </label>
                {onOpenCategoryManager && (
                  <button
                    type="button"
                    onClick={onOpenCategoryManager}
                    className="text-xs font-black text-[#976E2A] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <FolderPlus size={13} />
                    <span>Manage Categories</span>
                  </button>
                )}
              </div>

              <select
                {...register("category")}
                className="w-full bg-white border border-[#E5DEC9] focus:border-[#976E2A] outline-none px-4 py-3 rounded-2xl text-sm font-bold text-[#2A1B12] shadow-2xs"
              >
                {availableCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Sub-category / Organic Tag */}
            <div className="space-y-1.5">
              <label className="text-xs font-poppins font-black text-[#2A1B12] uppercase tracking-wider">
                Sub-Category / Organic Tag
              </label>
              <input
                type="text"
                {...register("subCategory")}
                placeholder="e.g. Cold Pressed Oil, Stone Ground Flour, Superseed"
                className="w-full bg-white border border-[#E5DEC9] focus:border-[#976E2A] outline-none px-4 py-3 rounded-2xl text-sm font-semibold text-[#2A1B12] shadow-2xs"
              />
            </div>

            {/* Shelf Life */}
            <div className="space-y-1.5">
              <label className="text-xs font-poppins font-black text-[#2A1B12] uppercase tracking-wider">
                Shelf Life
              </label>
              <input
                type="text"
                {...register("shelfLife")}
                placeholder="e.g. 6 Months from Packaging"
                className="w-full bg-white border border-[#E5DEC9] focus:border-[#976E2A] outline-none px-4 py-3 rounded-2xl text-sm font-semibold text-[#2A1B12] shadow-2xs"
              />
            </div>

            {/* Storage Instructions */}
            <div className="space-y-1.5">
              <label className="text-xs font-poppins font-black text-[#2A1B12] uppercase tracking-wider">
                Storage Instructions
              </label>
              <input
                type="text"
                {...register("storageInstructions")}
                placeholder="e.g. Store in an airtight glass container away from direct sunlight"
                className="w-full bg-white border border-[#E5DEC9] focus:border-[#976E2A] outline-none px-4 py-3 rounded-2xl text-sm font-semibold text-[#2A1B12] shadow-2xs"
              />
            </div>

          </div>

          {/* Other Product Ingredients */}
          <div className="space-y-1.5">
            <label className="text-xs font-poppins font-black text-[#2A1B12] uppercase tracking-wider">
              Ingredients & Sourcing Notes
            </label>
            <input
              type="text"
              {...register("ingredients")}
              placeholder="e.g. 100% Raw Mustard Seeds, Single-Origin Sourced, Unrefined"
              className="w-full bg-white border border-[#E5DEC9] focus:border-[#976E2A] outline-none px-4 py-3 rounded-2xl text-sm font-semibold text-[#2A1B12] shadow-2xs"
            />
          </div>

          {/* Usage / Recipe */}
          <div className="space-y-1.5">
            <label className="text-xs font-poppins font-black text-[#2A1B12] uppercase tracking-wider">
              Culinary Use & Preparation Tips
            </label>
            <textarea
              rows="2"
              {...register("how_to_prepare")}
              placeholder="e.g. Best for traditional Indian cooking, sautéing, pickling, and dressings..."
              className="w-full bg-white border border-[#E5DEC9] focus:border-[#976E2A] outline-none p-4 rounded-2xl text-sm font-medium text-[#2A1B12] shadow-2xs resize-none"
            />
          </div>

        </div>

      )}

      {/* ========================================================================= */}
      {/* 4. VARIANTS, PRICING & INVENTORY WEIGHT TIERS */}
      {/* ========================================================================= */}
      <div className="space-y-5">
        <div className="flex items-center justify-between pb-2.5 border-b border-[#E5DEC9]">
          <div className="flex items-center gap-2.5">
            <Layers className="text-[#976E2A]" size={20} />
            <div>
              <h3 className="text-base font-poppins font-black text-[#2A1B12]">
                3. Pack Sizes, Pricing & Stock Units
              </h3>
              <p className="text-xs text-[#7A6E63] font-semibold mt-0.5">
                Set individual selling prices, MRPs, and numeric stock count for each size tier
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddVariant}
            className="px-4 py-2 rounded-xl bg-[#FAF7F2] border border-[#E5DEC9] hover:bg-[#E5DEC9] text-xs font-black text-[#2A1B12] transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Plus size={15} />
            <span>Add Size Tier</span>
          </button>
        </div>

        <div className="space-y-3">
          {variants.map((v, index) => {
            const count = Number(v.stock_count) || 0;
            const discountPct = v.original_price > v.price
              ? Math.round(((v.original_price - v.price) / v.original_price) * 100)
              : 0;

            return (
              <div
                key={index}
                className="bg-white rounded-2xl border border-[#E5DEC9] p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs"
              >
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-1">
                  
                  {/* Size / Weight */}
                  <div>
                    <label className="text-[11px] font-black uppercase text-[#7A6E63] block mb-1">
                      Weight / Size
                    </label>
                    <input
                      type="text"
                      value={v.weight}
                      onChange={(e) => handleVariantChange(index, "weight", e.target.value)}
                      placeholder="e.g. 500g"
                      className="w-full bg-[#FAF7F2] border border-[#E5DEC9] focus:bg-white outline-none px-3 py-2 rounded-xl text-xs font-bold text-[#2A1B12]"
                    />
                  </div>

                  {/* Selling Price */}
                  <div>
                    <label className="text-[11px] font-black uppercase text-[#7A6E63] block mb-1">
                      Selling Price (₹)
                    </label>
                    <input
                      type="number"
                      value={v.price}
                      onChange={(e) => handleVariantChange(index, "price", e.target.value)}
                      className="w-full bg-[#FAF7F2] border border-[#E5DEC9] focus:bg-white outline-none px-3 py-2 rounded-xl text-xs font-bold text-[#2A1B12]"
                    />
                  </div>

                  {/* MRP */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-black uppercase text-[#7A6E63]">
                        MRP (₹)
                      </label>
                      {discountPct > 0 && (
                        <span className="text-[10px] text-emerald-700 font-black">
                          -{discountPct}%
                        </span>
                      )}
                    </div>
                    <input
                      type="number"
                      value={v.original_price}
                      onChange={(e) => handleVariantChange(index, "original_price", e.target.value)}
                      className="w-full bg-[#FAF7F2] border border-[#E5DEC9] focus:bg-white outline-none px-3 py-2 rounded-xl text-xs font-bold text-[#2A1B12]"
                    />
                  </div>

                  {/* Stock Units */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-black uppercase text-[#7A6E63]">
                        Stock Count
                      </label>
                      <span
                        className={`text-[10px] font-black ${
                          count <= 0 ? "text-red-700" : count <= 5 ? "text-amber-700" : "text-emerald-700"
                        }`}
                      >
                        {count <= 0 ? "Out" : count <= 5 ? "Low" : "Ready"}
                      </span>
                    </div>
                    <input
                      type="number"
                      min="0"
                      value={v.stock_count}
                      onChange={(e) => handleVariantChange(index, "stock_count", e.target.value)}
                      className="w-full bg-[#FAF7F2] border border-[#E5DEC9] focus:bg-white outline-none px-3 py-2 rounded-xl text-xs font-bold text-[#2A1B12]"
                    />
                  </div>

                </div>

                {/* Delete Variant Button */}
                {variants.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveVariant(index)}
                    className="p-2.5 rounded-xl text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors self-end md:self-center cursor-pointer"
                    title="Remove this size tier"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. MULTIPLE IMAGES & MEDIA */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        <div className="flex items-center gap-2.5 pb-2.5 border-b border-[#E5DEC9]">
          <ImageIcon className="text-[#976E2A]" size={20} />
          <h3 className="text-base font-poppins font-black text-[#2A1B12]">
            4. Product Imagery (Cloudinary Media)
          </h3>
        </div>

        {/* Existing Images */}
        {existingImages.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-bold text-[#7A6E63]">Existing Product Images:</p>
            <div className="flex flex-wrap gap-3">
              {existingImages.map((url, idx) => (
                <div
                  key={idx}
                  className="relative w-24 h-24 rounded-2xl bg-white border border-[#E5DEC9] p-1.5 shadow-xs overflow-hidden group"
                >
                  <img src={url} alt={`Preview ${idx}`} className="w-full h-full object-contain" />
                  <button
                    type="button"
                    onClick={() => handleRemoveExistingImage(idx)}
                    className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                    title="Remove Image"
                  >
                    <X size={12} />
                  </button>
                  {idx === 0 && (
                    <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded-md bg-[#2A1B12]/80 text-white text-[9px] font-black">
                      Cover
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Newly Selected Image Previews */}
        {imagePreviews.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-bold text-emerald-800">New Images to Upload:</p>
            <div className="flex flex-wrap gap-3">
              {imagePreviews.map((url, idx) => (
                <div
                  key={idx}
                  className="relative w-24 h-24 rounded-2xl bg-white border-2 border-emerald-500/50 p-1.5 shadow-xs overflow-hidden group"
                >
                  <img src={url} alt={`New Preview ${idx}`} className="w-full h-full object-contain" />
                  <button
                    type="button"
                    onClick={() => handleRemoveNewImage(idx)}
                    className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                    title="Remove Image"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* File Picker Dropzone */}
        <label className="border-2 border-dashed border-[#E5DEC9] hover:border-[#976E2A] bg-white hover:bg-[#FAF7F2] rounded-3xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all">
          <UploadCloud size={32} className="text-[#976E2A] mb-2" />
          <span className="text-sm font-poppins font-black text-[#2A1B12]">
            Click to Browse or Drag Product Images
          </span>
          <span className="text-xs text-[#7A6E63] font-medium mt-1">
            Supports PNG, JPG, WebP. High resolution with transparent or white background recommended.
          </span>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      </div>

      {/* ========================================================================= */}
      {/* 6. SUBMIT BUTTON & PROGRESS */}
      {/* ========================================================================= */}
      <div className="pt-6 border-t border-[#E5DEC9] flex items-center justify-end gap-4">
        <button
          type="submit"
          disabled={loading}
          className={`px-8 py-4 rounded-2xl text-white font-poppins font-black text-sm sm:text-base shadow-xl transition-all flex items-center gap-3 cursor-pointer ${
            productType === "sattu"
              ? "bg-[#6b4f3a] hover:bg-[#2A1B12] shadow-[#6b4f3a]/25"
              : "bg-[#976E2A] hover:bg-[#2A1B12] shadow-[#976E2A]/25"
          }`}
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Saving Product & Assets...</span>
            </>
          ) : (
            <>
              <Check size={20} strokeWidth={2.5} />
              <span>{isEdit ? "Update Product Details" : "Publish Product to Store"}</span>
            </>
          )}
        </button>
      </div>

    </form>
  );
};

export default UnifiedProductForm;
