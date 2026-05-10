import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";

const NAV = [
  { label: "Dashboard", path: "/admin", icon: "📊" },
  { label: "Produits", path: "/admin/products", icon: "📦" },
  { label: "Commandes", path: "/admin/orders", icon: "🛍️" },
  { label: "Utilisateurs", path: "/admin/users", icon: "👥" },
  { label: "Analytics", path: "/admin/analytics", icon: "📈" },
];

const STATUSES = [
  "PENDING_PAYMENT",
  "PAID",
  "SHIPPED",
  "DELIVERED",
  "FAILED",
  "CANCELLED",
  "REFUNDED",
];

const STATUS_STYLES = {
  PENDING_PAYMENT: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  PAID: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  SHIPPED: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  DELIVERED: "bg-green-500/10 text-green-400 border-green-500/20",
  FAILED: "bg-red-500/10 text-red-400 border-red-500/20",
  CANCELLED: "bg-red-500/10 text-red-400 border-red-500/20",
  REFUNDED: "bg-slate-500/10 text-slate-400 border-slate-500/20",
};

const STATUS_LABELS = {
  PENDING_PAYMENT: "Paiement en attente",
  PAID: "Payée",
  SHIPPED: "Expédiée",
  DELIVERED: "Livrée",
  FAILED: "Échouée",
  CANCELLED: "Annulée",
  REFUNDED: "Remboursée",
};

