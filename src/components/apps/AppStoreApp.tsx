import React, { useState, useEffect, useRef } from 'react';
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
  Star,
  FileCode,
  FileText,
  Upload,
  HardDrive,
  FolderOpen,
  ArrowRight,
  Activity,
  Zap,
  Radio
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

interface CustomPackageItem {
  id: string;
  name: string;
  fileName: string;
  type: 'deb' | 'appimage';
  size: string;
  version: string;
  arch: string;
  description: string;
  icon: string;
}

const PRESET_PACKAGES: CustomPackageItem[] = [
  {
    id: 'deb-chrome',
    name: 'Google Chrome Stable',
    fileName: 'google-chrome-stable_current_amd64.deb',
    type: 'deb',
    size: '108 MB',
    version: '129.0.6668.70',
    arch: 'amd64',
    description: 'Navegador oficial do Google com motor V8 e decodificação VAAPI por GPU.',
    icon: 'chrome',
  },
  {
    id: 'deb-vscode',
    name: 'Visual Studio Code',
    fileName: 'code_1.94.2_amd64.deb',
    type: 'deb',
    size: '98 MB',
    version: '1.94.2',
    arch: 'amd64',
    description: 'Editor profissional de código com suporte completo a C, Rust e Web.',
    icon: 'vscode',
  },
  {
    id: 'deb-vbox-guest',
    name: 'VirtualBox Guest Utils',
    fileName: 'virtualbox-guest-utils_7.1.2_amd64.deb',
    type: 'deb',
    size: '18 MB',
    version: '7.1.2',
    arch: 'amd64',
    description: 'Drivers para VirtualBox: aceleração VMSVGA, clipboard compartilhado e tela dinâmica.',
    icon: 'virtualbox',
  },
  {
    id: 'deb-audacious',
    name: 'Audacious Audio Player',
    fileName: 'audacious_4.4.1_amd64.deb',
    type: 'deb',
    size: '14 MB',
    version: '4.4.1',
    arch: 'amd64',
    description: 'Player de áudio nativo Linux ultraleve compatível com skins Winamp e MP3/FLAC.',
    icon: 'music',
  },
  {
    id: 'appimage-etcher',
    name: 'balenaEtcher Portable',
    fileName: 'balenaEtcher-1.18.11-x64.AppImage',
    type: 'appimage',
    size: '92 MB',
    version: '1.18.11',
    arch: 'x86_64',
    description: 'Gravador de ISOs e cartões SD portátil sem necessidade de instalação.',
    icon: 'etcher',
  },
  {
    id: 'appimage-audacity',
    name: 'Audacity Audio Studio',
    fileName: 'Audacity-3.6.4-x86_64.AppImage',
    type: 'appimage',
    size: '95 MB',
    version: '3.6.4',
    arch: 'x86_64',
    description: 'Editor de som e gravador multitrack de estúdio em arquivo executável.',
    icon: 'audacity',
  },
  {
    id: 'appimage-kdenlive',
    name: 'Kdenlive Video Editor',
    fileName: 'Kdenlive-24.08.1-x86_64.AppImage',
    type: 'appimage',
    size: '280 MB',
    version: '24.08.1',
    arch: 'x86_64',
    description: 'Editor de vídeo profissional 4K multitrack em pacote AppImage FUSE.',
    icon: 'kdenlive',
  },
];

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

  // Package Installer Tab state
  const [selectedPreset, setSelectedPreset] = useState<CustomPackageItem>(PRESET_PACKAGES[0]);
  const [customFile, setCustomFile] = useState<{ name: string; size: string; type: 'deb' | 'appimage' } | null>(null);
  const [installerTerminalLogs, setInstallerTerminalLogs] = useState<string[]>([
    '# InoveCloud OS Package Manager (dpkg & AppImage Engine v7.3)',
    '# Pronto para receber pacotes .deb e arquivos .AppImage.',
    '# Digite "dpkg -i arquivo.deb" ou clique no botão de instalação abaixo.'
  ]);
  const [isInstallingPackage, setIsInstallingPackage] = useState(false);
  const [packageInstallProgress, setPackageInstallProgress] = useState(0);
  const terminalBottomRef = useRef<HTMLDivElement>(null);

  // Hero carousel state
  const [heroIndex, setHeroIndex] = useState(0);
  const heroApps = flathubApps.filter((a) => a.hotTrending || a.id === 'android-studio' || a.id === 'vscode' || a.id === 'steam');

  // Categories list
  const categories = [
    'Todos',
    'Populares',
    'Flathub (Flatpak)',
    'Pi Store (Raspberry Pi)',
    'Pacotes .DEB (dpkg)',
    'AppImage Portable',
    'Instalador .DEB & AppImage',
    'Áudio e Vídeo',
    'Desenvolvimento',
    'Internet',
    'Jogos',
    'Produtividade',
    'Utilitários',
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

  // Scroll terminal logs automatically
  useEffect(() => {
    if (terminalBottomRef.current) {
      terminalBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [installerTerminalLogs]);

  // Install handler
  const handleInstallApp = async (app: FlathubAppDetail) => {
    if (installingId) return;

    setInstallingId(app.id);
    setInstallProgress(10);

    const isDeb = app.packageManager === 'deb';
    const isAppImage = app.packageManager === 'appimage';
    const isPiStore = app.packageManager === 'pi-store';

    if (isDeb) {
      setInstallStage(`dpkg: Baixando pacote .deb ${app.debPackageName || app.name}...`);
    } else if (isAppImage) {
      setInstallStage(`AppImage: Baixando binário portátil (${app.size})...`);
    } else if (isPiStore) {
      setInstallStage(`Pi Store: Conectando ao repositório Raspberry Pi e baixando ${app.name}...`);
    } else {
      setInstallStage('Conectando ao repositório Flathub...');
    }

    try {
      await new Promise((r) => setTimeout(r, 600));
      setInstallProgress(35);
      
      if (isDeb) {
        setInstallStage(`dpkg -i ${app.debPackageName || 'package.deb'}: Lendo banco de dados e preparando descompactação...`);
      } else if (isAppImage) {
        setInstallStage('Aplicando permissão de execução: chmod +x ' + (app.executable || app.name));
      } else if (isPiStore) {
        setInstallStage('Instalando runtime e extensões para arquitetura x86_64...');
      } else {
        setInstallStage('Baixando camadas OCI do pacote (' + app.size + ')...');
      }

      await new Promise((r) => setTimeout(r, 700));
      setInstallProgress(70);

      if (isDeb) {
        setInstallStage('Extraindo arquivos para /usr/bin e /usr/share/applications...');
      } else if (isAppImage) {
        setInstallStage('Integrando ao sandbox FUSE 3 e gerando ícone no menu...');
      } else if (isPiStore) {
        setInstallStage('Configurando serviços e dependências multimídia ALSA/PipeWire...');
      } else {
        setInstallStage('Configurando isolamento sandbox Bubblewrap...');
      }

      await new Promise((r) => setTimeout(r, 600));
      setInstallProgress(90);
      setInstallStage('Disparando triggers do sistema e registrando atalhos no Desktop e Dock...');

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
        message: `${app.name} foi instalado com sucesso via ${
          isDeb ? 'DPKG (.deb)' : isPiStore ? 'Pi Store' : isAppImage ? 'AppImage' : 'Flathub'
        }!`,
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
      setUninstallStage('Removendo arquivos do sistema...');

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
      }, 700);
    }
  };

  // Launch app handler
  const handleLaunchApp = (app: FlathubAppDetail) => {
    setLaunchingId(app.id);
    setNotification({
      type: 'success',
      message: `Iniciando ${app.name} (${app.packageManager === 'appimage' ? 'AppImage FUSE' : app.packageManager === 'deb' ? 'DPKG Native' : 'Flatpak Sandbox'})...`,
    });
    setTimeout(() => {
      setLaunchingId(null);
      if (selectedAppModal) setSelectedAppModal(null);
    }, 1200);
  };

  // Custom Package Installer Handler (.deb / .AppImage)
  const handleRunCustomPackageInstall = async (pkg: CustomPackageItem) => {
    if (isInstallingPackage) return;
    setIsInstallingPackage(true);
    setPackageInstallProgress(5);

    const isDeb = pkg.type === 'deb';
    const timestamp = () => new Date().toLocaleTimeString('pt-BR');

    setInstallerTerminalLogs((prev) => [
      ...prev,
      `[${timestamp()}] 🚀 Iniciando processo para: ${pkg.fileName}`,
      `[${timestamp()}] 🔍 Verificando integridade SHA256 do arquivo (${pkg.size})... OK`,
      isDeb
        ? `[${timestamp()}] # dpkg --install /var/cache/apt/archives/${pkg.fileName}`
        : `[${timestamp()}] # chmod +x /home/inovecloud/Applications/${pkg.fileName}`,
    ]);

    await new Promise((r) => setTimeout(r, 600));
    setPackageInstallProgress(30);

    if (isDeb) {
      setInstallerTerminalLogs((prev) => [
        ...prev,
        `[${timestamp()}] Selecting previously unselected package ${pkg.name.toLowerCase().replace(/\s+/g, '-')}.`,
        `[${timestamp()}] (Reading database ... 28412 files and directories currently installed.)`,
        `[${timestamp()}] Preparing to unpack ${pkg.fileName} ...`,
        `[${timestamp()}] Unpacking ${pkg.name.toLowerCase().replace(/\s+/g, '-')} (${pkg.version}) ...`,
      ]);
    } else {
      setInstallerTerminalLogs((prev) => [
        ...prev,
        `[${timestamp()}] [AppImage] Verificando cabeçalho ELF x86_64 e offset do squashfs... OK`,
        `[${timestamp()}] [AppImage] Montando runtime FUSE 3 em /tmp/.mount_${pkg.id}_XXXXXX...`,
        `[${timestamp()}] [AppImage] Registrando arquivo .desktop em ~/.local/share/applications/`,
      ]);
    }

    await new Promise((r) => setTimeout(r, 700));
    setPackageInstallProgress(65);

    if (isDeb) {
      setInstallerTerminalLogs((prev) => [
        ...prev,
        `[${timestamp()}] Setting up ${pkg.name.toLowerCase().replace(/\s+/g, '-')} (${pkg.version}) ...`,
        `[${timestamp()}] Processing triggers for desktop-file-utils (0.28-1) ...`,
        `[${timestamp()}] Processing triggers for mime-support (3.66) ...`,
        `[${timestamp()}] Processing triggers for hicolor-icon-theme (0.18-1) ...`,
      ]);
    } else {
      setInstallerTerminalLogs((prev) => [
        ...prev,
        `[${timestamp()}] [AppImage] Ícones HD extraídos para /usr/share/icons/hicolor/`,
        `[${timestamp()}] [AppImage] Isolamento de permissões e cgroups v2 configurados.`,
      ]);
    }

    await new Promise((r) => setTimeout(r, 600));
    setPackageInstallProgress(100);

    setInstallerTerminalLogs((prev) => [
      ...prev,
      `[${timestamp()}] ✅ SUCESSO: ${pkg.name} está instalado e pronto para execução no InoveCloud OS!`,
      `[${timestamp()}] -------------------------------------------------------------`,
    ]);

    // Mark matching app in list as installed
    setFlathubApps((prev) =>
      prev.map((a) => (a.id.includes(pkg.icon) || a.name.includes(pkg.name) ? { ...a, installed: true } : a))
    );

    setIsInstallingPackage(false);
    setNotification({
      type: 'success',
      message: `${pkg.name} foi instalado com sucesso com ${isDeb ? 'DPKG' : 'AppImage'}!`,
    });
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
    if (selectedCategory === 'Flathub (Flatpak)') return app.packageManager === 'flatpak';
    if (selectedCategory === 'Pi Store (Raspberry Pi)') return app.packageManager === 'pi-store' || app.storeSource === 'pi-store';
    if (selectedCategory === 'Pacotes .DEB (dpkg)') return app.packageManager === 'deb' || app.storeSource === 'deb-repo';
    if (selectedCategory === 'AppImage Portable') return app.packageManager === 'appimage';
    if (selectedCategory === 'Instalados') return app.installed;
    return app.category.toLowerCase() === selectedCategory.toLowerCase();
  });

  const currentHero = heroApps[heroIndex % heroApps.length] || heroApps[0];

  return (
    <div className="flex flex-col h-full bg-[#1b1924] text-white select-none overflow-hidden font-sans">
      
      {/* 1. TOP HEADER (FLATHUB + PI STORE + DPKG + APPIMAGE) */}
      <header className="h-16 px-6 bg-[#211f2c] border-b border-[#2e2c3a] flex items-center justify-between shrink-0 z-30 shadow-md">
        
        {/* Left: Store Branding */}
        <div className="flex items-center gap-3">
          <div 
            onClick={() => setSelectedCategory('Todos')}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-[#444054] bg-[#292736] hover:bg-[#312f42] transition-colors cursor-pointer"
          >
            <div className="w-6 h-6 flex items-center justify-center bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-600 rounded-lg p-1">
              <Box className="w-full h-full text-white" />
            </div>
            <div>
              <div className="font-bold text-sm text-white tracking-tight flex items-center gap-1.5">
                <span>InoveCloud App Hub</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold">
                  Kernel 7.3 RT
                </span>
              </div>
              <div className="text-[10px] text-slate-400">Flathub • Pi Store • DPKG • AppImage</div>
            </div>
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
              placeholder="Procurar aplicativos (Flatpak, Pi Store, .deb, AppImage)..."
              className="w-full pl-10 pr-10 py-2 rounded-xl bg-[#2b2838] border border-[#3e3a4e] text-sm text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-[#322f42] transition-all"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded bg-[#3c384c] text-[11px] font-mono text-gray-400 border border-white/5">
              /
            </div>
          </div>
        </div>

        {/* Right: Quick Action Buttons */}
        <nav className="flex items-center gap-2 text-sm font-medium text-gray-300">
          <button
            onClick={() => setSelectedCategory('Instalador .DEB & AppImage')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
              selectedCategory === 'Instalador .DEB & AppImage'
                ? 'bg-rose-600 text-white border-rose-400 shadow-md'
                : 'bg-rose-950/40 hover:bg-rose-900/60 text-rose-200 border-rose-500/30'
            }`}
            title="Instalador direto de arquivos .deb e .AppImage"
          >
            <Upload className="w-3.5 h-3.5 text-rose-400" />
            <span>Instalador .DEB/AppImage</span>
          </button>

          <button
            onClick={() => setSelectedCategory('Pi Store (Raspberry Pi)')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
              selectedCategory === 'Pi Store (Raspberry Pi)'
                ? 'bg-red-600 text-white border-red-400 shadow-md'
                : 'bg-red-950/40 hover:bg-red-900/60 text-red-200 border-red-500/30'
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-red-400" />
            <span>Pi Store</span>
          </button>

          <button
            onClick={() => setSelectedCategory('AppImage Portable')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
              selectedCategory === 'AppImage Portable'
                ? 'bg-purple-600 text-white border-purple-400 shadow-md'
                : 'bg-purple-950/40 hover:bg-purple-900/60 text-purple-200 border-purple-500/30'
            }`}
          >
            <Box className="w-3.5 h-3.5 text-purple-400" />
            <span>AppImage Hub</span>
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
          <button onClick={() => setNotification(null)} className="text-white hover:underline text-[11px] cursor-pointer">
            Fechar
          </button>
        </div>
      )}

      {/* 3. MAIN STORE CONTENT (SCROLLABLE) */}
      <main className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
        
        {/* HERO SECTION (Shown when on Todos and no search query) */}
        {!searchQuery && selectedCategory === 'Todos' && (
          <div className="space-y-6">
            
            {/* Primary Spotlight Carousel */}
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
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    {currentHero.name}
                  </h2>
                  {currentHero.verified && (
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-white text-blue-600" title="Verificado">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </span>
                  )}
                </div>
                <p className="text-blue-100 text-sm max-w-xl mt-1.5 leading-relaxed">
                  {currentHero.tagline}
                </p>
                <div className="flex flex-wrap items-center gap-3 mt-4">
                  <button
                    onClick={() => setSelectedAppModal(currentHero)}
                    className="px-6 py-2.5 rounded-xl bg-white text-blue-700 hover:bg-blue-50 font-bold text-xs shadow-lg transition-all active:scale-95 cursor-pointer flex items-center gap-2"
                  >
                    <span>Ver Detalhes & Screenshots</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleInstallApp(currentHero)}
                    className="px-6 py-2.5 rounded-xl bg-blue-950/60 hover:bg-blue-900 text-white font-bold text-xs border border-white/20 transition-all cursor-pointer flex items-center gap-2"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{currentHero.installed ? 'Reinstalar' : 'Instalar Agora'}</span>
                  </button>
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

            {/* Quick Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div 
                onClick={() => setSelectedCategory('Flathub (Flatpak)')}
                className="p-4 rounded-2xl bg-blue-950/30 hover:bg-blue-900/40 border border-blue-500/30 transition-all cursor-pointer space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-400">FLATHUB (FLATPAK)</span>
                  <ExternalLink className="w-4 h-4 text-blue-400" />
                </div>
                <h4 className="text-sm font-bold text-white">Milhares de Apps OCI</h4>
                <p className="text-[11px] text-slate-400">Sandbox Bubblewrap com isolamento total</p>
              </div>

              <div 
                onClick={() => setSelectedCategory('Pi Store (Raspberry Pi)')}
                className="p-4 rounded-2xl bg-red-950/30 hover:bg-red-900/40 border border-red-500/30 transition-all cursor-pointer space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-red-400">PI STORE ECOSYSTEM</span>
                  <Cpu className="w-4 h-4 text-red-400" />
                </div>
                <h4 className="text-sm font-bold text-white">Apps Raspberry Pi</h4>
                <p className="text-[11px] text-slate-400">RPi Imager, Scratch 3, Thonny, Sonic Pi</p>
              </div>

              <div 
                onClick={() => setSelectedCategory('Pacotes .DEB (dpkg)')}
                className="p-4 rounded-2xl bg-rose-950/30 hover:bg-rose-900/40 border border-rose-500/30 transition-all cursor-pointer space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-rose-400">DPKG & .DEB NATIVO</span>
                  <Terminal className="w-4 h-4 text-rose-400" />
                </div>
                <h4 className="text-sm font-bold text-white">Instalação Direta DPKG</h4>
                <p className="text-[11px] text-slate-400">Instale qualquer pacote .deb com 1 clique</p>
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

        {/* 5. INTERACTIVE PACKAGE INSTALLER VIEW (.deb / .AppImage) */}
        {selectedCategory === 'Instalador .DEB & AppImage' ? (
          <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
            {/* Header Description */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-rose-950/40 via-slate-900 to-purple-950/40 border border-rose-500/30 space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-rose-600/20 text-rose-400 flex items-center justify-center font-bold">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Instalador Universal de Pacotes Linux (.deb / dpkg / .AppImage)</h3>
                  <p className="text-xs text-slate-300">
                    Instale qualquer aplicativo compilado para Linux. Suporte total a pacotes <code>.deb</code> (via DPKG) e binários portáteis <code>.AppImage</code> com suporte FUSE 3 no Kernel Linux 7.3 RT.
                  </p>
                </div>
              </div>
            </div>

            {/* Presets and Drag & Drop Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Left Column: Preset Test Packages */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Box className="w-4 h-4 text-cyan-400" />
                  <span>Selecione um Pacote Pronto para Testar Instalação</span>
                </h4>

                <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1 custom-scrollbar">
                  {PRESET_PACKAGES.map((pkg) => {
                    const isSelected = selectedPreset.id === pkg.id;
                    return (
                      <div
                        key={pkg.id}
                        onClick={() => setSelectedPreset(pkg)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'bg-rose-950/50 border-rose-500/60 shadow-lg'
                            : 'bg-white/5 border-white/10 hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <RealAppIcon type={pkg.icon} className="w-10 h-10 shrink-0" />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-white truncate">{pkg.name}</span>
                              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold uppercase ${
                                pkg.type === 'deb' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                              }`}>
                                {pkg.type}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 font-mono truncate">{pkg.fileName}</p>
                            <span className="text-[10px] text-slate-500">{pkg.size} • {pkg.arch}</span>
                          </div>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRunCustomPackageInstall(pkg);
                          }}
                          disabled={isInstallingPackage}
                          className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition cursor-pointer shrink-0 disabled:opacity-50"
                        >
                          Instalar
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Custom File Upload & Execution Terminal */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <span>Terminal de Instalação DPKG / AppImage (Tempo Real)</span>
                </h4>

                {/* Selected File Details Box */}
                <div className="p-4 rounded-xl bg-black/60 border border-white/10 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Pacote Selecionado:</span>
                    <span className="font-mono text-cyan-300 font-bold">{selectedPreset.fileName}</span>
                  </div>

                  {/* Progress bar if running */}
                  {isInstallingPackage && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-rose-400">
                        <span>Executando {selectedPreset.type === 'deb' ? 'dpkg -i' : 'chmod +x'}...</span>
                        <span>{packageInstallProgress}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-rose-500 to-purple-500 transition-all duration-300"
                          style={{ width: `${packageInstallProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  <button
                    onClick={() => handleRunCustomPackageInstall(selectedPreset)}
                    disabled={isInstallingPackage}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 hover:opacity-90 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition active:scale-95 cursor-pointer disabled:opacity-50"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>
                      {isInstallingPackage
                        ? 'Descompactando e Configurando...'
                        : selectedPreset.type === 'deb'
                        ? `Executar "dpkg -i ${selectedPreset.fileName}"`
                        : `Tornar Executável & Rodar ${selectedPreset.fileName}`}
                    </span>
                  </button>
                </div>

                {/* Console Log Terminal Window */}
                <div className="rounded-xl bg-[#0d0c12] border border-[#2e2c38] p-3 font-mono text-[11px] text-slate-300 h-[220px] overflow-y-auto space-y-1 custom-scrollbar">
                  {installerTerminalLogs.map((line, idx) => (
                    <div
                      key={idx}
                      className={
                        line.startsWith('#')
                          ? 'text-cyan-400 font-bold'
                          : line.includes('✅ SUCESSO')
                          ? 'text-emerald-400 font-bold'
                          : line.includes('dpkg') || line.includes('Setting up')
                          ? 'text-amber-300'
                          : 'text-slate-300'
                      }
                    >
                      {line}
                    </div>
                  ))}
                  <div ref={terminalBottomRef} />
                </div>
              </div>

            </div>
          </div>
        ) : (
          /* 6. APP CARDS GRID (Flathub, Pi Store, DPKG, AppImage) */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <span>{searchQuery ? `Resultados para "${searchQuery}"` : selectedCategory === 'Todos' ? 'Catálogo Geral de Aplicativos' : selectedCategory}</span>
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
                      {app.packageManager === 'deb' && (
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-rose-950/80 text-rose-300 border border-rose-500/40 font-semibold shrink-0">
                          .deb (dpkg)
                        </span>
                      )}
                      {app.packageManager === 'pi-store' && (
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-red-950/80 text-red-300 border border-red-500/40 font-semibold shrink-0">
                          Pi Store
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
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 ring-4 ring-emerald-500/20" title="Instalado" />
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
        )}

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
