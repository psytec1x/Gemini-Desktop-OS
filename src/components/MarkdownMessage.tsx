import React, { useState } from 'react';
import { Copy, Check, ExternalLink, Sparkles } from 'lucide-react';

interface MarkdownMessageProps {
  content: string;
  groundingChunks?: Array<{
    web?: {
      uri: string;
      title: string;
    };
  }>;
}

export const MarkdownMessage: React.FC<MarkdownMessageProps> = ({ content, groundingChunks }) => {
  const [copiedCodeIndex, setCopiedCodeIndex] = useState<number | null>(null);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedCodeIndex(index);
    setTimeout(() => setCopiedCodeIndex(null), 2000);
  };

  // Helper to parse simple codeblocks and format bold / headings
  const renderFormattedContent = (text: string) => {
    const codeBlockRegex = /```([a-zA-Z0-9_+-]*)\n([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;
    let blockIndex = 0;

    while ((match = codeBlockRegex.exec(text)) !== null) {
      const matchIndex = match.index;
      if (matchIndex > lastIndex) {
        parts.push({
          type: 'text',
          content: text.slice(lastIndex, matchIndex),
        });
      }

      parts.push({
        type: 'code',
        language: match[1] || 'code',
        content: match[2].trim(),
        index: blockIndex++,
      });

      lastIndex = matchIndex + match[0].length;
    }

    if (lastIndex < text.length) {
      parts.push({
        type: 'text',
        content: text.slice(lastIndex),
      });
    }

    return parts.map((part, idx) => {
      if (part.type === 'code') {
        return (
          <div key={idx} className="my-3 rounded-lg overflow-hidden border border-slate-700 bg-slate-900 text-slate-100 shadow-lg text-sm font-mono">
            <div className="flex items-center justify-between px-3.5 py-1.5 bg-slate-800 border-b border-slate-700/60 text-xs text-slate-400">
              <span className="font-semibold text-blue-400 uppercase tracking-wider">{part.language}</span>
              <button
                onClick={() => copyToClipboard(part.content, part.index)}
                className="flex items-center gap-1.5 px-2 py-0.5 rounded hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                title="Code kopieren"
              >
                {copiedCodeIndex === part.index ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-green-400" />
                    <span className="text-green-400">Kopiert!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Kopieren</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-4 overflow-x-auto text-xs sm:text-sm leading-relaxed text-slate-200 selection:bg-blue-600">
              <code>{part.content}</code>
            </pre>
          </div>
        );
      }

      // Format inline markdown (headings, bold, lists, inline code)
      return (
        <div key={idx} className="space-y-2 text-slate-100 leading-relaxed text-sm sm:text-base">
          {part.content.split('\n').map((line, lIdx) => {
            const trimmed = line.trim();

            if (trimmed.startsWith('### ')) {
              return (
                <h3 key={lIdx} className="text-base font-bold text-blue-300 mt-3 mb-1 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-400 inline" />
                  {formatInlineText(trimmed.replace('### ', ''))}
                </h3>
              );
            }
            if (trimmed.startsWith('## ')) {
              return (
                <h2 key={lIdx} className="text-lg font-bold text-white mt-4 mb-2 pb-1 border-b border-slate-700/60">
                  {formatInlineText(trimmed.replace('## ', ''))}
                </h2>
              );
            }
            if (trimmed.startsWith('# ')) {
              return (
                <h1 key={lIdx} className="text-xl font-extrabold text-white mt-4 mb-2">
                  {formatInlineText(trimmed.replace('# ', ''))}
                </h1>
              );
            }
            if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
              return (
                <div key={lIdx} className="flex items-start gap-2.5 ml-2 my-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 shrink-0" />
                  <span>{formatInlineText(trimmed.substring(2))}</span>
                </div>
              );
            }

            if (!trimmed) {
              return <div key={lIdx} className="h-1.5" />;
            }

            return <p key={lIdx}>{formatInlineText(line)}</p>;
          })}
        </div>
      );
    });
  };

  const formatInlineText = (text: string) => {
    // Bold **text**
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);

    return parts.map((sub, i) => {
      if (sub.startsWith('**') && sub.endsWith('**')) {
        return <strong key={i} className="font-semibold text-white">{sub.slice(2, -2)}</strong>;
      }
      if (sub.startsWith('`') && sub.endsWith('`')) {
        return (
          <code key={i} className="px-1.5 py-0.5 rounded bg-slate-800 text-blue-300 font-mono text-xs border border-slate-700/50">
            {sub.slice(1, -1)}
          </code>
        );
      }
      return sub;
    });
  };

  return (
    <div className="space-y-3">
      {renderFormattedContent(content)}

      {groundingChunks && groundingChunks.length > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-800/80">
          <div className="text-xs font-semibold text-slate-400 mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Google Suche Quellen:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {groundingChunks.map((chunk, index) => {
              if (!chunk.web?.uri) return null;
              return (
                <a
                  key={index}
                  href={chunk.web.uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800/90 hover:bg-slate-700/80 text-xs text-blue-300 hover:text-blue-200 border border-slate-700/60 transition-colors"
                >
                  <span className="truncate max-w-[180px]">{chunk.web.title || chunk.web.uri}</span>
                  <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
                </a>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
