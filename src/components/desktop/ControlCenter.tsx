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
  Sparkles
} from 'lucide-react';
import { AppId, SystemStats } from '../../types';
import { useSystemSettings } from '../../context/SystemSettingsContext';

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
    bluetoothEnabled,
    toggleBluetooth,
    pairedBtCount,
    gpuTurboEnabled,
    toggleGpuTurbo,
    darkMode,
    toggleDarkMode,
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
  } = useSystemSettings();

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="fixed right-3 top-9 z-50 w-88 liquid-glass rounded-2xl p-4 shadow-2xl border border-white/20 text-slate-100 space-y-3.5 select-none animate-fade-in font-sans">
        {/* Top 2 Primary Connectivity Tiles */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Wi-Fi Tile */}
          <div
            onClick={() => {
              playFeedbackTone();
              toggleWifi();
            }}
            className="p-3 liquid-glass-subcard rounded-xl flex items-center justify-between cursor-pointer hover:bg-white/10 transition"
          >
            <div className="flex items-center space-x-2.5">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition shadow-md ${
                  wifiEnabled ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
                }`}
              >
                <Wifi className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="font-bold text-xs text-white truncate">Wi-Fi</div>
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
              className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"
              title="Configurar Redes Wi-Fi"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Bluetooth Tile */}
          <div
            onClick={() => {
              playFeedbackTone();
              toggleBluetooth();
            }}
            className="p-3 liquid-glass-subcard rounded-xl flex items-center justify-between cursor-pointer hover:bg-white/10 transition"
          >
            <div className="flex items-center space-x-2.5">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition shadow-md ${
                  bluetoothEnabled ? 'bg-indigo-500 text-white font-bold' : 'bg-slate-800 text-slate-400'
                }`}
              >
                <Bluetooth className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="font-bold text-xs text-white truncate">Bluetooth</div>
                <div className="text-[10px] text-slate-300 truncate">
                  {bluetoothEnabled ? `${pairedBtCount} Dispositivos` : 'Desativado'}
                </div>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenApp('settings');
                onClose();
              }}
              className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"
              title="Configurar Bluetooth"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Second Row: GPU Turbo & Modo Escuro */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* GPU Acceleration */}
          <div
            onClick={() => {
              playFeedbackTone();
              toggleGpuTurbo();
            }}
            className="p-3 liquid-glass-subcard rounded-xl flex items-center space-x-2.5 cursor-pointer hover:bg-white/10 transition"
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md transition ${
                gpuTurboEnabled ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 text-white'
              }`}
            >
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-xs text-white">GPU Turbo</div>
              <div className="text-[10px] text-slate-400">{gpuTurboEnabled ? 'Ativo (Vulkan)' : 'Desligado'}</div>
            </div>
          </div>

          {/* Dark / Light Mode */}
          <div
            onClick={() => {
              playFeedbackTone();
              toggleDarkMode();
            }}
            className="p-3 liquid-glass-subcard rounded-xl flex items-center space-x-2.5 cursor-pointer hover:bg-white/10 transition"
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md transition ${
                darkMode ? 'bg-purple-600 text-white' : 'bg-amber-400 text-slate-950'
              }`}
            >
              {darkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </div>
            <div>
              <div className="font-bold text-xs text-white">Modo Escuro</div>
              <div className="text-[10px] text-slate-400">{darkMode ? 'Noturno' : 'Claro'}</div>
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
            onChange={(e) => setScreenBrightness(Number(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg accent-white cursor-pointer"
          />
        </div>

        {/* Volume Slider */}
        <div className="p-3 liquid-glass-subcard rounded-xl space-y-1.5">
          <div className="flex justify-between text-[11px] text-slate-300 font-medium">
            <button
              onClick={toggleMute}
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
              setSpeakerVolume(Number(e.target.value));
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
