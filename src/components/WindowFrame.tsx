import React, { useRef, useState } from 'react';
import { Minus, Square, X, Maximize2, Minimize2 } from 'lucide-react';
import { WindowState } from '../types';

interface WindowFrameProps {
  window: WindowState;
  icon?: React.ReactNode;
  onClose: () => void;
  onMinimize: () => void;
  onToggleMaximize: () => void;
  onFocus: () => void;
  onMove: (pos: { x: number; y: number }) => void;
  children: React.ReactNode;
  headerRightContent?: React.ReactNode;
}

export const WindowFrame: React.FC<WindowFrameProps> = ({
  window,
  icon,
  onClose,
  onMinimize,
  onToggleMaximize,
  onFocus,
  onMove,
  children,
  headerRightContent,
}) => {
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0, winX: 0, winY: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    onFocus();
    // Only allow drag on left click and if not maximized
    if (e.button !== 0 || window.isMaximized) return;

    isDraggingRef.current = true;
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      winX: window.position.x,
      winY: window.position.y,
    };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const dx = moveEvent.clientX - dragStartRef.current.x;
      const dy = moveEvent.clientY - dragStartRef.current.y;
      const nextX = Math.max(0, Math.min(document.documentElement.clientWidth - 200, dragStartRef.current.winX + dx));
      const nextY = Math.max(32, Math.min(document.documentElement.clientHeight - 80, dragStartRef.current.winY + dy));
      onMove({ x: nextX, y: nextY });
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  if (!window.isOpen || window.isMinimized) {
    return null;
  }

  const windowStyle = window.isMaximized
    ? {
        top: '32px',
        left: '0px',
        width: '100vw',
        height: 'calc(100vh - 32px - 76px)',
        zIndex: window.zIndex,
      }
    : {
        top: `${window.position.y}px`,
        left: `${window.position.x}px`,
        width: `${window.size.width}px`,
        height: `${window.size.height}px`,
        maxWidth: '96vw',
        maxHeight: '84vh',
        zIndex: window.zIndex,
      };

  return (
    <div
      onMouseDown={onFocus}
      style={windowStyle}
      className={`fixed flex flex-col liquid-glass rounded-2xl border border-white/25 mac-window-shadow overflow-hidden transition-all duration-150 select-none ${
        window.isMaximized ? 'rounded-none border-x-0 border-t-0' : ''
      }`}
    >
      {/* macOS Window Titlebar with Liquid Refraction */}
      <div
        onMouseDown={handleMouseDown}
        onDoubleClick={onToggleMaximize}
        className="h-10 bg-white/5 border-b border-white/15 flex items-center justify-between px-3.5 cursor-grab active:cursor-grabbing shrink-0 select-none backdrop-blur-md"
      >
        {/* Left: Traffic light control buttons */}
        <div className="flex items-center space-x-2 group">
          {/* Close (Red) */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E] flex items-center justify-center text-black/60 hover:text-black transition"
            title="Fechar"
          >
            <X className="w-2 h-2 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>

          {/* Minimize (Yellow) */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMinimize();
            }}
            className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123] flex items-center justify-center text-black/60 hover:text-black transition"
            title="Minimizar"
          >
            <Minus className="w-2 h-2 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>

          {/* Maximize (Green) */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleMaximize();
            }}
            className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29] flex items-center justify-center text-black/60 hover:text-black transition"
            title={window.isMaximized ? 'Restaurar tamanho' : 'Maximizar'}
          >
            {window.isMaximized ? (
              <Minimize2 className="w-2 h-2 opacity-0 group-hover:opacity-100 transition-opacity" />
            ) : (
              <Maximize2 className="w-2 h-2 opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
          </button>
        </div>

        {/* Center: Title and App Icon */}
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-200 tracking-wide pointer-events-none truncate max-w-[50%]">
          {icon && <span className="opacity-80">{icon}</span>}
          <span className="truncate">{window.title}</span>
        </div>

        {/* Right: Custom window header actions if any */}
        <div className="flex items-center space-x-2">
          {headerRightContent}
        </div>
      </div>

      {/* Window Body Content */}
      <div className="flex-1 overflow-auto p-0 bg-slate-950/70 text-slate-100 flex flex-col">
        {children}
      </div>
    </div>
  );
};
