import React, { useState } from 'react';
import {
  Cpu,
  Zap,
  ShieldCheck,
  Sliders,
  Copy,
  Check,
  Download,
  Terminal,
  Play,
  Flame,
  Gauge,
  Package,
  CheckCircle2,
  FileCode,
  HardDrive
} from 'lucide-react';

export type KernelProfileId = 'bare-metal' | 'size-opt' | 'max-speed' | 'universal' | 'hardened' | 'custom';

export interface KernelProfileDef {
  id: KernelProfileId;
  name: string;
  flagBadge: string;
  kcflags: string;
  optLevel: '-O2' | '-Os' | '-O3' | '-O1';
  march: string;
  description: string;
  targetHardware: string;
  estimatedVmlinuzSize: string;
  bootTimeEstimate: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  borderColor: string;
  bgGlow: string;
  recommendedFor: string;
}

export const KERNEL_PROFILES: KernelProfileDef[] = [
  {
    id: 'bare-metal',
    name: 'Bare-Metal Extreme Performance',
    flagBadge: '-march=native',
    kcflags: '-O2 -march=native -mtune=native -pipe -fno-plt',
    optLevel: '-O2',
    march: 'native',
    description: 'Compila o Kernel explorando todas as instruções vetoriais da sua CPU física (AVX2, AVX-512, FMA, BMI2). Entrega a menor latência de agendamento e máxima vazão de I/O no hardware real.',
    targetHardware: 'Processador Físico do Host (AMD Ryzen / Intel Core)',
    estimatedVmlinuzSize: '11.8 MB',
    bootTimeEstimate: '1.2s – 1.6s',
    icon: Flame,
    accentColor: 'from-amber-500 to-rose-600',
    borderColor: 'border-rose-500/50',
    bgGlow: 'shadow-[0_0_24px_rgba(244,63,94,0.18)]',
    recommendedFor: 'Computadores físicos de alto desempenho, workstations e jogos.',
  },
  {
    id: 'size-opt',
    name: 'Micro-Kernel Compacto (Tamanho Mínimo)',
    flagBadge: '-Os (Tamanho)',
    kcflags: '-Os -fno-unroll-loops -fomit-frame-pointer -finline-limit=30',
    optLevel: '-Os',
    march: 'generic',
    description: 'Otimização focada em compactação binária máxima com -Os. Reduz drasticamente o footprint na RAM e carrega com velocidade extrema mesmo em mídias USB 2.0 lentas.',
    targetHardware: 'PCs Fracos, Sistemas Embarcados & Live USB 2.0',
    estimatedVmlinuzSize: '6.2 MB',
    bootTimeEstimate: '1.4s – 1.9s',
    icon: Gauge,
    accentColor: 'from-emerald-500 to-teal-600',
    borderColor: 'border-emerald-500/50',
    bgGlow: 'shadow-[0_0_24px_rgba(16,185,129,0.18)]',
    recommendedFor: 'Hardware antigo, computadores com pouca RAM e pendrives.',
  },
  {
    id: 'max-speed',
    name: 'Throughput Agressivo (Vetorização Máxima)',
    flagBadge: '-O3 -march=x86-64-v3',
    kcflags: '-O3 -march=x86-64-v3 -flto=thin -pipe -falign-functions=32',
    optLevel: '-O3',
    march: 'x86-64-v3',
    description: 'Habilita vetorização avançada de loops com -O3 e instruções AVX2/BMI2. Ideal para processamento multimídia pesado, renderização Mesa 3D e compilação.',
    targetHardware: 'CPUs Modernas x86_64 desde 2015 (Intel Haswell+, AMD Zen+)',
    estimatedVmlinuzSize: '12.4 MB',
    bootTimeEstimate: '1.3s – 1.7s',
    icon: Zap,
    accentColor: 'from-cyan-500 to-blue-600',
    borderColor: 'border-cyan-500/50',
    bgGlow: 'shadow-[0_0_24px_rgba(6,182,212,0.18)]',
    recommendedFor: 'Edição gráfica, servidores de renderização e estações de computação.',
  },
  {
    id: 'universal',
    name: 'Universal Compatível & Virtualização',
    flagBadge: '-march=x86-64',
    kcflags: '-O2 -march=x86-64 -mtune=generic -pipe',
    optLevel: '-O2',
    march: 'x86-64',
    description: 'Base padrão estável garantida para rodar sem falhas em qualquer máquina x86_64 desde 2004, VirtualBox, VMware, KVM e servidores de nuvem.',
    targetHardware: 'Universal (VirtualBox, VMware, QEMU & Todas as CPUs 64-bit)',
    estimatedVmlinuzSize: '9.5 MB',
    bootTimeEstimate: '1.5s – 2.0s',
    icon: Cpu,
    accentColor: 'from-blue-500 to-indigo-600',
    borderColor: 'border-blue-500/50',
    bgGlow: 'shadow-[0_0_24px_rgba(59,130,246,0.18)]',
    recommendedFor: 'Distribuição geral da ISO, máquinas virtuais e portabilidade universal.',
  },
  {
    id: 'hardened',
    name: 'Hardened Security & Sandboxing',
    flagBadge: 'Proteção Máxima',
    kcflags: '-O2 -fstack-protector-strong -D_FORTIFY_SOURCE=2 -fPIE -Wl,-z,relro,-z,now',
    optLevel: '-O2',
    march: 'x86-64',
    description: 'Ativa proteções contra buffer overflow, KASLR ativo, retpoline contra Spectre/Meltdown e mitigação de ataques no espaço de memória do Kernel.',
    targetHardware: 'Servidores de Produção & Ambientes Sensíveis',
    estimatedVmlinuzSize: '10.9 MB',
    bootTimeEstimate: '1.6s – 2.2s',
    icon: ShieldCheck,
    accentColor: 'from-purple-500 to-indigo-600',
    borderColor: 'border-purple-500/50',
    bgGlow: 'shadow-[0_0_24px_rgba(168,85,247,0.18)]',
    recommendedFor: 'Servidores conectados à internet e infraestrutura corporativa.',
  },
];

