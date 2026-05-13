import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";

const NAV = [
  { label: "Dashboard", path: "/admin" },
  { label: "Produits", path: "/admin/products" },
  { label: "Commandes", path: "/admin/orders" },
  { label: "Utilisateurs", path: "/admin/users" },
  { label: "Analytics", path: "/admin/analytics" },
];

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const timeout = setTimeout(() => {
      loadUsers();
    }, 250);

    return () => clearTimeout(timeout);
  }, [page, role, search]);

  const loadUsers = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/admin/users", {
        params: {
          page,
          size: 20,
          ...(role && { role }),
          ...(search && { search }),
        },
      });

      setUsers(response.data.data ?? []);
      setPagination(response.data.pagination ?? null);
    } catch (err) {
      setError(err.message ?? "Impossible de charger les utilisateurs.");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const loadUserDetail = async (userId) => {
    setDetailLoading(true);

    try {
      const response = await api.get(`/admin/users/${userId}`);
      setSelectedUser(response.data.data);
    } catch (err) {
      setError(err.message ?? "Impossible de charger le detail utilisateur.");
    } finally {
      setDetailLoading(false);
    }
  };

  const updateRole = async (user, nextRole) => {
    if (user.role === nextRole) return;

    if (!window.confirm(`Changer le role de ${user.email} vers ${nextRole} ?`)) {
      return;
    }

    try {
      const response = await api.patch(`/admin/users/${user.userId}/role`, null, {
        params: { role: nextRole },
      });

      const updated = response.data.data;
      setUsers((current) => current.map((item) => (item.userId === updated.userId ? updated : item)));

      if (selectedUser?.userId === updated.userId) {
        loadUserDetail(updated.userId);
      }
    } catch (err) {
      setError(err.message ?? "Impossible de modifier le role.");
    }
  };

  return (
    <div className="flex min-h-screen bg-[#080d1a] text-white font-['DM_Sans']">
      <AdminSidebar />

      <main className="flex-1 overflow-y-auto px-6 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="mb-0.5 text-xs text-slate-500">Gestion</p>
            <h1 className="font-['Syne'] text-2xl font-bold">Utilisateurs</h1>
            <p className="mt-1 text-sm text-slate-400">Real admin user management from the backend.</p>
          </div>
        </div>

        {error && (
          <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="mb-4 flex flex-wrap gap-3">
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(0);
            }}
            placeholder="Search email or name..."
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-blue-500/50 sm:w-80"
          />

          <select
            value={role}
            onChange={(event) => {
              setRole(event.target.value);
              setPage(0);
            }}
            className="rounded-xl border border-white/10 bg-[#0f172a] px-4 py-2 text-sm text-white outline-none focus:border-blue-500/50"
          >
            <option value="">All roles</option>
            <option value="CUSTOMER">CUSTOMER</option>
            <option value="ADMIN">ADMIN</option>
          </select>
        </div>

        <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
          <section className="overflow-hidden rounded-2xl border border-white/5 bg-[#0f172a]">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    {["User", "Email", "Role", "Created", "Actions"].map((header) => (
                      <th key={header} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {users.map((user) => (
                    <tr key={user.userId} className="transition-colors hover:bg-white/[0.03]">
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => loadUserDetail(user.userId)}
                          className="text-left font-medium text-white hover:text-blue-300"
                        >
                          {user.firstName} {user.lastName}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-slate-400">{user.email}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                          user.role === "ADMIN"
                            ? "border-purple-500/20 bg-purple-500/10 text-purple-300"
                            : "border-blue-500/20 bg-blue-500/10 text-blue-300"
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={user.role}
                          onChange={(event) => updateRole(user, event.target.value)}
                          className="rounded-lg border border-white/10 bg-[#111827] px-2 py-1 text-xs text-slate-300"
                        >
                          <option value="CUSTOMER">CUSTOMER</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {!loading && users.length === 0 && (
              <p className="py-10 text-center text-sm text-slate-500">No users found.</p>
            )}

            {pagination && (
              <div className="flex items-center justify-between border-t border-white/5 px-4 py-3 text-sm text-slate-400">
                <span>
                  Page {pagination.page + 1} / {Math.max(pagination.totalPages, 1)}
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPage((current) => Math.max(0, current - 1))}
                    disabled={page === 0}
                    className="rounded-lg border border-white/10 px-3 py-1 disabled:opacity-30"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    onClick={() => setPage((current) => current + 1)}
                    disabled={page + 1 >= pagination.totalPages}
                    className="rounded-lg border border-white/10 px-3 py-1 disabled:opacity-30"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </section>

          <aside className="rounded-2xl border border-white/5 bg-[#0f172a] p-5">
            <h2 className="mb-4 font-['Syne'] text-sm font-bold">User Detail</h2>

            {detailLoading ? (
              <div className="h-32 animate-pulse rounded-xl bg-white/5" />
            ) : selectedUser ? (
              <div className="space-y-3 text-sm">
                <Detail label="Name" value={`${selectedUser.firstName} ${selectedUser.lastName}`} />
                <Detail label="Email" value={selectedUser.email} />
                <Detail label="Role" value={selectedUser.role} />
                <Detail label="Order Count" value={selectedUser.orderCount} />
                <Detail label="Total Spent" value={formatCurrency(selectedUser.totalSpent)} />
                <Detail label="Created" value={formatDate(selectedUser.createdAt)} />
                <Detail label="Updated" value={formatDate(selectedUser.updatedAt)} />
              </div>
            ) : (
              <p className="py-8 text-sm text-slate-500">Select a user to inspect account activity.</p>
            )}
          </aside>
        </div>
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

function Detail({ label, value }) {
  return (
    <div className="rounded-xl bg-white/5 px-3 py-2">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-0.5 break-words text-slate-200">{value}</p>
    </div>
  );
}

function formatDate(value) {
  return value ? new Date(value).toLocaleDateString("fr-FR") : "-";
}

function formatCurrency(value) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "MAD",
  }).format(Number(value ?? 0));
}
