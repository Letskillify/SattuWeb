import React, { useState, useEffect } from "react";
import "./App.css";
import Header from "./components/Header";
import Footer from "./components/Sattu/Footer";
import Home from "./components/Homepage/Home";
import Admin from "./pages/Admin/Admin";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import AuthProvider from "./components/AuthProvider";
import { StoreProvider } from "./components/StoreProvider";
import Login from "./components/Login";
import Benefits from "./pages/Benefits";
import Signup from "./components/Signup";
import Cart from "./layouts/Cart";
import Checkout from "./layouts/Checkout";
import Wishlist from "./components/Wishlist";
import ProductDetail from "./layouts/ProductDetail";
import QuickView from "./components/QuickView";
import Account from "./pages/Account";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Shop from "./pages/Shop";
import Orders from "./pages/Orders";
import ScrollToTop from "./components/ScrollToTop";
import Preloader from "./pages/Preloader";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsAndConditions from "./pages/TermsAndConditions";
import AdminLogin from "./pages/Admin/AdminLogin";
import AdminSignup from "./pages/Admin/AdminSignup";

const AppRoutes = () => {
  const location = useLocation();
  const hideChrome =
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/super");

  return (
    <>
      <ScrollToTop />
      {!hideChrome && <Header />}
      <div className={!hideChrome ? "" : ""}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/signup" element={<AdminSignup />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/account" element={<Account />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/benefits" element={<Benefits />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-conditions" element={<TermsAndConditions />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/product/:id/quickview" element={<QuickView />} />
        </Routes>
      </div>
      {!hideChrome && <Footer />}
    </>
  );
};

function App() {
  const [isPreloaderDone, setIsPreloaderDone] = useState(false);

  return (
    <>
      {!isPreloaderDone && <Preloader onComplete={() => setIsPreloaderDone(true)} />}
      <AuthProvider>
        <StoreProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </StoreProvider>
      </AuthProvider>
    </>
  );
}

export default App;
