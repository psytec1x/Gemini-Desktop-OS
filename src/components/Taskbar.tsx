import React, { useState, useEffect } from 'react';
import { Sparkles, Search, Download, Image, Sliders, Volume2, Wifi, Bell, Command, ChevronUp, User } from 'lucide-react';
import { StartMenu } from './StartMenu';

interface TaskbarProps {
  currentUser?: { username: string; uid: string } | null;
  activeWindows: {
    geminiApp: boolean;
    shortcutCreator: boolean;
    imageStudio: boolean;
    settings: boolean;
  };
  minimizedWindows: {
    geminiApp: boolean;
    shortcutCreator: boolean;
    imageStudio: boolean;
    settings: boolean;
  };
  focusedWindow: string | null;
  onToggleWindow: (windowId: 'geminiApp' | 'shortcutCreator' | 'imageStudio' | 'settings') => void;
  onOpenWindow: (windowId: 'gemini-app' | 'image-studio' | 'shortcut-creator' | 'settings') => void;
  onOpenSpotlight: () => void;
  onOpenLogin?: () => void;
}

export const Taskbar: React.FC<TaskbarProps> = ({
  currentUser,
  activeWindows,
  minimizedWindows,
  focusedWindow,
  onToggleWindow,
  onOpenWindow,
  onOpenSpotlight,
  onOpenLogin,
}) => {
  const [isStartOpen, setIsStartOpen] = useState(false);
  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [showTrayDetails, setShowTrayDetails] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setDateStr(now.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <StartMenu
        isOpen={isStartOpen}
        currentUser={currentUser}
        onClose={() => setIsStartOpen(false)}
        onOpenWindow={onOpenWindow}
        onOpenSpotlight={onOpenSpotlight}
        onOpenLogin={onOpenLogin}
      />

      <div className="fixed bottom-0 left-0 right-0 h-12 bg-slate-900/90 backdrop-blur-md border-t border-slate-700/80 z-40 flex items-center justify-between px-3 text-slate-200 select-none shadow-2xl">
        {/* Left: Start Button + Spotlight Search + App Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {/* Start Menu Button */}
          <button
            onClick={() => setIsStartOpen(!isStartOpen)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all ${
              isStartOpen
                ? 'bg-blue-600/30 border-blue-400 text-blue-300 shadow-lg shadow-blue-500/20'
                : 'bg-slate-800/80 hover:bg-slate-700/80 border-slate-700/60 text-white'
            }`}
          >
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-blue-500 via-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-semibold text-xs hidden sm:inline">Start</span>
          </button>

          {/* Quick Spotlight Trigger */}
          <button
            onClick={onOpenSpotlight}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/60 hover:bg-slate-700/80 border border-slate-700/50 text-slate-300 hover:text-white text-xs transition-colors"
            title="Gemini Spotlight (Alt + Leertaste)"
          >
            <Search className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden md:inline text-slate-400">Suche...</span>
            <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-slate-950/80 text-slate-400 rounded border border-slate-700">
              Alt+Space
            </kbd>
          </button>

          <div className="h-5 w-px bg-slate-700/60 mx-1 hidden sm:block" />

          {/* Running Apps Icons in Taskbar */}
          {activeWindows.geminiApp && (
            <button
              onClick={() => onToggleWindow('geminiApp')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                focusedWindow === 'geminiApp' && !minimizedWindows.geminiApp
                  ? 'bg-blue-600/30 border-blue-400/80 text-blue-200 shadow-md'
                  : 'bg-slate-800/50 hover:bg-slate-700/60 border-slate-700/40 text-slate-300'
              }`}
            >
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span className="truncate max-w-[120px]">Gemini Desktop</span>
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            </button>
          )}

          {activeWindows.shortcutCreator && (
            <button
              onClick={() => onToggleWindow('shortcutCreator')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                focusedWindow === 'shortcutCreator' && !minimizedWindows.shortcutCreator
                  ? 'bg-emerald-600/30 border-emerald-400/80 text-emerald-200 shadow-md'
                  : 'bg-slate-800/50 hover:bg-slate-700/60 border-slate-700/40 text-slate-300'
              }`}
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span className="truncate max-w-[120px]">Verknüpfung</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            </button>
          )}

          {activeWindows.imageStudio && (
            <button
              onClick={() => onToggleWindow('imageStudio')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                focusedWindow === 'imageStudio' && !minimizedWindows.imageStudio
                  ? 'bg-purple-600/30 border-purple-400/80 text-purple-200 shadow-md'
                  : 'bg-slate-800/50 hover:bg-slate-700/60 border-slate-700/40 text-slate-300'
              }`}
            >
              <Image className="w-4 h-4 text-purple-400" />
              <span className="truncate max-w-[120px]">Bild-Studio</span>
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
            </button>
          )}

          {activeWindows.settings && (
            <button
              onClick={() => onToggleWindow('settings')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                focusedWindow === 'settings' && !minimizedWindows.settings
                  ? 'bg-amber-600/30 border-amber-400/80 text-amber-200 shadow-md'
                  : 'bg-slate-800/50 hover:bg-slate-700/60 border-slate-700/40 text-slate-300'
              }`}
            >
              <Sliders className="w-4 h-4 text-amber-400" />
              <span className="truncate max-w-[120px]">Einstellungen</span>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            </button>
          )}
        </div>

        {/* Right System Tray */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onOpenLogin && onOpenLogin()}
            className="flex items-center gap-1.5 px-2 py-1 rounded-xl bg-slate-800/70 hover:bg-slate-700/70 border border-slate-700/60 text-xs text-white transition-colors"
            title="Benutzerkonto / Anmelden (admin / 1982)"
          >
            <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-bold text-[10px]">
              {currentUser?.username ? currentUser.username[0].toUpperCase() : 'A'}
            </div>
            <span className="font-semibold text-xs text-emerald-300 hidden sm:inline">{currentUser?.username || 'admin'}</span>
          </button>

          <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-800/40 border border-slate-700/40 text-slate-400 text-xs">
            <Wifi className="w-3.5 h-3.5 text-emerald-400" />
            <Volume2 className="w-3.5 h-3.5 text-slate-300" />
            <Bell className="w-3.5 h-3.5 text-slate-300" />
          </div>

          <div
            onClick={() => setShowTrayDetails(!showTrayDetails)}
            className="flex flex-col items-end px-2.5 py-1 rounded-xl bg-slate-800/70 hover:bg-slate-700/70 border border-slate-700/60 cursor-pointer text-[11px] leading-tight text-right transition-colors"
          >
            <span className="font-bold text-white tracking-wide">{timeStr}</span>
            <span className="text-[10px] text-slate-400">{dateStr}</span>
          </div>
        </div>
      </div>
    </>
  );
};
