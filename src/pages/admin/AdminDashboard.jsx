import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";

const NAV = [
  { label: "Dashboard", path: "/admin", icon: "📊" },
  { label: "Produits", path: "/admin/products", icon: "📦" },
  { label: "Commandes", path: "/admin/orders", icon: "🛍️" },
  { label: "Utilisateurs", path: "/admin/users", icon: "👥" },
  { label: "Analytics", path: "/admin/analytics", icon: "📈" },
];

const STATUS_COLORS = {
  PENDING_PAYMENT: "text-yellow-400 bg-yellow-500/10",
  PAID: "text-blue-400 bg-blue-500/10",
  SHIPPED: "text-indigo-400 bg-indigo-500/10",
  DELIVERED: "text-green-400 bg-green-500/10",
  FAILED: "text-red-400 bg-red-500/10",
  CANCELLED: "text-red-400 bg-red-500/10",
  REFUNDED: "text-slate-400 bg-slate-500/10",
};

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboardData = async () => {
    setLoading(true);
    setError("");

    try {
      const [ordersResponse, productsResponse] = await Promise.all([
        api.get("/admin/orders", {
          params: {
            page: 0,
            size: 5,
          },
        }),
        api.get("/products/search", {
          params: {
            page: 0,
            size: 1000,
          },
        }),
      ]);

      setOrders(ordersResponse.data.data ?? []);
      setProducts(productsResponse.data.data ?? []);
    } catch (err) {
      setError(err.message ?? "Impossible de charger le dashboard admin.");
      setOrders([]);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const stats = useMemo(() => {
    const totalRevenue = orders
      .filter((order) =>
        ["PAID", "SHIPPED", "DELIVERED"].includes(order.status)
      )
      .reduce((sum, order) => sum + Number(order.totalAmount ?? 0), 0);

    const paidOrders = orders.filter((order) => order.status === "PAID").length;
    const shippedOrders = orders.filter(
      (order) => order.status === "SHIPPED"
    ).length;
    const deliveredOrders = orders.filter(
      (order) => order.status === "DELIVERED"
    ).length;

    const totalStockValue = products.reduce((sum, product) => {
      return (
        sum +
        Number(product.price ?? 0) * Number(product.availableStock ?? 0)
      );
    }, 0);

    return {
      totalRevenue,
      visibleOrders: orders.length,
      paidOrders,
      shippedOrders,
      deliveredOrders,
      totalProducts: products.length,
      totalStockValue,
      inStock: products.filter((p) => Number(p.availableStock ?? 0) > 0).length,
      outOfStock: products.filter((p) => Number(p.availableStock ?? 0) === 0)
        .length,
    };
  }, [orders, products]);

  const topProducts = useMemo(() => {
    return [...products]
      .sort((a, b) => Number(b.availableStock ?? 0) - Number(a.availableStock ?? 0))
      .slice(0, 5);
  }, [products]);

  return (
    <div className="flex min-h-screen bg-[#080d1a] text-white font-['DM_Sans']">
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

      <main className="flex-1 overflow-y-auto px-6 py-8 pb-24">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-xs text-slate-500 mb-0.5">Tableau de bord</p>
            <h1 className="font-['Syne'] text-2xl font-bold">
              Dashboard Admin
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Données réelles basées sur les endpoints admin disponibles.
            </p>
          </div>

          <button
            onClick={fetchDashboardData}
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

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="h-8 w-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                {
                  label: "Revenu visible",
                  value: `$${stats.totalRevenue.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}`,
                  hint: "Commandes payées/expédiées/livrées",
                  icon: "💰",
                },
                {
                  label: "Commandes chargées",
                  value: stats.visibleOrders,
                  hint: "Dernières commandes admin",
                  icon: "🛍️",
                },
                {
                  label: "Produits",
                  value: stats.totalProducts,
                  hint: `${stats.inStock} en stock / ${stats.outOfStock} rupture`,
                  icon: "📦",
                },
                {
                  label: "Valeur stock",
                  value: `$${stats.totalStockValue.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}`,
                  hint: "Prix × stock disponible",
                  icon: "🏷️",
                },
              ].map((card) => (
                <div
                  key={card.label}
                  className="rounded-2xl border border-white/5 bg-[#0f172a] p-5"
                >
                  <div className="flex items-start justify-between mb-3">
                    <p className="text-xs text-slate-500">{card.label}</p>
                    <span className="text-xl">{card.icon}</span>
                  </div>
                  <p className="font-['Syne'] text-2xl font-bold text-white mb-1">
                    {card.value}
                  </p>
                  <p className="text-xs text-slate-600">{card.hint}</p>
                </div>
              ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-4 mb-8">
              <div className="lg:col-span-2 rounded-2xl border border-white/5 bg-[#0f172a] p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-['Syne'] text-base font-bold">
                    Commandes récentes
                  </h2>
                  <Link
                    to="/admin/orders"
                    className="text-xs text-blue-400 hover:underline"
                  >
                    Voir tout →
                  </Link>
                </div>

                {orders.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    Aucune commande récente.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/5">
                          {["Commande", "Date", "Montant", "Statut"].map(
                            (header) => (
                              <th
                                key={header}
                                className="pb-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
                              >
                                {header}
                              </th>
                            )
                          )}
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-white/5">
                        {orders.map((order) => (
                          <tr key={order.orderId}>
                            <td className="py-3 pr-4">
                              <span className="font-mono text-xs text-blue-400">
                                #{order.orderId?.slice(0, 8)}
                              </span>
                            </td>
                            <td className="py-3 pr-4 text-xs text-slate-500">
                              {order.createdAt
                                ? new Date(order.createdAt).toLocaleString(
                                    "fr-FR",
                                    {
                                      day: "2-digit",
                                      month: "short",
                                      year: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    }
                                  )
                                : "—"}
                            </td>
                            <td className="py-3 pr-4 font-['Syne'] font-bold text-white">
                              ${Number(order.totalAmount ?? 0).toFixed(2)}
                            </td>
                            <td className="py-3">
                              <span
                                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                  STATUS_COLORS[order.status] ??
                                  "text-slate-400 bg-slate-500/10"
                                }`}
                              >
                                {order.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-white/5 bg-[#0f172a] p-6">
                <h2 className="font-['Syne'] text-base font-bold mb-5">
                  Statuts commandes
                </h2>

                <div className="space-y-3">
                  {[
                    { label: "Payées", value: stats.paidOrders, color: "bg-blue-500" },
                    {
                      label: "Expédiées",
                      value: stats.shippedOrders,
                      color: "bg-indigo-500",
                    },
                    {
                      label: "Livrées",
                      value: stats.deliveredOrders,
                      color: "bg-green-500",
                    },
                  ].map((item) => {
                    const pct =
                      stats.visibleOrders > 0
                        ? Math.round((item.value / stats.visibleOrders) * 100)
                        : 0;

                    return (
                      <div key={item.label}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-400">{item.label}</span>
                          <span className="text-white font-semibold">
                            {item.value} ({pct}%)
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                          <div
                            className={`h-full ${item.color} rounded-full`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/5 bg-[#0f172a] p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-['Syne'] text-base font-bold">
                  Produits avec le plus de stock
                </h2>
                <Link
                  to="/admin/products"
                  className="text-xs text-blue-400 hover:underline"
                >
                  Gérer produits →
                </Link>
              </div>

              {topProducts.length === 0 ? (
                <p className="text-sm text-slate-500">Aucun produit trouvé.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/5">
                      {["Produit", "Catégorie", "Prix", "Stock", "Valeur"].map(
                        (header) => (
                          <th
                            key={header}
                            className="pb-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
                          >
                            {header}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-white/5">
                    {topProducts.map((product) => (
                      <tr key={product.id}>
                        <td className="py-3 pr-4">
                          <p className="text-sm font-semibold text-white">
                            {product.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {product.brand}
                          </p>
                        </td>
                        <td className="py-3 pr-4">
                          <span className="rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs text-blue-400">
                            {product.categoryName ?? "—"}
                          </span>
                        </td>
                        <td className="py-3 pr-4 font-['Syne'] font-bold text-white">
                          ${Number(product.price ?? 0).toFixed(2)}
                        </td>
                        <td className="py-3 pr-4 text-slate-300">
                          {product.availableStock ?? 0}
                        </td>
                        <td className="py-3 font-['Syne'] font-bold text-white">
                          $
                          {(
                            Number(product.price ?? 0) *
                            Number(product.availableStock ?? 0)
                          ).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}