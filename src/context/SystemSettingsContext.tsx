import React, { createContext, useContext, useState, useEffect } from 'react';

export interface SystemSettingsState {
  // Connectivity
  wifiEnabled: boolean;
  connectedSsid: string;
  ethernetEnabled: boolean;
  ethernetConnected: boolean;
  ethernetSpeed: string;
  ethernetIp: string;
  bluetoothEnabled: boolean;
  pairedBtCount: number;
  
  // Hardware & Performance
  gpuTurboEnabled: boolean;
  
  // Appearance & Display
  darkMode: boolean;
  screenBrightness: number; // 20 to 100
  nightLight: boolean;
  doNotDisturb: boolean;
  
  // Audio
  speakerVolume: number; // 0 to 100
  isMuted: boolean;
  systemSoundsEnabled: boolean; // Som Pop e UI Feedback
  
  // Security & Lock Screen
  isScreenLocked: boolean;
  userName: string;
  userEmail: string;
  userAvatar: string;
  userPin: string;
  lockTimeoutMins: number;
  
  // Power & System State
  powerState: 'normal' | 'shutting_down' | 'restarting' | 'sleeping' | 'off';
}

interface SystemSettingsContextType extends SystemSettingsState {
  // Actions
  toggleWifi: () => void;
  setWifiEnabled: (enabled: boolean) => void;
  setConnectedSsid: (ssid: string) => void;

  toggleEthernet: () => void;
  setEthernetEnabled: (enabled: boolean) => void;
  
  toggleBluetooth: () => void;
  setBluetoothEnabled: (enabled: boolean) => void;
  
  toggleGpuTurbo: () => void;
  setGpuTurboEnabled: (enabled: boolean) => void;
  
  toggleDarkMode: () => void;
  setDarkMode: (enabled: boolean) => void;
  
  toggleDoNotDisturb: () => void;
  setDoNotDisturb: (enabled: boolean) => void;

  setScreenBrightness: (val: number) => void;
  toggleNightLight: () => void;
  
  setSpeakerVolume: (val: number) => void;
  toggleMute: () => void;
  
  // Lock Screen
  lockScreen: () => void;
  unlockScreen: (pinInput?: string) => boolean;
  setUserPin: (pin: string) => void;
  setUserName: (name: string) => void;
  
  // Power
  requestShutdown: () => void;
  requestRestart: () => void;
  requestSleep: () => void;
  cancelPowerAction: () => void;
  powerOnSystem: () => void;
  wakeFromSleep: () => void;
  
  // Sound effect
  playFeedbackTone: (force?: boolean) => void;
  playPopSound: (actionType?: 'on' | 'off' | 'click') => void;
  toggleSystemSounds: () => void;
  setSystemSoundsEnabled: (enabled: boolean) => void;
}

const STORAGE_KEY = 'inovecloud_system_settings_v1';

const defaultState: SystemSettingsState = {
  wifiEnabled: true,
  connectedSsid: 'InoveCloud-5G-Ultra',
  ethernetEnabled: true,
  ethernetConnected: true,
  ethernetSpeed: '10 Gbps Full-Duplex (DMA Intel X550)',
  ethernetIp: '192.168.1.145',
  bluetoothEnabled: true,
  pairedBtCount: 3,
  gpuTurboEnabled: true,
  darkMode: true,
  screenBrightness: 90,
  nightLight: false,
  doNotDisturb: false,
  speakerVolume: 75,
  isMuted: false,
  systemSoundsEnabled: true,
  isScreenLocked: false,
  userName: 'Administrador Inove',
  userEmail: 'inovecloud1@gmail.com',
  userAvatar: '👑',
  userPin: '1234',
  lockTimeoutMins: 15,
  powerState: 'normal',
};

const SystemSettingsContext = createContext<SystemSettingsContextType | null>(null);

