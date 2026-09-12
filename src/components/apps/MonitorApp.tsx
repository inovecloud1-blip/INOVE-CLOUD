import React from 'react';
import {
  Activity,
  Cpu,
  HardDrive,
  Wifi,
  Server,
  Globe,
  Zap,
  ShieldCheck,
  RotateCw
} from 'lucide-react';
import { SystemStats } from '../../types';

interface MonitorAppProps {
  stats: SystemStats;
}

export const MonitorApp: React.FC<MonitorAppProps> = ({ stats }) => {
  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 overflow-y-auto p-5 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center space-x-2">
            <Activity className="w-5 h-5 text-emerald-400" />
            <span>Monitor de Desempenho & Hardware</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Métricas em tempo real da infraestrutura física e virtual do InoveCloud OS.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-semibold border border-emerald-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Telemetry 1s Streaming</span>
          </span>
        </div>
      </div>

      {/* Main 4 Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* CPU */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Processamento vCPU</span>
            <Cpu className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white">{stats.cpuUsage}%</div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${stats.cpuUsage}%` }}
            />
          </div>
          <div className="text-[10px] text-slate-500">AMD EPYC 9654 (96 Cores)</div>
        </div>

        {/* RAM */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Memória RAM</span>
            <HardDrive className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-white">{stats.ramUsage}%</div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full transition-all duration-500"
              style={{ width: `${stats.ramUsage}%` }}
            />
          </div>
          <div className="text-[10px] text-slate-500">40.9 GB / 64.0 GB DDR5</div>
        </div>

        {/* NVMe Storage */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Armazenamento NVMe</span>
            <HardDrive className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-white">42%</div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-rose-400 to-pink-500 rounded-full transition-all duration-500"
              style={{ width: '42%' }}
            />
          </div>
          <div className="text-[10px] text-slate-500">420 GB de 1000 GB Usados</div>
        </div>

        {/* Network */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Banda de Rede</span>
            <Wifi className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">10 Gbps</div>
          <div className="text-[11px] text-slate-300 font-mono">
            ▲ {stats.networkUpKbps} KB/s  ▼ {stats.networkDownKbps} KB/s
          </div>
          <div className="text-[10px] text-slate-500">VPC Privada com WireGuard Mesh</div>
        </div>
      </div>

      {/* Cluster Node Summary */}
      <div className="p-5 rounded-2xl bg-slate-900/40 border border-white/10 space-y-3">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
          Resumo da Infraestrutura InoveCloud
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-black/40 rounded-xl">
            <div className="text-slate-400">Máquinas Virtuais (VNs)</div>
            <div className="text-lg font-bold text-white mt-1">
              {stats.vnsRunning} de {stats.vnsTotal} ativas
            </div>
          </div>

          <div className="p-3 bg-black/40 rounded-xl">
            <div className="text-slate-400">Aplicações Web</div>
            <div className="text-lg font-bold text-sky-400 mt-1">
              {stats.webAppsOnline} Online
            </div>
          </div>

          <div className="p-3 bg-black/40 rounded-xl">
            <div className="text-slate-400">Certificados SSL</div>
            <div className="text-lg font-bold text-emerald-400 mt-1">
              {stats.httpsCount} Ativos (100%)
            </div>
          </div>

          <div className="p-3 bg-black/40 rounded-xl">
            <div className="text-slate-400">Aceleração GPU</div>
            <div className="text-lg font-bold text-cyan-400 mt-1">
              {stats.gpuLoad}% Carga vGPU
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
