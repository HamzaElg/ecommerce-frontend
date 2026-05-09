import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";

const NAV = [
  { label: "Dashboard",  path: "/admin",            icon: "📊" },
  { label: "Produits",   path: "/admin/products",   icon: "📦" },
  { label: "Commandes",  path: "/admin/orders",     icon: "🛍️" },
  { label: "Utilisateurs", path: "/admin/users",    icon: "👥" },
  { label: "Analytics",  path: "/admin/analytics",  icon: "📈" },
];

export default function AdminDashboard() {
  const [stats,    setStats]    = useState(null);
  const [recent,   setRecent]   = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/analytics/sales/daily").catch(() => ({ data: null })),
      api.get("/orders?size=5&sort=createdAt,desc").catch(() => ({ data: [] })),
    ]).then(([{ data: s }, { data: o }]) => {
      setStats(s);
      setRecent(Array.isArray(o) ? o : o.content ?? []);
    }).finally(() => setLoading(false));
  }, []);

  const DEMO_STATS = {
    revenue:    45231.89,
    orders:     2405,
    customers:  84,
    uptime:     "99.5%",
    revenueGrowth: "+12.5%",
    ordersGrowth:  "+8.2%",
  };

  const s = stats ?? DEMO_STATS;

  const KPI_CARDS = [
    { label: "Chiffre d'affaires", value: `$${Number(s.revenue ?? 45231).toLocaleString()}`, growth: s.revenueGrowth ?? "+12.5%", positive: true,  icon: "💰", color: "blue" },
    { label: "Commandes",          value: Number(s.orders ?? 2405).toLocaleString(),          growth: s.ordersGrowth  ?? "+8.2%",  positive: true,  icon: "🛍️", color: "indigo" },
    { label: "Clients",            value: Number(s.customers ?? 84).toLocaleString(),         growth: "+4.1%",                     positive: true,  icon: "👥",  color: "violet" },
    { label: "Disponibilité",      value: s.uptime ?? "99.5%",                                growth: "+0.1%",                     positive: true,  icon: "⚡",  color: "emerald" },
  ];

  // Mock sparkline data
  const CHART_POINTS = [30, 45, 38, 55, 48, 65, 72, 58, 80, 75, 90, 85].map((v, i) => ({
    x: i, y: v, label: `Semaine ${i + 1}`
  }));

  const maxY = Math.max(...CHART_POINTS.map(p => p.y));
  const chartW = 500, chartH = 140;
  const points = CHART_POINTS.map(({ x, y }, i) => ({
    cx: (i / (CHART_POINTS.length - 1)) * chartW,
    cy: chartH - (y / maxY) * chartH,
  }));
  const polyline = points.map(p => `${p.cx},${p.cy}`).join(" ");
  const area = `M${points[0].cx},${chartH} ` + points.map(p => `L${p.cx},${p.cy}`).join(" ") + ` L${points[points.length-1].cx},${chartH} Z`;

  const DEMO_RECENT = [
    { id: "ord-001", user: { email: "alice@ex.com" }, total: 348, status: "PAID",    createdAt: new Date().toISOString() },
    { id: "ord-002", user: { email: "bob@ex.com"   }, total: 89,  status: "PENDING", createdAt: new Date().toISOString() },
    { id: "ord-003", user: { email: "clara@ex.com" }, total: 599, status: "SHIPPED", createdAt: new Date().toISOString() },
  ];

  const STATUS_COLORS = {
    PENDING:   "text-yellow-400 bg-yellow-500/10",
    PAID:      "text-blue-400   bg-blue-500/10",
    SHIPPED:   "text-indigo-400 bg-indigo-500/10",
    DELIVERED: "text-green-400  bg-green-500/10",
    CANCELLED: "text-red-400    bg-red-500/10",
  };

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

        <div className="mt-auto">
          <Link to="/" className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs text-slate-500 hover:text-white transition-colors">
            ← Retour au site
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="px-6 py-8">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-xs text-slate-500 mb-0.5">Tableau de bord</p>
              <h1 className="font-['Syne'] text-2xl font-bold">Dashboard Overview</h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-400">
                {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
              </div>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {KPI_CARDS.map((kpi) => (
              <div key={kpi.label}
                className="rounded-2xl border border-white/5 bg-[#0f172a] p-5">
                <div className="flex items-start justify-between mb-3">
                  <p className="text-xs text-slate-500">{kpi.label}</p>
                  <span className="text-xl">{kpi.icon}</span>
                </div>
                <p className="font-['Syne'] text-2xl font-bold text-white mb-1">{kpi.value}</p>
                <span className={`text-xs font-medium ${kpi.positive ? "text-green-400" : "text-red-400"}`}>
                  {kpi.growth} <span className="text-slate-600">vs mois dernier</span>
                </span>
              </div>
            ))}
          </div>

          {/* Chart + Donut */}
          <div className="grid lg:grid-cols-3 gap-4 mb-8">
            {/* Sales chart */}
            <div className="lg:col-span-2 rounded-2xl border border-white/5 bg-[#0f172a] p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-['Syne'] text-base font-bold">Performance des Ventes</h2>
                <span className="text-xs text-slate-500">12 dernières semaines</span>
              </div>
              <svg viewBox={`0 0 ${chartW} ${chartH + 20}`} className="w-full">
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d={area} fill="url(#areaGrad)" />
                <polyline points={polyline} fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                {points.map((p, i) => (
                  <circle key={i} cx={p.cx} cy={p.cy} r="3" fill="#3b82f6" />
                ))}
              </svg>
            </div>

            {/* Donut stock distribution */}
            <div className="rounded-2xl border border-white/5 bg-[#0f172a] p-6">
              <h2 className="font-['Syne'] text-base font-bold mb-4">Stock Distribution</h2>
              <div className="flex items-center justify-center mb-4">
                <svg viewBox="0 0 120 120" className="w-28 h-28">
                  {/* Simple donut */}
                  {[
                    { pct: 0.42, color: "#3b82f6", label: "Audio" },
                    { pct: 0.28, color: "#6366f1", label: "Gaming" },
                    { pct: 0.18, color: "#8b5cf6", label: "Caméras" },
                    { pct: 0.12, color: "#1e3a5f", label: "Autres" },
                  ].reduce((acc, seg, i, arr) => {
                    const r = 45, cx = 60, cy = 60, stroke = 18;
                    const total = 2 * Math.PI * r;
                    const dash  = seg.pct * total;
                    const offset = acc.offset;
                    acc.els.push(
                      <circle key={i} cx={cx} cy={cy} r={r}
                        fill="none" stroke={seg.color} strokeWidth={stroke}
                        strokeDasharray={`${dash} ${total - dash}`}
                        strokeDashoffset={-offset}
                        style={{ transform: "rotate(-90deg)", transformOrigin: "60px 60px" }}
                      />
                    );
                    acc.offset += dash;
                    return acc;
                  }, { els: [], offset: 0 }).els}
                  <text x="60" y="64" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">-6.5%</text>
                </svg>
              </div>
              <div className="space-y-2">
                {[
                  { label: "Audio",   pct: "42%", color: "bg-blue-500" },
                  { label: "Gaming",  pct: "28%", color: "bg-indigo-500" },
                  { label: "Caméras", pct: "18%", color: "bg-violet-500" },
                  { label: "Autres",  pct: "12%", color: "bg-slate-700" },
                ].map((c) => (
                  <div key={c.label} className="flex items-center gap-2 text-xs">
                    <div className={`h-2 w-2 rounded-full ${c.color}`} />
                    <span className="text-slate-400 flex-1">{c.label}</span>
                    <span className="text-white font-semibold">{c.pct}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent activity */}
          <div className="rounded-2xl border border-white/5 bg-[#0f172a] p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-['Syne'] text-base font-bold">Activité Récente</h2>
              <Link to="/admin/orders" className="text-xs text-blue-400 hover:underline">Voir tout →</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    {["Commande", "Client", "Date", "Montant", "Statut"].map(h => (
                      <th key={h} className="pb-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {(recent.length > 0 ? recent : DEMO_RECENT).map((order) => (
                    <tr key={order.id} className="hover:bg-white/2 transition-colors">
                      <td className="py-3 text-xs text-blue-400">#{order.id?.toString().slice(0, 8)}</td>
                      <td className="py-3 text-slate-300">{order.user?.email?.split("@")[0]}</td>
                      <td className="py-3 text-slate-500 text-xs">
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString("fr-FR") : "—"}
                      </td>
                      <td className="py-3 font-['Syne'] font-bold text-white">${Number(order.total ?? order.totalAmount ?? 0).toFixed(2)}</td>
                      <td className="py-3">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[order.status] ?? STATUS_COLORS.PENDING}`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
