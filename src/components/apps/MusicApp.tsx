import React, { useState, useRef, useEffect } from 'react';
import {
  Music,
  Play,
  Pause,
  Square,
  Disc,
  Volume2,
  VolumeX,
  SkipForward,
  SkipBack,
  Sliders,
  Grid,
  Radio,
  Mic,
  Download,
  Upload,
  Sparkles,
  Repeat,
  Shuffle,
  Activity,
  Layers,
  Zap,
  Box,
  ExternalLink,
  CheckCircle2,
  Cpu
} from 'lucide-react';

interface TrackItem {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: string;
  durationSec: number;
  cover: string;
  genre: string;
  bpm: number;
  audioUrl?: string;
}

interface RadioStation {
  id: string;
  name: string;
  genre: string;
  bitrate: string;
  listeners: string;
  cover: string;
  baseFreq: number;
  color: string;
}

const DEFAULT_TRACKS: TrackItem[] = [
  {
    id: 'm1',
    title: 'Neon Odyssey (Synthwave)',
    artist: 'InoveCloud Sounds',
    album: 'Cybernetic Dreams 2026',
    duration: '3:45',
    durationSec: 225,
    cover: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=400&q=80',
    genre: 'Synthwave',
    bpm: 124,
  },
  {
    id: 'm2',
    title: 'Midnight Lo-Fi Terminal',
    artist: 'Antigravity Chill',
    album: 'Kernel Panic Sessions',
    duration: '2:50',
    durationSec: 170,
    cover: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80',
    genre: 'Lo-Fi Beat',
    bpm: 86,
  },
  {
    id: 'm3',
    title: 'Hypervisor Sub-Bass Drive',
    artist: 'KVM Audio Labs',
    album: 'Kernel Frequency',
    duration: '4:12',
    durationSec: 252,
    cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=400&q=80',
    genre: 'Cyberpunk Trap',
    bpm: 140,
  },
];

const RADIO_STATIONS: RadioStation[] = [
  {
    id: 'lofi-beats',
    name: 'Lo-Fi Chillhop Beats 24/7',
    genre: 'Lo-Fi / Study & Focus',
    bitrate: '320 kbps',
    listeners: '18.4K',
    cover: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80',
    baseFreq: 220,
    color: 'from-amber-600 to-orange-700',
  },
  {
    id: 'synthwave-80s',
    name: 'Synthwave 80s Cyber Radio',
    genre: 'Retrowave / Darksynth',
    bitrate: '320 kbps',
    listeners: '34.2K',
    cover: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=400&q=80',
    baseFreq: 146.83,
    color: 'from-purple-600 to-pink-700',
  },
  {
    id: 'chiptune-8bit',
    name: 'Chiptune & 8-Bit Retro Game',
    genre: 'Gameboy / Chiptune FM',
    bitrate: '256 kbps',
    listeners: '12.1K',
    cover: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=400&q=80',
    baseFreq: 440,
    color: 'from-cyan-600 to-blue-700',
  },
  {
    id: 'ambient-coding',
    name: 'Linux Kernel Ambient Flow',
    genre: 'Deep Focus Ambient',
    bitrate: '320 kbps',
    listeners: '41.8K',
    cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=400&q=80',
    baseFreq: 110,
    color: 'from-emerald-600 to-teal-700',
  },
];

const COMPATIBILITY_APPS = [
  {
    id: 'audacious',
    name: 'Audacious Audio Player (.deb)',
    format: 'DPKG / .deb',
    desc: 'Player de áudio nativo ultrarrápido compatível com skins clássicas do Winamp, equalizador 10 bandas e consumo <40MB RAM.',
    icon: 'music',
    color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  },
  {
    id: 'sonic-pi',
    name: 'Sonic Pi (Pi Store)',
    format: 'Raspberry Pi / Pi Store',
    desc: 'Sintetizador musical e estúdio de live coding ao vivo para compor batidas eletrônicas com código Ruby em tempo real.',
    icon: 'code',
    color: 'bg-red-500/20 text-red-300 border-red-500/30',
  },
  {
    id: 'spotify',
    name: 'Spotify Streaming (Flathub)',
    format: 'Flathub / Flatpak',
    desc: 'Acesso completo a milhões de músicas, podcasts e playlists no InoveCloud OS com aceleração por hardware.',
    icon: 'sparkles',
    color: 'bg-green-500/20 text-green-300 border-green-500/30',
  },
  {
    id: 'audacity',
    name: 'Audacity Audio Studio (AppImage)',
    format: 'AppImage Portable',
    desc: 'Editor e gravador multipista profissional com efeitos de redução de ruído, equalizador e masterização de som.',
    icon: 'sliders',
    color: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  },
  {
    id: 'vlc',
    name: 'VLC Media Player (Flathub)',
    format: 'Flathub / Flatpak',
    desc: 'Reprodutor universal de áudio e vídeo compatível com todos os formatos e streaming de rádio pela web.',
    icon: 'play',
    color: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  },
];

