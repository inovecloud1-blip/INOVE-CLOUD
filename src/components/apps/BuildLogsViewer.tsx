import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Terminal,
  Play,
  Pause,
  RotateCcw,
  Download,
  Copy,
  Check,
  Search,
  Filter,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Info,
  ArrowDown,
  FileText,
  Upload,
  Layers,
  Cpu,
  RefreshCw,
  Bug,
  ShieldCheck,
} from 'lucide-react';

export interface BuildLogLine {
  id: string;
  timestamp: string;
  stream: 'stdout' | 'stderr' | 'info' | 'warn' | 'error' | 'success';
  stage: 'kernel' | 'init' | 'compositor' | 'initramfs' | 'squashfs' | 'bootloader' | 'iso' | 'general';
  text: string;
  code?: number;
}

interface BuildLogsViewerProps {
  initialLogs?: string[];
  isBuilding?: boolean;
  onTriggerBuild?: () => void;
  className?: string;
  standalone?: boolean;
}

const SAMPLE_REALISTIC_BUILD_LOGS: BuildLogLine[] = [
  { id: '1', timestamp: '14:20:01', stream: 'info', stage: 'general', text: '>>> [SYS] Iniciando pipeline de compilação da ISO InoveCloud OS (Pure Linux Kernel 6.12+ Standalone)' },
  { id: '2', timestamp: '14:20:02', stream: 'stdout', stage: 'general', text: 'HOST: Linux 6.12.10-inovecloud x86_64 | GNU Make 4.4.1 | GCC 14.2.0 | Musl-libc 1.2.5' },
  { id: '3', timestamp: '14:20:03', stream: 'stdout', stage: 'kernel', text: '[KBUILD] Verificando árvore de código-fonte: /usr/src/linux-6.12.y (Pure Linux Kernel LTS)' },
  { id: '4', timestamp: '14:20:04', stream: 'stdout', stage: 'kernel', text: '[KBUILD] Aplicando inove_defconfig: DRM/KMS, AHCI, NVMe, VirtIO, OverlayFS, SquashFS built-in (=y)' },
  { id: '5', timestamp: '14:20:06', stream: 'stdout', stage: 'kernel', text: '  CALL    scripts/checksyscalls.sh' },
  { id: '6', timestamp: '14:20:07', stream: 'stdout', stage: 'kernel', text: '  CC      arch/x86/kernel/process_64.o' },
  { id: '7', timestamp: '14:20:09', stream: 'stdout', stage: 'kernel', text: '  CC      drivers/gpu/drm/drm_drv.o' },
  { id: '8', timestamp: '14:20:10', stream: 'stderr', stage: 'kernel', text: 'drivers/gpu/drm/i915/display/intel_display.c:124: warning: unused variable \'pipe_config\' [-Wunused-variable]' },
  { id: '9', timestamp: '14:20:12', stream: 'stdout', stage: 'kernel', text: '  CC      drivers/ata/ahci.o (SATA AHCI Controller Nativo Built-in)' },
  { id: '10', timestamp: '14:20:14', stream: 'stdout', stage: 'kernel', text: '  CC      drivers/nvme/host/core.o (NVMe SSD Controller Built-in)' },
  { id: '11', timestamp: '14:20:18', stream: 'stdout', stage: 'kernel', text: '  LD      vmlinux' },
  { id: '12', timestamp: '14:20:21', stream: 'stdout', stage: 'kernel', text: '  OBJCOPY arch/x86/boot/vmlinux.bin' },
  { id: '13', timestamp: '14:20:24', stream: 'stdout', stage: 'kernel', text: '[KBUILD] Kernel bzImage gerado com sucesso: arch/x86/boot/bzImage (12.4 MB)' },
  { id: '14', timestamp: '14:20:25', stream: 'stdout', stage: 'init', text: '[INIT] Compilando Inove Init (PID 1 nativo em C puro):' },
  { id: '15', timestamp: '14:20:26', stream: 'stdout', stage: 'init', text: '  gcc -static -O3 -Wall -Wextra src/init.c -o build/rootfs/init -luring' },
  { id: '16', timestamp: '14:20:27', stream: 'stdout', stage: 'init', text: '[INIT] Syscalls verificadas: sys_mount("devtmpfs", "/dev"), sys_mount("proc", "/proc"), sys_mount("sysfs", "/sys")' },
  { id: '17', timestamp: '14:20:29', stream: 'stdout', stage: 'compositor', text: '[GRAPHICS] Compilando Inove DRM/KMS Compositor com aceleração Mesa 24.3.0 & Wayland Direct Scanout' },
  { id: '18', timestamp: '14:20:31', stream: 'stderr', stage: 'compositor', text: 'inove-compositor.c: note: Liquid Glass 3D renderer loaded with 16x multisampling fallback' },
  { id: '19', timestamp: '14:20:33', stream: 'stdout', stage: 'initramfs', text: '[INITRAMFS] Empacotando árvore initramfs: cpio -o -H newc | zstd -19 -T0' },
  { id: '20', timestamp: '14:20:35', stream: 'stdout', stage: 'initramfs', text: '[INITRAMFS] Initramfs comprimida: image/boot/initramfs-inovecloud.cpio.zst (38 MB) -> Tempo de descompressão: 120ms' },
  { id: '21', timestamp: '14:20:37', stream: 'stdout', stage: 'squashfs', text: '[ROOTFS] Gerando imagem do sistema: mksquashfs rootfs image/live/rootfs.squashfs -comp xz -b 1048576 -Xbcj x86' },
  { id: '22', timestamp: '14:20:41', stream: 'stdout', stage: 'squashfs', text: '[ROOTFS] Micro-Rootfs comprimida: 780 MB (Redução de 68% do espaço em disco)' },
  { id: '23', timestamp: '14:20:43', stream: 'stdout', stage: 'bootloader', text: '[BOOTLOADER] Configurando partição EFI ESP (FAT32) e GRUB2 2.12 híbrido (UEFI x86_64 + BIOS MBR)' },
  { id: '24', timestamp: '14:20:46', stream: 'stdout', stage: 'iso', text: '[XORRISO] Executando geração da ISO Híbrida Bootável:' },
  { id: '25', timestamp: '14:20:48', stream: 'stdout', stage: 'iso', text: '  xorriso -as mkisofs -iso-level 3 -full-iso9660-filenames -volid "INOVECLOUD_OS" -eltorito-boot boot/grub/bios.img -eltorito-catalog boot/grub/boot.cat -no-emul-boot -boot-load-size 4 -boot-info-table --eltorito-alt-boot -e EFI/boot/efiboot.img -no-emul-boot -isohybrid-gpt-basdat -output dist-iso/inovecloud-os-kernel-pure-x86_64.iso' },
  { id: '26', timestamp: '14:20:52', stream: 'success', stage: 'iso', text: '>>> [SUCESSO] ISO híbrida gerada com perfeição: dist-iso/inovecloud-os-kernel-pure-x86_64.iso (840 MB)' },
  { id: '27', timestamp: '14:20:53', stream: 'info', stage: 'iso', text: 'SHA256: a71e89f104d493bc489e27c1949f83e204b12c5890fae4125b3648f830a7d901' },
];

