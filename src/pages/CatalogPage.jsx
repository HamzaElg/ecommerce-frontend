import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../api/axios";

const CATEGORIES = ["Tous", "Audio", "Gaming", "Caméras", "Laptops", "Mobiles", "Accessoires", "Écrans"];
const SORT_OPTIONS = [
  { label: "Pertinence",        value: "" },
  { label: "Prix croissant",    value: "price,asc" },
  { label: "Prix décroissant",  value: "price,desc" },
  { label: "Mieux notés",       value: "rating,desc" },
  { label: "Nouveautés",        value: "createdAt,desc" },
];

export default function CatalogPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [total, setTotal]       = useState(0);
  const [loading, setLoading]   = useState(true);

  const [query,    setQuery]    = useState(searchParams.get("q") ?? "");
  const [category, setCategory] = useState(searchParams.get("category") ?? "");
  const [sort,     setSort]     = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [page,     setPage]     = useState(0);
  const PAGE_SIZE = 12;

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page, size: PAGE_SIZE,
        ...(query    && { q: query }),
        ...(category && category !== "Tous" && { category }),
        ...(sort     && { sort }),
        ...(minPrice && { minPrice }),
        ...(maxPrice && { maxPrice }),
      });
      const { data } = await api.get(`/products/search?${params}`);
      const result = data.data ?? data;
      setProducts(result.content ?? result);
      setTotal(result.totalElements ?? result.length ?? 0);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [query, category, sort, minPrice, maxPrice, page]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(0);
    setSearchParams({ ...(query && { q: query }), ...(category && { category }) });
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="min-h-screen bg-[#080d1a] text-white font-['DM_Sans']">
      {/* Header */}
      <div className="border-b border-white/5 bg-[#0a0f1e]/70 py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h1 className="font-['Syne'] text-4xl font-bold mb-2">Catalogue</h1>
          <p className="text-slate-400 text-sm">
            {total > 0 ? `${total} produits trouvés` : "Découvrez notre sélection"}
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="mt-6 flex gap-3 max-w-lg">
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500"
                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher un produit..."
                className="w-full rounded-xl bg-white/5 pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 border border-white/10 focus:border-blue-500/50 focus:outline-none"
              />
            </div>
            <button type="submit"
              className="rounded-xl bg-blue-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-400 transition-colors">
              Rechercher
            </button>
          </form>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 flex gap-8">
        {/* ── Sidebar Filters ── */}
        <aside className="hidden lg:block w-56 shrink-0">
          {/* Categories */}
          <div className="mb-8">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">Catégorie</h3>
            <ul className="space-y-1">
              {CATEGORIES.map((cat) => (
                <li key={cat}>
                  <button
                    onClick={() => { setCategory(cat === "Tous" ? "" : cat); setPage(0); }}
                    className={`w-full text-left rounded-lg px-3 py-1.5 text-sm transition-colors ${
                      (category === "" && cat === "Tous") || category === cat
                        ? "bg-blue-500/10 text-blue-400 font-medium"
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Price range */}
          <div className="mb-8">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">Prix (€)</h3>
            <div className="flex gap-2 items-center">
              <input value={minPrice} onChange={(e) => setMinPrice(e.target.value)}
                placeholder="Min" type="number"
                className="w-full rounded-lg bg-white/5 px-3 py-1.5 text-sm text-white border border-white/10 focus:border-blue-500/50 focus:outline-none" />
              <span className="text-slate-600">–</span>
              <input value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="Max" type="number"
                className="w-full rounded-lg bg-white/5 px-3 py-1.5 text-sm text-white border border-white/10 focus:border-blue-500/50 focus:outline-none" />
            </div>
            <button onClick={() => setPage(0)}
              className="mt-2 w-full rounded-lg bg-white/5 py-1.5 text-xs text-slate-400 hover:bg-white/10 transition-colors">
              Appliquer
            </button>
          </div>

          {/* Sort */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">Trier par</h3>
            <select value={sort} onChange={(e) => { setSort(e.target.value); setPage(0); }}
              className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-1.5 text-sm text-slate-300 focus:outline-none">
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value} className="bg-[#0f172a]">{o.label}</option>
              ))}
            </select>
          </div>
        </aside>

        {/* ── Product Grid ── */}
        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="rounded-2xl bg-white/5 animate-pulse h-64" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="font-['Syne'] text-xl font-bold mb-2">Aucun produit trouvé</h3>
              <p className="text-slate-400 text-sm">Essayez d'autres termes de recherche</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {products.map((product) => (
                  <CatalogCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-10 flex items-center justify-center gap-2">
                  <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}
                    className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-400 hover:bg-white/5 disabled:opacity-30 transition-colors">
                    ← Précédent
                  </button>
                  <span className="text-sm text-slate-500 px-3">
                    Page {page + 1} / {totalPages}
                  </span>
                  <button onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
                    className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-400 hover:bg-white/5 disabled:opacity-30 transition-colors">
                    Suivant →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function CatalogCard({ product }) {
  const navigate = useNavigate();
  return (
    <div onClick={() => navigate(`/products/${product.id}`)}
      className="group cursor-pointer rounded-2xl border border-white/5 bg-[#0f172a] p-4 hover:border-blue-500/30 hover:bg-[#111827] transition-all duration-200">
      <div className="mb-3 h-40 overflow-hidden rounded-xl bg-white/5 flex items-center justify-center">
        {product.imageUrl
          ? <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
          : <span className="text-5xl">{product.emoji ?? "📦"}</span>
        }
      </div>
      <p className="text-xs text-slate-500 mb-1">{product.category?.name}</p>
      <h3 className="text-sm font-semibold text-white line-clamp-2 mb-2 group-hover:text-blue-300 transition-colors">
        {product.name}
      </h3>
      <div className="flex items-center justify-between mt-auto">
        <p className="font-['Syne'] font-bold text-white">${Number(product.price).toFixed(2)}</p>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
          product.stock > 0 ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
        }`}>
          {product.stock > 0 ? "En stock" : "Épuisé"}
        </span>
      </div>
    </div>
  );
}
