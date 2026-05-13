import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";
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
      <MobileHomeButton />
    </>
  );
}

function AdminLayout({ children }) {
  return (
    <>
      <MobileAdminHeader />
      {children}
      <ChatbotWidget />
      <MobileHomeButton />
    </>
  );
}

function MobileHomeButton() {
  return (
    <Link
      to="/"
      className="fixed bottom-6 left-6 z-50 rounded-full border border-white/10 bg-[#0f172a]/95 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-black/30 backdrop-blur transition-colors hover:bg-[#111827] lg:hidden"
    >
      Accueil
    </Link>
  );
}

function MobileAdminHeader() {
  return (
    <div className="sticky top-0 z-40 flex items-center justify-between border-b border-white/10 bg-[#080d1a]/95 px-4 py-3 text-white backdrop-blur lg:hidden">
      <Link to="/" className="font-['Syne'] text-sm font-bold">
        ElectroShop
      </Link>
      <div className="flex gap-3 text-sm">
        <Link to="/admin" className="text-slate-300 hover:text-white">Admin</Link>
        <Link to="/catalog" className="text-slate-300 hover:text-white">Catalogue</Link>
      </div>
    </div>
  );
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