// 6 Drum tracks for the 16-step sequencer
const DRUM_TRACKS = [
  { id: 'kick', name: 'Kick 808', color: 'bg-rose-500' },
  { id: 'snare', name: 'Snare Hard', color: 'bg-amber-500' },
  { id: 'hihat_c', name: 'Hi-Hat Closed', color: 'bg-cyan-500' },
  { id: 'hihat_o', name: 'Hi-Hat Open', color: 'bg-blue-500' },
  { id: 'clap', name: 'Studio Clap', color: 'bg-fuchsia-500' },
  { id: 'bass', name: 'Sub Bass', color: 'bg-violet-500' },
];

const MPC_PADS = [
  { key: '1', note: 'Kick', keyChar: '1', color: 'from-rose-500 to-red-600', freq: 60, type: 'sine' },
  { key: '2', note: 'Snare', keyChar: '2', color: 'from-amber-500 to-orange-600', freq: 220, type: 'triangle' },
  { key: '3', note: 'Clap', keyChar: '3', color: 'from-pink-500 to-rose-600', freq: 440, type: 'sawtooth' },
  { key: '4', note: 'Hat Cl', keyChar: '4', color: 'from-cyan-500 to-blue-600', freq: 800, type: 'square' },
  { key: 'Q', note: 'Lead C4', keyChar: 'Q', color: 'from-indigo-500 to-purple-600', freq: 261.63, type: 'sawtooth' },
  { key: 'W', note: 'Lead E4', keyChar: 'W', color: 'from-purple-500 to-fuchsia-600', freq: 329.63, type: 'sawtooth' },
  { key: 'E', note: 'Lead G4', keyChar: 'E', color: 'from-fuchsia-500 to-pink-600', freq: 392.00, type: 'sawtooth' },
  { key: 'R', note: 'Lead B4', keyChar: 'R', color: 'from-blue-500 to-cyan-600', freq: 493.88, type: 'sawtooth' },
  { key: 'A', note: 'Sub C2', keyChar: 'A', color: 'from-emerald-500 to-teal-600', freq: 65.41, type: 'sine' },
  { key: 'S', note: 'Sub F2', keyChar: 'S', color: 'from-teal-500 to-emerald-600', freq: 87.31, type: 'sine' },
  { key: 'D', note: 'Sub G2', keyChar: 'D', color: 'from-green-500 to-emerald-600', freq: 98.00, type: 'sine' },
  { key: 'F', note: 'Sub A2', keyChar: 'F', color: 'from-cyan-500 to-teal-600', freq: 110.00, type: 'sine' },
];

