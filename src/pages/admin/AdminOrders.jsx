import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";

const NAV = [
  { label: "Dashboard",    path: "/admin",           icon: "📊" },
  { label: "Produits",     path: "/admin/products",  icon: "📦" },
  { label: "Commandes",    path: "/admin/orders",    icon: "🛍️" },
  { label: "Utilisateurs", path: "/admin/users",     icon: "👥" },
  { label: "Analytics",   path: "/admin/analytics", icon: "📈" },
];

const STATUSES = ["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"];
const STATUS_STYLES = {
  PENDING:   "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  PAID:      "bg-blue-500/10   text-blue-400   border-blue-500/20",
  SHIPPED:   "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  DELIVERED: "bg-green-500/10  text-green-400  border-green-500/20",
  CANCELLED: "bg-red-500/10    text-red-400    border-red-500/20",
};

const DEMO_ORDERS = [
  { id: "ord-001a", user: { email: "alice@example.com" }, total: 348.00, status: "PAID",      createdAt: new Date(Date.now() - 86400000).toISOString(), items: [] },
  { id: "ord-002b", user: { email: "bob@example.com"   }, total: 89.50,  status: "PENDING",   createdAt: new Date(Date.now() - 172800000).toISOString(), items: [] },
  { id: "ord-003c", user: { email: "clara@example.com" }, total: 599.00, status: "SHIPPED",   createdAt: new Date(Date.now() - 259200000).toISOString(), items: [] },
  { id: "ord-004d", user: { email: "david@example.com" }, total: 129.99, status: "DELIVERED", createdAt: new Date(Date.now() - 345600000).toISOString(), items: [] },
  { id: "ord-005e", user: { email: "emma@example.com"  }, total: 45.00,  status: "CANCELLED", createdAt: new Date(Date.now() - 432000000).toISOString(), items: [] },
];

export default function AdminOrders() {
  const [orders,       setOrders]       = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [search,       setSearch]       = useState("");
  const [page,         setPage]         = useState(0);
  const [total,        setTotal]        = useState(0);
  const [updating,     setUpdating]     = useState(null);
  const PAGE_SIZE = 10;

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({
      page, size: PAGE_SIZE,
      ...(filterStatus !== "ALL" && { status: filterStatus }),
    });
    api.get(`/orders?${params}`)
      .then(({ data }) => {
        setOrders(Array.isArray(data) ? data : data.content ?? []);
        setTotal(data.totalElements ?? data.length ?? 0);
      })
      .catch(() => { setOrders([]); setTotal(0); })
      .finally(() => setLoading(false));
  }, [page, filterStatus]);

  const updateStatus = async (orderId, newStatus) => {
    setUpdating(orderId);
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch {
      alert("Erreur lors de la mise à jour du statut.");
    } finally {
      setUpdating(null);
    }
  };

  const display = orders.length > 0 ? orders : DEMO_ORDERS;
  const filtered = search
    ? display.filter(o => o.id?.toString().includes(search) || o.user?.email?.includes(search))
    : display;
  const totalPages = Math.ceil(total / PAGE_SIZE) || 1;

  return (
    <div className="flex min-h-screen bg-[#080d1a] text-white font-['DM_Sans']">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-56 border-r border-white/5 bg-[#0a0f1e] py-8 px-4">
        <div className="flex items-center gap-2 mb-10 px-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500">
            <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="font-['Syne'] text-sm font-bold">Admin Panel</span>
        </div>
        <nav className="flex flex-col gap-1 flex-1">
          {NAV.map(({ label, path, icon }) => (
            <Link key={path} to={path}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                window.location.pathname === path
                  ? "bg-blue-500/10 text-blue-400 font-medium"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}>
              <span>{icon}</span>{label}
            </Link>
          ))}
        </nav>
        <Link to="/" className="mt-auto flex items-center gap-2 rounded-xl px-3 py-2 text-xs text-slate-500 hover:text-white transition-colors">
          ← Retour au site
        </Link>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-xs text-slate-500 mb-0.5">Gestion</p>
            <h1 className="font-['Syne'] text-2xl font-bold">Gestion des Commandes</h1>
          </div>
        </div>

        {/* Status filter tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {["ALL", ...STATUSES].map(s => (
            <button key={s} onClick={() => { setFilterStatus(s); setPage(0); }}
              className={`shrink-0 rounded-xl border px-4 py-2 text-sm font-medium transition-all ${
                filterStatus === s
                  ? "border-blue-500 bg-blue-500/10 text-blue-400"
                  : "border-white/10 text-slate-400 hover:bg-white/5"
              }`}>
              {s === "ALL" ? "Toutes" : s}
              {s !== "ALL" && (
                <span className="ml-2 text-xs opacity-60">
                  {display.filter(o => o.status === s).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-4 max-w-sm">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher par ID ou email..."
            className="w-full rounded-xl bg-white/5 pl-9 pr-4 py-2 text-sm text-white placeholder-slate-500 border border-white/10 focus:border-blue-500/50 focus:outline-none" />
        </div>

        {/* Orders table */}
        <div className="rounded-2xl border border-white/5 bg-[#0f172a] overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="h-8 w-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  {["ID Commande", "Client", "Date", "Montant", "Statut", "Modifier statut"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map(order => (
                  <tr key={order.id} className="hover:bg-white/2 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-blue-400">
                      #{order.id?.toString().slice(0, 8)}
                    </td>
                    <td className="px-4 py-3 text-slate-300 text-sm">{order.user?.email}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString("fr-FR", {
                        day: "2-digit", month: "short", year: "numeric"
                      }) : "—"}
                    </td>
                    <td className="px-4 py-3 font-['Syne'] font-bold text-white">
                      ${Number(order.total ?? order.totalAmount ?? 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[order.status] ?? STATUS_STYLES.PENDING}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={order.status}
                        onChange={e => updateStatus(order.id, e.target.value)}
                        disabled={updating === order.id}
                        className="rounded-lg bg-white/5 border border-white/10 px-2 py-1.5 text-xs text-slate-300 focus:outline-none disabled:opacity-50">
                        {STATUSES.map(s => (
                          <option key={s} value={s} className="bg-[#0f172a]">{s}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/5">
            <p className="text-xs text-slate-500">
              {filtered.length} commandes affichées
            </p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-slate-400 hover:bg-white/5 disabled:opacity-30">←</button>
              <span className="text-xs text-slate-500 px-2 py-1.5">Page {page + 1}</span>
              <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
                className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-slate-400 hover:bg-white/5 disabled:opacity-30">→</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
