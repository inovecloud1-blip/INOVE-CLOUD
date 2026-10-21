import React, { useState, useEffect, useRef } from 'react';
import {
  Terminal,
  Cpu,
  HardDrive,
  RotateCw,
  Power,
  Layers,
  Activity,
  Play,
  Monitor,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Zap,
  Sliders,
  HelpCircle,
  FileCode,
  Sparkles,
  Maximize2,
  Minimize2,
  X,
  Volume2,
  VolumeX
} from 'lucide-react';

interface PureKernelOSProps {
  onSwitchToGui: () => void;
  onReboot?: () => void;
  onPowerOff?: () => void;
  isStandalone?: boolean;
}

interface KernelModule {
  name: string;
  size: number;
  instances: number;
  status: 'Live' | 'Loading' | 'Unloading';
  description: string;
}

interface ProcessInfo {
  pid: number;
  user: string;
  cpu: number;
  mem: number;
  vsz: number;
  rss: number;
  tty: string;
  stat: string;
  start: string;
  time: string;
  command: string;
}

interface VirtualFile {
  name: string;
  type: 'file' | 'dir';
  content?: string;
  size: number;
  permissions: string;
  owner: string;
  group: string;
  updatedAt: string;
  children?: { [key: string]: VirtualFile };
}

const INITIAL_KERNEL_MODULES: KernelModule[] = [
  { name: 'rust_inove_core', size: 65536, instances: 1, status: 'Live', description: 'Abstrações de Driver em Rust (Linux Kernel 7.3)' },
  { name: 'ebpf2_jit_engine', size: 94208, instances: 2, status: 'Live', description: 'Compilador JIT de eBPF 2.0 em Ring 0' },
  { name: 'io_uring_v3', size: 73728, instances: 3, status: 'Live', description: 'Motor Assíncrono io_uring 3.0 para NVMe' },
  { name: 'inove_sched_eevdf2', size: 49152, instances: 1, status: 'Live', description: 'Escalonador EEVDFv2 Realtime Preempt (<1ms)' },
  { name: 'drm_kms_direct', size: 184320, instances: 1, status: 'Live', description: 'Direct Rendering Manager Framebuffer (Sem GNOME)' },
  { name: 'bcachefs_fast', size: 110592, instances: 1, status: 'Live', description: 'Sistema de Arquivos CoW Transacional Nativo' },
  { name: 'inove_syscall_fast', size: 28672, instances: 2, status: 'Live', description: 'Acelerador de Syscalls Diretas em Ring 0' },
  { name: 'zstd_zram_v2', size: 81920, instances: 3, status: 'Live', description: 'Compressão de Memória ZRAM Instantânea' },
  { name: 'nvme_gen5_opt', size: 98304, instances: 1, status: 'Live', description: 'Driver NVMe PCIe Gen5 x4 Ultra-Throughput' },
  { name: 'virtio_net', size: 65536, instances: 1, status: 'Live', description: 'Placa de Rede Ethernet VirtIO / Realtek' }
];

const INITIAL_PROCESSES: ProcessInfo[] = [
  { pid: 1, user: 'root', cpu: 0.1, mem: 0.4, vsz: 4096, rss: 1240, tty: '?', stat: 'Ss', start: '12:00', time: '0:01', command: '/sbin/inove-init' },
  { pid: 2, user: 'root', cpu: 0.0, mem: 0.0, vsz: 0, rss: 0, tty: '?', stat: 'S', start: '12:00', time: '0:00', command: '[kthreadd]' },
  { pid: 3, user: 'root', cpu: 0.0, mem: 0.0, vsz: 0, rss: 0, tty: '?', stat: 'I<', start: '12:00', time: '0:00', command: '[rcu_gp]' },
  { pid: 4, user: 'root', cpu: 0.0, mem: 0.0, vsz: 0, rss: 0, tty: '?', stat: 'I<', start: '12:00', time: '0:00', command: '[rcu_par_gp]' },
  { pid: 5, user: 'root', cpu: 0.0, mem: 0.0, vsz: 0, rss: 0, tty: '?', stat: 'I<', start: '12:00', time: '0:00', command: '[kworker/rust-0:0]' },
  { pid: 6, user: 'root', cpu: 0.0, mem: 0.0, vsz: 0, rss: 0, tty: '?', stat: 'I<', start: '12:00', time: '0:00', command: '[kworker/0:0H-events_highpri]' },
  { pid: 9, user: 'root', cpu: 0.0, mem: 0.0, vsz: 0, rss: 0, tty: '?', stat: 'S', start: '12:00', time: '0:00', command: '[ksoftirqd/0]' },
  { pid: 15, user: 'root', cpu: 0.0, mem: 0.0, vsz: 0, rss: 0, tty: '?', stat: 'S', start: '12:00', time: '0:00', command: '[migration/0]' },
  { pid: 42, user: 'root', cpu: 0.0, mem: 0.0, vsz: 0, rss: 0, tty: '?', stat: 'S', start: '12:00', time: '0:00', command: '[kswapd0]' },
  { pid: 120, user: 'root', cpu: 0.2, mem: 0.8, vsz: 14200, rss: 3120, tty: '?', stat: 'Ss', start: '12:00', time: '0:01', command: '/sbin/inove-udevd --daemon' },
  { pid: 180, user: 'root', cpu: 0.1, mem: 0.6, vsz: 12800, rss: 2450, tty: '?', stat: 'Ss', start: '12:00', time: '0:00', command: '/usr/sbin/inove-networkd' },
  { pid: 210, user: 'root', cpu: 0.3, mem: 1.1, vsz: 22400, rss: 4890, tty: '?', stat: 'Ss', start: '12:00', time: '0:02', command: '/usr/bin/inove-drm-server' },
  { pid: 320, user: 'root', cpu: 0.4, mem: 0.9, vsz: 8120, rss: 2010, tty: 'tty1', stat: 'S+', start: '12:00', time: '0:01', command: '/bin/inove-sh (tty1)' }
];

const INITIAL_DMESG = [
  '[    0.000000] Linux version 7.3.0-inovecloud-rt-pure (root@inovecloud-core) (gcc-15.1.0 -march=native -O3 + rustc 1.85.0) #1 SMP PREEMPT_RT Sun Oct 18 2026',
  '[    0.000000] Command line: BOOT_IMAGE=/boot/vmlinuz-7.3 root=/dev/nvme0n1p2 ro quiet splash inove.pure=1 init=/sbin/inove-init elevator=eevdf2',
  '[    0.000000] x86/fpu: Supporting XSAVE feature 0x001: \'x87 floating point registers\'',
  '[    0.000000] x86/fpu: Supporting XSAVE feature 0x002: \'SSE registers\'',
  '[    0.000000] x86/fpu: Supporting XSAVE feature 0x004: \'AVX registers\'',
  '[    0.000000] x86/fpu: Supporting XSAVE feature 0x020: \'AVX-512 opmask\'',
  '[    0.000000] e820: BIOS-provided physical RAM map: 32768MB usable (DDR5-6400)',
  '[    0.000210] rust: Linux Kernel 7.3 Rust Core Subsystem initialized (allocator, sync, net)',
  '[    0.000450] ebpf: eBPF 2.0 JIT compiler active with Ring 0 hardware isolation',
  '[    0.000680] io_uring: version 3.0 enabled, zerocopy network & block engine ready',
  '[    0.004210] ACPI: Core revision 20260415',
  '[    0.012480] smpboot: Allowing 32 CPUs, 32 hotplug CPUs',
  '[    0.018900] setup_percpu: NR_CPUS:32 nr_cpumask_bits:32 nr_cpu_ids:32 nr_node_ids:1',
  '[    0.024510] SLUB: HWalign=64, Order=0-3, MinObjects=0, CPUs=32, Nodes=1',
  '[    0.038100] rcu: Preemptible hierarchical Realtime RCU implementation.',
  '[    0.045000] devtmpfs: initialized',
  '[    0.062140] clocksource: tsc: mask: 0xffffffffffffffff max_cycles: 0x3646ca52, max_idle_ns: 440795208643 ns',
  '[    0.089400] PCI: Using configuration type 1 for base access',
  '[    0.110200] nvme nvme0: pci function 0000:01:00.0: PCIe Gen5 x4 link ready (14,000 MB/s)',
  '[    0.145600] nvme0n1: p1 (EFI ESP) p2 (InoveCloud OS RootFS 1TB bcachefs/ext4)',
  '[    0.210400] [drm] Initializing InoveCloud DRM Direct KMS Graphics Driver (Zero GNOME / Zero X11)',
  '[    0.225100] [drm] Framebuffer Console fb0: 2560x1440@144Hz 32bpp direct scanout ready',
  '[    0.310200] inove_sched: EEVDFv2 latency-sensitive engine active (latency target: 0.5ms)',
  '[    0.380900] InoveCloud RootFS mounted on / (rw,relatime,nodiratime,data=ordered)',
  '[    0.410100] Run /sbin/inove-init as init process (PID 1)',
  '[    0.450200] inove-init[1]: Starting InoveCloud Pure Kernel 7.3 Subsystems...',
  '[    0.490800] inove-init[1]: udevd started, loading Rust & C module aliases',
  '[    0.530400] inove-init[1]: Loopback interface lo up (127.0.0.1)',
  '[    0.590200] inove-init[1]: VirtIO/Ethernet interface eth0 up, DHCP IP: 192.168.1.145/24',
  '[    0.640100] inove-init[1]: PipeWire audio buffer allocated with 64 samples / 96kHz (Low-Latency)',
  '[    0.690500] inove-init[1]: InoveCloud OS Linux 7.3 Pure Kernel Ready! Zero GNOME dependency.',
  '[    0.720000] inove-init[1]: Spawning TTY1 (/bin/inove-sh on /dev/tty1)'
];

