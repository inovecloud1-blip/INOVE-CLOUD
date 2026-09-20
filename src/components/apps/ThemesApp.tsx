import React, { useState, useRef, useEffect } from 'react';
import {
  Palette,
  Image as ImageIcon,
  Sparkles,
  Check,
  Upload,
  Link as LinkIcon,
  Trash2,
  Star,
  Eye,
  Sliders,
  Sun,
  Moon,
  RotateCcw,
  Plus,
  Search,
  Filter,
  Layers,
  Monitor,
  CheckCircle2,
  X,
  ExternalLink,
  Download,
  Flame,
  ShieldCheck,
  Compass,
  ArrowRight
} from 'lucide-react';
import { ThemePreset, WallpaperItem } from '../../types';
import { ACCENT_COLORS, DEFAULT_THEME_PRESETS, INITIAL_WALLPAPER_CATALOG } from '../../data/themesData';
import { useSystemSettings } from '../../context/SystemSettingsContext';

interface ThemesAppProps {
  currentWallpaper: string;
  onSelectWallpaper: (url: string) => void;
  accentColor?: string;
  onSelectAccentColor?: (color: string) => void;
  activeThemeId?: string;
  onSelectThemePreset?: (preset: ThemePreset) => void;
}

export const ThemesApp: React.FC<ThemesAppProps> = ({
  currentWallpaper,
  onSelectWallpaper,
  accentColor: propAccentColor,
  onSelectAccentColor,
  activeThemeId: propActiveThemeId,
  onSelectThemePreset,
}) => {
  const { darkMode, toggleDarkMode, setDarkMode } = useSystemSettings();

  // Active Tab
  const [activeTab, setActiveTab] = useState<'presets' | 'wallpapers' | 'accents' | 'glass'>('presets');

  // Themes state
  const [activePresetId, setActivePresetId] = useState<string>(propActiveThemeId || 'candy');
  const [currentAccent, setCurrentAccent] = useState<string>(propAccentColor || '#ec4899');
  const [customHex, setCustomHex] = useState<string>('#ec4899');

  // Glass & UI Customization state
  const [glassOpacity, setGlassOpacity] = useState<number>(80);
  const [dockStyle, setDockStyle] = useState<'glass' | 'solid' | 'minimal' | 'neon'>('glass');
  const [windowBorderGlow, setWindowBorderGlow] = useState<boolean>(true);

  // Wallpaper Collection State (persisted in localStorage)
  const [wallpapers, setWallpapers] = useState<WallpaperItem[]>(() => {
    try {
      const saved = localStorage.getItem('inovecloud_wallpaper_collection_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_WALLPAPER_CATALOG;
  });

  // Favorites
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('inovecloud_favorite_wallpapers');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return ['gemini-garden', 'cyber-red-os'];
  });

  // Filter & Search
  const [wallpaperCategory, setWallpaperCategory] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals & UI States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addMode, setAddMode] = useState<'upload' | 'url'>('upload');
  const [newWpUrl, setNewWpUrl] = useState('');
  const [newWpName, setNewWpName] = useState('');
  const [newWpCategory, setNewWpCategory] = useState('Personalizados');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewModalWallpaper, setPreviewModalWallpaper] = useState<WallpaperItem | null>(null);
  const [notification, setNotification] = useState<{ title: string; message: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Save wallpapers on change
  useEffect(() => {
    try {
      localStorage.setItem('inovecloud_wallpaper_collection_v2', JSON.stringify(wallpapers));
    } catch (e) {
      console.error(e);
    }
  }, [wallpapers]);

  // Save favorites on change
  useEffect(() => {
    try {
      localStorage.setItem('inovecloud_favorite_wallpapers', JSON.stringify(favorites));
    } catch (e) {
      console.error(e);
    }
  }, [favorites]);

  const showToast = (title: string, message: string) => {
    setNotification({ title, message });
    setTimeout(() => {
      setNotification(null);
    }, 3200);
  };

  // Apply complete theme preset
  const handleApplyPreset = (preset: ThemePreset) => {
    setActivePresetId(preset.id);
    setCurrentAccent(preset.accentColor);
    setGlassOpacity(preset.glassOpacity);
    setDockStyle(preset.dockStyle);
    onSelectWallpaper(preset.wallpaperUrl);
    if (onSelectAccentColor) {
      onSelectAccentColor(preset.accentColor);
    }
    if (onSelectThemePreset) {
      onSelectThemePreset(preset);
    }
    setDarkMode(preset.isDark);
    showToast('Tema Aplicado com Sucesso', `O tema "${preset.name}" foi configurado em todo o sistema.`);
  };

  // Apply Accent Color
  const handleSelectAccent = (hex: string) => {
    setCurrentAccent(hex);
    if (onSelectAccentColor) {
      onSelectAccentColor(hex);
    }
    showToast('Cor de Destaque Atualizada', `Nova cor: ${hex.toUpperCase()}`);
  };

  // Toggle favorite wallpaper
  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      return next;
    });
  };

  // Delete custom wallpaper
  const handleDeleteWallpaper = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setWallpapers((prev) => prev.filter((item) => item.id !== id));
    showToast('Papel de Parede Removido', 'A imagem foi removida da sua galeria.');
  };

  // Handle local file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Por favor selecione um arquivo de imagem válido (PNG, JPG, WebP ou GIF).');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setUploadError('A imagem deve ter menos de 15MB para desempenho ideal.');
      return;
    }

    setUploadError(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      const newId = `custom-wp-${Date.now()}`;
      const newItem: WallpaperItem = {
        id: newId,
        name: newWpName.trim() || file.name.replace(/\.[^/.]+$/, ''),
        category: 'Meus Papéis de Parede',
        tag: 'Upload HD',
        description: 'Imagem personalizada carregada do seu computador',
        url: result,
        thumbnail: result,
        isCustom: true,
        addedAt: new Date().toLocaleDateString('pt-BR'),
      };

      setWallpapers((prev) => [newItem, ...prev]);
      onSelectWallpaper(result);
      setIsAddModalOpen(false);
      setNewWpName('');
      showToast('Novo Papel de Parede Adicionado', 'A imagem foi salva e definida como fundo!');
    };

    reader.readAsDataURL(file);
  };

  // Handle add by URL
  const handleAddByUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWpUrl.trim()) {
      setUploadError('Insira uma URL válida de imagem.');
      return;
    }

    const newId = `custom-url-${Date.now()}`;
    const newItem: WallpaperItem = {
      id: newId,
      name: newWpName.trim() || 'Papel de Parede Web',
      category: newWpCategory || 'Meus Papéis de Parede',
      tag: 'Web 4K',
      description: 'Papel de parede adicionado via URL externa',
      url: newWpUrl.trim(),
      thumbnail: newWpUrl.trim(),
      isCustom: true,
      addedAt: new Date().toLocaleDateString('pt-BR'),
    };

    setWallpapers((prev) => [newItem, ...prev]);
    onSelectWallpaper(newWpUrl.trim());
    setIsAddModalOpen(false);
    setNewWpUrl('');
    setNewWpName('');
    showToast('Papel de Parede Web Adicionado', 'Imagem importada e aplicada com sucesso.');
  };

  // Reset collection to defaults
  const handleResetDefaults = () => {
    setWallpapers(INITIAL_WALLPAPER_CATALOG);
    handleApplyPreset(DEFAULT_THEME_PRESETS[0]);
    showToast('Configurações Restauradas', 'Temas e papéis de parede voltaram aos padrões de fábrica.');
  };

  // Categories list
  const categories = [
    'Todos',
    'Favoritos',
    'InoveCloud Dark',
    'Futurista & AI',
    'Espaço & Sci-Fi',
    'Natureza & Paisagens',
    'Minimalista & Luxo',
    'Meus Papéis de Parede',
  ];

  // Filtered wallpapers
  const filteredWallpapers = wallpapers.filter((wp) => {
    const matchesCategory =
      wallpaperCategory === 'Todos'
        ? true
        : wallpaperCategory === 'Favoritos'
        ? favorites.includes(wp.id)
        : wp.category.toLowerCase() === wallpaperCategory.toLowerCase() ||
          (wallpaperCategory === 'Meus Papéis de Parede' && wp.isCustom);

    const matchesSearch =
      wp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (wp.description && wp.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (wp.tag && wp.tag.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="h-full w-full flex flex-col bg-slate-950/95 text-slate-100 font-sans select-none overflow-hidden relative">
      {/* Toast Notification */}
      {notification && (
        <div className="absolute top-4 right-4 z-50 flex items-center space-x-3 px-4 py-3 rounded-xl bg-slate-900/90 backdrop-blur-xl border border-white/20 shadow-2xl animate-fade-in text-xs">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white"
            style={{ backgroundColor: currentAccent }}
          >
            <Check className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-white">{notification.title}</div>
            <div className="text-slate-400 text-[11px]">{notification.message}</div>
          </div>
        </div>
      )}

      {/* Top Header & Miniature Live Preview Bar */}
      <div className="px-6 py-4 bg-slate-900/60 backdrop-blur-xl border-b border-white/10 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg relative overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${currentAccent}, #3b82f6, #06b6d4)`,
            }}
          >
            <Palette className="w-5 h-5 text-white drop-shadow" />
            <div className="absolute inset-0 bg-white/20 backdrop-blur-[1px] opacity-0 hover:opacity-100 transition" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base font-black tracking-tight text-white">Temas & Papéis de Parede</h1>
              <span
                className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white uppercase tracking-wider"
                style={{ backgroundColor: currentAccent }}
              >
                InoveCloud Liquid Glass
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Personalize a interface do sistema, paletas de cores, transparências e papéis de parede 4K
            </p>
          </div>
        </div>

        {/* Live Mini Preview Capsule */}
        <div className="flex items-center space-x-3 bg-slate-950/60 p-1.5 rounded-2xl border border-white/10 shadow-inner">
          <div className="relative w-24 h-14 rounded-xl overflow-hidden border border-white/20 shadow-md group">
            <img
              src={currentWallpaper}
              alt="Fundo Atual"
              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-1">
              <div
                className="w-full h-1 rounded-full"
                style={{ backgroundColor: currentAccent }}
              />
            </div>
          </div>
          <div className="pr-2 space-y-1">
            <div className="text-[11px] font-bold text-white flex items-center space-x-1.5">
              <span>Tema Ativo:</span>
              <span className="text-xs font-mono" style={{ color: currentAccent }}>
                {DEFAULT_THEME_PRESETS.find((p) => p.id === activePresetId)?.name || 'Custom'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleDarkMode}
                className="px-2 py-1 rounded-lg text-[10px] font-bold bg-white/10 hover:bg-white/20 text-slate-200 flex items-center space-x-1 transition"
                title="Alternar Modo Escuro / Claro"
              >
                {darkMode ? <Moon className="w-3 h-3 text-indigo-400" /> : <Sun className="w-3 h-3 text-amber-400" />}
                <span>{darkMode ? 'Escuro' : 'Claro'}</span>
              </button>
              <button
                onClick={handleResetDefaults}
                className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                title="Restaurar Padrões de Fábrica"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="px-6 bg-slate-950/50 border-b border-white/5 flex items-center justify-between">
        <div className="flex space-x-2">
          {[
            { id: 'presets', label: 'Temas Completos', icon: Sparkles },
            { id: 'wallpapers', label: 'Papéis de Parede (4K)', icon: ImageIcon, count: wallpapers.length },
            { id: 'accents', label: 'Cores de Destaque', icon: Palette },
            { id: 'glass', label: 'Vidro Líquido & Dock', icon: Sliders },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 px-4 text-xs font-bold flex items-center space-x-2 border-b-2 transition cursor-pointer ${
                  isActive
                    ? 'text-white border-rose-500'
                    : 'text-slate-400 border-transparent hover:text-slate-200 hover:border-white/20'
                }`}
                style={isActive ? { borderColor: currentAccent, color: '#ffffff' } : {}}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className="px-1.5 py-0.5 rounded-full text-[9px] bg-white/10 text-slate-300 font-mono">
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {activeTab === 'wallpapers' && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white shadow-lg flex items-center space-x-1.5 transition transform hover:scale-105 cursor-pointer"
            style={{ backgroundColor: currentAccent }}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Adicionar Papel de Parede</span>
          </button>
        )}
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        {/* =================================================================== */}
        {/* TAB 1: TEMAS COMPLETOS (PRESETS) */}
        {/* =================================================================== */}
        {activeTab === 'presets' && (
          <div className="space-y-6 max-w-6xl mx-auto">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <div>
                <h2 className="text-sm font-black text-white uppercase tracking-wider">
                  Coleção de Temas Prontos
                </h2>
                <p className="text-xs text-slate-400">
                  Pacotes visuais completos com papel de parede correspondente, iluminação e cores de destaque.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {DEFAULT_THEME_PRESETS.map((preset) => {
                const isSelected = activePresetId === preset.id;
                return (
                  <div
                    key={preset.id}
                    onClick={() => handleApplyPreset(preset)}
                    className={`group relative rounded-2xl overflow-hidden border transition-all duration-300 cursor-pointer shadow-xl hover:-translate-y-1 ${
                      isSelected
                        ? 'border-2 ring-2 ring-offset-2 ring-offset-slate-950 bg-slate-900/90'
                        : 'border-white/10 bg-slate-900/50 hover:border-white/30'
                    }`}
                    style={isSelected ? { borderColor: preset.accentColor, outlineColor: preset.accentColor } : {}}
                  >
                    {/* Theme Wallpaper Header with Gradient Strip */}
                    <div className="relative h-36 w-full overflow-hidden">
                      <img
                        src={preset.wallpaperUrl}
                        alt={preset.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                      <div className="absolute top-3 right-3 flex space-x-1">
                        {isSelected && (
                          <span
                            className="px-2.5 py-1 rounded-full text-[10px] font-black text-white shadow-lg flex items-center space-x-1"
                            style={{ backgroundColor: preset.accentColor }}
                          >
                            <Check className="w-3 h-3" />
                            <span>Tema Ativo</span>
                          </span>
                        )}
                      </div>

                      {/* Accent Color Circle Indicator */}
                      <div
                        className="absolute bottom-3 left-4 w-7 h-7 rounded-full border-2 border-white shadow-lg"
                        style={{ backgroundColor: preset.accentColor }}
                      />
                    </div>

                    {/* Content */}
                    <div className="p-4 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-bold text-white group-hover:text-rose-400 transition">
                            {preset.name}
                          </h3>
                          <span className="text-[11px] text-slate-400">{preset.subtitle}</span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                        {preset.description}
                      </p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {preset.tags?.map((t) => (
                          <span
                            key={t}
                            className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-white/5 border border-white/10 text-slate-300"
                          >
                            {t}
                          </span>
                        ))}
                      </div>

                      {/* Action button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApplyPreset(preset);
                        }}
                        className={`w-full mt-2 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
                          isSelected
                            ? 'bg-white/10 text-white font-black'
                            : 'bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white'
                        }`}
                      >
                        {isSelected ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Em Uso no Sistema</span>
                          </>
                        ) : (
                          <>
                            <span>Aplicar Este Tema</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 2: PAPÉIS DE PAREDE (WALLPAPERS) */}
        {/* =================================================================== */}
        {activeTab === 'wallpapers' && (
          <div className="space-y-6 max-w-6xl mx-auto">
            {/* Filter & Search Toolbar */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              {/* Category Chips */}
              <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 max-w-full custom-scrollbar">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setWallpaperCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                      wallpaperCategory === cat
                        ? 'text-white shadow-md'
                        : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                    }`}
                    style={wallpaperCategory === cat ? { backgroundColor: currentAccent } : {}}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Search bar */}
              <div className="relative min-w-[240px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar papel de parede..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-900/80 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 transition"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Wallpapers Grid */}
            {filteredWallpapers.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <ImageIcon className="w-10 h-10 text-slate-500 mx-auto" />
                <h3 className="text-sm font-bold text-white">Nenhum papel de parede encontrado</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Tente alterar a categoria selecionada ou faça upload de uma foto personalizada do seu computador.
                </p>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-lg inline-flex items-center space-x-1.5"
                  style={{ backgroundColor: currentAccent }}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Carregar Minha Imagem</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredWallpapers.map((wp) => {
                  const isCurrent = currentWallpaper === wp.url;
                  const isFav = favorites.includes(wp.id);

                  return (
                    <div
                      key={wp.id}
                      onClick={() => {
                        onSelectWallpaper(wp.url);
                        showToast('Papel de Parede Aplicado', `Fundo atualizado para: ${wp.name}`);
                      }}
                      className={`group relative rounded-2xl overflow-hidden border transition-all duration-300 cursor-pointer shadow-lg hover:-translate-y-1 ${
                        isCurrent
                          ? 'border-2 ring-2 ring-offset-2 ring-offset-slate-950'
                          : 'border-white/10 bg-slate-900 hover:border-white/30'
                      }`}
                      style={isCurrent ? { borderColor: currentAccent } : {}}
                    >
                      {/* Image Thumbnail Container */}
                      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-900">
                        <img
                          src={wp.thumbnail || wp.url}
                          alt={wp.name}
                          className="w-full h-full object-cover group-hover:scale-108 transition duration-500"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                        {/* Top Badges */}
                        <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-black/60 backdrop-blur-md text-white border border-white/10">
                            {wp.tag || wp.category}
                          </span>

                          <div className="flex items-center space-x-1">
                            <button
                              onClick={(e) => toggleFavorite(wp.id, e)}
                              className={`p-1.5 rounded-full backdrop-blur-md transition ${
                                isFav
                                  ? 'bg-amber-500 text-slate-950 shadow'
                                  : 'bg-black/40 text-white/80 hover:text-white hover:bg-black/70'
                              }`}
                              title={isFav ? 'Remover dos Favoritos' : 'Marcar como Favorito'}
                            >
                              <Star className={`w-3 h-3 ${isFav ? 'fill-current' : ''}`} />
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setPreviewModalWallpaper(wp);
                              }}
                              className="p-1.5 rounded-full bg-black/40 backdrop-blur-md text-white/80 hover:text-white hover:bg-black/70 transition"
                              title="Visualizar em Tela Cheia"
                            >
                              <Eye className="w-3 h-3" />
                            </button>

                            {wp.isCustom && (
                              <button
                                onClick={(e) => handleDeleteWallpaper(wp.id, e)}
                                className="p-1.5 rounded-full bg-rose-950/60 backdrop-blur-md text-rose-300 hover:bg-rose-600 hover:text-white transition"
                                title="Excluir Papel de Parede Personalizado"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Bottom Info Overlay */}
                        <div className="absolute bottom-2.5 inset-x-2.5">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-white truncate max-w-[80%] drop-shadow">
                              {wp.name}
                            </h4>
                            {isCurrent && (
                              <div
                                className="w-5 h-5 rounded-full flex items-center justify-center text-white shadow-md"
                                style={{ backgroundColor: currentAccent }}
                              >
                                <Check className="w-3 h-3" />
                              </div>
                            )}
                          </div>
                          {wp.description && (
                            <p className="text-[10px] text-slate-300 truncate drop-shadow">
                              {wp.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 3: CORES DE DESTAQUE (ACCENT COLORS) */}
        {/* =================================================================== */}
        {activeTab === 'accents' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="pb-3 border-b border-white/5">
              <h2 className="text-sm font-black text-white uppercase tracking-wider">
                Paleta de Cores do Sistema
              </h2>
              <p className="text-xs text-slate-400">
                A cor de destaque é aplicada em botões, foco de janelas, indicadores do Dock e seleções.
              </p>
            </div>

            {/* Presets Grid */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 space-y-4 shadow-xl">
              <h3 className="text-xs font-bold text-white flex items-center space-x-2">
                <Palette className="w-4 h-4 text-rose-400" />
                <span>Cores Predefinidas de Alta Fidelidade</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {ACCENT_COLORS.map((color) => {
                  const isSelected = currentAccent.toLowerCase() === color.hex.toLowerCase();
                  return (
                    <button
                      key={color.id}
                      onClick={() => handleSelectAccent(color.hex)}
                      className={`p-3 rounded-xl border text-left flex items-center space-x-3 transition cursor-pointer ${
                        isSelected
                          ? 'bg-white/10 border-white/40 shadow-lg'
                          : 'bg-white/5 border-white/5 hover:border-white/20 hover:bg-white/10'
                      }`}
                    >
                      <div
                        className="w-6 h-6 rounded-full shadow-md flex items-center justify-center text-white"
                        style={{ backgroundColor: color.hex }}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 drop-shadow" />}
                      </div>
                      <div className="overflow-hidden">
                        <div className="text-xs font-bold text-white truncate">{color.name}</div>
                        <div className="text-[10px] font-mono text-slate-400">{color.hex}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Hex Picker */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 space-y-4 shadow-xl">
              <h3 className="text-xs font-bold text-white flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Cor Personalizada (Seletor RGB / Hex)</span>
              </h3>

              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={customHex}
                    onChange={(e) => {
                      setCustomHex(e.target.value);
                      handleSelectAccent(e.target.value);
                    }}
                    className="w-12 h-12 rounded-xl bg-transparent border-0 cursor-pointer"
                  />
                  <div>
                    <span className="text-[11px] text-slate-400 font-bold block">Código Hexadecimal:</span>
                    <input
                      type="text"
                      value={customHex}
                      onChange={(e) => {
                        setCustomHex(e.target.value);
                        if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
                          handleSelectAccent(e.target.value);
                        }
                      }}
                      className="px-3 py-1.5 bg-black/50 border border-white/10 rounded-lg text-xs font-mono text-white focus:outline-none uppercase"
                      maxLength={7}
                    />
                  </div>
                </div>

                <div className="flex-1 min-w-[200px] p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <span className="text-xs text-slate-300">Amostra do Componente:</span>
                  <div className="flex space-x-2">
                    <button
                      className="px-3 py-1 rounded-lg text-xs font-bold text-white shadow"
                      style={{ backgroundColor: currentAccent }}
                    >
                      Botão Primário
                    </button>
                    <span
                      className="px-2 py-1 rounded-lg text-xs font-bold border"
                      style={{ borderColor: currentAccent, color: currentAccent }}
                    >
                      Badge Ativo
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 4: VIDRO LÍQUIDO & DOCK (GLASS & UI) */}
        {/* =================================================================== */}
        {activeTab === 'glass' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="pb-3 border-b border-white/5">
              <h2 className="text-sm font-black text-white uppercase tracking-wider">
                Efeitos de Vidro Líquido & Customização da Dock
              </h2>
              <p className="text-xs text-slate-400">
                Ajuste os parâmetros de blur óptico, transparência das janelas e estilo do Dock inferior.
              </p>
            </div>

            {/* Glass Opacity & Blur */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-white">Intensidade do Vidro Líquido (Blur & Opacidade)</h3>
                  <p className="text-[11px] text-slate-400">
                    Controla a difusão óptica dos fundos das janelas e painéis do sistema
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-white px-2.5 py-1 rounded-lg bg-white/10">
                  {glassOpacity}%
                </span>
              </div>

              <input
                type="range"
                min="40"
                max="100"
                value={glassOpacity}
                onChange={(e) => setGlassOpacity(Number(e.target.value))}
                className="w-full accent-rose-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
                style={{ accentColor: currentAccent }}
              />

              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Translúcido Suave (40%)</span>
                <span>Equilibrado (80%)</span>
                <span>Fosco Sólido (100%)</span>
              </div>
            </div>

            {/* Dock Styles */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 space-y-4 shadow-xl">
              <h3 className="text-xs font-bold text-white">Estilo Visual do Dock Flutuante</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { id: 'glass', name: 'macOS Liquid Glass', desc: 'Vidro translúcido com reflexo specular' },
                  { id: 'solid', name: 'Obsidian Sólido', desc: 'Preto puro fosco de alto contraste' },
                  { id: 'minimal', name: 'Minimalista Slim', desc: 'Borda ultrafina sem fundo denso' },
                  { id: 'neon', name: 'Neon Glow', desc: 'Borda iluminada com a cor de destaque' },
                ].map((style) => {
                  const isSelected = dockStyle === style.id;
                  return (
                    <button
                      key={style.id}
                      onClick={() => setDockStyle(style.id as any)}
                      className={`p-3.5 rounded-xl border text-left transition cursor-pointer ${
                        isSelected
                          ? 'bg-white/10 border-white/40 shadow-lg'
                          : 'bg-white/5 border-white/5 hover:border-white/20'
                      }`}
                      style={isSelected ? { borderColor: currentAccent } : {}}
                    >
                      <div className="text-xs font-bold text-white">{style.name}</div>
                      <div className="text-[10px] text-slate-400 mt-1">{style.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Window Borders Glow Toggle */}
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-white">Brilho Especular nas Bordas das Janelas</h4>
                <p className="text-[11px] text-slate-400">
                  Adiciona reflexo sutil de iluminação de 1px nas bordas dos aplicativos abertos
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={windowBorderGlow}
                  onChange={() => setWindowBorderGlow(!windowBorderGlow)}
                  className="sr-only peer"
                />
                <div
                  className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"
                  style={windowBorderGlow ? { backgroundColor: currentAccent } : {}}
                />
              </label>
            </div>
          </div>
        )}
      </div>

      {/* =================================================================== */}
      {/* MODAL: ADICIONAR NOVO PAPEL DE PAREDE */}
      {/* =================================================================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-white/20 shadow-2xl p-6 space-y-5 animate-scale-up">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center space-x-2.5">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-white"
                  style={{ backgroundColor: currentAccent }}
                >
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Adicionar Papel de Parede</h3>
                  <p className="text-[11px] text-slate-400">Importe uma foto do seu PC ou adicione uma URL web</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Mode Switcher */}
            <div className="flex rounded-xl bg-black/40 p-1 border border-white/10">
              <button
                onClick={() => setAddMode('upload')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
                  addMode === 'upload' ? 'bg-white/15 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload do Computador</span>
              </button>
              <button
                onClick={() => setAddMode('url')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
                  addMode === 'url' ? 'bg-white/15 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <LinkIcon className="w-3.5 h-3.5" />
                <span>Via Link Web (URL)</span>
              </button>
            </div>

            {uploadError && (
              <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs">
                {uploadError}
              </div>
            )}

            {/* Upload Mode */}
            {addMode === 'upload' ? (
              <div className="space-y-4">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-white/20 hover:border-white/40 rounded-2xl p-8 text-center bg-black/30 transition cursor-pointer hover:bg-black/50 group"
                >
                  <Upload className="w-10 h-10 text-slate-400 group-hover:text-white mx-auto mb-2 transition" />
                  <div className="text-xs font-bold text-white">Clique para selecionar imagem</div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Suporta PNG, JPG, WebP ou GIF (Máximo 15MB)
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Nome do Papel de Parede (Opcional):</label>
                  <input
                    type="text"
                    placeholder="Ex: Foto de Férias 4K"
                    value={newWpName}
                    onChange={(e) => setNewWpName(e.target.value)}
                    className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>
            ) : (
              /* URL Mode */
              <form onSubmit={handleAddByUrl} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">URL Direta da Imagem (4K / Full HD):</label>
                  <input
                    type="url"
                    required
                    placeholder="https://images.unsplash.com/... ou link direto"
                    value={newWpUrl}
                    onChange={(e) => setNewWpUrl(e.target.value)}
                    className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Nome da Imagem:</label>
                    <input
                      type="text"
                      placeholder="Ex: Paisagem de Montanha"
                      value={newWpName}
                      onChange={(e) => setNewWpName(e.target.value)}
                      className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Categoria:</label>
                    <select
                      value={newWpCategory}
                      onChange={(e) => setNewWpCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
                    >
                      <option value="Meus Papéis de Parede">Meus Papéis de Parede</option>
                      <option value="Futurista & AI">Futurista & AI</option>
                      <option value="Natureza & Paisagens">Natureza & Paisagens</option>
                      <option value="Minimalista & Luxo">Minimalista & Luxo</option>
                      <option value="Espaço & Sci-Fi">Espaço & Sci-Fi</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-white/10 text-slate-300 hover:text-white"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-xs font-bold text-white shadow-lg"
                    style={{ backgroundColor: currentAccent }}
                  >
                    Salvar e Aplicar
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL: PREVIEW 4K FULLSCREEN */}
      {/* =================================================================== */}
      {previewModalWallpaper && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-6 animate-fade-in">
          <div className="relative w-full max-w-5xl rounded-2xl overflow-hidden border border-white/20 shadow-2xl bg-black">
            <div className="absolute top-4 right-4 z-20 flex items-center space-x-2">
              <button
                onClick={() => {
                  onSelectWallpaper(previewModalWallpaper.url);
                  setPreviewModalWallpaper(null);
                  showToast('Papel de Parede Aplicado', `Fundo atualizado para ${previewModalWallpaper.name}`);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-xl flex items-center space-x-1.5"
                style={{ backgroundColor: currentAccent }}
              >
                <Check className="w-4 h-4" />
                <span>Definir como Papel de Parede</span>
              </button>
              <button
                onClick={() => setPreviewModalWallpaper(null)}
                className="p-2 rounded-xl bg-black/60 text-white hover:bg-black/90 transition border border-white/20"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <img
              src={previewModalWallpaper.url}
              alt={previewModalWallpaper.name}
              className="w-full max-h-[75vh] object-contain mx-auto"
            />

            <div className="p-4 bg-slate-950/90 border-t border-white/10 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">{previewModalWallpaper.name}</h3>
                <p className="text-xs text-slate-400">{previewModalWallpaper.description}</p>
              </div>
              <span className="px-2.5 py-1 rounded-md text-xs font-mono bg-white/10 text-slate-300">
                {previewModalWallpaper.tag || '4K Ultra'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemesApp;
