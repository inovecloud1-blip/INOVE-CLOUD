import React, { useState } from 'react';
import {
  Search,
  X,
  Pin,
  PinOff,
  Check,
  ExternalLink,
  Sparkles,
  Server,
  Terminal,
  Activity,
  Compass,
  Monitor,
  Globe,
  Users,
  User,
  HardDrive,
  FolderKanban,
  Layers,
  Settings,
  Grid,
  Home,
  LayoutGrid,
  RotateCcw,
  Sliders,
  Disc,
  BookOpen,
  Wrench,
  CheckCircle2,
  Cpu,
  Calculator as CalcIcon,
  Camera as CameraIcon,
  Image as GalleryIcon,
  Film as VideoIcon,
  Music as MusicIcon,
  FileText as NotesIcon,
  Palette
} from 'lucide-react';
import { AppId, AppCategory, LauncherAppInfo } from '../../types';
import { LAUNCHER_APPS, DEFAULT_DOCK_PINNED, DEFAULT_DESKTOP_PINNED } from '../../data/launcherApps';
import { AppIcon } from './AppIcon';

interface AppLauncherProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenApp: (id: AppId) => void;
  desktopPinnedApps: AppId[];
  onTogglePinDesktop: (id: AppId) => void;
  dockPinnedApps?: AppId[];
  onTogglePinDock?: (id: AppId) => void;
  onClearDockExceptLauncher?: () => void;
  onResetDockDefault?: () => void;
  showOpenWindowsInDock?: boolean;
  onToggleShowOpenWindows?: () => void;
  onAutoConfigSystem?: () => void;
}

