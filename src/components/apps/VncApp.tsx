import React, { useState, useEffect, useRef } from 'react';
import {
  Monitor,
  Wifi,
  WifiOff,
  RefreshCw,
  Maximize2,
  Minimize2,
  Keyboard,
  Clipboard,
  Volume2,
  VolumeX,
  Camera,
  Power,
  Shield,
  Zap,
  Server,
  Terminal,
  Folder,
  Globe,
  Settings,
  X,
  Check,
  Search,
  Sliders,
  Sparkles,
  Play,
  RotateCw,
  Lock,
  ChevronDown,
  Activity
} from 'lucide-react';
import { VirtualNode } from '../../types';

interface SavedPc {
  id: string;
  name: string;
  host: string;
  port: number;
  os: 'windows' | 'ubuntu' | 'android' | 'macos';
  protocol: 'VNC' | 'RDP' | 'SPICE';
  status: 'online' | 'offline';
  lastConnected: string;
  specs: string;
}

interface VncAppProps {
  vns: VirtualNode[];
  initialVnId?: string;
  onOpenVnApp?: () => void;
}

export const VncApp: React.FC<VncAppProps> = ({
  vns,
  initialVnId,
  onOpenVnApp,
}) => {
  // Connection targets: local LAN, internet WAN, cluster VNs, or saved PCs
  const [connectionType, setConnectionType] = useState<'local' | 'internet' | 'vn' | 'saved'>('local');
  const [selectedVnId, setSelectedVnId] = useState<string>(initialVnId || vns[0]?.id || '');
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connected');

  // Local IP LAN connection & auto-discovery
  const [localIp, setLocalIp] = useState('192.168.1.105');
  const [localPort, setLocalPort] = useState('5900');
  const [isScanningLan, setIsScanningLan] = useState(false);
  const [discoveredLanPcs, setDiscoveredLanPcs] = useState([
    { ip: '192.168.1.105', name: 'Workstation i9 Windows 11', port: 5900, type: 'VNC', os: 'windows' as const },
    { ip: '192.168.1.120', name: 'MacBook Pro M3 Max', port: 5900, type: 'VNC', os: 'ubuntu' as const },
    { ip: '192.168.1.20', name: 'Servidor Proxmox Lab', port: 5900, type: 'VNC', os: 'ubuntu' as const },
    { ip: '192.168.1.150', name: 'Dell Precision RTX', port: 3389, type: 'RDP', os: 'windows' as const },
  ]);

  // Internet WAN Remote Host & Tunnel
  const [wanDomain, setWanDomain] = useState('pc-remoto.inovecloud.io');
  const [wanPort, setWanPort] = useState('5900');
  const [wanTunnelEnabled, setWanTunnelEnabled] = useState(true);
  const [customProtocol, setCustomProtocol] = useState<'VNC' | 'RDP' | 'SPICE'>('VNC');
  const [customPassword, setCustomPassword] = useState('••••••••');
  const [saveToFavorites, setSaveToFavorites] = useState(true);

  // Saved remote PCs
  const [savedPcs, setSavedPcs] = useState<SavedPc[]>([
    {
      id: 'pc-1',
      name: 'Workstation Escritório (Windows 11 Pro)',
      host: '192.168.1.105',
      port: 5900,
      os: 'windows',
      protocol: 'VNC',
      status: 'online',
      lastConnected: 'Hoje às 14:20',
      specs: 'Intel Core i9-14900K • 64GB RAM • RTX 4080 16GB',
    },
    {
      id: 'pc-2',
      name: 'Servidor Local Lab (Ubuntu 24.04 LTS)',
      host: '192.168.1.20',
      port: 5900,
      os: 'ubuntu',
      protocol: 'VNC',
      status: 'online',
      lastConnected: 'Ontem',
      specs: 'AMD Ryzen 9 7950X • 32GB RAM • Docker & KVM',
    },
    {
      id: 'pc-3',
      name: 'Máquina de Teste QA (Debian 12 Desktop)',
      host: '10.240.0.88',
      port: 5901,
      os: 'ubuntu',
      protocol: 'VNC',
      status: 'online',
      lastConnected: '3 dias atrás',
      specs: '8 vCPU • 16GB RAM • InoveCloud VPC',
    },
  ]);

  const [selectedSavedPcId, setSelectedSavedPcId] = useState<string>('pc-1');

  // Active OS Desktop state
  const [activeOs, setActiveOs] = useState<'windows' | 'ubuntu' | 'android'>('windows');
  const [activeHostLabel, setActiveHostLabel] = useState('worker-node-01 (Ubuntu)');

  // Stream Performance Metrics
  const [fps, setFps] = useState(60);
  const [latency, setLatency] = useState(9);
  const [bandwidth, setBandwidth] = useState('14.2 Mbps');
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [compressionQuality, setCompressionQuality] = useState<'ultra' | 'high' | 'balanced'>('ultra');
  const [resolutionScale, setResolutionScale] = useState<'fit' | '1080p' | '720p'>('fit');
  const [showClipboardModal, setShowClipboardModal] = useState(false);
  const [clipboardContent, setClipboardContent] = useState('https://inovecloud.io/cluster/sa-east-1');
  const [remoteClipboard, setRemoteClipboard] = useState('C:\\InoveCloud\\Projects\\deploy.ps1');
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  // Interactive Remote PC State (Simulated Desktop inside VNC Canvas)
  const [winStartMenuOpen, setWinStartMenuOpen] = useState(false);
  const [openWindows, setOpenWindows] = useState<{
    terminal: boolean;
    files: boolean;
    browser: boolean;
  }>({
    terminal: true,
    files: false,
    browser: false,
  });

  // Remote Terminal interactive state
  const [remoteCmdInput, setRemoteCmdInput] = useState('');
  const [remoteCmdHistory, setRemoteCmdHistory] = useState<string[]>([
    'InoveCloud Remote VNC Shell Protocol v3.8 [Session Active]',
    'Host: inovecloud-pc (x86_64) | GPU: Hardware Accelerated (Passthrough)',
    'Type commands: ipconfig, dir, ping, systeminfo, docker ps, clear',
  ]);

  // Sync with selected target
  useEffect(() => {
    if (connectionType === 'vn') {
      const found = vns.find((v) => v.id === selectedVnId) || vns[0];
      if (found) {
        setActiveHostLabel(`${found.name} (${found.ip}:5900)`);
        if (found.os === 'windows') setActiveOs('windows');
        else if (found.os === 'android') setActiveOs('android');
        else setActiveOs('ubuntu');
      }
    } else if (connectionType === 'saved') {
      const pc = savedPcs.find((p) => p.id === selectedSavedPcId) || savedPcs[0];
      if (pc) {
        setActiveHostLabel(`${pc.name} (${pc.host}:${pc.port})`);
        setActiveOs(pc.os === 'windows' ? 'windows' : pc.os === 'android' ? 'android' : 'ubuntu');
      }
    } else if (connectionType === 'local') {
      setActiveHostLabel(`${localIp}:${localPort} (Rede Local LAN)`);
      setActiveOs(localIp.endsWith('.105') || localIp.endsWith('.150') ? 'windows' : 'ubuntu');
    } else {
      setActiveHostLabel(`${wanDomain}:${wanPort} (Internet WAN P2P)`);
      setActiveOs('windows');
    }
  }, [connectionType, selectedVnId, selectedSavedPcId, localIp, localPort, wanDomain, wanPort, customProtocol, vns, savedPcs]);

  // Performance telemetry ticker
  useEffect(() => {
    const interval = setInterval(() => {
      if (connectionStatus === 'connected') {
        setLatency(Math.floor(7 + Math.random() * 6));
        setFps(Math.floor(58 + Math.random() * 3));
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [connectionStatus]);

  const triggerToast = (msg: string) => {
    setNotificationMsg(msg);
    setTimeout(() => setNotificationMsg(null), 3500);
  };

  const handleConnect = () => {
    setConnectionStatus('connecting');
    setTimeout(() => {
      setConnectionStatus('connected');
      triggerToast('Conexão VNC estabelecida com sucesso! (Criptografia TLS AES-256)');
    }, 800);
  };

  const handleDisconnect = () => {
    setConnectionStatus('disconnected');
    triggerToast('Sessão VNC desconectada com segurança.');
  };

  const handleSendCtrlAltDel = () => {
    triggerToast('Sequência [Ctrl + Alt + Del] enviada para o PC remoto.');
  };

  const handleSendKeyCombo = (combo: string) => {
    triggerToast(`Combinação de teclas [${combo}] enviada.`);
  };

  const handleScreenshot = () => {
    triggerToast('Screenshot da tela remota salvo em Downloads/vnc-capture.png');
  };

  const handleRemoteCmdSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = remoteCmdInput.trim();
    if (!cmd) return;

    const newHistory = [...remoteCmdHistory, `PS C:\\Users\\Administrator> ${cmd}`];
    const lower = cmd.toLowerCase();

    if (lower === 'clear' || lower === 'cls') {
      setRemoteCmdHistory([]);
      setRemoteCmdInput('');
      return;
    } else if (lower.includes('ipconfig') || lower.includes('ip a')) {
      newHistory.push('Configuração de IP do Windows / InoveCloud VPC:');
      newHistory.push('   IPv4 . . . . . . . . . . . : 192.168.1.105');
      newHistory.push('   Máscara de Sub-rede . . . : 255.255.255.0');
      newHistory.push('   Gateway Padrão . . . . . . : 192.168.1.1');
      newHistory.push('   Adaptador WireGuard VPN . : 10.240.0.12 (Ativo)');
    } else if (lower.includes('dir') || lower.includes('ls')) {
      newHistory.push(' Modo                 Última Modificação    Tamanho  Nome');
      newHistory.push(' ----                 ------------------    -------  ----');
      newHistory.push(' d-----        11/09/2026     14:15                 InoveCloud-Projects');
      newHistory.push(' d-----        11/09/2026     13:40                 Docker-Volumes');
      newHistory.push(' -a----        11/09/2026     14:22         40960   cluster-config.yaml');
      newHistory.push(' -a----        11/09/2026     12:00       1048576   database-backup.sql');
    } else if (lower.includes('ping')) {
      newHistory.push('Disparando inovecloud.io [10.240.0.1] com 32 bytes de dados:');
      newHistory.push('Resposta de 10.240.0.1: bytes=32 tempo=2ms TTL=64');
      newHistory.push('Resposta de 10.240.0.1: bytes=32 tempo=2ms TTL=64');
      newHistory.push('Estatísticas do Ping: Enviados = 2, Recebidos = 2, Perdidos = 0 (0% de perda)');
    } else if (lower.includes('systeminfo') || lower.includes('uname')) {
      newHistory.push('Nome do Host: INOVECLOUD-REMOTE-PC');
      newHistory.push('SO: Microsoft Windows 11 Pro / Ubuntu 24.04 LTS');
      newHistory.push('Processador: 1 Processador(es) Instalado(s) - AMD EPYC / Intel Core i9');
      newHistory.push('Memória Física Total: 65.536 MB (64 GB DDR5)');
      newHistory.push('Hypervisor: InoveCloud KVM / VNC Server 3.8 Enterprise');
    } else if (lower.includes('docker ps')) {
      newHistory.push('CONTAINER ID   IMAGE                 STATUS         PORTS');
      newHistory.push('b39a44f19d20   inovecloud-api:latest Up 2 hours     0.0.0.0:3000->3000/tcp');
      newHistory.push('e18d99c33f21   postgres:16-alpine    Up 14 hours    0.0.0.0:5432->5432/tcp');
    } else {
      newHistory.push(`Comando executado: "${cmd}". Código de saída: 0 (Sucesso).`);
    }

    setRemoteCmdHistory(newHistory);
    setRemoteCmdInput('');
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 select-none">
      {/* Top Header / Connection Bar */}
      <div className="p-3 bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 p-1.5 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Monitor className="w-5 h-5 text-white" />
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-sm font-bold text-white tracking-wide">
                Conectar PC Remoto & VNC
              </h2>
              <span
                className={`flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                  connectionStatus === 'connected'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : connectionStatus === 'connecting'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    : 'bg-red-500/20 text-red-300 border-red-500/30'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    connectionStatus === 'connected'
                      ? 'bg-emerald-400 animate-pulse'
                      : connectionStatus === 'connecting'
                      ? 'bg-amber-400 animate-ping'
                      : 'bg-red-400'
                  }`}
                />
                <span className="capitalize">
                  {connectionStatus === 'connected'
                    ? 'Conectado'
                    : connectionStatus === 'connecting'
                    ? 'Conectando...'
                    : 'Desconectado'}
                </span>
              </span>

              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-mono bg-white/5 text-slate-300 border border-white/10">
                {activeHostLabel}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Acesso remoto de baixa latência (VNC / RDP / SPICE) com aceleração gráfica direta.
            </p>
          </div>
        </div>

        {/* Live Stream Telemetry Pill */}
        {connectionStatus === 'connected' && (
          <div className="flex items-center space-x-3 bg-black/40 px-3 py-1.5 rounded-xl border border-white/10 text-xs">
            <div className="flex items-center space-x-1 text-emerald-400 font-mono font-semibold">
              <Zap className="w-3.5 h-3.5" />
              <span>{latency} ms</span>
            </div>
            <div className="w-px h-3 bg-white/20" />
            <div className="flex items-center space-x-1 text-cyan-300 font-mono">
              <Activity className="w-3.5 h-3.5" />
              <span>{fps} FPS</span>
            </div>
            <div className="w-px h-3 bg-white/20" />
            <div className="hidden sm:flex items-center space-x-1 text-slate-400 font-mono text-[11px]">
              <Shield className="w-3 h-3 text-blue-400" />
              <span>TLS AES-256</span>
            </div>
          </div>
        )}

        {/* Connect / Disconnect Action Buttons */}
        <div className="flex items-center space-x-2">
          {connectionStatus === 'connected' ? (
            <button
              onClick={handleDisconnect}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 text-xs font-semibold transition cursor-pointer"
            >
              <Power className="w-3.5 h-3.5" />
              <span>Desconectar</span>
            </button>
          ) : (
            <button
              onClick={handleConnect}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition cursor-pointer"
            >
              <Wifi className="w-3.5 h-3.5" />
              <span>Conectar ao PC</span>
            </button>
          )}
        </div>
      </div>

      {/* Target Selector Bar (Tabs: IP Local LAN, Internet WAN, VNs do Cluster, PCs Salvos) */}
      <div className="px-3 py-2 bg-slate-900/70 border-b border-white/10 flex flex-wrap items-center justify-between gap-2.5 text-xs shrink-0">
        <div className="flex items-center space-x-2">
          <span className="text-slate-400 font-medium text-[11px]">Tipo de Acesso:</span>
          <div className="inline-flex rounded-xl p-0.5 bg-black/50 border border-white/10">
            <button
              onClick={() => {
                setConnectionType('local');
                handleConnect();
              }}
              className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer flex items-center space-x-1 ${
                connectionType === 'local' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Wifi className="w-3 h-3" />
              <span>IP Local (LAN)</span>
            </button>

            <button
              onClick={() => {
                setConnectionType('internet');
                handleConnect();
              }}
              className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer flex items-center space-x-1 ${
                connectionType === 'internet' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Globe className="w-3 h-3" />
              <span>Internet / WAN (Túnel P2P)</span>
            </button>

            <button
              onClick={() => {
                setConnectionType('vn');
                handleConnect();
              }}
              className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                connectionType === 'vn' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Nós Virtuais ({vns.length})
            </button>

            <button
              onClick={() => {
                setConnectionType('saved');
                handleConnect();
              }}
              className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                connectionType === 'saved' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              PCs Salvos ({savedPcs.length})
            </button>
          </div>
        </div>

        {/* Dynamic Selector Controls */}
        <div className="flex items-center space-x-2">
          {/* Local LAN Controls */}
          {connectionType === 'local' && (
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={localIp}
                onChange={(e) => setLocalIp(e.target.value)}
                placeholder="IP Local (ex: 192.168.1.105)"
                className="w-36 bg-slate-950 border border-white/15 rounded-lg px-2 py-1 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-500"
              />
              <input
                type="text"
                value={localPort}
                onChange={(e) => setLocalPort(e.target.value)}
                placeholder="Porta"
                className="w-16 bg-slate-950 border border-white/15 rounded-lg px-2 py-1 text-xs text-white font-mono"
              />

              {/* Local Network Scanner Button */}
              <button
                onClick={() => {
                  setIsScanningLan(true);
                  triggerToast('Escaneando sub-rede local 192.168.1.0/24 para portas VNC (:5900) e RDP (:3389)...');
                  setTimeout(() => {
                    setIsScanningLan(false);
                    triggerToast('Escaneamento concluído! 4 computadores encontrados na sua rede.');
                  }, 1500);
                }}
                disabled={isScanningLan}
                className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/30 text-[11px] font-semibold transition cursor-pointer"
                title="Detectar computadores na rede local automaticamente"
              >
                <Search className={`w-3 h-3 ${isScanningLan ? 'animate-spin' : ''}`} />
                <span>{isScanningLan ? 'Buscando...' : 'Escanear LAN'}</span>
              </button>

              {/* Quick Select Discovered LAN PC */}
              <select
                onChange={(e) => {
                  if (!e.target.value) return;
                  const item = discoveredLanPcs.find((d) => d.ip === e.target.value);
                  if (item) {
                    setLocalIp(item.ip);
                    setLocalPort(item.port.toString());
                    handleConnect();
                  }
                }}
                className="bg-slate-950 border border-white/15 rounded-lg px-2 py-1 text-xs text-slate-300 focus:outline-none cursor-pointer"
              >
                <option value="">PCs Detectados ({discoveredLanPcs.length})</option>
                {discoveredLanPcs.map((pc, idx) => (
                  <option key={idx} value={pc.ip}>
                    {pc.name} ({pc.ip}:{pc.port})
                  </option>
                ))}
              </select>

              <button
                onClick={handleConnect}
                className="px-3 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-[11px] font-bold transition cursor-pointer shadow-sm"
              >
                Conectar
              </button>
            </div>
          )}

          {/* Internet WAN Controls */}
          {connectionType === 'internet' && (
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={wanDomain}
                onChange={(e) => setWanDomain(e.target.value)}
                placeholder="Domínio / DDNS / IP Público"
                className="w-48 bg-slate-950 border border-white/15 rounded-lg px-2 py-1 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-indigo-500"
              />
              <input
                type="text"
                value={wanPort}
                onChange={(e) => setWanPort(e.target.value)}
                placeholder="Porta"
                className="w-16 bg-slate-950 border border-white/15 rounded-lg px-2 py-1 text-xs text-white font-mono"
              />

              {/* WAN InoveCloud Tunnel Toggle */}
              <button
                onClick={() => {
                  setWanTunnelEnabled(!wanTunnelEnabled);
                  triggerToast(
                    wanTunnelEnabled
                      ? 'Modo IP Público direto ativado (Requer Port Forwarding)'
                      : 'Túnel P2P ZeroTrust Ativado (Conexão direta sem abrir portas)'
                  );
                }}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition cursor-pointer ${
                  wanTunnelEnabled
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : 'bg-white/5 text-slate-400 border-white/10'
                }`}
                title="Túnel Seguro P2P InoveCloud (Dispensa redirecionamento de portas)"
              >
                <Lock className="w-3 h-3" />
                <span>{wanTunnelEnabled ? 'Túnel Seguro ON' : 'IP Direto'}</span>
              </button>

              <button
                onClick={handleConnect}
                className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold transition cursor-pointer shadow-sm"
              >
                Conectar WAN
              </button>
            </div>
          )}

          {/* Cluster VNs */}
          {connectionType === 'vn' && (
            <div className="flex items-center space-x-2">
              <span className="text-slate-400 text-[11px]">Selecionar VN:</span>
              <select
                value={selectedVnId}
                onChange={(e) => {
                  setSelectedVnId(e.target.value);
                  handleConnect();
                }}
                className="bg-slate-950 border border-white/15 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-blue-500 font-medium"
              >
                {vns.map((vn) => (
                  <option key={vn.id} value={vn.id}>
                    {vn.name} ({vn.ip} • {vn.version})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Saved PCs */}
          {connectionType === 'saved' && (
            <div className="flex items-center space-x-2">
              <span className="text-slate-400 text-[11px]">Computador:</span>
              <select
                value={selectedSavedPcId}
                onChange={(e) => {
                  setSelectedSavedPcId(e.target.value);
                  handleConnect();
                }}
                className="bg-slate-950 border border-white/15 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-blue-500 font-medium"
              >
                {savedPcs.map((pc) => (
                  <option key={pc.id} value={pc.id}>
                    {pc.name} ({pc.host})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* VNC Toolbar Controls (Ctrl+Alt+Del, Clipboard, Audio, Resolution, Screenshot, Scale) */}
      <div className="px-3 py-1.5 bg-slate-900/90 border-b border-white/5 flex flex-wrap items-center justify-between gap-2 text-xs shrink-0">
        <div className="flex items-center space-x-1.5">
          {/* Send Ctrl+Alt+Del */}
          <button
            onClick={handleSendCtrlAltDel}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-slate-200 text-[11px] font-semibold transition cursor-pointer active:scale-95"
            title="Enviar Ctrl+Alt+Del para o computador remoto"
          >
            <Keyboard className="w-3.5 h-3.5 text-blue-400" />
            <span>Ctrl + Alt + Del</span>
          </button>

          {/* Quick Key Combos Dropdown / Buttons */}
          <button
            onClick={() => handleSendKeyCombo('Win + R')}
            className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 text-[11px] transition"
            title="Executar (Win+R)"
          >
            Win + R
          </button>

          <button
            onClick={() => handleSendKeyCombo('Ctrl + Shift + Esc')}
            className="hidden sm:inline-block px-2 py-1 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 text-[11px] transition"
            title="Gerenciador de Tarefas"
          >
            Task Manager
          </button>

          {/* Clipboard Sync */}
          <button
            onClick={() => setShowClipboardModal(true)}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-slate-200 text-[11px] font-semibold transition cursor-pointer"
            title="Sincronizar Área de Transferência"
          >
            <Clipboard className="w-3.5 h-3.5 text-cyan-400" />
            <span>Área de Transferência</span>
          </button>

          {/* Audio toggle */}
          <button
            onClick={() => {
              setAudioEnabled(!audioEnabled);
              triggerToast(audioEnabled ? 'Áudio do PC remoto desativado' : 'Áudio do PC remoto ativado (PCM 48kHz)');
            }}
            className={`p-1 rounded-lg border transition cursor-pointer ${
              audioEnabled ? 'bg-blue-600/20 border-blue-500/30 text-blue-300' : 'bg-white/5 border-white/10 text-slate-400'
            }`}
            title="Áudio Remoto"
          >
            {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Screenshot */}
          <button
            onClick={handleScreenshot}
            className="p-1 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-slate-300 transition cursor-pointer"
            title="Capturar Screenshot"
          >
            <Camera className="w-4 h-4" />
          </button>
        </div>

        {/* Quality and Scaling Controls */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 text-slate-400 text-[11px]">
            <span>Resolução:</span>
            <select
              value={resolutionScale}
              onChange={(e) => setResolutionScale(e.target.value as any)}
              className="bg-slate-950 border border-white/10 rounded px-1.5 py-0.5 text-[11px] text-slate-200"
            >
              <option value="fit">Auto Ajustar (100%)</option>
              <option value="1080p">1920 x 1080 FHD</option>
              <option value="720p">1280 x 720 HD</option>
            </select>
          </div>

          <div className="flex items-center space-x-1 text-slate-400 text-[11px]">
            <span>Qualidade:</span>
            <select
              value={compressionQuality}
              onChange={(e) => setCompressionQuality(e.target.value as any)}
              className="bg-slate-950 border border-white/10 rounded px-1.5 py-0.5 text-[11px] text-slate-200"
            >
              <option value="ultra">Ultra (Sem perdas)</option>
              <option value="high">Alta (60 FPS)</option>
              <option value="balanced">Econômica (Low WAN)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Remote Desktop Canvas / Interactive Viewport */}
      <div className="flex-1 relative overflow-hidden bg-black flex items-center justify-center p-2">
        {/* Toast Notification */}
        {notificationMsg && (
          <div className="absolute top-4 z-40 px-4 py-2 rounded-xl bg-slate-900/90 text-white text-xs font-semibold shadow-2xl border border-white/20 backdrop-blur-md animate-fade-in flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>{notificationMsg}</span>
          </div>
        )}

        {connectionStatus === 'connecting' && (
          <div className="flex flex-col items-center space-y-3 text-slate-400">
            <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
            <p className="text-xs font-medium">Negociando handshake VNC/RFB 3.8 com criptografia TLS...</p>
          </div>
        )}

        {connectionStatus === 'disconnected' && (
          <div className="flex flex-col items-center space-y-3 text-slate-400 max-w-sm text-center">
            <WifiOff className="w-10 h-10 text-red-400" />
            <h3 className="text-sm font-bold text-white">Sessão VNC Não Conectada</h3>
            <p className="text-xs text-slate-400">
              Clique em "Conectar ao PC" no topo para restabelecer o streaming de tela com a máquina remota.
            </p>
            <button
              onClick={handleConnect}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition shadow-lg shadow-blue-600/30"
            >
              Conectar Agora
            </button>
          </div>
        )}

        {/* Live Interactive Remote Desktop Display */}
        {connectionStatus === 'connected' && (
          <div className="relative w-full h-full max-w-6xl max-h-[88vh] rounded-xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col bg-slate-900 select-none">
            {/* Windows 11 Desktop Experience */}
            {activeOs === 'windows' && (
              <div
                className="relative flex-1 flex flex-col bg-cover bg-center overflow-hidden"
                style={{
                  backgroundImage: `url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1600&auto=format&fit=crop&q=80')`,
                }}
              >
                {/* Desktop Pinned Icons */}
                <div className="p-4 grid grid-cols-1 gap-4 w-28 text-center text-white drop-shadow-md text-[11px]">
                  <div
                    onClick={() => setOpenWindows((prev) => ({ ...prev, files: !prev.files }))}
                    className="p-2 rounded-lg hover:bg-white/20 transition cursor-pointer flex flex-col items-center space-y-1"
                  >
                    <Folder className="w-8 h-8 text-amber-400 fill-amber-400/50" />
                    <span className="font-semibold">Este Computador</span>
                  </div>

                  <div
                    onClick={() => setOpenWindows((prev) => ({ ...prev, terminal: !prev.terminal }))}
                    className="p-2 rounded-lg hover:bg-white/20 transition cursor-pointer flex flex-col items-center space-y-1"
                  >
                    <Terminal className="w-8 h-8 text-blue-400" />
                    <span className="font-semibold">PowerShell</span>
                  </div>

                  <div
                    onClick={() => setOpenWindows((prev) => ({ ...prev, browser: !prev.browser }))}
                    className="p-2 rounded-lg hover:bg-white/20 transition cursor-pointer flex flex-col items-center space-y-1"
                  >
                    <Globe className="w-8 h-8 text-sky-400" />
                    <span className="font-semibold">Microsoft Edge</span>
                  </div>

                  <div className="p-2 rounded-lg hover:bg-white/20 transition cursor-pointer flex flex-col items-center space-y-1">
                    <Server className="w-8 h-8 text-indigo-400" />
                    <span className="font-semibold">InoveCloud</span>
                  </div>
                </div>

                {/* Open Interactive Windows inside Remote PC */}

                {/* Window 1: PowerShell Terminal */}
                {openWindows.terminal && (
                  <div className="absolute top-10 left-32 w-full max-w-xl bg-slate-950/95 rounded-xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col z-20">
                    <div className="px-3 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300">
                      <div className="flex items-center space-x-2">
                        <Terminal className="w-3.5 h-3.5 text-blue-400" />
                        <span className="font-mono font-semibold">Administrador: Windows PowerShell (VNC)</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <button
                          onClick={() => setOpenWindows((prev) => ({ ...prev, terminal: false }))}
                          className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 transition"
                        />
                      </div>
                    </div>

                    <div className="p-3 font-mono text-xs text-emerald-400 h-56 overflow-y-auto space-y-1">
                      {remoteCmdHistory.map((item, idx) => (
                        <div key={idx} className="whitespace-pre-wrap leading-relaxed text-slate-200">
                          {item}
                        </div>
                      ))}
                      <form onSubmit={handleRemoteCmdSubmit} className="flex items-center space-x-1 pt-1">
                        <span className="text-blue-400 font-bold">PS C:\Users\Administrator&gt;</span>
                        <input
                          type="text"
                          value={remoteCmdInput}
                          onChange={(e) => setRemoteCmdInput(e.target.value)}
                          placeholder="Digite aqui (ex: ipconfig, dir, ping, systeminfo)..."
                          className="flex-1 bg-transparent text-white font-mono text-xs focus:outline-none"
                        />
                      </form>
                    </div>
                  </div>
                )}

                {/* Window 2: File Explorer */}
                {openWindows.files && (
                  <div className="absolute top-20 left-48 w-full max-w-lg bg-slate-900/95 rounded-xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col z-30">
                    <div className="px-3 py-2 bg-slate-800 border-b border-slate-700 flex items-center justify-between text-xs text-slate-200">
                      <div className="flex items-center space-x-2">
                        <Folder className="w-3.5 h-3.5 text-amber-400" />
                        <span className="font-semibold">Explorador de Arquivos — C:\InoveCloud\Volumes</span>
                      </div>
                      <button
                        onClick={() => setOpenWindows((prev) => ({ ...prev, files: false }))}
                        className="text-slate-400 hover:text-white"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="p-3 grid grid-cols-2 gap-2 text-xs">
                      {[
                        { name: 'backup-database-2026.sql', size: '1.4 GB', type: 'SQL Dump' },
                        { name: 'docker-compose.production.yml', size: '4 KB', type: 'YAML' },
                        { name: 'inovecloud-license.key', size: '1 KB', type: 'Certificado' },
                        { name: 'hypervisor-telemetry.log', size: '240 KB', type: 'Log File' },
                      ].map((f, i) => (
                        <div key={i} className="p-2 rounded-lg bg-black/40 border border-white/5 flex items-center space-x-2">
                          <Folder className="w-4 h-4 text-amber-400 shrink-0" />
                          <div className="truncate">
                            <div className="font-semibold text-white truncate">{f.name}</div>
                            <div className="text-[10px] text-slate-400">{f.size} • {f.type}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Window 3: Edge Browser */}
                {openWindows.browser && (
                  <div className="absolute top-14 left-40 w-full max-w-xl bg-slate-900 rounded-xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col z-25">
                    <div className="px-3 py-1.5 bg-slate-800 border-b border-slate-700 flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2 flex-1 mr-4">
                        <Globe className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                        <div className="px-3 py-1 bg-slate-950 rounded-lg text-slate-300 font-mono text-[11px] w-full truncate border border-white/10">
                          https://inovecloud.io/sa-east-1/dashboard
                        </div>
                      </div>
                      <button
                        onClick={() => setOpenWindows((prev) => ({ ...prev, browser: false }))}
                        className="text-slate-400 hover:text-white"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="p-4 bg-slate-950 text-xs space-y-3">
                      <div className="flex items-center justify-between border-b border-white/10 pb-2">
                        <div className="font-bold text-white">InoveCloud Cluster Portal</div>
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px]">
                          STATUS: HEALTHY
                        </span>
                      </div>
                      <p className="text-slate-300 text-xs leading-relaxed">
                        Conectado diretamente ao cluster InoveCloud OS via interface de rede privada virtual KVM.
                      </p>
                    </div>
                  </div>
                )}

                {/* Windows 11 Start Menu Popup */}
                {winStartMenuOpen && (
                  <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-80 bg-slate-900/95 backdrop-blur-2xl rounded-2xl border border-white/15 p-4 shadow-2xl text-white space-y-3 z-30 animate-fade-in">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                      <input
                        type="text"
                        placeholder="Digite para pesquisar aplicativos..."
                        className="w-full pl-8 pr-3 py-1 bg-slate-950 border border-white/10 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fixados</div>
                      <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
                        <button
                          onClick={() => {
                            setOpenWindows((p) => ({ ...p, terminal: true }));
                            setWinStartMenuOpen(false);
                          }}
                          className="p-2 rounded-lg hover:bg-white/10 flex flex-col items-center space-y-1"
                        >
                          <Terminal className="w-5 h-5 text-blue-400" />
                          <span>Terminal</span>
                        </button>
                        <button
                          onClick={() => {
                            setOpenWindows((p) => ({ ...p, files: true }));
                            setWinStartMenuOpen(false);
                          }}
                          className="p-2 rounded-lg hover:bg-white/10 flex flex-col items-center space-y-1"
                        >
                          <Folder className="w-5 h-5 text-amber-400" />
                          <span>Arquivos</span>
                        </button>
                        <button
                          onClick={() => {
                            setOpenWindows((p) => ({ ...p, browser: true }));
                            setWinStartMenuOpen(false);
                          }}
                          className="p-2 rounded-lg hover:bg-white/10 flex flex-col items-center space-y-1"
                        >
                          <Globe className="w-5 h-5 text-sky-400" />
                          <span>Edge</span>
                        </button>
                        <button
                          onClick={() => {
                            triggerToast('Configurações do Windows abertas.');
                            setWinStartMenuOpen(false);
                          }}
                          className="p-2 rounded-lg hover:bg-white/10 flex flex-col items-center space-y-1"
                        >
                          <Settings className="w-5 h-5 text-slate-400" />
                          <span>Ajustes</span>
                        </button>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center font-bold text-[10px]">
                          AD
                        </div>
                        <span className="font-semibold text-[11px]">Administrator</span>
                      </div>
                      <button
                        onClick={handleSendCtrlAltDel}
                        className="p-1.5 rounded-lg hover:bg-white/10 text-red-400"
                        title="Desligar / Bloquear"
                      >
                        <Power className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Windows 11 Bottom Taskbar */}
                <div className="h-11 bg-slate-950/80 backdrop-blur-xl border-t border-white/10 flex items-center justify-between px-3 z-30 shrink-0">
                  {/* Left: Weather/Widgets */}
                  <div className="text-[11px] text-slate-400 hidden sm:flex items-center space-x-1.5">
                    <span>São Paulo 24°C • Ensolarado</span>
                  </div>

                  {/* Centered Taskbar App Icons */}
                  <div className="flex items-center space-x-1.5">
                    {/* Start Button */}
                    <button
                      onClick={() => setWinStartMenuOpen(!winStartMenuOpen)}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition ${
                        winStartMenuOpen ? 'bg-white/20' : 'hover:bg-white/10'
                      }`}
                      title="Menu Iniciar"
                    >
                      <div className="grid grid-cols-2 gap-0.5 w-3.5 h-3.5">
                        <div className="bg-sky-400 rounded-[1px]" />
                        <div className="bg-sky-400 rounded-[1px]" />
                        <div className="bg-sky-400 rounded-[1px]" />
                        <div className="bg-sky-400 rounded-[1px]" />
                      </div>
                    </button>

                    <button
                      onClick={() => setOpenWindows((p) => ({ ...p, terminal: !p.terminal }))}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition ${
                        openWindows.terminal ? 'bg-blue-600/30 border-b-2 border-blue-400' : 'hover:bg-white/10'
                      }`}
                      title="PowerShell"
                    >
                      <Terminal className="w-4 h-4 text-blue-400" />
                    </button>

                    <button
                      onClick={() => setOpenWindows((p) => ({ ...p, files: !p.files }))}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition ${
                        openWindows.files ? 'bg-amber-600/30 border-b-2 border-amber-400' : 'hover:bg-white/10'
                      }`}
                      title="Explorador"
                    >
                      <Folder className="w-4 h-4 text-amber-400" />
                    </button>

                    <button
                      onClick={() => setOpenWindows((p) => ({ ...p, browser: !p.browser }))}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition ${
                        openWindows.browser ? 'bg-sky-600/30 border-b-2 border-sky-400' : 'hover:bg-white/10'
                      }`}
                      title="Edge"
                    >
                      <Globe className="w-4 h-4 text-sky-400" />
                    </button>
                  </div>

                  {/* Right System Tray & Clock */}
                  <div className="flex items-center space-x-2.5 text-xs text-slate-300">
                    <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                    <Volume2 className="w-3.5 h-3.5" />
                    <div className="text-right text-[10px] leading-tight font-mono">
                      <div>14:41</div>
                      <div className="text-slate-500">11/09/2026</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Ubuntu GNOME Desktop Experience */}
            {activeOs === 'ubuntu' && (
              <div
                className="relative flex-1 flex flex-col bg-cover bg-center overflow-hidden"
                style={{
                  backgroundImage: `url('https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1600&auto=format&fit=crop&q=80')`,
                }}
              >
                {/* Ubuntu Top Bar */}
                <div className="h-7 bg-black/70 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-3 text-xs text-white z-20">
                  <span className="font-semibold text-[11px]">Activities</span>
                  <span className="font-mono text-[11px] font-semibold">11 Sep 14:41</span>
                  <div className="flex items-center space-x-2 text-[11px]">
                    <Wifi className="w-3 h-3 text-emerald-400" />
                    <Volume2 className="w-3 h-3" />
                    <Power className="w-3 h-3" />
                  </div>
                </div>

                {/* Ubuntu Layout: Side Dock + Center Workspace */}
                <div className="flex-1 flex">
                  {/* Left Ubuntu Dock */}
                  <div className="w-12 bg-black/60 backdrop-blur-md border-r border-white/10 flex flex-col items-center py-3 space-y-3 z-20">
                    <button
                      onClick={() => setOpenWindows((p) => ({ ...p, files: !p.files }))}
                      className="w-8 h-8 rounded-lg bg-orange-600 p-1.5 flex items-center justify-center text-white shadow hover:scale-105 transition"
                      title="Files"
                    >
                      <Folder className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setOpenWindows((p) => ({ ...p, terminal: !p.terminal }))}
                      className="w-8 h-8 rounded-lg bg-slate-900 border border-white/20 p-1.5 flex items-center justify-center text-emerald-400 shadow hover:scale-105 transition"
                      title="Terminal"
                    >
                      <Terminal className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setOpenWindows((p) => ({ ...p, browser: !p.browser }))}
                      className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-red-600 p-1.5 flex items-center justify-center text-white shadow hover:scale-105 transition"
                      title="Firefox"
                    >
                      <Globe className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Ubuntu Active Terminal Window */}
                  <div className="flex-1 p-6 relative">
                    <div className="w-full max-w-2xl bg-slate-950/95 rounded-xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col">
                      <div className="px-3 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300">
                        <div className="flex items-center space-x-2">
                          <Terminal className="w-3.5 h-3.5 text-orange-400" />
                          <span className="font-mono">root@ubuntu-node:~ (bash)</span>
                        </div>
                        <div className="flex items-center space-x-1.5">
                          <div className="w-2.5 h-2.5 rounded-full bg-slate-600" />
                          <div className="w-2.5 h-2.5 rounded-full bg-slate-600" />
                          <div className="w-2.5 h-2.5 rounded-full bg-red-500 cursor-pointer" />
                        </div>
                      </div>

                      <div className="p-3 font-mono text-xs text-emerald-400 h-64 overflow-y-auto space-y-1">
                        {remoteCmdHistory.map((item, idx) => (
                          <div key={idx} className="whitespace-pre-wrap leading-relaxed text-slate-200">
                            {item}
                          </div>
                        ))}
                        <form onSubmit={handleRemoteCmdSubmit} className="flex items-center space-x-1 pt-1">
                          <span className="text-orange-400 font-bold">root@ubuntu-node:~#</span>
                          <input
                            type="text"
                            value={remoteCmdInput}
                            onChange={(e) => setRemoteCmdInput(e.target.value)}
                            placeholder="Type command (ex: ip a, uname -a, docker ps)..."
                            className="flex-1 bg-transparent text-white font-mono text-xs focus:outline-none"
                          />
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Clipboard Sync Modal */}
      {showClipboardModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-white/20 rounded-2xl p-5 shadow-2xl text-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center space-x-2">
                <Clipboard className="w-4 h-4 text-cyan-400" />
                <h3 className="font-bold text-sm text-white">Sincronização de Área de Transferência</h3>
              </div>
              <button
                onClick={() => setShowClipboardModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">
                  Texto Local para enviar ao PC Remoto:
                </label>
                <textarea
                  value={clipboardContent}
                  onChange={(e) => setClipboardContent(e.target.value)}
                  rows={3}
                  className="w-full p-2.5 bg-slate-950 border border-white/10 rounded-xl text-white font-mono focus:outline-none focus:border-cyan-500"
                />
                <button
                  onClick={() => {
                    triggerToast('Texto enviado para o clipboard do PC remoto com sucesso!');
                    setShowClipboardModal(false);
                  }}
                  className="mt-2 w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition shadow"
                >
                  Enviar para o PC Remoto (Ctrl+V)
                </button>
              </div>

              <div className="pt-2 border-t border-white/10">
                <label className="block text-slate-400 mb-1">
                  Último conteúdo copiado no PC Remoto:
                </label>
                <div className="p-2.5 bg-slate-950 border border-white/10 rounded-xl text-slate-300 font-mono text-[11px]">
                  {remoteClipboard}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
