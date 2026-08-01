import React from 'react';
import { Sparkles, Download, Image, Sliders, Trash2, ExternalLink } from 'lucide-react';
import { DesktopShortcut } from '../types';

interface DesktopIconsGridProps {
  shortcuts: DesktopShortcut[];
  onOpenWindow: (target: DesktopShortcut['targetWindow']) => void;
  onShortcutClick?: (shortcut: DesktopShortcut) => void;
}

export const DesktopIconsGrid: React.FC<DesktopIconsGridProps> = ({
  shortcuts,
  onOpenWindow,
}) => {
  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'Sparkles':
        return <Sparkles className="w-8 h-8 text-blue-400" />;
      case 'Download':
        return <Download className="w-8 h-8 text-emerald-400" />;
      case 'Image':
        return <Image className="w-8 h-8 text-purple-400" />;
      case 'Sliders':
        return <Sliders className="w-8 h-8 text-amber-400" />;
      case 'Trash2':
        return <Trash2 className="w-8 h-8 text-slate-400" />;
      default:
        return <Sparkles className="w-8 h-8 text-blue-400" />;
    }
  };

  return (
    <div className="absolute top-4 left-4 flex flex-col gap-4 z-0 select-none">
      {shortcuts.map((shortcut) => (
        <button
          key={shortcut.id}
          onClick={() => onOpenWindow(shortcut.targetWindow)}
          className="group flex flex-col items-center justify-center p-2.5 rounded-xl hover:bg-white/10 active:bg-white/20 transition-all w-28 text-center cursor-pointer border border-transparent hover:border-white/20 backdrop-blur-xs"
        >
          <div className="relative mb-1.5 p-3 bg-slate-900/80 rounded-2xl border border-slate-700/60 shadow-lg group-hover:scale-105 group-hover:border-blue-500/50 transition-all">
            {getIconComponent(shortcut.icon)}
            {shortcut.badge && (
              <span className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full bg-blue-600 text-[10px] font-bold text-white shadow-sm border border-blue-400">
                {shortcut.badge}
              </span>
            )}
          </div>
          <span className="text-xs font-medium text-white drop-shadow-md group-hover:text-blue-200 line-clamp-2 leading-tight">
            {shortcut.title}
          </span>
        </button>
      ))}
    </div>
  );
};