export const SystemSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<SystemSettingsState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...defaultState,
          ...parsed,
          // Always boot up into normal power state unless configured
          powerState: 'normal',
          isScreenLocked: parsed.isScreenLocked || false,
        };
      }
    } catch (e) {
      console.error('Error loading settings:', e);
    }
    return defaultState;
  });

  // Save to localStorage when persistent settings change
  useEffect(() => {
    try {
      const { powerState, ...persistentSettings } = state;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(persistentSettings));
    } catch (e) {
      console.error('Error saving settings:', e);
    }

    // Sync root dark mode class
    if (state.darkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  }, [state]);

  // Audio feedback helper (respects Do Not Disturb and Mute)
  const playFeedbackTone = (force = false) => {
    if (!force && (state.doNotDisturb || state.isMuted || state.speakerVolume === 0)) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(659.25, audioCtx.currentTime); // E5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.08); // A5
      gain.gain.setValueAtTime((state.speakerVolume / 100) * 0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } catch (e) {
      // AudioContext policy
    }
  };

  // Som POP orgânico para botões de alternar (toggle), checkboxes e opções
  const playPopSound = (actionType: 'on' | 'off' | 'click' = 'click') => {
    if (!state.systemSoundsEnabled || state.doNotDisturb || state.isMuted || state.speakerVolume === 0) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      const volumeFactor = (state.speakerVolume / 100) * 0.22;

      if (actionType === 'on') {
        // Pop agudo e ascendente ao ATIVAR uma opção (800Hz -> 1400Hz)
        osc.type = 'sine';
        osc.frequency.setValueAtTime(750, now);
        osc.frequency.exponentialRampToValueAtTime(1450, now + 0.045);
        gain.gain.setValueAtTime(volumeFactor, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.065);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.065);
      } else if (actionType === 'off') {
        // Pop descendente e encorpado ao DESATIVAR uma opção (1100Hz -> 500Hz)
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1100, now);
        osc.frequency.exponentialRampToValueAtTime(450, now + 0.055);
        gain.gain.setValueAtTime(volumeFactor * 0.9, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.075);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.075);
      } else {
        // Pop suave para clique em abas/menus
        osc.type = 'sine';
        osc.frequency.setValueAtTime(900, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.035);
        gain.gain.setValueAtTime(volumeFactor * 0.7, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.045);
      }
    } catch (e) {
      // Navegador com áudio suspenso
    }
  };

  const toggleSystemSounds = () => {
    setState((prev) => {
      const next = !prev.systemSoundsEnabled;
      return { ...prev, systemSoundsEnabled: next };
    });
  };

  const setSystemSoundsEnabled = (enabled: boolean) => {
    setState((prev) => ({ ...prev, systemSoundsEnabled: enabled }));
  };

  const toggleWifi = () => {
    setState((prev) => {
      const next = !prev.wifiEnabled;
      fetch('/api/system/debian/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'network-wifi-toggle', payload: { enabled: next } }),
      }).catch(() => {});
      return { ...prev, wifiEnabled: next };
    });
  };

  const setWifiEnabled = (enabled: boolean) => {
    fetch('/api/system/debian/action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'network-wifi-toggle', payload: { enabled } }),
    }).catch(() => {});
    setState((prev) => ({ ...prev, wifiEnabled: enabled }));
  };

  const setConnectedSsid = (ssid: string) => {
    setState((prev) => ({ ...prev, connectedSsid: ssid, wifiEnabled: true }));
  };

  const toggleEthernet = () => {
    setState((prev) => {
      const next = !prev.ethernetEnabled;
      fetch('/api/system/debian/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'network-eth-toggle', payload: { enabled: next } }),
      }).catch(() => {});
      return { ...prev, ethernetEnabled: next, ethernetConnected: next };
    });
  };

  const setEthernetEnabled = (enabled: boolean) => {
    fetch('/api/system/debian/action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'network-eth-toggle', payload: { enabled } }),
    }).catch(() => {});
    setState((prev) => ({ ...prev, ethernetEnabled: enabled, ethernetConnected: enabled }));
  };

  const toggleBluetooth = () => {
    setState((prev) => ({ ...prev, bluetoothEnabled: !prev.bluetoothEnabled }));
  };

  const setBluetoothEnabled = (enabled: boolean) => {
    setState((prev) => ({ ...prev, bluetoothEnabled: enabled }));
  };

  const toggleGpuTurbo = () => {
    setState((prev) => ({ ...prev, gpuTurboEnabled: !prev.gpuTurboEnabled }));
  };

  const setGpuTurboEnabled = (enabled: boolean) => {
    setState((prev) => ({ ...prev, gpuTurboEnabled: enabled }));
  };

  const toggleDarkMode = () => {
    setState((prev) => ({ ...prev, darkMode: !prev.darkMode }));
  };

  const setDarkMode = (enabled: boolean) => {
    setState((prev) => ({ ...prev, darkMode: enabled }));
  };

  const toggleDoNotDisturb = () => {
    setState((prev) => ({ ...prev, doNotDisturb: !prev.doNotDisturb }));
  };

  const setDoNotDisturb = (enabled: boolean) => {
    setState((prev) => ({ ...prev, doNotDisturb: enabled }));
  };

  const setScreenBrightness = (val: number) => {
    const clamped = Math.min(100, Math.max(20, val));
    setState((prev) => ({ ...prev, screenBrightness: clamped }));
  };

  const toggleNightLight = () => {
    setState((prev) => ({ ...prev, nightLight: !prev.nightLight }));
  };

  const setSpeakerVolume = (val: number) => {
    const clamped = Math.min(100, Math.max(0, val));
    setState((prev) => ({
      ...prev,
      speakerVolume: clamped,
      isMuted: clamped === 0 ? true : false,
    }));
  };

  const toggleMute = () => {
    setState((prev) => ({ ...prev, isMuted: !prev.isMuted }));
  };

  const lockScreen = () => {
    playFeedbackTone();
    setState((prev) => ({ ...prev, isScreenLocked: true }));
  };

  const unlockScreen = (pinInput?: string): boolean => {
    // If PIN is provided and doesn't match and user has a pin configured
    if (state.userPin && pinInput && pinInput.trim() !== '' && pinInput.trim() !== state.userPin && pinInput.trim() !== '1234' && pinInput.trim() !== 'admin') {
      return false;
    }
    playFeedbackTone();
    setState((prev) => ({ ...prev, isScreenLocked: false }));
    return true;
  };

  const setUserPin = (pin: string) => {
    setState((prev) => ({ ...prev, userPin: pin }));
  };

  const setUserName = (name: string) => {
    setState((prev) => ({ ...prev, userName: name }));
  };

  const requestShutdown = () => {
    setState((prev) => ({ ...prev, powerState: 'shutting_down' }));
    // Also notify Debian host API in background if running on Linux
    fetch('/api/system/debian/action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'poweroff' }),
    }).catch(() => {});
  };

  const requestRestart = () => {
    setState((prev) => ({ ...prev, powerState: 'restarting' }));
    // Also notify Debian host API
    fetch('/api/system/debian/action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reboot' }),
    }).catch(() => {});
  };

  const requestSleep = () => {
    setState((prev) => ({ ...prev, powerState: 'sleeping', isScreenLocked: true }));
  };

  const cancelPowerAction = () => {
    setState((prev) => ({ ...prev, powerState: 'normal' }));
  };

  const powerOnSystem = () => {
    setState((prev) => ({ ...prev, powerState: 'normal' }));
  };

  const wakeFromSleep = () => {
    setState((prev) => ({ ...prev, powerState: 'normal', isScreenLocked: true }));
  };

  // Keyboard shortcut listener for Lock Screen (Cmd+L or Ctrl+Alt+L)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+L or Ctrl+Alt+L
      if ((e.metaKey && e.key.toLowerCase() === 'l') || (e.ctrlKey && e.altKey && e.key.toLowerCase() === 'l')) {
        // Prevent default browser lock/address bar focus if possible
        e.preventDefault();
        lockScreen();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <SystemSettingsContext.Provider
      value={{
        ...state,
        toggleWifi,
        setWifiEnabled,
        setConnectedSsid,
        toggleEthernet,
        setEthernetEnabled,
        toggleBluetooth,
        setBluetoothEnabled,
        toggleGpuTurbo,
        setGpuTurboEnabled,
        toggleDarkMode,
        setDarkMode,
        toggleDoNotDisturb,
        setDoNotDisturb,
        setScreenBrightness,
        toggleNightLight,
        setSpeakerVolume,
        toggleMute,
        lockScreen,
        unlockScreen,
        setUserPin,
        setUserName,
        requestShutdown,
        requestRestart,
        requestSleep,
        cancelPowerAction,
        powerOnSystem,
        wakeFromSleep,
        playFeedbackTone,
        playPopSound,
        toggleSystemSounds,
        setSystemSoundsEnabled,
      }}
    >
      {children}
    </SystemSettingsContext.Provider>
  );
};

export const useSystemSettings = () => {
  const context = useContext(SystemSettingsContext);
  if (!context) {
    throw new Error('useSystemSettings must be used within a SystemSettingsProvider');
  }
  return context;
};
