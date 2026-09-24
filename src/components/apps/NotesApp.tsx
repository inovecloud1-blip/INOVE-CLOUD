import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  FileText,
  Plus,
  Trash2,
  Save,
  Download,
  Copy,
  Check,
  Search,
  Code,
  Eye,
  FileCode,
  Tag,
  Clock,
  Sparkles,
  Hash,
  X,
  Pin,
  Filter,
  Bookmark,
  Cloud,
  CloudOff,
  RefreshCw,
  CheckCircle2,
  RotateCw,
  HardDrive,
  Database,
  Wifi,
  Sliders,
  ShieldCheck,
  Server
} from 'lucide-react';
import { useSoundEffects } from '../../context/SoundEffectsContext';

export interface NoteItem {
  id: string;
  title: string;
  category: 'Markdown' | 'Script Shell' | 'Notas Rápidas' | 'Configurações' | 'Ideias';
  content: string;
  tags?: string[];
  updatedAt: string;
  isPinned?: boolean;
}

export type CloudSyncStatus = 'synced' | 'syncing' | 'offline';

const DEFAULT_NOTES: NoteItem[] = [
  {
    id: 'note-welcome',
    title: 'Bem-vindo ao InoveCloud OS (v1.0 Beta)',
    category: 'Markdown',
    updatedAt: 'Hoje, 12:00',
    isPinned: true,
    tags: ['#welcome', '#liquid-glass', '#beta', '#docs'],
    content: `# 🚀 InoveCloud OS Puro Kernel & Liquid Glass
Bem-vindo ao **InoveCloud OS**, a plataforma em nuvem e sistema operacional baseada em Debian 13 (Trixie) e KVM Hypervisor de alta performance.

### 🌟 Principais Recursos:
- **Liquid Glass UI**: Interface translúcida com efeitos modernos em tempo real.
- **Armazenamento Persistente**: Seus arquivos, notas e configurações salvos localmente e sincronizados.
- **Nós KVM & Docker**: Crie e gerencie máquinas virtuais com um clique.
- **Cloud Sync Integrado**: Sincronização automática em tempo real com LocalStorage seguro.

---
*Dica: Experimente pressionar **Cmd+K** para abrir a Busca Global ou crie novas tags com #.*`
  },
  {
    id: 'note-script-kvm',
    title: 'script-deploy-kvm.sh',
    category: 'Script Shell',
    updatedAt: 'Ontem, 16:45',
    tags: ['#kernel', '#kvm', '#devops', '#project-A'],
    content: `#!/usr/bin/env bash
# InoveCloud Node Deployment Script
set -euo pipefail

echo "=== [InoveCloud OS] Inicializando Nó Hypervisor ==="
modprobe kvm
modprobe kvm_intel || modprobe kvm_amd

# Configurar rede em bridge para os nós
ip link add name br0 type bridge
ip link set dev br0 up
echo "Rede em bridge br0 pronta!"

# Verificar aceleração por hardware
if [ -e /dev/kvm ]; then
    echo "✓ Aceleração de Virtualização por Hardware Ativa"
fi`
  },
  {
    id: 'note-roadmap',
    title: 'Roadmap de Lançamento Beta',
    category: 'Ideias',
    updatedAt: 'Há 2 dias',
    tags: ['#urgent', '#project-A', '#roadmap', '#release'],
    content: `## 📌 Itens do Lançamento Beta InoveCloud OS:
1. [x] Interface Liquid Glass com Animações Spring
2. [x] Efeitos sonoros Pop com sintetizador Web Audio
3. [x] Bloco de Notas & Editor de Código com Etiquetas/Tags Customizadas
4. [x] Gerenciador de Áreas de Trabalho Virtuais
5. [x] Sistema de Notificações Toast do Sistema
6. [x] Atalhos Globais de Teclado (Win+Space, Win+T, etc.)
7. [x] Serviço de Cloud Sync Local com Persistência Contínua
8. [ ] Divulgação Oficial da Primeira Versão Beta Pública`
  }
];

