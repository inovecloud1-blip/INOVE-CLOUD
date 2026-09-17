import React, { useState } from 'react';
import {
  Server,
  Play,
  Square,
  RotateCw,
  Terminal,
  Plus,
  Zap,
  Cpu,
  HardDrive,
  CheckCircle2,
  AlertCircle,
  Clock,
  ExternalLink,
  Shield,
  Search,
  Monitor
} from 'lucide-react';
import { VirtualNode } from '../../types';

interface VnAppProps {
  vns: VirtualNode[];
  onToggleVnStatus: (id: string) => void;
  onCreateVn: (newVn: Omit<VirtualNode, 'id' | 'uptime' | 'usageCpu' | 'usageRam'>) => void;
  onConnectVnc?: (vnId: string) => void;
}

export const OsVectorIcon: React.FC<{ os: VirtualNode['os']; size?: string }> = ({
  os,
  size = 'w-6 h-6',
}) => {
  switch (os) {
    case 'ubuntu':
      return (
        <div className={`${size} rounded-lg bg-[#E95420] flex items-center justify-center p-1 shadow shrink-0`} title="Ubuntu Linux">
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
            <circle cx="50" cy="50" r="38" stroke="#ffffff" strokeWidth="8" />
            <circle cx="50" cy="18" r="7" fill="#ffffff" />
            <circle cx="22" cy="66" r="7" fill="#ffffff" />
            <circle cx="78" cy="66" r="7" fill="#ffffff" />
            <path d="M50 18 L50 26 M22 66 L29 62 M78 66 L71 62" stroke="#E95420" strokeWidth="4" />
          </svg>
        </div>
      );

    case 'windows':
      return (
        <div className={`${size} rounded-lg bg-[#0078D4] flex items-center justify-center p-1 shadow shrink-0`} title="Windows Server">
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
            <rect x="18" y="18" width="28" height="28" fill="#ffffff" />
            <rect x="54" y="18" width="28" height="28" fill="#ffffff" />
            <rect x="18" y="54" width="28" height="28" fill="#ffffff" />
            <rect x="54" y="54" width="28" height="28" fill="#ffffff" />
          </svg>
        </div>
      );

    case 'debian':
      return (
        <div className={`${size} rounded-lg bg-[#D70A53] flex items-center justify-center p-1 shadow shrink-0`} title="Debian GNU/Linux">
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
            <path
              d="M50 16 C30 16 18 32 20 52 C22 72 40 84 58 82 C74 80 82 66 80 52 C78 38 68 32 56 32 C46 32 38 40 40 50 C42 60 52 64 60 58 C64 54 62 48 58 48 C54 48 52 52 50 52"
              stroke="#ffffff"
              strokeWidth="7"
              strokeLinecap="round"
            />
          </svg>
        </div>
      );

    case 'alpine':
      return (
        <div className={`${size} rounded-lg bg-[#0D597F] flex items-center justify-center p-1 shadow shrink-0`} title="Alpine Linux">
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
            {/* Mountain peak silhouette */}
            <path d="M18 78 L45 32 L62 58 L72 42 L86 78 Z" fill="#ffffff" opacity="0.3" />
            <path d="M18 78 L42 34 L58 60 L68 44 L82 78 Z" fill="#38BDF8" />
            <path d="M36 44 L42 34 L48 44 L44 47 Z" fill="#ffffff" />
            <path d="M64 50 L68 44 L72 50 L69 52 Z" fill="#ffffff" />
          </svg>
        </div>
      );

    case 'android':
      return (
        <div className={`${size} rounded-lg bg-[#3DDC84] flex items-center justify-center p-1 shadow shrink-0`} title="Android x86">
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
            {/* Antennae */}
            <line x1="32" y1="20" x2="40" y2="35" stroke="#202124" strokeWidth="5" strokeLinecap="round" />
            <line x1="68" y1="20" x2="60" y2="35" stroke="#202124" strokeWidth="5" strokeLinecap="round" />
            {/* Robot Head */}
            <path d="M22 65 C22 40 34 32 50 32 C66 32 78 40 78 65 Z" fill="#202124" />
            {/* Eyes */}
            <circle cx="38" cy="50" r="3.5" fill="#3DDC84" />
            <circle cx="62" cy="50" r="3.5" fill="#3DDC84" />
          </svg>
        </div>
      );
  }
};

