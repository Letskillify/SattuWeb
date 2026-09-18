import React, { createContext, useContext, useState, useEffect } from "react";
import { db } from "../components/Firebase";
import { collection, onSnapshot, doc, setDoc, deleteDoc, getDocs, writeBatch } from "firebase/firestore";
import { useAuth } from "../components/useAuth";

const StoreContext = createContext();

export const useStore = () => useContext(StoreContext);

export const StoreProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- SYNC GUEST DATA ON LOGIN ---
  useEffect(() => {
    if (user) {
      const syncData = async () => {
        const guestCart = JSON.parse(localStorage.getItem("guest_cart") || "[]");
        const guestWishlist = JSON.parse(localStorage.getItem("guest_wishlist") || "[]");

        if (guestCart.length > 0) {
          const batch = writeBatch(db);
          guestCart.forEach((item) => {
            const ref = doc(db, "users", user.uid, "cart", item.id);
            batch.set(ref, item);
          });
          await batch.commit();
          localStorage.removeItem("guest_cart");
        }

        if (guestWishlist.length > 0) {
          const batch = writeBatch(db);
          guestWishlist.forEach((item) => {
            const ref = doc(db, "users", user.uid, "wishlist", item.id);
            batch.set(ref, item);
          });
          await batch.commit();
          localStorage.removeItem("guest_wishlist");
        }
      };
      syncData();
    }
  }, [user]);

  // --- REAL-TIME LISTENERS OR LOCAL STORAGE SYNC ---
  useEffect(() => {
    let unsubCart = () => {};
    let unsubWishlist = () => {};

    if (user) {
      unsubCart = onSnapshot(collection(db, "users", user.uid, "cart"), (snapshot) => {
        setCart(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
        setLoading(false);
      });

      unsubWishlist = onSnapshot(collection(db, "users", user.uid, "wishlist"), (snapshot) => {
        setWishlist(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      });
    } else {
      setCart(JSON.parse(localStorage.getItem("guest_cart") || "[]"));
      setWishlist(JSON.parse(localStorage.getItem("guest_wishlist") || "[]"));
      setLoading(false);
    }

    return () => {
      unsubCart();
      unsubWishlist();
    };
  }, [user]);

  const addToCart = async (product, quantity = 1, selectedVariant = null) => {
    const variantWeight = selectedVariant?.weight || product.net_quantity || product.weight || "";
    const variantPrice = selectedVariant?.price || product.price;
    const maxStock = selectedVariant?.stock_count !== undefined 
      ? Number(selectedVariant.stock_count) 
      : (product.stock_count !== undefined ? Number(product.stock_count) : (selectedVariant?.stock_status === "Out of Stock" || product.stock_status === "Out of Stock" ? 0 : 50));
    
    const cartItemId = variantWeight ? `${product.id}_${variantWeight}` : product.id;
    const existing = cart.find(i => i.id === cartItemId || i.id === product.id);
    const currentQty = existing ? (existing.quantity || 1) : 0;
    
    // Cap at max available stock
    const targetQty = Math.min(maxStock, currentQty + quantity);

    if (maxStock <= 0 || targetQty <= 0) {
      return false; // Out of stock
    }
    
    if (user) {
      const itemRef = doc(db, "users", user.uid, "cart", cartItemId);
      if (existing) {
        await setDoc(itemRef, { 
          ...existing, 
          quantity: targetQty,
          stock_count: maxStock
        }, { merge: true });
      } else {
        const newItem = {
          id: cartItemId,
          productId: product.id,
          name: product.name,
          price: variantPrice,
          weight: variantWeight,
          image: product.image || product.images?.[0] || "",
          flavor: product.flavor || "",
          stock_count: maxStock,
          addedAt: new Date().toISOString(),
          quantity: targetQty
        };
        await setDoc(itemRef, newItem);
      }
    } else {
      const currentCart = JSON.parse(localStorage.getItem("guest_cart") || "[]");
      const guestExisting = currentCart.find(i => i.id === cartItemId || i.id === product.id);
      
      let updated;
      if (guestExisting) {
        updated = currentCart.map(i => 
          (i.id === cartItemId || i.id === product.id)
            ? { ...i, quantity: targetQty, stock_count: maxStock }
            : i
        );
      } else {
        const newItem = {
          id: cartItemId,
          productId: product.id,
          name: product.name,
          price: variantPrice,
          weight: variantWeight,
          image: product.image || product.images?.[0] || "",
          flavor: product.flavor || "",
          stock_count: maxStock,
          addedAt: new Date().toISOString(),
          quantity: targetQty
        };
        updated = [...currentCart, newItem];
      }
      localStorage.setItem("guest_cart", JSON.stringify(updated));
      setCart(updated);
    }
    return true;
  };

  const removeFromCart = async (id) => {
    if (user) {
      await deleteDoc(doc(db, "users", user.uid, "cart", id));
    } else {
      const currentCart = JSON.parse(localStorage.getItem("guest_cart") || "[]");
      const updated = currentCart.filter(i => i.id !== id);
      localStorage.setItem("guest_cart", JSON.stringify(updated));
      setCart(updated);
    }
  };

  const addToWishlist = async (product) => {
    const newItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image || product.images?.[0] || "",
      flavor: product.flavor || "",
      addedAt: new Date().toISOString()
    };

    if (user) {
      await setDoc(doc(db, "users", user.uid, "wishlist", product.id), newItem);
    } else {
      const currentWish = JSON.parse(localStorage.getItem("guest_wishlist") || "[]");
      const existing = currentWish.find(i => i.id === product.id);
      if (!existing) {
        const updated = [...currentWish, newItem];
        localStorage.setItem("guest_wishlist", JSON.stringify(updated));
        setWishlist(updated);
      }
    }
  };

  const removeFromWishlist = async (id) => {
    if (user) {
      await deleteDoc(doc(db, "users", user.uid, "wishlist", id));
    } else {
      const currentWish = JSON.parse(localStorage.getItem("guest_wishlist") || "[]");
      const updated = currentWish.filter(i => i.id !== id);
      localStorage.setItem("guest_wishlist", JSON.stringify(updated));
      setWishlist(updated);
    }
  };

  const updateQuantity = async (id, delta) => {
    const existing = cart.find(i => i.id === id);
    if (!existing) return;

    const maxStock = existing.stock_count !== undefined ? Number(existing.stock_count) : 50;
    const currentQty = existing.quantity || 1;
    const newQty = Math.min(maxStock, Math.max(1, currentQty + delta));

    if (user) {
      const itemRef = doc(db, "users", user.uid, "cart", id);
      await setDoc(itemRef, { ...existing, quantity: newQty }, { merge: true });
    } else {
      const currentCart = JSON.parse(localStorage.getItem("guest_cart") || "[]");
      const updated = currentCart.map(item => {
        if (item.id === id) {
          return { ...item, quantity: newQty };
        }
        return item;
      });
      localStorage.setItem("guest_cart", JSON.stringify(updated));
      setCart(updated);
    }
  };

  const clearCart = async () => {
    if (user) {
      try {
        const snap = await getDocs(collection(db, "users", user.uid, "cart"));
        const batch = writeBatch(db);
        snap.docs.forEach(d => batch.delete(d.ref));
        await batch.commit();
      } catch (err) {
        console.error("Error clearing cart in Firestore:", err);
      }
    } else {
      localStorage.removeItem("guest_cart");
      setCart([]);
    }
  };

  return (
    <StoreContext.Provider value={{ cart, wishlist, loading, addToCart, removeFromCart, updateQuantity, clearCart, addToWishlist, removeFromWishlist }}>
      {children}
    </StoreContext.Provider>
  );
};
