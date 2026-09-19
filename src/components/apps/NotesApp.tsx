import React, { useState, useEffect } from 'react';
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
  Sparkles
} from 'lucide-react';
import { useSoundEffects } from '../../context/SoundEffectsContext';

export interface NoteItem {
  id: string;
  title: string;
  category: 'Markdown' | 'Script Shell' | 'Notas Rápidas' | 'Configurações' | 'Ideias';
  content: string;
  updatedAt: string;
  isPinned?: boolean;
}

const DEFAULT_NOTES: NoteItem[] = [
  {
    id: 'note-welcome',
    title: 'Bem-vindo ao InoveCloud OS (v1.0 Beta)',
    category: 'Markdown',
    updatedAt: 'Hoje, 12:00',
    isPinned: true,
    content: `# 🚀 InoveCloud OS Puro Kernel & Liquid Glass
Bem-vindo ao **InoveCloud OS**, a plataforma em nuvem e sistema operacional baseada em Debian 13 (Trixie) e KVM Hypervisor de alta performance.

### 🌟 Destaques desta Versão Beta:
- **Liquid Glass UI**: Interface de vidro líquido com desfoque e refração óptica em tempo real.
- **Física Spring com Framer Motion**: Movimentos ultrafluidos em todas as janelas, atalhos e gavetas.
- **Sintetizador Web Audio API**: Efeitos sonoros "Pop" com zero latência em todos os interruptores.
- **Kernel Linux Nativo**: Suporte a debootstrap, ISO Live, KVM Virtual Nodes, terminal interativo e Docker.
- **Ecossistema Completo**: Armazenamento em nuvem, IDaaS SSO, monitor de hardware, estúdio de áudio DAW, câmera HD e muito mais!

> *InoveCloud OS — Potência corporativa, elegância pura.*`
  },
  {
    id: 'note-kernel-script',
    title: 'script-deploy-kvm.sh',
    category: 'Script Shell',
    updatedAt: 'Ontem, 16:45',
    content: `#!/usr/bin/env bash
# InoveCloud Node Deployment Script
set -euo pipefail

echo "==> Inicializando Hypervisor KVM no InoveCloud OS..."
modprobe kvm
modprobe kvm_intel || modprobe kvm_amd

echo "==> Verificando aceleração de hardware e DMA..."
lscpu | grep -E "Virtualization|Hypervisor"

echo "==> Provisionando Bridge br0 para 10Gbps..."
ip link add name br0 type bridge
ip link set dev eth0 master br0
ip link set dev br0 up

echo "==> Sucesso! Nó pronto para inicializar VMs e containers."`
  },
  {
    id: 'note-roadmap',
    title: 'Roadmap de Lançamento Beta',
    category: 'Ideias',
    updatedAt: 'Há 2 dias',
    content: `## 📌 Itens do Lançamento Beta InoveCloud OS:
1. [x] Interface Liquid Glass com Animações Spring
2. [x] Efeitos sonoros Pop com sintetizador Web Audio
3. [x] Bloco de Notas & Editor de Código Integrado
4. [x] Gerenciador de Áreas de Trabalho Virtuais
5. [x] Sistema de Notificações Toast do Sistema
6. [x] Atalhos Globais de Teclado (Win+Space, Win+T, etc.)
7. [ ] Divulgação Oficial da Primeira Versão Beta Pública`
  }
];

export const NotesApp: React.FC = () => {
  const { playPop } = useSoundEffects();
  const [notes, setNotes] = useState<NoteItem[]>(() => {
    try {
      const saved = localStorage.getItem('inovecloud_notes_items');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_NOTES;
  });

  const [activeNoteId, setActiveNoteId] = useState<string>(DEFAULT_NOTES[0].id);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');
  const [copied, setCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const activeNote = notes.find((n) => n.id === activeNoteId) || notes[0];

  useEffect(() => {
    try {
      localStorage.setItem('inovecloud_notes_items', JSON.stringify(notes));
    } catch (e) {
      console.error(e);
    }
  }, [notes]);

  const handleCreateNote = () => {
    playPop('on');
    const newNote: NoteItem = {
      id: `note-${Date.now()}`,
      title: 'Nova Nota sem Título',
      category: 'Notas Rápidas',
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
    const matchesSearch =
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat =
      selectedCategory === 'all' || note.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="flex h-full w-full bg-slate-950 text-slate-100 font-sans overflow-hidden select-none">
      {/* Sidebar List */}
      <div className="w-72 bg-slate-900/80 border-r border-white/10 flex flex-col shrink-0">
        {/* Header */}
        <div className="p-3.5 border-b border-white/10 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-rose-600 flex items-center justify-center shadow-lg shadow-amber-500/20 text-white font-bold">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-white tracking-wide">Notas & Código</h2>
                <p className="text-[10px] text-slate-400">Editor InoveCloud</p>
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

          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar anotações..."
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
        </div>

        {/* Notes Items List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1.5 custom-scrollbar">
          {filteredNotes.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">
              Nenhuma nota encontrada.
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
          <div className="p-3 bg-slate-900/60 border-b border-white/10 flex items-center justify-between gap-3 shrink-0">
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
              {/* Category Picker */}
              <select
                value={activeNote.category}
                onChange={(e) => handleUpdateActiveNote({ category: e.target.value as any })}
                className="bg-slate-800 border border-white/10 rounded-lg px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
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
                <span>{savedSuccess ? 'Salvo!' : 'Salvar'}</span>
              </button>
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
    </div>
  );
};
