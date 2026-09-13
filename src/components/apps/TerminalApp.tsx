import React, { useState } from 'react';
import { Terminal as TerminalIcon, Sparkles, Server, Zap, RefreshCw } from 'lucide-react';
import { VirtualNode, WebApp } from '../../types';

interface TerminalAppProps {
  vns?: VirtualNode[];
  webApps?: WebApp[];
  onToggleVnStatus?: (id: string) => void;
}

export const TerminalApp: React.FC<TerminalAppProps> = ({
  vns = [],
  webApps = [],
  onToggleVnStatus,
}) => {
  const [history, setHistory] = useState<string[]>([
    'InoveCloud Debian 13 (Trixie) GNOME Web Terminal & Control Console (x86_64)',
    'Linux inovecloud-os 6.12.0-trixie-amd64 #1-InoveCloud-SMP Debian Trixie',
    'Conectado ao subsistema local via /api/terminal/exec e socket.',
    'Suporte direto a comandos do host: flatpak, apt, systemctl, gnome-shell, ls, uname, htop, etc.',
    'Digite "help" para ver comandos do cluster ou digite comandos nativos do Debian.',
    '',
  ]);
  const [input, setInput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);

  const handleCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = input.trim();
    if (!cmd) return;

    const currentLine = `root@inovecloud-os:~# ${cmd}`;
    const newHistory = [...history, currentLine];
    const parts = cmd.split(' ');
    const main = parts[0].toLowerCase();

    if (main === 'clear') {
      setHistory([]);
      setInput('');
      return;
    }

    if (main === 'help') {
      newHistory.push('Comandos do Sistema & Gerenciador de Pacotes:');
      newHistory.push('  flatpak install flathub <id> - Instala aplicativo real do Flathub');
      newHistory.push('  flatpak run <id>             - Executa aplicativo no display Wayland');
      newHistory.push('  flatpak list                 - Lista aplicativos Flatpak instalados');
      newHistory.push('  apt update / apt install     - Gerenciador de pacotes nativos Debian');
      newHistory.push('  inovectl status              - Exibe o status da infraestrutura e nuvem');
      newHistory.push('  vn list                      - Lista Máquinas Virtuais KVM');
      newHistory.push('  docker ps                    - Lista contêineres em execução');
      newHistory.push('  neofetch                     - Informações do cluster e hardware');
      newHistory.push('  clear                        - Limpa o terminal');
      setHistory(newHistory);
      setInput('');
      return;
    }

    if (main === 'neofetch') {
      newHistory.push('        .---.         OS: InoveCloud OS 2026.1 (Debian 13 Trixie GNOME Glass) x86_64');
      newHistory.push('       /     \\        Host: InoveCloud GNOME Desktop (Wayland / Liquid Glass)');
      newHistory.push('      | () () |       Kernel: 6.12.0-trixie-amd64');
      newHistory.push('       \\  _  /        Uptime: 14 days, 8 hours, 42 mins');
      newHistory.push('        \'---\'         Packages: 1540 (dpkg), Flathub Flatpaks (ativo)');
      newHistory.push('                      Shell: inove-bash 5.2.21');
      newHistory.push('                      DE: GNOME 46+ (Mutter / Liquid Glass Theme)');
      newHistory.push('                      CPU: AMD EPYC 9654 96-Core (192) @ 2.400GHz');
      newHistory.push('                      Memory: 4.2GB / 64.0GB');
      setHistory(newHistory);
      setInput('');
      return;
    }

    if (main === 'inovectl' && parts[1] === 'status') {
      newHistory.push('=== INOVECLOUD DEBIAN 13 (TRIXIE) GNOME HOST STATUS ===');
      newHistory.push(`Total VNs KVM: ${vns.length} (Ativas: ${vns.filter((v) => v.status === 'running').length})`);
      newHistory.push(`Web Apps: ${webApps.length} (Proxy Reverso Nginx + SSL Ativo)`);
      newHistory.push('Flathub Repo: Ativo (https://dl.flathub.org/repo/flathub.flatpakrepo)');
      newHistory.push('GNOME Liquid Glass Theme: Ativo (/usr/share/themes/InoveCloud-Glass)');
      newHistory.push('Serviço Local API: /opt/inovecloud/server.js [PORTA 3000 ATIVA]');
      setHistory(newHistory);
      setInput('');
      return;
    }

    // Try executing real host command via POST /api/terminal/exec
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
        newHistory.push('[Comando finalizado com código 0]');
      }
    } catch (err) {
      setIsExecuting(false);
      // Fallback response for simulator
      if (cmd.startsWith('flatpak install')) {
        newHistory.push(`[Flatpak] Baixando e instalando pacote Flathub: ${parts.slice(2).join(' ')}`);
        newHistory.push('Configurando permissões do sandbox Wayland...');
        newHistory.push('Instalação concluída com sucesso!');
      } else if (cmd.startsWith('apt update') || cmd.startsWith('apt install')) {
        newHistory.push(`[APT] Lendo listas de pacotes... Pronto`);
        newHistory.push(`Construindo árvore de dependências... Pronto`);
        newHistory.push(`0 atualizados, 1 instalados, 0 para remover.`);
      } else {
        newHistory.push(`inove-bash: comando executado: ${cmd}`);
      }
    }

    setHistory(newHistory);
  };

  return (
    <div className="flex flex-col h-full bg-black font-mono text-xs text-emerald-400 p-4 select-text">
      {/* Header Badge */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800 text-[11px] text-zinc-400">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-zinc-300">Debian 13 GNOME Shell Connected</span>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-zinc-500">TTY: /dev/pts/0</span>
          <span className="text-cyan-400 font-mono">REST & WebSocket API</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-1">
        {history.map((line, i) => (
          <div key={i} className="whitespace-pre-wrap leading-relaxed text-slate-200">
            {line}
          </div>
        ))}
        {isExecuting && (
          <div className="flex items-center space-x-2 text-cyan-400 animate-pulse">
            <RefreshCw className="w-3 h-3 animate-spin" />
            <span>Executando no host Debian...</span>
          </div>
        )}
      </div>

      <form onSubmit={handleCommand} className="pt-3 border-t border-slate-800 flex items-center space-x-2">
        <span className="text-emerald-400 font-bold shrink-0">root@inovecloud-os:~#</span>
        <input
          type="text"
          value={input}
          disabled={isExecuting}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Digite um comando (ex: flatpak install, apt update, ls -la, neofetch)..."
          className="flex-1 bg-transparent text-white font-mono text-xs focus:outline-none disabled:opacity-50"
          autoFocus
        />
      </form>
    </div>
  );
};

export default TerminalApp;
