import React from 'react';
import { motion } from 'motion/react';
import { useSoundEffects } from '../../context/SoundEffectsContext';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  id?: string;
  activeColor?: string;
  label?: string;
  description?: string;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  checked,
  onChange,
  disabled = false,
  size = 'md',
  id,
  activeColor = 'bg-cyan-500',
  label,
  description,
}) => {
  const { playPop, soundsEnabled } = useSoundEffects();

  const handleToggle = () => {
    if (disabled) return;
    const nextVal = !checked;
    
    // Reproduz som POP mecânico/elétrico ao ativar/desativar
    if (soundsEnabled) {
      playPop(nextVal ? 'on' : 'off');
    }
    
    onChange(nextVal);
  };

  const dimensions = {
    sm: { track: 'w-8 h-4.5', thumb: 'w-3.5 h-3.5', translate: 14, pad: 'p-0.5' },
    md: { track: 'w-12 h-6.5', thumb: 'w-5 h-5', translate: 22, pad: 'p-0.5' },
    lg: { track: 'w-14 h-7.5', thumb: 'w-6 h-6', translate: 26, pad: 'p-0.5' },
  }[size];

  return (
    <div className="flex items-center justify-between gap-3 select-none">
      {(label || description) && (
        <div className="flex flex-col flex-1 cursor-pointer" onClick={handleToggle}>
          {label && (
            <span className="text-sm font-medium text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
              {label}
            </span>
          )}
          {description && (
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {description}
            </span>
          )}
        </div>
      )}

      <button
        type="button"
        id={id}
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={handleToggle}
        className={`relative inline-flex items-center rounded-full transition-colors duration-250 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50 ${
          dimensions.track
        } ${dimensions.pad} ${
          disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
        } ${
          checked
            ? `${activeColor} shadow-[0_0_12px_rgba(6,182,212,0.4)]`
            : 'bg-slate-300 dark:bg-slate-700 hover:bg-slate-400 dark:hover:bg-slate-600'
        }`}
      >
        <motion.div
          animate={{
            x: checked ? dimensions.translate : 0,
            scale: [1, 1.15, 1],
          }}
          transition={{
            type: 'spring',
            stiffness: 600,
            damping: 30,
            mass: 0.6,
          }}
          className={`${dimensions.thumb} rounded-full bg-white shadow-md flex items-center justify-center`}
        >
          {/* Indicador de estado estilizado */}
          <motion.div
            animate={{
              opacity: checked ? 1 : 0,
              scale: checked ? 1 : 0.4,
            }}
            transition={{ duration: 0.15 }}
            className="w-1.5 h-1.5 rounded-full bg-cyan-600"
          />
        </motion.div>
      </button>
    </div>
  );
};
