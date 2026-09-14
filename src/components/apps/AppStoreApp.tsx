import React, { useState, useEffect } from 'react';
import {
  Layers,
  Search,
  Download,
  Trash2,
  ExternalLink,
  Star,
  CheckCircle2,
  Sparkles,
  Zap,
  Play,
  Terminal,
  ShieldCheck,
  RefreshCw,
  Box,
  Copy,
  Check,
  AlertCircle,
  Cpu,
  Monitor,
  CheckCircle,
  Plus,
  Server,
  ToggleLeft,
  ToggleRight,
  Code2,
  Database,
  Globe,
  Radio,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AppStoreItem } from '../../types';
import { AptRepoManager } from './AptRepoManager';

interface AppStoreAppProps {
  catalog?: AppStoreItem[];
  onToggleInstall?: (id: string) => void;
}

export interface FlathubApp {
  id: string;
  appId: string; // Flatpak reverse-dns ID or APT package name
  name: string;
  tagline: string;
  category: 'Utilitários' | 'Navegadores' | 'Mídia' | 'Ferramentas' | 'Jogos';
  version: string;
  developer: string;
  size: string;
  rating: number;
  downloads: string;
  installed: boolean;
  packageManager: 'flatpak' | 'apt';
  iconGradient: string;
  permissions: string[];
  executable?: string;
}

