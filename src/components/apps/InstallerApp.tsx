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
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Globe,
  Keyboard,
  User,
  Lock,
  Eye,
  EyeOff,
  Clock,
  ArrowRight,
  CheckCircle,
  HelpCircle
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

export type InstallerWizardStep =
  | 'welcome'
  | 'keyboard'
  | 'disk'
  | 'user'
  | 'summary'
  | 'installing'
  | 'finish';

// Componente do Ícone 3D Holográfico do CD / DVD com Arco-Íris
export const CdDvdGraphic: React.FC<{ className?: string; animated?: boolean }> = ({
  className = 'w-16 h-16',
  animated = false,
}) => (
  <div className={`${className} shrink-0 select-none relative group`}>
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl" fill="none">
      <defs>
        <radialGradient id="cd-glow" cx="50%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#d946ef" stopOpacity="0.45" />
          <stop offset="60%" stopColor="#f59e0b" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="cd-metal" cx="50%" cy="45%" r="50%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="35%" stopColor="#f1f5f9" />
          <stop offset="70%" stopColor="#cbd5e1" />
          <stop offset="100%" stopColor="#94a3b8" />
        </radialGradient>
        <linearGradient id="cd-rainbow-fan" x1="10%" y1="85%" x2="90%" y2="15%">
          <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.9" />
          <stop offset="18%" stopColor="#f97316" stopOpacity="0.9" />
          <stop offset="34%" stopColor="#eab308" stopOpacity="0.95" />
          <stop offset="50%" stopColor="#22c55e" stopOpacity="0.9" />
          <stop offset="68%" stopColor="#06b6d4" stopOpacity="0.95" />
          <stop offset="84%" stopColor="#3b82f6" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#a855f7" stopOpacity="0.9" />
        </linearGradient>
        <linearGradient id="cd-rainbow-cross" x1="85%" y1="85%" x2="15%" y2="15%">
          <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.75" />
          <stop offset="35%" stopColor="#8b5cf6" stopOpacity="0.65" />
          <stop offset="70%" stopColor="#ec4899" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#facc15" stopOpacity="0.8" />
        </linearGradient>
        <linearGradient id="cd-specular" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
          <stop offset="30%" stopColor="#ffffff" stopOpacity="0.2" />
          <stop offset="50%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="70%" stopColor="#ffffff" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.7" />
        </linearGradient>
        <filter id="cd-shadow" x="-20%" y="-15%" width="140%" height="145%">
          <feDropShadow dx="0" dy="4" stdDeviation="3.5" floodColor="#000000" floodOpacity="0.6" />
        </filter>
      </defs>

      {/* Squircle Fundo Escuro com Reflexo */}
      <rect width="100" height="100" rx="26" fill="#18191f" />
      <rect width="100" height="100" rx="26" fill="url(#cd-glow)" />
      <rect x="1.5" y="1.5" width="97" height="97" rx="24.5" stroke="rgba(255,255,255,0.15)" strokeWidth="1" fill="none" />

      {/* Disco Óptico CD / DVD com Arco-Íris */}
      <g filter="url(#cd-shadow)" className={animated ? 'origin-[50px_46px] animate-spin' : ''} style={{ animationDuration: '10s' }}>
        <circle cx="50" cy="46" r="37" fill="url(#cd-metal)" />
        <circle cx="50" cy="46" r="35.5" stroke="rgba(255,255,255,0.4)" strokeWidth="0.6" fill="none" />
        <circle cx="50" cy="46" r="34" stroke="rgba(0,0,0,0.15)" strokeWidth="0.5" fill="none" />

        {/* Camadas Prismáticas de Difração de Luz */}
        <path d="M 50 46 L 15 36 A 36 36 0 0 1 78 20 Z" fill="url(#cd-rainbow-fan)" style={{ mixBlendMode: 'color-dodge' }} opacity="0.88" />
        <path d="M 50 46 L 85 56 A 36 36 0 0 1 22 72 Z" fill="url(#cd-rainbow-fan)" style={{ mixBlendMode: 'color-dodge' }} opacity="0.88" />
        <path d="M 50 46 L 30 78 A 36 36 0 0 1 70 82 Z" fill="url(#cd-rainbow-cross)" style={{ mixBlendMode: 'screen' }} opacity="0.68" />

        <circle cx="50" cy="46" r="37" fill="url(#cd-specular)" style={{ mixBlendMode: 'overlay' }} />

        {/* Anéis Centrais do Hub e Spindle Hole */}
        <circle cx="50" cy="46" r="16.5" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.8" />
        <circle cx="50" cy="46" r="14.5" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1" />
        <circle cx="50" cy="46" r="11" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="0.7" />
        <circle cx="50" cy="46" r="7.5" fill="#0f172a" stroke="#020617" strokeWidth="1" />
        <circle cx="50" cy="46" r="6" fill="#000000" />
      </g>

      {/* Pílula de Progresso e Instalação na base */}
      <rect x="14" y="70" width="72" height="15" rx="7.5" fill="rgba(255,255,255,0.3)" stroke="rgba(255,255,255,0.6)" strokeWidth="0.8" />
      <polygon points="21,74.5 28,77.5 21,80.5" fill="#ffffff" />
      <line x1="33" y1="77.5" x2="79" y2="77.5" stroke="rgba(0,0,0,0.5)" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="33" y1="77.5" x2="56" y2="77.5" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="56" cy="77.5" r="3.2" fill="#ffffff" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.5))" />
    </svg>
  </div>
);

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
  { progress: 91, tag: 'OK', text: 'Usuário padrão criado com permissões de administrador (sudo).' },
  { progress: 94, tag: 'STEP', text: 'grub-install --target=x86_64-efi --efi-directory=/boot/efi --bootloader-id=InoveCloudOS --recheck' },
  { progress: 96, tag: 'OK', text: 'Installation finished. No error reported. (GRUB EFI Boot Entry: 0001 InoveCloudOS)' },
  { progress: 98, tag: 'STEP', text: 'update-grub # Gerando /boot/grub/grub.cfg com suporte a BIOS/UEFI...' },
  { progress: 100, tag: 'OK', text: '🎉 INSTALAÇÃO DO INOVECLOUD OS 2026 CONCLUÍDA COM SUCESSO NO DISCO!' },
];

