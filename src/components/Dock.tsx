import React, { useState, useRef, useEffect } from 'react';
import {
  Server,
  Globe,
  Users,
  Layers,
  HardDrive,
  Terminal,
  Bot,
  Settings,
  Activity,
  FolderKanban,
  Monitor,
  Wifi,
  Sparkles,
  ShieldCheck,
  Cpu,
  Compass,
  User,
  LayoutGrid,
  Pin,
  PinOff,
  X,
  RotateCcw,
  Sliders,
  Check,
  ExternalLink,
  Minimize2,
  Disc,
  BookOpen
} from 'lucide-react';
import { AppId } from '../types';
import { DEFAULT_DOCK_PINNED } from '../data/launcherApps';
import { AppIcon } from './desktop/AppIcon';

interface DockItemConfig {
  id: AppId;
  label: string;
  subLabel?: string;
  gradient: string;
  glowColor: string;
  badge?: string;
  badgeColor?: string;
  isUtility?: boolean;
  renderIcon: () => React.ReactNode;
}

interface DockProps {
  openAppIds: AppId[];
  activeAppId: AppId | null;
  onOpenApp: (id: AppId) => void;
  onCloseApp?: (id: AppId) => void;
  onMinimizeApp?: (id: AppId) => void;
  onToggleLauncher?: () => void;
  isLauncherOpen?: boolean;
  dockPinnedApps?: AppId[];
  onTogglePinDock?: (id: AppId) => void;
  onClearDockExceptLauncher?: () => void;
  onResetDockDefault?: () => void;
  showOpenWindowsInDock?: boolean;
  onToggleShowOpenWindows?: () => void;
}

