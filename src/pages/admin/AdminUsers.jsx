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

const DEMO_USERS = [
  { id: "u001", email: "alice@example.com",   firstName: "Alice",  lastName: "Martin",  role: "CLIENT", createdAt: "2024-01-15T10:30:00Z", ordersCount: 5 },
  { id: "u002", email: "bob@example.com",     firstName: "Bob",    lastName: "Dupont",  role: "CLIENT", createdAt: "2024-02-20T14:15:00Z", ordersCount: 2 },
  { id: "u003", email: "admin@example.com",   firstName: "Admin",  lastName: "User",    role: "ADMIN",  createdAt: "2024-01-01T00:00:00Z", ordersCount: 0 },
  { id: "u004", email: "clara@example.com",   firstName: "Clara",  lastName: "Bernard", role: "CLIENT", createdAt: "2024-03-10T09:00:00Z", ordersCount: 8 },
  { id: "u005", email: "david@example.com",   firstName: "David",  lastName: "Leroy",   role: "CLIENT", createdAt: "2024-03-25T16:45:00Z", ordersCount: 1 },
];

export default function AdminUsers() {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");

  useEffect(() => {
    api.get("/users")
      .then(({ data }) => setUsers(Array.isArray(data) ? data : data.content ?? []))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, []);

  const display = users.length > 0 ? users : DEMO_USERS;
  const filtered = search
    ? display.filter(u =>
        u.email?.toLowerCase().includes(search.toLowerCase()) ||
        u.firstName?.toLowerCase().includes(search.toLowerCase()) ||
        u.lastName?.toLowerCase().includes(search.toLowerCase())
      )
    : display;

  const toggleRole = async (userId, currentRole) => {
    const newRole = currentRole === "ADMIN" ? "CLIENT" : "ADMIN";
    if (!window.confirm(`Changer le rôle vers ${newRole} ?`)) return;
    try {
      await api.put(`/users/${userId}/role`, { role: newRole });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch {
      alert("Erreur lors du changement de rôle.");
    }
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
        <Link to="/" className="mt-auto flex items-center gap-2 rounded-xl px-3 py-2 text-xs text-slate-500 hover:text-white transition-colors">
          ← Retour au site
        </Link>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-xs text-slate-500 mb-0.5">Gestion</p>
            <h1 className="font-['Syne'] text-2xl font-bold">Gestion des Utilisateurs</h1>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: "Total utilisateurs", value: display.length, icon: "👥" },
            { label: "Clients",            value: display.filter(u => u.role === "CLIENT").length, icon: "🛍️" },
            { label: "Admins",             value: display.filter(u => u.role === "ADMIN").length,  icon: "🔑" },
          ].map(({ label, value, icon }) => (
            <div key={label} className="rounded-2xl border border-white/5 bg-[#0f172a] p-5 flex items-center gap-4">
              <span className="text-2xl">{icon}</span>
              <div>
                <p className="text-xs text-slate-500">{label}</p>
                <p className="font-['Syne'] text-2xl font-bold text-white">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-4 max-w-sm">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher par email ou nom..."
            className="w-full rounded-xl bg-white/5 pl-9 pr-4 py-2 text-sm text-white placeholder-slate-500 border border-white/10 focus:border-blue-500/50 focus:outline-none" />
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-white/5 bg-[#0f172a] overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="h-8 w-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  {["Utilisateur", "Email", "Rôle", "Inscrit le", "Commandes", "Actions"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map(user => (
                  <tr key={user.id} className="hover:bg-white/2 transition-colors group">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-500/20 text-blue-400 font-bold text-sm shrink-0">
                          {user.email?.[0]?.toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-white">
                          {user.firstName} {user.lastName}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-sm">{user.email}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium border ${
                        user.role === "ADMIN"
                          ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                          : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString("fr-FR") : "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-300 text-center">
                      {user.ordersCount ?? 0}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => toggleRole(user.id, user.role)}
                          className="rounded-lg bg-white/5 px-3 py-1.5 text-xs text-slate-400 hover:bg-white/10 transition-colors">
                          {user.role === "ADMIN" ? "→ CLIENT" : "→ ADMIN"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
