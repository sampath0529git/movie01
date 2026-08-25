"use client";
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Key, Save, Sparkles, AlertCircle, Film, DollarSign } from 'lucide-react';
import { supabase } from '../../supabase';

export default function AdminSettings() {
  const [aiApiKeys, setAiApiKeys] = useState('');
  const [aiModel, setAiModel] = useState('gemini-2.5-flash');
  const [tmdbApiKey, setTmdbApiKey] = useState('');
  const [monetagLink, setMonetagLink] = useState('');
  const [isSavingMonetag, setIsSavingMonetag] = useState(false);

  useEffect(() => {
    // Load local storage settings
    const keys = localStorage.getItem('AI_API_KEYS');
    if (keys) {
      setAiApiKeys(keys);
    } else {
      // Migrate old keys
      const oldOpenRouter = localStorage.getItem('OPENROUTER_API_KEY');
      const oldGemini = localStorage.getItem('GEMINI_API_KEY');
      if (oldGemini) setAiApiKeys(oldGemini);
      else if (oldOpenRouter) setAiApiKeys(oldOpenRouter);
    }

    const model = localStorage.getItem('AI_MODEL');
    if (model) {
      setAiModel(model);
    } else {
      const oldModel = localStorage.getItem('OPENROUTER_MODEL');
      if (oldModel) setAiModel(oldModel);
    }

    const tmdbKey = localStorage.getItem('tmdbApiKey');
    if (tmdbKey) {
      setTmdbApiKey(tmdbKey);
    }
  }, []);

  useEffect(() => {
    // Load Supabase settings
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase.from('settings').select('*').eq('id', 'system').single();
        if (data) {
          if (data.monetag_direct_link) {
            setMonetagLink(data.monetag_direct_link);
          }
        }
      } catch (err) {
        console.error("Error fetching system settings:", err);
      }
    };
    fetchSettings();
  }, []);

  const handleSaveMonetagLink = async () => {
    setIsSavingMonetag(true);
    try {
      const { error } = await supabase.from('settings').upsert({ id: 'system', monetag_direct_link: monetagLink });
      if (error) throw error;
      toast.success('Monetag Direct Link saved globally!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to save Monetag link');
    } finally {
      setIsSavingMonetag(false);
    }
  };

  const handleSaveToken = () => {
    const keysToSave = aiApiKeys.split(',').map(k => k.trim()).filter(k => k);
    if (keysToSave.length === 0) {
      localStorage.removeItem('AI_API_KEYS');
      localStorage.removeItem('AI_MODEL');
      toast.success('AI API Keys removed.');
      return;
    }
    
    localStorage.setItem('AI_API_KEYS', keysToSave.join(','));
    localStorage.setItem('AI_MODEL', aiModel.trim() || 'gemini-2.5-flash');
    toast.success('AI API Keys & Model saved successfully!');
  };

  const handleSaveTmdbToken = () => {
    if (!tmdbApiKey.trim()) {
      localStorage.removeItem('tmdbApiKey');
      toast.success('TMDB API Key removed.');
      return;
    }
    localStorage.setItem('tmdbApiKey', tmdbApiKey.trim());
    toast.success('TMDB API Key saved successfully!');
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-white uppercase tracking-tight">System Settings</h2>
      </div>

      <div className="bg-[#000000] border border-[#0c1200] rounded-2xl p-6 md:p-8">
        <div className="flex flex-col gap-6 max-w-2xl">
          <div className="flex flex-col space-y-2">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-500" />
              AI Integration
            </h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Provide AI API keys (Google Gemini or OpenRouter) to enable automatic SEO content generation. For Gemini free tier, you can provide multiple keys separated by commas, and the system will automatically rotate them if one runs out of credits/quota.
            </p>
          </div>

          <div className="bg-brand-500/10 border border-brand-500/20 rounded-xl p-4 flex gap-3 text-brand-400">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="text-sm">
              <strong className="font-bold block mb-1">Important Note:</strong>
              Your API keys are stored securely in your browser's local storage and sent directly to Google or OpenRouter endpoints.
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block">
              AI API Keys (Comma separated)
            </label>
            <div className="flex gap-4">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Key className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type="password"
                  value={aiApiKeys}
                  onChange={(e) => setAiApiKeys(e.target.value)}
                  className="w-full bg-[#0d1400] border border-[#385600] rounded-xl text-white pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-purple-500 focus:bg-[#253900] transition-colors"
                  placeholder="AIzaSy... or sk-or-..., AIzaSy..."
                />
              </div>
            </div>
            
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mt-4">
              AI Model
            </label>
            <div className="flex gap-4">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Sparkles className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type="text"
                  value={aiModel}
                  onChange={(e) => setAiModel(e.target.value)}
                  className="w-full bg-[#0d1400] border border-[#385600] rounded-xl text-white pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-purple-500 focus:bg-[#253900] transition-colors"
                  placeholder="e.g. gemini-2.5-flash or google/gemini-2.5-flash"
                />
              </div>
              <button
                onClick={handleSaveToken}
                className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-xl font-bold text-sm transition-colors flex items-center gap-2 shadow-lg shadow-purple-900/20 whitespace-nowrap"
              >
                <Save className="w-4 h-4" />
                Save AI Settings
              </button>
            </div>
            <p className="text-xs text-gray-500">
              Get an API key from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">Google AI Studio</a> or <a href="https://openrouter.ai/keys" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">OpenRouter</a>.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-6 max-w-2xl mt-12 border-t border-[#0c1200] pt-8">
          <div className="flex flex-col space-y-2">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Film className="w-5 h-5 text-blue-500" />
              TMDB API Integration
            </h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Set your TMDB API Key to automatically fetch movie and TV show titles, descriptions, cast, posters, and background images directly from The Movie Database (TMDB).
            </p>
          </div>

          <div className="space-y-4">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block">
              TMDB API Key
            </label>
            <div className="flex gap-4">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Key className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type="password"
                  value={tmdbApiKey}
                  onChange={(e) => setTmdbApiKey(e.target.value)}
                  className="w-full bg-[#0d1400] border border-[#385600] rounded-xl text-white pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:bg-[#253900] transition-colors"
                  placeholder="eyJhbG..."
                />
              </div>
              <button
                onClick={handleSaveTmdbToken}
                className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold text-sm transition-colors flex items-center gap-2 shadow-lg shadow-blue-900/20 whitespace-nowrap"
              >
                <Save className="w-4 h-4" />
                Save Key
              </button>
            </div>
            <p className="text-xs text-gray-500">
              Get an API key for free from <a href="https://developer.themoviedb.org/docs/getting-started" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">TMDB Developers</a>.
            </p>
          </div>
        </div>
        
        {/* Monetag Settings */}
        <div className="flex flex-col gap-6 max-w-2xl mt-12 border-t border-[#0c1200] pt-8">
          <div className="flex flex-col space-y-2">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-500" />
              Monetization
            </h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Configure your Monetag Direct Link for Smart Pop-under monetization. This link will trigger dynamically across the site when users click anywhere, allowing them to continue to their destination while opening the ad in a background tab. It targets high CPM setups.
            </p>
          </div>

          <div className="space-y-4">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block">
              Monetag Direct Link URL
            </label>
            <div className="flex gap-4">
              <div className="relative flex-grow">
                <input
                  type="url"
                  value={monetagLink}
                  onChange={(e) => setMonetagLink(e.target.value)}
                  className="w-full bg-[#0d1400] border border-[#385600] rounded-xl text-white px-4 py-3 text-sm focus:outline-none focus:border-green-500 focus:bg-[#253900] transition-colors"
                  placeholder="https://meetaibach.com/..."
                />
              </div>
              <button
                onClick={handleSaveMonetagLink}
                disabled={isSavingMonetag}
                className="bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-xl font-bold text-sm transition-colors flex items-center gap-2 shadow-lg shadow-green-900/20 whitespace-nowrap disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {isSavingMonetag ? "Saving..." : "Save Link"}
              </button>
            </div>
            <p className="text-xs text-gray-500">
              Paste your direct Smartlink here. Wait for 5 minutes after saving for the globally cached configuration to fully flush.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
