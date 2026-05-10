import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate     = useNavigate();

  const [form,    setForm]    = useState({ firstName: "", lastName: "", email: "", password: "", confirm: "" });
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm) { setError("Les mots de passe ne correspondent pas."); return; }
    if (form.password.length < 8)       { setError("Le mot de passe doit contenir au moins 8 caractères."); return; }
    setLoading(true);
    try {
      await register({ firstName: form.firstName, lastName: form.lastName, email: form.email, password: form.password });
      navigate("/");
    } catch (err) {
      setError(err.message ?? "Une erreur est survenue lors de l'inscription.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080d1a] flex items-center justify-center px-4 py-12 font-['DM_Sans']">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/3 left-1/4 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 h-56 w-56 rounded-full bg-indigo-500/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500">
              <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="font-['Syne'] text-xl font-bold text-white">ElectroShop</span>
          </Link>
          <h1 className="font-['Syne'] text-2xl font-bold text-white">Créer un compte</h1>
          <p className="text-slate-400 text-sm mt-1">Rejoignez des milliers de clients satisfaits</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0f172a] p-7">
          <form onSubmit={submit} className="space-y-4">
            {error && (
              <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Prénom</label>
                <input name="firstName" required value={form.firstName} onChange={handle}
                  placeholder="Jean"
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:border-blue-500/50 focus:outline-none transition-all" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Nom</label>
                <input name="lastName" required value={form.lastName} onChange={handle}
                  placeholder="Dupont"
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:border-blue-500/50 focus:outline-none transition-all" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Email</label>
              <input name="email" type="email" required value={form.email} onChange={handle}
                placeholder="vous@exemple.com"
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:border-blue-500/50 focus:outline-none transition-all" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Mot de passe</label>
              <input name="password" type="password" required value={form.password} onChange={handle}
                placeholder="Min. 8 caractères"
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:border-blue-500/50 focus:outline-none transition-all" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Confirmer le mot de passe</label>
              <input name="confirm" type="password" required value={form.confirm} onChange={handle}
                placeholder="••••••••"
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:border-blue-500/50 focus:outline-none transition-all" />
            </div>

            <button type="submit" disabled={loading}
              className="w-full rounded-xl bg-blue-500 py-3 font-semibold text-white hover:bg-blue-400 disabled:opacity-60 transition-all duration-200 flex items-center justify-center gap-2 mt-1">
              {loading
                ? <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                : "Créer mon compte"
              }
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-500 mt-5">
          Déjà inscrit ?{" "}
          <Link to="/login" className="text-blue-400 hover:underline font-medium">Se connecter</Link>
        </p>
      </div>
    </div>
  );
}
