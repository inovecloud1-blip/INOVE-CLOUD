import React, { useState } from 'react';
import {
  Wifi,
  Bluetooth,
  Zap,
  Moon,
  Sun,
  Volume2,
  Sliders,
  ShieldCheck,
  Server,
  Cloud,
  HardDrive,
  Settings,
  ChevronRight,
  Headphones,
  Mouse
} from 'lucide-react';
import { AppId, SystemStats } from '../../types';

interface ControlCenterProps {
  isOpen: boolean;
  onClose: () => void;
  stats: SystemStats;
  gpuEnabled: boolean;
  onToggleGpu: () => void;
  onOpenApp: (id: AppId) => void;
}

export const ControlCenter: React.FC<ControlCenterProps> = ({
  isOpen,
  onClose,
  stats,
  gpuEnabled,
  onToggleGpu,
  onOpenApp,
}) => {
  const [wifiActive, setWifiActive] = useState(true);
  const [btActive, setBtActive] = useState(true);
  const [darkActive, setDarkActive] = useState(true);
  const [brightness, setBrightness] = useState(90);
  const [volume, setVolume] = useState(75);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="fixed right-3 top-9 z-50 w-84 liquid-glass rounded-2xl p-4 shadow-2xl border border-white/20 text-slate-100 space-y-3.5 select-none animate-fade-in font-sans">
        {/* Top 2 Primary Connectivity Tiles */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Wi-Fi Tile */}
          <div
            onClick={() => setWifiActive(!wifiActive)}
            className="p-3 liquid-glass-subcard rounded-xl flex items-center justify-between cursor-pointer hover:bg-white/10 transition"
          >
            <div className="flex items-center space-x-2.5">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition shadow-md ${
                  wifiActive ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
                }`}
              >
                <Wifi className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="font-bold text-xs text-white truncate">Wi-Fi</div>
                <div className="text-[10px] text-slate-300 truncate">
                  {wifiActive ? 'InoveCloud-5G' : 'Desativado'}
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
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Bluetooth Tile */}
          <div
            onClick={() => setBtActive(!btActive)}
            className="p-3 liquid-glass-subcard rounded-xl flex items-center justify-between cursor-pointer hover:bg-white/10 transition"
          >
            <div className="flex items-center space-x-2.5">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition shadow-md ${
                  btActive ? 'bg-indigo-500 text-white font-bold' : 'bg-slate-800 text-slate-400'
                }`}
              >
                <Bluetooth className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="font-bold text-xs text-white truncate">Bluetooth</div>
                <div className="text-[10px] text-slate-300 truncate">
                  {btActive ? '3 Dispositivos' : 'Desativado'}
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
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Second Row: GPU Turbo & Modo Escuro */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* GPU Acceleration */}
          <div
            onClick={onToggleGpu}
            className="p-3 liquid-glass-subcard rounded-xl flex items-center space-x-2.5 cursor-pointer hover:bg-white/10 transition"
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md transition ${
                gpuEnabled ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 text-white'
              }`}
            >
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-xs text-white">GPU Turbo</div>
              <div className="text-[10px] text-slate-400">{gpuEnabled ? 'Ativo' : 'Desligado'}</div>
            </div>
          </div>

          {/* Dark / Light Mode */}
          <div
            onClick={() => setDarkActive(!darkActive)}
            className="p-3 liquid-glass-subcard rounded-xl flex items-center space-x-2.5 cursor-pointer hover:bg-white/10 transition"
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md transition ${
                darkActive ? 'bg-purple-600 text-white' : 'bg-amber-400 text-slate-950'
              }`}
            >
              {darkActive ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </div>
            <div>
              <div className="font-bold text-xs text-white">Modo Escuro</div>
              <div className="text-[10px] text-slate-400">{darkActive ? 'Noturno' : 'Claro'}</div>
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
            <span>{brightness}%</span>
          </div>
          <input
            type="range"
            min="20"
            max="100"
            value={brightness}
            onChange={(e) => setBrightness(Number(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg accent-white cursor-pointer"
          />
        </div>

        {/* Volume Slider */}
        <div className="p-3 liquid-glass-subcard rounded-xl space-y-1.5">
          <div className="flex justify-between text-[11px] text-slate-300 font-medium">
            <span className="flex items-center space-x-1">
              <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Volume dos Alto-falantes</span>
            </span>
            <span>{volume}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
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

        {/* Quick Link to Settings */}
        <button
          onClick={() => {
            onOpenApp('settings');
            onClose();
          }}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs transition cursor-pointer shadow-md shadow-red-600/30 flex items-center justify-center space-x-1.5"
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Abrir Configurações do Sistema Operacional...</span>
        </button>
      </div>
    </>
  );
};
export default ControlCenter;