export const InstallerApp: React.FC<InstallerAppProps> = ({
  onInstallationFinished,
  standaloneInModal = false,
}) => {
  // Wizard Navigation
  const [currentStep, setCurrentStep] = useState<InstallerWizardStep>('welcome');
  const [viewMode, setViewMode] = useState<'wizard' | 'terminal'>('wizard');

  // Step 1: Language / Idioma
  const [selectedLanguage, setSelectedLanguage] = useState<string>('pt-BR');

  // Step 2: Keyboard & Timezone
  const [selectedKeyboard, setSelectedKeyboard] = useState<string>('br-abnt2');
  const [selectedTimezone, setSelectedTimezone] = useState<string>('America/Sao_Paulo');
  const [keyboardTestInput, setKeyboardTestInput] = useState<string>('');

  // Step 3: Partitions & Storage
  const [selectedDisk, setSelectedDisk] = useState<string>('/dev/nvme0n1');
  const [partitionMode, setPartitionMode] = useState<'auto' | 'manual'>('auto');
  const [selectedFilesystem, setSelectedFilesystem] = useState<string>('btrfs');
  const [enableEncryption, setEnableEncryption] = useState<boolean>(false);

  // Step 4: User & Password
  const [fullName, setFullName] = useState<string>('Administrador Inove');
  const [username, setUsername] = useState<string>('inove');
  const [hostname, setHostname] = useState<string>('inovecloud-pc');
  const [password, setPassword] = useState<string>('inove2026');
  const [confirmPassword, setConfirmPassword] = useState<string>('inove2026');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [autoLogin, setAutoLogin] = useState<boolean>(true);
  const [sudoAdmin, setSudoAdmin] = useState<boolean>(true);

  // Execution & Progress State
  const [logs, setLogs] = useState<InstallerLogLine[]>([
    {
      id: 'init-1',
      timestamp: '00:00:01',
      tag: 'INFO',
      text: 'InoveCloud OS 2026 Live Installer v3.5 (UEFI/BIOS x86_64)',
      highlight: true,
    },
    {
      id: 'init-2',
      timestamp: '00:00:02',
      tag: 'OK',
      text: 'Mídia Live CD/DVD detectada: Preparado para instalação no hardware real ou VM.',
    },
  ]);

  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [displayProgress, setDisplayProgress] = useState<number>(0);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedLogs, setCopiedLogs] = useState<boolean>(false);
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [rebootingScreen, setRebootingScreen] = useState<boolean>(false);

  const terminalEndRef = useRef<HTMLDivElement>(null);
  const autoScrollRef = useRef<boolean>(true);

  // Automatic scroll on terminal
  useEffect(() => {
    if (autoScrollRef.current && terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  // Smooth lerp progress bar animation
  useEffect(() => {
    let animationFrameId: number;
    const animateProgress = () => {
      setDisplayProgress((prev) => {
        const diff = progress - prev;
        if (Math.abs(diff) < 0.15) {
          return progress;
        }
        const step = diff * 0.12;
        return Number((prev + step).toFixed(2));
      });
      animationFrameId = requestAnimationFrame(animateProgress);
    };
    animationFrameId = requestAnimationFrame(animateProgress);
    return () => cancelAnimationFrame(animationFrameId);
  }, [progress]);

  // Debootstrap / Apt-get real execution engine
  useEffect(() => {
    if (!isRunning || isPaused) return;

    if (currentStepIndex >= DEBOOTSTRAP_STEPS.length) {
      setIsRunning(false);
      setIsComplete(true);
      setProgress(100);
      setCurrentStep('finish');
      return;
    }

    const step = DEBOOTSTRAP_STEPS[currentStepIndex];
    const delay = Math.max(70, Math.floor(400 / speedMultiplier));

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
  }, [isRunning, isPaused, currentStepIndex, speedMultiplier]);

  const handleStartInstallation = () => {
    setCurrentStep('installing');
    setIsComplete(false);
    setProgress(0);
    setDisplayProgress(0);
    setCurrentStepIndex(0);
    setLogs([
      {
        id: `start-${Date.now()}`,
        timestamp: new Date().toTimeString().split(' ')[0],
        tag: 'STEP',
        text: `Iniciando particionamento e instalação em ${selectedDisk} (Formato: ${selectedFilesystem.toUpperCase()}, Usuário: ${username})...`,
        highlight: true,
      },
    ]);
    setIsRunning(true);
    setIsPaused(false);
  };

  const handleReboot = () => {
    setRebootingScreen(true);
    setTimeout(() => {
      if (onInstallationFinished) {
        onInstallationFinished();
      }
    }, 2500);
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

  // Password Strength Evaluation
  const passwordStrength = (() => {
    if (!password) return { label: 'Em branco', score: 0, color: 'bg-slate-700' };
    if (password.length < 6) return { label: 'Fraca', score: 1, color: 'bg-red-500' };
    if (password.length < 10) return { label: 'Média', score: 2, color: 'bg-amber-500' };
    return { label: 'Forte e Segura', score: 3, color: 'bg-emerald-500' };
  })();

  // Available Languages
  const languages = [
    { code: 'pt-BR', name: 'Português (Brasil)', flag: '🇧🇷', welcome: 'Bem-vindo ao InoveCloud OS' },
    { code: 'en-US', name: 'English (United States)', flag: '🇺🇸', welcome: 'Welcome to InoveCloud OS' },
    { code: 'es-ES', name: 'Español (España / América Latina)', flag: '🇪🇸', welcome: 'Bienvenido a InoveCloud OS' },
    { code: 'fr-FR', name: 'Français (France)', flag: '🇫🇷', welcome: 'Bienvenue sur InoveCloud OS' },
    { code: 'de-DE', name: 'Deutsch (Deutschland)', flag: '🇩🇪', welcome: 'Willkommen bei InoveCloud OS' },
    { code: 'it-IT', name: 'Italiano (Italia)', flag: '🇮🇹', welcome: 'Benvenuto in InoveCloud OS' },
  ];

  // Available Keyboards
  const keyboards = [
    { id: 'br-abnt2', name: 'Português (Brasil, ABNT2 com tecla Ç)' },
    { id: 'br-us', name: 'Português (Brasil, Sem tecla Ç / US-AltGr)' },
    { id: 'us-intl', name: 'Inglês (EUA, Internacional com Teclas Mortas)' },
    { id: 'us-std', name: 'Inglês (EUA, Teclado Padrão QWERTY)' },
    { id: 'es-latam', name: 'Espanhol (América Latina)' },
  ];

  // Available Disks
  const disks = [
    { id: '/dev/nvme0n1', name: 'Samsung SSD 990 PRO (1 TB NVMe PCIe 4.0)', size: '1000.2 GB', type: 'SSD NVMe Ultra Rápido' },
    { id: '/dev/sda', name: 'Kingston KC600 SATA SSD (512 GB)', size: '512.1 GB', type: 'SATA SSD Interno' },
    { id: '/dev/vda', name: 'VirtIO Block Storage Virtual Disk (64 GB)', size: '64.0 GB', type: 'Disco Virtual KVM / QEMU' },
  ];

  if (rebootingScreen) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-slate-950 text-white p-8 space-y-6 select-none animate-fade-in">
        <CdDvdGraphic className="w-24 h-24" animated={true} />
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-white">Reiniciando o Computador...</h2>
          <p className="text-sm text-slate-400">
            A mídia de instalação Live CD/DVD foi desacoplada. Inicializando diretamente do SSD/NVMe.
          </p>
        </div>
        <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span>Iniciando UEFI GRUB Bootloader...</span>
        </div>
      </div>
    );
  }

  return (
    <div
      id="inovecloud-installer-terminal-app"
      className="h-full flex flex-col bg-[#0b0f19] text-slate-100 font-sans overflow-hidden select-none"
    >
      {/* Top Banner Toolbar */}
      <div className="p-3.5 border-b border-white/10 bg-gradient-to-r from-slate-900 via-rose-950/30 to-slate-900 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center space-x-3">
          <CdDvdGraphic className="w-10 h-10" animated={isRunning} />
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                Instalador do InoveCloud OS 2026
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                Live CD / DVD
              </span>
              {isRunning && (
                <span className="flex items-center space-x-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-green-500/20 text-green-300 border border-green-500/40 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                  <span>Gravando no Disco...</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              Assistente oficial de instalação permanente no disco rígido ou SSD NVMe.
            </p>
          </div>
        </div>

        {/* View Mode Toggle & Actions */}
        <div className="flex items-center space-x-2">
          <div className="flex rounded-lg bg-black/40 p-1 border border-white/10 text-xs">
            <button
              onClick={() => setViewMode('wizard')}
              className={`px-3 py-1 rounded-md font-semibold transition cursor-pointer ${
                viewMode === 'wizard' ? 'bg-rose-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Assistente Gráfico
            </button>
            <button
              onClick={() => setViewMode('terminal')}
              className={`px-3 py-1 rounded-md font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'terminal' ? 'bg-slate-800 text-cyan-300 shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <TerminalIcon className="w-3 h-3" />
              <span>Console xterm</span>
            </button>
          </div>

          <button
            onClick={handleDownloadLogFile}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs transition cursor-pointer"
            title="Baixar arquivo de log"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Log</span>
          </button>
        </div>
      </div>

      {/* Main Body */}
      {viewMode === 'wizard' ? (
        <div className="flex-1 flex overflow-hidden">
          {/* Left Step Navigator */}
          <div className="w-56 bg-slate-950/80 border-r border-white/10 p-4 flex flex-col justify-between hidden sm:flex shrink-0">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-2 px-2">
                Etapas de Instalação:
              </span>
              {[
                { id: 'welcome', label: '1. Idioma & Início', icon: Globe },
                { id: 'keyboard', label: '2. Teclado & Fuso', icon: Keyboard },
                { id: 'disk', label: '3. Partição & Disco', icon: HardDrive },
                { id: 'user', label: '4. Conta & Senha', icon: User },
                { id: 'summary', label: '5. Confirmação', icon: Layers },
                { id: 'installing', label: '6. Gravando Disco', icon: Disc },
                { id: 'finish', label: '7. Finalizado', icon: CheckCircle2 },
              ].map((stepItem, idx) => {
                const Icon = stepItem.icon;
                const isCurrent = currentStep === stepItem.id;
                const isDone = [
                  'welcome', 'keyboard', 'disk', 'user', 'summary', 'installing', 'finish'
                ].indexOf(currentStep) > idx;

                return (
                  <button
                    key={stepItem.id}
                    disabled={isRunning || isComplete}
                    onClick={() => {
                      if (!isRunning && !isComplete && currentStep !== 'installing') {
                        setCurrentStep(stepItem.id as any);
                      }
                    }}
                    className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs text-left transition cursor-pointer ${
                      isCurrent
                        ? 'bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30'
                        : isDone
                        ? 'text-slate-300 hover:bg-white/5'
                        : 'text-slate-500 hover:text-slate-400'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isCurrent ? 'text-rose-400' : isDone ? 'text-emerald-400' : 'text-slate-600'}`} />
                    <span className="truncate">{stepItem.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-[11px] text-slate-400 space-y-1">
              <span className="text-white font-bold block">Modo de Boot:</span>
              <span className="text-emerald-400 font-mono">UEFI x86_64</span>
              <span className="text-[10px] text-slate-500 block pt-1">
                Suporte a Secure Boot e NVMe Gen4 nativo.
              </span>
            </div>
          </div>

          {/* Right Wizard Content Panel */}
          <div className="flex-1 p-6 overflow-y-auto flex flex-col justify-between">
            {/* STEP 1: WELCOME & LANGUAGE */}
            {currentStep === 'welcome' && (
              <div className="space-y-6 max-w-2xl mx-auto my-auto w-full animate-fade-in">
                <div className="flex items-center space-x-4">
                  <CdDvdGraphic className="w-16 h-16" />
                  <div>
                    <h3 className="text-xl font-bold text-white tracking-tight">
                      Bem-vindo ao InoveCloud OS 2026
                    </h3>
                    <p className="text-xs text-slate-300 mt-1">
                      Escolha o idioma de sua preferência para iniciar a instalação ou continue testando na sessão Live CD.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/90 border border-white/10 space-y-3">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                    Selecione o Idioma do Sistema:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => setSelectedLanguage(lang.code)}
                        className={`flex items-center space-x-3 p-3 rounded-xl border text-left transition cursor-pointer ${
                          selectedLanguage === lang.code
                            ? 'bg-rose-500/20 border-rose-500/50 text-white ring-1 ring-rose-400/40 shadow-lg'
                            : 'bg-slate-950/60 border-white/5 text-slate-300 hover:border-white/20 hover:bg-slate-900'
                        }`}
                      >
                        <span className="text-2xl">{lang.flag}</span>
                        <div>
                          <span className="text-xs font-bold block">{lang.name}</span>
                          <span className="text-[10px] text-slate-400">{lang.welcome}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bottom Action Bar */}
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <button
                    onClick={() => {
                      if (onInstallationFinished) onInstallationFinished();
                    }}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold border border-white/10 transition cursor-pointer"
                  >
                    Experimentar Modo Live CD
                  </button>
                  <button
                    onClick={() => setCurrentStep('keyboard')}
                    className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition cursor-pointer active:scale-95"
                  >
                    <span>Avançar</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: KEYBOARD & TIMEZONE */}
            {currentStep === 'keyboard' && (
              <div className="space-y-6 max-w-2xl mx-auto my-auto w-full animate-fade-in">
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                    <Keyboard className="w-5 h-5 text-rose-400" />
                    <span>Teclado e Localização Geográfica</span>
                  </h3>
                  <p className="text-xs text-slate-300 mt-1">
                    Selecione o layout do teclado e o fuso horário para acertar o relógio do sistema.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Keyboard layout selection */}
                  <div className="p-4 rounded-2xl bg-slate-900/90 border border-white/10 space-y-2">
                    <label className="text-xs font-bold text-slate-300 block">Layout do Teclado:</label>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                      {keyboards.map((kb) => (
                        <button
                          key={kb.id}
                          onClick={() => setSelectedKeyboard(kb.id)}
                          className={`w-full text-left p-2.5 rounded-xl text-xs transition cursor-pointer border ${
                            selectedKeyboard === kb.id
                              ? 'bg-rose-500/20 border-rose-500/50 text-white font-bold ring-1 ring-rose-400/40'
                              : 'bg-slate-950/60 border-white/5 text-slate-300 hover:bg-white/5'
                          }`}
                        >
                          {kb.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Timezone selection */}
                  <div className="p-4 rounded-2xl bg-slate-900/90 border border-white/10 space-y-3 flex flex-col justify-between">
                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-2">Fuso Horário:</label>
                      <select
                        value={selectedTimezone}
                        onChange={(e) => setSelectedTimezone(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-400 font-mono"
                      >
                        <option value="America/Sao_Paulo">América / São Paulo (Brasília, UTC-03:00)</option>
                        <option value="America/Manaus">América / Manaus (Amazonas, UTC-04:00)</option>
                        <option value="Europe/Lisbon">Europa / Lisboa (Portugal, UTC+00:00)</option>
                        <option value="America/New_York">América / Nova York (EST, UTC-05:00)</option>
                        <option value="UTC">Universal Coordinated Time (UTC)</option>
                      </select>
                    </div>

                    <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-xs text-slate-300 space-y-1">
                      <div className="flex items-center space-x-2 text-cyan-400">
                        <Clock className="w-3.5 h-3.5" />
                        <span className="font-bold">Hora Local Atual:</span>
                      </div>
                      <div className="font-mono text-base font-bold text-white">
                        {new Date().toLocaleTimeString('pt-BR')}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Keyboard typing test field */}
                <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-400 block">
                    Teste seu teclado abaixo (digite ç, ~, ^, @, /, ?, 123):
                  </label>
                  <input
                    type="text"
                    value={keyboardTestInput}
                    onChange={(e) => setKeyboardTestInput(e.target.value)}
                    placeholder="Digite caracteres aqui para testar..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-cyan-300 focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <button
                    onClick={() => setCurrentStep('welcome')}
                    className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold border border-white/10 transition cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Voltar</span>
                  </button>
                  <button
                    onClick={() => setCurrentStep('disk')}
                    className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition cursor-pointer active:scale-95"
                  >
                    <span>Avançar para Particionamento</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: DISK PARTITIONS & STORAGE */}
            {currentStep === 'disk' && (
              <div className="space-y-6 max-w-2xl mx-auto my-auto w-full animate-fade-in">
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                    <HardDrive className="w-5 h-5 text-emerald-400" />
                    <span>Configuração de Partição e Disco Rígido / SSD</span>
                  </h3>
                  <p className="text-xs text-slate-300 mt-1">
                    Escolha a unidade de armazenamento de destino onde o sistema será instalado.
                  </p>
                </div>

                {/* Disks Grid */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                    Discos Físicos Detectados:
                  </label>
                  <div className="space-y-2">
                    {disks.map((disk) => (
                      <div
                        key={disk.id}
                        onClick={() => setSelectedDisk(disk.id)}
                        className={`p-3.5 rounded-xl border flex items-center justify-between transition cursor-pointer ${
                          selectedDisk === disk.id
                            ? 'bg-emerald-500/15 border-emerald-500/60 ring-1 ring-emerald-400/40 shadow-lg'
                            : 'bg-slate-950/60 border-white/10 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <HardDrive className={`w-5 h-5 ${selectedDisk === disk.id ? 'text-emerald-400' : 'text-slate-500'}`} />
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-mono text-xs font-bold text-white">{disk.id}</span>
                              <span className="text-xs text-slate-300">({disk.name})</span>
                            </div>
                            <span className="text-[11px] text-slate-400">{disk.type}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-mono text-sm font-bold text-white tabular-nums">{disk.size}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Partitioning Mode */}
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-white/10 space-y-3">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                    Método de Particionamento:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      onClick={() => setPartitionMode('auto')}
                      className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                        partitionMode === 'auto'
                          ? 'bg-rose-500/20 border-rose-500/50 text-white ring-1 ring-rose-400/30'
                          : 'bg-slate-950/60 border-white/5 text-slate-400 hover:text-white'
                      }`}
                    >
                      <span className="text-xs font-bold text-rose-300 block mb-1">
                        🔘 Apagar Disco Inteiro (Automático)
                      </span>
                      <p className="text-[11px] text-slate-400">
                        Cria esquema limpo GPT com partição EFI ESP (512 MB) + partição raiz Rootfs.
                      </p>
                    </button>

                    <button
                      onClick={() => setPartitionMode('manual')}
                      className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                        partitionMode === 'manual'
                          ? 'bg-rose-500/20 border-rose-500/50 text-white ring-1 ring-rose-400/30'
                          : 'bg-slate-950/60 border-white/5 text-slate-400 hover:text-white'
                      }`}
                    >
                      <span className="text-xs font-bold text-amber-300 block mb-1">
                        ⚙️ Particionamento Manual Avançado
                      </span>
                      <p className="text-[11px] text-slate-400">
                        Permite personalizar pontos de montagem (/boot/efi, /, /home) e SWAP.
                      </p>
                    </button>
                  </div>

                  {/* Filesystem Selection */}
                  <div className="pt-2 flex items-center justify-between flex-wrap gap-2 text-xs border-t border-white/5">
                    <span className="text-slate-300 font-semibold">Sistema de Arquivos da Raiz:</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedFilesystem('btrfs')}
                        className={`px-3 py-1 rounded-lg border text-xs font-semibold cursor-pointer ${
                          selectedFilesystem === 'btrfs'
                            ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold'
                            : 'bg-slate-950 text-slate-300 border-white/10'
                        }`}
                      >
                        Btrfs (Snapshots & ZSTD)
                      </button>
                      <button
                        onClick={() => setSelectedFilesystem('ext4')}
                        className={`px-3 py-1 rounded-lg border text-xs font-semibold cursor-pointer ${
                          selectedFilesystem === 'ext4'
                            ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold'
                            : 'bg-slate-950 text-slate-300 border-white/10'
                        }`}
                      >
                        Ext4 (Journaling POSIX)
                      </button>
                    </div>
                  </div>
                </div>

                {/* Visual Partitions Layout Preview */}
                <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">Layout Proposto no Disco:</span>
                    <span className="font-mono text-emerald-400">Tabela GPT (GUID Partition Table)</span>
                  </div>
                  <div className="h-6 w-full rounded-lg overflow-hidden flex text-[10px] font-bold text-slate-950">
                    <div className="w-[12%] bg-amber-400 flex items-center justify-center" title="Partição EFI ESP (512 MB, FAT32)">
                      EFI (512MB)
                    </div>
                    <div className="w-[88%] bg-cyan-400 flex items-center justify-center" title={`Partição Raiz ${selectedFilesystem.toUpperCase()}`}>
                      Rootfs / ({selectedFilesystem.toUpperCase()})
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <button
                    onClick={() => setCurrentStep('keyboard')}
                    className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold border border-white/10 transition cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Voltar</span>
                  </button>
                  <button
                    onClick={() => setCurrentStep('user')}
                    className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition cursor-pointer active:scale-95"
                  >
                    <span>Avançar para Conta de Usuário</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: USER ACCOUNT & PASSWORD */}
            {currentStep === 'user' && (
              <div className="space-y-6 max-w-2xl mx-auto my-auto w-full animate-fade-in">
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                    <User className="w-5 h-5 text-cyan-400" />
                    <span>Criação de Conta de Usuário & Senha</span>
                  </h3>
                  <p className="text-xs text-slate-300 mt-1">
                    Defina suas credenciais de login para acessar a área de trabalho e executar comandos administrativos.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/90 border border-white/10 space-y-4 text-xs">
                  {/* Full Name & Username */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-semibold text-slate-300 block">Qual é o seu nome?</label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-rose-400"
                        placeholder="Ex: Carlos Silva"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-semibold text-slate-300 block">Nome de usuário (Login):</label>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-cyan-300 font-mono focus:outline-none focus:border-rose-400"
                        placeholder="inove"
                      />
                    </div>
                  </div>

                  {/* Hostname */}
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-300 block">Nome deste computador (Hostname na rede):</label>
                    <input
                      type="text"
                      value={hostname}
                      onChange={(e) => setHostname(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-cyan-300 font-mono focus:outline-none focus:border-rose-400"
                      placeholder="inovecloud-pc"
                    />
                  </div>

                  {/* Password & Confirm */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-semibold text-slate-300 block">Escolha uma senha:</label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-rose-400 pr-9"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                        >
                          {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="font-semibold text-slate-300 block">Confirme a senha:</label>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={`w-full bg-slate-950 border rounded-lg px-3 py-2 text-white font-mono focus:outline-none ${
                          password && confirmPassword && password !== confirmPassword
                            ? 'border-red-500'
                            : 'border-slate-700 focus:border-rose-400'
                        }`}
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  {/* Password Strength Indicator */}
                  <div className="flex items-center space-x-2 text-[11px]">
                    <span className="text-slate-400">Força da Senha:</span>
                    <span className={`px-2 py-0.5 rounded font-bold text-white text-[10px] ${passwordStrength.color}`}>
                      {passwordStrength.label}
                    </span>
                    {password && confirmPassword && password !== confirmPassword && (
                      <span className="text-red-400 font-semibold pl-2">As senhas não coincidem</span>
                    )}
                  </div>

                  {/* Checkbox Options */}
                  <div className="space-y-2 pt-2 border-t border-white/5">
                    <label className="flex items-center space-x-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={autoLogin}
                        onChange={(e) => setAutoLogin(e.target.checked)}
                        className="rounded border-slate-700 text-rose-600 focus:ring-rose-500"
                      />
                      <span className="text-slate-200">
                        Entrar automaticamente sem pedir senha no boot (Autologin)
                      </span>
                    </label>

                    <label className="flex items-center space-x-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={sudoAdmin}
                        onChange={(e) => setSudoAdmin(e.target.checked)}
                        className="rounded border-slate-700 text-rose-600 focus:ring-rose-500"
                      />
                      <span className="text-slate-200">
                        Conceder permissões de administrador completo (sudo / wheel)
                      </span>
                    </label>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <button
                    onClick={() => setCurrentStep('disk')}
                    className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold border border-white/10 transition cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Voltar</span>
                  </button>
                  <button
                    onClick={() => setCurrentStep('summary')}
                    disabled={!username || !password || password !== confirmPassword}
                    className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>Avançar para Resumo</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 5: SUMMARY & CONFIRMATION */}
            {currentStep === 'summary' && (
              <div className="space-y-6 max-w-2xl mx-auto my-auto w-full animate-fade-in">
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                    <Layers className="w-5 h-5 text-amber-400" />
                    <span>Resumo Final antes de Instalar</span>
                  </h3>
                  <p className="text-xs text-slate-300 mt-1">
                    Confira as configurações selecionadas. Ao clicar em <strong>"Instalar Agora"</strong>, o particionamento será efetuado.
                  </p>
                </div>

                {/* Summary Matrix Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-900/90 border border-white/10 space-y-1">
                    <span className="text-slate-400 text-[11px] block">Idioma & Localização</span>
                    <span className="font-bold text-white block">Português (Brasil)</span>
                    <span className="text-[11px] text-slate-400">Teclado: ABNT2 • {selectedTimezone}</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900/90 border border-white/10 space-y-1">
                    <span className="text-slate-400 text-[11px] block">Disco de Destino</span>
                    <span className="font-bold text-emerald-400 font-mono block">{selectedDisk}</span>
                    <span className="text-[11px] text-slate-400">GPT EFI (512MB) + Raiz ({selectedFilesystem.toUpperCase()})</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900/90 border border-white/10 space-y-1">
                    <span className="text-slate-400 text-[11px] block">Conta de Usuário</span>
                    <span className="font-bold text-cyan-300 font-mono block">{username} ({fullName})</span>
                    <span className="text-[11px] text-slate-400">Hostname: {hostname} • Sudo Ativo</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900/90 border border-white/10 space-y-1">
                    <span className="text-slate-400 text-[11px] block">Autenticação no Boot</span>
                    <span className="font-bold text-amber-300 block">
                      {autoLogin ? 'Autologin Habilitado (Entrada Direta)' : 'Solicitar Senha no Login'}
                    </span>
                    <span className="text-[11px] text-slate-400">GDM3 & PAM Autologin Configurados</span>
                  </div>
                </div>

                {/* Friendly Warning Banner */}
                <div className="p-3.5 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-start space-x-3 text-xs text-amber-200">
                  <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Atenção: Os dados no disco selecionado serão gravados</span>
                    <span className="text-[11px] opacity-90 leading-relaxed block mt-0.5">
                      O instalador criará as partições GPT e instalará o kernel Linux 6.12 e a interface gráfica GNOME Glass com debootstrap.
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <button
                    onClick={() => setCurrentStep('user')}
                    className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold border border-white/10 transition cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Voltar</span>
                  </button>
                  <button
                    onClick={handleStartInstallation}
                    className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:opacity-90 text-white text-xs font-bold shadow-xl shadow-emerald-500/30 transition cursor-pointer active:scale-95"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>🚀 Iniciar Instalação no Disco Agora</span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 6: INSTALLING IN PROGRESS */}
            {currentStep === 'installing' && (
              <div className="space-y-6 max-w-2xl mx-auto my-auto w-full animate-fade-in">
                <div className="flex items-center space-x-4">
                  <CdDvdGraphic className="w-16 h-16" animated={true} />
                  <div>
                    <h3 className="text-xl font-bold text-white tracking-tight">
                      Instalando o InoveCloud OS no Disco...
                    </h3>
                    <p className="text-xs text-slate-300 mt-1">
                      Copiando arquivos do sistema, descompactando pacotes base e compilando módulos de hardware.
                    </p>
                  </div>
                </div>

                {/* Dynamic Glowing Progress Bar */}
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-white/10 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white">Progresso da Instalação:</span>
                    <span className="font-mono text-cyan-400 font-bold tabular-nums text-sm">
                      {displayProgress}%
                    </span>
                  </div>

                  <div className="w-full h-4 bg-slate-950 rounded-full p-0.5 border border-white/10 overflow-hidden relative">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-400 transition-all duration-300 relative shadow-[0_0_20px_rgba(244,63,94,0.6)]"
                      style={{ width: `${displayProgress}%` }}
                    >
                      <div className="absolute inset-0 bg-white/25 animate-pulse" />
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
                    <span>Etapa ativa: <strong>{progress >= 90 ? 'GRUB Bootloader' : progress >= 70 ? 'GNOME Liquid Glass' : progress >= 48 ? 'Debian Apt-Get' : 'Debootstrap & Partições'}</strong></span>
                    <span className="font-mono text-emerald-400">Gravando em {selectedDisk}</span>
                  </div>
                </div>

                {/* Quick Log Snippet Preview */}
                <div className="p-3.5 rounded-xl bg-black/60 border border-white/10 space-y-1 font-mono text-[11px]">
                  <div className="text-slate-500 text-[10px] uppercase font-bold select-none">Última ação executada:</div>
                  <div className="text-cyan-300 truncate">
                    {logs[logs.length - 1]?.text || 'Executando script de instalação...'}
                  </div>
                </div>

                {/* Action to switch to full terminal */}
                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setViewMode('terminal')}
                    className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-semibold transition cursor-pointer"
                  >
                    <TerminalIcon className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Ver Terminal de Comandos Completo</span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 7: FINISHED / SUCCESS */}
            {currentStep === 'finish' && (
              <div className="space-y-6 max-w-2xl mx-auto my-auto w-full text-center animate-fade-in">
                <div className="flex justify-center">
                  <CdDvdGraphic className="w-24 h-24" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-white tracking-tight">
                    🎉 Instalação Concluída com Sucesso!
                  </h3>
                  <p className="text-xs text-slate-300 max-w-lg mx-auto leading-relaxed">
                    O InoveCloud OS foi instalado em <strong>{selectedDisk}</strong>. Todas as partições GPT, bootloader GRUB UEFI, drivers gráficos e tema Liquid Glass foram configurados perfeitamente.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-medium max-w-lg mx-auto">
                  Você já pode reiniciar para entrar no seu sistema operacional definitivo ou continuar explorando no modo Live CD.
                </div>

                <div className="flex items-center justify-center space-x-3 pt-4">
                  <button
                    onClick={() => {
                      if (onInstallationFinished) onInstallationFinished();
                    }}
                    className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold border border-white/10 transition cursor-pointer"
                  >
                    Continuar Testando (Modo Live)
                  </button>
                  <button
                    onClick={handleReboot}
                    className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-90 text-white text-xs font-bold shadow-xl shadow-emerald-500/30 transition cursor-pointer active:scale-95"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Reiniciar Computador Agora</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* TERMINAL VIEW (xterm.js style) */
        <div className="flex-1 flex flex-col bg-[#050811] overflow-hidden">
          {/* Settings Bar */}
          <div className="px-4 py-2 bg-slate-900/80 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-3 text-slate-300">
              <span>Disco: <strong className="text-cyan-400 font-mono">{selectedDisk}</strong></span>
              <span>Filesystem: <strong className="text-emerald-400 font-mono">{selectedFilesystem}</strong></span>
              <span>Usuário: <strong className="text-white font-mono">{username}</strong></span>
            </div>

            <div className="flex items-center space-x-3">
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

              <button
                onClick={handleCopyLogs}
                className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-white text-xs transition cursor-pointer"
              >
                {copiedLogs ? 'Copiado!' : 'Copiar'}
              </button>
            </div>
          </div>

          {/* Terminal Console View */}
          <div className="flex-1 p-4 overflow-y-auto font-mono text-xs text-slate-300 space-y-1 select-text">
            {logs.map((log) => (
              <div key={log.id} className="flex items-start space-x-2 leading-relaxed">
                <span className="text-slate-600 select-none text-[10px]">{log.timestamp}</span>
                {log.tag && (
                  <span className="text-rose-400 font-bold select-none text-[10px]">
                    [{log.tag}]
                  </span>
                )}
                <span className={log.highlight ? 'text-emerald-400 font-bold' : 'text-slate-300'}>
                  {log.text}
                </span>
              </div>
            ))}
            <div ref={terminalEndRef} />
          </div>
        </div>
      )}
    </div>
  );
};
