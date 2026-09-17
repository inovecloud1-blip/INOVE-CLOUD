import React, { useState, useRef, useEffect } from 'react';
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
  Trash2,
  FolderPlus,
  FileText,
  FileCode,
  FileArchive,
  Image as ImageIcon,
  CheckCircle,
  Eye,
  X,
  Sliders,
  Maximize2,
  Edit3,
  Save,
  Plus,
  Play,
  Pause,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Sun,
  Copy,
  Terminal,
  Info,
  Disc,
  Layers,
  Music as MusicIcon,
  Film as FilmIcon,
  Usb,
  RefreshCw,
  Check,
  CornerUpLeft,
  AlertTriangle,
  FolderTree,
  FileSpreadsheet
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { StorageItem, AppId } from '../../types';
import { LinuxStorageDevicesView } from './LinuxStorageDevicesView';

interface StorageAppProps {
  photos?: StorageItem[];
  files?: StorageItem[];
  onUploadFile?: (item: StorageItem) => void;
  onOpenApp?: (appId: AppId, params?: any) => void;
}

export const StorageApp: React.FC<StorageAppProps> = ({
  photos = [],
  files = [],
  onUploadFile,
  onOpenApp,
}) => {
  // Navigation, mode and active folder
  const [appMode, setAppMode] = useState<'browser' | 'hardware'>('browser');
  const [activeSidebar, setActiveSidebar] = useState<string>('downloads');
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [history, setHistory] = useState<(string | null)[]>([null]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const [viewLayout, setViewLayout] = useState<'grid' | 'list'>('grid');
  const [iconSize, setIconSize] = useState<number>(76);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<StorageItem | null>(null);

  // USB & Physical Drives State
  const [isUsbMounted, setIsUsbMounted] = useState<boolean>(true);
  const [usbCapacity] = useState({ used: '14.2 GB', total: '64.0 GB', label: 'KINGSTON USB 3.2' });
  const [mountedPhysicalDrives, setMountedPhysicalDrives] = useState<Array<{ id: string; name: string; handle: any; itemCount: number }>>([]);

  // Modals & Viewers
  const [editingItem, setEditingItem] = useState<StorageItem | null>(null);
  const [editorContent, setEditorContent] = useState<string>('');
  const [editorFilename, setEditorFilename] = useState<string>('');
  
  // Dedicated Media Previewer Modal (Local InoveCloud Media Viewer)
  const [mediaViewerItem, setMediaViewerItem] = useState<StorageItem | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [showNewFileModal, setShowNewFileModal] = useState(false);
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [showEmptyTrashConfirm, setShowEmptyTrashConfirm] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [newFileType, setNewFileType] = useState<'document' | 'code' | 'folder'>('document');
  const [newFolderName, setNewFolderName] = useState('');

  // Image Viewer state inside previewer
  const [imgRotation, setImgRotation] = useState(0);
  const [imgZoom, setImgZoom] = useState(1);
  const [imgBrightness, setImgBrightness] = useState(100);

  // Drag over state for accepting drag-and-drop files directly onto folder
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // Notification Toast
  const [toast, setToast] = useState<{ type: 'success' | 'info' | 'error' | 'warning'; message: string } | null>(null);

  // Hidden native file input for local disk / USB import
  const fileInputRef = useRef<HTMLInputElement>(null);

  const notify = (type: 'success' | 'info' | 'error' | 'warning', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  // Initial rich items representing a true standalone Linux PC file system
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
      content: `#!/usr/bin/env bash\n# Script de Deploy e Inicialização de Serviços InoveCloud OS\nset -euo pipefail\n\necho "[InoveCloud] Atualizando pacotes locais..."\nsudo apt-get update -y\n\necho "[InoveCloud] Verificando serviços do systemd..."\nsystemctl status NetworkManager || true\nsystemctl status pipewire || true\n\necho "✓ Deploy concluído com sucesso no Kernel Linux!"`,
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
      content: `// Verificador de integridade do cluster InoveCloud\nconst http = require('http');\n\nconst server = http.createServer((req, res) => {\n  res.writeHead(200, { 'Content-Type': 'application/json' });\n  res.end(JSON.stringify({\n    status: 'online',\n    timestamp: new Date().toISOString(),\n    host: 'inovecloud-kernel'\n  }));\n});\n\nserver.listen(8080, () => {\n  console.log('Monitor ativo na porta 8080');\n});`,
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
      id: 'media-audio-1',
      name: 'Synthwave_Odyssey_2026.mp3',
      type: 'audio',
      size: '6.4 MB',
      date: 'Ontem',
      source: 'local',
      folder: 'music',
      previewUrl: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3',
      tags: ['Música', 'Hi-Fi'],
      duration: '3:45',
      artist: 'InoveCloud Sounds',
    },
    {
      id: 'media-video-1',
      name: 'Cyberpunk_City_4K.mp4',
      type: 'video',
      size: '34.8 MB',
      date: 'Hoje, 08:30',
      source: 'local',
      folder: 'videos',
      previewUrl: 'https://assets.mixkit.co/videos/preview/mixkit-futuristic-city-with-neon-lights-and-flying-cars-42861-large.mp4',
      tags: ['Vídeo', '4K UHD'],
      duration: '0:15',
    },
    // USB Pendrive Pre-Loaded Files
    {
      id: 'usb-file-1',
      name: 'Apresentacao_InoveCloud_OS.pdf',
      type: 'document',
      size: '8.4 MB',
      date: '14/09/2026',
      source: 'usb',
      folder: 'usb_drive',
      isUsb: true,
      tags: ['PenDrive', 'USB 3.2', 'PDF'],
      content: 'Documento executivo sobre o InoveCloud OS Standalone Linux Kernel 6.12+.',
    },
    {
      id: 'usb-file-2',
      name: 'firmware_kernel_patch.bin',
      type: 'code',
      size: '1.2 MB',
      date: '12/09/2026',
      source: 'usb',
      folder: 'usb_drive',
      isUsb: true,
      tags: ['PenDrive', 'Firmware', 'Binário'],
      content: '# InoveCloud Kernel Patch Binary\n0x00A1F4 0x8899BB 0xFF1200\nCHECKSUM: OK',
    },
    {
      id: 'usb-file-3',
      name: 'Cybernetic_Dream_Track.mp3',
      type: 'audio',
      size: '5.2 MB',
      date: '10/09/2026',
      source: 'usb',
      folder: 'usb_drive',
      isUsb: true,
      tags: ['PenDrive', 'Música'],
      previewUrl: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3',
      duration: '2:50',
      artist: 'Antigravity Chill',
    },
    {
      id: 'usb-file-4',
      name: 'Foto_Drone_Emerald_Peak.jpg',
      type: 'photo',
      size: '7.1 MB',
      date: '08/09/2026',
      source: 'usb',
      folder: 'usb_drive',
      isUsb: true,
      previewUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1000',
      tags: ['PenDrive', 'Foto 4K'],
    },
    // Trash Item Example
    {
      id: 'trash-item-old-log',
      name: 'antigo_syslog_debug.log',
      type: 'document',
      size: '420 KB',
      date: '05/09/2026',
      source: 'local',
      folder: 'trash',
      originalFolder: 'downloads',
      isTrash: true,
      deletedAt: 'Ontem, 14:20',
      tags: ['Lixeira', 'Log'],
      content: '[2026-09-05] Kernel boot OK. Initializing InoveCloud DRM subsystem...',
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

  // Process imported local files from disk or USB
  const handleProcessIncomingFiles = (fileList: FileList | File[]) => {
    if (!fileList || fileList.length === 0) return;

    const targetFolder = activeSidebar === 'trash' ? 'downloads' : activeSidebar;

    for (let i = 0; i < fileList.length; i++) {
      const f = fileList[i];
      const isImg = f.type.startsWith('image/') || /\.(jpe?g|png|webp|gif|svg)$/i.test(f.name);
      const isAudio = f.type.startsWith('audio/') || /\.(mp3|wav|ogg|flac|m4a|aac)$/i.test(f.name);
      const isVideo = f.type.startsWith('video/') || /\.(mp4|webm|mkv|mov|avi)$/i.test(f.name);
      const isCode = /\.(js|ts|tsx|jsx|json|sh|bash|py|rs|go|c|cpp|h|css|html|yaml|yml|sql)$/i.test(f.name);
      const isIso = f.name.endsWith('.iso');

      const sizeStr =
        f.size > 1024 * 1024
          ? `${(f.size / (1024 * 1024)).toFixed(1)} MB`
          : `${Math.round(f.size / 1024)} KB`;

      let previewUrl: string | undefined = undefined;
      if (isImg || isAudio || isVideo) {
        previewUrl = URL.createObjectURL(f);
      }

      const reader = new FileReader();
      const isText = f.type.startsWith('text/') || isCode || f.name.endsWith('.md') || f.name.endsWith('.txt');

      const newItemId = `local-file-${Date.now()}-${i}`;
      const now = 'Hoje, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      if (isText) {
        reader.onload = (event) => {
          const textContent = (event.target?.result as string) || '';
          const newItem: StorageItem = {
            id: newItemId,
            name: f.name,
            type: isCode ? 'code' : 'document',
            size: sizeStr,
            date: now,
            source: targetFolder === 'usb_drive' ? 'usb' : 'local',
            folder: targetFolder,
            tags: [targetFolder === 'usb_drive' ? 'USB' : 'Local', 'Disco'],
            content: textContent,
            isUsb: targetFolder === 'usb_drive',
          };
          setCustomItems((prev) => [newItem, ...prev]);
          if (onUploadFile) onUploadFile(newItem);
        };
        reader.readAsText(f);
      } else {
        const newItem: StorageItem = {
          id: newItemId,
          name: f.name,
          type: isImg ? 'photo' : isAudio ? 'audio' : isVideo ? 'video' : isIso ? 'iso' : 'document',
          size: sizeStr,
          date: now,
          source: targetFolder === 'usb_drive' ? 'usb' : 'local',
          folder: targetFolder,
          tags: [targetFolder === 'usb_drive' ? 'USB' : 'Local', 'Disco'],
          previewUrl,
          isUsb: targetFolder === 'usb_drive',
        };
        setCustomItems((prev) => [newItem, ...prev]);
        if (onUploadFile) onUploadFile(newItem);
      }
    }

    notify('success', `${fileList.length} arquivo(s) adicionado(s) com sucesso a "${targetFolder}"!`);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleProcessIncomingFiles(e.dataTransfer.files);
    }
  };

  // Open / View File with Local InoveCloud System Applications
  const handleOpenFile = (item: StorageItem) => {
    if (item.isTrash) {
      // In trash, prompt user to restore
      setSelectedItem(item);
      notify('info', `Arquivo "${item.name}" está na Lixeira. Clique em "Restaurar" para usá-lo.`);
      return;
    }

    if (item.type === 'folder') {
      const nextHistory = history.slice(0, historyIndex + 1);
      nextHistory.push(item.id);
      setHistory(nextHistory);
      setHistoryIndex(nextHistory.length - 1);
      setCurrentFolderId(item.id);
      return;
    }

    // Media Routing to Local InoveCloud Apps
    if (item.type === 'photo' || /\.(jpe?g|png|webp|gif|svg)$/i.test(item.name)) {
      setMediaViewerItem(item);
      setImgRotation(0);
      setImgZoom(1);
      setImgBrightness(100);
      return;
    }

    if (item.type === 'audio' || /\.(mp3|wav|ogg|flac)$/i.test(item.name)) {
      setMediaViewerItem(item);
      setIsPlayingAudio(true);
      return;
    }

    if (item.type === 'video' || /\.(mp4|webm|mkv|mov)$/i.test(item.name)) {
      setMediaViewerItem(item);
      return;
    }

    // Default: Code or Document editor
    setEditingItem(item);
    setEditorFilename(item.name);
    setEditorContent(item.content || '');
    setImgRotation(0);
    setImgZoom(1);
    setImgBrightness(100);
  };

  // Open with full desktop window app
  const handleLaunchDedicatedApp = (appId: AppId, item: StorageItem) => {
    if (onOpenApp) {
      onOpenApp(appId, { item });
      notify('info', `Abrindo "${item.name}" no aplicativo ${appId.toUpperCase()}...`);
    }
  };

  // Save changes in Code/Text Editor
  const handleSaveFile = async () => {
    if (!editingItem) return;

    const updatedSize = `${Math.max(1, parseFloat((editorContent.length / 1024).toFixed(1)))} KB`;
    const now = 'Hoje, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // If item is backed by a real physical USB/Disk FileSystemHandle, write to hardware!
    if (editingItem.fileHandle) {
      try {
        const writable = await editingItem.fileHandle.createWritable();
        await writable.write(editorContent);
        await writable.close();
        notify('success', `Alterações gravadas no dispositivo USB / HD Físico com sucesso!`);
      } catch (err) {
        console.warn('Erro ao salvar no arquivo físico:', err);
      }
    }

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

    notify('success', `Arquivo "${editorFilename}" salvo no disco!`);
    setEditingItem((prev) => (prev ? { ...prev, name: editorFilename, content: editorContent, size: updatedSize, date: now } : null));
  };

  // Move file to Trash (Lixeira) or Permanent Delete
  const handleDeleteItem = async (id: string, name: string) => {
    const item = customItems.find((i) => i.id === id);
    if (!item) return;

    // If item is backed by a real physical USB/Disk directory handle, remove from physical disk
    if (item.dirHandle && (item.isTrash || activeSidebar === 'trash')) {
      try {
        await item.dirHandle.removeEntry(item.name);
        notify('warning', `Arquivo físico "${name}" removido do Pen Drive / HD!`);
      } catch (err) {
        console.warn('Erro ao remover do disco físico:', err);
      }
    }

    if (item.isTrash || activeSidebar === 'trash') {
      // Permanent deletion
      setCustomItems((prev) => prev.filter((i) => i.id !== id));
      if (selectedItem?.id === id) setSelectedItem(null);
      if (editingItem?.id === id) setEditingItem(null);
      if (mediaViewerItem?.id === id) setMediaViewerItem(null);
      notify('warning', `"${name}" foi excluído PERMANENTEMENTE do disco.`);
    } else {
      // Move to Trash
      const now = 'Hoje, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setCustomItems((prev) =>
        prev.map((i) =>
          i.id === id
            ? {
                ...i,
                isTrash: true,
                originalFolder: i.folder || activeSidebar,
                folder: 'trash',
                deletedAt: now,
              }
            : i
        )
      );
      if (selectedItem?.id === id) setSelectedItem(null);
      notify('info', `"${name}" movido para a Lixeira.`);
    }
  };

  // Mount Real Physical Directory from User's PC (File System Access API)
  const handleMountDirectoryHandle = async (dirHandle: any, dirName: string) => {
    try {
      const driveId = `phys_drive_${Date.now()}`;
      const items: StorageItem[] = [];

      for await (const [name, entry] of (dirHandle as any).entries()) {
        if (entry.kind === 'file') {
          const file = await entry.getFile();
          const isImg = /\.(jpe?g|png|webp|gif|svg)$/i.test(name);
          const isAudio = /\.(mp3|wav|ogg|flac)$/i.test(name);
          const isVideo = /\.(mp4|webm|mkv|mov)$/i.test(name);
          const isCode = /\.(ts|js|jsx|tsx|json|sh|py|html|css|md|txt|yaml|yml)$/i.test(name);
          let content = '';
          let previewUrl = '';

          if (isImg || isAudio || isVideo) {
            previewUrl = URL.createObjectURL(file);
          } else if (isCode || file.size < 500000) {
            try {
              content = await file.text();
            } catch (e) {
              content = `[Arquivo binário / ${file.size} bytes]`;
            }
          }

          items.push({
            id: `phys-${driveId}-${name}`,
            name: name,
            type: isImg ? 'photo' : isAudio ? 'audio' : isVideo ? 'video' : isCode ? 'code' : 'document',
            size: `${(file.size / 1024).toFixed(1)} KB`,
            date: new Date(file.lastModified).toLocaleDateString('pt-BR'),
            source: 'usb',
            folder: driveId,
            tags: ['USB Físico', 'Hardware Real'],
            isUsb: true,
            content,
            previewUrl,
            fileHandle: entry,
            dirHandle: dirHandle,
          });
        } else if (entry.kind === 'directory') {
          items.push({
            id: `phys-${driveId}-${name}`,
            name: name,
            type: 'folder',
            size: '--',
            date: 'Hoje',
            source: 'usb',
            folder: driveId,
            tags: ['Pasta USB Real'],
            isUsb: true,
            dirHandle: entry,
          });
        }
      }

      setMountedPhysicalDrives((prev) => [
        ...prev,
        { id: driveId, name: dirName || 'Pen Drive USB Físico', handle: dirHandle, itemCount: items.length },
      ]);

      setCustomItems((prev) => [...items, ...prev]);
      setActiveSidebar(driveId);
      setAppMode('browser');
      notify('success', `Unidade "${dirName}" montada com ${items.length} arquivo(s) carregados!`);
    } catch (err) {
      console.warn('Erro ao ler arquivos da unidade física:', err);
      notify('error', 'Falha ao ler arquivos da unidade física.');
    }
  };

  // Trigger File System Access Directory Picker from UI
  const handleMountPhysicalDrive = async () => {
    if (typeof window === 'undefined' || !('showDirectoryPicker' in window)) {
      notify('error', 'Seu navegador não suporta a API nativa File System Access.');
      return;
    }

    try {
      const dirHandle = await (window as any).showDirectoryPicker({
        mode: 'readwrite',
        startIn: 'desktop',
      });

      if (dirHandle) {
        await handleMountDirectoryHandle(dirHandle, dirHandle.name);
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.warn('Erro ao montar diretório físico:', err);
      }
    }
  };

  // Safe Eject of Physical Mounted Drive
  const handleUnmountPhysicalDrive = (driveId: string) => {
    const drive = mountedPhysicalDrives.find((d) => d.id === driveId);
    setMountedPhysicalDrives((prev) => prev.filter((d) => d.id !== driveId));
    setCustomItems((prev) => prev.filter((i) => i.folder !== driveId));
    if (activeSidebar === driveId) {
      setActiveSidebar('downloads');
    }
    notify('warning', `Unidade "${drive?.name || 'USB'}" ejetada com segurança.`);
  };

  // Restore file from Trash
  const handleRestoreFromTrash = (item: StorageItem) => {
    const restoreFolder = item.originalFolder || 'downloads';
    setCustomItems((prev) =>
      prev.map((i) =>
        i.id === item.id
          ? {
              ...i,
              isTrash: false,
              folder: restoreFolder,
              deletedAt: undefined,
            }
          : i
      )
    );
    if (selectedItem?.id === item.id) setSelectedItem(null);
    notify('success', `"${item.name}" restaurado para "${restoreFolder}".`);
  };

  // Empty Trash Permanently
  const handleEmptyTrashPermanently = () => {
    setCustomItems((prev) => prev.filter((i) => !i.isTrash && i.folder !== 'trash'));
    setShowEmptyTrashConfirm(false);
    setSelectedItem(null);
    notify('warning', 'Lixeira esvaziada. Todos os arquivos excluídos permanentemente!');
  };

  // Create New File
  const handleCreateNewFile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName.trim()) return;

    let defaultContent = '';
    if (newFileName.endsWith('.md')) {
      defaultContent = `# ${newFileName.replace('.md', '')}\n\nEscreva seu texto aqui...`;
    } else if (newFileName.endsWith('.sh')) {
      defaultContent = `#!/usr/bin/env bash\n# Script do InoveCloud OS\nset -euo pipefail\n\necho "Executando script no Kernel..."\n`;
    } else if (newFileName.endsWith('.json')) {
      defaultContent = `{\n  "nome": "${newFileName}",\n  "criadoEm": "${new Date().toISOString()}"\n}`;
    } else if (newFileName.endsWith('.js') || newFileName.endsWith('.ts')) {
      defaultContent = `// ${newFileName}\nconsole.log("Olá do InoveCloud OS!");\n`;
    } else {
      defaultContent = `Novo arquivo criado em ${new Date().toLocaleString()}.\n`;
    }

    const targetFolder = activeSidebar === 'trash' ? 'downloads' : activeSidebar;
    const newItem: StorageItem = {
      id: `file-${Date.now()}`,
      name: newFileName.trim(),
      type: newFileType,
      size: `${Math.max(1, parseFloat((defaultContent.length / 1024).toFixed(1)))} KB`,
      date: 'Agora mesmo',
      source: targetFolder === 'usb_drive' ? 'usb' : 'local',
      folder: targetFolder,
      tags: ['Novo', 'Documento'],
      content: defaultContent,
      isUsb: targetFolder === 'usb_drive',
    };

    setCustomItems((prev) => [newItem, ...prev]);
    setShowNewFileModal(false);
    setNewFileName('');
    notify('success', `Arquivo "${newItem.name}" criado com sucesso!`);
    handleOpenFile(newItem);
  };

  // Create New Folder
  const handleCreateNewFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    const targetFolder = activeSidebar === 'trash' ? 'downloads' : activeSidebar;
    const newFolder: StorageItem = {
      id: `folder-${Date.now()}`,
      name: newFolderName.trim(),
      type: 'folder',
      size: '--',
      date: 'Agora mesmo',
      source: targetFolder === 'usb_drive' ? 'usb' : 'local',
      folder: targetFolder,
      tags: ['Pasta'],
      isUsb: targetFolder === 'usb_drive',
    };

    setCustomItems((prev) => [newFolder, ...prev]);
    setShowNewFolderModal(false);
    setNewFolderName('');
    notify('success', `Pasta "${newFolder.name}" criada com sucesso!`);
  };

  // Navigation History
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

  // Toggle USB Mount/Unmount
  const handleToggleUsb = () => {
    if (isUsbMounted) {
      setIsUsbMounted(false);
      if (activeSidebar === 'usb_drive') {
        setActiveSidebar('downloads');
      }
      notify('warning', 'Pen Drive USB 3.2 ejetado com segurança.');
    } else {
      setIsUsbMounted(true);
      setActiveSidebar('usb_drive');
      notify('success', 'Pen Drive USB 3.2 montado em /media/usb_drive.');
    }
  };

  // Trash count
  const trashItemsCount = customItems.filter((i) => i.isTrash || i.folder === 'trash').length;

  // Filter items based on active sidebar and search query
  const allFolderItems = [...customItems, ...files, ...photos];

  const filteredItems = allFolderItems.filter((item) => {
    // Trash filter isolation
    if (activeSidebar === 'trash') {
      if (!item.isTrash && item.folder !== 'trash') return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return item.name.toLowerCase().includes(q);
      }
      return true;
    }

    // If item is in trash, do not show in regular folders
    if (item.isTrash || item.folder === 'trash') {
      return false;
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return item.name.toLowerCase().includes(q) || item.tags?.some((t) => t.toLowerCase().includes(q));
    }

    if (activeSidebar === 'usb_drive') {
      return item.folder === 'usb_drive' || item.isUsb || item.source === 'usb';
    }
    if (activeSidebar === 'downloads') {
      return item.folder === 'downloads' || item.tags?.includes('Downloads') || item.type === 'iso';
    }
    if (activeSidebar === 'pictures') {
      return item.type === 'photo' || item.folder === 'pictures' || item.tags?.includes('Fotos') || item.tags?.includes('Wallpaper');
    }
    if (activeSidebar === 'music') {
      return item.type === 'audio' || item.folder === 'music' || item.tags?.includes('Música');
    }
    if (activeSidebar === 'videos') {
      return item.type === 'video' || item.folder === 'videos' || item.tags?.includes('Vídeo');
    }
    if (activeSidebar === 'documents') {
      return item.type === 'document' || item.type === 'code' || item.type === 'archive' || item.folder === 'documents';
    }
    if (activeSidebar === 'all_files') {
      return true;
    }
    return true;
  });

  // Editor stats
  const lineCount = editorContent ? editorContent.split('\n').length : 0;
  const wordCount = editorContent ? editorContent.trim().split(/\s+/).filter(Boolean).length : 0;
  const charCount = editorContent.length;

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex flex-col h-full bg-[#f3f4f6] text-[#1e293b] select-none font-sans overflow-hidden border border-black/20 rounded-xl shadow-2xl relative ${
        isDraggingOver ? 'ring-4 ring-blue-500 ring-inset bg-blue-50/50' : ''
      }`}
    >
      {/* Hidden File Picker Input for Importing from Local Files / USB */}
      <input
        type="file"
        ref={fileInputRef}
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files) handleProcessIncomingFiles(e.target.files);
        }}
      />

      {/* Drag overlay badge */}
      {isDraggingOver && (
        <div className="absolute inset-0 z-40 bg-blue-600/10 backdrop-blur-xs flex flex-col items-center justify-center pointer-events-none">
          <div className="p-6 bg-slate-900/90 text-white rounded-2xl shadow-2xl flex flex-col items-center space-y-2 border border-blue-400/40">
            <Upload className="w-10 h-10 text-blue-400 animate-bounce" />
            <p className="font-bold text-sm">Solte os arquivos para salvar em "{activeSidebar}"</p>
            <p className="text-xs text-slate-400">Armazenamento local direto no InoveCloud OS</p>
          </div>
        </div>
      )}

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
                : toast.type === 'warning'
                ? 'bg-amber-950/90 border-amber-500/40 text-amber-300'
                : 'bg-blue-950/90 border-blue-500/40 text-blue-300'
            }`}
          >
            <Info className="w-4 h-4 shrink-0" />
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. Header Navigation & Path Bar */}
      <div className="h-11 bg-gradient-to-b from-[#fafafa] to-[#e4e4e7] border-b border-[#cbd5e1] px-3 flex items-center justify-between text-xs shadow-xs shrink-0">
        <div className="flex items-center space-x-3">
          {/* Navigation Arrows */}
          <div className="flex items-center bg-white border border-[#cbd5e1] rounded-md shadow-2xs">
            <button
              onClick={handleGoBack}
              disabled={historyIndex === 0}
              className="px-2.5 py-1 text-slate-500 hover:text-black cursor-pointer border-r border-[#cbd5e1] disabled:opacity-40"
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

          {/* Mode Switcher Tabs: Browser vs Physical Hardware */}
          <div className="flex items-center bg-slate-200/80 p-0.5 rounded-lg border border-slate-300">
            <button
              onClick={() => setAppMode('browser')}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-md text-[11px] font-bold transition cursor-pointer ${
                appMode === 'browser'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Folder className="w-3.5 h-3.5 text-blue-600" />
              <span>Arquivos & Pastas</span>
            </button>
            <button
              onClick={() => setAppMode('hardware')}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-md text-[11px] font-bold transition cursor-pointer ${
                appMode === 'hardware'
                  ? 'bg-slate-900 text-emerald-300 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Usb className="w-3.5 h-3.5 text-emerald-500" />
              <span>Dispositivos & USBs (lsblk)</span>
            </button>
          </div>
        </div>

        {/* Current Path with Icon */}
        <div className="hidden sm:flex items-center space-x-1.5 font-bold text-[12.5px] text-[#0f172a]">
          {activeSidebar === 'trash' ? (
            <Trash2 className="w-4 h-4 text-rose-500" />
          ) : activeSidebar === 'usb_drive' || activeSidebar.startsWith('phys_') ? (
            <Usb className="w-4 h-4 text-emerald-600" />
          ) : (
            <Folder className="w-4 h-4 text-blue-500" />
          )}
          <span className="font-mono text-[11.5px] text-slate-600">/home/inove/</span>
          <span className="font-semibold text-slate-900 capitalize">
            {activeSidebar === 'downloads'
              ? 'Downloads'
              : activeSidebar === 'pictures'
              ? 'Imagens'
              : activeSidebar === 'documents'
              ? 'Documentos'
              : activeSidebar === 'music'
              ? 'Músicas'
              : activeSidebar === 'videos'
              ? 'Vídeos'
              : activeSidebar === 'usb_drive'
              ? 'media/usb_drive (Pen Drive)'
              : activeSidebar === 'trash'
              ? 'Lixeira (Recycle Bin)'
              : activeSidebar.startsWith('phys_')
              ? mountedPhysicalDrives.find((d) => d.id === activeSidebar)?.name || 'Pen Drive Físico'
              : 'Meus Arquivos'}
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
              className="w-36 sm:w-44 pl-7 pr-2 py-0.5 bg-white border border-[#cbd5e1] rounded-md text-xs text-black placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
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

      {/* 2. Action Toolbar */}
      <div className="h-10 bg-[#f8fafc] border-b border-[#e2e8f0] px-3 flex flex-wrap items-center justify-between text-xs gap-2 shrink-0">
        <div className="flex items-center space-x-2">
          {/* Layout segmented button */}
          <div className="flex items-center bg-[#e2e8f0] border border-[#cbd5e1] rounded-md overflow-hidden p-0.5 shadow-2xs">
            <button
              onClick={() => {
                setAppMode('browser');
                setViewLayout('grid');
              }}
              className={`px-2.5 py-0.5 rounded transition cursor-pointer ${
                appMode === 'browser' && viewLayout === 'grid'
                  ? 'bg-white shadow-xs text-black font-semibold'
                  : 'text-slate-600 hover:text-black'
              }`}
              title="Visualização em Ícones"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                setAppMode('browser');
                setViewLayout('list');
              }}
              className={`px-2.5 py-0.5 rounded transition cursor-pointer ${
                appMode === 'browser' && viewLayout === 'list'
                  ? 'bg-white shadow-xs text-black font-semibold'
                  : 'text-slate-600 hover:text-black'
              }`}
              title="Visualização em Lista"
            >
              <ListIcon className="w-3.5 h-3.5" />
            </button>
          </div>

          {activeSidebar !== 'trash' ? (
            <>
              {/* Botão Novo Arquivo */}
              <button
                onClick={() => setShowNewFileModal(true)}
                className="flex items-center space-x-1 px-2.5 py-1 rounded bg-white hover:bg-slate-50 border border-[#cbd5e1] text-[#0f172a] font-semibold text-[11px] shadow-2xs cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-emerald-600" />
                <span>+ Novo Arquivo</span>
              </button>

              {/* Botão Nova Pasta */}
              <button
                onClick={() => setShowNewFolderModal(true)}
                className="flex items-center space-x-1 px-2.5 py-1 rounded bg-white hover:bg-slate-50 border border-[#cbd5e1] text-[#0f172a] font-semibold text-[11px] shadow-2xs cursor-pointer"
              >
                <FolderPlus className="w-3.5 h-3.5 text-amber-600" />
                <span>+ Nova Pasta</span>
              </button>

              {/* Botão Conectar Pen Drive Real do PC */}
              <button
                onClick={handleMountPhysicalDrive}
                className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-900 font-bold text-[11px] shadow-2xs cursor-pointer"
                title="Conectar pasta ou Pen Drive real do seu computador diretamente ao InoveCloud OS"
              >
                <Usb className="w-3.5 h-3.5 text-emerald-600" />
                <span>Montar Pen Drive Real</span>
              </button>

              {/* Botão Importar Arquivos do Disco */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-white hover:bg-slate-50 border border-[#cbd5e1] text-[#0f172a] font-semibold text-[11px] shadow-2xs cursor-pointer"
                title="Importar arquivos do disco ou dispositivo USB para esta pasta"
              >
                <Download className="w-3.5 h-3.5 text-blue-600" />
                <span>Importar Arquivo</span>
              </button>
            </>
          ) : (
            /* Toolbar actions when in Trash (Lixeira) */
            <>
              <button
                onClick={() => setShowEmptyTrashConfirm(true)}
                disabled={trashItemsCount === 0}
                className="flex items-center space-x-1.5 px-3 py-1 rounded bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white font-bold text-[11px] shadow-sm cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Esvaziar Lixeira</span>
              </button>

              {selectedItem && selectedItem.isTrash && (
                <>
                  <button
                    onClick={() => handleRestoreFromTrash(selectedItem)}
                    className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] shadow-sm cursor-pointer"
                  >
                    <CornerUpLeft className="w-3.5 h-3.5" />
                    <span>Restaurar Selecionado</span>
                  </button>
                  <button
                    onClick={() => handleDeleteItem(selectedItem.id, selectedItem.name)}
                    className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-rose-300 font-bold text-[11px] shadow-sm cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Excluir Definitivo</span>
                  </button>
                </>
              )}
            </>
          )}
        </div>

        {/* System & Storage Status */}
        <div className="flex items-center space-x-2 text-[11px] text-slate-500">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
          <span className="font-medium font-mono text-[10.5px]">Linux VFS Storage • Ext4/exFAT Driver</span>
        </div>
      </div>

      {/* 3. Main Workspace: Sidebar + Folder Content or Hardware Devices View */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Finder Sidebar */}
        <div className="w-56 bg-[#f1f5f9] border-r border-[#e2e8f0] p-2 flex flex-col justify-between overflow-y-auto text-[11.5px] select-none shrink-0">
          <div className="space-y-4">
            {/* Favorites Group */}
            <div>
              <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Locais & Pastas
              </div>
              <div className="space-y-0.5">
                {[
                  { id: 'all_files', name: 'Todos os Arquivos', icon: Folder },
                  { id: 'documents', name: 'Documentos', icon: FileText },
                  { id: 'downloads', name: 'Downloads', icon: Download },
                  { id: 'pictures', name: 'Imagens & Fotos', icon: ImageIcon },
                  { id: 'music', name: 'Músicas & Áudio', icon: MusicIcon },
                  { id: 'videos', name: 'Vídeos', icon: FilmIcon },
                ].map((fav) => {
                  const Icon = fav.icon;
                  const isActive = appMode === 'browser' && activeSidebar === fav.id;
                  return (
                    <button
                      key={fav.id}
                      onClick={() => {
                        setAppMode('browser');
                        setActiveSidebar(fav.id);
                        setCurrentFolderId(null);
                      }}
                      className={`w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-left transition cursor-pointer ${
                        isActive
                          ? 'bg-blue-600 text-white font-semibold shadow-xs'
                          : 'text-slate-700 hover:bg-slate-200/60'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-blue-500'}`} />
                      <span className="truncate">{fav.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Devices & Disks Group (USB, NVMe & Physical Drives) */}
            <div>
              <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Dispositivos de Bloco</span>
                <button
                  onClick={() => setAppMode('hardware')}
                  className="text-[9px] text-blue-600 font-bold hover:underline cursor-pointer"
                >
                  Ver lsblk
                </button>
              </div>
              <div className="space-y-1">
                {/* NVMe Main Drive */}
                <div
                  onClick={() => {
                    setAppMode('browser');
                    setActiveSidebar('all_files');
                    setCurrentFolderId(null);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition cursor-pointer ${
                    appMode === 'browser' && activeSidebar === 'all_files'
                      ? 'bg-slate-200/80 font-semibold'
                      : 'hover:bg-slate-200/60 text-slate-700'
                  }`}
                >
                  <div className="flex items-center space-x-2 truncate">
                    <HardDrive className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                    <span className="truncate font-medium">NVMe OS (512 GB)</span>
                  </div>
                  <span className="text-[9px] text-emerald-600 font-mono">/dev/nvme</span>
                </div>

                {/* USB Pendrive Device */}
                <div
                  onClick={() => {
                    if (isUsbMounted) {
                      setAppMode('browser');
                      setActiveSidebar('usb_drive');
                      setCurrentFolderId(null);
                    }
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition cursor-pointer ${
                    appMode === 'browser' && activeSidebar === 'usb_drive'
                      ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                      : isUsbMounted
                      ? 'text-slate-700 hover:bg-emerald-50'
                      : 'text-slate-400 opacity-60'
                  }`}
                >
                  <div className="flex items-center space-x-2 truncate">
                    <Usb className={`w-3.5 h-3.5 shrink-0 ${appMode === 'browser' && activeSidebar === 'usb_drive' ? 'text-white' : 'text-emerald-600'}`} />
                    <div className="truncate">
                      <span className="truncate block font-medium">Pen Drive Kingston</span>
                      <span className={`text-[9px] block ${appMode === 'browser' && activeSidebar === 'usb_drive' ? 'text-emerald-100' : 'text-slate-400'}`}>
                        {isUsbMounted ? usbCapacity.label : 'Desconectado'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleUsb();
                    }}
                    className={`p-1 rounded text-[10px] font-bold ${
                      appMode === 'browser' && activeSidebar === 'usb_drive'
                        ? 'bg-emerald-700 text-white'
                        : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                    }`}
                    title={isUsbMounted ? 'Ejetar Pen Drive' : 'Montar Pen Drive'}
                  >
                    {isUsbMounted ? 'Ejetar' : 'Montar'}
                  </button>
                </div>

                {/* Real Physical Mounted Drives */}
                {mountedPhysicalDrives.map((drive) => {
                  const isActive = appMode === 'browser' && activeSidebar === drive.id;
                  return (
                    <div
                      key={drive.id}
                      onClick={() => {
                        setAppMode('browser');
                        setActiveSidebar(drive.id);
                        setCurrentFolderId(null);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition cursor-pointer border ${
                        isActive
                          ? 'bg-emerald-700 text-white font-semibold border-emerald-600 shadow-xs'
                          : 'bg-emerald-50/70 border-emerald-200 hover:bg-emerald-100 text-emerald-900'
                      }`}
                    >
                      <div className="flex items-center space-x-2 truncate">
                        <Usb className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-emerald-600'}`} />
                        <div className="truncate">
                          <span className="truncate block font-bold text-[11px]">{drive.name}</span>
                          <span className={`text-[9px] block ${isActive ? 'text-emerald-100' : 'text-emerald-700'}`}>
                            {drive.itemCount} arquivo(s) • Físico
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUnmountPhysicalDrive(drive.id);
                        }}
                        className={`p-1 rounded text-[10px] font-bold cursor-pointer ${
                          isActive
                            ? 'bg-emerald-800 text-emerald-200 hover:text-white'
                            : 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                        }`}
                        title="Ejetar Pen Drive Físico"
                      >
                        Ejetar
                      </button>
                    </div>
                  );
                })}

                {/* Quick Mount Real Drive Button */}
                <button
                  onClick={handleMountPhysicalDrive}
                  className="w-full mt-1.5 py-1.5 px-2 bg-white hover:bg-emerald-50 border border-dashed border-emerald-400 text-emerald-800 rounded-lg text-[10.5px] font-bold flex items-center justify-center space-x-1.5 transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Montar Pen Drive Real</span>
                </button>
              </div>
            </div>

            {/* Trash / Lixeira Group */}
            <div>
              <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Sistema
              </div>
              <button
                onClick={() => {
                  setAppMode('browser');
                  setActiveSidebar('trash');
                  setCurrentFolderId(null);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition cursor-pointer ${
                  appMode === 'browser' && activeSidebar === 'trash'
                    ? 'bg-rose-600 text-white font-semibold shadow-xs'
                    : 'text-slate-700 hover:bg-rose-50'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Trash2 className={`w-3.5 h-3.5 shrink-0 ${appMode === 'browser' && activeSidebar === 'trash' ? 'text-white' : 'text-rose-500'}`} />
                  <span>Lixeira</span>
                </div>
                {trashItemsCount > 0 && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      appMode === 'browser' && activeSidebar === 'trash' ? 'bg-white text-rose-600' : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    {trashItemsCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* USB & Drive Info Card */}
          {isUsbMounted && (
            <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-[10.5px] space-y-1 shadow-2xs mt-3">
              <div className="flex items-center justify-between font-bold text-slate-700">
                <span className="flex items-center gap-1">
                  <Usb className="w-3 h-3 text-emerald-600" /> Dispositivo USB
                </span>
                <span className="text-emerald-600 text-[10px]">Ativo</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: '22%' }} />
              </div>
              <div className="flex justify-between text-[9px] text-slate-400">
                <span>{usbCapacity.used} usados</span>
                <span>{usbCapacity.total}</span>
              </div>
            </div>
          )}
        </div>

        {/* Right Finder Main Grid or Hardware Devices View */}
        <div className="flex-1 bg-white overflow-y-auto">
          {appMode === 'hardware' ? (
            <div className="p-4 h-full">
              <LinuxStorageDevicesView
                onMountDirectoryHandle={handleMountDirectoryHandle}
                onOpenFolder={(folder) => {
                  setActiveSidebar(folder);
                  setAppMode('browser');
                }}
                onNotify={notify}
              />
            </div>
          ) : (
            <div className="p-4 h-full flex flex-col">
              {/* Trash Banner when active */}
              {activeSidebar === 'trash' && (
                <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-xs text-amber-900 shrink-0">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      <strong>Lixeira do InoveCloud OS:</strong> Arquivos aqui mantêm a pasta de origem e podem ser restaurados ou excluídos definitivamente.
                    </span>
                  </div>
                  {trashItemsCount > 0 && (
                    <button
                      onClick={() => setShowEmptyTrashConfirm(true)}
                      className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-[11px] shadow-sm cursor-pointer whitespace-nowrap ml-2"
                    >
                      Esvaziar Lixeira
                    </button>
                  )}
                </div>
              )}

          {filteredItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-3 py-12">
              {activeSidebar === 'trash' ? (
                <>
                  <Trash2 className="w-16 h-16 text-slate-300" />
                  <p className="text-sm font-semibold text-slate-600">A Lixeira está vazia</p>
                  <p className="text-xs text-slate-400">Nenhum item excluído no momento.</p>
                </>
              ) : (
                <>
                  <Folder className="w-16 h-16 text-blue-300" />
                  <p className="text-sm font-semibold text-slate-600">Esta pasta está vazia</p>
                  <p className="text-xs text-slate-400">Arraste arquivos para cá ou use os botões abaixo.</p>
                  <div className="flex items-center space-x-2 pt-2">
                    <button
                      onClick={() => setShowNewFileModal(true)}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow cursor-pointer"
                    >
                      + Criar Arquivo
                    </button>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 text-xs font-semibold shadow-xs cursor-pointer"
                    >
                      Importar Arquivo
                    </button>
                  </div>
                </>
              )}
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
                const isAudio = item.type === 'audio';
                const isVideo = item.type === 'video';
                const isCode = item.type === 'code';
                const isDoc = item.type === 'document';
                const isFolder = item.type === 'folder';

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    onDoubleClick={() => handleOpenFile(item)}
                    className={`group flex flex-col items-center p-2.5 rounded-2xl cursor-pointer transition select-none text-center relative ${
                      isSelected
                        ? 'bg-blue-500/15 border border-blue-500/40 shadow-sm'
                        : 'hover:bg-slate-100/80 border border-transparent'
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
                          className="w-full h-full object-cover rounded-xl shadow-md border border-black/10"
                        />
                      ) : isAudio ? (
                        <div className="w-12 h-14 bg-gradient-to-b from-rose-50 to-pink-100 border border-pink-300 rounded-xl shadow flex flex-col items-center justify-center text-pink-600">
                          <MusicIcon className="w-6 h-6" />
                          <span className="text-[8px] font-black uppercase tracking-wider mt-1 font-mono">
                            MP3
                          </span>
                        </div>
                      ) : isVideo ? (
                        <div className="w-12 h-14 bg-gradient-to-b from-purple-50 to-indigo-100 border border-indigo-300 rounded-xl shadow flex flex-col items-center justify-center text-indigo-600">
                          <FilmIcon className="w-6 h-6" />
                          <span className="text-[8px] font-black uppercase tracking-wider mt-1 font-mono">
                            4K VID
                          </span>
                        </div>
                      ) : isCode ? (
                        <div className="w-12 h-14 bg-gradient-to-b from-indigo-50 to-indigo-100 border border-indigo-300 rounded-xl shadow flex flex-col items-center justify-center text-indigo-700">
                          <FileCode className="w-6 h-6" />
                          <span className="text-[8px] font-black uppercase tracking-wider mt-1 font-mono">
                            {item.name.split('.').pop() || 'CODE'}
                          </span>
                        </div>
                      ) : isDoc ? (
                        <div className="w-12 h-14 bg-gradient-to-b from-slate-50 to-slate-100 border border-slate-300 rounded-xl shadow flex flex-col items-center justify-center text-slate-700">
                          <FileText className="w-6 h-6 text-blue-600" />
                          <span className="text-[8px] font-black uppercase tracking-wider mt-1 font-mono">
                            {item.name.split('.').pop() || 'DOC'}
                          </span>
                        </div>
                      ) : isFolder ? (
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
                      ) : (
                        <div className="w-12 h-14 bg-gradient-to-b from-slate-100 to-slate-200 border border-slate-300 rounded-xl shadow flex flex-col items-center justify-center text-slate-700">
                          <FileText className="w-6 h-6 text-slate-600" />
                          <span className="text-[8px] font-black uppercase tracking-wider mt-1 font-mono">
                            FILE
                          </span>
                        </div>
                      )}
                    </div>

                    {/* File / Folder Label */}
                    <span
                      className={`text-[12px] leading-tight break-words max-w-[120px] px-1.5 py-0.5 rounded ${
                        isSelected
                          ? 'bg-blue-600 text-white font-medium'
                          : 'text-[#0f172a] group-hover:text-black'
                      }`}
                    >
                      {item.name}
                    </span>

                    {/* Action button overlay on hover */}
                    <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 flex items-center space-x-1 transition">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenFile(item);
                        }}
                        className="p-1 bg-white/95 hover:bg-white rounded-md shadow border border-black/10 text-blue-600 transition cursor-pointer"
                        title="Abrir"
                      >
                        <Eye className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteItem(item.id, item.name);
                        }}
                        className="p-1 bg-white/95 hover:bg-rose-50 rounded-md shadow border border-black/10 text-rose-600 transition cursor-pointer"
                        title={item.isTrash ? 'Excluir definitivamente' : 'Mover para Lixeira'}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Classic List View */
            <div className="border border-[#cbd5e1] rounded-xl overflow-hidden bg-white shadow-2xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#f1f5f9] border-b border-[#cbd5e1] text-slate-600 font-semibold text-[11px]">
                  <tr>
                    <th className="p-2.5 pl-3">Nome</th>
                    <th className="p-2.5">Data de Modificação</th>
                    <th className="p-2.5">Tamanho</th>
                    <th className="p-2.5">Tipo</th>
                    <th className="p-2.5 text-right pr-3">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {filteredItems.map((item) => (
                    <tr
                      key={item.id}
                      onClick={() => setSelectedItem(item)}
                      onDoubleClick={() => handleOpenFile(item)}
                      className={`cursor-pointer transition ${
                        selectedItem?.id === item.id ? 'bg-blue-600 text-white font-medium' : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="p-2.5 pl-3 flex items-center space-x-2.5">
                        {item.type === 'code' ? (
                          <FileCode className="w-4 h-4 text-indigo-600 shrink-0" />
                        ) : item.type === 'photo' ? (
                          <ImageIcon className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : item.type === 'audio' ? (
                          <MusicIcon className="w-4 h-4 text-pink-600 shrink-0" />
                        ) : item.type === 'video' ? (
                          <FilmIcon className="w-4 h-4 text-purple-600 shrink-0" />
                        ) : item.type === 'folder' ? (
                          <Folder className="w-4 h-4 text-blue-500 shrink-0" />
                        ) : (
                          <FileText className="w-4 h-4 text-slate-500 shrink-0" />
                        )}
                        <span className="truncate font-medium">{item.name}</span>
                      </td>
                      <td className="p-2.5 text-slate-500">{item.deletedAt ? `Excluído: ${item.deletedAt}` : item.date}</td>
                      <td className="p-2.5 text-slate-500">{item.size}</td>
                      <td className="p-2.5 uppercase text-[10px] text-slate-400 font-mono">{item.type}</td>
                      <td className="p-2.5 text-right pr-3 space-x-1.5">
                        {item.isTrash ? (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRestoreFromTrash(item);
                              }}
                              className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold cursor-pointer shadow-2xs"
                            >
                              Restaurar
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteItem(item.id, item.name);
                              }}
                              className="p-1 rounded hover:bg-rose-100 text-rose-600 cursor-pointer"
                              title="Excluir Permanentemente"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenFile(item);
                              }}
                              className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-semibold cursor-pointer shadow-2xs"
                            >
                              Abrir
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteItem(item.id, item.name);
                              }}
                              className="p-1 rounded hover:bg-rose-100 text-rose-600 cursor-pointer"
                              title="Mover para Lixeira"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
            </div>
          )}
        </div>
      </div>

      {/* 4. Bottom Status Bar with Item Count and Zoom Slider */}
      <div className="h-7 bg-[#e2e8f0] border-t border-[#cbd5e1] px-3 flex items-center justify-between text-[11px] text-slate-600 shadow-inner shrink-0">
        <div className="flex items-center space-x-3 font-medium">
          <span>{filteredItems.length} itens</span>
          <span>•</span>
          <span className="text-emerald-700 font-semibold">482.4 GB livres no NVMe</span>
          {isUsbMounted && (
            <>
              <span>•</span>
              <span className="text-blue-700 font-semibold">USB Kingston montado (49.8 GB livres)</span>
            </>
          )}
        </div>

        {/* Icon size zoom slider */}
        <div className="flex items-center space-x-2">
          <span className="text-[10px] text-slate-500 font-semibold">-</span>
          <input
            type="range"
            min="48"
            max="120"
            value={iconSize}
            onChange={(e) => setIconSize(Number(e.target.value))}
            className="w-24 h-1 bg-slate-400 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <span className="text-[10px] text-slate-500 font-semibold">+</span>
        </div>
      </div>

      {/* ================= MODAL VISUALIZADOR DE MÍDIA LOCAL (FOTOS, MÚSICA, VÍDEO) ================= */}
      <AnimatePresence>
        {mediaViewerItem && (
          <div
            onClick={() => setMediaViewerItem(null)}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-3xl bg-slate-900 border border-white/20 rounded-2xl shadow-2xl text-slate-100 flex flex-col max-h-[85vh] overflow-hidden cursor-default"
            >
              {/* Media Viewer Header */}
              <div className="p-3.5 bg-slate-950 border-b border-white/10 flex items-center justify-between gap-3 shrink-0">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                    {mediaViewerItem.type === 'photo' ? (
                      <ImageIcon className="w-4 h-4" />
                    ) : mediaViewerItem.type === 'audio' ? (
                      <MusicIcon className="w-4 h-4" />
                    ) : (
                      <FilmIcon className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{mediaViewerItem.name}</h3>
                    <div className="text-[10px] text-slate-400 flex items-center space-x-2">
                      <span className="uppercase">{mediaViewerItem.type}</span>
                      <span>•</span>
                      <span>{mediaViewerItem.size}</span>
                      <span>•</span>
                      <span>Local InoveCloud OS</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {mediaViewerItem.type === 'photo' && (
                    <button
                      onClick={() => handleLaunchDedicatedApp('gallery', mediaViewerItem)}
                      className="px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs shadow-md transition cursor-pointer flex items-center space-x-1.5"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>Abrir na Galeria Pro</span>
                    </button>
                  )}
                  {mediaViewerItem.type === 'audio' && (
                    <button
                      onClick={() => handleLaunchDedicatedApp('music', mediaViewerItem)}
                      className="px-3 py-1.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs shadow-md transition cursor-pointer flex items-center space-x-1.5"
                    >
                      <MusicIcon className="w-3.5 h-3.5" />
                      <span>Abrir no DAW Studio</span>
                    </button>
                  )}
                  {mediaViewerItem.type === 'video' && (
                    <button
                      onClick={() => handleLaunchDedicatedApp('videoplayer', mediaViewerItem)}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition cursor-pointer flex items-center space-x-1.5"
                    >
                      <FilmIcon className="w-3.5 h-3.5" />
                      <span>Abrir no Player 4K</span>
                    </button>
                  )}
                  <button
                    onClick={() => setMediaViewerItem(null)}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Media Body */}
              <div className="flex-1 p-6 flex flex-col items-center justify-center bg-black/50 overflow-hidden">
                {mediaViewerItem.type === 'photo' && mediaViewerItem.previewUrl ? (
                  <div className="space-y-4 flex flex-col items-center w-full">
                    {/* Controls */}
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
                        src={mediaViewerItem.previewUrl}
                        alt={mediaViewerItem.name}
                        style={{
                          transform: `rotate(${imgRotation}deg) scale(${imgZoom})`,
                          filter: `brightness(${imgBrightness}%)`,
                          transition: 'transform 0.2s ease, filter 0.2s ease',
                        }}
                        className="max-h-[45vh] object-contain rounded-xl shadow-2xl border border-white/10"
                      />
                    </div>
                  </div>
                ) : mediaViewerItem.type === 'audio' ? (
                  <div className="w-full max-w-md p-6 bg-slate-800/90 rounded-2xl border border-white/10 flex flex-col items-center space-y-4 text-center">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-pink-600 to-rose-500 flex items-center justify-center text-white shadow-xl">
                      <MusicIcon className="w-10 h-10" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-base">{mediaViewerItem.name}</h4>
                      <p className="text-xs text-pink-400">{mediaViewerItem.artist || 'InoveCloud Audio Engine'}</p>
                    </div>
                    <audio
                      ref={audioRef}
                      src={mediaViewerItem.previewUrl || 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3'}
                      controls
                      autoPlay
                      className="w-full rounded-lg"
                    />
                  </div>
                ) : mediaViewerItem.type === 'video' ? (
                  <div className="w-full max-w-2xl flex flex-col items-center">
                    <video
                      src={mediaViewerItem.previewUrl || 'https://assets.mixkit.co/videos/preview/mixkit-futuristic-city-with-neon-lights-and-flying-cars-42861-large.mp4'}
                      controls
                      autoPlay
                      className="w-full max-h-[50vh] rounded-xl shadow-2xl border border-white/10"
                    />
                  </div>
                ) : null}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
                    <FileCode className="w-4 h-4" />
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

              {/* Editor Code / Textarea */}
              <div className="flex-1 flex flex-col min-h-0 bg-slate-950">
                <div className="flex-1 flex overflow-hidden font-mono text-xs">
                  <div className="w-10 bg-slate-900/80 text-slate-600 py-3 select-none text-right pr-2 leading-relaxed border-r border-white/5 font-mono text-[11px]">
                    {Array.from({ length: Math.max(1, lineCount) }).map((_, idx) => (
                      <div key={idx}>{idx + 1}</div>
                    ))}
                  </div>

                  <textarea
                    value={editorContent}
                    onChange={(e) => setEditorContent(e.target.value)}
                    placeholder="Comece a digitar seu código ou texto aqui..."
                    className="flex-1 p-3 bg-transparent text-slate-100 placeholder-slate-600 focus:outline-none resize-none leading-relaxed font-mono text-xs overflow-y-auto"
                    spellCheck={false}
                  />
                </div>
              </div>

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

      {/* ================= MODAL CONFIRMAÇÃO ESVAZIAR LIXEIRA ================= */}
      <AnimatePresence>
        {showEmptyTrashConfirm && (
          <div
            onClick={() => setShowEmptyTrashConfirm(false)}
            className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm bg-slate-900 border border-white/20 rounded-2xl p-5 shadow-2xl text-slate-100 space-y-4 cursor-default text-center"
            >
              <div className="w-12 h-12 rounded-full bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-500 mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>

              <div>
                <h3 className="font-bold text-base text-white">Esvaziar Lixeira?</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Tem certeza de que deseja apagar permanentemente todos os {trashItemsCount} itens da lixeira? Esta ação não pode ser desfeita.
                </p>
              </div>

              <div className="flex items-center justify-center space-x-2 pt-2 border-t border-white/10">
                <button
                  onClick={() => setShowEmptyTrashConfirm(false)}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleEmptyTrashPermanently}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  Sim, Excluir Permanentemente
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StorageApp;
