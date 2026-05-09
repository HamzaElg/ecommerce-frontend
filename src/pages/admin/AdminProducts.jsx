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

const EMPTY_FORM = {
  name: "", description: "", price: "", stock: "", categoryName: "", imageUrl: "", specs: "{}",
};

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [modal,    setModal]    = useState(null); // null | "create" | "edit"
  const [form,     setForm]     = useState(EMPTY_FORM);
  const [editId,   setEditId]   = useState(null);
  const [saving,   setSaving]   = useState(false);
  const [page,     setPage]     = useState(0);
  const [total,    setTotal]    = useState(0);
  const PAGE_SIZE = 10;

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, size: PAGE_SIZE, ...(search && { q: search }) });
      const { data } = await api.get(`/products/search?${params}`);
      setProducts(data.content ?? data);
      setTotal(data.totalElements ?? data.length ?? 0);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, [page, search]);

  const openCreate = () => { setForm(EMPTY_FORM); setEditId(null); setModal("create"); };
  const openEdit   = (p)  => {
    setForm({
      name: p.name, description: p.description ?? "", price: p.price,
      stock: p.inventory?.quantity ?? p.stock ?? 0,
      categoryName: p.category?.name ?? "", imageUrl: p.imageUrl ?? "",
      specs: JSON.stringify(p.specs ?? p.specifications ?? {}, null, 2),
    });
    setEditId(p.id);
    setModal("edit");
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
        specs: JSON.parse(form.specs || "{}"),
      };
      if (modal === "create") {
        const { data } = await api.post("/products", payload);
        setProducts(prev => [data, ...prev]);
      } else {
        const { data } = await api.put(`/products/${editId}`, payload);
        setProducts(prev => prev.map(p => p.id === editId ? data : p));
      }
      setModal(null);
    } catch (err) {
      alert(err.response?.data?.message ?? "Erreur lors de la sauvegarde.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer ce produit ?")) return;
    try {
      await api.delete(`/products/${id}`);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch {
      alert("Erreur lors de la suppression.");
    }
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const DEMO = [
    { id: 1, name: "WH-1000XM5 Casque Noise Cancelling", category: { name: "Audio" },  price: 348,  stock: 12, emoji: "🎧" },
    { id: 2, name: "Speed Racer Pro X Gaming Headset",   category: { name: "Gaming" }, price: 89,   stock: 5,  emoji: "🎮" },
    { id: 3, name: "Action Smart Camera 4K",             category: { name: "Caméras" },price: 299,  stock: 3,  emoji: "📷" },
    { id: 4, name: "Electric Pocket Speaker",            category: { name: "Audio" },  price: 64,   stock: 20, emoji: "🔊" },
    { id: 5, name: "Smart Power Bank 26800mAh",          category: { name: "Accessoires" }, price: 45, stock: 0, emoji: "🔋" },
  ];

  const displayList = products.length > 0 ? products : DEMO;

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
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-xs text-slate-500 mb-0.5">Gestion</p>
            <h1 className="font-['Syne'] text-2xl font-bold">Product Inventory</h1>
          </div>
          <button onClick={openCreate}
            className="flex items-center gap-2 rounded-xl bg-blue-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-400 transition-colors">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add New Item
          </button>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total Produits", value: total || displayList.length },
            { label: "En stock",       value: displayList.filter(p => (p.stock ?? p.inventory?.quantity ?? 0) > 0).length },
            { label: "Rupture",        value: displayList.filter(p => (p.stock ?? p.inventory?.quantity ?? 0) === 0).length },
            { label: "Valeur stock",   value: `$${displayList.reduce((s, p) => s + (p.price * (p.stock ?? 0)), 0).toLocaleString()}` },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-2xl border border-white/5 bg-[#0f172a] px-4 py-3">
              <p className="text-xs text-slate-500 mb-1">{label}</p>
              <p className="font-['Syne'] text-xl font-bold text-white">{value}</p>
            </div>
          ))}
        </div>

        {/* Search + Table */}
        <div className="rounded-2xl border border-white/5 bg-[#0f172a] overflow-hidden">
          <div className="flex items-center gap-4 p-4 border-b border-white/5">
            <div className="relative flex-1 max-w-xs">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                placeholder="Rechercher..."
                className="w-full rounded-xl bg-white/5 pl-9 pr-4 py-2 text-sm text-white placeholder-slate-500 border border-white/10 focus:border-blue-500/50 focus:outline-none" />
            </div>
            <select className="rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-slate-400 focus:outline-none">
              <option className="bg-[#0f172a]">All Categories</option>
              <option className="bg-[#0f172a]">Audio</option>
              <option className="bg-[#0f172a]">Gaming</option>
              <option className="bg-[#0f172a]">Caméras</option>
            </select>
            <select className="rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-slate-400 focus:outline-none">
              <option className="bg-[#0f172a]">All Status</option>
              <option className="bg-[#0f172a]">In Stock</option>
              <option className="bg-[#0f172a]">Out of Stock</option>
            </select>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="h-8 w-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  {["Produit", "Catégorie", "Prix", "Stock", "Statut", "Actions"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {displayList.map((p) => {
                  const stock = p.stock ?? p.inventory?.quantity ?? 0;
                  return (
                    <tr key={p.id} className="hover:bg-white/2 transition-colors group">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-xl shrink-0">
                            {p.imageUrl ? <img src={p.imageUrl} alt="" className="h-full w-full object-cover rounded-xl" />
                              : p.emoji ?? "📦"}
                          </div>
                          <span className="text-sm text-white font-medium line-clamp-1 max-w-xs">{p.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs text-blue-400">
                          {p.category?.name ?? "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-['Syne'] font-bold text-white">${Number(p.price).toFixed(2)}</td>
                      <td className="px-4 py-3 text-slate-300">{stock}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          stock > 10 ? "bg-green-500/10 text-green-400" :
                          stock > 0  ? "bg-yellow-500/10 text-yellow-400" :
                                       "bg-red-500/10 text-red-400"
                        }`}>
                          {stock > 10 ? "In Stock" : stock > 0 ? "Low Stock" : "Out of Stock"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEdit(p)}
                            className="rounded-lg bg-blue-500/10 px-3 py-1.5 text-xs text-blue-400 hover:bg-blue-500/20 transition-colors">
                            Modifier
                          </button>
                          <button onClick={() => handleDelete(p.id)}
                            className="rounded-lg bg-red-500/10 px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/20 transition-colors">
                            Supprimer
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-white/5">
              <p className="text-xs text-slate-500">
                {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} sur {total} produits
              </p>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                  className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-slate-400 hover:bg-white/5 disabled:opacity-30">←</button>
                <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
                  className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-slate-400 hover:bg-white/5 disabled:opacity-30">→</button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modal Create/Edit */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#0f172a] p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-['Syne'] text-lg font-bold">
                {modal === "create" ? "Nouveau produit" : "Modifier le produit"}
              </h2>
              <button onClick={() => setModal(null)} className="text-slate-500 hover:text-white transition-colors">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Nom du produit *</label>
                <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                  placeholder="Ex: Sony WH-1000XM5"
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:border-blue-500/50 focus:outline-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Prix (USD) *</label>
                  <input required type="number" step="0.01" min="0" value={form.price}
                    onChange={e => setForm({...form, price: e.target.value})}
                    placeholder="0.00"
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:border-blue-500/50 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Stock *</label>
                  <input required type="number" min="0" value={form.stock}
                    onChange={e => setForm({...form, stock: e.target.value})}
                    placeholder="0"
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:border-blue-500/50 focus:outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Catégorie</label>
                <input value={form.categoryName} onChange={e => setForm({...form, categoryName: e.target.value})}
                  placeholder="Ex: Audio"
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:border-blue-500/50 focus:outline-none" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">URL Image</label>
                <input value={form.imageUrl} onChange={e => setForm({...form, imageUrl: e.target.value})}
                  placeholder="https://..."
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:border-blue-500/50 focus:outline-none" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Description</label>
                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                  rows={2} placeholder="Description du produit..."
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:border-blue-500/50 focus:outline-none resize-none" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Spécifications (JSON)</label>
                <textarea value={form.specs} onChange={e => setForm({...form, specs: e.target.value})}
                  rows={3} placeholder='{"Couleur": "Noir", "Connectivité": "Bluetooth 5.2"}'
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:border-blue-500/50 focus:outline-none resize-none font-mono" />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModal(null)}
                  className="flex-1 rounded-xl border border-white/10 py-2.5 text-sm text-slate-400 hover:bg-white/5 transition-colors">
                  Annuler
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 rounded-xl bg-blue-500 py-2.5 text-sm font-semibold text-white hover:bg-blue-400 disabled:opacity-60 transition-colors flex items-center justify-center gap-2">
                  {saving ? <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> : null}
                  {modal === "create" ? "Créer le produit" : "Sauvegarder"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