const NEXT_ALLOWED_STATUSES = {
  PENDING_PAYMENT: ["CANCELLED"],
  PAID: ["SHIPPED", "REFUNDED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  FAILED: [],
  CANCELLED: [],
  REFUNDED: [],
};

export default function AdminOrders() {
  const detailRef = useRef(null);

  const [orders, setOrders] = useState([]);
  const [selected, setSelected] = useState(null);

  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [updating, setUpdating] = useState(null);

  const [filterStatus, setFilterStatus] = useState("ALL");
  const [search, setSearch] = useState("");

  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const PAGE_SIZE = 20;

  const showError = (message) => {
    setError(message);
    setSuccess("");
  };

  const showSuccess = (message) => {
    setSuccess(message);
    setError("");
  };

  const fetchOrders = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/admin/orders", {
        params: {
          page,
          size: PAGE_SIZE,
          ...(filterStatus !== "ALL" && { status: filterStatus }),
        },
      });

      const orderList = response.data.data ?? [];

      setOrders(orderList);
      setTotal(response.data.pagination?.totalElements ?? orderList.length);
    } catch (err) {
      showError(err.message ?? "Impossible de charger les commandes admin.");
      setOrders([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filterStatus]);

  const filteredOrders = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    if (!searchText) {
      return orders;
    }

    return orders.filter((order) => {
      const orderId = order.orderId ?? "";

      return (
        orderId.toLowerCase().includes(searchText) ||
        order.status?.toLowerCase().includes(searchText) ||
        String(order.totalAmount ?? "").includes(searchText)
      );
    });
  }, [orders, search]);

  const statusCounts = useMemo(() => {
    return orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] ?? 0) + 1;
      return acc;
    }, {});
  }, [orders]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const openDetail = async (orderId) => {
    if (selected?.orderId === orderId) {
      setSelected(null);
      return;
    }

    setDetailLoading(true);
    setError("");

    try {
      const response = await api.get(`/admin/orders/${orderId}`);
      setSelected(response.data.data);

      setTimeout(() => {
        detailRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 50);
    } catch (err) {
      showError(err.message ?? "Impossible de charger le détail de la commande.");
    } finally {
      setDetailLoading(false);
    }
  };

  const updateStatus = async (order, newStatus) => {
    const orderId = order.orderId;

    if (!newStatus || newStatus === order.status) return;

    const allowed = NEXT_ALLOWED_STATUSES[order.status] ?? [];

    if (!allowed.includes(newStatus)) {
      showError(`Transition interdite côté UI: ${order.status} → ${newStatus}`);
      return;
    }

    const confirmed = window.confirm(
      `Changer la commande #${orderId.slice(0, 8)} de ${order.status} vers ${newStatus} ?`
    );

    if (!confirmed) return;

    setUpdating(orderId);
    setError("");
    setSuccess("");

    try {
      const response = await api.patch(`/admin/orders/${orderId}/status`, null, {
        params: {
          status: newStatus,
        },
      });

      const updatedOrder = response.data.data;

      setOrders((prev) =>
        prev.map((item) =>
          item.orderId === orderId
            ? {
                ...item,
                status: updatedOrder.status ?? newStatus,
                totalAmount: updatedOrder.totalAmount ?? item.totalAmount,
                createdAt: updatedOrder.createdAt ?? item.createdAt,
              }
            : item
        )
      );

      if (selected?.orderId === orderId) {
        setSelected(updatedOrder);
      }

      showSuccess("Statut de commande mis à jour.");
    } catch (err) {
      showError(err.message ?? "Erreur lors de la mise à jour du statut.");
    } finally {
      setUpdating(null);
    }
  };

  const getStatusOptions = (status) => {
    return NEXT_ALLOWED_STATUSES[status] ?? [];
  };

  const resetFilters = () => {
    setFilterStatus("ALL");
    setSearch("");
    setPage(0);
    setSelected(null);
  };

  return (
    <div className="flex min-h-screen bg-[#080d1a] text-white font-['DM_Sans']">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-56 border-r border-white/5 bg-[#0a0f1e] py-8 px-4">
        <div className="flex items-center gap-2 mb-10 px-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500">
            <svg
              className="h-4 w-4 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <span className="font-['Syne'] text-sm font-bold">Admin Panel</span>
        </div>

        <nav className="flex flex-col gap-1 flex-1">
          {NAV.map(({ label, path, icon }) => (
            <Link
              key={path}
              to={path}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                window.location.pathname === path
                  ? "bg-blue-500/10 text-blue-400 font-medium"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span>{icon}</span>
              {label}
            </Link>
          ))}
        </nav>

        <Link
          to="/"
          className="mt-auto flex items-center gap-2 rounded-xl px-3 py-2 text-xs text-slate-500 hover:text-white transition-colors"
        >
          ← Retour au site
        </Link>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-xs text-slate-500 mb-0.5">Gestion</p>
            <h1 className="font-['Syne'] text-2xl font-bold">
              Gestion des Commandes
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Toutes les commandes clients via les endpoints admin.
            </p>
          </div>

          <button
            onClick={fetchOrders}
            className="rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-300 hover:bg-white/5 transition-colors"
          >
            Rafraîchir
          </button>
        </div>

        {error && (
          <div className="mb-5 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-5 rounded-xl bg-green-500/10 border border-green-500/20 px-4 py-3 text-sm text-green-400">
            {success}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total", value: total },
            { label: "Payées", value: statusCounts.PAID ?? 0 },
            { label: "Expédiées", value: statusCounts.SHIPPED ?? 0 },
            {
              label: "Annulées/Échouées",
              value: (statusCounts.CANCELLED ?? 0) + (statusCounts.FAILED ?? 0),
            },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="rounded-2xl border border-white/5 bg-[#0f172a] px-4 py-3"
            >
              <p className="text-xs text-slate-500 mb-1">{label}</p>
              <p className="font-['Syne'] text-xl font-bold text-white">
                {value}
              </p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="rounded-2xl border border-white/5 bg-[#0f172a] p-4 mb-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {["ALL", ...STATUSES].map((status) => (
                <button
                  key={status}
                  onClick={() => {
                    setFilterStatus(status);
                    setPage(0);
                    setSelected(null);
                  }}
                  className={`shrink-0 rounded-xl border px-4 py-2 text-sm font-medium transition-all ${
                    filterStatus === status
                      ? "border-blue-500 bg-blue-500/10 text-blue-400"
                      : "border-white/10 text-slate-400 hover:bg-white/5"
                  }`}
                >
                  {status === "ALL"
                    ? "Toutes"
                    : STATUS_LABELS[status] ?? status}

                  {status !== "ALL" && (
                    <span className="ml-2 text-xs opacity-60">
                      {statusCounts[status] ?? 0}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="flex gap-2 w-full lg:w-auto">
              <div className="relative flex-1 lg:w-80">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>

                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Rechercher par ID, statut ou montant..."
                  className="w-full rounded-xl bg-white/5 pl-9 pr-4 py-2 text-sm text-white placeholder-slate-500 border border-white/10 focus:border-blue-500/50 focus:outline-none"
                />
              </div>

              <button
                onClick={resetFilters}
                className="rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-400 hover:bg-white/5 transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Orders table */}
        <div className="rounded-2xl border border-white/5 bg-[#0f172a] overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="h-8 w-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="py-16 text-center">
              <div className="text-5xl mb-4">🛍️</div>
              <h2 className="font-['Syne'] text-xl font-bold mb-2">
                Aucune commande trouvée
              </h2>
              <p className="text-sm text-slate-500">
                Changez le filtre ou rafraîchissez la liste.
              </p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  {[
                    "Commande",
                    "Date",
                    "Montant",
                    "Statut",
                    "Prochaine action",
                    "Détails",
                  ].map((header) => (
                    <th
                      key={header}
                      className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-white/5">
                {filteredOrders.map((order) => {
                  const orderId = order.orderId;
                  const statusStyle =
                    STATUS_STYLES[order.status] ??
                    "bg-slate-500/10 text-slate-400 border-slate-500/20";
                  const nextOptions = getStatusOptions(order.status);
                  const isUpdating = updating === orderId;
                  const isSelected = selected?.orderId === orderId;

                  return (
                    <tr
                      key={orderId}
                      className={`hover:bg-white/5 transition-colors ${
                        isSelected ? "bg-white/5" : ""
                      }`}
                    >
                      <td className="px-4 py-3">
                        <p className="font-mono text-xs text-blue-400">
                          #{orderId?.slice(0, 8)}
                        </p>
                        <p className="text-xs text-slate-500 break-all">
                          {orderId}
                        </p>
                      </td>

                      <td className="px-4 py-3 text-slate-400 text-xs">
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleString("fr-FR", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "—"}
                      </td>

                      <td className="px-4 py-3 font-['Syne'] font-bold text-white">
                        ${Number(order.totalAmount ?? 0).toFixed(2)}
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusStyle}`}
                        >
                          {STATUS_LABELS[order.status] ?? order.status}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        {nextOptions.length === 0 ? (
                          <span className="text-xs text-slate-600">
                            Aucune action
                          </span>
                        ) : (
                          <select
                            value=""
                            disabled={isUpdating}
                            onChange={(e) =>
                              updateStatus(order, e.target.value)
                            }
                            className="rounded-lg bg-white/5 border border-white/10 px-2 py-1.5 text-xs text-slate-300 focus:outline-none disabled:opacity-50"
                          >
                            <option value="" className="bg-[#0f172a]">
                              Choisir...
                            </option>

                            {nextOptions.map((status) => (
                              <option
                                key={status}
                                value={status}
                                className="bg-[#0f172a]"
                              >
                                {STATUS_LABELS[status] ?? status}
                              </option>
                            ))}
                          </select>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <button
                          onClick={() => openDetail(orderId)}
                          className="rounded-lg bg-blue-500/10 px-3 py-1.5 text-xs text-blue-400 hover:bg-blue-500/20 transition-colors"
                        >
                          {isSelected ? "Fermer" : "Voir"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          <div className="flex items-center justify-between px-4 py-3 border-t border-white/5">
            <p className="text-xs text-slate-500">
              {filteredOrders.length} commande(s) affichée(s)
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => setPage((current) => Math.max(0, current - 1))}
                disabled={page === 0}
                className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-slate-400 hover:bg-white/5 disabled:opacity-30"
              >
                ←
              </button>

              <span className="text-xs text-slate-500 px-2 py-1.5">
                Page {page + 1} / {totalPages}
              </span>

              <button
                onClick={() =>
                  setPage((current) => Math.min(totalPages - 1, current + 1))
                }
                disabled={page >= totalPages - 1}
                className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-slate-400 hover:bg-white/5 disabled:opacity-30"
              >
                →
              </button>
            </div>
          </div>
        </div>

        {/* Detail loading */}
        {detailLoading && (
          <div
            ref={detailRef}
            className="mt-6 rounded-2xl border border-white/5 bg-[#0f172a] p-6"
          >
            <div className="flex items-center gap-3 text-slate-400">
              <div className="h-5 w-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
              Chargement du détail...
            </div>
          </div>
        )}

        {/* Detail panel */}
        {selected && !detailLoading && (
          <div
            ref={detailRef}
            className="mt-6 rounded-2xl border border-white/5 bg-[#0f172a] p-6"
          >
            <div className="flex items-start justify-between mb-5">
              <div>
                <p className="text-xs text-slate-500 mb-1">Détail commande</p>
                <h2 className="font-['Syne'] text-xl font-bold">
                  #{selected.orderId?.slice(0, 8)}
                </h2>
                <p className="text-xs text-slate-500 mt-1 break-all">
                  {selected.orderId}
                </p>
              </div>

              <span
                className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                  STATUS_STYLES[selected.status] ??
                  "bg-slate-500/10 text-slate-400 border-slate-500/20"
                }`}
              >
                {STATUS_LABELS[selected.status] ?? selected.status}
              </span>
            </div>

            <div className="space-y-3 mb-5">
              {(selected.items ?? []).length === 0 ? (
                <p className="text-sm text-slate-500">
                  Aucun article dans cette commande.
                </p>
              ) : (
                selected.items.map((item) => (
                  <div
                    key={item.itemId ?? item.productId}
                    className="flex items-center gap-3 rounded-xl bg-white/5 px-4 py-3"
                  >
                    <div className="h-10 w-10 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                      📦
                    </div>

                    <div className="flex-1">
                      <p className="text-sm font-semibold text-white">
                        {item.productName}
                      </p>
                      <p className="text-xs text-slate-500">
                        Qté: {item.quantity} × $
                        {Number(item.unitPrice ?? 0).toFixed(2)}
                      </p>
                    </div>

                    <p className="text-sm font-bold text-white">
                      ${Number(item.subtotal ?? 0).toFixed(2)}
                    </p>
                  </div>
                ))
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="rounded-xl bg-white/5 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-1">
                  Montant total
                </p>
                <p className="font-['Syne'] text-xl font-bold text-white">
                  ${Number(selected.totalAmount ?? 0).toFixed(2)}
                </p>
              </div>

              {selected.shippingAddress && (
                <div className="rounded-xl bg-white/5 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-1">
                    Adresse de livraison
                  </p>
                  <p className="text-sm text-slate-300">
                    {selected.shippingAddress.street},{" "}
                    {selected.shippingAddress.city},{" "}
                    {selected.shippingAddress.state},{" "}
                    {selected.shippingAddress.zipCode},{" "}
                    {selected.shippingAddress.country}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}