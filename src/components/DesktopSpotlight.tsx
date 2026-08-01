import React, { useState, useEffect, useRef } from 'react';
import { Search, Sparkles, X, ArrowRight, CornerDownLeft, Loader2 } from 'lucide-react';

interface DesktopSpotlightProps {
  isOpen: boolean;
  onClose: () => void;
  onSendToFullChat: (prompt: string, answer: string) => void;
}

export const DesktopSpotlight: React.FC<DesktopSpotlightProps> = ({
  isOpen,
  onClose,
  onSendToFullChat,
}) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [quickAnswer, setQuickAnswer] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setPrompt('');
      setQuickAnswer(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || loading) return;

    setLoading(true);
    setQuickAnswer(null);

    try {
      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: prompt,
          model: 'gemini-3.6-flash',
          systemInstruction: 'Du bist Gemini Schnell-Assistent. Antworte in 2-3 präzisen Sätzen auf Deutsch.',
        }),
      });

      const data = await res.json();
      if (data.error) {
        setQuickAnswer('Fehler: ' + data.error);
      } else {
        setQuickAnswer(data.text);
      }
    } catch (e: any) {
      setQuickAnswer('Verbindungsfehler zur Gemini API.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-start justify-center pt-24 px-4 select-none animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-100 ring-1 ring-blue-500/30"
      >
        {/* Spotlight Header Input */}
        <form onSubmit={handleSubmit} className="flex items-center px-4 py-3 bg-slate-950/80 border-b border-slate-800 gap-3">
          <Sparkles className="w-5 h-5 text-blue-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Frag Gemini (z.B. 'Erkläre Quantencomputing', 'Schreibe eine E-Mail')..."
            className="flex-1 bg-transparent text-sm sm:text-base text-white placeholder-slate-500 focus:outline-none"
          />
          {loading ? (
            <Loader2 className="w-5 h-5 text-blue-400 animate-spin shrink-0" />
          ) : (
            <button
              type="submit"
              disabled={!prompt.trim()}
              className="p-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white transition-colors"
            >
              <CornerDownLeft className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Answer View */}
        {quickAnswer ? (
          <div className="p-4 space-y-3 bg-slate-900 max-h-80 overflow-y-auto">
            <div className="text-xs font-semibold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Gemini Schnell-Antwort:</span>
            </div>
            <div className="text-sm text-slate-200 leading-relaxed font-sans whitespace-pre-line">
              {quickAnswer}
            </div>
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => {
                  onSendToFullChat(prompt, quickAnswer);
                  onClose();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 text-xs font-semibold transition-colors"
              >
                <span>Im Desktop Chat öffnen</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-slate-950/40 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">Enter</span>
              <span>Absenden</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">ESC</span>
              <span>Schließen</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
