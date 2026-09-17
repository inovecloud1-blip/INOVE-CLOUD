import React, { useState, useRef } from 'react';
import {
  Image as ImageIcon,
  Sliders,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Download,
  Upload,
  Sparkles,
  Trash2,
  ZoomIn,
  ZoomOut,
  Layers,
  Type,
  RefreshCw,
  Palette,
  Sun,
  Contrast,
  SlidersHorizontal,
  CornerUpLeft,
  AlertTriangle,
  X,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PhotoItem {
  id: string;
  title: string;
  url: string;
  category: string;
  resolution: string;
  size: string;
  date: string;
  isCustom?: boolean;
  isTrash?: boolean;
  deletedAt?: string;
  originalCategory?: string;
}

const DEFAULT_PHOTOS: PhotoItem[] = [
  {
    id: 'p1',
    title: 'Neon Cyberpunk Metropolis',
    url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1600&q=80',
    category: 'Cyberpunk',
    resolution: '4K (3840×2160)',
    size: '4.8 MB',
    date: 'Hoje',
  },
  {
    id: 'p2',
    title: 'Emerald Peak Horizon',
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1600&q=80',
    category: 'Natureza',
    resolution: '4K (3840×2160)',
    size: '6.2 MB',
    date: 'Hoje',
  },
  {
    id: 'p3',
    title: 'Futuristic Glass Architecture',
    url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1600&q=80',
    category: 'Arquitetura',
    resolution: '4K (3840×2160)',
    size: '5.1 MB',
    date: 'Ontem',
  },
  {
    id: 'p4',
    title: 'Cosmic Stellar Nebula',
    url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=80',
    category: 'Cosmos',
    resolution: '8K (7680×4320)',
    size: '8.4 MB',
    date: 'Ontem',
  },
  {
    id: 'p5',
    title: 'Autumn Forest Canopy',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80',
    category: 'Natureza',
    resolution: '4K (3840×2160)',
    size: '5.9 MB',
    date: '02/09/2026',
  },
  {
    id: 'p6',
    title: 'Deep Cyber Grid',
    url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1600&q=80',
    category: 'Cyberpunk',
    resolution: '4K (3840×2160)',
    size: '4.2 MB',
    date: '01/09/2026',
  },
];

const FILTERS = [
  { id: 'normal', name: 'Original', filter: 'none' },
  { id: 'cinema', name: 'Teal & Orange', filter: 'contrast(1.2) hue-rotate(-15deg) saturate(1.3)' },
  { id: 'noir', name: 'Noir P&B', filter: 'grayscale(1) contrast(1.3) brightness(0.95)' },
  { id: 'cyber', name: 'Cyber Neon', filter: 'hue-rotate(180deg) saturate(1.6) contrast(1.2)' },
  { id: 'vintage', name: 'Vintage 70s', filter: 'sepia(0.5) contrast(1.1) brightness(1.05) saturate(1.2)' },
  { id: 'warm', name: 'Golden Glow', filter: 'sepia(0.25) saturate(1.35) brightness(1.08)' },
  { id: 'emerald', name: 'Emerald Haze', filter: 'hue-rotate(60deg) saturate(1.3) brightness(1.02)' },
];

export const GalleryApp: React.FC = () => {
  const [photos, setPhotos] = useState<PhotoItem[]>(DEFAULT_PHOTOS);
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoItem>(DEFAULT_PHOTOS[0]);
  const [activeTab, setActiveTab] = useState<'gallery' | 'editor' | 'cutout'>('gallery');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [showEmptyTrashModal, setShowEmptyTrashModal] = useState(false);
  
  // Editor States
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);
  const [saturation, setSaturation] = useState<number>(100);
  const [hue, setHue] = useState<number>(0);
  const [blur, setBlur] = useState<number>(0);
  const [sepia, setSepia] = useState<number>(0);
  const [selectedFilter, setSelectedFilter] = useState<string>('normal');
  const [rotation, setRotation] = useState<number>(0);
  const [flipH, setFlipH] = useState<boolean>(false);
  const [flipV, setFlipV] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  // Cutout / ProKnockout Magic Backgrounds
  const [cutoutBg, setCutoutBg] = useState<'transparent' | 'gradient-solar' | 'gradient-cyber' | 'studio-dark' | 'white'>('transparent');
  const [isCutoutApplied, setIsCutoutApplied] = useState<boolean>(false);

  // Text Overlay
  const [overlayText, setOverlayText] = useState<string>('');
  const [textColor, setTextColor] = useState<string>('#ffffff');
  const [textSize, setTextSize] = useState<number>(32);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = ['Todas', 'Natureza', 'Cyberpunk', 'Arquitetura', 'Cosmos', 'Minhas Fotos', 'Lixeira'];

  const trashCount = photos.filter(p => p.isTrash).length;
  const activePhotos = photos.filter(p => !p.isTrash);

  const filteredPhotos = selectedCategory === 'Lixeira'
    ? photos.filter(p => p.isTrash)
    : selectedCategory === 'Todas'
    ? activePhotos
    : selectedCategory === 'Minhas Fotos'
    ? activePhotos.filter(p => p.isCustom)
    : activePhotos.filter(p => p.category === selectedCategory);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const newPhoto: PhotoItem = {
            id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
            title: file.name.replace(/\.[^/.]+$/, ''),
            url: event.target.result as string,
            category: 'Minhas Fotos',
            resolution: 'HD Local',
            size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
            date: 'Agora',
            isCustom: true,
          };
          setPhotos(prev => [newPhoto, ...prev]);
          setSelectedPhoto(newPhoto);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDeletePhoto = (photoId: string) => {
    const target = photos.find(p => p.id === photoId);
    if (!target) return;

    if (target.isTrash || selectedCategory === 'Lixeira') {
      // Permanent deletion
      setPhotos(prev => prev.filter(p => p.id !== photoId));
      if (selectedPhoto.id === photoId) {
        const remaining = photos.filter(p => p.id !== photoId && !p.isTrash);
        if (remaining.length > 0) setSelectedPhoto(remaining[0]);
      }
    } else {
      // Move to Trash
      setPhotos(prev => prev.map(p => p.id === photoId ? {
        ...p,
        isTrash: true,
        originalCategory: p.category,
        deletedAt: 'Agora'
      } : p));
      if (selectedPhoto.id === photoId) {
        const remaining = activePhotos.filter(p => p.id !== photoId);
        if (remaining.length > 0) setSelectedPhoto(remaining[0]);
      }
    }
  };

  const handleRestorePhoto = (photoId: string) => {
    setPhotos(prev => prev.map(p => p.id === photoId ? {
      ...p,
      isTrash: false,
      category: p.originalCategory || 'Minhas Fotos',
      deletedAt: undefined
    } : p));
  };

  const handleEmptyTrash = () => {
    setPhotos(prev => prev.filter(p => !p.isTrash));
    setShowEmptyTrashModal(false);
  };

  const resetAdjustments = () => {
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setHue(0);
    setBlur(0);
    setSepia(0);
    setSelectedFilter('normal');
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    setZoomLevel(100);
    setIsCutoutApplied(false);
    setOverlayText('');
  };

  const getComputedFilterStyle = () => {
    const activeFilterObj = FILTERS.find(f => f.id === selectedFilter);
    const baseFilter = activeFilterObj && activeFilterObj.id !== 'normal' ? `${activeFilterObj.filter} ` : '';
    return `${baseFilter}brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) hue-rotate(${hue}deg) blur(${blur}px) sepia(${sepia}%)`;
  };

  const exportEditedImage = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = selectedPhoto.url;

    img.onload = () => {
      const is90or270 = rotation % 180 !== 0;
      canvas.width = is90or270 ? img.height : img.width;
      canvas.height = is90or270 ? img.width : img.height;

      if (!ctx) return;

      if (isCutoutApplied) {
        if (cutoutBg === 'gradient-solar') {
          const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
          grad.addColorStop(0, '#ff7a18');
          grad.addColorStop(1, '#ea0069');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        } else if (cutoutBg === 'gradient-cyber') {
          const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
          grad.addColorStop(0, '#4facfe');
          grad.addColorStop(1, '#8752f3');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        } else if (cutoutBg === 'studio-dark') {
          ctx.fillStyle = '#121214';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        } else if (cutoutBg === 'white') {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
      }

      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
      ctx.filter = getComputedFilterStyle();

      ctx.drawImage(img, -img.width / 2, -img.height / 2);
      ctx.restore();

      if (overlayText.trim()) {
        ctx.save();
        ctx.font = `bold ${textSize * (canvas.width / 800)}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
        ctx.fillStyle = textColor;
        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = 12;
        ctx.textAlign = 'center';
        ctx.fillText(overlayText, canvas.width / 2, canvas.height - 60);
        ctx.restore();
      }

      const link = document.createElement('a');
      link.download = `inovecloud-photo-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-100 font-sans select-none overflow-hidden">
      {/* Top Header Bar */}
      <header className="h-14 border-b border-white/10 px-4 flex items-center justify-between bg-slate-900/90 backdrop-blur-md z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 via-violet-600 to-cyan-500 p-0.5 shadow-lg shadow-purple-500/20 flex items-center justify-center">
            <ImageIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white flex items-center gap-2">
              Galeria & Editor ProKnockout
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 font-semibold border border-violet-500/30">
                PRO 4K
              </span>
            </h1>
            <p className="text-[11px] text-slate-400">Armazenamento local e manipulação de imagem do InoveCloud OS</p>
          </div>
        </div>

        {/* Navigation Mode Tabs */}
        <div className="flex items-center bg-slate-800/80 p-1 rounded-xl border border-white/10 text-xs">
          <button
            onClick={() => setActiveTab('gallery')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'gallery'
                ? 'bg-violet-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            Galeria ({activePhotos.length})
          </button>
          <button
            onClick={() => setActiveTab('editor')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'editor'
                ? 'bg-violet-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            Editor & Filtros
          </button>
          <button
            onClick={() => setActiveTab('cutout')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'cutout'
                ? 'bg-violet-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            ProKnockout Layer
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-white/10 flex items-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-violet-400" />
            Adicionar Foto
          </button>
          <button
            onClick={exportEditedImage}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-violet-600/30 transition-all active:scale-95 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Salvar Foto PNG
          </button>
        </div>
      </header>

      {/* Main Content Viewport */}
      <div className="flex-1 flex overflow-hidden">
        {/* Tab 1: Galeria de Fotos */}
        {activeTab === 'gallery' && (
          <div className="flex-1 flex flex-col p-4 overflow-y-auto space-y-4">
            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                    selectedCategory === cat
                      ? cat === 'Lixeira'
                        ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                        : 'bg-violet-600 text-white shadow-md shadow-violet-600/20 ring-1 ring-violet-400/40'
                      : 'bg-slate-900/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-white/5'
                  }`}
                >
                  {cat === 'Lixeira' && <Trash2 className="w-3 h-3" />}
                  <span>{cat}</span>
                  {cat === 'Lixeira' && trashCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500 text-white font-bold">
                      {trashCount}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Trash Notice */}
            {selectedCategory === 'Lixeira' && (
              <div className="p-3 bg-rose-950/40 border border-rose-500/30 rounded-2xl flex items-center justify-between text-xs text-rose-300">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>Fotos na lixeira podem ser restauradas para a galeria ou excluídas permanentemente.</span>
                </div>
                {trashCount > 0 && (
                  <button
                    onClick={() => setShowEmptyTrashModal(true)}
                    className="px-3 py-1 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow cursor-pointer"
                  >
                    Esvaziar Lixeira
                  </button>
                )}
              </div>
            )}

            {/* Photo Grid */}
            {filteredPhotos.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500 space-y-2 py-16">
                <ImageIcon className="w-12 h-12 text-slate-700" />
                <p className="text-sm font-semibold text-slate-400">
                  {selectedCategory === 'Lixeira' ? 'Nenhuma foto na lixeira' : 'Nenhuma foto encontrada'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredPhotos.map((photo) => (
                  <div
                    key={photo.id}
                    onClick={() => {
                      if (!photo.isTrash) {
                        setSelectedPhoto(photo);
                        setActiveTab('editor');
                      }
                    }}
                    className={`group relative rounded-2xl overflow-hidden bg-slate-900 border transition-all duration-300 cursor-pointer ${
                      selectedPhoto.id === photo.id && !photo.isTrash
                        ? 'border-violet-500 ring-2 ring-violet-500/40 shadow-xl shadow-violet-500/10'
                        : 'border-white/10 hover:border-white/20 hover:shadow-lg'
                    }`}
                  >
                    <div className="aspect-[16/10] overflow-hidden bg-slate-950 relative">
                      <img
                        src={photo.url}
                        alt={photo.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                        <span className="self-end px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[10px] text-violet-300 font-medium">
                          {photo.resolution}
                        </span>
                        <div className="flex items-center justify-between text-xs text-white">
                          <span className="font-semibold truncate">{photo.title}</span>
                          {!photo.isTrash && (
                            <div className="p-1.5 rounded-lg bg-violet-600 text-white shadow-md">
                              <Sliders className="w-3.5 h-3.5" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="p-3 flex items-center justify-between bg-slate-900/90 text-xs border-t border-white/5">
                      <div className="truncate pr-2">
                        <p className="font-medium text-slate-200 truncate">{photo.title}</p>
                        <p className="text-[10px] text-slate-500">{photo.category} • {photo.size}</p>
                      </div>

                      <div className="flex items-center space-x-1">
                        {photo.isTrash ? (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRestorePhoto(photo.id);
                              }}
                              className="p-1.5 rounded-lg bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white transition-colors"
                              title="Restaurar Foto"
                            >
                              <CornerUpLeft className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeletePhoto(photo.id);
                              }}
                              className="p-1.5 rounded-lg bg-rose-600/20 text-rose-400 hover:bg-rose-600 hover:text-white transition-colors"
                              title="Excluir Definitivamente"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeletePhoto(photo.id);
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            title="Mover para Lixeira"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2 & 3: Editor & ProKnockout Cutout */}
        {(activeTab === 'editor' || activeTab === 'cutout') && (
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            {/* Center Canvas Preview Area */}
            <div className="flex-1 bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
              <div
                className="w-full h-full max-h-[75vh] flex items-center justify-center rounded-2xl relative overflow-hidden border border-white/10"
                style={{
                  backgroundImage:
                    cutoutBg === 'transparent'
                      ? 'linear-gradient(45deg, #18181b 25%, transparent 25%), linear-gradient(-45deg, #18181b 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #18181b 75%), linear-gradient(-45deg, transparent 75%, #18181b 75%)'
                      : cutoutBg === 'gradient-solar'
                      ? 'linear-gradient(135deg, #ff7a18 0%, #ea0069 100%)'
                      : cutoutBg === 'gradient-cyber'
                      ? 'linear-gradient(135deg, #4facfe 0%, #8752f3 100%)'
                      : cutoutBg === 'studio-dark'
                      ? '#121214'
                      : '#ffffff',
                  backgroundSize: cutoutBg === 'transparent' ? '20px 20px' : 'cover',
                  backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
                }}
              >
                <div
                  className="relative transition-transform duration-200 max-w-full max-h-full flex items-center justify-center"
                  style={{
                    transform: `scale(${zoomLevel / 100}) rotate(${rotation}deg) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`,
                  }}
                >
                  <img
                    src={selectedPhoto.url}
                    alt={selectedPhoto.title}
                    className="max-h-[65vh] max-w-[85vw] lg:max-w-[55vw] object-contain rounded-xl shadow-2xl transition-all"
                    style={{
                      filter: getComputedFilterStyle(),
                      maskImage: isCutoutApplied ? 'radial-gradient(circle at center, black 65%, transparent 100%)' : 'none',
                      WebkitMaskImage: isCutoutApplied ? 'radial-gradient(circle at center, black 65%, transparent 100%)' : 'none',
                    }}
                  />

                  {overlayText.trim() && (
                    <div
                      className="absolute bottom-6 inset-x-0 text-center font-bold px-4 drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] pointer-events-none"
                      style={{
                        color: textColor,
                        fontSize: `${textSize}px`,
                      }}
                    >
                      {overlayText}
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Quick Controls Bar */}
              <div className="absolute bottom-6 flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 shadow-2xl">
                <button
                  onClick={() => setZoomLevel(prev => Math.max(prev - 15, 30))}
                  className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 transition-colors"
                  title="Diminuir Zoom"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-xs font-mono font-medium text-slate-300 w-12 text-center">
                  {zoomLevel}%
                </span>
                <button
                  onClick={() => setZoomLevel(prev => Math.min(prev + 15, 250))}
                  className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 transition-colors"
                  title="Aumentar Zoom"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>

                <div className="h-4 w-px bg-white/10 mx-1" />

                <button
                  onClick={() => setRotation(prev => (prev + 90) % 360)}
                  className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 transition-colors"
                  title="Girar 90°"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setFlipH(prev => !prev)}
                  className={`p-1.5 rounded-lg transition-colors ${flipH ? 'bg-violet-600 text-white' : 'hover:bg-slate-800 text-slate-300'}`}
                  title="Espelhar Horizontal"
                >
                  <FlipHorizontal className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setFlipV(prev => !prev)}
                  className={`p-1.5 rounded-lg transition-colors ${flipV ? 'bg-violet-600 text-white' : 'hover:bg-slate-800 text-slate-300'}`}
                  title="Espelhar Vertical"
                >
                  <FlipVertical className="w-4 h-4" />
                </button>

                <div className="h-4 w-px bg-white/10 mx-1" />

                <button
                  onClick={resetAdjustments}
                  className="p-1.5 rounded-lg hover:bg-rose-500/20 text-rose-300 text-xs font-medium flex items-center gap-1 transition-colors"
                  title="Redefinir Tudo"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Reset
                </button>
              </div>
            </div>

            {/* Right Tools Sidebar */}
            <div className="w-full lg:w-80 bg-slate-900 border-t lg:border-t-0 lg:border-l border-white/10 p-4 overflow-y-auto space-y-6 shrink-0">
              {activeTab === 'editor' ? (
                <>
                  {/* Preset Filters */}
                  <div>
                    <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <Palette className="w-3.5 h-3.5 text-violet-400" />
                      Filtros de Estúdio
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {FILTERS.map((f) => (
                        <button
                          key={f.id}
                          onClick={() => setSelectedFilter(f.id)}
                          className={`p-2 rounded-xl text-left text-xs font-medium border transition-all cursor-pointer ${
                            selectedFilter === f.id
                              ? 'bg-violet-600 text-white border-violet-400 shadow-md shadow-violet-600/20'
                              : 'bg-slate-800/80 text-slate-300 border-white/5 hover:bg-slate-750'
                          }`}
                        >
                          {f.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Precision Adjustments */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <SlidersHorizontal className="w-3.5 h-3.5 text-violet-400" />
                      Ajustes Manuais
                    </h3>

                    {/* Brilho */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs text-slate-300">
                        <span className="flex items-center gap-1"><Sun className="w-3.5 h-3.5 text-amber-400" /> Brilho</span>
                        <span className="font-mono">{brightness}%</span>
                      </div>
                      <input
                        type="range"
                        min="20"
                        max="200"
                        value={brightness}
                        onChange={(e) => setBrightness(Number(e.target.value))}
                        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-violet-500"
                      />
                    </div>

                    {/* Contraste */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs text-slate-300">
                        <span className="flex items-center gap-1"><Contrast className="w-3.5 h-3.5 text-blue-400" /> Contraste</span>
                        <span className="font-mono">{contrast}%</span>
                      </div>
                      <input
                        type="range"
                        min="30"
                        max="220"
                        value={contrast}
                        onChange={(e) => setContrast(Number(e.target.value))}
                        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-violet-500"
                      />
                    </div>

                    {/* Saturação */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs text-slate-300">
                        <span>Saturação</span>
                        <span className="font-mono">{saturation}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="250"
                        value={saturation}
                        onChange={(e) => setSaturation(Number(e.target.value))}
                        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-violet-500"
                      />
                    </div>

                    {/* Matiz */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs text-slate-300">
                        <span>Matiz (Hue Rotate)</span>
                        <span className="font-mono">{hue}°</span>
                      </div>
                      <input
                        type="range"
                        min="-180"
                        max="180"
                        value={hue}
                        onChange={(e) => setHue(Number(e.target.value))}
                        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-violet-500"
                      />
                    </div>

                    {/* Desfoque */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs text-slate-300">
                        <span>Desfoque Óptico</span>
                        <span className="font-mono">{blur}px</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="15"
                        value={blur}
                        onChange={(e) => setBlur(Number(e.target.value))}
                        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-violet-500"
                      />
                    </div>
                  </div>

                  {/* Text Overlay Section */}
                  <div className="space-y-3 pt-2 border-t border-white/10">
                    <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Type className="w-3.5 h-3.5 text-violet-400" />
                      Legenda / Texto
                    </h3>
                    <input
                      type="text"
                      placeholder="Escreva algo na imagem..."
                      value={overlayText}
                      onChange={(e) => setOverlayText(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                    />
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <span>Cor:</span>
                        <input
                          type="color"
                          value={textColor}
                          onChange={(e) => setTextColor(e.target.value)}
                          className="w-6 h-6 rounded border-0 bg-transparent cursor-pointer"
                        />
                      </div>
                      <div className="flex-1 flex items-center gap-2 text-xs text-slate-400">
                        <span>Tam:</span>
                        <input
                          type="range"
                          min="16"
                          max="64"
                          value={textSize}
                          onChange={(e) => setTextSize(Number(e.target.value))}
                          className="w-full h-1 bg-slate-800 rounded accent-violet-500"
                        />
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                /* Tab Cutout & ProKnockout Layers */
                <div className="space-y-5">
                  <div className="p-3 rounded-xl bg-gradient-to-r from-violet-900/40 to-indigo-900/40 border border-violet-500/30">
                    <h3 className="text-xs font-bold text-violet-300 flex items-center gap-1.5 mb-1">
                      <Sparkles className="w-4 h-4 text-violet-400" />
                      ProKnockout Magic Cutout
                    </h3>
                    <p className="text-[11px] text-slate-300">
                      Recorte inteligente de primeiro plano com máscara de canal alfa e substituição de backdrop.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={() => setIsCutoutApplied(prev => !prev)}
                      className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer ${
                        isCutoutApplied
                          ? 'bg-rose-600 hover:bg-rose-500 text-white'
                          : 'bg-violet-600 hover:bg-violet-500 text-white shadow-violet-600/25'
                      }`}
                    >
                      <Layers className="w-4 h-4" />
                      {isCutoutApplied ? 'Desativar Máscara' : 'Aplicar Recorte Inteligente'}
                    </button>
                  </div>

                  {/* Backdrop Selector */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      Fundo / Backdrop Substituído
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setCutoutBg('transparent')}
                        className={`p-2.5 rounded-xl text-left text-xs font-medium border flex items-center gap-2 cursor-pointer ${
                          cutoutBg === 'transparent'
                            ? 'bg-violet-600 text-white border-violet-400'
                            : 'bg-slate-800 text-slate-300 border-white/5'
                        }`}
                      >
                        <div className="w-4 h-4 rounded border border-white/20 bg-slate-900" />
                        Transparente
                      </button>
                      <button
                        onClick={() => setCutoutBg('gradient-solar')}
                        className={`p-2.5 rounded-xl text-left text-xs font-medium border flex items-center gap-2 cursor-pointer ${
                          cutoutBg === 'gradient-solar'
                            ? 'bg-violet-600 text-white border-violet-400'
                            : 'bg-slate-800 text-slate-300 border-white/5'
                        }`}
                      >
                        <div className="w-4 h-4 rounded bg-gradient-to-tr from-amber-500 to-rose-500" />
                        Solar Glow
                      </button>
                      <button
                        onClick={() => setCutoutBg('gradient-cyber')}
                        className={`p-2.5 rounded-xl text-left text-xs font-medium border flex items-center gap-2 cursor-pointer ${
                          cutoutBg === 'gradient-cyber'
                            ? 'bg-violet-600 text-white border-violet-400'
                            : 'bg-slate-800 text-slate-300 border-white/5'
                        }`}
                      >
                        <div className="w-4 h-4 rounded bg-gradient-to-tr from-cyan-400 to-purple-600" />
                        Cyber Mesh
                      </button>
                      <button
                        onClick={() => setCutoutBg('studio-dark')}
                        className={`p-2.5 rounded-xl text-left text-xs font-medium border flex items-center gap-2 cursor-pointer ${
                          cutoutBg === 'studio-dark'
                            ? 'bg-violet-600 text-white border-violet-400'
                            : 'bg-slate-800 text-slate-300 border-white/5'
                        }`}
                      >
                        <div className="w-4 h-4 rounded bg-slate-950 border border-white/20" />
                        Estúdio Dark
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Empty Trash Confirmation Modal */}
      <AnimatePresence>
        {showEmptyTrashModal && (
          <div
            onClick={() => setShowEmptyTrashModal(false)}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer"
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
                <h3 className="font-bold text-base text-white">Esvaziar Lixeira de Fotos?</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Tem certeza de que deseja apagar permanentemente todas as {trashCount} fotos da lixeira? Esta ação não pode ser desfeita.
                </p>
              </div>

              <div className="flex items-center justify-center space-x-2 pt-2 border-t border-white/10">
                <button
                  onClick={() => setShowEmptyTrashModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleEmptyTrash}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  Sim, Excluir Definitivamente
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GalleryApp;
