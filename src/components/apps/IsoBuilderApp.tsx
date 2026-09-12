import React, { useState } from 'react';
import {
  Disc,
  Terminal,
  Download,
  Copy,
  Check,
  Cpu,
  Layers,
  HardDrive,
  Play,
  Server,
  FileCode,
  Github,
  Monitor,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  FolderDown,
  Video,
  Sparkles
} from 'lucide-react';

interface IsoBuilderAppProps {
  onPreviewBootVideo?: () => void;
}

export const IsoBuilderApp: React.FC<IsoBuilderAppProps> = ({ onPreviewBootVideo }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'bootvideo' | 'download' | 'script' | 'docker' | 'github' | 'guide'>('overview');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [isSimulatingBuild, setIsSimulatingBuild] = useState(false);
  const [buildLogs, setBuildLogs] = useState<string[]>([]);
  const [buildProgress, setBuildProgress] = useState(0);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2500);
  };

  const startSimulation = () => {
    if (isSimulatingBuild) return;
    setIsSimulatingBuild(true);
    setBuildProgress(5);
    setBuildLogs([
      '⚡ Iniciando ambiente de compilação InoveCloud OS...',
      '📦 [1/7] Instalando debootstrap, squashfs-tools, xorriso, grub-pc-bin...',
    ]);

    const steps = [
      { progress: 20, log: '🌐 [2/7] Executando debootstrap Debian 12 Bookworm minimal (amd64)...' },
      { progress: 40, log: '⚙️ [3/7] Configurando chroot, repositórios non-free-firmware e apt...' },
      { progress: 60, log: '🐧 [4/7] Instalando Linux Kernel 6.1, Xorg, Openbox, xcompmgr, Flatpak, PCManFM, LXTerminal & Chromium...' },
      { progress: 75, log: '🚀 [5/7] Configurando .xinitrc (Openbox + Web OS Desktop), Node.js server.js e auto-login...' },
      { progress: 90, log: '🗜️ [6/7] Comprimindo SquashFS com algoritmo XZ (-comp xz)...' },
      { progress: 100, log: '💿 [7/7] Gerando imagem híbrida UEFI/BIOS: inovecloud-os-debian12-amd64.iso (840 MB) - Concluído!' },
    ];

    steps.forEach((step, idx) => {
      setTimeout(() => {
        setBuildProgress(step.progress);
        setBuildLogs((prev) => [...prev, step.log]);
        if (idx === steps.length - 1) {
          setIsSimulatingBuild(false);
        }
      }, (idx + 1) * 900);
    });
  };

  const bashScriptSnippet = `#!/usr/bin/env bash
# InoveCloud OS - Automated Debian 12 Live ISO Builder
# Kiosk Appliance: Boots directly into InoveCloud OS Launcher
set -euo pipefail

# 1. Compilar aplicação Web
npm run build

# 2. Executar script oficial com privilégios de root
chmod +x iso-builder/build-iso.sh
sudo ./iso-builder/build-iso.sh

# A imagem final será gerada em:
# dist-iso/inovecloud-os-debian12-amd64.iso`;

  const dockerSnippet = `# Gerar a ISO usando Docker (Windows, macOS ou Linux)
docker build -t inovecloud-iso-builder -f iso-builder/Dockerfile iso-builder/

# Executar o container para compilar e salvar o .iso
mkdir -p dist-iso
docker run --privileged --rm -v $(pwd)/dist-iso:/output inovecloud-iso-builder`;

  const downloadScriptFile = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-100 font-sans overflow-hidden select-none">
      {/* Top Header Banner */}
      <div className="p-5 border-b border-white/10 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-600 via-rose-600 to-amber-600 flex items-center justify-center text-white shadow-xl shadow-red-500/20">
            <Disc className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-bold text-white tracking-tight">
                Gerador de ISO & Live OS Linux
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/30">
                Debian 12 Bookworm
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Openbox X11 + xcompmgr
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Sistema Operacional completo com gerenciador de janelas real, multitarefa nativa e interface Web Desktop.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {onPreviewBootVideo && (
            <button
              onClick={onPreviewBootVideo}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:opacity-90 text-white text-xs font-bold transition cursor-pointer shadow-lg shadow-blue-500/25 active:scale-95"
              title="Executar vídeo de inicialização da ISO em tela cheia"
            >
              <Video className="w-3.5 h-3.5" />
              <span>Vídeo de Boot da ISO</span>
            </button>
          )}
          <button
            onClick={() => setActiveTab('download')}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition cursor-pointer border border-white/10"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>Cadê a ISO? / Baixar Kit</span>
          </button>
          <button
            onClick={startSimulation}
            disabled={isSimulatingBuild}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold transition cursor-pointer shadow-lg shadow-red-600/30 active:scale-95 disabled:opacity-50"
          >
            <Play className={`w-3.5 h-3.5 ${isSimulatingBuild ? 'animate-spin' : ''}`} />
            <span>{isSimulatingBuild ? 'Compilando...' : 'Simular Build'}</span>
          </button>
        </div>
      </div>

      {/* Subnav Tabs */}
      <div className="px-5 pt-3 border-b border-white/10 bg-slate-900/60 flex space-x-2 overflow-x-auto text-xs font-semibold">
        {[
          { id: 'overview', label: 'Visão Geral & Arquitetura', icon: Layers },
          { id: 'bootvideo', label: '🎬 Vídeo de Inicialização', icon: Video },
          { id: 'download', label: 'Cadê a ISO? / Como Baixar', icon: Download },
          { id: 'script', label: 'Script Bash (build-iso.sh)', icon: Terminal },
          { id: 'docker', label: 'Compilar via Docker', icon: Server },
          { id: 'github', label: 'GitHub Actions (Nuvem)', icon: Github },
          { id: 'guide', label: 'Como Gravar & Dar Boot', icon: HardDrive },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-3.5 py-2.5 border-b-2 transition cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'border-red-500 text-red-400 font-bold bg-white/5 rounded-t-lg'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5 rounded-t-lg'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Tab Content Area */}
      <div className="flex-1 p-5 overflow-y-auto space-y-6">
        {/* BOOT VIDEO TAB */}
        {activeTab === 'bootvideo' && (
          <div className="space-y-6 max-w-5xl mx-auto">
            {/* Hero Card */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-950/60 via-indigo-950/50 to-slate-900 border border-blue-500/30 shadow-2xl relative overflow-hidden">
              <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-bold">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                    <span>Animação Oficial de Abertura InoveCloud OS</span>
                  </div>
                  <h3 className="text-xl font-bold text-white tracking-tight">
                    Sequência Cinematográfica de Boot para ISO Live
                  </h3>
                  <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                    Esta é a sequência de inicialização integrada que é exibida assim que a máquina liga na ISO Linux ou no ambiente Web. Segue exatamente a identidade visual do vídeo: tipografia sólida orgânica <strong>SEU SISTEMA</strong>, azul royal e ciano neon <strong>ELEGANTE PODEROSO</strong>, finalizando com a marca <strong>INOVECLOUD OS</strong> e transição suave para a área de trabalho.
                  </p>
                </div>

                {onPreviewBootVideo && (
                  <button
                    onClick={onPreviewBootVideo}
                    className="flex items-center space-x-2 px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-sm transition cursor-pointer shadow-xl shadow-blue-600/30 active:scale-95 whitespace-nowrap"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Reproduzir em Tela Cheia</span>
                  </button>
                )}
              </div>
            </div>

            {/* Visual Storyboard Steps */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Scene 1 */}
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-500/40 transition flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Cena 01 • 0.0s - 1.2s
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">Texture Fill</span>
                  </div>
                  <div className="h-28 rounded-xl bg-white flex items-center justify-center p-3 shadow-inner border border-slate-200">
                    <span
                      className="text-2xl font-black uppercase tracking-wider"
                      style={{
                        background: 'linear-gradient(135deg, #1b3a24 0%, #2e5939 30%, #3e6d42 55%, #18331f 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}
                    >
                      SEU SISTEMA
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Entrada com zoom óptico sutil e corte de preenchimento em textura floresta / orgânica profunda.
                  </p>
                </div>
              </div>

              {/* Scene 2 */}
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-blue-500/40 transition flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      Cena 02 • 1.2s - 2.4s
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">Electric Neon</span>
                  </div>
                  <div className="h-28 rounded-xl bg-white flex items-center justify-center p-3 shadow-inner border border-slate-200">
                    <span
                      className="text-lg font-black uppercase tracking-wide"
                      style={{
                        background: 'linear-gradient(90deg, #0055ff 0%, #00d2ff 40%, #0044ff 70%, #0011ff 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}
                    >
                      ELEGANTE PODEROSO
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Gradiente vibrante em azul royal ultramarino com núcleo em ciano neon brilhante e glow suave.
                  </p>
                </div>
              </div>

              {/* Scene 3 */}
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/40 transition flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      Cena 03 • 2.4s - 3.8s
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">Brand Final</span>
                  </div>
                  <div className="h-28 rounded-xl bg-white flex flex-col items-center justify-center p-3 shadow-inner border border-slate-200 space-y-1">
                    <span
                      className="text-lg font-black uppercase tracking-wide"
                      style={{
                        background: 'linear-gradient(90deg, #1e40af 0%, #3b82f6 25%, #ec4899 50%, #a855f7 75%, #1e1b4b 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}
                    >
                      INOVECLOUD OS
                    </span>
                    <svg viewBox="0 0 100 70" className="w-12 h-8 text-slate-900" fill="none">
                      <path
                        d="M30 60 L72 60 C82 60 89 53 89 43 C89 34 82 27 73 27 C71 27 70 27.5 68 28 C65 17 56 10 45 10 C32 10 22 20 22 33 C22 35 22.5 37 23 39 C15 41 10 48 10 55 C10 63 17 60 30 60 Z"
                        stroke="#111827"
                        strokeWidth="7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M33 52 C27 52 22 47 22 41 C22 35 27 30 33 30 C35 30 37 30.5 38 31 C40 23 47 18 54 18 C62 18 68 23 69 31 C74 31 78 35 78 40 C78 45 74 52 68 52"
                        stroke="#111827"
                        strokeWidth="5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <p className="text-xs text-slate-300">
                    Marca oficial InoveCloud OS com o logotipo de nuvem e áudio harmônico em dó maior (chime de boot).
                  </p>
                </div>
              </div>
            </div>

            {/* Technical Appliance Integration Note */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 space-y-3">
              <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                <Monitor className="w-4 h-4 text-cyan-400" />
                <span>Como isso é executado dentro da ISO Debian 12 Live Kiosk</span>
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Ao gravar a ISO e dar boot no computador físico ou máquina virtual, o compositor Wayland (Cage) abre diretamente o Chromium Kiosk carregando a aplicação local em <code>http://127.0.0.1:3000</code>. O vídeo de inicialização é executado de forma fluida e automática enquanto os serviços secundários do Linux (rede, drivers de áudio e rede local) terminam de subir em segundo plano.
              </p>
              <div className="flex items-center space-x-3 pt-2">
                <span className="text-xs font-mono bg-black/40 px-3 py-1.5 rounded-lg border border-white/10 text-emerald-400">
                  Boot Chime: Web Audio API Sintetizado (Harmônico)
                </span>
                <span className="text-xs font-mono bg-black/40 px-3 py-1.5 rounded-lg border border-white/10 text-cyan-400">
                  Resolução: Responsiva 1080p / 4K / Ultrawide
                </span>
              </div>
            </div>
          </div>
        )}

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6 max-w-5xl mx-auto">
            {/* Quick Alert: Where is the ISO */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-red-500/10 to-rose-500/10 border border-amber-500/30 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold">
                  💡
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Cadê o arquivo .ISO pronto de ~840 MB?</h4>
                  <p className="text-xs text-slate-300">
                    O arquivo binário da ISO é gerado pelo compilador ou baixado via GitHub Actions. O código e o script de compilação já estão prontos na pasta <code>iso-builder/</code>.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('download')}
                className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition cursor-pointer shadow"
              >
                Ver como obter a ISO →
              </button>
            </div>
            {/* Architecture Stack Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-red-500/40 transition">
                <div className="flex items-center space-x-2 text-red-400 mb-2">
                  <Disc className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase">1. Base Minimal</span>
                </div>
                <h4 className="text-sm font-bold text-white">Debian 12 Bookworm</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Kernel 6.1 LTS x86_64, drivers Mesa DRI, GPU Intel/AMD/Nvidia e firmware non-free.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-500/40 transition">
                <div className="flex items-center space-x-2 text-cyan-400 mb-2">
                  <Monitor className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase">2. Desktop Flutuante</span>
                </div>
                <h4 className="text-sm font-bold text-white">X11 + Openbox + xcompmgr</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Gerenciador de janelas flutuantes com transparências, multitarefa real e apps nativos Debian / Flatpak.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-500/40 transition">
                <div className="flex items-center space-x-2 text-amber-400 mb-2">
                  <Server className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase">3. Serviço Local</span>
                </div>
                <h4 className="text-sm font-bold text-white">Systemd + Node.js</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Serviço `inovecloud.service` que inicia automaticamente em localhost:3000 no boot.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-500/40 transition">
                <div className="flex items-center space-x-2 text-emerald-400 mb-2">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase">4. Boot Híbrido</span>
                </div>
                <h4 className="text-sm font-bold text-white">UEFI + BIOS Legacy</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Compatível com computadores novos (Secure Boot/UEFI) e placas-mãe antigas.
                </p>
              </div>
            </div>

            {/* Build Status Card with live logs */}
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-white/10 shadow-2xl space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                    <Terminal className="w-4 h-4 text-red-400" />
                    <span>Console de Compilação & Telemetria do Build</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Acompanhe o processo de criação da imagem ISO comprimida.
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono font-bold text-red-400">
                    Progresso: {buildProgress}%
                  </span>
                  <button
                    onClick={startSimulation}
                    disabled={isSimulatingBuild}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 transition cursor-pointer"
                    title="Reiniciar simulação"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSimulatingBuild ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 bg-black/50 rounded-full overflow-hidden border border-white/10">
                <div
                  className="h-full bg-gradient-to-r from-red-500 via-amber-500 to-emerald-500 transition-all duration-300"
                  style={{ width: `${buildProgress}%` }}
                />
              </div>

              {/* Terminal Logs Output */}
              <div className="h-44 bg-black/80 rounded-xl p-3 font-mono text-xs text-slate-300 overflow-y-auto space-y-1 border border-white/5">
                {buildLogs.length === 0 ? (
                  <div className="text-slate-500 italic">
                    Clique em "Simular Build" acima para ver o processo detalhado de montagem do chroot e squashfs...
                  </div>
                ) : (
                  buildLogs.map((log, i) => (
                    <div key={i} className="leading-relaxed">
                      {log}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Quick action buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => setActiveTab('script')}
                className="p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition text-left cursor-pointer flex items-center justify-between group"
              >
                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-red-400 transition">
                    Ver Script Bash Completo
                  </h4>
                  <p className="text-[11px] text-slate-400">iso-builder/build-iso.sh</p>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-red-400 transition" />
              </button>

              <button
                onClick={() => setActiveTab('docker')}
                className="p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition text-left cursor-pointer flex items-center justify-between group"
              >
                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-cyan-400 transition">
                    Compilação via Docker
                  </h4>
                  <p className="text-[11px] text-slate-400">Sem instalar nada no host</p>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition" />
              </button>

              <button
                onClick={() => setActiveTab('guide')}
                className="p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition text-left cursor-pointer flex items-center justify-between group"
              >
                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-amber-400 transition">
                    Manual Rufus / Pendrive
                  </h4>
                  <p className="text-[11px] text-slate-400">Como dar boot na máquina real</p>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition" />
              </button>
            </div>
          </div>
        )}

        {/* DOWNLOAD / CADÊ A ISO TAB */}
        {activeTab === 'download' && (
          <div className="space-y-6 max-w-5xl mx-auto">
            <div className="p-5 rounded-2xl bg-gradient-to-r from-red-950/40 via-slate-900 to-amber-950/30 border border-red-500/30 space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-red-600/20 text-red-400 flex items-center justify-center font-bold text-lg">
                  💿
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Como Funciona o Arquivo .ISO do InoveCloud OS</h3>
                  <p className="text-xs text-slate-300">
                    O arquivo final <code>inovecloud-os-debian12-amd64.iso</code> tem aproximadamente <strong>840 MB</strong> (inclui o Kernel Linux 6.1, o Debian 12 Bookworm, Wayland Cage e o Chromium Kiosk).
                  </p>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Por se tratar de um arquivo binário pesado de quase 1 GB, ele <strong>não fica salvo em cache web</strong>, mas sim <strong>gerado em 1 comando</strong> pelos scripts que criamos dentro da pasta <code>iso-builder/</code> ou <strong>compilado gratuitamente na nuvem pelo GitHub Actions</strong>.
              </p>
            </div>

            {/* 3 Formas de ter a ISO */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Opção 1: GitHub Actions */}
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-purple-500/30 hover:border-purple-500/60 transition space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      Mais Fácil (Sem Instalar Nada)
                    </span>
                    <Github className="w-4 h-4 text-purple-400" />
                  </div>
                  <h4 className="text-sm font-bold text-white">Download Direto via GitHub Actions</h4>
                  <p className="text-xs text-slate-400">
                    O workflow <code>.github/workflows/build-iso.yml</code> compila a ISO nos servidores da nuvem.
                  </p>
                  <ol className="text-xs text-slate-300 list-decimal list-inside space-y-1 pt-1">
                    <li>Envie para seu repositório: <code>git push origin main</code></li>
                    <li>Vá na aba <strong>Actions</strong> do seu GitHub</li>
                    <li>Clique no build concluído e baixe o <strong>Artifact .iso</strong></li>
                  </ol>
                </div>
                <button
                  onClick={() => setActiveTab('github')}
                  className="w-full py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition cursor-pointer"
                >
                  Ver Configuração do GitHub →
                </button>
              </div>

              {/* Opção 2: Terminal Linux ou WSL */}
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-red-500/30 hover:border-red-500/60 transition space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/30">
                      No seu Computador (Linux / WSL)
                    </span>
                    <Terminal className="w-4 h-4 text-red-400" />
                  </div>
                  <h4 className="text-sm font-bold text-white">Executar Script Nativo</h4>
                  <p className="text-xs text-slate-400">
                    Gera a ISO diretamente no seu disco na pasta <code>dist-iso/</code> em ~5 minutos.
                  </p>
                  <div className="p-2.5 rounded-lg bg-black/60 font-mono text-[11px] text-amber-300 space-y-1">
                    <div>chmod +x iso-builder/build-iso.sh</div>
                    <div>sudo ./iso-builder/build-iso.sh</div>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('script')}
                  className="w-full py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition cursor-pointer"
                >
                  Ver Script Bash Completo →
                </button>
              </div>

              {/* Opção 3: Docker */}
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-cyan-500/30 hover:border-cyan-500/60 transition space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      Windows / macOS
                    </span>
                    <Server className="w-4 h-4 text-cyan-400" />
                  </div>
                  <h4 className="text-sm font-bold text-white">Compilar com Docker</h4>
                  <p className="text-xs text-slate-400">
                    Isolado em container, sem precisar de Linux nativo instalado.
                  </p>
                  <div className="p-2.5 rounded-lg bg-black/60 font-mono text-[11px] text-cyan-300 space-y-1">
                    <div>docker build -t inove-iso iso-builder/</div>
                    <div>docker run --privileged -v $(pwd)/dist-iso:/output inove-iso</div>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('docker')}
                  className="w-full py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition cursor-pointer"
                >
                  Ver Comandos Docker →
                </button>
              </div>
            </div>

            {/* Downloads dos arquivos do projeto */}
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                <FolderDown className="w-4 h-4 text-amber-400" />
                <span>Baixar Scripts & Manual de Instalação para o seu PC</span>
              </h4>
              <p className="text-xs text-slate-400">
                Você pode baixar os arquivos de compilação individualmente abaixo ou exportar todo o projeto em ZIP pelo menu do editor (Settings &gt; Export to ZIP):
              </p>
              <div className="flex flex-wrap gap-3 pt-1">
                <button
                  onClick={() => downloadScriptFile('build-iso.sh', bashScriptSnippet)}
                  className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-bold text-white transition cursor-pointer active:scale-95"
                >
                  <Download className="w-3.5 h-3.5 text-red-400" />
                  <span>Baixar build-iso.sh</span>
                </button>
                <button
                  onClick={() => downloadScriptFile('Dockerfile', dockerSnippet)}
                  className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-bold text-white transition cursor-pointer active:scale-95"
                >
                  <Download className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Baixar Dockerfile</span>
                </button>
                <button
                  onClick={() => setActiveTab('guide')}
                  className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-bold text-white transition cursor-pointer active:scale-95"
                >
                  <HardDrive className="w-3.5 h-3.5 text-amber-400" />
                  <span>Ver Tutorial Rufus & VirtualBox</span>
                </button>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'script' && (
          <div className="space-y-4 max-w-5xl mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Script Bash Automatizado (`iso-builder/build-iso.sh`)</h3>
                <p className="text-xs text-slate-400">
                  Executável em qualquer máquina com Ubuntu ou Debian com 1 comando.
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleCopy(bashScriptSnippet, 'script-run')}
                  className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-slate-200 transition cursor-pointer"
                >
                  {copiedSection === 'script-run' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSection === 'script-run' ? 'Copiado!' : 'Copiar Comandos'}</span>
                </button>
              </div>
            </div>

            <pre className="p-4 rounded-xl bg-black/80 text-emerald-400 font-mono text-xs overflow-x-auto border border-white/10 leading-relaxed">
              {bashScriptSnippet}
            </pre>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-white/10 text-xs text-slate-300 space-y-2">
              <h4 className="font-bold text-white flex items-center space-x-1.5">
                <FileCode className="w-4 h-4 text-red-400" />
                <span>O que o script faz exatamente:</span>
              </h4>
              <ul className="list-disc list-inside space-y-1 text-slate-400">
                <li>Instala ferramentas do Debian: `debootstrap`, `squashfs-tools`, `xorriso`, `grub-mkrescue`.</li>
                <li>Instala suporte completo a **Flatpak**, **Flathub**, **gnome-software-plugin-flatpak** e `x11-utils`.</li>
                <li>Monta um sistema base do Debian 12 Bookworm x86_64 totalmente limpo.</li>
                <li>Instala o compositor Wayland **Cage** e o navegador Chromium em modo quiosque (`--kiosk`).</li>
                <li>Cria o usuário `inove` com auto-login na TTY1 e permissões de aceleração gráfica por GPU.</li>
                <li>Configura o serviço systemd de controle Web Desktop com endpoints `/api/install`, `/api/launch` e `/api/terminal/exec`.</li>
                <li>Gera o arquivo `inovecloud-os-debian12-amd64.iso` pronto para gravação em pendrive.</li>
              </ul>
            </div>
          </div>
        )}

        {/* DOCKER TAB */}
        {activeTab === 'docker' && (
          <div className="space-y-4 max-w-5xl mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Compilação 100% Isolada com Docker</h3>
                <p className="text-xs text-slate-400">
                  Ideal para rodar no Windows (Docker Desktop), macOS ou qualquer Linux sem precisar de root no host.
                </p>
              </div>
              <button
                onClick={() => handleCopy(dockerSnippet, 'docker')}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-slate-200 transition cursor-pointer"
              >
                {copiedSection === 'docker' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSection === 'docker' ? 'Copiado!' : 'Copiar Comandos'}</span>
              </button>
            </div>

            <pre className="p-4 rounded-xl bg-black/80 text-cyan-400 font-mono text-xs overflow-x-auto border border-white/10 leading-relaxed">
              {dockerSnippet}
            </pre>
          </div>
        )}

        {/* GITHUB TAB */}
        {activeTab === 'github' && (
          <div className="space-y-4 max-w-5xl mx-auto">
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <div className="flex items-center space-x-2 text-indigo-400">
                <Github className="w-5 h-5" />
                <h3 className="text-sm font-bold text-white">GitHub Actions Integrado (`.github/workflows/build-iso.yml`)</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Você não precisa gastar poder de processamento do seu computador. O workflow já está pronto na pasta `.github/workflows/build-iso.yml`.
              </p>
              <div className="bg-black/60 p-3 rounded-xl border border-white/5 font-mono text-xs text-slate-400">
                <span>1. Faça o commit e push para o seu GitHub: </span>
                <span className="text-emerald-400">git push origin main</span>
                <br />
                <span>2. O GitHub compilará a ISO gratuitamente nos servidores da nuvem.</span>
                <br />
                <span>3. Baixe a ISO gerada na aba </span>
                <span className="text-cyan-400">Actions &gt; Artifacts &gt; inovecloud-os-debian12-amd64</span>.
              </div>
            </div>
          </div>
        )}

        {/* GUIDE TAB */}
        {activeTab === 'guide' && (
          <div className="space-y-4 max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <HardDrive className="w-4 h-4 text-red-400" />
                  <span>Gravação no Pendrive (Windows & Linux)</span>
                </h3>
                <div className="text-xs text-slate-300 space-y-2">
                  <p><strong>Windows:</strong> Utilize o <strong>Rufus</strong> ou <strong>BalenaEtcher</strong>:</p>
                  <ol className="list-decimal list-inside space-y-1 text-slate-400">
                    <li>Conecte um pendrive de pelo menos 2 GB.</li>
                    <li>Selecione o arquivo `inovecloud-os-debian12-amd64.iso`.</li>
                    <li>Escolha o modo de gravação recomendado e clique em Iniciar.</li>
                  </ol>
                  <p className="pt-2"><strong>Linux:</strong> Use o utilitário nativo `dd`:</p>
                  <div className="p-2 rounded bg-black/60 font-mono text-[11px] text-amber-300">
                    sudo dd if=inovecloud-os-debian12-amd64.iso of=/dev/sdX bs=4M status=progress
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <Server className="w-4 h-4 text-cyan-400" />
                  <span>Configuração para VirtualBox / Proxmox</span>
                </h3>
                <div className="text-xs text-slate-300 space-y-2">
                  <ul className="list-disc list-inside space-y-1 text-slate-400">
                    <li><strong>Tipo de SO:</strong> Linux &gt; Debian (64-bit)</li>
                    <li><strong>Memória RAM:</strong> 2048 MB (2 GB) ou superior</li>
                    <li><strong>Processador:</strong> 2 vCPUs</li>
                    <li><strong>Aceleração Gráfica:</strong> Habilite aceleração 3D (VMSVGA)</li>
                    <li><strong>Disco Rígido:</strong> Não é obrigatório (o SO roda 100% na memória RAM em modo Live)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
