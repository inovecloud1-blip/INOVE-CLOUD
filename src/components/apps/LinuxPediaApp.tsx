import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  Terminal,
  ExternalLink,
  Copy,
  Check,
  Code2,
  Layers,
  Sparkles,
  Server,
  Play,
  Shield,
  HardDrive,
  Cpu,
  Globe,
  Database
} from 'lucide-react';

interface LinuxCommand {
  id: string;
  name: string;
  category: 'Arquivos & Diretórios' | 'Redes & Segurança' | 'Processos & Systemd' | 'Virtualização & Kiosk' | 'Pacotes & Repositórios' | 'Engenharia de SOs & OSDev';
  summary: string;
  syntax: string;
  example: string;
  description: string;
  flags: { flag: string; desc: string }[];
  outputSample: string;
}

const LINUX_COMMANDS: LinuxCommand[] = [
  {
    id: 'littleosbook-gdt-idt',
    name: 'LittleOSBook: GDT, IDT & Paging',
    category: 'Engenharia de SOs & OSDev',
    summary: 'Fundamentos de inicialização x86, tabela de descritores globais e paginação de memória',
    syntax: 'lgdt [gdt_ptr] / lidt [idt_ptr] / mov cr3, eax',
    example: 'littleosbook: setup_gdt(); setup_idt(); enable_paging();',
    description: 'Conforme documentado em littleosbook.github.io, a inicialização do modo protegido requer carregar a GDT com segmentos de código/dados (Kernel 0x08/0x10, User 0x18/0x20), remapear o PIC 8259 (offsets 0x20 e 0x28) e configurar o diretório de páginas ativando o bit PG no registrador CR0 (0x80000000).',
    flags: [
      { flag: 'CR0 PG (bit 31)', desc: 'Habilita a unidade de gerenciamento de memória paginada (MMU).' },
      { flag: 'CR3 Register', desc: 'Armazena o endereço físico do Page Directory base.' },
      { flag: 'Interrupt 14 (#PF)', desc: 'Tratador de exceção para faltas de página (Page Fault).' },
      { flag: 'ATA PIO (0x1F0)', desc: 'Leitura/escrita de setores de disco sem dependência de BIOS.' },
    ],
    outputSample: `[OS Init] GDT loaded at physical 0x00100400 (5 entries: NULL, KCODE, KDATA, UCODE, UDATA)
[OS Init] IDT initialized: 256 interrupt gates registered. PIC 8259 remapped to 0x20-0x2F
[OS Init] Page Directory initialized: Identity mapping 0-4MB (PTE 0..1023). CR0.PG = 1
[OS Init] ATA Primary Controller ready at I/O port 0x1F0 (Status: 0x50 DRDY/DSC)`,
  },
  {
    id: 'osdev-ahci-nvme',
    name: 'OSDev: AHCI SATA & NVMe Drivers',
    category: 'Engenharia de SOs & OSDev',
    summary: 'Controladores de armazenamento direto ao hardware para HDs e SSDs de alta velocidade',
    syntax: 'ahci_init(pci_device_t *dev) / nvme_init(pci_device_t *dev)',
    example: 'osdev: pci_scan_class(0x01, 0x06); // Encontrar AHCI Host Bus Adapter',
    description: 'Padrão industrial da wiki.osdev.org para comunicação direta com discos rígidos via Memory-Mapped I/O (MMIO). Elimina a lentidão do ATA PIO e permite transferências DMA de até 6 Gbps (SATA III) ou PCIe Gen4 (NVMe) sem travar a CPU.',
    flags: [
      { flag: 'HBA GHC.HR', desc: 'Reset do controlador Host Bus Adapter AHCI.' },
      { flag: 'Port Command List (CLB)', desc: 'Lista de comandos DMA para leitura/escrita de setores.' },
      { flag: 'PRDT (Physical Region)', desc: 'Tabela de ponteiros de memória física para DMA.' },
      { flag: 'FIS (Frame Info Struct)', desc: 'Estrutura serial SATA que transmite pacotes de dados.' },
    ],
    outputSample: `[PCI Scan] Class 01:06:01 (SATA Controller AHCI 1.30) found at 00:1f.2 (BAR5 MMIO: 0xfebd0000)
[AHCI] Ports Implemented: 0x00000003 (Port 0: ATA SSD 512GB, Port 1: Empty)
[AHCI Port 0] Signature: 0x00000101 (SATA Drive). Allocating Command List & Received FIS
[AHCI Port 0] DMA Buffer mapped at 0x10000000 (PRDT entries: 128). Ready for sector read/write`,
  },
  {
    id: 'phil-opp-pml4',
    name: 'Phil Opp: 4-Level Paging & IST',
    category: 'Engenharia de SOs & OSDev',
    summary: 'Paginação x86_64 multinível de 64 bits e Interrupt Stack Table anti-falha',
    syntax: 'PML4 -> PDPT -> Page Directory -> Page Table -> 4KB Frame',
    example: 'let mut frame_allocator = BootInfoFrameAllocator::init(&boot_info.memory_map);',
    description: 'Fundamentado em os.phil-opp.com (Writing an OS in Rust). Implementa mapeamento de 4 níveis de páginas para segurança total contra invasão de memória, além de configurar uma pilha dedicada no TSS (IST1) para capturar Double Faults e impedir o desligamento ou reboot em loop (Triple Fault) da máquina.',
    flags: [
      { flag: 'PML4 Entry', desc: 'Primeiro nível de tradução de endereço virtual de 48 bits.' },
      { flag: 'IST1 (Double Fault)', desc: 'Pilha física separada de 20KB para recuperação de erros críticos.' },
      { flag: 'Frame Allocator', desc: 'Varredura do mapa de memória E820 / UEFI para alocar páginas livres.' },
      { flag: 'Async Executor', desc: 'Escalonamento cooperativo de tarefas baseado em Wakers e Futures.' },
    ],
    outputSample: `[x86_64 Kernel] Active PML4 Table physical address: 0x0000000000101000
[x86_64 Kernel] TSS initialized with IST1 at 0xffff800000040000 (Double Fault Guard Stack)
[x86_64 Kernel] Usable physical memory frames discovered: 1,048,576 (4096 MB)
[x86_64 Kernel] Async kernel executor online. Handling IRQ 1 (Keyboard) and IRQ 14 (Disk)`,
  },
  {
    id: 'xorriso-isohybrid',
    name: 'xorriso (ISO Híbrida UEFI/BIOS)',
    category: 'Engenharia de SOs & OSDev',
    summary: 'Gera imagens ISO 9660 compatíveis com boot em qualquer computador e pendrive USB',
    syntax: 'xorriso -as mkisofs [opções_híbridas] -o sistema.iso rootfs/',
    example: 'xorriso -as mkisofs -isohybrid-mbr /usr/lib/ISOLINUX/isohdpfx.bin -c isolinux/boot.cat -b isolinux/isolinux.bin -no-emul-boot -boot-load-size 4 -boot-info-table -eltorito-alt-boot -e boot/grub/efi.img -no-emul-boot -isohybrid-gpt-basdat -o inovecloud-os.iso isodir/',
    description: 'Comando essencial para criar ISOs que dão boot garantido tanto em computadores antigos (Legacy BIOS via MBR El Torito) quanto em placas modernas com UEFI / SecureBoot (via partição ESP FAT32).',
    flags: [
      { flag: '-isohybrid-mbr', desc: 'Grava o código MBR no setor 0 permitindo boot direto via pendrive com dd.' },
      { flag: '-eltorito-alt-boot', desc: 'Permite registrar uma segunda entrada de boot para o EFI.' },
      { flag: '-e [efi.img]', desc: 'Imagem de partição FAT32 contendo o bootloader BOOTX64.EFI.' },
      { flag: '-isohybrid-gpt-basdat', desc: 'Registra a partição EFI na tabela GPT para conformidade UEFI estrita.' },
    ],
    outputSample: `xorriso 1.5.6 : RockRidge filesystem manipulator, libburnia project.
Drive current: -outdev 'inovecloud-os-kernel-pure-x86_64.iso'
Media current: stdio file, overwriteable
Writing to 'inovecloud-os-kernel-pure-x86_64.iso' completed successfully.
ISO image size: 840 MB. Hybrid MBR + GPT ESP FAT32 partition verified. Bootable: YES.`,
  },
  {
    id: 'systemctl',
    name: 'systemctl',
    category: 'Processos & Systemd',
    summary: 'Controla o sistema de inicialização e serviços do systemd',
    syntax: 'systemctl [comando] [nome-do-serviço]',
    example: 'sudo systemctl status inovecloud.service',
    description: 'Comando fundamental nas distribuições Linux modernas (Debian, Ubuntu, Arch, Fedora) para gerenciar daemons, checar status, reiniciar serviços e habilitar no boot.',
    flags: [
      { flag: 'start / stop', desc: 'Inicia ou encerra um serviço imediatamente.' },
      { flag: 'enable / disable', desc: 'Habilita ou desabilita o início automático no boot.' },
      { flag: 'status', desc: 'Exibe status de execução, PID e últimas linhas do log.' },
      { flag: 'restart / reload', desc: 'Reinicia o processo ou recarrega configurações.' },
    ],
    outputSample: `● inovecloud.service - InoveCloud OS Local Application Server
     Loaded: loaded (/etc/systemd/system/inovecloud.service; enabled; preset: enabled)
     Active: active (running) since Sat 2026-09-12 09:40:12 UTC; 2h ago
   Main PID: 1248 (node)
      Tasks: 11 (limit: 4915)
     Memory: 84.2M
        CPU: 1.412s
     CGroup: /system.slice/inovecloud.service
             └─1248 /usr/bin/node /opt/inovecloud/server.js`,
  },
  {
    id: 'cage',
    name: 'cage',
    category: 'Virtualização & Kiosk',
    summary: 'Compositor Wayland minimalista projetado para modo Kiosk / Tela Cheia',
    syntax: 'cage [-d] [--] [aplicação] [argumentos]',
    example: 'cage -- chromium --kiosk --app=http://localhost:3000',
    description: 'Diferente de GNOME ou KDE, o Cage foi concebido para quiosques e appliances. Ele executa uma única aplicação em tela cheia maximizada com aceleração por GPU via Wayland.',
    flags: [
      { flag: '-d', desc: 'Não fecha o Cage automaticamente se a aplicação sair.' },
      { flag: '-s', desc: 'Habilita rotação ou escala de monitor específica.' },
    ],
    outputSample: `[cage] Initializing Wayland compositor on backend DRM/KMS...
[cage] Found active display connector: eDP-1 (1920x1080@60Hz)
[cage] Spawning kiosk target: /usr/bin/chromium --kiosk --app=http://127.0.0.1:3000`,
  },
  {
    id: 'grep',
    name: 'grep',
    category: 'Arquivos & Diretórios',
    summary: 'Busca padrões e expressões regulares em textos e arquivos',
    syntax: 'grep [opções] "termo" [arquivo/diretório]',
    example: 'grep -rnI "inovecloud" /etc/systemd/system/',
    description: 'Ferramenta onipresente do padrão POSIX para filtrar linhas que combinam com uma expressão regular.',
    flags: [
      { flag: '-r, --recursive', desc: 'Busca recursivamente em todos os subdiretórios.' },
      { flag: '-i, --ignore-case', desc: 'Ignora distinção entre maiúsculas e minúsculas.' },
      { flag: '-n, --line-number', desc: 'Exibe o número da linha correspondente.' },
      { flag: '-v, --invert-match', desc: 'Inverte o filtro (mostra linhas que NÃO contêm).' },
    ],
    outputSample: `/etc/systemd/system/inovecloud.service:2:Description=InoveCloud OS Local Application Server
/etc/systemd/system/inovecloud.service:8:ExecStart=/usr/bin/node /opt/inovecloud/server.js`,
  },
  {
    id: 'journalctl',
    name: 'journalctl',
    category: 'Processos & Systemd',
    summary: 'Consulta e analisa logs agregados do systemd-journald',
    syntax: 'journalctl [opções]',
    example: 'journalctl -u inovecloud.service -f --no-pager',
    description: 'Centraliza todos os logs do kernel, serviços e sessões de usuários com timestamp de microssegundos.',
    flags: [
      { flag: '-u [unit]', desc: 'Filtra logs de uma unidade/serviço específico.' },
      { flag: '-f, --follow', desc: 'Streaming contínuo em tempo real (estilo tail -f).' },
      { flag: '-b', desc: 'Mostra apenas mensagens desde o boot atual.' },
      { flag: '-p [err|warning]', desc: 'Filtra por nível de prioridade.' },
    ],
    outputSample: `Sep 12 09:40:12 inovecloud-os node[1248]: InoveCloud OS Local Server running on http://127.0.0.1:3000
Sep 12 09:40:14 inovecloud-os cage[1301]: Client connected to Wayland display`,
  },
  {
    id: 'curl',
    name: 'curl',
    category: 'Redes & Segurança',
    summary: 'Transfere dados de ou para um servidor usando múltiplos protocolos',
    syntax: 'curl [opções] [URL]',
    example: 'curl -fsSL https://deb.nodesource.com/setup_20.x | bash -',
    description: 'Ferramenta para testar requisições HTTP, HTTPS, WebSockets, downloads e APIs REST.',
    flags: [
      { flag: '-I, --head', desc: 'Retorna apenas os headers da resposta HTTP.' },
      { flag: '-s, --silent', desc: 'Modo silencioso (não mostra barra de progresso).' },
      { flag: '-L, --location', desc: 'Segue redirecionamentos (HTTP 301/302).' },
      { flag: '-X [METHOD]', desc: 'Especifica o método HTTP (GET, POST, PUT, DELETE).' },
    ],
    outputSample: `HTTP/1.1 200 OK
Server: InoveCloud-Engine/2.4
Content-Type: application/json; charset=utf-8
Content-Length: 42
Date: Sat, 12 Sep 2026 09:41:00 GMT`,
  },
  {
    id: 'debootstrap',
    name: 'debootstrap',
    category: 'Virtualização & Kiosk',
    summary: 'Instala um sistema básico Debian em um subdiretório para chroot ou ISO',
    syntax: 'debootstrap [opções] [suíte] [diretório-alvo] [espelho]',
    example: 'sudo debootstrap --arch=amd64 bookworm /chroot http://deb.debian.org/debian',
    description: 'Coração da criação de ISOs bootáveis e containers. Permite gerar um Debian funcional sem precisar de instalador gráfico.',
    flags: [
      { flag: '--arch=[arch]', desc: 'Define arquitetura alvo (ex: amd64, arm64).' },
      { flag: '--variant=minbase', desc: 'Instala somente os pacotes estritamente essenciais.' },
      { flag: '--include=[pkg]', desc: 'Adiciona pacotes extras durante a montagem inicial.' },
    ],
    outputSample: `I: Retrieving Release
I: Validating Packages
I: Resolving dependencies of required packages...
I: Chosen extractor: dpkg-deb
I: Extracting coreutils...
I: Base system installed successfully.`,
  },
  {
    id: 'iptables',
    name: 'iptables / nftables',
    category: 'Redes & Segurança',
    summary: 'Filtro de pacotes IPv4 e regras de firewall do kernel Linux',
    syntax: 'iptables [-t tabela] -A [chain] -p [proto] --dport [porta] -j [ação]',
    example: 'sudo iptables -A INPUT -p tcp --dport 3000 -j ACCEPT',
    description: 'Gerencia regras de firewall de camada 3 e 4, NAT, redirecionamento de portas e bloqueio de tráfego invasor.',
    flags: [
      { flag: '-A, --append', desc: 'Insere uma nova regra no final da cadeia.' },
      { flag: '-L, --list', desc: 'Lista todas as regras ativas no firewall.' },
      { flag: '-p, --protocol', desc: 'Protocolo da regra (tcp, udp, icmp).' },
      { flag: '-j, --jump', desc: 'Ação para o pacote (ACCEPT, DROP, REJECT).' },
    ],
    outputSample: `Chain INPUT (policy ACCEPT)
target     prot opt source               destination         
ACCEPT     tcp  --  anywhere             anywhere             tcp dpt:3000
ACCEPT     tcp  --  anywhere             anywhere             tcp dpt:ssh`,
  },
  {
    id: 'docker',
    name: 'docker',
    category: 'Virtualização & Kiosk',
    summary: 'Gerencia containers e imagens leves com isolamento cgroups e namespaces',
    syntax: 'docker [comando] [argumentos]',
    example: 'docker run -d -p 3000:3000 --name inove-launcher inovecloud:latest',
    description: 'Plataforma líder para empacotamento de serviços em containers portáveis e seguros.',
    flags: [
      { flag: 'run -d', desc: 'Inicia o container em segundo plano (detached mode).' },
      { flag: '-p [host:cnt]', desc: 'Mapeia portas do host para o container.' },
      { flag: '-v [src:dst]', desc: 'Monta volumes persistentes de disco.' },
      { flag: 'ps -a', desc: 'Lista todos os containers ativos e parados.' },
    ],
    outputSample: `CONTAINER ID   IMAGE                COMMAND                  STATUS         PORTS
7c2a1b9f8e0d   inovecloud:latest    "node server.js"         Up 2 hours     0.0.0.0:3000->3000/tcp`,
  },
  {
    id: 'apt-package-manager',
    name: 'apt & dpkg (Instalação de Apps Linux .deb)',
    category: 'Pacotes & Repositórios',
    summary: 'Gerenciador oficial Debian para instalar navegadores, softwares e pacotes .deb no InoveCloud OS',
    syntax: 'sudo apt install [pacote] / sudo dpkg -i [arquivo.deb]',
    example: 'wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb && sudo dpkg -i google-chrome-stable_current_amd64.deb || sudo apt install -f -y',
    description: 'O InoveCloud OS é baseado em Debian 13 (Trixie), o que garante suporte total e nativo a qualquer aplicativo Linux compilado para Debian/Ubuntu. Você pode instalar o Google Chrome oficial (.deb), Chromium nativo (`sudo apt install chromium`), Firefox (`sudo apt install firefox-esr`) e milhares de ferramentas pelo repositório oficial.',
    flags: [
      { flag: 'install -y', desc: 'Instala o pacote e todas as suas dependências automaticamente sem solicitar confirmação.' },
      { flag: 'update', desc: 'Sincroniza os índices de pacotes mais recentes dos repositórios oficiais.' },
      { flag: 'dpkg -i', desc: 'Instala diretamente um pacote binário .deb baixado da internet.' },
      { flag: 'install -f', desc: 'Corrige e instala automaticamente qualquer dependência faltante após um dpkg -i.' },
    ],
    outputSample: `Reading package lists... Done
Building dependency tree... Done
The following NEW packages will be installed:
  google-chrome-stable (128.0.6613.137)
0 upgraded, 1 newly installed, 0 to remove.
Unpacking google-chrome-stable (128.0.6613.137)...
Setting up google-chrome-stable (128.0.6613.137)...
Processing triggers for desktop-file-utils...
[InoveCloud OS] ✓ Google Chrome instalado e adicionado ao menu de aplicativos!`,
  },
  {
    id: 'flatpak-flathub',
    name: 'flatpak (Flathub Store & Sandbox)',
    category: 'Pacotes & Repositórios',
    summary: 'Instalação universal de apps isolados (DaVinci Resolve, Firefox, Chrome, Steam, Discord)',
    syntax: 'flatpak install flathub [app_id] / flatpak run [app_id]',
    example: 'flatpak install flathub org.mozilla.firefox com.blackmagicdesign.Resolve com.google.Chrome',
    description: 'O Flathub é o maior catálogo universal de softwares para Linux do mundo e já vem 100% pré-configurado no InoveCloud OS. Ele permite instalar versões atualizadas de aplicativos com suas próprias bibliotecas isoladas sem quebrar o sistema base.',
    flags: [
      { flag: 'install flathub [id]', desc: 'Baixa e instala o aplicativo diretamente dos servidores do Flathub.' },
      { flag: 'run [id]', desc: 'Executa a aplicação em um ambiente seguro com sandbox.' },
      { flag: 'update', desc: 'Atualiza todos os aplicativos Flatpak instalados para a versão mais recente.' },
      { flag: 'list', desc: 'Exibe todos os aplicativos e runtimes instalados no computador.' },
    ],
    outputSample: `Looking for matches...
Required runtime for com.blackmagicdesign.Resolve/x86_64/stable (runtime/org.freedesktop.Platform/x86_64/23.08) found in remote flathub
Do you want to install it? [Y/n]: y
Installing 1/2… org.freedesktop.Platform 100% [====================] 230 MB
Installing 2/2… com.blackmagicdesign.Resolve 100% [====================] 2.4 GB
Installation complete. Executing: flatpak run com.blackmagicdesign.Resolve`,
  },
  {
    id: 'davinci-resolve-guide',
    name: 'DaVinci Resolve no InoveCloud OS',
    category: 'Pacotes & Repositórios',
    summary: 'Configuração e execução de edição de vídeo profissional 8K com OpenCL e aceleração por GPU',
    syntax: 'chmod +x DaVinci_Resolve_Linux.run && ./DaVinci_Resolve_Linux.run -i',
    example: 'sudo apt install -y ocl-icd-libopencl1 libgl1-mesa-dri && ./DaVinci_Resolve_19.0_Linux.run',
    description: 'O DaVinci Resolve roda nativamente no InoveCloud OS. Por possuir o Kernel Linux 6.x puro e drivers Mesa com suporte a OpenCL (ocl-icd-libopencl1) e aceleração gráfica por hardware (VA-API/Vulkan), você pode utilizar tanto o instalador oficial da Blackmagic (.run) quanto a versão empacotada via Flatpak.',
    flags: [
      { flag: 'ocl-icd-libopencl1', desc: 'Biblioteca ICD necessária para o DaVinci detectar o motor OpenCL de GPU.' },
      { flag: 'vulkan-tools', desc: 'Diagnóstico e aceleração de shader para renderização fluida da timeline.' },
      { flag: 'pipewire-jack', desc: 'Suporte a áudio de ultrabaixa latência para a suíte Fairlight.' },
      { flag: 'makeresolvedeb', desc: 'Utilitário comunitário para converter o instalador oficial em um pacote .deb nativo.' },
    ],
    outputSample: `[DaVinci Resolve Hardware Check]
✓ GPU Detected: Dedicated Acceleration Support (Vulkan / OpenGL 4.6 / OpenCL 3.0)
✓ OpenCL ICD Runtime: Available (/etc/OpenCL/vendors)
✓ Audio Subsystem: PipeWire Low-Latency Audio Server Ready
✓ Video Processing Engine: Fairlight & Fusion Node Pipeline Initialized
DaVinci Resolve Studio 19.0 pronto para edição!`,
  },
];

