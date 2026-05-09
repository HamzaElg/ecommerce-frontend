import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [form, setForm]   = useState({
    firstName: user?.firstName ?? "",
    lastName:  user?.lastName  ?? "",
    email:     user?.email     ?? "",
  });
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [saving,  setSaving]  = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const [msg,     setMsg]     = useState("");
  const [pwMsg,   setPwMsg]   = useState("");
  const [tab,     setTab]     = useState("info");

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    try {
      await api.put("/user/me", form);
      setMsg("Profil mis à jour avec succès ✓");
    } catch {
      setMsg("Erreur lors de la mise à jour.");
    } finally {
      setSaving(false);
    }
  };

  const handlePw = async (e) => {
    e.preventDefault();
    if (pwForm.next !== pwForm.confirm) { setPwMsg("Les mots de passe ne correspondent pas."); return; }
    setSavingPw(true);
    setPwMsg("");
    try {
      await api.put("/user/me/password", { currentPassword: pwForm.current, newPassword: pwForm.next });
      setPwMsg("Mot de passe modifié avec succès ✓");
      setPwForm({ current: "", next: "", confirm: "" });
    } catch {
      setPwMsg("Mot de passe actuel incorrect.");
    } finally {
      setSavingPw(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080d1a] text-white font-['DM_Sans']">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 py-12">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/20 text-blue-400 font-['Syne'] text-2xl font-bold">
            {user?.email?.[0]?.toUpperCase()}
          </div>
          <div>
            <h1 className="font-['Syne'] text-2xl font-bold">{form.firstName || "Mon"} {form.lastName || "Profil"}</h1>
            <p className="text-slate-400 text-sm">{user?.email}</p>
            <span className={`mt-1 inline-block text-xs px-2 py-0.5 rounded-full font-medium ${
              user?.role === "ADMIN"
                ? "bg-purple-500/10 text-purple-400"
                : "bg-blue-500/10 text-blue-400"
            }`}>
              {user?.role ?? "CLIENT"}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 border-b border-white/5 mb-8">
          {[
            { key: "info",     label: "Informations" },
            { key: "security", label: "Sécurité" },
          ].map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                tab === t.key ? "border-blue-500 text-blue-400" : "border-transparent text-slate-500 hover:text-white"
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Info tab */}
        {tab === "info" && (
          <form onSubmit={handleSave} className="rounded-2xl border border-white/5 bg-[#0f172a] p-6 space-y-5">
            <h2 className="font-['Syne'] text-base font-bold mb-2">Informations personnelles</h2>

            {msg && (
              <div className={`rounded-xl px-4 py-3 text-sm border ${
                msg.includes("✓") ? "bg-green-500/10 border-green-500/20 text-green-400"
                                  : "bg-red-500/10 border-red-500/20 text-red-400"
              }`}>{msg}</div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Prénom</label>
                <input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white focus:border-blue-500/50 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Nom</label>
                <input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white focus:border-blue-500/50 focus:outline-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white focus:border-blue-500/50 focus:outline-none" />
            </div>

            <button type="submit" disabled={saving}
              className="rounded-xl bg-blue-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-400 disabled:opacity-60 transition-colors flex items-center gap-2">
              {saving ? <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> : null}
              Sauvegarder les modifications
            </button>
          </form>
        )}

        {/* Security tab */}
        {tab === "security" && (
          <form onSubmit={handlePw} className="rounded-2xl border border-white/5 bg-[#0f172a] p-6 space-y-5">
            <h2 className="font-['Syne'] text-base font-bold mb-2">Changer de mot de passe</h2>

            {pwMsg && (
              <div className={`rounded-xl px-4 py-3 text-sm border ${
                pwMsg.includes("✓") ? "bg-green-500/10 border-green-500/20 text-green-400"
                                    : "bg-red-500/10 border-red-500/20 text-red-400"
              }`}>{pwMsg}</div>
            )}

            {[
              { label: "Mot de passe actuel", key: "current" },
              { label: "Nouveau mot de passe", key: "next" },
              { label: "Confirmer le nouveau mot de passe", key: "confirm" },
            ].map(({ label, key }) => (
              <div key={key}>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">{label}</label>
                <input type="password" value={pwForm[key]}
                  onChange={(e) => setPwForm({ ...pwForm, [key]: e.target.value })}
                  placeholder="••••••••"
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:border-blue-500/50 focus:outline-none" />
              </div>
            ))}

            <button type="submit" disabled={savingPw}
              className="rounded-xl bg-blue-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-400 disabled:opacity-60 transition-colors">
              {savingPw ? "Modification..." : "Modifier le mot de passe"}
            </button>
          </form>
        )}

        {/* Logout */}
        <div className="mt-8 rounded-2xl border border-red-500/10 bg-red-500/5 p-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-white mb-0.5">Déconnexion</p>
            <p className="text-xs text-slate-500">Terminer votre session sur tous les appareils</p>
          </div>
          <button onClick={logout}
            className="rounded-xl border border-red-500/30 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors">
            Se déconnecter
          </button>
        </div>
      </div>
    </div>
  );
}
