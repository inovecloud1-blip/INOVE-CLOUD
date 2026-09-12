import React, { useState, useEffect } from 'react';
import {
  Cloud,
  Wifi,
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
  Disc
} from 'lucide-react';
import { SystemStats, AppId } from '../types';

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
}) => {
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
            className="flex items-center space-x-1.5 px-2 py-0.5 rounded hover:bg-white/10 transition active:scale-95"
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
              <div className="absolute left-0 top-7 w-60 liquid-glass rounded-xl py-1.5 shadow-2xl z-50 border border-white/25 text-slate-200">
                <div className="px-3 py-2 border-b border-white/10">
                  <div className="font-semibold text-white text-xs">InoveCloud OS 2.4 Enterprise</div>
                  <div className="text-[11px] text-slate-400">Node: cluster-alpha-sa-east1</div>
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
                    <span>Conta: inovecloud1@gmail.com</span>
                  </button>
                  <button
                    onClick={() => { onOpenApp('browser'); setAppleMenuOpen(false); }}
                    className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex items-center space-x-2 text-xs"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>Navegador Web Local...</span>
                  </button>
                  <button
                    onClick={() => { onOpenApp('settings'); setAppleMenuOpen(false); }}
                    className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex items-center space-x-2 text-xs"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>Ajustes do Sistema...</span>
                  </button>
                  <button
                    onClick={() => { onOpenApp('appstore'); setAppleMenuOpen(false); }}
                    className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex items-center space-x-2 text-xs"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>App Store Hub...</span>
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
                    onClick={() => { onOpenApp('idaas'); setAppleMenuOpen(false); }}
                    className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex items-center space-x-2 text-xs"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>InoveCloud IDaaS & SSO</span>
                  </button>
                  <button
                    onClick={() => { onOpenApp('terminal'); setAppleMenuOpen(false); }}
                    className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex items-center space-x-2 text-xs"
                  >
                    <Terminal className="w-3.5 h-3.5" />
                    <span>Cloud Shell Terminal</span>
                  </button>
                </div>

                <div className="my-1 border-t border-white/10" />

                <div className="py-1">
                  {onPlayBootVideo && (
                    <button
                      onClick={() => { onPlayBootVideo(); setAppleMenuOpen(false); }}
                      className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex items-center space-x-2 text-xs text-cyan-300"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Vídeo de Boot da ISO</span>
                    </button>
                  )}
                  <button
                    onClick={() => { window.location.reload(); }}
                    className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex items-center space-x-2 text-xs text-amber-300"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>Reiniciar Nó Cloud</span>
                  </button>
                  <button
                    onClick={() => { setAppleMenuOpen(false); }}
                    className="w-full text-left px-3 py-1.5 hover:bg-red-600 hover:text-white flex items-center space-x-2 text-xs text-red-400"
                  >
                    <Power className="w-3.5 h-3.5" />
                    <span>Bloquear Sessão</span>
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
            className="hover:text-white transition px-1.5 py-0.5 rounded hover:bg-white/10"
          >
            Nós Virtuais
          </button>
          <button
            onClick={() => onOpenApp('webapps')}
            className="hover:text-white transition px-1.5 py-0.5 rounded hover:bg-white/10"
          >
            Web Apps
          </button>
          <button
            onClick={() => onOpenApp('idaas')}
            className="hover:text-white transition px-1.5 py-0.5 rounded hover:bg-white/10"
          >
            IDaaS
          </button>
          <button
            onClick={() => onOpenApp('aiagent')}
            className="hover:text-white transition px-1.5 py-0.5 rounded hover:bg-white/10 flex items-center space-x-1"
          >
            <Zap className="w-3 h-3 text-amber-400" />
            <span>Agente IA</span>
          </button>
        </div>
      </div>

      {/* Right Status Bar Section */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* HTTPS ON Pill (Umbrel 2.0 inspired) */}
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
          className="cursor-pointer hidden xl:flex items-center space-x-1 px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[11px] font-medium"
          title="NVIDIA RTX A5000 Passthrough Ativado"
        >
          <Zap className="w-3 h-3 text-cyan-400" />
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
          className="p-1 rounded hover:bg-white/10 text-white/80 hover:text-white transition"
          title="Busca Rápida (Cmd+K)"
        >
          <Search className="w-3.5 h-3.5" />
        </button>

        {/* Wi-Fi / Cloud VPC Icon */}
        <button
          onClick={() => onOpenApp('settings')}
          className="p-1 text-emerald-400 hover:bg-white/10 rounded transition cursor-pointer"
          title="Wi-Fi: InoveCloud-5G-Ultra (Clique para Configurar)"
        >
          <Wifi className="w-3.5 h-3.5" />
        </button>

        {/* Bluetooth Icon */}
        <button
          onClick={() => onOpenApp('settings')}
          className="p-1 text-indigo-400 hover:bg-white/10 rounded transition cursor-pointer"
          title="Bluetooth: 3 Dispositivos Conectados (Clique para Configurar)"
        >
          <Bluetooth className="w-3.5 h-3.5" />
        </button>

        {/* User Profile Quick Access */}
        <button
          onClick={() => onOpenApp('user')}
          className="flex items-center space-x-1.5 px-1.5 py-0.5 rounded hover:bg-white/10 text-white/80 hover:text-white transition cursor-pointer"
          title="Perfil do Usuário: inovecloud1@gmail.com"
        >
          <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-cyan-400 to-indigo-600 flex items-center justify-center text-[9px] font-bold text-white shadow-sm">
            U
          </div>
          <span className="hidden lg:inline text-[11px] font-medium text-slate-200">Admin</span>
        </button>

        {/* Control Center Toggle */}
        <button
          onClick={onToggleControlCenter}
          className={`p-1 rounded transition ${
            isControlCenterOpen ? 'bg-blue-600 text-white' : 'hover:bg-white/10 text-white/80 hover:text-white'
          }`}
          title="Central de Controle"
        >
          <Sliders className="w-3.5 h-3.5" />
        </button>

        {/* Date & Time */}
        <div className="pl-1 text-white/95 font-medium flex items-center space-x-1.5 cursor-default">
          <span className="hidden sm:inline-block text-slate-300">{date}</span>
          <span className="font-semibold">{time}</span>
        </div>
      </div>
    </header>
  );
};
