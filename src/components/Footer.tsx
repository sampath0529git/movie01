import Link from 'next/link';
import { useTranslation } from "react-i18next";
import { LogoImage } from "./LogoImage";

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-[#000000] border-t border-[#0c1200] mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between gap-12 py-12 px-6">
        <div className="lg:w-1/2">
          <div className="flex items-center gap-2 mb-6 opacity-40 grayscale pointer-events-none">
            <LogoImage className="w-8 h-8 drop-shadow-md" />
            <div className="flex items-center gap-0">
              <span className="text-white font-black text-2xl tracking-tighter">Movie</span>
              <span className="text-white font-black text-2xl tracking-tighter">Zen</span>
            </div>
          </div>
          <p className="text-sm text-gray-400 leading-relaxed mb-4">
            {t("home.description_1", "Watch free movies and TV shows online or download them in HD at MovieZen. Explore an unlimited collection of global cinema—from Hollywood hits to movies from every corner of the world. No registration needed. We are your ultimate destination for fast, high-quality streaming and downloading.")}
          </p>
          <p className="text-sm text-gray-500 leading-relaxed text-xs">
            {t("home.description_2", "Disclaimer: MovieZen does not host or store any media files on its servers. We only link to publicly available content hosted on non-affiliated third-party platforms.")}
          </p>
          <div className="mt-8 space-y-2">
            <h4 className="text-gray-300 font-medium text-sm">MovieZen Entertainment Ltd.</h4>
            <p className="text-sm text-gray-500">Email: contact@moviezen.me</p>
            <p className="text-sm text-gray-500">Support: support@moviezen.me</p>
          </div>
        </div>

        <div className="flex gap-24 lg:w-1/3 justify-start lg:justify-end">
          <div>
            <h4 className="text-white font-bold tracking-wider text-sm mb-4">{t("footer.channels", "CHANNELS")}</h4>
            <ul className="space-y-3">
              {['Netflix', 'Amazon', 'Disney', 'HBO Max'].map(link => (
                <li key={link}>
                  <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">{link}</a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold tracking-wider text-sm mb-4">{t("footer.about", "ABOUT")}</h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">{t("footer.contact", "Contact")}</a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">{t("footer.faq", "FAQ")}</a>
              </li>
              <li>
                <Link href="/dmca" className="text-sm text-gray-400 hover:text-white transition-colors">DMCA</Link>
              </li>
              <li>
                <Link href="/disclaimer" className="text-sm text-gray-400 hover:text-white transition-colors">Disclaimer</Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-[#0c1200] flex flex-col md:flex-row justify-between items-center text-xs text-gray-500 gap-4">
        <p>© {new Date().getFullYear()} MovieZen. All rights reserved.</p>
        <p>Site last updated: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
      </div>
    </footer>
  );
}
