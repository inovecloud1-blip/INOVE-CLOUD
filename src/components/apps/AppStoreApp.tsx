import React, { useState, useEffect } from 'react';
import {
  Search,
  Download,
  Trash2,
  ExternalLink,
  CheckCircle2,
  Sparkles,
  Play,
  Terminal,
  ShieldCheck,
  RefreshCw,
  Box,
  Copy,
  Check,
  AlertCircle,
  Cpu,
  ChevronLeft,
  ChevronRight,
  Layers,
  Settings,
  HelpCircle,
  User,
  Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AppStoreItem } from '../../types';
import { RealAppIcon } from './RealAppIcon';
import { AppScreenshotModal } from './AppScreenshotModal';
import { FLATHUB_APPS, FlathubAppDetail } from '../../data/flathubAppsData';

interface AppStoreAppProps {
  catalog?: AppStoreItem[];
  onToggleInstall?: (id: string) => void;
}

export const AppStoreApp: React.FC<AppStoreAppProps> = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  
  // App detail / screenshot modal state
  const [selectedAppModal, setSelectedAppModal] = useState<FlathubAppDetail | null>(null);

  // Install states
  const [installingId, setInstallingId] = useState<string | null>(null);
  const [installProgress, setInstallProgress] = useState(0);
  const [installStage, setInstallStage] = useState<string>('');
  
  // Uninstall states
  const [uninstallingId, setUninstallingId] = useState<string | null>(null);
  const [uninstallProgress, setUninstallProgress] = useState(0);
  const [uninstallStage, setUninstallStage] = useState<string>('');

  const [notification, setNotification] = useState<{ type: 'success' | 'info' | 'error'; message: string } | null>(null);
  const [launchingId, setLaunchingId] = useState<string | null>(null);

  // Master Catalog with state
  const [flathubApps, setFlathubApps] = useState<FlathubAppDetail[]>(FLATHUB_APPS);

  // Hero carousel state
  const [heroIndex, setHeroIndex] = useState(0);
  const heroApps = flathubApps.filter((a) => a.hotTrending || a.id === 'android-studio' || a.id === 'vscode' || a.id === 'steam');

  // Categories list
  const categories = [
    'Todos',
    'Populares',
    'AppImage Portable',
    'Internet',
    'Jogos',
    'Áudio e Vídeo',
    'Desenvolvimento',
    'Produtividade',
    'Utilitários',
    'Gráficos',
    'Educação',
    'Instalados'
  ];

  // Sincronizar com backend
  useEffect(() => {
    fetch('/api/apps')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data.apps)) {
          const installedIds = new Set(data.apps.map((a: any) => a.id));
          setFlathubApps((prev) =>
            prev.map((app) => ({
              ...app,
              installed: installedIds.has(app.id) || app.installed,
            }))
          );
        }
      })
      .catch(() => {});
  }, []);

  // Keyboard shortcut '/' for search focus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        document.getElementById('flathub-search-input')?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Install handler (Flatpak simulation)
  const handleInstallApp = async (app: FlathubAppDetail) => {
    if (installingId) return;

    setInstallingId(app.id);
    setInstallProgress(10);
    setInstallStage('Conectando ao repositório Flathub...');

    try {
      await new Promise((r) => setTimeout(r, 600));
      setInstallProgress(35);
      setInstallStage('Baixando camadas OCI do pacote (' + app.size + ')...');

      await new Promise((r) => setTimeout(r, 800));
      setInstallProgress(70);
      setInstallStage('Configurando isolamento sandbox Bubblewrap...');

      await new Promise((r) => setTimeout(r, 600));
      setInstallProgress(90);
      setInstallStage('Exportando atalhos no Desktop e Dock...');

      // Notify backend if available
      await fetch('/api/apps/install', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appId: app.id, name: app.name, icon: app.iconType }),
      }).catch(() => {});

      await new Promise((r) => setTimeout(r, 400));
      setInstallProgress(100);
      setInstallStage('Instalação concluída com sucesso!');

      // Update state
      setFlathubApps((prev) =>
        prev.map((a) => (a.id === app.id ? { ...a, installed: true } : a))
      );

      if (selectedAppModal?.id === app.id) {
        setSelectedAppModal((prev) => (prev ? { ...prev, installed: true } : null));
      }

      setNotification({
        type: 'success',
        message: `${app.name} foi instalado com sucesso via Flathub!`,
      });
    } catch {
      setNotification({
        type: 'error',
        message: `Falha ao instalar ${app.name}.`,
      });
    } finally {
      setTimeout(() => {
        setInstallingId(null);
        setInstallProgress(0);
        setInstallStage('');
      }, 700);
    }
  };

  // Uninstall handler
  const handleUninstallApp = async (app: FlathubAppDetail) => {
    if (uninstallingId) return;

    setUninstallingId(app.id);
    setUninstallProgress(20);
    setUninstallStage('Encerrando instâncias em execução...');

    try {
      await new Promise((r) => setTimeout(r, 500));
      setUninstallProgress(50);
      setUninstallStage('Removendo arquivos do runtime Flatpak...');

      await new Promise((r) => setTimeout(r, 600));
      setUninstallProgress(85);
      setUninstallStage('Limpando atalhos e permissões...');

      await fetch('/api/apps/uninstall', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appId: app.id }),
      }).catch(() => {});

      await new Promise((r) => setTimeout(r, 300));
      setUninstallProgress(100);

      setFlathubApps((prev) =>
        prev.map((a) => (a.id === app.id ? { ...a, installed: false } : a))
      );

      if (selectedAppModal?.id === app.id) {
        setSelectedAppModal((prev) => (prev ? { ...prev, installed: false } : null));
      }

      setNotification({
        type: 'info',
        message: `${app.name} foi desinstalado do sistema.`,
      });
    } catch {
      setNotification({
        type: 'error',
        message: `Erro ao desinstalar ${app.name}.`,
      });
    } finally {
      setTimeout(() => {
        setUninstallingId(null);
        setUninstallProgress(0);
        setUninstallStage('');
      }, 500);
    }
  };

  // Launch App
  const handleLaunchApp = (app: FlathubAppDetail) => {
    setLaunchingId(app.id);
    setNotification({
      type: 'success',
      message: `Executando ${app.name} (sandbox Flatpak)...`,
    });

    setTimeout(() => {
      setLaunchingId(null);
      if (selectedAppModal) setSelectedAppModal(null);
    }, 1200);
  };

  // Filtered Apps
  const filteredApps = flathubApps.filter((app) => {
    const matchSearch =
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.description.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchSearch) return false;

    if (selectedCategory === 'Todos') return true;
    if (selectedCategory === 'Populares') return app.rating >= 4.9 || ['firefox', 'chrome', 'spotify', 'steam', 'discord', 'vscode'].includes(app.id);
    if (selectedCategory === 'AppImage Portable') return app.packageManager === 'appimage';
    if (selectedCategory === 'Instalados') return app.installed;
    return app.category.toLowerCase() === selectedCategory.toLowerCase();
  });

  const currentHero = heroApps[heroIndex % heroApps.length] || heroApps[0];

  return (
    <div className="flex flex-col h-full bg-[#1b1924] text-white select-none overflow-hidden font-sans">
      
      {/* 1. TOP HEADER (EXACT FLATHUB & APPIMAGE REPLICA) */}
      <header className="h-16 px-6 bg-[#211f2c] border-b border-[#2e2c3a] flex items-center justify-between shrink-0 z-30 shadow-md">
        
        {/* Left: Flathub & AppImage Logo Box */}
        <div className="flex items-center gap-3">
          <div 
            onClick={() => setSelectedCategory('Todos')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#444054] bg-[#292736] hover:bg-[#312f42] transition-colors cursor-pointer"
          >
            <div className="w-5 h-5 flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
                <circle cx="36" cy="36" r="11.8" fill="#FFFFFF" />
                <path d="M 55.5 25.5 C 55.5 23.4 57.8 22.1 59.6 23.2 L 75.8 33.8 C 77.4 34.8 77.4 37.2 75.8 38.2 L 59.6 48.8 C 57.8 49.9 55.5 48.6 55.5 46.5 Z" fill="#FFFFFF" />
                <rect x="25.5" y="52.5" width="21.5" height="21.5" rx="6.5" fill="#FFFFFF" />
                <rect x="53" y="60.2" width="22" height="6.6" rx="3.3" fill="#FFFFFF" />
                <rect x="60.7" y="52.5" width="6.6" height="22" rx="3.3" fill="#FFFFFF" />
              </svg>
            </div>
            <span className="font-bold text-base text-white tracking-tight">Flathub & AppImage</span>
          </div>
        </div>

        {/* Center: Search Bar with shortcut key [/] */}
        <div className="flex-1 max-w-xl mx-6">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="flathub-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Procurar aplicativos (Flatpak, AppImage, APT)..."
              className="w-full pl-10 pr-10 py-2 rounded-xl bg-[#2b2838] border border-[#3e3a4e] text-sm text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-[#322f42] transition-all"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded bg-[#3c384c] text-[11px] font-mono text-gray-400 border border-white/5">
              /
            </div>
          </div>
        </div>

        {/* Right: Navigation Links */}
        <nav className="flex items-center gap-4 text-sm font-medium text-gray-300">
          <button
            onClick={() => {
              setSelectedCategory('AppImage Portable');
              setNotification({ type: 'info', message: 'Visualizando pacotes AppImage integrados (https://appimage.github.io/apps/). Suporte FUSE2/3 ativo!' });
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-900/40 hover:bg-purple-800/60 text-purple-200 border border-purple-500/30 text-xs font-semibold transition-colors cursor-pointer"
          >
            <Box className="w-3.5 h-3.5 text-purple-400" />
            AppImage Hub
          </button>
          <a href="#" onClick={(e) => { e.preventDefault(); setNotification({ type: 'info', message: 'Flathub Publisher portal disponível via flatpak-builder.' }); }} className="hover:text-white transition-colors hidden sm:inline">
            Publicar
          </a>
          <a href="#" onClick={(e) => { e.preventDefault(); setNotification({ type: 'info', message: 'InoveCloud OS suporta nativamente Flatpak, AppImage (FUSE 2 & 3) e APT Debian.' }); }} className="hover:text-white transition-colors">
            Sobre
          </a>
          <button
            onClick={() => setNotification({ type: 'info', message: 'Autenticado com credenciais locais do sistema.' })}
            className="px-3.5 py-1.5 rounded-lg bg-[#2e2a3c] hover:bg-[#39344b] text-white text-xs font-semibold border border-white/10 transition-colors"
          >
            Entrar
          </button>
        </nav>
      </header>

      {/* 2. NOTIFICATION BANNER */}
      {notification && (
        <div className={`px-4 py-2 text-xs flex items-center justify-between z-20 ${
          notification.type === 'success' ? 'bg-emerald-600/90 text-white' :
          notification.type === 'error' ? 'bg-red-600/90 text-white' : 'bg-blue-600/90 text-white'
        }`}>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-white hover:underline text-[11px]">
            Fechar
          </button>
        </div>
      )}

      {/* 3. MAIN STORE CONTENT (SCROLLABLE) */}
      <main className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
        
        {/* HERO SECTION (Shown when no search query) */}
        {!searchQuery && selectedCategory === 'Todos' && (
          <div className="space-y-6">
            
            {/* Primary Blue Spotlight Carousel (e.g. Android Studio) */}
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-[#0d5cd4] via-[#1167e6] to-[#0b4fb8] p-6 sm:p-8 border border-blue-400/20 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 min-h-[260px]">
              
              {/* Left Carousel Arrow */}
              <button
                onClick={() => setHeroIndex((prev) => (prev - 1 + heroApps.length) % heroApps.length)}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 hover:bg-black/60 text-white transition-colors cursor-pointer z-20"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* Left App Details */}
              <div className="flex flex-col items-center md:items-start text-center md:text-left z-10 pl-6">
                <RealAppIcon type={currentHero.iconType} className="w-24 h-24 mb-4 shadow-xl" />
                <h2 className="text-3xl font-extrabold text-white tracking-tight">{currentHero.name}</h2>
                <p className="text-blue-100 text-sm mt-1 max-w-sm">{currentHero.tagline}</p>
                <button
                  onClick={() => setSelectedAppModal(currentHero)}
                  className="mt-4 px-6 py-2 rounded-xl bg-white text-blue-800 hover:bg-blue-50 font-bold text-xs shadow-lg transition-transform active:scale-95 cursor-pointer"
                >
                  Ver Aplicativo & Capturas
                </button>
              </div>

              {/* Right Screenshot Preview */}
              <div
                onClick={() => setSelectedAppModal(currentHero)}
                className="w-full md:w-1/2 max-w-md bg-[#181824] rounded-xl overflow-hidden shadow-2xl border border-white/20 cursor-pointer group transform group-hover:scale-[1.02] transition-all pr-0"
              >
                <div className="bg-[#242232] px-3 py-1.5 flex items-center justify-between text-[11px] text-gray-300 border-b border-white/10 font-mono">
                  <span>My Application &mdash; activity_main.xml</span>
                  <span className="text-blue-300">Preview HD</span>
                </div>
                <div className="p-4 font-mono text-[11px] text-gray-300 leading-relaxed bg-[#15141e]">
                  <p className="text-emerald-400">&lt;androidx.coordinatorlayout.widget.CoordinatorLayout</p>
                  <p className="pl-4 text-blue-300">xmlns:android="http://schemas.android.com/apk/res-auto"</p>
                  <p className="pl-4 text-yellow-300">android:layout_width="match_parent"</p>
                  <p className="pl-4 text-yellow-300">android:layout_height="match_parent"&gt;</p>
                  <div className="my-2 p-2 bg-[#212030] rounded border border-white/10 flex items-center justify-between">
                    <span className="text-white text-xs font-sans font-semibold">Botão Material Design 3</span>
                    <span className="text-[10px] px-2 py-0.5 bg-blue-500 text-white rounded">Next</span>
                  </div>
                  <p className="text-emerald-400">&lt;/androidx.coordinatorlayout.widget.CoordinatorLayout&gt;</p>
                </div>
              </div>

              {/* Right Carousel Arrow */}
              <button
                onClick={() => setHeroIndex((prev) => (prev + 1) % heroApps.length)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 hover:bg-black/60 text-white transition-colors cursor-pointer z-20"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Two Sub-Cards (App of the Day & Flathub Intro) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Left Card: Aplicativo do Dia (Laser) */}
              <div
                onClick={() => {
                  const laserApp = flathubApps.find((a) => a.id === 'laser');
                  if (laserApp) setSelectedAppModal(laserApp);
                }}
                className="rounded-2xl bg-gradient-to-r from-[#8b2635] to-[#a83244] p-6 flex items-center justify-between border border-red-400/20 shadow-lg cursor-pointer hover:brightness-105 transition-all"
              >
                <div>
                  <span className="text-xs font-bold text-red-200 uppercase tracking-wider flex items-center gap-1">
                    ★ Aplicativo do Dia
                  </span>
                  <h3 className="text-2xl font-bold text-white mt-2">Laser</h3>
                  <p className="text-red-100 text-sm mt-1">Rip CDs with ease</p>
                </div>
                <RealAppIcon type="laser" className="w-18 h-18 shadow-xl" />
              </div>

              {/* Right Card: Configurar Flathub */}
              <div className="rounded-2xl bg-[#2a2736] p-6 flex flex-col justify-between border border-[#3e3b4e] shadow-lg relative overflow-hidden">
                <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-blue-500/5 to-transparent pointer-events-none" />
                <div>
                  <h3 className="text-lg font-bold text-white">O Flathub é a Loja de Aplicativos para Linux</h3>
                  <p className="text-xs text-gray-300 mt-1 leading-relaxed">
                    Obtenha as versões mais recentes de todos os seus aplicativos favoritos, para qualquer distribuição Linux.
                  </p>
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => setNotification({ type: 'success', message: 'Flathub remote já configurado e ativo na máquina local!' })}
                    className="px-5 py-2 rounded-xl bg-[#444056] hover:bg-[#524d68] text-white text-xs font-semibold border border-white/10 transition-colors cursor-pointer"
                  >
                    Configurar o Flathub
                  </button>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* 4. CATEGORIES TABS */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#4A86CF] text-white shadow-md'
                  : 'bg-[#282534] text-gray-300 hover:bg-[#322f42] hover:text-white border border-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 5. APP CARDS GRID (3-COLUMN EXACT MATCH TO SCREENSHOTS) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white tracking-tight">
              {searchQuery ? `Resultados para "${searchQuery}"` : selectedCategory === 'Todos' ? 'Aplicativos Flathub' : selectedCategory}
            </h3>
            <span className="text-xs text-gray-400 font-mono">
              {filteredApps.length} {filteredApps.length === 1 ? 'aplicativo' : 'aplicativos'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredApps.map((app) => (
              <div
                key={app.id}
                onClick={() => setSelectedAppModal(app)}
                className="group p-4 rounded-2xl bg-[#292736] hover:bg-[#322f42] border border-[#39364a] hover:border-[#4f4b64] transition-all cursor-pointer shadow-md hover:shadow-xl flex items-center justify-between gap-4"
              >
                {/* Left App Icon */}
                <div className="shrink-0 group-hover:scale-105 transition-transform">
                  <RealAppIcon type={app.iconType} className="w-16 h-16" rounded="rounded-2xl" />
                </div>

                {/* Center Title & Tagline */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h4 className="font-bold text-white text-base truncate group-hover:text-blue-300 transition-colors">
                      {app.name}
                    </h4>
                    {app.verified && (
                      <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#4A86CF] text-white shrink-0" title="Verificado Oficial">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </span>
                    )}
                    {app.packageManager === 'appimage' && (
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-purple-950/80 text-purple-300 border border-purple-500/40 font-semibold shrink-0">
                        AppImage
                      </span>
                    )}
                    {app.packageManager === 'flatpak' && (
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-blue-950/80 text-blue-300 border border-blue-500/40 font-semibold shrink-0">
                        Flatpak
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-1 line-clamp-2 leading-snug">
                    {app.tagline}
                  </p>
                </div>

                {/* Right Installed Badge / Quick Action */}
                {app.installed ? (
                  <div className="shrink-0 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 ring-4 ring-emerald-500/20" title="Instalado" />
                  </div>
                ) : (
                  <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-xs text-blue-400 flex items-center gap-1">
                      Instalar <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {filteredApps.length === 0 && (
            <div className="py-16 text-center text-gray-400">
              <Box className="w-12 h-12 mx-auto text-gray-500 mb-3" />
              <p className="text-base font-semibold text-gray-300">Nenhum aplicativo encontrado</p>
              <p className="text-xs text-gray-500 mt-1">Tente pesquisar com outros termos ou selecione outra categoria.</p>
            </div>
          )}
        </div>

      </main>

      {/* 6. MODAL WITH HD SCREENSHOTS & FULL DETAILS */}
      <AppScreenshotModal
        app={selectedAppModal}
        isOpen={Boolean(selectedAppModal)}
        onClose={() => setSelectedAppModal(null)}
        onInstall={handleInstallApp}
        onUninstall={handleUninstallApp}
        onLaunch={handleLaunchApp}
        isInstalling={installingId === selectedAppModal?.id}
        installProgress={installProgress}
        installStage={installStage}
        isUninstalling={uninstallingId === selectedAppModal?.id}
        uninstallProgress={uninstallProgress}
        uninstallStage={uninstallStage}
      />

    </div>
  );
};
