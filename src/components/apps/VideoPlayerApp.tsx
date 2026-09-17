import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Volume1,
  Maximize,
  Minimize,
  PictureInPicture,
  SkipBack,
  SkipForward,
  FastForward,
  Rewind,
  Upload,
  FolderOpen,
  List,
  Film,
  Camera,
  Sliders,
  Sparkles,
  Subtitles,
  Repeat,
  Shuffle,
  Info,
  Link,
  Check,
  Download,
  Trash2,
  Plus,
  Tv,
  Monitor,
  Eye,
  Settings,
  HelpCircle,
  Clock,
  Music,
  Share2,
  Layers,
  ChevronRight,
  ChevronDown
} from 'lucide-react';

export interface VideoItem {
  id: string;
  title: string;
  url: string;
  duration?: number;
  thumbnail: string;
  category: string;
  resolution: string;
  fps?: number;
  codec?: string;
  description: string;
  subtitles?: {
    lang: string;
    label: string;
    vttUrl?: string;
    cues?: { start: number; end: number; text: string }[];
  }[];
  chapters?: { time: number; title: string }[];
}

const DEFAULT_VIDEO_LIBRARY: VideoItem[] = [
  {
    id: 'vid_1',
    title: 'Cyberpunk Neon City 4K — InoveCloud Futuristic Vision',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-futuristic-city-with-neon-lights-and-flying-cars-42861-large.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=600&q=80',
    category: 'Sci-Fi & Futurismo',
    resolution: '3840x2160 (4K UHD)',
    fps: 60,
    codec: 'H.264 / AAC 48kHz',
    description: 'Renderização cinematográfica com iluminação volumétrica, reflexos em vidro líquido e atmosfera neon.',
    chapters: [
      { time: 0, title: 'Início & Skyline' },
      { time: 3, title: 'Carros Voadores' },
      { time: 6, title: 'Centro Metropolitano' },
    ],
    subtitles: [
      {
        lang: 'pt',
        label: 'Português (Brasil)',
        cues: [
          { start: 0.5, end: 3.5, text: 'Bem-vindo ao InoveCloud OS — Futuro da Computação em Nuvem.' },
          { start: 4.0, end: 7.5, text: 'Desempenho puro com renderização DRM/KMS e aceleração 3D.' },
        ],
      },
      {
        lang: 'en',
        label: 'English',
        cues: [
          { start: 0.5, end: 3.5, text: 'Welcome to InoveCloud OS — The Future of Cloud Computing.' },
          { start: 4.0, end: 7.5, text: 'Pure performance with DRM/KMS scanout and 3D acceleration.' },
        ],
      },
    ],
  },
  {
    id: 'vid_2',
    title: 'Emerald Mountain Peak Drone 4K — Natureza Hi-Fi',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-drone-view-of-a-mountain-lake-and-forest-42866-large.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
    category: 'Natureza & Paisagens',
    resolution: '3840x2160 (4K UHD)',
    fps: 60,
    codec: 'HEVC / H.265',
    description: 'Voo espetacular de drone sobre lagos alpinos e montanhas cobertas por florestas virgens.',
    chapters: [
      { time: 0, title: 'Lago Cristalino' },
      { time: 3, title: 'Subida Alpina' },
    ],
    subtitles: [
      {
        lang: 'pt',
        label: 'Português (Brasil)',
        cues: [
          { start: 0.5, end: 4.0, text: 'Paisagens naturais capturadas em ultra-alta definição.' },
        ],
      },
    ],
  },
  {
    id: 'vid_3',
    title: 'High-Tech Datacenter Fiberoptic & EPYC Cloud Servers',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-fiber-optic-lights-moving-in-a-server-room-42865-large.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80',
    category: 'Tecnologia & Servidores',
    resolution: '1920x1080 (Full HD)',
    fps: 60,
    codec: 'H.264 / AVC',
    description: 'Feixes de luz trafegando por cabos de fibra óptica interligando racks de computação em nuvem.',
    chapters: [
      { time: 0, title: 'Backbone de Fibra' },
      { time: 4, title: 'Racks de Servidores' },
    ],
  },
  {
    id: 'vid_4',
    title: 'Sunset Coast Waves — Relaxamento & Cinema',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-waves-crashing-on-a-beach-at-sunset-42867-large.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
    category: 'Natureza & Paisagens',
    resolution: '1920x1080 (Full HD)',
    fps: 30,
    codec: 'H.264 / AAC',
    description: 'Ondas suaves quebrando na costa dourada com reflexo do pôr do sol no oceano.',
  },
  {
    id: 'vid_5',
    title: 'Big Buck Bunny (Open Source 4K CGI Animation)',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80',
    category: 'Animação & CGI',
    resolution: '1920x1080 (Full HD)',
    fps: 30,
    codec: 'H.264 High Profile',
    description: 'Filme clássico livre de animação 3D da Blender Foundation renderizado em alta definição.',
  },
];

