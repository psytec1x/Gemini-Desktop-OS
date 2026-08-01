import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
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
  ChevronDown,
  ChevronUp,
  X,
  GripHorizontal,
  RotateCcw,
  Check,
  Plus,
  Trash2,
  Play,
  Pause,
  RefreshCw,
  Search,
  Settings,
  Mic,
  Network,
  LayoutGrid,
  KeyRound,
  Volume2,
  VolumeX,
  Newspaper,
  Terminal,
  ExternalLink,
  Copy,
  Edit2,
} from 'lucide-react';
import { ActiveWidget } from '../../types';
import { saveWidgetStateToFirebase } from '../../lib/firebase';

interface WidgetRendererProps {
  widget: ActiveWidget;
  userId?: string;
  onRemove: (id: string) => void;
  onUpdateWidget: (updated: ActiveWidget) => void;
}

export const WidgetRenderer: React.FC<WidgetRendererProps> = ({
  widget,
  userId,
  onRemove,
  onUpdateWidget,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(widget.isCollapsed || false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(widget.title);
  const [data, setData] = useState<any>(widget.data || {});
  const [isResizing, setIsResizing] = useState(false);

  const updateData = (newData: any) => {
    const updated = { ...data, ...newData };
    setData(updated);
    const updatedWidget = { ...widget, data: updated };
    onUpdateWidget(updatedWidget);
    if (userId) {
      saveWidgetStateToFirebase(userId, widget.id, updated);
    }
  };

  const handleSaveSettings = () => {
    const updatedWidget = { ...widget, title: editedTitle.trim() || widget.title };
    onUpdateWidget(updatedWidget);
    setIsEditing(false);
  };

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = widget.width;
    const startHeight = widget.height;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      const newWidth = Math.max(260, Math.min(800, startWidth + deltaX));
      const newHeight = Math.max(160, Math.min(800, startHeight + deltaY));

      onUpdateWidget({
        ...widget,
        width: newWidth,
        height: newHeight,
      });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const toggleCollapse = () => {
    const nextCollapsed = !isCollapsed;
    setIsCollapsed(nextCollapsed);
    onUpdateWidget({ ...widget, isCollapsed: nextCollapsed });
  };

  return (
    <div
      style={{
        width: `${widget.width}px`,
        height: isCollapsed ? 'auto' : `${widget.height}px`,
      }}
      className={`relative group flex flex-col rounded-2xl bg-slate-900/90 backdrop-blur-md border border-slate-700/60 shadow-xl overflow-hidden transition-shadow duration-200 hover:border-slate-500/80 ${
        isResizing ? 'ring-2 ring-blue-500/80 select-none' : ''
      }`}
    >
      {/* Widget Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-800/80 border-b border-slate-700/50 cursor-grab active:cursor-grabbing">
        <div className="flex items-center gap-2 min-w-0">
          <GripHorizontal className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span className="text-xs font-semibold text-slate-200 truncate">{widget.title}</span>
          {widget.category === 'ki' && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 shrink-0">
              KI
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`p-1 rounded transition-colors ${
              isEditing ? 'bg-blue-600/40 text-blue-300' : 'hover:bg-slate-700/60 text-slate-400 hover:text-white'
            }`}
            title="Widget bearbeiten & Einstellungen"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={toggleCollapse}
            className="p-1 rounded hover:bg-slate-700/60 text-slate-400 hover:text-white transition-colors"
            title={isCollapsed ? 'Ausklappen' : 'Einklappen'}
          >
            {isCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => onRemove(widget.id)}
            className="p-1 rounded hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
            title="Widget entfernen"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Widget Settings Drawer */}
      {isEditing && !isCollapsed && (
        <div className="p-3 bg-slate-950/90 border-b border-slate-800 space-y-2 animate-in fade-in duration-150 text-xs">
          <div className="flex items-center justify-between font-bold text-blue-300">
            <span>Widget Einstellungen</span>
            <button
              onClick={() => setIsEditing(false)}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div>
            <label className="text-[10px] text-slate-400 block mb-1">Widget-Titel anpassen:</label>
            <input
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              onClick={handleSaveSettings}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-xs flex items-center gap-1"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Speichern</span>
            </button>
          </div>
        </div>
      )}

      {/* Widget Content Body */}
      {!isCollapsed && (
        <div className="flex-1 p-3 overflow-y-auto text-xs text-slate-200 custom-scrollbar relative">
          {renderWidgetBody(widget.type, data, updateData)}
        </div>
      )}

      {/* Resize Handle on bottom-right */}
      {!isCollapsed && (
        <div
          onMouseDown={handleResizeStart}
          title="Größe anpassen (Ziehen)"
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize flex items-center justify-center text-slate-500 hover:text-blue-400 transition-colors"
        >
          <svg className="w-2.5 h-2.5" viewBox="0 0 6 6" fill="currentColor">
            <path d="M6 6H4V4H6V6ZM6 2H4V0H6V2ZM2 6H0V4H2V6Z" />
          </svg>
        </div>
      )}
    </div>
  );
};

// Internal Sub-renderers for Each Widget Type
function renderWidgetBody(type: string, data: any, updateData: (newData: any) => void) {
  switch (type) {
    case 'ki-translator':
      return <KiTranslatorContent data={data} updateData={updateData} />;
    case 'ki-voice-notes':
      return <KiVoiceNotesContent data={data} updateData={updateData} />;
    case 'ki-brainstorm':
      return <KiBrainstormContent data={data} updateData={updateData} />;
    case 'ki-code-fixer':
      return <KiCodeFixerContent data={data} updateData={updateData} />;
    case 'ki-summarizer':
      return <KiSummarizerContent data={data} updateData={updateData} />;
    case 'ki-prompt-opt':
      return <KiPromptOptContent data={data} updateData={updateData} />;
    case 'kanban-board':
      return <KanbanBoardContent data={data} updateData={updateData} />;
    case 'password-gen':
      return <PasswordGenContent data={data} updateData={updateData} />;
    case 'sticky-note':
      return <StickyNoteContent data={data} updateData={updateData} />;
    case 'system-monitor':
      return <SystemMonitorContent />;
    case 'todo-list':
      return <TodoListContent data={data} updateData={updateData} />;
    case 'scratchpad':
      return <ScratchpadContent data={data} updateData={updateData} />;
    case 'world-clock':
      return <WorldClockContent />;
    case 'converter':
      return <ConverterContent data={data} updateData={updateData} />;
    case 'calculator':
      return <CalculatorContent data={data} updateData={updateData} />;
    case 'pomodoro':
      return <PomodoroContent data={data} updateData={updateData} />;
    case 'weather-widget':
      return <WeatherContent data={data} updateData={updateData} />;
    case 'quick-links':
      return <QuickLinksContent data={data} updateData={updateData} />;
    case 'ambient-sound':
      return <AmbientSoundContent data={data} updateData={updateData} />;
    case 'news-feed':
      return <NewsFeedContent data={data} updateData={updateData} />;
    default:
      return <div className="p-2 text-slate-400">Widget Inhalt für {type}</div>;
  }
}

// 1. KI Übersetzer Widget
function KiTranslatorContent({ data, updateData }: { data: any; updateData: (d: any) => void }) {
  const [loading, setLoading] = useState(false);

  const handleTranslate = async () => {
    if (!data.inputText?.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Übersetze folgenden Text präzise von ${data.sourceLang || 'Deutsch'} nach ${data.targetLang || 'Englisch'}. Gib NUR die direkte Übersetzung zurück:\n\n${data.inputText}`,
          model: 'gemini-3.6-flash',
        }),
      });
      const json = await res.json();
      updateData({ translatedText: json.text || 'Fehler bei der Übersetzung' });
    } catch (err) {
      updateData({ translatedText: 'Netzwerkfehler' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full gap-2">
      <div className="flex gap-2">
        <select
          value={data.targetLang || 'Englisch'}
          onChange={(e) => updateData({ targetLang: e.target.value })}
          className="bg-slate-800 border border-slate-700 text-xs rounded-lg px-2 py-1 text-slate-200 outline-none flex-1"
        >
          <option value="Englisch">Englisch (US/UK)</option>
          <option value="Französisch">Französisch</option>
          <option value="Spanisch">Spanisch</option>
          <option value="Japanisch">Japanisch</option>
          <option value="Italienisch">Italienisch</option>
          <option value="Chinesisch">Chinesisch</option>
        </select>
        <button
          onClick={handleTranslate}
          disabled={loading}
          className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold text-xs flex items-center gap-1 transition-all"
        >
          {loading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Languages className="w-3 h-3" />}
          <span>Übersetzen</span>
        </button>
      </div>

      <textarea
        value={data.inputText || ''}
        onChange={(e) => updateData({ inputText: e.target.value })}
        placeholder="Text eingeben..."
        className="w-full h-16 bg-slate-950/60 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 outline-none resize-none"
      />

      {data.translatedText && (
        <div className="p-2 bg-blue-950/40 border border-blue-800/50 rounded-lg text-xs text-blue-200 select-text overflow-y-auto max-h-24">
          <div className="text-[10px] text-blue-400 font-bold mb-1 uppercase">Ergebnis:</div>
          {data.translatedText}
        </div>
      )}
    </div>
  );
}

// 2. KI Code-Labor Widget
function KiCodeFixerContent({ data, updateData }: { data: any; updateData: (d: any) => void }) {
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!data.codeSnippet?.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Analysiere und optimiere diesen Code. Finde Syntaxfehler oder Performance-Verbesserungen:\n\n${data.codeSnippet}`,
          model: 'gemini-3.6-flash',
        }),
      });
      const json = await res.json();
      updateData({ explanation: json.text });
    } catch (err) {
      updateData({ explanation: 'Fehler bei der Code-Analyse' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full gap-2">
      <textarea
        value={data.codeSnippet || ''}
        onChange={(e) => updateData({ codeSnippet: e.target.value })}
        placeholder="Code hier einfügen..."
        className="w-full h-20 bg-slate-950 border border-slate-800 rounded-lg p-2 font-mono text-[11px] text-emerald-400 outline-none resize-none"
      />
      <button
        onClick={handleAnalyze}
        disabled={loading}
        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1"
      >
        {loading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Code className="w-3 h-3" />}
        <span>Code mit Gemini prüfen</span>
      </button>

      {data.explanation && (
        <div className="p-2 bg-slate-950 border border-slate-800 rounded-lg text-[11px] text-slate-300 overflow-y-auto max-h-32 select-text">
          {data.explanation}
        </div>
      )}
    </div>
  );
}

// 3. KI Text Zusammenfasser
function KiSummarizerContent({ data, updateData }: { data: any; updateData: (d: any) => void }) {
  const [loading, setLoading] = useState(false);

  const handleSummarize = async () => {
    if (!data.inputText?.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Fasse diesen Text in maximal 3 kurzen Stichpunkten zusammen:\n\n${data.inputText}`,
          model: 'gemini-3.6-flash',
        }),
      });
      const json = await res.json();
      updateData({ summary: json.text });
    } catch (err) {
      updateData({ summary: 'Fehler beim Zusammenfassen' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full gap-2">
      <textarea
        value={data.inputText || ''}
        onChange={(e) => updateData({ inputText: e.target.value })}
        placeholder="Langen Artikel oder Text einfügen..."
        className="w-full h-20 bg-slate-950/60 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 outline-none resize-none"
      />
      <button
        onClick={handleSummarize}
        disabled={loading}
        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1"
      >
        {loading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <FileText className="w-3 h-3" />}
        <span>Zusammenfassung erstellen</span>
      </button>

      {data.summary && (
        <div className="p-2 bg-indigo-950/30 border border-indigo-800/40 rounded-lg text-xs text-indigo-200 select-text overflow-y-auto max-h-24">
          {data.summary}
        </div>
      )}
    </div>
  );
}

// 4. KI Prompt Optimizer
function KiPromptOptContent({ data, updateData }: { data: any; updateData: (d: any) => void }) {
  const [loading, setLoading] = useState(false);

  const handleOptimize = async () => {
    if (!data.promptIdea?.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Optimiere diese Idee für ein KI-Bild/Text-Prompt. Mache es hochdetailliert, atmosphärisch und visuell auf Englisch:\n\n${data.promptIdea}`,
          model: 'gemini-3.6-flash',
        }),
      });
      const json = await res.json();
      updateData({ optimizedPrompt: json.text });
    } catch (err) {
      updateData({ optimizedPrompt: 'Fehler bei Prompt-Optimierung' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full gap-2">
      <input
        type="text"
        value={data.promptIdea || ''}
        onChange={(e) => updateData({ promptIdea: e.target.value })}
        placeholder="Kurze Idee (z.B. Cyberpunk Katze)"
        className="w-full bg-slate-950/60 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 outline-none"
      />
      <button
        onClick={handleOptimize}
        disabled={loading}
        className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1"
      >
        {loading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
        <span>Prompt optimieren</span>
      </button>

      {data.optimizedPrompt && (
        <div className="p-2 bg-purple-950/30 border border-purple-800/40 rounded-lg text-xs text-purple-200 select-text overflow-y-auto max-h-24">
          {data.optimizedPrompt}
        </div>
      )}
    </div>
  );
}

// 5. Desktop Sticky Note
function StickyNoteContent({ data, updateData }: { data: any; updateData: (d: any) => void }) {
  const colors: Record<string, string> = {
    yellow: 'bg-amber-950/40 border-amber-500/30 text-amber-200',
    blue: 'bg-blue-950/40 border-blue-500/30 text-blue-200',
    emerald: 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200',
    purple: 'bg-purple-950/40 border-purple-500/30 text-purple-200',
  };

  const currentColor = data.color || 'yellow';

  return (
    <div className="flex flex-col h-full gap-2">
      <div className="flex items-center gap-1.5 justify-end">
        {['yellow', 'blue', 'emerald', 'purple'].map((c) => (
          <button
            key={c}
            onClick={() => updateData({ color: c })}
            className={`w-3.5 h-3.5 rounded-full border border-white/20 transition-transform ${
              c === 'yellow' ? 'bg-amber-400' : c === 'blue' ? 'bg-blue-400' : c === 'emerald' ? 'bg-emerald-400' : 'bg-purple-400'
            } ${currentColor === c ? 'scale-125 ring-2 ring-white/50' : 'opacity-70 hover:opacity-100'}`}
          />
        ))}
      </div>
      <textarea
        value={data.noteText || ''}
        onChange={(e) => updateData({ noteText: e.target.value })}
        placeholder="Notiz eingeben..."
        className={`w-full flex-1 border rounded-lg p-2.5 text-xs outline-none resize-none font-sans leading-relaxed ${
          colors[currentColor] || colors.yellow
        }`}
      />
    </div>
  );
}

// 6. System Live Monitor
function SystemMonitorContent() {
  const [cpu, setCpu] = useState(24);
  const [ram, setRam] = useState(48);
  const [gpu, setGpu] = useState(38);
  const [gpuTemp, setGpuTemp] = useState(54);
  const [vram, setVram] = useState(3.8);
  const [net, setNet] = useState(1.2);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCpu(Math.floor(15 + Math.random() * 35));
      setRam(Math.floor(45 + Math.random() * 8));
      setGpu(Math.floor(22 + Math.random() * 48));
      setGpuTemp(Math.floor(48 + Math.random() * 16));
      setVram(parseFloat((3.2 + Math.random() * 2.4).toFixed(1)));
      setNet(parseFloat((0.5 + Math.random() * 2.5).toFixed(1)));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-full justify-around gap-2 text-xs">
      {/* CPU */}
      <div>
        <div className="flex justify-between text-[11px] font-medium text-slate-300 mb-0.5">
          <span>CPU Auslastung</span>
          <span className="text-blue-400 font-bold">{cpu}%</span>
        </div>
        <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500"
            style={{ width: `${cpu}%` }}
          />
        </div>
      </div>

      {/* GPU (Neu mit Temp & VRAM!) */}
      <div>
        <div className="flex justify-between text-[11px] font-medium text-slate-300 mb-0.5">
          <span className="flex items-center gap-1">
            <span>GPU Auslastung</span>
            <span className="text-[9px] px-1 py-0.2 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded font-semibold">
              {gpuTemp}°C
            </span>
          </span>
          <span className="text-amber-400 font-bold">{gpu}% ({vram} / 12 GB VRAM)</span>
        </div>
        <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500"
            style={{ width: `${gpu}%` }}
          />
        </div>
      </div>

      {/* RAM */}
      <div>
        <div className="flex justify-between text-[11px] font-medium text-slate-300 mb-0.5">
          <span>Arbeitsspeicher (RAM)</span>
          <span className="text-emerald-400 font-bold">{ram}% (7.6 GB)</span>
        </div>
        <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
            style={{ width: `${ram}%` }}
          />
        </div>
      </div>

      {/* Network */}
      <div>
        <div className="flex justify-between text-[11px] font-medium text-slate-300 mb-0.5">
          <span>Netzwerk Speed</span>
          <span className="text-purple-400 font-bold">{net} MB/s</span>
        </div>
        <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
            style={{ width: `${(net / 4) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// 7. Todo Liste
function TodoListContent({ data, updateData }: { data: any; updateData: (d: any) => void }) {
  const [newTaskText, setNewTaskText] = useState('');
  const tasks = data.tasks || [];

  const addTask = () => {
    if (!newTaskText.trim()) return;
    const updated = [...tasks, { id: 't-' + Date.now(), text: newTaskText.trim(), completed: false }];
    updateData({ tasks: updated });
    setNewTaskText('');
  };

  const toggleTask = (id: string) => {
    const updated = tasks.map((t: any) => (t.id === id ? { ...t, completed: !t.completed } : t));
    updateData({ tasks: updated });
  };

  const deleteTask = (id: string) => {
    const updated = tasks.filter((t: any) => t.id !== id);
    updateData({ tasks: updated });
  };

  const completedCount = tasks.filter((t: any) => t.completed).length;
  const progressPercent = tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div className="flex flex-col h-full gap-2">
      <div className="flex gap-1.5">
        <input
          type="text"
          value={newTaskText}
          onChange={(e) => setNewTaskText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addTask()}
          placeholder="Neue Aufgabe..."
          className="flex-1 bg-slate-950/60 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 outline-none"
        />
        <button
          onClick={addTask}
          className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
        <div className="bg-emerald-500 h-full transition-all duration-300" style={{ width: `${progressPercent}%` }} />
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col gap-1.5 pr-1">
        {tasks.map((t: any) => (
          <div
            key={t.id}
            onClick={() => toggleTask(t.id)}
            className="flex items-center justify-between p-2 rounded-lg bg-slate-950/40 border border-slate-800/80 hover:border-slate-700 cursor-pointer group"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div
                className={`w-4 h-4 rounded flex items-center justify-center border ${
                  t.completed ? 'bg-emerald-500 border-emerald-400 text-white' : 'border-slate-600'
                }`}
              >
                {t.completed && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
              <span className={`text-xs truncate ${t.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                {t.text}
              </span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteTask(t.id);
              }}
              className="text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity p-0.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// 8. World Clock
function WorldClockContent() {
  const [time, setTime] = useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getTimeString = (timeZone: string) => {
    return time.toLocaleTimeString('de-DE', { timeZone, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="grid grid-cols-2 gap-2 h-full items-center">
      <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
        <div className="text-[10px] text-slate-400 font-semibold">Berlin / Paris</div>
        <div className="text-base font-mono font-bold text-blue-400">{getTimeString('Europe/Berlin')}</div>
      </div>
      <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
        <div className="text-[10px] text-slate-400 font-semibold">New York</div>
        <div className="text-base font-mono font-bold text-emerald-400">{getTimeString('America/New_York')}</div>
      </div>
      <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
        <div className="text-[10px] text-slate-400 font-semibold">Tokio</div>
        <div className="text-base font-mono font-bold text-purple-400">{getTimeString('Asia/Tokyo')}</div>
      </div>
      <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
        <div className="text-[10px] text-slate-400 font-semibold">London</div>
        <div className="text-base font-mono font-bold text-amber-400">{getTimeString('Europe/London')}</div>
      </div>
    </div>
  );
}

// 9. Currency & Unit Converter
function ConverterContent({ data, updateData }: { data: any; updateData: (d: any) => void }) {
  const rates: Record<string, number> = { EUR: 1, USD: 1.09, CHF: 0.96, GBP: 0.85 };
  const amount = data.amount || 10;
  const fromCurr = data.fromCurr || 'EUR';
  const toCurr = data.toCurr || 'USD';

  const result = ((amount / (rates[fromCurr] || 1)) * (rates[toCurr] || 1)).toFixed(2);

  return (
    <div className="flex flex-col h-full gap-2 justify-center">
      <div className="flex gap-2">
        <input
          type="number"
          value={amount}
          onChange={(e) => updateData({ amount: parseFloat(e.target.value) || 0 })}
          className="w-24 bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 outline-none"
        />
        <select
          value={fromCurr}
          onChange={(e) => updateData({ fromCurr: e.target.value })}
          className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 outline-none flex-1"
        >
          <option value="EUR">EUR (€)</option>
          <option value="USD">USD ($)</option>
          <option value="CHF">CHF (Fr)</option>
          <option value="GBP">GBP (£)</option>
        </select>
      </div>

      <div className="text-center font-bold text-slate-400 text-xs">⬇ umrechnen in ⬇</div>

      <div className="flex gap-2">
        <div className="w-24 bg-slate-950/80 border border-slate-800 rounded-lg p-2 text-xs font-bold text-emerald-400 flex items-center justify-center">
          {result}
        </div>
        <select
          value={toCurr}
          onChange={(e) => updateData({ toCurr: e.target.value })}
          className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 outline-none flex-1"
        >
          <option value="USD">USD ($)</option>
          <option value="EUR">EUR (€)</option>
          <option value="CHF">CHF (Fr)</option>
          <option value="GBP">GBP (£)</option>
        </select>
      </div>
    </div>
  );
}

// 10. Calculator
function CalculatorContent({ data, updateData }: { data: any; updateData: (d: any) => void }) {
  const display = data.display || '0';

  const pressBtn = (val: string) => {
    if (val === 'C') {
      updateData({ display: '0' });
      return;
    }
    if (val === '=') {
      try {
        // safe evaluate simple math expression
        const clean = display.replace(/×/g, '*').replace(/÷/g, '/');
        const res = Function(`'use strict'; return (${clean})`)();
        updateData({ display: String(res) });
      } catch (e) {
        updateData({ display: 'Fehler' });
      }
      return;
    }
    if (display === '0' || display === 'Fehler') {
      updateData({ display: val });
    } else {
      updateData({ display: display + val });
    }
  };

  const buttons = ['7', '8', '9', '÷', '4', '5', '6', '×', '1', '2', '3', '-', 'C', '0', '=', '+'];

  return (
    <div className="flex flex-col h-full gap-2">
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-right font-mono text-base font-bold text-emerald-400 truncate">
        {display}
      </div>
      <div className="grid grid-cols-4 gap-1.5 flex-1">
        {buttons.map((b) => (
          <button
            key={b}
            onClick={() => pressBtn(b)}
            className={`rounded-lg font-bold text-xs p-2 transition-all active:scale-95 ${
              b === '='
                ? 'bg-blue-600 hover:bg-blue-500 text-white col-span-1'
                : b === 'C'
                ? 'bg-rose-600 hover:bg-rose-500 text-white'
                : ['÷', '×', '-', '+'].includes(b)
                ? 'bg-slate-800 hover:bg-slate-700 text-blue-400'
                : 'bg-slate-950 hover:bg-slate-800 text-slate-200'
            }`}
          >
            {b}
          </button>
        ))}
      </div>
    </div>
  );
}

// 11. Pomodoro Timer
function PomodoroContent({ data, updateData }: { data: any; updateData: (d: any) => void }) {
  const [seconds, setSeconds] = useState(data.secondsLeft || 25 * 60);
  const [isRunning, setIsRunning] = useState(false);

  React.useEffect(() => {
    let timer: any = null;
    if (isRunning && seconds > 0) {
      timer = setInterval(() => setSeconds((s: number) => s - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [isRunning, seconds]);

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const timeStr = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  return (
    <div className="flex flex-col h-full items-center justify-center gap-2">
      <div className="text-3xl font-mono font-bold text-purple-400 tracking-wider">{timeStr}</div>
      <div className="flex gap-2">
        <button
          onClick={() => setIsRunning(!isRunning)}
          className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1"
        >
          {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          <span>{isRunning ? 'Pause' : 'Start'}</span>
        </button>
        <button
          onClick={() => {
            setIsRunning(false);
            setSeconds(25 * 60);
          }}
          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

// 12. Weather Widget
function WeatherContent({ data, updateData }: { data: any; updateData: (d: any) => void }) {
  const city = data.city || 'Berlin';
  return (
    <div className="flex flex-col h-full items-center justify-center gap-2">
      <div className="flex items-center gap-2">
        <CloudSun className="w-8 h-8 text-amber-400" />
        <div>
          <div className="text-xl font-bold text-white">22°C</div>
          <div className="text-[11px] text-slate-400">{city} • Leicht bewölkt</div>
        </div>
      </div>
      <div className="flex gap-2 text-[10px] text-slate-400">
        <span>Wind: 12 km/h</span>
        <span>•</span>
        <span>Feuchte: 45%</span>
      </div>
    </div>
  );
}

// 13. Quick Links (Beliebig viele eigene Favoriten hinzufügen & verwalten)
function QuickLinksContent({ data, updateData }: { data: any; updateData: (d: any) => void }) {
  const [links, setLinks] = useState<Array<{ name: string; url: string; icon?: string }>>(
    data.links || [
      { name: 'Google Search', url: 'https://google.com' },
      { name: 'GitHub', url: 'https://github.com' },
      { name: 'Gemini AI Studio', url: 'https://ai.google.dev' },
      { name: 'YouTube', url: 'https://youtube.com' },
    ]
  );
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newUrl.trim()) return;

    let formattedUrl = newUrl.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = 'https://' + formattedUrl;
    }

    const updated = [...links, { name: newTitle.trim(), url: formattedUrl }];
    setLinks(updated);
    updateData({ links: updated });
    setNewTitle('');
    setNewUrl('');
    setShowAddForm(false);
  };

  const handleDeleteLink = (index: number) => {
    const updated = links.filter((_, i) => i !== index);
    setLinks(updated);
    updateData({ links: updated });
  };

  return (
    <div className="flex flex-col h-full gap-2">
      {/* Top Header Controls */}
      <div className="flex items-center justify-between text-xs pb-1 border-b border-slate-800">
        <span className="text-[11px] text-slate-400 font-medium">
          {links.length} Schnellstart-Favoriten
        </span>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-2 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] flex items-center gap-1 transition-all"
        >
          <Plus className="w-3 h-3" />
          <span>Favorit hinzufügen</span>
        </button>
      </div>

      {/* Inline Form to Add New Favorite Link */}
      {showAddForm && (
        <form onSubmit={handleAddLink} className="p-2.5 rounded-xl bg-slate-950/80 border border-blue-500/40 space-y-2 animate-in fade-in">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Name (z.B. Wikipedia)"
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 outline-none focus:border-blue-500"
            required
          />
          <input
            type="text"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            placeholder="URL (z.B. https://wikipedia.org)"
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 outline-none focus:border-blue-500 font-mono"
            required
          />
          <div className="flex justify-end gap-1.5 pt-1">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
            >
              Speichern
            </button>
          </div>
        </form>
      )}

      {/* List of Custom Links */}
      <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
        {links.map((l: any, idx: number) => (
          <div
            key={idx}
            className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-colors group"
          >
            <a
              href={l.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-xs text-blue-400 font-medium truncate flex-1 hover:underline"
            >
              <Bookmark className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span className="truncate">{l.name}</span>
              <ExternalLink className="w-3 h-3 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>

            <button
              onClick={() => handleDeleteLink(idx)}
              className="p-1 rounded hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100"
              title="Favorit löschen"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// 14. KI Voice Notes & Transkriptor
function KiVoiceNotesContent({ data, updateData }: { data: any; updateData: (d: any) => void }) {
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!data.voiceInput?.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Strukturiere diese Sprachnotiz. Erstelle 1. Kurze Zusammenfassung und 2. Konkrete To-Do Punkte:\n\n${data.voiceInput}`,
          model: 'gemini-3.6-flash',
        }),
      });
      const json = await res.json();
      updateData({ summary: json.text });
    } catch (err) {
      updateData({ summary: 'Fehler bei der Analyse' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full gap-2">
      <div className="flex items-center gap-2">
        <Mic className="w-4 h-4 text-blue-400 shrink-0 animate-pulse" />
        <span className="text-[11px] text-slate-400 font-medium">Sprachnotiz / Diktat:</span>
      </div>
      <textarea
        value={data.voiceInput || ''}
        onChange={(e) => updateData({ voiceInput: e.target.value })}
        placeholder="Sprachnotiz eingeben oder diktieren..."
        className="w-full h-16 bg-slate-950/60 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 outline-none resize-none"
      />
      <button
        onClick={handleAnalyze}
        disabled={loading}
        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5"
      >
        {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
        <span>Mit Gemini auswerten</span>
      </button>
      {data.summary && (
        <div className="p-2 bg-blue-950/40 border border-blue-800/50 rounded-lg text-xs text-blue-200 overflow-y-auto max-h-24 select-text">
          {data.summary}
        </div>
      )}
    </div>
  );
}

// 15. KI Brainstormer & Mindmap
function KiBrainstormContent({ data, updateData }: { data: any; updateData: (d: any) => void }) {
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!data.topic?.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Generiere 5 kreative Unterpunkte / Zweige für ein Mindmap-Thema: "${data.topic}". Gib NUR ein JSON-Array zurück wie ["Zweig 1", "Zweig 2", "Zweig 3", "Zweig 4", "Zweig 5"]`,
          model: 'gemini-3.6-flash',
        }),
      });
      const json = await res.json();
      try {
        const cleanJson = json.text.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanJson);
        updateData({ branches: parsed });
      } catch {
        updateData({ branches: [json.text] });
      }
    } catch {
      updateData({ branches: ['Fehler beim Brainstorming'] });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full gap-2">
      <div className="flex gap-1.5">
        <input
          type="text"
          value={data.topic || ''}
          onChange={(e) => updateData({ topic: e.target.value })}
          placeholder="Hauptthema (z.B. KI App)"
          className="flex-1 bg-slate-950/60 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 outline-none"
        />
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold text-xs shrink-0 flex items-center gap-1"
        >
          {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Network className="w-3.5 h-3.5" />}
          <span>Ideen</span>
        </button>
      </div>
      <div className="flex-1 overflow-y-auto flex flex-wrap gap-1.5 p-1">
        {(data.branches || []).map((b: string, i: number) => (
          <div
            key={i}
            className="px-2.5 py-1.5 rounded-xl bg-purple-950/50 border border-purple-800/60 text-purple-200 text-xs font-semibold flex items-center gap-1.5 shadow-sm"
          >
            <span className="w-2 h-2 rounded-full bg-purple-400" />
            <span>{b}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// 16. Mini Kanban Board
function KanbanBoardContent({ data, updateData }: { data: any; updateData: (d: any) => void }) {
  const [newCardText, setNewCardText] = useState('');
  const [activeTab, setActiveTab] = useState<'todo' | 'inProgress' | 'done'>('todo');

  const todo = data.todo || [];
  const inProgress = data.inProgress || [];
  const done = data.done || [];

  const addCard = () => {
    if (!newCardText.trim()) return;
    updateData({ todo: [...todo, newCardText.trim()] });
    setNewCardText('');
  };

  const moveCard = (from: 'todo' | 'inProgress' | 'done', to: 'todo' | 'inProgress' | 'done', index: number) => {
    const sourceArr = [...(data[from] || [])];
    const [item] = sourceArr.splice(index, 1);
    const destArr = [...(data[to] || []), item];
    updateData({ [from]: sourceArr, [to]: destArr });
  };

  const currentList = activeTab === 'todo' ? todo : activeTab === 'inProgress' ? inProgress : done;

  return (
    <div className="flex flex-col h-full gap-2">
      <div className="flex rounded-lg bg-slate-950 p-1 border border-slate-800 gap-1 text-[11px]">
        <button
          onClick={() => setActiveTab('todo')}
          className={`flex-1 py-1 rounded font-bold transition-all ${
            activeTab === 'todo' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Offen ({todo.length})
        </button>
        <button
          onClick={() => setActiveTab('inProgress')}
          className={`flex-1 py-1 rounded font-bold transition-all ${
            activeTab === 'inProgress' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          In Arbeit ({inProgress.length})
        </button>
        <button
          onClick={() => setActiveTab('done')}
          className={`flex-1 py-1 rounded font-bold transition-all ${
            activeTab === 'done' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Erledigt ({done.length})
        </button>
      </div>

      {activeTab === 'todo' && (
        <div className="flex gap-1">
          <input
            type="text"
            value={newCardText}
            onChange={(e) => setNewCardText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addCard()}
            placeholder="Neue Karte..."
            className="flex-1 bg-slate-950/60 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-200 outline-none"
          />
          <button onClick={addCard} className="px-2 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-xs">
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
        {currentList.map((item: string, idx: number) => (
          <div
            key={idx}
            className="p-2 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs text-slate-200 group"
          >
            <span>{item}</span>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {activeTab !== 'todo' && (
                <button
                  onClick={() => moveCard(activeTab, activeTab === 'done' ? 'inProgress' : 'todo', idx)}
                  className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px]"
                >
                  ←
                </button>
              )}
              {activeTab !== 'done' && (
                <button
                  onClick={() => moveCard(activeTab, activeTab === 'todo' ? 'inProgress' : 'done', idx)}
                  className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px]"
                >
                  →
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 17. Sicherer Passwort Generator
function PasswordGenContent({ data, updateData }: { data: any; updateData: (d: any) => void }) {
  const [copied, setCopied] = useState(false);
  const length = data.length || 16;
  const pass = data.generatedPassword || '';

  const generate = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+';
    let res = '';
    for (let i = 0; i < length; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    updateData({ generatedPassword: res });
  };

  const copyToClipboard = () => {
    if (!pass) return;
    navigator.clipboard.writeText(pass);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex flex-col h-full gap-2 justify-center">
      <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl p-2.5">
        <span className="font-mono text-xs font-bold text-emerald-400 flex-1 truncate">{pass || 'Klicke auf Generieren'}</span>
        <button
          onClick={copyToClipboard}
          className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          title="Kopieren"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>Länge: {length} Zeichen</span>
        <input
          type="range"
          min="8"
          max="32"
          value={length}
          onChange={(e) => updateData({ length: parseInt(e.target.value) })}
          className="w-28 accent-emerald-500 cursor-pointer"
        />
      </div>

      <button
        onClick={generate}
        className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md"
      >
        <KeyRound className="w-3.5 h-3.5" />
        <span>Passwort generieren</span>
      </button>
    </div>
  );
}

// 18. Multi-Tab Code & Text Scratchpad
function ScratchpadContent({ data, updateData }: { data: any; updateData: (d: any) => void }) {
  return (
    <div className="flex flex-col h-full gap-2">
      <textarea
        value={data.content || ''}
        onChange={(e) => updateData({ content: e.target.value })}
        placeholder="// Code oder Notizen eingeben..."
        className="w-full flex-1 bg-slate-950/80 border border-slate-800 rounded-lg p-2.5 font-mono text-[11px] text-blue-300 outline-none resize-none leading-relaxed"
      />
    </div>
  );
}

// 19. Cyber Ambient Sound Generator (mit Prompt-Eingabe & KI Synthesizer)
function AmbientSoundContent({ data, updateData }: { data: any; updateData: (d: any) => void }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [promptInput, setPromptInput] = useState(data.customPrompt || 'Tropischer Regen & sanftes Gewitter');
  const [activeSoundName, setActiveSoundName] = useState(data.soundName || 'Tropischer Regen & Gewitter');
  const [loading, setLoading] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const soundNodesRef = useRef<{ osc?: OscillatorNode; noise?: AudioBufferSourceNode; filter?: BiquadFilterNode; gain?: GainNode } | null>(null);

  // Sound Profile parameters
  const [cutoffFreq, setCutoffFreq] = useState(data.cutoffFreq || 800);
  const [droneFreq, setDroneFreq] = useState(data.droneFreq || 60);

  const stopAudio = () => {
    if (soundNodesRef.current) {
      try {
        soundNodesRef.current.osc?.stop();
        soundNodesRef.current.noise?.stop();
      } catch (e) {
        // Ignore stop errors
      }
      soundNodesRef.current = null;
    }
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
    setIsPlaying(false);
  };

  const startAudio = (cutoff = cutoffFreq, drone = droneFreq) => {
    stopAudio();
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.2, ctx.currentTime);
      masterGain.connect(ctx.destination);

      // Create Noise Generator
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(cutoff, ctx.currentTime);

      whiteNoise.connect(filter);
      filter.connect(masterGain);
      whiteNoise.start();

      // Create Drone Oscillator if frequency > 20
      let osc: OscillatorNode | undefined;
      if (drone > 20) {
        osc = ctx.createOscillator();
        osc.type = drone > 120 ? 'sawtooth' : 'sine';
        osc.frequency.setValueAtTime(drone, ctx.currentTime);
        const oscGain = ctx.createGain();
        oscGain.gain.setValueAtTime(0.15, ctx.currentTime);
        osc.connect(oscGain);
        oscGain.connect(masterGain);
        osc.start();
      }

      soundNodesRef.current = { osc, noise: whiteNoise, filter, gain: masterGain };
      setIsPlaying(true);
    } catch (err) {
      console.error('Audio synthesis failed:', err);
    }
  };

  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  const togglePlay = () => {
    if (isPlaying) {
      stopAudio();
    } else {
      startAudio();
    }
  };

  const handleGeneratePromptSound = async (customText?: string) => {
    const textToUse = customText || promptInput;
    if (!textToUse.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Erstelle für diesen Sound-Wunsch ein Web-Audio Frequenzprofil: "${textToUse}". Gib NUR ein kurzes JSON zurück in diesem Format: {"name": "Titel", "filterCutoff": 600, "droneFreq": 55, "description": "Kurze Beschreibung"}. filterCutoff ist zwischen 200 und 3000 Hz, droneFreq ist zwischen 0 und 200 Hz.`,
          model: 'gemini-3.6-flash',
        }),
      });
      const json = await res.json();
      try {
        const cleanJson = json.text.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanJson);
        const newName = parsed.name || textToUse;
        const newCutoff = parsed.filterCutoff || 800;
        const newDrone = parsed.droneFreq || 60;

        setActiveSoundName(newName);
        setCutoffFreq(newCutoff);
        setDroneFreq(newDrone);

        updateData({
          customPrompt: textToUse,
          soundName: newName,
          cutoffFreq: newCutoff,
          droneFreq: newDrone,
        });

        if (isPlaying) {
          startAudio(newCutoff, newDrone);
        }
      } catch {
        setActiveSoundName(textToUse);
      }
    } catch (err) {
      setActiveSoundName(textToUse);
    } finally {
      setLoading(false);
    }
  };

  const applyPreset = (presetName: string, cutoff: number, drone: number) => {
    setPromptInput(presetName);
    setActiveSoundName(presetName);
    setCutoffFreq(cutoff);
    setDroneFreq(drone);
    updateData({ customPrompt: presetName, soundName: presetName, cutoffFreq: cutoff, droneFreq: drone });
    if (isPlaying) {
      startAudio(cutoff, drone);
    }
  };

  return (
    <div className="flex flex-col h-full gap-2 text-xs">
      {/* Sound Prompt Input */}
      <div className="space-y-1">
        <label className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-blue-400" />
          <span>Eigener Sound-Wunsch / Prompt:</span>
        </label>
        <div className="flex gap-1.5">
          <input
            type="text"
            value={promptInput}
            onChange={(e) => setPromptInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGeneratePromptSound()}
            placeholder="z.B. Meeresrauschen, Gewitter, Sci-Fi Reaktor..."
            className="flex-1 bg-slate-950/80 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 outline-none focus:border-blue-500"
          />
          <button
            onClick={() => handleGeneratePromptSound()}
            disabled={loading}
            className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-xs flex items-center gap-1 shrink-0"
          >
            {loading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
            <span>Erstellen</span>
          </button>
        </div>
      </div>

      {/* Quick Presets */}
      <div className="flex flex-wrap gap-1">
        <button
          onClick={() => applyPreset('🌧️ Tropenregen', 650, 0)}
          className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-[10px] text-slate-300 hover:text-white hover:border-slate-700"
        >
          🌧️ Regen
        </button>
        <button
          onClick={() => applyPreset('⚡ Sturm & Gewitter', 450, 45)}
          className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-[10px] text-slate-300 hover:text-white hover:border-slate-700"
        >
          ⚡ Gewitter
        </button>
        <button
          onClick={() => applyPreset('🔥 Kaminfeuer Knistern', 1200, 0)}
          className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-[10px] text-slate-300 hover:text-white hover:border-slate-700"
        >
          🔥 Kamin
        </button>
        <button
          onClick={() => applyPreset('🌌 Sci-Fi Reaktor', 300, 110)}
          className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-[10px] text-slate-300 hover:text-white hover:border-slate-700"
        >
          🌌 Sci-Fi
        </button>
        <button
          onClick={() => applyPreset('🌊 Meeresbrandung', 550, 30)}
          className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-[10px] text-slate-300 hover:text-white hover:border-slate-700"
        >
          🌊 Wellen
        </button>
      </div>

      {/* Active Sound Indicator & Play Button */}
      <div className="flex-1 bg-slate-950/60 border border-slate-800/80 rounded-xl p-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2 overflow-hidden">
          <Volume2 className={`w-5 h-5 shrink-0 ${isPlaying ? 'text-blue-400 animate-pulse' : 'text-slate-500'}`} />
          <div className="truncate">
            <div className="font-bold text-xs text-white truncate">{activeSoundName}</div>
            <div className="text-[10px] text-slate-400">
              Filter: {cutoffFreq}Hz | Synth: {droneFreq > 0 ? `${droneFreq}Hz` : 'Inaktiv'}
            </div>
          </div>
        </div>

        <button
          onClick={togglePlay}
          className={`px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 shrink-0 shadow-md transition-all active:scale-95 ${
            isPlaying ? 'bg-amber-600 hover:bg-amber-500 text-white' : 'bg-emerald-600 hover:bg-emerald-500 text-white'
          }`}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          <span>{isPlaying ? 'Stopp' : 'Anhoeren'}</span>
        </button>
      </div>
    </div>
  );
}

// 20. Live Tech & KI News Feed
function NewsFeedContent({ data, updateData }: { data: any; updateData: (d: any) => void }) {
  const headlines = [
    { title: 'Google Gemini 3.6 Flash veröffentlicht', time: 'Vor 10 Min', tag: 'KI' },
    { title: 'Neue Desktop Widgets & Custom Favoriten im Fokus', time: 'Vor 1 Std', tag: 'Web' },
    { title: 'Next-Gen Web Audio Synth für Browser Apps', time: 'Vor 3 Std', tag: 'Audio' },
  ];

  return (
    <div className="flex flex-col h-full gap-2">
      <div className="flex items-center justify-between border-b border-slate-800 pb-1">
        <span className="text-[11px] font-bold text-blue-400 flex items-center gap-1">
          <Newspaper className="w-3.5 h-3.5" /> Tech & KI News
        </span>
        <span className="text-[10px] text-emerald-400 font-semibold">Live</span>
      </div>
      <div className="space-y-1.5 flex-1 overflow-y-auto">
        {headlines.map((h, i) => (
          <div key={i} className="p-2 rounded-lg bg-slate-950/50 border border-slate-800 hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between">
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-500/20 text-blue-300">{h.tag}</span>
              <span className="text-[10px] text-slate-500">{h.time}</span>
            </div>
            <div className="text-xs font-semibold text-slate-200 mt-1">{h.title}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
