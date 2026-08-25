"use client";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { X, Check } from "lucide-react";

export default function CookieConsent() {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);

  const [preferences, setPreferences] = useState({
    necessary: true,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    const hasConsented = localStorage.getItem("cookieConsent");
    
    if (hasConsented) {
      setIsVisible(false);
      return;
    }

    const checkConsentLocation = async () => {
      // 1. Check IP-based location (EU)
      try {
        const response = await fetch('https://ipapi.co/json/');
        if (response.ok) {
          const data = await response.json();
          if (data.in_eu) {
            setIsVisible(true);
            return;
          }
        }
      } catch (error) {
        console.warn("IP API failed, falling back to browser settings.");
      }

      // 2. Fallback to browser settings (Timezone)
      try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (tz && tz.startsWith('Europe/')) {
          setIsVisible(true);
          return;
        }
      } catch (error) {
        console.warn("Timezone check failed.");
      }
      
      // 3. Fallback to language
      const languages = navigator.languages || [navigator.language];
      const euLocales = ["en-GB", "de", "fr", "es", "it", "pt", "nl", "sv", "da", "fi"];
      const isEULanguage = languages.some(lang => euLocales.some(eu => lang.toLowerCase().startsWith(eu)));

      if (isEULanguage) {
        setIsVisible(true);
      }
    };

    checkConsentLocation();
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem("cookieConsent", "all");
    setIsVisible(false);
    setShowPreferences(false);
  };

  const handleDeclineAll = () => {
    localStorage.setItem("cookieConsent", "necessary");
    setIsVisible(false);
    setShowPreferences(false);
  };

  const handleSavePreferences = () => {
    localStorage.setItem("cookieConsent", JSON.stringify(preferences));
    setIsVisible(false);
    setShowPreferences(false);
  };

  if (!isVisible && !showPreferences) return null;

  return (
    <>
      {isVisible && !showPreferences && (
        <div className="fixed bottom-0 left-0 right-0 z-[100] bg-[#000000] border-t border-[#385600] p-4 shadow-2xl">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex-1 text-sm text-gray-300">
              <p>
                {t("cookie.message", "We use cookies to improve your experience, personalize content and ads, and analyze our traffic. By clicking \"Accept\", you agree to the storing of cookies on your device.")}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                onClick={() => setShowPreferences(true)}
                className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
              >
                {t("cookie.manage", "Manage Preferences")}
              </button>
              <button
                onClick={handleDeclineAll}
                className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
              >
                {t("cookie.decline", "Decline")}
              </button>
              <button
                onClick={handleAcceptAll}
                className="px-4 py-2 text-sm font-medium bg-brand-700 hover:bg-brand-600 text-white rounded-md transition-colors"
              >
                {t("cookie.accept", "Accept")}
              </button>
              <button
                onClick={() => setIsVisible(false)}
                className="p-1 text-gray-400 hover:text-white ml-2"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {showPreferences && (
        <div className="fixed inset-0 z-[110] bg-black/60 flex items-center justify-center p-4">
          <div className="bg-[#000000] border border-[#385600] rounded-xl shadow-2xl max-w-md w-full p-6 text-[#eeeeee]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">{t("cookie.preferences", "Cookie Preferences")}</h2>
              <button onClick={() => setShowPreferences(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4 mb-6 text-sm">
              <div className="flex items-start justify-between gap-4 p-3 bg-white/5 rounded-lg border border-white/10">
                <div>
                  <h3 className="font-semibold text-white mb-1">Strictly Necessary</h3>
                  <p className="text-gray-400 text-xs">Required for the website to function properly.</p>
                </div>
                <div className="text-brand-500 whitespace-nowrap flex items-center"><Check className="w-4 h-4 mr-1"/>Active</div>
              </div>

              <div className="flex items-start justify-between gap-4 p-3 border border-white/10 rounded-lg">
                <div>
                  <h3 className="font-semibold text-white mb-1">Analytics</h3>
                  <p className="text-gray-400 text-xs">Help us understand how visitors interact with our site.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer mt-1">
                  <input type="checkbox" className="sr-only peer" checked={preferences.analytics} onChange={(e) => setPreferences({...preferences, analytics: e.target.checked})} />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
                </label>
              </div>

              <div className="flex items-start justify-between gap-4 p-3 border border-white/10 rounded-lg">
                <div>
                  <h3 className="font-semibold text-white mb-1">Marketing</h3>
                  <p className="text-gray-400 text-xs">Used to deliver relevant advertisements to you.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer mt-1">
                  <input type="checkbox" className="sr-only peer" checked={preferences.marketing} onChange={(e) => setPreferences({...preferences, marketing: e.target.checked})} />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
                </label>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                onClick={handleDeclineAll}
                className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white border border-[#444] rounded-md transition-colors w-full sm:w-auto"
              >
                {t("cookie.rejectAll", "Reject All")}
              </button>
              <button
                onClick={handleSavePreferences}
                className="px-4 py-2 text-sm font-medium bg-brand-700 hover:bg-brand-600 text-white rounded-md transition-colors w-full sm:w-auto"
              >
                {t("cookie.save", "Save Preferences")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
