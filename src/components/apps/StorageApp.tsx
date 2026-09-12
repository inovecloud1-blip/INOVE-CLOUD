import React, { useState, useRef } from 'react';
import {
  HardDrive,
  Image as ImageIcon,
  Folder,
  FolderPlus,
  FileArchive,
  FileText,
  FileCode,
  Upload,
  Download,
  CheckCircle,
  Clock,
  Sparkles,
  Smartphone,
  Server,
  Cloud,
  Laptop,
  Search,
  Filter,
  ArrowUpDown,
  Trash2,
  Share2,
  RefreshCw,
  ExternalLink,
  Plus,
  LayoutGrid,
  List as ListIcon,
  Tag,
  Eye,
  X,
  Check
} from 'lucide-react';
import { StorageItem } from '../../types';

interface StorageAppProps {
  photos: StorageItem[];
  files: StorageItem[];
  onUploadFile: (item: StorageItem) => void;
}

export const StorageApp: React.FC<StorageAppProps> = ({
  photos,
  files,
  onUploadFile,
}) => {
  // Current active source / provider filter
  const [sourceFilter, setSourceFilter] = useState<'all' | 'gdrive' | 'dropbox' | 'local' | 's3' | 'photos'>('all');
  const [viewLayout, setViewLayout] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'document' | 'backup' | 'iso' | 'photo' | 'code'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'size'>('date');
  const [currentFolder, setCurrentFolder] = useState<string>('root');
  
  // Modals & previews
  const [selectedItem, setSelectedItem] = useState<StorageItem | null>(null);
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [showConnectModal, setShowConnectModal] = useState<'gdrive' | 'dropbox' | 'local' | null>(null);
  
  // Connection states
  const [gdriveConnected, setGdriveConnected] = useState(true);
  const [dropboxConnected, setDropboxConnected] = useState(true);
  const [localPcConnected, setLocalPcConnected] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [aiOrganizedNotice, setAiOrganizedNotice] = useState<string | null>(null);

  // Hidden file input ref for real PC file selection
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Combined master files list
  const [customItems, setCustomItems] = useState<StorageItem[]>([
    {
      id: 'gd-1',
      name: 'Relatorio-Financeiro-Q3-InoveCloud.pdf',
      type: 'document',
      size: '3.4 MB',
      date: 'Hoje, 11:20',
      source: 'gdrive',
      folder: 'root',
      tags: ['Google Drive', 'Financeiro', 'PDF'],
      synced: true,
    },
    {
      id: 'gd-2',
      name: 'Apresentacao-Cluster-KVM-2026.gslides',
      type: 'document',
      size: '12.8 MB',
      date: 'Ontem, 16:45',
      source: 'gdrive',
      folder: 'root',
      tags: ['Google Drive', 'Comercial'],
      synced: true,
    },
    {
      id: 'db-1',
      name: 'Design-System-InoveCloud-OS-v2.fig',
      type: 'document',
      size: '48.2 MB',
      date: '09/09/2026',
      source: 'dropbox',
      folder: 'root',
      tags: ['Dropbox', 'UI/UX', 'Figma'],
      synced: true,
    },
    {
      id: 'db-2',
      name: 'Contratos-Clientes-Assinados.zip',
      type: 'archive',
      size: '18.6 MB',
      date: '08/09/2026',
      source: 'dropbox',
      folder: 'root',
      tags: ['Dropbox', 'Jurídico'],
      synced: true,
    },
    {
      id: 'pc-1',
      name: 'docker-compose-production-stack.yml',
      type: 'code',
      size: '24 KB',
      date: 'Hoje, 14:05',
      source: 'local',
      folder: 'root',
      tags: ['PC Local', 'Docker', 'DevOps'],
      synced: true,
    },
    {
      id: 'pc-2',
      name: 'id_rsa_inovecloud_deploy.pub',
      type: 'config',
      size: '4 KB',
      date: 'Hoje, 09:30',
      source: 'local',
      folder: 'root',
      tags: ['PC Local', 'SSH Key'],
      synced: true,
    },
  ]);

  // Combine initial props files + custom items with source tags
  const allFiles: StorageItem[] = [
    ...customItems,
    ...files.map((f) => ({
      ...f,
      source: (f.source || 's3') as StorageItem['source'],
      folder: f.folder || 'root',
      tags: f.tags || ['InoveCloud S3', f.type],
      synced: true,
    })),
    ...photos.map((p) => ({
      ...p,
      source: (p.source || 'photos') as StorageItem['source'],
      folder: p.folder || 'root',
      tags: p.tags || ['Galeria', 'Mídia'],
      synced: true,
    })),
  ];

  // Real File Upload from user PC
  const handleNativeFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    for (let i = 0; i < fileList.length; i++) {
      const f = fileList[i];
      const isImg = f.type.startsWith('image/');
      const sizeStr =
        f.size > 1024 * 1024
          ? `${(f.size / (1024 * 1024)).toFixed(1)} MB`
          : `${Math.round(f.size / 1024)} KB`;

      let previewUrl: string | undefined = undefined;
      if (isImg) {
        previewUrl = URL.createObjectURL(f);
      }

      const newItem: StorageItem = {
        id: `upload-${Date.now()}-${i}`,
        name: f.name,
        type: isImg ? 'photo' : f.name.endsWith('.iso') ? 'iso' : f.name.endsWith('.zip') || f.name.endsWith('.tar.gz') ? 'archive' : f.name.endsWith('.ts') || f.name.endsWith('.js') || f.name.endsWith('.yml') ? 'code' : 'document',
        size: sizeStr,
        date: 'Agora mesmo',
        source: 'local',
        folder: currentFolder,
        tags: ['PC Local', 'Sincronizado'],
        previewUrl,
        synced: true,
      };

      setCustomItems((prev) => [newItem, ...prev]);
      onUploadFile(newItem);
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Trigger sync animation
  const handleSyncAll = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setAiOrganizedNotice('Sincronização concluída! Google Drive, Dropbox e PC Local atualizados.');
      setTimeout(() => setAiOrganizedNotice(null), 4000);
    }, 1200);
  };

  // AI Organize Files Action
  const handleAiOrganize = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      // Auto-tag and organize items
      setCustomItems((prev) =>
        prev.map((item) => {
          const autoTags = [...(item.tags || [])];
          if (item.name.includes('pdf') || item.name.includes('doc')) {
            if (!autoTags.includes('Documento IA')) autoTags.push('Documento IA');
          } else if (item.name.includes('yml') || item.name.includes('sql')) {
            if (!autoTags.includes('Infraestrutura')) autoTags.push('Infraestrutura');
          } else {
            if (!autoTags.includes('Organizado')) autoTags.push('Organizado');
          }
          return { ...item, tags: autoTags };
        })
      );
      setAiOrganizedNotice('Inteligência Artificial organizou os arquivos por categoria e gerou tags contextuais.');
      setTimeout(() => setAiOrganizedNotice(null), 5000);
    }, 1000);
  };

  // Filter and sort items
  const filteredItems = allFiles.filter((item) => {
    // Source filter
    if (sourceFilter === 'gdrive' && item.source !== 'gdrive') return false;
    if (sourceFilter === 'dropbox' && item.source !== 'dropbox') return false;
    if (sourceFilter === 'local' && item.source !== 'local') return false;
    if (sourceFilter === 's3' && item.source !== 's3') return false;
    if (sourceFilter === 'photos' && item.type !== 'photo') return false;

    // Type filter
    if (typeFilter !== 'all' && item.type !== typeFilter) return false;

    // Search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = item.name.toLowerCase().includes(q);
      const matchTags = item.tags?.some((t) => t.toLowerCase().includes(q));
      if (!matchName && !matchTags) return false;
    }

    return true;
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'size') {
      const parseSize = (s: string) => {
        const num = parseFloat(s);
        if (s.includes('GB')) return num * 1024 * 1024;
        if (s.includes('MB')) return num * 1024;
        return num;
      };
      return parseSize(b.size) - parseSize(a.size);
    }
    return 0; // Default date order
  });

  // Source Counts
  const countGdrive = allFiles.filter((i) => i.source === 'gdrive').length;
  const countDropbox = allFiles.filter((i) => i.source === 'dropbox').length;
  const countLocal = allFiles.filter((i) => i.source === 'local').length;
  const countS3 = allFiles.filter((i) => i.source === 's3').length;

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 select-none">
      {/* Hidden file picker */}
      <input
        type="file"
        ref={fileInputRef}
        multiple
        className="hidden"
        onChange={handleNativeFileUpload}
      />

      {/* Top Glass Header Banner */}
      <div className="p-4 bg-gradient-to-r from-blue-950/50 via-indigo-950/40 to-slate-900 border-b border-white/10 flex flex-wrap items-center justify-between gap-4 liquid-glass">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 border border-blue-400/40 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <HardDrive className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-sm font-bold text-white tracking-wide">
                  InoveCloud Files & Multi-Cloud Connect
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Google Drive • Dropbox • PC Local • S3
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Central unificada de arquivos, sincronização bidirecional do computador e nuvem corporativa.
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2.5">
          <button
            onClick={handleSyncAll}
            disabled={isSyncing}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-white/10 text-xs font-semibold transition active:scale-95 cursor-pointer shadow-sm"
            title="Sincronizar todos os conectores agora"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar'}</span>
          </button>

          <button
            onClick={handleAiOrganize}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/40 text-purple-200 border border-purple-500/40 text-xs font-semibold shadow-md shadow-purple-600/20 transition active:scale-95 cursor-pointer"
            title="Organização Automática com Inteligência Artificial"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-300 animate-pulse" />
            <span>Organizar com IA</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition active:scale-95 cursor-pointer"
            title="Carregar arquivos do seu PC local"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload do PC</span>
          </button>
        </div>
      </div>

      {/* Cloud Connector Status Badges & Quick Switcher */}
      <div className="px-4 py-2.5 bg-slate-900/60 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Source Switcher Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto py-1">
          <button
            onClick={() => setSourceFilter('all')}
            className={`px-3 py-1.5 rounded-xl font-medium transition cursor-pointer flex items-center space-x-1.5 text-xs ${
              sourceFilter === 'all'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
                : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            <Folder className="w-3.5 h-3.5 text-blue-400" />
            <span>Todos ({allFiles.length})</span>
          </button>

          {/* Google Drive Tab */}
          <button
            onClick={() => setSourceFilter('gdrive')}
            className={`px-3 py-1.5 rounded-xl font-medium transition cursor-pointer flex items-center space-x-1.5 text-xs ${
              sourceFilter === 'gdrive'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30 font-semibold'
                : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            <Cloud className="w-3.5 h-3.5 text-amber-400" />
            <span>Google Drive ({countGdrive})</span>
            {gdriveConnected && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
          </button>

          {/* Dropbox Tab */}
          <button
            onClick={() => setSourceFilter('dropbox')}
            className={`px-3 py-1.5 rounded-xl font-medium transition cursor-pointer flex items-center space-x-1.5 text-xs ${
              sourceFilter === 'dropbox'
                ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30 font-semibold'
                : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            <Cloud className="w-3.5 h-3.5 text-sky-400" />
            <span>Dropbox ({countDropbox})</span>
            {dropboxConnected && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
          </button>

          {/* Local PC Tab */}
          <button
            onClick={() => setSourceFilter('local')}
            className={`px-3 py-1.5 rounded-xl font-medium transition cursor-pointer flex items-center space-x-1.5 text-xs ${
              sourceFilter === 'local'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 font-semibold'
                : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            <Laptop className="w-3.5 h-3.5 text-emerald-400" />
            <span>PC Local ({countLocal})</span>
            {localPcConnected && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
          </button>

          {/* S3 Storage Tab */}
          <button
            onClick={() => setSourceFilter('s3')}
            className={`px-3 py-1.5 rounded-xl font-medium transition cursor-pointer flex items-center space-x-1.5 text-xs ${
              sourceFilter === 's3'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30 font-semibold'
                : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            <Server className="w-3.5 h-3.5 text-rose-400" />
            <span>InoveCloud S3 ({countS3})</span>
          </button>

          {/* Photos Tab */}
          <button
            onClick={() => setSourceFilter('photos')}
            className={`px-3 py-1.5 rounded-xl font-medium transition cursor-pointer flex items-center space-x-1.5 text-xs ${
              sourceFilter === 'photos'
                ? 'bg-pink-600 text-white shadow-md shadow-pink-600/30 font-semibold'
                : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5 text-pink-400" />
            <span>Fotos & Mídia ({photos.length})</span>
          </button>
        </div>

        {/* Cloud Sync Status Pill */}
        <div className="hidden md:flex items-center space-x-3 text-[11px] text-slate-400">
          <div className="flex items-center space-x-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Conexões Ativas: <strong>Google Drive</strong>, <strong>Dropbox</strong> & <strong>PC Local</strong></span>
          </div>
          <button
            onClick={() => setShowConnectModal('gdrive')}
            className="text-cyan-400 hover:underline font-semibold"
          >
            Gerenciar Conexões
          </button>
        </div>
      </div>

      {/* AI Notification Banner */}
      {aiOrganizedNotice && (
        <div className="px-4 py-2 bg-gradient-to-r from-purple-950/80 to-indigo-950/80 border-b border-purple-500/30 text-purple-200 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-3.5 h-3.5 text-purple-300" />
            <span>{aiOrganizedNotice}</span>
          </div>
          <button
            onClick={() => setAiOrganizedNotice(null)}
            className="text-purple-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Secondary Filter & Search Sub-Bar */}
      <div className="px-4 py-2.5 bg-slate-900/40 border-b border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2 flex-1 max-w-sm">
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar arquivos, pastas ou tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-950/60 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-blue-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="px-2.5 py-1.5 rounded-xl bg-slate-950/60 border border-white/10 text-slate-300 text-xs focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="all">Todos os tipos</option>
            <option value="document">Documentos</option>
            <option value="backup">Backups</option>
            <option value="iso">ISOs de SO</option>
            <option value="photo">Imagens</option>
            <option value="code">Código & Scripts</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-2.5 py-1.5 rounded-xl bg-slate-950/60 border border-white/10 text-slate-300 text-xs focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="date">Mais recentes</option>
            <option value="name">Nome (A-Z)</option>
            <option value="size">Maior tamanho</option>
          </select>

          {/* View Toggle (Grid / List) */}
          <div className="flex items-center rounded-xl bg-slate-950/60 border border-white/10 p-0.5">
            <button
              onClick={() => setViewLayout('grid')}
              className={`p-1.5 rounded-lg transition ${
                viewLayout === 'grid' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
              title="Exibição em Grade"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewLayout('list')}
              className={`p-1.5 rounded-lg transition ${
                viewLayout === 'list' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
              title="Exibição em Lista Detalhada"
            >
              <ListIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Files Display Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-slate-950/90">
        {sortedItems.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
            <Folder className="w-12 h-12 text-slate-600 mb-3" />
            <h3 className="text-sm font-semibold text-slate-300">Nenhum arquivo encontrado</h3>
            <p className="text-xs text-slate-500 max-w-sm mt-1">
              {searchQuery
                ? `Nenhum resultado corresponde à busca "${searchQuery}". Tente limpar os filtros.`
                : 'Faça upload de arquivos do seu computador ou conecte suas contas do Google Drive e Dropbox.'}
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="mt-4 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold cursor-pointer shadow-lg shadow-blue-600/30"
            >
              Carregar Arquivos do PC
            </button>
          </div>
        ) : viewLayout === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
            {sortedItems.map((item) => {
              const isPhoto = item.type === 'photo' && item.previewUrl;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className="group relative rounded-2xl liquid-glass-card p-3 flex flex-col justify-between cursor-pointer border border-white/10 hover:border-blue-500/50 transition-all duration-200"
                >
                  {/* File preview icon or photo */}
                  <div className="aspect-[4/3] rounded-xl bg-slate-900/80 border border-white/5 flex items-center justify-center overflow-hidden mb-2.5 relative">
                    {isPhoto ? (
                      <img
                        src={item.previewUrl}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    ) : item.type === 'backup' ? (
                      <FileArchive className="w-10 h-10 text-rose-400" />
                    ) : item.type === 'iso' ? (
                      <Server className="w-10 h-10 text-indigo-400" />
                    ) : item.type === 'code' ? (
                      <FileCode className="w-10 h-10 text-emerald-400" />
                    ) : (
                      <FileText className="w-10 h-10 text-blue-400" />
                    )}

                    {/* Source pill badge */}
                    <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-sm text-[9px] font-bold text-white uppercase tracking-wider flex items-center space-x-1">
                      {item.source === 'gdrive' ? (
                        <span className="text-amber-300">Drive</span>
                      ) : item.source === 'dropbox' ? (
                        <span className="text-sky-300">Dropbox</span>
                      ) : item.source === 'local' ? (
                        <span className="text-emerald-300">PC Local</span>
                      ) : (
                        <span className="text-rose-300">S3</span>
                      )}
                    </div>
                  </div>

                  {/* Title & Info */}
                  <div className="space-y-1">
                    <div className="text-xs font-semibold text-white truncate" title={item.name}>
                      {item.name}
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>{item.size}</span>
                      <span>{item.date}</span>
                    </div>

                    {/* Tags */}
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {item.tags.slice(0, 2).map((t, idx) => (
                          <span
                            key={idx}
                            className="px-1.5 py-0.2 rounded bg-white/5 text-slate-300 text-[9px] font-medium"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* List Table View */
          <div className="rounded-2xl liquid-glass border border-white/10 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 border-b border-white/10 text-slate-400 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3">Nome</th>
                  <th className="p-3">Origem</th>
                  <th className="p-3">Tipo</th>
                  <th className="p-3">Tamanho</th>
                  <th className="p-3">Modificado</th>
                  <th className="p-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {sortedItems.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className="hover:bg-white/5 cursor-pointer transition"
                  >
                    <td className="p-3 flex items-center space-x-2.5 text-white font-medium">
                      {item.type === 'photo' ? (
                        <ImageIcon className="w-4 h-4 text-pink-400 shrink-0" />
                      ) : item.type === 'backup' ? (
                        <FileArchive className="w-4 h-4 text-rose-400 shrink-0" />
                      ) : item.type === 'code' ? (
                        <FileCode className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <FileText className="w-4 h-4 text-blue-400 shrink-0" />
                      )}
                      <span className="truncate max-w-xs">{item.name}</span>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/5 text-slate-300">
                        {item.source === 'gdrive'
                          ? 'Google Drive'
                          : item.source === 'dropbox'
                          ? 'Dropbox'
                          : item.source === 'local'
                          ? 'PC Local'
                          : 'InoveCloud S3'}
                      </span>
                    </td>
                    <td className="p-3 uppercase text-[10px] font-mono text-slate-400">
                      {item.type}
                    </td>
                    <td className="p-3 font-mono text-slate-300">{item.size}</td>
                    <td className="p-3 text-slate-400">{item.date}</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedItem(item);
                        }}
                        className="p-1 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 transition cursor-pointer"
                        title="Abrir detalhes"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Item Detail / Preview Modal */}
      {selectedItem && (
        <div
          onClick={() => setSelectedItem(null)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl rounded-3xl liquid-glass border border-white/20 p-6 text-white shadow-2xl space-y-4 cursor-default"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
                  {selectedItem.type === 'photo' ? (
                    <ImageIcon className="w-5 h-5" />
                  ) : selectedItem.type === 'backup' ? (
                    <FileArchive className="w-5 h-5" />
                  ) : (
                    <FileText className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">{selectedItem.name}</h3>
                  <p className="text-xs text-slate-400">
                    Origem: {selectedItem.source?.toUpperCase()} • {selectedItem.size} • {selectedItem.date}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedItem(null)}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Photo preview or file metadata */}
            {selectedItem.previewUrl ? (
              <div className="rounded-2xl overflow-hidden aspect-video bg-black/50 border border-white/10">
                <img
                  src={selectedItem.previewUrl}
                  alt={selectedItem.name}
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2 text-xs font-mono">
                <div className="text-slate-400">Tipo de Conteúdo: <span className="text-white">{selectedItem.type}</span></div>
                <div className="text-slate-400">Criptografia: <span className="text-emerald-400">AES-256 (InoveCloud Zero-Knowledge)</span></div>
                <div className="text-slate-400">Sincronizado: <span className="text-emerald-400">Sim (Checksum SHA256 Válido)</span></div>
                {selectedItem.tags && (
                  <div className="text-slate-400">Tags IA: <span className="text-purple-300">{selectedItem.tags.join(', ')}</span></div>
                )}
              </div>
            )}

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-white/10">
              <button
                onClick={() => {
                  alert(`Iniciando download seguro de: ${selectedItem.name}`);
                }}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Baixar Arquivo</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cloud Connectors Management Modal */}
      {showConnectModal && (
        <div
          onClick={() => setShowConnectModal(null)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg rounded-3xl liquid-glass border border-white/20 p-6 text-white shadow-2xl space-y-5 cursor-default"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center space-x-2">
                <Cloud className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-sm text-white">Conectores de Nuvem & Arquivos PC</h3>
              </div>
              <button
                onClick={() => setShowConnectModal(null)}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {/* Google Drive Card */}
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
                    <Cloud className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-white">Google Drive</div>
                    <div className="text-slate-400 text-[11px]">
                      {gdriveConnected ? 'Conectado (inovecloud1@gmail.com) • 15.2 GB / 100 GB' : 'Desconectado'}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setGdriveConnected(!gdriveConnected)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer text-xs ${
                    gdriveConnected
                      ? 'bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30'
                      : 'bg-amber-600 text-white hover:bg-amber-500'
                  }`}
                >
                  {gdriveConnected ? 'Desconectar' : 'Conectar'}
                </button>
              </div>

              {/* Dropbox Card */}
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-400">
                    <Cloud className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-white">Dropbox</div>
                    <div className="text-slate-400 text-[11px]">
                      {dropboxConnected ? 'Conectado • 2.4 GB / 5 GB usado' : 'Desconectado'}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setDropboxConnected(!dropboxConnected)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer text-xs ${
                    dropboxConnected
                      ? 'bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30'
                      : 'bg-sky-600 text-white hover:bg-sky-500'
                  }`}
                >
                  {dropboxConnected ? 'Desconectar' : 'Conectar'}
                </button>
              </div>

              {/* Local PC Sync Card */}
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
                    <Laptop className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-white">Pasta Sincronizada do PC</div>
                    <div className="text-slate-400 text-[11px]">
                      {localPcConnected ? 'Agente Local Ativo (Pasta: InoveCloud-Sync)' : 'Desconectado'}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setLocalPcConnected(!localPcConnected)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer text-xs ${
                    localPcConnected
                      ? 'bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30'
                      : 'bg-emerald-600 text-white hover:bg-emerald-500'
                  }`}
                >
                  {localPcConnected ? 'Pausar Sync' : 'Ativar Sync'}
                </button>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowConnectModal(null)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
              >
                Salvar Configurações
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
