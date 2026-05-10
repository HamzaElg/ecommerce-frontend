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

const EMPTY_FORM = {
  name: "",
  brand: "",
  description: "",
  price: "",
  categoryId: "",
  specs: "{\n  \"ram_gb\": 8,\n  \"storage_gb\": 256,\n  \"color\": \"Black\"\n}",
  imageUrls: "",
  initialStockQty: "",
};

const PAGE_SIZE = 10;

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [statsProducts, setStatsProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);

  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [stockProduct, setStockProduct] = useState(null);
  const [newStockQty, setNewStockQty] = useState("");

  const [saving, setSaving] = useState(false);

  const [csvFile, setCsvFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);

  const showError = (message) => {
    setError(message);
    setSuccess("");
  };

  const showSuccess = (message) => {
    setSuccess(message);
    setError("");
  };

  const fetchProducts = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/products/search", {
        params: {
          page,
          size: PAGE_SIZE,
          ...(search && { q: search }),
        },
      });

      setProducts(response.data.data ?? []);
      setTotal(response.data.pagination?.totalElements ?? 0);
    } catch (err) {
      showError(err.message ?? "Impossible de charger les produits.");
      setProducts([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatsProducts = async () => {
    try {
      const response = await api.get("/products/search", {
        params: {
          page: 0,
          size: 1000,
        },
      });

      setStatsProducts(response.data.data ?? []);
    } catch {
      setStatsProducts([]);
    }
  };

  const fetchCategories = async () => {
    setCategoriesLoading(true);

    try {
      const response = await api.get("/categories");
      setCategories(response.data.data ?? []);
    } catch (err) {
      showError(err.message ?? "Impossible de charger les catégories.");
      setCategories([]);
    } finally {
      setCategoriesLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchStatsProducts();
  }, []);

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const stats = useMemo(() => {
    const source = statsProducts.length > 0 ? statsProducts : products;

    const totalStockValue = source.reduce((sum, product) => {
      const price = Number(product.price ?? 0);
      const stock = Number(product.availableStock ?? 0);
      return sum + price * stock;
    }, 0);

    return {
      totalProducts: total,
      inStock: source.filter((product) => Number(product.availableStock ?? 0) > 0)
        .length,
      outOfStock: source.filter(
        (product) => Number(product.availableStock ?? 0) === 0
      ).length,
      totalStockValue,
    };
  }, [statsProducts, products, total]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchProducts();
  };

  const resetSearch = () => {
    setSearch("");
    setPage(0);
    setTimeout(fetchProducts, 0);
  };

  const parseSpecs = () => {
    try {
      return JSON.parse(form.specs || "{}");
    } catch {
      throw new Error("Le champ specs doit être un JSON valide.");
    }
  };

  const parseImageUrls = () => {
    return form.imageUrls
      .split("\n")
      .map((url) => url.trim())
      .filter(Boolean);
  };

  const validateForm = () => {
    if (!form.name.trim()) throw new Error("Le nom du produit est obligatoire.");
    if (!form.brand.trim()) throw new Error("La marque est obligatoire.");
    if (!form.description.trim())
      throw new Error("La description est obligatoire.");
    if (!form.categoryId) throw new Error("La catégorie est obligatoire.");

    const price = Number(form.price);

    if (Number.isNaN(price) || price < 0) {
      throw new Error("Le prix doit être un nombre positif.");
    }

    if (modal === "create") {
      const stock = Number(form.initialStockQty);

      if (Number.isNaN(stock) || stock < 0) {
        throw new Error("Le stock initial doit être un nombre positif.");
      }
    }
  };

  const buildCreatePayload = () => ({
    name: form.name.trim(),
    brand: form.brand.trim(),
    description: form.description.trim(),
    price: Number(form.price),
    categoryId: form.categoryId,
    specs: parseSpecs(),
    imageUrls: parseImageUrls(),
    initialStockQty: Number(form.initialStockQty),
  });

  const buildUpdatePayload = () => ({
    name: form.name.trim(),
    brand: form.brand.trim(),
    description: form.description.trim(),
    price: Number(form.price),
    categoryId: form.categoryId,
    specs: parseSpecs(),
    imageUrls: parseImageUrls(),
  });

  const openCreate = () => {
    setForm({
      ...EMPTY_FORM,
      categoryId: categories[0]?.id ?? "",
    });
    setEditId(null);
    setModal("create");
    setError("");
    setSuccess("");
  };

  const openEdit = (product) => {
    setForm({
      name: product.name ?? "",
      brand: product.brand ?? "",
      description: product.description ?? "",
      price: product.price ?? "",
      categoryId: product.categoryId ?? "",
      specs: JSON.stringify(product.specs ?? {}, null, 2),
      imageUrls: (product.imageUrls ?? []).join("\n"),
      initialStockQty: "",
    });

    setEditId(product.id);
    setModal("edit");
    setError("");
    setSuccess("");
  };

  const openStockModal = (product) => {
    setStockProduct(product);
    setNewStockQty(String(product.availableStock ?? 0));
    setModal("stock");
    setError("");
    setSuccess("");
  };

  const closeModal = () => {
    setModal(null);
    setEditId(null);
    setStockProduct(null);
    setNewStockQty("");
    setSaving(false);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      validateForm();

      if (modal === "create") {
        await api.post("/products", buildCreatePayload());

        showSuccess("Produit créé avec succès.");
        closeModal();
        await fetchProducts();
        await fetchStatsProducts();
        return;
      }

      if (modal === "edit") {
        const response = await api.put(`/products/${editId}`, buildUpdatePayload());
        const updatedProduct = response.data.data;

        setProducts((prev) =>
          prev.map((product) =>
            product.id === editId ? updatedProduct : product
          )
        );

        setStatsProducts((prev) =>
          prev.map((product) =>
            product.id === editId ? updatedProduct : product
          )
        );

        showSuccess("Produit modifié avec succès.");
        closeModal();
      }
    } catch (err) {
      showError(err.message ?? "Erreur lors de la sauvegarde.");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateStock = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const stockQty = Number(newStockQty);

      if (Number.isNaN(stockQty) || stockQty < 0) {
        throw new Error("Le stock doit être un nombre positif.");
      }

      await api.patch(`/admin/inventory/${stockProduct.id}/stock`, {
        stockQty,
      });

      showSuccess("Stock mis à jour avec succès.");
      closeModal();
      await fetchProducts();
      await fetchStatsProducts();
    } catch (err) {
      showError(err.message ?? "Erreur lors de la mise à jour du stock.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (productId) => {
    const confirmed = window.confirm(
      "Supprimer ce produit ? Il sera désactivé côté backend."
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      await api.delete(`/products/${productId}`);

      setProducts((prev) =>
        prev.filter((product) => product.id !== productId)
      );

      setStatsProducts((prev) =>
        prev.filter((product) => product.id !== productId)
      );

      setTotal((prev) => Math.max(0, prev - 1));

      showSuccess("Produit supprimé avec succès.");
    } catch (err) {
      showError(err.message ?? "Erreur lors de la suppression.");
    }
  };

  const handleCsvImport = async (e) => {
    e.preventDefault();

    if (!csvFile) {
      showError("Choisissez un fichier CSV avant d'importer.");
      return;
    }

    setImporting(true);
    setError("");
    setSuccess("");
    setImportResult(null);

    try {
      const formData = new FormData();
      formData.append("file", csvFile);

      const response = await api.post("/admin/products/import", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const result = response.data.data ?? response.data;

      setImportResult(result);
      setCsvFile(null);
      showSuccess("Import CSV terminé avec succès.");

      setPage(0);
      await fetchProducts();
      await fetchStatsProducts();
    } catch (err) {
      showError(err.message ?? "Erreur lors de l'import CSV.");
    } finally {
      setImporting(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

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
            <p className="text-xs text-slate-500 mb-0.5">Gestion</p>
            <h1 className="font-['Syne'] text-2xl font-bold">
              Gestion des Produits
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Produits, catégories, images, specs, stock et import CSV.
            </p>
          </div>

          <button
            onClick={openCreate}
            disabled={categoriesLoading || categories.length === 0}
            className="flex items-center gap-2 rounded-xl bg-blue-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-400 disabled:opacity-50 transition-colors"
          >
            + Nouveau produit
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

        <div className="mb-6 rounded-2xl border border-white/5 bg-[#0f172a] p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="font-['Syne'] text-lg font-bold text-white">
                Import CSV produits
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Importer plusieurs produits avec leur stock initial.
              </p>
              <p className="text-xs text-slate-600 mt-1">
                Endpoint:{" "}
                <span className="font-mono">POST /admin/products/import</span>{" "}
                — champ multipart: <span className="font-mono">file</span>
              </p>
            </div>

            <form
              onSubmit={handleCsvImport}
              className="flex flex-col gap-3 sm:flex-row sm:items-center"
            >
              <label className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 cursor-pointer hover:bg-white/10 transition-colors">
                {csvFile ? csvFile.name : "Choisir un fichier CSV"}
                <input
                  type="file"
                  accept=".csv,text/csv"
                  className="hidden"
                  onChange={(e) => setCsvFile(e.target.files?.[0] ?? null)}
                />
              </label>

              <button
                type="submit"
                disabled={importing || !csvFile}
                className="rounded-xl bg-blue-500 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-400 disabled:opacity-50 transition-colors"
              >
                {importing ? "Import..." : "Importer"}
              </button>
            </form>
          </div>

          {importResult && (
            <div className="mt-4 rounded-xl bg-green-500/10 border border-green-500/20 px-4 py-3 text-sm text-green-400">
              <p className="font-semibold mb-1">Résultat import</p>
              <pre className="overflow-x-auto text-xs text-green-300">
                {JSON.stringify(importResult, null, 2)}
              </pre>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total produits", value: stats.totalProducts },
            { label: "En stock", value: stats.inStock },
            { label: "Rupture", value: stats.outOfStock },
            {
              label: "Valeur stock totale",
              value: `$${stats.totalStockValue.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`,
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

        <div className="rounded-2xl border border-white/5 bg-[#0f172a] overflow-hidden">
          <form
            onSubmit={handleSearchSubmit}
            className="flex items-center gap-4 p-4 border-b border-white/5"
          >
            <div className="relative flex-1 max-w-xs">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher..."
                className="w-full rounded-xl bg-white/5 px-4 py-2 text-sm text-white placeholder-slate-500 border border-white/10 focus:border-blue-500/50 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="rounded-xl bg-white/5 border border-white/10 px-4 py-2 text-sm text-slate-300 hover:bg-white/10 transition-colors"
            >
              Rechercher
            </button>

            <button
              type="button"
              onClick={resetSearch}
              className="rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-400 hover:bg-white/5 transition-colors"
            >
              Réinitialiser
            </button>
          </form>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="h-8 w-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
            </div>
          ) : products.length === 0 ? (
            <div className="py-16 text-center">
              <div className="text-5xl mb-4">📦</div>
              <h2 className="font-['Syne'] text-xl font-bold mb-2">
                Aucun produit trouvé
              </h2>
              <p className="text-sm text-slate-500">
                Créez un produit, importez un CSV ou changez votre recherche.
              </p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  {[
                    "Produit",
                    "Catégorie",
                    "Prix",
                    "Stock",
                    "Statut",
                    "Actions",
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
                {products.map((product) => {
                  const mainImage = product.imageUrls?.[0];
                  const stock = product.availableStock ?? 0;

                  return (
                    <tr
                      key={product.id}
                      className="hover:bg-white/5 transition-colors group"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-xl shrink-0 overflow-hidden">
                            {mainImage ? (
                              <img
                                src={mainImage}
                                alt={product.name}
                                className="h-full w-full object-cover rounded-xl"
                              />
                            ) : (
                              "📦"
                            )}
                          </div>

                          <div>
                            <span className="text-sm text-white font-medium line-clamp-1 max-w-xs">
                              {product.name}
                            </span>
                            <p className="text-xs text-slate-500">
                              {product.brand}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <span className="rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs text-blue-400">
                          {product.categoryName ?? "—"}
                        </span>
                      </td>

                      <td className="px-4 py-3 font-['Syne'] font-bold text-white">
                        ${Number(product.price).toFixed(2)}
                      </td>

                      <td className="px-4 py-3 text-slate-300">{stock}</td>

                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            stock > 10
                              ? "bg-green-500/10 text-green-400"
                              : stock > 0
                              ? "bg-yellow-500/10 text-yellow-400"
                              : "bg-red-500/10 text-red-400"
                          }`}
                        >
                          {stock > 10
                            ? "En stock"
                            : stock > 0
                            ? "Stock faible"
                            : "Rupture"}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openEdit(product)}
                            className="rounded-lg bg-blue-500/10 px-3 py-1.5 text-xs text-blue-400 hover:bg-blue-500/20 transition-colors"
                          >
                            Modifier
                          </button>

                          <button
                            onClick={() => openStockModal(product)}
                            className="rounded-lg bg-yellow-500/10 px-3 py-1.5 text-xs text-yellow-400 hover:bg-yellow-500/20 transition-colors"
                          >
                            Stock
                          </button>

                          <button
                            onClick={() => handleDelete(product.id)}
                            className="rounded-lg bg-red-500/10 px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/20 transition-colors"
                          >
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

          <div className="flex items-center justify-between px-4 py-3 pr-28 border-t border-white/5">
            <p className="text-xs text-slate-500">
              {total === 0
                ? "0 produit"
                : `${page * PAGE_SIZE + 1}–${Math.min(
                    (page + 1) * PAGE_SIZE,
                    total
                  )} sur ${total} produits`}
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((current) => Math.max(0, current - 1))}
                disabled={page === 0}
                className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-slate-400 hover:bg-white/5 disabled:opacity-30"
              >
                ← Précédent
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
                Suivant →
              </button>
            </div>
          </div>
        </div>
      </main>

      {(modal === "create" || modal === "edit") && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#0f172a] p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-['Syne'] text-lg font-bold">
                {modal === "create" ? "Nouveau produit" : "Modifier le produit"}
              </h2>

              <button
                onClick={closeModal}
                className="text-slate-500 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Nom du produit"
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white"
                />

                <input
                  required
                  value={form.brand}
                  onChange={(e) => setForm({ ...form, brand: e.target.value })}
                  placeholder="Marque"
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <input
                  required
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="Prix"
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white"
                />

                {modal === "create" && (
                  <input
                    required
                    type="number"
                    min="0"
                    value={form.initialStockQty}
                    onChange={(e) =>
                      setForm({ ...form, initialStockQty: e.target.value })
                    }
                    placeholder="Stock initial"
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white"
                  />
                )}
              </div>

              <select
                required
                value={form.categoryId}
                onChange={(e) =>
                  setForm({ ...form, categoryId: e.target.value })
                }
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white"
              >
                <option value="" className="bg-[#0f172a]">
                  Sélectionner une catégorie
                </option>

                {categories.map((category) => (
                  <option
                    key={category.id}
                    value={category.id}
                    className="bg-[#0f172a]"
                  >
                    {category.name}
                  </option>
                ))}
              </select>

              <textarea
                required
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="Description"
                rows={3}
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white resize-none"
              />

              <textarea
                value={form.imageUrls}
                onChange={(e) =>
                  setForm({ ...form, imageUrls: e.target.value })
                }
                placeholder="Images: une URL par ligne"
                rows={3}
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-xs text-white resize-none font-mono"
              />

              <textarea
                value={form.specs}
                onChange={(e) => setForm({ ...form, specs: e.target.value })}
                rows={6}
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-xs text-white resize-none font-mono"
              />

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 rounded-xl border border-white/10 py-2.5 text-sm text-slate-400 hover:bg-white/5 transition-colors"
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-xl bg-blue-500 py-2.5 text-sm font-semibold text-white hover:bg-blue-400 disabled:opacity-60 transition-colors"
                >
                  {saving
                    ? "Sauvegarde..."
                    : modal === "create"
                    ? "Créer"
                    : "Sauvegarder"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modal === "stock" && stockProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0f172a] p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-['Syne'] text-lg font-bold">
                Modifier le stock
              </h2>

              <button
                onClick={closeModal}
                className="text-slate-500 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateStock} className="space-y-4">
              <div className="rounded-xl bg-white/5 px-4 py-3">
                <p className="text-sm font-semibold text-white">
                  {stockProduct.name}
                </p>
                <p className="text-xs text-slate-500">
                  Stock disponible actuel: {stockProduct.availableStock ?? 0}
                </p>
              </div>

              <input
                required
                type="number"
                min="0"
                value={newStockQty}
                onChange={(e) => setNewStockQty(e.target.value)}
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white"
              />

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 rounded-xl border border-white/10 py-2.5 text-sm text-slate-400 hover:bg-white/5 transition-colors"
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-xl bg-blue-500 py-2.5 text-sm font-semibold text-white hover:bg-blue-400 disabled:opacity-60 transition-colors"
                >
                  {saving ? "Mise à jour..." : "Mettre à jour"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}