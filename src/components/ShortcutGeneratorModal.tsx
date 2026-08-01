import React, { useState } from 'react';
import { Download, Monitor, Sparkles, Check, FileCode, ExternalLink, HelpCircle, Plus } from 'lucide-react';
import { DesktopShortcut } from '../types';

interface ShortcutGeneratorModalProps {
  onAddVirtualShortcut: (newShortcut: DesktopShortcut) => void;
}

export const ShortcutGeneratorModal: React.FC<ShortcutGeneratorModalProps> = ({ onAddVirtualShortcut }) => {
  const [downloadedUrl, setDownloadedUrl] = useState(false);
  const [downloadedBat, setDownloadedBat] = useState(false);
  const [addedVirtual, setAddedVirtual] = useState(false);
  const [customTitle, setCustomTitle] = useState('Google Gemini KI');
  const [customTarget, setCustomTarget] = useState<DesktopShortcut['targetWindow']>('gemini-app');

  const handleDownloadUrl = () => {
    window.location.href = '/api/download-shortcut';
    setDownloadedUrl(true);
    setTimeout(() => setDownloadedUrl(false), 3000);
  };

  const handleDownloadAll = () => {
    handleDownloadUrl();
    setTimeout(() => {
      handleDownloadBat();
    }, 600);
  };

  const handleDownloadBat = () => {
    window.location.href = '/api/download-launcher';
    setDownloadedBat(true);
    setTimeout(() => setDownloadedBat(false), 3000);
  };

  const handleAddVirtual = () => {
    const newSc: DesktopShortcut = {
      id: 'sc-custom-' + Date.now(),
      title: customTitle,
      icon: customTarget === 'image-studio' ? 'Image' : customTarget === 'settings' ? 'Sliders' : 'Sparkles',
      targetWindow: customTarget,
      x: 24,
      y: 448,
    };
    onAddVirtualShortcut(newSc);
    setAddedVirtual(true);
    setTimeout(() => setAddedVirtual(false), 3000);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 overflow-y-auto h-full text-slate-100">
      {/* Header Banner */}
      <div className="relative p-5 rounded-2xl bg-gradient-to-r from-blue-900/60 via-indigo-900/60 to-purple-900/60 border border-blue-500/30 overflow-hidden shadow-lg">
        <div className="flex items-start justify-between relative z-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Desktop Integration</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white">
              Google Gemini Startverknüpfung auf dem Desktop
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
              Lade hier eine originale Windows/macOS Startverknüpfung herunter oder erstelle direkt hier eine Verknüpfung auf dem virtuellen PC-Desktop.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={handleDownloadAll}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-500/20 transition-all active:scale-95 border border-blue-400/40"
              >
                <Download className="w-4 h-4" />
                <span>⚡ 1-Klick Startverknüpfung herunterladen</span>
              </button>
            </div>
          </div>
          <Monitor className="w-12 h-12 text-blue-400/80 hidden sm:block shrink-0" />
        </div>
      </div>

      {/* Option 1: Direct File Download (.url & .bat) */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
          <Download className="w-4 h-4 text-emerald-400" />
          <span>1. Echte Startverknüpfung für deinen echten Windows / PC Desktop herunterladen</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Windows .url Shortcut */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-blue-400 font-semibold text-sm mb-1">
                <FileCode className="w-4 h-4" />
                <span>Internet-Verknüpfung (.url)</span>
              </div>
              <p className="text-xs text-slate-400 mb-3">
                Standard Windows Verknüpfungs-Datei. Nach dem Download einfach auf deinen echten Windows Desktop ziehen!
              </p>
            </div>
            <button
              onClick={handleDownloadUrl}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all shadow-md active:scale-[0.99]"
            >
              {downloadedUrl ? (
                <>
                  <Check className="w-4 h-4 text-green-300" />
                  <span>Verknüpfung heruntergeladen!</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Google Gemini Desktop.url herunterladen</span>
                </>
              )}
            </button>
          </div>

          {/* Windows Batch Launcher (.bat) */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm mb-1">
                <FileCode className="w-4 h-4" />
                <span>Windows Launcher Script (.bat)</span>
              </div>
              <p className="text-xs text-slate-400 mb-3">
                Erstellt eine ausführbare Stapelverarbeitungsdatei (.bat) für Schnellstart direkt per Doppelklick.
              </p>
            </div>
            <button
              onClick={handleDownloadBat}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all shadow-md active:scale-[0.99]"
            >
              {downloadedBat ? (
                <>
                  <Check className="w-4 h-4 text-green-300" />
                  <span>Launcher heruntergeladen!</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Google Gemini Desktop.bat herunterladen</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Option 2: Add Virtual Desktop Shortcut */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
          <Plus className="w-4 h-4 text-purple-400" />
          <span>2. Neue Verknüpfung auf dem virtuellen Desktop hinzufügen</span>
        </h3>
        <p className="text-xs text-slate-400">
          Füge ein neues Desktop-Icon direkt auf der aktuellen Desktop-Oberfläche hinzu:
        </p>

        <div className="flex flex-col sm:flex-row gap-3 items-end pt-1">
          <div className="flex-1 w-full">
            <label className="block text-xs font-medium text-slate-400 mb-1">Titel der Verknüpfung</label>
            <input
              type="text"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500"
              placeholder="Z.B. Gemini Schnellzugriff"
            />
          </div>

          <div className="w-full sm:w-48">
            <label className="block text-xs font-medium text-slate-400 mb-1">Ziel-Anwendung</label>
            <select
              value={customTarget}
              onChange={(e) => setCustomTarget(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500"
            >
              <option value="gemini-app">Google Gemini Chat App</option>
              <option value="image-studio">Gemini Bild-Studio</option>
              <option value="settings">Desktop Einstellungen</option>
            </select>
          </div>

          <button
            onClick={handleAddVirtual}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 shrink-0"
          >
            {addedVirtual ? (
              <>
                <Check className="w-4 h-4 text-green-300" />
                <span>Verknüpfung hinzugefügt!</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Auf Desktop platzieren</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Option 3: Chrome/Edge Web App PWA Installer */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-blue-400" />
          <span>3. Als eigenständige Browser-App (PWA) auf deinem PC installieren</span>
        </h3>
        <div className="text-xs text-slate-300 space-y-2 leading-relaxed">
          <p>
            Du kannst diese Google Gemini Desktop Anwendung auch nativ in deinen Browser-Einstellungen als echte PC-App installieren:
          </p>
          <ol className="list-decimal list-inside space-y-1 text-slate-400 ml-1">
            <li>Klicke oben rechts in deinem Chrome oder Microsoft Edge Browser auf das Dreipunkt-Menü <span className="text-white font-mono">(⋮)</span>.</li>
            <li>Wähle <span className="text-blue-300 font-semibold">"Speichern und teilen"</span> &rarr; <span className="text-blue-300 font-semibold">"Verknüpfung erstellen..."</span>.</li>
            <li>Setze ein Häkchen bei <span className="text-white font-semibold">"Als Fenster öffnen"</span> und klicke auf Erstellen.</li>
            <li>Google Gemini erscheint nun als echte Desktop PC App auf deinem PC!</li>
          </ol>
        </div>
      </div>
    </div>
  );
};