const INITIAL_FS: { [path: string]: VirtualFile } = {
  '/': {
    name: '/',
    type: 'dir',
    size: 4096,
    permissions: 'drwxr-xr-x',
    owner: 'root',
    group: 'root',
    updatedAt: '2026-10-10 12:00',
    children: {
      'bin': { name: 'bin', type: 'dir', size: 4096, permissions: 'drwxr-xr-x', owner: 'root', group: 'root', updatedAt: '2026-10-10 12:00' },
      'sbin': { name: 'sbin', type: 'dir', size: 4096, permissions: 'drwxr-xr-x', owner: 'root', group: 'root', updatedAt: '2026-10-10 12:00' },
      'etc': { name: 'etc', type: 'dir', size: 4096, permissions: 'drwxr-xr-x', owner: 'root', group: 'root', updatedAt: '2026-10-10 12:00' },
      'proc': { name: 'proc', type: 'dir', size: 0, permissions: 'dr-xr-xr-x', owner: 'root', group: 'root', updatedAt: '2026-10-10 12:00' },
      'sys': { name: 'sys', type: 'dir', size: 0, permissions: 'dr-xr-xr-x', owner: 'root', group: 'root', updatedAt: '2026-10-10 12:00' },
      'dev': { name: 'dev', type: 'dir', size: 4096, permissions: 'drwxr-xr-x', owner: 'root', group: 'root', updatedAt: '2026-10-10 12:00' },
      'tmp': { name: 'tmp', type: 'dir', size: 4096, permissions: 'drwxrwxrwt', owner: 'root', group: 'root', updatedAt: '2026-10-10 12:00' },
      'var': { name: 'var', type: 'dir', size: 4096, permissions: 'drwxr-xr-x', owner: 'root', group: 'root', updatedAt: '2026-10-10 12:00' },
      'usr': { name: 'usr', type: 'dir', size: 4096, permissions: 'drwxr-xr-x', owner: 'root', group: 'root', updatedAt: '2026-10-10 12:00' },
      'home': { name: 'home', type: 'dir', size: 4096, permissions: 'drwxr-xr-x', owner: 'root', group: 'root', updatedAt: '2026-10-10 12:00' },
      'root': { name: 'root', type: 'dir', size: 4096, permissions: 'drwx------', owner: 'root', group: 'root', updatedAt: '2026-10-10 12:00' }
    }
  },
  '/home/inove': {
    name: 'inove',
    type: 'dir',
    size: 4096,
    permissions: 'drwxr-xr-x',
    owner: 'inove',
    group: 'inove',
    updatedAt: '2026-10-10 12:00',
    children: {
      'welcome.txt': {
        name: 'welcome.txt',
        type: 'file',
        size: 980,
        permissions: '-rw-r--r--',
        owner: 'inove',
        group: 'inove',
        updatedAt: '2026-10-18 12:00',
        content: `===================================================================
⚡ INOVECLOUD OS — SISTEMA OPERACIONAL COM KERNEL LINUX 7.3 RT PURO
===================================================================

Parabéns! Você está executando o InoveCloud OS diretamente sobre
o Kernel Linux 7.3 Real-Time compilado do zero, sem GNOME e sem camadas extras!

CARACTERÍSTICAS DESTE SISTEMA REAL (LINUX 7.3):
1. KERNEL PURO 7.3: Versão 7.3.0-inovecloud-rt-pure (PREEMPT_RT + Rust Core)
2. SUBSISTEMA RUST: Drivers e abstrações nativas em Rust integradas ao Kernel
3. eBPF 2.0 & io_uring 3.0: Telemetria e I/O de armazenamento com latência sub-ms
4. ZERO GNOME: Execução direta em TTY Bare-Metal ou DRM/KMS Framebuffer direto
5. INIT AUTÔNOMO: PID 1 gerenciado pelo /sbin/inove-init direto no hardware
6. SYSCALLS REAIS: Chamadas de sistema x86_64 diretas sem intermediários
7. COMPILADORES: Digite 'compile-c hello.c' ou 'compile-rust kernel_driver.rs'
8. GESTOR DE PACOTES: Digite 'icpkg list' para gerenciar utilitários nativos
9. MODO GRÁFICO: Digite 'inove-desktop' ou aperte Ctrl+Alt+F7 para iniciar
   a interface gráfica nativa InoveCloud Liquid Glass (sem GNOME).

Comandos úteis: help, dmesg, top, ps, free, df, ls, cat, nano, compile-c, compile-rust, rust-info, reboot.`
      },
      'hello.c': {
        name: 'hello.c',
        type: 'file',
        size: 530,
        permissions: '-rw-r--r--',
        owner: 'inove',
        group: 'inove',
        updatedAt: '2026-10-18 12:00',
        content: `/* InoveCloud OS - Programa C com Syscalls Diretas x86_64 no Linux Kernel 7.3 */
#include <unistd.h>
#include <sys/syscall.h>

void _start() {
    const char msg[] = "\\033[1;32m[OK] Executado via syscall direta do Kernel Linux 7.3 puro!\\033[0m\\n"
                       "\\033[1;36m>> InoveCloud OS Kernel 7.3 (Sem GNOME / Ring 0) operacional!\\033[0m\\n";
    
    /* Syscall write(1, msg, sizeof(msg) - 1) */
    syscall(SYS_write, 1, msg, sizeof(msg) - 1);
    
    /* Syscall exit(0) */
    syscall(SYS_exit, 0);
}
`
      },
      'kernel_driver.rs': {
        name: 'kernel_driver.rs',
        type: 'file',
        size: 780,
        permissions: '-rw-r--r--',
        owner: 'inove',
        group: 'inove',
        updatedAt: '2026-10-18 12:00',
        content: `// InoveCloud OS - Módulo de Kernel em Rust (Linux 7.3 Rust Infrastructure)
#![no_std]
#![feature(allocator_api)]

use kernel::prelude::*;

module! {
    type: InoveCloudDriver,
    name: "inovecloud_pure73",
    author: "InoveCloud Core Team",
    description: "Driver nativo em Rust para Linux Kernel 7.3 RT",
    license: "GPL-2.0",
}

struct InoveCloudDriver;

impl kernel::Module for InoveCloudDriver {
    fn init(_name: &'static CStr, _module: &'static ThisModule) -> Result<Self> {
        pr_info!("Rust Kernel Driver: Linux 7.3 InoveCloud inicializado com zero inseguranças de memória!\\n");
        pr_info!("Rust Subsystem: DRM/KMS Framebuffer direto ativo sem GNOME.\\n");
        Ok(InoveCloudDriver)
    }
}
`
      },
      'kernel-info.sh': {
        name: 'kernel-info.sh',
        type: 'file',
        size: 510,
        permissions: '-rwxr-xr-x',
        owner: 'inove',
        group: 'inove',
        updatedAt: '2026-10-18 12:00',
        content: `#!/bin/inove-sh
echo "=== INOVECLOUD KERNEL 7.3 TELEMETRY ==="
uname -a
echo "Cores de CPU ativas: $(cat /proc/cpuinfo | grep 'processor' | wc -l)"
echo "Memória Livre: $(cat /proc/meminfo | grep 'MemFree')"
echo "Escalonador Ativo: EEVDFv2 Realtime Preempt (<1ms latency)"
echo "Rust Subsystem: Integrado (Rustc 1.85 / No-std Kernel Module)"
echo "Interface Gráfica: DRM/KMS Direct Compositor (Zero GNOME)"
`
      }
    }
  },
  '/etc/os-release': {
    name: 'os-release',
    type: 'file',
    size: 260,
    permissions: '-rw-r--r--',
    owner: 'root',
    group: 'root',
    updatedAt: '2026-10-18 12:00',
    content: `NAME="InoveCloud OS"
VERSION="3.0 Pure Kernel 7.3"
ID="inovecloud"
PRETTY_NAME="InoveCloud OS 3.0 (Kernel Linux 7.3 RT Puro Sem GNOME)"
ANSI_COLOR="0;36"
HOME_URL="https://inovecloud.io"
SUPPORT_URL="https://inovecloud.io/support"
BUG_REPORT_URL="https://inovecloud.io/bugs"`
  },
  '/etc/hostname': {
    name: 'hostname',
    type: 'file',
    size: 18,
    permissions: '-rw-r--r--',
    owner: 'root',
    group: 'root',
    updatedAt: '2026-10-18 12:00',
    content: 'inovecloud-kernel\n'
  },
  '/proc/version': {
    name: 'version',
    type: 'file',
    size: 160,
    permissions: '-r--r--r--',
    owner: 'root',
    group: 'root',
    updatedAt: '2026-10-18 12:00',
    content: 'Linux version 7.3.0-inovecloud-rt-pure (root@inovecloud-core) (gcc-15.1.0 -march=native -O3 + rustc 1.85.0) #1 SMP PREEMPT_RT Sun Oct 18 2026\n'
  },
  '/proc/cpuinfo': {
    name: 'cpuinfo',
    type: 'file',
    size: 680,
    permissions: '-r--r--r--',
    owner: 'root',
    group: 'root',
    updatedAt: '2026-10-10 12:00',
    content: `processor	: 0
vendor_id	: GenuineIntel / AuthenticAMD
model name	: InoveCloud Bare-Metal Optimized Virtual/Physical Core
cpu MHz		: 3600.000
cache size	: 32768 KB
siblings	: 16
cpu cores	: 8
flags		: fpu vme de pse tsc msr pae mce cx8 apic sep mtrr pge mca cmov pat pse36 clflush mmx fxsr sse sse2 ss ht syscall nx lm constant_tsc rep_good nopl xtopology cpuid tsc_known_freq pni pclmulqdq vmx ssse3 fma cx16 pcid sse4_1 sse4_2 x2apic movbe popcnt aes xsave avx f16c rdrand hypervisor lahf_lm abm 3dnowprefetch invpcid_single ssbd ibrs ibpb stibp fsgsbase tsc_adjust bmi1 avx2 smep bmi2 erms invpcid rdseed adx smap clflushopt xsaveopt xsavec xgetbv1 xsaves arat md_clear flush_l1d arch_capabilities
bogomips	: 7199.98
clflush size	: 64
cache_alignment	: 64
address sizes	: 48 bits physical, 48 bits virtual
power management:
`
  },
  '/proc/meminfo': {
    name: 'meminfo',
    type: 'file',
    size: 420,
    permissions: '-r--r--r--',
    owner: 'root',
    group: 'root',
    updatedAt: '2026-10-10 12:00',
    content: `MemTotal:       16384000 kB
MemFree:        13920400 kB
MemAvailable:   15120000 kB
Buffers:          210450 kB
Cached:          1820300 kB
SwapCached:            0 kB
Active:          1540200 kB
Inactive:         890300 kB
SwapTotal:       8388600 kB
SwapFree:        8388600 kB
Dirty:                48 kB
Writeback:             0 kB
AnonPages:       1420100 kB
Mapped:           380400 kB
Shmem:             42100 kB
`
  }
};

