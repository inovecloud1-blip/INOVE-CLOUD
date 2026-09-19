import React from 'react';
import {
  Wifi,
  Bluetooth,
  Zap,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  ShieldCheck,
  Power,
  RotateCw,
  Lock,
  ChevronRight,
  Settings,
  Sparkles,
  Network,
  BellOff,
  Bell,
  Camera,
  Cpu
} from 'lucide-react';
import { AppId, SystemStats } from '../../types';
import { useSystemSettings } from '../../context/SystemSettingsContext';
import { useSoundEffects } from '../../context/SoundEffectsContext';

interface ControlCenterProps {
  isOpen: boolean;
  onClose: () => void;
  stats: SystemStats;
  onOpenApp: (id: AppId) => void;
  onOpenPowerModal?: () => void;
}

export const ControlCenter: React.FC<ControlCenterProps> = ({
  isOpen,
  onClose,
  stats,
  onOpenApp,
  onOpenPowerModal,
}) => {
  const {
    wifiEnabled,
    toggleWifi,
    connectedSsid,
    ethernetEnabled,
    toggleEthernet,
    ethernetConnected,
    ethernetSpeed,
    bluetoothEnabled,
    toggleBluetooth,
    pairedBtCount,
    gpuTurboEnabled,
    toggleGpuTurbo,
    darkMode,
    toggleDarkMode,
    doNotDisturb,
    toggleDoNotDisturb,
    screenBrightness,
    setScreenBrightness,
    speakerVolume,
    setSpeakerVolume,
    isMuted,
    toggleMute,
    lockScreen,
    requestShutdown,
    requestRestart,
    requestSleep,
    playFeedbackTone,
    playPopSound,
    systemSoundsEnabled,
  } = useSystemSettings();
  const { playPop, playSliderTick } = useSoundEffects();

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className={`fixed right-3 top-9 z-50 w-92 rounded-2xl p-4 shadow-2xl border text-slate-100 space-y-3.5 select-none animate-fade-in font-sans ${
        darkMode ? 'liquid-glass border-white/20' : 'bg-slate-900/90 text-white border-white/30 backdrop-blur-2xl'
      }`}>
        {/* Top Header: Network Stack Linux (Wi-Fi & Ethernet) */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Wi-Fi Tile */}
          <div
            onClick={() => {
              playPopSound(!wifiEnabled ? 'on' : 'off');
              toggleWifi();
            }}
            className={`p-3 liquid-glass-subcard rounded-xl flex items-center justify-between cursor-pointer hover:bg-white/10 active:scale-[0.98] transition ${
              wifiEnabled ? 'ring-1 ring-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.15)]' : ''
            }`}
          >
            <div className="flex items-center space-x-2.5 min-w-0">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 shadow-md shrink-0 ${
                  wifiEnabled ? 'bg-cyan-500 text-slate-950 font-bold scale-105' : 'bg-slate-800 text-slate-400'
                }`}
              >
                <Wifi className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="font-bold text-xs text-white truncate">Wi-Fi 6E/7</div>
                <div className="text-[10px] text-slate-300 truncate">
                  {wifiEnabled ? connectedSsid : 'Desativado'}
                </div>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenApp('settings');
                onClose();
              }}
              className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white shrink-0"
              title="Configurar Redes Wi-Fi"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Ethernet / Internet a Cabo Tile */}
          <div
            onClick={() => {
              playPopSound(!ethernetEnabled ? 'on' : 'off');
              toggleEthernet();
            }}
            className={`p-3 liquid-glass-subcard rounded-xl flex items-center justify-between cursor-pointer hover:bg-white/10 active:scale-[0.98] transition ${
              ethernetEnabled && ethernetConnected ? 'ring-1 ring-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.15)]' : ''
            }`}
          >
            <div className="flex items-center space-x-2.5 min-w-0">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 shadow-md shrink-0 ${
                  ethernetEnabled && ethernetConnected ? 'bg-emerald-500 text-slate-950 font-bold scale-105' : 'bg-slate-800 text-slate-400'
                }`}
              >
                <Network className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="font-bold text-xs text-white truncate">Cabo (eth0)</div>
                <div className="text-[10px] text-slate-300 truncate">
                  {ethernetEnabled && ethernetConnected ? '10G Conectado' : 'Desconectado'}
                </div>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenApp('settings');
                onClose();
              }}
              className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white shrink-0"
              title="Configurar Rede Ethernet Linux"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Second Row: Dark Mode & Do Not Disturb */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Dark / Light Mode */}
          <div
            onClick={() => {
              playPopSound(!darkMode ? 'on' : 'off');
              toggleDarkMode();
            }}
            className="p-3 liquid-glass-subcard rounded-xl flex items-center space-x-2.5 cursor-pointer hover:bg-white/10 active:scale-[0.98] transition"
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all duration-200 ${
                darkMode ? 'bg-indigo-600 text-white' : 'bg-amber-400 text-slate-950 scale-105'
              }`}
            >
              {darkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </div>
            <div>
              <div className="font-bold text-xs text-white">{darkMode ? 'Modo Escuro' : 'Modo Claro'}</div>
              <div className="text-[10px] text-slate-400">{darkMode ? 'Tema Noturno Ativo' : 'Tema Diurno Ativo'}</div>
            </div>
          </div>

          {/* Do Not Disturb / Modo Não Perturbe */}
          <div
            onClick={() => {
              playPopSound(!doNotDisturb ? 'on' : 'off');
              toggleDoNotDisturb();
            }}
            className={`p-3 liquid-glass-subcard rounded-xl flex items-center space-x-2.5 cursor-pointer hover:bg-white/10 active:scale-[0.98] transition ${
              doNotDisturb ? 'border border-purple-500/50 bg-purple-950/40 shadow-[0_0_15px_rgba(168,85,247,0.2)]' : ''
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all duration-200 ${
                doNotDisturb ? 'bg-purple-600 text-white font-bold animate-pulse scale-105' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {doNotDisturb ? <BellOff className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
            </div>
            <div>
              <div className="font-bold text-xs text-white">Não Perturbe</div>
              <div className="text-[10px] text-slate-400">{doNotDisturb ? 'Silencioso' : 'Desativado'}</div>
            </div>
          </div>
        </div>

        {/* Third Row: Bluetooth & GPU Turbo */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Bluetooth Tile */}
          <div
            onClick={() => {
              playPopSound(!bluetoothEnabled ? 'on' : 'off');
              toggleBluetooth();
            }}
            className={`p-2.5 liquid-glass-subcard rounded-xl flex items-center space-x-2.5 cursor-pointer hover:bg-white/10 active:scale-[0.98] transition ${
              bluetoothEnabled ? 'ring-1 ring-blue-500/40' : ''
            }`}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 shadow-md ${
                bluetoothEnabled ? 'bg-blue-500 text-white font-bold scale-105' : 'bg-slate-800 text-slate-400'
              }`}
            >
              <Bluetooth className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <div className="font-bold text-xs text-white truncate">Bluetooth</div>
              <div className="text-[10px] text-slate-300 truncate">
                {bluetoothEnabled ? `${pairedBtCount} Dispositivos` : 'Off'}
              </div>
            </div>
          </div>

          {/* GPU Turbo Acceleration */}
          <div
            onClick={() => {
              playPopSound(!gpuTurboEnabled ? 'on' : 'off');
              toggleGpuTurbo();
            }}
            className={`p-2.5 liquid-glass-subcard rounded-xl flex items-center space-x-2.5 cursor-pointer hover:bg-white/10 active:scale-[0.98] transition ${
              gpuTurboEnabled ? 'ring-1 ring-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.2)]' : ''
            }`}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center shadow-md transition-all duration-200 ${
                gpuTurboEnabled ? 'bg-amber-500 text-slate-950 font-bold scale-105' : 'bg-slate-800 text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="font-bold text-xs text-white">GPU Turbo</div>
              <div className="text-[10px] text-slate-400">{gpuTurboEnabled ? 'Vulkan / DMA' : 'Desligado'}</div>
            </div>
          </div>
        </div>

        {/* Display / Brightness Slider */}
        <div className="p-3 liquid-glass-subcard rounded-xl space-y-1.5">
          <div className="flex justify-between text-[11px] text-slate-300 font-medium">
            <span className="flex items-center space-x-1">
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span>Brilho da Tela</span>
            </span>
            <span className="font-mono text-cyan-300 font-bold">{screenBrightness}%</span>
          </div>
          <input
            type="range"
            min="20"
            max="100"
            value={screenBrightness}
            onChange={(e) => {
              const val = Number(e.target.value);
              setScreenBrightness(val);
              playSliderTick(val / 100);
            }}
            className="w-full h-2 bg-slate-800 rounded-lg accent-white cursor-pointer"
          />
        </div>

        {/* Volume Slider */}
        <div className="p-3 liquid-glass-subcard rounded-xl space-y-1.5">
          <div className="flex justify-between text-[11px] text-slate-300 font-medium">
            <button
              onClick={() => {
                playPop(isMuted ? 'on' : 'off');
                toggleMute();
              }}
              className="flex items-center space-x-1 text-slate-300 hover:text-white transition"
              title={isMuted ? 'Desmutar' : 'Mutar'}
            >
              {isMuted || speakerVolume === 0 ? (
                <VolumeX className="w-3.5 h-3.5 text-red-400" />
              ) : (
                <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
              )}
              <span>Volume dos Alto-falantes</span>
            </button>
            <span className="font-mono text-emerald-400 font-bold">
              {isMuted ? 'Mudo' : `${speakerVolume}%`}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={isMuted ? 0 : speakerVolume}
            onChange={(e) => {
              const val = Number(e.target.value);
              setSpeakerVolume(val);
              playSliderTick(val / 100);
            }}
            className="w-full h-2 bg-slate-800 rounded-lg accent-emerald-400 cursor-pointer"
          />
        </div>

        {/* System Load */}
        <div className="p-3 liquid-glass-subcard rounded-xl space-y-1.5 text-xs">
          <div className="flex items-center justify-between font-medium">
            <span className="text-slate-400">Carga do Computador</span>
            <span className="text-emerald-400 font-bold">
              {stats.cpuUsage}% CPU • {stats.ramUsage}% RAM
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden flex">
            <div className="bg-cyan-400 h-full" style={{ width: `${stats.cpuUsage}%` }} />
            <div className="bg-indigo-500 h-full" style={{ width: `${stats.ramUsage * 0.5}%` }} />
          </div>
        </div>

        {/* Dedicated Power, Restart & Lock Screen Actions */}
        <div className="p-2 liquid-glass-subcard rounded-xl space-y-2">
          <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 px-1">
            Energia & Sessão
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {/* Bloquear */}
            <button
              onClick={() => {
                onClose();
                lockScreen();
              }}
              className="p-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500 hover:text-slate-950 text-cyan-300 flex flex-col items-center justify-center space-y-1 transition text-center cursor-pointer active:scale-95 border border-cyan-500/30"
              title="Bloquear Tela com Hora e Data (⌘L)"
            >
              <Lock className="w-4 h-4" />
              <span className="text-[10px] font-semibold leading-none">Bloquear</span>
            </button>

            {/* Suspender */}
            <button
              onClick={() => {
                onClose();
                requestSleep();
              }}
              className="p-2 rounded-lg bg-indigo-500/20 hover:bg-indigo-500 hover:text-white text-indigo-300 flex flex-col items-center justify-center space-y-1 transition text-center cursor-pointer active:scale-95 border border-indigo-500/30"
              title="Suspender Sessão do PC"
            >
              <Moon className="w-4 h-4" />
              <span className="text-[10px] font-semibold leading-none">Suspender</span>
            </button>

            {/* Reiniciar */}
            <button
              onClick={() => {
                onClose();
                requestRestart();
              }}
              className="p-2 rounded-lg bg-amber-500/20 hover:bg-amber-500 hover:text-slate-950 text-amber-300 flex flex-col items-center justify-center space-y-1 transition text-center cursor-pointer active:scale-95 border border-amber-500/30"
              title="Reiniciar o Sistema Operacional"
            >
              <RotateCw className="w-4 h-4" />
              <span className="text-[10px] font-semibold leading-none">Reiniciar</span>
            </button>

            {/* Desligar */}
            <button
              onClick={() => {
                onClose();
                requestShutdown();
              }}
              className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500 hover:text-white text-red-300 flex flex-col items-center justify-center space-y-1 transition text-center cursor-pointer active:scale-95 border border-red-500/30"
              title="Desligar Computador"
            >
              <Power className="w-4 h-4" />
              <span className="text-[10px] font-semibold leading-none">Desligar</span>
            </button>
          </div>
        </div>

        {/* Quick Link to Settings */}
        <button
          onClick={() => {
            onOpenApp('settings');
            onClose();
          }}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs transition cursor-pointer shadow-md shadow-blue-600/30 flex items-center justify-center space-x-1.5"
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Abrir Configurações do Sistema Operacional...</span>
        </button>
      </div>
    </>
  );
};
export default ControlCenter;
