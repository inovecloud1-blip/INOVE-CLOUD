import React, { useState } from 'react';
import {
  Search,
  Server,
  Globe,
  Users,
  Layers,
  HardDrive,
  Terminal,
  Bot,
  Settings,
  FolderKanban,
  Activity,
  ArrowRight,
  Monitor,
  Compass,
  User,
  Disc,
  BookOpen,
  Palette
} from 'lucide-react';
import { AppId } from '../../types';

interface SpotlightSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenApp: (id: AppId) => void;
}

export const SpotlightSearch: React.FC<SpotlightSearchProps> = ({
  isOpen,
  onClose,
  onOpenApp,
}) => {
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const items = [
    { id: 'browser' as AppId, title: 'Navegador Web Local & DevTools', desc: 'Acessar dashboards locais, portas de rede e internet', icon: <Compass className="w-4 h-4 text-cyan-400" /> },
    { id: 'user' as AppId, title: 'Perfil do Usuário & Contas (inovecloud1@gmail.com)', desc: 'Gerenciar credenciais, chaves SSH, 2FA e sessões', icon: <User className="w-4 h-4 text-indigo-400" /> },
    { id: 'vnc' as AppId, title: 'Conectar PC (VNC / RDP)', desc: 'Área de trabalho remota para PC e máquinas virtuais', icon: <Monitor className="w-4 h-4 text-cyan-400" /> },
    { id: 'vn' as AppId, title: 'Nós Virtuais (VN)', desc: 'Gerenciar Máquinas Virtuais Ubuntu, Windows e Debian', icon: <Server className="w-4 h-4 text-blue-400" /> },
    { id: 'webapps' as AppId, title: 'Aplicações Web & SSL', desc: 'Gerenciar domínios e HTTPS Let\'s Encrypt', icon: <Globe className="w-4 h-4 text-sky-400" /> },
    { id: 'idaas' as AppId, title: 'InoveCloud IDaaS', desc: 'Identidades corporativas, usuários e SSO', icon: <Users className="w-4 h-4 text-emerald-400" /> },
    { id: 'appstore' as AppId, title: 'App Store Hub', desc: 'Instalar Nextcloud, PostgreSQL, Portainer, Ollama', icon: <Layers className="w-4 h-4 text-purple-400" /> },
    { id: 'storage' as AppId, title: 'Cloud Storage & Photos', desc: 'Backup de fotos e buckets S3', icon: <HardDrive className="w-4 h-4 text-rose-400" /> },
    { id: 'terminal' as AppId, title: 'Terminal Cloud Shell', desc: 'Linha de comando Linux e inovectl', icon: <Terminal className="w-4 h-4 text-emerald-400" /> },
    { id: 'aiagent' as AppId, title: 'Agente IA (MCP)', desc: 'Gerenciar o sistema conversando com IA', icon: <Bot className="w-4 h-4 text-fuchsia-400" /> },
    { id: 'monitor' as AppId, title: 'Monitor de Desempenho', desc: 'Uso de CPU, RAM, disco e tráfego de rede', icon: <Activity className="w-4 h-4 text-cyan-400" /> },
    { id: 'projects' as AppId, title: 'Projetos & Workspace', desc: 'Portfólio visual e fila de outreach', icon: <FolderKanban className="w-4 h-4 text-amber-400" /> },
    { id: 'themes' as AppId, title: 'Temas & Papéis de Parede (Wallpapers)', desc: 'Personalizar papel de parede 4K, Vidro Líquido, cores de destaque e tema visual', icon: <Palette className="w-4 h-4 text-rose-400" /> },
    { id: 'settings' as AppId, title: 'Ajustes do Sistema', desc: 'Papéis de parede, aceleração GPU e rede', icon: <Settings className="w-4 h-4 text-slate-400" /> },
    { id: 'isobuilder' as AppId, title: 'Gerador de ISO & Live OS Linux', desc: 'Compilar ISO bootável Debian 13 (Trixie) com GNOME 46+ e Liquid Glass', icon: <Disc className="w-4 h-4 text-red-400" /> },
    { id: 'linuxpedia' as AppId, title: 'LinuxPedia (API & Comandos)', desc: 'Enciclopédia de comandos, flags e simulação de terminal', icon: <BookOpen className="w-4 h-4 text-emerald-400" /> },
  ];

  const filtered = items.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.desc.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-24 p-4 select-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-2xl liquid-glass shadow-2xl border border-white/25 overflow-hidden text-slate-100 flex flex-col"
      >
        {/* Search Bar */}
        <div className="p-3.5 border-b border-white/10 flex items-center space-x-3 bg-white/5 backdrop-blur-md">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar aplicativos, VNs, configurações..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-white focus:outline-none placeholder-slate-500 font-medium"
            autoFocus
          />
          <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-[10px] text-slate-400 font-mono">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length > 0 ? (
            filtered.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onOpenApp(item.id);
                  onClose();
                }}
                className="w-full p-2.5 rounded-xl hover:bg-blue-600/30 hover:border-blue-500/40 border border-transparent flex items-center justify-between text-left transition group cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-800/80 border border-white/10 flex items-center justify-center">
                    {item.icon}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-blue-200">
                      {item.title}
                    </div>
                    <div className="text-[11px] text-slate-400 line-clamp-1">{item.desc}</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition" />
              </button>
            ))
          ) : (
            <div className="p-6 text-center text-xs text-slate-500">
              Nenhum aplicativo ou comando correspondente.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
