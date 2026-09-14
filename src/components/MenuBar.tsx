import React, { useState, useEffect } from 'react';
import {
  Cloud,
  Wifi,
  WifiOff,
  Bluetooth,
  ShieldCheck,
  Cpu,
  HardDrive,
  Sliders,
  Search,
  BatteryCharging,
  Zap,
  Terminal,
  Server,
  Layers,
  Users,
  Settings,
  HelpCircle,
  RotateCw,
  Power,
  Globe,
  User,
  LayoutGrid,
  Video,
  Disc,
  Lock,
  Moon,
  Volume2,
  VolumeX,
  Sun
} from 'lucide-react';
import { SystemStats, AppId } from '../types';
import { useSystemSettings } from '../context/SystemSettingsContext';

interface MenuBarProps {
  stats: SystemStats;
  activeAppId: AppId | null;
  onOpenApp: (id: AppId) => void;
  onToggleControlCenter: () => void;
  onToggleSpotlight: () => void;
  isControlCenterOpen: boolean;
  onToggleLauncher?: () => void;
  isLauncherOpen?: boolean;
  onPlayBootVideo?: () => void;
  onOpenPowerModal?: () => void;
}

export const MenuBar: React.FC<MenuBarProps> = ({
  stats,
  activeAppId,
  onOpenApp,
  onToggleControlCenter,
  onToggleSpotlight,
  isControlCenterOpen,
  onToggleLauncher,
  isLauncherOpen,
  onPlayBootVideo,
  onOpenPowerModal,
}) => {
  const {
    wifiEnabled,
    connectedSsid,
    bluetoothEnabled,
    pairedBtCount,
    gpuTurboEnabled,
    speakerVolume,
    isMuted,
    screenBrightness,
    userName,
    userEmail,
    lockScreen,
    requestShutdown,
    requestRestart,
    requestSleep,
    playFeedbackTone,
  } = useSystemSettings();

  const [time, setTime] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [appleMenuOpen, setAppleMenuOpen] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
        })
      );
      setDate(
        now.toLocaleDateString('pt-BR', {
          weekday: 'short',
          day: '2-digit',
          month: 'short',
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const getAppName = (id: AppId | null) => {
    switch (id) {
      case 'vn': return 'Nós Virtuais (VN)';
      case 'webapps': return 'Aplicações Web';
      case 'browser': return 'Navegador Web Local';
      case 'user': return 'Perfil do Usuário';
      case 'idaas': return 'InoveCloud IDaaS';
      case 'appstore': return 'App Store Hub';
      case 'storage': return 'Cloud Storage';
      case 'terminal': return 'Terminal Shell';
      case 'aiagent': return 'Agente IA (MCP)';
      case 'settings': return 'Ajustes do Sistema';
      case 'vnc': return 'Conectar PC (VNC)';
      case 'projects': return 'Projetos & Workspace';
      case 'monitor': return 'Monitor de Recursos';
      case 'isobuilder': return 'Gerador de ISO & Live OS';
      case 'linuxpedia': return 'LinuxPedia (API & Comandos)';
      default: return 'InoveCloud OS';
    }
  };

  return (
    <header className="relative z-50 h-8 w-full glass-menubar text-xs text-white/90 flex items-center justify-between px-3 select-none">
      {/* Left Menu Section */}
      <div className="flex items-center space-x-4">
        {/* InoveCloud Logo / Apple style menu */}
        <div className="relative">
          <button
            onClick={() => setAppleMenuOpen(!appleMenuOpen)}
            className="flex items-center space-x-1.5 px-2 py-0.5 rounded hover:bg-white/10 transition active:scale-95 cursor-pointer"
            title="Menu InoveCloud OS"
          >
            <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-600 flex items-center justify-center shadow-sm">
              <Cloud className="w-2.5 h-2.5 text-white" />
            </div>
            <span className="font-bold tracking-wide text-white text-[13px]">InoveCloud</span>
          </button>

          {/* Apple/Cloud Dropdown */}
          {appleMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setAppleMenuOpen(false)}
              />
              <div className="absolute left-0 top-7 w-64 liquid-glass rounded-xl py-1.5 shadow-2xl z-50 border border-white/25 text-slate-200">
                <div className="px-3 py-2 border-b border-white/10">
                  <div className="font-semibold text-white text-xs">InoveCloud OS 2.4 Enterprise</div>
                  <div className="text-[11px] text-slate-400">{userEmail}</div>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => { onToggleLauncher?.(); setAppleMenuOpen(false); }}
                    className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex items-center justify-between text-xs font-semibold text-purple-300"
                  >
                    <div className="flex items-center space-x-2">
                      <LayoutGrid className="w-3.5 h-3.5" />
                      <span>Launcher (Organizar Apps)...</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">⌘L</span>
                  </button>
                  <button
                    onClick={() => { onOpenApp('settings'); setAppleMenuOpen(false); }}
                    className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex items-center justify-between text-xs"
                  >
                    <span>Sobre o InoveCloud OS</span>
                    <span className="text-[10px] text-slate-400">v2.4</span>
                  </button>
                  <button
                    onClick={() => { onOpenApp('user'); setAppleMenuOpen(false); }}
                    className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex items-center space-x-2 text-xs text-cyan-300"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>Conta: {userName}</span>
                  </button>
                  <button
                    onClick={() => { onOpenApp('settings'); setAppleMenuOpen(false); }}
                    className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex items-center space-x-2 text-xs"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>Ajustes do Sistema...</span>
                  </button>
                </div>

                <div className="my-1 border-t border-white/10" />

                <div className="py-1">
                  <button
                    onClick={() => { onOpenApp('vn'); setAppleMenuOpen(false); }}
                    className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex items-center space-x-2 text-xs"
                  >
                    <Server className="w-3.5 h-3.5" />
                    <span>Gerenciar VNs ({stats.vnsRunning} ativas)</span>
                  </button>
                  <button
                    onClick={() => { onOpenApp('terminal'); setAppleMenuOpen(false); }}
                    className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex items-center space-x-2 text-xs"
                  >
                    <Terminal className="w-3.5 h-3.5" />
                    <span>Cloud Shell Terminal</span>
                  </button>
                  {onPlayBootVideo && (
                    <button
                      onClick={() => { onPlayBootVideo(); setAppleMenuOpen(false); }}
                      className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex items-center space-x-2 text-xs text-cyan-300"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Vídeo de Boot da ISO</span>
                    </button>
                  )}
                </div>

                <div className="my-1 border-t border-white/10" />

                {/* Power & Lock Section */}
                <div className="py-1">
                  {/* Lock Screen */}
                  <button
                    onClick={() => {
                      setAppleMenuOpen(false);
                      lockScreen();
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex items-center justify-between text-xs text-cyan-300 font-medium cursor-pointer"
                  >
                    <div className="flex items-center space-x-2">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Bloquear Tela</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">⌘L</span>
                  </button>

                  {/* Sleep */}
                  <button
                    onClick={() => {
                      setAppleMenuOpen(false);
                      requestSleep();
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex items-center space-x-2 text-xs text-indigo-300 cursor-pointer"
                  >
                    <Moon className="w-3.5 h-3.5" />
                    <span>Suspender Sessão...</span>
                  </button>

                  {/* Restart */}
                  <button
                    onClick={() => {
                      setAppleMenuOpen(false);
                      requestRestart();
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-amber-600 hover:text-white flex items-center space-x-2 text-xs text-amber-300 cursor-pointer"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>Reiniciar Nó / PC...</span>
                  </button>

                  {/* Shutdown */}
                  <button
                    onClick={() => {
                      setAppleMenuOpen(false);
                      requestShutdown();
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-red-600 hover:text-white flex items-center space-x-2 text-xs text-red-400 font-semibold cursor-pointer"
                  >
                    <Power className="w-3.5 h-3.5" />
                    <span>Desligar Computador...</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Current Active App Name */}
        <span className="font-semibold text-white/95 text-[13px] hidden sm:inline-block">
          {getAppName(activeAppId)}
        </span>

        {/* Launcher Quick Trigger Button */}
        {onToggleLauncher && (
          <button
            onClick={onToggleLauncher}
            className={`flex items-center space-x-1.5 px-2 py-0.5 rounded transition cursor-pointer text-xs ${
              isLauncherOpen
                ? 'bg-purple-600/40 text-purple-200 border border-purple-400/40'
                : 'hover:bg-white/10 text-slate-300 hover:text-white'
            }`}
            title="Abrir Launcher de Apps (⌘L)"
          >
            <LayoutGrid className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden lg:inline text-[11px] font-medium">Launcher</span>
          </button>
        )}

        {/* Traditional Mac Desktop Menus */}
        <div className="hidden md:flex items-center space-x-3 text-slate-300">
          <button
            onClick={() => onOpenApp('vn')}
            className="hover:text-white transition px-1.5 py-0.5 rounded hover:bg-white/10 cursor-pointer"
          >
            Nós Virtuais
          </button>
          <button
            onClick={() => onOpenApp('webapps')}
            className="hover:text-white transition px-1.5 py-0.5 rounded hover:bg-white/10 cursor-pointer"
          >
            Web Apps
          </button>
          <button
            onClick={() => onOpenApp('idaas')}
            className="hover:text-white transition px-1.5 py-0.5 rounded hover:bg-white/10 cursor-pointer"
          >
            IDaaS
          </button>
          <button
            onClick={() => onOpenApp('aiagent')}
            className="hover:text-white transition px-1.5 py-0.5 rounded hover:bg-white/10 flex items-center space-x-1 cursor-pointer"
          >
            <Zap className="w-3 h-3 text-amber-400" />
            <span>Agente IA</span>
          </button>
        </div>
      </div>

      {/* Right Status Bar Section */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* HTTPS ON Pill */}
        <div
          onClick={() => onOpenApp('webapps')}
          className="cursor-pointer hidden lg:flex items-center space-x-1.5 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-medium hover:bg-emerald-500/30 transition"
          title="SSL Let's Encrypt Ativo para todas as rotas"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>https ON</span>
        </div>

        {/* GPU Acceleration Pill */}
        <div
          onClick={() => onOpenApp('settings')}
          className={`cursor-pointer hidden xl:flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-medium border transition ${
            gpuTurboEnabled
              ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
              : 'bg-slate-800/40 text-slate-400 border-slate-700/30'
          }`}
          title="GPU Acceleration Status"
        >
          <Zap className={`w-3 h-3 ${gpuTurboEnabled ? 'text-cyan-400' : 'text-slate-500'}`} />
          <span>GPU Turbo</span>
        </div>

        {/* Quick Hardware Indicators */}
        <div
          onClick={() => onOpenApp('vn')}
          className="cursor-pointer hidden md:flex items-center space-x-2 px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-[11px] text-slate-300 transition"
          title="Uso de Hardware do Nó InoveCloud"
        >
          <div className="flex items-center space-x-1">
            <Cpu className="w-3 h-3 text-cyan-400" />
            <span>{stats.cpuUsage}%</span>
          </div>
          <div className="w-px h-3 bg-white/20" />
          <div className="flex items-center space-x-1">
            <HardDrive className="w-3 h-3 text-indigo-400" />
            <span>{stats.ramUsage}%</span>
          </div>
        </div>

        {/* Spotlight Search Icon */}
        <button
          onClick={onToggleSpotlight}
          className="p-1 rounded hover:bg-white/10 text-white/80 hover:text-white transition cursor-pointer"
          title="Busca Rápida (Cmd+K)"
        >
          <Search className="w-3.5 h-3.5" />
        </button>

        {/* Wi-Fi Icon */}
        <button
          onClick={onToggleControlCenter}
          className="p-1 hover:bg-white/10 rounded transition cursor-pointer"
          title={wifiEnabled ? `Wi-Fi: ${connectedSsid}` : 'Wi-Fi Desativado'}
        >
          {wifiEnabled ? (
            <Wifi className="w-3.5 h-3.5 text-cyan-400" />
          ) : (
            <WifiOff className="w-3.5 h-3.5 text-slate-500" />
          )}
        </button>

        {/* Bluetooth Icon */}
        <button
          onClick={onToggleControlCenter}
          className="p-1 hover:bg-white/10 rounded transition cursor-pointer"
          title={bluetoothEnabled ? `Bluetooth: ${pairedBtCount} dispositivos` : 'Bluetooth Desativado'}
        >
          <Bluetooth className={`w-3.5 h-3.5 ${bluetoothEnabled ? 'text-indigo-400' : 'text-slate-500'}`} />
        </button>

        {/* Volume Icon */}
        <button
          onClick={onToggleControlCenter}
          className="p-1 hover:bg-white/10 rounded transition cursor-pointer"
          title={`Volume: ${isMuted ? 'Mudo' : `${speakerVolume}%`}`}
        >
          {isMuted || speakerVolume === 0 ? (
            <VolumeX className="w-3.5 h-3.5 text-red-400" />
          ) : (
            <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
          )}
        </button>

        {/* Battery Status */}
        <div className="hidden sm:flex items-center space-x-1 text-slate-300" title="Bateria: 100% Carregada (AC Conectado)">
          <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-[10px]">100%</span>
        </div>

        {/* Quick Lock Button */}
        <button
          onClick={() => {
            playFeedbackTone();
            lockScreen();
          }}
          className="p-1 text-cyan-300 hover:bg-cyan-500/20 rounded transition cursor-pointer"
          title="Bloquear Tela (⌘L)"
        >
          <Lock className="w-3.5 h-3.5" />
        </button>

        {/* Control Center Toggle */}
        <button
          onClick={onToggleControlCenter}
          className={`p-1 rounded transition cursor-pointer ${
            isControlCenterOpen ? 'bg-blue-600 text-white shadow' : 'hover:bg-white/10 text-white/80 hover:text-white'
          }`}
          title="Central de Controle"
        >
          <Sliders className="w-3.5 h-3.5" />
        </button>

        {/* Date & Time */}
        <div
          onClick={onToggleControlCenter}
          className="pl-1 text-white/95 font-medium flex items-center space-x-1.5 cursor-pointer hover:text-cyan-300 transition"
          title="Clique para abrir Central de Controle"
        >
          <span className="hidden sm:inline-block text-slate-300">{date}</span>
          <span className="font-semibold">{time}</span>
        </div>
      </div>
    </header>
  );
};
export default MenuBar;
