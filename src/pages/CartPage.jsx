import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function CartPage() {
  const { cart, loading, removeItem, updateQuantity } = useCart();
  const navigate = useNavigate();

  if (loading) return (
    <div className="min-h-screen bg-[#080d1a] flex items-center justify-center">
      <div className="h-8 w-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
    </div>
  );

  const items = cart.items ?? [];
  const total = cart.total ?? items.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <div className="min-h-screen bg-[#080d1a] text-white font-['DM_Sans']">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12">
        <h1 className="font-['Syne'] text-3xl font-bold mb-8">Mon Panier</h1>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-7xl mb-6">🛒</div>
            <h2 className="font-['Syne'] text-2xl font-bold mb-2">Votre panier est vide</h2>
            <p className="text-slate-400 text-sm mb-6">Ajoutez des produits depuis le catalogue</p>
            <button onClick={() => navigate("/catalog")}
              className="rounded-xl bg-blue-500 px-6 py-3 font-semibold text-white hover:bg-blue-400 transition-colors">
              Voir le catalogue
            </button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div key={item.id}
                  className="flex items-center gap-4 rounded-2xl border border-white/5 bg-[#0f172a] p-4">
                  {/* Image */}
                  <div className="h-20 w-20 shrink-0 rounded-xl bg-white/5 flex items-center justify-center overflow-hidden">
                    {item.product?.imageUrl
                      ? <img src={item.product.imageUrl} alt={item.product.name} className="h-full w-full object-cover" />
                      : <span className="text-3xl">{item.product?.emoji ?? "📦"}</span>
                    }
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-500 mb-0.5">{item.product?.category?.name}</p>
                    <h3 className="text-sm font-semibold text-white line-clamp-2">{item.product?.name ?? item.productName}</h3>
                    <p className="font-['Syne'] font-bold text-blue-400 mt-1">
                      ${Number(item.price ?? item.product?.price).toFixed(2)}
                    </p>
                  </div>

                  {/* Qty controls */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center rounded-lg border border-white/10 bg-white/5">
                      <button onClick={() => item.quantity > 1
                        ? updateQuantity(item.id, item.quantity - 1)
                        : removeItem(item.id)}
                        className="px-2.5 py-1.5 text-slate-400 hover:text-white transition-colors text-sm">
                        {item.quantity === 1 ? "🗑" : "–"}
                      </button>
                      <span className="w-7 text-center text-sm font-semibold">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="px-2.5 py-1.5 text-slate-400 hover:text-white transition-colors text-sm">+</button>
                    </div>
                    <button onClick={() => removeItem(item.id)}
                      className="p-2 text-slate-600 hover:text-red-400 transition-colors">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 rounded-2xl border border-white/5 bg-[#0f172a] p-6">
                <h2 className="font-['Syne'] text-lg font-bold mb-6">Récapitulatif</h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm text-slate-400">
                    <span>Sous-total ({items.length} article{items.length > 1 ? "s" : ""})</span>
                    <span>${Number(total).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-400">
                    <span>Livraison</span>
                    <span className="text-green-400">{total >= 50 ? "Gratuite" : "$4.99"}</span>
                  </div>
                  <div className="border-t border-white/5 pt-3 flex justify-between font-bold text-white">
                    <span>Total</span>
                    <span className="font-['Syne'] text-xl">
                      ${(Number(total) + (total >= 50 ? 0 : 4.99)).toFixed(2)}
                    </span>
                  </div>
                </div>

                {total < 50 && (
                  <div className="mb-4 rounded-xl bg-blue-500/10 px-4 py-3 text-xs text-blue-400">
                    Ajoutez ${(50 - total).toFixed(2)} pour la livraison gratuite 🎁
                  </div>
                )}

                <button onClick={() => navigate("/checkout")}
                  className="w-full rounded-xl bg-blue-500 py-3 font-semibold text-white hover:bg-blue-400 transition-colors">
                  Passer la commande →
                </button>

                <button onClick={() => navigate("/catalog")}
                  className="mt-3 w-full rounded-xl border border-white/10 py-2.5 text-sm text-slate-400 hover:bg-white/5 transition-colors">
                  Continuer mes achats
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
