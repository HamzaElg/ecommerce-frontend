import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useCart } from "../context/CartContext";

const STEPS = ["Livraison", "Paiement", "Confirmation"];

export default function CheckoutPage() {
  const { cart, resetCartLocal, clearCart } = useCart();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [error, setError] = useState("");

  const [address, setAddress] = useState({
    firstName: "",
    lastName: "",
    street: "",
    city: "Rabat",
    state: "Rabat-Sale-Kenitra",
    zipCode: "10000",
    country: "MA",
    phone: "",
  });

  const [paymentToken, setPaymentToken] = useState("tok_test_success");

  const items = cart.items ?? [];

  const subtotal = Number(cart.totalAmount ?? 0);
  const shipping = subtotal >= 50 ? 0 : 4.99;
  const total = subtotal + shipping;

  const handleAddressSubmit = (e) => {
    e.preventDefault();

    if (items.length === 0) {
      setError("Votre panier est vide.");
      return;
    }

    setError("");
    setStep(1);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const checkoutResponse = await api.post(
        "/checkout",
        {
          shippingAddress: {
            street: address.street,
            city: address.city,
            state: address.state,
            zipCode: address.zipCode,
            country: address.country,
          },
        },
        {
          headers: {
            "Idempotency-Key": crypto.randomUUID(),
          },
        }
      );

      const orderData = checkoutResponse.data.data;

      const paymentResponse = await api.post(
        "/payments",
        {
          orderId: orderData.orderId,
          method: "CREDIT_CARD",
          paymentDetails: {
            token: paymentToken,
          },
        },
        {
          headers: {
            "Idempotency-Key": crypto.randomUUID(),
          },
        }
      );

      const paymentData = paymentResponse.data.data;

      if (paymentData.status === "SUCCESS") {
        setOrderId(orderData.orderId);

        if (typeof resetCartLocal === "function") {
          resetCartLocal();
        } else if (typeof clearCart === "function") {
          await clearCart();
        }

        setStep(2);
        return;
      }

      if (paymentData.status === "FAILED") {
        setError(
          "Le paiement a échoué. La réservation a été libérée. Vous devez refaire le checkout."
        );
        return;
      }

      setError("Statut de paiement inattendu.");
    } catch (err) {
      setError(err.message ?? "Erreur lors du paiement. Réessayez.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080d1a] text-white font-['DM_Sans']">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12">
        <h1 className="font-['Syne'] text-3xl font-bold mb-8">
          Finaliser la commande
        </h1>

        {/* Steps */}
        <div className="flex items-center gap-0 mb-10">
          {STEPS.map((stepLabel, index) => (
            <div key={stepLabel} className="flex items-center flex-1 last:flex-none">
              <div
                className={`flex items-center gap-2 ${
                  index <= step ? "text-white" : "text-slate-600"
                }`}
              >
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                    index < step
                      ? "bg-blue-500 text-white"
                      : index === step
                      ? "bg-blue-500/20 border border-blue-500 text-blue-400"
                      : "bg-white/5 text-slate-600"
                  }`}
                >
                  {index < step ? "✓" : index + 1}
                </div>
                <span className="text-sm font-medium">{stepLabel}</span>
              </div>

              {index < STEPS.length - 1 && (
                <div
                  className={`flex-1 mx-4 h-px ${
                    index < step ? "bg-blue-500/50" : "bg-white/10"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {error && step !== 1 && (
          <div className="mb-6 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left column */}
          <div className="lg:col-span-2">
            {/* Step 0: Shipping address */}
            {step === 0 && (
              <form
                onSubmit={handleAddressSubmit}
                className="rounded-2xl border border-white/5 bg-[#0f172a] p-6"
              >
                <h2 className="font-['Syne'] text-lg font-bold mb-5">
                  Adresse de livraison
                </h2>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                        Prénom
                      </label>
                      <input
                        required
                        value={address.firstName}
                        onChange={(e) =>
                          setAddress({ ...address, firstName: e.target.value })
                        }
                        placeholder="Hamza"
                        className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:border-blue-500/50 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                        Nom
                      </label>
                      <input
                        required
                        value={address.lastName}
                        onChange={(e) =>
                          setAddress({ ...address, lastName: e.target.value })
                        }
                        placeholder="Elg"
                        className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:border-blue-500/50 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                      Adresse
                    </label>
                    <input
                      required
                      value={address.street}
                      onChange={(e) =>
                        setAddress({ ...address, street: e.target.value })
                      }
                      placeholder="123 Main Street"
                      className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:border-blue-500/50 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                        Ville
                      </label>
                      <input
                        required
                        value={address.city}
                        onChange={(e) =>
                          setAddress({ ...address, city: e.target.value })
                        }
                        placeholder="Rabat"
                        className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:border-blue-500/50 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                        Code postal
                      </label>
                      <input
                        required
                        value={address.zipCode}
                        onChange={(e) =>
                          setAddress({ ...address, zipCode: e.target.value })
                        }
                        placeholder="10000"
                        className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:border-blue-500/50 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                      Région / État
                    </label>
                    <input
                      required
                      value={address.state}
                      onChange={(e) =>
                        setAddress({ ...address, state: e.target.value })
                      }
                      placeholder="Rabat-Sale-Kenitra"
                      className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:border-blue-500/50 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                      Pays
                    </label>
                    <input
                      required
                      value={address.country}
                      onChange={(e) =>
                        setAddress({ ...address, country: e.target.value })
                      }
                      placeholder="MA"
                      className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:border-blue-500/50 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                      Téléphone
                    </label>
                    <input
                      value={address.phone}
                      onChange={(e) =>
                        setAddress({ ...address, phone: e.target.value })
                      }
                      placeholder="+212 6 12 34 56 78"
                      className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:border-blue-500/50 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="mt-6 w-full rounded-xl bg-blue-500 py-3 font-semibold text-white hover:bg-blue-400 transition-colors"
                >
                  Continuer vers le paiement →
                </button>
              </form>
            )}

            {/* Step 1: Payment */}
            {step === 1 && (
              <form
                onSubmit={handlePaymentSubmit}
                className="rounded-2xl border border-white/5 bg-[#0f172a] p-6"
              >
                <h2 className="font-['Syne'] text-lg font-bold mb-5">
                  Paiement de test
                </h2>

                {error && (
                  <div className="mb-4 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
                    {error}
                  </div>
                )}

                <div className="rounded-xl bg-blue-500/10 border border-blue-500/20 px-4 py-4 text-sm text-blue-300 mb-6">
                  Ce backend utilise un paiement simulé. Utilise{" "}
                  <span className="font-mono text-white">tok_test_success</span>{" "}
                  pour réussir ou{" "}
                  <span className="font-mono text-white">tok_test_fail</span>{" "}
                  pour tester un échec.
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                    Token de paiement
                  </label>
                  <select
                    value={paymentToken}
                    onChange={(e) => setPaymentToken(e.target.value)}
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white focus:border-blue-500/50 focus:outline-none"
                  >
                    <option value="tok_test_success" className="bg-[#0f172a]">
                      tok_test_success
                    </option>
                    <option value="tok_test_fail" className="bg-[#0f172a]">
                      tok_test_fail
                    </option>
                  </select>
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(0)}
                    className="rounded-xl border border-white/10 px-5 py-3 text-sm text-slate-400 hover:bg-white/5 transition-colors"
                  >
                    ← Retour
                  </button>

                  <button
                    type="submit"
                    disabled={loading || items.length === 0}
                    className="flex-1 rounded-xl bg-blue-500 py-3 font-semibold text-white hover:bg-blue-400 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    ) : (
                      `Payer $${total.toFixed(2)}`
                    )}
                  </button>
                </div>

                <p className="mt-3 text-center text-xs text-slate-600">
                  Paiement simulé pour environnement de développement.
                </p>
              </form>
            )}

            {/* Step 2: Confirmation */}
            {step === 2 && (
              <div className="rounded-2xl border border-green-500/20 bg-green-500/5 p-10 text-center">
                <div className="text-7xl mb-4">✅</div>

                <h2 className="font-['Syne'] text-2xl font-bold text-white mb-2">
                  Commande confirmée !
                </h2>

                <p className="text-slate-400 text-sm mb-2">
                  Merci pour votre achat.
                </p>

                {orderId && (
                  <p className="text-xs text-slate-600 mb-8">
                    Commande #{orderId}
                  </p>
                )}

                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => navigate("/orders")}
                    className="rounded-xl bg-blue-500 px-6 py-3 font-semibold text-white hover:bg-blue-400 transition-colors"
                  >
                    Voir mes commandes
                  </button>

                  <button
                    onClick={() => navigate("/catalog")}
                    className="rounded-xl border border-white/10 px-6 py-3 text-sm text-slate-400 hover:bg-white/5 transition-colors"
                  >
                    Continuer mes achats
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-2xl border border-white/5 bg-[#0f172a] p-6">
              <h3 className="font-['Syne'] text-base font-bold mb-4">
                Récapitulatif
              </h3>

              <div className="space-y-3 mb-5 max-h-60 overflow-y-auto pr-1">
                {items.length === 0 ? (
                  <p className="text-sm text-slate-500">Panier vide.</p>
                ) : (
                  items.map((item) => (
                    <div
                      key={item.itemId ?? item.productId}
                      className="flex items-center gap-3"
                    >
                      <div className="h-10 w-10 rounded-lg bg-white/5 shrink-0 flex items-center justify-center overflow-hidden">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.productName}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-lg">📦</span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-white line-clamp-1">
                          {item.productName}
                        </p>
                        <p className="text-xs text-slate-500">
                          Qté: {item.quantity}
                        </p>
                      </div>

                      <p className="text-xs font-semibold text-white shrink-0">
                        ${Number(item.subtotal).toFixed(2)}
                      </p>
                    </div>
                  ))
                )}
              </div>

              <div className="border-t border-white/5 pt-4 space-y-2">
                <div className="flex justify-between text-sm text-slate-400">
                  <span>Sous-total</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-sm text-slate-400">
                  <span>Livraison</span>
                  <span className={shipping === 0 ? "text-green-400" : ""}>
                    {shipping === 0 ? "Gratuite" : `$${shipping.toFixed(2)}`}
                  </span>
                </div>

                <div className="flex justify-between font-bold text-white pt-2 border-t border-white/5">
                  <span>Total</span>
                  <span className="font-['Syne'] text-lg">
                    ${total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div> 
    </div>
  );
}