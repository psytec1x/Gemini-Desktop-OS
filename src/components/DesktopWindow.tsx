import React, { useState, useRef } from 'react';
import { Minus, Square, Copy, X, Sparkles, Pin, Maximize2 } from 'lucide-react';

interface DesktopWindowProps {
  title: string;
  icon?: React.ReactNode;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  position: { x: number; y: number };
  size: { width: number; height: number };
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onFocus: () => void;
  onPositionChange: (pos: { x: number; y: number }) => void;
  onSizeChange?: (size: { width: number; height: number }) => void;
  children: React.ReactNode;
  windowStyle?: 'windows' | 'mac';
  zIndex?: number;
}

export const DesktopWindow: React.FC<DesktopWindowProps> = ({
  title,
  icon,
  isOpen,
  isMinimized,
  isMaximized,
  position,
  size,
  onClose,
  onMinimize,
  onMaximize,
  onFocus,
  onPositionChange,
  onSizeChange,
  children,
  windowStyle = 'windows',
  zIndex = 10,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  const dragStartRef = useRef<{ mouseX: number; mouseY: number; windowX: number; windowY: number }>({
    mouseX: 0,
    mouseY: 0,
    windowX: position.x,
    windowY: position.y,
  });

  if (!isOpen || isMinimized) return null;

  const handleMouseDown = (e: React.MouseEvent) => {
    onFocus();
    if (isMaximized) return;
    setIsDragging(true);
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      windowX: position.x,
      windowY: position.y,
    };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - dragStartRef.current.mouseX;
      const dy = moveEvent.clientY - dragStartRef.current.mouseY;
      const newX = Math.max(0, Math.min(window.innerWidth - 300, dragStartRef.current.windowX + dx));
      const newY = Math.max(0, Math.min(window.innerHeight - 100, dragStartRef.current.windowY + dy));
      onPositionChange({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Mouse Window Resizing Handler (Right edge, Bottom edge, Corner)
  const handleResizeStart = (e: React.MouseEvent, direction: 'r' | 'b' | 'se' | 'l') => {
    e.preventDefault();
    e.stopPropagation();
    onFocus();
    if (isMaximized || !onSizeChange) return;

    setIsResizing(true);
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = size.width;
    const startHeight = size.height;
    const startPosX = position.x;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;

      let newW = startWidth;
      let newH = startHeight;

      if (direction === 'r' || direction === 'se') {
        newW = Math.max(360, Math.min(window.innerWidth - startPosX - 10, startWidth + dx));
      }
      if (direction === 'b' || direction === 'se') {
        newH = Math.max(260, Math.min(window.innerHeight - position.y - 48, startHeight + dy));
      }
      if (direction === 'l') {
        const potentialW = startWidth - dx;
        if (potentialW >= 360) {
          newW = potentialW;
          onPositionChange({ x: startPosX + dx, y: position.y });
        }
      }

      onSizeChange({ width: newW, height: newH });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const currentStyle = isMaximized
    ? { top: 0, left: 0, width: '100vw', height: 'calc(100vh - 48px)' }
    : {
        top: `${position.y}px`,
        left: `${position.x}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
      };

  return (
    <div
      onClick={onFocus}
      style={{ ...currentStyle, zIndex }}
      className={`fixed flex flex-col rounded-xl overflow-hidden shadow-2xl transition-shadow duration-200 border border-slate-700/80 bg-slate-900/95 backdrop-blur-md select-none ${
        isDragging ? 'opacity-95 shadow-blue-500/20' : ''
      }`}
    >
      {/* Title Bar */}
      <div
        onMouseDown={handleMouseDown}
        onDoubleClick={onMaximize}
        className="flex items-center justify-between px-3 py-2.5 bg-slate-800/90 border-b border-slate-700/70 cursor-grab active:cursor-grabbing select-none"
      >
        {/* Left Icon & Title */}
        <div className="flex items-center gap-2 text-slate-200 font-medium text-xs sm:text-sm truncate">
          {windowStyle === 'mac' && (
            <div className="flex items-center gap-1.5 mr-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 border border-red-600 flex items-center justify-center group"
              >
                <X className="w-2 h-2 text-red-950 opacity-0 group-hover:opacity-100" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onMinimize();
                }}
                className="w-3 h-3 rounded-full bg-amber-500 hover:bg-amber-600 border border-amber-600 flex items-center justify-center group"
              >
                <Minus className="w-2 h-2 text-amber-950 opacity-0 group-hover:opacity-100" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onMaximize();
                }}
                className="w-3 h-3 rounded-full bg-emerald-500 hover:bg-emerald-600 border border-emerald-600 flex items-center justify-center group"
              >
                <Maximize2 className="w-2 h-2 text-emerald-950 opacity-0 group-hover:opacity-100" />
              </button>
            </div>
          )}

          {icon || <Sparkles className="w-4 h-4 text-blue-400" />}
          <span className="truncate tracking-wide">{title}</span>
        </div>

        {/* Windows Controls Right */}
        {windowStyle === 'windows' && (
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMinimize();
              }}
              className="p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              title="Minimieren"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMaximize();
              }}
              className="p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              title={isMaximized ? 'Wiederherstellen' : 'Maximieren'}
            >
              {isMaximized ? <Copy className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="p-1.5 rounded hover:bg-red-600 text-slate-400 hover:text-white transition-colors ml-1"
              title="Schließen"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Main Window Body Content */}
      <div className="flex-1 overflow-hidden relative flex flex-col bg-slate-950/80 text-slate-100">
        {children}
      </div>

      {/* Mouse Resizing Edge Handles (Only active when not maximized) */}
      {!isMaximized && onSizeChange && (
        <>
          {/* Right edge resize */}
          <div
            onMouseDown={(e) => handleResizeStart(e, 'r')}
            className="absolute top-0 right-0 w-2 h-full cursor-e-resize hover:bg-blue-500/40 transition-colors z-20"
            title="Fensterbreite anpassen"
          />
          {/* Bottom edge resize */}
          <div
            onMouseDown={(e) => handleResizeStart(e, 'b')}
            className="absolute bottom-0 left-0 h-2 w-full cursor-s-resize hover:bg-blue-500/40 transition-colors z-20"
            title="Fensterhöhe anpassen"
          />
          {/* Bottom-Right corner resize */}
          <div
            onMouseDown={(e) => handleResizeStart(e, 'se')}
            className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize flex items-center justify-center text-slate-400 hover:text-blue-400 z-30 group/corner"
            title="Fenstergröße frei ziehen"
          >
            <svg className="w-3 h-3 group-hover/corner:scale-125 transition-transform" viewBox="0 0 6 6" fill="currentColor">
              <path d="M6 6H4V4H6V6ZM6 2H4V0H6V2ZM2 6H0V4H2V6Z" />
            </svg>
          </div>
        </>
      )}
    </div>
  );
};