export const VnApp: React.FC<VnAppProps> = ({
  vns,
  onToggleVnStatus,
  onCreateVn,
  onConnectVnc,
}) => {
  const [selectedVnId, setSelectedVnId] = useState<string>(vns[0]?.id || '');
  const [filterOs, setFilterOs] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'console' | 'specs'>('overview');

  // Terminal state for selected VM
  const [terminalInput, setTerminalInput] = useState<string>('');
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    'InoveCloud Hypervisor v2.4 initialized.',
    'Attached to virtual serial console (ttyS0).',
    'Login: root (automatic cloud-init token)',
    'Welcome to InoveCloud Virtual Node. Type "help", "status", "top", or "reboot".',
  ]);

  // New VN Form state
  const [newName, setNewName] = useState('worker-node-02');
  const [newOs, setNewOs] = useState<'ubuntu' | 'windows' | 'debian' | 'alpine' | 'android'>('ubuntu');
  const [newCpu, setNewCpu] = useState(4);
  const [newRam, setNewRam] = useState(8);
  const [newDisk, setNewDisk] = useState(100);
  const [newGpu, setNewGpu] = useState(false);

  const selectedVn = vns.find((v) => v.id === selectedVnId) || vns[0];

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateVn({
      name: newName,
      os: newOs,
      version:
        newOs === 'ubuntu'
          ? 'Ubuntu 24.04 LTS'
          : newOs === 'windows'
          ? 'Windows Server 2025'
          : newOs === 'debian'
          ? 'Debian 13 Trixie'
          : newOs === 'alpine'
          ? 'Alpine 3.20'
          : 'Android 14 x86',
      status: 'running',
      ip: `10.240.0.${Math.floor(Math.random() * 80) + 30}`,
      vCpu: newCpu,
      ramGb: newRam,
      diskGb: newDisk,
      gpuAccelerated: newGpu,
      notes: 'Instância provisionada via InoveCloud OS Console',
      ports: [22, 80],
    });
    setShowCreateModal(false);
  };

  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!terminalInput.trim()) return;

    const cmd = terminalInput.trim().toLowerCase();
    const newLogs = [...terminalLogs, `root@${selectedVn?.name}:~# ${terminalInput}`];

    if (cmd === 'help') {
      newLogs.push('Available commands: status, top, uptime, uname -a, ip a, reboot, clear');
    } else if (cmd === 'status') {
      newLogs.push(`Node: ${selectedVn?.name} | Status: ${selectedVn?.status} | IP: ${selectedVn?.ip}`);
    } else if (cmd === 'top') {
      newLogs.push(`Tasks: 114 total, 1 running | CPU: ${selectedVn?.usageCpu}% | RAM: ${selectedVn?.usageRam}%`);
    } else if (cmd === 'uname -a') {
      newLogs.push(`Linux ${selectedVn?.name} 6.8.0-31-generic #31-InoveCloud-SMP PREEMPT_DYNAMIC x86_64 GNU/Linux`);
    } else if (cmd === 'ip a') {
      newLogs.push(`1: lo: <LOOPBACK,UP> mtu 65536 qdisc noqueue state UNKNOWN`);
      newLogs.push(`2: eth0: <BROADCAST,MULTICAST,UP> inet ${selectedVn?.ip}/24 brd 10.240.0.255`);
    } else if (cmd === 'clear') {
      setTerminalLogs([]);
      setTerminalInput('');
      return;
    } else {
      newLogs.push(`bash: command not found: ${cmd}. Type "help" for options.`);
    }

    setTerminalLogs(newLogs);
    setTerminalInput('');
  };

  const filteredVns = vns.filter((v) => {
    const matchesOs = filterOs === 'all' || v.os === filterOs;
    const matchesSearch = v.name.toLowerCase().includes(searchTerm.toLowerCase()) || v.ip.includes(searchTerm);
    return matchesOs && matchesSearch;
  });

  const getOsBadge = (os: VirtualNode['os']) => {
    switch (os) {
      case 'ubuntu':
        return { name: 'Ubuntu', bg: 'bg-orange-500/20 border-orange-500/30 text-orange-300', dot: 'bg-orange-400' };
      case 'windows':
        return { name: 'Windows Server', bg: 'bg-blue-500/20 border-blue-500/30 text-blue-300', dot: 'bg-blue-400' };
      case 'debian':
        return { name: 'Debian', bg: 'bg-rose-500/20 border-rose-500/30 text-rose-300', dot: 'bg-rose-400' };
      case 'alpine':
        return { name: 'Alpine', bg: 'bg-cyan-500/20 border-cyan-500/30 text-cyan-300', dot: 'bg-cyan-400' };
      case 'android':
        return { name: 'Android x86', bg: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300', dot: 'bg-emerald-400' };
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100">
      {/* Top Banner / Umbrel 2.0 Feature style header */}
      <div className="p-4 bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600/30 border border-blue-500/40 flex items-center justify-center">
              <Server className="w-4 h-4 text-cyan-400" />
            </div>
            <h2 className="text-base font-bold text-white tracking-wide">
              VN — InoveCloud Virtual Nodes
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 border border-emerald-500/30 text-emerald-300">
              KVM / QEMU Active
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Execute qualquer sistema operacional dentro do InoveCloud OS com isolamento de hardware e aceleração GPU.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition active:scale-95 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Criar Nova VN</span>
          </button>
        </div>
      </div>

      {/* Main App Layout (Split: List on Left, Active VN details on Right) */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left: VM List & Filters */}
        <div className="w-full md:w-80 border-r border-white/10 flex flex-col bg-slate-900/50">
          {/* Search and OS filter pills */}
          <div className="p-3 border-b border-white/10 space-y-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nome ou IP..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-950/70 border border-white/10 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center space-x-1 overflow-x-auto pb-1 text-[11px]">
              {['all', 'ubuntu', 'windows', 'debian', 'alpine', 'android'].map((osKey) => (
                <button
                  key={osKey}
                  onClick={() => setFilterOs(osKey)}
                  className={`px-2 py-1 rounded capitalize whitespace-nowrap transition cursor-pointer ${
                    filterOs === osKey
                      ? 'bg-blue-600 text-white font-semibold'
                      : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {osKey === 'all' ? 'Todos' : osKey}
                </button>
              ))}
            </div>
          </div>

          {/* List of VNs */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
            {filteredVns.map((vn) => {
              const badge = getOsBadge(vn.os);
              const isSelected = vn.id === selectedVn?.id;
              const isRunning = vn.status === 'running';

              return (
                <div
                  key={vn.id}
                  onClick={() => setSelectedVnId(vn.id)}
                  className={`p-3 rounded-xl border transition cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600/15 border-blue-500/50 shadow-sm'
                      : 'bg-slate-900/40 border-white/5 hover:bg-white/5 hover:border-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 truncate">
                      <OsVectorIcon os={vn.os} size="w-5 h-5" />
                      <div
                        className={`w-2 h-2 rounded-full ${
                          isRunning ? 'bg-emerald-400 shadow-glow' : 'bg-slate-500'
                        }`}
                      />
                      <span className="font-semibold text-xs text-white truncate">
                        {vn.name}
                      </span>
                    </div>

                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${badge.bg}`}>
                      {badge.name}
                    </span>
                  </div>

                  <div className="mt-2 grid grid-cols-2 text-[11px] text-slate-400 gap-1">
                    <div>IP: <span className="text-slate-200">{vn.ip}</span></div>
                    <div>{vn.vCpu} vCPU • {vn.ramGb}GB</div>
                  </div>

                  {isRunning && (
                    <div className="mt-2 space-y-1">
                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span>CPU {vn.usageCpu}%</span>
                        <span>RAM {vn.usageRam}%</span>
                      </div>
                      <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-400 to-blue-500"
                          style={{ width: `${vn.usageCpu}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Detailed View & Virtual Console */}
        {selectedVn ? (
          <div className="flex-1 flex flex-col overflow-y-auto bg-slate-950">
            {/* Header with Quick Actions */}
            <div className="p-4 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 bg-slate-900/30">
              <div className="flex items-center space-x-3">
                <OsVectorIcon os={selectedVn.os} size="w-10 h-10" />
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-base font-bold text-white">{selectedVn.name}</h3>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                        selectedVn.status === 'running'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}
                    >
                      {selectedVn.status === 'running' ? 'Executando' : 'Parado'}
                    </span>
                    {selectedVn.gpuAccelerated && (
                      <span className="flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        <Zap className="w-3 h-3 text-cyan-400" />
                        <span>GPU Passthrough</span>
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {selectedVn.version} • Uptime: {selectedVn.uptime}
                  </div>
                </div>
              </div>

              {/* VM Power Controls & VNC */}
              <div className="flex items-center space-x-2">
                {onConnectVnc && (
                  <button
                    onClick={() => onConnectVnc(selectedVn.id)}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-cyan-600/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-600/30 text-xs font-semibold transition cursor-pointer"
                    title="Conectar via VNC PC"
                  >
                    <Monitor className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Conectar VNC PC</span>
                  </button>
                )}

                <button
                  onClick={() => onToggleVnStatus(selectedVn.id)}
                  className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    selectedVn.status === 'running'
                      ? 'bg-amber-600/20 text-amber-300 border border-amber-500/30 hover:bg-amber-600/30'
                      : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-600/30'
                  }`}
                >
                  {selectedVn.status === 'running' ? (
                    <>
                      <Square className="w-3.5 h-3.5" />
                      <span>Desligar</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" />
                      <span>Iniciar VN</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    onToggleVnStatus(selectedVn.id);
                    setTimeout(() => onToggleVnStatus(selectedVn.id), 500);
                  }}
                  className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-300 transition"
                  title="Reiniciar VN"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Navigation Tabs (Overview, Console, Specs) */}
            <div className="px-4 border-b border-white/10 flex space-x-4 text-xs font-semibold text-slate-400 bg-slate-900/20">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-2.5 border-b-2 transition ${
                  activeTab === 'overview' ? 'border-blue-500 text-white' : 'border-transparent hover:text-slate-200'
                }`}
              >
                Visão Geral
              </button>
              <button
                onClick={() => setActiveTab('console')}
                className={`py-2.5 border-b-2 transition flex items-center space-x-1.5 ${
                  activeTab === 'console' ? 'border-blue-500 text-white' : 'border-transparent hover:text-slate-200'
                }`}
              >
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                <span>Console VNC / Web Shell</span>
              </button>
              <button
                onClick={() => setActiveTab('specs')}
                className={`py-2.5 border-b-2 transition ${
                  activeTab === 'specs' ? 'border-blue-500 text-white' : 'border-transparent hover:text-slate-200'
                }`}
              >
                Configurações de Hardware
              </button>
            </div>

            {/* Tab: Overview */}
            {activeTab === 'overview' && (
              <div className="p-4 space-y-4">
                {/* Metric Cards Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-slate-900/50 rounded-xl border border-white/10">
                    <div className="text-[11px] text-slate-400 flex items-center space-x-1">
                      <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Uso de vCPU</span>
                    </div>
                    <div className="text-xl font-bold text-white mt-1">
                      {selectedVn.status === 'running' ? `${selectedVn.usageCpu}%` : '0%'}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{selectedVn.vCpu} Cores Virtuais</div>
                  </div>

                  <div className="p-3 bg-slate-900/50 rounded-xl border border-white/10">
                    <div className="text-[11px] text-slate-400 flex items-center space-x-1">
                      <HardDrive className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Memória RAM</span>
                    </div>
                    <div className="text-xl font-bold text-white mt-1">
                      {selectedVn.status === 'running' ? `${selectedVn.usageRam}%` : '0%'}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{selectedVn.ramGb} GB Alocados</div>
                  </div>

                  <div className="p-3 bg-slate-900/50 rounded-xl border border-white/10">
                    <div className="text-[11px] text-slate-400 flex items-center space-x-1">
                      <Shield className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Disco NVMe</span>
                    </div>
                    <div className="text-xl font-bold text-white mt-1">{selectedVn.diskGb} GB</div>
                    <div className="text-[10px] text-emerald-400 mt-0.5">IOPS: 45.000</div>
                  </div>

                  <div className="p-3 bg-slate-900/50 rounded-xl border border-white/10">
                    <div className="text-[11px] text-slate-400 flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>Endereço IP</span>
                    </div>
                    <div className="text-xs font-mono font-bold text-white mt-1.5">{selectedVn.ip}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">VPC Subnet 10.240.0.0/16</div>
                  </div>
                </div>

                {/* Description & Ports */}
                <div className="p-4 bg-slate-900/40 rounded-xl border border-white/10 space-y-3">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Notas da Instância
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {selectedVn.notes}
                  </p>

                  <div className="pt-2 border-t border-white/10 flex flex-wrap items-center gap-2">
                    <span className="text-xs text-slate-400">Portas Abertas:</span>
                    {selectedVn.ports.map((port) => (
                      <span
                        key={port}
                        className="px-2 py-0.5 bg-slate-800 text-cyan-300 rounded font-mono text-[11px] border border-white/10"
                      >
                        :{port}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Console / Web VNC */}
            {activeTab === 'console' && (
              <div className="flex-1 p-4 flex flex-col space-y-3">
                {/* VNC PC Direct Access Callout */}
                <div className="p-3 rounded-xl bg-gradient-to-r from-blue-950/60 via-cyan-950/40 to-slate-900 border border-cyan-500/30 flex items-center justify-between gap-3 shrink-0">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-300">
                      <Monitor className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Sessão Gráfica VNC / Conectar PC Remoto</div>
                      <div className="text-[11px] text-slate-400">
                        Acesse a interface gráfica com baixa latência, aceleração GPU e teclado interativo.
                      </div>
                    </div>
                  </div>
                  {onConnectVnc && (
                    <button
                      onClick={() => onConnectVnc(selectedVn.id)}
                      className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-lg shadow-cyan-600/30 transition shrink-0 cursor-pointer"
                    >
                      <Monitor className="w-3.5 h-3.5" />
                      <span>Abrir no Conectar PC</span>
                    </button>
                  )}
                </div>

                <div className="flex-1 bg-black rounded-xl border border-slate-800 p-3 font-mono text-xs text-emerald-400 flex flex-col shadow-inner overflow-hidden min-h-[260px]">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-slate-500 text-[11px]">
                    <div className="flex items-center space-x-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                      <span>Web VNC / Serial Session (ttyS0) - {selectedVn.name}</span>
                    </div>
                    <span>ESC to exit</span>
                  </div>

                  {/* Terminal Log Stream */}
                  <div className="flex-1 overflow-y-auto py-2 space-y-1 font-mono text-xs">
                    {terminalLogs.map((log, i) => (
                      <div key={i} className="text-slate-300">
                        {log}
                      </div>
                    ))}
                  </div>

                  {/* Terminal Command Input */}
                  <form onSubmit={handleTerminalSubmit} className="pt-2 border-t border-slate-800 flex items-center space-x-2">
                    <span className="text-emerald-400 font-bold">root@{selectedVn.name}:~#</span>
                    <input
                      type="text"
                      value={terminalInput}
                      onChange={(e) => setTerminalInput(e.target.value)}
                      placeholder="Digite comando (help, top, status, reboot)..."
                      className="flex-1 bg-transparent text-white focus:outline-none font-mono text-xs"
                      autoFocus
                    />
                  </form>
                </div>
              </div>
            )}

            {/* Tab: Specs */}
            {activeTab === 'specs' && (
              <div className="p-4 space-y-4">
                <div className="bg-slate-900/50 rounded-xl p-4 border border-white/10 space-y-3">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Perfil de Virtualização
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-black/40 rounded-lg">
                      <div className="text-slate-400">Hipervisor</div>
                      <div className="font-semibold text-white mt-1">Linux KVM + QEMU 8.2</div>
                    </div>
                    <div className="p-3 bg-black/40 rounded-lg">
                      <div className="text-slate-400">Arquitetura</div>
                      <div className="font-semibold text-white mt-1">x86_64 (Intel Xeon Platinum / AMD EPYC)</div>
                    </div>
                    <div className="p-3 bg-black/40 rounded-lg">
                      <div className="text-slate-400">Placa de Vídeo</div>
                      <div className="font-semibold text-cyan-400 mt-1">
                        {selectedVn.gpuAccelerated ? 'NVIDIA vGPU RTX A5000 (16GB VRAM)' : 'VirtIO Standard VGA'}
                      </div>
                    </div>
                    <div className="p-3 bg-black/40 rounded-lg">
                      <div className="text-slate-400">Controlador de Disco</div>
                      <div className="font-semibold text-white mt-1">VirtIO-SCSI (Trim/Discard habilitado)</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-500 text-xs">
            Nenhuma VN selecionada.
          </div>
        )}
      </div>

      {/* Modal: Criar Nova VN */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/15 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center space-x-2">
                <Server className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-sm text-white">Criar Nova Máquina Virtual (VN)</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-medium">Nome do Host</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Sistema Operacional</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: 'ubuntu', label: 'Ubuntu 24.04 LTS' },
                    { key: 'windows', label: 'Windows Server 2025' },
                    { key: 'debian', label: 'Debian 13 Trixie' },
                    { key: 'alpine', label: 'Alpine Linux 3.20' },
                    { key: 'android', label: 'Android x86 QA' },
                  ].map((osItem) => (
                    <button
                      type="button"
                      key={osItem.key}
                      onClick={() => setNewOs(osItem.key as any)}
                      className={`p-2.5 rounded-lg border text-left transition cursor-pointer ${
                        newOs === osItem.key
                          ? 'bg-blue-600/30 border-blue-500 text-white font-semibold'
                          : 'bg-slate-950/60 border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      {osItem.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">vCPU ({newCpu})</label>
                  <select
                    value={newCpu}
                    onChange={(e) => setNewCpu(Number(e.target.value))}
                    className="w-full px-2 py-1.5 bg-slate-950 border border-white/10 rounded text-white"
                  >
                    <option value={2}>2 Cores</option>
                    <option value={4}>4 Cores</option>
                    <option value={8}>8 Cores</option>
                    <option value={16}>16 Cores</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">RAM ({newRam}GB)</label>
                  <select
                    value={newRam}
                    onChange={(e) => setNewRam(Number(e.target.value))}
                    className="w-full px-2 py-1.5 bg-slate-950 border border-white/10 rounded text-white"
                  >
                    <option value={4}>4 GB</option>
                    <option value={8}>8 GB</option>
                    <option value={16}>16 GB</option>
                    <option value={32}>32 GB</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Disco SSD</label>
                  <select
                    value={newDisk}
                    onChange={(e) => setNewDisk(Number(e.target.value))}
                    className="w-full px-2 py-1.5 bg-slate-950 border border-white/10 rounded text-white"
                  >
                    <option value={50}>50 GB</option>
                    <option value={100}>100 GB</option>
                    <option value={250}>250 GB</option>
                    <option value={500}>500 GB</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="gpuCheck"
                  checked={newGpu}
                  onChange={(e) => setNewGpu(e.target.checked)}
                  className="rounded bg-slate-950 border-white/20 text-blue-600 focus:ring-0"
                />
                <label htmlFor="gpuCheck" className="text-slate-300 cursor-pointer flex items-center space-x-1">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Habilitar Aceleração de GPU dedicada (Passthrough)</span>
                </label>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-lg shadow-blue-600/30 cursor-pointer"
                >
                  Provisionar VN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
