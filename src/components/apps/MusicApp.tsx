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
  Zap
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
  const [activeTab, setActiveTab] = useState<'player' | 'sequencer' | 'mpc' | 'eq'>('player');
  const [tracks, setTracks] = useState<TrackItem[]>(DEFAULT_TRACKS);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [trackProgress, setTrackProgress] = useState<number>(0);
  const [volume, setVolume] = useState<number>(85);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Sequencer / DAW States
  const [bpm, setBpm] = useState<number>(120);
  const [isSequencerPlaying, setIsSequencerPlaying] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [grid, setGrid] = useState<boolean[][]>(() => {
    // 6 rows x 16 steps default rhythm pattern
    const initialGrid = Array(6).fill(null).map(() => Array(16).fill(false));
    // Kick on 0, 4, 8, 12
    initialGrid[0][0] = true;
    initialGrid[0][4] = true;
    initialGrid[0][8] = true;
    initialGrid[0][12] = true;
    // Snare on 4, 12
    initialGrid[1][4] = true;
    initialGrid[1][12] = true;
    // Hi-Hat on even steps
    for (let i = 0; i < 16; i += 2) initialGrid[2][i] = true;
    // Sub bass on 0, 6, 10
    initialGrid[5][0] = true;
    initialGrid[5][6] = true;
    initialGrid[5][10] = true;
    return initialGrid;
  });

  // Equalizer Bands (dB from -12 to +12)
  const [eqBands, setEqBands] = useState<number[]>([3, 5, 0, 2, 4]);

  // Audio Context Ref
  const audioCtxRef = useRef<AudioContext | null>(null);
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
        // 808 sub kick pitch drop
        osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + duration);
      }

      gain.gain.setValueAtTime((volume / 100) * 0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      console.warn('Web Audio synthesis error:', e);
    }
  };

  // Sequencer playback timer
  useEffect(() => {
    let interval: any;
    if (isSequencerPlaying) {
      const stepDurationMs = (60 / bpm / 4) * 1000;
      interval = setInterval(() => {
        setCurrentStep((prev) => {
          const next = (prev + 1) % 16;
          // Play active voices on this step
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

  // Track Player simulation loop
  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => {
        setTrackProgress((prev) => {
          if (prev >= currentTrack.durationSec) {
            handleNextTrack();
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, currentTrack]);

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
    const newTrack: TrackItem = {
      id: `audio_${Date.now()}`,
      title: file.name.replace(/\.[^/.]+$/, ''),
      artist: 'Upload Local',
      album: 'Minha Biblioteca',
      duration: '3:30',
      durationSec: 210,
      cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80',
      genre: 'Personalizado',
      bpm: 120,
    };
    setTracks((prev) => [newTrack, ...prev]);
    setCurrentTrackIndex(0);
    setTrackProgress(0);
  };

  const formatSecs = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-100 font-sans select-none overflow-hidden">
      {/* Top Header */}
      <header className="h-14 border-b border-white/10 px-4 flex items-center justify-between bg-slate-900/90 backdrop-blur-md z-10 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 via-red-600 to-pink-600 p-0.5 shadow-lg shadow-red-500/20 flex items-center justify-center">
            <Music className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white flex items-center gap-2">
              Produtor de Música & DAW Studio
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 font-semibold border border-red-500/30">
                WEB AUDIO HI-FI
              </span>
            </h1>
            <p className="text-[11px] text-slate-400">Beatmaker 16-Step, MPC Pads, Sintetizador e Player</p>
          </div>
        </div>

        {/* Mode Navigation Tabs */}
        <div className="flex items-center bg-slate-800/80 p-1 rounded-xl border border-white/10 text-xs">
          <button
            onClick={() => setActiveTab('player')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'player' ? 'bg-red-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            Player Hi-Fi
          </button>
          <button
            onClick={() => setActiveTab('sequencer')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'sequencer' ? 'bg-red-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            Beatmaker 16-Step
          </button>
          <button
            onClick={() => setActiveTab('mpc')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'mpc' ? 'bg-red-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            MPC Drum Pads
          </button>
          <button
            onClick={() => setActiveTab('eq')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'eq' ? 'bg-red-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            Equalizador
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
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-white/10 flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
          >
            <Upload className="w-3.5 h-3.5 text-red-400" />
            Carregar Áudio
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
              {/* Background ambient blur */}
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
                  className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <SkipBack className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setIsPlaying((p) => !p)}
                  className="w-14 h-14 rounded-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white flex items-center justify-center shadow-xl shadow-red-600/30 transition-transform active:scale-95"
                >
                  {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
                </button>
                <button
                  onClick={handleNextTrack}
                  className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
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
              <div className="flex-1 space-y-2 overflow-y-auto pr-1">
                {tracks.map((t, idx) => (
                  <div
                    key={t.id}
                    onClick={() => {
                      setCurrentTrackIndex(idx);
                      setTrackProgress(0);
                      setIsPlaying(true);
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

        {/* Tab 2: Beatmaker 16-Step Sequencer */}
        {activeTab === 'sequencer' && (
          <div className="flex-1 flex flex-col p-4 overflow-y-auto space-y-4">
            {/* Top Sequencer Transport Bar */}
            <div className="flex items-center justify-between bg-slate-900 p-3 rounded-2xl border border-white/10">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsSequencerPlaying((p) => !p)}
                  className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-md ${
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
                    className="w-12 bg-transparent text-center font-bold text-red-400 focus:outline-none"
                  />
                  <span className="text-slate-400">BPM</span>
                </div>
              </div>

              {/* Presets */}
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-slate-400 mr-1">Rhythm Presets:</span>
                <button
                  onClick={() => {
                    setBpm(124);
                    const copy = Array(6).fill(null).map(() => Array(16).fill(false));
                    copy[0][0] = true; copy[0][4] = true; copy[0][8] = true; copy[0][12] = true;
                    copy[1][4] = true; copy[1][12] = true;
                    for (let i = 0; i < 16; i += 2) copy[2][i] = true;
                    setGrid(copy);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Synthwave
                </button>
                <button
                  onClick={() => {
                    setBpm(140);
                    const copy = Array(6).fill(null).map(() => Array(16).fill(false));
                    copy[0][0] = true; copy[0][6] = true; copy[0][8] = true;
                    copy[1][4] = true; copy[1][12] = true;
                    copy[4][4] = true; copy[4][12] = true;
                    setGrid(copy);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Cyber Trap
                </button>
                <button
                  onClick={() => {
                    setGrid(Array(6).fill(null).map(() => Array(16).fill(false)));
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-rose-300"
                >
                  Limpar
                </button>
              </div>
            </div>

            {/* 16-Step Grid Matrix */}
            <div className="bg-slate-900/90 rounded-2xl border border-white/10 p-4 space-y-3 shadow-xl overflow-x-auto">
              {/* Step indicator header */}
              <div className="flex items-center gap-2 min-w-[700px]">
                <div className="w-28 text-[11px] font-bold text-slate-400 uppercase">Instrumento</div>
                <div className="flex-1 grid grid-cols-16 gap-1">
                  {Array.from({ length: 16 }).map((_, stepIdx) => (
                    <div
                      key={stepIdx}
                      className={`h-5 rounded text-[10px] font-mono font-bold flex items-center justify-center transition-colors ${
                        currentStep === stepIdx && isSequencerPlaying
                          ? 'bg-red-500 text-white shadow-[0_0_8px_#ef4444]'
                          : stepIdx % 4 === 0
                          ? 'bg-slate-800 text-slate-300'
                          : 'bg-slate-850 text-slate-500'
                      }`}
                    >
                      {stepIdx + 1}
                    </div>
                  ))}
                </div>
              </div>

              {/* Drum Rows */}
              {DRUM_TRACKS.map((drum, rowIdx) => (
                <div key={drum.id} className="flex items-center gap-2 min-w-[700px]">
                  <button
                    onClick={() => {
                      const drumFreqs = [55, 180, 750, 950, 420, 45];
                      const drumTypes: OscillatorType[] = ['sine', 'triangle', 'square', 'square', 'sawtooth', 'sine'];
                      playSynthesizedTone(drumFreqs[rowIdx], drumTypes[rowIdx], 0.2);
                    }}
                    className="w-28 py-2 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-left text-xs font-bold text-slate-200 border border-white/5 flex items-center justify-between transition-colors"
                  >
                    <span>{drum.name}</span>
                    <Play className="w-3 h-3 text-red-400 opacity-60" />
                  </button>

                  <div className="flex-1 grid grid-cols-16 gap-1">
                    {grid[rowIdx].map((isActive, stepIdx) => (
                      <button
                        key={stepIdx}
                        onClick={() => toggleStep(rowIdx, stepIdx)}
                        className={`h-9 rounded-lg border transition-all ${
                          isActive
                            ? `${drum.color} border-white shadow-md shadow-red-500/20 scale-95`
                            : stepIdx % 4 === 0
                            ? 'bg-slate-800/80 border-white/10 hover:bg-slate-700'
                            : 'bg-slate-850 border-white/5 hover:bg-slate-750'
                        } ${currentStep === stepIdx && isSequencerPlaying ? 'ring-2 ring-white' : ''}`}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: MPC Drum Pads & Soundboard */}
        {activeTab === 'mpc' && (
          <div className="flex-1 p-6 flex flex-col items-center justify-center overflow-y-auto">
            <div className="w-full max-w-2xl bg-slate-900/90 rounded-3xl border border-white/10 p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Zap className="w-4 h-4 text-red-500" />
                  MPC Live Performance Pads (Gatilhos de Teclado)
                </h3>
                <span className="text-[11px] text-slate-400 font-mono">12-Pad Polyphonic Engine</span>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {MPC_PADS.map((pad) => (
                  <button
                    key={pad.key}
                    onClick={() => playSynthesizedTone(pad.freq, pad.type as OscillatorType, 0.35)}
                    className={`h-24 rounded-2xl bg-gradient-to-tr ${pad.color} border border-white/20 p-3 flex flex-col justify-between text-left text-white shadow-lg transition-all active:scale-90 hover:brightness-110`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/40 font-mono font-bold">
                        [{pad.keyChar}]
                      </span>
                      <Activity className="w-3.5 h-3.5 opacity-60" />
                    </div>
                    <div>
                      <p className="text-xs font-black">{pad.note}</p>
                      <p className="text-[10px] opacity-75 font-mono">{pad.freq}Hz</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: 5-Band Equalizer & Master FX */}
        {activeTab === 'eq' && (
          <div className="flex-1 p-6 flex flex-col items-center justify-center">
            <div className="w-full max-w-xl bg-slate-900/90 rounded-3xl border border-white/10 p-6 shadow-2xl space-y-6">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-4 h-4 text-red-500" />
                Equalizador Paramétrico de Estúdio (5-Bands)
              </h3>

              <div className="grid grid-cols-5 gap-4 h-48 items-end justify-items-center bg-slate-950 p-4 rounded-2xl border border-white/5">
                {['60Hz (Sub)', '250Hz (Bass)', '1kHz (Mids)', '4kHz (Presence)', '16kHz (Air)'].map((label, idx) => (
                  <div key={label} className="h-full flex flex-col items-center justify-between">
                    <span className="text-[10px] font-mono text-red-400 font-bold">
                      {eqBands[idx] > 0 ? `+${eqBands[idx]}` : eqBands[idx]}dB
                    </span>
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
                    <span className="text-[10px] text-slate-400 text-center font-medium mt-2">{label}</span>
                  </div>
                ))}
              </div>

              {/* Master Presets */}
              <div className="flex gap-2">
                <button
                  onClick={() => setEqBands([6, 4, -1, 3, 5])}
                  className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200"
                >
                  Bass Boost
                </button>
                <button
                  onClick={() => setEqBands([2, 3, 5, 4, 2])}
                  className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200"
                >
                  Vocal Clarity
                </button>
                <button
                  onClick={() => setEqBands([0, 0, 0, 0, 0])}
                  className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200"
                >
                  Flat Studio
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
