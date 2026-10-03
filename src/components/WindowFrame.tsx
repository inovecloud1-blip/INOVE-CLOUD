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
          className={`fixed flex flex-col rounded-2xl overflow-hidden select-none will-change-transform ${
            safeWindow.isMaximized ? 'rounded-none border-x-0 border-t-0' : ''
          }`}
        >
          {/* Specular Ambient Glow & Acrylic Glass Container */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#101424]/90 via-[#0a0d18]/92 to-[#060810]/95 backdrop-blur-3xl -z-10" />
          <div className="absolute inset-0 rounded-2xl border border-white/20 pointer-events-none shadow-[inset_0_1.5px_0_rgba(255,255,255,0.35),inset_0_-1px_0_rgba(0,0,0,0.5),0_28px_70px_-10px_rgba(0,0,0,0.85),0_0_40px_rgba(56,189,248,0.06)]" />

          {/* High-Refraction Window Titlebar */}
          <div
            onMouseDown={handleMouseDown}
            onDoubleClick={() => {
              playPop('click');
              onToggleMaximize();
            }}
            className="h-11 bg-gradient-to-b from-white/[0.12] to-transparent border-b border-white/10 flex items-center justify-between px-4 cursor-grab active:cursor-grabbing shrink-0 select-none relative"
          >
            {/* Left: Authentic Jewel-like Traffic light control buttons */}
            <div className="flex items-center space-x-2.5 group/buttons">
              {/* Close (Red Jewel) */}
              <motion.button
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.88 }}
                onClick={(e) => {
                  e.stopPropagation();
                  playPop('off');
                  onClose();
                }}
                className="w-3.5 h-3.5 rounded-full bg-gradient-to-b from-[#ff6b62] to-[#e0443e] border border-black/30 flex items-center justify-center text-[#4a0000] shadow-[inset_0_1px_1px_rgba(255,255,255,0.7),0_1px_3px_rgba(0,0,0,0.4)] transition cursor-pointer relative overflow-hidden"
                title="Fechar Janela"
              >
                <div className="absolute top-0 inset-x-0 h-1 bg-white/40 rounded-t-full pointer-events-none" />
                <X className="w-2.5 h-2.5 opacity-0 group-hover/buttons:opacity-100 transition-opacity stroke-[2.5]" />
              </motion.button>

              {/* Minimize (Amber Jewel) */}
              <motion.button
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.88 }}
                onClick={(e) => {
                  e.stopPropagation();
                  playPop('off');
                  onMinimize();
                }}
                className="w-3.5 h-3.5 rounded-full bg-gradient-to-b from-[#ffc936] to-[#d99818] border border-black/30 flex items-center justify-center text-[#5c3e00] shadow-[inset_0_1px_1px_rgba(255,255,255,0.7),0_1px_3px_rgba(0,0,0,0.4)] transition cursor-pointer relative overflow-hidden"
                title="Minimizar"
              >
                <div className="absolute top-0 inset-x-0 h-1 bg-white/40 rounded-t-full pointer-events-none" />
                <Minus className="w-2.5 h-2.5 opacity-0 group-hover/buttons:opacity-100 transition-opacity stroke-[2.5]" />
              </motion.button>

              {/* Maximize (Emerald Jewel) */}
              <motion.button
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.88 }}
                onClick={(e) => {
                  e.stopPropagation();
                  playPop('on');
                  onToggleMaximize();
                }}
                className="w-3.5 h-3.5 rounded-full bg-gradient-to-b from-[#34d84c] to-[#1fac33] border border-black/30 flex items-center justify-center text-[#00420d] shadow-[inset_0_1px_1px_rgba(255,255,255,0.7),0_1px_3px_rgba(0,0,0,0.4)] transition cursor-pointer relative overflow-hidden"
                title={safeWindow.isMaximized ? 'Restaurar' : 'Maximizar'}
              >
                <div className="absolute top-0 inset-x-0 h-1 bg-white/40 rounded-t-full pointer-events-none" />
                {safeWindow.isMaximized ? (
                  <Minimize2 className="w-2 h-2 opacity-0 group-hover/buttons:opacity-100 transition-opacity stroke-[2.5]" />
                ) : (
                  <Maximize2 className="w-2 h-2 opacity-0 group-hover/buttons:opacity-100 transition-opacity stroke-[2.5]" />
                )}
              </motion.button>
            </div>

            {/* Center: Title and App Icon with Frosted Optical Capsule */}
            <div className="flex items-center space-x-2 px-3 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs font-semibold text-slate-100 tracking-wide pointer-events-none truncate max-w-[55%] shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
              {icon && <span className="opacity-90 shrink-0 text-cyan-400">{icon}</span>}
              <span className="truncate">{safeWindow.title}</span>
            </div>

            {/* Right: Custom window header actions */}
            <div className="flex items-center space-x-2">
              {headerRightContent}
            </div>
          </div>

          {/* Window Body Content with Error Boundary */}
          <div className="flex-1 overflow-auto p-0 bg-transparent text-slate-100 flex flex-col relative">
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
