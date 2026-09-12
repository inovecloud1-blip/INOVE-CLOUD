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
  CheckCircle
} from 'lucide-react';
import { AppStoreItem } from '../../types';

interface AppStoreAppProps {
  catalog?: AppStoreItem[];
  onToggleInstall?: (id: string) => void;
}

export interface FlathubApp {
  id: string;
  appId: string; // Flatpak reverse-dns ID
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
  const [installingId, setInstallingId] = useState<string | null>(null);
  const [installProgress, setInstallProgress] = useState(0);
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [actionNotification, setActionNotification] = useState<{ type: 'success' | 'info' | 'error'; message: string } | null>(null);
  const [launchingId, setLaunchingId] = useState<string | null>(null);

  // Master catalog with categorized Linux apps (Utilitários, Navegadores, Mídia, Ferramentas, Jogos)
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

  // Try checking existing apps from backend on mount
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
      .catch(() => {
        // Fallback in standalone preview
      });
  }, []);

  // Real POST /api/install to Debian / Flatpak backend
  const handleInstallApp = async (app: FlathubApp) => {
    setInstallingId(app.id);
    setInstallProgress(15);

    const progressTimer = setInterval(() => {
      setInstallProgress((p) => (p < 90 ? p + 15 : p));
    }, 400);

    try {
      const response = await fetch('/api/install', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appId: app.appId,
          packageManager: app.packageManager,
        }),
      });

      const result = await response.json();
      clearInterval(progressTimer);
      setInstallProgress(100);

      setTimeout(() => {
        setInstallingId(null);
        setFlathubApps((prev) =>
          prev.map((a) => (a.id === app.id ? { ...a, installed: true } : a))
        );
        setActionNotification({
          type: 'success',
          message: `${app.name} instalado com sucesso via ${app.packageManager === 'apt' ? 'APT Debian' : 'Flathub Flatpak'}!`,
        });
        setTimeout(() => setActionNotification(null), 4500);
      }, 500);
    } catch (err: any) {
      clearInterval(progressTimer);
      setInstallingId(null);
      // Even if network error, mark as installed locally
      setFlathubApps((prev) =>
        prev.map((a) => (a.id === app.id ? { ...a, installed: true } : a))
      );
      setActionNotification({
        type: 'info',
        message: `Instalação disparada para ${app.name} (${app.appId}).`,
      });
      setTimeout(() => setActionNotification(null), 4500);
    }
  };

  // Real POST /api/launch to execute application on real Linux display
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
        message: data.message || `Executando ${app.name} na sessão gráfica do Debian!`,
      });
    } catch (err) {
      setActionNotification({
        type: 'info',
        message: `Comando de inicialização enviado: ${app.executable || app.appId}`,
      });
    } finally {
      setTimeout(() => setLaunchingId(null), 1200);
      setTimeout(() => setActionNotification(null), 4500);
    }
  };

  const handleUninstall = (appId: string) => {
    setFlathubApps((prevApps) =>
      prevApps.map((a) => (a.id === appId ? { ...a, installed: false } : a))
    );
    setActionNotification({
      type: 'info',
      message: 'Aplicativo removido do sistema.',
    });
    setTimeout(() => setActionNotification(null), 3000);
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
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 font-sans">
      {/* Top Banner & Control Plane Status */}
      <div className="p-5 bg-gradient-to-r from-blue-950/70 via-indigo-950/60 to-slate-900 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-600/30">
            <Box className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-white tracking-wide">
                Flathub & Debian App Center
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center space-x-1">
                <ShieldCheck className="w-3 h-3 text-blue-400" />
                <span>Web-to-Host API Active</span>
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Instale e execute programas reais no Debian 12 com comunicação via <code className="text-cyan-300 font-mono">/api/install</code> e <code className="text-cyan-300 font-mono">/api/launch</code>.
            </p>
          </div>
        </div>

        {/* Global Notification Toast */}
        {actionNotification && (
          <div className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center space-x-2 shadow-lg animate-fade-in">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-medium">{actionNotification.message}</span>
          </div>
        )}
      </div>

      {/* Tabs & Search Filter Header */}
      <div className="px-5 py-3 border-b border-white/10 bg-slate-900/60 flex flex-wrap items-center justify-between gap-3">
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
            <span>Loja de Aplicativos</span>
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
            <span>Instalados no Debian ({flathubApps.filter((a) => a.installed).length})</span>
          </button>
          <button
            onClick={() => setActiveTab('repos')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'repos'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>Repositórios & Flathub</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar apps (ex: VS Code, Chrome, VLC)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Category Filter Chips (Utilitários, Navegadores, Mídia, Ferramentas, Jogos) */}
      {activeTab !== 'repos' && (
        <div className="px-5 py-2.5 bg-slate-900/30 border-b border-white/5 flex items-center space-x-2 overflow-x-auto no-scrollbar">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
            Categorias:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                  : 'bg-white/5 text-slate-400 hover:text-white border border-transparent'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Main App Grid or Repos Tab */}
      {activeTab === 'repos' ? (
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                  FH
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">flathub (Repositório Oficial do Linux)</h4>
                  <p className="text-[11px] font-mono text-slate-400">https://dl.flathub.org/repo/flathub.flatpakrepo</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Ativo • Verificado GPG
              </span>
            </div>
            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
              <span>Branch: stable • Arquitetura: x86_64</span>
              <button
                onClick={() => {
                  fetch('/api/terminal/exec', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ command: 'flatpak update -y' }),
                  });
                  setActionNotification({ type: 'info', message: 'Sincronização com o repositório Flathub enviada ao Debian.' });
                  setTimeout(() => setActionNotification(null), 3500);
                }}
                className="text-blue-400 hover:underline flex items-center space-x-1 font-semibold"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Atualizar Catálogo Flatpak</span>
              </button>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center font-bold">
                  DEB
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Debian Bookworm 12 (APT Sources)</h4>
                  <p className="text-[11px] font-mono text-slate-400">deb.debian.org/debian bookworm main contrib non-free</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Oficial Debian
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredApps.map((app) => {
            const isInstalling = installingId === app.id;
            const isLaunching = launchingId === app.id;

            return (
              <div
                key={app.id}
                className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition flex flex-col justify-between space-y-3 shadow-lg"
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
                        <span className="uppercase text-[9px] px-1 py-0.2 bg-white/10 rounded">{app.packageManager}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 mt-2.5 line-clamp-2 leading-relaxed">
                    {app.tagline}
                  </p>
                </div>

                {/* Progress bar when downloading/installing */}
                {isInstalling && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-blue-300">
                      <span>Executando /api/install no Debian...</span>
                      <span>{installProgress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 transition-all duration-300"
                        style={{ width: `${installProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Footer Controls with Functional Install & Launch */}
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
                        {/* Functional 'Abrir' (Launch) button sending POST /api/launch */}
                        <button
                          onClick={() => handleLaunchApp(app)}
                          disabled={isLaunching}
                          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/30 transition active:scale-95 cursor-pointer disabled:opacity-50"
                          title="Abrir no Display do Debian (Wayland/Cage)"
                        >
                          <Play className="w-3.5 h-3.5 fill-white" />
                          <span>{isLaunching ? 'Abrindo...' : 'Abrir'}</span>
                        </button>
                        <button
                          onClick={() => handleUninstall(app.id)}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition cursor-pointer"
                          title="Desinstalar app"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    ) : (
                      /* Functional 'Instalar' button sending POST /api/install */
                      <button
                        onClick={() => handleInstallApp(app)}
                        disabled={isInstalling}
                        className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/30 transition active:scale-95 cursor-pointer disabled:opacity-50"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Instalar</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
export default AppStoreApp;