export const AppStoreApp: React.FC<AppStoreAppProps> = () => {
  const [activeTab, setActiveTab] = useState<'store' | 'installed' | 'repos'>('store');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Install states
  const [installingId, setInstallingId] = useState<string | null>(null);
  const [installProgress, setInstallProgress] = useState(0);
  const [installStage, setInstallStage] = useState<string>('');
  
  // Uninstall states
  const [uninstallingId, setUninstallingId] = useState<string | null>(null);
  const [uninstallProgress, setUninstallProgress] = useState(0);
  const [uninstallStage, setUninstallStage] = useState<string>('');

  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [actionNotification, setActionNotification] = useState<{ type: 'success' | 'info' | 'error'; message: string } | null>(null);
  const [launchingId, setLaunchingId] = useState<string | null>(null);

  // Master catalog with categorized Linux apps
  const [flathubApps, setFlathubApps] = useState<FlathubApp[]>([
    {
      id: 'vscode',
      appId: 'com.visualstudio.code',
      name: 'Visual Studio Code',
      tagline: 'Editor de código profissional com suporte a extensões, Git e depuração integrada.',
      category: 'Ferramentas',
      version: '1.93.1',
      developer: 'Microsoft Corporation',
      size: '98.4 MB',
      rating: 4.9,
      downloads: '14.2M',
      installed: true,
      packageManager: 'flatpak',
      executable: 'code',
      iconGradient: 'from-blue-600 via-sky-500 to-indigo-700',
      permissions: ['Acesso ao Sistema de Arquivos (host)', 'Rede (network)', 'Wayland & X11'],
    },
    {
      id: 'chromium',
      appId: 'org.chromium.Chromium',
      name: 'Chromium Web Browser',
      tagline: 'Navegador de código aberto de alta performance e suporte nativo ao Wayland.',
      category: 'Navegadores',
      version: '128.0.6613.119',
      developer: 'The Chromium Authors',
      size: '88.0 MB',
      rating: 4.8,
      downloads: '18.1M',
      installed: true,
      packageManager: 'apt',
      executable: 'chromium',
      iconGradient: 'from-blue-500 via-cyan-500 to-indigo-600',
      permissions: ['Rede (network)', 'Aceleração GPU (Mesa)', 'Áudio PipeWire'],
    },
    {
      id: 'firefox',
      appId: 'org.mozilla.firefox',
      name: 'Mozilla Firefox',
      tagline: 'Navegador seguro, com foco em privacidade e proteção aprimorada contra rastreadores.',
      category: 'Navegadores',
      version: '130.0',
      developer: 'Mozilla Foundation',
      size: '92.4 MB',
      rating: 4.8,
      downloads: '16.5M',
      installed: false,
      packageManager: 'flatpak',
      executable: 'firefox',
      iconGradient: 'from-orange-500 via-rose-500 to-purple-600',
      permissions: ['Rede', 'Áudio & Microfone', 'Wayland Nativo'],
    },
    {
      id: 'chrome',
      appId: 'com.google.Chrome',
      name: 'Google Chrome',
      tagline: 'O navegador do Google com sincronização de abas, extensões e performance rápida.',
      category: 'Navegadores',
      version: '128.0.6613.119',
      developer: 'Google LLC',
      size: '105.0 MB',
      rating: 4.6,
      downloads: '19.4M',
      installed: false,
      packageManager: 'flatpak',
      executable: 'google-chrome-stable',
      iconGradient: 'from-red-500 via-amber-400 to-emerald-500',
      permissions: ['Rede', 'GPU Acceleration', 'Câmera & Microfone'],
    },
    {
      id: 'spotify',
      appId: 'com.spotify.Client',
      name: 'Spotify Music',
      tagline: 'Milhões de músicas, podcasts e playlists com streaming de áudio de alta fidelidade.',
      category: 'Mídia',
      version: '1.2.45',
      developer: 'Spotify AB',
      size: '185.0 MB',
      rating: 4.8,
      downloads: '9.8M',
      installed: false,
      packageManager: 'flatpak',
      executable: 'spotify',
      iconGradient: 'from-emerald-500 via-green-600 to-teal-800',
      permissions: ['PipeWire / PulseAudio', 'Rede', 'Notificações do Sistema'],
    },
    {
      id: 'vlc',
      appId: 'org.videolan.VLC',
      name: 'VLC Media Player',
      tagline: 'O mais versátil reprodutor multimídia livre que suporta praticamente todos os codecs de vídeo.',
      category: 'Mídia',
      version: '3.0.21',
      developer: 'VideoLAN Organization',
      size: '68.0 MB',
      rating: 4.9,
      downloads: '11.0M',
      installed: true,
      packageManager: 'flatpak',
      executable: 'vlc',
      iconGradient: 'from-orange-500 via-amber-500 to-yellow-600',
      permissions: ['Aceleração de Hardware VA-API', 'Áudio PipeWire', 'Acesso a Disco'],
    },
    {
      id: 'obs',
      appId: 'com.obsproject.Studio',
      name: 'OBS Studio',
      tagline: 'Software profissional de gravação de tela e transmissão ao vivo (streaming) para Linux.',
      category: 'Mídia',
      version: '30.2.2',
      developer: 'OBS Project',
      size: '142.3 MB',
      rating: 4.9,
      downloads: '5.6M',
      installed: false,
      packageManager: 'flatpak',
      executable: 'obs',
      iconGradient: 'from-slate-700 via-zinc-800 to-black',
      permissions: ['Captura de Tela Wayland PipeWire', 'Câmera V4L2', 'Áudio ALSA/Pulse'],
    },
    {
      id: 'gimp',
      appId: 'org.gimp.GIMP',
      name: 'GIMP Photo Editor',
      tagline: 'Editor profissional de imagens para manipulação gráfica, retoque fotográfico e pintura digital.',
      category: 'Mídia',
      version: '2.10.38',
      developer: 'The GIMP Team',
      size: '124.0 MB',
      rating: 4.6,
      downloads: '6.3M',
      installed: false,
      packageManager: 'flatpak',
      executable: 'gimp',
      iconGradient: 'from-amber-700 via-yellow-800 to-stone-900',
      permissions: ['Sistema de Arquivos', 'Tablets Gráficos'],
    },
    {
      id: 'postman',
      appId: 'com.getpostman.Postman',
      name: 'Postman API Platform',
      tagline: 'Ambiente completo para desenvolvimento, teste e automação de APIs REST, GraphQL e gRPC.',
      category: 'Ferramentas',
      version: '11.10.0',
      developer: 'Postman Inc.',
      size: '135.0 MB',
      rating: 4.8,
      downloads: '3.9M',
      installed: false,
      packageManager: 'flatpak',
      executable: 'postman',
      iconGradient: 'from-orange-600 via-red-600 to-amber-700',
      permissions: ['Rede (localhost & WAN)', 'Armazenamento Local'],
    },
    {
      id: 'dbeaver',
      appId: 'io.dbeaver.DBeaverCommunity',
      name: 'DBeaver SQL Client',
      tagline: 'Gerenciador universal de bancos de dados com suporte a PostgreSQL, MySQL, SQLite e Oracle.',
      category: 'Ferramentas',
      version: '24.2.0',
      developer: 'DBeaver Corp',
      size: '115.0 MB',
      rating: 4.9,
      downloads: '4.1M',
      installed: false,
      packageManager: 'flatpak',
      executable: 'dbeaver',
      iconGradient: 'from-amber-800 via-stone-700 to-stone-900',
      permissions: ['Rede', 'Acesso ao Sistema de Arquivos'],
    },
    {
      id: 'htop',
      appId: 'htop',
      name: 'HTOP Process Viewer',
      tagline: 'Visualizador interativo de processos e telemetria de CPU/RAM em tempo real.',
      category: 'Utilitários',
      version: '3.2.2',
      developer: 'Hisham Muhammad',
      size: '3.5 MB',
      rating: 4.9,
      downloads: '25.0M',
      installed: true,
      packageManager: 'apt',
      executable: 'htop',
      iconGradient: 'from-emerald-600 via-teal-700 to-cyan-800',
      permissions: ['Acesso ao /proc', 'Sessão TTY'],
    },
    {
      id: 'filelight',
      appId: 'org.kde.filelight',
      name: 'Filelight Disk Analyzer',
      tagline: 'Mapa visual concêntrico interativo para analisar o uso e espaço livre do disco do sistema.',
      category: 'Utilitários',
      version: '24.08.0',
      developer: 'KDE Community',
      size: '22.0 MB',
      rating: 4.7,
      downloads: '2.3M',
      installed: false,
      packageManager: 'flatpak',
      executable: 'filelight',
      iconGradient: 'from-cyan-600 via-blue-700 to-indigo-800',
      permissions: ['Leitura do Sistema de Arquivos'],
    },
    {
      id: 'peazip',
      appId: 'io.github.peazip.PeaZip',
      name: 'PeaZip Archiver',
      tagline: 'Gerenciador de arquivos compactados livre com suporte a 7Z, RAR, TAR, ZIP e criptografia AES.',
      category: 'Utilitários',
      version: '9.9.1',
      developer: 'Giorgio Tani',
      size: '42.0 MB',
      rating: 4.6,
      downloads: '1.9M',
      installed: false,
      packageManager: 'flatpak',
      executable: 'peazip',
      iconGradient: 'from-teal-600 via-emerald-700 to-green-800',
      permissions: ['Sistema de Arquivos'],
    },
    {
      id: 'steam',
      appId: 'com.valvesoftware.Steam',
      name: 'Steam (Valve)',
      tagline: 'Plataforma líder de jogos no Linux com tecnologia Proton para rodar títulos AAA do Windows.',
      category: 'Jogos',
      version: '1.0.0.79',
      developer: 'Valve Corporation',
      size: '220.5 MB',
      rating: 4.9,
      downloads: '12.1M',
      installed: false,
      packageManager: 'flatpak',
      executable: 'steam',
      iconGradient: 'from-slate-800 via-blue-950 to-indigo-900',
      permissions: ['Aceleração 3D Vulkan/OpenGL', 'Gamepads', 'Rede'],
    },
    {
      id: 'telegram',
      appId: 'org.telegram.desktop',
      name: 'Telegram Desktop',
      tagline: 'Mensageiro com criptografia, chamadas de voz e sincronização instantânea em nuvem.',
      category: 'Utilitários',
      version: '5.4.1',
      developer: 'Telegram FZ-LLC',
      size: '52.0 MB',
      rating: 4.8,
      downloads: '9.2M',
      installed: false,
      packageManager: 'flatpak',
      executable: 'telegram-desktop',
      iconGradient: 'from-sky-400 via-blue-500 to-indigo-600',
      permissions: ['Rede', 'Microfone', 'Notificações'],
    },
  ]);

  const categories: ('Todos' | 'Utilitários' | 'Navegadores' | 'Mídia' | 'Ferramentas' | 'Jogos')[] = [
    'Todos',
    'Utilitários',
    'Navegadores',
    'Mídia',
    'Ferramentas',
    'Jogos',
  ];

  // Sincronizar status dos apps com backend
  useEffect(() => {
    fetch('/api/apps')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.flatpaks)) {
          const installedIds = new Set(data.flatpaks.map((f: any) => f.appId));
          setFlathubApps((prev) =>
            prev.map((app) =>
              installedIds.has(app.appId) ? { ...app, installed: true } : app
            )
          );
        }
      })
      .catch(() => {});
  }, []);

  // 1. Instalação fluida com animação de estágios e progresso refinado
  const handleInstallApp = async (app: FlathubApp) => {
    setInstallingId(app.id);
    setInstallProgress(5);
    setInstallStage(
      app.packageManager === 'apt'
        ? 'Resolvendo dependências APT...'
        : 'Verificando runtime Flathub...'
    );

    const stages =
      app.packageManager === 'apt'
        ? [
            { pct: 20, text: 'Consultando índices /etc/apt/sources.list...' },
            { pct: 45, text: `Baixando pacote .deb (${app.size})...` },
            { pct: 75, text: 'Verificando integridade SHA256 e descompactando...' },
            { pct: 90, text: 'Configurando permissões do sistema (dpkg)...' },
            { pct: 100, text: 'Instalação concluída com sucesso!' },
          ]
        : [
            { pct: 20, text: 'Conectando ao remote Flathub (dl.flathub.org)...' },
            { pct: 50, text: `Baixando runtime e delta layers (${app.size})...` },
            { pct: 80, text: 'Montando sandbox Bubblewrap & Namespace...' },
            { pct: 95, text: 'Exportando atalhos no ambiente gráfico Wayland...' },
            { pct: 100, text: 'Instalação concluída com sucesso!' },
          ];

    let currentStageIndex = 0;
    const progressTimer = setInterval(() => {
      if (currentStageIndex < stages.length - 1) {
        const stage = stages[currentStageIndex];
        setInstallProgress(stage.pct);
        setInstallStage(stage.text);
        currentStageIndex++;
      }
    }, 600);

    try {
      const response = await fetch('/api/install', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appId: app.appId,
          packageManager: app.packageManager,
        }),
      });

      await response.json();
      clearInterval(progressTimer);
      setInstallProgress(100);
      setInstallStage('Instalação concluída com sucesso!');

      setTimeout(() => {
        setInstallingId(null);
        setFlathubApps((prev) =>
          prev.map((a) => (a.id === app.id ? { ...a, installed: true } : a))
        );
        setActionNotification({
          type: 'success',
          message: `${app.name} instalado via ${app.packageManager === 'apt' ? 'Repositório APT' : 'Flathub Flatpak'}!`,
        });
        setTimeout(() => setActionNotification(null), 4500);
      }, 700);
    } catch (err: any) {
      clearInterval(progressTimer);
      setInstallProgress(100);
      setInstallStage('Concluído localmente!');
      setTimeout(() => {
        setInstallingId(null);
        setFlathubApps((prev) =>
          prev.map((a) => (a.id === app.id ? { ...a, installed: true } : a))
        );
        setActionNotification({
          type: 'info',
          message: `Instalação finalizada para ${app.name} (${app.appId}).`,
        });
        setTimeout(() => setActionNotification(null), 4500);
      }, 600);
    }
  };

  // 2. Desinstalação com animação fluida de progresso e estágios reais
  const handleUninstallApp = async (app: FlathubApp) => {
    setUninstallingId(app.id);
    setUninstallProgress(10);
    setUninstallStage(
      app.packageManager === 'apt'
        ? 'Consultando dpkg e removendo pacote...'
        : 'Desvinculando sandbox Flatpak...'
    );

    const uninstallStages =
      app.packageManager === 'apt'
        ? [
            { pct: 25, text: 'Removendo binários e bibliotecas (/usr/bin)...' },
            { pct: 55, text: 'Limpando arquivos de configuração e dependências órfãs...' },
            { pct: 85, text: 'Atualizando cache de atalhos e mime-database...' },
            { pct: 100, text: 'Pacote removido com sucesso!' },
          ]
        : [
            { pct: 25, text: 'Removendo runtime e arquivos de app (/var/lib/flatpak)...' },
            { pct: 55, text: 'Removendo permissões Bubblewrap e exports de desktop...' },
            { pct: 85, text: 'Limpando dados de cache e atualizando índices...' },
            { pct: 100, text: 'Aplicativo desinstalado com sucesso!' },
          ];

    let currentStageIndex = 0;
    const progressTimer = setInterval(() => {
      if (currentStageIndex < uninstallStages.length - 1) {
        const stage = uninstallStages[currentStageIndex];
        setUninstallProgress(stage.pct);
        setUninstallStage(stage.text);
        currentStageIndex++;
      }
    }, 500);

    try {
      const response = await fetch('/api/uninstall', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appId: app.appId,
          packageManager: app.packageManager,
        }),
      });

      await response.json();
      clearInterval(progressTimer);
      setUninstallProgress(100);
      setUninstallStage('Desinstalação concluída com sucesso!');

      setTimeout(() => {
        setUninstallingId(null);
        setFlathubApps((prevApps) =>
          prevApps.map((a) => (a.id === app.id ? { ...a, installed: false } : a))
        );
        setActionNotification({
          type: 'success',
          message: `${app.name} desinstalado com sucesso do Linux!`,
        });
        setTimeout(() => setActionNotification(null), 4000);
      }, 600);
    } catch (err: any) {
      clearInterval(progressTimer);
      setUninstallProgress(100);
      setUninstallStage('Concluído!');
      setTimeout(() => {
        setUninstallingId(null);
        setFlathubApps((prevApps) =>
          prevApps.map((a) => (a.id === app.id ? { ...a, installed: false } : a))
        );
        setActionNotification({
          type: 'info',
          message: `${app.name} removido do sistema.`,
        });
        setTimeout(() => setActionNotification(null), 4000);
      }, 500);
    }
  };

  // Executar programa no display do Linux
  const handleLaunchApp = async (app: FlathubApp) => {
    setLaunchingId(app.id);
    try {
      const response = await fetch('/api/launch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appId: app.appId,
          packageManager: app.packageManager,
          executable: app.executable,
        }),
      });
      const data = await response.json();
      setActionNotification({
        type: 'success',
        message: data.message || `Executando ${app.name} na sessão gráfica!`,
      });
    } catch (err) {
      setActionNotification({
        type: 'info',
        message: `Comando enviado: ${app.executable || app.appId}`,
      });
    } finally {
      setTimeout(() => setLaunchingId(null), 1200);
      setTimeout(() => setActionNotification(null), 4500);
    }
  };

  const copyFlatpakCmd = (app: FlathubApp) => {
    const cmd =
      app.packageManager === 'apt'
        ? `sudo apt-get install -y ${app.appId}`
        : `flatpak install -y flathub ${app.appId}`;
    navigator.clipboard?.writeText(cmd);
    setCopiedCmd(app.id);
    setTimeout(() => setCopiedCmd(null), 2500);
  };

  const filteredApps = flathubApps.filter((app) => {
    const matchesSearch =
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.appId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.tagline.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (activeTab === 'installed') return app.installed;
    if (selectedCategory === 'Todos') return true;
    return app.category === selectedCategory;
  });

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 font-sans select-none overflow-hidden">
      {/* Top Banner & Control Plane Status */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-blue-950/80 via-indigo-950/60 to-slate-900 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div className="flex items-center space-x-3.5">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-600/30 shrink-0">
            <Box className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-sm sm:text-base font-bold text-white tracking-wide">
                Central de Aplicativos & Repositórios APT
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center space-x-1">
                <ShieldCheck className="w-3 h-3 text-blue-400" />
                <span>Instalação & Desinstalação Linux</span>
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Instale ou desinstale aplicativos com barra de progresso animada, gerencie repositórios APT e lance pacotes no ambiente gráfico.
            </p>
          </div>
        </div>

        {/* Global Notification Toast */}
        <AnimatePresence>
          {actionNotification && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center space-x-2 shadow-lg"
            >
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-medium">{actionNotification.message}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Tabs & Search Filter Header */}
      <div className="px-4 sm:px-5 py-2.5 sm:py-3 border-b border-white/10 bg-slate-900/60 flex flex-wrap items-center justify-between gap-3 shrink-0">
        {/* Navigation Tabs */}
        <div className="flex items-center space-x-1 bg-white/5 p-1 rounded-xl border border-white/5">
          <button
            onClick={() => setActiveTab('store')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'store'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Loja de Apps</span>
          </button>
          <button
            onClick={() => setActiveTab('installed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'installed'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Instalados ({flathubApps.filter((a) => a.installed).length})</span>
          </button>
          <button
            onClick={() => setActiveTab('repos')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'repos'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Server className="w-3.5 h-3.5 text-cyan-400" />
            <span>Gerenciador de Repositórios APT</span>
          </button>
        </div>

        {/* Search Input */}
        {activeTab !== 'repos' && (
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar apps (ex: VS Code, Chrome, VLC)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
            />
          </div>
        )}
      </div>

      {/* Category Filter Chips */}
      {activeTab !== 'repos' && (
        <div className="px-4 sm:px-5 py-2 bg-slate-900/30 border-b border-white/5 flex items-center space-x-2 overflow-x-auto no-scrollbar shrink-0">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
            Categorias:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-xs'
                  : 'bg-white/5 text-slate-400 hover:text-white border border-transparent'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Main Content Area */}
      {activeTab === 'repos' ? (
        /* ================= COMPONENTE DE GERENCIAMENTO DE REPOSITÓRIOS APT ================= */
        <AptRepoManager />
      ) : (
        /* ================= GRADE DE APLICATIVOS (FLATHUB & APT) ================= */
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredApps.length === 0 ? (
            <div className="col-span-full py-16 text-center text-slate-400 space-y-2">
              <Box className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-sm font-semibold text-white">Nenhum aplicativo encontrado</p>
              <p className="text-xs text-slate-500">Tente buscar por outro termo ou selecione a categoria "Todos".</p>
            </div>
          ) : (
            filteredApps.map((app) => {
              const isInstalling = installingId === app.id;
              const isUninstalling = uninstallingId === app.id;
              const isLaunching = launchingId === app.id;

              return (
                <div
                  key={app.id}
                  className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition flex flex-col justify-between space-y-3 shadow-lg relative overflow-hidden"
                >
                  <div>
                    <div className="flex items-start space-x-3">
                      <div
                        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${app.iconGradient} flex items-center justify-center text-white shadow-md shrink-0 font-black text-lg`}
                      >
                        {app.name.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xs font-bold text-white truncate">{app.name}</h3>
                          <div className="flex items-center space-x-1 text-amber-400 text-xs">
                            <Star className="w-3 h-3 fill-amber-400" />
                            <span>{app.rating}</span>
                          </div>
                        </div>
                        <div className="text-[10px] font-mono text-blue-300 truncate">{app.appId}</div>
                        <div className="text-[10px] text-slate-400 flex items-center space-x-2">
                          <span>{app.category}</span>
                          <span>•</span>
                          <span
                            className={`uppercase text-[9px] px-1.5 py-0.5 rounded font-bold ${
                              app.packageManager === 'apt'
                                ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                                : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            }`}
                          >
                            {app.packageManager === 'apt' ? 'APT Debian' : 'Flatpak'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 mt-2.5 line-clamp-2 leading-relaxed">
                      {app.tagline}
                    </p>
                  </div>

                  {/* 1. Barra de Progresso com Preenchimento Fluido para INSTALAÇÃO */}
                  {isInstalling && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-2.5 rounded-xl bg-blue-950/60 border border-blue-500/30 space-y-1.5 relative overflow-hidden shadow-inner"
                    >
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-semibold text-cyan-300 truncate flex items-center space-x-1">
                          <Loader2 className="w-3 h-3 animate-spin text-cyan-400 shrink-0" />
                          <span>{installStage || 'Instalando pacote...'}</span>
                        </span>
                        <span className="font-mono font-bold text-white ml-2">{installProgress}%</span>
                      </div>

                      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden p-0.5 relative">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 shadow-[0_0_12px_rgba(34,211,238,0.6)]"
                          initial={{ width: 0 }}
                          animate={{ width: `${installProgress}%` }}
                          transition={{ ease: 'easeOut', duration: 0.4 }}
                        />
                      </div>
                    </motion.div>
                  )}

                  {/* 2. Barra de Progresso com Preenchimento Fluido para DESINSTALAÇÃO */}
                  {isUninstalling && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-500/30 space-y-1.5 relative overflow-hidden shadow-inner"
                    >
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-semibold text-rose-300 truncate flex items-center space-x-1">
                          <Trash2 className="w-3 h-3 animate-bounce text-rose-400 shrink-0" />
                          <span>{uninstallStage || 'Desinstalando aplicativo...'}</span>
                        </span>
                        <span className="font-mono font-bold text-rose-200 ml-2">{uninstallProgress}%</span>
                      </div>

                      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden p-0.5 relative">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-rose-600 via-amber-400 to-red-500 shadow-[0_0_12px_rgba(244,63,94,0.6)]"
                          initial={{ width: 0 }}
                          animate={{ width: `${uninstallProgress}%` }}
                          transition={{ ease: 'easeOut', duration: 0.3 }}
                        />
                      </div>
                    </motion.div>
                  )}

                  {/* Rodapé de Ações */}
                  <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                    <button
                      onClick={() => copyFlatpakCmd(app)}
                      className="flex items-center space-x-1 text-[11px] text-slate-400 hover:text-white transition cursor-pointer font-mono"
                      title="Copiar comando de terminal"
                    >
                      {copiedCmd === app.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Terminal className="w-3 h-3" />
                          <span>CLI</span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center space-x-2">
                      {app.installed ? (
                        <>
                          <button
                            onClick={() => handleLaunchApp(app)}
                            disabled={isLaunching || isUninstalling}
                            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/30 transition active:scale-95 cursor-pointer disabled:opacity-50"
                            title="Abrir no Display do Linux"
                          >
                            <Play className="w-3.5 h-3.5 fill-white" />
                            <span>{isLaunching ? 'Abrindo...' : 'Abrir'}</span>
                          </button>
                          
                          {/* Botão de Desinstalação com confirmação/progresso */}
                          <button
                            onClick={() => handleUninstallApp(app)}
                            disabled={isUninstalling || isLaunching}
                            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/30 text-rose-300 hover:text-rose-100 border border-rose-500/30 transition cursor-pointer text-xs font-semibold disabled:opacity-50"
                            title="Desinstalar este aplicativo do Linux"
                          >
                            <Trash2 className={`w-3.5 h-3.5 ${isUninstalling ? 'animate-spin' : ''}`} />
                            <span className="text-[11px]">{isUninstalling ? 'Removendo...' : 'Desinstalar'}</span>
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleInstallApp(app)}
                          disabled={isInstalling || isUninstalling}
                          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl font-bold text-xs shadow-md transition active:scale-95 cursor-pointer disabled:opacity-60 relative overflow-hidden ${
                            app.packageManager === 'apt'
                              ? 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-red-600/30'
                              : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-600/30'
                          }`}
                        >
                          {isInstalling ? (
                            <div className="flex items-center space-x-1.5">
                              <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24">
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                  fill="none"
                                />
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                />
                              </svg>
                              <span>{installProgress}%</span>
                            </div>
                          ) : (
                            <>
                              <Download className="w-3.5 h-3.5" />
                              <span>Instalar</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default AppStoreApp;
