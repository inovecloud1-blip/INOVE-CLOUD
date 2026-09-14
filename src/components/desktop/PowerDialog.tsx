import React from 'react';
import {
  Power,
  RotateCw,
  Moon,
  Lock,
  X,
  AlertTriangle
} from 'lucide-react';
import { useSystemSettings } from '../../context/SystemSettingsContext';

interface PowerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  defaultAction?: 'shutdown' | 'restart' | 'sleep' | 'lock';
}

export const PowerDialog: React.FC<PowerDialogProps> = ({
  isOpen,
  onClose,
  defaultAction = 'shutdown',
}) => {
  const {
    requestShutdown,
    requestRestart,
    requestSleep,
    lockScreen,
    playFeedbackTone,
  } = useSystemSettings();

  if (!isOpen) return null;

  const handleAction = (action: 'shutdown' | 'restart' | 'sleep' | 'lock') => {
    playFeedbackTone();
    onClose();
    if (action === 'shutdown') requestShutdown();
    else if (action === 'restart') requestRestart();
    else if (action === 'sleep') requestSleep();
    else if (action === 'lock') lockScreen();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none pointer-events-none">
        <div className="pointer-events-auto w-full max-w-md liquid-glass rounded-3xl p-6 shadow-2xl border border-white/20 text-white space-y-5 animate-scale-up">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400">
                <Power className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Opções de Energia & Sessão</h3>
                <p className="text-xs text-slate-300">Escolha o que deseja fazer com o computador</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Action Grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Desligar */}
            <button
              onClick={() => handleAction('shutdown')}
              className="p-4 rounded-2xl bg-red-600/80 hover:bg-red-500 text-white text-left space-y-2 transition shadow-lg shadow-red-600/25 active:scale-95 group border border-red-400/30 cursor-pointer"
            >
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                <Power className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="font-bold text-sm">Desligar</div>
                <div className="text-[11px] text-red-100/80">Encerra o sistema e desliga o PC</div>
              </div>
            </button>

            {/* Reiniciar */}
            <button
              onClick={() => handleAction('restart')}
              className="p-4 rounded-2xl bg-amber-600/80 hover:bg-amber-500 text-white text-left space-y-2 transition shadow-lg shadow-amber-600/25 active:scale-95 group border border-amber-400/30 cursor-pointer"
            >
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                <RotateCw className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="font-bold text-sm">Reiniciar</div>
                <div className="text-[11px] text-amber-100/80">Recarrega o kernel e o desktop</div>
              </div>
            </button>

            {/* Bloquear Tela */}
            <button
              onClick={() => handleAction('lock')}
              className="p-4 rounded-2xl bg-cyan-600/80 hover:bg-cyan-500 text-slate-950 font-medium text-left space-y-2 transition shadow-lg shadow-cyan-600/25 active:scale-95 group border border-cyan-400/30 cursor-pointer"
            >
              <div className="w-8 h-8 rounded-xl bg-slate-950/20 flex items-center justify-center">
                <Lock className="w-4 h-4 text-slate-950" />
              </div>
              <div>
                <div className="font-bold text-sm text-slate-950">Bloquear Tela</div>
                <div className="text-[11px] text-slate-900">Exibe hora, data e senha (⌘L)</div>
              </div>
            </button>

            {/* Suspender */}
            <button
              onClick={() => handleAction('sleep')}
              className="p-4 rounded-2xl bg-indigo-600/80 hover:bg-indigo-500 text-white text-left space-y-2 transition shadow-lg shadow-indigo-600/25 active:scale-95 group border border-indigo-400/30 cursor-pointer"
            >
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                <Moon className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="font-bold text-sm">Suspender</div>
                <div className="text-[11px] text-indigo-100/80">Economiza energia em espera</div>
              </div>
            </button>
          </div>

          {/* Cancel button */}
          <div className="flex justify-end pt-1">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 hover:text-white text-xs font-semibold transition"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
export default PowerDialog;
