import React, { useState } from 'react';
import { Sliders, Monitor, Check, RefreshCw, Key, ShieldCheck, Palette, Volume2, Sparkles } from 'lucide-react';
import { AppSettings, DesktopTheme } from '../types';

interface DesktopSettingsModalProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
}

export const DesktopSettingsModal: React.FC<DesktopSettingsModalProps> = ({ settings, onUpdateSettings }) => {
  const [apiTesting, setApiTesting] = useState(false);
  const [apiStatus, setApiStatus] = useState<{ status: string; hasKey: boolean } | null>(null);

  const testApiConnection = async () => {
    setApiTesting(true);
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      setApiStatus({ status: 'Aktiv & Bereit', hasKey: data.hasApiKey });
    } catch (e) {
      setApiStatus({ status: 'Fehler beim Verbinden', hasKey: false });
    } finally {
      setApiTesting(false);
    }
  };

  const wallpapers: { id: DesktopTheme; label: string; bg: string }[] = [
    { id: 'google-dark', label: 'Google AI Dark', bg: 'from-slate-950 via-blue-950 to-indigo-950' },
    { id: 'dark-cyber', label: 'Cyber Neon', bg: 'from-gray-950 via-slate-900 to-purple-950' },
    { id: 'windows-eleven', label: 'Windows Dark Bloom', bg: 'from-blue-950 via-slate-900 to-cyan-950' },
    { id: 'sonoma-dusk', label: 'Sonoma Dusk', bg: 'from-amber-950 via-rose-950 to-indigo-950' },
    { id: 'minimal-light', label: 'Studio Minimal Light', bg: 'from-slate-200 via-slate-100 to-blue-100 text-slate-900' },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-6 overflow-y-auto h-full text-slate-100">
      <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
        <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
          <Sliders className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Desktop & Gemini PC Einstellungen</h2>
          <p className="text-xs text-slate-400">Anpassung der Desktop-Oberfläche, Modelle & KI-Parameter</p>
        </div>
      </div>

      {/* Desktop Wallpaper Picker */}
      <div className="space-y-3">
        <label className="text-sm font-bold text-slate-200 flex items-center gap-2">
          <Palette className="w-4 h-4 text-purple-400" />
          <span>Desktop Hintergrundbild wählen</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {wallpapers.map((wp) => (
            <button
              key={wp.id}
              onClick={() => onUpdateSettings({ wallpaper: wp.id })}
              className={`p-3 rounded-xl border text-left flex flex-col justify-between h-24 transition-all ${
                settings.wallpaper === wp.id
                  ? 'border-blue-400 ring-2 ring-blue-500/30 shadow-lg'
                  : 'border-slate-800 hover:border-slate-700'
              } bg-gradient-to-br ${wp.bg}`}
            >
              <span className="text-xs font-semibold text-white drop-shadow-sm">{wp.label}</span>
              {settings.wallpaper === wp.id && (
                <div className="self-end p-1 rounded-full bg-blue-600 text-white shadow-sm">
                  <Check className="w-3.5 h-3.5" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Window Controls Style */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
        <label className="text-sm font-bold text-slate-200 flex items-center gap-2">
          <Monitor className="w-4 h-4 text-blue-400" />
          <span>Fensterrahmen-Stil</span>
        </label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
            <input
              type="radio"
              name="windowStyle"
              checked={settings.windowStyle === 'windows'}
              onChange={() => onUpdateSettings({ windowStyle: 'windows' })}
              className="accent-blue-500"
            />
            <span>Windows 11 Stil (_ □ ✕)</span>
          </label>

          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
            <input
              type="radio"
              name="windowStyle"
              checked={settings.windowStyle === 'mac'}
              onChange={() => onUpdateSettings({ windowStyle: 'mac' })}
              className="accent-blue-500"
            />
            <span>macOS Stil (🔴 🟡 🟢)</span>
          </label>
        </div>
      </div>

      {/* Gemini Model & System Prompt Defaults */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
        <label className="text-sm font-bold text-slate-200 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>Standard Gemini KI Modell & Verhalten</span>
        </label>

        <div>
          <label className="block text-xs text-slate-400 mb-1">Standard Modell</label>
          <select
            value={settings.defaultModel}
            onChange={(e) => onUpdateSettings({ defaultModel: e.target.value })}
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500"
          >
            <option value="gemini-3.6-flash">Google Gemini 3.6 Flash (Empfohlen - Schnell & Leistungsstark)</option>
            <option value="gemini-3.1-pro-preview">Google Gemini 3.1 Pro (Komplexes Reasoning & Code)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs text-slate-400 mb-1">Standard System Prompt / Persona</label>
          <textarea
            rows={3}
            value={settings.systemPrompt}
            onChange={(e) => onUpdateSettings({ systemPrompt: e.target.value })}
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500 leading-relaxed font-mono"
          />
        </div>
      </div>

      {/* API Key Health & Connectivity Test */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-200">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>Google Gemini API Server Status</span>
          </div>
          <button
            onClick={testApiConnection}
            disabled={apiTesting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${apiTesting ? 'animate-spin' : ''}`} />
            <span>Verbindung prüfen</span>
          </button>
        </div>

        {apiStatus && (
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs flex items-center justify-between">
            <span className="text-slate-300">Server Status: <strong className="text-green-400">{apiStatus.status}</strong></span>
            <span className="text-slate-400">API Key: <strong className={apiStatus.hasKey ? 'text-green-400' : 'text-amber-400'}>{apiStatus.hasKey ? 'Inkuldiert & Aktiv' : 'Standard'}</strong></span>
          </div>
        )}
      </div>
    </div>
  );
};
