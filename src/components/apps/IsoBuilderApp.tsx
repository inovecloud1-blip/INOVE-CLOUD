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
  Sparkles,
  Palette,
  Image as ImageIcon
} from 'lucide-react';

interface IsoBuilderAppProps {
  onPreviewBootVideo?: () => void;
}

export const IsoBuilderApp: React.FC<IsoBuilderAppProps> = ({ onPreviewBootVideo }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'bootvideo' | 'glass-theme' | 'download' | 'script' | 'docker' | 'github' | 'guide'>('overview');
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
      '⚡ Iniciando ambiente de compilação InoveCloud OS (Debian 13 Trixie + GNOME Glass)...',
      '📦 [1/7] Instalando debootstrap, squashfs-tools, xorriso, grub-efi, mtools...',
    ]);

    const steps = [
      { progress: 18, log: '🌐 [2/7] Executando debootstrap Debian 13 Trixie minimal (amd64)...' },
      { progress: 35, log: '⚙️ [3/7] Configurando chroot, repositórios trixie/trixie-security e apt...' },
      { progress: 55, log: '🐧 [4/7] Instalando Kernel 6.12, GNOME Shell 46+, GDM3, PipeWire, Mesa 3D & Flatpak...' },
      { progress: 75, log: '✨ [5/7] Injetando Tema Liquid Glass (InoveCloud-Glass), DConf, Wallpapers 8K/4K e Node.js Suite...' },
      { progress: 90, log: '🗜️ [6/7] Comprimindo SquashFS com algoritmo XZ (-comp xz)...' },
      { progress: 100, log: '💿 [7/7] Imagem híbrida UEFI/BIOS gerada: inovecloud-os-debian13-gnome-amd64.iso (1.4 GB) - Concluído!' },
    ];

    steps.forEach((step, idx) => {
      setTimeout(() => {
        setBuildProgress(step.progress);
        setBuildLogs((prev) => [...prev, step.log]);
        if (idx === steps.length - 1) {
          setIsSimulatingBuild(false);
        }
      }, (idx + 1) * 850);
    });
  };

  const bashScriptSnippet = `#!/usr/bin/env bash
# InoveCloud OS - Automated Debian 13 (Trixie) GNOME Glass ISO Builder
set -euo pipefail

# 1. Compilar aplicação Web e Assets
npm run build

# 2. Executar script oficial com privilégios de root
chmod +x iso-builder/build-iso.sh
sudo ./iso-builder/build-iso.sh

# A imagem final será gerada em:
# dist-iso/inovecloud-os-debian13-gnome-amd64.iso
# dist-iso/inovecloud-os-debian13-gnome-amd64.iso.sha256`;

  const dockerSnippet = `# Compilar a ISO Debian 13 GNOME Glass usando Docker
docker build -t inovecloud-iso-builder -f iso-builder/Dockerfile iso-builder/

# Executar o container para compilar e salvar o .iso no seu disco
mkdir -p dist-iso
docker run --privileged --rm -v $(pwd)/dist-iso:/output inovecloud-iso-builder`;

  const githubWorkflowSnippet = `name: Build InoveCloud OS 2026 - Debian 13 GNOME Glass ISO

on:
  push:
    branches: [ "main" ]
  workflow_dispatch:

jobs:
  build-iso:
    name: Compilar Debian 13 GNOME Glass Live ISO
    runs-on: ubuntu-latest
    steps:
      - name: Clonar Repositório
        uses: actions/checkout@v4

      - name: Configurar Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Compilar Aplicação Web
        run: |
          npm ci || npm install
          npm run build

      - name: Instalar Ferramentas ISO
        run: |
          sudo apt-get update
          sudo apt-get install -y --no-install-recommends \\
            debootstrap debian-archive-keyring squashfs-tools xorriso \\
            grub-pc-bin grub-efi-amd64-bin mtools dosfstools

      - name: Compilar ISO Debian 13 GNOME Glass
        run: |
          chmod +x iso-builder/build-iso.sh
          sudo ./iso-builder/build-iso.sh

      - name: Fazer Upload do Artefato da ISO (.iso & .sha256)
        uses: actions/upload-artifact@v4
        with:
          name: inovecloud-os-debian13-gnome-amd64
          path: dist-iso/*.iso*
          retention-days: 30`;

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
      <div className="p-5 border-b border-white/10 bg-gradient-to-r from-slate-900 via-red-950/30 to-slate-900 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-600 via-rose-600 to-amber-600 flex items-center justify-center text-white shadow-xl shadow-red-500/20">
            <Disc className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-bold text-white tracking-tight">
                Gerador de ISO Debian 13 (Trixie) GNOME Glass
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/30">
                Debian 13 Trixie
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                GNOME 46+ Liquid Glass
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Ambiente desktop completo com efeitos de vidro fosco (Glassmorphism), dock flutuante, wallpapers e ícones integrados.
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
            <span>Baixar ISO no GitHub</span>
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
          { id: 'glass-theme', label: '✨ Tema Liquid Glass & GNOME', icon: Palette },
          { id: 'bootvideo', label: '🎬 Vídeo de Inicialização', icon: Video },
          { id: 'download', label: 'Cadê a ISO? / Como Baixar', icon: Download },
          { id: 'github', label: 'GitHub Actions (Nuvem CI/CD)', icon: Github },
          { id: 'script', label: 'Script Bash (build-iso.sh)', icon: Terminal },
          { id: 'docker', label: 'Compilar via Docker', icon: Server },
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
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6 max-w-5xl mx-auto">
            {/* Quick Alert: Debian 13 GNOME Glass is Ready */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-red-500/10 via-purple-500/10 to-indigo-500/10 border border-red-500/30 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-red-500/20 text-red-300 flex items-center justify-center font-bold">
                  💎
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Debian 13 (Trixie) + GNOME Liquid Glass</h4>
                  <p className="text-xs text-slate-300">
                    O sistema operacional é compilado com a base moderna do Debian 13, interface GNOME 46+, tema de vidro translúcido, wallpapers 8K/4K e automação pronta no GitHub Actions!
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('github')}
                className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition cursor-pointer shadow"
              >
                Ver GitHub Actions →
              </button>
            </div>

            {/* Architecture Stack Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-red-500/40 transition">
                <div className="flex items-center space-x-2 text-red-400 mb-2">
                  <Disc className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase">1. Base Linux</span>
                </div>
                <h4 className="text-sm font-bold text-white">Debian 13 (Trixie)</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Kernel 6.12+ LTS x86_64, drivers Mesa 24+ (OpenGL 4.6 / Vulkan 1.3) e firmware non-free.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/40 transition">
                <div className="flex items-center space-x-2 text-purple-400 mb-2">
                  <Palette className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase">2. Desktop & Glass</span>
                </div>
                <h4 className="text-sm font-bold text-white">GNOME 46+ Liquid Glass</h4>
                <p className="text-xs text-slate-400 mt-1">
                  GDM3 com auto-login, Wayland Mutter, Dash-to-Dock translúcido, blur e acentos carmesim.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-500/40 transition">
                <div className="flex items-center space-x-2 text-amber-400 mb-2">
                  <Server className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase">3. Ecossistema</span>
                </div>
                <h4 className="text-sm font-bold text-white">Flatpak + Node.js API</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Acesso à loja Flathub, pacotes APT nativos e serviço local InoveCloud Web Suite.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-500/40 transition">
                <div className="flex items-center space-x-2 text-emerald-400 mb-2">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase">4. Boot Híbrido</span>
                </div>
                <h4 className="text-sm font-bold text-white">UEFI + BIOS Legacy</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Compatível com computadores modernos (UEFI/Secure Boot) e PCs clássicos.
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
                    Acompanhe o processo de criação da imagem ISO Debian 13 GNOME Glass.
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
                  className="h-full bg-gradient-to-r from-red-500 via-purple-500 to-emerald-500 transition-all duration-300"
                  style={{ width: `${buildProgress}%` }}
                />
              </div>

              {/* Terminal Logs Output */}
              <div className="h-44 bg-black/80 rounded-xl p-3 font-mono text-xs text-slate-300 overflow-y-auto space-y-1 border border-white/5">
                {buildLogs.length === 0 ? (
                  <div className="text-slate-500 italic">
                    Clique em "Simular Build" acima para ver o processo de empacotamento do Debian 13 Trixie + GNOME Glass...
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
                onClick={() => setActiveTab('glass-theme')}
                className="p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition text-left cursor-pointer flex items-center justify-between group"
              >
                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-purple-400 transition">
                    Tema Liquid Glass & GNOME
                  </h4>
                  <p className="text-[11px] text-slate-400">Transparências e Wallpapers</p>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-purple-400 transition" />
              </button>

              <button
                onClick={() => setActiveTab('github')}
                className="p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition text-left cursor-pointer flex items-center justify-between group"
              >
                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-indigo-400 transition">
                    GitHub Actions CI/CD
                  </h4>
                  <p className="text-[11px] text-slate-400">Compilação 100% na Nuvem</p>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition" />
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

        {/* GLASS THEME TAB */}
        {activeTab === 'glass-theme' && (
          <div className="space-y-6 max-w-5xl mx-auto">
            <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-purple-950/40 to-slate-900 border border-purple-500/30 space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-300 flex items-center justify-center font-bold text-lg">
                  ✨
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Design System: InoveCloud Liquid Glass (GNOME 46+)</h3>
                  <p className="text-xs text-slate-300">
                    O sistema operacional é integrado com um tema de vidro líquido, desfoque de fundo (backdrop-filter) e harmonia visual idêntica à interface Web.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                  <span className="text-xs font-bold text-red-400">Painel Superior Glass</span>
                  <p className="text-xs text-slate-300">
                    Barra superior translúcida com fundo <code>rgba(14, 15, 22, 0.65)</code>, borda sutil iluminada e botões com efeito hover em carmesim.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                  <span className="text-xs font-bold text-purple-400">Dock Flutuante com Reflexo</span>
                  <p className="text-xs text-slate-300">
                    Dock estilo macOS / InoveCloud na parte inferior, com cantos arredondados de 24px, transparência a 72% e ícones dinâmicos de 52px.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                  <span className="text-xs font-bold text-cyan-400">Janelas & Menus com Blur</span>
                  <p className="text-xs text-slate-300">
                    Modais, menus de contexto e painel de controle com efeito de vidro fosco, sombras profundas e tipografia Plus Jakarta Sans.
                  </p>
                </div>
              </div>
            </div>

            {/* Wallpapers Showcase */}
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                    <ImageIcon className="w-4 h-4 text-amber-400" />
                    <span>Papéis de Parede Integrados ao GNOME na ISO</span>
                  </h4>
                  <p className="text-xs text-slate-400">
                    Todos os wallpapers 8K/4K estão salvos em <code>/usr/share/backgrounds/inovecloud/</code> com registro no GNOME Settings.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                {[
                  { name: 'Cyber Red', file: 'cyber-red.jpg', desc: 'Padrão Oficial Glass' },
                  { name: 'Garden Prism', file: 'garden-prism.jpg', desc: 'Holográfico Original' },
                  { name: 'Deep Nebula', file: 'deep-nebula.jpg', desc: '8K HDR Cosmos' },
                  { name: 'Aurora Glacial', file: 'aurora-mountain.jpg', desc: '4K Ultra Paisagem' },
                  { name: 'Obsidian Waves', file: 'abstract-waves.jpg', desc: 'Fluido 3D Minimal' },
                  { name: 'Synth Outrun', file: 'synth-city.jpg', desc: 'Retrowave 80s' },
                ].map((wp, idx) => (
                  <div key={idx} className="group relative rounded-xl overflow-hidden border border-white/10 bg-slate-900/60 p-2 space-y-2">
                    <div className="h-20 rounded-lg overflow-hidden bg-slate-800 relative">
                      <img
                        src={`/wallpapers/${wp.file}`}
                        alt={wp.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-white truncate">{wp.name}</div>
                      <div className="text-[9px] text-slate-400 truncate">{wp.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* GITHUB ACTIONS TAB */}
        {activeTab === 'github' && (
          <div className="space-y-4 max-w-5xl mx-auto">
            <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-950/40 via-slate-900 to-indigo-950/40 border border-purple-500/30 space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center font-bold text-lg">
                  <Github className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Compilação Automática no GitHub Actions</h3>
                  <p className="text-xs text-slate-300">
                    O arquivo de workflow <code>.github/workflows/build-iso.yml</code> compila a ISO completa de <strong>Debian 13 GNOME Glass</strong> nos servidores da nuvem do GitHub.
                  </p>
                </div>
              </div>
              <div className="bg-black/60 p-3.5 rounded-xl border border-white/5 font-mono text-xs text-slate-300 space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-purple-400 font-bold">1. Envie para o GitHub:</span>
                  <code className="text-emerald-400 bg-white/5 px-2 py-0.5 rounded">git push origin main</code>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-purple-400 font-bold">2. Acesse a aba:</span>
                  <span>Repositório no GitHub &gt; <strong>Actions</strong> &gt; <strong>Build InoveCloud OS 2026 - Debian 13 GNOME Glass ISO</strong></span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-purple-400 font-bold">3. Baixe a ISO:</span>
                  <span>Na seção <strong>Artifacts</strong>, clique em <strong>inovecloud-os-debian13-gnome-amd64</strong>.</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white">Arquivo de Workflow (`.github/workflows/build-iso.yml`)</h4>
                <p className="text-xs text-slate-400">Configuração completa para compilar o Debian 13 com GNOME e temas:</p>
              </div>
              <button
                onClick={() => handleCopy(githubWorkflowSnippet, 'workflow')}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-slate-200 transition cursor-pointer"
              >
                {copiedSection === 'workflow' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSection === 'workflow' ? 'Copiado!' : 'Copiar YAML'}</span>
              </button>
            </div>

            <pre className="p-4 rounded-xl bg-black/80 text-purple-300 font-mono text-xs overflow-x-auto border border-white/10 leading-relaxed max-h-96">
              {githubWorkflowSnippet}
            </pre>
          </div>
        )}

        {/* BOOT VIDEO TAB */}
        {activeTab === 'bootvideo' && (
          <div className="space-y-6 max-w-5xl mx-auto">
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
                    Esta sequência de inicialização inicia logo ao ligar o computador na ISO do Debian 13, integrando a identidade visual: tipografia sólida orgânica <strong>SEU SISTEMA</strong>, azul royal e ciano neon <strong>ELEGANTE PODEROSO</strong>, finalizando com a marca <strong>INOVECLOUD OS</strong> e transição fluida para o desktop GNOME Glass.
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
          </div>
        )}

        {/* DOWNLOAD / CADÊ A ISO TAB */}
        {activeTab === 'download' && (
          <div className="space-y-6 max-w-5xl mx-auto">
            <div className="p-5 rounded-2xl bg-gradient-to-r from-red-950/40 via-slate-900 to-purple-950/30 border border-red-500/30 space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-red-600/20 text-red-400 flex items-center justify-center font-bold text-lg">
                  💿
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Como Obter o Arquivo .ISO do InoveCloud OS</h3>
                  <p className="text-xs text-slate-300">
                    O arquivo <code>inovecloud-os-debian13-gnome-amd64.iso</code> inclui o Debian 13 Trixie, GNOME 46+, tema Liquid Glass, wallpapers 8K/4K e suporte a Flatpak.
                  </p>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Por ser uma imagem de instalação Linux de ~1.4 GB, ela é compilada diretamente pelo GitHub Actions na nuvem (sem ocupar seu computador) ou gerada localmente em seu Linux via <code>iso-builder/build-iso.sh</code>.
              </p>
            </div>

            {/* 3 Opções de Obter a ISO */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-purple-500/30 hover:border-purple-500/60 transition space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      Recomendado (Nuvem)
                    </span>
                    <Github className="w-4 h-4 text-purple-400" />
                  </div>
                  <h4 className="text-sm font-bold text-white">Compilar no GitHub Actions</h4>
                  <p className="text-xs text-slate-400">
                    O workflow compila nos servidores do GitHub e disponibiliza o download direto da ISO.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('github')}
                  className="w-full py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition cursor-pointer"
                >
                  Ver Instruções do GitHub →
                </button>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/80 border border-red-500/30 hover:border-red-500/60 transition space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/30">
                      Terminal Local (Linux / WSL)
                    </span>
                    <Terminal className="w-4 h-4 text-red-400" />
                  </div>
                  <h4 className="text-sm font-bold text-white">Executar Script Bash</h4>
                  <p className="text-xs text-slate-400">
                    Gera a ISO na pasta <code>dist-iso/</code> do seu computador.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('script')}
                  className="w-full py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition cursor-pointer"
                >
                  Ver Script Bash →
                </button>
              </div>

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
                    Isolado em container, sem poluir seu sistema host.
                  </p>
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
                <span>Baixar Scripts & Arquivos de Configuração</span>
              </h4>
              <p className="text-xs text-slate-400">
                Baixe os arquivos de compilação ou exporte todo o projeto em ZIP pelo menu do editor (Settings &gt; Export to ZIP):
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
                  onClick={() => downloadScriptFile('build-iso.yml', githubWorkflowSnippet)}
                  className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-bold text-white transition cursor-pointer active:scale-95"
                >
                  <Download className="w-3.5 h-3.5 text-purple-400" />
                  <span>Baixar build-iso.yml (GitHub Actions)</span>
                </button>
                <button
                  onClick={() => downloadScriptFile('Dockerfile', dockerSnippet)}
                  className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-bold text-white transition cursor-pointer active:scale-95"
                >
                  <Download className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Baixar Dockerfile</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SCRIPT TAB */}
        {activeTab === 'script' && (
          <div className="space-y-4 max-w-5xl mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Script Bash Automatizado (`iso-builder/build-iso.sh`)</h3>
                <p className="text-xs text-slate-400">
                  Compilação do Debian 13 Trixie, GNOME 46+, Liquid Glass Theme e Boot UEFI.
                </p>
              </div>
              <button
                onClick={() => handleCopy(bashScriptSnippet, 'script-run')}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-slate-200 transition cursor-pointer"
              >
                {copiedSection === 'script-run' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSection === 'script-run' ? 'Copiado!' : 'Copiar Comandos'}</span>
              </button>
            </div>

            <pre className="p-4 rounded-xl bg-black/80 text-emerald-400 font-mono text-xs overflow-x-auto border border-white/10 leading-relaxed">
              {bashScriptSnippet}
            </pre>
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
                    <li>Conecte um pendrive de pelo menos 4 GB.</li>
                    <li>Selecione o arquivo `inovecloud-os-debian13-gnome-amd64.iso`.</li>
                    <li>Escolha o modo de gravação recomendado e clique em Iniciar.</li>
                  </ol>
                  <p className="pt-2"><strong>Linux:</strong> Use o utilitário nativo `dd`:</p>
                  <div className="p-2 rounded bg-black/60 font-mono text-[11px] text-amber-300">
                    sudo dd if=inovecloud-os-debian13-gnome-amd64.iso of=/dev/sdX bs=4M status=progress
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
                    <li><strong>Memória RAM:</strong> 2048 MB a 4096 MB (2 a 4 GB recomendado para o GNOME)</li>
                    <li><strong>Processador:</strong> 2 vCPUs ou mais</li>
                    <li><strong>Aceleração Gráfica:</strong> Habilite aceleração 3D (VMSVGA) com 128 MB VRAM</li>
                    <li><strong>Disco Rígido:</strong> Opcional (roda 100% na memória RAM em modo Live)</li>
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