export const PureKernelOS: React.FC<PureKernelOSProps> = ({
  onSwitchToGui,
  onReboot,
  onPowerOff,
  isStandalone = false
}) => {
  // Active TTY session
  const [activeTty, setActiveTty] = useState<1 | 2 | 3>(1);

  // Shell State
  const [currentPath, setCurrentPath] = useState<string>('/home/inove');
  const [currentUser, setCurrentUser] = useState<'root' | 'inove'>('root');
  const [commandInput, setCommandInput] = useState<string>('');
  const [terminalHistory, setTerminalHistory] = useState<Array<{ id: string; command: string; output: string | React.ReactNode; path: string; user: string }>>([
    {
      id: 'boot-banner',
      command: '',
      output: (
        <div className="space-y-1 mb-2 font-mono text-xs">
          <div className="text-cyan-400 font-bold">
            ╔════════════════════════════════════════════════════════════════════════════════════╗
          </div>
          <div className="text-cyan-400 font-bold">
            ║  🚀 INOVECLOUD OS — KERNEL PURO LINUX 7.3 RT (AUTÔNOMO / SEM GNOME)                ║
          </div>
          <div className="text-cyan-400 font-bold">
            ║  Ring 0 Syscalls • Rust Drivers • eBPF 2.0 • DRM Direct KMS • PID 1 inove-init     ║
          </div>
          <div className="text-cyan-400 font-bold">
            ╚════════════════════════════════════════════════════════════════════════════════════╝
          </div>
          <div className="text-emerald-400 pt-1">
            ✓ Linux Kernel 7.3.0-inovecloud-rt-pure inicializado com sucesso em Ring 0.
          </div>
          <div className="text-slate-300">
            Digite <span className="text-amber-300 font-bold">help</span> para lista de comandos,{' '}
            <span className="text-cyan-300 font-bold">dmesg</span> para logs do kernel,{' '}
            <span className="text-emerald-300 font-bold">compile-rust</span> para compilar driver em Rust, ou{' '}
            <span className="text-purple-300 font-bold">inove-desktop</span> para carregar a interface nativa (sem GNOME).
          </div>
        </div>
      ),
      path: '/home/inove',
      user: 'root'
    }
  ]);

  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // Nano In-Terminal Editor State
  const [isNanoActive, setIsNanoActive] = useState<boolean>(false);
  const [nanoFilename, setNanoFilename] = useState<string>('');
  const [nanoContent, setNanoContent] = useState<string>('');

  // Top Real-Time Monitor State
  const [isTopActive, setIsTopActive] = useState<boolean>(false);
  const [topCpuUsage, setTopCpuUsage] = useState<number>(3.8);
  const [topMemUsage, setTopMemUsage] = useState<number>(24.2);

  // System Virtual Filesystem State
  const [vfs, setVfs] = useState<{ [path: string]: VirtualFile }>(INITIAL_FS);
  const [kernelModules, setKernelModules] = useState<KernelModule[]>(INITIAL_KERNEL_MODULES);
  const [processes, setProcesses] = useState<ProcessInfo[]>(INITIAL_PROCESSES);
  const [dmesgLogs, setDmesgLogs] = useState<string[]>(INITIAL_DMESG);

  // Visual Customization
  const [theme, setTheme] = useState<'matrix' | 'amber' | 'cyber' | 'white'>('cyber');
  const [hasScanlines, setHasScanlines] = useState<boolean>(true);
  const [fontSize, setFontSize] = useState<'text-xs' | 'text-sm' | 'text-base'>('text-xs');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Kernel uptime in seconds
  const [uptimeSeconds, setUptimeSeconds] = useState<number>(142);

  const terminalEndRef = useRef<HTMLDivElement>(null);
  const commandInputRef = useRef<HTMLInputElement>(null);

  // Uptime ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setUptimeSeconds((s) => s + 1);
      // Random subtle jitter for top monitor
      setTopCpuUsage((prev) => Math.max(1.2, Math.min(28.5, +(prev + (Math.random() * 2 - 1)).toFixed(1))));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Scroll to bottom on new terminal output
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalHistory, isTopActive, isNanoActive]);

  // Focus input on click
  const focusInput = () => {
    if (!isNanoActive && !isTopActive) {
      commandInputRef.current?.focus();
    }
  };

  // Keyboard shortcut listener: Ctrl+Alt+F7 to switch to GUI, Ctrl+C to cancel nano/top
  useEffect(() => {
    const handleGlobalKeys = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.altKey && e.key === 'F7') {
        e.preventDefault();
        onSwitchToGui();
      } else if (e.ctrlKey && e.altKey && e.key === 'F1') {
        e.preventDefault();
        setActiveTty(1);
      } else if (e.ctrlKey && e.altKey && e.key === 'F2') {
        e.preventDefault();
        setActiveTty(2);
      } else if (e.ctrlKey && e.altKey && e.key === 'F3') {
        e.preventDefault();
        setActiveTty(3);
      } else if (e.ctrlKey && e.key.toLowerCase() === 'c') {
        if (isTopActive) {
          setIsTopActive(false);
          appendTerminalOutput('^C (Monitor TOP finalizado)');
        }
      }
    };
    window.addEventListener('keydown', handleGlobalKeys);
    return () => window.removeEventListener('keydown', handleGlobalKeys);
  }, [isTopActive, onSwitchToGui]);

  // Audio beep
  const playTerminalBeep = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(640, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.08);
    } catch (e) {
      // ignore
    }
  };

  // Helper to append output
  const appendTerminalOutput = (output: string | React.ReactNode, cmd = '') => {
    setTerminalHistory((prev) => [
      ...prev,
      {
        id: `out-${Date.now()}-${Math.random()}`,
        command: cmd,
        output,
        path: currentPath,
        user: currentUser
      }
    ]);
  };

  // Resolve virtual path
  const resolvePath = (path: string): string => {
    if (!path || path === '.') return currentPath;
    if (path === '..') {
      if (currentPath === '/') return '/';
      const parts = currentPath.split('/').filter(Boolean);
      parts.pop();
      return '/' + parts.join('/');
    }
    if (path.startsWith('/')) return path;
    return currentPath === '/' ? `/${path}` : `${currentPath}/${path}`;
  };

  // Handle Shell Commands Execution
  const executeCommand = (rawCmd: string) => {
    const trimmed = rawCmd.trim();
    if (!trimmed) {
      appendTerminalOutput('', '');
      return;
    }

    playTerminalBeep();

    // Store in history
    setCommandHistory((prev) => [...prev, trimmed]);
    setHistoryIndex(-1);

    const parts = trimmed.split(' ');
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    // 1. HELP
    if (cmd === 'help' || cmd === '?') {
      appendTerminalOutput(
        <div className="space-y-2 font-mono text-xs text-slate-200">
          <div className="text-cyan-300 font-bold">MANUAL DE COMANDOS DO KERNEL PURO INOVECLOUD OS (LINUX 7.3 RT):</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
            <div className="p-2 rounded bg-slate-900 border border-cyan-500/20">
              <span className="text-emerald-400 font-bold block">Controle do Sistema & Hardware:</span>
              <div><span className="text-amber-300">uname -a</span> : Detalhes do Kernel Linux 7.3 RT Puro</div>
              <div><span className="text-amber-300">dmesg</span> : Buffer de mensagens do Kernel Ring 7.3</div>
              <div><span className="text-amber-300">rust-info</span> : Status do subsistema Rust no Kernel 7.3</div>
              <div><span className="text-amber-300">uptime</span> : Tempo de atividade e carga média da CPU</div>
              <div><span className="text-amber-300">reboot</span> : Reiniciar o sistema operacional</div>
              <div><span className="text-amber-300">poweroff</span> : Desligar o computador (ACPI halt)</div>
              <div><span className="text-amber-300">inove-desktop</span> : Iniciar interface nativa DRM/KMS (sem GNOME)</div>
            </div>
            <div className="p-2 rounded bg-slate-900 border border-cyan-500/20">
              <span className="text-emerald-400 font-bold block">Processos & Memória:</span>
              <div><span className="text-amber-300">top</span> : Monitor em tempo real de CPU e processos</div>
              <div><span className="text-amber-300">ps aux</span> : Lista processos do userspace e threads do kernel</div>
              <div><span className="text-amber-300">free -m</span> : Estatísticas de memória RAM DDR5 e Swap</div>
              <div><span className="text-amber-300">df -h</span> : Espaço em disco dos sistemas Bcachefs / NVMe</div>
              <div><span className="text-amber-300">kill &lt;pid&gt;</span> : Finaliza um processo em execução</div>
            </div>
            <div className="p-2 rounded bg-slate-900 border border-cyan-500/20">
              <span className="text-emerald-400 font-bold block">Arquivos & Navegação:</span>
              <div><span className="text-amber-300">ls [-la]</span> : Lista arquivos e permissões</div>
              <div><span className="text-amber-300">cd &lt;dir&gt;</span> : Muda de diretório (/proc, /sys, /home/inove)</div>
              <div><span className="text-amber-300">cat &lt;file&gt;</span> : Lê o conteúdo de um arquivo</div>
              <div><span className="text-amber-300">nano &lt;file&gt;</span> : Editor de texto interativo no terminal</div>
              <div><span className="text-amber-300">echo &quot;txt&quot; &gt; arq</span> : Grava texto em um arquivo</div>
              <div><span className="text-amber-300">mkdir / rm</span> : Cria ou remove pastas e arquivos</div>
            </div>
            <div className="p-2 rounded bg-slate-900 border border-cyan-500/20">
              <span className="text-emerald-400 font-bold block">Kernel 7.3, Pacotes & Conectividade:</span>
              <div><span className="text-amber-300">wifi &lt;scan|connect|status&gt;</span> : Gerencia conexões Wi-Fi 6E/7</div>
              <div><span className="text-amber-300">bluetooth &lt;scan|connect&gt;</span> : Gerencia periféricos Bluetooth</div>
              <div><span className="text-amber-300">dpkg &lt;-i|-l|-s&gt; &lt;pkg.deb&gt;</span> : Instala e gerencia pacotes .deb</div>
              <div><span className="text-amber-300">appimage-run &lt;app.AppImage&gt;</span> : Executa binários AppImage via FUSE 3</div>
              <div><span className="text-amber-300">pi-store &lt;list|install&gt;</span> : Apps do ecossistema Raspberry Pi</div>
              <div><span className="text-amber-300">flatpak &lt;install|list&gt;</span> : Instalação de apps do Flathub</div>
              <div><span className="text-amber-300">lsmod / insmod</span> : Módulos do Kernel Linux 7.3 RT</div>
              <div><span className="text-amber-300">gnome-check</span> : Auditoria de integridade (0% GNOME)</div>
              <div><span className="text-amber-300">vbox-test</span> : Diagnóstico VirtualBox / QEMU</div>
              <div><span className="text-amber-300">compile-c / compile-rust</span> : Compiladores C e Rust em Ring 0</div>
            </div>
          </div>
          <div className="text-cyan-400 text-[10px]">
            * Atalhos de TTY: <strong>Ctrl+Alt+F1</strong> (Shell), <strong>Ctrl+Alt+F2</strong> (dmesg), <strong>Ctrl+Alt+F3</strong> (Top), <strong>Ctrl+Alt+F7</strong> (Interface Nativa).
          </div>
        </div>,
        trimmed
      );
      return;
    }

    // 2. CLEAR
    if (cmd === 'clear') {
      setTerminalHistory([]);
      return;
    }

    // 3. UNAME
    if (cmd === 'uname') {
      if (args.includes('-a') || args.length === 0) {
        appendTerminalOutput(
          'Linux inovecloud-core 7.3.0-inovecloud-rt-pure #1 SMP PREEMPT_RT Sun Oct 18 2026 x86_64 GNU/Linux (Bare-Metal / No GNOME)',
          trimmed
        );
      } else if (args.includes('-r')) {
        appendTerminalOutput('7.3.0-inovecloud-rt-pure', trimmed);
      } else if (args.includes('-m')) {
        appendTerminalOutput('x86_64', trimmed);
      } else {
        appendTerminalOutput('Linux', trimmed);
      }
      return;
    }

    // 4. DMESG
    if (cmd === 'dmesg') {
      appendTerminalOutput(
        <div className="font-mono text-xs space-y-0.5 text-slate-300 max-h-96 overflow-y-auto pr-2">
          {dmesgLogs.map((log, idx) => (
            <div key={idx} className="leading-tight">
              <span className="text-cyan-400">{log.substring(0, 15)}</span>
              <span className="text-slate-200">{log.substring(15)}</span>
            </div>
          ))}
        </div>,
        trimmed
      );
      return;
    }

    // 5. PS
    if (cmd === 'ps') {
      appendTerminalOutput(
        <div className="font-mono text-xs space-y-0.5">
          <div className="text-cyan-400 font-bold border-b border-cyan-800/40 pb-0.5">
            {'PID'.padEnd(6)} {'USER'.padEnd(8)} {'%CPU'.padEnd(6)} {'%MEM'.padEnd(6)} {'VSZ'.padEnd(8)} {'RSS'.padEnd(8)} {'TTY'.padEnd(8)} {'STAT'.padEnd(6)} {'COMMAND'}
          </div>
          {processes.map((p) => (
            <div key={p.pid} className="text-slate-300">
              {String(p.pid).padEnd(6)} {p.user.padEnd(8)} {String(p.cpu).padEnd(6)} {String(p.mem).padEnd(6)} {String(p.vsz).padEnd(8)} {String(p.rss).padEnd(8)} {p.tty.padEnd(8)} {p.stat.padEnd(6)} <span className={p.command.startsWith('[') ? 'text-blue-400' : 'text-emerald-300'}>{p.command}</span>
            </div>
          ))}
        </div>,
        trimmed
      );
      return;
    }

    // 6. TOP
    if (cmd === 'top') {
      setIsTopActive(true);
      return;
    }

    // 7. FREE
    if (cmd === 'free') {
      appendTerminalOutput(
        <div className="font-mono text-xs space-y-1">
          <div className="text-cyan-400 font-bold">
            {'             total        used        free      shared  buff/cache   available'}
          </div>
          <div className="text-slate-200">
            {'Mem:      16384000     2463600    12100100       42100     1820300    13920400'}
          </div>
          <div className="text-slate-200">
            {'Swap:      8388600           0     8388600'}
          </div>
          <div className="text-emerald-400 text-[11px] pt-1">
            ✓ ZRAM Compactado com ZSTD ativado. Memória física preservada para processos do Kernel.
          </div>
        </div>,
        trimmed
      );
      return;
    }

    // 8. DF
    if (cmd === 'df') {
      appendTerminalOutput(
        <div className="font-mono text-xs space-y-1">
          <div className="text-cyan-400 font-bold">
            {'Filesystem     Type      Size  Used Avail Use% Mounted on'}
          </div>
          <div className="text-slate-200">
            {'/dev/nvme0n1p2 ext4      490G   24G  442G   6% /'}
          </div>
          <div className="text-slate-200">
            {'devtmpfs       devtmpfs  7.8G     0  7.8G   0% /dev'}
          </div>
          <div className="text-slate-200">
            {'tmpfs          tmpfs     7.8G   42M  7.8G   1% /run'}
          </div>
          <div className="text-slate-200">
            {'/dev/nvme0n1p1 vfat      512M   12M  500M   3% /boot/efi'}
          </div>
          <div className="text-slate-200">
            {'overlay        overlay   490G   24G  442G   6% /mnt/persistence'}
          </div>
        </div>,
        trimmed
      );
      return;
    }

    // 9. LS
    if (cmd === 'ls') {
      const showAll = args.includes('-a') || args.includes('-la') || args.includes('-al');
      const showLong = args.includes('-l') || args.includes('-la') || args.includes('-al');
      const targetPath = args.find((a) => !a.startsWith('-')) || currentPath;
      const resolved = resolvePath(targetPath);

      if (resolved === '/proc') {
        const procItems = ['cpuinfo', 'meminfo', 'version', 'uptime', 'cmdline', 'modules', '1', '2', '120', '320'];
        appendTerminalOutput(
          <div className="font-mono text-xs text-blue-300 flex flex-wrap gap-x-4">
            {procItems.map((item, i) => (
              <span key={i} className={item.match(/^\d+$/) ? 'text-amber-300 font-bold' : 'text-cyan-300'}>
                {item}
              </span>
            ))}
          </div>,
          trimmed
        );
        return;
      }

      if (resolved === '/home/inove') {
        const homeNode = vfs['/home/inove'];
        if (homeNode && homeNode.children) {
          if (showLong) {
            appendTerminalOutput(
              <div className="font-mono text-xs space-y-0.5">
                <div className="text-slate-400">total {Object.keys(homeNode.children).length * 4}</div>
                {Object.values(homeNode.children).map((f) => (
                  <div key={f.name} className="flex space-x-3 text-slate-200">
                    <span className="text-slate-400 w-24">{f.permissions}</span>
                    <span className="text-slate-400 w-12">{f.owner}</span>
                    <span className="text-slate-400 w-12">{f.group}</span>
                    <span className="text-amber-300 w-14 text-right">{f.size}</span>
                    <span className="text-slate-400 w-28">{f.updatedAt}</span>
                    <span className={f.type === 'dir' ? 'text-blue-400 font-bold' : f.name.endsWith('.sh') ? 'text-emerald-400 font-bold' : 'text-white'}>
                      {f.name}
                    </span>
                  </div>
                ))}
              </div>,
              trimmed
            );
          } else {
            appendTerminalOutput(
              <div className="font-mono text-xs flex flex-wrap gap-x-4">
                {Object.values(homeNode.children).map((f) => (
                  <span
                    key={f.name}
                    className={f.type === 'dir' ? 'text-blue-400 font-bold' : f.name.endsWith('.sh') ? 'text-emerald-400 font-bold' : 'text-slate-200'}
                  >
                    {f.name}
                  </span>
                ))}
              </div>,
              trimmed
            );
          }
          return;
        }
      }

      // Root or other dir
      const rootNode = vfs['/'];
      if (resolved === '/' && rootNode.children) {
        appendTerminalOutput(
          <div className="font-mono text-xs flex flex-wrap gap-x-4">
            {Object.keys(rootNode.children).map((d) => (
              <span key={d} className="text-blue-400 font-bold">
                {d}/
              </span>
            ))}
          </div>,
          trimmed
        );
        return;
      }

      appendTerminalOutput(`ls: não foi possível acessar '${targetPath}': Diretório vazio ou simulado`, trimmed);
      return;
    }

    // 10. CD
    if (cmd === 'cd') {
      const target = args[0] || '/home/inove';
      const resolved = resolvePath(target);
      if (['/', '/home/inove', '/proc', '/sys', '/dev', '/etc', '/root', '/tmp', '/var'].includes(resolved)) {
        setCurrentPath(resolved);
        appendTerminalOutput('', trimmed);
      } else {
        appendTerminalOutput(`cd: ${target}: Diretório não encontrado`, trimmed);
      }
      return;
    }

    // 11. PWD
    if (cmd === 'pwd') {
      appendTerminalOutput(currentPath, trimmed);
      return;
    }

    // 12. CAT
    if (cmd === 'cat') {
      if (!args[0]) {
        appendTerminalOutput('cat: arquivo não especificado', trimmed);
        return;
      }
      const resolved = resolvePath(args[0]);

      if (vfs[resolved]) {
        appendTerminalOutput(vfs[resolved].content || '', trimmed);
        return;
      }

      if (currentPath === '/home/inove') {
        const file = vfs['/home/inove']?.children?.[args[0]];
        if (file && file.content) {
          appendTerminalOutput(
            <pre className="font-mono text-xs text-slate-200 whitespace-pre-wrap">{file.content}</pre>,
            trimmed
          );
          return;
        }
      }

      appendTerminalOutput(`cat: ${args[0]}: Arquivo ou diretório inexistente`, trimmed);
      return;
    }

    // 13. ECHO
    if (cmd === 'echo') {
      const rest = args.join(' ');
      if (rest.includes('>')) {
        const [textPart, filePart] = rest.split('>');
        const cleanText = textPart.trim().replace(/^["']|["']$/g, '');
        const targetFilename = filePart.trim();
        if (targetFilename) {
          setVfs((prev) => {
            const next = { ...prev };
            if (next['/home/inove'] && next['/home/inove'].children) {
              next['/home/inove'].children[targetFilename] = {
                name: targetFilename,
                type: 'file',
                size: cleanText.length,
                permissions: '-rw-r--r--',
                owner: currentUser,
                group: currentUser,
                updatedAt: new Date().toISOString().substring(0, 16).replace('T', ' '),
                content: cleanText + '\n'
              };
            }
            return next;
          });
          appendTerminalOutput(`[OK] Gravado com sucesso em '${targetFilename}'`, trimmed);
          return;
        }
      }
      appendTerminalOutput(rest.replace(/^["']|["']$/g, ''), trimmed);
      return;
    }

    // 14. TOUCH
    if (cmd === 'touch') {
      const targetFilename = args[0];
      if (!targetFilename) {
        appendTerminalOutput('touch: falta operando de arquivo', trimmed);
        return;
      }
      setVfs((prev) => {
        const next = { ...prev };
        if (next['/home/inove'] && next['/home/inove'].children) {
          next['/home/inove'].children[targetFilename] = {
            name: targetFilename,
            type: 'file',
            size: 0,
            permissions: '-rw-r--r--',
            owner: currentUser,
            group: currentUser,
            updatedAt: new Date().toISOString().substring(0, 16).replace('T', ' '),
            content: ''
          };
        }
        return next;
      });
      appendTerminalOutput('', trimmed);
      return;
    }

    // 15. NANO
    if (cmd === 'nano') {
      const targetFile = args[0] || 'novo-arquivo.txt';
      let existingContent = '';
      if (vfs['/home/inove']?.children?.[targetFile]) {
        existingContent = vfs['/home/inove'].children[targetFile].content || '';
      }
      setNanoFilename(targetFile);
      setNanoContent(existingContent);
      setIsNanoActive(true);
      return;
    }

    // 16. COMPILE-C / GCC
    if (cmd === 'compile-c' || cmd === 'gcc') {
      const sourceFile = args[0] || 'hello.c';
      let code = '';
      if (vfs['/home/inove']?.children?.[sourceFile]) {
        code = vfs['/home/inove'].children[sourceFile].content || '';
      } else {
        code = `/* Compilado pelo GCC 15 InoveCloud x86_64 */
#include <stdio.h>
int main() {
    printf("[OK] Código C executado via syscalls diretas do Kernel Linux 7.3!\\n");
    return 0;
}`;
      }

      appendTerminalOutput(
        <div className="font-mono text-xs space-y-1">
          <div className="text-cyan-300 font-bold">
            [1/3] Invocando GCC 15.1.0 Bare-Metal (-march=native -O3 -nostdlib)...
          </div>
          <div className="text-slate-400 text-[11px]">
            &gt; gcc -march=native -O3 -nostartfiles {sourceFile} -o /home/inove/a.out
          </div>
          <div className="text-cyan-300 font-bold">
            [2/3] Gerando binário ELF 64-bit LSB pie executable x86-64 (Linux 7.3 ABI)...
          </div>
          <div className="text-emerald-400 font-bold">
            ✓ Compilação concluída com 0 avisos e 0 erros. Binário &#39;/home/inove/a.out&#39; criado.
          </div>
          <div className="text-cyan-300 font-bold pt-1">
            [3/3] Executando binário gerado (sys_execve /home/inove/a.out):
          </div>
          <div className="p-2 rounded bg-slate-900 border border-emerald-500/30 text-emerald-300">
            <div>[OK] Executado via syscall direta do Kernel Linux 7.3 puro!</div>
            <div className="text-cyan-300">&gt;&gt; InoveCloud OS Kernel 7.3 (Sem GNOME / Ring 0) operacional!</div>
            <div className="text-slate-400 text-[10px] pt-1">
              Process exited with return code: 0 | CPU cycles: 9,140 | Syscalls: [sys_write: 1, sys_exit: 1]
            </div>
          </div>
        </div>,
        trimmed
      );
      return;
    }

    // 16b. COMPILE-RUST / RUSTC (Linux Kernel 7.3 Rust Infrastructure)
    if (cmd === 'compile-rust' || cmd === 'rustc') {
      const sourceFile = args[0] || 'kernel_driver.rs';
      appendTerminalOutput(
        <div className="font-mono text-xs space-y-1">
          <div className="text-cyan-300 font-bold">
            [1/4] Invocando rustc 1.85.0 (Linux Kernel 7.3 Rust Core Subsystem)...
          </div>
          <div className="text-slate-400 text-[11px]">
            &gt; rustc --target x86_64-unknown-none -C opt-level=3 -C panic=abort --crate-type=staticlib {sourceFile}
          </div>
          <div className="text-cyan-300 font-bold">
            [2/4] Verificando invariantes de memória e segurança de tipos (Borrow Checker)...
          </div>
          <div className="text-emerald-400">
            ✓ 0 violações de segurança de memória detectadas. 100% memory-safe.
          </div>
          <div className="text-cyan-300 font-bold">
            [3/4] Vinculando ao Kernel Linux 7.3 Ring 0: inovecloud_pure73.ko
          </div>
          <div className="p-2 rounded bg-slate-900 border border-purple-500/30 text-purple-300">
            <div className="text-emerald-300 font-bold">[OK] Módulo do Kernel em Rust compilado com sucesso!</div>
            <div className="text-slate-200 text-[11px]">&gt; dmesg log: [rust] Driver 'inovecloud_pure73' carregado em Ring 0 sem GNOME.</div>
            <div className="text-slate-400 text-[10px] pt-1">
              Arquitetura: no_std • Allocator: Kernel vmalloc • Latência de interrupção: 0.12 μs
            </div>
          </div>
        </div>,
        trimmed
      );
      return;
    }

    // 16c. RUST-INFO
    if (cmd === 'rust-info') {
      appendTerminalOutput(
        <div className="font-mono text-xs space-y-1.5 p-2 rounded bg-slate-900 border border-cyan-500/30">
          <div className="text-cyan-300 font-bold">🦀 SUBSISTEMA RUST NO LINUX KERNEL 7.3 (INOVECLOUD OS):</div>
          <div className="text-slate-300 text-[11px] space-y-1">
            <div>• Versão do Compilador: <span className="text-amber-300 font-bold">rustc 1.85.0-nightly</span></div>
            <div>• Target de Compilação: <span className="text-emerald-300">x86_64-inovecloud-kernel-none</span></div>
            <div>• Crates de Kernel ativas: <span className="text-cyan-300">kernel::sync, kernel::net, kernel::drm, kernel::io_uring</span></div>
            <div>• Módulos em Rust carregados: <span className="text-white font-bold">rust_inove_core.ko, drm_kms_direct.ko</span></div>
            <div>• Desempenho: <span className="text-emerald-400 font-bold">Zero Overhead de runtime (no_std) • Imune a buffer overflow</span></div>
            <div>• Integração de interface: <span className="text-purple-300">DRM Direct Framebuffer (Zero dependência de GNOME/Mutter)</span></div>
          </div>
        </div>,
        trimmed
      );
      return;
    }

    // 16d. GNOME-CHECK (Zero GNOME Audit)
    if (cmd === 'gnome-check' || cmd === 'check-gnome') {
      appendTerminalOutput(
        <div className="font-mono text-xs space-y-1.5 p-3 rounded-xl bg-slate-900 border border-emerald-500/40">
          <div className="text-emerald-400 font-bold flex items-center space-x-2">
            <span>🛡️ AUDITORIA DE KERNEL PURO (ZERO GNOME):</span>
          </div>
          <div className="text-slate-200 text-[11px] space-y-0.5">
            <div>• gnome-shell: <span className="text-emerald-400 font-bold">[NÃO INSTALADO - 0 KB]</span></div>
            <div>• mutter (compositor GNOME): <span className="text-emerald-400 font-bold">[NÃO INSTALADO - 0 KB]</span></div>
            <div>• gdm3 (display manager GNOME): <span className="text-emerald-400 font-bold">[NÃO INSTALADO - 0 KB]</span></div>
            <div>• gnome-session: <span className="text-emerald-400 font-bold">[NÃO INSTALADO - 0 KB]</span></div>
            <div>• gnome-control-center: <span className="text-emerald-400 font-bold">[NÃO INSTALADO - 0 KB]</span></div>
          </div>
          <div className="border-t border-emerald-500/20 pt-1.5 text-cyan-300 text-[11px]">
            ✓ Arquitetura: <strong>Linux Kernel 7.3 RT Puro</strong> direto no Hardware / DRM Framebuffer.
            <div className="text-slate-400 text-[10px] mt-0.5">
              Init nativo: /sbin/inove-init (PID 1) • Zero camadas ou launchers intermediários.
            </div>
          </div>
        </div>,
        trimmed
      );
      return;
    }

    // 16e. VBOX-TEST / VIRTUALBOX DIAGNOSTIC
    if (cmd === 'vbox-test' || cmd === 'virtualbox' || cmd === 'vm-test') {
      appendTerminalOutput(
        <div className="font-mono text-xs space-y-2 p-3 rounded-xl bg-slate-900 border border-cyan-500/40">
          <div className="text-cyan-300 font-bold flex items-center space-x-2">
            <span>📦 DIAGNÓSTICO DE EXECUÇÃO EM VIRTUALBOX / QEMU:</span>
          </div>
          <div className="text-slate-300 text-[11px] space-y-1.5 leading-relaxed">
            <div className="text-amber-300 font-semibold">
              Por que apareceu GNOME no VirtualBox?
            </div>
            <div>
              Se a sua VM iniciou uma tela com "Type to search" e a barra padrão do GNOME, a máquina virtual deu boot na imagem Debian/Ubuntu desktop padrão com gnome-shell e gdm3.
            </div>
            <div className="text-emerald-300 font-semibold pt-1">
              Como rodar o Kernel Puro 7.3 no VirtualBox / QEMU (100% Livre de GNOME):
            </div>
            <div className="bg-black/60 p-2 rounded border border-white/10 text-cyan-200 text-[10px] font-mono select-all">
              qemu-system-x86_64 -m 4G -kernel /boot/vmlinuz-7.3-inovecloud -initrd /boot/initramfs-7.3-inovecloud.img -append "console=tty1 root=/dev/ram0 inove.pure=1"
            </div>
            <div className="text-slate-400 text-[10px]">
              No VirtualBox: Crie VM Linux 64-bit &gt; Anexe a ISO 'inovecloud-os-kernel-pure-7.3.iso' &gt; O sistema entra direto em Ring 0 no Console TTY1 sem carregar GNOME.
            </div>
          </div>
        </div>,
        trimmed
      );
      return;
    }

    // 16f. BUILD-ISO
    if (cmd === 'build-iso' || cmd === 'mkiso') {
      appendTerminalOutput(
        <div className="font-mono text-xs space-y-1 p-2.5 rounded-xl bg-slate-900 border border-purple-500/30">
          <div className="text-purple-300 font-bold">📀 COMPILADOR DE ISO INOVECLOUD OS (KERNEL PURO 7.3 RT):</div>
          <div className="text-slate-300 text-[11px]">• Kernel Alvo: vmlinuz-7.3-inovecloud (x86_64 RT + Rust Core)</div>
          <div className="text-slate-300 text-[11px]">• Initramfs: initramfs-7.3-inovecloud.img (PID 1 inove-init)</div>
          <div className="text-slate-300 text-[11px]">• Dependências GNOME: 0 (Purga total de gnome-shell, mutter e gdm3)</div>
          <div className="text-emerald-400 font-bold">✓ Script oficial: ./scripts/build-inove-kernel.sh</div>
          <div className="text-slate-400 text-[10px]">Execute 'sudo ./build-inovecloud.sh' para gerar dist-iso/inovecloud-os-kernel-pure-7.3.iso</div>
        </div>,
        trimmed
      );
      return;
    }

    // 17. LSMOD
    if (cmd === 'lsmod') {
      appendTerminalOutput(
        <div className="font-mono text-xs space-y-0.5">
          <div className="text-cyan-400 font-bold border-b border-cyan-800/40 pb-0.5">
            {'Module'.padEnd(24)} {'Size'.padEnd(10)} {'Used by'.padEnd(10)} {'Description'}
          </div>
          {kernelModules.map((m) => (
            <div key={m.name} className="text-slate-200">
              <span className="text-amber-300">{m.name.padEnd(24)}</span>{' '}
              <span className="text-slate-400">{String(m.size).padEnd(10)}</span>{' '}
              <span className="text-cyan-400">{String(m.instances).padEnd(10)}</span>{' '}
              <span className="text-slate-300">{m.description}</span>
            </div>
          ))}
        </div>,
        trimmed
      );
      return;
    }

    // 18. INSMOD
    if (cmd === 'insmod') {
      const modName = args[0]?.replace(/\.ko$/, '');
      if (!modName) {
        appendTerminalOutput('insmod: falta o nome do módulo .ko', trimmed);
        return;
      }
      setKernelModules((prev) => [
        ...prev,
        {
          name: modName,
          size: 32768,
          instances: 0,
          status: 'Live',
          description: `Módulo dinâmico inserido em Ring 0 (${modName})`
        }
      ]);
      setDmesgLogs((prev) => [...prev, `[   ${(uptimeSeconds + 0.12).toFixed(6)}] inove_kernel: module '${modName}' loaded successfully.`]);
      appendTerminalOutput(`[OK] Módulo do Kernel '${modName}.ko' inserido com sucesso.`, trimmed);
      return;
    }

    // 19. RMMOD
    if (cmd === 'rmmod') {
      const modName = args[0];
      if (!modName) {
        appendTerminalOutput('rmmod: falta o nome do módulo a descarregar', trimmed);
        return;
      }
      setKernelModules((prev) => prev.filter((m) => m.name !== modName));
      setDmesgLogs((prev) => [...prev, `[   ${(uptimeSeconds + 0.18).toFixed(6)}] inove_kernel: module '${modName}' unloaded.`]);
      appendTerminalOutput(`[OK] Módulo do Kernel '${modName}' descarregado.`, trimmed);
      return;
    }

    // 20. ICPKG
    if (cmd === 'icpkg') {
      const sub = args[0];
      if (sub === 'list') {
        appendTerminalOutput(
          <div className="font-mono text-xs space-y-1">
            <div className="text-cyan-400 font-bold">PACOTES INSTALADOS NO INOVECLOUD OS (SEM GNOME):</div>
            <div className="text-slate-200">• inove-core-kernel 7.3.0-rt-pure [ativo]</div>
            <div className="text-slate-200">• busybox-static 1.36.1 [ativo]</div>
            <div className="text-slate-200">• inove-init-pid1 3.0.0 [ativo]</div>
            <div className="text-slate-200">• drm-kms-direct 2.1.0 [ativo]</div>
            <div className="text-slate-200">• rust-kernel-toolchain 1.85.0 [ativo]</div>
            <div className="text-slate-200">• ebpf-tools-v2 2.0.1 [ativo]</div>
            <div className="text-slate-200">• weston-inove 14.0.0 [ativo]</div>
            <div className="text-slate-200">• pipewire-alsa 1.2.5 [ativo]</div>
            <div className="text-slate-200">• gcc-musl 15.1.0 [ativo]</div>
            <div className="text-slate-200">• flatpak-sandbox 1.14.8 [ativo]</div>
          </div>,
          trimmed
        );
      } else if (sub === 'install') {
        const pkg = args[1] || 'util-linux';
        appendTerminalOutput(
          <div className="font-mono text-xs space-y-1">
            <div className="text-cyan-300">Conectando ao repositório oficial InoveCloud Pure...</div>
            <div className="text-emerald-400">✓ Baixando {pkg}-x86_64.icpkg (1.2 MB / 1.2 MB)</div>
            <div className="text-emerald-400">✓ Verificando integridade SHA256 e assinatura GPG...</div>
            <div className="text-emerald-400">✓ Descompactando e registrando em /usr/bin/{pkg}...</div>
            <div className="text-cyan-400 font-bold">🎉 Pacote &#39;{pkg}&#39; instalado e pronto para uso!</div>
          </div>,
          trimmed
        );
      } else {
        appendTerminalOutput('Uso: icpkg <list | install <nome> | remove <nome> | info <nome>>', trimmed);
      }
      return;
    }

    // 21. SYSCTL
    if (cmd === 'sysctl') {
      appendTerminalOutput(
        <div className="font-mono text-xs space-y-0.5 text-slate-300">
          <div>vm.swappiness = 10</div>
          <div>vm.dirty_ratio = 15</div>
          <div>kernel.sched_latency_ns = 3000000</div>
          <div>kernel.sched_min_granularity_ns = 750000</div>
          <div>kernel.printk = 4 4 1 7</div>
          <div>fs.file-max = 2097152</div>
          <div>net.ipv4.ip_forward = 1</div>
          <div>net.ipv4.tcp_congestion_control = bbr</div>
        </div>,
        trimmed
      );
      return;
    }

    // 21b. DPKG (Debian Package Manager)
    if (cmd === 'dpkg') {
      const flag = args[0];
      const pkgFile = args[1] || 'package.deb';

      if (flag === '-i' || flag === '--install') {
        const pkgClean = pkgFile.replace(/\.deb$/, '');
        appendTerminalOutput(
          <div className="font-mono text-xs space-y-1 p-2.5 rounded bg-slate-900 border border-rose-500/30">
            <div className="text-cyan-400 font-bold"># dpkg --install {pkgFile}</div>
            <div className="text-slate-300">Selecting previously unselected package {pkgClean}.</div>
            <div className="text-slate-400">(Reading database ... 28412 files and directories currently installed.)</div>
            <div className="text-slate-300">Preparing to unpack {pkgFile} ...</div>
            <div className="text-slate-300">Unpacking {pkgClean} (amd64) into /usr/bin and /usr/share ...</div>
            <div className="text-slate-300">Setting up {pkgClean} ...</div>
            <div className="text-slate-400">Processing triggers for desktop-file-utils (0.28-1) ...</div>
            <div className="text-slate-400">Processing triggers for mime-support (3.66) ...</div>
            <div className="text-emerald-400 font-bold">✓ [ OK ] Pacote Debian '{pkgClean}' instalado com sucesso no InoveCloud OS!</div>
          </div>,
          trimmed
        );
      } else if (flag === '-l' || flag === '--list') {
        appendTerminalOutput(
          <div className="font-mono text-xs space-y-1">
            <div className="text-cyan-400 font-bold border-b border-cyan-800/40 pb-0.5">
              {'Status'.padEnd(6)} {'Name'.padEnd(26)} {'Version'.padEnd(16)} {'Architecture'}
            </div>
            <div className="text-slate-200"><span className="text-emerald-400">ii</span>    {'inove-core-kernel'.padEnd(26)} {'7.3.0-rt-pure'.padEnd(16)} amd64</div>
            <div className="text-slate-200"><span className="text-emerald-400">ii</span>    {'busybox-static'.padEnd(26)} {'1.36.1'.padEnd(16)} amd64</div>
            <div className="text-slate-200"><span className="text-emerald-400">ii</span>    {'virtualbox-guest-utils'.padEnd(26)} {'7.1.2'.padEnd(16)} amd64</div>
            <div className="text-slate-200"><span className="text-emerald-400">ii</span>    {'gcc-15-musl'.padEnd(26)} {'15.1.0'.padEnd(16)} amd64</div>
            <div className="text-slate-200"><span className="text-emerald-400">ii</span>    {'rustc-kernel'.padEnd(26)} {'1.85.0'.padEnd(16)} amd64</div>
            <div className="text-slate-200"><span className="text-emerald-400">ii</span>    {'google-chrome-stable'.padEnd(26)} {'129.0.6668.70'.padEnd(16)} amd64</div>
            <div className="text-slate-200"><span className="text-emerald-400">ii</span>    {'audacious'.padEnd(26)} {'4.4.1'.padEnd(16)} amd64</div>
            <div className="text-slate-200"><span className="text-emerald-400">ii</span>    {'code'.padEnd(26)} {'1.94.2'.padEnd(16)} amd64</div>
          </div>,
          trimmed
        );
      } else {
        appendTerminalOutput('Uso: dpkg -i <arquivo.deb> | dpkg -l | dpkg -s <pacote>', trimmed);
      }
      return;
    }

    // 21c. APPIMAGE-RUN
    if (cmd === 'appimage-run' || cmd === 'appimage' || cmd.endsWith('.appimage')) {
      const appFile = cmd.endsWith('.appimage') ? cmd : args[0] || 'application.AppImage';
      appendTerminalOutput(
        <div className="font-mono text-xs space-y-1 p-2.5 rounded bg-slate-900 border border-purple-500/30">
          <div className="text-purple-300 font-bold">[AppImage Runtime FUSE 3] Executando: {appFile}</div>
          <div className="text-slate-300">• Verificando permissão de execução: chmod +x {appFile} ... [OK]</div>
          <div className="text-slate-300">• Montando imagem SquashFS em /tmp/.mount_{Date.now().toString(16)} ... [OK]</div>
          <div className="text-slate-300">• Disparando subprocesso com aceleração de GPU DRM/KMS e áudio PipeWire...</div>
          <div className="text-emerald-400 font-bold">🚀 Aplicativo portátil '{appFile}' em execução no Kernel Linux 7.3 RT!</div>
        </div>,
        trimmed
      );
      return;
    }

    // 21d. PI-STORE (Raspberry Pi Ecosystem)
    if (cmd === 'pi-store' || cmd === 'pistore') {
      const sub = args[0];
      if (sub === 'list') {
        appendTerminalOutput(
          <div className="font-mono text-xs space-y-1">
            <div className="text-red-400 font-bold">CATÁLOGO OFICIAL PI STORE (RASPBERRY PI FOUNDATION):</div>
            <div className="text-slate-200">• <span className="text-amber-300 font-bold">rpi-imager</span>: Gravador oficial de ISOs e SD cards [Disponível]</div>
            <div className="text-slate-200">• <span className="text-amber-300 font-bold">scratch3-desktop</span>: Ambiente visual de blocos e robótica [Disponível]</div>
            <div className="text-slate-200">• <span className="text-amber-300 font-bold">thonny-ide</span>: IDE Python 3 com depurador visual integrado [Disponível]</div>
            <div className="text-slate-200">• <span className="text-amber-300 font-bold">sonic-pi</span>: Live coding e sintetizador musical de áudio [Disponível]</div>
            <div className="text-slate-200">• <span className="text-amber-300 font-bold">pi-hole</span>: Bloqueador de DNS de rede e anúncios [Disponível]</div>
            <div className="text-slate-400 text-[10px]">Use 'pi-store install &lt;nome&gt;' para instalar.</div>
          </div>,
          trimmed
        );
      } else if (sub === 'install') {
        const pkg = args[1] || 'rpi-imager';
        appendTerminalOutput(
          <div className="font-mono text-xs space-y-1 p-2 rounded bg-slate-900 border border-red-500/30">
            <div className="text-red-400 font-bold">Conectando ao repositório Pi Store (archive.raspberrypi.com)...</div>
            <div className="text-slate-300">✓ Baixando binário {pkg} e bibliotecas para x86_64...</div>
            <div className="text-slate-300">✓ Configurando bindings de áudio ALSA e sensores...</div>
            <div className="text-emerald-400 font-bold">🎉 Aplicativo Pi Store '{pkg}' instalado com sucesso!</div>
          </div>,
          trimmed
        );
      } else {
        appendTerminalOutput('Uso: pi-store <list | install <nome>>', trimmed);
      }
      return;
    }

    // 21e. FLATPAK
    if (cmd === 'flatpak') {
      const sub = args[0];
      if (sub === 'install') {
        const appName = args[1] || 'org.mozilla.firefox';
        appendTerminalOutput(
          <div className="font-mono text-xs space-y-1 p-2 rounded bg-slate-900 border border-blue-500/30">
            <div className="text-blue-400 font-bold">Buscando no Flathub: {appName}...</div>
            <div className="text-slate-300">✓ Baixando camadas OCI do runtime org.freedesktop.Platform...</div>
            <div className="text-slate-300">✓ Configurando permissões Bubblewrap (Wayland, DRM, Network)...</div>
            <div className="text-emerald-400 font-bold">✓ Aplicativo Flathub '{appName}' instalado com sucesso!</div>
          </div>,
          trimmed
        );
      } else {
        appendTerminalOutput(
          <div className="font-mono text-xs space-y-1">
            <div className="text-blue-400 font-bold">FLATPAK RUNTIMES &amp; FLATHUB ATIVOS:</div>
            <div className="text-slate-200">• org.freedesktop.Platform 24.08 [runtime]</div>
            <div className="text-slate-200">• flathub remote: https://dl.flathub.org/repo/ [ativo]</div>
            <div className="text-slate-400 text-[10px]">Use 'flatpak install flathub &lt;app&gt;' para instalar aplicativos.</div>
          </div>,
          trimmed
        );
      }
      return;
    }

    // 21f. WIFI (Network Manager CLI)
    if (cmd === 'wifi' || cmd === 'iwctl' || cmd === 'wpa_cli') {
      const action = args[0] || 'status';
      if (action === 'scan') {
        appendTerminalOutput(
          <div className="font-mono text-xs space-y-1">
            <div className="text-cyan-400 font-bold border-b border-cyan-800/40 pb-0.5">
              {'SSID'.padEnd(28)} {'Signal'.padEnd(10)} {'Security'.padEnd(10)} {'Frequency'}
            </div>
            <div className="text-emerald-400 font-bold">{'* InoveCloud-5G-Ultra'.padEnd(28)} {'-42 dBm'.padEnd(10)} {'WPA3'.padEnd(10)} 5 GHz (Conectado)</div>
            <div className="text-slate-200">{'  Home-Fiber-HighSpeed'.padEnd(28)} {'-55 dBm'.padEnd(10)} {'WPA2'.padEnd(10)} 5 GHz</div>
            <div className="text-slate-200">{'  Corporativo-Inove-Guest'.padEnd(28)} {'-64 dBm'.padEnd(10)} {'Aberta'.padEnd(10)} 2.4 GHz</div>
            <div className="text-slate-200">{'  Starlink-Satellite-Mesh'.padEnd(28)} {'-70 dBm'.padEnd(10)} {'WPA3'.padEnd(10)} 5 GHz</div>
          </div>,
          trimmed
        );
      } else if (action === 'connect') {
        const ssid = args[1] || 'InoveCloud-5G-Ultra';
        appendTerminalOutput(
          <div className="font-mono text-xs space-y-1 p-2 rounded bg-slate-900 border border-cyan-500/30">
            <div className="text-cyan-400 font-bold">[wlan0] Conectando à rede Wi-Fi '{ssid}'...</div>
            <div className="text-slate-300">• Negociando chaves WPA2/WPA3 com o ponto de acesso... OK</div>
            <div className="text-slate-300">• Solicitando concessão DHCPv4 (udhcpc)... OK</div>
            <div className="text-emerald-400 font-bold">✓ Conectado! IP: 192.168.1.145/24 • Gateway: 192.168.1.1 • DNS: 1.1.1.1</div>
          </div>,
          trimmed
        );
      } else {
        appendTerminalOutput(
          <div className="font-mono text-xs space-y-1 p-2.5 rounded bg-slate-900 border border-cyan-500/30">
            <div className="text-cyan-300 font-bold">STATUS DA REDE SEM FIO (Wi-Fi 6E/7):</div>
            <div className="text-slate-200">• Interface: <strong className="text-emerald-400">wlan0 [UP, RUNNING]</strong></div>
            <div className="text-slate-200">• Rede Atual: <strong className="text-cyan-400">InoveCloud-5G-Ultra</strong> (5.180 GHz, Ch 36)</div>
            <div className="text-slate-200">• Endereço IP: <strong className="text-white">192.168.1.145</strong> (MAC: 48:21:0b:3a:ff:12)</div>
            <div className="text-slate-200">• Qualidade do Sinal: <strong className="text-emerald-400">92% (-42 dBm) • TX: 1200 Mbps</strong></div>
            <div className="text-slate-400 text-[10px]">Comandos: 'wifi scan' para procurar redes | 'wifi connect &lt;ssid&gt; [senha]' para conectar.</div>
          </div>,
          trimmed
        );
      }
      return;
    }

    // 21g. BLUETOOTH / BLUETOOTHCTL
    if (cmd === 'bluetooth' || cmd === 'bluetoothctl') {
      const action = args[0] || 'status';
      if (action === 'scan' || action === 'devices') {
        appendTerminalOutput(
          <div className="font-mono text-xs space-y-1">
            <div className="text-cyan-400 font-bold border-b border-cyan-800/40 pb-0.5">
              {'MAC Address'.padEnd(20)} {'Device Name'.padEnd(28)} {'Type'.padEnd(10)} {'Status'}
            </div>
            <div className="text-emerald-400 font-bold">{'F4:0F:24:AB:19:92'.padEnd(20)} {'AirPods Pro 2 (Inove Audio)'.padEnd(28)} {'Audio'.padEnd(10)} Conectado (92%)</div>
            <div className="text-slate-200">{'E8:06:88:42:10:FA'.padEnd(20)} {'Mouse Logitech MX Master 3S'.padEnd(28)} {'HID/Mouse'.padEnd(10)} Conectado (78%)</div>
            <div className="text-slate-200">{'C0:26:DF:88:14:11'.padEnd(20)} {'Teclado Keychron K2'.padEnd(28)} {'HID/Keybd'.padEnd(10)} Conectado (85%)</div>
            <div className="text-slate-400">{'A4:77:33:55:66:77'.padEnd(20)} {'Caixa de Som JBL Flip 6'.padEnd(28)} {'Audio'.padEnd(10)} Pareado</div>
          </div>,
          trimmed
        );
      } else if (action === 'connect') {
        const dev = args[1] || 'AirPods Pro 2';
        appendTerminalOutput(
          <div className="font-mono text-xs space-y-1 p-2 rounded bg-slate-900 border border-blue-500/30">
            <div className="text-blue-400 font-bold">[bluetoothd] Pareando e conectando com '{dev}'...</div>
            <div className="text-slate-300">• Canal L2CAP estabelecido com suporte a áudio LDAC/AAC... OK</div>
            <div className="text-slate-300">• Roteando saída de áudio para o servidor PipeWire ALSA... OK</div>
            <div className="text-emerald-400 font-bold">✓ Dispositivo Bluetooth conectado e pronto para uso!</div>
          </div>,
          trimmed
        );
      } else {
        appendTerminalOutput(
          <div className="font-mono text-xs space-y-1 p-2.5 rounded bg-slate-900 border border-blue-500/30">
            <div className="text-blue-300 font-bold">SUBSISTEMA BLUETOOTH 5.4 LE (BLUEZ &amp; PIPEWIRE):</div>
            <div className="text-slate-200">• Adaptador: <strong className="text-emerald-400">hci0 [Powered: ON, Discoverable: OFF]</strong></div>
            <div className="text-slate-200">• Endereço Host: <strong className="text-white">00:1A:7D:DA:71:13</strong> (Intel AX211)</div>
            <div className="text-slate-200">• Dispositivos Conectados: <strong className="text-cyan-400">3 ativos (Áudio + Teclado + Mouse)</strong></div>
            <div className="text-slate-400 text-[10px]">Comandos: 'bluetooth scan' para buscar dispositivos | 'bluetooth connect &lt;id&gt;' para parear.</div>
          </div>,
          trimmed
        );
      }
      return;
    }

    // 22. INOVE-DESKTOP / STARTX / GUI
    if (cmd === 'inove-desktop' || cmd === 'startx' || cmd === 'gui') {
      appendTerminalOutput(
        <div className="font-mono text-xs space-y-1 text-cyan-300">
          <div>[INIT] Iniciando servidor gráfico DRM/KMS nativo InoveCloud OS...</div>
          <div>[INFO] Compositor Liquid Glass direto no Framebuffer (Zero dependência de GNOME)...</div>
          <div className="text-emerald-400 font-bold">✓ Transição para modo gráfico em andamento...</div>
        </div>,
        trimmed
      );
      setTimeout(() => {
        onSwitchToGui();
      }, 700);
      return;
    }

    // 23. REBOOT
    if (cmd === 'reboot') {
      appendTerminalOutput(
        <div className="font-mono text-xs space-y-1 text-amber-300">
          <div>Broadcast message from root@inovecloud-kernel (tty1):</div>
          <div>The system is going down for reboot NOW!</div>
          <div className="text-slate-400">Stopping services... Syncing disks... Unmounting filesystems...</div>
        </div>,
        trimmed
      );
      setTimeout(() => {
        if (onReboot) onReboot();
        else window.location.reload();
      }, 1200);
      return;
    }

    // 24. POWEROFF / HALT
    if (cmd === 'poweroff' || cmd === 'halt' || cmd === 'shutdown') {
      appendTerminalOutput(
        <div className="font-mono text-xs space-y-1 text-red-400">
          <div>Broadcast message from root@inovecloud-kernel:</div>
          <div>System halted. Powering down via ACPI...</div>
        </div>,
        trimmed
      );
      setTimeout(() => {
        if (onPowerOff) onPowerOff();
        else window.location.reload();
      }, 1000);
      return;
    }

    // 25. WHOAMI / ID
    if (cmd === 'whoami') {
      appendTerminalOutput(currentUser, trimmed);
      return;
    }
    if (cmd === 'id') {
      appendTerminalOutput('uid=0(root) gid=0(root) groups=0(root),4(adm),24(cdrom),27(sudo)', trimmed);
      return;
    }

    // 26. DATE / UPTIME
    if (cmd === 'date') {
      appendTerminalOutput(new Date().toString(), trimmed);
      return;
    }
    if (cmd === 'uptime') {
      const mins = Math.floor(uptimeSeconds / 60);
      const secs = uptimeSeconds % 60;
      appendTerminalOutput(
        ` ${new Date().toLocaleTimeString()} up ${mins} min, ${secs} sec, 1 user, load average: 0.08, 0.04, 0.01`,
        trimmed
      );
      return;
    }

    // 27. KILL
    if (cmd === 'kill') {
      const pidToKill = parseInt(args[0], 10);
      if (isNaN(pidToKill)) {
        appendTerminalOutput('kill: PID inválido', trimmed);
        return;
      }
      if (pidToKill <= 2) {
        appendTerminalOutput(`kill: (${pidToKill}) - Operação não permitida no processo do Kernel`, trimmed);
        return;
      }
      setProcesses((prev) => prev.filter((p) => p.pid !== pidToKill));
      appendTerminalOutput(`[OK] Sinal SIGTERM enviado para PID ${pidToKill}`, trimmed);
      return;
    }

    // 28. SU
    if (cmd === 'su') {
      const targetUser = args[0] || 'root';
      if (targetUser === 'inove' || targetUser === 'root') {
        setCurrentUser(targetUser as any);
        appendTerminalOutput(`Alternado para usuário '${targetUser}'`, trimmed);
      } else {
        appendTerminalOutput(`su: usuário '${targetUser}' não existe`, trimmed);
      }
      return;
    }

    // Unknown command
    appendTerminalOutput(
      <span className="text-red-400 font-mono">
        inove-sh: comando não encontrado: &#39;{cmd}&#39;. Digite <strong className="text-amber-300">help</strong> para comandos disponíveis.
      </span>,
      trimmed
    );
  };

  // Keyboard navigation for command history & auto-complete
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      executeCommand(commandInput);
      setCommandInput('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const nextIdx = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(nextIdx);
        setCommandInput(commandHistory[nextIdx]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex !== -1) {
        const nextIdx = historyIndex + 1;
        if (nextIdx >= commandHistory.length) {
          setHistoryIndex(-1);
          setCommandInput('');
        } else {
          setHistoryIndex(nextIdx);
          setCommandInput(commandHistory[nextIdx]);
        }
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      // Simple autocompletion
      const cmds = [
        'help', 'dmesg', 'top', 'ps', 'free', 'df', 'ls', 'cd', 'cat', 'nano',
        'echo', 'touch', 'compile-c', 'compile-rust', 'rust-info', 'gnome-check',
        'vbox-test', 'build-iso', 'gcc', 'rustc', 'lsmod', 'insmod', 'rmmod',
        'icpkg', 'sysctl', 'inove-desktop', 'reboot', 'poweroff', 'clear', 'uname'
      ];
      const match = cmds.find((c) => c.startsWith(commandInput.trim()));
      if (match) {
        setCommandInput(match + ' ');
      }
    }
  };

  // Theme Styles
  const getThemeClasses = () => {
    switch (theme) {
      case 'matrix':
        return 'bg-black text-emerald-400 selection:bg-emerald-800';
      case 'amber':
        return 'bg-[#0f0a00] text-amber-400 selection:bg-amber-800';
      case 'white':
        return 'bg-[#080808] text-slate-100 selection:bg-slate-700';
      case 'cyber':
      default:
        return 'bg-[#050811] text-cyan-300 selection:bg-cyan-800';
    }
  };

  return (
    <div
      onClick={focusInput}
      className={`fixed inset-0 z-[99999] flex flex-col font-mono select-none overflow-hidden ${getThemeClasses()}`}
    >
      {/* Scanlines overlay effect */}
      {hasScanlines && (
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)] z-10 opacity-70">
          <div
            className="w-full h-full opacity-25"
            style={{
              backgroundImage: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.7) 50%)',
              backgroundSize: '100% 4px'
            }}
          />
        </div>
      )}

      {/* TOP KERNEL HARDWARE TELEMETRY & TTY BAR */}
      <header className="relative z-20 flex flex-wrap items-center justify-between px-3 py-1.5 bg-slate-950/90 border-b border-cyan-500/30 text-xs">
        {/* Left: Kernel Brand & TTY Indicators */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 text-white font-bold tracking-wider">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            <span className="text-cyan-400">INOVECLOUD OS</span>
            <span className="text-slate-400 text-[10px] hidden sm:inline">KERNEL PURO 7.3 RT</span>
          </div>

          <div className="flex items-center space-x-1 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-700 text-[11px]">
            <button
              onClick={() => setActiveTty(1)}
              className={`px-2 py-0.5 rounded font-bold transition cursor-pointer ${
                activeTty === 1 ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="TTY1: Shell Interativo Principal (Ctrl+Alt+F1)"
            >
              tty1
            </button>
            <button
              onClick={() => setActiveTty(2)}
              className={`px-2 py-0.5 rounded font-bold transition cursor-pointer ${
                activeTty === 2 ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="TTY2: Buffer dmesg contínuo (Ctrl+Alt+F2)"
            >
              tty2
            </button>
            <button
              onClick={() => setActiveTty(3)}
              className={`px-2 py-0.5 rounded font-bold transition cursor-pointer ${
                activeTty === 3 ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="TTY3: Top Telemetria de Processos (Ctrl+Alt+F3)"
            >
              tty3
            </button>
          </div>
        </div>

        {/* Center: Live Telemetry Badges */}
        <div className="hidden lg:flex items-center space-x-4 text-[11px] text-slate-300">
          <div className="flex items-center space-x-1.5">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>CPU: <strong className="text-emerald-400 font-mono">{topCpuUsage}%</strong> (16 Threads)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <Activity className="w-3.5 h-3.5 text-purple-400" />
            <span>RAM: <strong className="text-emerald-400 font-mono">{topMemUsage}%</strong> (16 GB)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <HardDrive className="w-3.5 h-3.5 text-amber-400" />
            <span>NVMe: <strong className="text-cyan-400 font-mono">Gen4 7.2GB/s</strong></span>
          </div>
          <div className="text-slate-400 font-mono text-[10px]">
            UPTIME: {Math.floor(uptimeSeconds / 60)}m {uptimeSeconds % 60}s
          </div>
        </div>

        {/* Right: Quick Action Buttons */}
        <div className="flex items-center space-x-2">
          {/* Transition to GUI */}
          <button
            onClick={onSwitchToGui}
            className="flex items-center space-x-1.5 px-3 py-1 rounded bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold transition shadow-md shadow-cyan-600/30 cursor-pointer active:scale-95"
            title="Iniciar Interface Gráfica Nativa (Direct DRM/KMS - Sem GNOME)"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Modo Gráfico Nativo (F7)</span>
          </button>

          {/* Theme selector */}
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value as any)}
            className="bg-slate-900 border border-slate-700 text-slate-300 text-[10px] rounded px-1.5 py-1 focus:outline-none cursor-pointer"
          >
            <option value="cyber">Cyber Cyan</option>
            <option value="matrix">Matrix Green</option>
            <option value="amber">Amber CRT</option>
            <option value="white">Monochrome</option>
          </select>

          {/* Scanlines toggle */}
          <button
            onClick={() => setHasScanlines(!hasScanlines)}
            className={`px-2 py-1 rounded border text-[10px] transition cursor-pointer ${
              hasScanlines ? 'bg-cyan-900/60 border-cyan-500/50 text-cyan-200' : 'bg-slate-900 border-slate-700 text-slate-400'
            }`}
            title="Alternar efeito de linhas scanlines CRT"
          >
            CRT
          </button>

          {/* Sound toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 transition cursor-pointer"
            title="Alternar som do terminal"
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-cyan-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
          </button>

          {/* Reboot Button */}
          <button
            onClick={() => executeCommand('reboot')}
            className="p-1 rounded bg-amber-900/40 hover:bg-amber-800/60 text-amber-300 border border-amber-600/40 transition cursor-pointer"
            title="Reiniciar Kernel Linux"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>

          {/* Poweroff Button */}
          <button
            onClick={() => executeCommand('poweroff')}
            className="p-1 rounded bg-red-900/40 hover:bg-red-800/60 text-red-300 border border-red-600/40 transition cursor-pointer"
            title="Desligar Computador"
          >
            <Power className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* QUICK LAUNCH SHORTCUT CHIPS */}
      <div className="relative z-20 flex items-center space-x-1.5 px-3 py-1 bg-slate-950/70 border-b border-white/5 overflow-x-auto text-[11px] scrollbar-none">
        <span className="text-slate-500 font-bold select-none text-[10px] uppercase">Ações Rápidas:</span>
        <button
          onClick={() => executeCommand('uname -a')}
          className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-800/40 cursor-pointer"
        >
          uname -a
        </button>
        <button
          onClick={() => executeCommand('dmesg')}
          className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-800/40 cursor-pointer"
        >
          dmesg
        </button>
        <button
          onClick={() => executeCommand('top')}
          className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-800/40 cursor-pointer"
        >
          top (Processos)
        </button>
        <button
          onClick={() => executeCommand('compile-c hello.c')}
          className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-emerald-300 border border-emerald-800/40 cursor-pointer"
        >
          ⚡ compile-c hello.c
        </button>
        <button
          onClick={() => executeCommand('nano welcome.txt')}
          className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-800/40 cursor-pointer"
        >
          📝 nano welcome.txt
        </button>
        <button
          onClick={() => executeCommand('lsmod')}
          className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-800/40 cursor-pointer"
        >
          lsmod (Módulos)
        </button>
        <button
          onClick={() => executeCommand('free -m')}
          className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-800/40 cursor-pointer"
        >
          free -m (RAM)
        </button>
        <button
          onClick={() => executeCommand('help')}
          className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-purple-300 border border-purple-800/40 cursor-pointer"
        >
          help (Ajuda)
        </button>
      </div>

      {/* MAIN SCREEN CONTENT */}
      <div className="relative z-10 flex-1 overflow-y-auto p-4 select-text">
        {/* TTY 1: MAIN INTERACTIVE SHELL */}
        {activeTty === 1 && !isTopActive && !isNanoActive && (
          <div className={`space-y-2 ${fontSize}`}>
            {/* History Output */}
            {terminalHistory.map((entry) => (
              <div key={entry.id} className="space-y-1">
                {entry.command && (
                  <div className="flex items-center space-x-2">
                    <span className="text-emerald-400 font-bold">{entry.user}@inovecloud-kernel</span>
                    <span className="text-slate-500">:</span>
                    <span className="text-blue-400 font-bold">{entry.path}</span>
                    <span className="text-amber-400 font-bold">{entry.user === 'root' ? '#' : '$'}</span>
                    <span className="text-white font-mono">{entry.command}</span>
                  </div>
                )}
                {entry.output && (
                  <div className="pl-0 leading-relaxed">{entry.output}</div>
                )}
              </div>
            ))}

            {/* Active Input Line */}
            <div className="flex items-center space-x-2 pt-1">
              <span className="text-emerald-400 font-bold">{currentUser}@inovecloud-kernel</span>
              <span className="text-slate-500">:</span>
              <span className="text-blue-400 font-bold">{currentPath}</span>
              <span className="text-amber-400 font-bold">{currentUser === 'root' ? '#' : '$'}</span>
              <input
                ref={commandInputRef}
                type="text"
                value={commandInput}
                onChange={(e) => setCommandInput(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
                spellCheck={false}
                autoComplete="off"
                className="flex-1 bg-transparent border-none outline-none font-mono text-white caret-cyan-400 p-0 m-0"
              />
            </div>
            <div ref={terminalEndRef} />
          </div>
        )}

        {/* TTY 1: TOP LIVE MONITOR */}
        {activeTty === 1 && isTopActive && (
          <div className="space-y-3 font-mono text-xs">
            <div className="p-3 rounded-lg bg-slate-900 border border-cyan-500/30 space-y-1">
              <div className="flex justify-between text-white font-bold">
                <span>top - {new Date().toLocaleTimeString()} up {Math.floor(uptimeSeconds / 60)} min, 1 user, load average: 0.12, 0.08, 0.02</span>
                <span className="text-amber-400">Pressione [Ctrl+C] ou clique em Fechar para sair</span>
              </div>
              <div className="text-slate-300">
                Tasks: <strong className="text-cyan-400">{processes.length} total</strong>, 1 running, {processes.length - 1} sleeping, 0 stopped, 0 zombie
              </div>
              <div className="text-slate-300">
                %Cpu(s): <strong className="text-emerald-400">{topCpuUsage}% us</strong>, 1.2% sy, 0.0% ni, 95.0% id, 0.0% wa, 0.0% hi, 0.0% si
              </div>
              <div className="text-slate-300">
                MiB Mem : <strong className="text-cyan-400">16000.0 total</strong>, 12100.1 free, 2463.6 used, 1436.3 buff/cache
              </div>
              <div className="text-slate-300">
                MiB Swap: <strong className="text-cyan-400">8192.0 total</strong>, 8192.0 free, 0.0 used. 13536.4 avail Mem
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-cyan-950 text-cyan-300 font-bold border-b border-cyan-800">
                    <th className="p-1">PID</th>
                    <th className="p-1">USER</th>
                    <th className="p-1">PR</th>
                    <th className="p-1">NI</th>
                    <th className="p-1">VIRT</th>
                    <th className="p-1">RES</th>
                    <th className="p-1">SHR</th>
                    <th className="p-1">S</th>
                    <th className="p-1">%CPU</th>
                    <th className="p-1">%MEM</th>
                    <th className="p-1">TIME+</th>
                    <th className="p-1">COMMAND</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {processes.map((p) => (
                    <tr key={p.pid} className="hover:bg-slate-900/60 text-slate-200">
                      <td className="p-1 text-cyan-400">{p.pid}</td>
                      <td className="p-1 text-slate-400">{p.user}</td>
                      <td className="p-1">20</td>
                      <td className="p-1">0</td>
                      <td className="p-1">{p.vsz}</td>
                      <td className="p-1">{p.rss}</td>
                      <td className="p-1">1024</td>
                      <td className="p-1 text-amber-400">{p.stat}</td>
                      <td className="p-1 text-emerald-400 font-bold">{p.cpu}</td>
                      <td className="p-1">{p.mem}</td>
                      <td className="p-1 text-slate-400">{p.time}</td>
                      <td className="p-1 font-bold text-white">{p.command}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => {
                  setIsTopActive(false);
                  appendTerminalOutput('Monitor TOP finalizado');
                }}
                className="px-4 py-1.5 rounded bg-red-600 hover:bg-red-500 text-white font-bold transition cursor-pointer"
              >
                Fechar Monitor TOP
              </button>
            </div>
          </div>
        )}

        {/* TTY 1: NANO IN-TERMINAL TEXT EDITOR */}
        {activeTty === 1 && isNanoActive && (
          <div className="h-full flex flex-col space-y-2 font-mono text-xs">
            <div className="bg-slate-900 text-white p-2 rounded border border-cyan-500/40 flex items-center justify-between">
              <div>
                <span className="text-cyan-400 font-bold">GNU nano 8.0</span> — Arquivo:{' '}
                <span className="text-amber-300 font-bold">{nanoFilename}</span>
              </div>
              <span className="text-slate-400 text-[11px]">[Modificado]</span>
            </div>

            <textarea
              value={nanoContent}
              onChange={(e) => setNanoContent(e.target.value)}
              className="flex-1 w-full bg-slate-950 p-3 rounded border border-slate-800 font-mono text-slate-100 text-xs focus:outline-none resize-none leading-relaxed"
              rows={16}
            />

            <div className="bg-slate-900 p-2 rounded border border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-300">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => {
                    // Save file
                    setVfs((prev) => {
                      const next = { ...prev };
                      if (next['/home/inove'] && next['/home/inove'].children) {
                        next['/home/inove'].children[nanoFilename] = {
                          name: nanoFilename,
                          type: 'file',
                          size: nanoContent.length,
                          permissions: '-rw-r--r--',
                          owner: currentUser,
                          group: currentUser,
                          updatedAt: new Date().toISOString().substring(0, 16).replace('T', ' '),
                          content: nanoContent
                        };
                      }
                      return next;
                    });
                    appendTerminalOutput(`[OK] Arquivo '${nanoFilename}' salvo com sucesso (${nanoContent.length} bytes).`);
                    setIsNanoActive(false);
                  }}
                  className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer"
                >
                  ^O Salvar e Sair
                </button>
                <button
                  onClick={() => setIsNanoActive(false)}
                  className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                >
                  ^X Cancelar
                </button>
              </div>
              <div className="text-[11px] text-slate-400">
                Linhas: {nanoContent.split('\n').length} | Caracteres: {nanoContent.length}
              </div>
            </div>
          </div>
        )}

        {/* TTY 2: CONTINUOUS KERNEL LOG STREAM (DMESG -W) */}
        {activeTty === 2 && (
          <div className="space-y-2 font-mono text-xs">
            <div className="p-2 rounded bg-slate-900 border border-cyan-500/30 flex items-center justify-between text-slate-200">
              <div>
                <span className="text-cyan-400 font-bold">TTY 2:</span> Monitor Contínuo do Kernel Ring Buffer (dmesg -w)
              </div>
              <span className="text-emerald-400 text-[11px] flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                <span>Captura em tempo real ativa</span>
              </span>
            </div>

            <div className="space-y-1 font-mono text-xs text-slate-300">
              {dmesgLogs.map((log, idx) => (
                <div key={idx} className="leading-tight">
                  <span className="text-cyan-400">{log.substring(0, 15)}</span>
                  <span className="text-slate-200">{log.substring(15)}</span>
                </div>
              ))}
              <div className="text-emerald-400 animate-pulse pt-2">
                [   {(uptimeSeconds + 0.42).toFixed(6)}] inove_kernel: heartbeat ok, zero dropped frames on /dev/fb0.
              </div>
            </div>
          </div>
        )}

        {/* TTY 3: HARDWARE TOPOLOGY & SUBSYSTEM INSPECTOR */}
        {activeTty === 3 && (
          <div className="space-y-4 font-mono text-xs">
            <div className="p-3 rounded-lg bg-slate-900 border border-cyan-500/30 flex items-center justify-between">
              <div>
                <span className="text-cyan-400 font-bold">TTY 3:</span> Topologia de Hardware & Arquitetura do Kernel Puro
              </div>
              <span className="text-slate-400 text-[11px]">x86_64 SMP / Bare-Metal Mode</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-emerald-400 font-bold block border-b border-slate-800 pb-1">
                  1. CPU & Escalonador Ring 0
                </span>
                <div className="text-slate-300 space-y-1 text-[11px]">
                  <div>• Arquitetura: x86_64 SMP com suporte a AVX2, AVX-512, FMA, BMI2</div>
                  <div>• Escalonador: EEVDF (Earliest Eligible Virtual Deadline First)</div>
                  <div>• Latência alvo: 3ms (Otimizado para baixa latência)</div>
                  <div>• Timer Frequency: CONFIG_HZ=1000 (1000 Hz)</div>
                  <div>• Preempção: PREEMPT_DYNAMIC (Full Preemption ativa)</div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-emerald-400 font-bold block border-b border-slate-800 pb-1">
                  2. Gráficos & DRM/KMS Framebuffer
                </span>
                <div className="text-slate-300 space-y-1 text-[11px]">
                  <div>• Driver: Direct Rendering Manager (DRM / SimpleDRM / fbdev)</div>
                  <div>• Dependência de GNOME: <strong className="text-emerald-400">ZERO (100% Puro)</strong></div>
                  <div>• Scanout: Direto em hardware via fb0 e dri/card0</div>
                  <div>• Taxa de atualização: 60Hz sem travamentos</div>
                  <div>• Aceleração 3D: Mesa / Gallium DRI3 nativo</div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-emerald-400 font-bold block border-b border-slate-800 pb-1">
                  3. Gerenciamento de Memória & ZRAM
                </span>
                <div className="text-slate-300 space-y-1 text-[11px]">
                  <div>• Algoritmo de Compressão: ZSTD multi-thread</div>
                  <div>• Alocador: SLUB Allocator de alta performance</div>
                  <div>• Swappiness: vm.swappiness = 10 (preserva RAM física)</div>
                  <div>• Dirty Ratio: vm.dirty_ratio = 15%</div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-emerald-400 font-bold block border-b border-slate-800 pb-1">
                  4. Inicialização & Init PID 1
                </span>
                <div className="text-slate-300 space-y-1 text-[11px]">
                  <div>• Init Process: /sbin/inove-init (autônomo em C)</div>
                  <div>• Gerenciamento de Dispositivos: udevd nativo</div>
                  <div>• Rede: udhcpc / inove-networkd com IPv4/IPv6</div>
                  <div>• Áudio: ALSA & PipeWire com direct DMA buffer</div>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-gradient-to-r from-blue-950/60 to-cyan-950/60 border border-cyan-500/30 flex items-center justify-between">
              <div>
                <span className="font-bold text-white text-xs block">Deseja iniciar a Interface Gráfica Nativa?</span>
                <span className="text-[11px] text-cyan-200">
                  Executa o compositor InoveCloud Liquid Glass diretamente sobre o DRM/KMS sem carregar GNOME.
                </span>
              </div>
              <button
                onClick={onSwitchToGui}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition cursor-pointer shadow-lg shadow-cyan-600/30 active:scale-95"
              >
                Iniciar Agora (F7) ➔
              </button>
            </div>
          </div>
        )}
      </div>

      {/* FOOTER BAR WITH SYSTEM STATUS & KEY SHORTCUTS */}
      <footer className="relative z-20 flex flex-wrap items-center justify-between px-3 py-1 bg-slate-950/95 border-t border-cyan-500/20 text-[11px] text-slate-400">
        <div className="flex items-center space-x-3">
          <span>
            TTY: <strong className="text-cyan-400 font-bold">/dev/tty{activeTty}</strong>
          </span>
          <span className="hidden sm:inline">|</span>
          <span className="hidden sm:inline">
            Usuário: <strong className="text-emerald-400">{currentUser}</strong>
          </span>
          <span className="hidden sm:inline">|</span>
          <span className="hidden sm:inline">
            Kernel: <strong className="text-white">7.3.0-inovecloud-rt-pure</strong>
          </span>
        </div>

        <div className="flex items-center space-x-3 text-[10px]">
          <span>
            <kbd className="px-1 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700">Ctrl+Alt+F7</kbd> Modo Gráfico
          </span>
          <span>
            <kbd className="px-1 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700">Tab</kbd> Autocompletar
          </span>
          <span>
            <kbd className="px-1 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700">↑/↓</kbd> Histórico
          </span>
        </div>
      </footer>
    </div>
  );
};

export default PureKernelOS;
