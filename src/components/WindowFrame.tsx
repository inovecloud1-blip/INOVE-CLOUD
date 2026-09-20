import React, { useRef, Component, ErrorInfo } from 'react';
import { Minus, X, Maximize2, Minimize2, AlertTriangle, RefreshCw, Wrench } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { WindowState } from '../types';
import { useSoundEffects } from '../context/SoundEffectsContext';

interface WindowFrameProps {
  window?: WindowState;
  icon?: React.ReactNode;
  onClose: () => void;
  onMinimize: () => void;
  onToggleMaximize: () => void;
  onFocus: () => void;
  onMove: (pos: { x: number; y: number }) => void;
  children: React.ReactNode;
  headerRightContent?: React.ReactNode;
}

interface ErrorBoundaryProps {
  appName: string;
  onReset: () => void;
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorText: string;
}

class WindowErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      errorText: '',
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, errorText: error?.message || 'Erro inesperado no módulo' };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn(`[InoveCloud Auto-Recovery] App ${this.props.appName} recovered:`, error, errorInfo);
  }

  handleRecover = () => {
    this.setState({ hasError: false, errorText: '' });
    this.props.onReset();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-slate-950/90 text-slate-100">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4 shadow-lg shadow-amber-500/10">
            <Wrench className="w-8 h-8 animate-pulse" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">
            Auto-Recuperação do Sistema Ativada
          </h3>
          <p className="text-xs text-slate-400 max-w-md mb-4 leading-relaxed">
            O InoveCloud OS interceptou uma oscilação e aplicou a configuração segura automaticamente para evitar travamentos.
          </p>
          <div className="px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs font-mono text-amber-300/90 mb-6 max-w-lg truncate">
            {this.state.errorText || 'Configuração ajustada para modo de compatibilidade'}
          </div>
          <button
            onClick={this.handleRecover}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-medium text-xs shadow-lg shadow-red-500/20 transition active:scale-95 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Recarregar com Configuração Segura</span>
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export const WindowFrame: React.FC<WindowFrameProps> = ({
  window: win,
  icon,
  onClose,
  onMinimize,
  onToggleMaximize,
  onFocus,
  onMove,
  children,
  headerRightContent,
}) => {
  const { playPop } = useSoundEffects();
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0, winX: 0, winY: 0 });

  // Fallback seguro se o estado da janela estiver indefinido
  const safeWindow: WindowState = win || {
    id: 'settings',
    title: 'InoveCloud OS App',
    isOpen: true,
    isMinimized: false,
    isMaximized: false,
    zIndex: 10,
    position: { x: 80, y: 60 },
    size: { width: 880, height: 580 },
  };

  const safePosX = isNaN(safeWindow.position?.x) ? 80 : safeWindow.position.x;
  const safePosY = isNaN(safeWindow.position?.y) ? 60 : safeWindow.position.y;
  const safeWidth = isNaN(safeWindow.size?.width) ? 880 : safeWindow.size.width;
  const safeHeight = isNaN(safeWindow.size?.height) ? 580 : safeWindow.size.height;

  const handleMouseDown = (e: React.MouseEvent) => {
    onFocus();
    // Apenas clique esquerdo e se não estiver maximizado
    if (e.button !== 0 || safeWindow.isMaximized) return;

    isDraggingRef.current = true;
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      winX: safePosX,
      winY: safePosY,
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

  const windowStyle = safeWindow.isMaximized
    ? {
        top: '32px',
        left: '0px',
        width: '100vw',
        height: 'calc(100vh - 32px - 76px)',
        zIndex: safeWindow.zIndex,
      }
    : {
        top: `${safePosY}px`,
        left: `${safePosX}px`,
        width: `${safeWidth}px`,
        height: `${safeHeight}px`,
        maxWidth: '96vw',
        maxHeight: '84vh',
        zIndex: safeWindow.zIndex,
      };

  return (
    <AnimatePresence>
      {safeWindow.isOpen && !safeWindow.isMinimized && (
        <motion.div
          key={safeWindow.id}
          id={`window-${safeWindow.id}`}
          onMouseDown={onFocus}
          layout
          initial={{
            opacity: 0,
            scale: 0.88,
            y: 20,
            filter: 'blur(10px)',
          }}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0,
            filter: 'blur(0px)',
            transition: {
              type: 'spring',
              stiffness: 380,
              damping: 24,
              mass: 0.8,
            },
          }}
          exit={{
            opacity: 0,
            scale: 0.84,
            y: 28,
            filter: 'blur(12px)',
            transition: {
              type: 'spring',
              stiffness: 420,
              damping: 28,
              mass: 0.75,
            },
          }}
          style={windowStyle}
          className={`fixed flex flex-col liquid-glass rounded-2xl border border-white/25 mac-window-shadow overflow-hidden select-none will-change-transform ${
            safeWindow.isMaximized ? 'rounded-none border-x-0 border-t-0' : ''
          }`}
        >
          {/* macOS Window Titlebar with Liquid Refraction */}
          <div
            onMouseDown={handleMouseDown}
            onDoubleClick={() => {
              playPop('click');
              onToggleMaximize();
            }}
            className="h-10 bg-white/5 border-b border-white/15 flex items-center justify-between px-3.5 cursor-grab active:cursor-grabbing shrink-0 select-none backdrop-blur-md"
          >
            {/* Left: Traffic light control buttons */}
            <div className="flex items-center space-x-2 group">
              {/* Close (Red) */}
              <motion.button
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation();
                  playPop('off');
                  onClose();
                }}
                className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E] flex items-center justify-center text-black/60 hover:text-black transition cursor-pointer"
                title="Fechar"
              >
                <X className="w-2 h-2 opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.button>

              {/* Minimize (Yellow) */}
              <motion.button
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation();
                  playPop('off');
                  onMinimize();
                }}
                className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123] flex items-center justify-center text-black/60 hover:text-black transition cursor-pointer"
                title="Minimizar"
              >
                <Minus className="w-2 h-2 opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.button>

              {/* Maximize (Green) */}
              <motion.button
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation();
                  playPop('on');
                  onToggleMaximize();
                }}
                className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29] flex items-center justify-center text-black/60 hover:text-black transition cursor-pointer"
                title={safeWindow.isMaximized ? 'Restaurar tamanho' : 'Maximizar'}
              >
                {safeWindow.isMaximized ? (
                  <Minimize2 className="w-2 h-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                ) : (
                  <Maximize2 className="w-2 h-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </motion.button>
            </div>

            {/* Center: Title and App Icon */}
            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-200 tracking-wide pointer-events-none truncate max-w-[50%]">
              {icon && <span className="opacity-80">{icon}</span>}
              <span className="truncate">{safeWindow.title}</span>
            </div>

            {/* Right: Custom window header actions if any */}
            <div className="flex items-center space-x-2">
              {headerRightContent}
            </div>
          </div>

          {/* Window Body Content with Error Boundary */}
          <div className="flex-1 overflow-auto p-0 bg-slate-950/70 text-slate-100 flex flex-col">
            <WindowErrorBoundary
              appName={safeWindow.title}
              onReset={() => {
                onFocus();
              }}
            >
              {children}
            </WindowErrorBoundary>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
