import React, { useState, useEffect } from 'react';
import { Sparkles, X, ShieldCheck, Terminal, Monitor, CheckCircle, Cpu, Server, HardDrive, Wifi, Play } from 'lucide-react';
import { InstallerApp } from '../apps/InstallerApp';
import { WindowFrame } from '../WindowFrame';
import { WindowState } from '../../types';

interface BootVideoSplashProps {
  onComplete: () => void;
  autoDismiss?: boolean;
  canSkip?: boolean;
}

const BOOT_LOG_MESSAGES = [
  { text: '[  OK  ] Linux Kernel 6.6 LTS x86_64 loaded at 0x1000000', type: 'ok' },
  { text: '[  OK  ] Initializing CPU cores (x86_64 SMP architecture)', type: 'ok' },
  { text: '[  OK  ] Mounting rootfs (/proc, /sys, /dev, /tmp, /run)', type: 'ok' },
  { text: '[ INFO ] Probing DRM/KMS graphics drivers (VMSVGA / VirtIO / Mesa 3D)...', type: 'info' },
  { text: '[  OK  ] Direct Rendering Manager (DRM) acceleration ready', type: 'ok' },
  { text: '[  OK  ] Initializing systemd-udevd device manager & hotplug', type: 'ok' },
  { text: '[  OK  ] Detecting input devices: Keyboard ABNT2/US & USB Mouse', type: 'ok' },
  { text: '[  OK  ] Configuring loopback and acquiring DHCP IPv4 lease', type: 'ok' },
  { text: '[  OK  ] Starting D-Bus System Message Bus & PipeWire audio daemon', type: 'ok' },
  { text: '[  OK  ] Starting CUPS printing subsystem on port 631', type: 'ok' },
  { text: '[  OK  ] Mounting InoveCloud OS User Storage (/home/inove)', type: 'ok' },
  { text: '[ INIT ] Launching InoveCloud OS Glass Desktop GUI (Wayland / Weston)...', type: 'step' },
  { text: '[  OK  ] Desktop environment active. Welcome to InoveCloud OS 2026!', type: 'ok' },
];