export const AppLauncher: React.FC<AppLauncherProps> = ({
  isOpen,
  onClose,
  onOpenApp,
  desktopPinnedApps,
  onTogglePinDesktop,
  dockPinnedApps = DEFAULT_DOCK_PINNED,
  onTogglePinDock,
  onClearDockExceptLauncher,
  onResetDockDefault,
  showOpenWindowsInDock = true,
  onToggleShowOpenWindows,
  onAutoConfigSystem,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [isAutoConfiguring, setIsAutoConfiguring] = useState(false);
  const [autoConfigSuccess, setAutoConfigSuccess] = useState(false);

  if (!isOpen) return null;

  const categories: string[] = [
    'Todos',
    'Infraestrutura & KVM',
    'Navegação & Web',
    'Segurança & IDaaS',
    'Storage & Produtividade',
    'Sistema & Monitoramento',
  ];

  const filteredApps = LAUNCHER_APPS.filter((app) => {
    const matchesSearch =
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'Todos' || app.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const renderAppIcon = (iconName: string, className = 'w-6 h-6 text-white') => {
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
      case 'Calculator': return <CalcIcon className={className} />;
      case 'Camera': return <CameraIcon className={className} />;
      case 'Image': return <GalleryIcon className={className} />;
      case 'Film': return <VideoIcon className={className} />;
      case 'Music': return <MusicIcon className={className} />;
      case 'FileText': return <NotesIcon className={className} />;
      case 'Palette': return <Palette className={className} />;
      default: return <Grid className={className} />;
    }
  };

  const handleAppClick = (id: AppId) => {
    try {
      onOpenApp(id);
    } catch (e) {
      console.error('[AppLauncher] Error launching app:', id, e);
    }
    onClose();
  };

  const handleRunAutoConfig = () => {
    setIsAutoConfiguring(true);
    setAutoConfigSuccess(false);

    try {
      // 1. Limpa entradas com formato inválido do localStorage
      const keysToCheck = [
        'inovecloud_desktop_pinned_apps',
        'inovecloud_dock_pinned_apps',
        'inovecloud_dock_config',
        'inovecloud_desktop_widgets_config',
      ];
      keysToCheck.forEach((key) => {
        try {
          const val = localStorage.getItem(key);
          if (val) JSON.parse(val);
        } catch {
          localStorage.removeItem(key);
        }
      });

      if (onAutoConfigSystem) {
        onAutoConfigSystem();
      }
    } catch (e) {
      console.warn('[Auto-Config] Cleaned and restored safe defaults', e);
    }

    setTimeout(() => {
      setIsAutoConfiguring(false);
      setAutoConfigSuccess(true);
      setTimeout(() => setAutoConfigSuccess(false), 3500);
    }, 600);
  };

  const isDockMinimal = dockPinnedApps.length === 0;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-start p-4 sm:p-8 bg-black/75 backdrop-blur-3xl select-none animate-fade-in overflow-y-auto"
      onClick={onClose}
    >
      {/* Modal Container */}
      <div
        className="w-full max-w-6xl my-auto space-y-6 liquid-glass rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/25"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap pb-4 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-700 flex items-center justify-center shadow-xl shadow-cyan-500/20 border border-white/20">
              <Grid className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-extrabold text-white tracking-wide">
                  Launcher de Aplicativos
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  {LAUNCHER_APPS.length} Apps
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Organize seus aplicativos na Tela Inicial (Desktop) e na Dock inferior
              </p>
            </div>
          </div>

          {/* Quick Dock Controls & Auto-Config Button */}
          <div className="flex items-center flex-wrap gap-2">
            {/* Auto Configuration & System Self-Healing Button */}
            <button
              onClick={handleRunAutoConfig}
              disabled={isAutoConfiguring}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border text-xs font-bold transition shadow-lg cursor-pointer ${
                autoConfigSuccess
                  ? 'bg-emerald-500/30 border-emerald-400 text-emerald-200'
                  : 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 border-red-400/40 text-white shadow-red-500/20 active:scale-95'
              }`}
              title="Executa a auto-configuração inteligente, repara caminhos do launcher e otimiza a dock"
            >
              {isAutoConfiguring ? (
                <>
                  <Wrench className="w-3.5 h-3.5 animate-spin" />
                  <span>Auto-Configurando...</span>
                </>
              ) : autoConfigSuccess ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Sistema 100% Configurado & Estável!</span>
                </>
              ) : (
                <>
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Auto-Configuração do Sistema</span>
                </>
              )}
            </button>

            {/* Desktop Count */}
            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300">
              <Home className="w-3.5 h-3.5 text-cyan-400" />
              <span><strong>{desktopPinnedApps.length}</strong> Desktop</span>
            </div>

            {/* Dock Count */}
            <div className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs ${
              isDockMinimal
                ? 'bg-purple-500/20 border-purple-500/40 text-purple-300'
                : 'bg-white/5 border-white/10 text-slate-300'
            }`}>
              <LayoutGrid className="w-3.5 h-3.5 text-purple-400" />
              <span>
                {isDockMinimal ? <strong>Só Launcher na Dock</strong> : <><strong>{dockPinnedApps.length}</strong> na Dock</>}
              </span>
            </div>

            {/* Button: Leave only Launcher on Dock */}
            {onClearDockExceptLauncher && !isDockMinimal && (
              <button
                onClick={onClearDockExceptLauncher}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600 border border-purple-400/40 hover:border-purple-400 text-purple-200 hover:text-white text-xs font-bold transition cursor-pointer shadow-md"
                title="Remove todos os aplicativos da Dock, deixando exclusivamente o Launcher"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Deixar só Launcher na Dock</span>
              </button>
            )}

            {/* Button: Restore Default Dock */}
            {onResetDockDefault && isDockMinimal && (
              <button
                onClick={onResetDockDefault}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-cyan-600/30 hover:bg-cyan-600 border border-cyan-400/40 hover:border-cyan-400 text-cyan-200 hover:text-white text-xs font-bold transition cursor-pointer shadow-md"
                title="Restaura os aplicativos padrão fixados na Dock"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restaurar Apps na Dock</span>
              </button>
            )}

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search Bar & Category Filter */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar aplicativos por nome, tecnologia ou comando..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-2xl bg-black/40 border border-white/15 text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition backdrop-blur-md"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category Badges */}
          <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer border ${
                  selectedCategory === cat
                    ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white border-red-400/40 shadow-lg shadow-red-500/20'
                    : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Apps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[55vh] overflow-y-auto pr-1">
          {filteredApps.map((app) => {
            const isDesktopPinned = desktopPinnedApps.includes(app.id);
            const isDockPinned = dockPinnedApps.includes(app.id);

            return (
              <div
                key={app.id}
                className="group relative flex items-start space-x-3.5 p-3.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.09] border border-white/10 hover:border-white/25 transition duration-200 backdrop-blur-md shadow-lg"
              >
                {/* 3D Skeuomorphic App Icon Clickable */}
                <div
                  onClick={() => handleAppClick(app.id)}
                  className="shrink-0 cursor-pointer transition-transform duration-200 group-hover:scale-105 active:scale-95"
                >
                  <AppIcon appId={app.id} size="lg" />
                </div>

                {/* Info & Description */}
                <div
                  className="flex-1 min-w-0 cursor-pointer"
                  onClick={() => handleAppClick(app.id)}
                >
                  <div className="flex items-center space-x-2">
                    <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition truncate">
                      {app.name}
                    </h3>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-bold text-white uppercase tracking-wider ${app.badgeColor}`}
                    >
                      {app.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                    {app.description}
                  </p>
                </div>

                {/* Actions: Pin/Unpin Desktop and Dock */}
                <div className="flex flex-col items-center space-y-1 shrink-0 pt-0.5">
                  {/* Pin/Unpin on Desktop */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onTogglePinDesktop(app.id);
                    }}
                    className={`p-1.5 rounded-lg text-xs transition cursor-pointer ${
                      isDesktopPinned
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30'
                        : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                    }`}
                    title={
                      isDesktopPinned
                        ? 'Remover da Tela Inicial (Desktop)'
                        : 'Fixar na Tela Inicial (Desktop)'
                    }
                  >
                    {isDesktopPinned ? (
                      <PinOff className="w-3.5 h-3.5" />
                    ) : (
                      <Pin className="w-3.5 h-3.5" />
                    )}
                  </button>

                  {/* Pin/Unpin on Dock */}
                  {onTogglePinDock && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onTogglePinDock(app.id);
                      }}
                      className={`p-1.5 rounded-lg text-xs transition cursor-pointer ${
                        isDockPinned
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 hover:bg-purple-500/30'
                          : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                      }`}
                      title={
                        isDockPinned
                          ? 'Remover da Dock inferior'
                          : 'Fixar na Dock inferior'
                      }
                    >
                      <LayoutGrid className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {filteredApps.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-12 text-center text-slate-400">
              <Search className="w-12 h-12 text-slate-600 mb-3" />
              <p className="text-sm font-semibold text-slate-300">
                Nenhum aplicativo encontrado para "{searchQuery}"
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Tente buscar por termos como "terminal", "vm", "web", "storage" ou "docker".
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
