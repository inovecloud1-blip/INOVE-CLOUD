import React, { useState, useEffect, useMemo } from 'react';
import {
  Server,
  Globe,
  Users,
  ShieldCheck,
  Zap,
  HardDrive,
  Cpu,
  Sparkles,
  ExternalLink,
  Cloud,
  Clock,
  Calendar,
  Layers,
  Plus,
  Trash2,
  RefreshCw,
  Terminal,
  Activity,
  Compass,
  Monitor,
  User,
  FolderKanban,
  Settings,
  LayoutGrid,
  Home,
  Pin,
  PinOff,
  SlidersHorizontal,
  Eye,
  EyeOff,
  X,
  RotateCcw,
  Check,
  CheckCircle2,
  Info,
  GripVertical,
  ChevronUp,
  ChevronDown,
  ArrowUpDown,
  Disc,
  BookOpen
} from 'lucide-react';
import { AppId, SystemStats, CustomWebShortcut, DesktopWidgetsConfig, DesktopWidgetId, DEFAULT_WIDGET_ORDER } from '../../types';
import { LAUNCHER_APPS, DEFAULT_DESKTOP_PINNED } from '../../data/launcherApps';
import { AppIcon } from './AppIcon';

interface DesktopWidgetsProps {
  stats: SystemStats;
  onOpenApp: (id: AppId) => void;
  onOpenWebUrl?: (url: string, title?: string) => void;
  desktopPinnedApps?: AppId[];
  onTogglePinDesktop?: (id: AppId) => void;
  onReorderDesktopApps?: (newOrder: AppId[]) => void;
  onOpenLauncher?: () => void;
  widgetsConfig: DesktopWidgetsConfig;
  onUpdateWidgetsConfig: (config: Partial<DesktopWidgetsConfig>) => void;
  onResetWidgetsConfig: () => void;
}