export const MusicApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'player' | 'radios' | 'sequencer' | 'mpc' | 'eq' | 'compatibility'>('player');
  const [tracks, setTracks] = useState<TrackItem[]>(DEFAULT_TRACKS);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [trackProgress, setTrackProgress] = useState<number>(0);
  const [volume, setVolume] = useState<number>(85);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Online Radio State
  const [activeRadio, setActiveRadio] = useState<RadioStation | null>(null);
  const [isRadioPlaying, setIsRadioPlaying] = useState<boolean>(false);

  // Sequencer / DAW States
  const [bpm, setBpm] = useState<number>(120);
  const [isSequencerPlaying, setIsSequencerPlaying] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [grid, setGrid] = useState<boolean[][]>(() => {
    const initialGrid = Array(6).fill(null).map(() => Array(16).fill(false));
    initialGrid[0][0] = true;
    initialGrid[0][4] = true;
    initialGrid[0][8] = true;
    initialGrid[0][12] = true;
    initialGrid[1][4] = true;
    initialGrid[1][12] = true;
    for (let i = 0; i < 16; i += 2) initialGrid[2][i] = true;
    initialGrid[5][0] = true;
    initialGrid[5][6] = true;
    initialGrid[5][10] = true;
    return initialGrid;
  });

  // Equalizer Bands (dB from -12 to +12)
  const [eqBands, setEqBands] = useState<number[]>([3, 5, 0, 2, 4]);

  // Audio Context & Element Ref
  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentTrack = tracks[currentTrackIndex] || tracks[0];

  const getAudioContext = () => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioCtx();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  // Synthesize Sound via Web Audio API
  const playSynthesizedTone = (freq: number, type: OscillatorType = 'sine', duration = 0.25) => {
    try {
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      if (type === 'sine' && freq < 100) {
        osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + duration);
      }

      gain.gain.setValueAtTime((volume / 100) * 0.35, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      console.warn('Web Audio synthesis error:', e);
    }
  };

  // Radio streaming harmonic synthesizer
  useEffect(() => {
    let radioInterval: any;
    if (isRadioPlaying && activeRadio) {
      const chordNotes = [
        activeRadio.baseFreq,
        activeRadio.baseFreq * 1.25,
        activeRadio.baseFreq * 1.5,
        activeRadio.baseFreq * 1.75
      ];
      let step = 0;
      radioInterval = setInterval(() => {
        const note = chordNotes[step % chordNotes.length];
        playSynthesizedTone(note, 'sine', 0.8);
        if (step % 2 === 0) {
          playSynthesizedTone(activeRadio.baseFreq / 2, 'triangle', 0.6);
        }
        step++;
      }, 750);
    }
    return () => clearInterval(radioInterval);
  }, [isRadioPlaying, activeRadio, volume]);

  // Sequencer playback timer
  useEffect(() => {
    let interval: any;
    if (isSequencerPlaying) {
      const stepDurationMs = (60 / bpm / 4) * 1000;
      interval = setInterval(() => {
        setCurrentStep((prev) => {
          const next = (prev + 1) % 16;
          grid.forEach((row, rowIndex) => {
            if (row[next]) {
              const drumFreqs = [55, 180, 750, 950, 420, 45];
              const drumTypes: OscillatorType[] = ['sine', 'triangle', 'square', 'square', 'sawtooth', 'sine'];
              playSynthesizedTone(drumFreqs[rowIndex], drumTypes[rowIndex], 0.18);
            }
          });
          return next;
        });
      }, stepDurationMs);
    }
    return () => clearInterval(interval);
  }, [isSequencerPlaying, bpm, grid, volume]);

  // Track Player simulation & harmonic ambient tone loop
  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      const chords = [
        [220, 261.63, 329.63],
        [174.61, 220, 261.63],
        [261.63, 329.63, 392],
        [196, 246.94, 293.66],
      ];
      timer = setInterval(() => {
        setTrackProgress((prev) => {
          if (prev >= currentTrack.durationSec) {
            handleNextTrack();
            return 0;
          }
          if (!currentTrack.audioUrl) {
            const chordIndex = Math.floor(prev / 4) % chords.length;
            const noteIndex = prev % 3;
            const freq = chords[chordIndex][noteIndex];
            playSynthesizedTone(freq, 'sine', 0.6);
            if (prev % 2 === 0) {
              playSynthesizedTone(freq / 2, 'triangle', 0.4);
            }
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, currentTrack, volume]);

  const handleNextTrack = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % tracks.length);
    setTrackProgress(0);
  };

  const handlePrevTrack = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + tracks.length) % tracks.length);
    setTrackProgress(0);
  };

  const toggleStep = (rowIdx: number, stepIdx: number) => {
    setGrid((prev) => {
      const copy = prev.map((r) => [...r]);
      copy[rowIdx][stepIdx] = !copy[rowIdx][stepIdx];
      return copy;
    });
  };

  const handleUploadAudio = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const url = URL.createObjectURL(file);
    const newTrack: TrackItem = {
      id: `audio_${Date.now()}`,
      title: file.name.replace(/\.[^/.]+$/, ''),
      artist: 'Upload Local',
      album: 'Minha Biblioteca Local',
      duration: '3:30',
      durationSec: 210,
      cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80',
      genre: 'Personalizado',
      bpm: 120,
      audioUrl: url,
    };
    setTracks((prev) => [newTrack, ...prev]);
    setCurrentTrackIndex(0);
    setTrackProgress(0);
    setIsPlaying(true);

    if (audioElementRef.current) {
      audioElementRef.current.src = url;
      audioElementRef.current.play().catch(() => {});
    }
  };

  const formatSecs = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-100 font-sans select-none overflow-hidden">
      {/* Hidden HTML5 Audio Element for Local Files */}
      <audio ref={audioElementRef} />

      {/* Top Header */}
      <header className="h-14 border-b border-white/10 px-4 flex items-center justify-between bg-slate-900/90 backdrop-blur-md z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 via-red-600 to-pink-600 p-0.5 shadow-lg shadow-red-500/20 flex items-center justify-center">
            <Music className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white flex items-center gap-2">
              Inove Music &amp; Audio Studio
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 font-semibold border border-red-500/30">
                PIPEWIRE ALSA HI-FI
              </span>
            </h1>
            <p className="text-[11px] text-slate-400">Player Nativo, Rádios Online, Flathub &amp; Pi Store</p>
          </div>
        </div>

        {/* Mode Navigation Tabs */}
        <div className="flex items-center bg-slate-800/80 p-1 rounded-xl border border-white/10 text-xs">
          <button
            onClick={() => setActiveTab('player')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'player' ? 'bg-red-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Disc className="w-3.5 h-3.5" />
            Player Hi-Fi
          </button>
          <button
            onClick={() => setActiveTab('radios')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'radios' ? 'bg-red-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            Rádios Online
          </button>
          <button
            onClick={() => setActiveTab('sequencer')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'sequencer' ? 'bg-red-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            Beatmaker 808
          </button>
          <button
            onClick={() => setActiveTab('mpc')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'mpc' ? 'bg-red-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            MPC Pads
          </button>
          <button
            onClick={() => setActiveTab('eq')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'eq' ? 'bg-red-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            Equalizador
          </button>
          <button
            onClick={() => setActiveTab('compatibility')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'compatibility' ? 'bg-red-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            Flathub &amp; Pi Store
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            onChange={handleUploadAudio}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-white/10 flex items-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-red-400" />
            Carregar MP3/FLAC
          </button>
        </div>
      </header>

      {/* Main Studio Viewport */}
      <div className="flex-1 flex overflow-hidden">
        {/* Tab 1: Hi-Fi Player & Library */}
        {activeTab === 'player' && (
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden p-6 gap-6">
            {/* Left: Album Art & Active Player */}
            <div className="flex-1 flex flex-col items-center justify-center bg-slate-900/60 rounded-3xl border border-white/10 p-6 relative overflow-hidden shadow-2xl">
              <div
                className="absolute inset-0 opacity-20 blur-3xl scale-125 pointer-events-none"
                style={{
                  backgroundImage: `url(${currentTrack.cover})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />

              <div className="w-56 h-56 rounded-2xl overflow-hidden shadow-2xl border border-white/20 mb-6 relative group">
                <img
                  src={currentTrack.cover}
                  alt={currentTrack.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {isPlaying && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="flex items-end gap-1.5 h-8">
                      <span className="w-1.5 bg-red-500 rounded-full animate-bounce h-8" />
                      <span className="w-1.5 bg-rose-400 rounded-full animate-bounce h-5" style={{ animationDelay: '0.15s' }} />
                      <span className="w-1.5 bg-red-500 rounded-full animate-bounce h-7" style={{ animationDelay: '0.3s' }} />
                      <span className="w-1.5 bg-pink-400 rounded-full animate-bounce h-4" style={{ animationDelay: '0.45s' }} />
                    </div>
                  </div>
                )}
              </div>

              <div className="text-center mb-6">
                <h2 className="text-lg font-bold text-white mb-1">{currentTrack.title}</h2>
                <p className="text-xs text-red-400 font-semibold">{currentTrack.artist}</p>
                <p className="text-[11px] text-slate-400">{currentTrack.album} • {currentTrack.bpm} BPM</p>
              </div>

              {/* Progress Slider */}
              <div className="w-full max-w-md space-y-1 mb-4">
                <input
                  type="range"
                  min="0"
                  max={currentTrack.durationSec}
                  value={trackProgress}
                  onChange={(e) => setTrackProgress(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-red-500"
                />
                <div className="flex justify-between text-[11px] font-mono text-slate-400">
                  <span>{formatSecs(trackProgress)}</span>
                  <span>{currentTrack.duration}</span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-5">
                <button
                  onClick={handlePrevTrack}
                  className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <SkipBack className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setIsPlaying((p) => !p)}
                  className="w-14 h-14 rounded-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white flex items-center justify-center shadow-xl shadow-red-600/30 transition-transform active:scale-95 cursor-pointer"
                >
                  {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
                </button>
                <button
                  onClick={handleNextTrack}
                  className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <SkipForward className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Right: Playlist Library */}
            <div className="w-full md:w-80 bg-slate-900/90 rounded-3xl border border-white/10 p-4 flex flex-col shadow-xl">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                Playlist do Estúdio ({tracks.length})
              </h3>
              <div className="flex-1 space-y-2 overflow-y-auto pr-1 custom-scrollbar">
                {tracks.map((t, idx) => (
                  <div
                    key={t.id}
                    onClick={() => {
                      setCurrentTrackIndex(idx);
                      setTrackProgress(0);
                      setIsPlaying(true);
                      if (t.audioUrl && audioElementRef.current) {
                        audioElementRef.current.src = t.audioUrl;
                        audioElementRef.current.play().catch(() => {});
                      }
                    }}
                    className={`p-2.5 rounded-2xl border flex items-center gap-3 cursor-pointer transition-all ${
                      currentTrackIndex === idx
                        ? 'bg-red-600/15 border-red-500/50 shadow-md ring-1 ring-red-500/30'
                        : 'bg-slate-800/60 border-white/5 hover:bg-slate-800'
                    }`}
                  >
                    <img src={t.cover} alt={t.title} className="w-11 h-11 rounded-xl object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-bold truncate ${currentTrackIndex === idx ? 'text-red-400' : 'text-slate-200'}`}>
                        {t.title}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">{t.artist}</p>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">{t.duration}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Rádios Online */}
        {activeTab === 'radios' && (
          <div className="flex-1 p-6 overflow-y-auto space-y-6">
            <div className="p-6 rounded-2xl bg-gradient-to-r from-red-950/40 via-slate-900 to-amber-950/40 border border-red-500/30 space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-red-600/20 text-red-400 flex items-center justify-center font-bold">
                  <Radio className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Transmissões de Rádio Online &amp; Lo-Fi</h3>
                  <p className="text-xs text-slate-300">
                    Estações de streaming com áudio em alta definição sintetizado diretamente no driver de áudio ALSA / PipeWire do Kernel Linux 7.3 RT.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {RADIO_STATIONS.map((station) => {
                const isSelected = activeRadio?.id === station.id && isRadioPlaying;
                return (
                  <div
                    key={station.id}
                    className="p-5 rounded-2xl bg-slate-900 border border-white/10 hover:border-red-500/40 transition-all flex items-center justify-between gap-4 shadow-lg"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 shadow-md">
                        <img src={station.cover} alt={station.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-white truncate">{station.name}</h4>
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                            AO VIVO
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{station.genre}</p>
                        <p className="text-[11px] font-mono text-cyan-400 mt-1">{station.bitrate} • {station.listeners} ouvintes</p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        if (isSelected) {
                          setIsRadioPlaying(false);
                        } else {
                          setActiveRadio(station);
                          setIsRadioPlaying(true);
                          setIsPlaying(false);
                        }
                      }}
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-bold shadow-lg transition-transform active:scale-95 cursor-pointer shrink-0 ${
                        isSelected
                          ? 'bg-rose-600 text-white ring-4 ring-rose-500/30'
                          : 'bg-white/10 hover:bg-white/20 text-white'
                      }`}
                    >
                      {isSelected ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 3: Beatmaker 16-Step */}
        {activeTab === 'sequencer' && (
          <div className="flex-1 flex flex-col p-6 overflow-y-auto space-y-4">
            <div className="flex items-center justify-between bg-slate-900 p-4 rounded-2xl border border-white/10">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsSequencerPlaying((p) => !p)}
                  className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-md cursor-pointer ${
                    isSequencerPlaying
                      ? 'bg-rose-600 text-white'
                      : 'bg-gradient-to-r from-red-600 to-rose-600 text-white'
                  }`}
                >
                  {isSequencerPlaying ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  {isSequencerPlaying ? 'Parar Beat' : 'Tocar Sequenciador'}
                </button>
                <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-xl border border-white/5 text-xs">
                  <span className="text-slate-400">Tempo:</span>
                  <input
                    type="number"
                    min="60"
                    max="200"
                    value={bpm}
                    onChange={(e) => setBpm(Number(e.target.value))}
                    className="w-14 bg-transparent text-white font-mono font-bold focus:outline-none"
                  />
                  <span className="text-slate-400">BPM</span>
                </div>
              </div>

              <span className="text-xs text-slate-400 font-mono">
                Passo: <strong className="text-red-400">{currentStep + 1}</strong> / 16
              </span>
            </div>

            <div className="bg-slate-900/90 rounded-2xl border border-white/10 p-4 space-y-3">
              {DRUM_TRACKS.map((track, rowIdx) => (
                <div key={track.id} className="flex items-center gap-3">
                  <span className="w-24 text-xs font-semibold text-slate-300 truncate">{track.name}</span>
                  <div className="flex-1 grid grid-cols-16 gap-1.5">
                    {grid[rowIdx].map((active, stepIdx) => (
                      <button
                        key={stepIdx}
                        onClick={() => toggleStep(rowIdx, stepIdx)}
                        className={`h-9 rounded-lg transition-all cursor-pointer ${
                          active
                            ? track.color + ' shadow-md'
                            : stepIdx % 4 === 0
                            ? 'bg-slate-800 hover:bg-slate-700'
                            : 'bg-slate-850 hover:bg-slate-800'
                        } ${currentStep === stepIdx ? 'ring-2 ring-white scale-105' : ''}`}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: MPC Drum Pads */}
        {activeTab === 'mpc' && (
          <div className="flex-1 p-6 flex flex-col items-center justify-center">
            <div className="grid grid-cols-4 gap-4 max-w-xl w-full">
              {MPC_PADS.map((pad) => (
                <button
                  key={pad.key}
                  onClick={() => playSynthesizedTone(pad.freq, pad.type as OscillatorType, 0.28)}
                  className={`h-24 rounded-2xl bg-gradient-to-tr ${pad.color} p-3 flex flex-col justify-between text-white shadow-xl hover:opacity-90 active:scale-95 transition-all cursor-pointer`}
                >
                  <span className="text-xs font-mono font-bold bg-black/30 px-1.5 py-0.5 rounded self-start">
                    {pad.keyChar}
                  </span>
                  <span className="font-bold text-sm">{pad.note}</span>
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-4 font-mono">
              Clique nos pads para sintetizar tons e batidas em tempo real.
            </p>
          </div>
        )}

        {/* Tab 5: Equalizer */}
        {activeTab === 'eq' && (
          <div className="flex-1 p-6 flex flex-col items-center justify-center">
            <div className="bg-slate-900 p-8 rounded-3xl border border-white/10 max-w-md w-full space-y-6 shadow-2xl">
              <h3 className="text-sm font-bold text-white text-center uppercase tracking-wider">
                Equalizador Gráfico de 5 Bandas
              </h3>
              <div className="flex justify-between items-center h-48 px-4">
                {['60Hz', '250Hz', '1kHz', '4kHz', '16kHz'].map((label, idx) => (
                  <div key={label} className="flex flex-col items-center gap-2">
                    <input
                      type="range"
                      min="-12"
                      max="12"
                      value={eqBands[idx]}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setEqBands((prev) => {
                          const c = [...prev];
                          c[idx] = val;
                          return c;
                        });
                      }}
                      className="h-28 -rotate-90 w-28 bg-slate-800 rounded appearance-none accent-red-500 cursor-pointer"
                    />
                    <span className="text-[10px] text-slate-400 font-medium mt-2">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 6: Flathub & Pi Store Compatibility */}
        {activeTab === 'compatibility' && (
          <div className="flex-1 p-6 overflow-y-auto space-y-6">
            <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-blue-950/40 border border-emerald-500/30 space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-bold">
                  <Box className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Aplicativos de Música Compatíveis (Flathub, Pi Store &amp; DPKG)</h3>
                  <p className="text-xs text-slate-300">
                    O InoveCloud OS Kernel 7.3 RT suporta nativamente os principais reprodutores e sintetizadores do ecossistema Linux.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {COMPATIBILITY_APPS.map((app) => (
                <div key={app.id} className="p-5 rounded-2xl bg-slate-900 border border-white/10 space-y-3 shadow-lg">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-white">{app.name}</h4>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${app.color}`}>
                      {app.format}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {app.desc}
                  </p>
                  <div className="pt-2 flex items-center justify-between border-t border-white/5">
                    <span className="text-[11px] text-emerald-400 font-mono">● Compatível com Kernel 7.3 RT</span>
                    <button
                      onClick={() => alert(`Para instalar ${app.name}, abra a Central de Aplicativos (App Hub) na aba ${app.format}.`)}
                      className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition cursor-pointer"
                    >
                      Instalar via Central
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
