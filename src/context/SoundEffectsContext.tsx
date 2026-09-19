import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useSystemSettings } from './SystemSettingsContext';

export type SoundEffectType = 
  | 'pop_on'        // Pop agudo ascendente (ligar opção / switch ON)
  | 'pop_off'       // Pop encorpado descendente (desligar opção / switch OFF)
  | 'pop_click'     // Pop sutil táctil (clique em abas/menus)
  | 'toggle'        // Alternância padrão
  | 'tap'           // Toque rápido
  | 'switch'        // Estalo mecânico
  | 'slider'        // Feedback de arrasto de volume/brilho
  | 'beep'          // Alerta ou notificação
  | 'camera_snap'   // Obturador
  | 'trash'         // Esvaziar lixeira / deletar
  | 'dialog_open'   // Abertura de modal
  | 'dialog_close';  // Fechamento de modal

export interface SoundTheme {
  id: 'modern_pop' | 'retro_click' | 'bubble' | 'mechanical';
  name: string;
}

interface SoundEffectsContextType {
  // Configurações do subsistema de som
  soundsEnabled: boolean;
  volume: number; // 0 a 100
  soundTheme: SoundTheme['id'];
  
  // Ações de configuração
  setSoundsEnabled: (enabled: boolean) => void;
  toggleSounds: () => void;
  setVolume: (vol: number) => void;
  setSoundTheme: (theme: SoundTheme['id']) => void;
  
  // Disparadores de Efeitos Sonoros
  playSound: (type: SoundEffectType, customPitchFactor?: number) => void;
  playPop: (action: 'on' | 'off' | 'click') => void;
  playToggle: (active: boolean) => void;
  playSliderTick: (normalizedVal?: number) => void;
}

const SoundEffectsContext = createContext<SoundEffectsContextType | null>(null);

const SOUND_STORAGE_KEY = 'inovecloud_sound_effects_v1';

