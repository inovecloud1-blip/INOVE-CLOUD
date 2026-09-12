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
  BookOpen
} from 'lucide-react';
import { AppId, AppCategory, LauncherAppInfo } from '../../types';
import { LAUNCHER_APPS, DEFAULT_DOCK_PINNED } from '../../data/launcherApps';
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
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');

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
      default: return <Grid className={className} />;
    }
  };

  const handleAppClick = (id: AppId) => {
    onOpenApp(id);
    onClose();
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

          {/* Quick Dock Controls & Counters */}
          <div className="flex items-center flex-wrap gap-2">
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
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-cyan-600/30 hover:bg-cyan-600 border border-cyan-400/40 text-cyan-200 hover:text-white text-xs font-bold transition cursor-pointer shadow-md"
                title="Restaura os aplicativos padrões na Dock"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restaurar Apps na Dock</span>
              </button>
            )}

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-2xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer border border-white/10"
              title="Fechar Launcher (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search Bar & Categories */}
        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative max-w-2xl mx-auto">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por aplicativo, protocolo, recurso ou categoria..."
              className="w-full bg-slate-900/90 border border-white/20 rounded-2xl pl-12 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 shadow-2xl transition"
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

          {/* Category Pills */}
          <div className="flex items-center justify-center flex-wrap gap-2 pt-1">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer border ${
                    isActive
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-lg shadow-cyan-500/25 font-bold'
                      : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Apps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-h-[58vh] overflow-y-auto pr-1 no-scrollbar pt-2">
          {filteredApps.map((app) => {
            const isDesktopPinned = desktopPinnedApps.includes(app.id);
            const isDockPinned = dockPinnedApps.includes(app.id);

            return (
              <div
                key={app.id}
                className="group relative p-4 rounded-3xl liquid-glass-card border border-white/15 hover:border-cyan-400/40 transition-all duration-300 shadow-xl flex flex-col justify-between hover:-translate-y-1"
              >
                <div>
                  {/* Card Header: Icon + Category + Badges */}
                  <div className="flex items-start justify-between mb-3">
                    <div
                      onClick={() => handleAppClick(app.id)}
                      className="cursor-pointer group-hover:scale-105 transition"
                    >
                      <AppIcon appId={app.id} size="lg" className="w-13 h-13" />
                    </div>

                    <div className="flex items-center space-x-1.5">
                      {app.badge && (
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold text-white shadow-sm ${app.badgeColor || 'bg-blue-500'}`}>
                          {app.badge}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* App Info */}
                  <div className="cursor-pointer" onClick={() => handleAppClick(app.id)}>
                    <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition flex items-center space-x-1.5">
                      <span>{app.name}</span>
                    </h3>
                    <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
                      {app.category}
                    </span>
                    <p className="text-xs text-slate-300 mt-2 leading-relaxed line-clamp-2">
                      {app.description}
                    </p>
                  </div>
                </div>

                {/* Card Actions Footer: Desktop Pin, Dock Pin & Open */}
                <div className="mt-4 pt-3 border-t border-white/10 flex flex-col space-y-2">
                  <div className="flex items-center justify-between gap-1 text-[11px]">
                    {/* Pin to Desktop */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onTogglePinDesktop(app.id);
                      }}
                      className={`flex-1 flex items-center justify-center space-x-1 py-1 px-2 rounded-lg border transition cursor-pointer ${
                        isDesktopPinned
                          ? 'bg-cyan-500/20 border-cyan-400/40 text-cyan-300'
                          : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
                      }`}
                      title="Fixar ou remover este app da Tela Inicial"
                    >
                      <Home className="w-3 h-3" />
                      <span className="truncate">{isDesktopPinned ? '✓ Desktop' : '+ Desktop'}</span>
                    </button>

                    {/* Pin to Dock */}
                    {onTogglePinDock && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onTogglePinDock(app.id);
                        }}
                        className={`flex-1 flex items-center justify-center space-x-1 py-1 px-2 rounded-lg border transition cursor-pointer ${
                          isDockPinned
                            ? 'bg-purple-500/20 border-purple-400/40 text-purple-300'
                            : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
                        }`}
                        title="Fixar ou remover este app da Dock inferior"
                      >
                        <LayoutGrid className="w-3 h-3" />
                        <span className="truncate">{isDockPinned ? '✓ Na Dock' : '+ Dock'}</span>
                      </button>
                    )}
                  </div>

                  {/* Open App Button */}
                  <button
                    onClick={() => handleAppClick(app.id)}
                    className="w-full flex items-center justify-center space-x-1.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition cursor-pointer shadow-md shadow-cyan-600/25 active:scale-95 text-xs"
                  >
                    <span>Abrir Aplicativo</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredApps.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <p className="text-sm">Nenhum aplicativo encontrado para "{searchQuery}".</p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('Todos'); }}
              className="mt-2 text-xs text-cyan-400 hover:underline"
            >
              Limpar filtros de busca
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
