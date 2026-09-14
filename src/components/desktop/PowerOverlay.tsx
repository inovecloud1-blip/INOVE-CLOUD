import React, { useState, useEffect } from 'react';
import {
  Power,
  RotateCw,
  Moon,
  Lock,
  X,
  CheckCircle2,
  Cpu,
  Server,
  Terminal,
  ShieldCheck,
  Disc,
  Play
} from 'lucide-react';
import { useSystemSettings } from '../../context/SystemSettingsContext';

export const PowerOverlay: React.FC = () => {
  const {
    powerState,
    cancelPowerAction,
    powerOnSystem,
    wakeFromSleep,
    lockScreen,
    requestShutdown,
    requestRestart,
    requestSleep,
    playFeedbackTone,
  } = useSystemSettings();

  const [shutdownStep, setShutdownStep] = useState<number>(1);
  const [restartStep, setRestartStep] = useState<number>(1);

  // Shutdown sequence timer
  useEffect(() => {
    if (powerState === 'shutting_down') {
      setShutdownStep(1);
      const timer1 = setTimeout(() => setShutdownStep(2), 1200);
      const timer2 = setTimeout(() => setShutdownStep(3), 2600);
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [powerState]);

  // Restart sequence timer
  useEffect(() => {
    if (powerState === 'restarting') {
      setRestartStep(1);
      const t1 = setTimeout(() => setRestartStep(2), 1400);
      const t2 = setTimeout(() => setRestartStep(3), 3000);
      const t3 = setTimeout(() => {
        // Complete reboot
        powerOnSystem();
      }, 4800);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }
  }, [powerState]);

  if (powerState === 'normal') return null;

  // 1. SLEEP MODE OVERLAY
  if (powerState === 'sleeping') {
    return (
      <div
        onClick={wakeFromSleep}
        onKeyDown={wakeFromSleep}
        tabIndex={0}
        className="fixed inset-0 z-[100000] bg-black flex flex-col items-center justify-center text-white cursor-pointer select-none"
      >
        <div className="flex flex-col items-center space-y-4 animate-pulse">
          <div className="w-12 h-12 rounded-full bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center">
            <Moon className="w-6 h-6 text-indigo-400" />
          </div>
          <p className="text-xs text-slate-400 font-mono">Modo de Suspensão Ativo • Clique para acordar</p>
        </div>
      </div>
    );
  }

  // 2. SHUTTING DOWN OVERLAY
  if (powerState === 'shutting_down') {
    return (
      <div className="fixed inset-0 z-[100000] bg-slate-950 flex flex-col items-center justify-center text-white select-none animate-fade-in font-sans p-6">
        {shutdownStep < 3 ? (
          <div className="max-w-md w-full flex flex-col items-center text-center space-y-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-4 border-cyan-500/20 border-t-cyan-400 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Power className="w-8 h-8 text-red-400 animate-pulse" />
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-white tracking-wide">Desligando o InoveCloud OS</h2>
              <p className="text-xs text-slate-400 font-mono">
                {shutdownStep === 1 && 'Encerrando nós KVM, salvando sessões do usuário...'}
                {shutdownStep === 2 && 'Sincronizando buffers de disco (sync) e desligando ACPI...'}
              </p>
            </div>

            <div className="w-64 h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-red-500 transition-all duration-1000"
                style={{ width: shutdownStep === 1 ? '50%' : '95%' }}
              />
            </div>
          </div>
        ) : (
          /* System is now completely powered OFF */
          <div className="flex flex-col items-center justify-center text-center space-y-6">
            <div className="w-24 h-24 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600 shadow-2xl">
              <Power className="w-10 h-10 text-slate-600" />
            </div>

            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-slate-300">Computador Desligado</h2>
              <p className="text-xs text-slate-500">InoveCloud OS está pronto para ser ligado novamente.</p>
            </div>

            <button
              onClick={() => {
                playFeedbackTone();
                powerOnSystem();
              }}
              className="flex items-center space-x-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm shadow-xl shadow-cyan-500/20 active:scale-95 transition"
            >
              <Power className="w-4 h-4" />
              <span>Ligar InoveCloud OS</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  // 3. RESTARTING OVERLAY
  if (powerState === 'restarting') {
    return (
      <div className="fixed inset-0 z-[100000] bg-slate-950 flex flex-col items-center justify-center text-white select-none animate-fade-in font-sans p-6">
        <div className="max-w-md w-full flex flex-col items-center text-center space-y-6">
          {restartStep === 1 && (
            <>
              <div className="w-16 h-16 rounded-full border-4 border-amber-500/20 border-t-amber-400 animate-spin flex items-center justify-center">
                <RotateCw className="w-6 h-6 text-amber-400" />
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-white">Reiniciando o Sistema</h2>
                <p className="text-xs text-slate-400 font-mono">systemd: Reebot target reached. Enviando sinal SIGTERM...</p>
              </div>
            </>
          )}

          {restartStep === 2 && (
            <div className="space-y-4 w-full">
              <div className="text-left font-mono text-xs bg-slate-900 border border-slate-800 p-4 rounded-xl text-emerald-400 space-y-1 shadow-inner">
                <p>[  OK  ] Stopped target Multi-User System.</p>
                <p>[  OK  ] Stopped InoveCloud Hypervisor Node Service.</p>
                <p>[  OK  ] Unmounted /boot/efi (UEFI System Partition).</p>
                <p className="text-cyan-400">[ BIOS ] Initializing InoveCloud OS 2.4 Kernel (x86_64)...</p>
              </div>
              <div className="text-slate-400 text-xs font-medium animate-pulse">
                Carregando drivers e interface gráfica...
              </div>
            </div>
          )}

          {restartStep === 3 && (
            <div className="flex flex-col items-center space-y-4 animate-fade-in">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-600 flex items-center justify-center shadow-2xl">
                <Disc className="w-10 h-10 text-white animate-spin" />
              </div>
              <h2 className="text-xl font-bold tracking-wide">InoveCloud OS</h2>
              <div className="w-48 h-1 bg-slate-800 rounded-full overflow-hidden">
                <div className="w-full h-full bg-cyan-400 animate-pulse" />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
};
export default PowerOverlay;
