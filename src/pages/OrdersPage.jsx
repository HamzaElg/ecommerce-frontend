import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const STATUS_STYLES = {
  PENDING:   { label: "En attente",  class: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" },
  PAID:      { label: "Payée",       class: "bg-blue-500/10  text-blue-400   border-blue-500/20" },
  SHIPPED:   { label: "Expédiée",    class: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" },
  DELIVERED: { label: "Livrée",      class: "bg-green-500/10 text-green-400  border-green-500/20" },
  CANCELLED: { label: "Annulée",     class: "bg-red-500/10   text-red-400    border-red-500/20" },
};

export default function OrdersPage() {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/orders")
      .then(({ data }) => setOrders(Array.isArray(data) ? data : data.content ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const openDetail = async (id) => {
    if (selected?.id === id) { setSelected(null); return; }
    const { data } = await api.get(`/orders/${id}`);
    setSelected(data);
  };

  if (loading) return (
    <div className="min-h-screen bg-[#080d1a] flex items-center justify-center">
      <div className="h-8 w-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#080d1a] text-white font-['DM_Sans']">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-12">
        <h1 className="font-['Syne'] text-3xl font-bold mb-8">Mes Commandes</h1>

        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-7xl mb-6">📦</div>
            <h2 className="font-['Syne'] text-2xl font-bold mb-2">Aucune commande</h2>
            <p className="text-slate-400 text-sm mb-6">Vous n'avez pas encore passé de commande.</p>
            <button onClick={() => navigate("/catalog")}
              className="rounded-xl bg-blue-500 px-6 py-3 font-semibold text-white hover:bg-blue-400 transition-colors">
              Commencer mes achats
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const status = STATUS_STYLES[order.status] ?? STATUS_STYLES.PENDING;
              const isOpen = selected?.id === order.id;
              return (
                <div key={order.id} className="rounded-2xl border border-white/5 bg-[#0f172a] overflow-hidden">
                  {/* Order header */}
                  <button onClick={() => openDetail(order.id)}
                    className="w-full text-left px-6 py-4 flex items-center justify-between hover:bg-white/2 transition-colors">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-xs text-slate-500 mb-0.5">Commande #{order.id?.slice(0, 8) ?? order.id}</p>
                        <p className="text-sm font-semibold text-white">
                          {order.createdAt ? new Date(order.createdAt).toLocaleDateString("fr-FR", {
                            day: "2-digit", month: "long", year: "numeric"
                          }) : "Date inconnue"}
                        </p>
                      </div>
                      <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${status.class}`}>
                        {status.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="font-['Syne'] font-bold text-white">
                        ${Number(order.total ?? order.totalAmount).toFixed(2)}
                      </p>
                      <svg className={`h-4 w-4 text-slate-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>

                  {/* Expanded detail */}
                  {isOpen && selected && (
                    <div className="border-t border-white/5 px-6 py-5">
                      {/* Progress bar */}
                      <div className="mb-6">
                        <div className="flex items-center gap-0">
                          {["PENDING", "PAID", "SHIPPED", "DELIVERED"].map((s, i) => {
                            const statuses = ["PENDING", "PAID", "SHIPPED", "DELIVERED"];
                            const currentIdx = statuses.indexOf(order.status);
                            const done = i <= currentIdx;
                            return (
                              <div key={s} className="flex items-center flex-1 last:flex-none">
                                <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold shrink-0 ${
                                  done ? "bg-blue-500 text-white" : "bg-white/5 text-slate-600"
                                }`}>
                                  {done ? "✓" : i + 1}
                                </div>
                                <p className={`ml-1 text-xs ${done ? "text-white" : "text-slate-600"}`}>
                                  {STATUS_STYLES[s]?.label}
                                </p>
                                {i < 3 && <div className={`flex-1 mx-2 h-px ${done && i < currentIdx ? "bg-blue-500/50" : "bg-white/10"}`} />}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Items */}
                      <div className="space-y-3 mb-4">
                        {(selected.items ?? []).map((item) => (
                          <div key={item.id} className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                              {item.product?.imageUrl
                                ? <img src={item.product.imageUrl} alt="" className="h-full w-full object-cover rounded-lg" />
                                : <span className="text-lg">{item.product?.emoji ?? "📦"}</span>
                              }
                            </div>
                            <div className="flex-1">
                              <p className="text-sm text-white">{item.product?.name ?? item.productName}</p>
                              <p className="text-xs text-slate-500">Qté: {item.quantity} × ${Number(item.unitPrice ?? item.price).toFixed(2)}</p>
                            </div>
                            <p className="text-sm font-semibold text-white">
                              ${(Number(item.unitPrice ?? item.price) * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Shipping address */}
                      {selected.shippingAddress && (
                        <div className="mt-4 rounded-xl bg-white/5 px-4 py-3">
                          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-1">Adresse de livraison</p>
                          <p className="text-sm text-slate-300">
                            {selected.shippingAddress.firstName} {selected.shippingAddress.lastName}<br />
                            {selected.shippingAddress.street}, {selected.shippingAddress.city} {selected.shippingAddress.zip}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