export const BuildLogsViewer: React.FC<BuildLogsViewerProps> = ({
  initialLogs,
  isBuilding = false,
  onTriggerBuild,
  className = '',
  standalone = false,
}) => {
  const [logs, setLogs] = useState<BuildLogLine[]>(SAMPLE_REALISTIC_BUILD_LOGS);
  const [streamFilter, setStreamFilter] = useState<'all' | 'stdout' | 'stderr' | 'errors_warnings'>('all');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isLoadingServerLogs, setIsLoadingServerLogs] = useState(false);
  const [activeTab, setActiveTab] = useState<'console' | 'stats' | 'diagnostics'>('console');
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [wrapLines, setWrapLines] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Fetch persistent build logs from server API on mount
  const fetchServerLogs = async () => {
    setIsLoadingServerLogs(true);
    try {
      const res = await fetch('/api/iso/logs');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.logs) && data.logs.length > 0) {
          setLogs(data.logs);
        }
      }
    } catch (e) {
      console.warn('[BuildLogsViewer] Usando logs locais de fallback:', e);
    } finally {
      setIsLoadingServerLogs(false);
    }
  };

  useEffect(() => {
    fetchServerLogs();
  }, []);

  // Update logs if parent passes new string logs
  useEffect(() => {
    if (initialLogs && initialLogs.length > 0) {
      const parsed: BuildLogLine[] = initialLogs.map((line, idx) => {
        const isStderr =
          line.toLowerCase().includes('warning') ||
          line.toLowerCase().includes('error') ||
          line.toLowerCase().includes('fail') ||
          line.includes('stderr') ||
          line.includes('*** [');
        const isSuccess = line.toLowerCase().includes('sucesso') || line.toLowerCase().includes('concluído') || line.includes('SUCCESS');
        
        let stage: BuildLogLine['stage'] = 'general';
        if (line.includes('[KBUILD]') || line.toLowerCase().includes('kernel') || line.includes('bzImage')) stage = 'kernel';
        else if (line.includes('[INIT]') || line.toLowerCase().includes('syscall')) stage = 'init';
        else if (line.includes('[GRAPHICS]') || line.toLowerCase().includes('compositor') || line.toLowerCase().includes('mesa')) stage = 'compositor';
        else if (line.includes('[INITRAMFS]')) stage = 'initramfs';
        else if (line.includes('[ROOTFS]') || line.toLowerCase().includes('squashfs')) stage = 'squashfs';
        else if (line.includes('[BOOTLOADER]') || line.toLowerCase().includes('grub')) stage = 'bootloader';
        else if (line.includes('[XORRISO]') || line.toLowerCase().includes('iso')) stage = 'iso';

        return {
          id: `parent_${idx}_${Date.now()}`,
          timestamp: new Date().toLocaleTimeString('pt-BR'),
          stream: isSuccess ? 'success' : isStderr ? 'stderr' : 'stdout',
          stage,
          text: line,
        };
      });
      setLogs(parsed);
    }
  }, [initialLogs]);

  // Auto scroll effect
  useEffect(() => {
    if (autoScroll && terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  // Stream simulation: Simulate a real compilation with stdout & stderr
  const runSimulatedBuild = () => {
    if (onTriggerBuild) {
      onTriggerBuild();
    }
    const simulatedSteps: { delay: number; stream: BuildLogLine['stream']; stage: BuildLogLine['stage']; text: string }[] = [
      { delay: 300, stream: 'info', stage: 'general', text: '>>> [PIPELINE] Disparando nova compilação limpa do Pure Linux Kernel 6.12+ (inove_defconfig)...' },
      { delay: 800, stream: 'stdout', stage: 'general', text: 'make clean && make mrproper (Limpando resíduos de compilações anteriores)' },
      { delay: 1400, stream: 'stdout', stage: 'kernel', text: '[KBUILD] Compilando árvore: make -j$(nproc) bzImage (48 threads de execução paralelas)' },
      { delay: 2000, stream: 'stdout', stage: 'kernel', text: '  CC      init/main.o' },
      { delay: 2600, stream: 'stdout', stage: 'kernel', text: '  CC      kernel/fork.o' },
      { delay: 3200, stream: 'stderr', stage: 'kernel', text: 'kernel/sched/core.c:3412: warning: control reaches end of non-void function [-Wreturn-type]' },
      { delay: 3800, stream: 'stdout', stage: 'kernel', text: '  CC      drivers/gpu/drm/drm_kms_helper.o' },
      { delay: 4400, stream: 'stdout', stage: 'kernel', text: '[KBUILD] Kernel Monolítico compilado: arch/x86/boot/bzImage (12.4 MB) com DRM/KMS nativo.' },
      { delay: 5000, stream: 'stdout', stage: 'init', text: '[INIT] Compilando Inove Init (PID 1 nativo): gcc -static -O3 inove-init.c -o rootfs/init' },
      { delay: 5600, stream: 'stdout', stage: 'compositor', text: '[GRAPHICS] Injetando compositor DRM/KMS Wayland com renderizador Liquid Glass' },
      { delay: 6200, stream: 'stdout', stage: 'initramfs', text: '[INITRAMFS] Empacotando initramfs ultra-rápida: zstd -19 -T0 image/boot/initramfs-inovecloud.cpio.zst' },
      { delay: 6800, stream: 'stdout', stage: 'squashfs', text: '[ROOTFS] Compactando sistema em SquashFS de alta densidade (xz -b 1048576)' },
      { delay: 7400, stream: 'stdout', stage: 'bootloader', text: '[GRUB2] Montando imagem híbrida UEFI FAT32 ESP + BIOS Syslinux eltorito' },
      { delay: 8000, stream: 'success', stage: 'iso', text: '>>> [SUCESSO] Imagem final gerada: dist-iso/inovecloud-os-kernel-pure-x86_64.iso (840 MB)' },
      { delay: 8200, stream: 'info', stage: 'iso', text: 'SHA256: a71e89f104d493bc489e27c1949f83e204b12c5890fae4125b3648f830a7d901' },
    ];

    setLogs([
      {
        id: `start_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString('pt-BR'),
        stream: 'info',
        stage: 'general',
        text: '>>> Iniciando novo ciclo de compilação em tempo real...',
      },
    ]);

    simulatedSteps.forEach((step, idx) => {
      setTimeout(() => {
        setLogs((prev) => [
          ...prev,
          {
            id: `step_${idx}_${Date.now()}`,
            timestamp: new Date().toLocaleTimeString('pt-BR'),
            stream: step.stream,
            stage: step.stage,
            text: step.text,
          },
        ]);
      }, step.delay);
    });
  };

  // Simulate an error log scenario for debugging inspection
  const simulateErrorBuild = () => {
    const errorSteps: { delay: number; stream: BuildLogLine['stream']; stage: BuildLogLine['stage']; text: string }[] = [
      { delay: 200, stream: 'info', stage: 'general', text: '>>> [DEPURAÇÃO] Simulando teste de detecção de erros de compilação da ISO...' },
      { delay: 600, stream: 'stdout', stage: 'kernel', text: '[KBUILD] make -j$(nproc) bzImage' },
      { delay: 1100, stream: 'stderr', stage: 'kernel', text: 'Cannot find libelf.h or gelf.h. Please install libelf-dev or elfutils-libelf-devel.' },
      { delay: 1400, stream: 'error', stage: 'kernel', text: 'make[1]: *** [Makefile:1924: scripts_basic] Error 2' },
      { delay: 1800, stream: 'stderr', stage: 'kernel', text: 'FATAL ERROR: Failed to compile Linux Kernel 6.12 bzImage. Build process terminated with exit code 2.' },
      { delay: 2200, stream: 'info', stage: 'general', text: '💡 [DIAGNÓSTICO AUTOMÁTICO] O pacote libelf-dev é obrigatório para compilar o subsistema eBPF/ORC unwinder do Kernel Linux 6.12+.' },
    ];

    setLogs([
      {
        id: `err_start_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString('pt-BR'),
        stream: 'warn',
        stage: 'general',
        text: '>>> Modo de Teste de Depuração de Falhas ativado.',
      },
    ]);

    errorSteps.forEach((step, idx) => {
      setTimeout(() => {
        setLogs((prev) => [
          ...prev,
          {
            id: `err_step_${idx}_${Date.now()}`,
            timestamp: new Date().toLocaleTimeString('pt-BR'),
            stream: step.stream,
            stage: step.stage,
            text: step.text,
          },
        ]);
      }, step.delay);
    });
  };

  // Clear logs
  const handleClearLogs = async () => {
    setLogs([
      {
        id: `${Date.now()}`,
        timestamp: new Date().toLocaleTimeString('pt-BR'),
        stream: 'info',
        stage: 'general',
        text: '>>> Log buffer reinicializado pelo usuário.',
      },
    ]);
    try {
      await fetch('/api/iso/logs/clear', { method: 'POST' });
    } catch (e) {}
  };

  // Copy all logs to clipboard
  const handleCopyLogs = () => {
    const text = logs
      .map((l) => `[${l.timestamp}] [${l.stream.toUpperCase()}] [${l.stage.toUpperCase()}] ${l.text}`)
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download logs as .log file
  const handleDownloadLogFile = () => {
    const text = logs
      .map((l) => `[${l.timestamp}] [${l.stream.toUpperCase()}] [${l.stage.toUpperCase()}] ${l.text}`)
      .join('\n');
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inovecloud-iso-build-${new Date().toISOString().slice(0, 10)}.log`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Upload/Read custom log file from disk
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) return;

      const lines = content.split('\n').filter((l) => l.trim().length > 0);
      const parsed: BuildLogLine[] = lines.map((line, idx) => {
        const isStderr =
          line.toLowerCase().includes('error') ||
          line.toLowerCase().includes('warning') ||
          line.toLowerCase().includes('fail') ||
          line.toLowerCase().includes('fatal') ||
          line.includes('[STDERR]');
        const isSuccess = line.toLowerCase().includes('success') || line.toLowerCase().includes('sucesso') || line.includes('[SUCCESS]');

        let stage: BuildLogLine['stage'] = 'general';
        if (line.includes('KBUILD') || line.includes('kernel') || line.includes('bzImage')) stage = 'kernel';
        else if (line.includes('INIT') || line.includes('syscall')) stage = 'init';
        else if (line.includes('compositor') || line.includes('drm')) stage = 'compositor';
        else if (line.includes('initramfs')) stage = 'initramfs';
        else if (line.includes('squashfs')) stage = 'squashfs';
        else if (line.includes('grub') || line.includes('bootloader')) stage = 'bootloader';
        else if (line.includes('xorriso') || line.includes('iso')) stage = 'iso';

        return {
          id: `file_${idx}_${Date.now()}`,
          timestamp: new Date().toLocaleTimeString('pt-BR'),
          stream: isSuccess ? 'success' : isStderr ? 'stderr' : 'stdout',
          stage,
          text: line,
        };
      });

      setLogs(parsed);
    };
    reader.readAsText(file);
  };

  // Filtered logs computation
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      // Stream filter
      if (streamFilter === 'stdout' && log.stream !== 'stdout' && log.stream !== 'success') {
        return false;
      }
      if (
        streamFilter === 'stderr' &&
        log.stream !== 'stderr' &&
        log.stream !== 'error' &&
        log.stream !== 'warn'
      ) {
        return false;
      }
      if (
        streamFilter === 'errors_warnings' &&
        log.stream !== 'stderr' &&
        log.stream !== 'error' &&
        log.stream !== 'warn'
      ) {
        return false;
      }

      // Stage filter
      if (stageFilter !== 'all' && log.stage !== stageFilter) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          log.text.toLowerCase().includes(q) ||
          log.stage.toLowerCase().includes(q) ||
          log.timestamp.includes(q) ||
          log.stream.toLowerCase().includes(q)
        );
      }

      return true;
    });
  }, [logs, streamFilter, stageFilter, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const total = logs.length;
    const stdoutCount = logs.filter((l) => l.stream === 'stdout' || l.stream === 'success').length;
    const stderrCount = logs.filter((l) => l.stream === 'stderr' || l.stream === 'warn').length;
    const errorCount = logs.filter((l) => l.stream === 'error').length;
    const stages = Array.from(new Set(logs.map((l) => l.stage)));
    return { total, stdoutCount, stderrCount, errorCount, stagesCount: stages.length };
  }, [logs]);

  // Helper for line color and badge
  const renderLogLine = (log: BuildLogLine, index: number) => {
    let textColor = 'text-slate-200';
    let badgeBg = 'bg-slate-800 text-slate-300 border-slate-700';
    let streamLabel = 'stdout';

    if (log.stream === 'stderr') {
      textColor = 'text-amber-300';
      badgeBg = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      streamLabel = 'stderr';
    } else if (log.stream === 'error') {
      textColor = 'text-rose-400 font-semibold';
      badgeBg = 'bg-rose-500/20 text-rose-300 border-rose-500/50';
      streamLabel = 'stderr:err';
    } else if (log.stream === 'warn') {
      textColor = 'text-amber-300';
      badgeBg = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      streamLabel = 'stderr:warn';
    } else if (log.stream === 'success') {
      textColor = 'text-emerald-300 font-bold';
      badgeBg = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      streamLabel = 'stdout:ok';
    } else if (log.stream === 'info') {
      textColor = 'text-cyan-300';
      badgeBg = 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
      streamLabel = 'info';
    }

    const stageColors: Record<string, string> = {
      kernel: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
      init: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
      compositor: 'text-pink-400 bg-pink-500/10 border-pink-500/30',
      initramfs: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
      squashfs: 'text-teal-400 bg-teal-500/10 border-teal-500/30',
      bootloader: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
      iso: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
      general: 'text-slate-400 bg-slate-500/10 border-slate-500/30',
    };

    return (
      <div
        key={log.id || index}
        className={`group flex items-start space-x-2.5 py-1 px-2.5 rounded hover:bg-white/5 transition font-mono text-xs ${
          log.stream === 'error' ? 'bg-rose-950/30 border-l-2 border-rose-500' : ''
        } ${log.stream === 'stderr' ? 'bg-amber-950/20 border-l-2 border-amber-500/50' : ''}`}
      >
        {/* Line Number */}
        {showLineNumbers && (
          <span className="w-10 shrink-0 text-slate-600 select-none text-[11px] text-right font-mono pr-1">
            {index + 1}
          </span>
        )}

        {/* Timestamp */}
        <span className="text-slate-500 text-[11px] shrink-0 select-none font-mono">
          [{log.timestamp}]
        </span>

        {/* Stream Badge (stdout / stderr) */}
        <span
          className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shrink-0 border select-none ${badgeBg}`}
        >
          {streamLabel}
        </span>

        {/* Stage Badge */}
        <span
          className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider shrink-0 border select-none ${
            stageColors[log.stage] || stageColors.general
          }`}
        >
          {log.stage}
        </span>

        {/* Log Text Content */}
        <span
          className={`flex-1 leading-relaxed ${textColor} ${
            wrapLines ? 'break-all whitespace-pre-wrap' : 'whitespace-nowrap overflow-x-hidden'
          }`}
        >
          {log.text}
        </span>
      </div>
    );
  };

  return (
    <div
      className={`flex flex-col bg-slate-950 rounded-2xl border border-white/10 overflow-hidden shadow-2xl ${
        standalone ? 'h-full min-h-[600px]' : 'h-[580px]'
      } ${className}`}
    >
      {/* Top Header Controls */}
      <div className="p-4 bg-slate-900/90 border-b border-white/10 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-red-600 to-rose-600 flex items-center justify-center text-white shadow-lg shadow-red-600/20">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-bold text-white tracking-tight">
                BuildLogsViewer — Console stdout & stderr da Compilação
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/30">
                Log Persistente
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                /var/log/inovecloud/iso-build.log
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Visualizador com diferenciação de cores de terminal para depuração ágil do Pure Linux Kernel, Initramfs e GRUB2.
            </p>
          </div>
        </div>

        {/* Top Action Buttons */}
        <div className="flex items-center space-x-2 flex-wrap">
          <button
            onClick={fetchServerLogs}
            disabled={isLoadingServerLogs}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition cursor-pointer border border-white/10 disabled:opacity-50"
            title="Recarregar arquivo de log do servidor"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingServerLogs ? 'animate-spin' : ''}`} />
            <span>Sincronizar</span>
          </button>

          <button
            onClick={runSimulatedBuild}
            disabled={isBuilding}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition cursor-pointer shadow-lg shadow-emerald-600/25 active:scale-95"
            title="Executar simulação completa de build"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Executar Build</span>
          </button>

          <button
            onClick={simulateErrorBuild}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 text-xs font-bold transition cursor-pointer active:scale-95"
            title="Simular erro para testar diagnósticos"
          >
            <Bug className="w-3.5 h-3.5" />
            <span>Testar Erro</span>
          </button>

          <button
            onClick={handleCopyLogs}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition cursor-pointer border border-white/10"
            title="Copiar todos os logs para a área de transferência"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copiado!' : 'Copiar'}</span>
          </button>

          <button
            onClick={handleDownloadLogFile}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition cursor-pointer border border-white/10"
            title="Exportar arquivo .log para o disco"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Exportar .log</span>
          </button>

          <label className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition cursor-pointer border border-white/10">
            <Upload className="w-3.5 h-3.5 text-purple-400" />
            <span>Importar Log</span>
            <input
              ref={fileInputRef}
              type="file"
              accept=".log,.txt"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          <button
            onClick={handleClearLogs}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-semibold transition cursor-pointer border border-rose-500/20"
            title="Limpar logs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Limpar</span>
          </button>
        </div>
      </div>

      {/* Filter and Telemetry Bar */}
      <div className="px-4 py-2.5 bg-slate-900/60 border-b border-white/10 flex items-center justify-between flex-wrap gap-3 text-xs">
        {/* Stream and Level Filter Tabs */}
        <div className="flex items-center space-x-1.5">
          <span className="text-slate-400 font-semibold mr-1 flex items-center space-x-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Canal:</span>
          </span>

          <button
            onClick={() => setStreamFilter('all')}
            className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
              streamFilter === 'all'
                ? 'bg-slate-700 text-white border border-white/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Todos ({stats.total})
          </button>

          <button
            onClick={() => setStreamFilter('stdout')}
            className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer flex items-center space-x-1 ${
              streamFilter === 'stdout'
                ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40'
                : 'text-emerald-400/70 hover:text-emerald-300 hover:bg-emerald-500/10'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>stdout ({stats.stdoutCount})</span>
          </button>

          <button
            onClick={() => setStreamFilter('stderr')}
            className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer flex items-center space-x-1 ${
              streamFilter === 'stderr'
                ? 'bg-amber-600/30 text-amber-300 border border-amber-500/40'
                : 'text-amber-400/70 hover:text-amber-300 hover:bg-amber-500/10'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <span>stderr & Avisos ({stats.stderrCount})</span>
          </button>

          <button
            onClick={() => setStreamFilter('errors_warnings')}
            className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer flex items-center space-x-1 ${
              streamFilter === 'errors_warnings'
                ? 'bg-rose-600/30 text-rose-300 border border-rose-500/40'
                : 'text-rose-400/70 hover:text-rose-300 hover:bg-rose-500/10'
            }`}
          >
            <AlertTriangle className="w-3 h-3 text-rose-400" />
            <span>Erros Críticos ({stats.errorCount})</span>
          </button>
        </div>

        {/* Search Input & Stage Selector */}
        <div className="flex items-center space-x-2 flex-wrap">
          {/* Stage Dropdown */}
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="px-2.5 py-1 rounded-lg bg-slate-800 border border-white/10 text-xs text-slate-200 focus:outline-none focus:border-red-500"
          >
            <option value="all">Todas as Etapas</option>
            <option value="kernel">🐧 Kernel Kbuild</option>
            <option value="init">⚡ Inove Init (PID 1)</option>
            <option value="compositor">✨ DRM/KMS Compositor</option>
            <option value="initramfs">📦 Initramfs ZSTD</option>
            <option value="squashfs">🗜️ Rootfs SquashFS</option>
            <option value="bootloader">🚀 GRUB2 UEFI/BIOS</option>
            <option value="iso">💿 Imagem ISO Híbrida</option>
          </select>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar em stdout/stderr..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1 rounded-lg bg-slate-800/80 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 w-44"
            />
          </div>

          {/* Toggles */}
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`px-2.5 py-1 rounded-lg font-bold text-xs flex items-center space-x-1 transition cursor-pointer border ${
              autoScroll
                ? 'bg-blue-600/30 text-blue-300 border-blue-500/40'
                : 'bg-white/5 text-slate-400 border-white/10'
            }`}
            title="Rolar automaticamente para a última linha gerada"
          >
            <ArrowDown className="w-3 h-3" />
            <span>Auto-Scroll</span>
          </button>

          <button
            onClick={() => setShowLineNumbers(!showLineNumbers)}
            className={`px-2 py-1 rounded-lg text-xs font-mono transition cursor-pointer border ${
              showLineNumbers
                ? 'bg-purple-600/30 text-purple-300 border-purple-500/40'
                : 'bg-white/5 text-slate-400 border-white/10'
            }`}
            title="Alternar números de linha"
          >
            #L
          </button>

          <button
            onClick={() => setWrapLines(!wrapLines)}
            className={`px-2 py-1 rounded-lg text-xs font-mono transition cursor-pointer border ${
              wrapLines
                ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500/40'
                : 'bg-white/5 text-slate-400 border-white/10'
            }`}
            title="Quebra de linha automática"
          >
            Wrap
          </button>
        </div>
      </div>

      {/* Main Terminal Window */}
      <div className="flex-1 bg-black/95 p-3 overflow-y-auto space-y-0.5 select-text font-mono border-b border-white/5">
        {filteredLogs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-2 py-12">
            <AlertCircle className="w-8 h-8 text-slate-600" />
            <p className="text-xs">Nenhum registro encontrado para os filtros selecionados.</p>
            <button
              onClick={() => {
                setStreamFilter('all');
                setStageFilter('all');
                setSearchQuery('');
              }}
              className="px-3 py-1 rounded-lg bg-white/10 text-slate-300 text-xs hover:bg-white/20 transition cursor-pointer"
            >
              Resetar Filtros
            </button>
          </div>
        ) : (
          filteredLogs.map((log, idx) => renderLogLine(log, idx))
        )}
        <div ref={terminalEndRef} />
      </div>

      {/* Bottom Status & Diagnostic Summary Bar */}
      <div className="p-3 bg-slate-900/90 border-t border-white/10 flex items-center justify-between flex-wrap gap-2 text-xs font-mono">
        <div className="flex items-center space-x-4 text-slate-400">
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>stdout: <strong className="text-emerald-300">{stats.stdoutCount}</strong></span>
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <span>stderr: <strong className="text-amber-300">{stats.stderrCount}</strong></span>
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-400"></span>
            <span>erros: <strong className="text-rose-300">{stats.errorCount}</strong></span>
          </div>

          <div className="hidden md:inline text-slate-500">
            Total exibido: {filteredLogs.length} / {logs.length} linhas
          </div>
        </div>

        <div className="flex items-center space-x-3 text-slate-400">
          <div className="flex items-center space-x-1 text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="font-bold text-[11px]">Zero-Error OSDev Policy</span>
          </div>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400 text-[11px]">
            Artifact: <strong className="text-white">inovecloud-os-kernel-pure-x86_64.iso</strong> (840 MB)
          </span>
        </div>
      </div>
    </div>
  );
};

export default BuildLogsViewer;
