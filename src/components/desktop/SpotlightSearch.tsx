import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search,
  Server,
  Globe,
  Users,
  Layers,
  HardDrive,
  Terminal,
  Bot,
  Settings,
  FolderKanban,
  Activity,
  ArrowRight,
  Monitor,
  Compass,
  User,
  Disc,
  BookOpen,
  Palette,
  FileText,
  FileCode,
  FileArchive,
  Image as ImageIcon,
  Music,
  Video,
  Wifi,
  Bluetooth,
  ShieldCheck,
  Zap,
  Lock,
  Moon,
  Volume2,
  Cpu,
  RotateCw,
  Power,
  Usb,
  Folder,
  CheckCircle2,
  Sparkles,
  Command,
  Sliders,
  BellOff
} from 'lucide-react';
import { AppId } from '../../types';
import { useSystemSettings } from '../../context/SystemSettingsContext';

interface SpotlightSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenApp: (id: AppId, params?: any) => void;
}

type SearchCategory = 'all' | 'files' | 'settings' | 'components' | 'actions';

interface SearchResultItem {
  id: string;
  appId: AppId;
  category: 'files' | 'settings' | 'components' | 'actions';
  categoryLabel: string;
  title: string;
  desc: string;
  pathOrDetail?: string;
  badge?: string;
  badgeColor?: string;
  icon: React.ReactNode;
  tags?: string[];
  actionPayload?: any;
  onSelectAction?: () => void;
}