export const Dock: React.FC<DockProps> = ({
  openAppIds,
  activeAppId,
  onOpenApp,
  onCloseApp,
  onMinimizeApp,
  onToggleLauncher,
  isLauncherOpen,
  dockPinnedApps = DEFAULT_DOCK_PINNED,
  onTogglePinDock,
  onClearDockExceptLauncher,
  onResetDockDefault,
  showOpenWindowsInDock = true,
  onToggleShowOpenWindows,
}) => {
  const [mouseX, setMouseX] = useState<number | null>(null);
  const [hoveredApp, setHoveredApp] = useState<AppId | null>(null);
  const [bouncingAppId, setBouncingAppId] = useState<AppId | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    appId: AppId;
    x: number;
    y: number;
  } | null>(null);
  const [isDockOptionsOpen, setIsDockOptionsOpen] = useState(false);

  const dockRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<AppId, HTMLDivElement>>(new Map());

  // Close context menu on window click
  useEffect(() => {
    const handleOutsideClick = () => {
      setContextMenu(null);
      setIsDockOptionsOpen(false);
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  // Master definition of all macOS squircle icons
  const masterDockItems: DockItemConfig[] = [
    {
      id: 'projects',
      label: 'Projetos & Workspace',
      subLabel: 'Kanban, Tarefas & Arquivos',
      gradient: 'from-amber-400 via-amber-500 to-orange-600',
      glowColor: 'rgba(245, 158, 11, 0.5)',
      renderIcon: () => (
        <div className="relative flex items-center justify-center">
          <FolderKanban className="w-6 h-6 text-white drop-shadow-md" />
          <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full bg-yellow-300 border border-amber-600" />
        </div>
      ),
    },
    {
      id: 'vn',
      label: 'Nós Virtuais (VN)',
      subLabel: 'Hypervisor KVM & Instâncias',
      gradient: 'from-blue-600 via-indigo-600 to-indigo-800',
      glowColor: 'rgba(59, 130, 246, 0.5)',
      badge: '5 VMs',
      badgeColor: 'bg-blue-500',
      renderIcon: () => (
        <div className="relative flex items-center justify-center">
          <Server className="w-6 h-6 text-white drop-shadow-md" />
          <div className="absolute -top-1 -right-1 flex space-x-0.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>
        </div>
      ),
    },
    {
      id: 'vnc',
      label: 'Conectar PC (VNC / RDP)',
      subLabel: 'Acesso Remoto ao Computador',
      gradient: 'from-cyan-500 via-blue-600 to-indigo-700',
      glowColor: 'rgba(6, 182, 212, 0.6)',
      badge: 'PC',
      badgeColor: 'bg-cyan-500',
      renderIcon: () => (
        <div className="relative flex items-center justify-center">
          <Monitor className="w-6 h-6 text-white drop-shadow-md" />
          <div className="absolute -top-1 -right-1 bg-cyan-400/90 rounded-full p-0.5 border border-slate-900 shadow">
            <Wifi className="w-2.5 h-2.5 text-slate-950" />
          </div>
        </div>
      ),
    },
    {
      id: 'browser',
      label: 'Navegador Web Local',
      subLabel: 'Browser, Dashboards & DevTools',
      gradient: 'from-cyan-400 via-sky-500 to-blue-600',
      glowColor: 'rgba(6, 182, 212, 0.5)',
      badge: 'WEB',
      badgeColor: 'bg-cyan-500',
      renderIcon: () => (
        <div className="relative flex items-center justify-center">
          <Compass className="w-6 h-6 text-white drop-shadow-md" />
          <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-300 border border-slate-900" />
        </div>
      ),
    },
    {
      id: 'webapps',
      label: 'Aplicações Web & SSL',
      subLabel: 'Proxy Reverso & Certificados',
      gradient: 'from-sky-400 via-blue-500 to-cyan-700',
      glowColor: 'rgba(14, 165, 233, 0.5)',
      renderIcon: () => (
        <div className="relative flex items-center justify-center">
          <Globe className="w-6 h-6 text-white drop-shadow-md" />
          <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-0.5 border border-slate-900 shadow">
            <ShieldCheck className="w-2.5 h-2.5 text-white" />
          </div>
        </div>
      ),
    },
    {
      id: 'idaas',
      label: 'InoveCloud IDaaS',
      subLabel: 'Gestão de Acesso & SSO',
      gradient: 'from-emerald-500 via-teal-600 to-slate-800',
      glowColor: 'rgba(16, 185, 129, 0.5)',
      renderIcon: () => (
        <div className="relative flex items-center justify-center">
          <Users className="w-6 h-6 text-white drop-shadow-md" />
        </div>
      ),
    },
    {
      id: 'appstore',
      label: 'App Store Hub',
      subLabel: '1-Click Docker Catalog',
      gradient: 'from-purple-500 via-indigo-600 to-violet-800',
      glowColor: 'rgba(147, 51, 234, 0.5)',
      renderIcon: () => (
        <div className="relative flex items-center justify-center">
          <Layers className="w-6 h-6 text-white drop-shadow-md" />
        </div>
      ),
    },
    {
      id: 'storage',
      label: 'Cloud Storage & Fotos',
      subLabel: 'Backup S3 & Mídia',
      gradient: 'from-rose-500 via-pink-600 to-red-600',
      glowColor: 'rgba(244, 63, 94, 0.5)',
      renderIcon: () => (
        <div className="relative flex items-center justify-center">
          <HardDrive className="w-6 h-6 text-white drop-shadow-md" />
        </div>
      ),
    },
    {
      id: 'terminal',
      label: 'Cloud Shell (CLI)',
      subLabel: 'inovectl & Bash Root',
      gradient: 'from-zinc-800 via-slate-900 to-neutral-950',
      glowColor: 'rgba(16, 185, 129, 0.4)',
      renderIcon: () => (
        <div className="relative flex items-center justify-center font-mono font-bold text-emerald-400 text-sm">
          <Terminal className="w-5 h-5 text-emerald-400" />
          <span className="absolute text-[9px] font-black text-emerald-300 right-0 top-3">&gt;</span>
        </div>
      ),
    },
    {
      id: 'aiagent',
      label: 'Agente IA (MCP)',
      subLabel: 'Gemini Cloud Copilot',
      gradient: 'from-fuchsia-600 via-purple-600 to-blue-600',
      glowColor: 'rgba(192, 38, 211, 0.6)',
      badge: 'AI',
      badgeColor: 'bg-fuchsia-500',
      renderIcon: () => (
        <div className="relative flex items-center justify-center">
          <Bot className="w-6 h-6 text-white drop-shadow-md animate-pulse" />
          <Sparkles className="w-3 h-3 text-yellow-300 absolute -top-1 -left-1 animate-spin" style={{ animationDuration: '6s' }} />
        </div>
      ),
    },
    {
      id: 'monitor',
      label: 'Monitor de Recursos',
      subLabel: 'CPU, RAM, NVMe & GPU',
      gradient: 'from-teal-500 via-cyan-600 to-slate-800',
      glowColor: 'rgba(20, 184, 166, 0.5)',
      isUtility: true,
      renderIcon: () => (
        <div className="relative flex items-center justify-center">
          <Activity className="w-6 h-6 text-white drop-shadow-md" />
        </div>
      ),
    },
    {
      id: 'user',
      label: 'Perfil do Usuário',
      subLabel: 'Contas, Chaves SSH & 2FA',
      gradient: 'from-blue-600 via-indigo-600 to-purple-700',
      glowColor: 'rgba(99, 102, 241, 0.5)',
      isUtility: true,
      renderIcon: () => (
        <div className="relative flex items-center justify-center">
          <User className="w-6 h-6 text-white drop-shadow-md" />
          <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-slate-900" />
        </div>
      ),
    },
    {
      id: 'settings',
      label: 'Ajustes & Wallpapers',
      subLabel: 'Preferências do Sistema',
      gradient: 'from-slate-600 via-slate-700 to-zinc-800',
      glowColor: 'rgba(148, 163, 184, 0.4)',
      isUtility: true,
      renderIcon: () => (
        <div className="relative flex items-center justify-center">
          <Settings className="w-6 h-6 text-slate-100 drop-shadow-md" />
        </div>
      ),
    },
    {
      id: 'isobuilder',
      label: 'Gerador de ISO & Live OS',
      subLabel: 'Debian 12 Kiosk Appliance',
      gradient: 'from-red-600 via-rose-600 to-amber-600',
      glowColor: 'rgba(239, 68, 68, 0.5)',
      isUtility: false,
      renderIcon: () => (
        <div className="relative flex items-center justify-center">
          <Disc className="w-6 h-6 text-white drop-shadow-md" />
        </div>
      ),
    },
    {
      id: 'linuxpedia',
      label: 'LinuxPedia (API & Comandos)',
      subLabel: 'Enciclopédia de Comandos',
      gradient: 'from-emerald-600 via-teal-600 to-cyan-700',
      glowColor: 'rgba(16, 185, 129, 0.5)',
      isUtility: false,
      renderIcon: () => (
        <div className="relative flex items-center justify-center">
          <BookOpen className="w-6 h-6 text-white drop-shadow-md" />
        </div>
      ),
    },
  ];

  // Resolve which items appear in the dock:
  // 1. All pinned apps
  // 2. Plus open apps/windows if showOpenWindowsInDock is enabled
  const renderedDockItems: DockItemConfig[] = [];

  // Add pinned apps in user-specified order
  dockPinnedApps.forEach((pId) => {
    const item = masterDockItems.find((i) => i.id === pId);
    if (item && !renderedDockItems.some((r) => r.id === item.id)) {
      renderedDockItems.push(item);
    }
  });

  // Add open windows if showOpenWindowsInDock is true
  if (showOpenWindowsInDock) {
    openAppIds.forEach((oId) => {
      const item = masterDockItems.find((i) => i.id === oId);
      if (item && !renderedDockItems.some((r) => r.id === item.id)) {
        renderedDockItems.push(item);
      }
    });
  }

  // Calculate magnification scale for an item based on mouse distance
  const getScale = (id: AppId) => {
    if (mouseX === null) return 1;
    const el = itemRefs.current.get(id);
    if (!el) return 1;

    const rect = el.getBoundingClientRect();
    const itemCenter = rect.left + rect.width / 2;
    const distance = Math.abs(mouseX - itemCenter);
    const maxDistance = 140; // Magnification radius in px

    if (distance >= maxDistance) return 1;

    // Smooth Cosine easing curve: max 1.52x magnification
    const factor = Math.cos((distance / maxDistance) * (Math.PI / 2));
    return 1 + factor * 0.52;
  };

  const handleAppClick = (id: AppId) => {
    // Trigger macOS bounce
    setBouncingAppId(id);
    setTimeout(() => {
      setBouncingAppId(null);
    }, 750);

    onOpenApp(id);
  };

  const handleContextMenu = (e: React.MouseEvent, id: AppId) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDockOptionsOpen(false);
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setContextMenu({
      appId: id,
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
    });
  };

  const isOnlyLauncher = renderedDockItems.length === 0;

  return (
    <div className="fixed bottom-3 left-0 right-0 z-40 flex justify-center pointer-events-none select-none">
      <div
        ref={dockRef}
        onMouseMove={(e) => setMouseX(e.clientX)}
        onMouseLeave={() => {
          setMouseX(null);
          setHoveredApp(null);
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          setIsDockOptionsOpen(true);
        }}
        className={`pointer-events-auto flex items-end px-3.5 py-2.5 rounded-3xl glass-dock transition-all duration-300 relative border border-white/30 ${
          isOnlyLauncher ? 'ring-2 ring-purple-500/50 shadow-purple-500/20' : ''
        }`}
      >
        {/* Launchpad / Launcher Button */}
        {onToggleLauncher && (
          <>
            <div className="relative flex flex-col items-center group mx-1 origin-bottom">
              {/* Tooltip for Launcher */}
              {isOnlyLauncher && hoveredApp === null && (
                <div className="absolute -top-12 px-3 py-1.5 bg-purple-900/95 text-white rounded-xl shadow-2xl backdrop-blur-xl border border-purple-400/30 whitespace-nowrap animate-fade-in pointer-events-none z-50 flex flex-col items-center">
                  <span className="text-xs font-bold leading-tight tracking-wide">
                    Launcher de Apps (Dock Minimalista)
                  </span>
                  <span className="text-[10px] text-purple-200">Clique para abrir todos os aplicativos</span>
                  <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-purple-900/95 rotate-45 border-r border-b border-purple-400/30" />
                </div>
              )}

              <button
                onClick={onToggleLauncher}
                className="relative flex items-center justify-center rounded-2xl p-2.5 transition-all duration-200 cursor-pointer shadow-lg active:scale-95 bg-gradient-to-tr from-fuchsia-600 via-purple-600 to-indigo-700 border border-white/25 hover:shadow-purple-500/50 hover:scale-110"
                style={{
                  width: '46px',
                  height: '46px',
                }}
                title="Launcher de Aplicativos (Organizar & Fixar na Tela Inicial / Dock)"
              >
                <LayoutGrid className="w-6 h-6 text-white drop-shadow-md" />
              </button>

              {/* Dot indicator if launcher is open */}
              <div className="h-1.5 flex items-center justify-center mt-1">
                {isLauncherOpen ? (
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400 animate-pulse" />
                ) : (
                  <div className="w-1 h-1 rounded-full bg-transparent" />
                )}
              </div>
            </div>

            {/* Separator if there are other items */}
            {renderedDockItems.length > 0 && (
              <div className="w-px h-8 bg-white/20 mx-1 self-center rounded-full shrink-0" />
            )}
          </>
        )}

        {/* Rendered Dock Apps */}
        {renderedDockItems.map((item, index) => {
          const isOpen = openAppIds.includes(item.id);
          const isActive = activeAppId === item.id;
          const isHovered = hoveredApp === item.id;
          const isBouncing = bouncingAppId === item.id;
          const isPinned = dockPinnedApps.includes(item.id);
          const scale = getScale(item.id);

          return (
            <React.Fragment key={item.id}>
              <div
                ref={(node) => {
                  if (node) itemRefs.current.set(item.id, node);
                  else itemRefs.current.delete(item.id);
                }}
                className="relative flex flex-col items-center group mx-1 origin-bottom"
                onMouseEnter={() => setHoveredApp(item.id)}
                onMouseLeave={() => setHoveredApp(null)}
              >
                {/* macOS Magnified Tooltip with subLabel */}
                {isHovered && !contextMenu && (
                  <div className="absolute -top-12 px-3 py-1.5 bg-slate-900/95 text-white rounded-xl shadow-2xl backdrop-blur-xl border border-white/15 whitespace-nowrap animate-fade-in pointer-events-none z-50 flex flex-col items-center">
                    <span className="text-xs font-bold leading-tight tracking-wide">{item.label}</span>
                    {item.subLabel && (
                      <span className="text-[10px] text-slate-400 font-medium">{item.subLabel}</span>
                    )}
                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-900/95 rotate-45 border-r border-b border-white/15" />
                  </div>
                )}

                {/* Squircle App Icon Container */}
                <div
                  className={`relative ${isBouncing ? 'animate-dock-bounce' : ''}`}
                  style={{
                    transform: `scale(${scale}) translateY(${scale > 1.05 ? -(scale - 1) * 26 : 0}px)`,
                    transformOrigin: 'bottom center',
                    transition: 'transform 120ms cubic-bezier(0.2, 0.8, 0.2, 1)',
                  }}
                >
                  <button
                    onClick={() => handleAppClick(item.id)}
                    onContextMenu={(e) => handleContextMenu(e, item.id)}
                    className="relative cursor-pointer active:scale-95 transition-transform duration-200"
                  >
                    <AppIcon appId={item.id} size="md" className="w-12 h-12" />

                    {/* Badge notification (e.g. 5 VMs, PC, AI) */}
                    {item.badge && (
                      <span
                        className={`absolute -top-1 -right-1 px-1.5 py-0.2 ${
                          item.badgeColor || 'bg-red-500'
                        } text-white text-[9px] font-black rounded-full border border-white/60 shadow-md z-20`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                </div>

                {/* macOS Running / Active Dot Indicator */}
                <div className="h-2 flex items-center justify-center mt-1">
                  {isOpen ? (
                    <div
                      className={`transition-all duration-300 rounded-full ${
                        isActive
                          ? 'w-4 h-1 bg-white shadow-glow'
                          : 'w-1.5 h-1.5 bg-white/70 hover:bg-white'
                      }`}
                      style={{
                        boxShadow: isActive ? '0 0 8px rgba(255, 255, 255, 0.9)' : undefined,
                      }}
                    />
                  ) : (
                    <div className="w-1.5 h-1.5 opacity-0" />
                  )}
                </div>
              </div>
            </React.Fragment>
          );
        })}

        {/* Subtle Dock Settings Gear/Options Icon Button at the end */}
        <div className="relative flex flex-col items-center group ml-1 origin-bottom self-center mb-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsDockOptionsOpen((prev) => !prev);
              setContextMenu(null);
            }}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer border border-transparent hover:border-white/15"
            title="Ajustes da Dock (Deixar só o Launcher / Gerenciar Apps & Janelas)"
          >
            <Sliders className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Right-Click Context Menu on App Icon */}
      {contextMenu && (
        <div
          className="fixed z-50 py-2 w-64 bg-slate-900/95 text-white rounded-2xl shadow-2xl backdrop-blur-2xl border border-white/20 animate-fade-in pointer-events-auto"
          style={{
            left: Math.max(12, Math.min(window.innerWidth - 270, contextMenu.x - 120)),
            bottom: '75px',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {(() => {
            const app = masterDockItems.find((i) => i.id === contextMenu.appId);
            const isOpen = openAppIds.includes(contextMenu.appId);
            const isPinned = dockPinnedApps.includes(contextMenu.appId);

            return (
              <>
                <div className="px-3 pb-2 mb-1 border-b border-white/10 flex items-center justify-between">
                  <span className="text-xs font-bold text-white truncate">{app?.label}</span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    isOpen ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-700 text-slate-300'
                  }`}>
                    {isOpen ? 'Janela Aberta' : 'Fechada'}
                  </span>
                </div>

                {/* Open / Focus */}
                <button
                  onClick={() => {
                    handleAppClick(contextMenu.appId);
                    setContextMenu(null);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-blue-600 text-xs flex items-center space-x-2 text-slate-200 hover:text-white cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>{isOpen ? 'Trazer para Frente' : 'Abrir Aplicativo'}</span>
                </button>

                {/* Minimize if open */}
                {isOpen && onMinimizeApp && (
                  <button
                    onClick={() => {
                      onMinimizeApp(contextMenu.appId);
                      setContextMenu(null);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-blue-600 text-xs flex items-center space-x-2 text-slate-200 hover:text-white cursor-pointer"
                  >
                    <Minimize2 className="w-3.5 h-3.5" />
                    <span>Minimizar Janela</span>
                  </button>
                )}

                {/* Close window if open */}
                {isOpen && onCloseApp && (
                  <button
                    onClick={() => {
                      onCloseApp(contextMenu.appId);
                      setContextMenu(null);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-red-600 text-xs flex items-center space-x-2 text-red-300 hover:text-white cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Fechar Janela (Tirar da Tela)</span>
                  </button>
                )}

                <div className="my-1 border-t border-white/10" />

                {/* Pin / Unpin from Dock */}
                {onTogglePinDock && (
                  <button
                    onClick={() => {
                      onTogglePinDock(contextMenu.appId);
                      setContextMenu(null);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-blue-600 text-xs flex items-center justify-between text-slate-200 hover:text-white cursor-pointer"
                  >
                    <div className="flex items-center space-x-2">
                      {isPinned ? <PinOff className="w-3.5 h-3.5 text-amber-400" /> : <Pin className="w-3.5 h-3.5 text-cyan-400" />}
                      <span>{isPinned ? 'Remover da Dock' : 'Manter na Dock'}</span>
                    </div>
                    {isPinned && <span className="text-[10px] text-slate-400">Fixado</span>}
                  </button>
                )}

                <div className="my-1 border-t border-white/10" />

                {/* Leave only launcher on dock */}
                {onClearDockExceptLauncher && (
                  <button
                    onClick={() => {
                      onClearDockExceptLauncher();
                      setContextMenu(null);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-purple-600 text-xs flex items-center space-x-2 text-purple-300 hover:text-white cursor-pointer"
                  >
                    <LayoutGrid className="w-3.5 h-3.5 text-purple-400" />
                    <span className="font-semibold">Deixar apenas Launcher na Dock</span>
                  </button>
                )}

                {/* Restore default */}
                {onResetDockDefault && (
                  <button
                    onClick={() => {
                      onResetDockDefault();
                      setContextMenu(null);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-white/10 text-xs flex items-center space-x-2 text-slate-400 hover:text-white cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restaurar Dock Padrão</span>
                  </button>
                )}
              </>
            );
          })()}
        </div>
      )}

      {/* Dock Quick Options Popup Menu */}
      {isDockOptionsOpen && (
        <div
          className="fixed z-50 py-3 px-3.5 w-72 bg-slate-900/95 text-white rounded-2xl shadow-2xl backdrop-blur-2xl border border-white/20 animate-fade-in pointer-events-auto"
          style={{
            bottom: '75px',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
            <div className="flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <h4 className="text-xs font-extrabold text-white">Preferências da Dock</h4>
            </div>
            <button
              onClick={() => setIsDockOptionsOpen(false)}
              className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2">
            {/* Action 1: Leave only Launcher on dock */}
            {onClearDockExceptLauncher && (
              <button
                onClick={() => {
                  onClearDockExceptLauncher();
                  setIsDockOptionsOpen(false);
                }}
                className={`w-full text-left p-2.5 rounded-xl border transition cursor-pointer flex items-center space-x-2.5 ${
                  isOnlyLauncher
                    ? 'bg-purple-600/30 border-purple-500/50 text-purple-200'
                    : 'bg-white/5 hover:bg-purple-600/20 border-white/10 hover:border-purple-500/40 text-white'
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-fuchsia-600 to-indigo-600 flex items-center justify-center shrink-0">
                  <LayoutGrid className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-xs font-bold text-purple-300">
                    ⭐ Deixar apenas Launcher na Dock
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Remove todos os apps e mantém a dock minimalista
                  </div>
                </div>
              </button>
            )}

            {/* Toggle: Show open windows in dock */}
            {onToggleShowOpenWindows && (
              <div
                onClick={onToggleShowOpenWindows}
                className="w-full text-left p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-400" />
                  <div>
                    <div className="text-xs font-semibold text-white">
                      Mostrar janelas abertas na Dock
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {showOpenWindowsInDock ? 'Janelas ativas aparecem na dock' : 'Apenas apps fixados aparecem'}
                    </div>
                  </div>
                </div>
                <div className={`w-8 h-4 rounded-full transition-colors flex items-center p-0.5 ${
                  showOpenWindowsInDock ? 'bg-cyan-500 justify-end' : 'bg-slate-700 justify-start'
                }`}>
                  <div className="w-3 h-3 rounded-full bg-white shadow-sm" />
                </div>
              </div>
            )}

            {/* Open Launcher to configure apps */}
            {onToggleLauncher && (
              <button
                onClick={() => {
                  onToggleLauncher();
                  setIsDockOptionsOpen(false);
                }}
                className="w-full text-left p-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs flex items-center justify-between text-slate-300 hover:text-white transition cursor-pointer"
              >
                <span className="flex items-center space-x-2">
                  <Pin className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Escolher quais apps ficam na Dock</span>
                </span>
                <span className="text-[10px] text-cyan-300 font-bold">{dockPinnedApps.length} Fixados</span>
              </button>
            )}

            {/* Restore Default */}
            {onResetDockDefault && (
              <button
                onClick={() => {
                  onResetDockDefault();
                  setIsDockOptionsOpen(false);
                }}
                className="w-full text-left p-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs flex items-center space-x-2 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restaurar todos os apps padrão da Dock</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