export const DesktopWidgets: React.FC<DesktopWidgetsProps> = ({
  stats,
  onOpenApp,
  onOpenWebUrl,
  desktopPinnedApps = DEFAULT_DESKTOP_PINNED,
  onTogglePinDesktop,
  onReorderDesktopApps,
  onOpenLauncher,
  widgetsConfig,
  onUpdateWidgetsConfig,
  onResetWidgetsConfig,
}) => {
  // Live Clock & Date state
  const [time, setTime] = useState(new Date());
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [removedToast, setRemovedToast] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const showToast = (message: string) => {
    setRemovedToast(message);
    setTimeout(() => {
      setRemovedToast((current) => (current === message ? null : current));
    }, 3500);
  };

  // Format hours, minutes, seconds
  const hours = time.getHours().toString().padStart(2, '0');
  const minutes = time.getMinutes().toString().padStart(2, '0');
  const seconds = time.getSeconds().toString().padStart(2, '0');

  // Format full date in Portuguese
  const dateFormatted = time.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const capitalizedDate = dateFormatted.charAt(0).toUpperCase() + dateFormatted.slice(1);

  // Memory Widget State
  const [ramFreeing, setRamFreeing] = useState(false);
  const [ramUsagePercent, setRamUsagePercent] = useState(stats.ramUsage || 38);
  const [ramClearedMsg, setRamClearedMsg] = useState<string | null>(null);

  const totalRamGb = stats.ramTotal || 128;
  const usedRamGb = ((totalRamGb * ramUsagePercent) / 100).toFixed(1);
  const freeRamGb = (totalRamGb - parseFloat(usedRamGb)).toFixed(1);

  const handleClearRamCache = () => {
    setRamFreeing(true);
    setTimeout(() => {
      setRamUsagePercent((prev) => Math.max(18, prev - 14));
      setRamFreeing(false);
      setRamClearedMsg('Cache do kernel esvaziado: 17.9 GB liberados!');
      setTimeout(() => setRamClearedMsg(null), 3000);
    }, 800);
  };

  const renderDesktopIcon = (iconName: string, className = 'w-5 h-5 text-white') => {
    switch (iconName) {
      case 'Server': return <Server className={className} />;
      case 'Terminal': return <Terminal className={className} />;
      case 'Activity': return <Activity className={className} />;
      case 'Compass': return <Compass className={className} />;
      case 'Monitor': return <Monitor className={className} />;
      case 'Globe': return <Globe className={className} />;
      case 'Users': return <Users className={className} />;
      case 'User': return <User className={className} />;
      case 'HardDrive': return <HardDrive className={className} />;
      case 'FolderKanban': return <FolderKanban className={className} />;
      case 'Layers': return <Layers className={className} />;
      case 'Sparkles': return <Sparkles className={className} />;
      case 'Settings': return <Settings className={className} />;
      case 'Disc': return <Disc className={className} />;
      case 'BookOpen': return <BookOpen className={className} />;
      default: return <LayoutGrid className={className} />;
    }
  };

  const pinnedAppObjects = desktopPinnedApps
    .map((id) => LAUNCHER_APPS.find((app) => app.id === id))
    .filter(Boolean) as typeof LAUNCHER_APPS;

  // Custom Web Shortcuts State (persistent via localStorage)
  const defaultShortcuts: CustomWebShortcut[] = [
    {
      id: 'sc-1',
      name: 'ChatGPT / Claude',
      url: 'https://chatgpt.com',
      icon: '🤖',
      category: 'IA & Produtividade',
      openMode: 'window',
    },
    {
      id: 'sc-2',
      name: 'GitHub Cloud',
      url: 'https://github.com',
      icon: '🐙',
      category: 'DevOps & Git',
      openMode: 'window',
    },
    {
      id: 'sc-3',
      name: 'Grafana Metrics',
      url: 'https://grafana.inovecloud.io',
      icon: '📊',
      category: 'Monitoramento',
      openMode: 'window',
    },
    {
      id: 'sc-4',
      name: 'Portainer Docker',
      url: 'https://portainer.inovecloud.io',
      icon: '🐳',
      category: 'Containers',
      openMode: 'window',
    },
  ];

  const [webShortcuts, setWebShortcuts] = useState<CustomWebShortcut[]>(() => {
    const saved = localStorage.getItem('inovecloud_web_shortcuts');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return defaultShortcuts;
      }
    }
    return defaultShortcuts;
  });

  const [showAddShortcutModal, setShowAddShortcutModal] = useState(false);
  const [newShortcutName, setNewShortcutName] = useState('');
  const [newShortcutUrl, setNewShortcutUrl] = useState('');
  const [newShortcutIcon, setNewShortcutIcon] = useState('🌐');
  const [newShortcutCategory, setNewShortcutCategory] = useState('Web App');

  const handleSaveShortcut = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShortcutName.trim() || !newShortcutUrl.trim()) return;

    let formattedUrl = newShortcutUrl.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = 'https://' + formattedUrl;
    }

    const created: CustomWebShortcut = {
      id: `sc-${Date.now()}`,
      name: newShortcutName.trim(),
      url: formattedUrl,
      icon: newShortcutIcon || '🌐',
      category: newShortcutCategory || 'Web App',
      openMode: 'window',
    };

    const updated = [...webShortcuts, created];
    setWebShortcuts(updated);
    localStorage.setItem('inovecloud_web_shortcuts', JSON.stringify(updated));

    setNewShortcutName('');
    setNewShortcutUrl('');
    setShowAddShortcutModal(false);
  };

  const handleDeleteShortcut = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const filtered = webShortcuts.filter((s) => s.id !== id);
    setWebShortcuts(filtered);
    localStorage.setItem('inovecloud_web_shortcuts', JSON.stringify(filtered));
  };

  const handleOpenShortcut = (shortcut: CustomWebShortcut) => {
    if (onOpenWebUrl) {
      onOpenWebUrl(shortcut.url, shortcut.name);
    } else {
      window.open(shortcut.url, '_blank');
    }
  };

  // --- WIDGET REORDERING & DRAG-AND-DROP LOGIC ---
  const currentWidgetOrder: DesktopWidgetId[] = useMemo(() => {
    const raw = widgetsConfig.widgetOrder && widgetsConfig.widgetOrder.length > 0
      ? widgetsConfig.widgetOrder
      : DEFAULT_WIDGET_ORDER;
    const filtered = raw.filter((id) => DEFAULT_WIDGET_ORDER.includes(id));
    const missing = DEFAULT_WIDGET_ORDER.filter((id) => !filtered.includes(id));
    return [...filtered, ...missing];
  }, [widgetsConfig.widgetOrder]);

  const [draggedWidgetId, setDraggedWidgetId] = useState<DesktopWidgetId | null>(null);
  const [dragOverWidgetId, setDragOverWidgetId] = useState<DesktopWidgetId | null>(null);
  const [dropPosition, setDropPosition] = useState<'before' | 'after' | null>(null);

  // Modal drag-and-drop state
  const [modalDraggedId, setModalDraggedId] = useState<DesktopWidgetId | null>(null);
  const [modalDragOverId, setModalDragOverId] = useState<DesktopWidgetId | null>(null);

  // Inner App & Shortcut Drag state
  const [draggedAppId, setDraggedAppId] = useState<AppId | null>(null);
  const [dragOverAppId, setDragOverAppId] = useState<AppId | null>(null);
  const [draggedShortcutId, setDraggedShortcutId] = useState<string | null>(null);
  const [dragOverShortcutId, setDragOverShortcutId] = useState<string | null>(null);

  // Move widget via Up / Down buttons
  const handleMoveWidget = (widgetId: DesktopWidgetId, direction: 'up' | 'down') => {
    const currentIndex = currentWidgetOrder.indexOf(widgetId);
    if (currentIndex === -1) return;
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= currentWidgetOrder.length) return;

    const newOrder = [...currentWidgetOrder];
    const [moved] = newOrder.splice(currentIndex, 1);
    newOrder.splice(targetIndex, 0, moved);

    onUpdateWidgetsConfig({ widgetOrder: newOrder });
    showToast('Posição do widget atualizada!');
  };

  // Main Desktop Widget Drag Handlers
  const handleWidgetDragStart = (e: React.DragEvent, id: DesktopWidgetId) => {
    e.dataTransfer.setData('text/plain', `widget:${id}`);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedWidgetId(id);
  };

  const handleWidgetDragOver = (e: React.DragEvent, targetId: DesktopWidgetId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (draggedWidgetId && draggedWidgetId !== targetId) {
      setDragOverWidgetId(targetId);
      const rect = e.currentTarget.getBoundingClientRect();
      const midY = rect.top + rect.height / 2;
      setDropPosition(e.clientY < midY ? 'before' : 'after');
    }
  };

  const handleWidgetDragLeave = (e: React.DragEvent, targetId: DesktopWidgetId) => {
    if (dragOverWidgetId === targetId) {
      setDragOverWidgetId(null);
      setDropPosition(null);
    }
  };

  const handleWidgetDrop = (e: React.DragEvent, targetId: DesktopWidgetId) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('text/plain');
    if (!data.startsWith('widget:')) return;
    const sourceId = data.replace('widget:', '') as DesktopWidgetId;

    if (sourceId && sourceId !== targetId) {
      const sourceIndex = currentWidgetOrder.indexOf(sourceId);
      if (sourceIndex !== -1) {
        const newOrder = [...currentWidgetOrder];
        const [removed] = newOrder.splice(sourceIndex, 1);
        let insertIndex = newOrder.indexOf(targetId);
        if (dropPosition === 'after') {
          insertIndex += 1;
        }
        newOrder.splice(insertIndex, 0, removed);
        onUpdateWidgetsConfig({ widgetOrder: newOrder });
        showToast('Widget reposicionado com sucesso!');
      }
    }

    setDraggedWidgetId(null);
    setDragOverWidgetId(null);
    setDropPosition(null);
  };

  const handleWidgetDragEnd = () => {
    setDraggedWidgetId(null);
    setDragOverWidgetId(null);
    setDropPosition(null);
  };

  // Modal Drag Handlers for Reordering
  const handleModalDragStart = (e: React.DragEvent, id: DesktopWidgetId) => {
    e.dataTransfer.setData('text/plain', `modal-widget:${id}`);
    e.dataTransfer.effectAllowed = 'move';
    setModalDraggedId(id);
  };

  const handleModalDragOver = (e: React.DragEvent, targetId: DesktopWidgetId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (modalDraggedId && modalDraggedId !== targetId) {
      setModalDragOverId(targetId);
    }
  };

  const handleModalDrop = (e: React.DragEvent, targetId: DesktopWidgetId) => {
    e.preventDefault();
    if (modalDraggedId && modalDraggedId !== targetId) {
      const sourceIndex = currentWidgetOrder.indexOf(modalDraggedId);
      const targetIndex = currentWidgetOrder.indexOf(targetId);
      if (sourceIndex !== -1 && targetIndex !== -1) {
        const newOrder = [...currentWidgetOrder];
        const [moved] = newOrder.splice(sourceIndex, 1);
        newOrder.splice(targetIndex, 0, moved);
        onUpdateWidgetsConfig({ widgetOrder: newOrder });
        showToast('Ordem dos widgets atualizada!');
      }
    }
    setModalDraggedId(null);
    setModalDragOverId(null);
  };

  // App Icons Drag Handlers within Desktop Apps Widget
  const handleAppDragStart = (e: React.DragEvent, id: AppId) => {
    e.stopPropagation();
    e.dataTransfer.setData('text/plain', `app:${id}`);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedAppId(id);
  };

  const handleAppDragOver = (e: React.DragEvent, targetId: AppId) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggedAppId && draggedAppId !== targetId) {
      setDragOverAppId(targetId);
    }
  };

  const handleAppDrop = (e: React.DragEvent, targetId: AppId) => {
    e.preventDefault();
    e.stopPropagation();
    const data = e.dataTransfer.getData('text/plain');
    if (!data.startsWith('app:')) return;
    const sourceId = data.replace('app:', '') as AppId;

    if (sourceId && sourceId !== targetId && onReorderDesktopApps) {
      const sourceIndex = desktopPinnedApps.indexOf(sourceId);
      const targetIndex = desktopPinnedApps.indexOf(targetId);
      if (sourceIndex !== -1 && targetIndex !== -1) {
        const next = [...desktopPinnedApps];
        const [moved] = next.splice(sourceIndex, 1);
        next.splice(targetIndex, 0, moved);
        onReorderDesktopApps(next);
        showToast('Aplicativo reposicionado na Tela Inicial!');
      }
    }
    setDraggedAppId(null);
    setDragOverAppId(null);
  };

  // Shortcuts Drag Handlers within Web Shortcuts Widget
  const handleShortcutDragStart = (e: React.DragEvent, id: string) => {
    e.stopPropagation();
    e.dataTransfer.setData('text/plain', `shortcut:${id}`);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedShortcutId(id);
  };

  const handleShortcutDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggedShortcutId && draggedShortcutId !== targetId) {
      setDragOverShortcutId(targetId);
    }
  };

  const handleShortcutDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const data = e.dataTransfer.getData('text/plain');
    if (!data.startsWith('shortcut:')) return;
    const sourceId = data.replace('shortcut:', '');

    if (sourceId && sourceId !== targetId) {
      const sourceIndex = webShortcuts.findIndex((s) => s.id === sourceId);
      const targetIndex = webShortcuts.findIndex((s) => s.id === targetId);
      if (sourceIndex !== -1 && targetIndex !== -1) {
        const next = [...webShortcuts];
        const [moved] = next.splice(sourceIndex, 1);
        next.splice(targetIndex, 0, moved);
        setWebShortcuts(next);
        try {
          localStorage.setItem('inovecloud_web_shortcuts', JSON.stringify(next));
        } catch (err) {
          console.error(err);
        }
        showToast('Atalho Web reposicionado!');
      }
    }
    setDraggedShortcutId(null);
    setDragOverShortcutId(null);
  };

  // Quick Hide helper
  const handleHideWidget = (id: DesktopWidgetId) => {
    switch (id) {
      case 'clock':
        onUpdateWidgetsConfig({ showClockWidget: false });
        showToast('Relógio ocultado da Tela Inicial.');
        break;
      case 'ram':
        onUpdateWidgetsConfig({ showRamWidget: false });
        showToast('Memória RAM ocultada da Tela Inicial.');
        break;
      case 'apps':
        onUpdateWidgetsConfig({ showDesktopAppsWidget: false });
        showToast('Grade de Apps ocultada da Tela Inicial.');
        break;
      case 'shortcuts':
        onUpdateWidgetsConfig({ showWebShortcutsWidget: false });
        showToast('Atalhos Web ocultados da Tela Inicial.');
        break;
      case 'kvm':
        onUpdateWidgetsConfig({ showKvmWidget: false });
        showToast('Card KVM Virtualization ocultado da Tela Inicial.');
        break;
    }
  };

  const isWidgetVisible = (id: DesktopWidgetId) => {
    switch (id) {
      case 'clock': return Boolean(widgetsConfig.showClockWidget);
      case 'ram': return Boolean(widgetsConfig.showRamWidget);
      case 'apps': return Boolean(widgetsConfig.showDesktopAppsWidget);
      case 'shortcuts': return Boolean(widgetsConfig.showWebShortcutsWidget);
      case 'kvm': return Boolean(widgetsConfig.showKvmWidget);
      default: return false;
    }
  };

  const visibleWidgetIds = currentWidgetOrder.filter((id) => isWidgetVisible(id));

  const getWidgetInfo = (id: DesktopWidgetId) => {
    switch (id) {
      case 'clock':
        return {
          title: 'Relógio & Calendário Digital',
          desc: 'Hora sincronizada e data no horário de Brasília',
          icon: <Clock className="w-4 h-4 text-cyan-400" />,
        };
      case 'ram':
        return {
          title: 'Memória RAM & Recursos Cluster',
          desc: 'Telemetria de memória e limpeza de cache do kernel',
          icon: <Zap className="w-4 h-4 text-purple-400" />,
        };
      case 'apps':
        return {
          title: 'Aplicativos na Tela Inicial',
          desc: 'Grade de apps fixados no Desktop estilo UmbrelOS',
          icon: <Home className="w-4 h-4 text-emerald-400" />,
        };
      case 'shortcuts':
        return {
          title: 'Atalhos Web & Links Rápidos',
          desc: 'Favoritos de nuvem e ferramentas online',
          icon: <Globe className="w-4 h-4 text-amber-400" />,
        };
      case 'kvm':
        return {
          title: 'Card KVM Virtualization (Run Any OS)',
          desc: 'Acesso a máquinas virtuais Ubuntu, Windows e Debian',
          icon: <Server className="w-4 h-4 text-indigo-400" />,
        };
    }
  };

  // Check if all major widgets are hidden (Clean Wallpaper Mode)
  const isAllWidgetsHidden =
    !widgetsConfig.showClockWidget &&
    !widgetsConfig.showRamWidget &&
    !widgetsConfig.showDesktopAppsWidget &&
    !widgetsConfig.showWebShortcutsWidget &&
    !widgetsConfig.showKvmWidget;

  return (
    <div className="absolute inset-0 pointer-events-none p-4 sm:p-6 pt-12 overflow-y-auto flex flex-col justify-between select-none">
      {/* Top Header Row with Hero Badge & Top Status */}
      {widgetsConfig.showTopBar && (
        <div className="pointer-events-auto flex items-start justify-between flex-wrap gap-3 animate-fade-in">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => onOpenApp('settings')}
              className="w-10 h-10 rounded-2xl liquid-glass-pill flex items-center justify-center text-white shadow-xl hover:scale-105 transition cursor-pointer active:scale-95"
              title="Ajustes do Sistema"
            >
              <Cloud className="w-5 h-5 text-cyan-400" />
            </button>

            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base font-extrabold text-white tracking-wide drop-shadow-md">
                  InoveCloud OS
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  UmbrelOS Style
                </span>
              </div>
              <p className="text-[11px] text-white/80 font-medium drop-shadow">
                Workspace em Nuvem & Infraestrutura Hypervisor KVM
              </p>
            </div>
          </div>

          {/* Top Right: Quick Node Telemetry Widget & Configure Widgets Button */}
          <div className="flex items-center space-x-2">
            <div
              onClick={() => onOpenApp('monitor')}
              className="pointer-events-auto cursor-pointer liquid-glass-pill px-4 py-2 rounded-2xl flex items-center space-x-3 text-xs text-white shadow-2xl transition"
            >
              <div className="flex items-center space-x-1.5">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                <span className="font-semibold">{stats.cpuUsage}% CPU</span>
              </div>
              <div className="w-px h-3.5 bg-white/20" />
              <div className="flex items-center space-x-1.5">
                <Server className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-semibold">{stats.vnsRunning} VNs</span>
              </div>
              <div className="w-px h-3.5 bg-white/20" />
              <div className="flex items-center space-x-1.5 text-emerald-300">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>SSL ON</span>
              </div>
            </div>

            {/* Widget Config Button */}
            <button
              onClick={() => setIsConfigModalOpen(true)}
              className="pointer-events-auto flex items-center space-x-1.5 px-3.5 py-2 rounded-2xl liquid-glass-pill hover:bg-cyan-600/30 text-slate-200 hover:text-white text-xs font-semibold transition shadow-2xl cursor-pointer"
              title="Configurar quais widgets e elementos aparecem na Tela Inicial"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Configurar Widgets</span>
            </button>

            {/* Hide Top Bar Quick Button */}
            <button
              onClick={() => {
                onUpdateWidgetsConfig({ showTopBar: false });
                showToast('Barra superior ocultada. Use "Configurar Widgets" para reativá-la.');
              }}
              className="pointer-events-auto p-2 rounded-2xl liquid-glass-pill hover:bg-red-500/20 text-slate-400 hover:text-red-300 transition cursor-pointer"
              title="Ocultar barra superior da Tela Inicial"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Floating Button to open config if top bar is hidden */}
      {!widgetsConfig.showTopBar && (
        <div className="pointer-events-auto flex justify-end mb-2">
          <button
            onClick={() => setIsConfigModalOpen(true)}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-full liquid-glass-pill hover:bg-slate-800/80 text-slate-200 hover:text-white text-xs font-bold transition shadow-2xl cursor-pointer"
            title="Configurar Widgets e Layout da Área de Trabalho"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
            <span>Configurar Widgets</span>
          </button>
        </div>
      )}

      {/* Empty Desktop State (Clean Wallpaper Mode like Umbrel OS) */}
      {isAllWidgetsHidden && (
        <div className="pointer-events-auto my-auto max-w-md mx-auto text-center p-6 rounded-3xl liquid-glass shadow-2xl animate-fade-in text-white space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 mx-auto flex items-center justify-center shadow-lg">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-base font-bold">Modo Tela Limpa (UmbrelOS)</h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Todos os widgets foram retirados da inicial. Desfrute do seu papel de parede fotográfico com total foco. Seus aplicativos continuam disponíveis na Dock e no Launcher.
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 pt-2">
            <button
              onClick={() => onOpenLauncher && onOpenLauncher()}
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition cursor-pointer shadow-lg shadow-cyan-600/25 active:scale-95 flex items-center space-x-1.5"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Abrir Launcher</span>
            </button>
            <button
              onClick={() => setIsConfigModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white font-bold text-xs transition cursor-pointer border border-white/10 flex items-center space-x-1.5"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-300" />
              <span>Restaurar Widgets</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Widgets Showcase Area with Drag & Drop Reordering */}
      {!isAllWidgetsHidden && (
        <div className="pointer-events-auto my-4 max-w-6xl mx-auto w-full">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {visibleWidgetIds.map((widgetId, visibleIndex) => {
              const colSpanClass = (() => {
                const compactCount = visibleWidgetIds.filter((id) => ['clock', 'ram', 'kvm'].includes(id)).length;
                if (widgetId === 'apps' || widgetId === 'shortcuts') {
                  return 'col-span-1 md:col-span-12';
                }
                if (compactCount === 1) {
                  return 'col-span-1 md:col-span-12';
                }
                return 'col-span-1 md:col-span-6';
              })();

              const isBeingDragged = draggedWidgetId === widgetId;
              const isTargetDragOver = dragOverWidgetId === widgetId && draggedWidgetId !== widgetId;

              return (
                <div
                  key={widgetId}
                  draggable
                  onDragStart={(e) => handleWidgetDragStart(e, widgetId)}
                  onDragOver={(e) => handleWidgetDragOver(e, widgetId)}
                  onDragLeave={(e) => handleWidgetDragLeave(e, widgetId)}
                  onDrop={(e) => handleWidgetDrop(e, widgetId)}
                  onDragEnd={handleWidgetDragEnd}
                  className={`transition-all duration-200 relative group/widget-card ${colSpanClass} ${
                    isBeingDragged ? 'opacity-35 scale-[0.98] ring-2 ring-cyan-400/50' : ''
                  } ${
                    isTargetDragOver ? 'scale-[1.01] ring-2 ring-cyan-400 shadow-2xl shadow-cyan-500/20' : ''
                  }`}
                >
                  {/* Visual Drop Bar Indicator (Top) */}
                  {isTargetDragOver && dropPosition === 'before' && (
                    <div className="absolute -top-2.5 left-2 right-2 h-1.5 bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-500 rounded-full shadow-lg shadow-cyan-400/80 animate-pulse z-40" />
                  )}

                  {/* WIDGET: Relógio Digital & Calendário */}
                  {widgetId === 'clock' && (
                    <div className="group/widget relative liquid-glass-card liquid-reflection rounded-3xl p-5 shadow-2xl overflow-hidden h-full flex flex-col justify-between">
                      {/* Subtle ambient light */}
                      <div className="absolute -top-12 -right-12 w-36 h-36 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

                      <div>
                        {/* Header: Title + Drag & Action Controls */}
                        <div className="flex items-center justify-between pb-3 mb-2 border-b border-white/10 flex-wrap gap-2">
                          <div className="flex items-center space-x-2 text-cyan-300">
                            <Clock className="w-4 h-4 shrink-0" />
                            <span className="text-xs font-bold uppercase tracking-wider">Hora do Sistema & Fuso</span>
                          </div>

                          <div className="flex items-center space-x-1.5">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/10 text-slate-200 border border-white/15 hidden sm:inline-block">
                              UTC-03:00 (Brasília)
                            </span>

                            {/* Drag Handle */}
                            <div
                              draggable
                              onDragStart={(e) => handleWidgetDragStart(e, 'clock')}
                              className="flex items-center space-x-1 px-2 py-1 rounded-xl bg-black/40 hover:bg-white/10 text-slate-400 hover:text-cyan-300 border border-white/5 cursor-grab active:cursor-grabbing transition"
                              title="Arraste este widget para mudar de posição"
                            >
                              <GripVertical className="w-3.5 h-3.5" />
                              <span className="text-[10px] font-medium hidden md:inline">Arrastar</span>
                            </div>

                            {/* Up / Down Reorder */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMoveWidget('clock', 'up');
                              }}
                              disabled={visibleIndex === 0}
                              className="p-1 rounded-lg bg-black/40 hover:bg-white/10 text-slate-400 hover:text-white disabled:opacity-20 disabled:hover:bg-black/40 cursor-pointer disabled:cursor-not-allowed border border-white/5 transition"
                              title="Mover widget para cima"
                            >
                              <ChevronUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMoveWidget('clock', 'down');
                              }}
                              disabled={visibleIndex === visibleWidgetIds.length - 1}
                              className="p-1 rounded-lg bg-black/40 hover:bg-white/10 text-slate-400 hover:text-white disabled:opacity-20 disabled:hover:bg-black/40 cursor-pointer disabled:cursor-not-allowed border border-white/5 transition"
                              title="Mover widget para baixo"
                            >
                              <ChevronDown className="w-3.5 h-3.5" />
                            </button>

                            {/* Remove / Ocultar da Tela Inicial */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleHideWidget('clock');
                              }}
                              className="p-1 rounded-lg bg-black/40 hover:bg-red-500/20 text-slate-400 hover:text-red-300 border border-white/5 transition cursor-pointer"
                              title="Tirar relógio da Tela Inicial"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Time Digits */}
                        <div className="flex items-baseline space-x-2 my-2">
                          <span className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight font-mono drop-shadow-lg">
                            {hours}:{minutes}
                          </span>
                          <span className="text-xl sm:text-2xl font-semibold text-cyan-400 font-mono">
                            :{seconds}
                          </span>
                          <span className="text-xs font-bold text-slate-300 uppercase ml-1 px-2 py-0.5 rounded-md bg-white/10">
                            {time.getHours() >= 12 ? 'PM' : 'AM'}
                          </span>
                        </div>
                      </div>

                      {/* Date and Location */}
                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/10 text-xs">
                        <div className="flex items-center space-x-1.5 text-slate-200 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                          <span>{capitalizedDate}</span>
                        </div>
                        <span className="text-[11px] text-emerald-400 font-semibold flex items-center space-x-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span>NTP Sincronizado</span>
                        </span>
                      </div>
                    </div>
                  )}

                  {/* WIDGET: Memória RAM & Recursos Cluster */}
                  {widgetId === 'ram' && (
                    <div className="group/widget relative liquid-glass-card liquid-reflection rounded-3xl p-5 shadow-2xl overflow-hidden h-full flex flex-col justify-between">
                      {/* Background ambient glow */}
                      <div className="absolute -top-12 -right-12 w-36 h-36 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

                      <div>
                        {/* Header: Title + Drag & Action Controls */}
                        <div className="flex items-center justify-between pb-3 mb-2 border-b border-white/10 flex-wrap gap-2">
                          <div className="flex items-center space-x-2 text-indigo-300">
                            <Zap className="w-4 h-4 text-purple-400 shrink-0" />
                            <span className="text-xs font-bold uppercase tracking-wider">Memória RAM do Cluster</span>
                          </div>

                          <div className="flex items-center space-x-1.5">
                            <button
                              onClick={handleClearRamCache}
                              disabled={ramFreeing}
                              className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/30 transition cursor-pointer flex items-center space-x-1 active:scale-95 disabled:opacity-50"
                              title="Limpar memória cache do Kernel"
                            >
                              <RefreshCw className={`w-3 h-3 ${ramFreeing ? 'animate-spin' : ''}`} />
                              <span>{ramFreeing ? 'Liberando...' : 'Liberar Cache'}</span>
                            </button>

                            {/* Drag Handle */}
                            <div
                              draggable
                              onDragStart={(e) => handleWidgetDragStart(e, 'ram')}
                              className="flex items-center space-x-1 px-2 py-1 rounded-xl bg-black/40 hover:bg-white/10 text-slate-400 hover:text-cyan-300 border border-white/5 cursor-grab active:cursor-grabbing transition"
                              title="Arraste este widget para mudar de posição"
                            >
                              <GripVertical className="w-3.5 h-3.5" />
                              <span className="text-[10px] font-medium hidden md:inline">Arrastar</span>
                            </div>

                            {/* Up / Down Reorder */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMoveWidget('ram', 'up');
                              }}
                              disabled={visibleIndex === 0}
                              className="p-1 rounded-lg bg-black/40 hover:bg-white/10 text-slate-400 hover:text-white disabled:opacity-20 disabled:hover:bg-black/40 cursor-pointer disabled:cursor-not-allowed border border-white/5 transition"
                              title="Mover widget para cima"
                            >
                              <ChevronUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMoveWidget('ram', 'down');
                              }}
                              disabled={visibleIndex === visibleWidgetIds.length - 1}
                              className="p-1 rounded-lg bg-black/40 hover:bg-white/10 text-slate-400 hover:text-white disabled:opacity-20 disabled:hover:bg-black/40 cursor-pointer disabled:cursor-not-allowed border border-white/5 transition"
                              title="Mover widget para baixo"
                            >
                              <ChevronDown className="w-3.5 h-3.5" />
                            </button>

                            {/* Remove button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleHideWidget('ram');
                              }}
                              className="p-1 rounded-lg bg-black/40 hover:bg-red-500/20 text-slate-400 hover:text-red-300 border border-white/5 transition cursor-pointer"
                              title="Tirar widget da Tela Inicial"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Usage Counter */}
                        <div className="flex items-baseline justify-between my-2">
                          <div className="flex items-baseline space-x-2">
                            <span className="text-3xl sm:text-4xl font-extrabold text-white font-mono">
                              {usedRamGb}
                            </span>
                            <span className="text-slate-400 text-sm font-semibold">
                              / {totalRamGb} GB
                            </span>
                          </div>
                          <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            {ramUsagePercent}% Em Uso
                          </span>
                        </div>

                        {/* Liquid Progress Bar */}
                        <div className="w-full h-3 bg-black/40 rounded-full p-0.5 border border-white/10 overflow-hidden relative my-2">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-500 transition-all duration-700 relative shadow-lg"
                            style={{ width: `${ramUsagePercent}%` }}
                          >
                            <div className="absolute inset-0 bg-white/20 animate-pulse" />
                          </div>
                        </div>
                      </div>

                      {/* Sub stats */}
                      <div>
                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/10 text-xs text-slate-300">
                          <span>Livre: <strong className="text-emerald-400">{freeRamGb} GB</strong></span>
                          <span>SWAP ZRAM: <strong className="text-slate-200">1.2 GB / 16 GB</strong></span>
                          <span>Cache: <strong className="text-cyan-300">14.6 GB</strong></span>
                        </div>

                        {ramClearedMsg && (
                          <div className="mt-2 text-center text-[11px] font-semibold text-emerald-300 bg-emerald-500/20 py-1 rounded-lg border border-emerald-500/30 animate-fade-in">
                            {ramClearedMsg}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* WIDGET: Aplicativos na Tela Inicial */}
                  {widgetId === 'apps' && (
                    <div className="group/widget liquid-glass-card liquid-reflection rounded-3xl p-5 shadow-2xl">
                      <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10 flex-wrap gap-2">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md">
                            <Home className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                                Aplicativos na Tela Inicial
                              </h3>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                                {desktopPinnedApps.length} Fixados
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400">
                              Arraste os aplicativos para reorganizar ou use o botão 'X' para desafixar da inicial.
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={onOpenLauncher}
                            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-fuchsia-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 text-white text-xs font-bold transition cursor-pointer shadow-lg shadow-purple-600/25 active:scale-95"
                            title="Abrir o Launcher de Aplicativos"
                          >
                            <LayoutGrid className="w-3.5 h-3.5" />
                            <span>Launcher Completo</span>
                          </button>

                          {/* Drag Handle */}
                          <div
                            draggable
                            onDragStart={(e) => handleWidgetDragStart(e, 'apps')}
                            className="flex items-center space-x-1 px-2 py-1 rounded-xl bg-black/40 hover:bg-white/10 text-slate-400 hover:text-cyan-300 border border-white/5 cursor-grab active:cursor-grabbing transition"
                            title="Arraste este widget para mudar de posição"
                          >
                            <GripVertical className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-medium hidden md:inline">Arrastar</span>
                          </div>

                          {/* Up / Down Reorder */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveWidget('apps', 'up');
                            }}
                            disabled={visibleIndex === 0}
                            className="p-1 rounded-lg bg-black/40 hover:bg-white/10 text-slate-400 hover:text-white disabled:opacity-20 disabled:hover:bg-black/40 cursor-pointer disabled:cursor-not-allowed border border-white/5 transition"
                            title="Mover widget para cima"
                          >
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveWidget('apps', 'down');
                            }}
                            disabled={visibleIndex === visibleWidgetIds.length - 1}
                            className="p-1 rounded-lg bg-black/40 hover:bg-white/10 text-slate-400 hover:text-white disabled:opacity-20 disabled:hover:bg-black/40 cursor-pointer disabled:cursor-not-allowed border border-white/5 transition"
                            title="Mover widget para baixo"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>

                          {/* Remove Entire Widget from Home */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleHideWidget('apps');
                            }}
                            className="p-1 rounded-lg bg-black/40 hover:bg-red-500/20 text-slate-400 hover:text-red-300 border border-white/5 transition cursor-pointer"
                            title="Tirar grade de aplicativos da Tela Inicial"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Desktop Pinned Grid with App Drag & Drop Reordering */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
                        {pinnedAppObjects.map((app) => {
                          const isAppDragging = draggedAppId === app.id;
                          const isAppDragOver = dragOverAppId === app.id && draggedAppId !== app.id;

                          return (
                            <div
                              key={app.id}
                              draggable
                              onDragStart={(e) => handleAppDragStart(e, app.id)}
                              onDragOver={(e) => handleAppDragOver(e, app.id)}
                              onDrop={(e) => handleAppDrop(e, app.id)}
                              onDragEnd={() => {
                                setDraggedAppId(null);
                                setDragOverAppId(null);
                              }}
                              onClick={() => onOpenApp(app.id)}
                              className={`group relative p-3 rounded-2xl liquid-glass-subcard cursor-pointer flex flex-col items-center text-center justify-between shadow-lg transition-all ${
                                isAppDragging ? 'opacity-30 scale-90 ring-1 ring-cyan-400' : ''
                              } ${
                                isAppDragOver ? 'scale-105 ring-2 ring-cyan-400 shadow-cyan-400/50' : ''
                              }`}
                              title={`${app.name} (Arraste para reposicionar)`}
                            >
                              {/* Unpin button on hover - "Tira da inicial" */}
                              {onTogglePinDesktop && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onTogglePinDesktop(app.id);
                                    showToast(`"${app.name}" removido da Tela Inicial.`);
                                  }}
                                  className="opacity-0 group-hover:opacity-100 absolute top-1.5 right-1.5 p-1 rounded-lg bg-black/70 hover:bg-red-500 text-slate-300 hover:text-white transition z-10 shadow-md cursor-pointer"
                                  title="Tirar este app da Tela Inicial"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              )}

                              {/* App Squircle Icon with bounce and smooth hover transition */}
                              <div className="mb-2 transition-all duration-300 transform group-hover:-translate-y-2 group-hover:scale-110 group-active:scale-95 group-active:translate-y-0 group-hover:drop-shadow-[0_12px_20px_rgba(56,189,248,0.35)]">
                                <div className="transition-transform duration-300 ease-out group-hover:animate-bounce-short">
                                  <AppIcon appId={app.id} size="md" className="w-11 h-11" />
                                </div>
                              </div>

                              {/* Name and Tag */}
                              <div className="w-full">
                                <span className="text-xs font-bold text-white group-hover:text-cyan-300 transition block truncate">
                                  {app.name}
                                </span>
                                <span className="text-[9px] text-slate-400 block truncate mt-0.5">
                                  {app.category.split(' ')[0]}
                                </span>
                              </div>

                              {/* Action */}
                              <div className="mt-2 w-full pt-1.5 border-t border-white/5 flex items-center justify-center">
                                <span className="text-[9px] font-semibold text-cyan-400 flex items-center space-x-1">
                                  <span>Abrir</span>
                                  <ExternalLink className="w-2.5 h-2.5" />
                                </span>
                              </div>
                            </div>
                          );
                        })}

                        {/* "+ Adicionar App à Tela Inicial" button */}
                        <button
                          onClick={onOpenLauncher}
                          className="p-3 rounded-2xl border border-dashed border-white/20 hover:border-cyan-400/50 hover:bg-cyan-500/10 transition-all duration-200 cursor-pointer flex flex-col items-center justify-center text-center text-slate-400 hover:text-cyan-300 group min-h-[110px]"
                        >
                          <div className="w-9 h-9 rounded-xl bg-white/5 group-hover:bg-cyan-500/20 flex items-center justify-center mb-1.5 transition">
                            <Plus className="w-4 h-4 text-slate-400 group-hover:text-cyan-300" />
                          </div>
                          <span className="text-[11px] font-bold">+ Adicionar</span>
                          <span className="text-[9px] text-slate-500">via Launcher</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* WIDGET: Atalhos Web & Links Rápidos */}
                  {widgetId === 'shortcuts' && (
                    <div className="group/widget liquid-glass-card liquid-reflection rounded-3xl p-5 shadow-2xl">
                      <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10 flex-wrap gap-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-7 h-7 rounded-xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300">
                            <Globe className="w-4 h-4" />
                          </div>
                          <div>
                            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                              Atalhos Web & Links Rápidos
                            </h3>
                            <p className="text-[10px] text-slate-400">
                              Arraste para organizar ou acesse serviços com 1 clique
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setShowAddShortcutModal(true)}
                            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition cursor-pointer shadow-lg shadow-cyan-600/25 active:scale-95"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Adicionar Atalho</span>
                          </button>

                          {/* Drag Handle */}
                          <div
                            draggable
                            onDragStart={(e) => handleWidgetDragStart(e, 'shortcuts')}
                            className="flex items-center space-x-1 px-2 py-1 rounded-xl bg-black/40 hover:bg-white/10 text-slate-400 hover:text-cyan-300 border border-white/5 cursor-grab active:cursor-grabbing transition"
                            title="Arraste este widget para mudar de posição"
                          >
                            <GripVertical className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-medium hidden md:inline">Arrastar</span>
                          </div>

                          {/* Up / Down Reorder */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveWidget('shortcuts', 'up');
                            }}
                            disabled={visibleIndex === 0}
                            className="p-1 rounded-lg bg-black/40 hover:bg-white/10 text-slate-400 hover:text-white disabled:opacity-20 disabled:hover:bg-black/40 cursor-pointer disabled:cursor-not-allowed border border-white/5 transition"
                            title="Mover widget para cima"
                          >
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveWidget('shortcuts', 'down');
                            }}
                            disabled={visibleIndex === visibleWidgetIds.length - 1}
                            className="p-1 rounded-lg bg-black/40 hover:bg-white/10 text-slate-400 hover:text-white disabled:opacity-20 disabled:hover:bg-black/40 cursor-pointer disabled:cursor-not-allowed border border-white/5 transition"
                            title="Mover widget para baixo"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>

                          {/* Remove Widget */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleHideWidget('shortcuts');
                            }}
                            className="p-1 rounded-lg bg-black/40 hover:bg-red-500/20 text-slate-400 hover:text-red-300 border border-white/5 transition cursor-pointer"
                            title="Tirar atalhos da Tela Inicial"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Shortcuts Grid with Drag & Drop Reordering */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {webShortcuts.map((shortcut) => {
                          const isShortcutDragging = draggedShortcutId === shortcut.id;
                          const isShortcutDragOver = dragOverShortcutId === shortcut.id && draggedShortcutId !== shortcut.id;

                          return (
                            <div
                              key={shortcut.id}
                              draggable
                              onDragStart={(e) => handleShortcutDragStart(e, shortcut.id)}
                              onDragOver={(e) => handleShortcutDragOver(e, shortcut.id)}
                              onDrop={(e) => handleShortcutDrop(e, shortcut.id)}
                              onDragEnd={() => {
                                setDraggedShortcutId(null);
                                setDragOverShortcutId(null);
                              }}
                              onClick={() => handleOpenShortcut(shortcut)}
                              className={`group relative p-3 rounded-2xl liquid-glass-subcard cursor-pointer text-left flex flex-col justify-between transition-all ${
                                isShortcutDragging ? 'opacity-30 scale-90 ring-1 ring-cyan-400' : ''
                              } ${
                                isShortcutDragOver ? 'scale-105 ring-2 ring-cyan-400 shadow-cyan-400/50' : ''
                              }`}
                              title={`${shortcut.name} (Arraste para reposicionar)`}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-2xl drop-shadow transform transition-all duration-300 group-hover:scale-125 group-hover:-translate-y-1 group-hover:animate-bounce-short">
                                  {shortcut.icon}
                                </span>
                                <button
                                  onClick={(e) => handleDeleteShortcut(shortcut.id, e)}
                                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 text-slate-400 hover:text-red-300 rounded-lg transition"
                                  title="Excluir atalho"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>

                              <div>
                                <h4 className="text-xs font-bold text-white group-hover:text-cyan-300 transition truncate">
                                  {shortcut.name}
                                </h4>
                                <span className="text-[10px] text-slate-400 truncate block">
                                  {shortcut.category}
                                </span>
                              </div>

                              <div className="mt-2 flex items-center justify-between text-[10px] text-cyan-400 font-semibold pt-1 border-t border-white/5">
                                <span>Abrir</span>
                                <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 transition" />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* WIDGET: UmbrelOS KVM Run Any OS Card */}
                  {widgetId === 'kvm' && (
                    <div
                      onClick={() => onOpenApp('vn')}
                      className="group/widget relative liquid-glass-card liquid-reflection rounded-3xl p-5 shadow-2xl flex flex-col justify-between cursor-pointer hover:border-blue-400/50 h-full"
                    >
                      {/* Top Controls: Drag, Reorder and Remove */}
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
                        <div className="flex items-center space-x-2 text-cyan-400">
                          <Server className="w-4 h-4" />
                          <span className="text-[11px] font-bold uppercase tracking-wider">Run any OS in Umbrel</span>
                        </div>

                        <div className="flex items-center space-x-1.5">
                          {/* Drag Handle */}
                          <div
                            draggable
                            onDragStart={(e) => handleWidgetDragStart(e, 'kvm')}
                            className="flex items-center space-x-1 px-2 py-1 rounded-xl bg-black/40 hover:bg-white/10 text-slate-400 hover:text-cyan-300 border border-white/5 cursor-grab active:cursor-grabbing transition"
                            title="Arraste este widget para mudar de posição"
                          >
                            <GripVertical className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-medium hidden md:inline">Arrastar</span>
                          </div>

                          {/* Up / Down Reorder */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveWidget('kvm', 'up');
                            }}
                            disabled={visibleIndex === 0}
                            className="p-1 rounded-lg bg-black/40 hover:bg-white/10 text-slate-400 hover:text-white disabled:opacity-20 disabled:hover:bg-black/40 cursor-pointer disabled:cursor-not-allowed border border-white/5 transition"
                            title="Mover widget para cima"
                          >
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveWidget('kvm', 'down');
                            }}
                            disabled={visibleIndex === visibleWidgetIds.length - 1}
                            className="p-1 rounded-lg bg-black/40 hover:bg-white/10 text-slate-400 hover:text-white disabled:opacity-20 disabled:hover:bg-black/40 cursor-pointer disabled:cursor-not-allowed border border-white/5 transition"
                            title="Mover widget para baixo"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>

                          {/* Remove Widget Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleHideWidget('kvm');
                            }}
                            className="p-1 rounded-lg bg-black/40 hover:bg-red-500/20 text-slate-400 hover:text-red-300 border border-white/5 transition cursor-pointer z-10"
                            title="Tirar card da Tela Inicial"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="my-2">
                        <h4 className="text-sm font-bold text-white leading-tight mb-1">
                          Virtualização Hypervisor KVM
                        </h4>
                        <p className="text-xs text-slate-300 leading-snug">
                          Execute Ubuntu 24.04, Windows 11 Pro ou Debian com GPU passthrough e VNC nativo.
                        </p>
                      </div>

                      <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                        <span className="text-emerald-400 font-semibold flex items-center space-x-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          <span>5 VNs Prontas</span>
                        </span>
                        <span className="text-cyan-400 font-bold group-hover:translate-x-1 transition flex items-center space-x-1">
                          <span>Gerenciar</span>
                          <span>➜</span>
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Visual Drop Bar Indicator (Bottom) */}
                  {isTargetDragOver && dropPosition === 'after' && (
                    <div className="absolute -bottom-2.5 left-2 right-2 h-1.5 bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-500 rounded-full shadow-lg shadow-cyan-400/80 animate-pulse z-40" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Floating Notification Toast */}
      {removedToast && (
        <div className="fixed bottom-24 right-6 z-50 pointer-events-auto bg-slate-900/95 border border-cyan-500/30 text-white px-4 py-2.5 rounded-2xl shadow-2xl backdrop-blur-xl flex items-center space-x-2.5 text-xs animate-fade-in">
          <Info className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="font-medium">{removedToast}</span>
          <button
            onClick={() => setIsConfigModalOpen(true)}
            className="ml-2 underline text-cyan-300 hover:text-white font-bold cursor-pointer"
          >
            Configurar
          </button>
        </div>
      )}

      {/* MODAL: Configuração de Widgets (Umbrel OS Style) */}
      {isConfigModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-2xl pointer-events-auto select-none animate-fade-in"
          onClick={() => setIsConfigModalOpen(false)}
        >
          <div
            className="w-full max-w-xl liquid-glass rounded-3xl p-6 shadow-2xl text-white space-y-5 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <SlidersHorizontal className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Configuração de Widgets</h3>
                  <p className="text-xs text-slate-400">
                    Escolha o que exibir ou tirar da Tela Inicial estilo UmbrelOS 2.0
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsConfigModalOpen(false)}
                className="p-2 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Presets */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                Predefinições Rápidas
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  onClick={() => {
                    onUpdateWidgetsConfig({
                      showTopBar: true,
                      showClockWidget: true,
                      showRamWidget: true,
                      showDesktopAppsWidget: true,
                      showWebShortcutsWidget: true,
                      showKvmWidget: true,
                    });
                    showToast('Todos os widgets foram ativados.');
                  }}
                  className="p-2.5 rounded-2xl bg-white/5 hover:bg-cyan-600/20 border border-white/10 hover:border-cyan-400/40 text-left transition cursor-pointer text-xs group"
                >
                  <div className="font-bold text-white group-hover:text-cyan-300">Completo</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Todos os widgets</div>
                </button>

                <button
                  onClick={() => {
                    onUpdateWidgetsConfig({
                      showTopBar: true,
                      showClockWidget: true,
                      showRamWidget: false,
                      showDesktopAppsWidget: true,
                      showWebShortcutsWidget: false,
                      showKvmWidget: false,
                    });
                    showToast('Modo UmbrelOS Aplicado.');
                  }}
                  className="p-2.5 rounded-2xl bg-white/5 hover:bg-purple-600/20 border border-white/10 hover:border-purple-400/40 text-left transition cursor-pointer text-xs group"
                >
                  <div className="font-bold text-white group-hover:text-purple-300">UmbrelOS Clean</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Apps e relógio</div>
                </button>

                <button
                  onClick={() => {
                    onUpdateWidgetsConfig({
                      showTopBar: false,
                      showClockWidget: false,
                      showRamWidget: false,
                      showDesktopAppsWidget: true,
                      showWebShortcutsWidget: false,
                      showKvmWidget: false,
                    });
                    showToast('Modo Apenas Apps ativado.');
                  }}
                  className="p-2.5 rounded-2xl bg-white/5 hover:bg-blue-600/20 border border-white/10 hover:border-blue-400/40 text-left transition cursor-pointer text-xs group"
                >
                  <div className="font-bold text-white group-hover:text-blue-300">Só Aplicativos</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Grade limpa</div>
                </button>

                <button
                  onClick={() => {
                    onUpdateWidgetsConfig({
                      showTopBar: false,
                      showClockWidget: false,
                      showRamWidget: false,
                      showDesktopAppsWidget: false,
                      showWebShortcutsWidget: false,
                      showKvmWidget: false,
                    });
                    showToast('Modo Wallpaper Puro ativado!');
                  }}
                  className="p-2.5 rounded-2xl bg-white/5 hover:bg-emerald-600/20 border border-white/10 hover:border-emerald-400/40 text-left transition cursor-pointer text-xs group"
                >
                  <div className="font-bold text-white group-hover:text-emerald-300">Tela Limpa</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Apenas Wallpaper</div>
                </button>
              </div>
            </div>

            {/* Individual Widgets Toggles */}
            <div className="space-y-3 pt-2">
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                Alternar Visibilidade dos Widgets
              </span>

              <div className="space-y-2">
                {/* Toggle 1: Top Bar */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10">
                  <div className="flex items-center space-x-3">
                    <Cloud className="w-4 h-4 text-cyan-400" />
                    <div>
                      <div className="text-xs font-bold text-white">Barra Superior de Telemetria</div>
                      <div className="text-[10px] text-slate-400">Status InoveCloud, CPU, VNs e SSL</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={widgetsConfig.showTopBar}
                    onChange={(e) => onUpdateWidgetsConfig({ showTopBar: e.target.checked })}
                    className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
                  />
                </div>

                {/* Toggle 2: Clock & Date */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10">
                  <div className="flex items-center space-x-3">
                    <Clock className="w-4 h-4 text-blue-400" />
                    <div>
                      <div className="text-xs font-bold text-white">Relógio & Calendário Digital</div>
                      <div className="text-[10px] text-slate-400">Hora com segundos e data completa</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={widgetsConfig.showClockWidget}
                    onChange={(e) => onUpdateWidgetsConfig({ showClockWidget: e.target.checked })}
                    className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
                  />
                </div>

                {/* Toggle 3: RAM & Cache */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10">
                  <div className="flex items-center space-x-3">
                    <Zap className="w-4 h-4 text-purple-400" />
                    <div>
                      <div className="text-xs font-bold text-white">Memória RAM & Recursos do Cluster</div>
                      <div className="text-[10px] text-slate-400">Gráfico de uso e botão para esvaziar cache</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={widgetsConfig.showRamWidget}
                    onChange={(e) => onUpdateWidgetsConfig({ showRamWidget: e.target.checked })}
                    className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
                  />
                </div>

                {/* Toggle 4: Desktop Apps */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10">
                  <div className="flex items-center space-x-3">
                    <Home className="w-4 h-4 text-emerald-400" />
                    <div>
                      <div className="text-xs font-bold text-white">Aplicativos na Tela Inicial</div>
                      <div className="text-[10px] text-slate-400">Grade de apps fixados no Desktop</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={widgetsConfig.showDesktopAppsWidget}
                    onChange={(e) => onUpdateWidgetsConfig({ showDesktopAppsWidget: e.target.checked })}
                    className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
                  />
                </div>

                {/* Toggle 5: Web Shortcuts */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10">
                  <div className="flex items-center space-x-3">
                    <Globe className="w-4 h-4 text-amber-400" />
                    <div>
                      <div className="text-xs font-bold text-white">Atalhos Web & Links Rápidos</div>
                      <div className="text-[10px] text-slate-400">Bookmarks para apps e sites favoritos</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={widgetsConfig.showWebShortcutsWidget}
                    onChange={(e) => onUpdateWidgetsConfig({ showWebShortcutsWidget: e.target.checked })}
                    className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
                  />
                </div>

                {/* Toggle 6: KVM Card */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10">
                  <div className="flex items-center space-x-3">
                    <Server className="w-4 h-4 text-indigo-400" />
                    <div>
                      <div className="text-xs font-bold text-white">Card KVM Virtualization (Run any OS)</div>
                      <div className="text-[10px] text-slate-400">Atalho para máquinas virtuais e hypervisor</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={widgetsConfig.showKvmWidget}
                    onChange={(e) => onUpdateWidgetsConfig({ showKvmWidget: e.target.checked })}
                    className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-white/10 flex items-center justify-between">
              <button
                onClick={() => {
                  onResetWidgetsConfig();
                  showToast('Configurações de widgets restauradas.');
                }}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-xs font-semibold transition cursor-pointer border border-white/10"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restaurar Padrão</span>
              </button>

              <button
                onClick={() => setIsConfigModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition cursor-pointer shadow-lg shadow-cyan-600/25"
              >
                Concluído
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Adicionar Atalho App Web */}
      {showAddShortcutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md pointer-events-auto">
          <div className="w-full max-w-md bg-slate-900/95 rounded-3xl p-6 border border-white/20 shadow-2xl text-white animate-fade-in">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
              <div className="flex items-center space-x-2">
                <Globe className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">
                  Novo Atalho de App Web
                </h3>
              </div>
              <button
                onClick={() => setShowAddShortcutModal(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveShortcut} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nome do Aplicativo
                </label>
                <input
                  type="text"
                  value={newShortcutName}
                  onChange={(e) => setNewShortcutName(e.target.value)}
                  placeholder="Ex: Notion, ChatGPT, Figma, Supabase"
                  required
                  className="w-full bg-slate-950/80 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  URL / Endereço Web
                </label>
                <input
                  type="text"
                  value={newShortcutUrl}
                  onChange={(e) => setNewShortcutUrl(e.target.value)}
                  placeholder="Ex: https://chatgpt.com"
                  required
                  className="w-full bg-slate-950/80 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Ícone (Emoji)
                  </label>
                  <input
                    type="text"
                    value={newShortcutIcon}
                    onChange={(e) => setNewShortcutIcon(e.target.value)}
                    placeholder="🌐"
                    className="w-full bg-slate-950/80 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Categoria
                  </label>
                  <input
                    type="text"
                    value={newShortcutCategory}
                    onChange={(e) => setNewShortcutCategory(e.target.value)}
                    placeholder="Web App"
                    className="w-full bg-slate-950/80 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-white/10 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddShortcutModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs text-slate-300 hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-xs font-bold text-white shadow-lg shadow-cyan-600/25 cursor-pointer"
                >
                  Salvar Atalho
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