export const BootVideoSplash: React.FC<BootVideoSplashProps> = ({
  onComplete,
  autoDismiss = true,
  canSkip = true,
}) => {
  const [progress, setProgress] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'modern' | 'bios' | 'installer'>('modern');
  const [selectedBiosIndex, setSelectedBiosIndex] = useState<number>(0);
  const [visibleLogs, setVisibleLogs] = useState<typeof BOOT_LOG_MESSAGES>([]);

  // Janela flutuante para o instalador
  const [installerWindowState, setInstallerWindowState] = useState<WindowState>({
    id: 'installer',
    title: 'Console de Instalação no Disco — debootstrap & apt-get (xterm.js)',
    isOpen: true,
    isMinimized: false,
    isMaximized: false,
    zIndex: 999999,
    position: { x: Math.max(20, (window.innerWidth - 880) / 2), y: Math.max(20, (window.innerHeight - 560) / 2) },
    size: { width: Math.min(window.innerWidth - 40, 880), height: Math.min(window.innerHeight - 60, 560) },
  });

  const biosMenuItems = [
    { key: 'F1', label: 'System Information', desc: 'Hardware, CPU, RAM & Live Session' },
    { key: 'F2', label: 'System Diagnostics', desc: 'Verbose Hardware & Memory Verification' },
    { key: 'F9', label: 'Boot Device Options', desc: 'Fast Startup & Direct Storage Boot' },
    { key: 'F10', label: 'BIOS Setup: Instalação no Disco', desc: 'Console xterm com debootstrap e apt-get' },
    { key: 'F11', label: 'System Recovery', desc: 'Safe Mode (VESA / Framebuffer Fallback)' },
    { key: 'F12', label: 'Network Boot', desc: 'Cloud PXE & Network DHCP Recovery' },
  ];

  useEffect(() => {
    if (viewMode === 'installer') return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = Math.min(100, prev + 2);
        
        // Revelar logs conforme o progresso
        const logIndex = Math.floor((next / 100) * BOOT_LOG_MESSAGES.length);
        setVisibleLogs(BOOT_LOG_MESSAGES.slice(0, Math.max(1, logIndex)));

        if (next >= 100) {
          clearInterval(interval);
          if (autoDismiss) {
            setTimeout(onComplete, 450);
          }
          return 100;
        }
        return next;
      });
    }, 45);

    return () => clearInterval(interval);
  }, [autoDismiss, onComplete, viewMode]);

  // Teclas de atalho para alternar ou navegar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        setViewMode((m) => (m === 'modern' ? 'bios' : m === 'bios' ? 'installer' : 'modern'));
      } else if (e.key === 'F10') {
        e.preventDefault();
        setViewMode('installer');
      } else if (e.key === 'ArrowDown' && viewMode === 'bios') {
        setSelectedBiosIndex((i) => (i + 1) % biosMenuItems.length);
      } else if (e.key === 'ArrowUp' && viewMode === 'bios') {
        setSelectedBiosIndex((i) => (i - 1 + biosMenuItems.length) % biosMenuItems.length);
      } else if (e.key === 'Enter' && viewMode === 'bios') {
        if (biosMenuItems[selectedBiosIndex].key === 'F10') {
          setViewMode('installer');
        } else {
          onComplete();
        }
      } else if (e.key === 'Escape') {
        onComplete();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [biosMenuItems, selectedBiosIndex, onComplete, viewMode]);

  // TELA DO INSTALADOR COM JANELA WINDOWFRAME
  if (viewMode === 'installer') {
    return (
      <div
        id="inovecloud-boot-installer-view"
        className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-xl p-4 sm:p-8"
      >
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-xs text-slate-400 z-10 pointer-events-auto">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('bios')}
              className="px-3 py-1.5 rounded-lg bg-blue-900/80 hover:bg-blue-800 text-cyan-200 border border-blue-400/40 font-bold transition cursor-pointer"
            >
              ← Voltar para BIOS
            </button>
            <button
              onClick={() => setViewMode('modern')}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold transition cursor-pointer"
            >
              Modo Moderno
            </button>
          </div>
          <button
            onClick={onComplete}
            className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition cursor-pointer shadow-lg shadow-emerald-600/30"
          >
            Entrar no Desktop ➔
          </button>
        </div>

        <div className="w-full max-w-5xl h-[80vh] relative mt-8">
          <WindowFrame
            window={installerWindowState}
            icon={<Terminal className="w-3.5 h-3.5 text-cyan-400" />}
            onClose={() => setViewMode('bios')}
            onMinimize={() => {}}
            onToggleMaximize={() => {
              setInstallerWindowState((prev) => ({ ...prev, isMaximized: !prev.isMaximized }));
            }}
            onFocus={() => {}}
            onMove={(pos) => {
              setInstallerWindowState((prev) => ({ ...prev, position: pos }));
            }}
          >
            <InstallerApp onInstallationFinished={onComplete} standaloneInModal={true} />
          </WindowFrame>
        </div>
      </div>
    );
  }

  // TELA 1: ESTILO BIOS CLÁSSICA (AZUL OFICIAL HP / PHOENIX / AWARD)
  if (viewMode === 'bios') {
    return (
      <div
        id="inovecloud-bios-screen"
        className="fixed inset-0 z-[99999] flex flex-col justify-between bg-[#0000aa] text-white select-none font-mono p-6 sm:p-12 overflow-hidden shadow-2xl"
      >
        {/* Cabeçalho da BIOS */}
        <div className="border-b-2 border-white/80 pb-3 flex justify-between items-center text-sm sm:text-base">
          <div>
            <h1 className="font-bold text-xl sm:text-2xl tracking-wide text-white">Startup Menu</h1>
            <p className="text-cyan-300 text-xs mt-0.5">InoveCloud OS 2026 UEFI/BIOS Setup Utility • Pure Kernel Architecture</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('installer')}
              className="px-3 py-1 bg-emerald-500 text-slate-950 font-bold text-xs rounded hover:bg-emerald-400 transition cursor-pointer shadow"
            >
              Console Instalação (F10)
            </button>
            <button
              onClick={() => setViewMode('modern')}
              className="px-3 py-1 bg-white text-[#0000aa] font-bold text-xs rounded hover:bg-cyan-200 transition cursor-pointer"
            >
              Modo Moderno (Tab)
            </button>
          </div>
        </div>

        {/* Corpo do Menu da BIOS */}
        <div className="my-auto max-w-2xl w-full mx-auto space-y-2 py-4">
          {biosMenuItems.map((item, index) => {
            const isSelected = selectedBiosIndex === index;
            return (
              <div
                key={item.key}
                onClick={() => {
                  setSelectedBiosIndex(index);
                  if (item.key === 'F10') {
                    setViewMode('installer');
                  } else if (item.key === 'F1') {
                    onComplete();
                  }
                }}
                className={`flex items-center space-x-6 px-4 py-2.5 rounded transition cursor-pointer ${
                  isSelected
                    ? 'bg-white text-[#0000aa] font-bold shadow-lg ring-2 ring-cyan-400'
                    : 'text-white hover:bg-blue-800/80'
                }`}
              >
                <span className={`text-base sm:text-lg font-black w-14 shrink-0 ${isSelected ? 'text-[#0000aa]' : 'text-cyan-300'}`}>
                  {item.key}
                </span>
                <span className="text-sm sm:text-base tracking-wide flex-1">
                  {item.label}
                </span>
                <span className={`text-xs opacity-75 hidden sm:inline ${isSelected ? 'text-blue-900' : 'text-cyan-200'}`}>
                  {item.desc}
                </span>
              </div>
            );
          })}
        </div>

        {/* Live Command Stream (Evita tela preta) */}
        <div className="bg-[#000066] border border-cyan-400/40 rounded p-3 text-xs text-cyan-200 space-y-1 font-mono max-h-28 overflow-y-auto">
          <div className="text-white font-bold border-b border-cyan-500/30 pb-1 flex items-center justify-between">
            <span>Kernel & Hardware Initialization Stream (Verbose Output):</span>
            <span className="text-green-300">{progress}%</span>
          </div>
          {visibleLogs.slice(-3).map((log, i) => (
            <div key={i} className="truncate">
              <span className={log.type === 'ok' ? 'text-green-400 font-bold' : 'text-cyan-300'}>
                {log.text}
              </span>
            </div>
          ))}
        </div>

        {/* Rodapé da BIOS */}
        <div className="border-t border-white/40 pt-3 flex flex-wrap justify-between items-center text-xs text-white/90 gap-2">
          <div className="flex items-center space-x-4">
            <span>[↑↓] Selecionar</span>
            <span>[Enter] Iniciar Opção</span>
            <span>[F10] Instalar no Disco</span>
            <span>[Tab] Alternar Modo</span>
            <span>[Esc] Pular</span>
          </div>
          <button
            onClick={onComplete}
            className="px-3 py-1 bg-cyan-400 text-slate-900 font-bold rounded hover:bg-cyan-300 transition cursor-pointer"
          >
            Iniciar Desktop Now ➔
          </button>
        </div>
      </div>
    );
  }

  // TELA 2: MODO MODERNO COM LIVE TERMINAL LOGS
  return (
    <div
      id="inovecloud-boot-loading-screen"
      className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#070b14] text-white select-none transition-opacity duration-500 font-sans overflow-hidden p-6"
    >
      {/* Luz ambiente de fundo azul & ciano */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[600px] rounded-full bg-blue-600/15 blur-[140px] animate-pulse" />
        <div className="w-[350px] h-[350px] rounded-full bg-cyan-500/15 blur-[100px]" />
      </div>

      {/* Alternador para a tela da BIOS e Instalador */}
      <div className="absolute top-6 left-6 z-20 flex items-center space-x-2">
        <button
          onClick={() => setViewMode('bios')}
          className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-blue-900/80 hover:bg-blue-800 text-cyan-200 border border-blue-400/40 text-xs font-semibold shadow-lg backdrop-blur-md transition cursor-pointer"
          title="Ver Tela de Startup da BIOS Clássica"
        >
          <Monitor className="w-3.5 h-3.5 text-cyan-400" />
          <span>Tela BIOS (Startup Menu)</span>
        </button>
        <button
          onClick={() => setViewMode('installer')}
          className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 border border-emerald-400/40 text-xs font-semibold shadow-lg backdrop-blur-md transition cursor-pointer"
          title="Abrir Console de Instalação xterm.js"
        >
          <Terminal className="w-3.5 h-3.5 text-emerald-400" />
          <span>Console Instalação (xterm)</span>
        </button>
      </div>

      {/* Centro: Logo + Streaming de Comandos de Boot */}
      <div className="relative z-10 flex flex-col items-center justify-center space-y-6 max-w-lg w-full">
        {/* Ícone estilizado da nuvem InoveCloud */}
        <div className="relative w-20 h-20 flex items-center justify-center">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-cyan-500/30 to-blue-600/30 blur-xl" />
          <div className="relative w-18 h-18 rounded-2xl bg-slate-900/90 border border-cyan-500/40 shadow-2xl flex items-center justify-center">
            <svg
              viewBox="0 0 100 70"
              className="w-11 h-11 text-cyan-400 drop-shadow-[0_0_14px_rgba(6,182,212,0.8)]"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M 25,55 
                   A 18,18 0 0,1 25,24 
                   A 22,22 0 0,1 62,15 
                   A 20,20 0 0,1 80,32 
                   A 16,16 0 0,1 75,55 
                   Z"
                stroke="currentColor"
                strokeWidth="4.5"
                strokeLinejoin="round"
                strokeLinecap="round"
                className="opacity-90"
              />
              <path
                d="M 36,44 L 50,30 L 64,44"
                stroke="currentColor"
                strokeWidth="4.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M 50,30 L 50,52"
                stroke="currentColor"
                strokeWidth="4.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* Título Oficial */}
        <div className="text-center space-y-1">
          <h1 className="text-3xl sm:text-4xl font-black tracking-wider bg-gradient-to-r from-white via-slate-100 to-cyan-300 bg-clip-text text-transparent">
            INOVECLOUD OS
          </h1>
          <p className="text-xs text-cyan-300/80 tracking-widest uppercase font-semibold flex items-center justify-center space-x-2">
            <span>Inicialização do Kernel & Drivers</span>
          </p>
        </div>

        {/* Terminal de Comandos em Tempo Real (Evita tela preta) */}
        <div className="w-full rounded-2xl bg-slate-950/80 border border-slate-800/80 p-4 shadow-2xl backdrop-blur-xl space-y-2 font-mono text-xs text-left">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-[11px] text-slate-400">
            <span className="flex items-center space-x-2">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              <span>Console de Inicialização Ativo</span>
            </span>
            <span className="text-cyan-400 font-bold">{progress}%</span>
          </div>

          <div className="h-24 overflow-hidden flex flex-col justify-end space-y-1">
            {visibleLogs.slice(-4).map((log, index) => (
              <div key={index} className="flex items-center space-x-2 truncate">
                <span
                  className={`font-bold ${
                    log.type === 'ok'
                      ? 'text-emerald-400'
                      : log.type === 'info'
                      ? 'text-cyan-400'
                      : 'text-amber-400'
                  }`}
                >
                  {log.text.slice(0, 8)}
                </span>
                <span className="text-slate-300 truncate">{log.text.slice(8)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Barra de Progresso com Glow */}
        <div className="w-full space-y-2">
          <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-700/60 shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-blue-600 via-cyan-400 to-teal-300 rounded-full transition-all duration-150 shadow-[0_0_14px_rgba(6,182,212,0.9)]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Botão Pular */}
      {canSkip && (
        <div className="absolute top-6 right-6">
          <button
            onClick={onComplete}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition cursor-pointer"
          >
            <span>Pular</span>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Rodapé informativo */}
      <div className="absolute bottom-6 flex items-center space-x-3 text-[11px] text-slate-400">
        <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
        <span>InoveCloud OS 2026 • Modo Seguro com Aceleração de Hardware & BIOS Diagnostics</span>
      </div>
    </div>
  );
};

export default BootVideoSplash;