export const LinuxPediaApp: React.FC = () => {
  const [selectedCommand, setSelectedCommand] = useState<LinuxCommand>(LINUX_COMMANDS[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'encyclopedia' | 'terminal' | 'api'>('encyclopedia');
  const [customTerminalInput, setCustomTerminalInput] = useState('systemctl status inovecloud.service');
  const [simulatedTerminalOutput, setSimulatedTerminalOutput] = useState<string>(LINUX_COMMANDS[0].outputSample);

  const categories = [
    'Todos',
    'Pacotes & Repositórios',
    'Engenharia de SOs & OSDev',
    'Processos & Systemd',
    'Virtualização & Kiosk',
    'Redes & Segurança',
    'Arquivos & Diretórios',
  ];

  const filteredCommands = LINUX_COMMANDS.filter((cmd) => {
    const matchSearch =
      cmd.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cmd.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cmd.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory = selectedCategory === 'Todos' || cmd.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRunCommand = (cmdText: string) => {
    const match = LINUX_COMMANDS.find((c) => cmdText.trim().startsWith(c.name));
    if (match) {
      setSimulatedTerminalOutput(match.outputSample);
    } else {
      setSimulatedTerminalOutput(`$ ${cmdText}\n[bash] Comando executado com sucesso no cluster InoveCloud OS (exit status 0).`);
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-100 font-sans overflow-hidden select-none">
      {/* Top Header Banner */}
      <div className="p-4 border-b border-white/10 bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-700 flex items-center justify-center text-white shadow-xl shadow-emerald-500/20">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-white tracking-tight">
                LinuxPedia API & Enciclopédia de Comandos
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                REST API Hub
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Inspirado no projeto open-source{' '}
              <a
                href="https://github.com/LinuxPediaAPI/LinuxPediaAPI"
                target="_blank"
                rel="noreferrer"
                className="text-emerald-400 underline hover:text-emerald-300"
              >
                LinuxPediaAPI/LinuxPediaAPI
              </a>
              : guia de sintaxe, flags e exemplos práticos para o seu OS.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <a
            href="https://github.com/LinuxPediaAPI/LinuxPediaAPI"
            target="_blank"
            rel="noreferrer"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition cursor-pointer border border-white/10"
          >
            <span>GitHub Oficial</span>
            <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
          </a>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-5 pt-3 border-b border-white/10 bg-slate-900/60 flex space-x-2 overflow-x-auto text-xs font-semibold">
        {[
          { id: 'encyclopedia', label: 'Enciclopédia de Comandos', icon: BookOpen },
          { id: 'terminal', label: 'Terminal Playground Interativo', icon: Terminal },
          { id: 'api', label: 'LinuxPedia REST API Docs', icon: Database },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-3.5 py-2.5 border-b-2 transition cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'border-emerald-500 text-emerald-400 font-bold bg-white/5 rounded-t-lg'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5 rounded-t-lg'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ENCYCLOPEDIA TAB */}
      {activeTab === 'encyclopedia' && (
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left Column: Commands List */}
          <div className="w-full md:w-80 border-r border-white/10 flex flex-col bg-slate-950/60">
            {/* Search and Category Filter */}
            <div className="p-3 border-b border-white/10 space-y-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filtrar comandos (ex: cage, grep)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex gap-1 overflow-x-auto pb-1 text-[10px]">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2 py-0.5 rounded-full transition cursor-pointer whitespace-nowrap ${
                      selectedCategory === cat
                        ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40'
                        : 'bg-white/5 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {filteredCommands.map((cmd) => {
                const isSelected = selectedCommand.id === cmd.id;
                return (
                  <div
                    key={cmd.id}
                    onClick={() => setSelectedCommand(cmd)}
                    className={`p-2.5 rounded-xl cursor-pointer transition flex items-center justify-between ${
                      isSelected
                        ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                        : 'hover:bg-white/5 text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-xs text-white">{cmd.name}</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/5 text-slate-400">
                          {cmd.category.split(' ')[0]}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 truncate max-w-[200px] mt-0.5">
                        {cmd.summary}
                      </p>
                    </div>
                    <Code2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Detailed Command View */}
          <div className="flex-1 p-5 overflow-y-auto space-y-5">
            <div className="flex items-start justify-between flex-wrap gap-2">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-xl font-bold font-mono text-white">{selectedCommand.name}</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {selectedCommand.category}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {selectedCommand.description}
                </p>
              </div>

              <button
                onClick={() => {
                  setActiveTab('terminal');
                  setCustomTerminalInput(selectedCommand.example);
                  handleRunCommand(selectedCommand.example);
                }}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition cursor-pointer shadow-lg shadow-emerald-600/25 active:scale-95"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Testar no Terminal</span>
              </button>
            </div>

            {/* Syntax Box */}
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/10 space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Sintaxe Geral
              </span>
              <div className="font-mono text-xs text-emerald-400">{selectedCommand.syntax}</div>
            </div>

            {/* Practical Example */}
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/10 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Exemplo Prático de Uso
                </span>
                <button
                  onClick={() => handleCopy(selectedCommand.example, 'cmd-example')}
                  className="flex items-center space-x-1 text-[10px] text-slate-400 hover:text-white transition cursor-pointer"
                >
                  {copiedId === 'cmd-example' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedId === 'cmd-example' ? 'Copiado' : 'Copiar'}</span>
                </button>
              </div>
              <div className="font-mono text-xs text-cyan-300 bg-black/60 p-2.5 rounded-lg border border-white/5">
                {selectedCommand.example}
              </div>
            </div>

            {/* Flags & Parameters Table */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Parâmetros & Flags Frequentes
              </span>
              <div className="divide-y divide-white/5 rounded-xl border border-white/10 overflow-hidden bg-slate-900/40">
                {selectedCommand.flags.map((flag, idx) => (
                  <div key={idx} className="p-2.5 flex items-start space-x-3 text-xs">
                    <span className="font-mono font-bold text-emerald-400 shrink-0 w-28">
                      {flag.flag}
                    </span>
                    <span className="text-slate-300 text-[11px] leading-relaxed">
                      {flag.desc}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Output Sample */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Saída Típica de Exemplo (Terminal Output)
              </span>
              <pre className="p-3.5 rounded-xl bg-black/80 font-mono text-[11px] text-slate-300 overflow-x-auto border border-white/10 leading-relaxed">
                {selectedCommand.outputSample}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* TERMINAL PLAYGROUND TAB */}
      {activeTab === 'terminal' && (
        <div className="flex-1 p-5 overflow-y-auto space-y-4 max-w-4xl mx-auto w-full">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span>Simulador de Terminal LinuxPedia</span>
              </h3>
              <p className="text-xs text-slate-400">
                Digite ou selecione qualquer comando Linux para testar no ambiente de demonstração.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-emerald-400 font-mono text-sm font-bold pl-2">$</span>
            <input
              type="text"
              value={customTerminalInput}
              onChange={(e) => setCustomTerminalInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRunCommand(customTerminalInput);
              }}
              placeholder="Digite um comando (ex: systemctl status inovecloud, cage, grep...)"
              className="flex-1 px-3 py-2 rounded-xl bg-black/60 border border-white/10 font-mono text-xs text-white focus:outline-none focus:border-emerald-400"
            />
            <button
              onClick={() => handleRunCommand(customTerminalInput)}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer active:scale-95 transition"
            >
              Executar
            </button>
          </div>

          {/* Quick Command Chips */}
          <div className="flex flex-wrap gap-1.5 text-xs">
            {LINUX_COMMANDS.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  setCustomTerminalInput(c.example);
                  handleRunCommand(c.example);
                }}
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-300 font-mono text-[11px] transition cursor-pointer border border-white/5"
              >
                {c.example}
              </button>
            ))}
          </div>

          {/* Terminal Screen */}
          <div className="p-4 rounded-2xl bg-black font-mono text-xs text-emerald-400 border border-white/10 shadow-2xl overflow-x-auto min-h-[220px]">
            <div className="text-slate-500 mb-2"># InoveCloud Linux Subsystem v6.1 - Simulação Ativa</div>
            <pre className="text-slate-200 whitespace-pre-wrap leading-relaxed">
              {simulatedTerminalOutput}
            </pre>
          </div>
        </div>
      )}

      {/* REST API DOCS TAB */}
      {activeTab === 'api' && (
        <div className="flex-1 p-5 overflow-y-auto space-y-4 max-w-4xl mx-auto w-full">
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
            <div className="flex items-center space-x-2 text-emerald-400">
              <Database className="w-5 h-5" />
              <h3 className="text-sm font-bold text-white">LinuxPedia REST API Reference</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              A API centraliza dados estruturados sobre o ecossistema Linux para serem consumidos por dashboards, launchers, chatbots e documentações.
            </p>

            <div className="space-y-3 pt-2">
              <div className="p-3 rounded-xl bg-black/60 border border-white/5 space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono font-bold text-[10px]">
                    GET
                  </span>
                  <span className="font-mono text-xs text-white">/api/commands</span>
                </div>
                <p className="text-[11px] text-slate-400">Retorna a lista de comandos categorizados com exemplos e flags.</p>
              </div>

              <div className="p-3 rounded-xl bg-black/60 border border-white/5 space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-mono font-bold text-[10px]">
                    GET
                  </span>
                  <span className="font-mono text-xs text-white">/api/commands/:name</span>
                </div>
                <p className="text-[11px] text-slate-400">Busca a especificação detalhada de um comando (ex: /api/commands/grep).</p>
              </div>

              <div className="p-3 rounded-xl bg-black/60 border border-white/5 space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 font-mono font-bold text-[10px]">
                    GET
                  </span>
                  <span className="font-mono text-xs text-white">/api/distributions</span>
                </div>
                <p className="text-[11px] text-slate-400">Retorna famílias e árvores de distribuições Linux (Debian, Arch, RHEL, Alpine).</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
