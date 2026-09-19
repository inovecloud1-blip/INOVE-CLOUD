import React, { useState, useRef, useEffect } from 'react';
import {
  Settings,
  Image as ImageIcon,
  Zap,
  Cpu,
  HardDrive,
  Shield,
  Wifi,
  Globe,
  Check,
  Upload,
  Link,
  Sparkles,
  RefreshCw,
  Eye,
  SlidersHorizontal,
  RotateCcw,
  Clock,
  Home,
  Cloud,
  Server,
  Bluetooth,
  Mouse,
  Monitor,
  Volume2,
  BatteryCharging,
  Palette,
  User,
  Accessibility,
  Info,
  Radio,
  Lock,
  QrCode,
  Headphones,
  Sliders,
  VolumeX,
  Volume1,
  Sun,
  Moon,
  ChevronRight,
  Plus,
  Play,
  CheckCircle2,
  AlertCircle,
  Terminal,
  Package,
  Power,
  Activity,
  ShieldCheck,
  CheckCircle,
  Database,
  Layers,
  Flame,
  ArrowUpRight,
  Network,
  BellOff,
  Camera,
  Video,
  Gauge,
  LayoutGrid,
  ArrowDown,
  ArrowUp,
  ArrowLeft,
  ArrowRight,
  Maximize2,
  EyeOff
} from 'lucide-react';
import { WALLPAPERS } from '../../data/mockData';
import { DesktopWidgetsConfig, DockConfig, DEFAULT_DOCK_CONFIG, DockPosition, DockAlignment, DockThemeStyle, AppId } from '../../types';
import { AppIcon } from '../desktop/AppIcon';
import { useSystemSettings } from '../../context/SystemSettingsContext';
import { useSoundEffects } from '../../context/SoundEffectsContext';
import { ToggleSwitch } from '../ui/ToggleSwitch';

interface SettingsAppProps {
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
  initialSection?:
    | 'debian'
    | 'wifi'
    | 'ethernet'
    | 'camera'
    | 'dnd'
    | 'bluetooth'
    | 'mouse'
    | 'display'
    | 'sound'
    | 'power'
    | 'themes'
    | 'dock'
    | 'user'
    | 'accessibility'
    | 'about';
}

