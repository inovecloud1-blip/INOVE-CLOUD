import React, { useState, useEffect, useRef } from 'react';
import {
  Users,
  Image as ImageIcon,
  LayoutGrid,
  Globe,
  HardDrive,
  Sliders,
  Share2,
  History,
  ArrowRightLeft,
  ChevronRight,
  Search,
  Check,
  RotateCcw,
  Power,
  LogOut,
  RefreshCw,
  Cpu,
  Zap,
  Thermometer,
  ShieldCheck,
  FolderLock,
  Lock,
  Plus,
  Trash2,
  ExternalLink,
  ChevronDown,
  Sparkles,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  Server,
  Upload,
  Layers,
  Copy
} from 'lucide-react';
import { WALLPAPERS } from '../../data/mockData';
import { DesktopWidgetsConfig, DockConfig, AppId } from '../../types';
import { useSystemSettings } from '../../context/SystemSettingsContext';
import { useSoundEffects } from '../../context/SoundEffectsContext';

interface UmbrelSettingsProps {
  currentWallpaper: string;
  onSelectWallpaper: (url: string) => void;
  gpuEnabled: boolean;
  onToggleGpu: () => void;
  widgetsConfig?: DesktopWidgetsConfig;
  onUpdateWidgetsConfig?: (config: Partial<DesktopWidgetsConfig>) => void;
  onResetWidgetsConfig?: () => void;
  dockConfig?: DockConfig;
  onUpdateDockConfig?: (config: Partial<DockConfig>) => void;
  dockPinnedApps?: AppId[];
  onTogglePinDock?: (id: AppId) => void;
  onResetDockDefault?: () => void;
  onAutoConfigSystem?: () => void;
  onClose?: () => void;
}

type TabCategory = 'tudo' | 'conta' | 'armazenamento' | 'sistema' | 'solucionar';

