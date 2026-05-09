import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#080d1a] text-slate-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-4">
          {/* Brand */}
          <div className="sm:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500">
                <svg className="h-3.5 w-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="font-['Syne'] font-bold text-white">ElectroShop</span>
            </div>
            <p className="text-xs leading-relaxed">
              Votre destination premium pour l'électronique high-tech.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-500">Shop</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/catalog" className="hover:text-white transition-colors">Catalogue</Link></li>
              <li><Link to="/catalog?category=audio" className="hover:text-white transition-colors">Audio</Link></li>
              <li><Link to="/catalog?category=gaming" className="hover:text-white transition-colors">Gaming</Link></li>
              <li><Link to="/catalog?category=cameras" className="hover:text-white transition-colors">Caméras</Link></li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-500">Compte</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/profile" className="hover:text-white transition-colors">Mon profil</Link></li>
              <li><Link to="/orders"  className="hover:text-white transition-colors">Mes commandes</Link></li>
              <li><Link to="/cart"    className="hover:text-white transition-colors">Mon panier</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-500">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><span className="hover:text-white transition-colors cursor-pointer">FAQ</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Contact</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Politique de retour</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-6 sm:flex-row">
          <p className="text-xs">© {new Date().getFullYear()} ElectroShop. Tous droits réservés.</p>
          <div className="flex gap-4 text-xs">
            <span className="cursor-pointer hover:text-white transition-colors">Confidentialité</span>
            <span className="cursor-pointer hover:text-white transition-colors">CGV</span>
            <span className="cursor-pointer hover:text-white transition-colors">Mentions légales</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