type AspectRatioMode = 'auto' | '16:9' | '21:9' | '4:3' | 'fill';
type RepeatMode = 'off' | 'all' | 'one';

export const VideoPlayerApp: React.FC = () => {
  // Video Playlist State
  const [playlist, setPlaylist] = useState<VideoItem[]>(DEFAULT_VIDEO_LIBRARY);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const currentVideo = playlist[currentVideoIndex] || playlist[0];

  // Playback State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('all');
  const [isShuffle, setIsShuffle] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<AspectRatioMode>('auto');

  // UI / Panels State
  const [showControls, setShowControls] = useState(true);
  const [isHoveringTimeline, setIsHoveringTimeline] = useState(false);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverPos, setHoverPos] = useState<number>(0);
  const [activeSidePanel, setActiveSidePanel] = useState<'playlist' | 'equalizer' | 'subtitles' | 'info' | 'url' | null>(null);
  const [snapshotSuccess, setSnapshotSuccess] = useState<string | null>(null);

  // A-B Segment Looping
  const [loopA, setLoopA] = useState<number | null>(null);
  const [loopB, setLoopB] = useState<number | null>(null);
  const [isLoopABActive, setIsLoopABActive] = useState(false);

  // Video Shaders / Color Correction Filter State
  const [filterPreset, setFilterPreset] = useState<'normal' | 'cinematic' | 'vibrant' | 'noir' | 'warm' | 'cyberpunk' | 'vintage'>('normal');
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [hueRotate, setHueRotate] = useState(0);
  const [sepia, setSepia] = useState(0);
  const [blur, setBlur] = useState(0);

  // Audio Equalizer & Gain Booster State (Web Audio API)
  const [audioGain, setAudioGain] = useState(100); // Up to 200%
  const [eqPreset, setEqPreset] = useState<'flat' | 'bass' | 'vocal' | 'cinema' | 'treble'>('flat');

  // Subtitles State
  const [selectedSubLang, setSelectedSubLang] = useState<string>('pt');
  const [currentSubtitleText, setCurrentSubtitleText] = useState<string>('');
  const [subFontSize, setSubFontSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [subColor, setSubColor] = useState<string>('#ffffff');

  // URL Stream input
  const [streamUrlInput, setStreamUrlInput] = useState('');
  const [streamTitleInput, setStreamTitleInput] = useState('');

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const subtitleInputRef = useRef<HTMLInputElement>(null);
  const hideControlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Audio Context Nodes
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const biquadFilterRef = useRef<BiquadFilterNode | null>(null);

  // Computed CSS Filter String
  const computedCssFilter = useMemo(() => {
    let filterString = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) hue-rotate(${hueRotate}deg) sepia(${sepia}%)`;
    if (blur > 0) filterString += ` blur(${blur}px)`;

    switch (filterPreset) {
      case 'cinematic':
        return `contrast(115%) saturate(125%) brightness(95%) ${filterString}`;
      case 'vibrant':
        return `saturate(160%) contrast(110%) ${filterString}`;
      case 'noir':
        return `grayscale(100%) contrast(140%) brightness(90%)`;
      case 'warm':
        return `sepia(30%) saturate(120%) brightness(105%) hue-rotate(-10deg) ${filterString}`;
      case 'cyberpunk':
        return `hue-rotate(180deg) saturate(170%) contrast(125%) ${filterString}`;
      case 'vintage':
        return `sepia(50%) contrast(90%) brightness(95%) ${filterString}`;
      default:
        return filterString;
    }
  }, [filterPreset, brightness, contrast, saturation, hueRotate, sepia, blur]);

  // Handle Play/Pause
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().then(() => setIsPlaying(true)).catch((err) => {
        console.warn('Video play error:', err);
      });
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  // Video Time Update & Subtitle Tracking
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const time = videoRef.current.currentTime;
    setCurrentTime(time);

    // Check A-B loop
    if (isLoopABActive && loopA !== null && loopB !== null && time >= loopB) {
      videoRef.current.currentTime = loopA;
      return;
    }

    // Update Subtitles
    if (selectedSubLang === 'off') {
      setCurrentSubtitleText('');
      return;
    }

    const subTrack = currentVideo.subtitles?.find((s) => s.lang === selectedSubLang);
    if (subTrack?.cues) {
      const activeCue = subTrack.cues.find((c) => time >= c.start && time <= c.end);
      setCurrentSubtitleText(activeCue ? activeCue.text : '');
    } else {
      setCurrentSubtitleText('');
    }

    // Update Buffer Progress
    if (videoRef.current.buffered.length > 0) {
      try {
        const bufferedEnd = videoRef.current.buffered.end(videoRef.current.buffered.length - 1);
        setBuffered(bufferedEnd);
      } catch (e) {}
    }
  };

  // Handle Video Metadata Loaded
  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration || 0);
    videoRef.current.volume = volume;
    videoRef.current.playbackRate = playbackRate;
    if (isPlaying) {
      videoRef.current.play().catch(() => {});
    }
  };

  // Handle Video Ended
  const handleVideoEnded = () => {
    if (repeatMode === 'one') {
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(() => {});
      }
    } else if (repeatMode === 'all' || isShuffle) {
      handleNextVideo();
    } else {
      setIsPlaying(false);
    }
  };

  // Next Video
  const handleNextVideo = () => {
    if (playlist.length === 0) return;
    let nextIdx = currentVideoIndex + 1;
    if (isShuffle) {
      nextIdx = Math.floor(Math.random() * playlist.length);
    } else if (nextIdx >= playlist.length) {
      nextIdx = 0;
    }
    setCurrentVideoIndex(nextIdx);
    setCurrentTime(0);
    setIsPlaying(true);
  };

  // Previous Video
  const handlePrevVideo = () => {
    if (!videoRef.current) return;
    if (videoRef.current.currentTime > 3) {
      videoRef.current.currentTime = 0;
      return;
    }
    let prevIdx = currentVideoIndex - 1;
    if (prevIdx < 0) {
      prevIdx = playlist.length - 1;
    }
    setCurrentVideoIndex(prevIdx);
    setCurrentTime(0);
    setIsPlaying(true);
  };

  // Seek / Scrub timeline
  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current || !videoRef.current || !duration) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const targetTime = pos * duration;
    videoRef.current.currentTime = targetTime;
    setCurrentTime(targetTime);
  };

  // Hover over timeline for time preview
  const handleTimelineMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current || !duration) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setHoverPos(pos);
    setHoverTime(pos * duration);
  };

  // Skip time forward / backward
  const handleSkip = (seconds: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + seconds));
  };

  // Volume change
  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    setIsMuted(newVol === 0);
    if (videoRef.current) {
      videoRef.current.volume = newVol;
    }
  };

  // Toggle Mute
  const toggleMute = () => {
    if (!videoRef.current) return;
    if (isMuted) {
      videoRef.current.volume = volume || 0.5;
      setIsMuted(false);
    } else {
      videoRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  // Change Playback Speed
  const handleSpeedChange = (speed: number) => {
    setPlaybackRate(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  // Fullscreen Toggle
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().catch((err) => {
        console.warn('Fullscreen request denied:', err);
      });
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  // Picture in Picture
  const togglePiP = async () => {
    if (!videoRef.current) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (document.pictureInPictureEnabled) {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (err) {
      console.warn('PiP error:', err);
    }
  };

  // Snapshot / Screenshot frame from video
  const takeSnapshot = () => {
    if (!videoRef.current) return;
    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 1920;
      canvas.height = video.videoHeight || 1080;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Apply CSS filter to snapshot if active
      if (computedCssFilter && computedCssFilter !== 'none') {
        ctx.filter = computedCssFilter;
      }

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/png');

      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `snapshot-${currentVideo.title.slice(0, 20).replace(/[^a-z0-9]/gi, '_')}-${Math.floor(currentTime)}s.png`;
      a.click();

      setSnapshotSuccess('Captura salva com sucesso!');
      setTimeout(() => setSnapshotSuccess(null), 3000);
    } catch (e) {
      console.error('Snapshot failed:', e);
    }
  };

  // Reset Filters
  const resetFilters = () => {
    setFilterPreset('normal');
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setHueRotate(0);
    setSepia(0);
    setBlur(0);
  };

  // Handle Local Video Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    (Array.from(files) as File[]).forEach((file: File) => {
      const objectUrl = URL.createObjectURL(file);
      const newVideo: VideoItem = {
        id: `local_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
        title: file.name.replace(/\.[^/.]+$/, ''),
        url: objectUrl,
        thumbnail: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=400&q=70',
        category: 'Arquivos Locais',
        resolution: 'Detectando...',
        codec: file.type || 'Mídia Local',
        description: `Arquivo local importado: ${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      };

      setPlaylist((prev) => [newVideo, ...prev]);
      setCurrentVideoIndex(0);
      setIsPlaying(true);
    });
  };

  // Add Stream URL to Playlist
  const handleAddStreamUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!streamUrlInput.trim()) return;

    const newVideo: VideoItem = {
      id: `stream_${Date.now()}`,
      title: streamTitleInput.trim() || 'Transmissão de Vídeo Online',
      url: streamUrlInput.trim(),
      thumbnail: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?auto=format&fit=crop&w=400&q=70',
      category: 'Streams & URLs',
      resolution: 'Stream Web HD',
      description: `Fonte externa: ${streamUrlInput.trim()}`,
    };

    setPlaylist((prev) => [newVideo, ...prev]);
    setCurrentVideoIndex(0);
    setStreamUrlInput('');
    setStreamTitleInput('');
    setActiveSidePanel(null);
    setIsPlaying(true);
  };

  // Remove Video from Playlist
  const removeVideoFromPlaylist = (indexToRemove: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (playlist.length <= 1) return;
    const newPlaylist = playlist.filter((_, i) => i !== indexToRemove);
    setPlaylist(newPlaylist);
    if (currentVideoIndex >= indexToRemove && currentVideoIndex > 0) {
      setCurrentVideoIndex(currentVideoIndex - 1);
    }
  };

  // Format Time (HH:MM:SS or MM:SS)
  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '00:00';
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = Math.floor(secs % 60);
    if (h > 0) {
      return `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    }
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Mouse move handler for autohiding controls in video area
  const handleMouseMoveOverPlayer = () => {
    setShowControls(true);
    if (hideControlsTimeoutRef.current) {
      clearTimeout(hideControlsTimeoutRef.current);
    }
    hideControlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying && !activeSidePanel) {
        setShowControls(false);
      }
    }, 3500);
  };

  // Keyboard Shortcuts (Space, F, M, Left, Right, etc.)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      switch (e.key) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowRight':
          e.preventDefault();
          handleSkip(5);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          handleSkip(-5);
          break;
        case 'ArrowUp':
          e.preventDefault();
          handleVolumeChange(Math.min(1, volume + 0.1));
          break;
        case 'ArrowDown':
          e.preventDefault();
          handleVolumeChange(Math.max(0, volume - 0.1));
          break;
        case 'm':
        case 'M':
          e.preventDefault();
          toggleMute();
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 's':
        case 'S':
          e.preventDefault();
          takeSnapshot();
          break;
        case 'p':
        case 'P':
          e.preventDefault();
          togglePiP();
          break;
        case 'n':
        case 'N':
          e.preventDefault();
          handleNextVideo();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, volume, isMuted, duration, currentVideoIndex, playlist]);

  // Aspect ratio class calculation
  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case '16:9':
        return 'aspect-video object-cover';
      case '21:9':
        return 'aspect-[21/9] object-cover';
      case '4:3':
        return 'aspect-[4/3] object-cover';
      case 'fill':
        return 'w-full h-full object-fill';
      default:
        return 'w-full h-full object-contain';
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMoveOverPlayer}
      className="flex flex-col h-full bg-slate-950 text-slate-100 select-none overflow-hidden relative font-sans"
    >
      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="video/mp4,video/webm,video/ogg,video/quicktime,video/x-matroska,.mp4,.webm,.mkv,.mov"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Snapshot Toast notification */}
      {snapshotSuccess && (
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 bg-emerald-600/90 text-white text-xs font-bold rounded-full shadow-2xl backdrop-blur-md flex items-center space-x-2 border border-emerald-400/40 animate-bounce">
          <Camera className="w-4 h-4 text-white" />
          <span>{snapshotSuccess}</span>
        </div>
      )}

      {/* Top Glass Header Bar */}
      <div
        className={`px-4 py-2.5 bg-slate-900/90 backdrop-blur-xl border-b border-white/10 flex items-center justify-between z-30 transition-all duration-300 ${
          showControls ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}
      >
        <div className="flex items-center space-x-3 truncate">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-500 via-pink-500 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-rose-500/30 shrink-0">
            <Film className="w-4 h-4" />
          </div>
          <div className="truncate">
            <h2 className="text-xs font-bold text-white truncate flex items-center space-x-2">
              <span className="truncate">{currentVideo.title}</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/10 text-rose-300 border border-rose-500/30 shrink-0">
                {currentVideo.resolution}
              </span>
            </h2>
            <p className="text-[11px] text-slate-400 truncate">
              {currentVideo.category} • {currentVideo.codec || 'Auto Codec'}
            </p>
          </div>
        </div>

        {/* Top Right Quick Actions */}
        <div className="flex items-center space-x-1.5 shrink-0">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition cursor-pointer border border-white/10"
            title="Abrir arquivo de vídeo do computador"
          >
            <FolderOpen className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden sm:inline">Abrir Vídeo</span>
          </button>

          <button
            onClick={() => setActiveSidePanel(activeSidePanel === 'url' ? null : 'url')}
            className={`p-2 rounded-xl border transition cursor-pointer ${
              activeSidePanel === 'url'
                ? 'bg-rose-500/30 text-rose-300 border-rose-500/50'
                : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
            }`}
            title="Reproduzir URL / Stream direto"
          >
            <Link className="w-4 h-4" />
          </button>

          <button
            onClick={() => setActiveSidePanel(activeSidePanel === 'equalizer' ? null : 'equalizer')}
            className={`p-2 rounded-xl border transition cursor-pointer ${
              activeSidePanel === 'equalizer'
                ? 'bg-rose-500/30 text-rose-300 border-rose-500/50'
                : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
            }`}
            title="Filtros Visuais, Cores e Equalizador"
          >
            <Sliders className="w-4 h-4" />
          </button>

          <button
            onClick={() => setActiveSidePanel(activeSidePanel === 'subtitles' ? null : 'subtitles')}
            className={`p-2 rounded-xl border transition cursor-pointer ${
              activeSidePanel === 'subtitles'
                ? 'bg-rose-500/30 text-rose-300 border-rose-500/50'
                : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
            }`}
            title="Legendas e Faixas de Áudio"
          >
            <Subtitles className="w-4 h-4" />
          </button>

          <button
            onClick={() => setActiveSidePanel(activeSidePanel === 'playlist' ? null : 'playlist')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border font-bold text-xs transition cursor-pointer ${
              activeSidePanel === 'playlist'
                ? 'bg-rose-600 text-white border-rose-400 shadow-lg shadow-rose-600/30'
                : 'bg-white/10 hover:bg-white/20 text-slate-200 border-white/10'
            }`}
            title="Lista de Reprodução / Playlist"
          >
            <List className="w-3.5 h-3.5" />
            <span>Playlist ({playlist.length})</span>
          </button>
        </div>
      </div>

      {/* Center Main Stage / Video Area with Floating Side Panels */}
      <div className="flex-1 relative flex overflow-hidden bg-black items-center justify-center">
        {/* HTML5 Video Element */}
        <div
          onClick={togglePlay}
          className="w-full h-full flex items-center justify-center cursor-pointer relative"
        >
          <video
            ref={videoRef}
            src={currentVideo.url}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={handleVideoEnded}
            playsInline
            style={{ filter: computedCssFilter }}
            className={`transition-all duration-300 select-none ${getAspectRatioClass()}`}
          />

          {/* Big Center Play Icon when Paused */}
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[2px] transition-all">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-rose-600 to-amber-500 text-white flex items-center justify-center shadow-2xl shadow-rose-600/50 transform hover:scale-110 transition duration-200 border border-white/30">
                <Play className="w-9 h-9 fill-white ml-1" />
              </div>
            </div>
          )}

          {/* Subtitle Display Overlay */}
          {currentSubtitleText && (
            <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 max-w-[85%] text-center pointer-events-none z-20 transition-all">
              <span
                style={{
                  color: subColor,
                  fontSize: subFontSize === 'lg' ? '1.5rem' : subFontSize === 'sm' ? '1rem' : '1.25rem',
                }}
                className="inline-block px-4 py-1.5 rounded-xl bg-black/80 font-bold backdrop-blur-md shadow-2xl border border-white/10 leading-snug tracking-wide"
              >
                {currentSubtitleText}
              </span>
            </div>
          )}
        </div>

        {/* Side Panel: Playlist Drawer */}
        {activeSidePanel === 'playlist' && (
          <div className="absolute top-0 right-0 bottom-0 w-80 bg-slate-900/95 backdrop-blur-2xl border-l border-white/10 z-40 flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
            <div className="p-3.5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <List className="w-4 h-4 text-rose-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Fila de Reprodução
                </h3>
              </div>
              <button
                onClick={() => setActiveSidePanel(null)}
                className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Playlist Items */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
              {playlist.map((vid, idx) => {
                const isSelected = idx === currentVideoIndex;
                return (
                  <div
                    key={vid.id || idx}
                    onClick={() => {
                      setCurrentVideoIndex(idx);
                      setIsPlaying(true);
                    }}
                    className={`group flex items-center space-x-3 p-2 rounded-xl transition cursor-pointer border ${
                      isSelected
                        ? 'bg-rose-600/20 border-rose-500/50 text-white'
                        : 'bg-white/5 hover:bg-white/10 border-white/5 text-slate-300'
                    }`}
                  >
                    <div className="relative w-16 h-11 rounded-lg overflow-hidden shrink-0 bg-slate-800 border border-white/10">
                      <img
                        src={vid.thumbnail}
                        alt={vid.title}
                        className="w-full h-full object-cover"
                      />
                      {isSelected && isPlaying && (
                        <div className="absolute inset-0 bg-rose-600/50 flex items-center justify-center">
                          <div className="flex space-x-0.5 items-end h-3">
                            <span className="w-1 bg-white animate-bounce h-full"></span>
                            <span className="w-1 bg-white animate-bounce delay-100 h-2"></span>
                            <span className="w-1 bg-white animate-bounce delay-200 h-3"></span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-bold truncate ${isSelected ? 'text-rose-300' : 'text-slate-200'}`}>
                        {vid.title}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">
                        {vid.category} • {vid.resolution}
                      </p>
                    </div>

                    {playlist.length > 1 && (
                      <button
                        onClick={(e) => removeVideoFromPlaylist(idx, e)}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition cursor-pointer"
                        title="Remover da lista"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Playlist Footer Actions */}
            <div className="p-3 border-t border-white/10 bg-slate-950/60 flex items-center justify-between">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition cursor-pointer w-full justify-center border border-white/10"
              >
                <Plus className="w-3.5 h-3.5 text-rose-400" />
                <span>Adicionar Arquivos Locais</span>
              </button>
            </div>
          </div>
        )}

        {/* Side Panel: Video Shaders & Audio Equalizer */}
        {activeSidePanel === 'equalizer' && (
          <div className="absolute top-0 right-0 bottom-0 w-84 bg-slate-900/95 backdrop-blur-2xl border-l border-white/10 z-40 flex flex-col shadow-2xl p-4 overflow-y-auto animate-in slide-in-from-right duration-200 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <div className="flex items-center space-x-2">
                <Sliders className="w-4 h-4 text-rose-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Filtros de Imagem & Áudio
                </h3>
              </div>
              <button
                onClick={() => setActiveSidePanel(null)}
                className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Video Presets */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Presets de Cor</span>
                <button
                  onClick={resetFilters}
                  className="text-rose-400 hover:text-rose-300 text-[10px] font-semibold transition cursor-pointer"
                >
                  Restaurar Padrão
                </button>
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'normal', label: 'Padrão' },
                  { id: 'cinematic', label: 'Cinema HDR' },
                  { id: 'vibrant', label: 'Vibrante' },
                  { id: 'noir', label: 'Noir P&B' },
                  { id: 'warm', label: 'Pôr do Sol' },
                  { id: 'cyberpunk', label: 'Cyberpunk Neon' },
                  { id: 'vintage', label: 'Vintage 70s' },
                ].map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setFilterPreset(p.id as any)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer border text-center ${
                      filterPreset === p.id
                        ? 'bg-rose-600 text-white border-rose-400'
                        : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Sliders */}
            <div className="space-y-3 pt-2 border-t border-white/10">
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-300">
                  <span>Brilho</span>
                  <span className="font-mono text-rose-400">{brightness}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="180"
                  value={brightness}
                  onChange={(e) => setBrightness(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-rose-500"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-300">
                  <span>Contraste</span>
                  <span className="font-mono text-rose-400">{contrast}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="200"
                  value={contrast}
                  onChange={(e) => setContrast(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-rose-500"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-300">
                  <span>Saturação</span>
                  <span className="font-mono text-rose-400">{saturation}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="250"
                  value={saturation}
                  onChange={(e) => setSaturation(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-rose-500"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-300">
                  <span>Matiz (Hue)</span>
                  <span className="font-mono text-rose-400">{hueRotate}°</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={hueRotate}
                  onChange={(e) => setHueRotate(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-rose-500"
                />
              </div>
            </div>

            {/* Audio Booster Section */}
            <div className="space-y-2 pt-2 border-t border-white/10">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Reforço de Áudio (+200% Gain)</span>
                <span className="font-mono text-emerald-400">{audioGain}%</span>
              </label>
              <input
                type="range"
                min="100"
                max="200"
                value={audioGain}
                onChange={(e) => setAudioGain(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <p className="text-[10px] text-slate-400">
                Aumenta o volume além do limite nativo para caixas de som silenciosas.
              </p>
            </div>
          </div>
        )}

        {/* Side Panel: Subtitles & Audio Tracks */}
        {activeSidePanel === 'subtitles' && (
          <div className="absolute top-0 right-0 bottom-0 w-80 bg-slate-900/95 backdrop-blur-2xl border-l border-white/10 z-40 flex flex-col shadow-2xl p-4 overflow-y-auto animate-in slide-in-from-right duration-200 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <div className="flex items-center space-x-2">
                <Subtitles className="w-4 h-4 text-rose-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Legendas & Idiomas
                </h3>
              </div>
              <button
                onClick={() => setActiveSidePanel(null)}
                className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Language Selector */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Faixa de Legenda
              </label>
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedSubLang('off')}
                  className={`w-full p-2 rounded-xl text-xs font-semibold flex items-center justify-between border transition cursor-pointer ${
                    selectedSubLang === 'off'
                      ? 'bg-rose-600 text-white border-rose-400'
                      : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
                  }`}
                >
                  <span>Desativada</span>
                  {selectedSubLang === 'off' && <Check className="w-4 h-4 text-white" />}
                </button>

                {currentVideo.subtitles?.map((sub) => (
                  <button
                    key={sub.lang}
                    onClick={() => setSelectedSubLang(sub.lang)}
                    className={`w-full p-2 rounded-xl text-xs font-semibold flex items-center justify-between border transition cursor-pointer ${
                      selectedSubLang === sub.lang
                        ? 'bg-rose-600 text-white border-rose-400'
                        : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
                    }`}
                  >
                    <span>{sub.label}</span>
                    {selectedSubLang === sub.lang && <Check className="w-4 h-4 text-white" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Subtitle Appearance Settings */}
            <div className="space-y-3 pt-2 border-t border-white/10">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Tamanho da Fonte
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'sm', label: 'Pequeno' },
                  { id: 'md', label: 'Médio' },
                  { id: 'lg', label: 'Grande' },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSubFontSize(s.id as any)}
                    className={`py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer text-center ${
                      subFontSize === s.id
                        ? 'bg-rose-600 text-white border-rose-400'
                        : 'bg-white/5 text-slate-300 border-white/10'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-white/10">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Cor da Legenda
              </label>
              <div className="flex space-x-2">
                {['#ffffff', '#fef08a', '#67e8f9', '#86efac'].map((c) => (
                  <button
                    key={c}
                    onClick={() => setSubColor(c)}
                    style={{ backgroundColor: c }}
                    className={`w-7 h-7 rounded-full border-2 transition cursor-pointer ${
                      subColor === c ? 'border-white scale-110 shadow-lg' : 'border-transparent'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Side Panel: Stream URL Input Drawer */}
        {activeSidePanel === 'url' && (
          <div className="absolute top-0 right-0 bottom-0 w-84 bg-slate-900/95 backdrop-blur-2xl border-l border-white/10 z-40 flex flex-col shadow-2xl p-4 overflow-y-auto animate-in slide-in-from-right duration-200 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <div className="flex items-center space-x-2">
                <Link className="w-4 h-4 text-rose-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Abrir Transmissão / URL
                </h3>
              </div>
              <button
                onClick={() => setActiveSidePanel(null)}
                className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddStreamUrl} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">
                  Título do Vídeo
                </label>
                <input
                  type="text"
                  placeholder="Ex: Minha Live / Câmera RTSP / Demo MP4"
                  value={streamTitleInput}
                  onChange={(e) => setStreamTitleInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">
                  URL Direta do Vídeo (MP4, WebM, HLS)
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://exemplo.com/video.mp4"
                  value={streamUrlInput}
                  onChange={(e) => setStreamUrlInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-bold transition cursor-pointer shadow-lg shadow-rose-600/30 active:scale-95"
              >
                Reproduzir Transmissão
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Bottom Controls Bar */}
      <div
        className={`px-4 py-3 bg-slate-900/95 backdrop-blur-2xl border-t border-white/10 z-30 transition-all duration-300 space-y-2.5 ${
          showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        {/* Interactive Scrub / Timeline Progress Bar */}
        <div
          ref={timelineRef}
          onClick={handleTimelineClick}
          onMouseMove={handleTimelineMouseMove}
          onMouseEnter={() => setIsHoveringTimeline(true)}
          onMouseLeave={() => setIsHoveringTimeline(false)}
          className="relative h-2 hover:h-3.5 bg-slate-800 rounded-full cursor-pointer transition-all duration-150 group"
        >
          {/* Buffered Progress */}
          <div
            className="absolute top-0 bottom-0 left-0 bg-white/20 rounded-full transition-all"
            style={{ width: `${duration > 0 ? (buffered / duration) * 100 : 0}%` }}
          />

          {/* Played Progress */}
          <div
            className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 rounded-full shadow-lg shadow-rose-500/50"
            style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
          >
            {/* Scrubber Knob */}
            <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-md scale-0 group-hover:scale-100 transition-transform" />
          </div>

          {/* Chapter Markers */}
          {currentVideo.chapters?.map((ch, i) => (
            <div
              key={i}
              title={ch.title}
              style={{ left: `${(ch.time / (duration || 1)) * 100}%` }}
              className="absolute top-0 bottom-0 w-0.5 bg-white/60 z-10"
            />
          ))}

          {/* Hover Time Tooltip */}
          {isHoveringTimeline && hoverTime !== null && (
            <div
              style={{ left: `${hoverPos * 100}%` }}
              className="absolute -top-8 transform -translate-x-1/2 px-2 py-0.5 rounded-lg bg-black/90 text-white text-[11px] font-mono font-bold border border-white/20 pointer-events-none shadow-xl"
            >
              {formatTime(hoverTime)}
            </div>
          )}
        </div>

        {/* Lower Toolbar: Playback Buttons, Volume, Options */}
        <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
          {/* Left Controls: Play/Pause, Skip, Time */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrevVideo}
              className="p-1.5 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition cursor-pointer"
              title="Vídeo Anterior (N)"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            <button
              onClick={() => handleSkip(-10)}
              className="p-1.5 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition cursor-pointer"
              title="Voltar 10s (←)"
            >
              <Rewind className="w-4 h-4" />
            </button>

            <button
              onClick={togglePlay}
              className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white flex items-center justify-center shadow-lg shadow-rose-600/30 transition cursor-pointer active:scale-95"
              title={isPlaying ? 'Pausar (Espaço)' : 'Reproduzir (Espaço)'}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-white" />
              ) : (
                <Play className="w-4 h-4 fill-white ml-0.5" />
              )}
            </button>

            <button
              onClick={() => handleSkip(10)}
              className="p-1.5 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition cursor-pointer"
              title="Avançar 10s (→)"
            >
              <FastForward className="w-4 h-4" />
            </button>

            <button
              onClick={handleNextVideo}
              className="p-1.5 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition cursor-pointer"
              title="Próximo Vídeo (N)"
            >
              <SkipForward className="w-4 h-4" />
            </button>

            {/* Time Stamp Display */}
            <div className="font-mono text-xs text-slate-300 pl-2">
              <span className="text-white font-bold">{formatTime(currentTime)}</span>
              <span className="text-slate-500 mx-1">/</span>
              <span className="text-slate-400">{formatTime(duration)}</span>
            </div>
          </div>

          {/* Center Controls: Volume Slider, Speed Selector */}
          <div className="flex items-center space-x-3">
            {/* Volume Control */}
            <div className="flex items-center space-x-1.5 group">
              <button
                onClick={toggleMute}
                className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition cursor-pointer"
                title={isMuted ? 'Desmutar (M)' : 'Mutar (M)'}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4 text-rose-400" />
                ) : volume < 0.5 ? (
                  <Volume1 className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={(e) => handleVolumeChange(Number(e.target.value))}
                className="w-18 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-rose-500"
              />
            </div>

            {/* Playback Speed Selector */}
            <div className="flex items-center space-x-1">
              {[0.5, 1, 1.5, 2].map((s) => (
                <button
                  key={s}
                  onClick={() => handleSpeedChange(s)}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-bold font-mono transition cursor-pointer ${
                    playbackRate === s
                      ? 'bg-rose-600 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>

            {/* Aspect Ratio Selector */}
            <select
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value as any)}
              className="px-2 py-1 rounded-lg bg-slate-800 border border-white/10 text-xs text-slate-200 focus:outline-none cursor-pointer"
              title="Proporção de Tela / Aspect Ratio"
            >
              <option value="auto">Aspect: Auto</option>
              <option value="16:9">Aspect: 16:9</option>
              <option value="21:9">Aspect: 21:9</option>
              <option value="4:3">Aspect: 4:3</option>
              <option value="fill">Preencher</option>
            </select>
          </div>

          {/* Right Controls: Loop, Snapshot, PiP, Fullscreen */}
          <div className="flex items-center space-x-1">
            {/* Repeat Mode */}
            <button
              onClick={() => {
                const next = repeatMode === 'off' ? 'all' : repeatMode === 'all' ? 'one' : 'off';
                setRepeatMode(next);
              }}
              className={`p-1.5 rounded-lg transition cursor-pointer border ${
                repeatMode !== 'off'
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                  : 'text-slate-400 hover:text-white border-transparent'
              }`}
              title={`Repetição: ${repeatMode === 'all' ? 'Tudo' : repeatMode === 'one' ? 'Repetir Um' : 'Desativada'}`}
            >
              <Repeat className="w-4 h-4" />
            </button>

            {/* Shuffle */}
            <button
              onClick={() => setIsShuffle(!isShuffle)}
              className={`p-1.5 rounded-lg transition cursor-pointer border ${
                isShuffle
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                  : 'text-slate-400 hover:text-white border-transparent'
              }`}
              title="Modo Aleatório / Shuffle"
            >
              <Shuffle className="w-4 h-4" />
            </button>

            {/* Snapshot Frame */}
            <button
              onClick={takeSnapshot}
              className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition cursor-pointer"
              title="Capturar Frame / Screenshot (S)"
            >
              <Camera className="w-4 h-4 text-cyan-400" />
            </button>

            {/* Picture-in-Picture */}
            <button
              onClick={togglePiP}
              className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition cursor-pointer"
              title="Picture-in-Picture (P)"
            >
              <PictureInPicture className="w-4 h-4" />
            </button>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition cursor-pointer"
              title="Tela Cheia (F)"
            >
              <Maximize className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayerApp;
