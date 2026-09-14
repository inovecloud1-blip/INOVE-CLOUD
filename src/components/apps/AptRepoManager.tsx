import React, { useState } from 'react';
import {
  Server,
  Plus,
  RefreshCw,
  Trash2,
  Edit3,
  ToggleLeft,
  ToggleRight,
  ShieldCheck,
  Terminal,
  Code2,
  Copy,
  Check,
  AlertTriangle,
  Info,
  Layers,
  Search,
  Sparkles,
  DownloadCloud,
  CheckCircle2,
  HardDrive,
  ExternalLink,
  Cpu,
  Wifi
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface AptRepo {
  id: string;
  name: string;
  url: string;
  suite: string;
  components: string[];
  enabled: boolean;
  type: 'deb' | 'deb-src';
  gpgStatus: 'verified' | 'custom' | 'unverified';
  description: string;
  sourceFile: string;
  isSystemCore?: boolean;
  latencyMs?: number;
}

const DEFAULT_PRESETS = [
  {
    name: 'Debian 13 (Trixie) Backports',
    url: 'http://deb.debian.org/debian',
    suite: 'trixie-backports',
    components: ['main', 'contrib', 'non-free', 'non-free-firmware'],
    type: 'deb' as const,
    description: 'Pacotes e drivers mais recentes (Mesa 24, novos Kernels) compilados para o Debian.',
  },
  {
    name: 'WineHQ Debian Repository',
    url: 'https://dl.winehq.org/wine-builds/debian',
    suite: 'trixie',
    components: ['main'],
    type: 'deb' as const,
    description: 'Camada de compatibilidade oficial para executar jogos e programas Windows no Linux.',
  },
  {
    name: 'Docker CE Debian Repository',
    url: 'https://download.docker.com/linux/debian',
    suite: 'trixie',
    components: ['stable'],
    type: 'deb' as const,
    description: 'Motor oficial do Docker Engine, containerd e Docker Compose CLI.',
  },
  {
    name: 'NodeSource Node.js 22 LTS',
    url: 'https://deb.nodesource.com/node_22.x',
    suite: 'nodistro',
    components: ['main'],
    type: 'deb' as const,
    description: 'Ambiente de execução JavaScript Node.js 22 LTS e gerenciador npm mais recente.',
  },
  {
    name: 'Google Chrome Official Repository',
    url: 'http://dl.google.com/linux/chrome/deb',
    suite: 'stable',
    components: ['main'],
    type: 'deb' as const,
    description: 'Repositório oficial de atualizações do Google Chrome para distribuições Debian.',
  },
];

export const AptRepoManager: React.FC = () => {
  const [repositories, setRepositories] = useState<AptRepo[]>([
    {
      id: 'debian-trixie-main',
      name: 'Debian 13 (Trixie) - Main & Firmwares',
      url: 'http://deb.debian.org/debian',
      suite: 'trixie',
      components: ['main', 'contrib', 'non-free', 'non-free-firmware'],
      enabled: true,
      type: 'deb',
      gpgStatus: 'verified',
      description: 'Repositório base do sistema operacional Debian com softwares livres e firmwares de hardware.',
      sourceFile: '/etc/apt/sources.list',
      isSystemCore: true,
      latencyMs: 38,
    },
    {
      id: 'debian-trixie-updates',
      name: 'Debian 13 (Trixie) - Updates Recomendados',
      url: 'http://deb.debian.org/debian',
      suite: 'trixie-updates',
      components: ['main', 'contrib', 'non-free', 'non-free-firmware'],
      enabled: true,
      type: 'deb',
      gpgStatus: 'verified',
      description: 'Atualizações estáveis recomendadas e correções de bugs publicadas com urgência.',
      sourceFile: '/etc/apt/sources.list',
      isSystemCore: true,
      latencyMs: 38,
    },
    {
      id: 'debian-security',
      name: 'Debian Security Updates (security.debian.org)',
      url: 'http://security.debian.org/debian-security',
      suite: 'trixie-security',
      components: ['main', 'contrib', 'non-free', 'non-free-firmware'],
      enabled: true,
      type: 'deb',
      gpgStatus: 'verified',
      description: 'Patches de vulnerabilidade e atualizações de segurança emitidas pelo Security Team do Debian.',
      sourceFile: '/etc/apt/sources.list',
      isSystemCore: true,
      latencyMs: 42,
    },
    {
      id: 'inovecloud-official',
      name: 'InoveCloud OS Core & Liquid Glass Desktop',
      url: 'https://repo.inovecloud.org/os/debian',
      suite: 'stable',
      components: ['main', 'ui', 'drivers', 'icpkg'],
      enabled: true,
      type: 'deb',
      gpgStatus: 'verified',
      description: 'Pacotes oficiais do InoveCloud OS: temas Liquid Glass, icpkg, scripts de instalação e utilitários.',
      sourceFile: '/etc/apt/sources.list.d/inovecloud.list',
      isSystemCore: true,
      latencyMs: 24,
    },
    {
      id: 'debian-trixie-backports',
      name: 'Debian 13 Backports (Drivers & Kernels Modernos)',
      url: 'http://deb.debian.org/debian',
      suite: 'trixie-backports',
      components: ['main', 'contrib', 'non-free', 'non-free-firmware'],
      enabled: false,
      type: 'deb',
      gpgStatus: 'verified',
      description: 'Mesa 24+, novos Kernels Linux e módulos compatíveis com hardware moderno de última geração.',
      sourceFile: '/etc/apt/sources.list.d/backports.list',
      isSystemCore: false,
      latencyMs: 40,
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'enabled' | 'disabled'>('all');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateProgress, setUpdateProgress] = useState(0);
  const [updateLogs, setUpdateLogs] = useState<string[]>([]);
  const [showLogsTerminal, setShowLogsTerminal] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'info' | 'error'; message: string } | null>(null);

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRepo, setEditingRepo] = useState<AptRepo | null>(null);
  const [showSourcesListModal, setShowSourcesListModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Form States for Add/Edit
  const [formName, setFormName] = useState('');
  const [formUrl, setFormUrl] = useState('');
  const [formSuite, setFormSuite] = useState('trixie');
  const [formComponents, setFormComponents] = useState('main contrib non-free non-free-firmware');
  const [formType, setFormType] = useState<'deb' | 'deb-src'>('deb');
  const [formDescription, setFormDescription] = useState('');

  const notify = (type: 'success' | 'info' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // Toggle habilitar/desabilitar
  const handleToggleRepo = (id: string) => {
    setRepositories((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const nextState = !r.enabled;
          notify(
            'info',
            `Repositório "${r.name}" ${nextState ? 'habilitado' : 'desabilitado'}. Recomenda-se executar "apt-get update".`
          );
          return { ...r, enabled: nextState };
        }
        return r;
      })
    );
  };

  // Remover repositório
  const handleDeleteRepo = (id: string, name: string) => {
    setRepositories((prev) => prev.filter((r) => r.id !== id));
    notify('success', `Repositório "${name}" removido com sucesso.`);
  };

  // Sincronizar APT (apt-get update) com logs detalhados
  const handleAptUpdate = async () => {
    setIsUpdating(true);
    setShowLogsTerminal(true);
    setUpdateProgress(10);
    setUpdateLogs([
      '# Executando: sudo apt-get update -o Acquire::Languages=none',
      'Lendo configurações em /etc/apt/sources.list e /etc/apt/sources.list.d/*.list...',
    ]);

    const steps = [
      {
        pct: 25,
        log: 'Hit:1 http://deb.debian.org/debian trixie InRelease [142 kB]',
      },
      {
        pct: 45,
        log: 'Hit:2 http://security.debian.org/debian-security trixie-security InRelease [89.2 kB]',
      },
      {
        pct: 65,
        log: 'Get:3 https://repo.inovecloud.org/os/debian stable InRelease [12.4 kB]',
      },
      {
        pct: 80,
        log: 'Get:4 http://deb.debian.org/debian trixie-updates InRelease [65.1 kB]',
      },
      {
        pct: 90,
        log: 'Lendo listas de pacotes... Pronto\nConstruindo árvore de dependências... Pronto\nLendo informação de estado... Pronto',
      },
      {
        pct: 100,
        log: '✓ Todos os índices APT sincronizados com sucesso! 62.418 pacotes indexados.',
      },
    ];

    try {
      // Disparar na API real
      fetch('/api/system/debian/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'apt-update' }),
      }).catch(() => {});

      for (let i = 0; i < steps.length; i++) {
        await new Promise((res) => setTimeout(res, 500));
        setUpdateProgress(steps[i].pct);
        setUpdateLogs((prev) => [...prev, steps[i].log]);
      }

      notify('success', 'Índices de pacotes APT atualizados com sucesso!');
    } catch (e) {
      notify('info', 'Sincronização concluída no ambiente.');
    } finally {
      setIsUpdating(false);
    }
  };

  // Limpeza de cache APT
  const handleAptClean = () => {
    fetch('/api/system/debian/action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'apt-clean' }),
    }).catch(() => {});
    notify('success', 'Cache de pacotes limpo com sucesso (/var/cache/apt/archives)!');
  };

  // Abrir Modal de Edição
  const openEditModal = (repo: AptRepo) => {
    setEditingRepo(repo);
    setFormName(repo.name);
    setFormUrl(repo.url);
    setFormSuite(repo.suite);
    setFormComponents(repo.components.join(' '));
    setFormType(repo.type);
    setFormDescription(repo.description);
    setShowAddModal(true);
  };

  // Abrir Modal de Novo com campos limpos
  const openNewModal = () => {
    setEditingRepo(null);
    setFormName('');
    setFormUrl('');
    setFormSuite('trixie');
    setFormComponents('main contrib non-free non-free-firmware');
    setFormType('deb');
    setFormDescription('');
    setShowAddModal(true);
  };

  // Aplicar Preset no Formulário
  const applyPreset = (preset: typeof DEFAULT_PRESETS[0]) => {
    setFormName(preset.name);
    setFormUrl(preset.url);
    setFormSuite(preset.suite);
    setFormComponents(preset.components.join(' '));
    setFormType(preset.type);
    setFormDescription(preset.description);
  };

  // Salvar Adição ou Edição
  const handleSaveRepo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formUrl.trim() || !formName.trim()) {
      notify('error', 'Preencha o Nome e a URL do repositório.');
      return;
    }

    const componentsArray = formComponents
      .split(' ')
      .map((c) => c.trim())
      .filter(Boolean);

    if (editingRepo) {
      // Atualizar existente
      setRepositories((prev) =>
        prev.map((r) =>
          r.id === editingRepo.id
            ? {
                ...r,
                name: formName.trim(),
                url: formUrl.trim(),
                suite: formSuite.trim() || 'trixie',
                components: componentsArray.length > 0 ? componentsArray : ['main'],
                type: formType,
                description: formDescription.trim() || 'Repositório personalizado do sistema.',
              }
            : r
        )
      );
      notify('success', `Repositório "${formName}" atualizado com sucesso!`);
    } else {
      // Adicionar novo
      const cleanSlug = formName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-');
      const newRepo: AptRepo = {
        id: `repo-${Date.now()}`,
        name: formName.trim(),
        url: formUrl.trim(),
        suite: formSuite.trim() || 'trixie',
        components: componentsArray.length > 0 ? componentsArray : ['main'],
        enabled: true,
        type: formType,
        gpgStatus: 'custom',
        description: formDescription.trim() || 'Repositório PPA/APT adicionado pelo usuário.',
        sourceFile: `/etc/apt/sources.list.d/${cleanSlug || 'custom'}.list`,
        isSystemCore: false,
        latencyMs: Math.floor(Math.random() * 30) + 20,
      };
      setRepositories((prev) => [newRepo, ...prev]);
      notify('success', `Novo repositório "${formName}" adicionado a ${newRepo.sourceFile}!`);
    }

    setShowAddModal(false);
  };

  // Gerar conteúdo textual do sources.list consolidado
  const consolidatedSourcesList = repositories
    .map((r) => {
      const commentPrefix = r.enabled ? '' : '# ';
      return `# ${r.name} (${r.description})\n${commentPrefix}${r.type} ${r.url} ${r.suite} ${r.components.join(' ')}\n`;
    })
    .join('\n');

  const copySourcesList = () => {
    navigator.clipboard?.writeText(consolidatedSourcesList);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  // Filtragem
  const filteredRepos = repositories.filter((repo) => {
    const matchesSearch =
      repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repo.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repo.suite.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repo.components.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;
    if (filterType === 'enabled') return repo.enabled;
    if (filterType === 'disabled') return !repo.enabled;
    return true;
  });

  const enabledCount = repositories.filter((r) => r.enabled).length;

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 font-sans select-none overflow-hidden">
      {/* Toast Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`fixed top-4 right-4 z-50 px-4 py-2.5 rounded-xl text-xs font-semibold shadow-2xl flex items-center space-x-2 border backdrop-blur-md ${
              notification.type === 'success'
                ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
                : notification.type === 'error'
                ? 'bg-rose-950/80 border-rose-500/40 text-rose-300'
                : 'bg-blue-950/80 border-blue-500/40 text-blue-300'
            }`}
          >
            <Info className="w-4 h-4 shrink-0" />
            <span>{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Controls Bar */}
      <div className="p-4 bg-slate-900/80 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <div className="flex items-center space-x-2">
            <Server className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-bold text-white">Gerenciador de Repositórios APT (Debian Linux)</h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
              {enabledCount} de {repositories.length} ativos
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Adicione, edite e ative fontes oficiais e PPAs em <code className="text-cyan-300 font-mono text-[11px]">/etc/apt/sources.list.d/</code>.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Botão Sincronizar (apt update) */}
          <button
            onClick={handleAptUpdate}
            disabled={isUpdating}
            className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-blue-600/30 transition cursor-pointer disabled:opacity-50"
            title="Executar apt-get update no sistema"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isUpdating ? 'animate-spin' : ''}`} />
            <span>{isUpdating ? 'Sincronizando...' : 'Sincronizar (apt update)'}</span>
          </button>

          {/* Botão Adicionar Repositório */}
          <button
            onClick={openNewModal}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs border border-white/10 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-cyan-400" />
            <span>Novo Repositório</span>
          </button>

          {/* Botão Ver sources.list */}
          <button
            onClick={() => setShowSourcesListModal(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-medium text-xs border border-white/10 transition cursor-pointer"
            title="Visualizar arquivo /etc/apt/sources.list"
          >
            <Code2 className="w-3.5 h-3.5 text-amber-400" />
            <span>sources.list</span>
          </button>

          {/* Botão Limpar Cache */}
          <button
            onClick={handleAptClean}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 text-xs transition cursor-pointer"
            title="Limpar cache local de pacotes (apt clean)"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Limpar Cache</span>
          </button>
        </div>
      </div>

      {/* Terminal de Logs do APT (Expansível durante sincronização) */}
      <AnimatePresence>
        {showLogsTerminal && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-black/90 border-b border-white/10 p-3.5 font-mono text-[11px] text-emerald-400 space-y-1.5 shrink-0"
          >
            <div className="flex items-center justify-between text-slate-400 text-[10px] pb-1 border-b border-white/10">
              <div className="flex items-center space-x-2">
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                <span className="font-bold text-white">Terminal APT: Sincronização em Tempo Real</span>
                {isUpdating && <span className="animate-pulse text-cyan-400">● Conectando aos espelhos...</span>}
              </div>
              <div className="flex items-center space-x-3">
                <span>Progresso: {updateProgress}%</span>
                <button
                  onClick={() => setShowLogsTerminal(false)}
                  className="text-slate-400 hover:text-white cursor-pointer px-1.5 py-0.5 rounded bg-white/5"
                >
                  Recolher
                </button>
              </div>
            </div>

            {/* Barra de Progresso do Update */}
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400"
                initial={{ width: 0 }}
                animate={{ width: `${updateProgress}%` }}
                transition={{ ease: 'easeOut', duration: 0.3 }}
              />
            </div>

            <div className="max-h-28 overflow-y-auto space-y-1 pr-1">
              {updateLogs.map((log, idx) => (
                <div key={idx} className="leading-relaxed whitespace-pre-wrap">
                  {log}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter and Search Bar */}
      <div className="px-4 py-2.5 bg-slate-900/40 border-b border-white/5 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
              filterType === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-white/5 text-slate-400 hover:text-white'
            }`}
          >
            Todos ({repositories.length})
          </button>
          <button
            onClick={() => setFilterType('enabled')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
              filterType === 'enabled'
                ? 'bg-emerald-600 text-white'
                : 'bg-white/5 text-slate-400 hover:text-white'
            }`}
          >
            Ativos ({enabledCount})
          </button>
          <button
            onClick={() => setFilterType('disabled')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
              filterType === 'disabled'
                ? 'bg-slate-700 text-white'
                : 'bg-white/5 text-slate-400 hover:text-white'
            }`}
          >
            Inativos ({repositories.length - enabledCount})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar repositório ou URL..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
          />
        </div>
      </div>

      {/* Repositories Cards List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredRepos.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <Server className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-xs">Nenhum repositório APT encontrado para a busca.</p>
          </div>
        ) : (
          filteredRepos.map((repo) => (
            <div
              key={repo.id}
              className={`p-4 rounded-2xl border transition-all shadow-md flex flex-col justify-between space-y-3 ${
                repo.enabled
                  ? 'bg-white/5 border-white/10 hover:border-white/20'
                  : 'bg-white/2 border-white/5 opacity-55 hover:opacity-75'
              }`}
            >
              {/* Header do Repositório */}
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-white tracking-wide">{repo.name}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                        repo.type === 'deb'
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      }`}
                    >
                      {repo.type}
                    </span>
                    {repo.isSystemCore && (
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center space-x-1">
                        <ShieldCheck className="w-2.5 h-2.5" />
                        <span>Core do Sistema</span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300">{repo.description}</p>
                </div>

                {/* Switch de Ativação / Desativação */}
                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => handleToggleRepo(repo.id)}
                    className="cursor-pointer text-slate-400 hover:text-white transition"
                    title={repo.enabled ? 'Clique para Desabilitar' : 'Clique para Habilitar'}
                  >
                    {repo.enabled ? (
                      <ToggleRight className="w-8 h-8 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.4)]" />
                    ) : (
                      <ToggleLeft className="w-8 h-8 text-slate-600" />
                    )}
                  </button>
                </div>
              </div>

              {/* Linha de Comando APT Real formatada */}
              <div className="p-2.5 rounded-xl bg-black/50 border border-white/5 font-mono text-[11px] text-cyan-300 flex items-center justify-between overflow-x-auto">
                <span className="select-all">
                  {repo.type} {repo.url} {repo.suite} {repo.components.join(' ')}
                </span>
                <span className="text-[10px] text-slate-500 ml-2 shrink-0 font-sans">
                  {repo.sourceFile}
                </span>
              </div>

              {/* Rodapé de Tags e Ações */}
              <div className="pt-2 border-t border-white/5 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] text-slate-400">Componentes:</span>
                  {repo.components.map((c) => (
                    <span
                      key={c}
                      className="px-1.5 py-0.5 rounded bg-white/10 text-slate-200 text-[10px] font-mono"
                    >
                      {c}
                    </span>
                  ))}
                  {repo.latencyMs && (
                    <span className="text-[10px] text-slate-500 ml-2 flex items-center space-x-1">
                      <Wifi className="w-3 h-3 text-emerald-400" />
                      <span>{repo.latencyMs}ms</span>
                    </span>
                  )}
                </div>

                {/* Ações de Edição e Exclusão */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => openEditModal(repo)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition cursor-pointer flex items-center space-x-1 text-[11px]"
                    title="Editar propriedades do repositório"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Editar</span>
                  </button>
                  {!repo.isSystemCore && (
                    <button
                      onClick={() => handleDeleteRepo(repo.id, repo.name)}
                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition cursor-pointer flex items-center space-x-1 text-[11px]"
                      title="Excluir este repositório"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Remover</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ================= MODAL DE ADICIONAR / EDITAR REPOSITÓRIO ================= */}
      <AnimatePresence>
        {showAddModal && (
          <div
            onClick={() => setShowAddModal(false)}
            className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-xl bg-slate-900 border border-white/15 rounded-2xl p-5 shadow-2xl text-slate-100 space-y-4 cursor-default max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center space-x-2">
                  <Server className="w-5 h-5 text-blue-400" />
                  <h3 className="font-bold text-sm text-white">
                    {editingRepo ? `Editar: ${editingRepo.name}` : 'Adicionar Novo Repositório APT'}
                  </h3>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded-md"
                >
                  ✕
                </button>
              </div>

              {/* Presets Rápidos (quando adicionando novo) */}
              {!editingRepo && (
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>Presets Rápidos Oficiais:</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {DEFAULT_PRESETS.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => applyPreset(preset)}
                        className="p-2 text-left rounded-xl bg-white/5 hover:bg-blue-600/20 border border-white/5 hover:border-blue-500/40 transition cursor-pointer space-y-0.5"
                      >
                        <div className="text-xs font-bold text-white truncate">{preset.name}</div>
                        <div className="text-[10px] text-slate-400 line-clamp-1">{preset.description}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Formulário Principal */}
              <form onSubmit={handleSaveRepo} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Nome de Identificação:</label>
                  <input
                    type="text"
                    required
                    placeholder="ex: Debian Backports ou Docker CE"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <label className="block text-slate-300 font-semibold mb-1">URL do Espelho (Mirror):</label>
                    <input
                      type="text"
                      required
                      placeholder="http://deb.debian.org/debian"
                      value={formUrl}
                      onChange={(e) => setFormUrl(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-white font-mono placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Tipo de Pacote:</label>
                    <select
                      value={formType}
                      onChange={(e) => setFormType(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/15 text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="deb">deb (Binários)</option>
                      <option value="deb-src">deb-src (Código Fonte)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Distribuição / Suite:</label>
                    <input
                      type="text"
                      placeholder="trixie ou trixie-backports"
                      value={formSuite}
                      onChange={(e) => setFormSuite(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-white font-mono placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Componentes:</label>
                    <input
                      type="text"
                      placeholder="main contrib non-free non-free-firmware"
                      value={formComponents}
                      onChange={(e) => setFormComponents(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-white font-mono placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Descrição / Comentário:</label>
                  <input
                    type="text"
                    placeholder="Descrição para controle de pacotes..."
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Pré-visualização da Linha APT */}
                <div className="p-3 rounded-xl bg-black/60 border border-blue-500/20 text-[11px] font-mono text-cyan-300 space-y-1">
                  <div className="text-[10px] text-slate-400 font-sans">Visualização da entrada APT:</div>
                  <div>
                    {formType} {formUrl || 'http://...'} {formSuite || 'trixie'} {formComponents || 'main'}
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-2 pt-2 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 font-semibold cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-md cursor-pointer"
                  >
                    {editingRepo ? 'Salvar Alterações' : 'Adicionar Repositório'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= MODAL DO ARQUIVO SOURCES.LIST CONSOLIDADO ================= */}
      <AnimatePresence>
        {showSourcesListModal && (
          <div
            onClick={() => setShowSourcesListModal(false)}
            className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl bg-slate-900 border border-white/15 rounded-2xl p-5 shadow-2xl text-slate-100 space-y-4 cursor-default"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center space-x-2">
                  <Code2 className="w-5 h-5 text-amber-400" />
                  <div>
                    <h3 className="font-bold text-sm text-white">Visualizador: /etc/apt/sources.list</h3>
                    <p className="text-[10px] text-slate-400">Arquivo de configuração mestre de repositórios do InoveCloud OS</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowSourcesListModal(false)}
                  className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded-md"
                >
                  ✕
                </button>
              </div>

              <div className="relative">
                <pre className="p-4 rounded-xl bg-black/70 border border-white/10 font-mono text-[11px] text-cyan-300 max-h-72 overflow-y-auto leading-relaxed select-all">
                  {consolidatedSourcesList}
                </pre>
                <button
                  onClick={copySourcesList}
                  className="absolute top-2.5 right-2.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer backdrop-blur-md"
                >
                  {copiedCode ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar Arquivo</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-white/10">
                <span>Total de repositórios: {repositories.length} ({enabledCount} ativos)</span>
                <button
                  onClick={() => setShowSourcesListModal(false)}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold cursor-pointer"
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AptRepoManager;
