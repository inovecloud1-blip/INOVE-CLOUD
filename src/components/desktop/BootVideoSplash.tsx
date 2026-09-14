import React, { useState, useEffect } from 'react';
import { Sparkles, X, ShieldCheck } from 'lucide-react';

interface BootVideoSplashProps {
  onComplete: () => void;
  autoDismiss?: boolean;
  canSkip?: boolean;
}

/**
 * BootLoadingScreen (Substituindo vídeo por tela de carregamento limpa e elegante):
 * - Logotipo e tipografia oficial InoveCloud OS
 * - Animação de barra de progresso suave com porcentagem
 * - Indicadores das etapas de inicialização do sistema (Kernel, Serviços, Drivers, Flathub, Desktop)
 */
export const BootVideoSplash: React.FC<BootVideoSplashProps> = ({
  onComplete,
  autoDismiss = true,
  canSkip = true,
}) => {
  const [progress, setProgress] = useState<number>(0);
  const [currentStep, setCurrentStep] = useState<string>('Carregando módulos do Kernel Linux...');

  useEffect(() => {
    const steps = [
      { at: 5, text: 'Carregando módulos do Kernel Linux...' },
      { at: 25, text: 'Inicializando dispositivos de entrada (Teclado e Mouse)...' },
      { at: 45, text: 'Configurando subsistema de vídeo e display Wayland...' },
      { at: 65, text: 'Ativando D-Bus, rede Wi-Fi e repositório Flathub...' },
      { at: 85, text: 'Montando Meus Arquivos e terminal do sistema...' },
      { at: 96, text: 'Iniciando interface InoveCloud OS...' },
    ];

    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 2;
        
        const matched = steps.filter((s) => s.at <= next).pop();
        if (matched) {
          setCurrentStep(matched.text);
        }

        if (next >= 100) {
          clearInterval(interval);
          if (autoDismiss) {
            setTimeout(onComplete, 400);
          }
          return 100;
        }
        return next;
      });
    }, 45);

    return () => clearInterval(interval);
  }, [autoDismiss, onComplete]);

  return (
    <div
      id="inovecloud-boot-loading-screen"
      className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#0a0e17] text-white select-none transition-opacity duration-500 font-sans overflow-hidden"
    >
      {/* Luz ambiente de fundo sutil */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-[130px] animate-pulse" />
        <div className="w-[300px] h-[300px] rounded-full bg-blue-600/15 blur-[90px]" />
      </div>

      {/* Centro: Logo InoveCloud + Título Oficial */}
      <div className="relative z-10 flex flex-col items-center justify-center space-y-6 max-w-md w-full px-6">
        {/* Ícone estilizado da nuvem InoveCloud */}
        <div className="relative w-24 h-24 flex items-center justify-center">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-cyan-500/20 to-blue-600/20 blur-lg" />
          <div className="relative w-20 h-20 rounded-2xl bg-slate-900/80 border border-cyan-500/30 shadow-2xl flex items-center justify-center">
            <svg
              viewBox="0 0 100 70"
              className="w-12 h-12 text-cyan-400 drop-shadow-[0_0_12px_rgba(6,182,212,0.6)]"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M30 60 L72 60 C82 60 89 53 89 43 C89 34 82 27 73 27 C71 27 70 27.5 68 28 C65 17 56 10 45 10 C32 10 22 20 22 33 C22 35 22.5 37 23 39 C15 41 10 48 10 55 C10 63 17 60 30 60 Z"
                stroke="currentColor"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M33 52 C27 52 22 47 22 41 C22 35 27 30 33 30 C35 30 37 30.5 38 31 C40 23 47 18 54 18 C62 18 68 23 69 31 C74 31 78 35 78 40 C78 45 74 52 68 52"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.85"
              />
            </svg>
          </div>
        </div>

        {/* Título do Sistema */}
        <div className="text-center space-y-1">
          <h1 className="text-3xl sm:text-4xl font-black tracking-wider bg-gradient-to-r from-white via-slate-100 to-cyan-300 bg-clip-text text-transparent">
            INOVECLOUD OS
          </h1>
          <p className="text-xs text-slate-400 tracking-widest uppercase font-semibold">
            Iniciando Sistema Operacional
          </p>
        </div>

        {/* Barra de Progresso com Animação Fluida */}
        <div className="w-full space-y-3 pt-4">
          <div className="w-full h-2 bg-slate-800/90 rounded-full overflow-hidden p-0.5 border border-slate-700/60 shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-teal-300 rounded-full transition-all duration-150 shadow-[0_0_12px_rgba(6,182,212,0.8)]"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span className="flex items-center space-x-2 truncate max-w-[280px]">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping inline-block" />
              <span className="truncate">{currentStep}</span>
            </span>
            <span className="font-bold text-cyan-300">{progress}%</span>
          </div>
        </div>
      </div>

      {/* Botão Pular Opcional */}
      {canSkip && (
        <div className="absolute top-6 right-6">
          <button
            id="boot-skip-btn"
            onClick={onComplete}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition cursor-pointer"
          >
            <span>Pular</span>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Rodapé informativo */}
      <div className="absolute bottom-6 flex items-center space-x-3 text-[11px] text-slate-500">
        <ShieldCheck className="w-3.5 h-3.5 text-cyan-500" />
        <span>InoveCloud OS 2026 • Modo Seguro com Aceleração de Hardware</span>
      </div>
    </div>
  );
};

export default BootVideoSplash;