export const SpotlightSearch: React.FC<SpotlightSearchProps> = ({
  isOpen,
  onClose,
  onOpenApp,
}) => {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<SearchCategory>('all');
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listContainerRef = useRef<HTMLDivElement>(null);

  const {
    lockScreen,
    requestRestart,
    requestShutdown,
    requestSleep,
    toggleDarkMode,
    darkMode,
    toggleDoNotDisturb,
    doNotDisturb,
    toggleGpuTurbo,
    gpuTurboEnabled,
    playFeedbackTone,
  } = useSystemSettings();

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Master Global Search Database: Files, System Settings, Components, and OS Actions
  const masterSearchItems: SearchResultItem[] = useMemo(() => [
    // --- 1. ARQUIVOS SALVOS & DISCOS (FILES & STORAGE) ---
    {
      id: 'file-readme',
      appId: 'storage',
      category: 'files',
      categoryLabel: 'Documento',
      title: 'README.md',
      desc: 'Documentação oficial do InoveCloud OS e Guia Debian 13 Liquid Glass',
      pathOrDetail: '/home/inovecloud/Downloads/README.md • 2.4 KB',
      badge: 'DOC',
      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      icon: <FileText className="w-4 h-4 text-blue-400" />,
      tags: ['markdown', 'documento', 'docs', 'manual', 'inovecloud'],
    },
    {
      id: 'file-deploy-sh',
      appId: 'storage',
      category: 'files',
      categoryLabel: 'Script Shell',
      title: 'deploy-services.sh',
      desc: 'Script de automação DevOps e inicialização de serviços systemd Linux',
      pathOrDetail: '/home/inovecloud/Downloads/deploy-services.sh • 1.8 KB',
      badge: 'BASH',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      icon: <FileCode className="w-4 h-4 text-emerald-400" />,
      tags: ['shell', 'bash', 'script', 'systemd', 'devops', 'automacao'],
    },
    {
      id: 'file-config-json',
      appId: 'storage',
      category: 'files',
      categoryLabel: 'Configuração',
      title: 'settings.config.json',
      desc: 'Parâmetros de ambiente, Wayland, temas e resolução do InoveCloud OS',
      pathOrDetail: '/home/inovecloud/Documents/settings.config.json • 1.1 KB',
      badge: 'JSON',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      icon: <FileCode className="w-4 h-4 text-amber-400" />,
      tags: ['config', 'json', 'settings', 'ajustes', 'wayland'],
    },
    {
      id: 'file-server-health',
      appId: 'storage',
      category: 'files',
      categoryLabel: 'Código Node.js',
      title: 'server-health.js',
      desc: 'Microserviço de verificação de integridade e telemetria do cluster',
      pathOrDetail: '/home/inovecloud/Documents/server-health.js • 3.2 KB',
      badge: 'NODE',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      icon: <FileCode className="w-4 h-4 text-emerald-400" />,
      tags: ['node', 'javascript', 'health', 'cluster', 'servidor'],
    },
    {
      id: 'file-iso-inovecloud',
      appId: 'isobuilder',
      category: 'files',
      categoryLabel: 'Imagem ISO',
      title: 'inovecloud-os-amd64.iso',
      desc: 'Imagem ISO inicializável x86_64 Debian 13 com GNOME e Liquid Glass',
      pathOrDetail: '/var/iso-output/inovecloud-os-amd64.iso • 840 MB',
      badge: 'ISO',
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      icon: <Disc className="w-4 h-4 text-rose-400" />,
      tags: ['iso', 'debian', 'live', 'boot', 'sistema', 'imagem', 'instalação'],
    },
    {
      id: 'file-backup-tar',
      appId: 'storage',
      category: 'files',
      categoryLabel: 'Arquivo Compactado',
      title: 'backup-inovecloud-full-snapshot.tar.gz',
      desc: 'Snapshot completo de contêineres Docker, bancos de dados e home directory',
      pathOrDetail: '/media/backup/backup-inovecloud-full-snapshot.tar.gz • 4.2 GB',
      badge: 'TAR.GZ',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      icon: <FileArchive className="w-4 h-4 text-purple-400" />,
      tags: ['backup', 'tar', 'gzip', 'snapshot', 'restauração', 'arquivos'],
    },
    {
      id: 'file-audio-synth',
      appId: 'music',
      category: 'files',
      categoryLabel: 'Áudio Hi-Fi',
      title: 'Synthwave_Odyssey_2026.mp3',
      desc: 'Trilha sonora original renderizada no DAW Studio Beatmaker (320 kbps)',
      pathOrDetail: '/home/inovecloud/Music/Synthwave_Odyssey_2026.mp3 • 6.4 MB',
      badge: 'AUDIO',
      badgeColor: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
      icon: <Music className="w-4 h-4 text-pink-400" />,
      tags: ['musica', 'audio', 'synthwave', 'mp3', 'daw', 'som'],
    },
    {
      id: 'file-video-4k',
      appId: 'videoplayer',
      category: 'files',
      categoryLabel: 'Vídeo 4K HDR',
      title: 'Cyberpunk_City_4K.mp4',
      desc: 'Vídeo demo 4K UHD com aceleração de decodificação VA-API/GPU',
      pathOrDetail: '/home/inovecloud/Videos/Cyberpunk_City_4K.mp4 • 34.8 MB',
      badge: '4K MP4',
      badgeColor: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
      icon: <Video className="w-4 h-4 text-orange-400" />,
      tags: ['video', '4k', 'mp4', 'hdr', 'filme', 'player'],
    },
    {
      id: 'file-wallpaper-glass',
      appId: 'themes',
      category: 'files',
      categoryLabel: 'Imagem / Foto',
      title: 'Wallpaper_Liquid_Glass.png',
      desc: 'Papel de parede oficial 4K Ultra HD com reflexos vítreos dinâmicos',
      pathOrDetail: '/home/inovecloud/Pictures/Wallpaper_Liquid_Glass.png • 4.2 MB',
      badge: 'PNG',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      icon: <ImageIcon className="w-4 h-4 text-cyan-400" />,
      tags: ['wallpaper', 'papel de parede', 'tema', 'foto', 'fundo'],
    },
    {
      id: 'file-disk-nvme',
      appId: 'storage',
      category: 'files',
      categoryLabel: 'Disco SSD NVMe',
      title: 'SSD NVMe Kingston KC3000 (512 GB)',
      desc: 'Partição Root montada em / com sistema de arquivos ext4 e TRIM ativo',
      pathOrDetail: '/dev/nvme0n1p2 • 142.4 GB livres de 512 GB',
      badge: 'NVMe',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      icon: <HardDrive className="w-4 h-4 text-indigo-400" />,
      tags: ['disco', 'ssd', 'nvme', 'partição', 'armazenamento', 'root'],
    },
    {
      id: 'file-disk-usb',
      appId: 'storage',
      category: 'files',
      categoryLabel: 'Pendrive USB',
      title: 'Kingston DataTraveler 3.2 (64 GB)',
      desc: 'Unidade removível USB montada com acesso a backups e arquivos portáteis',
      pathOrDetail: '/media/inovecloud/KINGSTON • 49.8 GB livres de 64 GB',
      badge: 'USB',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      icon: <Usb className="w-4 h-4 text-cyan-400" />,
      tags: ['usb', 'pendrive', 'disco externo', 'kingston', 'armazenamento'],
    },

    // --- 2. AJUSTES & CONFIGURAÇÕES DO SISTEMA (SETTINGS & SYSTEM) ---
    {
      id: 'setting-wifi',
      appId: 'settings',
      category: 'settings',
      categoryLabel: 'Rede & Internet',
      title: 'Configurações de Wi-Fi e Conexão de Rede',
      desc: 'Gerenciar SSIDs conhecidos, IPv4/IPv6, DNS seguro e adaptador sem fio',
      pathOrDetail: 'Ajustes > Rede > Wi-Fi',
      badge: 'REDE',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      icon: <Wifi className="w-4 h-4 text-cyan-400" />,
      tags: ['wifi', 'rede', 'internet', 'ip', 'dns', 'conexao', 'roteador'],
    },
    {
      id: 'setting-bluetooth',
      appId: 'settings',
      category: 'settings',
      categoryLabel: 'Periféricos',
      title: 'Bluetooth & Dispositivos Pareados',
      desc: 'Conectar fones de ouvido, teclados sem fio, mouses e controle Bluetooth',
      pathOrDetail: 'Ajustes > Bluetooth',
      badge: 'BT',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      icon: <Bluetooth className="w-4 h-4 text-indigo-400" />,
      tags: ['bluetooth', 'fone', 'teclado', 'mouse', 'parear', 'sem fio'],
    },
    {
      id: 'setting-wallpaper-theme',
      appId: 'themes',
      category: 'settings',
      categoryLabel: 'Aparência',
      title: 'Papel de Parede, Temas & Estilo Liquid Glass',
      desc: 'Personalizar paleta de cores de destaque, transparência do vidro e wallpapers 4K',
      pathOrDetail: 'Ajustes > Aparência & Temas',
      badge: '4K GLASS',
      badgeColor: 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30',
      icon: <Palette className="w-4 h-4 text-fuchsia-400" />,
      tags: ['tema', 'wallpaper', 'papel de parede', 'cores', 'vidro', 'liquid glass', 'dark mode'],
    },
    {
      id: 'setting-dock',
      appId: 'settings',
      category: 'settings',
      categoryLabel: 'Interface',
      title: 'Configuração da Dock & Barra de Tarefas',
      desc: 'Ajustar posição (inferior/superior/lateral), tamanho dos ícones e efeito de zoom',
      pathOrDetail: 'Ajustes > Dock & Barra de Menus',
      badge: 'DOCK',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      icon: <Sliders className="w-4 h-4 text-purple-400" />,
      tags: ['dock', 'zoom', 'tamanho', 'posicao', 'auto hide', 'barra'],
    },
    {
      id: 'setting-display-gpu',
      appId: 'settings',
      category: 'settings',
      categoryLabel: 'Hardware',
      title: 'Monitores, Resolução & Aceleração GPU Turbo',
      desc: 'Configurar taxas de atualização (60Hz/144Hz), escala de tela e aceleração 3D',
      pathOrDetail: 'Ajustes > Tela & Gráficos',
      badge: 'GPU',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      icon: <Zap className="w-4 h-4 text-emerald-400" />,
      tags: ['tela', 'resolucao', 'monitor', 'gpu', '4k', 'escala', 'taxa de atualizacao'],
    },
    {
      id: 'setting-audio-volume',
      appId: 'settings',
      category: 'settings',
      categoryLabel: 'Áudio',
      title: 'Som, Volume & Dispositivos de Saída PipeWire',
      desc: 'Ajustar volume mestre, mixer de canais e alternar entre caixas e fone',
      pathOrDetail: 'Ajustes > Som',
      badge: 'PIPEWIRE',
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      icon: <Volume2 className="w-4 h-4 text-rose-400" />,
      tags: ['som', 'audio', 'volume', 'alto falante', 'microfone', 'pipewire'],
    },
    {
      id: 'setting-users-security',
      appId: 'user',
      category: 'settings',
      categoryLabel: 'Segurança',
      title: 'Contas de Usuário, Chaves SSH & Autenticação 2FA',
      desc: 'Gerenciar credenciais de login root/admin, chaves criptográficas e sessões ativas',
      pathOrDetail: 'Ajustes > Usuários & Chaves SSH',
      badge: '2FA',
      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      icon: <User className="w-4 h-4 text-blue-400" />,
      tags: ['usuario', 'senha', 'ssh', '2fa', 'segurança', 'perfil', 'conta'],
    },
    {
      id: 'setting-ssl-webapps',
      appId: 'webapps',
      category: 'settings',
      categoryLabel: 'Segurança Web',
      title: 'Certificados SSL Let\'s Encrypt & Proxy Reverso HTTPS',
      desc: 'Rotas automáticas HTTPS com renovação de certificado SSL para todos os domínios',
      pathOrDetail: 'Aplicações Web > Gerenciador de SSL',
      badge: 'HTTPS ON',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />,
      tags: ['ssl', 'https', 'certificados', 'letsencrypt', 'proxy', 'caddy', 'nginx'],
    },
    {
      id: 'setting-backups-migration',
      appId: 'settings',
      category: 'settings',
      categoryLabel: 'Manutenção',
      title: 'Backups Automáticos & Assistente de Migração',
      desc: 'Agendar snapshots para NAS/Cloud e migrar dados de servidores legados',
      pathOrDetail: 'Ajustes > Backups & Migração',
      badge: 'BACKUP',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      icon: <RotateCw className="w-4 h-4 text-amber-400" />,
      tags: ['backup', 'migracao', 'restaurar', 'snapshot', 'nas', 'raspberry pi'],
    },

    // --- 3. COMPONENTES & APLICATIVOS (APPS & COMPONENTS) ---
    {
      id: 'comp-vn',
      appId: 'vn',
      category: 'components',
      categoryLabel: 'Hypervisor KVM',
      title: 'Nós Virtuais (VN) & Virtual Machines',
      desc: 'Gerenciar instâncias KVM Ubuntu 24.04, Windows Server e Debian 13',
      pathOrDetail: 'App / Componente do Sistema',
      badge: '5 VMs',
      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      icon: <Server className="w-4 h-4 text-blue-400" />,
      tags: ['vn', 'vm', 'maquina virtual', 'kvm', 'ubuntu', 'windows', 'servidor', 'instancia'],
    },
    {
      id: 'comp-terminal',
      appId: 'terminal',
      category: 'components',
      categoryLabel: 'Linha de Comando',
      title: 'Terminal Root Cloud Shell (inovectl)',
      desc: 'Prompt Bash interativo com comandos APT, Docker, Systemctl e inovectl',
      pathOrDetail: 'App / Componente do Sistema',
      badge: 'ROOT CLI',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      icon: <Terminal className="w-4 h-4 text-emerald-400" />,
      tags: ['terminal', 'bash', 'shell', 'cli', 'inovectl', 'root', 'comando', 'apt'],
    },
    {
      id: 'comp-appstore',
      appId: 'appstore',
      category: 'components',
      categoryLabel: 'Central de Apps',
      title: 'App Store Hub & Pacotes Flathub Linux',
      desc: 'Instalar Nextcloud, PostgreSQL, Portainer, Ollama AI, VS Code com 1 clique',
      pathOrDetail: 'App / Componente do Sistema',
      badge: 'STORE',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      icon: <Layers className="w-4 h-4 text-purple-400" />,
      tags: ['store', 'flathub', 'flatpak', 'aplicativos', 'docker', 'nextcloud', 'postgres'],
    },
    {
      id: 'comp-browser',
      appId: 'browser',
      category: 'components',
      categoryLabel: 'Navegador',
      title: 'Navegador Web Local & DevTools',
      desc: 'Browser integrado para visualizar dashboards, portas 8080/3000 e internet',
      pathOrDetail: 'App / Componente do Sistema',
      badge: 'WEB',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      icon: <Compass className="w-4 h-4 text-cyan-400" />,
      tags: ['browser', 'navegador', 'web', 'internet', 'devtools', 'chromium'],
    },
    {
      id: 'comp-aiagent',
      appId: 'aiagent',
      category: 'components',
      categoryLabel: 'Inteligência Artificial',
      title: 'Agente IA (MCP Copilot)',
      desc: 'Assistente inteligente Gemini Cloud para operar servidores e automatizar rotinas',
      pathOrDetail: 'App / Componente do Sistema',
      badge: 'AI MCP',
      badgeColor: 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30',
      icon: <Bot className="w-4 h-4 text-fuchsia-400" />,
      tags: ['ia', 'ai', 'agente', 'mcp', 'copilot', 'gemini', 'chat', 'inteligencia'],
    },
    {
      id: 'comp-monitor',
      appId: 'monitor',
      category: 'components',
      categoryLabel: 'Telemetria',
      title: 'Monitor de Recursos & Hardware',
      desc: 'Gráficos em tempo real de uso de CPU, memória RAM, tráfego de rede e I/O de disco',
      pathOrDetail: 'App / Componente do Sistema',
      badge: 'REALTIME',
      badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
      icon: <Activity className="w-4 h-4 text-teal-400" />,
      tags: ['monitor', 'cpu', 'ram', 'hardware', 'desempenho', 'temperatura', 'processos'],
    },
    {
      id: 'comp-idaas',
      appId: 'idaas',
      category: 'components',
      categoryLabel: 'Gestão de Acesso',
      title: 'InoveCloud IDaaS & Single Sign-On (SSO)',
      desc: 'Identidades corporativas, controle de permissões e federação de login',
      pathOrDetail: 'App / Componente do Sistema',
      badge: 'IDaaS',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      icon: <Users className="w-4 h-4 text-emerald-400" />,
      tags: ['idaas', 'sso', 'login', 'usuarios', 'acesso', 'contas', 'identidade'],
    },
    {
      id: 'comp-vnc',
      appId: 'vnc',
      category: 'components',
      categoryLabel: 'Acesso Remoto',
      title: 'Conectar PC (VNC / RDP Remoto)',
      desc: 'Acesse telas de computadores remotos ou instâncias gráficas via rede local',
      pathOrDetail: 'App / Componente do Sistema',
      badge: 'REMOTE',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      icon: <Monitor className="w-4 h-4 text-cyan-400" />,
      tags: ['vnc', 'rdp', 'remoto', 'conectar', 'tela', 'computador'],
    },
    {
      id: 'comp-isobuilder',
      appId: 'isobuilder',
      category: 'components',
      categoryLabel: 'Criador de Distribuição',
      title: 'Gerador de ISO & Live OS Linux',
      desc: 'Ferramenta para compilar a ISO oficial do InoveCloud OS para Pen Drive ou VM',
      pathOrDetail: 'App / Componente do Sistema',
      badge: 'BUILDER',
      badgeColor: 'bg-red-500/20 text-red-300 border-red-500/30',
      icon: <Disc className="w-4 h-4 text-red-400" />,
      tags: ['iso', 'builder', 'gerador', 'compilar', 'live os', 'debian', 'distro'],
    },
    {
      id: 'comp-linuxpedia',
      appId: 'linuxpedia',
      category: 'components',
      categoryLabel: 'Documentação',
      title: 'LinuxPedia (API & Comandos)',
      desc: 'Enciclopédia interativa de comandos Linux, sintaxe Bash e flags essenciais',
      pathOrDetail: 'App / Componente do Sistema',
      badge: 'MANUAL',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      icon: <BookOpen className="w-4 h-4 text-emerald-400" />,
      tags: ['linuxpedia', 'manual', 'comandos', 'ajuda', 'dicionario', 'linux'],
    },
    {
      id: 'comp-music',
      appId: 'music',
      category: 'components',
      categoryLabel: 'Produção Musical',
      title: 'DAW Studio & Beatmaker Hi-Fi',
      desc: 'Estúdio de áudio multicanal, sequenciador de batidas 808 e sintetizador',
      pathOrDetail: 'App / Componente do Sistema',
      badge: 'DAW',
      badgeColor: 'bg-red-500/20 text-red-300 border-red-500/30',
      icon: <Music className="w-4 h-4 text-red-400" />,
      tags: ['musica', 'daw', 'beatmaker', 'studio', 'som', 'audio'],
    },
    {
      id: 'comp-videoplayer',
      appId: 'videoplayer',
      category: 'components',
      categoryLabel: 'Reprodutor de Mídia',
      title: 'Player de Vídeo 4K HDR',
      desc: 'Player de vídeo cinematográfico com aceleração por hardware e controles rápidos',
      pathOrDetail: 'App / Componente do Sistema',
      badge: '4K HDR',
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      icon: <Video className="w-4 h-4 text-rose-400" />,
      tags: ['video', 'player', 'filme', 'reprodutor', '4k', 'cinema'],
    },
    {
      id: 'comp-gallery',
      appId: 'gallery',
      category: 'components',
      categoryLabel: 'Fotos & Imagens',
      title: 'Galeria de Fotos & Editor Pro',
      desc: 'Visualizador de fotos em alta resolução com filtros e ferramentas de edição',
      pathOrDetail: 'App / Componente do Sistema',
      badge: 'PHOTOS',
      badgeColor: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
      icon: <ImageIcon className="w-4 h-4 text-violet-400" />,
      tags: ['galeria', 'fotos', 'editor', 'imagens', 'fotografia'],
    },

    // --- 4. AÇÕES RÁPIDAS DE SISTEMA (SYSTEM ACTIONS) ---
    {
      id: 'action-lock',
      appId: 'settings',
      category: 'actions',
      categoryLabel: 'Ação do Sistema',
      title: 'Bloquear Tela Imediatamente',
      desc: 'Exige autenticação de senha ou PIN para desbloquear a sessão',
      pathOrDetail: 'Atalho: ⌘L',
      badge: 'LOCK',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      icon: <Lock className="w-4 h-4 text-cyan-400" />,
      tags: ['bloquear', 'lock', 'tela', 'seguranca', 'proteger'],
      onSelectAction: () => {
        playFeedbackTone();
        lockScreen();
      },
    },
    {
      id: 'action-dnd',
      appId: 'settings',
      category: 'actions',
      categoryLabel: 'Ação do Sistema',
      title: doNotDisturb ? 'Desativar Modo Não Perturbe (DND)' : 'Ativar Modo Não Perturbe (DND)',
      desc: 'Silencia notificações visuais e sonoras de aplicativos em segundo plano',
      pathOrDetail: 'Central de Notificações',
      badge: doNotDisturb ? 'DND ATIVO' : 'DND INATIVO',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      icon: <BellOff className="w-4 h-4 text-purple-400" />,
      tags: ['dnd', 'silenciar', 'nao perturbe', 'notificacoes', 'silencioso'],
      onSelectAction: () => {
        toggleDoNotDisturb();
      },
    },
    {
      id: 'action-darkmode',
      appId: 'themes',
      category: 'actions',
      categoryLabel: 'Ação do Sistema',
      title: darkMode ? 'Alternar para Modo Claro' : 'Alternar para Modo Escuro (Liquid Glass)',
      desc: 'Altera o tema global de cores das janelas, menus e efeitos translúcidos',
      pathOrDetail: 'Aparência do Sistema',
      badge: 'TEMA',
      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      icon: <Moon className="w-4 h-4 text-indigo-400" />,
      tags: ['dark mode', 'modo escuro', 'modo claro', 'tema', 'aparencia'],
      onSelectAction: () => {
        toggleDarkMode();
      },
    },
    {
      id: 'action-gputurbo',
      appId: 'settings',
      category: 'actions',
      categoryLabel: 'Ação do Sistema',
      title: gpuTurboEnabled ? 'Desativar GPU Turbo Acceleration' : 'Ativar GPU Turbo Acceleration',
      desc: 'Alterna a renderização por hardware com aceleração gráfica para janelas e VMs',
      pathOrDetail: 'Ajustes > Gráficos',
      badge: 'GPU TURBO',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      icon: <Zap className="w-4 h-4 text-emerald-400" />,
      tags: ['gpu', 'turbo', 'aceleracao', 'hardware', 'desempenho'],
      onSelectAction: () => {
        toggleGpuTurbo();
      },
    },
    {
      id: 'action-restart',
      appId: 'settings',
      category: 'actions',
      categoryLabel: 'Ação do Sistema',
      title: 'Reiniciar Sistema / Servidor InoveCloud',
      desc: 'Finaliza processos em execução com segurança e reinicializa o nó',
      pathOrDetail: 'Ação de Energia',
      badge: 'REBOOT',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      icon: <RotateCw className="w-4 h-4 text-amber-400" />,
      tags: ['reiniciar', 'reboot', 'restart', 'servidor', 'energia'],
      onSelectAction: () => {
        requestRestart();
      },
    },
    {
      id: 'action-shutdown',
      appId: 'settings',
      category: 'actions',
      categoryLabel: 'Ação do Sistema',
      title: 'Desligar Computador / Servidor',
      desc: 'Envia sinal ACPI para encerramento completo dos componentes de hardware',
      pathOrDetail: 'Ação de Energia',
      badge: 'POWER',
      badgeColor: 'bg-red-500/20 text-red-300 border-red-500/30',
      icon: <Power className="w-4 h-4 text-red-400" />,
      tags: ['desligar', 'shutdown', 'power off', 'apagar', 'energia'],
      onSelectAction: () => {
        requestShutdown();
      },
    },
  ], [
    doNotDisturb,
    darkMode,
    gpuTurboEnabled,
    lockScreen,
    playFeedbackTone,
    requestRestart,
    requestShutdown,
    toggleDarkMode,
    toggleDoNotDisturb,
    toggleGpuTurbo,
  ]);

  // Filter items based on query & category
  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    return masterSearchItems.filter((item) => {
      // 1. Category Filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }
      // 2. Query Match
      if (!q) return true;

      const inTitle = item.title.toLowerCase().includes(q);
      const inDesc = item.desc.toLowerCase().includes(q);
      const inPath = item.pathOrDetail?.toLowerCase().includes(q) || false;
      const inCategory = item.categoryLabel.toLowerCase().includes(q);
      const inTags = item.tags?.some((t) => t.toLowerCase().includes(q)) || false;

      return inTitle || inDesc || inPath || inCategory || inTags;
    });
  }, [masterSearchItems, query, selectedCategory]);

  // Keep selected index within bounds
  useEffect(() => {
    if (selectedIndex >= filteredItems.length) {
      setSelectedIndex(Math.max(0, filteredItems.length - 1));
    }
  }, [filteredItems, selectedIndex]);

  // Handle Item Execution
  const handleExecuteItem = (item: SearchResultItem) => {
    if (item.onSelectAction) {
      item.onSelectAction();
    } else {
      onOpenApp(item.appId, item.actionPayload);
    }
    onClose();
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < filteredItems.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : Math.max(0, filteredItems.length - 1)));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        handleExecuteItem(filteredItems[selectedIndex]);
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      // Cycle category
      const cats: SearchCategory[] = ['all', 'files', 'settings', 'components', 'actions'];
      const currentIndex = cats.indexOf(selectedCategory);
      const nextCat = cats[(currentIndex + 1) % cats.length];
      setSelectedCategory(nextCat);
    }
  };

  if (!isOpen) return null;

  const selectedItem = filteredItems[selectedIndex] || null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/65 backdrop-blur-md flex items-start justify-center pt-16 sm:pt-20 p-3 sm:p-4 select-none animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl rounded-3xl liquid-glass shadow-[0_25px_70px_rgba(0,0,0,0.8)] border border-white/30 overflow-hidden text-slate-100 flex flex-col backdrop-blur-2xl"
        onKeyDown={handleKeyDown}
      >
        {/* Top Search Input Bar */}
        <div className="p-3.5 sm:p-4 border-b border-white/10 flex items-center space-x-3 bg-white/5 backdrop-blur-xl">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-md shrink-0">
            <Search className="w-4 h-4 text-white" />
          </div>

          <input
            ref={inputRef}
            type="text"
            placeholder="Buscar arquivos salvos, configurações, comandos ou nós virtuais..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            className="flex-1 bg-transparent text-sm sm:text-base text-white focus:outline-none placeholder-slate-400 font-medium"
            autoFocus
          />

          {query && (
            <button
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              className="text-[11px] px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer"
            >
              Limpar
            </button>
          )}

          <kbd className="px-2 py-0.5 rounded-lg bg-white/10 text-[10px] text-slate-300 font-mono border border-white/10 shrink-0">
            ESC
          </kbd>
        </div>

        {/* Category Tabs Pill Filter */}
        <div className="px-3.5 py-2 border-b border-white/10 bg-black/20 flex items-center space-x-1.5 overflow-x-auto no-scrollbar">
          {[
            { id: 'all' as SearchCategory, label: 'Todos os Resultados', count: masterSearchItems.length },
            { id: 'files' as SearchCategory, label: 'Arquivos & Discos', count: masterSearchItems.filter(i => i.category === 'files').length },
            { id: 'settings' as SearchCategory, label: 'Ajustes & Sistema', count: masterSearchItems.filter(i => i.category === 'settings').length },
            { id: 'components' as SearchCategory, label: 'Componentes & Apps', count: masterSearchItems.filter(i => i.category === 'components').length },
            { id: 'actions' as SearchCategory, label: 'Ações Rápidas', count: masterSearchItems.filter(i => i.category === 'actions').length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setSelectedCategory(tab.id);
                setSelectedIndex(0);
                inputRef.current?.focus();
              }}
              className={`px-3 py-1 rounded-full text-[11px] font-semibold transition cursor-pointer shrink-0 flex items-center space-x-1.5 ${
                selectedCategory === tab.id
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25 border border-blue-400/40'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-transparent hover:border-white/10'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[9px] px-1.5 py-0.2 rounded-full ${
                selectedCategory === tab.id ? 'bg-white/25 text-white' : 'bg-white/10 text-slate-400'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search Results Area */}
        <div className="grid grid-cols-1 md:grid-cols-12 min-h-[280px] max-h-[420px] overflow-hidden">
          {/* Left / Main Results List */}
          <div
            ref={listContainerRef}
            className="md:col-span-7 p-2 overflow-y-auto space-y-1 divide-y divide-white/5"
          >
            {filteredItems.length > 0 ? (
              filteredItems.map((item, idx) => {
                const isSelected = idx === selectedIndex;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleExecuteItem(item)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`w-full p-2.5 rounded-2xl flex items-center justify-between text-left transition cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600/35 border border-blue-400/50 shadow-md shadow-blue-900/40 translate-x-0.5'
                        : 'hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center space-x-3 min-w-0 pr-2">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border transition-all ${
                          isSelected
                            ? 'bg-gradient-to-br from-blue-500/40 to-indigo-600/40 border-blue-400/50 scale-105'
                            : 'bg-slate-900/80 border-white/10'
                        }`}
                      >
                        {item.icon}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                            {item.title}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 truncate mt-0.5">
                          {item.desc}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1.5 shrink-0">
                      {item.badge && (
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                            item.badgeColor || 'bg-slate-700 text-slate-300 border-white/10'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                      <ArrowRight
                        className={`w-3.5 h-3.5 transition-transform ${
                          isSelected ? 'text-cyan-300 translate-x-1' : 'text-slate-600'
                        }`}
                      />
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="p-10 text-center space-y-2">
                <Search className="w-8 h-8 text-slate-600 mx-auto" />
                <div className="text-xs font-semibold text-slate-400">
                  Nenhum arquivo, ajuste ou componente encontrado para "{query}".
                </div>
                <div className="text-[11px] text-slate-500">
                  Tente buscar por termos como "README", "Wi-Fi", "Docker", "KVM", "SSL", "ISO" ou "Tema".
                </div>
              </div>
            )}
          </div>

          {/* Right Detail / Quick Action Inspector (Desktop) */}
          <div className="hidden md:flex md:col-span-5 p-4 border-l border-white/10 bg-black/25 flex-col justify-between">
            {selectedItem ? (
              <div className="space-y-3">
                <div className="flex items-center space-x-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center shadow-lg">
                    {selectedItem.icon}
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-400">
                      {selectedItem.categoryLabel}
                    </span>
                    <h4 className="text-sm font-bold text-white leading-tight">
                      {selectedItem.title}
                    </h4>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-2 text-xs">
                  <div className="text-slate-300 text-[11px] leading-relaxed">
                    {selectedItem.desc}
                  </div>

                  {selectedItem.pathOrDetail && (
                    <div className="pt-2 border-t border-white/10 font-mono text-[10px] text-slate-400 break-all">
                      {selectedItem.pathOrDetail}
                    </div>
                  )}

                  {selectedItem.tags && selectedItem.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {selectedItem.tags.slice(0, 4).map((tag) => (
                        <span key={tag} className="text-[9px] px-1.5 py-0.2 rounded bg-white/10 text-slate-300">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-500 text-center my-auto">
                Selecione um item da lista para visualizar detalhes e executar ações.
              </div>
            )}

            {selectedItem && (
              <button
                onClick={() => handleExecuteItem(selectedItem)}
                className="w-full py-2.5 px-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 border border-blue-400/40 flex items-center justify-center space-x-2 transition active:scale-95 cursor-pointer mt-3"
              >
                <span>{selectedItem.category === 'actions' ? 'Executar Ação' : 'Abrir no Sistema'}</span>
                <kbd className="px-1.5 py-0.2 rounded bg-black/30 text-[9px] font-mono border border-white/20">
                  ↵ ENTER
                </kbd>
              </button>
            )}
          </div>
        </div>

        {/* Bottom Footer Status & Shortcut Bar */}
        <div className="px-4 py-2.5 border-t border-white/10 bg-black/40 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
          <div className="flex items-center space-x-3">
            <span className="flex items-center space-x-1">
              <kbd className="px-1.5 py-0.2 rounded bg-white/10 text-[9px] font-mono text-slate-300">↑</kbd>
              <kbd className="px-1.5 py-0.2 rounded bg-white/10 text-[9px] font-mono text-slate-300">↓</kbd>
              <span>Navegar</span>
            </span>
            <span className="flex items-center space-x-1">
              <kbd className="px-1.5 py-0.2 rounded bg-white/10 text-[9px] font-mono text-slate-300">TAB</kbd>
              <span>Mudar Categoria</span>
            </span>
            <span className="flex items-center space-x-1">
              <kbd className="px-1.5 py-0.2 rounded bg-white/10 text-[9px] font-mono text-slate-300">↵</kbd>
              <span>Abrir</span>
            </span>
          </div>

          <div className="flex items-center space-x-1.5 text-cyan-300 font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Busca Global InoveCloud OS</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpotlightSearch;
