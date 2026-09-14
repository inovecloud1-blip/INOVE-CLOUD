import React, { useState, useRef } from 'react';
import {
  Folder,
  ChevronLeft,
  ChevronRight,
  Search,
  LayoutGrid,
  List as ListIcon,
  HardDrive,
  Download,
  Upload,
  Cloud,
  Laptop,
  Trash2,
  Share2,
  FolderPlus,
  FileText,
  FileCode,
  FileArchive,
  Image as ImageIcon,
  Sparkles,
  CheckCircle,
  Eye,
  X,
  Sliders,
  Maximize2,
  Edit3,
  Save,
  Plus,
  Play,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Sun,
  Moon,
  Check,
  Copy,
  Terminal,
  ExternalLink,
  Info,
  Disc,
  Layers,
  ArrowUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { StorageItem } from '../../types';

interface StorageAppProps {
  photos?: StorageItem[];
  files?: StorageItem[];
  onUploadFile?: (item: StorageItem) => void;
}

export const StorageApp: React.FC<StorageAppProps> = ({
  photos = [],
  files = [],
  onUploadFile,
}) => {
  // Navigation and active folder
  const [activeSidebar, setActiveSidebar] = useState<string>('downloads');
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [history, setHistory] = useState<(string | null)[]>([null]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const [viewLayout, setViewLayout] = useState<'grid' | 'list'>('grid');
  const [iconSize, setIconSize] = useState<number>(76); // Zoom slider
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<StorageItem | null>(null);

  // Modals
  const [editingItem, setEditingItem] = useState<StorageItem | null>(null);
  const [editorContent, setEditorContent] = useState<string>('');
  const [editorFilename, setEditorFilename] = useState<string>('');
  const [showNewFileModal, setShowNewFileModal] = useState(false);
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [newFileType, setNewFileType] = useState<'document' | 'code' | 'folder'>('document');
  const [newFolderName, setNewFolderName] = useState('');
  
  // Image Viewer state
  const [imgRotation, setImgRotation] = useState(0);
  const [imgZoom, setImgZoom] = useState(1);
  const [imgBrightness, setImgBrightness] = useState(100);

  // Notification Toast
  const [toast, setToast] = useState<{ type: 'success' | 'info' | 'error'; message: string } | null>(null);

  // Hidden native file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  const notify = (type: 'success' | 'info' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  // Initial rich items with real text/code content
  const [customItems, setCustomItems] = useState<StorageItem[]>([
    {
      id: 'doc-readme',
      name: 'README.md',
      type: 'document',
      size: '2.4 KB',
      date: 'Hoje, 11:40',
      source: 'local',
      folder: 'downloads',
      tags: ['Markdown', 'Sistema'],
      content: `# InoveCloud OS - Sistema Operacional Debian 13 Liquid Glass\n\nBem-vindo ao ambiente de produtividade e desenvolvimento do **InoveCloud OS**.\n\n## Principais Recursos:\n- Suporte completo a pacotes Flatpak e APT Debian.\n- Gerenciador de Repositórios com suporte a fontes oficiais e PPAs.\n- Kernel Linux com namespaces e cgroups ativos.\n- Terminal interativo e integração gráfica.\n\n*InoveCloud Team - 2026*`,
    },
    {
      id: 'sh-build',
      name: 'deploy-services.sh',
      type: 'code',
      size: '1.8 KB',
      date: 'Hoje, 09:15',
      source: 'local',
      folder: 'downloads',
      tags: ['Shell', 'DevOps'],
      content: `#!/usr/bin/env bash\n# Script de Deploy e Inicialização de Serviços\nset -euo pipefail\n\necho "[InoveCloud] Atualizando pacotes..."\nsudo apt-get update -y\n\necho "[InoveCloud] Verificando serviços do systemd..."\nsystemctl status NetworkManager || true\nsystemctl status pipewire || true\n\necho "✓ Deploy concluído com sucesso!"`,
    },
    {
      id: 'json-config',
      name: 'settings.config.json',
      type: 'code',
      size: '1.1 KB',
      date: 'Ontem',
      source: 'local',
      folder: 'documents',
      tags: ['Config', 'JSON'],
      content: `{\n  "system": "InoveCloud OS",\n  "version": "2.4.0",\n  "theme": "liquid-glass",\n  "cursor": "macOS-Adwaita",\n  "desktop": {\n    "resolution": "1920x1080",\n    "refreshRate": 60,\n    "wayland": true\n  },\n  "features": {\n    "flatpakEnabled": true,\n    "aptManager": true,\n    "realtimeLogs": true\n  }\n}`,
    },
    {
      id: 'js-app',
      name: 'server-health.js',
      type: 'code',
      size: '3.2 KB',
      date: 'Ontem',
      source: 'local',
      folder: 'documents',
      tags: ['Node.js', 'Dev'],
      content: `// Verificador de integridade do cluster InoveCloud\nconst http = require('http');\n\nconst server = http.createServer((req, res) => {\n  res.writeHead(200, { 'Content-Type': 'application/json' });\n  res.end(JSON.stringify({\n    status: 'online',\n    timestamp: new Date().toISOString(),\n    host: 'inovecloud-trixie'\n  }));\n});\n\nserver.listen(8080, () => {\n  console.log('Monitor ativo na porta 8080');\n});`,
    },
    {
      id: 'dl-iso',
      name: 'inovecloud-os-amd64.iso',
      type: 'iso',
      size: '840 MB',
      date: 'Hoje, 10:00',
      source: 'local',
      folder: 'downloads',
      tags: ['ISO', 'Sistema'],
      content: 'Imagem ISO oficial inicializável do InoveCloud OS (Debian 13 Trixie x86_64).',
    },
    {
      id: 'dl-wallpaper',
      name: 'Wallpaper_Liquid_Glass.png',
      type: 'photo',
      size: '4.2 MB',
      date: 'Ontem',
      source: 'local',
      folder: 'pictures',
      previewUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1000',
      tags: ['Wallpaper', 'Foto'],
    },
    {
      id: 'dl-nature',
      name: 'Mountains_4K.jpg',
      type: 'photo',
      size: '5.8 MB',
      date: '09/09/2026',
      source: 'local',
      folder: 'pictures',
      previewUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1000',
      tags: ['Paisagem', 'Foto'],
    },
    {
      id: 'folder-projects',
      name: 'Meus Projetos',
      type: 'folder',
      size: '--',
      date: 'Hoje, 08:00',
      source: 'local',
      folder: 'documents',
      tags: ['Pasta'],
    },
    {
      id: 'folder-backups',
      name: 'Backups_2026',
      type: 'folder',
      size: '--',
      date: 'Ontem',
      source: 'local',
      folder: 'downloads',
      tags: ['Pasta'],
    },
  ]);

  // Handle native file upload from host OS
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

      // Read text content if it is a text/code file
      const reader = new FileReader();
      const isText =
        f.type.startsWith('text/') ||
        f.name.endsWith('.txt') ||
        f.name.endsWith('.md') ||
        f.name.endsWith('.js') ||
        f.name.endsWith('.ts') ||
        f.name.endsWith('.json') ||
        f.name.endsWith('.sh') ||
        f.name.endsWith('.html') ||
        f.name.endsWith('.css');

      const newItemId = `upload-${Date.now()}-${i}`;

      if (isText) {
        reader.onload = (event) => {
          const textContent = (event.target?.result as string) || '';
          const newItem: StorageItem = {
            id: newItemId,
            name: f.name,
            type: f.name.endsWith('.ts') || f.name.endsWith('.js') || f.name.endsWith('.sh') ? 'code' : 'document',
            size: sizeStr,
            date: 'Agora mesmo',
            source: 'local',
            folder: activeSidebar,
            tags: ['Local', 'Sincronizado'],
            content: textContent,
            synced: true,
          };
          setCustomItems((prev) => [newItem, ...prev]);
          if (onUploadFile) onUploadFile(newItem);
        };
        reader.readAsText(f);
      } else {
        const newItem: StorageItem = {
          id: newItemId,
          name: f.name,
          type: isImg ? 'photo' : f.name.endsWith('.iso') ? 'iso' : 'document',
          size: sizeStr,
          date: 'Agora mesmo',
          source: 'local',
          folder: activeSidebar,
          tags: ['Local', 'Sincronizado'],
          previewUrl,
          synced: true,
        };
        setCustomItems((prev) => [newItem, ...prev]);
        if (onUploadFile) onUploadFile(newItem);
      }
    }

    notify('success', `${fileList.length} arquivo(s) carregado(s) com sucesso!`);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Abrir e Editar Arquivo
  const handleOpenFile = (item: StorageItem) => {
    if (item.type === 'folder') {
      // Navegar para dentro da pasta
      const nextHistory = history.slice(0, historyIndex + 1);
      nextHistory.push(item.id);
      setHistory(nextHistory);
      setHistoryIndex(nextHistory.length - 1);
      setCurrentFolderId(item.id);
      return;
    }

    setEditingItem(item);
    setEditorFilename(item.name);
    setEditorContent(item.content || '');
    setImgRotation(0);
    setImgZoom(1);
    setImgBrightness(100);
  };

  // Salvar Alterações no Arquivo
  const handleSaveFile = () => {
    if (!editingItem) return;

    const updatedSize = `${Math.max(1, parseFloat((editorContent.length / 1024).toFixed(1)))} KB`;
    const now = 'Hoje, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setCustomItems((prev) =>
      prev.map((item) =>
        item.id === editingItem.id
          ? {
              ...item,
              name: editorFilename.trim() || item.name,
              content: editorContent,
              size: item.type === 'photo' ? item.size : updatedSize,
              date: now,
            }
          : item
      )
    );

    notify('success', `Arquivo "${editorFilename}" salvo com sucesso!`);
    setEditingItem((prev) => (prev ? { ...prev, name: editorFilename, content: editorContent, size: updatedSize, date: now } : null));
  };

  // Baixar Arquivo para o PC Real
  const handleDownloadFile = (item: StorageItem) => {
    if (item.previewUrl) {
      const a = document.createElement('a');
      a.href = item.previewUrl;
      a.download = item.name;
      a.target = '_blank';
      a.click();
    } else {
      const blob = new Blob([item.content || ''], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = item.name;
      a.click();
      URL.revokeObjectURL(url);
    }
    notify('info', `Download iniciado para "${item.name}".`);
  };

  // Excluir Arquivo
  const handleDeleteItem = (id: string, name: string) => {
    setCustomItems((prev) => prev.filter((item) => item.id !== id));
    if (selectedItem?.id === id) setSelectedItem(null);
    if (editingItem?.id === id) setEditingItem(null);
    notify('info', `"${name}" removido com sucesso.`);
  };

  // Criar Novo Arquivo
  const handleCreateNewFile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName.trim()) return;

    let defaultContent = '';
    if (newFileName.endsWith('.md')) {
      defaultContent = `# ${newFileName.replace('.md', '')}\n\nEscreva seu texto aqui...`;
    } else if (newFileName.endsWith('.sh')) {
      defaultContent = `#!/usr/bin/env bash\n# Script do InoveCloud OS\nset -euo pipefail\n\necho "Executando script..."\n`;
    } else if (newFileName.endsWith('.json')) {
      defaultContent = `{\n  "nome": "${newFileName}",\n  "criadoEm": "${new Date().toISOString()}"\n}`;
    } else if (newFileName.endsWith('.js') || newFileName.endsWith('.ts')) {
      defaultContent = `// ${newFileName}\nconsole.log("Olá do InoveCloud OS!");\n`;
    } else {
      defaultContent = `Novo arquivo criado em ${new Date().toLocaleString()}.\n`;
    }

    const newItem: StorageItem = {
      id: `file-${Date.now()}`,
      name: newFileName.trim(),
      type: newFileType,
      size: `${Math.max(1, parseFloat((defaultContent.length / 1024).toFixed(1)))} KB`,
      date: 'Agora mesmo',
      source: 'local',
      folder: activeSidebar,
      tags: ['Novo', 'Documento'],
      content: defaultContent,
    };

    setCustomItems((prev) => [newItem, ...prev]);
    setShowNewFileModal(false);
    setNewFileName('');
    notify('success', `Arquivo "${newItem.name}" criado com sucesso!`);
    handleOpenFile(newItem);
  };

  // Criar Nova Pasta
  const handleCreateNewFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    const newFolder: StorageItem = {
      id: `folder-${Date.now()}`,
      name: newFolderName.trim(),
      type: 'folder',
      size: '--',
      date: 'Agora mesmo',
      source: 'local',
      folder: activeSidebar,
      tags: ['Pasta'],
    };

    setCustomItems((prev) => [newFolder, ...prev]);
    setShowNewFolderModal(false);
    setNewFolderName('');
    notify('success', `Pasta "${newFolder.name}" criada com sucesso!`);
  };

  // Navegação Histórico
  const handleGoBack = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setCurrentFolderId(history[historyIndex - 1]);
    }
  };

  const handleGoForward = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setCurrentFolderId(history[historyIndex + 1]);
    }
  };

  // Combine and filter items based on folder or sidebar selection
  const allFolderItems = [...customItems, ...files, ...photos];
  
  const filteredItems = allFolderItems.filter((item) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return item.name.toLowerCase().includes(q) || item.tags?.some((t) => t.toLowerCase().includes(q));
    }
    if (activeSidebar === 'downloads') {
      return item.folder === 'downloads' || item.tags?.includes('Downloads') || item.type === 'iso';
    }
    if (activeSidebar === 'pictures') {
      return item.type === 'photo' || item.tags?.includes('Fotos');
    }
    if (activeSidebar === 'documents') {
      return item.type === 'document' || item.type === 'code' || item.type === 'archive';
    }
    if (activeSidebar === 'all_files' || activeSidebar === 'library') {
      return true;
    }
    return true;
  });

  // Estatísticas do editor
  const lineCount = editorContent ? editorContent.split('\n').length : 0;
  const wordCount = editorContent ? editorContent.trim().split(/\s+/).filter(Boolean).length : 0;
  const charCount = editorContent.length;

  return (
    <div className="flex flex-col h-full bg-[#ebebeb] text-[#333333] select-none font-sans overflow-hidden border border-black/20 rounded-xl shadow-2xl relative">
      {/* Hidden File Picker Input */}
      <input
        type="file"
        ref={fileInputRef}
        multiple
        className="hidden"
        onChange={handleNativeFileUpload}
      />

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-xl text-xs font-bold shadow-2xl flex items-center space-x-2 border backdrop-blur-md ${
              toast.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-300'
                : toast.type === 'error'
                ? 'bg-rose-950/90 border-rose-500/40 text-rose-300'
                : 'bg-blue-950/90 border-blue-500/40 text-blue-300'
            }`}
          >
            <Info className="w-4 h-4 shrink-0" />
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. Finder Navigation & Search Bar */}
      <div className="h-10 bg-gradient-to-b from-[#f6f6f6] to-[#e1e1e1] border-b border-[#b8b8b8] px-3 flex items-center justify-between text-xs shadow-xs shrink-0">
        <div className="flex items-center space-x-2">
          {/* Navigation Arrows */}
          <div className="flex items-center bg-[#fdfdfd] border border-[#bcbcbc] rounded-md shadow-2xs">
            <button
              onClick={handleGoBack}
              disabled={historyIndex === 0}
              className="px-2.5 py-1 text-slate-500 hover:text-black cursor-pointer border-r border-[#bcbcbc] disabled:opacity-40"
              title="Voltar"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleGoForward}
              disabled={historyIndex >= history.length - 1}
              className="px-2.5 py-1 text-slate-500 hover:text-black cursor-pointer disabled:opacity-40"
              title="Avançar"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Current Folder Title with Blue Folder Icon */}
        <div className="flex items-center space-x-1.5 font-bold text-[13px] text-[#2c2c2c]">
          <svg className="w-4 h-4 text-[#4ba2e3]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
          </svg>
          <span>
            {activeSidebar === 'downloads'
              ? 'Downloads'
              : activeSidebar === 'pictures'
              ? 'Pictures'
              : activeSidebar === 'documents'
              ? 'Documents'
              : activeSidebar === 'library'
              ? 'Library'
              : 'All My Files'}
          </span>
        </div>

        {/* Search Input on Right */}
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar arquivos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-36 sm:w-48 pl-7 pr-2 py-0.5 bg-white border border-[#bcbcbc] rounded-md text-xs text-black placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-black cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Finder Action Toolbar (View switcher, New File, New Folder, Upload) */}
      <div className="h-9 bg-[#f0f0f0] border-b border-[#c8c8c8] px-3 flex flex-wrap items-center justify-between text-xs gap-2 shrink-0">
        <div className="flex items-center space-x-2">
          {/* Layout segmented button */}
          <div className="flex items-center bg-[#e4e4e4] border border-[#bcbcbc] rounded-md overflow-hidden p-0.5 shadow-2xs">
            <button
              onClick={() => setViewLayout('grid')}
              className={`px-2.5 py-0.5 rounded transition cursor-pointer ${
                viewLayout === 'grid' ? 'bg-[#ffffff] shadow-xs text-black font-semibold' : 'text-slate-600 hover:text-black'
              }`}
              title="Visualização em Ícones"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewLayout('list')}
              className={`px-2.5 py-0.5 rounded transition cursor-pointer ${
                viewLayout === 'list' ? 'bg-[#ffffff] shadow-xs text-black font-semibold' : 'text-slate-600 hover:text-black'
              }`}
              title="Visualização em Lista"
            >
              <ListIcon className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Botão Novo Arquivo */}
          <button
            onClick={() => setShowNewFileModal(true)}
            className="flex items-center space-x-1 px-2.5 py-1 rounded bg-[#ffffff] hover:bg-[#fafafa] border border-[#bcbcbc] text-[#222222] font-semibold text-[11px] shadow-2xs cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-emerald-600" />
            <span>+ Novo Arquivo</span>
          </button>

          {/* Botão Nova Pasta */}
          <button
            onClick={() => setShowNewFolderModal(true)}
            className="flex items-center space-x-1 px-2.5 py-1 rounded bg-[#ffffff] hover:bg-[#fafafa] border border-[#bcbcbc] text-[#222222] font-semibold text-[11px] shadow-2xs cursor-pointer"
          >
            <FolderPlus className="w-3.5 h-3.5 text-amber-600" />
            <span>+ Nova Pasta</span>
          </button>

          {/* Botão Upload Real do PC */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-[#ffffff] hover:bg-[#fafafa] border border-[#bcbcbc] text-[#222222] font-semibold text-[11px] shadow-2xs cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-blue-600" />
            <span>Upload do PC</span>
          </button>
        </div>

        {/* S3 & Cloud Sync Indicator */}
        <div className="flex items-center space-x-2 text-[11px] text-[#666666]">
          <span className="w-2 h-2 rounded-full bg-[#27c93f] inline-block" />
          <span>InoveCloud Storage Ativo • Duplo clique para Abrir e Editar</span>
        </div>
      </div>

      {/* 3. Main Workspace: Sidebar + Folder Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Finder Sidebar */}
        <div className="w-48 bg-[#e8e8e8] border-r border-[#c8c8c8] p-2 flex flex-col justify-between overflow-y-auto text-[11.5px] select-none shrink-0">
          <div className="space-y-4">
            {/* Favorites Group */}
            <div>
              <div className="px-2 py-1 text-[10px] font-bold text-[#888888] uppercase tracking-wider">
                Favoritos
              </div>
              <div className="space-y-0.5">
                {[
                  { id: 'all_files', name: 'Todos os Arquivos', icon: Folder },
                  { id: 'documents', name: 'Documentos & Código', icon: FileText },
                  { id: 'downloads', name: 'Downloads', icon: Download },
                  { id: 'pictures', name: 'Fotos & Imagens', icon: ImageIcon },
                  { id: 'library', name: 'Biblioteca do Sistema', icon: Folder },
                  { id: 'desktop', name: 'Desktop', icon: Laptop },
                ].map((fav) => {
                  const Icon = fav.icon;
                  const isActive = activeSidebar === fav.id;
                  return (
                    <button
                      key={fav.id}
                      onClick={() => {
                        setActiveSidebar(fav.id);
                        setCurrentFolderId(null);
                      }}
                      className={`w-full flex items-center space-x-2 px-2.5 py-1 rounded-md text-left transition cursor-pointer ${
                        isActive
                          ? 'bg-[#3875d7] text-white font-medium shadow-2xs'
                          : 'text-[#333333] hover:bg-black/5'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-[#666666]'}`} />
                      <span className="truncate">{fav.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Devices Group */}
            <div>
              <div className="px-2 py-1 text-[10px] font-bold text-[#888888] uppercase tracking-wider">
                Dispositivos
              </div>
              <div className="space-y-0.5">
                {[
                  { id: 'mac_hd', name: 'InoveCloud NVMe HD', icon: HardDrive },
                  { id: 'iso_drive', name: 'Debian 13 Trixie ISO', icon: Disc },
                ].map((dev) => {
                  const Icon = dev.icon;
                  return (
                    <div
                      key={dev.id}
                      className="w-full flex items-center space-x-2 px-2.5 py-1 text-[#444444] hover:bg-black/5 rounded-md cursor-pointer text-left"
                    >
                      <Icon className="w-3.5 h-3.5 text-[#777777] shrink-0" />
                      <span className="truncate">{dev.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right Finder Main Grid / Files Display */}
        <div className="flex-1 bg-white p-4 overflow-y-auto">
          {filteredItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-[#888888] space-y-2">
              <Folder className="w-16 h-16 text-[#7fb7e8] opacity-60" />
              <p className="text-sm font-semibold text-[#555555]">Nenhum arquivo encontrado nesta pasta</p>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowNewFileModal(true)}
                  className="px-3 py-1.5 rounded-md bg-[#3875d7] hover:bg-[#2e62b8] text-white text-xs font-semibold shadow cursor-pointer"
                >
                  + Criar Arquivo
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-md bg-white border border-[#bcbcbc] hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow cursor-pointer"
                >
                  Upload do PC
                </button>
              </div>
            </div>
          ) : viewLayout === 'grid' ? (
            /* Classic Blue Folder / File Icon Grid */
            <div
              className="grid gap-4 sm:gap-6 justify-start content-start"
              style={{
                gridTemplateColumns: `repeat(auto-fill, minmax(${iconSize + 50}px, 1fr))`,
              }}
            >
              {filteredItems.map((item) => {
                const isSelected = selectedItem?.id === item.id;
                const isPhoto = item.type === 'photo' && item.previewUrl;
                const isCode = item.type === 'code';
                const isDoc = item.type === 'document';

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    onDoubleClick={() => handleOpenFile(item)}
                    className={`group flex flex-col items-center p-2 rounded-xl cursor-pointer transition select-none text-center relative ${
                      isSelected
                        ? 'bg-[#3875d7]/20 border border-[#3875d7]/40 shadow-xs'
                        : 'hover:bg-black/5 border border-transparent'
                    }`}
                  >
                    {/* Visual Icon */}
                    <div
                      className="flex items-center justify-center relative mb-1.5"
                      style={{ width: `${iconSize}px`, height: `${iconSize * 0.85}px` }}
                    >
                      {isPhoto ? (
                        <img
                          src={item.previewUrl}
                          alt={item.name}
                          className="w-full h-full object-cover rounded shadow-md border border-black/10"
                        />
                      ) : isCode ? (
                        <div className="w-12 h-14 bg-gradient-to-b from-indigo-50 to-indigo-100 border border-indigo-300 rounded shadow flex flex-col items-center justify-center text-indigo-700">
                          <FileCode className="w-6 h-6" />
                          <span className="text-[8px] font-black uppercase tracking-wider mt-1 font-mono">
                            {item.name.split('.').pop() || 'CODE'}
                          </span>
                        </div>
                      ) : isDoc ? (
                        <div className="w-12 h-14 bg-gradient-to-b from-slate-50 to-slate-100 border border-slate-300 rounded shadow flex flex-col items-center justify-center text-slate-700">
                          <FileText className="w-6 h-6 text-blue-600" />
                          <span className="text-[8px] font-black uppercase tracking-wider mt-1 font-mono">
                            {item.name.split('.').pop() || 'DOC'}
                          </span>
                        </div>
                      ) : (
                        <svg
                          viewBox="0 0 100 80"
                          className="w-full h-full drop-shadow-[0_2px_4px_rgba(0,0,0,0.18)]"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M8 18 C8 13 12 10 17 10 L40 10 C44 10 47 13 49 17 L53 23 L85 23 C90 23 94 27 94 32 L94 66 C94 71 90 75 85 75 L15 75 C10 75 6 71 6 66 L6 20 Z"
                            fill="#5ba8ec"
                          />
                          <path
                            d="M6 30 C6 25 10 21 15 21 L85 21 C90 21 94 25 94 30 L94 66 C94 71 90 75 85 75 L15 75 C10 75 6 71 6 66 Z"
                            fill="url(#folder-grad)"
                          />
                          <defs>
                            <linearGradient id="folder-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                              <stop offset="0%" stopColor="#82c7fd" />
                              <stop offset="100%" stopColor="#4395e8" />
                            </linearGradient>
                          </defs>
                        </svg>
                      )}
                    </div>

                    {/* File / Folder Label */}
                    <span
                      className={`text-[12px] leading-tight break-words max-w-[120px] px-1 py-0.5 rounded ${
                        isSelected
                          ? 'bg-[#3875d7] text-white font-medium'
                          : 'text-[#222222] group-hover:text-black'
                      }`}
                    >
                      {item.name}
                    </span>

                    {/* Botão de Ação Rápida Abrir/Editar no Hover */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenFile(item);
                      }}
                      className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 p-1 bg-white/90 hover:bg-white rounded-md shadow border border-black/10 text-blue-600 transition cursor-pointer"
                      title="Abrir e Editar Arquivo"
                    >
                      <Edit3 className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Classic List View */
            <div className="border border-[#c8c8c8] rounded-md overflow-hidden bg-white shadow-2xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#f0f0f0] border-b border-[#c8c8c8] text-[#555555] font-semibold text-[11px]">
                  <tr>
                    <th className="p-2 pl-3">Nome</th>
                    <th className="p-2">Data de Modificação</th>
                    <th className="p-2">Tamanho</th>
                    <th className="p-2">Tipo</th>
                    <th className="p-2 text-right pr-3">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eeeeee] text-[#222222]">
                  {filteredItems.map((item) => (
                    <tr
                      key={item.id}
                      onClick={() => setSelectedItem(item)}
                      onDoubleClick={() => handleOpenFile(item)}
                      className={`cursor-pointer transition ${
                        selectedItem?.id === item.id ? 'bg-[#3875d7] text-white font-medium' : 'hover:bg-[#f6f6f6]'
                      }`}
                    >
                      <td className="p-2 pl-3 flex items-center space-x-2">
                        {item.type === 'code' ? (
                          <FileCode className="w-4 h-4 text-indigo-600 shrink-0" />
                        ) : item.type === 'photo' ? (
                          <ImageIcon className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : item.type === 'folder' ? (
                          <Folder className="w-4 h-4 text-blue-500 shrink-0" />
                        ) : (
                          <FileText className="w-4 h-4 text-[#4ba2e3] shrink-0" />
                        )}
                        <span className="truncate">{item.name}</span>
                      </td>
                      <td className="p-2">{item.date}</td>
                      <td className="p-2">{item.size}</td>
                      <td className="p-2 uppercase text-[10px]">{item.type}</td>
                      <td className="p-2 text-right pr-3 space-x-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenFile(item);
                          }}
                          className="px-2 py-0.5 rounded bg-[#3875d7] hover:bg-[#2e62b8] text-white text-[10px] font-semibold cursor-pointer shadow-2xs"
                        >
                          Abrir / Editar
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownloadFile(item);
                          }}
                          className="p-1 rounded hover:bg-black/10 text-slate-600 cursor-pointer"
                          title="Baixar"
                        >
                          <Download className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteItem(item.id, item.name);
                          }}
                          className="p-1 rounded hover:bg-rose-100 text-rose-600 cursor-pointer"
                          title="Excluir"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* 4. Bottom Classic Status Bar with Item Count and Zoom Slider */}
      <div className="h-7 bg-[#dedede] border-t border-[#c8c8c8] px-3 flex items-center justify-between text-[11px] text-[#555555] shadow-inner shrink-0">
        <div className="flex items-center space-x-3">
          <span>{filteredItems.length} itens</span>
          <span>•</span>
          <span className="text-emerald-700 font-semibold">23.84 GB livres no HD</span>
        </div>

        {/* Icon size zoom slider */}
        <div className="flex items-center space-x-2">
          <span className="text-[10px] text-[#777777] font-semibold">-</span>
          <input
            type="range"
            min="48"
            max="120"
            value={iconSize}
            onChange={(e) => setIconSize(Number(e.target.value))}
            className="w-24 h-1 bg-[#bcbcbc] rounded-lg appearance-none cursor-pointer accent-[#3875d7]"
          />
          <span className="text-[10px] text-[#777777] font-semibold">+</span>
        </div>
      </div>

      {/* ================= MODAL EDITOR DE TEXTO E CÓDIGO INOVECLOUD ================= */}
      <AnimatePresence>
        {editingItem && (
          <div
            onClick={() => setEditingItem(null)}
            className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-3xl bg-slate-900 border border-white/20 rounded-2xl shadow-2xl text-slate-100 flex flex-col max-h-[85vh] overflow-hidden cursor-default"
            >
              {/* Editor Header */}
              <div className="p-3.5 bg-slate-950 border-b border-white/10 flex items-center justify-between gap-3 shrink-0">
                <div className="flex items-center space-x-2.5 flex-1 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                    {editingItem.type === 'photo' ? <ImageIcon className="w-4 h-4" /> : <FileCode className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <input
                      type="text"
                      value={editorFilename}
                      onChange={(e) => setEditorFilename(e.target.value)}
                      className="bg-transparent text-sm font-bold text-white border-b border-transparent hover:border-white/20 focus:border-blue-500 focus:outline-none w-full px-1"
                      title="Clique para renomear"
                    />
                    <div className="text-[10px] text-slate-400 flex items-center space-x-2 px-1">
                      <span>{editingItem.type.toUpperCase()}</span>
                      <span>•</span>
                      <span>{editingItem.size}</span>
                      <span>•</span>
                      <span>{editingItem.date}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleDownloadFile(editingItem)}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-slate-300 hover:text-white transition cursor-pointer flex items-center space-x-1 text-xs"
                    title="Baixar para seu computador"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Baixar</span>
                  </button>
                  <button
                    onClick={handleSaveFile}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Salvar</span>
                  </button>
                  <button
                    onClick={() => setEditingItem(null)}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Editor Body */}
              {editingItem.type === 'photo' && editingItem.previewUrl ? (
                /* Visualizador e Ajustador de Imagem */
                <div className="flex-1 p-5 flex flex-col items-center justify-center bg-black/40 overflow-hidden space-y-4">
                  <div className="flex items-center space-x-3 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-white/10 text-xs text-slate-300">
                    <button
                      onClick={() => setImgRotation((r) => (r + 90) % 360)}
                      className="flex items-center space-x-1 hover:text-white cursor-pointer"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      <span>Girar 90°</span>
                    </button>
                    <span>|</span>
                    <button
                      onClick={() => setImgZoom((z) => Math.min(z + 0.25, 3))}
                      className="hover:text-white cursor-pointer"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setImgZoom((z) => Math.max(z - 0.25, 0.5))}
                      className="hover:text-white cursor-pointer"
                    >
                      <ZoomOut className="w-3.5 h-3.5" />
                    </button>
                    <span>|</span>
                    <div className="flex items-center space-x-1.5">
                      <Sun className="w-3 h-3 text-amber-400" />
                      <input
                        type="range"
                        min="50"
                        max="150"
                        value={imgBrightness}
                        onChange={(e) => setImgBrightness(Number(e.target.value))}
                        className="w-16 h-1 accent-amber-400 cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="max-h-[50vh] overflow-hidden flex items-center justify-center p-2">
                    <img
                      src={editingItem.previewUrl}
                      alt={editingItem.name}
                      style={{
                        transform: `rotate(${imgRotation}deg) scale(${imgZoom})`,
                        filter: `brightness(${imgBrightness}%)`,
                        transition: 'transform 0.2s ease, filter 0.2s ease',
                      }}
                      className="max-h-[45vh] object-contain rounded-xl shadow-2xl border border-white/10"
                    />
                  </div>
                </div>
              ) : (
                /* Editor de Código / Texto Monospace com Linhas */
                <div className="flex-1 flex flex-col min-h-0 bg-slate-950">
                  <div className="flex-1 flex overflow-hidden font-mono text-xs">
                    {/* Indicador de Linhas */}
                    <div className="w-10 bg-slate-900/80 text-slate-600 py-3 select-none text-right pr-2 leading-relaxed border-r border-white/5 font-mono text-[11px]">
                      {Array.from({ length: Math.max(1, lineCount) }).map((_, idx) => (
                        <div key={idx}>{idx + 1}</div>
                      ))}
                    </div>

                    {/* Textarea de Edição Real */}
                    <textarea
                      value={editorContent}
                      onChange={(e) => setEditorContent(e.target.value)}
                      placeholder="Comece a digitar seu código ou texto aqui..."
                      className="flex-1 p-3 bg-transparent text-slate-100 placeholder-slate-600 focus:outline-none resize-none leading-relaxed font-mono text-xs overflow-y-auto"
                      spellCheck={false}
                    />
                  </div>
                </div>
              )}

              {/* Editor Footer Status Bar */}
              <div className="p-2.5 bg-slate-950 border-t border-white/10 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2 shrink-0">
                <div className="flex items-center space-x-3 font-mono text-[10px]">
                  <span>{lineCount} linhas</span>
                  <span>•</span>
                  <span>{wordCount} palavras</span>
                  <span>•</span>
                  <span>{charCount} caracteres</span>
                  <span>•</span>
                  <span>UTF-8</span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setEditingItem(null)}
                    className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-semibold cursor-pointer"
                  >
                    Fechar
                  </button>
                  <button
                    onClick={handleSaveFile}
                    className="px-3.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow cursor-pointer"
                  >
                    Salvar Alterações
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= MODAL CRIAR NOVO ARQUIVO ================= */}
      <AnimatePresence>
        {showNewFileModal && (
          <div
            onClick={() => setShowNewFileModal(false)}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-slate-900 border border-white/20 rounded-2xl p-5 shadow-2xl text-slate-100 space-y-4 cursor-default"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-bold text-sm text-white">Criar Novo Arquivo</h3>
                </div>
                <button
                  onClick={() => setShowNewFileModal(false)}
                  className="text-slate-400 hover:text-white text-xs px-2 py-1"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateNewFile} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Nome do Arquivo:</label>
                  <input
                    type="text"
                    required
                    placeholder="ex: documento.txt, script.sh, notas.md, app.js"
                    value={newFileName}
                    onChange={(e) => setNewFileName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Modelos Rápidos:</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { name: 'notas.md', type: 'document' as const, label: 'Markdown (.md)' },
                      { name: 'script.sh', type: 'code' as const, label: 'Bash Script (.sh)' },
                      { name: 'config.json', type: 'code' as const, label: 'JSON Config (.json)' },
                      { name: 'documento.txt', type: 'document' as const, label: 'Texto Simples (.txt)' },
                    ].map((tpl) => (
                      <button
                        key={tpl.name}
                        type="button"
                        onClick={() => {
                          setNewFileName(tpl.name);
                          setNewFileType(tpl.type);
                        }}
                        className="p-2 text-left rounded-xl bg-white/5 hover:bg-blue-600/20 border border-white/5 hover:border-blue-500/40 text-xs font-semibold text-slate-300 hover:text-white transition cursor-pointer"
                      >
                        {tpl.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-2 pt-2 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setShowNewFileModal(false)}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 font-semibold cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow cursor-pointer"
                  >
                    Criar e Editar
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= MODAL CRIAR NOVA PASTA ================= */}
      <AnimatePresence>
        {showNewFolderModal && (
          <div
            onClick={() => setShowNewFolderModal(false)}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-slate-900 border border-white/20 rounded-2xl p-5 shadow-2xl text-slate-100 space-y-4 cursor-default"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center space-x-2">
                  <FolderPlus className="w-5 h-5 text-amber-400" />
                  <h3 className="font-bold text-sm text-white">Criar Nova Pasta</h3>
                </div>
                <button
                  onClick={() => setShowNewFolderModal(false)}
                  className="text-slate-400 hover:text-white text-xs px-2 py-1"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateNewFolder} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Nome da Pasta:</label>
                  <input
                    type="text"
                    required
                    placeholder="ex: Projetos_Web, Documentos_2026, Imagens"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    autoFocus
                  />
                </div>

                <div className="flex items-center justify-end space-x-2 pt-2 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setShowNewFolderModal(false)}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 font-semibold cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold shadow cursor-pointer"
                  >
                    Criar Pasta
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StorageApp;
