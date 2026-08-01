import React, { useState } from 'react';
import {
  Sparkles,
  Search,
  Plus,
  X,
  Languages,
  Code,
  FileText,
  StickyNote,
  Cpu,
  CheckSquare,
  Clock,
  ArrowLeftRight,
  Calculator,
  Timer,
  CloudSun,
  Bookmark,
  Check,
  Mic,
  Network,
  LayoutGrid,
  KeyRound,
  Terminal,
  Volume2,
  Newspaper,
} from 'lucide-react';
import { WIDGET_CATALOG } from '../../data/widgetCatalog';
import { WidgetCategory, ActiveWidget, WidgetDefinition } from '../../types';

interface WidgetMenuModalProps {
  isOpen: boolean;
  activeWidgets: ActiveWidget[];
  onClose: () => void;
  onAddWidget: (def: WidgetDefinition) => void;
}

export const WidgetMenuModal: React.FC<WidgetMenuModalProps> = ({
  isOpen,
  activeWidgets,
  onClose,
  onAddWidget,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<WidgetCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filteredWidgets = WIDGET_CATALOG.filter((w) => {
    const matchesCategory = selectedCategory === 'all' || w.category === selectedCategory;
    const matchesSearch =
      w.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Languages':
        return <Languages className="w-5 h-5 text-blue-400" />;
      case 'Mic':
        return <Mic className="w-5 h-5 text-blue-400 animate-pulse" />;
      case 'Network':
        return <Network className="w-5 h-5 text-purple-400" />;
      case 'Code':
        return <Code className="w-5 h-5 text-emerald-400" />;
      case 'FileText':
        return <FileText className="w-5 h-5 text-indigo-400" />;
      case 'Sparkles':
        return <Sparkles className="w-5 h-5 text-purple-400" />;
      case 'LayoutGrid':
        return <LayoutGrid className="w-5 h-5 text-blue-400" />;
      case 'KeyRound':
        return <KeyRound className="w-5 h-5 text-emerald-400" />;
      case 'StickyNote':
        return <StickyNote className="w-5 h-5 text-amber-400" />;
      case 'Cpu':
        return <Cpu className="w-5 h-5 text-teal-400" />;
      case 'CheckSquare':
        return <CheckSquare className="w-5 h-5 text-emerald-400" />;
      case 'Terminal':
        return <Terminal className="w-5 h-5 text-blue-400" />;
      case 'Clock':
        return <Clock className="w-5 h-5 text-cyan-400" />;
      case 'ArrowLeftRight':
        return <ArrowLeftRight className="w-5 h-5 text-blue-400" />;
      case 'Calculator':
        return <Calculator className="w-5 h-5 text-purple-400" />;
      case 'Timer':
        return <Timer className="w-5 h-5 text-pink-400" />;
      case 'CloudSun':
        return <CloudSun className="w-5 h-5 text-amber-400" />;
      case 'Bookmark':
        return <Bookmark className="w-5 h-5 text-blue-400" />;
      case 'Volume2':
        return <Volume2 className="w-5 h-5 text-blue-400" />;
      case 'Newspaper':
        return <Newspaper className="w-5 h-5 text-emerald-400" />;
      default:
        return <Sparkles className="w-5 h-5 text-blue-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-slate-800/80 border-b border-slate-700/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Widget-Katalog & Menü</h3>
              <p className="text-xs text-slate-400">
                Füge KI-Widgets, nützliche Tools und Unterhaltungs-Widgets zu deinem Desktop hinzu
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-700/60 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Toolbar */}
        <div className="p-4 bg-slate-900 border-b border-slate-800/80 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedCategory === 'all'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              Alle Widgets
            </button>
            <button
              onClick={() => setSelectedCategory('ki')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                selectedCategory === 'ki'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              <span>🤖</span> KI-Widgets
            </button>
            <button
              onClick={() => setSelectedCategory('nuetzlich')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                selectedCategory === 'nuetzlich'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              <span>⚡</span> Nützliche Widgets
            </button>
            <button
              onClick={() => setSelectedCategory('andere')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                selectedCategory === 'andere'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              <span>🎨</span> Andere Widgets
            </button>
          </div>

          <div className="relative w-full sm:w-56">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Widget suchen..."
              className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Catalog Grid */}
        <div className="flex-1 p-4 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-3 custom-scrollbar">
          {filteredWidgets.map((w) => {
            const count = activeWidgets.filter((aw) => aw.type === w.type).length;
            return (
              <div
                key={w.type}
                className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between gap-3 group"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 shrink-0">
                    {getIcon(w.icon)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-bold text-white group-hover:text-blue-300 transition-colors">
                        {w.title}
                      </h4>
                      {w.badge && (
                        <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                          {w.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 leading-snug">{w.description}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-800/60 pt-2.5">
                  <span className="text-[10px] text-slate-500 font-medium">
                    {count > 0 ? `${count}x auf Desktop` : 'Noch nicht hinzugefügt'}
                  </span>
                  <button
                    onClick={() => onAddWidget(w)}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md transition-all active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Hinzufügen</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
