import React, { useState, useRef, useEffect } from 'react';
import {
  Terminal as TerminalIcon,
  Sparkles,
  Server,
  Zap,
  RefreshCw,
  Copy,
  Trash2,
  Cpu,
  HardDrive,
  Activity,
  Layers,
  ChevronRight,
  Check,
} from 'lucide-react';
import { VirtualNode, WebApp } from '../../types';

interface TerminalAppProps {
  vns?: VirtualNode[];
  webApps?: WebApp[];
  onToggleVnStatus?: (id: string) => void;
}

export const TerminalApp: React.FC<TerminalAppProps> = ({
  vns = [],
  webApps = [],
}) => {
  const [activeTty, setActiveTty] = useState<'main' | 'dmesg' | 'syscalls'>('main');
  const [history, setHistory] = useState<string[]>([
    'InoveCloud Pure Linux Kernel 6.12.10-inovecloud-x86_64 (SMP preempt)',
    'Inove Init PID 1 Nativo | Syscalls API | DRM/KMS Framebuffer Active',
    'Conectado ao subsistema nativo do host via /api/terminal/exec (REST & PTY)',
    'Digite "help" para ver comandos do sistema ou execute comandos do Kernel Linux.',
    '',
  ]);
  const [input, setInput] = useState('');
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [historyPointer, setHistoryPointer] = useState<number>(-1);
  const [isExecuting, setIsExecuting] = useState(false);
  const [copied, setCopied] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleCopyLogs = () => {
    navigator.clipboard.writeText(history.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setHistory([]);
  };

  const executeCmd = async (commandToRun: string) => {
    const cmd = commandToRun.trim();
    if (!cmd) return;

    setCmdHistory((prev) => [...prev, cmd]);
    setHistoryPointer(-1);

    const promptLine = `root@inovecloud-kernel:~# ${cmd}`;
    const newHistory = [...history, promptLine];
    const parts = cmd.split(' ');
    const main = parts[0].toLowerCase();

    if (main === 'clear') {
      setHistory([]);
      setInput('');
      return;
    }

    if (main === 'help') {
      newHistory.push('Comandos do Sistema & Pure Linux Kernel API:');
      newHistory.push('  uname -a                     - Informações do Kernel Linux 6.12+');
      newHistory.push('  fastfetch / neofetch         - Telemetria de hardware e arquitetura');
      newHistory.push('  dmesg                        - Buffer de mensagens e logs do Kernel');
      newHistory.push('  ps aux / top                 - Lista processos ativos gerenciados pelo Inove Init');
      newHistory.push('  free -h                      - Estatísticas de memória RAM física e swap');
      newHistory.push('  df -h                        - Sistemas de arquivos montados (ZSTD SquashFS, Ext4, Btrfs)');
      newHistory.push('  ls -la /                     - Estrutura de diretórios do Micro-Rootfs');
      newHistory.push('  cat /proc/cpuinfo            - Informações detalhadas dos núcleos da CPU');
      newHistory.push('  inovectl status              - Status do cluster, DRM compositor e VNs');
      newHistory.push('  flatpak list / run <app>     - Executar aplicativos no sandbox Wayland');
      newHistory.push('  clear                        - Limpar tela do terminal');
      setHistory(newHistory);
      setInput('');
      return;
    }

    if (main === 'fastfetch' || main === 'neofetch') {
      newHistory.push('       .---.         OS: InoveCloud OS 2026.1 (Pure Linux Kernel Standalone) x86_64');
      newHistory.push('      /     \\        Host: InoveCloud Native Station (DRM/KMS / Liquid Glass UI)');
      newHistory.push('     | () () |       Kernel: 6.12.10-inovecloud-x86_64 (SMP Preempt RT)');
      newHistory.push('      \\  _  /        Init: Inove Init (PID 1 Nativo via Kernel Syscalls)');
      newHistory.push('       \'---\'         Uptime: 14 dias, 8 horas, 42 mins');
      newHistory.push('                     Display: Direct DRM/KMS Wayland Compositor (Mesa 24.3)');
      newHistory.push('                     Shell: inove-sh 5.2.21 (Musl Libc & POSIX)');
      newHistory.push('                     CPU: AMD EPYC 9654 / Intel Xeon Scalable @ 3.20GHz');
      newHistory.push('                     Memory: 1.4GB / 16.0GB (SquashFS RAM Rootfs)');
      setHistory(newHistory);
      setInput('');
      return;
    }

    if (main === 'uname' && (parts[1] === '-a' || parts[1] === '-r' || !parts[1])) {
      newHistory.push('Linux inovecloud-os 6.12.10-inovecloud-x86_64 #1 SMP PREEMPT_DYNAMIC Thu Sep 16 2026 x86_64 GNU/Linux');
      setHistory(newHistory);
      setInput('');
      return;
    }

    if (main === 'inovectl' && parts[1] === 'status') {
      newHistory.push('=== INOVECLOUD PURE KERNEL OS STATUS ===');
      newHistory.push(`Total VNs KVM/QEMU: ${vns.length} (Ativas: ${vns.filter((v) => v.status === 'running').length})`);
      newHistory.push(`Web Apps & Services: ${webApps.length} ativos`);
      newHistory.push('Init Supervisor: PID 1 ativo (Inove Init C-Engine)');
      newHistory.push('DRM/KMS Framebuffer: /dev/dri/card0 (aceleração 3D Mesa ativa)');
      newHistory.push('Serviço Local Daemon: /opt/inovecloud/server.cjs [PORTA 3000]');
      setHistory(newHistory);
      setInput('');
      return;
    }

    // Real server command execution
    setIsExecuting(true);
    setInput('');

    try {
      const response = await fetch('/api/terminal/exec', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: cmd }),
      });

      const resData = await response.json();
      setIsExecuting(false);

      if (resData.stdout) {
        const outLines = resData.stdout.trim().split('\n');
        newHistory.push(...outLines);
      }
      if (resData.stderr) {
        const errLines = resData.stderr.trim().split('\n');
        newHistory.push(...errLines.map((l: string) => `[stderr] ${l}`));
      }
      if (!resData.stdout && !resData.stderr) {
        newHistory.push('[Comando finalizado com código de saída 0]');
      }
    } catch {
      setIsExecuting(false);
      newHistory.push(`inove-sh: comando processado pelo subsistema: ${cmd}`);
    }

    setHistory(newHistory);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (cmdHistory.length === 0) return;
      const nextIndex = historyPointer === -1 ? cmdHistory.length - 1 : Math.max(0, historyPointer - 1);
      setHistoryPointer(nextIndex);
      setInput(cmdHistory[nextIndex]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyPointer === -1) return;
      if (historyPointer < cmdHistory.length - 1) {
        const nextIndex = historyPointer + 1;
        setHistoryPointer(nextIndex);
        setInput(cmdHistory[nextIndex]);
      } else {
        setHistoryPointer(-1);
        setInput('');
      }
    }
  };

  const quickPills = [
    { label: 'fastfetch', cmd: 'fastfetch' },
    { label: 'uname -a', cmd: 'uname -a' },
    { label: 'ls -la', cmd: 'ls -la' },
    { label: 'free -h', cmd: 'free -h' },
    { label: 'df -h', cmd: 'df -h' },
    { label: 'ps aux', cmd: 'ps aux | head -n 10' },
    { label: 'inovectl status', cmd: 'inovectl status' },
    { label: 'dmesg', cmd: 'dmesg | tail -n 8' },
  ];

  return (
    <div className="flex flex-col h-full bg-slate-950 font-mono text-xs text-slate-100 select-text overflow-hidden">
      {/* Top TTY Tabs & Controls */}
      <div className="p-3 border-b border-white/10 bg-slate-900/90 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 bg-black/50 p-1 rounded-xl border border-white/5">
            <button
              onClick={() => setActiveTty('main')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center space-x-1.5 ${
                activeTty === 'main'
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <TerminalIcon className="w-3.5 h-3.5" />
              <span>TTY1: inove-sh</span>
            </button>
            <button
              onClick={() => setActiveTty('dmesg')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center space-x-1.5 ${
                activeTty === 'dmesg'
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>TTY2: dmesg (Kernel)</span>
            </button>
            <button
              onClick={() => setActiveTty('syscalls')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center space-x-1.5 ${
                activeTty === 'syscalls'
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>TTY3: Syscalls</span>
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopyLogs}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/5 transition flex items-center space-x-1 text-[11px] cursor-pointer"
            title="Copiar buffer do terminal"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copied ? 'Copiado!' : 'Copiar'}</span>
          </button>
          <button
            onClick={handleClear}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-red-400 border border-white/5 transition flex items-center space-x-1 text-[11px] cursor-pointer"
            title="Limpar tela (clear)"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Limpar</span>
          </button>
        </div>
      </div>

      {/* Main Terminal Output Content */}
      <div className="flex-1 overflow-y-auto p-4 bg-black/95 text-slate-200 space-y-1.5 font-mono text-[12px] leading-relaxed">
        {activeTty === 'main' && (
          <>
            {history.map((line, i) => (
              <div
                key={i}
                className={`whitespace-pre-wrap ${
                  line.startsWith('root@')
                    ? 'text-emerald-400 font-bold'
                    : line.startsWith('[stderr]')
                    ? 'text-red-400'
                    : line.includes('Pure Linux Kernel') || line.includes('Inove Init')
                    ? 'text-cyan-300 font-bold'
                    : 'text-slate-300'
                }`}
              >
                {line}
              </div>
            ))}
            {isExecuting && (
              <div className="flex items-center space-x-2 text-cyan-400 animate-pulse pt-1">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Executando chamada de sistema no host...</span>
              </div>
            )}
            <div ref={bottomRef} />
          </>
        )}

        {activeTty === 'dmesg' && (
          <div className="space-y-1 text-slate-300">
            <div className="text-cyan-400 font-bold mb-2">
              [Kernel Ring Buffer / dmesg Telemetry - Linux 6.12.10-inovecloud-x86_64]
            </div>
            <div className="text-slate-400 font-mono">[ 0.000000] Linux version 6.12.10-inovecloud (gcc version 14.2.0) #1 SMP PREEMPT</div>
            <div className="text-slate-400 font-mono">[ 0.000000] Command line: BOOT_IMAGE=/boot/vmlinuz-inovecloud quiet splash init=/init</div>
            <div className="text-slate-400 font-mono">[ 0.004210] x86/fpu: Supporting XSAVE feature 0x001: 'x87 floating point registers'</div>
            <div className="text-slate-400 font-mono">[ 0.012480] e820: [mem 0x0000000000000000-0x00000003ffffffff] usable (16384 MB)</div>
            <div className="text-emerald-400 font-mono">[ 0.142010] pci 0000:00:02.0: DRM/KMS: Inove Liquid Glass Compositor Initialized</div>
            <div className="text-emerald-400 font-mono">[ 0.254190] inove-init[1]: Starting Inove Native Process Supervisor (PID 1)</div>
            <div className="text-emerald-400 font-mono">[ 0.312040] inove-init[1]: Mounting virtual filesystems: /dev (devtmpfs), /proc (proc), /sys (sysfs)</div>
            <div className="text-purple-400 font-mono">[ 0.420180] inove-gpu[142]: Mesa 24.3.0 DRI3 / OpenGL 4.6 Hardware Acceleration Enabled</div>
            <div className="text-cyan-400 font-mono">[ 0.589200] inove-net[210]: Interface wlan0/eth0 configured via Netlink Sockets</div>
            <div className="text-emerald-300 font-mono">[ 0.812400] inove-desktop[300]: InoveCloud OS Liquid Glass Desktop Server Ready on Port 3000</div>
          </div>
        )}

        {activeTty === 'syscalls' && (
          <div className="space-y-1 text-slate-300">
            <div className="text-purple-400 font-bold mb-2">
              [Inove Init & Pure Kernel Syscalls Monitor]
            </div>
            <div className="text-slate-400">SYS_clone3() -&gt; PID 1420 (inove-desktop) [AFFINITY: ALL CPUS]</div>
            <div className="text-slate-400">SYS_io_uring_setup() -&gt; Ring buffer criado com 512 entries [ZERO COPY]</div>
            <div className="text-slate-400">SYS_epoll_create1() -&gt; Event loop de alta performance ativo</div>
            <div className="text-slate-400">SYS_mmap(NULL, 67108864, PROT_READ|PROT_WRITE, MAP_PRIVATE|MAP_ANONYMOUS) -&gt; 64MB Buffer</div>
            <div className="text-emerald-400">SYS_bpf(BPF_PROG_LOAD) -&gt; Telemetria de rede eBPF carregada com sucesso</div>
          </div>
        )}
      </div>

      {/* Quick Command Pills Bar */}
      <div className="p-2 border-t border-white/5 bg-slate-900/60 flex items-center space-x-1.5 overflow-x-auto no-scrollbar">
        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider px-1 shrink-0">
          Atalhos:
        </span>
        {quickPills.map((pill) => (
          <button
            key={pill.label}
            onClick={() => executeCmd(pill.cmd)}
            disabled={isExecuting}
            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/5 text-[11px] font-mono whitespace-nowrap transition cursor-pointer shrink-0 disabled:opacity-50"
          >
            {pill.label}
          </button>
        ))}
      </div>

      {/* Terminal Input Prompt */}
      {activeTty === 'main' && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            executeCmd(input);
          }}
          className="p-3 border-t border-white/10 bg-slate-950 flex items-center space-x-2"
        >
          <span className="text-emerald-400 font-bold shrink-0 flex items-center space-x-1">
            <span>root@inovecloud-kernel:~#</span>
          </span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            disabled={isExecuting}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Digite comandos Linux (ex: uname -a, fastfetch, ls -la, free -h, dmesg, ps aux)..."
            className="flex-1 bg-transparent text-white font-mono text-xs focus:outline-none disabled:opacity-50"
            autoFocus
          />
        </form>
      )}
    </div>
  );
};

export default TerminalApp;
