import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(true);

  const heroProduct = useMemo(() => featured.find((product) => product.imageUrls?.[0]) ?? featured[0], [featured]);

  useEffect(() => {
    let active = true;

    const loadHome = async () => {
      setLoading(true);

      try {
        const [productsResponse, categoriesResponse] = await Promise.all([
          api.get("/products/search", { params: { page: 0, size: 8 } }),
          api.get("/categories"),
        ]);

        if (!active) return;

        setFeatured(productsResponse.data.data ?? []);
        setTotalProducts(productsResponse.data.pagination?.totalElements ?? 0);
        setCategories(categoriesResponse.data.data ?? []);
      } catch {
        if (active) {
          setFeatured([]);
          setTotalProducts(0);
          setCategories([]);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadHome();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#080d1a] text-white font-['DM_Sans']">
      <section className="border-b border-white/5 bg-[#0a0f1e]">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_420px] lg:py-20">
          <div className="max-w-3xl">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-blue-400">
              ElectroShop
            </p>
            <h1 className="font-['Syne'] text-4xl font-bold leading-tight text-white sm:text-6xl">
              Real electronics from your live catalog.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-400">
              Browse phones, laptops, audio gear, gaming products, and accessories backed by real stock,
              reviews, checkout, and payment flows.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/catalog"
                className="rounded-xl bg-blue-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-400"
              >
                Voir le catalogue
              </Link>
              {categories[0] && (
                <Link
                  to={`/catalog?category=${categories[0].id}`}
                  className="rounded-xl border border-white/10 px-6 py-3 font-semibold text-slate-300 transition-colors hover:bg-white/5"
                >
                  Explorer {categories[0].name}
                </Link>
              )}
            </div>

            <div className="mt-10 grid max-w-md grid-cols-3 gap-4">
              <Stat label="Produits" value={totalProducts} />
              <Stat label="Categories" value={categories.length} />
              <Stat label="En stock" value={featured.filter((product) => product.availableStock > 0).length} />
            </div>
          </div>

          <div className="hidden lg:block">
            <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#0f172a] p-5">
              <div className="aspect-square overflow-hidden rounded-2xl bg-white/5">
                {heroProduct?.imageUrls?.[0] ? (
                  <img
                    src={heroProduct.imageUrls[0]}
                    alt={heroProduct.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center px-8 text-center text-slate-500">
                    Add product images to make this hero shine.
                  </div>
                )}
              </div>
              <div className="mt-5">
                <p className="text-xs uppercase tracking-wide text-blue-300">Featured</p>
                <h2 className="mt-1 font-['Syne'] text-xl font-bold">{heroProduct?.name ?? "Live catalog"}</h2>
                <p className="mt-2 text-sm text-slate-400">{heroProduct?.brand ?? "Products from PostgreSQL"}</p>
                {heroProduct && (
                  <p className="mt-3 text-2xl font-bold text-white">{formatCurrency(heroProduct.price)}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-white/5 bg-[#080d1a] py-4">
        <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 sm:px-6">
          <Link
            to="/catalog"
            className="shrink-0 rounded-full border border-white/10 px-4 py-1.5 text-sm text-slate-400 transition-colors hover:border-blue-500/50 hover:text-blue-400"
          >
            Tous
          </Link>
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/catalog?category=${category.id}`}
              className="shrink-0 rounded-full border border-white/10 px-4 py-1.5 text-sm text-slate-400 transition-colors hover:border-blue-500/50 hover:text-blue-400"
            >
              {category.name}
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-blue-400">Selection</p>
            <h2 className="font-['Syne'] text-3xl font-bold text-white">Produits recents</h2>
          </div>
          <Link to="/catalog" className="text-sm text-slate-400 transition-colors hover:text-blue-400">
            Voir tout
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="h-72 animate-pulse rounded-2xl bg-white/5" />
            ))}
          </div>
        ) : featured.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-white/5 bg-[#0f172a] px-6 py-14 text-center">
            <h3 className="font-['Syne'] text-xl font-bold text-white">Aucun produit disponible</h3>
            <p className="mt-2 text-sm text-slate-400">
              Import products from the admin CSV importer to populate the homepage.
            </p>
          </div>
        )}
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <div className="rounded-3xl border border-white/10 bg-[#0f172a] p-8 lg:p-10">
          <div className="grid gap-6 md:grid-cols-3">
            <Feature title="Disponibilite claire" text="Voyez tout de suite les produits en stock avant d'ajouter au panier." />
            <Feature title="Paiement securise" text="Finalisez votre commande avec un parcours simple, rapide et protege." />
            <Feature title="Suivi de commande" text="Retrouvez vos achats et leur statut depuis votre espace client." />
          </div>
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <p className="font-['Syne'] text-2xl font-bold text-white">{value}</p>
      <p className="mt-0.5 text-xs text-slate-500">{label}</p>
    </div>
  );
}

function Feature({ title, text }) {
  return (
    <div>
      <h3 className="font-['Syne'] text-lg font-bold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-400">{text}</p>
    </div>
  );
}

function ProductCard({ product }) {
  const navigate = useNavigate();
  const imageUrl = product.imageUrls?.[0];
  const availableStock = product.availableStock ?? 0;

  return (
    <button
      type="button"
      onClick={() => navigate(`/products/${product.id}`)}
      className="group rounded-2xl border border-white/5 bg-[#0f172a] p-4 text-left transition-all duration-200 hover:border-blue-500/30 hover:bg-[#111827]"
    >
      <div className="mb-4 flex h-36 items-center justify-center overflow-hidden rounded-xl bg-white/5">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <span className="px-4 text-center text-sm text-slate-500">No image</span>
        )}
      </div>

      <p className="mb-1 text-xs text-slate-500">{product.categoryName ?? product.brand}</p>
      <h3 className="mb-3 line-clamp-2 text-sm font-semibold text-white transition-colors group-hover:text-blue-300">
        {product.name}
      </h3>

      <div className="flex items-center justify-between">
        <p className="font-['Syne'] text-base font-bold text-white">{formatCurrency(product.price)}</p>
        <span className={`rounded-lg px-2 py-0.5 text-xs font-medium ${
          availableStock > 0 ? "bg-green-500/10 text-green-300" : "bg-red-500/10 text-red-300"
        }`}>
          {availableStock > 0 ? `${availableStock} dispo` : "Epuise"}
        </span>
      </div>
    </button>
  );
}

function formatCurrency(value) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "MAD",
  }).format(Number(value ?? 0));
}
