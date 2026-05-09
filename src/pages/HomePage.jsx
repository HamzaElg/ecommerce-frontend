import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";

const CATEGORIES = ["Tous", "Audio", "Gaming", "Caméras", "Laptops", "Mobiles"];

export default function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading]   = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/products/search?page=0&size=8")
      .then(({ data }) => setFeatured(data.content ?? data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#080d1a] text-white font-['DM_Sans']">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        {/* Background gradient mesh */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 via-[#080d1a] to-indigo-900/20" />
        <div className="absolute top-20 left-1/3 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Text */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 mb-6">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
                <span className="text-xs font-medium text-blue-300">Nouvelle Collection 2024</span>
              </div>

              <h1 className="font-['Syne'] text-5xl lg:text-7xl font-bold leading-none mb-6">
                <span className="text-white">Summer</span>
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
                  Collection
                </span>
                <br />
                <span className="text-white">2024</span>
              </h1>

              <p className="text-slate-400 text-lg mb-8 max-w-md leading-relaxed">
                Découvrez les dernières innovations en électronique — audio premium, gaming haute performance et bien plus.
              </p>

              <div className="flex flex-wrap gap-3">
                <Link to="/catalog"
                  className="rounded-xl bg-blue-500 px-6 py-3 font-semibold text-white hover:bg-blue-400 transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/25">
                  Voir le catalogue
                </Link>
                <Link to="/catalog?category=audio"
                  className="rounded-xl border border-white/10 px-6 py-3 font-semibold text-slate-300 hover:bg-white/5 transition-all duration-200">
                  Découvrir l'audio
                </Link>
              </div>

              {/* Stats */}
              <div className="mt-12 grid grid-cols-3 gap-6">
                {[
                  { label: "Produits", value: "500+" },
                  { label: "Marques", value: "50+" },
                  { label: "Clients", value: "10k+" },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="font-['Syne'] text-2xl font-bold text-white">{value}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero image placeholder */}
            <div className="relative hidden lg:flex items-center justify-center">
              <div className="relative h-80 w-80">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500/20 to-indigo-500/20 blur-2xl" />
                <div className="relative z-10 flex h-full w-full items-center justify-center rounded-3xl border border-white/10 bg-white/5 backdrop-blur">
                  <div className="text-center">
                    <div className="text-8xl mb-4">🎧</div>
                    <p className="text-slate-300 font-semibold">WH-1000XM5</p>
                    <p className="text-blue-400 text-xl font-bold mt-1">$348.00</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Category strip ── */}
      <section className="border-y border-white/5 bg-[#0a0f1e]/50 py-4">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <Link key={cat}
                to={cat === "Tous" ? "/catalog" : `/catalog?category=${cat.toLowerCase()}`}
                className="shrink-0 rounded-full border border-white/10 px-4 py-1.5 text-sm text-slate-400 hover:border-blue-500/50 hover:text-blue-400 transition-colors">
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured products ── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-400 mb-1">Sélection</p>
            <h2 className="font-['Syne'] text-3xl font-bold text-white">Produits Vedettes</h2>
          </div>
          <Link to="/catalog" className="text-sm text-slate-400 hover:text-blue-400 transition-colors">
            Voir tout →
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="rounded-2xl bg-white/5 animate-pulse h-72" />
            ))}
          </div>
        ) : featured.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          /* Demo cards when API is not connected */
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {DEMO_PRODUCTS.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* ── Banner CTA ── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-20">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 p-8 lg:p-12">
          <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
          <div className="relative">
            <h3 className="font-['Syne'] text-3xl font-bold text-white mb-3">
              Livraison gratuite dès 50€
            </h3>
            <p className="text-blue-100 mb-6 max-w-md">
              Commandez maintenant et profitez de la livraison express offerte sur toutes les commandes de plus de 50€.
            </p>
            <Link to="/catalog"
              className="inline-block rounded-xl bg-white px-6 py-3 font-semibold text-blue-600 hover:bg-blue-50 transition-colors">
              Commander maintenant
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function ProductCard({ product }) {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => navigate(`/products/${product.id}`)}
      className="group cursor-pointer rounded-2xl border border-white/5 bg-[#0f172a] p-4 hover:border-blue-500/30 hover:bg-[#111827] transition-all duration-200"
    >
      {/* Image */}
      <div className="relative mb-4 h-36 w-full overflow-hidden rounded-xl bg-white/5 flex items-center justify-center">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <span className="text-5xl">{product.emoji ?? "📦"}</span>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-xl">
            <span className="text-xs font-semibold text-red-400">Rupture de stock</span>
          </div>
        )}
      </div>

      {/* Info */}
      <p className="text-xs text-slate-500 mb-1">{product.category?.name ?? product.categoryName}</p>
      <h3 className="text-sm font-semibold text-white line-clamp-2 mb-2 group-hover:text-blue-300 transition-colors">
        {product.name}
      </h3>

      {/* Rating */}
      <div className="flex items-center gap-1 mb-3">
        {[...Array(5)].map((_, i) => (
          <svg key={i} className={`h-3 w-3 ${i < Math.round(product.rating ?? 4) ? "text-yellow-400" : "text-slate-600"}`}
            fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        <span className="text-xs text-slate-500 ml-1">({product.reviewCount ?? 0})</span>
      </div>

      <div className="flex items-center justify-between">
        <p className="font-['Syne'] text-base font-bold text-white">
          ${Number(product.price).toFixed(2)}
        </p>
        <div className="rounded-lg bg-blue-500/10 px-2 py-0.5 text-xs text-blue-400 font-medium">
          {product.stock > 0 ? `${product.stock} dispo` : "Épuisé"}
        </div>
      </div>
    </div>
  );
}

const DEMO_PRODUCTS = [
  { id: 1, name: "WH-1000XM5 Casque Noise Cancelling", price: 348, category: { name: "Audio" }, stock: 12, rating: 5, reviewCount: 284, emoji: "🎧" },
  { id: 2, name: "Speed Racer Pro X Gaming Headset",   price: 89,  category: { name: "Gaming" }, stock: 5,  rating: 4, reviewCount: 97,  emoji: "🎮" },
  { id: 3, name: "Action Smart Camera 4K",             price: 299, category: { name: "Caméras" }, stock: 3,  rating: 4, reviewCount: 56,  emoji: "📷" },
  { id: 4, name: "Electric Pocket Speaker",            price: 64,  category: { name: "Audio" }, stock: 20, rating: 4, reviewCount: 143, emoji: "🔊" },
  { id: 5, name: "Smart Power Bank 26800mAh",          price: 45,  category: { name: "Accessoires" }, stock: 0,  rating: 4, reviewCount: 88,  emoji: "🔋" },
  { id: 6, name: "Pro Mechanical Keyboard RGB",        price: 129, category: { name: "Gaming" }, stock: 8,  rating: 5, reviewCount: 212, emoji: "⌨️" },
  { id: 7, name: "Wireless Charging Pad 15W",          price: 35,  category: { name: "Accessoires" }, stock: 15, rating: 4, reviewCount: 67,  emoji: "⚡" },
  { id: 8, name: "4K Ultra Wide Monitor 34\"",         price: 599, category: { name: "Écrans" }, stock: 4,  rating: 5, reviewCount: 31,  emoji: "🖥️" },
];