export interface KernelBuildProfileProps {
  currentProfileId?: KernelProfileId;
  onApplyProfile?: (profile: KernelProfileDef, customFlags?: string) => void;
  onSimulateWithProfile?: (profile: KernelProfileDef, customFlags?: string) => void;
}

export const KernelBuildProfile: React.FC<KernelBuildProfileProps> = ({
  currentProfileId = 'bare-metal',
  onApplyProfile,
  onSimulateWithProfile,
}) => {
  const [selectedProfileId, setSelectedProfileId] = useState<KernelProfileId>(currentProfileId);
  const [customFlags, setCustomFlags] = useState<string>('-O2 -march=native -pipe -fno-plt');
  const [compressionType, setCompressionType] = useState<'zstd' | 'xz' | 'gzip'>('zstd');
  const [preemptionModel, setPreemptionModel] = useState<'preempt' | 'voluntary' | 'none'>('preempt');
  const [hzFrequency, setHzFrequency] = useState<'1000' | '300' | '250' | '100'>('1000');
  const [selectedArchFlag, setSelectedArchFlag] = useState<string>('-march=native');
  const [selectedOptLevel, setSelectedOptLevel] = useState<'-O2' | '-Os' | '-O3' | '-O1'>('-O2');
  const [copiedMakeCmd, setCopiedMakeCmd] = useState<boolean>(false);
  const [copiedConfig, setCopiedConfig] = useState<boolean>(false);
  const [appliedNotification, setAppliedNotification] = useState<string | null>(null);

  const activeProfile = KERNEL_PROFILES.find((p) => p.id === selectedProfileId) || KERNEL_PROFILES[0];
  const effectiveFlags = selectedProfileId === 'custom' ? customFlags : activeProfile.kcflags;

  const handleSelectProfile = (profile: KernelProfileDef) => {
    setSelectedProfileId(profile.id);
    setSelectedOptLevel(profile.optLevel);
    if (profile.id === 'bare-metal') {
      setSelectedArchFlag('-march=native');
    } else if (profile.id === 'max-speed') {
      setSelectedArchFlag('-march=x86-64-v3');
    } else if (profile.id === 'size-opt') {
      setSelectedArchFlag('-march=generic');
    } else {
      setSelectedArchFlag('-march=x86-64');
    }
  };

  // Dynamically generated make command
  const generatedMakeCommand = `make -j$(nproc) \\
  ARCH=x86_64 \\
  KCFLAGS="${effectiveFlags}" \\
  KCPPFLAGS="${effectiveFlags}" \\
  bzImage modules`;

  // Dynamically generated kernel .config snippet
  const generatedConfigSnippet = `# --- InoveCloud OS Kernel 6.12+ Build Profile: ${activeProfile.name} ---
${(selectedProfileId === 'size-opt' || selectedOptLevel === '-Os') ? 'CONFIG_CC_OPTIMIZE_FOR_SIZE=y\n# CONFIG_CC_OPTIMIZE_FOR_PERFORMANCE is not set' : 'CONFIG_CC_OPTIMIZE_FOR_PERFORMANCE=y\n# CONFIG_CC_OPTIMIZE_FOR_SIZE is not set'}
${compressionType === 'zstd' ? 'CONFIG_KERNEL_ZSTD=y\n# CONFIG_KERNEL_XZ is not set\n# CONFIG_KERNEL_GZIP is not set' : compressionType === 'xz' ? 'CONFIG_KERNEL_XZ=y\n# CONFIG_KERNEL_ZSTD is not set\n# CONFIG_KERNEL_GZIP is not set' : 'CONFIG_KERNEL_GZIP=y'}
${preemptionModel === 'preempt' ? 'CONFIG_PREEMPT=y\n# CONFIG_PREEMPT_VOLUNTARY is not set\n# CONFIG_PREEMPT_NONE is not set' : preemptionModel === 'voluntary' ? 'CONFIG_PREEMPT_VOLUNTARY=y\n# CONFIG_PREEMPT is not set' : 'CONFIG_PREEMPT_NONE=y'}
CONFIG_HZ_${hzFrequency}=y
CONFIG_HZ=${hzFrequency}
CONFIG_DRM=y
CONFIG_DRM_KMS_HELPER=y
CONFIG_DRM_SIMPLEDRM=y
CONFIG_FB=y
CONFIG_FRAMEBUFFER_CONSOLE=y
CONFIG_SQUASHFS=y
CONFIG_OVERLAY_FS=y`;

  const handleCopyMake = () => {
    navigator.clipboard.writeText(generatedMakeCommand);
    setCopiedMakeCmd(true);
    setTimeout(() => setCopiedMakeCmd(false), 2000);
  };

  const handleCopyConfig = () => {
    navigator.clipboard.writeText(generatedConfigSnippet);
    setCopiedConfig(true);
    setTimeout(() => setCopiedConfig(false), 2000);
  };

  const handleDownloadConfig = () => {
    const blob = new Blob([generatedConfigSnippet], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inove-kernel-${selectedProfileId}.config`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleApply = () => {
    if (onApplyProfile) {
      onApplyProfile(activeProfile, selectedProfileId === 'custom' ? customFlags : undefined);
    }
    setAppliedNotification(`Perfil "${activeProfile.name}" aplicado à pipeline de compilação da ISO!`);
    setTimeout(() => setAppliedNotification(null), 3000);
  };

  const handleTriggerSimulate = () => {
    if (onSimulateWithProfile) {
      onSimulateWithProfile(activeProfile, selectedProfileId === 'custom' ? customFlags : undefined);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-rose-950/30 to-slate-900 border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="relative z-10 flex items-start justify-between flex-wrap gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-rose-500/25">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  Kernel Build Profile & Otimizações do Compilador GCC/Clang
                </h3>
                <div className="flex items-center space-x-2 text-xs text-slate-400">
                  <span>Linux Kernel 6.12+ LTS</span>
                  <span aria-hidden="true">·</span>
                  <span>KCFLAGS Diretas</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-rose-400 font-mono">GCC 14 / Clang 18</span>
                  <span aria-hidden="true">·</span>
                  <span>Standalone Pure OS</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed pt-1">
              Configure as flags de otimização de máquina passadas ao compilador durante a geração do binário <code className="text-rose-300 font-mono">vmlinuz</code>. Selecione <strong className="text-rose-400">-march=native</strong> para explorar o conjunto completo de instruções vetoriais da sua CPU física (bare-metal) ou <strong className="text-emerald-400">-Os</strong> para tamanho de disco ultracompacto.
            </p>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              onClick={handleApply}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-bold transition cursor-pointer shadow-lg shadow-rose-600/30 active:scale-95 whitespace-nowrap"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Aplicar Este Profile</span>
            </button>
            {onSimulateWithProfile && (
              <button
                onClick={handleTriggerSimulate}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold border border-white/10 transition cursor-pointer active:scale-95 whitespace-nowrap"
              >
                <Play className="w-3.5 h-3.5 text-emerald-400" />
                <span>Compilar com Profile</span>
              </button>
            )}
          </div>
        </div>

        {appliedNotification && (
          <div className="mt-4 p-2.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{appliedNotification}</span>
          </div>
        )}
      </div>

      {/* Profile Selector Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-semibold uppercase tracking-wider text-[11px] text-slate-300">
            Perfis Predefinidos de Otimização do Kernel:
          </span>
          <span className="text-[11px] text-slate-500">
            {KERNEL_PROFILES.length} perfis de engenharia prontos
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {KERNEL_PROFILES.map((profile) => {
            const Icon = profile.icon;
            const isSelected = selectedProfileId === profile.id;

            return (
              <div
                key={profile.id}
                onClick={() => handleSelectProfile(profile)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                  isSelected
                    ? `bg-slate-900/95 ${profile.borderColor} ${profile.bgGlow} ring-1 ring-white/20`
                    : 'bg-slate-950/70 border-white/10 hover:border-white/20 hover:bg-slate-900/40'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-tr ${profile.accentColor} flex items-center justify-center text-white shadow-md`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white tracking-tight">
                          {profile.name}
                        </h4>
                        <span className="font-mono text-[11px] text-rose-300">
                          {profile.flagBadge}
                        </span>
                      </div>
                    </div>

                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition ${
                      isSelected ? 'border-rose-400 bg-rose-500 text-white' : 'border-slate-600'
                    }`}>
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed pt-1">
                    {profile.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-white/5 space-y-1.5 text-[11px] text-slate-400">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Flags KCFLAGS:</span>
                    <code className="text-cyan-300 font-mono text-[10px] truncate max-w-[260px]">
                      {profile.kcflags}
                    </code>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Tamanho vmlinuz:</span>
                    <span className="font-mono tabular-nums text-slate-200">~{profile.estimatedVmlinuzSize}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Tempo de Boot:</span>
                    <span className="font-mono tabular-nums text-emerald-400">{profile.bootTimeEstimate}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Custom Profile Option */}
        <div
          onClick={() => setSelectedProfileId('custom')}
          className={`p-4 rounded-xl border transition-all cursor-pointer space-y-3 ${
            selectedProfileId === 'custom'
              ? 'bg-slate-900/95 border-amber-500/80 shadow-[0_0_20px_rgba(245,158,11,0.2)] ring-1 ring-amber-400/40'
              : 'bg-slate-950/70 border-white/10 hover:border-white/20'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-md">
                <Terminal className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white tracking-tight">
                  Perfil Customizado (Editor Livre de KCFLAGS & KCPPFLAGS)
                </h4>
                <p className="text-xs text-slate-400">
                  Configure manualmente parâmetros específicos da sua microarquitetura (-march=znver4, -march=alderlake, -flto, -fno-plt, etc.)
                </p>
              </div>
            </div>
            <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition ${
              selectedProfileId === 'custom' ? 'border-amber-400 bg-amber-500 text-white' : 'border-slate-600'
            }`}>
              {selectedProfileId === 'custom' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
            </div>
          </div>

          {selectedProfileId === 'custom' && (
            <div className="pt-2 space-y-2">
              <label className="text-[11px] font-semibold text-slate-300 block">
                Insira as flags C de compilação do Kernel:
              </label>
              <input
                type="text"
                value={customFlags}
                onChange={(e) => setCustomFlags(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-lg px-3 py-2 text-xs font-mono text-amber-300 focus:outline-none"
                placeholder="-O2 -march=native -pipe ..."
              />
              <div className="flex flex-wrap gap-2 text-[10px] text-slate-400 pt-1">
                <span className="text-slate-500">Exemplos rápidos:</span>
                <button
                  type="button"
                  onClick={() => setCustomFlags('-O2 -march=native -mtune=native -pipe')}
                  className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-cyan-300 transition"
                >
                  -march=native (Bare-Metal)
                </button>
                <button
                  type="button"
                  onClick={() => setCustomFlags('-Os -fno-unroll-loops -fomit-frame-pointer')}
                  className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-emerald-300 transition"
                >
                  -Os (Tamanho Mínimo)
                </button>
                <button
                  type="button"
                  onClick={() => setCustomFlags('-O3 -march=x86-64-v3 -flto=thin -pipe')}
                  className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-purple-300 transition"
                >
                  -O3 AVX2 Performance
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Subsystem Toggles: Compression, Preemption, HZ */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-rose-400" />
            <span>Ajustes Avançados de Subsistemas do Kernel (.config)</span>
          </h4>
          <span className="text-[11px] text-slate-400">
            Integrado ao inove_defconfig
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Compression Type */}
          <div className="space-y-1.5">
            <span className="text-slate-400 font-medium">Algoritmo de Compressão do Kernel:</span>
            <div className="flex rounded-lg bg-slate-950 p-1 border border-slate-800">
              {(['zstd', 'xz', 'gzip'] as const).map((comp) => (
                <button
                  key={comp}
                  onClick={() => setCompressionType(comp)}
                  className={`flex-1 py-1 rounded text-center font-bold text-xs uppercase transition cursor-pointer ${
                    compressionType === comp
                      ? 'bg-rose-500 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {comp}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-500">
              {compressionType === 'zstd' ? 'ZSTD: descompressão ultrarrápida (<0.3s) com nível 19.' : compressionType === 'xz' ? 'XZ: menor tamanho em megabytes para pendrives USB.' : 'Gzip: compatibilidade com BIOS legadas.'}
            </p>
          </div>

          {/* Preemption Model */}
          <div className="space-y-1.5">
            <span className="text-slate-400 font-medium">Modelo de Preempção (Scheduler):</span>
            <div className="flex rounded-lg bg-slate-950 p-1 border border-slate-800">
              {(['preempt', 'voluntary', 'none'] as const).map((model) => (
                <button
                  key={model}
                  onClick={() => setPreemptionModel(model)}
                  className={`flex-1 py-1 rounded text-center font-bold text-[11px] capitalize transition cursor-pointer ${
                    preemptionModel === model
                      ? 'bg-indigo-500 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {model === 'preempt' ? 'Low-Latency' : model === 'voluntary' ? 'Desktop' : 'Server'}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-500">
              {preemptionModel === 'preempt' ? 'Baixa latência para Desktop Liquid Glass, cursor e áudio.' : preemptionModel === 'voluntary' ? 'Padrão equilibrado para multitarefas.' : 'Vazão contínua para banco de dados e servidores.'}
            </p>
          </div>

          {/* Timer Frequency */}
          <div className="space-y-1.5">
            <span className="text-slate-400 font-medium">Frequência do Timer (Tick HZ):</span>
            <div className="flex rounded-lg bg-slate-950 p-1 border border-slate-800">
              {(['1000', '300', '250', '100'] as const).map((hz) => (
                <button
                  key={hz}
                  onClick={() => setHzFrequency(hz)}
                  className={`flex-1 py-1 rounded text-center font-bold text-xs transition cursor-pointer ${
                    hzFrequency === hz
                      ? 'bg-amber-500 text-slate-950 shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {hz} Hz
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-500">
              {hzFrequency === '1000' ? '1000 Hz: resposta imediata de teclado e framerate suave.' : hzFrequency === '300' ? '300 Hz: ótimo para notebooks e economia de energia.' : hzFrequency === '250' ? '250 Hz: padrão conservador de distribuições.' : '100 Hz: servidores headless.'}
            </p>
          </div>
        </div>
      </div>

      {/* Generated Make Command & Config View */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold uppercase tracking-wider text-[11px] text-slate-300 flex items-center space-x-1.5">
            <Terminal className="w-3.5 h-3.5 text-rose-400" />
            <span>Comando de Compilação Gerado Dinamicamente:</span>
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopyMake}
              className="flex items-center space-x-1 px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs transition cursor-pointer"
            >
              {copiedMakeCmd ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedMakeCmd ? 'Copiado!' : 'Copiar Comando'}</span>
            </button>
            <button
              onClick={handleCopyConfig}
              className="flex items-center space-x-1 px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs transition cursor-pointer"
            >
              {copiedConfig ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <FileCode className="w-3.5 h-3.5 text-cyan-400" />}
              <span>{copiedConfig ? 'Copiado!' : 'Copiar .config'}</span>
            </button>
            <button
              onClick={handleDownloadConfig}
              className="flex items-center space-x-1 px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>Baixar .config</span>
            </button>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-200 overflow-x-auto leading-relaxed">
          <div className="text-slate-500 select-none pb-1"># Execução oficial no host ou container do GitHub Actions:</div>
          <div className="text-rose-300 font-semibold">{generatedMakeCommand}</div>
        </div>
      </div>
    </div>
  );
};