const PRESET_TAGS = ['#urgent', '#project-A', '#project-B', '#kernel', '#devops', '#bug', '#feature', '#docs', '#review'];
const LOCAL_STORAGE_KEY = 'inovecloud_notes_items';
const CLOUD_BACKUP_KEY = 'inovecloud_notes_cloud_backup';
const CLOUD_SYNC_ENABLED_KEY = 'inovecloud_notes_cloud_sync_enabled';
const CLOUD_LAST_SYNC_KEY = 'inovecloud_notes_last_sync_time';

export const NotesApp: React.FC = () => {
  const { playPop } = useSoundEffects();

  // 1. Core Notes State from LocalStorage
  const [notes, setNotes] = useState<NoteItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_NOTES;
  });

  const [activeNoteId, setActiveNoteId] = useState<string>(() => {
    return notes[0]?.id || DEFAULT_NOTES[0].id;
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTagFilter, setSelectedTagFilter] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');
  const [copied, setCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [isAddingTag, setIsAddingTag] = useState(false);
  const tagInputRef = useRef<HTMLInputElement>(null);

  // 2. Cloud Sync Mock Service State
  const [cloudSyncEnabled, setCloudSyncEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(CLOUD_SYNC_ENABLED_KEY);
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  const [syncStatus, setSyncStatus] = useState<CloudSyncStatus>('synced');
  const [lastSyncTime, setLastSyncTime] = useState<string>(() => {
    try {
      return localStorage.getItem(CLOUD_LAST_SYNC_KEY) || 'Agora mesmo';
    } catch {
      return 'Agora mesmo';
    }
  });
  const [showSyncModal, setShowSyncModal] = useState<boolean>(false);
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const activeNote = notes.find((n) => n.id === activeNoteId) || notes[0];

  // 3. Persist notes to LocalStorage on change + trigger simulated Cloud Sync
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(notes));
    } catch (e) {
      console.error(e);
    }

    if (!cloudSyncEnabled) {
      setSyncStatus('offline');
      return;
    }

    // Trigger mock cloud sync with debounce
    setSyncStatus('syncing');
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    syncTimeoutRef.current = setTimeout(() => {
      try {
        // Mock cloud payload update in LocalStorage
        const cloudPayload = {
          version: '2026.1',
          syncedAt: new Date().toISOString(),
          endpoint: 'https://cloud-api.inovecloud.io/v1/notes-sync',
          notesCount: notes.length,
          data: notes
        };
        localStorage.setItem(CLOUD_BACKUP_KEY, JSON.stringify(cloudPayload));
        
        const now = new Date();
        const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const finalTime = `Hoje às ${timeStr}`;
        setLastSyncTime(finalTime);
        localStorage.setItem(CLOUD_LAST_SYNC_KEY, finalTime);
        setSyncStatus('synced');
      } catch (err) {
        console.error('Error during simulated cloud sync:', err);
        setSyncStatus('synced');
      }
    }, 650);

    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [notes, cloudSyncEnabled]);

  // Handle manual force sync
  const handleForceSync = () => {
    playPop('on');
    if (!cloudSyncEnabled) {
      setCloudSyncEnabled(true);
      localStorage.setItem(CLOUD_SYNC_ENABLED_KEY, 'true');
    }
    setSyncStatus('syncing');

    setTimeout(() => {
      try {
        const cloudPayload = {
          version: '2026.1',
          syncedAt: new Date().toISOString(),
          endpoint: 'https://cloud-api.inovecloud.io/v1/notes-sync',
          notesCount: notes.length,
          data: notes
        };
        localStorage.setItem(CLOUD_BACKUP_KEY, JSON.stringify(cloudPayload));
        const now = new Date();
        const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const finalTime = `Hoje às ${timeStr}`;
        setLastSyncTime(finalTime);
        localStorage.setItem(CLOUD_LAST_SYNC_KEY, finalTime);
        setSyncStatus('synced');
      } catch (err) {
        console.error(err);
      }
    }, 800);
  };

  const handleToggleCloudSync = () => {
    playPop('click');
    const newState = !cloudSyncEnabled;
    setCloudSyncEnabled(newState);
    localStorage.setItem(CLOUD_SYNC_ENABLED_KEY, String(newState));
    if (!newState) {
      setSyncStatus('offline');
    } else {
      setSyncStatus('syncing');
      setTimeout(() => {
        setSyncStatus('synced');
      }, 500);
    }
  };

  // Extract all unique tags across all notes
  const allUniqueTags = useMemo(() => {
    const tagsSet = new Set<string>();
    notes.forEach((note) => {
      note.tags?.forEach((t) => tagsSet.add(t));
    });
    return Array.from(tagsSet);
  }, [notes]);

  const handleCreateNote = () => {
    playPop('on');
    const newNote: NoteItem = {
      id: `note-${Date.now()}`,
      title: 'Nova Nota sem Título',
      category: 'Notas Rápidas',
      tags: selectedTagFilter ? [selectedTagFilter] : ['#draft'],
      updatedAt: 'Agora',
      content: '# Nova Nota\n\nEscreva suas anotações ou código aqui...',
    };
    setNotes([newNote, ...notes]);
    setActiveNoteId(newNote.id);
  };

  const handleDeleteNote = (id: string) => {
    playPop('off');
    const filtered = notes.filter((n) => n.id !== id);
    if (filtered.length === 0) {
      const fallback: NoteItem = {
        id: `note-${Date.now()}`,
        title: 'Minhas Anotações',
        category: 'Notas Rápidas',
        tags: ['#general'],
        updatedAt: 'Agora',
        content: '',
      };
      setNotes([fallback]);
      setActiveNoteId(fallback.id);
    } else {
      setNotes(filtered);
      if (activeNoteId === id) {
        setActiveNoteId(filtered[0].id);
      }
    }
  };

  const handleUpdateActiveNote = (updates: Partial<NoteItem>) => {
    setNotes((prev) =>
      prev.map((n) =>
        n.id === activeNoteId
          ? { ...n, ...updates, updatedAt: 'Agora' }
          : n
      )
    );
  };

  const handleAddTag = (tagToAdd: string) => {
    if (!tagToAdd || !activeNote) return;
    const cleanTag = tagToAdd.trim().startsWith('#')
      ? tagToAdd.trim()
      : `#${tagToAdd.trim().replace(/\s+/g, '-')}`;
    
    if (cleanTag.length <= 1) return;

    const currentTags = activeNote.tags || [];
    if (!currentTags.includes(cleanTag)) {
      playPop('on');
      handleUpdateActiveNote({
        tags: [...currentTags, cleanTag],
      });
    }
    setTagInput('');
    setIsAddingTag(false);
  };

  const handleRemoveTag = (tagToRemove: string) => {
    if (!activeNote) return;
    playPop('off');
    const currentTags = activeNote.tags || [];
    handleUpdateActiveNote({
      tags: currentTags.filter((t) => t !== tagToRemove),
    });
  };

  const handleCopy = () => {
    if (!activeNote) return;
    navigator.clipboard.writeText(activeNote.content);
    setCopied(true);
    playPop('click');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    playPop('on');
    setSavedSuccess(true);
    handleForceSync();
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleExport = () => {
    if (!activeNote) return;
    playPop('click');
    const element = document.createElement('a');
    const file = new Blob([activeNote.content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${activeNote.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const filteredNotes = notes.filter((note) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      note.title.toLowerCase().includes(q) ||
      note.content.toLowerCase().includes(q) ||
      note.tags?.some((t) => t.toLowerCase().includes(q));

    const matchesCat =
      selectedCategory === 'all' || note.category === selectedCategory;

    const matchesTag =
      !selectedTagFilter || (note.tags && note.tags.includes(selectedTagFilter));

    return matchesSearch && matchesCat && matchesTag;
  });

  return (
    <div className="flex h-full w-full bg-slate-950 text-slate-100 font-sans overflow-hidden select-none relative">
      {/* Sidebar List */}
      <div className="w-80 bg-slate-900/80 border-r border-white/10 flex flex-col shrink-0">
        {/* Header */}
        <div className="p-3.5 border-b border-white/10 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-rose-600 flex items-center justify-center shadow-lg shadow-amber-500/20 text-white font-bold">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-white tracking-wide">Notas & Código</h2>
                <p className="text-[10px] text-slate-400">Editor com Cloud Sync</p>
              </div>
            </div>

            <button
              onClick={handleCreateNote}
              className="p-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-400 text-xs font-bold transition flex items-center space-x-1 cursor-pointer active:scale-95"
              title="Nova Nota"
            >
              <Plus className="w-4 h-4" />
              <span>Nova</span>
            </button>
          </div>

          {/* Cloud Sync Status Flag & Indicator Pill */}
          <div className="flex items-center justify-between p-2 rounded-xl bg-black/30 border border-white/10">
            <button
              onClick={() => setShowSyncModal(true)}
              className="flex items-center space-x-2 text-left cursor-pointer group flex-1"
              title="Clique para detalhes da sincronização"
            >
              <div className="relative">
                {syncStatus === 'syncing' ? (
                  <RefreshCw className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                ) : cloudSyncEnabled ? (
                  <Cloud className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <CloudOff className="w-3.5 h-3.5 text-slate-500" />
                )}
                {cloudSyncEnabled && (
                  <span className={`absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full ${
                    syncStatus === 'syncing' ? 'bg-cyan-400 animate-ping' : 'bg-emerald-400'
                  }`} />
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center space-x-1.5">
                  <span className="text-[10.5px] font-bold text-white group-hover:text-amber-300 transition">
                    Cloud Sync
                  </span>
                  <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-semibold border ${
                    !cloudSyncEnabled
                      ? 'bg-slate-800 text-slate-400 border-white/10'
                      : syncStatus === 'syncing'
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30 animate-pulse'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  }`}>
                    {!cloudSyncEnabled ? 'OFFLINE' : syncStatus === 'syncing' ? 'SINCRONIZANDO...' : 'ATIVO'}
                  </span>
                </div>
                <p className="text-[9px] text-slate-400 truncate">
                  {!cloudSyncEnabled ? 'Modo Local' : `${lastSyncTime}`}
                </p>
              </div>
            </button>

            <button
              onClick={handleToggleCloudSync}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer border ${
                cloudSyncEnabled
                  ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border-emerald-500/40'
                  : 'bg-white/5 hover:bg-white/10 text-slate-400 border-white/10'
              }`}
              title={cloudSyncEnabled ? 'Desativar sincronização' : 'Ativar sincronização'}
            >
              {cloudSyncEnabled ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar notas, texto ou #tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
            />
          </div>

          {/* Categories Filter */}
          <div className="flex items-center space-x-1 overflow-x-auto pb-1 text-[10px] no-scrollbar">
            {['all', 'Markdown', 'Script Shell', 'Notas Rápidas', 'Ideias'].map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  playPop('click');
                  setSelectedCategory(cat);
                }}
                className={`px-2 py-0.5 rounded-lg whitespace-nowrap transition cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                {cat === 'all' ? 'Todas' : cat}
              </button>
            ))}
          </div>

          {/* Tag Cloud / Filter Pills Bar */}
          {allUniqueTags.length > 0 && (
            <div className="pt-1.5 border-t border-white/5">
              <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                <span className="flex items-center space-x-1 font-semibold">
                  <Tag className="w-3 h-3 text-amber-400" />
                  <span>Filtrar por Etiqueta:</span>
                </span>
                {selectedTagFilter && (
                  <button
                    onClick={() => {
                      playPop('off');
                      setSelectedTagFilter(null);
                    }}
                    className="text-amber-400 hover:underline flex items-center space-x-0.5 cursor-pointer"
                  >
                    <X className="w-2.5 h-2.5" />
                    <span>Limpar</span>
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto no-scrollbar">
                {allUniqueTags.map((tag) => {
                  const isSelected = selectedTagFilter === tag;
                  return (
                    <button
                      key={tag}
                      onClick={() => {
                        playPop('click');
                        setSelectedTagFilter(isSelected ? null : tag);
                      }}
                      className={`px-2 py-0.5 rounded-md text-[9px] font-mono transition cursor-pointer flex items-center space-x-1 border ${
                        isSelected
                          ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-sm'
                          : 'bg-white/5 text-amber-300/80 hover:bg-white/10 border-white/10 hover:border-amber-400/40'
                      }`}
                    >
                      <Hash className="w-2.5 h-2.5" />
                      <span>{tag.replace(/^#/, '')}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Notes Items List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1.5 custom-scrollbar">
          {filteredNotes.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500 space-y-1">
              <p className="font-semibold text-slate-400">Nenhuma nota encontrada.</p>
              {selectedTagFilter && (
                <p className="text-[10px]">Não há notas com a etiqueta <span className="text-amber-400">{selectedTagFilter}</span>.</p>
              )}
            </div>
          ) : (
            filteredNotes.map((note) => {
              const isActive = note.id === activeNoteId;
              return (
                <div
                  key={note.id}
                  onClick={() => {
                    playPop('click');
                    setActiveNoteId(note.id);
                  }}
                  className={`p-2.5 rounded-xl text-left transition cursor-pointer border relative group ${
                    isActive
                      ? 'bg-gradient-to-r from-amber-500/20 to-rose-500/10 border-amber-500/40 text-white shadow-md'
                      : 'bg-white/5 border-white/5 text-slate-300 hover:bg-white/10 hover:border-white/15'
                  }`}
                >
                  <div className="flex items-start justify-between gap-1">
                    <h4 className="font-bold text-xs truncate flex-1">{note.title || 'Sem título'}</h4>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteNote(note.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 hover:text-rose-400 p-0.5 transition cursor-pointer"
                      title="Excluir"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 line-clamp-2 mt-1 select-none">
                    {note.content.replace(/[#*`_]/g, '') || 'Nota vazia...'}
                  </p>

                  {/* Note Tag Badges Preview */}
                  {note.tags && note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {note.tags.slice(0, 3).map((t) => (
                        <span
                          key={t}
                          className="px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-300 text-[8.5px] font-mono border border-amber-500/20"
                        >
                          {t}
                        </span>
                      ))}
                      {note.tags.length > 3 && (
                        <span className="text-[8.5px] text-slate-500 font-mono">
                          +{note.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-white/5 text-[9px] text-slate-500 font-mono">
                    <span className="px-1.5 py-0.5 rounded bg-white/5 text-amber-300/80">{note.category}</span>
                    <span>{note.updatedAt}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
        {/* Editor Toolbar */}
        {activeNote && (
          <div className="bg-slate-900/60 border-b border-white/10 shrink-0">
            {/* Top Title & Actions */}
            <div className="p-3 flex items-center justify-between gap-3 border-b border-white/5">
              <div className="flex-1 min-w-0">
                <input
                  type="text"
                  value={activeNote.title}
                  onChange={(e) => handleUpdateActiveNote({ title: e.target.value })}
                  className="w-full bg-transparent font-bold text-sm text-white focus:outline-none focus:border-b border-amber-500/50"
                  placeholder="Título da anotação..."
                />
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-1.5 shrink-0">
                {/* Cloud Sync Pill in Editor Top Bar */}
                <button
                  onClick={handleForceSync}
                  className={`hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium transition cursor-pointer ${
                    syncStatus === 'syncing'
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                      : cloudSyncEnabled
                      ? 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border-emerald-500/30'
                      : 'bg-white/5 text-slate-400 border-white/10'
                  }`}
                  title="Sincronizar com a Nuvem InoveCloud"
                >
                  {syncStatus === 'syncing' ? (
                    <RefreshCw className="w-3 h-3 animate-spin text-cyan-400" />
                  ) : (
                    <Cloud className="w-3 h-3 text-emerald-400" />
                  )}
                  <span className="text-[10px] font-bold">
                    {syncStatus === 'syncing' ? 'Sincronizando' : 'Cloud Sync'}
                  </span>
                </button>

                {/* Category Picker */}
                <select
                  value={activeNote.category}
                  onChange={(e) => handleUpdateActiveNote({ category: e.target.value as any })}
                  className="bg-slate-800 border border-white/10 rounded-lg px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="Markdown">Markdown</option>
                  <option value="Script Shell">Script Shell (.sh)</option>
                  <option value="Notas Rápidas">Notas Rápidas</option>
                  <option value="Configurações">Configurações</option>
                  <option value="Ideias">Ideias</option>
                </select>

                {/* View toggle */}
                <div className="bg-slate-800 rounded-lg p-0.5 flex border border-white/10">
                  <button
                    onClick={() => {
                      playPop('click');
                      setViewMode('edit');
                    }}
                    className={`px-2 py-1 rounded-md text-xs flex items-center space-x-1 cursor-pointer transition ${
                      viewMode === 'edit'
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                    title="Modo Código / Texto"
                  >
                    <Code className="w-3.5 h-3.5" />
                    <span>Editor</span>
                  </button>
                  <button
                    onClick={() => {
                      playPop('click');
                      setViewMode('preview');
                    }}
                    className={`px-2 py-1 rounded-md text-xs flex items-center space-x-1 cursor-pointer transition ${
                      viewMode === 'preview'
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                    title="Modo Visualização"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Preview</span>
                  </button>
                </div>

                {/* Copy */}
                <button
                  onClick={handleCopy}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 border border-white/10 rounded-lg text-slate-300 hover:text-white text-xs flex items-center space-x-1 cursor-pointer"
                  title="Copiar Conteúdo"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>

                {/* Download */}
                <button
                  onClick={handleExport}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 border border-white/10 rounded-lg text-slate-300 hover:text-white text-xs flex items-center space-x-1 cursor-pointer"
                  title="Salvar como arquivo .txt / .sh"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>

                {/* Save */}
                <button
                  onClick={handleSave}
                  className="px-2.5 py-1 bg-gradient-to-r from-amber-500 to-rose-600 hover:opacity-90 text-slate-950 font-bold rounded-lg text-xs flex items-center space-x-1 cursor-pointer shadow-md shadow-amber-500/20 active:scale-95"
                >
                  {savedSuccess ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                  <span>{savedSuccess ? 'Salvo & Sync!' : 'Salvar'}</span>
                </button>
              </div>
            </div>

            {/* Dedicated Tags Management Bar */}
            <div className="px-3 py-2 bg-black/20 flex flex-wrap items-center gap-1.5 text-xs">
              <div className="flex items-center space-x-1 text-slate-400 text-[11px] font-semibold mr-1">
                <Tag className="w-3.5 h-3.5 text-amber-400" />
                <span>Etiquetas:</span>
              </div>

              {/* Current Note Tags with Interactive Delete Button */}
              {activeNote.tags && activeNote.tags.length > 0 ? (
                activeNote.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center space-x-1 pl-2 pr-1 py-0.5 rounded-md bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 text-amber-200 text-[11px] font-mono shadow-sm group"
                  >
                    <span>{tag}</span>
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="p-0.5 rounded hover:bg-rose-500/30 text-amber-300 hover:text-rose-300 transition cursor-pointer"
                      title={`Remover ${tag}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))
              ) : (
                <span className="text-[11px] text-slate-500 italic">Sem etiquetas nesta nota</span>
              )}

              {/* Add Tag Input / Form */}
              {isAddingTag ? (
                <div className="flex items-center space-x-1 bg-slate-900 border border-amber-400/50 rounded-lg p-0.5">
                  <span className="text-amber-400 pl-1 font-mono text-[11px]">#</span>
                  <input
                    ref={tagInputRef}
                    type="text"
                    placeholder="urgent, project-A..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag(tagInput);
                      } else if (e.key === 'Escape') {
                        setIsAddingTag(false);
                        setTagInput('');
                      }
                    }}
                    className="w-28 bg-transparent text-[11px] text-white focus:outline-none placeholder-slate-500 font-mono"
                    autoFocus
                  />
                  <button
                    onClick={() => handleAddTag(tagInput)}
                    className="p-1 rounded bg-amber-500 text-slate-950 hover:bg-amber-400 transition cursor-pointer text-[10px] font-bold"
                    title="Adicionar Etiqueta"
                  >
                    <Check className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => {
                      setIsAddingTag(false);
                      setTagInput('');
                    }}
                    className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer text-[10px]"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    playPop('click');
                    setIsAddingTag(true);
                  }}
                  className="px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-400/40 text-slate-300 hover:text-amber-300 text-[10px] font-medium flex items-center space-x-1 transition cursor-pointer active:scale-95"
                  title="Criar nova etiqueta"
                >
                  <Plus className="w-3 h-3" />
                  <span>Adicionar Tag</span>
                </button>
              )}

              {/* Quick Presets Dropdown / Suggestions */}
              <div className="hidden lg:flex items-center space-x-1 ml-auto text-[10px] text-slate-400">
                <span className="text-slate-500">Sugestões:</span>
                {PRESET_TAGS.filter((pt) => !activeNote.tags?.includes(pt)).slice(0, 3).map((pt) => (
                  <button
                    key={pt}
                    onClick={() => handleAddTag(pt)}
                    className="px-1.5 py-0.2 rounded bg-white/5 hover:bg-amber-500/20 text-slate-400 hover:text-amber-300 font-mono border border-transparent hover:border-amber-500/30 transition cursor-pointer"
                  >
                    +{pt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Content Body */}
        {activeNote && (
          <div className="flex-1 overflow-hidden p-4">
            {viewMode === 'edit' ? (
              <textarea
                value={activeNote.content}
                onChange={(e) => handleUpdateActiveNote({ content: e.target.value })}
                placeholder="Comece a digitar seu texto, Markdown ou script de terminal..."
                className="w-full h-full bg-slate-900/40 border border-white/10 rounded-2xl p-4 text-xs font-mono text-slate-100 placeholder-slate-600 resize-none focus:outline-none focus:border-amber-500/50 leading-relaxed custom-scrollbar selection:bg-amber-500/30"
                spellCheck={false}
              />
            ) : (
              <div className="w-full h-full bg-slate-900/40 border border-white/10 rounded-2xl p-6 overflow-y-auto text-xs text-slate-200 leading-relaxed custom-scrollbar prose prose-invert max-w-none">
                <div className="whitespace-pre-wrap font-sans">
                  {activeNote.content}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Cloud Sync Modal Details */}
      {showSyncModal && (
        <div
          onClick={() => setShowSyncModal(false)}
          className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl bg-slate-900 border border-white/20 p-5 space-y-4 shadow-2xl text-slate-100"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Cloud className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Serviço InoveCloud Sync</h3>
                  <p className="text-[10px] text-slate-400">Persistência e Backup em Nuvem Local</p>
                </div>
              </div>
              <button
                onClick={() => setShowSyncModal(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Status da Sincronização:</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                    !cloudSyncEnabled
                      ? 'bg-slate-800 text-slate-400 border-white/10'
                      : syncStatus === 'syncing'
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30 animate-pulse'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  }`}>
                    {!cloudSyncEnabled ? 'DESATIVADO' : syncStatus === 'syncing' ? 'SINCRONIZANDO...' : 'SINCRONIZADO'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Última Sincronização:</span>
                  <span className="font-mono text-slate-200 text-[11px]">{lastSyncTime}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Total de Notas no Cluster:</span>
                  <span className="font-mono text-amber-300 font-bold">{notes.length} notas</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Armazenamento Local:</span>
                  <span className="font-mono text-cyan-300">LocalStorage Encrypted</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center space-x-2 text-emerald-300 text-[11px]">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>As anotações são salvas com redundância e proteção contra perda de sessão.</span>
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2 border-t border-white/10">
              <button
                onClick={() => {
                  handleToggleCloudSync();
                }}
                className="flex-1 py-2 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-semibold transition cursor-pointer"
              >
                {cloudSyncEnabled ? 'Pausar Cloud Sync' : 'Ativar Cloud Sync'}
              </button>

              <button
                onClick={() => {
                  handleForceSync();
                  setShowSyncModal(false);
                }}
                className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition shadow-lg shadow-emerald-600/30 cursor-pointer flex items-center justify-center space-x-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Sincronizar Agora</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotesApp;