export const SoundEffectsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const sysSettings = useSystemSettings();

  // Estado local para personalizações de efeitos sonoros
  const [soundsEnabled, setSoundsEnabledState] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(SOUND_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.soundsEnabled ?? true;
      }
    } catch {
      // Ignorar fallback
    }
    return true;
  });

  const [soundTheme, setSoundTheme] = useState<SoundTheme['id']>('modern_pop');

  // Sincronizar com o contexto global do sistema quando alterado
  useEffect(() => {
    if (sysSettings?.systemSoundsEnabled !== undefined) {
      setSoundsEnabledState(sysSettings.systemSoundsEnabled);
    }
  }, [sysSettings?.systemSoundsEnabled]);

  const setSoundsEnabled = useCallback((enabled: boolean) => {
    setSoundsEnabledState(enabled);
    sysSettings?.setSystemSoundsEnabled?.(enabled);
    try {
      localStorage.setItem(SOUND_STORAGE_KEY, JSON.stringify({ soundsEnabled: enabled }));
    } catch {
      // Sem storage
    }
  }, [sysSettings]);

  const toggleSounds = useCallback(() => {
    setSoundsEnabled(!soundsEnabled);
  }, [soundsEnabled, setSoundsEnabled]);

  // Volume efetivo herdado das configurações de áudio do sistema
  const effectiveVolume = sysSettings?.isMuted ? 0 : (sysSettings?.speakerVolume ?? 75);

  /**
   * Sintetizador Orgânico de Áudio Web Audio API
   * Renderiza os sons de forma ultra-leve, sem latência e sem depender de arquivos .mp3 externos
   */
  const playSound = useCallback((type: SoundEffectType, customPitchFactor = 1.0) => {
    // Verificar se sons estão ativos ou em modo Não Perturbe / Mudo
    if (!soundsEnabled || sysSettings?.doNotDisturb || effectiveVolume === 0) {
      return;
    }

    try {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtxClass) return;

      const ctx = new AudioCtxClass();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;
      const masterVol = (effectiveVolume / 100) * 0.25;

      switch (type) {
        case 'pop_on': {
          // Pop brilhante e ascendente (750Hz -> 1550Hz) para ATIVAÇÃO
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(750 * customPitchFactor, now);
          osc.frequency.exponentialRampToValueAtTime(1550 * customPitchFactor, now + 0.042);

          gain.gain.setValueAtTime(masterVol * 1.05, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.065);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.065);
          break;
        }

        case 'pop_off': {
          // Pop macio e descendente (1150Hz -> 420Hz) para DESATIVAÇÃO
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(1150 * customPitchFactor, now);
          osc.frequency.exponentialRampToValueAtTime(420 * customPitchFactor, now + 0.052);

          gain.gain.setValueAtTime(masterVol * 0.9, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.075);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.075);
          break;
        }

        case 'pop_click':
        case 'tap': {
          // Estalo tátil sutil para abas e botões rápidos
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(920 * customPitchFactor, now);
          osc.frequency.exponentialRampToValueAtTime(1250 * customPitchFactor, now + 0.03);

          gain.gain.setValueAtTime(masterVol * 0.7, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.045);
          break;
        }

        case 'toggle': {
          // Efeito de switch acústico
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(800 * customPitchFactor, now);
          osc.frequency.exponentialRampToValueAtTime(1400 * customPitchFactor, now + 0.04);
          gain.gain.setValueAtTime(masterVol * 0.85, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.055);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.055);
          break;
        }

        case 'switch': {
          // Duplo estalo mecânico sutil
          const osc1 = ctx.createOscillator();
          const gain1 = ctx.createGain();
          osc1.type = 'triangle';
          osc1.frequency.setValueAtTime(1400, now);
          osc1.frequency.exponentialRampToValueAtTime(700, now + 0.02);
          gain1.gain.setValueAtTime(masterVol * 0.8, now);
          gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.025);
          osc1.connect(gain1);
          gain1.connect(ctx.destination);
          osc1.start(now);
          osc1.stop(now + 0.025);
          break;
        }

        case 'slider': {
          // Mini-tick de controle de slider
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          const freq = 600 + Math.min(1000, 400 * customPitchFactor);
          osc.frequency.setValueAtTime(freq, now);
          gain.gain.setValueAtTime(masterVol * 0.4, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.02);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.02);
          break;
        }

        case 'dialog_open': {
          // Tom harmônico suave de surgimento
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(440, now);
          osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);
          gain.gain.setValueAtTime(masterVol * 0.6, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.12);
          break;
        }

        case 'dialog_close': {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(660, now);
          osc.frequency.exponentialRampToValueAtTime(330, now + 0.07);
          gain.gain.setValueAtTime(masterVol * 0.5, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.09);
          break;
        }

        default:
          break;
      }
    } catch {
      // Falha silenciosa em navegadores com áudio bloqueado
    }
  }, [soundsEnabled, sysSettings?.doNotDisturb, effectiveVolume]);

  const playPop = useCallback((action: 'on' | 'off' | 'click') => {
    if (action === 'on') playSound('pop_on');
    else if (action === 'off') playSound('pop_off');
    else playSound('pop_click');
  }, [playSound]);

  const playToggle = useCallback((active: boolean) => {
    playSound(active ? 'pop_on' : 'pop_off');
  }, [playSound]);

  const playSliderTick = useCallback((normalizedVal = 0.5) => {
    playSound('slider', 0.5 + normalizedVal * 1.2);
  }, [playSound]);

  const contextValue = useMemo<SoundEffectsContextType>(() => ({
    soundsEnabled,
    volume: effectiveVolume,
    soundTheme,
    setSoundsEnabled,
    toggleSounds,
    setVolume: (v: number) => sysSettings?.setSpeakerVolume?.(v),
    setSoundTheme,
    playSound,
    playPop,
    playToggle,
    playSliderTick,
  }), [
    soundsEnabled,
    effectiveVolume,
    soundTheme,
    setSoundsEnabled,
    toggleSounds,
    sysSettings,
    playSound,
    playPop,
    playToggle,
    playSliderTick,
  ]);

  return (
    <SoundEffectsContext.Provider value={contextValue}>
      {children}
    </SoundEffectsContext.Provider>
  );
};

export const useSoundEffects = (): SoundEffectsContextType => {
  const context = useContext(SoundEffectsContext);
  if (!context) {
    throw new Error('useSoundEffects must be used within a SoundEffectsProvider');
  }
  return context;
};