export const SettingsApp: React.FC<SettingsAppProps> = ({
  currentWallpaper,
  onSelectWallpaper,
  gpuEnabled,
  onToggleGpu,
  widgetsConfig,
  onUpdateWidgetsConfig,
  onResetWidgetsConfig,
  dockConfig = DEFAULT_DOCK_CONFIG,
  onUpdateDockConfig,
  dockPinnedApps,
  onTogglePinDock,
  onResetDockDefault,
  initialSection = 'debian',
}) => {
  const sysSettings = useSystemSettings();
  const soundEffects = useSoundEffects();
  const [activeSection, setActiveSection] = useState<
    'debian' | 'wifi' | 'ethernet' | 'camera' | 'dnd' | 'bluetooth' | 'mouse' | 'display' | 'sound' | 'power' | 'themes' | 'dock' | 'user' | 'accessibility' | 'about'
  >(initialSection);

  useEffect(() => {
    if (initialSection) {
      setActiveSection(initialSection);
    }
  }, [initialSection]);

  // Debian 13 Host Integration States
  const [debianInfo, setDebianInfo] = useState<any>({
    host: {
      distro: 'Debian GNU/Linux 13 (Trixie)',
      distroVersion: '13.0 Trixie (LTS/Testing)',
      kernel: '6.12.0-trixie-amd64',
      arch: 'x86_64 (AMD64)',
      hostname: 'inovecloud-os',
      initSystem: 'systemd 256.4',
      displayServer: 'GNOME 46+ Wayland (Mutter) + InoveCloud Liquid Glass Theme',
      graphicsDriver: 'Mesa 24.2.3 (OpenGL 4.6 / Vulkan 1.3 / DRI3)',
      uptime: '14 dias, 8 horas, 42 min',
      timezone: 'America/Sao_Paulo (UTC-03:00)',
      locale: 'pt_BR.UTF-8',
      storage: { total: '512 GB', free: '438 GB', filesystem: 'ext4 / SquashFS' },
      memory: { total: '16384 MB', used: '4210 MB', free: '12174 MB' }
    },
    services: [
      { name: 'gdm3.service', description: 'GNOME Display Manager', status: 'active', enabled: true },
      { name: 'NetworkManager', description: 'Gerenciador de Redes Wi-Fi & Ethernet', status: 'active', enabled: true },
      { name: 'pipewire.service', description: 'Servidor de Áudio PipeWire', status: 'active', enabled: true },
      { name: 'flatpak-system-helper', description: 'Suporte de Permissões Flatpak', status: 'active', enabled: true },
      { name: 'inovecloud.service', description: 'InoveCloud Web Desktop Local Server', status: 'active', enabled: true }
    ],
    network: {
      interface: 'wlan0 / eth0',
      ip: '192.168.1.145',
      subnet: '255.255.255.0',
      gateway: '192.168.1.1',
      dns: ['1.1.1.1', '8.8.8.8'],
      mac: '52:54:00:12:34:56'
    },
    repositories: [
      { name: 'Debian 13 Trixie Main', url: 'deb.debian.org/debian trixie main', active: true },
      { name: 'Debian 13 Contrib & Non-Free', url: 'deb.debian.org/debian trixie contrib non-free non-free-firmware', active: true },
      { name: 'Debian 13 Security Updates', url: 'security.debian.org/debian-security trixie-security main', active: true },
      { name: 'Flathub Official', url: 'https://dl.flathub.org/repo/flathub.flatpakrepo', active: true }
    ]
  });

  const [debianHostname, setDebianHostname] = useState('inovecloud-os');
  const [debianTimezone, setDebianTimezone] = useState('America/Sao_Paulo');
  const [isExecutingDebianAction, setIsExecutingDebianAction] = useState(false);
  const [debianActionFeedback, setDebianActionFeedback] = useState<string | null>(null);
  const [debianActiveTab, setDebianActiveTab] = useState<'system' | 'services' | 'network' | 'graphics' | 'repos'>('system');

  // Load Debian 12 System info from /api/system/debian/info
  useEffect(() => {
    fetch('/api/system/debian/info')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.host) {
          setDebianInfo(data);
          if (data.host.hostname) setDebianHostname(data.host.hostname);
        }
      })
      .catch(() => {
        // Handled with initial default state
      });
  }, []);

  const handleExecuteDebianAction = async (action: string, payload: any = {}) => {
    setIsExecutingDebianAction(true);
    setDebianActionFeedback(`Executando ação no host Debian: ${action}...`);

    try {
      const response = await fetch('/api/system/debian/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, payload }),
      });
      const resData = await response.json();
      setIsExecutingDebianAction(false);
      setDebianActionFeedback(resData.message || `Ação "${action}" concluída com sucesso!`);
      setTimeout(() => setDebianActionFeedback(null), 4000);
    } catch (err) {
      setIsExecutingDebianAction(false);
      setDebianActionFeedback(`Comando enviado ao sistema (${action}).`);
      setTimeout(() => setDebianActionFeedback(null), 4000);
    }
  };

  const toggleDebianService = (serviceName: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' ? 'inactive' : 'active';
    setDebianInfo((prev: any) => ({
      ...prev,
      services: prev.services.map((s: any) =>
        s.name === serviceName ? { ...s, status: nextStatus } : s
      ),
    }));
    handleExecuteDebianAction('service-toggle', {
      service: serviceName,
      state: nextStatus === 'active' ? 'start' : 'stop',
    });
  };

  // Wi-Fi States
  const [wifiEnabled, setWifiEnabled] = useState(true);
  const [connectedSsid, setConnectedSsid] = useState('InoveCloud-5G-Ultra');
  const [connectingSsid, setConnectingSsid] = useState<string | null>(null);
  const [wifiPasswordPrompt, setWifiPasswordPrompt] = useState<string | null>(null);
  const [wifiPasswordInput, setWifiPasswordInput] = useState('');
  const [showQrModal, setShowQrModal] = useState(false);
  const [wifiNetworks, setWifiNetworks] = useState([
    { ssid: 'InoveCloud-5G-Ultra', signal: 4, secured: true, frequency: '5 GHz', ip: '192.168.1.145' },
    { ssid: 'Home-Fiber-HighSpeed', signal: 4, secured: true, frequency: '5 GHz', ip: null },
    { ssid: 'Corporativo-Inove-Guest', signal: 3, secured: false, frequency: '2.4 GHz', ip: null },
    { ssid: 'Starlink-Satellite-Mesh', signal: 3, secured: true, frequency: '5 GHz', ip: null },
    { ssid: 'Lab-IoT-Sensors', signal: 2, secured: true, frequency: '2.4 GHz', ip: null },
  ]);

  // Bluetooth States
  const [bluetoothEnabled, setBluetoothEnabled] = useState(true);
  const [isScanningBt, setIsScanningBt] = useState(false);
  const [pairedDevices, setPairedDevices] = useState([
    { id: 'bt-1', name: 'AirPods Pro 2 (Inove Audio)', type: 'audio', battery: 92, connected: true },
    { id: 'bt-2', name: 'Mouse Logitech MX Master 3S', type: 'mouse', battery: 78, connected: true },
    { id: 'bt-3', name: 'Teclado Mecânico Keychron K2', type: 'keyboard', battery: 85, connected: true },
  ]);
  const [availableBtDevices, setAvailableBtDevices] = useState([
    { id: 'bt-4', name: 'Smart TV Samsung Neo QLED 65"', type: 'display' },
    { id: 'bt-5', name: 'Controle Sony PS5 DualSense', type: 'gamepad' },
    { id: 'bt-6', name: 'Caixa de Som JBL Flip 6', type: 'audio' },
  ]);

  // Mouse & Touchpad States
  const [pointerSpeed, setPointerSpeed] = useState(6);
  const [naturalScrolling, setNaturalScrolling] = useState(true);
  const [primaryButton, setPrimaryButton] = useState<'left' | 'right'>('left');
  const [mouseAcceleration, setMouseAcceleration] = useState(true);
  const [tapToClick, setTapToClick] = useState(true);
  const [scrollSpeed, setScrollSpeed] = useState(5);
  const [testClickCount, setTestClickCount] = useState(0);

  // Display & Video States
  const [resolution, setResolution] = useState('1920x1080');
  const [refreshRate, setRefreshRate] = useState('60Hz');
  const [uiScale, setUiScale] = useState('100%');
  const [nightLight, setNightLight] = useState(false);
  const [nightLightTemp, setNightLightTemp] = useState(50);
  const [brightness, setBrightness] = useState(90);

  // Sound States
  const [outputDevice, setOutputDevice] = useState('Alto-falantes Realtek High Definition Audio');
  const [masterVolume, setMasterVolume] = useState(75);
  const [isMuted, setIsMuted] = useState(false);
  const [inputDevice, setInputDevice] = useState('Microfone USB Blue Yeti');
  const [systemSounds, setSystemSounds] = useState(true);

  // Power & Battery States
  const [powerMode, setPowerMode] = useState<'performance' | 'balanced' | 'power_saver'>('balanced');
  const [screenOffTimeout, setScreenOffTimeout] = useState('15m');
  const [sleepTimeout, setSleepTimeout] = useState('30m');

  // Custom Themes States
  const [selectedThemePreset, setSelectedThemePreset] = useState('candy');
  const [accentColor, setAccentColor] = useState('#ef4444');
  const [glassBlur, setGlassBlur] = useState<'soft' | 'medium' | 'ultra'>('medium');
  const [dockStyle, setDockStyle] = useState<'floating' | 'mac' | 'compact'>('floating');
  const [wallpaperCategory, setWallpaperCategory] = useState<string>('Todos');
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [uploadFeedback, setUploadFeedback] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // User States
  const [userName, setUserName] = useState('Administrador Inove');
  const [userLogin, setUserLogin] = useState('inove');
  const [userAvatar, setUserAvatar] = useState('👑');
  const [userPasswordMessage, setUserPasswordMessage] = useState<string | null>(null);

  // Accessibility States
  const [highContrast, setHighContrast] = useState(false);
  const [fontSizeScale, setFontSizeScale] = useState<'normal' | 'large' | 'extralarge'>('normal');
  const [screenReaderActive, setScreenReaderActive] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [stickyKeys, setStickyKeys] = useState(false);
  const [monoAudio, setMonoAudio] = useState(false);
  const [largeCursor, setLargeCursor] = useState(false);

  // Play audio test sound
  const playSoundTest = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
    } catch (e) {
      console.log('AudioContext not allowed without interaction');
    }
  };

  // Test Speech Synthesis
  const testSpeech = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance('InoveCloud OS. Acessibilidade e leitor de tela ativados com sucesso.');
      utterance.lang = 'pt-BR';
      window.speechSynthesis.speak(utterance);
      setScreenReaderActive(true);
    }
  };

  // Handle local file upload for wallpaper
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadFeedback('Erro: Por favor, selecione um arquivo de imagem válido (PNG, JPG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        onSelectWallpaper(result);
        setUploadFeedback(`Papel de parede "${file.name}" aplicado com sucesso!`);
        setTimeout(() => setUploadFeedback(null), 4000);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle direct URL apply
  const handleApplyUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrlInput.trim()) return;
    onSelectWallpaper(customUrlInput.trim());
    setUploadFeedback('Papel de parede via URL aplicado com sucesso!');
    setTimeout(() => setUploadFeedback(null), 4000);
  };

  // Connect to Wi-Fi
  const handleConnectWifi = (ssid: string) => {
    const net = wifiNetworks.find((n) => n.ssid === ssid);
    if (net?.secured) {
      setWifiPasswordPrompt(ssid);
      setWifiPasswordInput('');
    } else {
      setConnectingSsid(ssid);
      setTimeout(() => {
        setConnectedSsid(ssid);
        setConnectingSsid(null);
      }, 1200);
    }
  };

  const confirmWifiPassword = () => {
    if (!wifiPasswordPrompt) return;
    const target = wifiPasswordPrompt;
    setConnectingSsid(target);
    setWifiPasswordPrompt(null);
    setTimeout(() => {
      setConnectedSsid(target);
      setConnectingSsid(null);
    }, 1500);
  };

  // Bluetooth pair
  const handlePairBt = (device: { id: string; name: string; type: string }) => {
    setAvailableBtDevices((prev) => prev.filter((d) => d.id !== device.id));
    setPairedDevices((prev) => [
      ...prev,
      { id: device.id, name: device.name, type: device.type, battery: 100, connected: true },
    ]);
  };

  const handleDisconnectBt = (id: string) => {
    setPairedDevices((prev) =>
      prev.map((d) => (d.id === id ? { ...d, connected: !d.connected } : d))
    );
  };

  const handleForgetBt = (id: string) => {
    const dev = pairedDevices.find((d) => d.id === id);
    if (!dev) return;
    setPairedDevices((prev) => prev.filter((d) => d.id !== id));
    setAvailableBtDevices((prev) => [...prev, { id: dev.id, name: dev.name, type: dev.type }]);
  };

  // Navigation Items
  const menuItems = [
    { id: 'debian', label: 'Debian 13 & Pure Kernel Host', icon: Server, badge: 'Trixie' },
    { id: 'wifi', label: 'Wi-Fi & Sem Fio', icon: Wifi, badge: sysSettings.wifiEnabled ? (connectedSsid || 'Conectado') : 'Desligado' },
    { id: 'ethernet', label: 'Internet a Cabo (Ethernet)', icon: Network, badge: sysSettings.ethernetEnabled ? '10 Gbps' : 'Desativado' },
    { id: 'camera', label: 'Câmera, Vídeo & V4L2 ISP', icon: Camera, badge: '/dev/video0' },
    { id: 'dnd', label: 'Não Perturbe & Modo Escuro', icon: BellOff, badge: sysSettings.doNotDisturb ? 'DND Ativo' : (sysSettings.darkMode ? 'Escuro' : 'Claro') },
    { id: 'bluetooth', label: 'Bluetooth & Dispositivos', icon: Bluetooth, badge: `${pairedDevices.filter(d => d.connected).length} ativos` },
    { id: 'mouse', label: 'Mouse & Touchpad', icon: Mouse },
    { id: 'display', label: 'Tela, Resolução & Luz', icon: Monitor },
    { id: 'sound', label: 'Som & Microfone PipeWire', icon: Volume2 },
    { id: 'power', label: 'Energia & Bateria', icon: BatteryCharging, badge: '88%' },
    { id: 'themes', label: 'Temas & Wallpapers', icon: Palette, badge: 'Candy' },
    {
      id: 'dock',
      label: 'Dock & Barra de Tarefas',
      icon: LayoutGrid,
      badge: dockConfig.position === 'top'
        ? 'Superior'
        : dockConfig.position === 'left'
        ? 'Esquerda'
        : dockConfig.position === 'right'
        ? 'Direita'
        : 'Inferior',
    },
    { id: 'user', label: 'Usuário & Contas', icon: User, badge: 'inove' },
    { id: 'accessibility', label: 'Acessibilidade', icon: Accessibility },
    { id: 'about', label: 'Sobre o PC & Sistema', icon: Info, badge: 'v2026.1' },
  ];

  return (
    <div className="flex h-full bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* LEFT SIDEBAR NAVIGATION */}
      <div className="w-64 border-r border-white/10 bg-slate-900/60 flex flex-col p-3 shrink-0">
        <div className="flex items-center space-x-2.5 px-3 py-3 mb-2 border-b border-white/10">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-red-600 to-rose-600 flex items-center justify-center shadow-md shadow-red-600/30">
            <Settings className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-white tracking-wide">Configurações</h2>
            <p className="text-[10px] text-slate-400">InoveCloud OS Control Center</p>
          </div>
        </div>

        {/* Menu list */}
        <div className="flex-1 overflow-y-auto space-y-1 pr-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  soundEffects.playPop('click');
                  setActiveSection(item.id as any);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md shadow-red-600/20'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-2.5 min-w-0">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                      isActive ? 'bg-white/20 text-white' : 'bg-white/10 text-slate-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Host Status Footer */}
        <div className="pt-2 border-t border-white/10 text-[10px] text-slate-400 flex items-center justify-between px-2">
          <span>Debian 13 (Trixie)</span>
          <span className="flex items-center space-x-1 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>GNOME Glass</span>
          </span>
        </div>
      </div>

      {/* RIGHT CONTENT AREA */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* =================================================================== */}
        {/* 0. DEBIAN 13 & GNOME HOST LINUX INTEGRATION */}
        {/* =================================================================== */}
        {activeSection === 'debian' && (
          <div className="space-y-6 max-w-4xl">
            {/* Header Title */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-white/10">
              <div>
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <Server className="w-5 h-5 text-red-500" />
                  <span>Configurações & Integração com Debian 13 (Trixie)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Gerenciamento direto de kernel, ambiente GNOME 46+, serviços systemd, repositórios APT, drivers Mesa e rede via API nativa.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center space-x-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>systemd & hostctl online</span>
                </span>
              </div>
            </div>

            {/* Global Action Feedback Toast */}
            {debianActionFeedback && (
              <div className="p-3 rounded-xl bg-blue-500/20 border border-blue-500/40 text-blue-200 text-xs flex items-center justify-between shadow-lg">
                <div className="flex items-center space-x-2">
                  {isExecutingDebianAction ? (
                    <RefreshCw className="w-4 h-4 text-blue-400 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                  )}
                  <span className="font-semibold">{debianActionFeedback}</span>
                </div>
              </div>
            )}

            {/* Sub-Tabs for Debian Configuration */}
            <div className="flex items-center space-x-1 bg-white/5 p-1 rounded-xl border border-white/10 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setDebianActiveTab('system')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap flex items-center space-x-1.5 ${
                  debianActiveTab === 'system'
                    ? 'bg-red-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>Sistema & Kernel</span>
              </button>
              <button
                onClick={() => setDebianActiveTab('services')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap flex items-center space-x-1.5 ${
                  debianActiveTab === 'services'
                    ? 'bg-red-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Serviços Systemd ({debianInfo.services?.length || 6})</span>
              </button>
              <button
                onClick={() => setDebianActiveTab('network')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap flex items-center space-x-1.5 ${
                  debianActiveTab === 'network'
                    ? 'bg-red-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Wifi className="w-3.5 h-3.5" />
                <span>Rede & NetworkManager</span>
              </button>
              <button
                onClick={() => setDebianActiveTab('graphics')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap flex items-center space-x-1.5 ${
                  debianActiveTab === 'graphics'
                    ? 'bg-red-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Mesa 3D & Wayland</span>
              </button>
              <button
                onClick={() => setDebianActiveTab('repos')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap flex items-center space-x-1.5 ${
                  debianActiveTab === 'repos'
                    ? 'bg-red-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Package className="w-3.5 h-3.5" />
                <span>Fontes APT & Flathub</span>
              </button>
            </div>

            {/* Sub-Tab 1: Sistema & Kernel */}
            {debianActiveTab === 'system' && (
              <div className="space-y-4">
                {/* Hostname & Timezone form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white flex items-center space-x-1.5">
                        <Terminal className="w-4 h-4 text-cyan-400" />
                        <span>Hostname da Máquina</span>
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">/etc/hostname</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={debianHostname}
                        onChange={(e) => setDebianHostname(e.target.value)}
                        className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-red-500"
                      />
                      <button
                        onClick={() => handleExecuteDebianAction('set-hostname', { hostname: debianHostname })}
                        disabled={isExecutingDebianAction}
                        className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs transition cursor-pointer disabled:opacity-50 shrink-0"
                      >
                        Salvar
                      </button>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white flex items-center space-x-1.5">
                        <Clock className="w-4 h-4 text-amber-400" />
                        <span>Fuso Horário (Timezone / NTP)</span>
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">timedatectl</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <select
                        value={debianTimezone}
                        onChange={(e) => setDebianTimezone(e.target.value)}
                        className="flex-1 bg-slate-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-red-500"
                      >
                        <option value="America/Sao_Paulo">America/Sao_Paulo (UTC-03:00 - Brasília)</option>
                        <option value="America/Manaus">America/Manaus (UTC-04:00)</option>
                        <option value="UTC">UTC (Tempo Universal Coordenado)</option>
                        <option value="America/New_York">America/New_York (EST)</option>
                        <option value="Europe/London">Europe/London (GMT)</option>
                        <option value="Europe/Lisbon">Europe/Lisbon (WET)</option>
                      </select>
                      <button
                        onClick={() => handleExecuteDebianAction('set-timezone', { timezone: debianTimezone })}
                        disabled={isExecutingDebianAction}
                        className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs transition cursor-pointer disabled:opacity-50 shrink-0"
                      >
                        Aplicar
                      </button>
                    </div>
                  </div>
                </div>

                {/* Host Info Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Distribuição</span>
                    <p className="text-xs font-bold text-white">{debianInfo.host?.distro}</p>
                    <p className="text-[10px] text-slate-400">{debianInfo.host?.distroVersion}</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Kernel Linux</span>
                    <p className="text-xs font-bold text-emerald-400 font-mono">{debianInfo.host?.kernel}</p>
                    <p className="text-[10px] text-slate-400">{debianInfo.host?.arch}</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Sistema de Init</span>
                    <p className="text-xs font-bold text-cyan-400 font-mono">{debianInfo.host?.initSystem}</p>
                    <p className="text-[10px] text-slate-400">PID 1 / Control Group v2</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Armazenamento</span>
                    <p className="text-xs font-bold text-rose-400">{debianInfo.host?.storage?.free} livres</p>
                    <p className="text-[10px] text-slate-400">de {debianInfo.host?.storage?.total} ({debianInfo.host?.storage?.filesystem})</p>
                  </div>
                </div>

                {/* Quick Maintenance Actions */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span>Ações de Manutenção do Sistema Debian</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      onClick={() => handleExecuteDebianAction('apt-update')}
                      disabled={isExecutingDebianAction}
                      className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition cursor-pointer flex flex-col justify-between space-y-2 disabled:opacity-50"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-cyan-300">APT Update</span>
                        <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
                      </div>
                      <p className="text-[10px] text-slate-400">Atualiza os índices de pacotes nos repositórios oficiais.</p>
                      <span className="text-[10px] font-mono text-slate-500">sudo apt-get update</span>
                    </button>

                    <button
                      onClick={() => handleExecuteDebianAction('apt-clean')}
                      disabled={isExecutingDebianAction}
                      className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition cursor-pointer flex flex-col justify-between space-y-2 disabled:opacity-50"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-300">Limpar Cache APT</span>
                        <Package className="w-3.5 h-3.5 text-emerald-400" />
                      </div>
                      <p className="text-[10px] text-slate-400">Libera espaço excluindo arquivos .deb temporários.</p>
                      <span className="text-[10px] font-mono text-slate-500">apt clean & autoremove</span>
                    </button>

                    <button
                      onClick={() => handleExecuteDebianAction('flatpak-update')}
                      disabled={isExecutingDebianAction}
                      className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition cursor-pointer flex flex-col justify-between space-y-2 disabled:opacity-50"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-purple-300">Atualizar Flathub</span>
                        <Layers className="w-3.5 h-3.5 text-purple-400" />
                      </div>
                      <p className="text-[10px] text-slate-400">Atualiza runtimes GNOME/KDE dos apps instalados.</p>
                      <span className="text-[10px] font-mono text-slate-500">flatpak update -y</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Sub-Tab 2: Serviços Systemd */}
            {debianActiveTab === 'services' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                        Daemons & Serviços do Host (systemctl)
                      </h4>
                      <p className="text-[11px] text-slate-400">Controle o status de execução de serviços essenciais do Linux.</p>
                    </div>
                    <button
                      onClick={() => handleExecuteDebianAction('apt-clean')}
                      className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition flex items-center space-x-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Atualizar Lista</span>
                    </button>
                  </div>

                  <div className="divide-y divide-white/5">
                    {debianInfo.services?.map((service: any) => (
                      <div key={service.name} className="py-3 flex items-center justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-bold text-white font-mono">{service.name}</span>
                            <span
                              className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                                service.status === 'active'
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  : 'bg-slate-700 text-slate-300'
                              }`}
                            >
                              {service.status === 'active' ? 'Ativo (Running)' : 'Inativo (Stopped)'}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 truncate">{service.description}</p>
                        </div>

                        <div className="flex items-center space-x-2 shrink-0">
                          <button
                            onClick={() => toggleDebianService(service.name, service.status)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                              service.status === 'active'
                                ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300'
                                : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300'
                            }`}
                          >
                            {service.status === 'active' ? 'Parar' : 'Iniciar'}
                          </button>
                          <button
                            onClick={() => handleExecuteDebianAction('service-restart', { service: service.name })}
                            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer"
                            title="Reiniciar serviço"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Sub-Tab 3: Rede & NetworkManager */}
            {debianActiveTab === 'network' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white flex items-center space-x-1.5">
                        <Wifi className="w-4 h-4 text-cyan-400" />
                        <span>Adaptadores de Rede (Linux Kernel)</span>
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                        Link Up
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between py-1.5 border-b border-white/5">
                        <span className="text-slate-400">Interface Ativa:</span>
                        <span className="font-mono text-white font-bold">{debianInfo.network?.interface}</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-white/5">
                        <span className="text-slate-400">Endereço IPv4:</span>
                        <span className="font-mono text-cyan-300 font-bold">{debianInfo.network?.ip}</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-white/5">
                        <span className="text-slate-400">Máscara de Sub-rede:</span>
                        <span className="font-mono text-slate-300">{debianInfo.network?.subnet}</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-white/5">
                        <span className="text-slate-400">Gateway Padrão:</span>
                        <span className="font-mono text-slate-300">{debianInfo.network?.gateway}</span>
                      </div>
                      <div className="flex justify-between py-1.5">
                        <span className="text-slate-400">Endereço MAC:</span>
                        <span className="font-mono text-slate-400">{debianInfo.network?.mac}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3 flex flex-col justify-between">
                    <div>
                      <span className="text-xs font-bold text-white flex items-center space-x-1.5">
                        <Globe className="w-4 h-4 text-blue-400" />
                        <span>Resolução de Nomes (DNS Resolv.conf)</span>
                      </span>
                      <p className="text-[11px] text-slate-400 mt-1">Servidores configurados no sistema para consultas de domínio.</p>
                    </div>

                    <div className="space-y-2">
                      <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between font-mono text-xs">
                        <span className="text-slate-300">DNS Primário (Cloudflare):</span>
                        <span className="text-emerald-400 font-bold">1.1.1.1</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between font-mono text-xs">
                        <span className="text-slate-300">DNS Secundário (Google):</span>
                        <span className="text-emerald-400 font-bold">8.8.8.8</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleExecuteDebianAction('service-restart', { service: 'NetworkManager' })}
                      className="w-full py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition flex items-center justify-center space-x-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Reiniciar NetworkManager</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Sub-Tab 4: Mesa 3D & Openbox X11 */}
            {debianActiveTab === 'graphics' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                    <Monitor className="w-4 h-4 text-cyan-400" />
                    <span>Ambiente Gráfico X11, Openbox & Compositor 3D</span>
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    O InoveCloud OS roda um ambiente de desktop real completo com o gerenciador de janelas **Openbox**, o compositor **xcompmgr** para sombras e transparências reais, e o navegador Web OS em janela normal maximizada.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Gerenciador de Janelas & Display</span>
                      <p className="text-xs font-bold text-white">{debianInfo.host?.displayServer}</p>
                      <p className="text-[10px] text-emerald-400">Suporte a janelas nativas Debian / Flatpak flutuantes</p>
                    </div>

                    <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Driver Gráfico & Aceleração</span>
                      <p className="text-xs font-bold text-white">{debianInfo.host?.graphicsDriver}</p>
                      <p className="text-[10px] text-emerald-400">Renderização direta DRM/KMS + VA-API e Vulkan</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Sub-Tab 5: Fontes APT & Flathub */}
            {debianActiveTab === 'repos' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                        Repositórios de Software Ativos (/etc/apt/sources.list)
                      </h4>
                      <p className="text-[11px] text-slate-400">Espelhos oficiais configurados na ISO e no sistema host.</p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                      GPG Assinado
                    </span>
                  </div>

                  <div className="space-y-2">
                    {debianInfo.repositories?.map((repo: any, index: number) => (
                      <div
                        key={index}
                        className="p-3 rounded-xl bg-black/30 border border-white/5 flex items-center justify-between"
                      >
                        <div>
                          <p className="text-xs font-bold text-white">{repo.name}</p>
                          <p className="text-[10px] font-mono text-slate-400">{repo.url}</p>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-blue-500/20 text-blue-300">
                          Ativo
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Host Power Control Box */}
            <div className="p-4 rounded-2xl bg-red-950/20 border border-red-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center shrink-0">
                  <Power className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Controle de Energia do Host Debian</h4>
                  <p className="text-[11px] text-slate-400">Envie comandos diretos do systemd para reiniciar ou desligar o computador.</p>
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <button
                  onClick={() => handleExecuteDebianAction('reboot')}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition cursor-pointer"
                >
                  Reiniciar Debian
                </button>
                <button
                  onClick={() => handleExecuteDebianAction('poweroff')}
                  className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-bold text-white transition cursor-pointer shadow-md shadow-red-600/30"
                >
                  Desligar PC
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* 1. WI-FI & INTERNET */}
        {/* =================================================================== */}
        {activeSection === 'wifi' && (
          <div className="space-y-6 max-w-3xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <Wifi className="w-5 h-5 text-cyan-400" />
                  <span>Rede Sem Fio (Wi-Fi)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Conecte-se a redes Wi-Fi locais, pontos de acesso e gerencie adaptadores de rede.
                </p>
              </div>
              {/* Wi-Fi Main Switch */}
              <ToggleSwitch
                checked={wifiEnabled}
                onChange={(val) => {
                  setWifiEnabled(val);
                  if (sysSettings.setWifiEnabled) sysSettings.setWifiEnabled(val);
                }}
                activeColor="bg-cyan-500"
              />
            </div>

            {wifiEnabled ? (
              <>
                {/* Connected Network Card */}
                {connectedSsid && (
                  <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center">
                          <Radio className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="text-sm font-bold text-white">{connectedSsid}</h4>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              Conectado
                            </span>
                          </div>
                          <p className="text-xs text-slate-400">IPv4: 192.168.1.145 • Frequência: 5 GHz • Segurança: WPA3</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setShowQrModal(true)}
                          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition cursor-pointer"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          <span>QR Code</span>
                        </button>
                        <button
                          onClick={() => setConnectedSsid('')}
                          className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-semibold transition cursor-pointer"
                        >
                          Desconectar
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Available Networks */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Redes Wi-Fi Disponíveis
                  </h4>
                  <div className="space-y-2">
                    {wifiNetworks.map((net) => {
                      const isCurrent = connectedSsid === net.ssid;
                      const isConnecting = connectingSsid === net.ssid;
                      return (
                        <div
                          key={net.ssid}
                          className={`p-3.5 rounded-xl border flex items-center justify-between transition ${
                            isCurrent
                              ? 'bg-white/10 border-cyan-500/40'
                              : 'bg-white/5 border-white/5 hover:border-white/20'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <Wifi className={`w-4 h-4 ${isCurrent ? 'text-cyan-400' : 'text-slate-400'}`} />
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="text-xs font-bold text-white">{net.ssid}</span>
                                {net.secured && <Lock className="w-3 h-3 text-slate-400" />}
                              </div>
                              <span className="text-[10px] text-slate-400">{net.frequency} • Sinal Excelente</span>
                            </div>
                          </div>

                          <div>
                            {isCurrent ? (
                              <span className="text-xs font-semibold text-cyan-400">Em Uso</span>
                            ) : isConnecting ? (
                              <span className="flex items-center space-x-1 text-xs text-amber-400">
                                <RefreshCw className="w-3 h-3 animate-spin" />
                                <span>Conectando...</span>
                              </span>
                            ) : (
                              <button
                                onClick={() => handleConnectWifi(net.ssid)}
                                className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition cursor-pointer"
                              >
                                Conectar
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : (
              <div className="p-8 text-center rounded-2xl bg-white/5 border border-white/10 text-slate-400 text-xs">
                O Wi-Fi está desligado. Ligue a chave acima para buscar redes.
              </div>
            )}

            {/* Password Modal */}
            {wifiPasswordPrompt && (
              <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm">
                <div className="w-full max-w-sm p-5 rounded-2xl bg-slate-900 border border-white/20 shadow-2xl space-y-4">
                  <h4 className="text-sm font-bold text-white">Conectar a "{wifiPasswordPrompt}"</h4>
                  <p className="text-xs text-slate-300">Digite a senha de segurança de rede (WPA/WPA2/WPA3):</p>
                  <input
                    type="password"
                    autoFocus
                    placeholder="Senha do Wi-Fi..."
                    value={wifiPasswordInput}
                    onChange={(e) => setWifiPasswordInput(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-white/20 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                  <div className="flex justify-end space-x-2 pt-2">
                    <button
                      onClick={() => setWifiPasswordPrompt(null)}
                      className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={confirmWifiPassword}
                      className="px-4 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-xs font-bold text-white shadow-md shadow-cyan-600/30"
                    >
                      Conectar
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* QR Code Modal */}
            {showQrModal && (
              <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm">
                <div className="w-full max-w-xs p-6 rounded-2xl bg-slate-900 border border-white/20 shadow-2xl space-y-4 text-center">
                  <h4 className="text-sm font-bold text-white">Compartilhar Wi-Fi</h4>
                  <p className="text-xs text-slate-400">Aponte a câmera do celular para conectar sem digitar senha:</p>
                  <div className="p-4 bg-white rounded-xl inline-block mx-auto">
                    <QrCode className="w-36 h-36 text-slate-950" />
                  </div>
                  <div className="text-[11px] font-mono text-cyan-400">SSID: {connectedSsid}</div>
                  <button
                    onClick={() => setShowQrModal(false)}
                    className="w-full py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* =================================================================== */}
        {/* 1.1 INTERNET A CABO (ETHERNET ETH0) */}
        {/* =================================================================== */}
        {activeSection === 'ethernet' && (
          <div className="space-y-6 max-w-3xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <Network className="w-5 h-5 text-emerald-400" />
                  <span>Internet a Cabo (Ethernet eth0)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Conexão cabeada de alta velocidade direta via driver do kernel Linux com DMA Netlink.
                </p>
              </div>
              <ToggleSwitch
                checked={sysSettings.ethernetEnabled}
                onChange={sysSettings.toggleEthernet}
                activeColor="bg-emerald-500"
              />
            </div>

            {sysSettings.ethernetEnabled ? (
              <div className="space-y-4">
                {/* Active Link Card */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 shadow-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                        <Network className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="text-sm font-bold text-white">Interface eth0 (PCIe 10 GbE)</h4>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                            Conectado (Carrier OK)
                          </span>
                        </div>
                        <p className="text-xs text-slate-300">{sysSettings.ethernetSpeed}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Latência do Kernel</span>
                      <p className="text-xs font-mono font-bold text-emerald-300">0.4ms (Loopback DMA)</p>
                    </div>
                  </div>

                  {/* Network Telemetry Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-white/10 text-xs">
                    <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Endereço IPv4</span>
                      <p className="font-mono text-white font-bold">{sysSettings.ethernetIp}</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Máscara / Sub-rede</span>
                      <p className="font-mono text-white font-bold">255.255.255.0 (/24)</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Gateway Padrão</span>
                      <p className="font-mono text-white font-bold">192.168.1.1</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">DNS Primário</span>
                      <p className="font-mono text-cyan-400 font-bold">1.1.1.1 / 8.8.8.8</p>
                    </div>
                  </div>

                  {/* Packet Traffic Stats */}
                  <div className="p-3 rounded-xl bg-black/30 border border-white/5 flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      <span className="text-slate-300">Pacotes RX: <b className="text-white">1,482,904 pkts</b> (1.82 GB)</span>
                    </div>
                    <div className="text-slate-300">
                      Pacotes TX: <b className="text-white">942,108 pkts</b> (840 MB)
                    </div>
                    <div className="text-emerald-400 font-bold">
                      0 erros • 0 descartes
                    </div>
                  </div>
                </div>

                {/* Ethernet Tuning Options */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Configurações Avançadas do Adaptador Linux
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-black/30 border border-white/5 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-white">Jumbo Frames (MTU 9000)</p>
                        <p className="text-[10px] text-slate-400">Otimização para transferências locais e SAN</p>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 font-bold">Ativo</span>
                    </div>
                    <div className="p-3 rounded-xl bg-black/30 border border-white/5 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-white">Hardware Offloading (TSO/GSO)</p>
                        <p className="text-[10px] text-slate-400">Processamento de checksum acelerado por CPU</p>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 font-bold">Ativo</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center rounded-2xl bg-white/5 border border-white/10 text-slate-400 text-xs">
                A conexão a cabo (Ethernet) está desativada. Ligue o interruptor para estabelecer link com o roteador.
              </div>
            )}
          </div>
        )}

        {/* =================================================================== */}
        {/* 1.2 CÂMERA, VÍDEO & V4L2 ISP */}
        {/* =================================================================== */}
        {activeSection === 'camera' && (
          <div className="space-y-6 max-w-3xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <Camera className="w-5 h-5 text-red-500" />
                  <span>Câmera, Vídeo & Driver V4L2 ISP</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Pipeline de captura direta com suporte a DMA-BUF Zero-Copy, aceleração por GPU e calibrações de imagem.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                /dev/video0 Ativo
              </span>
            </div>

            <div className="space-y-4">
              {/* Hardware Device Specs Card */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400">
                      <Camera className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Sensor de Imagem & ISP Framebuffer</h4>
                      <p className="text-xs text-slate-300 font-mono">Driver: uvcvideo • Buffer: DMA-BUF Ring (4.2ms)</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    60 FPS 1080p / 4K UHD
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Processador / Core IRQ</span>
                    <p className="font-bold text-white">CPU Core #2 Affinity</p>
                    <p className="text-[10px] text-emerald-400">Zero-Copy Direct Memory</p>
                  </div>
                  <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Aceleração de Hardware</span>
                    <p className="font-bold text-white">VA-API / Vulkan Video</p>
                    <p className="text-[10px] text-cyan-400">H.264, HEVC, AV1 Nativo</p>
                  </div>
                  <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Rastreamento Facial AI</span>
                    <p className="font-bold text-white">Neural Engine Ativo</p>
                    <p className="text-[10px] text-purple-400">99.4% precisão de foco</p>
                  </div>
                </div>
              </div>

              {/* Action Callout */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-red-950/30 to-slate-900 border border-red-500/30 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">Aplicativo de Câmera & Gravação</h4>
                  <p className="text-[11px] text-slate-400">Acesse a câmera com filtros HDR, visão noturna, zoom digital e gravação de vídeo.</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      fetch('/api/system/debian/action', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ action: 'camera-v4l2-probe' }),
                      }).catch(() => {});
                    }}
                    className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition cursor-pointer"
                  >
                    Testar V4L2
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* 1.3 NÃO PERTURBE & MODO ESCURO */}
        {/* =================================================================== */}
        {activeSection === 'dnd' && (
          <div className="space-y-6 max-w-3xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <BellOff className="w-5 h-5 text-indigo-400" />
                  <span>Modo Não Perturbe & Modo Escuro</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Controle de foco, supressão de notificações, temas do sistema e personalização visual.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Dark Mode Card */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-between">
                <div className="flex items-center space-x-3.5">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                    <Moon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Modo Escuro Global (Dark Theme)</h4>
                    <p className="text-xs text-slate-400">Ajusta o contraste, paleta e fundo do sistema e de todos os aplicativos.</p>
                  </div>
                </div>
                <ToggleSwitch
                  checked={sysSettings.darkMode}
                  onChange={sysSettings.toggleDarkMode}
                  activeColor="bg-indigo-600"
                />
              </div>

              {/* Do Not Disturb Card */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-between">
                <div className="flex items-center space-x-3.5">
                  <div className="w-10 h-10 rounded-xl bg-rose-600/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
                    <BellOff className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Modo Não Perturbe (DND)</h4>
                    <p className="text-xs text-slate-400">Silencia sons de clique, bips de feedback de áudio e oculta notificações em tela cheia.</p>
                  </div>
                </div>
                <ToggleSwitch
                  checked={sysSettings.doNotDisturb}
                  onChange={sysSettings.toggleDoNotDisturb}
                  activeColor="bg-rose-500"
                />
              </div>

              {/* Rules & Preferences */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Regras de Silêncio e Alertas</h4>
                <div className="space-y-2 text-xs">
                  <div className="p-3 rounded-xl bg-black/30 border border-white/5 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-white">Silenciar bips e efeitos sonoros Web Audio</p>
                      <p className="text-[10px] text-slate-400">Bloqueia sintetizador de áudio enquanto Não Perturbe estiver ativo</p>
                    </div>
                    <span className="text-emerald-400 font-bold text-[11px]">Habilitado</span>
                  </div>
                  <div className="p-3 rounded-xl bg-black/30 border border-white/5 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-white">Indicador visual na barra superior</p>
                      <p className="text-[10px] text-slate-400">Exibe o ícone de sino desativado no MenuBar</p>
                    </div>
                    <span className="text-emerald-400 font-bold text-[11px]">Habilitado</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* 2. BLUETOOTH & DISPOSITIVOS */}
        {/* =================================================================== */}
        {activeSection === 'bluetooth' && (
          <div className="space-y-6 max-w-3xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <Bluetooth className="w-5 h-5 text-indigo-400" />
                  <span>Bluetooth & Dispositivos Conectados</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Conecte fones de ouvido sem fio, mouses, teclados mecânicos e controles Bluetooth.
                </p>
              </div>
              <ToggleSwitch
                checked={bluetoothEnabled}
                onChange={setBluetoothEnabled}
                activeColor="bg-indigo-500"
              />
            </div>

            {bluetoothEnabled ? (
              <>
                {/* Paired devices */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Meus Dispositivos Pareados
                    </h4>
                    <span className="text-[11px] text-slate-400">Visível para outros aparelhos como "InoveCloud-PC"</span>
                  </div>

                  <div className="space-y-2">
                    {pairedDevices.map((dev) => (
                      <div
                        key={dev.id}
                        className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center">
                            {dev.type === 'audio' ? (
                              <Headphones className="w-4 h-4" />
                            ) : (
                              <Mouse className="w-4 h-4" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-bold text-white">{dev.name}</span>
                              {dev.connected && (
                                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400" />
                              )}
                            </div>
                            <div className="flex items-center space-x-3 text-[10px] text-slate-400">
                              <span>{dev.connected ? 'Conectado' : 'Desconectado'}</span>
                              <span>•</span>
                              <span>Bateria: {dev.battery}%</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleDisconnectBt(dev.id)}
                            className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition cursor-pointer"
                          >
                            {dev.connected ? 'Desconectar' : 'Reconectar'}
                          </button>
                          <button
                            onClick={() => handleForgetBt(dev.id)}
                            className="px-2 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold transition cursor-pointer"
                            title="Esquecer dispositivo"
                          >
                            Esquecer
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Available for pairing */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
                      <span>Outros Dispositivos Próximos</span>
                      <RefreshCw className="w-3 h-3 text-indigo-400 animate-spin" />
                    </h4>
                    <button
                      onClick={() => setIsScanningBt(!isScanningBt)}
                      className="text-xs text-indigo-400 hover:underline"
                    >
                      Atualizar busca
                    </button>
                  </div>

                  <div className="space-y-2">
                    {availableBtDevices.map((dev) => (
                      <div
                        key={dev.id}
                        className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between hover:border-white/20 transition"
                      >
                        <div className="flex items-center space-x-3">
                          <Bluetooth className="w-4 h-4 text-slate-400" />
                          <span className="text-xs font-semibold text-white">{dev.name}</span>
                        </div>
                        <button
                          onClick={() => handlePairBt(dev)}
                          className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-md shadow-indigo-600/30 transition cursor-pointer active:scale-95"
                        >
                          Parear
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="p-8 text-center rounded-2xl bg-white/5 border border-white/10 text-slate-400 text-xs">
                O Bluetooth está desativado.
              </div>
            )}
          </div>
        )}

        {/* =================================================================== */}
        {/* 3. MOUSE & TOUCHPAD */}
        {/* =================================================================== */}
        {activeSection === 'mouse' && (
          <div className="space-y-6 max-w-3xl">
            <div className="pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Mouse className="w-5 h-5 text-amber-400" />
                <span>Mouse, Ponteiro & Touchpad</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Ajuste a velocidade do cursor, rolagem natural, clique duplo e preferências de precisão.
              </p>
            </div>

            {/* Pointer Speed */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">Velocidade do Ponteiro</h4>
                  <p className="text-[11px] text-slate-400">Sensibilidade do sensor do mouse na tela</p>
                </div>
                <span className="text-xs font-mono font-bold text-amber-400">{pointerSpeed}x</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={pointerSpeed}
                onChange={(e) => setPointerSpeed(Number(e.target.value))}
                className="w-full accent-amber-500"
              />
            </div>

            {/* Primary Button */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-white">Botão Primário do Mouse</h4>
                <p className="text-[11px] text-slate-400">Alterne para canhotos caso use o botão direito para selecionar</p>
              </div>
              <div className="flex space-x-1 p-1 bg-slate-900 rounded-xl border border-white/10">
                <button
                  onClick={() => setPrimaryButton('left')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    primaryButton === 'left' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400'
                  }`}
                >
                  Esquerdo
                </button>
                <button
                  onClick={() => setPrimaryButton('right')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    primaryButton === 'right' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400'
                  }`}
                >
                  Direito
                </button>
              </div>
            </div>

            {/* Natural Scrolling */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <ToggleSwitch
                label="Rolagem Natural (Estilo Touchpad / Mac)"
                description="O conteúdo se move na mesma direção dos seus dedos"
                checked={naturalScrolling}
                onChange={setNaturalScrolling}
                activeColor="bg-amber-500"
              />
            </div>

            {/* Pointer Acceleration & Tap to click */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <ToggleSwitch
                  size="sm"
                  label="Aceleração do Cursor"
                  description="Aumenta velocidade em movimentos rápidos"
                  checked={mouseAcceleration}
                  onChange={setMouseAcceleration}
                  activeColor="bg-amber-500"
                />
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <ToggleSwitch
                  size="sm"
                  label="Toque para Clicar"
                  description="Toque levemente sem pressionar o botão"
                  checked={tapToClick}
                  onChange={setTapToClick}
                  activeColor="bg-amber-500"
                />
              </div>
            </div>

            {/* Test Mouse Interactive Area */}
            <div
              onClick={() => setTestClickCount((c) => c + 1)}
              className="p-6 rounded-2xl bg-gradient-to-r from-amber-500/10 via-slate-900 to-amber-500/5 border border-amber-500/30 text-center cursor-pointer hover:border-amber-400/50 transition select-none active:scale-[0.99]"
            >
              <h4 className="text-xs font-bold text-amber-300">Área de Teste de Clique & Sensibilidade</h4>
              <p className="text-[11px] text-slate-300 mt-1">
                Clique repetidamente ou use o scroll aqui para sentir a resposta. Cliques registrados:{' '}
                <span className="font-mono font-bold text-white">{testClickCount}</span>
              </p>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* 4. TELA & VÍDEO (DISPLAY) */}
        {/* =================================================================== */}
        {activeSection === 'display' && (
          <div className="space-y-6 max-w-3xl">
            <div className="pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Monitor className="w-5 h-5 text-sky-400" />
                <span>Monitores, Resolução & Luz Noturna</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Configurações de vídeo Wayland, taxa de atualização, escala DPI e filtro de luz azul.
              </p>
            </div>

            {/* Resolution Selector */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <h4 className="text-xs font-bold text-white">Resolução de Exibição</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { res: '1920x1080', name: 'Full HD 1080p' },
                  { res: '2560x1440', name: '2K QHD 1440p' },
                  { res: '3840x2160', name: '4K Ultra HD' },
                  { res: '1366x768', name: 'HD Laptop' },
                ].map((item) => (
                  <button
                    key={item.res}
                    onClick={() => setResolution(item.res)}
                    className={`p-3 rounded-xl border text-center transition cursor-pointer ${
                      resolution === item.res
                        ? 'bg-sky-500/20 border-sky-400 text-white font-bold'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="text-xs">{item.res}</div>
                    <div className="text-[10px] opacity-75">{item.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Refresh Rate & Scale */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <h4 className="text-xs font-bold text-white">Taxa de Atualização</h4>
                <div className="flex space-x-2">
                  {['60Hz', '120Hz', '144Hz'].map((hz) => (
                    <button
                      key={hz}
                      onClick={() => setRefreshRate(hz)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition ${
                        refreshRate === hz ? 'bg-sky-500 text-slate-950' : 'bg-white/10 text-slate-400'
                      }`}
                    >
                      {hz}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <h4 className="text-xs font-bold text-white">Escala da Interface (DPI)</h4>
                <div className="flex space-x-2">
                  {['100%', '125%', '150%'].map((scale) => (
                    <button
                      key={scale}
                      onClick={() => setUiScale(scale)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition ${
                        uiScale === scale ? 'bg-sky-500 text-slate-950' : 'bg-white/10 text-slate-400'
                      }`}
                    >
                      {scale}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Night Light */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <ToggleSwitch
                label="Luz Noturna (Filtro de Luz Azul)"
                description="Torna a tela com tons mais quentes para não cansar os olhos à noite"
                checked={nightLight}
                onChange={setNightLight}
                activeColor="bg-amber-500"
              />
              {nightLight && (
                <div className="pt-2">
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span>Mais Frio</span>
                    <span className="text-amber-400 font-bold">Temperatura Quente</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="90"
                    value={nightLightTemp}
                    onChange={(e) => setNightLightTemp(Number(e.target.value))}
                    className="w-full accent-amber-500"
                  />
                </div>
              )}
            </div>

            {/* Brightness */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">Brilho da Tela</span>
                <span className="text-xs font-mono text-sky-400">{brightness}%</span>
              </div>
              <input
                type="range"
                min="20"
                max="100"
                value={brightness}
                onChange={(e) => setBrightness(Number(e.target.value))}
                className="w-full accent-sky-500"
              />
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* 5. SOM & ÁUDIO */}
        {/* =================================================================== */}
        {activeSection === 'sound' && (
          <div className="space-y-6 max-w-3xl">
            <div className="pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Volume2 className="w-5 h-5 text-emerald-400" />
                <span>Som, Volume & Microfone</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Controle de nível de áudio do sistema, dispositivos de saída e entrada (PipeWire / ALSA).
              </p>
            </div>

            {/* Master Volume */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-emerald-400"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                  <div>
                    <h4 className="text-xs font-bold text-white">Volume Principal</h4>
                    <span className="text-[11px] text-slate-400">{outputDevice}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={playSoundTest}
                    className="flex items-center space-x-1 px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 text-xs font-bold transition cursor-pointer"
                  >
                    <Play className="w-3 h-3" />
                    <span>Testar Som</span>
                  </button>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    {isMuted ? 'Mudo' : `${masterVolume}%`}
                  </span>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                disabled={isMuted}
                value={masterVolume}
                onChange={(e) => setMasterVolume(Number(e.target.value))}
                className="w-full accent-emerald-500 disabled:opacity-30"
              />
            </div>

            {/* Output Selector */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <h4 className="text-xs font-bold text-white">Dispositivo de Saída de Áudio</h4>
              <div className="space-y-1">
                {[
                  'Alto-falantes Realtek High Definition Audio',
                  'AirPods Pro 2 (Inove Audio - Bluetooth)',
                  'Saída de Áudio HDMI / DisplayPort',
                ].map((device) => (
                  <button
                    key={device}
                    onClick={() => setOutputDevice(device)}
                    className={`w-full p-2.5 rounded-xl text-left text-xs flex items-center justify-between transition ${
                      outputDevice === device
                        ? 'bg-emerald-500/20 text-white font-bold border border-emerald-500/30'
                        : 'bg-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>{device}</span>
                    {outputDevice === device && <Check className="w-4 h-4 text-emerald-400" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Device */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <h4 className="text-xs font-bold text-white">Microfone / Entrada de Voz</h4>
              <div className="space-y-1">
                {[
                  'Microfone USB Blue Yeti',
                  'Microfone Embutido (Realtek Audio)',
                ].map((device) => (
                  <button
                    key={device}
                    onClick={() => setInputDevice(device)}
                    className={`w-full p-2.5 rounded-xl text-left text-xs flex items-center justify-between transition ${
                      inputDevice === device
                        ? 'bg-emerald-500/20 text-white font-bold border border-emerald-500/30'
                        : 'bg-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>{device}</span>
                    {inputDevice === device && <Check className="w-4 h-4 text-emerald-400" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Efeitos Sonoros do Sistema & Som Pop */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-4">
              <ToggleSwitch
                label="Efeitos Sonoros do Sistema & Som Pop"
                description="Reproduz som 'Pop' animado e tátil ao ligar e desligar opções, alternar interruptores e interagir com o sistema."
                checked={soundEffects.soundsEnabled}
                onChange={soundEffects.setSoundsEnabled}
                activeColor="bg-emerald-500"
              />

              {soundEffects.soundsEnabled && (
                <div className="pt-3 border-t border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Demonstração & Teste de Sons Interativos:</span>
                    <span className="text-[10px] text-emerald-400 font-mono">Web Audio API • Latência 0ms</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => soundEffects.playSound('pop_on')}
                      className="p-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold transition flex flex-col items-center gap-1 cursor-pointer active:scale-95"
                    >
                      <span className="text-sm">✨</span>
                      <span>Pop ON (Ligar)</span>
                    </button>

                    <button
                      onClick={() => soundEffects.playSound('pop_off')}
                      className="p-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-bold transition flex flex-col items-center gap-1 cursor-pointer active:scale-95"
                    >
                      <span className="text-sm">💤</span>
                      <span>Pop OFF (Desligar)</span>
                    </button>

                    <button
                      onClick={() => soundEffects.playSound('pop_click')}
                      className="p-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-bold transition flex flex-col items-center gap-1 cursor-pointer active:scale-95"
                    >
                      <span className="text-sm">👆</span>
                      <span>Pop Clique (Aba)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* 6. ENERGIA & BATERIA */}
        {/* =================================================================== */}
        {activeSection === 'power' && (
          <div className="space-y-6 max-w-3xl">
            <div className="pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <BatteryCharging className="w-5 h-5 text-emerald-400" />
                <span>Energia, Bateria & Desempenho</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Gerencie perfis de consumo elétrico, turbo boost da CPU e economia de bateria.
              </p>
            </div>

            {/* Battery Status Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-950 border border-emerald-500/30 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-lg">
                  88%
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Conectado ao Carregador USB-C</h4>
                  <p className="text-xs text-slate-400">Carregando em 65W PD • Tempo estimado até 100%: 24 minutos</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/20 text-emerald-300">
                Saúde: 97%
              </span>
            </div>

            {/* Power Profile Mode */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <h4 className="text-xs font-bold text-white">Modo de Energia do Processador</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'performance', title: 'Alto Desempenho', desc: 'Clock máximo e turbo desbloqueado' },
                  { id: 'balanced', title: 'Equilibrado', desc: 'Ajuste dinâmico automático (Padrão)' },
                  { id: 'power_saver', title: 'Economia de Energia', desc: 'Reduz consumo e aquece menos' },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setPowerMode(mode.id as any)}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                      powerMode === mode.id
                        ? 'bg-emerald-500/20 border-emerald-500 text-white font-bold shadow'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="text-xs">{mode.title}</div>
                    <div className="text-[10px] opacity-75 mt-0.5">{mode.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Sleep Timers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <h4 className="text-xs font-bold text-white">Desligar Tela após Inatividade</h4>
                <div className="flex space-x-1">
                  {['5m', '15m', '30m', 'Nunca'].map((time) => (
                    <button
                      key={time}
                      onClick={() => setScreenOffTimeout(time)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition ${
                        screenOffTimeout === time ? 'bg-emerald-500 text-slate-950' : 'bg-white/10 text-slate-400'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <h4 className="text-xs font-bold text-white">Suspender Computador</h4>
                <div className="flex space-x-1">
                  {['15m', '30m', '1h', 'Nunca'].map((time) => (
                    <button
                      key={time}
                      onClick={() => setSleepTimeout(time)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition ${
                        sleepTimeout === time ? 'bg-emerald-500 text-slate-950' : 'bg-white/10 text-slate-400'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* 7. TEMAS & PERSONALIZAÇÃO */}
        {/* =================================================================== */}
        {activeSection === 'themes' && (
          <div className="space-y-6 max-w-4xl">
            <div className="pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Palette className="w-5 h-5 text-rose-400" />
                <span>Temas Personalizados & Wallpapers</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Escolha esquemas de cores, vidro Liquid Glass, papéis de parede ou envie sua própria imagem do computador.
              </p>
            </div>

            {/* Presets Theme Cards */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Pacotes de Temas
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
                {[
                  { id: 'candy', name: 'Candy Craze', color: 'from-rose-500 via-purple-500 to-amber-400' },
                  { id: 'cyber', name: 'Cyber Obsidian', color: 'from-slate-950 via-slate-900 to-cyan-500' },
                  { id: 'sunset', name: 'Sunset Gold', color: 'from-amber-500 via-orange-600 to-red-600' },
                  { id: 'slate', name: 'Titanium Slate', color: 'from-slate-400 via-slate-600 to-slate-800' },
                  { id: 'neon', name: 'Neon Mint', color: 'from-emerald-400 via-teal-500 to-cyan-700' },
                  { id: 'tokyo', name: 'Tokyo Twilight', color: 'from-fuchsia-500 via-indigo-600 to-purple-900' },
                ].map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => setSelectedThemePreset(preset.id)}
                    className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                      selectedThemePreset === preset.id
                        ? 'border-rose-400 bg-white/10 shadow-lg'
                        : 'border-white/10 bg-white/5 hover:border-white/30'
                    }`}
                  >
                    <div className={`h-8 rounded-lg bg-gradient-to-r ${preset.color} mb-1.5 shadow`} />
                    <span className="text-[11px] font-bold text-white">{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Accent Color Picker */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <h4 className="text-xs font-bold text-white">Cor de Destaque (Accent Color)</h4>
              <div className="flex space-x-3">
                {[
                  { color: '#ef4444', name: 'Vermelho Inove' },
                  { color: '#06b6d4', name: 'Ciano Cyber' },
                  { color: '#8b5cf6', name: 'Violeta' },
                  { color: '#10b981', name: 'Esmeralda' },
                  { color: '#f59e0b', name: 'Âmbar Dourado' },
                  { color: '#ec4899', name: 'Rosa Chiclete' },
                ].map((c) => (
                  <button
                    key={c.color}
                    onClick={() => setAccentColor(c.color)}
                    className={`w-7 h-7 rounded-full shadow-md transition transform hover:scale-110 ${
                      accentColor === c.color ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-950 scale-110' : ''
                    }`}
                    style={{ backgroundColor: c.color }}
                    title={c.name}
                  />
                ))}
              </div>
            </div>

            {/* Icon Theme Pack Preview (Candy Pastel Neon 3D) */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">Pacote de Ícones do Sistema</h4>
                  <p className="text-[11px] text-slate-400">Novo tema 3D Candy Squircles Pastel &amp; Neon (Flathub, IA, Arquivos, ISO, KVM, etc.)</p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-bold text-[10px]">
                  Ativo no Sistema
                </span>
              </div>
              <div className="flex items-center space-x-4 p-3 bg-slate-950/60 rounded-xl border border-white/5 overflow-x-auto">
                <div className="flex flex-col items-center space-y-1">
                  <AppIcon appId="appstore" size="md" />
                  <span className="text-[10px] text-slate-400">Flathub</span>
                </div>
                <div className="flex flex-col items-center space-y-1">
                  <AppIcon appId="aiagent" size="md" />
                  <span className="text-[10px] text-slate-400">IA Copilot</span>
                </div>
                <div className="flex flex-col items-center space-y-1">
                  <AppIcon appId="storage" size="md" />
                  <span className="text-[10px] text-slate-400">Arquivos</span>
                </div>
                <div className="flex flex-col items-center space-y-1">
                  <AppIcon appId="isobuilder" size="md" />
                  <span className="text-[10px] text-slate-400">ISO Disco</span>
                </div>
                <div className="flex flex-col items-center space-y-1">
                  <AppIcon appId="linuxpedia" size="md" />
                  <span className="text-[10px] text-slate-400">Docs</span>
                </div>
                <div className="flex flex-col items-center space-y-1">
                  <AppIcon appId="vn" size="md" />
                  <span className="text-[10px] text-slate-400">VMs</span>
                </div>
                <div className="flex flex-col items-center space-y-1">
                  <AppIcon appId="terminal" size="md" />
                  <span className="text-[10px] text-slate-400">Terminal</span>
                </div>
                <div className="flex flex-col items-center space-y-1">
                  <AppIcon appId="settings" size="md" />
                  <span className="text-[10px] text-slate-400">Ajustes</span>
                </div>
              </div>
            </div>

            {/* Wallpapers Grid */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Galeria de Papéis de Parede ({WALLPAPERS.length})
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Selecione um tema de fundo oficial, faça upload de imagens ou use URL personalizada.
                  </p>
                </div>
                <div className="flex space-x-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md shadow-red-600/30 transition cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload do meu PC</span>
                  </button>
                </div>
              </div>

              {/* Category Filter Chips */}
              <div className="flex flex-wrap gap-1.5 pb-1">
                {['Todos', 'InoveCloud Dark', 'Espaço & Sci-Fi', 'Natureza & Paisagens', 'Minimalista & Luxo', 'Futurista & AI'].map((cat) => {
                  const isActive = wallpaperCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setWallpaperCategory(cat)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                        isActive
                          ? 'bg-red-600 text-white shadow-sm'
                          : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 border border-white/5'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>

              {uploadFeedback && (
                <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{uploadFeedback}</span>
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                {WALLPAPERS.filter((wp) => wallpaperCategory === 'Todos' || (wp as any).category === wallpaperCategory).map((wp) => {
                  const isCurrent = currentWallpaper === wp.url;
                  const tag = (wp as any).tag;
                  const description = (wp as any).description;
                  return (
                    <button
                      key={wp.id}
                      onClick={() => onSelectWallpaper(wp.url)}
                      className={`group relative h-36 rounded-2xl overflow-hidden border transition text-left cursor-pointer ${
                        isCurrent ? 'border-red-500 ring-2 ring-red-500/50 shadow-lg shadow-red-950/40' : 'border-white/10 hover:border-white/40'
                      }`}
                    >
                      <img
                        src={wp.thumbnail || wp.url}
                        alt={wp.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      
                      {/* Top Badges */}
                      <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none">
                        {tag && (
                          <span className="px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[9px] font-extrabold text-white border border-white/10 uppercase tracking-wider">
                            {tag}
                          </span>
                        )}
                        {isCurrent && (
                          <div className="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg ml-auto">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                      </div>

                      {/* Bottom Info Gradient */}
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent p-2.5 pt-6 flex flex-col justify-end">
                        <span className="text-xs font-bold text-white truncate leading-snug">{wp.name}</span>
                        {description && (
                          <span className="text-[10px] text-slate-300 line-clamp-1 opacity-90 mt-0.5">
                            {description}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Direct URL input */}
              <form onSubmit={handleApplyUrl} className="flex gap-2 pt-2">
                <input
                  type="url"
                  placeholder="Ou cole a URL direta de uma imagem da internet..."
                  value={customUrlInput}
                  onChange={(e) => setCustomUrlInput(e.target.value)}
                  className="flex-1 px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold text-white transition cursor-pointer"
                >
                  Aplicar URL
                </button>
              </form>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* DOCK & BARRA DE TAREFAS */}
        {/* =================================================================== */}
        {activeSection === 'dock' && (
          <div className="space-y-6 max-w-4xl">
            <div className="pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <LayoutGrid className="w-5 h-5 text-cyan-400" />
                <span>Configurações da Dock & Barra de Tarefas</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Ajuste a posição na tela (Inferior, Superior, Esquerda ou Direita), alinhamento, tamanho dos ícones, temas visuais e comportamento de zoom e auto-ocultação.
              </p>
            </div>

            {/* 1. Posicionamento na Tela */}
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4">
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  1. Posição da Dock na Área de Trabalho
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Escolha em qual borda da tela você deseja fixar a Dock do InoveCloud OS.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  {
                    pos: 'bottom' as DockPosition,
                    title: 'Inferior (Bottom)',
                    desc: 'Padrão macOS / Linux clássico na base da tela',
                    icon: ArrowDown,
                  },
                  {
                    pos: 'left' as DockPosition,
                    title: 'Esquerda (Left)',
                    desc: 'Estilo Ubuntu / Unity Dock na lateral esquerda',
                    icon: ArrowLeft,
                  },
                  {
                    pos: 'top' as DockPosition,
                    title: 'Superior (Top)',
                    desc: 'Barra superior integrada logo abaixo do menu',
                    icon: ArrowUp,
                  },
                  {
                    pos: 'right' as DockPosition,
                    title: 'Direita (Right)',
                    desc: 'Lateral direita para monitores ultra-wide',
                    icon: ArrowRight,
                  },
                ].map(({ pos, title, desc, icon: Icon }) => {
                  const isSelected = (dockConfig.position || 'bottom') === pos;
                  return (
                    <button
                      key={pos}
                      onClick={() => onUpdateDockConfig && onUpdateDockConfig({ position: pos })}
                      className={`p-4 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between h-32 relative ${
                        isSelected
                          ? 'border-cyan-400 bg-cyan-950/40 shadow-lg shadow-cyan-950/50 ring-2 ring-cyan-500/50'
                          : 'border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                            isSelected
                              ? 'bg-cyan-500 text-slate-950 shadow-md'
                              : 'bg-white/10 text-slate-300'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        {isSelected && (
                          <span className="px-2 py-0.5 rounded-full bg-cyan-400/20 text-cyan-300 text-[10px] font-extrabold border border-cyan-400/30">
                            Ativo
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">{title}</div>
                        <div className="text-[10px] text-slate-400 leading-tight mt-0.5">{desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Alinhamento e Escala dos Ícones */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Alinhamento */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <div>
                  <h4 className="text-xs font-bold text-white">Alinhamento da Barra</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Defina a ancoragem dos ícones ao longo da borda selecionada.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { align: 'start' as DockAlignment, label: 'Início (Start)' },
                    { align: 'center' as DockAlignment, label: 'Centro (Center)' },
                    { align: 'end' as DockAlignment, label: 'Fim (End)' },
                  ].map(({ align, label }) => {
                    const isSelected = (dockConfig.alignment || 'center') === align;
                    return (
                      <button
                        key={align}
                        onClick={() => onUpdateDockConfig && onUpdateDockConfig({ alignment: align })}
                        className={`py-2.5 px-2 rounded-xl text-xs font-bold text-center border transition cursor-pointer ${
                          isSelected
                            ? 'bg-cyan-600 border-cyan-400 text-white shadow-md'
                            : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tamanho dos Ícones */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white">Tamanho dos Ícones</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Ajuste a escala visual dos aplicativos na Dock.
                    </p>
                  </div>
                  <span className="font-mono text-xs font-black text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded-lg border border-cyan-500/30">
                    {dockConfig.iconSize || 54}px
                  </span>
                </div>

                <input
                  type="range"
                  min="38"
                  max="76"
                  value={dockConfig.iconSize || 54}
                  onChange={(e) => onUpdateDockConfig && onUpdateDockConfig({ iconSize: Number(e.target.value) })}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />

                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Pequeno (38px)</span>
                  <span>Médio (54px)</span>
                  <span>Grande (76px)</span>
                </div>
              </div>
            </div>

            {/* 3. Estilo e Tema da Dock */}
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4">
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  2. Acabamento Visual & Tema
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Selecione o estilo translúcido ou opaco para a superfície da Dock.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  {
                    style: 'liquid_glass' as DockThemeStyle,
                    title: 'Vidro Líquido',
                    desc: 'Design translúcido Apple com blur e reflexos',
                  },
                  {
                    style: 'macos' as DockThemeStyle,
                    title: 'macOS Dark Glass',
                    desc: 'Vidro escuro profundo com bordas suaves',
                  },
                  {
                    style: 'floating_pill' as DockThemeStyle,
                    title: 'Pílula Neon',
                    desc: 'Cápsula arredondada com brilho cyan',
                  },
                  {
                    style: 'solid_dark' as DockThemeStyle,
                    title: 'Preto Sólido Linux',
                    desc: 'Fundo escuro fosco de alta performance',
                  },
                ].map(({ style: st, title, desc }) => {
                  const isSelected = (dockConfig.style || 'liquid_glass') === st;
                  return (
                    <button
                      key={st}
                      onClick={() => onUpdateDockConfig && onUpdateDockConfig({ style: st })}
                      className={`p-3.5 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between h-28 ${
                        isSelected
                          ? 'border-purple-400 bg-purple-950/40 shadow-lg shadow-purple-950/50 ring-2 ring-purple-500/50'
                          : 'border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-bold text-white">{title}</div>
                        <div className="text-[10px] text-slate-400 leading-tight mt-1">{desc}</div>
                      </div>
                      {isSelected && (
                        <div className="text-[10px] font-extrabold text-purple-300">
                          ✓ Selecionado
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Comportamentos e Efeitos Interativos */}
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">
                3. Comportamento & Efeitos
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Auto Hide */}
                <div
                  onClick={() => onUpdateDockConfig && onUpdateDockConfig({ autoHide: !dockConfig.autoHide })}
                  className="p-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 cursor-pointer transition flex flex-col justify-between space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {dockConfig.autoHide ? <EyeOff className="w-4 h-4 text-amber-400" /> : <Eye className="w-4 h-4 text-cyan-400" />}
                      <span className="text-xs font-bold text-white">Auto-Ocultar</span>
                    </div>
                    <div className={`w-8 h-4 rounded-full transition-colors flex items-center p-0.5 ${
                      dockConfig.autoHide ? 'bg-amber-500 justify-end' : 'bg-slate-700 justify-start'
                    }`}>
                      <div className="w-3 h-3 rounded-full bg-white shadow" />
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Oculta a dock automaticamente e revela ao aproximar o mouse.
                  </p>
                </div>

                {/* Magnification Zoom */}
                <div
                  onClick={() => onUpdateDockConfig && onUpdateDockConfig({ magnification: !dockConfig.magnification })}
                  className="p-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 cursor-pointer transition flex flex-col justify-between space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Maximize2 className="w-4 h-4 text-pink-400" />
                      <span className="text-xs font-bold text-white">Efeito Magnification</span>
                    </div>
                    <div className={`w-8 h-4 rounded-full transition-colors flex items-center p-0.5 ${
                      dockConfig.magnification ? 'bg-pink-500 justify-end' : 'bg-slate-700 justify-start'
                    }`}>
                      <div className="w-3 h-3 rounded-full bg-white shadow" />
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Amplia suavemente os ícones ao passar o cursor do mouse.
                  </p>
                </div>

                {/* Open Indicators */}
                <div
                  onClick={() => onUpdateDockConfig && onUpdateDockConfig({ showOpenIndicators: !dockConfig.showOpenIndicators })}
                  className="p-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 cursor-pointer transition flex flex-col justify-between space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400" />
                      <span className="text-xs font-bold text-white">Indicador de Execução</span>
                    </div>
                    <div className={`w-8 h-4 rounded-full transition-colors flex items-center p-0.5 ${
                      dockConfig.showOpenIndicators ? 'bg-emerald-500 justify-end' : 'bg-slate-700 justify-start'
                    }`}>
                      <div className="w-3 h-3 rounded-full bg-white shadow" />
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Exibe um ponto brilhante abaixo dos apps em execução.
                  </p>
                </div>
              </div>
            </div>

            {/* Reset Dock to Default */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
              <div>
                <div className="text-xs font-bold text-white">Restaurar Padrões da Dock</div>
                <div className="text-[11px] text-slate-400">
                  Volta a posição para Inferior (Bottom), tamanho 54px e tema Vidro Líquido.
                </div>
              </div>
              <button
                onClick={() => {
                  if (onUpdateDockConfig) onUpdateDockConfig(DEFAULT_DOCK_CONFIG);
                  if (onResetDockDefault) onResetDockDefault();
                }}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
                <span>Restaurar Padrão</span>
              </button>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* 8. USUÁRIO & CONTAS */}
        {/* =================================================================== */}
        {activeSection === 'user' && (
          <div className="space-y-6 max-w-3xl">
            <div className="pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <User className="w-5 h-5 text-indigo-400" />
                <span>Usuário do Sistema & Contas de Acesso</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Gerencie credenciais Linux root, conta ativa no Kiosk e permissões administrativas.
              </p>
            </div>

            {/* Current Active User Profile */}
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-3xl shadow-lg">
                  {userAvatar}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="text-base font-bold text-white">{userName}</h4>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      Superusuário
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">Usuário do Linux: <span className="font-mono text-slate-300">{userLogin}</span> (Sudo NOPASSWD)</p>
                  <p className="text-[11px] text-emerald-400 font-semibold mt-0.5">Sessão iniciada via Wayland Cage TTY1</p>
                </div>
              </div>
            </div>

            {/* Avatar Selector */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <h4 className="text-xs font-bold text-white">Escolher Avatar</h4>
              <div className="flex space-x-2">
                {['👑', '🚀', '💻', '⚡', '🐧', '🛡️', '👾', '🦊'].map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => setUserAvatar(emoji)}
                    className={`w-10 h-10 rounded-xl text-lg flex items-center justify-center transition ${
                      userAvatar === emoji ? 'bg-indigo-600 scale-110 shadow' : 'bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Change Password */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <h4 className="text-xs font-bold text-white">Alterar Senha do Usuário 'inove'</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="password"
                  placeholder="Nova senha..."
                  className="px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                />
                <input
                  type="password"
                  placeholder="Confirmar nova senha..."
                  className="px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <button
                onClick={() => {
                  setUserPasswordMessage('Senha do usuário inove atualizada no Linux com sucesso!');
                  setTimeout(() => setUserPasswordMessage(null), 3500);
                }}
                className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition cursor-pointer"
              >
                Salvar Nova Senha
              </button>
              {userPasswordMessage && (
                <p className="text-xs text-emerald-400 font-semibold">{userPasswordMessage}</p>
              )}
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* 9. ACESSIBILIDADE */}
        {/* =================================================================== */}
        {activeSection === 'accessibility' && (
          <div className="space-y-6 max-w-3xl">
            <div className="pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Accessibility className="w-5 h-5 text-purple-400" />
                <span>Acessibilidade & Facilidades de Uso</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Opções para pessoas com baixa visão, sensibilidade motora e leitor de tela por sintetizador de voz.
              </p>
            </div>

            {/* High Contrast */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <ToggleSwitch
                label="Modo de Alto Contraste"
                description="Aumenta o contraste visual entre textos e fundos (Razão WCAG AAA 7:1)"
                checked={highContrast}
                onChange={setHighContrast}
                activeColor="bg-purple-600"
              />
            </div>

            {/* Font Scaling */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <h4 className="text-xs font-bold text-white">Tamanho do Texto do Sistema</h4>
              <div className="flex space-x-2">
                {[
                  { id: 'normal', label: 'Padrão (100%)' },
                  { id: 'large', label: 'Grande (125%)' },
                  { id: 'extralarge', label: 'Extra Grande (150%)' },
                ].map((scale) => (
                  <button
                    key={scale.id}
                    onClick={() => setFontSizeScale(scale.id as any)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${
                      fontSizeScale === scale.id
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'bg-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    {scale.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Screen Reader Speech */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-white">Leitor de Tela / Síntese de Voz (TTS)</h4>
                <p className="text-[11px] text-slate-400">Lê os botões e janelas ativas em voz alta em Português</p>
              </div>
              <button
                onClick={testSpeech}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition cursor-pointer"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Ouvir Voz</span>
              </button>
            </div>

            {/* Reduce Motion & Sticky Keys */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <ToggleSwitch
                  size="sm"
                  label="Reduzir Animações"
                  description="Desativa transições para evitar enjoos"
                  checked={reduceMotion}
                  onChange={setReduceMotion}
                  activeColor="bg-purple-600"
                />
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <ToggleSwitch
                  size="sm"
                  label="Áudio Mono"
                  description="Mescla canais E/D em um só"
                  checked={monoAudio}
                  onChange={setMonoAudio}
                  activeColor="bg-purple-600"
                />
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* 10. SOBRE O PC & SISTEMA */}
        {/* =================================================================== */}
        {activeSection === 'about' && (
          <div className="space-y-6 max-w-3xl">
            <div className="pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Info className="w-5 h-5 text-slate-400" />
                <span>Especificações do Computador & Sistema Operacional</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Informações de Kernel, arquitetura x86_64, processador, drivers Mesa e status do Kiosk.
              </p>
            </div>

            {/* OS Banner */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-red-950/40 via-slate-900 to-slate-950 border border-red-500/30 flex items-center space-x-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-600 to-rose-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-red-600/40">
                IC
              </div>
              <div>
                <h4 className="text-base font-bold text-white">InoveCloud OS 2026.1 LTS</h4>
                <p className="text-xs text-slate-300">Base: Debian 13 (Trixie) 64-bit • GNOME 46+ Liquid Glass Theme</p>
                <div className="flex items-center space-x-3 text-[11px] text-slate-400 mt-1">
                  <span>Kernel: Linux 6.12.0-trixie-amd64</span>
                  <span>•</span>
                  <span>Wayland Mutter + Blur</span>
                </div>
              </div>
            </div>

            {/* Hardware Specs List */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Componentes de Hardware
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                  <div className="text-[10px] text-slate-400 uppercase font-bold flex items-center space-x-1.5">
                    <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Processador (CPU)</span>
                  </div>
                  <div className="text-xs font-bold text-white">AMD EPYC™ 7763 / Intel® Core™ i9-14900K</div>
                  <div className="text-[10px] text-slate-400">8 vCPUs alocadas • Aceleração KVM / VT-x Ativa</div>
                </div>

                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                  <div className="text-[10px] text-slate-400 uppercase font-bold flex items-center space-x-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>Memória RAM</span>
                  </div>
                  <div className="text-xs font-bold text-white">16.0 GB DDR5 5600 MHz</div>
                  <div className="text-[10px] text-slate-400">4.2 GB em uso pelo Live System & Cache</div>
                </div>

                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                  <div className="text-[10px] text-slate-400 uppercase font-bold flex items-center space-x-1.5">
                    <HardDrive className="w-3.5 h-3.5 text-rose-400" />
                    <span>Armazenamento</span>
                  </div>
                  <div className="text-xs font-bold text-white">NVMe M.2 PCIe 4.0 (512 GB)</div>
                  <div className="text-[10px] text-slate-400">Sistema rodando em Live RAM SquashFS XZ</div>
                </div>

                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                  <div className="text-[10px] text-slate-400 uppercase font-bold flex items-center space-x-1.5">
                    <Shield className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Segurança & Boot</span>
                  </div>
                  <div className="text-xs font-bold text-white">UEFI Secure Boot Híbrido</div>
                  <div className="text-[10px] text-slate-400">GRUB2 Multiboot (Compatível com BIOS antiga e EFI)</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default SettingsApp;
