import { useState } from "react";
import { Link } from "react-router-dom";

const NAV = [
  { label: "Dashboard", path: "/admin", icon: "📊" },
  { label: "Produits", path: "/admin/products", icon: "📦" },
  { label: "Commandes", path: "/admin/orders", icon: "🛍️" },
  { label: "Utilisateurs", path: "/admin/users", icon: "👥" },
  { label: "Analytics", path: "/admin/analytics", icon: "📈" },
];

const FORECAST = [
  { month: "Oct", actual: 28000, forecast: null },
  { month: "Nov", actual: 35000, forecast: null },
  { month: "Déc", actual: 42000, forecast: null },
  { month: "Jan", actual: 31000, forecast: null },
  { month: "Fév", actual: 38000, forecast: null },
  { month: "Mar", actual: null, forecast: 44000 },
  { month: "Avr", actual: null, forecast: 48000 },
  { month: "Mai", actual: null, forecast: 52000 },
];

const CATEGORIES = [
  { name: "Audio", revenue: 52000, pct: 87 },
  { name: "Gaming", revenue: 34000, pct: 65 },
  { name: "Caméras", revenue: 28000, pct: 52 },
  { name: "Laptops", revenue: 18000, pct: 34 },
  { name: "Accessoires", revenue: 10038, pct: 21 },
];

const TOP_PRODUCTS = [
  {
    rank: 1,
    name: "WH-1000XM5 Casque",
    cat: "Audio",
    sales: 284,
    revenue: 98832,
    trend: "+18.4%",
  },
  {
    rank: 2,
    name: "Speed Racer Pro X",
    cat: "Gaming",
    sales: 212,
    revenue: 18868,
    trend: "+12.7%",
  },
  {
    rank: 3,
    name: "Action Smart Camera 4K",
    cat: "Caméras",
    sales: 97,
    revenue: 29003,
    trend: "+9.1%",
  },
  {
    rank: 4,
    name: "Electric Pocket Speaker",
    cat: "Audio",
    sales: 143,
    revenue: 9152,
    trend: "+6.8%",
  },
  {
    rank: 5,
    name: "Smart Power Bank 26800",
    cat: "Accessoires",
    sales: 88,
    revenue: 3960,
    trend: "+4.2%",
  },
];

const FUNNEL = [
  { label: "Visiteurs", value: 12450, pct: 100, color: "bg-blue-500" },
  { label: "Panier", value: 3210, pct: 26, color: "bg-indigo-500" },
  { label: "Checkout", value: 1580, pct: 13, color: "bg-violet-500" },
  { label: "Commande", value: 398, pct: 3, color: "bg-purple-500" },
];

const KPIS_BY_PERIOD = {
  "7d": [
    {
      label: "Revenue Total",
      value: "$12,840",
      delta: "+2.1%",
      positive: true,
      icon: "💰",
    },
    {
      label: "Taux Conversion",
      value: "2.8%",
      delta: "+0.2%",
      positive: true,
      icon: "🎯",
    },
    {
      label: "Panier Moyen",
      value: "$79.40",
      delta: "-1.1%",
      positive: false,
      icon: "🛒",
    },
    {
      label: "Commandes Total",
      value: "162",
      delta: "+4.3%",
      positive: true,
      icon: "📦",
    },
  ],
  "30d": [
    {
      label: "Revenue Total",
      value: "$142,038",
      delta: "+3.2%",
      positive: true,
      icon: "💰",
    },
    {
      label: "Taux Conversion",
      value: "3.2%",
      delta: "+0.4%",
      positive: true,
      icon: "🎯",
    },
    {
      label: "Panier Moyen",
      value: "$85.20",
      delta: "+5.1%",
      positive: true,
      icon: "🛒",
    },
    {
      label: "Commandes Total",
      value: "1,248",
      delta: "-2.3%",
      positive: false,
      icon: "📦",
    },
  ],
  "90d": [
    {
      label: "Revenue Total",
      value: "$384,220",
      delta: "+7.8%",
      positive: true,
      icon: "💰",
    },
    {
      label: "Taux Conversion",
      value: "3.6%",
      delta: "+0.7%",
      positive: true,
      icon: "🎯",
    },
    {
      label: "Panier Moyen",
      value: "$91.10",
      delta: "+6.4%",
      positive: true,
      icon: "🛒",
    },
    {
      label: "Commandes Total",
      value: "3,809",
      delta: "+5.9%",
      positive: true,
      icon: "📦",
    },
  ],
  "1y": [
    {
      label: "Revenue Total",
      value: "$1.42M",
      delta: "+14.6%",
      positive: true,
      icon: "💰",
    },
    {
      label: "Taux Conversion",
      value: "3.9%",
      delta: "+1.1%",
      positive: true,
      icon: "🎯",
    },
    {
      label: "Panier Moyen",
      value: "$94.80",
      delta: "+8.2%",
      positive: true,
      icon: "🛒",
    },
    {
      label: "Commandes Total",
      value: "15,430",
      delta: "+10.3%",
      positive: true,
      icon: "📦",
    },
  ],
};

