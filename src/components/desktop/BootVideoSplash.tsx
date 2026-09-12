import React, { useState, useEffect } from 'react';
import { Play, Sparkles, Volume2, VolumeX, RotateCcw, X, ShieldCheck } from 'lucide-react';

interface BootVideoSplashProps {
  onComplete: () => void;
  autoDismiss?: boolean;
  canSkip?: boolean;
}

/**
 * BootVideoSplash - Animação cinematográfica de inicialização oficial InoveCloud OS para ISO e Sistema
 * Reproduz fielmente a sequência do vídeo oficial:
 * 1. "SEU SISTEMA" com tipografia imersiva com textura orgânica / floresta
 * 2. "ELEGANTE PODEROSO" em gradiente azul elétrico, ciano e neon vibrante
 * 3. "INOVECLOUD OS" com o logo da nuvem estilizado em movimento fluido
 * 4. Transição de fade para a área de trabalho
 */
export const BootVideoSplash: React.FC<BootVideoSplashProps> = ({
  onComplete,
  autoDismiss = true,
  canSkip = true,
}) => {
  // Current scene in the video boot sequence:
  // 0: SEU SISTEMA (0s - 1.2s)
  // 1: ELEGANTE PODEROSO (1.2s - 2.4s)
  // 2: INOVECLOUD OS + Cloud Logo (2.4s - 3.8s)
  // 3: Fade out para Desktop (3.8s - 4.3s)
  const [phase, setPhase] = useState<number>(0);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [progress, setProgress] = useState<number>(0);

  // Play a soft high-tech harmonic boot chime using Web Audio API
  useEffect(() => {
    let audioCtx: AudioContext | null = null;
    try {
      if (soundEnabled) {
        audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        const playChime = (freq: number, startTime: number, duration: number, vol = 0.08) => {
          if (!audioCtx) return;
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, startTime);
          gain.gain.setValueAtTime(0, startTime);
          gain.gain.linearRampToValueAtTime(vol, startTime + 0.05);
          gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start(startTime);
          osc.stop(startTime + duration);
        };

        const now = audioCtx.currentTime;
        // Cinematic harmonic chords (C major 9th ethereal arpeggio)
        playChime(523.25, now + 0.1, 1.2, 0.07); // C5
        playChime(659.25, now + 0.35, 1.4, 0.08); // E5
        playChime(783.99, now + 0.6, 1.5, 0.08); // G5
        playChime(987.77, now + 1.2, 1.8, 0.09); // B5
        playChime(1046.5, now + 2.3, 2.2, 0.11); // C6 - InoveCloud OS final chord
        playChime(1318.51, now + 2.4, 2.0, 0.09); // E6
      }
    } catch (e) {
      console.log('AudioContext auto-play prevented until interaction', e);
    }

    return () => {
      if (audioCtx && audioCtx.state !== 'closed') {
        try {
          audioCtx.close();
        } catch (e) {
          // ignore
        }
      }
    };
  }, [soundEnabled]);

  // Phase transitions matching exact video timings
  useEffect(() => {
    // 0 -> 1 at 1.15s
    const t1 = setTimeout(() => {
      setPhase(1);
    }, 1150);

    // 1 -> 2 at 2.35s
    const t2 = setTimeout(() => {
      setPhase(2);
    }, 2350);

    // 2 -> 3 (Fade-out) at 3.75s
    const t3 = setTimeout(() => {
      setPhase(3);
    }, 3750);

    // End boot splash at 4.25s
    const t4 = setTimeout(() => {
      if (autoDismiss) {
        onComplete();
      }
    }, 4250);

    // Progress bar animation
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2.5;
      });
    }, 100);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearInterval(interval);
    };
  }, [autoDismiss, onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-white select-none transition-opacity duration-700 font-sans overflow-hidden ${
        phase === 3 ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{
        background: '#ffffff',
      }}
    >
      {/* Background ambient subtle glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <div
          className={`w-[600px] h-[600px] rounded-full blur-[120px] transition-all duration-1000 ${
            phase === 0
              ? 'bg-emerald-200/20 scale-90'
              : phase === 1
              ? 'bg-cyan-200/35 scale-110'
              : 'bg-gradient-to-tr from-blue-300/30 via-purple-200/25 to-pink-200/30 scale-125'
          }`}
        />
      </div>

      {/* Main Visual Center Stage */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-4xl px-6 min-h-[300px]">
        {/* ========================================================================= */}
        {/* FRAME 1: "SEU SISTEMA" com tipografia sólida texturizada orgânica         */}
        {/* ========================================================================= */}
        {phase === 0 && (
          <div className="flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-500">
            <h1
              className="text-4xl sm:text-6xl md:text-7xl font-black tracking-wider text-center uppercase"
              style={{
                fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                fontWeight: 900,
                letterSpacing: '0.08em',
                background: 'linear-gradient(135deg, #1b3a24 0%, #2e5939 30%, #3e6d42 55%, #18331f 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.12))',
              }}
            >
              SEU SISTEMA
            </h1>
          </div>
        )}

        {/* ========================================================================= */}
        {/* FRAME 2: "ELEGANTE PODEROSO" em azul royal e ciano neon vibrante          */}
        {/* ========================================================================= */}
        {phase === 1 && (
          <div className="flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-500">
            <h1
              className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-wide text-center uppercase whitespace-nowrap"
              style={{
                fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                fontWeight: 950,
                letterSpacing: '0.04em',
                background: 'linear-gradient(90deg, #0055ff 0%, #00d2ff 38%, #0044ff 65%, #0011ff 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 4px 12px rgba(0, 102, 255, 0.2))',
              }}
            >
              ELEGANTE PODEROSO
            </h1>
          </div>
        )}

        {/* ========================================================================= */}
        {/* FRAME 3: "INOVECLOUD OS" + LOGO DE NUVEM COM TRAÇO DUPLO ELEGANTE         */}
        {/* ========================================================================= */}
        {(phase === 2 || phase === 3) && (
          <div className="flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-500 space-y-6">
            <h1
              className="text-4xl sm:text-6xl md:text-7xl font-black tracking-wider text-center uppercase"
              style={{
                fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                fontWeight: 950,
                letterSpacing: '0.08em',
                background:
                  'linear-gradient(90deg, #1e40af 0%, #3b82f6 20%, #ec4899 45%, #a855f7 70%, #1e1b4b 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 4px 10px rgba(0, 0, 0, 0.15))',
              }}
            >
              INOVECLOUD OS
            </h1>

            {/* Cloud Icon Vector - Exact thick-stroke geometry from video */}
            <div className="relative w-28 h-20 flex items-center justify-center transform transition-transform duration-700 scale-105">
              <svg
                viewBox="0 0 100 70"
                className="w-full h-full text-slate-900 drop-shadow-md"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Cloud outer outline with bold stroke */}
                <path
                  d="M30 60 L72 60 C82 60 89 53 89 43 C89 34 82 27 73 27 C71 27 70 27.5 68 28 C65 17 56 10 45 10 C32 10 22 20 22 33 C22 35 22.5 37 23 39 C15 41 10 48 10 55 C10 63 17 60 30 60 Z"
                  stroke="#111827"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Internal swirl / accent loop matching the video logo */}
                <path
                  d="M33 52 C27 52 22 47 22 41 C22 35 27 30 33 30 C35 30 37 30.5 38 31 C40 23 47 18 54 18 C62 18 68 23 69 31 C74 31 78 35 78 40 C78 45 74 52 68 52"
                  stroke="#111827"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.85"
                />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Loading Bar and System Appliance Diagnostics */}
      <div className="absolute bottom-8 inset-x-0 flex flex-col items-center justify-center space-y-2.5 px-6">
        {/* Subtle Minimalist Progress Line */}
        <div className="w-48 h-1 bg-slate-200 rounded-full overflow-hidden shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 rounded-full transition-all duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center space-x-2 text-[11px] text-slate-500 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>InoveCloud OS Live Appliance • Inicializando Kernel &amp; Kiosk Wayland...</span>
        </div>
      </div>

      {/* Top Controls: Sound Toggle and Skip Button */}
      <div className="absolute top-5 right-6 flex items-center space-x-2">
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer shadow-sm border border-slate-200"
          title={soundEnabled ? 'Silenciar áudio do boot' : 'Ativar áudio do boot'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {canSkip && (
          <button
            onClick={onComplete}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition cursor-pointer shadow-sm border border-slate-200"
          >
            <span>Pular</span>
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Top Left Branding Badge */}
      <div className="absolute top-5 left-6 flex items-center space-x-2 text-xs font-bold text-slate-800">
        <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500" />
        <span className="tracking-wider uppercase text-[11px] text-slate-500">Live ISO UEFI / BIOS</span>
      </div>
    </div>
  );
};
export default BootVideoSplash;
