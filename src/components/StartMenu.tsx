import React from 'react';
import { Sparkles, Download, Image, Sliders, Power, Search, Info, Terminal, ChevronRight } from 'lucide-react';

interface StartMenuProps {
  isOpen: boolean;
  currentUser?: { username: string; uid: string } | null;
  onClose: () => void;
  onOpenWindow: (target: 'gemini-app' | 'image-studio' | 'shortcut-creator' | 'settings') => void;
  onOpenSpotlight: () => void;
  onOpenLogin?: () => void;
}

export const StartMenu: React.FC<StartMenuProps> = ({
  isOpen,
  currentUser,
  onClose,
  onOpenWindow,
  onOpenSpotlight,
  onOpenLogin,
}) => {
  if (!isOpen) return null;

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="absolute bottom-14 left-4 w-80 sm:w-96 bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-2xl z-50 overflow-hidden text-slate-100 animate-in fade-in slide-in-from-bottom-3 duration-150"
    >
      {/* Search Bar inside Start Menu */}
      <div className="p-3 border-b border-slate-800 bg-slate-950/40">
        <button
          onClick={() => {
            onClose();
            onOpenSpotlight();
          }}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-xs text-slate-400 hover:text-white border border-slate-700/60 transition-colors"
        >
          <Search className="w-4 h-4 text-blue-400" />
          <span>Frag Gemini (Alt + Leertaste)...</span>
        </button>
      </div>

      {/* Main Apps List */}
      <div className="p-3 space-y-1">
        <div className="px-2 py-1 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
          Angeheftete Apps & Tools
        </div>

        <button
          onClick={() => {
            onOpenWindow('gemini-app');
            onClose();
          }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-blue-600/20 hover:border-blue-500/40 border border-transparent transition-all group text-left"
        >
          <div className="p-2 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 group-hover:scale-110 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-white group-hover:text-blue-200">
              Google Gemini Desktop
            </div>
            <div className="text-xs text-slate-400 truncate">
              Haupt-KI Assistenz & Chat Studio
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-blue-300" />
        </button>

        <button
          onClick={() => {
            onOpenWindow('shortcut-creator');
            onClose();
          }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-emerald-600/20 hover:border-emerald-500/40 border border-transparent transition-all group text-left"
        >
          <div className="p-2 rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 group-hover:scale-110 transition-transform">
            <Download className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-white group-hover:text-emerald-200">
              Startverknüpfung erstellen / Herunterladen
            </div>
            <div className="text-xs text-slate-400 truncate">
              Echte PC Desktop .url / .bat Verknüpfung exportieren
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              window.location.href = '/api/download-shortcut';
            }}
            title="Direkt .url herunterladen"
            className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1 shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span>.url</span>
          </button>
        </button>

        <button
          onClick={() => {
            onOpenWindow('image-studio');
            onClose();
          }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-purple-600/20 hover:border-purple-500/40 border border-transparent transition-all group text-left"
        >
          <div className="p-2 rounded-lg bg-purple-600/20 text-purple-400 border border-purple-500/30 group-hover:scale-110 transition-transform">
            <Image className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-white group-hover:text-purple-200">
              Gemini Bild-Studio
            </div>
            <div className="text-xs text-slate-400 truncate">
              KI-Bildgenerierung mit nano banana
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-purple-300" />
        </button>

        <button
          onClick={() => {
            onOpenWindow('settings');
            onClose();
          }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-amber-600/20 hover:border-amber-500/40 border border-transparent transition-all group text-left"
        >
          <div className="p-2 rounded-lg bg-amber-600/20 text-amber-400 border border-amber-500/30 group-hover:scale-110 transition-transform">
            <Sliders className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-white group-hover:text-amber-200">
              Desktop Einstellungen
            </div>
            <div className="text-xs text-slate-400 truncate">
              Hintergrundbild, Themen & API Status
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-300" />
        </button>
      </div>

      {/* Footer Info & User */}
      <div className="p-3 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
        <button
          onClick={() => {
            onClose();
            if (onOpenLogin) onOpenLogin();
          }}
          className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-800/80 transition-colors text-left group"
        >
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center text-white font-bold text-xs shadow-sm group-hover:scale-105 transition-transform">
            {currentUser?.username ? currentUser.username[0].toUpperCase() : 'A'}
          </div>
          <div>
            <div className="font-semibold text-white flex items-center gap-1.5">
              <span>{currentUser?.username || 'admin'}</span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Angemeldet
              </span>
            </div>
            <div className="text-[10px] text-slate-400">Klicke zum Profil / Login (Passwort: 1982)</div>
          </div>
        </button>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          title="Menü Schließen"
        >
          <Power className="w-4 h-4 text-red-400" />
        </button>
      </div>
    </div>
  );
};
