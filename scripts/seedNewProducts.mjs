import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBorCtvVBWzuOY5yPwTKrLiNlq9V87gEBU",
  authDomain: "sattu-e679d.firebaseapp.com",
  projectId: "sattu-e679d",
  storageBucket: "sattu-e679d.firebasestorage.app",
  messagingSenderId: "726233208916",
  appId: "1:726233208916:web:aca44ffc4f3e8c4e8075c1",
  measurementId: "G-ML955YP4P4"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const CLOUD_NAME = "luq2xhci";
const UPLOAD_PRESET = "VedamyaFoods";
const ASSET_FOLDER = "VedamyaUpload";

const uploadImageToCloudinary = async (localFilePath) => {
  try {
    const fileBuffer = fs.readFileSync(localFilePath);
    const base64Data = `data:image/jpeg;base64,${fileBuffer.toString('base64')}`;

    const res = await axios.post(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
      file: base64Data,
      upload_preset: UPLOAD_PRESET,
      folder: ASSET_FOLDER
    });

    console.log(`Uploaded to Cloudinary: ${res.data.secure_url}`);
    return res.data.secure_url;
  } catch (err) {
    console.error(`Cloudinary upload failed for ${localFilePath}:`, err.response?.data || err.message);
    return null;
  }
};

const productsToUpload = [
  {
    localImage: "C:\\Users\\Lenovo\\.gemini\\antigravity-ide\\brain\\cd32fec5-9839-415b-8515-f5d453b667fd\\roasted_makhana_snack_1791788998160.jpg",
    publicName: "roasted_peri_peri_makhana.jpg",
    data: {
      name: "Artisanal Roasted Peri Peri Makhana",
      productType: "other",
      category: "Healthy Snacks",
      subCategory: "Roasted Fox Nuts",
      tagline: "Crunchy Lotus Seeds • Zero Trans Fat • Rich in Calcium",
      description: "Slow-roasted to crispy perfection in small batches, our organic Phool Makhana is seasoned with a zesty, fiery peri peri spice blend. A guilt-free, heart-friendly superfood snack loaded with plant protein, magnesium, and dietary fiber.",
      price: 189,
      original_price: 249,
      rating: 4.9,
      isFeatured: true,
      shelfLife: "6 Months",
      storageInstructions: "Store in an airtight container in a cool, dry place away from moisture.",
      ingredients: "Organic Fox Nuts (Makhana), Cold-Pressed Olive Oil, Peri Peri Spices, Garlic, Black Salt, Paprika",
      net_quantity: "100g",
      stock_count: 50,
      stock_status: "In Stock",
      variants: [
        { weight: "100g", price: 189, original_price: 249, stock_count: 50, stock_status: "In Stock" },
        { weight: "250g", price: 399, original_price: 499, stock_count: 35, stock_status: "In Stock" },
        { weight: "500g", price: 749, original_price: 949, stock_count: 20, stock_status: "In Stock" }
      ]
    }
  },
  {
    localImage: "C:\\Users\\Lenovo\\.gemini\\antigravity-ide\\brain\\cd32fec5-9839-415b-8515-f5d453b667fd\\mustard_oil_bottle_1791789062858.jpg",
    publicName: "wood_pressed_mustard_oil.jpg",
    data: {
      name: "Pure Wood-Pressed Mustard Oil (Kachi Ghani)",
      productType: "other",
      category: "Oils & Ghee",
      subCategory: "Cold-Pressed Virgin Oils",
      tagline: "Traditional Wood Churn • Unrefined • Rich in Omega-3",
      description: "Cold-extracted using heritage wooden Kolhus below 40°C to preserve natural pungency, vital antioxidants, and heart-healthy Omega-3 fatty acids. Unrefined, unbleached, and chemical-free.",
      price: 249,
      original_price: 320,
      rating: 4.9,
      isFeatured: true,
      shelfLife: "12 Months",
      storageInstructions: "Keep bottle tightly closed in a cool, dark pantry away from direct heat.",
      ingredients: "100% Raw First-Grade Indian Black & Yellow Mustard Seeds",
      net_quantity: "500ml",
      stock_count: 45,
      stock_status: "In Stock",
      variants: [
        { weight: "500ml", price: 249, original_price: 320, stock_count: 45, stock_status: "In Stock" },
        { weight: "1 Liter", price: 449, original_price: 580, stock_count: 60, stock_status: "In Stock" },
        { weight: "5 Liters", price: 2199, original_price: 2750, stock_count: 15, stock_status: "In Stock" }
      ]
    }
  },
  {
    localImage: "C:\\Users\\Lenovo\\.gemini\\antigravity-ide\\brain\\cd32fec5-9839-415b-8515-f5d453b667fd\\turmeric_powder_jar_1791789169305.jpg",
    publicName: "lakadong_turmeric_powder.jpg",
    data: {
      name: "Organic Lakadong High-Curcumin Turmeric Powder",
      productType: "other",
      category: "Spices & Herbs",
      subCategory: "Single-Origin Spices",
      tagline: "7%+ Natural Curcumin • Meghalaya Origin • Lab Tested",
      description: "Sourced directly from organic farming cooperatives in the Jaintia Hills of Meghalaya, Lakadong turmeric boasts an exceptional 7% to 9% natural curcumin content. Renowned globally for powerful anti-inflammatory, immunity, and healing properties.",
      price: 229,
      original_price: 299,
      rating: 5.0,
      isFeatured: true,
      shelfLife: "12 Months",
      storageInstructions: "Store in a dry, airtight spice jar.",
      ingredients: "100% Pure Organic Lakadong Turmeric Root Powder (Zero Additives)",
      net_quantity: "150g",
      stock_count: 40,
      stock_status: "In Stock",
      variants: [
        { weight: "150g", price: 229, original_price: 299, stock_count: 40, stock_status: "In Stock" },
        { weight: "300g", price: 419, original_price: 549, stock_count: 30, stock_status: "In Stock" },
        { weight: "500g", price: 649, original_price: 849, stock_count: 20, stock_status: "In Stock" }
      ]
    }
  },
  {
    localImage: "C:\\Users\\Lenovo\\.gemini\\antigravity-ide\\brain\\cd32fec5-9839-415b-8515-f5d453b667fd\\foxtail_millet_pack_1791789196710.jpg",
    publicName: "organic_foxtail_millet.jpg",
    data: {
      name: "Organic Raw Foxtail Millet (Kangni)",
      productType: "other",
      category: "Superfoods & Grains",
      subCategory: "Ancient Grains",
      tagline: "Unpolished • Low Glycemic Index • Gluten-Free Supergrain",
      description: "Ancient unpolished foxtail millet, retaining its natural golden bran layer. Packed with dietary fiber, iron, and slow-burning complex carbs, it is the ideal diabetic-friendly, gluten-free alternative to polished white rice.",
      price: 149,
      original_price: 199,
      rating: 4.8,
      isFeatured: false,
      shelfLife: "9 Months",
      storageInstructions: "Store in an airtight container in a dry pantry.",
      ingredients: "100% Unpolished Organic Foxtail Millet Seeds",
      net_quantity: "500g",
      stock_count: 50,
      stock_status: "In Stock",
      variants: [
        { weight: "500g", price: 149, original_price: 199, stock_count: 50, stock_status: "In Stock" },
        { weight: "1kg", price: 269, original_price: 349, stock_count: 40, stock_status: "In Stock" }
      ]
    }
  },
  {
    localImage: "C:\\Users\\Lenovo\\.gemini\\antigravity-ide\\brain\\cd32fec5-9839-415b-8515-f5d453b667fd\\red_chilli_pickle_1791789230439.jpg",
    publicName: "banarasi_stuffed_red_chilli_pickle.jpg",
    data: {
      name: "Traditional Banarasi Stuffed Red Chilli Pickle",
      productType: "other",
      category: "Pickles & Preserves",
      subCategory: "Sun-Cured Village Pickles",
      tagline: "Handcrafted in Mustard Oil • Sun-Matured • Zero Vinegar",
      description: "Authentic sun-cured Banarasi Bharwa Lal Mirch achar made using whole fleshy red chillies hand-stuffed with aromatic roasted fennel, mustard, fenugreek, amchur, and cold-pressed mustard oil. Prepared following heirloom village recipes without artificial preservatives.",
      price: 279,
      original_price: 349,
      rating: 4.9,
      isFeatured: true,
      shelfLife: "12 Months",
      storageInstructions: "Keep in a cool place. Ensure oil layer covers the chillies; use a dry spoon.",
      ingredients: "Fresh Whole Red Chillies, Pure Mustard Oil, Roasted Fennel, Mustard Seeds, Fenugreek, Dry Mango Powder (Amchur), Rock Salt, Hing",
      net_quantity: "350g",
      stock_count: 35,
      stock_status: "In Stock",
      variants: [
        { weight: "350g", price: 279, original_price: 349, stock_count: 35, stock_status: "In Stock" },
        { weight: "500g", price: 389, original_price: 499, stock_count: 25, stock_status: "In Stock" }
      ]
    }
  },
  {
    localImage: "C:\\Users\\Lenovo\\.gemini\\antigravity-ide\\brain\\cd32fec5-9839-415b-8515-f5d453b667fd\\kesar_pista_sattu_1791789262132.jpg",
    publicName: "royal_kesar_pista_sattu.jpg",
    data: {
      name: "Royal Kesar Pista Roasted Chana Sattu",
      productType: "sattu",
      flavor: "Dry Fruit",
      category: "Sattu Mixes",
      roastingStyle: "Traditional Sand-Roasted & Stone-Ground",
      tagline: "Kashmiri Saffron & Iranian Pistachio • 24g Plant Protein",
      description: "Heirloom desi roasted chana stone-ground slowly and infused with fragrant Kashmiri saffron strands, chopped crunchy pistachios, green cardamom, and zero artificial flavors. A royal, protein-rich powerhouse shake that cools the body and sustains natural vitality.",
      proteinPer100g: "24.8g Pure Plant Protein",
      fiberPer100g: "17.5g Natural Dietary Fiber",
      energyKcal: "405 kcal",
      sattuBenefits: "Sustained Energy, Rich in Iron & Potassium, Ayurvedic Cooling Properties",
      how_to_prepare: "Royal Shake: Mix 2-3 heaped tbsp in 250ml chilled milk or water. Sweeten with jaggery powder, honey or mishri. Stir well or blend for 10 seconds and enjoy chilled.",
      ingredients: "100% Desi Roasted Chana (Chickpeas), Real Kashmiri Kesar (Saffron), Crushed Green Pistachios, Green Cardamom Seeds",
      price: 299,
      original_price: 399,
      rating: 5.0,
      isFeatured: true,
      net_quantity: "250g",
      stock_count: 45,
      stock_status: "In Stock",
      variants: [
        { weight: "250g", price: 299, original_price: 399, stock_count: 45, stock_status: "In Stock" },
        { weight: "500g", price: 549, original_price: 699, stock_count: 35, stock_status: "In Stock" },
        { weight: "1kg", price: 999, original_price: 1299, stock_count: 20, stock_status: "In Stock" }
      ]
    }
  }
];

async function seed() {
  const publicDir = path.resolve('public', 'products');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  console.log("Starting product seeding...");

  for (const item of productsToUpload) {
    console.log(`\nProcessing: ${item.data.name}`);

    // 1. Copy to public/products/
    const targetPublicPath = path.join(publicDir, item.publicName);
    fs.copyFileSync(item.localImage, targetPublicPath);
    console.log(`Copied image to: ${targetPublicPath}`);

    const localUrl = `/products/${item.publicName}`;

    // 2. Try upload to Cloudinary
    let remoteUrl = await uploadImageToCloudinary(item.localImage);
    const finalImageUrl = remoteUrl || localUrl;

    // 3. Add to Firestore
    const docPayload = {
      ...item.data,
      image: finalImageUrl,
      images: [finalImageUrl],
      createdAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, "products"), docPayload);
    console.log(`✓ Added to Firestore [ID: ${docRef.id}]: ${item.data.name}`);
  }

  console.log("\nAll 6 products successfully uploaded and added to Firestore!");
  process.exit(0);
}

seed().catch(err => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
