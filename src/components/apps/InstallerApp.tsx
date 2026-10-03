import React, { useState, useEffect, useRef } from 'react';
import {
  Terminal as TerminalIcon,
  Play,
  Pause,
  RotateCcw,
  Download,
  Copy,
  Check,
  HardDrive,
  Cpu,
  Package,
  Layers,
  Sparkles,
  ShieldCheck,
  Disc,
  Settings,
  Search,
  CheckCircle2,
  AlertTriangle,
  MonitorPlay,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

interface InstallerLogLine {
  id: string;
  timestamp: string;
  tag?: 'OK' | 'INFO' | 'STEP' | 'APT' | 'DEBOOTSTRAP' | 'KERNEL' | 'WARN' | 'ERROR' | 'PROMPT';
  text: string;
  highlight?: boolean;
}

interface InstallerAppProps {
  onInstallationFinished?: () => void;
  standaloneInModal?: boolean;
}

const DEBOOTSTRAP_STEPS = [
  { progress: 2, tag: 'STEP', text: 'fdisk -l /dev/nvme0n1 # Detectando partições e tabela GPT...' },
  { progress: 4, tag: 'OK', text: 'Dispositivo selecionado: /dev/nvme0n1 (Samsung SSD 990 PRO 1TB NVMe PCIe 4.0)' },
  { progress: 6, tag: 'STEP', text: 'parted -s /dev/nvme0n1 mklabel gpt mkpart ESP fat32 1MiB 513MiB set 1 esp on' },
  { progress: 9, tag: 'OK', text: 'mkfs.vfat -F32 -n "EFI_INOVE" /dev/nvme0n1p1 [Partição EFI criada: 512 MB]' },
  { progress: 12, tag: 'STEP', text: 'mkfs.ext4 -F -L "INOVE_ROOTFS" -O fast_commit,dir_index /dev/nvme0n1p2' },
  { progress: 15, tag: 'OK', text: 'Sistema de arquivos Ext4 criado em /dev/nvme0n1p2 (UUID: a4c89012-7fba-45d2-b0e1-88f9104c99e1)' },
  { progress: 18, tag: 'STEP', text: 'mount /dev/nvme0n1p2 /mnt && mkdir -p /mnt/boot/efi && mount /dev/nvme0n1p1 /mnt/boot/efi' },
  { progress: 21, tag: 'OK', text: 'Partições montadas com sucesso em /mnt e /mnt/boot/efi' },

  // DEBOOTSTRAP PHASE
  { progress: 24, tag: 'DEBOOTSTRAP', text: 'debootstrap --arch=amd64 --variant=minbase trixie /mnt http://deb.debian.org/debian' },
  { progress: 26, tag: 'INFO', text: 'I: Retrieving InRelease ... [152 kB / 152 kB 100%]' },
  { progress: 28, tag: 'INFO', text: 'I: Checking Release signature with debian-archive-keyring (Trixie GPG Valid)...' },
  { progress: 30, tag: 'INFO', text: 'I: Valid Release signature (SHA256: 8f42b10a9c72e...) verified.' },
  { progress: 32, tag: 'DEBOOTSTRAP', text: 'I: Retrieving Packages.xz ... [9.8 MB / 9.8 MB 1.4 MB/s]' },
  { progress: 35, tag: 'DEBOOTSTRAP', text: 'I: Validating Base System Packages (libc6, dpkg, coreutils, bash, tar, gzip, sed, grep)...' },
  { progress: 38, tag: 'DEBOOTSTRAP', text: 'I: Unpacking libc6:amd64 (2.39-4)...' },
  { progress: 40, tag: 'DEBOOTSTRAP', text: 'I: Unpacking dpkg:amd64 (1.22.6)...' },
  { progress: 42, tag: 'DEBOOTSTRAP', text: 'I: Unpacking systemd:amd64 (256.4-2)...' },
  { progress: 45, tag: 'DEBOOTSTRAP', text: 'I: Configuring base system in /mnt (debootstrap completed successfully).' },

  // APT-GET REPOSITORIES & PACKAGES
  { progress: 48, tag: 'STEP', text: 'chroot /mnt /bin/bash -c "cat <<EOF > /etc/apt/sources.list"' },
  { progress: 50, tag: 'INFO', text: 'deb http://deb.debian.org/debian trixie main contrib non-free non-free-firmware' },
  { progress: 52, tag: 'INFO', text: 'deb http://security.debian.org/debian-security trixie-security main contrib non-free' },
  { progress: 54, tag: 'APT', text: 'chroot /mnt apt-get update' },
  { progress: 56, tag: 'INFO', text: 'Hit:1 http://deb.debian.org/debian trixie InRelease [152 kB]' },
  { progress: 58, tag: 'INFO', text: 'Reading package lists... Done (Building dependency tree... Done)' },
  { progress: 60, tag: 'APT', text: 'chroot /mnt apt-get install -y --no-install-recommends linux-image-6.12-amd64 linux-headers-6.12-amd64' },
  { progress: 63, tag: 'KERNEL', text: 'Setting up linux-image-6.12-amd64 (6.12.0-trixie)... Generating /boot/vmlinuz-6.12' },
  { progress: 66, tag: 'KERNEL', text: 'update-initramfs: Generating /boot/initrd.img-6.12 (ZSTD compression, DRM/KMS drivers included)' },
  
  // DESKTOP ENVIRONMENT & LIQUID GLASS
  { progress: 70, tag: 'APT', text: 'chroot /mnt apt-get install -y gnome-shell mutter gdm3 pipewire weston flatpak network-manager' },
  { progress: 73, tag: 'INFO', text: 'Unpacking gnome-shell (46.4-1) ... [380 packages configured]' },
  { progress: 76, tag: 'STEP', text: 'Instalando Tema InoveCloud Liquid Glass (/usr/share/themes/InoveCloud-Glass)...' },
  { progress: 79, tag: 'OK', text: 'DConf Profile: Liquid Glass Theme, Dock Transparente, Wallpapers 8K ativados.' },
  { progress: 82, tag: 'STEP', text: 'flatpak remote-add --if-not-exists flathub https://dl.flathub.org/repo/flathub.flatpakrepo' },
  { progress: 85, tag: 'OK', text: 'Repositório Flathub Oficial registrado com sucesso.' },

  // USERS & GRUB
  { progress: 88, tag: 'STEP', text: 'useradd -m -s /bin/bash -G sudo,audio,video,render,dialout inove' },
  { progress: 91, tag: 'OK', text: 'Usuário padrão "inove" criado com permissões de administrador (sudo).' },
  { progress: 94, tag: 'STEP', text: 'grub-install --target=x86_64-efi --efi-directory=/boot/efi --bootloader-id=InoveCloudOS --recheck' },
  { progress: 96, tag: 'OK', text: 'Installation finished. No error reported. (GRUB EFI Boot Entry: 0001 InoveCloudOS)' },
  { progress: 98, tag: 'STEP', text: 'update-grub # Gerando /boot/grub/grub.cfg com tema BIOS azul...' },
  { progress: 100, tag: 'OK', text: '🎉 INSTALAÇÃO DO INOVECLOUD OS 2026 CONCLUÍDA COM SUCESSO NO DISCO!' },
];

export const InstallerApp: React.FC<InstallerAppProps> = ({
  onInstallationFinished,
  standaloneInModal = false,
}) => {
  const [logs, setLogs] = useState<InstallerLogLine[]>([
    {
      id: 'init-1',
      timestamp: '00:00:01',
      tag: 'INFO',
      text: 'InoveCloud OS 2026 Live Installer Shell v3.4 (UEFI x86_64)',
      highlight: true,
    },
    {
      id: 'init-2',
      timestamp: '00:00:02',
      tag: 'OK',
      text: 'CPU: AMD/Intel x86_64 64-bit Architecture detectada (Modo Live Ativo)',
    },
    {
      id: 'init-3',
      timestamp: '00:00:02',
      tag: 'INFO',
      text: 'Selecione o disco de destino e clique em "Iniciar Instalação Automática".',
    },
  ]);

  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [displayProgress, setDisplayProgress] = useState<number>(0);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1);
  const [selectedDisk, setSelectedDisk] = useState<string>('/dev/nvme0n1');
  const [selectedFilesystem, setSelectedFilesystem] = useState<string>('ext4');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedLogs, setCopiedLogs] = useState<boolean>(false);
  const [isComplete, setIsComplete] = useState<boolean>(false);

  const terminalEndRef = useRef<HTMLDivElement>(null);
  const autoScrollRef = useRef<boolean>(true);
  const progressAnimRef = useRef<number | null>(null);

  // Efeito para rolagem automática para a última linha
  useEffect(() => {
    if (autoScrollRef.current && terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  // Animação de interpolação ultra-suave (Lerp) para a barra de progresso com glow
  useEffect(() => {
    let animationFrameId: number;

    const animateProgress = () => {
      setDisplayProgress((prev) => {
        const diff = progress - prev;
        if (Math.abs(diff) < 0.15) {
          return progress;
        }
        // Fator de suavização (lerp suave)
        const step = diff * 0.12;
        return Number((prev + step).toFixed(2));
      });

      animationFrameId = requestAnimationFrame(animateProgress);
    };

    animationFrameId = requestAnimationFrame(animateProgress);
    return () => cancelAnimationFrame(animationFrameId);
  }, [progress]);

  // Motor de execução de debootstrap / apt-get install em tempo real
  useEffect(() => {
    if (!isRunning || isPaused) return;

    if (currentStepIndex >= DEBOOTSTRAP_STEPS.length) {
      setIsRunning(false);
      setIsComplete(true);
      setProgress(100);
      if (onInstallationFinished) {
        onInstallationFinished();
      }
      return;
    }

    const step = DEBOOTSTRAP_STEPS[currentStepIndex];
    const delay = Math.max(70, Math.floor(420 / speedMultiplier));

    const timer = setTimeout(() => {
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];

      setLogs((prev) => [
        ...prev,
        {
          id: `log-${Date.now()}-${currentStepIndex}`,
          timestamp: timeStr,
          tag: step.tag as any,
          text: step.text,
          highlight: step.progress === 100,
        },
      ]);

      setProgress(step.progress);
      setCurrentStepIndex((prev) => prev + 1);
    }, delay);

    return () => clearTimeout(timer);
  }, [isRunning, isPaused, currentStepIndex, speedMultiplier, onInstallationFinished]);

  const handleStartInstallation = () => {
    if (isRunning) return;
    setIsComplete(false);
    setProgress(0);
    setDisplayProgress(0);
    setCurrentStepIndex(0);
    setLogs([
      {
        id: `start-${Date.now()}`,
        timestamp: new Date().toTimeString().split(' ')[0],
        tag: 'STEP',
        text: `Iniciando particionamento e instalação em ${selectedDisk} (Formato: ${selectedFilesystem})...`,
        highlight: true,
      },
    ]);
    setIsRunning(true);
    setIsPaused(false);
  };

  const handlePauseResume = () => {
    setIsPaused(!isPaused);
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsPaused(false);
    setProgress(0);
    setDisplayProgress(0);
    setCurrentStepIndex(0);
    setIsComplete(false);
    setLogs([
      {
        id: `reset-${Date.now()}`,
        timestamp: new Date().toTimeString().split(' ')[0],
        tag: 'INFO',
        text: 'Console reiniciado. Pronto para nova instalação.',
      },
    ]);
  };

  const handleCopyLogs = () => {
    const text = logs.map((l) => `[${l.timestamp}] [${l.tag || 'LOG'}] ${l.text}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopiedLogs(true);
    setTimeout(() => setCopiedLogs(false), 2000);
  };

  const handleDownloadLogFile = () => {
    const text = logs.map((l) => `[${l.timestamp}] [${l.tag || 'LOG'}] ${l.text}`).join('\n');
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `inovecloud-install-${new Date().toISOString().slice(0, 10)}.log`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const filteredLogs = logs.filter((log) => {
    if (!searchQuery) return true;
    return (
      log.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.tag && log.tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  return (
    <div
      id="inovecloud-installer-terminal-app"
      className="h-full flex flex-col bg-[#080d1a] text-slate-100 font-sans overflow-hidden select-none"
    >
      {/* Top Banner Toolbar */}
      <div className="p-4 border-b border-white/10 bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
            <TerminalIcon className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-white tracking-tight">
                Console de Instalação no Disco — InoveCloud OS
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                debootstrap & apt-get
              </span>
              {isRunning && (
                <span className="flex items-center space-x-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-500/20 text-green-300 border border-green-500/40 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                  <span>Instalando...</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              Terminal de instalação em tempo real: particionamento, debootstrap Debian 13, kernel 6.12 e ambiente gráfico GNOME Glass.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          {!isRunning && !isComplete && (
            <button
              onClick={handleStartInstallation}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-bold transition cursor-pointer shadow-lg shadow-emerald-500/25 active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Iniciar Instalação Automática</span>
            </button>
          )}

          {isRunning && (
            <button
              onClick={handlePauseResume}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold transition cursor-pointer"
            >
              {isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5" />}
              <span>{isPaused ? 'Continuar' : 'Pausar'}</span>
            </button>
          )}

          <button
            onClick={handleReset}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-medium transition cursor-pointer"
            title="Reiniciar console"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          <button
            onClick={handleCopyLogs}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-medium transition cursor-pointer"
            title="Copiar logs completos"
          >
            {copiedLogs ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedLogs ? 'Copiado!' : 'Copiar Logs'}</span>
          </button>

          <button
            onClick={handleDownloadLogFile}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-medium transition cursor-pointer"
            title="Baixar arquivo inovecloud-install.log"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Baixar .log</span>
          </button>
        </div>
      </div>

      {/* Settings Bar: Disk Selection & Speed */}
      <div className="px-4 py-2.5 bg-slate-900/80 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-4 flex-wrap gap-2">
          <div className="flex items-center space-x-1.5">
            <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400">Disco Destino:</span>
            <select
              value={selectedDisk}
              onChange={(e) => setSelectedDisk(e.target.value)}
              disabled={isRunning}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 focus:outline-none focus:border-cyan-400 disabled:opacity-50 font-mono"
            >
              <option value="/dev/nvme0n1">/dev/nvme0n1 — Samsung 990 PRO (1 TB NVMe)</option>
              <option value="/dev/sda">/dev/sda — VirtualBox VDI Disk (128 GB)</option>
              <option value="/dev/vda">/dev/vda — KVM VirtIO Block Disk (256 GB)</option>
              <option value="/dev/sdb">/dev/sdb — Kingston SSD SATA (480 GB)</option>
            </select>
          </div>

          <div className="flex items-center space-x-1.5">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-slate-400">Filesystem:</span>
            <select
              value={selectedFilesystem}
              onChange={(e) => setSelectedFilesystem(e.target.value)}
              disabled={isRunning}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 focus:outline-none focus:border-cyan-400 disabled:opacity-50 font-mono"
            >
              <option value="ext4">Ext4 (Padrão de Alta Performance)</option>
              <option value="btrfs">Btrfs (Snapshots & Subvolumes)</option>
              <option value="zfs">OpenZFS (Integridade & Compressão LZ4)</option>
              <option value="f2fs">F2FS (Otimizado para SSD Flash/NVMe)</option>
            </select>
          </div>
        </div>

        {/* Search & Speed */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1 text-slate-400">
            <span>Velocidade:</span>
            {[1, 2, 5].map((s) => (
              <button
                key={s}
                onClick={() => setSpeedMultiplier(s)}
                className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer transition ${
                  speedMultiplier === s
                    ? 'bg-cyan-500 text-slate-950 shadow'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="w-3 h-3 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filtrar logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg pl-7 pr-3 py-1 text-[11px] text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400 w-36 sm:w-44"
            />
          </div>
        </div>
      </div>

      {/* Dynamic Animated Progress Bar with Debootstrap/Apt-get Neon Glow */}
      {(() => {
        const stage = (() => {
          if (progress >= 100) {
            return {
              phase: 5,
              name: 'Instalação Concluída',
              badge: '100% Pronto',
              gradient: 'from-emerald-500 via-green-400 to-teal-300',
              glowColor: 'rgba(16, 185, 129, 0.9)',
              glowShadow: '0 0 24px rgba(16, 185, 129, 0.85), 0 0 45px rgba(52, 211, 153, 0.4)',
              pillClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
              icon: CheckCircle2,
              subtitle: 'Partições GPT, Debian 13 Base, Kernel 6.12 e GRUB gravados com sucesso!',
            };
          }
          if (progress >= 92) {
            return {
              phase: 5,
              name: 'Configuração do GRUB Bootloader',
              badge: 'Etapa 5/5: GRUB EFI',
              gradient: 'from-cyan-500 via-teal-400 to-emerald-400',
              glowColor: 'rgba(20, 184, 166, 0.85)',
              glowShadow: '0 0 22px rgba(20, 184, 166, 0.8), 0 0 35px rgba(45, 212, 191, 0.35)',
              pillClass: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
              icon: Disc,
              subtitle: 'Gravando entrada NVRAM UEFI (0001 InoveCloudOS) e gerando grub.cfg...',
            };
          }
          if (progress >= 70) {
            return {
              phase: 4,
              name: 'GNOME Shell & Liquid Glass Theme',
              badge: 'Etapa 4/5: Desktop Glass',
              gradient: 'from-rose-500 via-red-500 to-pink-400',
              glowColor: 'rgba(244, 63, 94, 0.85)',
              glowShadow: '0 0 22px rgba(244, 63, 94, 0.8), 0 0 38px rgba(251, 113, 133, 0.35)',
              pillClass: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
              icon: Sparkles,
              subtitle: 'Instalando GNOME 46, Dock Transparente, Wallpapers 8K e Flathub...',
            };
          }
          if (progress >= 48) {
            return {
              phase: 3,
              name: 'apt-get install Kernel 6.12 & Módulos',
              badge: 'Etapa 3/5: Kernel & DRM/KMS',
              gradient: 'from-indigo-600 via-purple-500 to-fuchsia-400',
              glowColor: 'rgba(168, 85, 247, 0.85)',
              glowShadow: '0 0 24px rgba(168, 85, 247, 0.85), 0 0 40px rgba(192, 132, 252, 0.4)',
              pillClass: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
              icon: Cpu,
              subtitle: 'Baixando linux-image-6.12, gerando initramfs ZSTD e drivers de aceleração 3D...',
            };
          }
          if (progress >= 24) {
            return {
              phase: 2,
              name: 'debootstrap Debian 13 Base (Trixie)',
              badge: 'Etapa 2/5: debootstrap',
              gradient: 'from-amber-500 via-orange-400 to-yellow-300',
              glowColor: 'rgba(245, 158, 11, 0.85)',
              glowShadow: '0 0 24px rgba(245, 158, 11, 0.85), 0 0 40px rgba(251, 191, 36, 0.4)',
              pillClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
              icon: Package,
              subtitle: 'Extraindo pacotes base (libc6, dpkg, systemd, bash, coreutils, sed, tar)...',
            };
          }
          return {
            phase: 1,
            name: 'Particionamento GPT & Estrutura EFI',
            badge: 'Etapa 1/5: Disco & GPT',
            gradient: 'from-blue-600 via-cyan-500 to-teal-400',
            glowColor: 'rgba(6, 182, 212, 0.8)',
            glowShadow: '0 0 20px rgba(6, 182, 212, 0.8), 0 0 35px rgba(56, 189, 248, 0.35)',
            pillClass: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
            icon: HardDrive,
            subtitle: 'Criando tabela GPT, partição EFI FAT32 e formatando sistema de arquivos...',
          };
        })();

        const StageIcon = stage.icon;

        const STEPS_SUMMARY = [
          { id: 1, label: 'GPT/EFI', min: 0, max: 23 },
          { id: 2, label: 'debootstrap', min: 24, max: 47 },
          { id: 3, label: 'apt-get Kernel', min: 48, max: 69 },
          { id: 4, label: 'GNOME Glass', min: 70, max: 91 },
          { id: 5, label: 'GRUB EFI', min: 92, max: 100 },
        ];

        return (
          <div className="px-4 py-3 bg-[#070b16] border-b border-white/10 space-y-2.5 relative overflow-hidden">
            {/* Top Stage Badges Bar */}
            <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
              <div className="flex items-center space-x-2.5">
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all duration-300 ${stage.pillClass}`}
                  style={{ boxShadow: `0 0 12px ${stage.glowColor}` }}
                >
                  <StageIcon className={`w-3.5 h-3.5 ${isRunning ? 'animate-pulse' : ''}`} />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-white tracking-tight">{stage.name}</span>
                    <span className={`px-2 py-0.2 rounded-full text-[10px] font-bold border ${stage.pillClass}`}>
                      {stage.badge}
                    </span>
                    {isRunning && (
                      <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
                        • {displayProgress < 100 ? `${displayProgress.toFixed(1)}%` : '100%'}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 truncate max-w-md sm:max-w-xl">
                    {stage.subtitle}
                  </p>
                </div>
              </div>

              {/* Step Flow Indicators */}
              <div className="flex items-center space-x-1 sm:space-x-1.5">
                {STEPS_SUMMARY.map((st) => {
                  const isDone = progress > st.max;
                  const isCurrent = progress >= st.min && progress <= st.max;
                  return (
                    <div
                      key={st.id}
                      className={`flex items-center space-x-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border transition-all duration-300 ${
                        isDone
                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                          : isCurrent
                          ? `${stage.pillClass} shadow-[0_0_10px_rgba(255,255,255,0.15)] font-bold scale-105`
                          : 'bg-slate-900/60 text-slate-500 border-slate-800'
                      }`}
                    >
                      {isDone ? (
                        <Check className="w-2.5 h-2.5 text-emerald-400" />
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-75" />
                      )}
                      <span className="hidden md:inline">{st.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Dynamic Glass Track & Glowing Fill with Shimmer & Leading Spark */}
            <div className="relative py-1">
              {/* Glow Aura Shadow Layer */}
              <div
                className="absolute inset-x-0 top-1 h-3.5 rounded-full opacity-60 blur-md pointer-events-none transition-all duration-500"
                style={{
                  background: `linear-gradient(90deg, transparent, ${stage.glowColor}, transparent)`,
                  width: `${Math.min(100, Math.max(8, displayProgress))}%`,
                }}
              />

              {/* Progress Container Track */}
              <div className="w-full h-3 bg-slate-950/90 rounded-full p-[2px] border border-white/15 relative overflow-hidden backdrop-blur-md shadow-inner">
                {/* Background Grid Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:16px_100%] pointer-events-none opacity-40" />

                {/* Animated Gradient Fill Bar */}
                <div
                  className={`h-full rounded-full relative transition-all duration-150 ease-out bg-gradient-to-r ${stage.gradient}`}
                  style={{
                    width: `${displayProgress}%`,
                    boxShadow: stage.glowShadow,
                  }}
                >
                  {/* Streaming Shimmer Light Wave */}
                  <div className="absolute inset-0 overflow-hidden rounded-full pointer-events-none">
                    <div className="w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-progress-shimmer" />
                  </div>

                  {/* Leading Laser Spark Orb */}
                  {displayProgress > 1 && displayProgress < 99.5 && isRunning && (
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10 flex items-center justify-center pointer-events-none">
                      <div className="w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_12px_#ffffff] animate-lead-spark" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Metrics Bar */}
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-0.5">
              <div className="flex items-center space-x-3">
                <span className="flex items-center space-x-1 text-slate-300">
                  <span className="text-slate-500">Disco:</span>
                  <span className="text-cyan-300 font-semibold">{selectedDisk}</span>
                </span>
                <span className="hidden sm:inline text-slate-600">|</span>
                <span className="hidden sm:flex items-center space-x-1">
                  <span className="text-slate-500">Taxa I/O:</span>
                  <span className="text-emerald-400 font-semibold">
                    {isRunning ? (speedMultiplier === 5 ? '88.4 MB/s' : speedMultiplier === 2 ? '34.2 MB/s' : '18.6 MB/s') : '0.0 MB/s'}
                  </span>
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-slate-400">Progresso:</span>
                <span
                  className="font-bold text-xs"
                  style={{ color: stage.glowColor }}
                >
                  {displayProgress.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Main Terminal Window Emulator (xterm.js look & feel) */}
      <div className="flex-1 p-4 overflow-y-auto font-mono text-xs leading-relaxed bg-[#050811] text-slate-200 select-text">
        <div className="space-y-1">
          {filteredLogs.map((log) => {
            return (
              <div
                key={log.id}
                className={`flex items-start space-x-2.5 py-0.5 hover:bg-white/[0.03] px-2 rounded ${
                  log.highlight ? 'bg-cyan-950/40 border-l-2 border-cyan-400 pl-2' : ''
                }`}
              >
                {/* Timestamp */}
                <span className="text-slate-600 select-none shrink-0 text-[11px]">
                  {log.timestamp}
                </span>

                {/* Tag Pill */}
                {log.tag && (
                  <span
                    className={`px-1.5 py-0.2 rounded text-[10px] font-bold shrink-0 select-none ${
                      log.tag === 'OK'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : log.tag === 'DEBOOTSTRAP'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : log.tag === 'APT'
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                        : log.tag === 'KERNEL'
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                        : log.tag === 'STEP'
                        ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40'
                        : 'bg-slate-700/40 text-cyan-300 border border-cyan-500/30'
                    }`}
                  >
                    [{log.tag}]
                  </span>
                )}

                {/* Log Line Content */}
                <span
                  className={`break-all ${
                    log.tag === 'OK'
                      ? 'text-emerald-300 font-semibold'
                      : log.tag === 'DEBOOTSTRAP'
                      ? 'text-amber-200'
                      : log.tag === 'APT'
                      ? 'text-sky-300'
                      : log.tag === 'KERNEL'
                      ? 'text-purple-300'
                      : log.tag === 'STEP'
                      ? 'text-yellow-200 font-bold'
                      : 'text-slate-300'
                  }`}
                >
                  {log.text}
                </span>
              </div>
            );
          })}

          {/* Active blinking cursor at the bottom */}
          {isRunning && (
            <div className="flex items-center space-x-2 text-cyan-400 pt-1 px-2">
              <span className="text-slate-500 select-none">root@inovecloud-installer:~#</span>
              <span className="w-2 h-4 bg-cyan-400 animate-pulse inline-block" />
            </div>
          )}

          <div ref={terminalEndRef} />
        </div>
      </div>

      {/* Completion Dialog / Success Bar */}
      {isComplete && (
        <div className="p-4 bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border-t border-emerald-500/40 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">
                InoveCloud OS 2026 Instalado com Sucesso!
              </h4>
              <p className="text-xs text-emerald-300/80">
                O sistema foi gravado em {selectedDisk} com GRUB UEFI. Você pode reiniciar agora para entrar diretamente no sistema.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownloadLogFile}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/10 transition cursor-pointer"
            >
              Exportar Log Completo
            </button>
            <button
              onClick={() => {
                alert('Reiniciando computador... O sistema instalado será carregado no próximo boot.');
                if (onInstallationFinished) onInstallationFinished();
              }}
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-90 text-white text-xs font-bold shadow-lg shadow-emerald-500/30 transition cursor-pointer"
            >
              Reiniciar no Sistema Instalado ➔
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
