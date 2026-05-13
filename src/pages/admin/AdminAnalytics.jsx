import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";

const NAV = [
  { label: "Dashboard", path: "/admin" },
  { label: "Produits", path: "/admin/products" },
  { label: "Commandes", path: "/admin/orders" },
  { label: "Utilisateurs", path: "/admin/users" },
  { label: "Analytics", path: "/admin/analytics" },
];

const EMPTY_ANALYTICS = {
  summary: null,
  dailySales: [],
  statusBreakdown: [],
  topProducts: [],
  categories: [],
  lowStock: [],
};

export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState(EMPTY_ANALYTICS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadAnalytics = async () => {
      setLoading(true);
      setError("");

      try {
        const [
          summary,
          dailySales,
          statusBreakdown,
          topProducts,
          categories,
          lowStock,
        ] = await Promise.all([
          api.get("/admin/analytics/summary"),
          api.get("/admin/analytics/sales/daily", { params: { days: 30 } }),
          api.get("/admin/analytics/orders/status-breakdown"),
          api.get("/admin/analytics/products/top", { params: { limit: 10 } }),
          api.get("/admin/analytics/categories/performance"),
          api.get("/admin/analytics/inventory/low-stock", { params: { threshold: 5 } }),
        ]);

        if (!active) return;

        setAnalytics({
          summary: summary.data.data,
          dailySales: dailySales.data.data ?? [],
          statusBreakdown: statusBreakdown.data.data ?? [],
          topProducts: topProducts.data.data ?? [],
          categories: categories.data.data ?? [],
          lowStock: lowStock.data.data ?? [],
        });
      } catch (err) {
        if (active) {
          setError(err.message ?? "Impossible de charger les analytics.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadAnalytics();

    return () => {
      active = false;
    };
  }, []);

  const maxDailyRevenue = useMemo(
    () => Math.max(...analytics.dailySales.map((day) => Number(day.revenue)), 1),
    [analytics.dailySales]
  );

  const maxCategoryRevenue = useMemo(
    () => Math.max(...analytics.categories.map((category) => Number(category.revenue)), 1),
    [analytics.categories]
  );

  const summary = analytics.summary;

  return (
    <div className="flex min-h-screen bg-[#080d1a] text-white font-['DM_Sans']">
      <AdminSidebar />

      <main className="flex-1 overflow-y-auto px-6 py-8 pb-24">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="mb-0.5 text-xs text-slate-500">Admin</p>
            <h1 className="font-['Syne'] text-2xl font-bold">Analytics</h1>
            <p className="mt-1 text-sm text-slate-400">
              Real order, product, inventory, and customer metrics from the backend.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {loading ? (
          <LoadingGrid />
        ) : (
          <>
            <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
              <Metric label="Revenue" value={formatCurrency(summary?.totalRevenue)} />
              <Metric label="Orders" value={summary?.totalOrders ?? 0} />
              <Metric label="Paid" value={summary?.paidOrders ?? 0} />
              <Metric label="Customers" value={summary?.totalCustomers ?? 0} />
              <Metric label="Low Stock" value={summary?.lowStockProducts ?? 0} tone="warning" />
            </div>

            <div className="mb-6 grid gap-4 lg:grid-cols-3">
              <Metric label="Average Order Value" value={formatCurrency(summary?.averageOrderValue)} />
              <Metric label="Active Products" value={`${summary?.activeProducts ?? 0} / ${summary?.totalProducts ?? 0}`} />
              <Metric
                label="Problem Orders"
                value={(summary?.failedOrders ?? 0) + (summary?.cancelledOrders ?? 0)}
                tone="danger"
              />
            </div>

            <div className="mb-4 grid gap-4 lg:grid-cols-2">
              <Panel title="Sales by Day">
                {analytics.dailySales.length === 0 ? (
                  <EmptyState text="No revenue orders in this period." />
                ) : (
                  <div className="flex h-56 items-end gap-2">
                    {analytics.dailySales.map((day) => (
                      <div key={day.date} className="flex min-w-8 flex-1 flex-col items-center gap-2">
                        <div
                          className="w-full rounded-t-lg bg-blue-500/80"
                          style={{ height: `${Math.max((Number(day.revenue) / maxDailyRevenue) * 190, 6)}px` }}
                          title={`${day.date}: ${formatCurrency(day.revenue)} (${day.orders} orders)`}
                        />
                        <span className="rotate-[-45deg] text-[10px] text-slate-500">
                          {day.date.slice(5)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </Panel>

              <Panel title="Order Status Breakdown">
                <div className="space-y-3">
                  {analytics.statusBreakdown.map((item) => (
                    <div key={item.status}>
                      <div className="mb-1 flex justify-between text-sm">
                        <span className="text-slate-300">{item.status}</span>
                        <span className="font-semibold text-white">{item.count}</span>
                      </div>
                      <div className="h-2 rounded-full bg-white/5">
                        <div
                          className="h-2 rounded-full bg-blue-500"
                          style={{
                            width: `${Math.min((item.count / Math.max(summary?.totalOrders ?? 1, 1)) * 100, 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>
            </div>

            <div className="mb-4 grid gap-4 lg:grid-cols-2">
              <Panel title="Top Products">
                <DataTable
                  headers={["Product", "Units", "Revenue"]}
                  rows={analytics.topProducts.map((product) => [
                    product.productName,
                    product.unitsSold,
                    formatCurrency(product.revenue),
                  ])}
                  empty="No sold products yet."
                />
              </Panel>

              <Panel title="Category Performance">
                {analytics.categories.length === 0 ? (
                  <EmptyState text="No category sales yet." />
                ) : (
                  <div className="space-y-4">
                    {analytics.categories.map((category) => (
                      <div key={category.categoryId}>
                        <div className="mb-1.5 flex justify-between text-sm">
                          <span className="text-slate-300">{category.categoryName}</span>
                          <span className="font-semibold text-white">{formatCurrency(category.revenue)}</span>
                        </div>
                        <div className="h-2 rounded-full bg-white/5">
                          <div
                            className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"
                            style={{ width: `${Math.max((Number(category.revenue) / maxCategoryRevenue) * 100, 4)}%` }}
                          />
                        </div>
                        <p className="mt-1 text-xs text-slate-500">{category.unitsSold} units sold</p>
                      </div>
                    ))}
                  </div>
                )}
              </Panel>
            </div>

            <Panel title="Low Stock Products">
              <DataTable
                headers={["Product", "Brand", "Stock", "Reserved", "Available"]}
                rows={analytics.lowStock.map((product) => [
                  product.productName,
                  product.brand,
                  product.stockQty,
                  product.reservedQty,
                  product.availableQty,
                ])}
                empty="No low-stock products."
              />
            </Panel>
          </>
        )}
      </main>
    </div>
  );
}

function AdminSidebar() {
  return (
    <aside className="hidden w-56 flex-col border-r border-white/5 bg-[#0a0f1e] px-4 py-8 lg:flex">
      <div className="mb-10 px-2 font-['Syne'] text-sm font-bold">Admin Panel</div>
      <nav className="flex flex-1 flex-col gap-1">
        {NAV.map(({ label, path }) => (
          <Link
            key={path}
            to={path}
            className={`rounded-xl px-3 py-2.5 text-sm transition-colors ${
              window.location.pathname === path
                ? "bg-blue-500/10 font-medium text-blue-400"
                : "text-slate-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            {label}
          </Link>
        ))}
      </nav>
      <Link to="/" className="mt-auto rounded-xl px-3 py-2 text-xs text-slate-500 transition-colors hover:text-white">
        Back to store
      </Link>
    </aside>
  );
}

function Metric({ label, value, tone = "default" }) {
  const toneClass = {
    default: "border-white/5",
    warning: "border-yellow-500/20",
    danger: "border-red-500/20",
  }[tone];

  return (
    <div className={`rounded-2xl border ${toneClass} bg-[#0f172a] p-5`}>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 font-['Syne'] text-2xl font-bold text-white">{value}</p>
    </div>
  );
}

function Panel({ title, children }) {
  return (
    <section className="rounded-2xl border border-white/5 bg-[#0f172a] p-6">
      <h2 className="mb-5 font-['Syne'] text-sm font-bold">{title}</h2>
      {children}
    </section>
  );
}

function DataTable({ headers, rows, empty }) {
  if (rows.length === 0) return <EmptyState text={empty} />;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/5">
            {headers.map((header) => (
              <th key={header} className="pb-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {rows.map((row, index) => (
            <tr key={index}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="py-3 pr-4 text-slate-300">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EmptyState({ text }) {
  return <p className="py-8 text-center text-sm text-slate-500">{text}</p>;
}

function LoadingGrid() {
  return (
    <div className="grid gap-4 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="h-36 animate-pulse rounded-2xl bg-white/5" />
      ))}
    </div>
  );
}

function formatCurrency(value) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "MAD",
  }).format(Number(value ?? 0));
}
