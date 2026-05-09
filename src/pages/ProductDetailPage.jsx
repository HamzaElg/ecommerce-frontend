import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { isAuth } = useAuth();

  const [product,  setProduct]  = useState(null);
  const [reviews,  setReviews]  = useState([]);
  const [related,  setRelated]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [qty,      setQty]      = useState(1);
  const [adding,   setAdding]   = useState(false);
  const [tab,      setTab]      = useState("description"); // description | specs | reviews
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    Promise.all([
      api.get(`/products/${id}`),
      api.get(`/products/${id}/reviews`).catch(() => ({ data: [] })),
    ]).then(([{ data: p }, { data: r }]) => {
      setProduct(p);
      setReviews(Array.isArray(r) ? r : r.content ?? []);
      if (p.category?.id) {
        api.get(`/products/search?category=${p.category.name}&size=4`)
          .then(({ data }) => setRelated((data.content ?? data).filter((x) => x.id !== p.id)));
      }
    }).catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = async () => {
    if (!isAuth) { navigate("/login"); return; }
    setAdding(true);
    try { await addItem(product.id, qty); }
    catch (_) {}
    finally { setAdding(false); }
  };

  const handleReview = async (e) => {
    e.preventDefault();
    if (!isAuth) { navigate("/login"); return; }
    setSubmitting(true);
    try {
      const { data } = await api.post(`/products/${id}/reviews`, reviewForm);
      setReviews((prev) => [data, ...prev]);
      setReviewForm({ rating: 5, comment: "" });
    } catch (_) {}
    finally { setSubmitting(false); }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#080d1a] flex items-center justify-center">
      <div className="h-8 w-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
    </div>
  );

  if (!product) return (
    <div className="min-h-screen bg-[#080d1a] flex items-center justify-center text-white">
      <div className="text-center">
        <p className="text-6xl mb-4">😕</p>
        <h2 className="font-['Syne'] text-2xl font-bold mb-2">Produit introuvable</h2>
        <button onClick={() => navigate("/catalog")} className="mt-4 text-blue-400 hover:underline">
          Retour au catalogue
        </button>
      </div>
    </div>
  );

  const specs = product.specs ?? product.specifications ?? {};
  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : product.rating ?? "N/A";

  return (
    <div className="min-h-screen bg-[#080d1a] text-white font-['DM_Sans']">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-8">
          <button onClick={() => navigate("/")} className="hover:text-white transition-colors">Accueil</button>
          <span>/</span>
          <button onClick={() => navigate("/catalog")} className="hover:text-white transition-colors">Catalogue</button>
          <span>/</span>
          <span className="text-slate-300 truncate max-w-xs">{product.name}</span>
        </div>

        {/* Main layout */}
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Image */}
          <div className="rounded-3xl border border-white/10 bg-[#0f172a] overflow-hidden flex items-center justify-center min-h-80">
            {product.imageUrl
              ? <img src={product.imageUrl} alt={product.name} className="w-full h-96 object-contain p-8" />
              : <span className="text-[120px]">{product.emoji ?? "📦"}</span>
            }
          </div>

          {/* Info */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-medium text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">
                {product.category?.name}
              </span>
              {product.stock > 0
                ? <span className="text-xs text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full">En stock</span>
                : <span className="text-xs text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full">Rupture de stock</span>
              }
            </div>

            <h1 className="font-['Syne'] text-3xl font-bold mb-3 leading-tight">{product.name}</h1>

            {/* Rating summary */}
            <div className="flex items-center gap-2 mb-6">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className={`h-4 w-4 ${i < Math.round(avgRating) ? "text-yellow-400" : "text-slate-700"}`}
                    fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm text-slate-400">{avgRating} ({reviews.length} avis)</span>
            </div>

            <p className="font-['Syne'] text-4xl font-bold text-white mb-2">
              ${Number(product.price).toFixed(2)}
            </p>
            {product.originalPrice && (
              <p className="text-sm text-slate-500 line-through mb-4">${Number(product.originalPrice).toFixed(2)}</p>
            )}

            <p className="text-slate-400 text-sm leading-relaxed mb-8">
              {product.description ?? "Produit de haute qualité avec des performances exceptionnelles."}
            </p>

            {/* Qty + Add to cart */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="px-3 py-2 text-slate-400 hover:text-white transition-colors">–</button>
                <span className="w-8 text-center text-sm font-semibold">{qty}</span>
                <button onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                  className="px-3 py-2 text-slate-400 hover:text-white transition-colors">+</button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={adding || product.stock === 0}
                className="flex-1 rounded-xl bg-blue-500 py-3 font-semibold text-white hover:bg-blue-400 disabled:opacity-50 transition-all duration-200 flex items-center justify-center gap-2"
              >
                {adding ? (
                  <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                ) : (
                  <>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.5 6h13M7 13L5.4 5" />
                    </svg>
                    Ajouter au panier
                  </>
                )}
              </button>
            </div>

            <p className="text-xs text-slate-600">
              {product.stock} unités disponibles • Livraison estimée sous 2-5 jours ouvrables
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-white/5 mb-8">
          <div className="flex gap-6">
            {[
              { key: "description", label: "Description" },
              { key: "specs",       label: "Spécifications" },
              { key: "reviews",     label: `Avis (${reviews.length})` },
            ].map((t) => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`pb-3 text-sm font-medium transition-colors border-b-2 ${
                  tab === t.key
                    ? "border-blue-500 text-blue-400"
                    : "border-transparent text-slate-500 hover:text-white"
                }`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {tab === "description" && (
          <div className="max-w-2xl text-slate-400 text-sm leading-relaxed">
            {product.description ?? "Description détaillée du produit non disponible."}
          </div>
        )}

        {tab === "specs" && (
          <div className="max-w-2xl">
            {Object.keys(specs).length > 0 ? (
              <div className="rounded-2xl border border-white/5 overflow-hidden">
                {Object.entries(specs).map(([key, val], i) => (
                  <div key={key} className={`flex items-center px-6 py-3 ${i % 2 === 0 ? "bg-white/2" : "bg-white/5"}`}>
                    <span className="w-48 text-xs font-semibold uppercase tracking-wide text-slate-500">{key}</span>
                    <span className="text-sm text-slate-300">{String(val)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-sm">Spécifications non disponibles.</p>
            )}
          </div>
        )}

        {tab === "reviews" && (
          <div className="max-w-2xl space-y-6">
            {isAuth && (
              <form onSubmit={handleReview} className="rounded-2xl border border-white/5 bg-[#0f172a] p-6 mb-8">
                <h3 className="font-['Syne'] text-base font-bold mb-4">Laisser un avis</h3>
                <div className="flex gap-1 mb-4">
                  {[1,2,3,4,5].map((star) => (
                    <button key={star} type="button" onClick={() => setReviewForm(f => ({...f, rating: star}))}>
                      <svg className={`h-6 w-6 ${star <= reviewForm.rating ? "text-yellow-400" : "text-slate-700"} hover:text-yellow-300 transition-colors`}
                        fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </button>
                  ))}
                </div>
                <textarea
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm(f => ({...f, comment: e.target.value}))}
                  placeholder="Partagez votre expérience..."
                  rows={3}
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-blue-500/50 focus:outline-none resize-none"
                />
                <button type="submit" disabled={submitting || !reviewForm.comment}
                  className="mt-3 rounded-xl bg-blue-500 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-400 disabled:opacity-50 transition-colors">
                  {submitting ? "Envoi..." : "Publier mon avis"}
                </button>
              </form>
            )}

            {reviews.length === 0 ? (
              <p className="text-slate-500 text-sm">Aucun avis pour le moment. Soyez le premier !</p>
            ) : (
              reviews.map((r) => (
                <div key={r.id} className="rounded-2xl border border-white/5 bg-[#0f172a] p-5">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm font-semibold text-white">{r.user?.email?.split("@")[0] ?? "Utilisateur"}</p>
                      <div className="flex gap-0.5 mt-0.5">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} className={`h-3 w-3 ${i < r.rating ? "text-yellow-400" : "text-slate-700"}`}
                            fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                    <span className="text-xs text-slate-600">
                      {r.createdAt ? new Date(r.createdAt).toLocaleDateString("fr-FR") : ""}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400">{r.comment}</p>
                </div>
              ))
            )}
          </div>
        )}

        {/* Related products */}
        {related.length > 0 && (
          <div className="mt-20">
            <h2 className="font-['Syne'] text-2xl font-bold mb-6">Produits similaires</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {related.map((p) => (
                <div key={p.id} onClick={() => navigate(`/products/${p.id}`)}
                  className="group cursor-pointer rounded-2xl border border-white/5 bg-[#0f172a] p-4 hover:border-blue-500/30 transition-all">
                  <div className="h-32 flex items-center justify-center mb-3 rounded-xl bg-white/5">
                    {p.imageUrl ? <img src={p.imageUrl} alt={p.name} className="h-full w-full object-contain p-4" />
                      : <span className="text-4xl">{p.emoji ?? "📦"}</span>}
                  </div>
                  <p className="text-xs font-semibold text-white line-clamp-2 group-hover:text-blue-300 transition-colors">{p.name}</p>
                  <p className="font-['Syne'] font-bold text-blue-400 mt-1">${Number(p.price).toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
