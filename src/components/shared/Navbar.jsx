import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";

export default function Navbar() {
  const { user, isAuth, isAdmin, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#0a0f1e]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500">
            <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="font-['Syne'] text-lg font-bold tracking-tight text-white group-hover:text-blue-400 transition-colors">
            ElectroShop
          </span>
        </Link>

        {/* Nav links (desktop) */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/"        className="text-sm text-slate-400 hover:text-white transition-colors">Accueil</Link>
          <Link to="/catalog" className="text-sm text-slate-400 hover:text-white transition-colors">Catalogue</Link>
          {isAdmin && (
            <Link to="/admin" className="text-sm text-blue-400 hover:text-blue-300 transition-colors font-medium">
              Admin
            </Link>
          )}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          {/* Cart */}
          {isAuth && (
            <Link to="/cart" className="relative p-2 text-slate-400 hover:text-white transition-colors">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.5 6h13M7 13L5.4 5M10 21a1 1 0 100-2 1 1 0 000 2zm7 0a1 1 0 100-2 1 1 0 000 2z" />
              </svg>
              {itemCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-[10px] font-bold text-white">
                  {itemCount > 9 ? "9+" : itemCount}
                </span>
              )}
            </Link>
          )}

          {/* Auth */}
          {isAuth ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-slate-300 hover:bg-white/5 transition-colors"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold">
                  {user?.email?.[0]?.toUpperCase()}
                </div>
                <span className="hidden sm:block">{user?.email?.split("@")[0]}</span>
                <svg className="h-3 w-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl border border-white/10 bg-[#111827] py-1 shadow-xl">
                  <Link to="/profile" onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2 text-sm text-slate-300 hover:bg-white/5">Mon profil</Link>
                  <Link to="/orders" onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2 text-sm text-slate-300 hover:bg-white/5">Mes commandes</Link>
                  {isAdmin && (
                    <Link to="/admin" onClick={() => setMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-blue-400 hover:bg-white/5">Dashboard Admin</Link>
                  )}
                  <hr className="my-1 border-white/5" />
                  <button onClick={handleLogout}
                    className="block w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-white/5">
                    Déconnexion
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login"
                className="text-sm text-slate-400 hover:text-white transition-colors px-3 py-1.5">
                Connexion
              </Link>
              <Link to="/register"
                className="rounded-lg bg-blue-500 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-400 transition-colors">
                S'inscrire
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