export default function AdminAnalytics() {
  const [period, setPeriod] = useState("30d");

  const KPIs = KPIS_BY_PERIOD[period] ?? KPIS_BY_PERIOD["30d"];

  const maxVal = 60000;
  const chartW = 480;
  const chartH = 120;

  const actualPts = FORECAST.filter((d) => d.actual).map((d) => ({
    cx: (FORECAST.indexOf(d) / (FORECAST.length - 1)) * chartW,
    cy: chartH - (d.actual / maxVal) * chartH,
  }));

  const forecastPts = FORECAST.filter((d) => d.forecast).map((d) => ({
    cx: (FORECAST.indexOf(d) / (FORECAST.length - 1)) * chartW,
    cy: chartH - (d.forecast / maxVal) * chartH,
  }));

  const weeks = Array.from({ length: 7 }, (_, w) =>
    Array.from({ length: 7 }, (_, d) => ({
      w,
      d,
      intensity: ((w * 7 + d) % 9) / 9 + 0.12,
    }))
  );

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
            <p className="text-xs text-slate-500 mb-0.5">Insights</p>
            <h1 className="font-['Syne'] text-2xl font-bold">
              Data Engineering Insights
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Prototype analytics UI. Les données affichées ici sont une
              maquette visuelle pour le module analytics futur.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {["7d", "30d", "90d", "1y"].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  period === p
                    ? "bg-blue-500 text-white"
                    : "border border-white/10 text-slate-400 hover:bg-white/5"
                }`}
              >
                {p}
              </button>
            ))}

            <button
              type="button"
              onClick={() =>
                alert(
                  "Export CSV demo: real analytics export will be connected later."
                )
              }
              className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-slate-400 hover:bg-white/5 transition-colors"
            >
              Export CSV
            </button>
          </div>
        </div>

        <div className="mb-5 rounded-xl bg-yellow-500/10 border border-yellow-500/20 px-4 py-3 text-sm text-yellow-300">
          Module analytics en mode démonstration. Aucun appel backend n'est fait
          depuis cette page pour éviter les endpoints analytics non finalisés.
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {KPIs.map((kpi) => (
            <div
              key={kpi.label}
              className="rounded-2xl border border-white/5 bg-[#0f172a] p-5"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xl">{kpi.icon}</span>
                <span
                  className={`text-xs font-semibold rounded-full px-2 py-0.5 ${
                    kpi.positive
                      ? "text-green-400 bg-green-500/10"
                      : "text-red-400 bg-red-500/10"
                  }`}
                >
                  {kpi.delta}
                </span>
              </div>
              <p className="font-['Syne'] text-2xl font-bold text-white mb-0.5">
                {kpi.value}
              </p>
              <p className="text-xs text-slate-500">{kpi.label}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-4 mb-4">
          <div className="rounded-2xl border border-white/5 bg-[#0f172a] p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-['Syne'] text-sm font-bold">
                Sales Predictions Data Forecast
              </h2>

              <div className="flex gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <span className="inline-block h-2 w-4 rounded bg-blue-500" />
                  Réel
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block h-2 w-4 rounded border border-dashed border-blue-400" />
                  Prévision
                </span>
              </div>
            </div>

            <div className="mb-2">
              <p className="font-['Syne'] text-2xl font-bold text-white">
                $450k{" "}
                <span className="text-green-400 text-sm font-normal">
                  +8% Performance
                </span>
              </p>
            </div>

            <svg viewBox={`0 0 ${chartW} ${chartH + 30}`} className="w-full">
              {[0.25, 0.5, 0.75, 1].map((f) => (
                <line
                  key={f}
                  x1="0"
                  y1={chartH - f * chartH}
                  x2={chartW}
                  y2={chartH - f * chartH}
                  stroke="white"
                  strokeOpacity="0.05"
                  strokeWidth="1"
                />
              ))}

              {actualPts.length > 1 && (
                <path
                  d={
                    `M${actualPts[0].cx},${chartH} ` +
                    actualPts.map((p) => `L${p.cx},${p.cy}`).join(" ") +
                    ` L${actualPts[actualPts.length - 1].cx},${chartH}Z`
                  }
                  fill="#3b82f6"
                  fillOpacity="0.15"
                />
              )}

              {actualPts.length > 1 && (
                <polyline
                  points={actualPts.map((p) => `${p.cx},${p.cy}`).join(" ")}
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {forecastPts.length > 1 && actualPts.length > 0 && (
                <polyline
                  points={[actualPts[actualPts.length - 1], ...forecastPts]
                    .map((p) => `${p.cx},${p.cy}`)
                    .join(" ")}
                  fill="none"
                  stroke="#60a5fa"
                  strokeWidth="2"
                  strokeDasharray="6,3"
                  strokeLinecap="round"
                />
              )}

              {FORECAST.map((d, i) => (
                <text
                  key={d.month}
                  x={(i / (FORECAST.length - 1)) * chartW}
                  y={chartH + 18}
                  textAnchor="middle"
                  fill="#475569"
                  fontSize="10"
                >
                  {d.month}
                </text>
              ))}
            </svg>
          </div>

          <div className="rounded-2xl border border-white/5 bg-[#0f172a] p-6">
            <h2 className="font-['Syne'] text-sm font-bold mb-4">
              Customer Conversion Funnel
            </h2>

            <div className="space-y-3">
              {FUNNEL.map((step) => (
                <div key={step.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">{step.label}</span>
                    <span className="text-white font-semibold">
                      {step.value.toLocaleString()} ({step.pct}%)
                    </span>
                  </div>
                  <div className="h-6 rounded-lg bg-white/5 overflow-hidden">
                    <div
                      className={`h-full ${step.color} rounded-lg transition-all duration-500`}
                      style={{ width: `${step.pct}%`, opacity: 0.8 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-4 mb-4">
          <div className="rounded-2xl border border-white/5 bg-[#0f172a] p-6">
            <h2 className="font-['Syne'] text-sm font-bold mb-5">
              Performance par Catégorie
            </h2>

            <div className="space-y-4">
              {CATEGORIES.map((cat) => (
                <div key={cat.name}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-slate-300">{cat.name}</span>
                    <span className="text-white font-semibold">
                      ${cat.revenue.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-white/5">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500"
                      style={{ width: `${cat.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/5 bg-[#0f172a] p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-['Syne'] text-sm font-bold">
                Activité Quotidienne
              </h2>
              <div className="flex gap-1 items-center text-xs text-slate-500">
                <span>Faible</span>
                {[0.15, 0.35, 0.55, 0.75, 0.95].map((i) => (
                  <div
                    key={i}
                    className="h-3 w-3 rounded-sm bg-blue-500"
                    style={{ opacity: i }}
                  />
                ))}
                <span>Élevé</span>
              </div>
            </div>

            <div className="flex gap-1">
              {weeks.map((week, w) => (
                <div key={w} className="flex flex-col gap-1">
                  {week.map((cell) => (
                    <div
                      key={`${cell.w}-${cell.d}`}
                      className="h-4 w-4 rounded-sm bg-blue-500 cursor-pointer hover:ring-1 hover:ring-blue-400 transition-all"
                      style={{
                        opacity: Math.min(1, cell.intensity),
                      }}
                      title={`Semaine ${cell.w + 1}, Jour ${cell.d + 1}`}
                    />
                  ))}
                </div>
              ))}
            </div>

            <div className="flex justify-between mt-2 text-xs text-slate-600">
              <span>Oct 2025</span>
              <span>Nov 2025</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/5 bg-[#0f172a] p-6">
          <h2 className="font-['Syne'] text-sm font-bold mb-5">
            Top Produits
          </h2>

          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                {["#", "Produit", "Catégorie", "Ventes", "Revenue", "Tendance"].map(
                  (h) => (
                    <th
                      key={h}
                      className="pb-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5">
              {TOP_PRODUCTS.map((product) => (
                <tr
                  key={product.rank}
                  className="hover:bg-white/2 transition-colors"
                >
                  <td className="py-3 pr-4 text-slate-600 font-bold">
                    #{product.rank}
                  </td>
                  <td className="py-3 pr-4 text-white font-medium">
                    {product.name}
                  </td>
                  <td className="py-3 pr-4">
                    <span className="text-xs bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full">
                      {product.cat}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-slate-300">
                    {product.sales}
                  </td>
                  <td className="py-3 pr-4 font-['Syne'] font-bold text-white">
                    ${product.revenue.toLocaleString()}
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-1 text-green-400 text-xs">
                      <svg
                        className="h-3 w-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M5 15l7-7 7 7"
                        />
                      </svg>
                      {product.trend}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}