import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import Navbar        from "../components/shared/Navbar";
import Footer        from "../components/shared/Footer";
import ChatbotWidget from "../components/chatbot/ChatbotWidget";

import HomePage          from "../pages/HomePage";
import CatalogPage       from "../pages/CatalogPage";
import ProductDetailPage from "../pages/ProductDetailPage";
import LoginPage         from "../pages/LoginPage";
import RegisterPage      from "../pages/RegisterPage";
import CartPage          from "../pages/CartPage";
import CheckoutPage      from "../pages/CheckoutPage";
import OrdersPage        from "../pages/OrdersPage";
import ProfilePage       from "../pages/ProfilePage";

import AdminDashboard  from "../pages/admin/AdminDashboard";
import AdminProducts   from "../pages/admin/AdminProducts";
import AdminOrders     from "../pages/admin/AdminOrders";
import AdminUsers      from "../pages/admin/AdminUsers";
import AdminAnalytics  from "../pages/admin/AdminAnalytics";

// ── Guards ────────────────────────────────────────────────────────────────
function ProtectedRoute({ children }) {
  const { isAuth, loading } = useAuth();
  if (loading) return null;
  return isAuth ? children : <Navigate to="/login" replace />;
}

function AdminRoute({ children }) {
  const { isAuth, isAdmin, loading } = useAuth();
  if (loading) return null;
  if (!isAuth)  return <Navigate to="/login"  replace />;
  if (!isAdmin) return <Navigate to="/"       replace />;
  return children;
}

function GuestRoute({ children }) {
  const { isAuth, loading } = useAuth();
  if (loading) return null;
  return isAuth ? <Navigate to="/" replace /> : children;
}

// ── Layout wrappers ───────────────────────────────────────────────────────
function PublicLayout({ children }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
      <ChatbotWidget />
    </>
  );
}

function AdminLayout({ children }) {
  return <>{children}<ChatbotWidget /></>;
}

// ── Router ────────────────────────────────────────────────────────────────
export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
        <Route path="/catalog" element={<PublicLayout><CatalogPage /></PublicLayout>} />
        <Route path="/products/:id" element={<PublicLayout><ProductDetailPage /></PublicLayout>} />

        {/* Guest only */}
        <Route path="/login"    element={<GuestRoute><LoginPage /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />

        {/* Authenticated */}
        <Route path="/cart"     element={<ProtectedRoute><PublicLayout><CartPage /></PublicLayout></ProtectedRoute>} />
        <Route path="/checkout" element={<ProtectedRoute><PublicLayout><CheckoutPage /></PublicLayout></ProtectedRoute>} />
        <Route path="/orders"   element={<ProtectedRoute><PublicLayout><OrdersPage /></PublicLayout></ProtectedRoute>} />
        <Route path="/profile"  element={<ProtectedRoute><PublicLayout><ProfilePage /></PublicLayout></ProtectedRoute>} />

        {/* Admin */}
        <Route path="/admin"            element={<AdminRoute><AdminLayout><AdminDashboard /></AdminLayout></AdminRoute>} />
        <Route path="/admin/products"   element={<AdminRoute><AdminLayout><AdminProducts /></AdminLayout></AdminRoute>} />
        <Route path="/admin/orders"     element={<AdminRoute><AdminLayout><AdminOrders /></AdminLayout></AdminRoute>} />
        <Route path="/admin/users"      element={<AdminRoute><AdminLayout><AdminUsers /></AdminLayout></AdminRoute>} />
        <Route path="/admin/analytics"  element={<AdminRoute><AdminLayout><AdminAnalytics /></AdminLayout></AdminRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
