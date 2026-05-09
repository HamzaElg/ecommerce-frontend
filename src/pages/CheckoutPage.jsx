import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useCart } from "../context/CartContext";

const STEPS = ["Livraison", "Paiement", "Confirmation"];

export default function CheckoutPage() {
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [error, setError] = useState("");

  const [address, setAddress] = useState({
    firstName: "", lastName: "", street: "", city: "", zip: "", country: "France", phone: "",
  });
  const [payment, setPayment] = useState({
    method: "CARD", cardNumber: "", expiry: "", cvv: "", cardHolder: "",
  });

  const items   = cart.items ?? [];
  const subtotal = cart.total ?? items.reduce((s, i) => s + i.price * i.quantity, 0);
  const shipping = subtotal >= 50 ? 0 : 4.99;
  const total    = subtotal + shipping;

  const handleAddressSubmit = (e) => {
    e.preventDefault();
    setStep(1);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // 1. Checkout → creates order
      const { data: order } = await api.post("/checkout", {
        shippingAddress: address,
      });
      // 2. Process payment
      await api.post("/payments", {
        orderId: order.id,
        method: payment.method,
        idempotencyKey: `pay-${order.id}-${Date.now()}`,
      });
      setOrderId(order.id);
      clearCart();
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message ?? "Erreur lors du paiement. Réessayez.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080d1a] text-white font-['DM_Sans']">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12">
        <h1 className="font-['Syne'] text-3xl font-bold mb-8">Finaliser la commande</h1>

        {/* Steps */}
        <div className="flex items-center gap-0 mb-10">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center flex-1 last:flex-none">
              <div className={`flex items-center gap-2 ${i <= step ? "text-white" : "text-slate-600"}`}>
                <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                  i < step  ? "bg-blue-500 text-white" :
                  i === step ? "bg-blue-500/20 border border-blue-500 text-blue-400" :
                  "bg-white/5 text-slate-600"
                }`}>
                  {i < step ? "✓" : i + 1}
                </div>
                <span className="text-sm font-medium">{s}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 mx-4 h-px ${i < step ? "bg-blue-500/50" : "bg-white/10"}`} />
              )}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left column */}
          <div className="lg:col-span-2">
            {/* Step 0: Shipping address */}
            {step === 0 && (
              <form onSubmit={handleAddressSubmit} className="rounded-2xl border border-white/5 bg-[#0f172a] p-6">
                <h2 className="font-['Syne'] text-lg font-bold mb-5">Adresse de livraison</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: "Prénom", name: "firstName", placeholder: "Jean" },
                      { label: "Nom", name: "lastName",  placeholder: "Dupont" },
                    ].map(({ label, name, placeholder }) => (
                      <div key={name}>
                        <label className="block text-xs font-semibold text-slate-400 mb-1.5">{label}</label>
                        <input required value={address[name]} onChange={(e) => setAddress({ ...address, [name]: e.target.value })}
                          placeholder={placeholder}
                          className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:border-blue-500/50 focus:outline-none" />
                      </div>
                    ))}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">Adresse</label>
                    <input required value={address.street} onChange={(e) => setAddress({ ...address, street: e.target.value })}
                      placeholder="123 Rue de la Paix"
                      className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:border-blue-500/50 focus:outline-none" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1.5">Ville</label>
                      <input required value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })}
                        placeholder="Paris"
                        className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:border-blue-500/50 focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1.5">Code postal</label>
                      <input required value={address.zip} onChange={(e) => setAddress({ ...address, zip: e.target.value })}
                        placeholder="75001"
                        className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:border-blue-500/50 focus:outline-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">Téléphone</label>
                    <input value={address.phone} onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                      placeholder="+33 6 12 34 56 78"
                      className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:border-blue-500/50 focus:outline-none" />
                  </div>
                </div>

                <button type="submit"
                  className="mt-6 w-full rounded-xl bg-blue-500 py-3 font-semibold text-white hover:bg-blue-400 transition-colors">
                  Continuer vers le paiement →
                </button>
              </form>
            )}

            {/* Step 1: Payment */}
            {step === 1 && (
              <form onSubmit={handlePaymentSubmit} className="rounded-2xl border border-white/5 bg-[#0f172a] p-6">
                <h2 className="font-['Syne'] text-lg font-bold mb-5">Informations de paiement</h2>

                {error && (
                  <div className="mb-4 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
                    {error}
                  </div>
                )}

                {/* Payment method tabs */}
                <div className="flex gap-2 mb-6">
                  {[
                    { value: "CARD",   label: "💳 Carte" },
                    { value: "PAYPAL", label: "🅿️ PayPal" },
                    { value: "STRIPE", label: "⚡ Stripe" },
                  ].map((m) => (
                    <button key={m.value} type="button"
                      onClick={() => setPayment({ ...payment, method: m.value })}
                      className={`flex-1 rounded-xl border py-2.5 text-sm font-medium transition-all ${
                        payment.method === m.value
                          ? "border-blue-500 bg-blue-500/10 text-blue-400"
                          : "border-white/10 text-slate-400 hover:bg-white/5"
                      }`}>
                      {m.label}
                    </button>
                  ))}
                </div>

                {payment.method === "CARD" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1.5">Titulaire de la carte</label>
                      <input required value={payment.cardHolder} onChange={(e) => setPayment({ ...payment, cardHolder: e.target.value })}
                        placeholder="Jean Dupont"
                        className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:border-blue-500/50 focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1.5">Numéro de carte</label>
                      <input required value={payment.cardNumber}
                        onChange={(e) => setPayment({ ...payment, cardNumber: e.target.value.replace(/\D/g, "").slice(0, 16) })}
                        placeholder="1234 5678 9012 3456"
                        className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:border-blue-500/50 focus:outline-none font-mono" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1.5">Date d'expiration</label>
                        <input required value={payment.expiry}
                          onChange={(e) => setPayment({ ...payment, expiry: e.target.value })}
                          placeholder="MM/AA"
                          className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:border-blue-500/50 focus:outline-none font-mono" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1.5">CVV</label>
                        <input required value={payment.cvv}
                          onChange={(e) => setPayment({ ...payment, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) })}
                          placeholder="123"
                          className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:border-blue-500/50 focus:outline-none font-mono" />
                      </div>
                    </div>
                  </div>
                )}

                {payment.method !== "CARD" && (
                  <div className="rounded-xl bg-blue-500/10 border border-blue-500/20 px-4 py-6 text-center text-sm text-blue-300">
                    Vous serez redirigé vers {payment.method === "PAYPAL" ? "PayPal" : "Stripe"} pour finaliser le paiement.
                  </div>
                )}

                <div className="mt-6 flex gap-3">
                  <button type="button" onClick={() => setStep(0)}
                    className="rounded-xl border border-white/10 px-5 py-3 text-sm text-slate-400 hover:bg-white/5 transition-colors">
                    ← Retour
                  </button>
                  <button type="submit" disabled={loading}
                    className="flex-1 rounded-xl bg-blue-500 py-3 font-semibold text-white hover:bg-blue-400 disabled:opacity-60 transition-colors flex items-center justify-center gap-2">
                    {loading ? <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> : `Payer $${total.toFixed(2)}`}
                  </button>
                </div>

                <p className="mt-3 text-center text-xs text-slate-600">
                  🔒 Paiement sécurisé SSL — Vos données sont protégées
                </p>
              </form>
            )}

            {/* Step 2: Confirmation */}
            {step === 2 && (
              <div className="rounded-2xl border border-green-500/20 bg-green-500/5 p-10 text-center">
                <div className="text-7xl mb-4">✅</div>
                <h2 className="font-['Syne'] text-2xl font-bold text-white mb-2">Commande confirmée !</h2>
                <p className="text-slate-400 text-sm mb-2">Merci pour votre achat.</p>
                {orderId && <p className="text-xs text-slate-600 mb-8">Commande #{orderId}</p>}
                <div className="flex gap-3 justify-center">
                  <button onClick={() => navigate("/orders")}
                    className="rounded-xl bg-blue-500 px-6 py-3 font-semibold text-white hover:bg-blue-400 transition-colors">
                    Voir mes commandes
                  </button>
                  <button onClick={() => navigate("/catalog")}
                    className="rounded-xl border border-white/10 px-6 py-3 text-sm text-slate-400 hover:bg-white/5 transition-colors">
                    Continuer mes achats
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-2xl border border-white/5 bg-[#0f172a] p-6">
              <h3 className="font-['Syne'] text-base font-bold mb-4">Récapitulatif</h3>
              <div className="space-y-3 mb-5 max-h-60 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-white/5 shrink-0 flex items-center justify-center overflow-hidden">
                      {item.product?.imageUrl
                        ? <img src={item.product.imageUrl} alt="" className="h-full w-full object-cover" />
                        : <span className="text-lg">{item.product?.emoji ?? "📦"}</span>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-white line-clamp-1">{item.product?.name ?? item.productName}</p>
                      <p className="text-xs text-slate-500">Qté: {item.quantity}</p>
                    </div>
                    <p className="text-xs font-semibold text-white shrink-0">
                      ${(Number(item.price ?? item.product?.price) * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-white/5 pt-4 space-y-2">
                <div className="flex justify-between text-sm text-slate-400">
                  <span>Sous-total</span><span>${Number(subtotal).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-400">
                  <span>Livraison</span>
                  <span className={shipping === 0 ? "text-green-400" : ""}>{shipping === 0 ? "Gratuite" : `$${shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between font-bold text-white pt-2 border-t border-white/5">
                  <span>Total</span>
                  <span className="font-['Syne'] text-lg">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
