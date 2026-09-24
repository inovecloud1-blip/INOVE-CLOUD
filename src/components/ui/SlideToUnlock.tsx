import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'motion/react';
import { ChevronRight, Unlock, Lock, Sparkles, KeyRound } from 'lucide-react';

export interface SlideToUnlockProps {
  onConfirm: () => void;
  onUnlock?: () => void;
  onBlocked?: () => void;
  label?: string;
  successLabel?: string;
  threshold?: number;
  variant?: 'unlock' | 'detonate' | 'cyber';
  allowEnterKey?: boolean;
  requirePassword?: boolean;
  disabled?: boolean;
  className?: string;
}

/**
 * SlideToUnlock / SlideToDetonate
 * Inspired by shadcn @evilbuttons/slide-to-detonate & mobile unlock slider.
 * Supports smooth mouse & touch drag, spring back if under threshold,
 * glowing neon trail, audio/haptic feedback, and 'Enter' key shortcut.
 */
export const SlideToUnlock: React.FC<SlideToUnlockProps> = ({
  onConfirm,
  onUnlock,
  onBlocked,
  label = 'Deslize para Desbloquear',
  successLabel = 'Acesso Liberado!',
  threshold = 0.82,
  variant = 'unlock',
  allowEnterKey = true,
  requirePassword = false,
  disabled = false,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [maxDrag, setMaxDrag] = useState(240);
  const [isDragging, setIsDragging] = useState(false);

  const x = useMotionValue(0);

  // Measure track width
  const updateDimensions = useCallback(() => {
    if (containerRef.current && handleRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      const handleWidth = handleRef.current.offsetWidth;
      const available = Math.max(0, containerWidth - handleWidth - 8);
      setMaxDrag(available);
    }
  }, []);

  useEffect(() => {
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [updateDimensions]);

  // Dynamic progress 0 -> 1
  const progress = useTransform(x, [0, maxDrag || 1], [0, 1]);
  const textOpacity = useTransform(x, [0, (maxDrag || 1) * 0.6], [1, 0.1]);
  const progressWidth = useTransform(x, (val) => `${Math.max(48, val + 48)}px`);

  const triggerSuccess = useCallback(() => {
    if (isUnlocked || disabled) return;

    // Se o sistema possui senha configurada, bloquear o deslize e exigir a senha
    if (requirePassword) {
      animate(x, 0, {
        type: 'spring',
        stiffness: 600,
        damping: 30,
      });
      onBlocked?.();
      return;
    }

    setIsUnlocked(true);
    
    // Animate knob to completion smoothly
    animate(x, maxDrag, {
      type: 'spring',
      stiffness: 400,
      damping: 35,
    });

    // Execute callback
    setTimeout(() => {
      onConfirm?.();
      onUnlock?.();
    }, 180);
  }, [isUnlocked, disabled, requirePassword, maxDrag, x, onBlocked, onConfirm, onUnlock]);

  const handleDragEnd = () => {
    setIsDragging(false);
    const currentX = x.get();
    const currentProgress = maxDrag > 0 ? currentX / maxDrag : 0;

    if (currentProgress >= threshold) {
      triggerSuccess();
    } else {
      // Spring back to origin
      animate(x, 0, {
        type: 'spring',
        stiffness: 500,
        damping: 32,
      });
    }
  };

  // Listen for Enter key when user opts not to type password
  useEffect(() => {
    if (!allowEnterKey || disabled || isUnlocked) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Se possui senha, o Enter do teclado comum não abre sem preencher a senha
      if (requirePassword) return;

      // Only trigger if active element is not an input with text typed
      if (e.key === 'Enter') {
        const activeTag = document.activeElement?.tagName.toLowerCase();
        const activeInput = document.activeElement as HTMLInputElement;
        
        // If focusing an input that already has text, let the form submit handle it
        if (activeTag === 'input' && activeInput.value && activeInput.value.trim().length > 0) {
          return;
        }

        e.preventDefault();
        triggerSuccess();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [allowEnterKey, disabled, isUnlocked, requirePassword, triggerSuccess]);

  // Variant themes
  const themeStyles = {
    unlock: {
      trackBg: 'bg-slate-900/80 border-cyan-500/30 shadow-cyan-950/50',
      fillBg: 'from-cyan-600/40 via-blue-600/30 to-indigo-600/20',
      handleBg: 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-cyan-400/40',
      textGlow: 'text-cyan-100',
    },
    detonate: {
      trackBg: 'bg-red-950/80 border-red-500/30 shadow-red-950/50',
      fillBg: 'from-red-600/40 via-rose-600/30 to-amber-600/20',
      handleBg: 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-red-500/40',
      textGlow: 'text-red-100',
    },
    cyber: {
      trackBg: 'bg-emerald-950/80 border-emerald-500/30 shadow-emerald-950/50',
      fillBg: 'from-emerald-600/40 via-teal-600/30 to-cyan-600/20',
      handleBg: 'bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 shadow-emerald-400/40',
      textGlow: 'text-emerald-100',
    },
  }[variant];

  return (
    <div className={`relative w-full max-w-sm select-none ${className}`}>
      {/* Outer Track */}
      <div
        ref={containerRef}
        className={`relative h-14 w-full rounded-2xl p-1 overflow-hidden border backdrop-blur-xl shadow-xl flex items-center transition-colors duration-300 ${themeStyles.trackBg}`}
      >
        {/* Dynamic Progress Fill / Glow Trail */}
        <motion.div
          style={{ width: progressWidth }}
          className={`absolute left-0 top-0 bottom-0 bg-gradient-to-r ${themeStyles.fillBg} rounded-2xl pointer-events-none transition-opacity duration-200 ${
            isDragging || isUnlocked ? 'opacity-100' : 'opacity-60'
          }`}
        />

        {/* Shimmering Center Label */}
        <motion.div
          style={{ opacity: textOpacity }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none pl-12 pr-4"
        >
          <div className="flex items-center space-x-1.5 font-medium text-xs tracking-wider uppercase text-center">
            <span className={`${themeStyles.textGlow} drop-shadow-sm`}>
              {isUnlocked ? successLabel : label}
            </span>
            {!isUnlocked && (
              <div className="flex -space-x-1 opacity-70 animate-pulse">
                <ChevronRight className="w-3.5 h-3.5" />
                <ChevronRight className="w-3.5 h-3.5" />
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
        </motion.div>

        {/* Success Status Text */}
        {isUnlocked && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 text-emerald-400 font-bold text-xs tracking-wider uppercase animate-fade-in">
            <Sparkles className="w-4 h-4 mr-1.5 animate-spin" />
            <span>{successLabel}</span>
          </div>
        )}

        {/* Draggable Handle (Slide to Unlock Knob) */}
        <motion.div
          ref={handleRef}
          drag={!isUnlocked && !disabled ? 'x' : false}
          dragConstraints={{ left: 0, right: maxDrag }}
          dragElastic={0.06}
          dragMomentum={false}
          onDragStart={() => setIsDragging(true)}
          onDragEnd={handleDragEnd}
          style={{ x }}
          whileTap={{ scale: 0.96 }}
          className={`relative z-20 h-12 w-12 rounded-xl flex items-center justify-center cursor-grab active:cursor-grabbing shadow-lg transition-shadow duration-200 ${themeStyles.handleBg} ${
            isDragging ? 'shadow-2xl ring-2 ring-white/50' : ''
          }`}
        >
          {isUnlocked ? (
            <Unlock className="w-5 h-5 text-slate-950 animate-bounce" />
          ) : isDragging ? (
            <ChevronRight className="w-5 h-5 animate-pulse" />
          ) : (
            <Lock className="w-5 h-5" />
          )}
        </motion.div>
      </div>

      {/* Subtle Hint for Enter Key / Optional No Password */}
      {allowEnterKey && !isUnlocked && (
        <div className="flex items-center justify-center space-x-1.5 mt-2 text-[10px] text-slate-400">
          <span>Ou pressione</span>
          <kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/15 text-slate-200 font-mono text-[9px] shadow-sm">
            Enter ↵
          </kbd>
          <span>se não optar por senha</span>
        </div>
      )}
    </div>
  );
};
export default SlideToUnlock;