export const UmbrelSettingsView: React.FC<UmbrelSettingsProps> = ({
  currentWallpaper,
  onSelectWallpaper,
  gpuEnabled,
  onToggleGpu,
  widgetsConfig,
  onUpdateWidgetsConfig,
  onResetWidgetsConfig,
  dockConfig,
  onUpdateDockConfig,
  dockPinnedApps,
  onTogglePinDock,
  onResetDockDefault,
  onAutoConfigSystem,
  onClose,
}) => {
  const sysSettings = useSystemSettings();
  const soundEffects = useSoundEffects();

  // Navigation / Filter State
  const [activeTab, setActiveTab] = useState<TabCategory>('tudo');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeModal, setActiveModal] = useState<string | null>(null);

  // User Profile
  const [deviceName, setDeviceName] = useState("Felipe's Umbrel");
  const [isEditingName, setIsEditingName] = useState(false);
  const [userInitial, setUserInitial] = useState('F');
  const [selectedLanguage, setSelectedLanguage] = useState('Português');
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [isBackupConfigOpen, setIsBackupConfigOpen] = useState(false);
  const [isBackupRestoreOpen, setIsBackupRestoreOpen] = useState(false);
  const [copiedIp, setCopiedIp] = useState(false);

  // System Stats (Fluctuating Realtime Simulation)
  const [cpuUsage, setCpuUsage] = useState(59);
  const [memUsage, setMemUsage] = useState(1.33);
  const [memTotal] = useState(3.99);
  const [storageUsed, setStorageUsed] = useState(17.1);
  const [storageTotal] = useState(66.2);
  const [cpuTemp, setCpuTemp] = useState(42);
  const [uptimeHours, setUptimeHours] = useState(6);

  // Power action state
  const [powerPrompt, setPowerPrompt] = useState<'restart' | 'shutdown' | 'logout' | null>(null);
  const [updateChecking, setUpdateChecking] = useState(false);
  const [updateFeedback, setUpdateFeedback] = useState<string | null>(null);

  // File Sharing state
  const [smbEnabled, setSmbEnabled] = useState(true);
  const [smbShareName, setSmbShareName] = useState('umbrel-storage');
  const [smbGuestAccess, setSmbGuestAccess] = useState(false);

  // Users Management state
  const [usersList, setUsersList] = useState([
    { id: '1', name: 'Felipe (Admin)', role: 'Administrador', email: 'felipe@umbrel.local', initial: 'F', color: 'from-amber-500 to-rose-500' },
    { id: '2', name: 'Convidado', role: 'Acesso Limitado', email: 'guest@umbrel.local', initial: 'C', color: 'from-blue-500 to-indigo-500' },
  ]);
  const [newUserName, setNewUserName] = useState('');
  const [newUserRole, setNewUserRole] = useState('Acesso Limitado');

  // Apps Management state
  const [installedApps, setInstalledApps] = useState([
    { id: 'nextcloud', name: 'Nextcloud Hub', category: 'Armazenamento & Nuvem', size: '4.2 GB', port: '8080', running: true, icon: '☁️' },
    { id: 'bitcoin', name: 'Bitcoin Node Core', category: 'Finanças & Cripto', size: '512 GB', port: '8332', running: true, icon: '₿' },
    { id: 'pihole', name: 'Pi-hole DNS Adblock', category: 'Rede & Segurança', size: '320 MB', port: '80', running: true, icon: '🛡️' },
    { id: 'homeassistant', name: 'Home Assistant', category: 'Automação Residencial', size: '1.8 GB', port: '8123', running: true, icon: '🏠' },
    { id: 'plex', name: 'Plex Media Server', category: 'Mídia & Streaming', size: '8.4 GB', port: '32400', running: true, icon: '🎬' },
    { id: 'code', name: 'VS Code Server', category: 'Desenvolvimento', size: '950 MB', port: '8443', running: true, icon: '💻' },
  ]);

  // Live fluctuating telemetry
  useEffect(() => {
    const timer = setInterval(() => {
      setCpuUsage((prev) => Math.min(95, Math.max(12, prev + (Math.random() * 8 - 4))));
      setMemUsage((prev) => Number((Math.min(3.6, Math.max(1.1, prev + (Math.random() * 0.1 - 0.05)))).toFixed(2)));
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const copyLocalIp = () => {
    navigator.clipboard.writeText('192.168.0.106');
    setCopiedIp(true);
    soundEffects.playPop('click');
    setTimeout(() => setCopiedIp(false), 2500);
  };

  const handleCheckUpdate = () => {
    setUpdateChecking(true);
    soundEffects.playPop('click');
    setTimeout(() => {
      setUpdateChecking(false);
      setUpdateFeedback('O umbrelOS 2.0 / InoveCloud OS está atualizado para a versão mais recente.');
      setTimeout(() => setUpdateFeedback(null), 4000);
    }, 1800);
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim()) return;
    const initial = newUserName.trim().charAt(0).toUpperCase();
    setUsersList((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        name: newUserName.trim(),
        role: newUserRole,
        email: `${newUserName.toLowerCase().replace(/\s+/g, '')}@umbrel.local`,
        initial,
        color: 'from-emerald-500 to-teal-500',
      },
    ]);
    setNewUserName('');
    soundEffects.playPop('on');
  };

  const languages = ['Português', 'English', 'Español', 'Deutsch', 'Français', 'Italiano'];

  // Card filter items based on search and tab
  const allCards = [
    {
      id: 'usuarios',
      category: 'conta',
      title: 'Usuários',
      description: 'Crie usuários adicionais e selecione quais aplicativos e pastas eles podem acessar',
      icon: Users,
      iconGradient: 'from-orange-600 to-rose-600',
      actionType: 'chevron',
      keywords: 'usuarios contas login perfil permissions senha',
    },
    {
      id: 'wallpaper',
      category: 'sistema',
      title: 'Papel de parede',
      description: 'Seu papel de parede e tema do Umbrel',
      icon: ImageIcon,
      iconGradient: 'from-amber-600 to-orange-600',
      actionType: 'wallpaper_strip',
      keywords: 'wallpaper papel de parede fundo background tema visual glass',
    },
    {
      id: 'widgets',
      category: 'sistema',
      title: 'Widgets',
      description: 'Gerencie os widgets na tela inicial',
      icon: LayoutGrid,
      iconGradient: 'from-amber-700 to-orange-700',
      actionType: 'chevron',
      keywords: 'widgets cards tela inicial relogio clima cpu monitor notas',
    },
    {
      id: 'idioma',
      category: 'conta',
      title: 'Idioma',
      description: 'Escolha seu idioma preferido do umbrelOS',
      icon: Globe,
      iconGradient: 'from-orange-600 to-amber-700',
      actionType: 'dropdown',
      keywords: 'idioma lingua language portugues ingles traducao locale',
    },
    {
      id: 'armazenamento',
      category: 'armazenamento',
      title: 'Gerenciador de Armazenamento',
      description: 'Veja o armazenamento, a integridade e as configurações das suas unidades de armazenamento',
      icon: HardDrive,
      iconGradient: 'from-rose-600 to-amber-600',
      actionType: 'chevron',
      keywords: 'armazenamento disco ssd nvme hdd formatar espaco raid integridade smart',
    },
    {
      id: 'apps_config',
      category: 'sistema',
      title: 'Configurações dos aplicativos',
      description: 'Gerencie o armazenamento, o login, as conexões e muito mais dos seus aplicativos',
      icon: Sliders,
      iconGradient: 'from-orange-600 to-red-600',
      actionType: 'chevron',
      keywords: 'aplicativos apps portas conexoes nextcloud bitcoin home assistant plex',
    },
    {
      id: 'compartilhamento',
      category: 'armazenamento',
      title: 'Compartilhamento de arquivos',
      description: 'Acesse seus arquivos no estilo Dropbox como uma pasta de rede (SMB) em outros dispositivos',
      icon: Share2,
      iconGradient: 'from-orange-700 to-rose-700',
      actionType: 'chevron',
      keywords: 'compartilhamento rede smb samba nfs dropbox windows mac linux arquivos',
    },
    {
      id: 'backups',
      category: 'armazenamento',
      title: 'Backups',
      description: 'Faça backup dos seus arquivos, apps e dados para outro Umbrel, NAS ou disco externo',
      icon: History,
      iconGradient: 'from-amber-600 to-rose-600',
      actionType: 'backup_buttons',
      keywords: 'backup restaurar snapshot copia seguranca nuvem disco externo',
    },
    {
      id: 'migracao',
      category: 'sistema',
      title: 'Assistente de Migração',
      description: 'Transfira todos os seus aplicativos e dados de um Raspberry Pi para Umbrel Home ou Umbrel Pro',
      icon: ArrowRightLeft,
      iconGradient: 'from-orange-600 to-amber-600',
      actionType: 'chevron',
      keywords: 'migracao raspberry pi transferencia importar dados umbrel home pro pc',
    },
    {
      id: 'solucionar_auto',
      category: 'solucionar',
      title: 'Automação & Auto-Reparo Inteligente',
      description: 'Repare automaticamente erros no boot, reindexe atalhos do sistema e sintonize a GPU em 1 clique',
      icon: Wrench,
      iconGradient: 'from-red-600 to-rose-600',
      actionType: 'chevron',
      keywords: 'solucionar problemas auto reparo boot erros launcher gpu otimizar diagnostico',
    },
    {
      id: 'debian_kernel',
      category: 'sistema',
      title: 'Debian 13 & Pure Kernel Host',
      description: 'Gerenciamento de kernel Linux 6.12+, drivers Mesa 3D, rede e serviços systemd nativos',
      icon: Server,
      iconGradient: 'from-red-700 to-rose-800',
      actionType: 'chevron',
      keywords: 'debian 13 trixie kernel puro linux systemd drivers mesa drm kms rede',
    },
  ];

  const filteredCards = allCards.filter((card) => {
    const matchesTab = activeTab === 'tudo' || card.category === activeTab;
    const matchesSearch =
      searchQuery.trim() === '' ||
      card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.keywords.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="relative w-full h-full bg-[#0d0908] text-slate-100 flex flex-col font-sans select-none overflow-hidden">
      {/* Background Ambience: Warm glowing orange/terracotta radial lights */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-gradient-to-br from-orange-600/20 via-amber-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-0 w-80 h-80 bg-gradient-to-bl from-rose-600/15 via-orange-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Main Responsive Two-Column Layout */}
      <div className="relative z-10 flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* =================================================================== */}
        {/* LEFT PANEL: DEVICE PREVIEW, SPECS & GAUGES */}
        {/* =================================================================== */}
        <div className="w-full lg:w-[360px] xl:w-[400px] shrink-0 border-b lg:border-b-0 lg:border-r border-white/10 p-5 sm:p-6 overflow-y-auto space-y-6 flex flex-col justify-between">
          <div className="space-y-6">
            {/* Header: Configurações Title */}
            <div className="flex items-center justify-between">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Configurações
              </h1>
            </div>

            {/* Desktop Screen Live Preview Card with Avatar Badge */}
            <div className="relative rounded-3xl overflow-hidden border border-white/15 shadow-2xl bg-black/40 group">
              <div className="relative aspect-[16/10] w-full overflow-hidden">
                <img
                  src={currentWallpaper}
                  alt="Desktop Wallpaper"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                />
                {/* Mini desktop simulation overlay */}
                <div className="absolute inset-0 bg-black/25 flex flex-col justify-between p-3 pointer-events-none">
                  <div className="flex items-center justify-between text-[8px] text-white/80 font-mono">
                    <span>10:40</span>
                    <div className="flex space-x-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    </div>
                  </div>
                  {/* Mini Dock */}
                  <div className="self-center px-2 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span className="w-2 h-2 rounded-full bg-blue-400" />
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="w-2 h-2 rounded-full bg-purple-400" />
                  </div>
                </div>
              </div>

              {/* Glowing Round Avatar Badge at bottom-left corner of preview */}
              <div className="absolute -bottom-1 left-4 translate-y-1/2 w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 via-rose-500 to-amber-600 p-0.5 shadow-xl shadow-orange-600/30">
                <div className="w-full h-full rounded-[14px] bg-[#160d0a] flex items-center justify-center text-white font-black text-lg">
                  {userInitial}
                </div>
              </div>
            </div>

            {/* Device Name with Editable Click */}
            <div className="pt-5 flex items-center justify-between">
              {isEditingName ? (
                <input
                  type="text"
                  value={deviceName}
                  onChange={(e) => {
                    setDeviceName(e.target.value);
                    if (e.target.value) setUserInitial(e.target.value.charAt(0).toUpperCase());
                  }}
                  onBlur={() => setIsEditingName(false)}
                  onKeyDown={(e) => e.key === 'Enter' && setIsEditingName(false)}
                  autoFocus
                  className="px-3 py-1.5 bg-black/50 border border-orange-500/50 rounded-xl text-lg font-bold text-white focus:outline-none w-full"
                />
              ) : (
                <div
                  onClick={() => setIsEditingName(true)}
                  className="group flex items-center space-x-2 cursor-pointer"
                  title="Clique para renomear seu dispositivo"
                >
                  <h2 className="text-xl font-bold text-white tracking-tight group-hover:text-orange-400 transition">
                    {deviceName}
                  </h2>
                  <span className="text-[10px] text-slate-500 opacity-0 group-hover:opacity-100 transition">✏️</span>
                </div>
              )}
            </div>

            {/* System Info Table */}
            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex items-center justify-between py-1 border-b border-white/5">
                <span className="text-slate-400">Em execução</span>
                <span className="font-semibold text-white">umbrelOS 2.0 Beta 2</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-white/5">
                <span className="text-slate-400">Dispositivo</span>
                <span className="font-semibold text-white">VirtualBox / PC x86_64</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-white/5">
                <span className="text-slate-400">IP Local</span>
                <button
                  onClick={copyLocalIp}
                  className="font-mono font-semibold text-white hover:text-orange-400 flex items-center space-x-1 cursor-pointer"
                >
                  <span>192.168.0.106</span>
                  {copiedIp ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 opacity-60" />}
                </button>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-400">Tempo de funcionamento</span>
                <span className="font-semibold text-white">{uptimeHours} horas</span>
              </div>
            </div>

            {/* Power Action Buttons: [Sair] [Reiniciar] [Desligar] */}
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => {
                  soundEffects.playPop('off');
                  setPowerPrompt('logout');
                }}
                className="py-2 px-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white transition flex items-center justify-center space-x-1 cursor-pointer"
              >
                <span>Sair</span>
              </button>
              <button
                onClick={() => {
                  soundEffects.playPop('click');
                  setPowerPrompt('restart');
                }}
                className="py-2 px-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white transition flex items-center justify-center space-x-1 cursor-pointer"
              >
                <span>Reiniciar</span>
              </button>
              <button
                onClick={() => {
                  soundEffects.playPop('off');
                  setPowerPrompt('shutdown');
                }}
                className="py-2 px-3 rounded-2xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/30 text-xs font-bold text-rose-400 hover:text-rose-300 transition flex items-center justify-center space-x-1 cursor-pointer"
              >
                <span>Desligar</span>
              </button>
            </div>

            {/* Real-time Telemetry Glass Cards */}
            <div className="space-y-3 pt-2">
              {/* Storage Gauge */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Armazenamento</span>
                  <span className="font-mono font-bold text-white">
                    {storageUsed} GB <span className="text-slate-500 font-normal">/ {storageTotal} GB</span>
                  </span>
                </div>
                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-orange-500 to-rose-500 rounded-full transition-all duration-500"
                    style={{ width: `${(storageUsed / storageTotal) * 100}%` }}
                  />
                </div>
              </div>

              {/* Memory Gauge */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Memória</span>
                  <span className="font-mono font-bold text-white">
                    {memUsage} GB <span className="text-slate-500 font-normal">/ {memTotal} GB</span>
                  </span>
                </div>
                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-orange-500 to-rose-500 rounded-full transition-all duration-500"
                    style={{ width: `${(memUsage / memTotal) * 100}%` }}
                  />
                </div>
              </div>

              {/* CPU Usage */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">CPU</span>
                  <span className="font-mono font-bold text-white">{Math.round(cpuUsage)}%</span>
                </div>
                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-orange-500 to-rose-500 rounded-full transition-all duration-500"
                    style={{ width: `${cpuUsage}%` }}
                  />
                </div>
              </div>

              {/* CPU Temperature */}
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Temperatura da CPU</span>
                <span className="font-mono font-bold text-slate-300">{cpuTemp} °C (Normal)</span>
              </div>
            </div>
          </div>
        </div>

        {/* =================================================================== */}
        {/* RIGHT MAIN PANEL: UMBREL GLASS CARDS & INTERACTIVE CONTROLS */}
        {/* =================================================================== */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Filter Bar: Category Pills + Search */}
          <div className="p-5 sm:p-6 pb-4 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Category Pills: [Tudo] [Conta] [Armazenamento] [Sistema] [Solucionar problemas] */}
            <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-0.5">
              {[
                { id: 'tudo', label: 'Tudo' },
                { id: 'conta', label: 'Conta' },
                { id: 'armazenamento', label: 'Armazenamento' },
                { id: 'sistema', label: 'Sistema' },
                { id: 'solucionar', label: 'Solucionar problemas' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as TabCategory);
                    soundEffects.playPop('click');
                  }}
                  className={`px-3.5 py-1.5 rounded-2xl text-xs font-semibold transition whitespace-nowrap cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-orange-700/80 to-rose-700/80 text-white shadow-lg border border-orange-500/40'
                      : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-transparent'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search Bar on Right */}
            <div className="relative min-w-[220px] max-w-xs">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Pesquisar..."
                className="w-full pl-9 pr-4 py-1.5 bg-white/5 border border-white/10 rounded-2xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-orange-500/50 focus:bg-white/10 transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Cards List Container */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-3">
            {filteredCards.length === 0 ? (
              <div className="py-16 text-center text-slate-400 text-xs space-y-2">
                <Search className="w-8 h-8 text-slate-600 mx-auto" />
                <p>Nenhuma configuração encontrada para "{searchQuery}".</p>
              </div>
            ) : (
              filteredCards.map((card) => {
                const IconComponent = card.icon;

                return (
                  <div
                    key={card.id}
                    onClick={() => {
                      if (card.actionType === 'chevron') {
                        setActiveModal(card.id);
                        soundEffects.playPop('click');
                      }
                    }}
                    className={`group relative p-4 sm:p-5 rounded-3xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 hover:border-white/20 transition-all duration-300 flex items-center justify-between gap-4 ${
                      card.actionType === 'chevron' ? 'cursor-pointer' : ''
                    }`}
                  >
                    {/* Left: Rounded Icon + Title + Description */}
                    <div className="flex items-center space-x-4 min-w-0">
                      <div
                        className={`w-12 h-12 shrink-0 rounded-2xl bg-gradient-to-br ${card.iconGradient} flex items-center justify-center text-white shadow-lg`}
                      >
                        <IconComponent className="w-5 h-5 text-white" />
                      </div>
                      <div className="truncate">
                        <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-orange-300 transition truncate">
                          {card.title}
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                          {card.description}
                        </p>
                      </div>
                    </div>

                    {/* Right Action Element */}
                    <div className="shrink-0 flex items-center space-x-2">
                      {/* Wallpaper Thumbnail Strip */}
                      {card.actionType === 'wallpaper_strip' && (
                        <div className="flex items-center space-x-1.5 overflow-hidden">
                          {WALLPAPERS.slice(0, 4).map((wp) => {
                            const isSelected = currentWallpaper === wp.url;
                            return (
                              <button
                                key={wp.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onSelectWallpaper(wp.url);
                                  soundEffects.playPop('click');
                                }}
                                className={`relative w-12 h-8 rounded-lg overflow-hidden border-2 transition transform hover:scale-105 ${
                                  isSelected
                                    ? 'border-orange-500 ring-2 ring-orange-500/50 shadow-lg'
                                    : 'border-white/20 opacity-70 hover:opacity-100'
                                }`}
                              >
                                <img src={wp.url} alt={wp.name} className="w-full h-full object-cover" />
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* Language Dropdown */}
                      {card.actionType === 'dropdown' && (
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsLangDropdownOpen(!isLangDropdownOpen);
                            }}
                            className="px-3.5 py-1.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-semibold text-white flex items-center space-x-1.5 transition"
                          >
                            <span>{selectedLanguage}</span>
                            <ChevronDown className="w-3 h-3 text-slate-400" />
                          </button>

                          {isLangDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-36 rounded-2xl bg-slate-900 border border-white/15 shadow-2xl p-1.5 z-50 space-y-1">
                              {languages.map((lang) => (
                                <button
                                  key={lang}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedLanguage(lang);
                                    setIsLangDropdownOpen(false);
                                    soundEffects.playPop('click');
                                  }}
                                  className={`w-full text-left px-3 py-1.5 rounded-xl text-xs transition flex items-center justify-between ${
                                    selectedLanguage === lang
                                      ? 'bg-orange-600/30 text-orange-300 font-bold'
                                      : 'text-slate-300 hover:bg-white/10'
                                  }`}
                                >
                                  <span>{lang}</span>
                                  {selectedLanguage === lang && <Check className="w-3 h-3 text-orange-400" />}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Backup Action Buttons */}
                      {card.actionType === 'backup_buttons' && (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveModal('backups');
                            }}
                            className="px-3 py-1.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-semibold text-white transition flex items-center space-x-1"
                          >
                            <span>Configurar</span>
                            <ChevronDown className="w-3 h-3 opacity-60" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveModal('backups');
                            }}
                            className="px-3 py-1.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-semibold text-white transition flex items-center space-x-1"
                          >
                            <span>Restaurar</span>
                            <ChevronDown className="w-3 h-3 opacity-60" />
                          </button>
                        </div>
                      )}

                      {/* Standard Chevron Right */}
                      {card.actionType === 'chevron' && (
                        <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition" />
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Bottom Bar: Check Update & System Status */}
          <div className="p-4 sm:p-5 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 bg-black/20">
            <div className="text-xs text-slate-400 flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>InoveCloud / umbrelOS 2.0 LTS (Pure Debian 13 Kernel)</span>
            </div>

            <div className="flex items-center space-x-3">
              {updateFeedback && (
                <span className="text-xs text-emerald-400 font-semibold">{updateFeedback}</span>
              )}
              <button
                onClick={handleCheckUpdate}
                disabled={updateChecking}
                className="px-4 py-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-bold text-white transition flex items-center space-x-2 cursor-pointer"
              >
                {updateChecking ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-orange-400" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                )}
                <span>{updateChecking ? 'Verificando...' : 'Verificar atualização'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* MODAL / SUB-VIEW OVERLAYS (USERS, STORAGE, APPS, WIDGETS, ETC.) */}
      {/* =================================================================== */}
      {activeModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#140d0a] border border-orange-500/30 rounded-3xl p-6 shadow-2xl space-y-6 max-h-[85vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-lg font-bold text-white">
                {activeModal === 'usuarios' && 'Gerenciador de Usuários & Contas'}
                {activeModal === 'widgets' && 'Configuração de Widgets da Tela Inicial'}
                {activeModal === 'armazenamento' && 'Gerenciador de Armazenamento & Discos'}
                {activeModal === 'apps_config' && 'Configurações dos Aplicativos Instalados'}
                {activeModal === 'compartilhamento' && 'Compartilhamento de Rede SMB & Arquivos'}
                {activeModal === 'backups' && 'Gerenciador de Backups & Snapshots'}
                {activeModal === 'migracao' && 'Assistente de Migração do Sistema'}
                {activeModal === 'solucionar_auto' && 'Auto-Configuração & Auto-Reparo Inteligente'}
                {activeModal === 'debian_kernel' && 'Debian 13 Trixie & Pure Kernel Host'}
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            {/* Modal Body: Users */}
            {activeModal === 'usuarios' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  {usersList.map((user) => (
                    <div
                      key={user.id}
                      className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-10 h-10 rounded-xl bg-gradient-to-br ${user.color} flex items-center justify-center text-white font-black`}
                        >
                          {user.initial}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white">{user.name}</h4>
                          <p className="text-xs text-slate-400">{user.email} • {user.role}</p>
                        </div>
                      </div>
                      <span className="text-xs px-2.5 py-1 rounded-xl bg-white/10 text-slate-300 font-semibold">
                        {user.role}
                      </span>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleAddUser} className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3">
                  <h4 className="text-xs font-bold text-slate-300">Adicionar Novo Usuário</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Nome do usuário..."
                      value={newUserName}
                      onChange={(e) => setNewUserName(e.target.value)}
                      className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500"
                    />
                    <select
                      value={newUserRole}
                      onChange={(e) => setNewUserRole(e.target.value)}
                      className="px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500"
                    >
                      <option value="Administrador">Administrador</option>
                      <option value="Acesso Limitado">Acesso Limitado</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-xs font-bold text-white transition"
                  >
                    Criar Usuário
                  </button>
                </form>
              </div>
            )}

            {/* Modal Body: Widgets */}
            {activeModal === 'widgets' && (
              <div className="space-y-4">
                <p className="text-xs text-slate-400">
                  Selecione quais cartões e widgets dinâmicos devem ser fixados no painel da área de trabalho:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { key: 'showClock', label: 'Relógio & Data com Vidro', desc: 'Exibe hora sincronizada' },
                    { key: 'showSystemMonitor', label: 'Monitor de CPU / RAM', desc: 'Gráficos de uso em tempo real' },
                    { key: 'showStorageCard', label: 'Cartão de Armazenamento', desc: 'Espaço em disco NVMe/SATA' },
                    { key: 'showNetworkCard', label: 'Velocidade de Rede', desc: 'Tráfego de download/upload' },
                    { key: 'showWeather', label: 'Clima & Temperatura', desc: 'Previsão do tempo local' },
                    { key: 'showQuickNotes', label: 'Bloco de Notas Rápido', desc: 'Anotações instantâneas' },
                  ].map((widget) => (
                    <div
                      key={widget.key}
                      onClick={() => {
                        if (onUpdateWidgetsConfig && widgetsConfig) {
                          onUpdateWidgetsConfig({
                            [widget.key]: !widgetsConfig[widget.key as keyof DesktopWidgetsConfig],
                          });
                          soundEffects.playPop('click');
                        }
                      }}
                      className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-between cursor-pointer transition"
                    >
                      <div>
                        <h4 className="text-xs font-bold text-white">{widget.label}</h4>
                        <p className="text-[11px] text-slate-400">{widget.desc}</p>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                          widgetsConfig && (widgetsConfig as any)[widget.key]
                            ? 'bg-orange-600 border-orange-500 text-white'
                            : 'border-white/20 bg-black/40'
                        }`}
                      >
                        {widgetsConfig && (widgetsConfig as any)[widget.key] && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Modal Body: Storage */}
            {activeModal === 'armazenamento' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">NVMe M.2 Principal (Sistema & Apps)</h4>
                      <p className="text-xs text-slate-400">Ponto de montagem: / • Sistema de arquivos: ext4</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      100% Saudável (SMART OK)
                    </span>
                  </div>
                  <div className="h-2.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-orange-500 to-rose-500 w-[25.8%]" />
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>17.1 GB Usados</span>
                    <span>49.1 GB Livres (Total: 66.2 GB)</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                  <h4 className="text-xs font-bold text-slate-300">Unidades Externas & RAID</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Você pode conectar discos USB externos ou matrizes de armazenamento SATA para expandir a capacidade de armazenamento do Nextcloud e Bitcoin Node.
                  </p>
                </div>
              </div>
            )}

            {/* Modal Body: Apps Config */}
            {activeModal === 'apps_config' && (
              <div className="space-y-3">
                {installedApps.map((app) => (
                  <div
                    key={app.id}
                    className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{app.icon}</span>
                      <div>
                        <h4 className="text-sm font-bold text-white">{app.name}</h4>
                        <p className="text-xs text-slate-400">{app.category} • Porta :{app.port} • {app.size}</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-emerald-500/20 text-emerald-300">
                      Executando
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Modal Body: File Sharing */}
            {activeModal === 'compartilhamento' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white">Servidor Samba (SMB / Windows / Mac)</h4>
                    <p className="text-xs text-slate-400">Compartilha pastas na rede local com velocidade gigabit</p>
                  </div>
                  <button
                    onClick={() => {
                      setSmbEnabled(!smbEnabled);
                      soundEffects.playPop('click');
                    }}
                    className={`w-12 h-6 rounded-full transition p-0.5 ${
                      smbEnabled ? 'bg-orange-600' : 'bg-white/10'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white transition transform ${
                        smbEnabled ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-black/40 border border-white/10 text-xs font-mono space-y-2">
                  <span className="text-slate-400">Caminho de Acesso na Rede Local:</span>
                  <div className="p-2.5 rounded-xl bg-white/5 text-orange-300 select-all">
                    smb://192.168.0.106/storage
                  </div>
                </div>
              </div>
            )}

            {/* Modal Body: Backups */}
            {activeModal === 'backups' && (
              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-gradient-to-r from-orange-950/40 via-slate-900 to-slate-950 border border-orange-500/30 space-y-2">
                  <h4 className="text-base font-bold text-white">Backup Automatizado da Nuvem</h4>
                  <p className="text-xs text-slate-300">
                    Seus dados de aplicativos, senhas e configurações são criptografados com chave AES-256 e salvos com segurança.
                  </p>
                  <div className="pt-2 flex items-center space-x-2">
                    <span className="text-xs text-emerald-400 font-semibold">● Último backup: Hoje, às 04:00 AM</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    soundEffects.playPop('click');
                    setActiveModal(null);
                  }}
                  className="w-full py-3 rounded-2xl bg-orange-600 hover:bg-orange-500 text-xs font-bold text-white transition cursor-pointer"
                >
                  Fazer Backup Manual Agora
                </button>
              </div>
            )}

            {/* Modal Body: Migration */}
            {activeModal === 'migracao' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                  <h4 className="text-sm font-bold text-white">Transferência Sem Perda de Dados</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Conecte o seu Raspberry Pi ou disco antigo pela rede local para importar automaticamente todos os contêineres Docker, banco de dados e arquivos para o InoveCloud / UmbrelOS.
                  </p>
                </div>
                <button
                  onClick={() => setActiveModal(null)}
                  className="w-full py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-xs font-bold text-white transition"
                >
                  Iniciar Busca de Dispositivos na Rede
                </button>
              </div>
            )}

            {/* Modal Body: Auto Config / Troubleshooting */}
            {activeModal === 'solucionar_auto' && (
              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-gradient-to-r from-red-950/40 via-slate-900 to-slate-950 border border-red-500/30 space-y-2">
                  <h4 className="text-base font-bold text-white">Auto-Configuração & Auto-Reparo Inteligente</h4>
                  <p className="text-xs text-slate-300">
                    Higieniza o cache de inicialização, redefine a Dock e o Launcher e ativa a aceleração 3D por hardware.
                  </p>
                </div>

                <button
                  onClick={() => {
                    if (onAutoConfigSystem) onAutoConfigSystem();
                    soundEffects.playPop('on');
                    setActiveModal(null);
                  }}
                  className="w-full py-3 rounded-2xl bg-red-600 hover:bg-red-500 text-xs font-bold text-white transition flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <Wrench className="w-4 h-4" />
                  <span>Executar Auto-Configuração Agora</span>
                </button>
              </div>
            )}

            {/* Modal Body: Debian Kernel Host */}
            {activeModal === 'debian_kernel' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                  <h4 className="text-sm font-bold text-white">Debian 13 (Trixie) 64-bit • Linux 6.12 LTS</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Comunicação direta via Syscalls do Kernel, DRM/KMS, servidor de áudio PipeWire e aceleração Mesa Vulkan.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs text-slate-300">
                  <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Kernel</span>
                    <span className="font-mono text-white">6.12.0-trixie-amd64</span>
                  </div>
                  <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Sessão</span>
                    <span className="font-mono text-white">GNOME Mutter Wayland</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Power Confirmation Prompt */}
      {powerPrompt && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#180e0a] border border-orange-500/30 rounded-3xl p-6 shadow-2xl space-y-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center mx-auto">
              <Power className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-white">
              {powerPrompt === 'restart' && 'Reiniciar o Sistema?'}
              {powerPrompt === 'shutdown' && 'Desligar o Dispositivo?'}
              {powerPrompt === 'logout' && 'Encerrar Sessão do Usuário?'}
            </h3>
            <p className="text-xs text-slate-400">
              Todos os contêineres e serviços do sistema serão sincronizados antes do desligamento.
            </p>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setPowerPrompt(null)}
                className="py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-white transition"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  soundEffects.playPop('off');
                  setPowerPrompt(null);
                  if (onClose) onClose();
                }}
                className="py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white transition"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default UmbrelSettingsView;
