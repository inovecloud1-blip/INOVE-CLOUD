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
  Compass,
  User,
  LayoutGrid,
  Pin,
  PinOff,
  X,
  RotateCcw,
  Sliders,
  ExternalLink,
  Minimize2,
  Disc,
  BookOpen,
  Palette,
  ArrowDown,
  ArrowUp,
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Maximize2
} from 'lucide-react';
import { AppId, DockConfig, DEFAULT_DOCK_CONFIG, DockPosition, DockAlignment, DockThemeStyle } from '../types';
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
  dockConfig?: DockConfig;
  onUpdateDockConfig?: (config: Partial<DockConfig>) => void;
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
  dockConfig = DEFAULT_DOCK_CONFIG,
  onUpdateDockConfig,
}) => {
  const [mouseX, setMouseX] = useState<number | null>(null);
  const [mouseY, setMouseY] = useState<number | null>(null);
  const [hoveredApp, setHoveredApp] = useState<AppId | null>(null);
  const [bouncingAppId, setBouncingAppId] = useState<AppId | null>(null);
  const [isDockHovered, setIsDockHovered] = useState(false);
  const [contextMenu, setContextMenu] = useState<{
    appId: AppId;
    x: number;
    y: number;
  } | null>(null);
  const [isDockOptionsOpen, setIsDockOptionsOpen] = useState(false);

  const dockRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<AppId, HTMLDivElement>>(new Map());
  const launcherRef = useRef<HTMLDivElement>(null);

  const position = dockConfig.position || 'bottom';
  const alignment = dockConfig.alignment || 'center';
  const iconSize = dockConfig.iconSize || 54;
  const isVertical = position === 'left' || position === 'right';
  const isHorizontal = !isVertical;

  // Close context menu on window click
  useEffect(() => {
    const handleOutsideClick = () => {
      setContextMenu(null);
      setIsDockOptionsOpen(false);
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  // Master definition of all desktop icons
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
      id: 'storage',
      label: 'Gerenciador de Arquivos & USB',
      subLabel: 'SSD NVMe, USB Kingston & Lixeira',
      gradient: 'from-rose-500 via-pink-600 to-red-600',
      glowColor: 'rgba(244, 63, 94, 0.5)',
      renderIcon: () => (
        <div className="relative flex items-center justify-center">
          <HardDrive className="w-6 h-6 text-white drop-shadow-md" />
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
      subLabel: 'Catálogo de Aplicativos Linux & Docker',
      gradient: 'from-purple-500 via-indigo-600 to-violet-800',
      glowColor: 'rgba(147, 51, 234, 0.5)',
      renderIcon: () => (
        <div className="relative flex items-center justify-center">
          <Layers className="w-6 h-6 text-white drop-shadow-md" />
        </div>
      ),
    },
    {
      id: 'terminal',
      label: 'Terminal Root (CLI)',
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
      id: 'themes',
      label: 'Temas & Papéis de Parede',
      subLabel: 'Wallpapers 4K & Vidro Líquido',
      gradient: 'from-pink-500 via-purple-600 to-cyan-500',
      glowColor: 'rgba(236, 72, 153, 0.6)',
      badge: '4K',
      badgeColor: 'bg-fuchsia-600',
      isUtility: false,
      renderIcon: () => (
        <div className="relative flex items-center justify-center">
          <Palette className="w-6 h-6 text-white drop-shadow-md" />
        </div>
      ),
    },
    {
      id: 'settings',
      label: 'Ajustes do Sistema',
      subLabel: 'Preferências do InoveCloud OS & Dock',
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
      subLabel: 'Debian 13 GNOME Glass',
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
    {
      id: 'gallery',
      label: 'Galeria de Fotos Pro',
      subLabel: 'Visualizador & Editor',
      gradient: 'from-purple-600 via-violet-600 to-indigo-800',
      glowColor: 'rgba(147, 51, 234, 0.5)',
      badge: 'Pro',
      badgeColor: 'bg-violet-600',
      isUtility: false,
      renderIcon: () => null,
    },
    {
      id: 'music',
      label: 'DAW Studio & Música',
      subLabel: 'Estúdio Beatmaker & Hi-Fi',
      gradient: 'from-red-600 via-rose-600 to-pink-700',
      glowColor: 'rgba(239, 68, 68, 0.5)',
      badge: 'DAW',
      badgeColor: 'bg-red-600',
      isUtility: false,
      renderIcon: () => null,
    },
    {
      id: 'videoplayer',
      label: 'Player de Vídeo 4K HDR',
      subLabel: 'Reprodutor de Mídia Local',
      gradient: 'from-orange-500 via-rose-500 to-pink-600',
      glowColor: 'rgba(244, 63, 94, 0.5)',
      badge: '4K',
      badgeColor: 'bg-rose-600',
      isUtility: false,
      renderIcon: () => null,
    },
    {
      id: 'calculator',
      label: 'Calculadora',
      subLabel: 'Padrão, Científica & HEX',
      gradient: 'from-orange-500 via-amber-600 to-slate-900',
      glowColor: 'rgba(245, 158, 11, 0.5)',
      badge: 'Calc',
      badgeColor: 'bg-orange-500',
      isUtility: false,
      renderIcon: () => null,
    },
    {
      id: 'camera',
      label: 'Câmera HD',
      subLabel: '1080p 60FPS Vision',
      gradient: 'from-red-600 via-rose-600 to-slate-900',
      glowColor: 'rgba(239, 68, 68, 0.5)',
      badge: 'HD',
      badgeColor: 'bg-red-600',
      isUtility: false,
      renderIcon: () => null,
    },
  ];

  // Resolve items
  const renderedDockItems: DockItemConfig[] = [];
  dockPinnedApps.forEach((pId) => {
    const item = masterDockItems.find((i) => i.id === pId);
    if (item && !renderedDockItems.some((r) => r.id === item.id)) {
      renderedDockItems.push(item);
    }
  });

  if (showOpenWindowsInDock) {
    openAppIds.forEach((oId) => {
      const item = masterDockItems.find((i) => i.id === oId);
      if (item && !renderedDockItems.some((r) => r.id === item.id)) {
        renderedDockItems.push(item);
      }
    });
  }

  // Calculate magnification scale and displacement
  const calculateMagnification = (element: HTMLElement | null) => {
    if (!dockConfig.magnification) {
      return { scale: 1, translateX: 0, translateY: 0, zIndex: 1, margin: 4 };
    }

    if (isVertical) {
      if (mouseY === null || !element) {
        return { scale: 1, translateX: 0, translateY: 0, zIndex: 1, margin: 4 };
      }
      const rect = element.getBoundingClientRect();
      const itemCenter = rect.top + rect.height / 2;
      const distance = Math.abs(mouseY - itemCenter);
      const maxDistance = 140;

      if (distance >= maxDistance) {
        return { scale: 1, translateX: 0, translateY: 0, zIndex: 1, margin: 4 };
      }

      const factor = Math.cos((distance / maxDistance) * (Math.PI / 2));
      const scale = 1 + factor * ((dockConfig.magnificationScale || 1.35) - 1);
      const translateX = position === 'left' ? (scale - 1) * 20 : -(scale - 1) * 20;
      const zIndex = Math.round(scale * 20);
      const margin = 4 + factor * 6;

      return { scale, translateX, translateY: 0, zIndex, margin };
    } else {
      if (mouseX === null || !element) {
        return { scale: 1, translateX: 0, translateY: 0, zIndex: 1, margin: 4 };
      }
      const rect = element.getBoundingClientRect();
      const itemCenter = rect.left + rect.width / 2;
      const distance = Math.abs(mouseX - itemCenter);
      const maxDistance = 140;

      if (distance >= maxDistance) {
        return { scale: 1, translateX: 0, translateY: 0, zIndex: 1, margin: 4 };
      }

      const factor = Math.cos((distance / maxDistance) * (Math.PI / 2));
      const scale = 1 + factor * ((dockConfig.magnificationScale || 1.35) - 1);
      const translateY = position === 'top' ? (scale - 1) * 20 : -(scale - 1) * 20;
      const zIndex = Math.round(scale * 20);
      const margin = 4 + factor * 6;

      return { scale, translateX: 0, translateY, zIndex, margin };
    }
  };

  const launcherMag = calculateMagnification(launcherRef.current);

  const handleAppClick = (id: AppId) => {
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

  // Positioning container classes
  const containerPositionClass = (() => {
    switch (position) {
      case 'top':
        return 'fixed top-9 left-0 right-0 z-40 flex';
      case 'left':
        return 'fixed left-2 top-10 bottom-2 z-40 flex flex-col';
      case 'right':
        return 'fixed right-2 top-10 bottom-2 z-40 flex flex-col';
      case 'bottom':
      default:
        return 'fixed bottom-2 left-0 right-0 z-40 flex';
    }
  })();

  const alignmentClass = (() => {
    if (isHorizontal) {
      switch (alignment) {
        case 'start':
          return 'justify-start pl-6';
        case 'end':
          return 'justify-end pr-6';
        case 'center':
        default:
          return 'justify-center';
      }
    } else {
      switch (alignment) {
        case 'start':
          return 'justify-start pt-4';
        case 'end':
          return 'justify-end pb-4';
        case 'center':
        default:
          return 'justify-center';
      }
    }
  })();

  // Auto-hide translation
  const autoHideTransformClass = (() => {
    if (!dockConfig.autoHide || isDockHovered || isDockOptionsOpen) return 'translate-x-0 translate-y-0 opacity-100';
    switch (position) {
      case 'top':
        return '-translate-y-[calc(100%-8px)] opacity-50 hover:opacity-100';
      case 'left':
        return '-translate-x-[calc(100%-8px)] opacity-50 hover:opacity-100';
      case 'right':
        return 'translate-x-[calc(100%-8px)] opacity-50 hover:opacity-100';
      case 'bottom':
      default:
        return 'translate-y-[calc(100%-8px)] opacity-50 hover:opacity-100';
    }
  })();

  // Theme Style classes
  const themeStyleClass = (() => {
    switch (dockConfig.style) {
      case 'macos':
        return 'bg-black/60 backdrop-blur-3xl border border-white/20 shadow-2xl';
      case 'floating_pill':
        return 'bg-slate-950/90 backdrop-blur-2xl border border-cyan-500/40 rounded-full shadow-[0_0_30px_rgba(6,182,212,0.25)]';
      case 'solid_dark':
        return 'bg-slate-950 border border-slate-800 shadow-2xl';
      case 'liquid_glass':
      default:
        return 'glass-dock border border-white/30 backdrop-blur-2xl bg-white/10 dark:bg-black/40 shadow-2xl';
    }
  })();

  return (
    <div className={`${containerPositionClass} ${alignmentClass} pointer-events-none select-none transition-all duration-300`}>
      <div
        ref={dockRef}
        onMouseEnter={() => setIsDockHovered(true)}
        onMouseMove={(e) => {
          setIsDockHovered(true);
          setMouseX(e.clientX);
          setMouseY(e.clientY);
        }}
        onMouseLeave={() => {
          setIsDockHovered(false);
          setMouseX(null);
          setMouseY(null);
          setHoveredApp(null);
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          setIsDockOptionsOpen(true);
        }}
        style={{
          borderRadius: dockConfig.style === 'floating_pill' ? '9999px' : '26px',
        }}
        className={`pointer-events-auto flex ${
          isVertical ? 'flex-col items-center py-3 px-2' : 'flex-row items-end px-3.5 py-2'
        } ${themeStyleClass} ${autoHideTransformClass} transition-all duration-300 relative ${
          isOnlyLauncher ? 'ring-2 ring-purple-500/50 shadow-purple-500/20' : ''
        }`}
      >
        {/* Launchpad / Launcher Button */}
        {onToggleLauncher && (
          <>
            <div
              ref={launcherRef}
              className={`relative flex flex-col items-center group ${
                position === 'top' ? 'origin-top' : isVertical ? (position === 'left' ? 'origin-left' : 'origin-right') : 'origin-bottom'
              } select-none`}
              style={{
                margin: isVertical ? `${launcherMag.margin}px 0` : `0 ${launcherMag.margin}px`,
                zIndex: launcherMag.zIndex,
                transition: 'margin 100ms cubic-bezier(0.2, 0.8, 0.2, 1)',
              }}
              onMouseEnter={() => setHoveredApp('settings' as AppId)}
              onMouseLeave={() => setHoveredApp(null)}
            >
              {/* Tooltip for Launcher */}
              {hoveredApp === ('settings' as AppId) && !contextMenu && (
                <div
                  className={`absolute ${
                    position === 'top'
                      ? 'top-14'
                      : position === 'left'
                      ? 'left-16 top-1/2 -translate-y-1/2'
                      : position === 'right'
                      ? 'right-16 top-1/2 -translate-y-1/2'
                      : '-top-14'
                  } px-3 py-1.5 bg-purple-950/95 text-white rounded-xl shadow-2xl backdrop-blur-xl border border-purple-400/30 whitespace-nowrap animate-fade-in pointer-events-none z-50 flex flex-col items-center`}
                >
                  <span className="text-xs font-bold leading-tight tracking-wide">
                    Launcher de Apps
                  </span>
                  <span className="text-[10px] text-purple-200">Clique para abrir todos os aplicativos</span>
                </div>
              )}

              {/* Launcher Magnified Container */}
              <div
                style={{
                  transform: `scale(${launcherMag.scale}) translate(${launcherMag.translateX}px, ${launcherMag.translateY}px)`,
                  transformOrigin: isVertical
                    ? position === 'left'
                      ? 'center left'
                      : 'center right'
                    : position === 'top'
                    ? 'top center'
                    : 'bottom center',
                  transition: 'transform 90ms cubic-bezier(0.2, 0.8, 0.2, 1)',
                }}
              >
                <button
                  onClick={onToggleLauncher}
                  className="relative flex items-center justify-center rounded-2xl p-2 cursor-pointer shadow-lg active:scale-95 bg-gradient-to-tr from-fuchsia-600 via-purple-600 to-indigo-700 border border-white/30 hover:shadow-purple-500/50"
                  style={{
                    width: `${iconSize}px`,
                    height: `${iconSize}px`,
                    filter: 'drop-shadow(0 6px 12px rgba(0, 0, 0, 0.35))',
                  }}
                  title="Launcher de Aplicativos"
                >
                  <LayoutGrid className="w-6 h-6 text-white drop-shadow-md" />
                </button>
              </div>

              {/* Dot indicator if launcher is open */}
              {dockConfig.showOpenIndicators && (
                <div className="h-1.5 flex items-center justify-center mt-1">
                  {isLauncherOpen ? (
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400 animate-pulse" />
                  ) : (
                    <div className="w-1 h-1 rounded-full bg-transparent" />
                  )}
                </div>
              )}
            </div>

            {/* Separator if there are other items */}
            {renderedDockItems.length > 0 && (
              <div
                className={`${
                  isVertical ? 'h-px w-8 my-1.5' : 'w-px h-8 mx-1.5'
                } bg-white/20 self-center rounded-full shrink-0`}
              />
            )}
          </>
        )}

        {/* Rendered Dock Apps */}
        {renderedDockItems.map((item) => {
          const isOpen = openAppIds.includes(item.id);
          const isActive = activeAppId === item.id;
          const isHovered = hoveredApp === item.id;
          const isBouncing = bouncingAppId === item.id;
          const element = itemRefs.current.get(item.id) || null;
          const { scale, translateX, translateY, zIndex, margin } = calculateMagnification(element);

          return (
            <React.Fragment key={item.id}>
              <div
                ref={(node) => {
                  if (node) itemRefs.current.set(item.id, node);
                  else itemRefs.current.delete(item.id);
                }}
                className={`relative flex flex-col items-center group ${
                  position === 'top' ? 'origin-top' : isVertical ? (position === 'left' ? 'origin-left' : 'origin-right') : 'origin-bottom'
                } select-none`}
                style={{
                  margin: isVertical ? `${margin}px 0` : `0 ${margin}px`,
                  zIndex: zIndex,
                  transition: 'margin 100ms cubic-bezier(0.2, 0.8, 0.2, 1)',
                }}
                onMouseEnter={() => setHoveredApp(item.id)}
                onMouseLeave={() => setHoveredApp(null)}
              >
                {/* Magnified Tooltip */}
                {isHovered && !contextMenu && (
                  <div
                    className={`absolute ${
                      position === 'top'
                        ? 'top-14'
                        : position === 'left'
                        ? 'left-16 top-1/2 -translate-y-1/2'
                        : position === 'right'
                        ? 'right-16 top-1/2 -translate-y-1/2'
                        : '-top-14'
                    } px-3 py-1.5 bg-slate-900/95 text-white rounded-xl shadow-2xl backdrop-blur-xl border border-white/20 whitespace-nowrap animate-fade-in pointer-events-none z-50 flex flex-col items-center`}
                  >
                    <span className="text-xs font-bold leading-tight tracking-wide">{item.label}</span>
                    {item.subLabel && (
                      <span className="text-[10px] text-slate-400 font-medium">{item.subLabel}</span>
                    )}
                  </div>
                )}

                {/* Squircle App Icon Container with Magnification & Bounce */}
                <div
                  className={`relative ${isBouncing ? 'animate-dock-bounce' : ''}`}
                  style={{
                    transform: `scale(${scale}) translate(${translateX}px, ${translateY}px)`,
                    transformOrigin: isVertical
                      ? position === 'left'
                        ? 'center left'
                        : 'center right'
                      : position === 'top'
                      ? 'top center'
                      : 'bottom center',
                    transition: 'transform 90ms cubic-bezier(0.2, 0.8, 0.2, 1)',
                  }}
                >
                  <button
                    onClick={() => handleAppClick(item.id)}
                    onContextMenu={(e) => handleContextMenu(e, item.id)}
                    className="relative cursor-pointer active:scale-95 transition-transform duration-150 block"
                    style={{ width: `${iconSize}px`, height: `${iconSize}px` }}
                  >
                    <AppIcon appId={item.id} size="md" className="w-full h-full" />

                    {/* Badge notification */}
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
                {dockConfig.showOpenIndicators && (
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
                )}
              </div>
            </React.Fragment>
          );
        })}

        {/* Subtle Dock Settings Gear/Options Icon Button at the end */}
        <div className={`relative flex flex-col items-center group ${isVertical ? 'mt-2' : 'ml-1'} self-center`}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsDockOptionsOpen((prev) => !prev);
              setContextMenu(null);
            }}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer border border-transparent hover:border-white/15"
            title="Ajustar Posição e Configurações da Dock"
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
            top: position === 'top' ? '80px' : undefined,
            bottom: position !== 'top' ? '75px' : undefined,
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
                    <span>Fechar Janela</span>
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

      {/* Dock Quick Positioning & Options Popup Menu */}
      {isDockOptionsOpen && (
        <div
          className="fixed z-50 py-3.5 px-4 w-80 bg-slate-900/98 text-white rounded-3xl shadow-2xl backdrop-blur-3xl border border-white/20 animate-fade-in pointer-events-auto"
          style={{
            bottom: position === 'bottom' ? '75px' : position === 'top' ? undefined : '50px',
            top: position === 'top' ? '80px' : undefined,
            left: position === 'left' ? '80px' : position === 'right' ? undefined : '50%',
            right: position === 'right' ? '80px' : undefined,
            transform: position === 'bottom' || position === 'top' ? 'translateX(-50%)' : undefined,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-white/10">
            <div className="flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <h4 className="text-xs font-black uppercase tracking-wider text-white">Ajustes & Posição da Dock</h4>
            </div>
            <button
              onClick={() => setIsDockOptionsOpen(false)}
              className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3 text-xs">
            {/* 1. Posicionamento da Dock */}
            <div>
              <label className="text-[11px] font-bold text-slate-300 block mb-1.5">
                Posição na Tela:
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { pos: 'bottom' as DockPosition, label: 'Inferior', icon: ArrowDown },
                  { pos: 'left' as DockPosition, label: 'Esquerda', icon: ArrowLeft },
                  { pos: 'top' as DockPosition, label: 'Superior', icon: ArrowUp },
                  { pos: 'right' as DockPosition, label: 'Direita', icon: ArrowRight },
                ].map(({ pos, label, icon: Icon }) => (
                  <button
                    key={pos}
                    onClick={() => onUpdateDockConfig && onUpdateDockConfig({ position: pos })}
                    className={`py-2 px-1 rounded-xl text-[10px] font-bold flex flex-col items-center gap-1 border transition cursor-pointer ${
                      position === pos
                        ? 'bg-blue-600 border-blue-400 text-white shadow-md shadow-blue-500/30'
                        : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Alinhamento da Dock */}
            <div>
              <label className="text-[11px] font-bold text-slate-300 block mb-1.5">
                Alinhamento:
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { align: 'start' as DockAlignment, label: isVertical ? 'Topo' : 'Esquerda' },
                  { align: 'center' as DockAlignment, label: 'Centro' },
                  { align: 'end' as DockAlignment, label: isVertical ? 'Base' : 'Direita' },
                ].map(({ align, label }) => (
                  <button
                    key={align}
                    onClick={() => onUpdateDockConfig && onUpdateDockConfig({ alignment: align })}
                    className={`py-1.5 px-2 rounded-xl text-[10px] font-semibold text-center border transition cursor-pointer ${
                      alignment === align
                        ? 'bg-cyan-600 border-cyan-400 text-white'
                        : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Tamanho dos Ícones */}
            <div>
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-300 mb-1">
                <span>Tamanho dos Ícones:</span>
                <span className="font-mono text-cyan-400">{iconSize}px</span>
              </div>
              <input
                type="range"
                min="40"
                max="74"
                value={iconSize}
                onChange={(e) => onUpdateDockConfig && onUpdateDockConfig({ iconSize: Number(e.target.value) })}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
            </div>

            {/* 4. Estilo Visual */}
            <div>
              <label className="text-[11px] font-bold text-slate-300 block mb-1.5">
                Estilo Visual:
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { style: 'liquid_glass' as DockThemeStyle, label: 'Vidro Líquido' },
                  { style: 'macos' as DockThemeStyle, label: 'macOS Escuro' },
                  { style: 'floating_pill' as DockThemeStyle, label: 'Pílula Neon' },
                  { style: 'solid_dark' as DockThemeStyle, label: 'Preto Linux' },
                ].map(({ style: st, label }) => (
                  <button
                    key={st}
                    onClick={() => onUpdateDockConfig && onUpdateDockConfig({ style: st })}
                    className={`py-1.5 px-2 rounded-xl text-[10px] font-semibold text-center border transition cursor-pointer ${
                      dockConfig.style === st
                        ? 'bg-purple-600 border-purple-400 text-white'
                        : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* 5. Toggles Rápidos (Auto-hide, Zoom, Janelas) */}
            <div className="space-y-1.5 pt-1 border-t border-white/10">
              {/* Auto Hide */}
              <div
                onClick={() => onUpdateDockConfig && onUpdateDockConfig({ autoHide: !dockConfig.autoHide })}
                className="flex items-center justify-between p-2 rounded-xl bg-white/5 hover:bg-white/10 cursor-pointer transition"
              >
                <div className="flex items-center space-x-2">
                  {dockConfig.autoHide ? <EyeOff className="w-3.5 h-3.5 text-amber-400" /> : <Eye className="w-3.5 h-3.5 text-cyan-400" />}
                  <span className="text-[11px]">Ocultar Automaticamente (Auto-Hide)</span>
                </div>
                <div className={`w-7 h-3.5 rounded-full transition-colors flex items-center p-0.5 ${
                  dockConfig.autoHide ? 'bg-amber-500 justify-end' : 'bg-slate-700 justify-start'
                }`}>
                  <div className="w-2.5 h-2.5 rounded-full bg-white shadow" />
                </div>
              </div>

              {/* Magnification */}
              <div
                onClick={() => onUpdateDockConfig && onUpdateDockConfig({ magnification: !dockConfig.magnification })}
                className="flex items-center justify-between p-2 rounded-xl bg-white/5 hover:bg-white/10 cursor-pointer transition"
              >
                <div className="flex items-center space-x-2">
                  <Maximize2 className="w-3.5 h-3.5 text-pink-400" />
                  <span className="text-[11px]">Efeito de Zoom (Magnification)</span>
                </div>
                <div className={`w-7 h-3.5 rounded-full transition-colors flex items-center p-0.5 ${
                  dockConfig.magnification ? 'bg-pink-500 justify-end' : 'bg-slate-700 justify-start'
                }`}>
                  <div className="w-2.5 h-2.5 rounded-full bg-white shadow" />
                </div>
              </div>
            </div>

            {/* Leave only launcher on dock */}
            {onClearDockExceptLauncher && (
              <button
                onClick={() => {
                  onClearDockExceptLauncher();
                  setIsDockOptionsOpen(false);
                }}
                className="w-full text-left p-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-200 text-xs font-semibold flex items-center space-x-2 transition cursor-pointer"
              >
                <LayoutGrid className="w-3.5 h-3.5 text-purple-400" />
                <span>Deixar apenas Launcher na Dock</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
