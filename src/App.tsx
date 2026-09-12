import React, { useState, useEffect } from 'react';
import {
  Server,
  Globe,
  Users,
  Layers,
  HardDrive,
  Terminal,
  Bot,
  Settings,
  Activity,
  FolderKanban,
  Monitor,
  Compass,
  User,
  Disc,
  BookOpen
} from 'lucide-react';
import { MenuBar } from './components/MenuBar';
import { Dock } from './components/Dock';
import { WindowFrame } from './components/WindowFrame';
import { DesktopWidgets } from './components/desktop/DesktopWidgets';
import { SpotlightSearch } from './components/desktop/SpotlightSearch';
import { ControlCenter } from './components/desktop/ControlCenter';

// Apps
import { VnApp } from './components/apps/VnApp';
import { VncApp } from './components/apps/VncApp';
import { WebAppsApp } from './components/apps/WebAppsApp';
import { IdaasApp } from './components/apps/IdaasApp';
import { AppStoreApp } from './components/apps/AppStoreApp';
import { StorageApp } from './components/apps/StorageApp';
import { TerminalApp } from './components/apps/TerminalApp';
import { AiAgentApp } from './components/apps/AiAgentApp';
import { SettingsApp } from './components/apps/SettingsApp';
import { ProjectsApp } from './components/apps/ProjectsApp';
import { MonitorApp } from './components/apps/MonitorApp';
import { BrowserApp } from './components/apps/BrowserApp';
import { UserApp } from './components/apps/UserApp';
import { IsoBuilderApp } from './components/apps/IsoBuilderApp';
import { LinuxPediaApp } from './components/apps/LinuxPediaApp';
import { AppLauncher } from './components/desktop/AppLauncher';
import { BootVideoSplash } from './components/desktop/BootVideoSplash';
import { DEFAULT_DESKTOP_PINNED, DEFAULT_DOCK_PINNED } from './data/launcherApps';

import {
  INITIAL_VNS,
  INITIAL_WEB_APPS,
  INITIAL_IDAAS_USERS,
  INITIAL_SSO_PROVIDERS,
  APP_STORE_CATALOG,
  STORAGE_PHOTOS,
  STORAGE_FILES,
  WALLPAPERS,
} from './data/mockData';
import {
  AppId,
  WindowState,
  SystemStats,
  VirtualNode,
  WebApp,
  IdaasUser,
  StorageItem,
  DesktopWidgetsConfig,
  DEFAULT_DESKTOP_WIDGETS_CONFIG,
} from './types';

export default function App() {
  // Wallpaper state (defaults to Gemini Generated Garden Prism wallpaper)
  const [wallpaper, setWallpaper] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('inovecloud_custom_wallpaper');
      if (saved && saved.startsWith('data:image')) {
        return saved;
      }
    } catch (e) {
      console.error(e);
    }
    return WALLPAPERS[0].url; // '/wallpaper.jpg'
  });

  // Cluster & App Data State
  const [vns, setVns] = useState<VirtualNode[]>(INITIAL_VNS);
  const [webApps, setWebApps] = useState<WebApp[]>(INITIAL_WEB_APPS);
  const [idaasUsers, setIdaasUsers] = useState<IdaasUser[]>(INITIAL_IDAAS_USERS);
  const [ssoProviders, setSsoProviders] = useState(INITIAL_SSO_PROVIDERS);
  const [catalog, setCatalog] = useState(APP_STORE_CATALOG);
  const [photos, setPhotos] = useState(STORAGE_PHOTOS);
  const [files, setFiles] = useState(STORAGE_FILES);
  const [gpuEnabled, setGpuEnabled] = useState(true);
  const [vncTargetVnId, setVncTargetVnId] = useState<string | undefined>(undefined);

  // Overlay state
  const [isSpotlightOpen, setIsSpotlightOpen] = useState(false);
  const [isControlCenterOpen, setIsControlCenterOpen] = useState(false);
  const [isLauncherOpen, setIsLauncherOpen] = useState(false);
  // Boot video animation state (plays on ISO boot or on manual preview)
  const [isBootVideoActive, setIsBootVideoActive] = useState<boolean>(() => {
    // Check if user has just booted or if requested via URL param ?boot=1
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('boot') === '1') return true;
      const booted = sessionStorage.getItem('inovecloud_boot_shown');
      if (!booted) {
        sessionStorage.setItem('inovecloud_boot_shown', 'true');
        return true;
      }
    } catch (e) {
      // fallback
    }
    return false;
  });

  // Desktop Pinned Apps State (persisted via localStorage)
  const [desktopPinnedApps, setDesktopPinnedApps] = useState<AppId[]>(() => {
    try {
      const saved = localStorage.getItem('inovecloud_desktop_pinned_apps');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_DESKTOP_PINNED;
  });

  const handleTogglePinDesktop = (id: AppId) => {
    setDesktopPinnedApps((prev) => {
      const next = prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id];
      try {
        localStorage.setItem('inovecloud_desktop_pinned_apps', JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  };

  const handleReorderDesktopApps = (newOrder: AppId[]) => {
    setDesktopPinnedApps(newOrder);
    try {
      localStorage.setItem('inovecloud_desktop_pinned_apps', JSON.stringify(newOrder));
    } catch (e) {
      console.error(e);
    }
  };

  // Dock Pinned Apps State (persisted via localStorage)
  const [dockPinnedApps, setDockPinnedApps] = useState<AppId[]>(() => {
    try {
      const saved = localStorage.getItem('inovecloud_dock_pinned_apps');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_DOCK_PINNED;
  });

  // Show open windows in dock (persisted via localStorage)
  const [showOpenWindowsInDock, setShowOpenWindowsInDock] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('inovecloud_dock_show_windows');
      if (saved !== null) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error(e);
    }
    return true;
  });

  const handleTogglePinDock = (id: AppId) => {
    setDockPinnedApps((prev) => {
      const next = prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id];
      try {
        localStorage.setItem('inovecloud_dock_pinned_apps', JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  };

  const handleClearDockExceptLauncher = () => {
    setDockPinnedApps([]);
    setShowOpenWindowsInDock(false);
    try {
      localStorage.setItem('inovecloud_dock_pinned_apps', JSON.stringify([]));
      localStorage.setItem('inovecloud_dock_show_windows', JSON.stringify(false));
    } catch (e) {
      console.error(e);
    }
  };

  const handleResetDockDefault = () => {
    setDockPinnedApps(DEFAULT_DOCK_PINNED);
    setShowOpenWindowsInDock(true);
    try {
      localStorage.setItem('inovecloud_dock_pinned_apps', JSON.stringify(DEFAULT_DOCK_PINNED));
      localStorage.setItem('inovecloud_dock_show_windows', JSON.stringify(true));
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleShowOpenWindows = () => {
    setShowOpenWindowsInDock((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('inovecloud_dock_show_windows', JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  };

  // Desktop Widgets Configuration State (persisted via localStorage)
  const [widgetsConfig, setWidgetsConfig] = useState<DesktopWidgetsConfig>(() => {
    try {
      const saved = localStorage.getItem('inovecloud_desktop_widgets_config');
      if (saved) {
        return { ...DEFAULT_DESKTOP_WIDGETS_CONFIG, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_DESKTOP_WIDGETS_CONFIG;
  });

  const handleUpdateWidgetsConfig = (update: Partial<DesktopWidgetsConfig>) => {
    setWidgetsConfig((prev) => {
      const next = { ...prev, ...update };
      try {
        localStorage.setItem('inovecloud_desktop_widgets_config', JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  };

  const handleResetWidgetsConfig = () => {
    setWidgetsConfig(DEFAULT_DESKTOP_WIDGETS_CONFIG);
    try {
      localStorage.setItem('inovecloud_desktop_widgets_config', JSON.stringify(DEFAULT_DESKTOP_WIDGETS_CONFIG));
    } catch (e) {
      console.error(e);
    }
  };

  // Highest z-index tracking
  const [topZ, setTopZ] = useState(10);
  const [activeAppId, setActiveAppId] = useState<AppId | null>('vn');

  // Multi-window Manager State
  const [windows, setWindows] = useState<Record<AppId, WindowState>>({
    vn: {
      id: 'vn',
      title: 'Nós Virtuais (VN) — Hypervisor KVM',
      isOpen: true,
      isMinimized: false,
      isMaximized: false,
      zIndex: 10,
      position: { x: 50, y: 50 },
      size: { width: 920, height: 580 },
    },
    webapps: {
      id: 'webapps',
      title: 'Aplicações Web & Gateway SSL (Let\'s Encrypt)',
      isOpen: false,
      isMinimized: false,
      isMaximized: false,
      zIndex: 9,
      position: { x: 90, y: 70 },
      size: { width: 880, height: 560 },
    },
    idaas: {
      id: 'idaas',
      title: 'InoveCloud IDaaS — Identidade, Contas & SSO',
      isOpen: false,
      isMinimized: false,
      isMaximized: false,
      zIndex: 8,
      position: { x: 120, y: 80 },
      size: { width: 840, height: 540 },
    },
    appstore: {
      id: 'appstore',
      title: 'InoveCloud App Store & Ecossistema Docker',
      isOpen: false,
      isMinimized: false,
      isMaximized: false,
      zIndex: 7,
      position: { x: 140, y: 70 },
      size: { width: 860, height: 560 },
    },
    storage: {
      id: 'storage',
      title: 'Cloud Storage S3 & Backup de Fotos',
      isOpen: false,
      isMinimized: false,
      isMaximized: false,
      zIndex: 6,
      position: { x: 110, y: 90 },
      size: { width: 840, height: 540 },
    },
    terminal: {
      id: 'terminal',
      title: 'Cloud Shell — root@inovecloud-node01:~# (inove-bash)',
      isOpen: false,
      isMinimized: false,
      isMaximized: false,
      zIndex: 5,
      position: { x: 180, y: 120 },
      size: { width: 780, height: 480 },
    },
    aiagent: {
      id: 'aiagent',
      title: 'InoveCloud AI Cloud Agent (Protocolo MCP)',
      isOpen: false,
      isMinimized: false,
      isMaximized: false,
      zIndex: 4,
      position: { x: 200, y: 80 },
      size: { width: 720, height: 520 },
    },
    monitor: {
      id: 'monitor',
      title: 'Monitor de Desempenho & Métricas de Hardware',
      isOpen: false,
      isMinimized: false,
      isMaximized: false,
      zIndex: 3,
      position: { x: 160, y: 100 },
      size: { width: 820, height: 520 },
    },
    projects: {
      id: 'projects',
      title: 'Projetos & Workspace InoveCloud',
      isOpen: false,
      isMinimized: false,
      isMaximized: false,
      zIndex: 2,
      position: { x: 130, y: 60 },
      size: { width: 880, height: 580 },
    },
    settings: {
      id: 'settings',
      title: 'Ajustes do InoveCloud OS',
      isOpen: false,
      isMinimized: false,
      isMaximized: false,
      zIndex: 1,
      position: { x: 220, y: 110 },
      size: { width: 780, height: 540 },
    },
    vnc: {
      id: 'vnc',
      title: 'Conectar PC Remoto — InoveCloud VNC & Desktop Remoto (RFB 3.8)',
      isOpen: false,
      isMinimized: false,
      isMaximized: false,
      zIndex: 11,
      position: { x: 70, y: 55 },
      size: { width: 980, height: 620 },
    },
    browser: {
      id: 'browser',
      title: 'Navegador Web Local & DevTools — InoveCloud Browser',
      isOpen: false,
      isMinimized: false,
      isMaximized: false,
      zIndex: 12,
      position: { x: 100, y: 60 },
      size: { width: 960, height: 600 },
    },
    user: {
      id: 'user',
      title: 'Perfil do Usuário & Contas — InoveCloud ID',
      isOpen: false,
      isMinimized: false,
      isMaximized: false,
      zIndex: 13,
      position: { x: 160, y: 70 },
      size: { width: 860, height: 620 },
    },
    isobuilder: {
      id: 'isobuilder',
      title: 'Gerador de ISO & Live OS — Debian 12 Kiosk Appliance',
      isOpen: false,
      isMinimized: false,
      isMaximized: false,
      zIndex: 14,
      position: { x: 90, y: 50 },
      size: { width: 960, height: 620 },
    },
    linuxpedia: {
      id: 'linuxpedia',
      title: 'LinuxPedia — Enciclopédia & API REST de Comandos Linux',
      isOpen: false,
      isMinimized: false,
      isMaximized: false,
      zIndex: 15,
      position: { x: 130, y: 65 },
      size: { width: 940, height: 600 },
    },
  });

  // Dynamic Telemetry
  const [stats, setStats] = useState<SystemStats>({
    cpuUsage: 28,
    ramUsage: 64,
    ramTotal: 64,
    storageUsageGb: 420,
    storageTotalGb: 1000,
    networkUpKbps: 240,
    networkDownKbps: 1420,
    gpuLoad: 35,
    vnsRunning: 4,
    vnsTotal: 5,
    webAppsOnline: 4,
    httpsCount: 4,
  });

  // Live telemetry pulse effect
  useEffect(() => {
    const interval = setInterval(() => {
      setStats((prev) => ({
        ...prev,
        cpuUsage: Math.floor(24 + Math.random() * 12),
        ramUsage: Math.floor(62 + Math.random() * 5),
        networkUpKbps: Math.floor(180 + Math.random() * 140),
        networkDownKbps: Math.floor(1200 + Math.random() * 400),
        vnsRunning: vns.filter((v) => v.status === 'running').length,
        vnsTotal: vns.length,
        webAppsOnline: webApps.filter((a) => a.status === 'online').length,
        httpsCount: webApps.filter((a) => a.httpsEnabled).length,
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, [vns, webApps]);

  // Global Keyboard Shortcuts (Cmd+K for Spotlight, Cmd+L for Launcher)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSpotlightOpen((prev) => !prev);
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        setIsLauncherOpen((prev) => !prev);
      } else if (e.key === 'F4') {
        e.preventDefault();
        setIsLauncherOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setIsSpotlightOpen(false);
        setIsControlCenterOpen(false);
        setIsLauncherOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Window Management Actions
  const focusWindow = (id: AppId) => {
    setTopZ((prev) => {
      const nextZ = prev + 1;
      setWindows((curr) => ({
        ...curr,
        [id]: {
          ...curr[id],
          zIndex: nextZ,
          isMinimized: false,
        },
      }));
      return nextZ;
    });
    setActiveAppId(id);
  };

  const openApp = (id: AppId) => {
    setTopZ((prev) => {
      const nextZ = prev + 1;
      setWindows((curr) => ({
        ...curr,
        [id]: {
          ...curr[id],
          isOpen: true,
          isMinimized: false,
          zIndex: nextZ,
        },
      }));
      return nextZ;
    });
    setActiveAppId(id);
  };

  const closeWindow = (id: AppId) => {
    setWindows((curr) => ({
      ...curr,
      [id]: {
        ...curr[id],
        isOpen: false,
      },
    }));
    if (activeAppId === id) {
      setActiveAppId(null);
    }
  };

  const minimizeWindow = (id: AppId) => {
    setWindows((curr) => ({
      ...curr,
      [id]: {
        ...curr[id],
        isMinimized: true,
      },
    }));
    if (activeAppId === id) {
      setActiveAppId(null);
    }
  };

  const toggleMaximize = (id: AppId) => {
    setWindows((curr) => ({
      ...curr,
      [id]: {
        ...curr[id],
        isMaximized: !curr[id].isMaximized,
      },
    }));
  };

  const moveWindow = (id: AppId, pos: { x: number; y: number }) => {
    setWindows((curr) => ({
      ...curr,
      [id]: {
        ...curr[id],
        position: pos,
      },
    }));
  };

  // VN Actions
  const handleToggleVnStatus = (id: string) => {
    setVns((prev) =>
      prev.map((v) => {
        if (v.id === id) {
          const nextStatus = v.status === 'running' ? 'stopped' : 'running';
          return {
            ...v,
            status: nextStatus,
            uptime: nextStatus === 'running' ? 'Iniciado agora' : 'Desligado',
            usageCpu: nextStatus === 'running' ? 15 : 0,
            usageRam: nextStatus === 'running' ? 35 : 0,
          };
        }
        return v;
      })
    );
  };

  const handleCreateVn = (newVn: Omit<VirtualNode, 'id' | 'uptime' | 'usageCpu' | 'usageRam'>) => {
    const created: VirtualNode = {
      ...newVn,
      id: `vn-${Date.now()}`,
      uptime: '1 minuto',
      usageCpu: 12,
      usageRam: 28,
    };
    setVns((prev) => [created, ...prev]);
  };

  // Web Apps Actions
  const handleToggleHttps = (id: string) => {
    setWebApps((prev) =>
      prev.map((app) =>
        app.id === id ? { ...app, httpsEnabled: !app.httpsEnabled, sslExpiryDays: app.httpsEnabled ? 0 : 90 } : app
      )
    );
  };

  const handleDeployWebApp = (newApp: Omit<WebApp, 'id' | 'requestsPerMin' | 'latencyMs' | 'lastDeployed'>) => {
    const created: WebApp = {
      ...newApp,
      id: `app-${Date.now()}`,
      requestsPerMin: 120,
      latencyMs: 14,
      lastDeployed: 'Agora mesmo',
    };
    setWebApps((prev) => [created, ...prev]);
  };

  // IDaaS Actions
  const handleToggleSso = (id: string) => {
    setSsoProviders((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    );
  };

  const handleAddIdaasUser = (newUser: Omit<IdaasUser, 'id' | 'lastLogin'>) => {
    const created: IdaasUser = {
      ...newUser,
      id: `usr-${Date.now()}`,
      lastLogin: 'Nunca acessou',
    };
    setIdaasUsers((prev) => [...prev, created]);
  };

  const handleToggleUserMfa = (id: string) => {
    setIdaasUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, mfaEnabled: !u.mfaEnabled } : u))
    );
  };

  // App Store Actions
  const handleToggleInstall = (id: string) => {
    setCatalog((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, installed: !item.installed, running: !item.installed }
          : item
      )
    );
  };

  // Storage Actions
  const handleUploadFile = (fileItem: StorageItem) => {
    setFiles((prev) => [fileItem, ...prev]);
  };

  const openAppIds = (Object.keys(windows) as AppId[]).filter(
    (id) => windows[id].isOpen
  );

  return (
    <div
      className="relative h-screen w-screen overflow-hidden select-none bg-slate-950 font-sans"
      style={{
        backgroundImage: `url(${wallpaper})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Background Dimmer/Vignette for Contrast & Readability */}
      <div className="absolute inset-0 bg-black/25 backdrop-brightness-95 pointer-events-none" />

      {/* Top macOS Menubar */}
      <MenuBar
        stats={stats}
        activeAppId={activeAppId}
        onOpenApp={openApp}
        onToggleControlCenter={() => setIsControlCenterOpen(!isControlCenterOpen)}
        onToggleSpotlight={() => setIsSpotlightOpen(!isSpotlightOpen)}
        isControlCenterOpen={isControlCenterOpen}
        onToggleLauncher={() => setIsLauncherOpen(!isLauncherOpen)}
        isLauncherOpen={isLauncherOpen}
        onPlayBootVideo={() => setIsBootVideoActive(true)}
      />

      {/* Desktop Canvas & Pinned Widgets (Matches UmbrelOS Style) */}
      <DesktopWidgets
        stats={stats}
        onOpenApp={openApp}
        onOpenWebUrl={(url) => {
          openApp('browser');
        }}
        desktopPinnedApps={desktopPinnedApps}
        onTogglePinDesktop={handleTogglePinDesktop}
        onReorderDesktopApps={handleReorderDesktopApps}
        onOpenLauncher={() => setIsLauncherOpen(true)}
        widgetsConfig={widgetsConfig}
        onUpdateWidgetsConfig={handleUpdateWidgetsConfig}
        onResetWidgetsConfig={handleResetWidgetsConfig}
      />

      {/* Windows Layer */}
      <main className="relative z-20 h-full w-full pointer-events-none">
        {/* VN - Virtual Nodes App */}
        <div className="pointer-events-auto">
          <WindowFrame
            window={windows.vn}
            icon={<Server className="w-3.5 h-3.5 text-blue-400" />}
            onClose={() => closeWindow('vn')}
            onMinimize={() => minimizeWindow('vn')}
            onToggleMaximize={() => toggleMaximize('vn')}
            onFocus={() => focusWindow('vn')}
            onMove={(pos) => moveWindow('vn', pos)}
          >
            <VnApp
              vns={vns}
              onToggleVnStatus={handleToggleVnStatus}
              onCreateVn={handleCreateVn}
              onConnectVnc={(vnId) => {
                setVncTargetVnId(vnId);
                openApp('vnc');
              }}
            />
          </WindowFrame>
        </div>

        {/* VNC Remote PC Connect App */}
        <div className="pointer-events-auto">
          <WindowFrame
            window={windows.vnc}
            icon={<Monitor className="w-3.5 h-3.5 text-cyan-400" />}
            onClose={() => closeWindow('vnc')}
            onMinimize={() => minimizeWindow('vnc')}
            onToggleMaximize={() => toggleMaximize('vnc')}
            onFocus={() => focusWindow('vnc')}
            onMove={(pos) => moveWindow('vnc', pos)}
          >
            <VncApp
              vns={vns}
              initialVnId={vncTargetVnId}
              onOpenVnApp={() => openApp('vn')}
            />
          </WindowFrame>
        </div>

        {/* Web Apps App */}
        <div className="pointer-events-auto">
          <WindowFrame
            window={windows.webapps}
            icon={<Globe className="w-3.5 h-3.5 text-sky-400" />}
            onClose={() => closeWindow('webapps')}
            onMinimize={() => minimizeWindow('webapps')}
            onToggleMaximize={() => toggleMaximize('webapps')}
            onFocus={() => focusWindow('webapps')}
            onMove={(pos) => moveWindow('webapps', pos)}
          >
            <WebAppsApp
              webApps={webApps}
              onToggleHttps={handleToggleHttps}
              onDeployWebApp={handleDeployWebApp}
            />
          </WindowFrame>
        </div>

        {/* IDaaS App */}
        <div className="pointer-events-auto">
          <WindowFrame
            window={windows.idaas}
            icon={<Users className="w-3.5 h-3.5 text-emerald-400" />}
            onClose={() => closeWindow('idaas')}
            onMinimize={() => minimizeWindow('idaas')}
            onToggleMaximize={() => toggleMaximize('idaas')}
            onFocus={() => focusWindow('idaas')}
            onMove={(pos) => moveWindow('idaas', pos)}
          >
            <IdaasApp
              users={idaasUsers}
              ssoProviders={ssoProviders}
              onToggleSso={handleToggleSso}
              onAddUser={handleAddIdaasUser}
              onToggleUserMfa={handleToggleUserMfa}
            />
          </WindowFrame>
        </div>

        {/* App Store App */}
        <div className="pointer-events-auto">
          <WindowFrame
            window={windows.appstore}
            icon={<Layers className="w-3.5 h-3.5 text-purple-400" />}
            onClose={() => closeWindow('appstore')}
            onMinimize={() => minimizeWindow('appstore')}
            onToggleMaximize={() => toggleMaximize('appstore')}
            onFocus={() => focusWindow('appstore')}
            onMove={(pos) => moveWindow('appstore', pos)}
          >
            <AppStoreApp
              catalog={catalog}
              onToggleInstall={handleToggleInstall}
            />
          </WindowFrame>
        </div>

        {/* Cloud Storage App */}
        <div className="pointer-events-auto">
          <WindowFrame
            window={windows.storage}
            icon={<HardDrive className="w-3.5 h-3.5 text-rose-400" />}
            onClose={() => closeWindow('storage')}
            onMinimize={() => minimizeWindow('storage')}
            onToggleMaximize={() => toggleMaximize('storage')}
            onFocus={() => focusWindow('storage')}
            onMove={(pos) => moveWindow('storage', pos)}
          >
            <StorageApp
              photos={photos}
              files={files}
              onUploadFile={handleUploadFile}
            />
          </WindowFrame>
        </div>

        {/* Terminal Cloud Shell */}
        <div className="pointer-events-auto">
          <WindowFrame
            window={windows.terminal}
            icon={<Terminal className="w-3.5 h-3.5 text-emerald-400" />}
            onClose={() => closeWindow('terminal')}
            onMinimize={() => minimizeWindow('terminal')}
            onToggleMaximize={() => toggleMaximize('terminal')}
            onFocus={() => focusWindow('terminal')}
            onMove={(pos) => moveWindow('terminal', pos)}
          >
            <TerminalApp
              vns={vns}
              webApps={webApps}
              onToggleVnStatus={handleToggleVnStatus}
            />
          </WindowFrame>
        </div>

        {/* AI Agent App */}
        <div className="pointer-events-auto">
          <WindowFrame
            window={windows.aiagent}
            icon={<Bot className="w-3.5 h-3.5 text-fuchsia-400" />}
            onClose={() => closeWindow('aiagent')}
            onMinimize={() => minimizeWindow('aiagent')}
            onToggleMaximize={() => toggleMaximize('aiagent')}
            onFocus={() => focusWindow('aiagent')}
            onMove={(pos) => moveWindow('aiagent', pos)}
          >
            <AiAgentApp
              onInstallApp={(appId) => handleToggleInstall(appId)}
              onCreateVnAction={() => {
                handleCreateVn({
                  name: `vn-agent-ubuntu-${Math.floor(Math.random() * 90) + 10}`,
                  os: 'ubuntu',
                  version: 'Ubuntu 24.04 LTS',
                  status: 'running',
                  ip: `10.240.0.${Math.floor(Math.random() * 50) + 50}`,
                  vCpu: 4,
                  ramGb: 8,
                  diskGb: 100,
                  gpuAccelerated: true,
                  ports: [22, 80],
                });
                openApp('vn');
              }}
              onEnableHttpsAction={() => {
                setWebApps((prev) => prev.map((a) => ({ ...a, httpsEnabled: true, sslExpiryDays: 90 })));
              }}
            />
          </WindowFrame>
        </div>

        {/* Monitor App */}
        <div className="pointer-events-auto">
          <WindowFrame
            window={windows.monitor}
            icon={<Activity className="w-3.5 h-3.5 text-cyan-400" />}
            onClose={() => closeWindow('monitor')}
            onMinimize={() => minimizeWindow('monitor')}
            onToggleMaximize={() => toggleMaximize('monitor')}
            onFocus={() => focusWindow('monitor')}
            onMove={(pos) => moveWindow('monitor', pos)}
          >
            <MonitorApp stats={stats} />
          </WindowFrame>
        </div>

        {/* Projects App */}
        <div className="pointer-events-auto">
          <WindowFrame
            window={windows.projects}
            icon={<FolderKanban className="w-3.5 h-3.5 text-amber-400" />}
            onClose={() => closeWindow('projects')}
            onMinimize={() => minimizeWindow('projects')}
            onToggleMaximize={() => toggleMaximize('projects')}
            onFocus={() => focusWindow('projects')}
            onMove={(pos) => moveWindow('projects', pos)}
          >
            <ProjectsApp />
          </WindowFrame>
        </div>

        {/* Settings App */}
        <div className="pointer-events-auto">
          <WindowFrame
            window={windows.settings}
            icon={<Settings className="w-3.5 h-3.5 text-slate-400" />}
            onClose={() => closeWindow('settings')}
            onMinimize={() => minimizeWindow('settings')}
            onToggleMaximize={() => toggleMaximize('settings')}
            onFocus={() => focusWindow('settings')}
            onMove={(pos) => moveWindow('settings', pos)}
          >
            <SettingsApp
              currentWallpaper={wallpaper}
              onSelectWallpaper={(wp) => setWallpaper(wp)}
              gpuEnabled={gpuEnabled}
              onToggleGpu={() => setGpuEnabled(!gpuEnabled)}
              widgetsConfig={widgetsConfig}
              onUpdateWidgetsConfig={handleUpdateWidgetsConfig}
              onResetWidgetsConfig={handleResetWidgetsConfig}
            />
          </WindowFrame>
        </div>

        {/* Local Web Browser App */}
        <div className="pointer-events-auto">
          <WindowFrame
            window={windows.browser}
            icon={<Compass className="w-3.5 h-3.5 text-cyan-400" />}
            onClose={() => closeWindow('browser')}
            onMinimize={() => minimizeWindow('browser')}
            onToggleMaximize={() => toggleMaximize('browser')}
            onFocus={() => focusWindow('browser')}
            onMove={(pos) => moveWindow('browser', pos)}
          >
            <BrowserApp />
          </WindowFrame>
        </div>

        {/* User Profile & Accounts App */}
        <div className="pointer-events-auto">
          <WindowFrame
            window={windows.user}
            icon={<User className="w-3.5 h-3.5 text-indigo-400" />}
            onClose={() => closeWindow('user')}
            onMinimize={() => minimizeWindow('user')}
            onToggleMaximize={() => toggleMaximize('user')}
            onFocus={() => focusWindow('user')}
            onMove={(pos) => moveWindow('user', pos)}
          >
            <UserApp onLockScreen={() => closeWindow('user')} />
          </WindowFrame>
        </div>

        {/* ISO Builder & Linux Appliance App */}
        <div className="pointer-events-auto">
          <WindowFrame
            window={windows.isobuilder}
            icon={<Disc className="w-3.5 h-3.5 text-red-400" />}
            onClose={() => closeWindow('isobuilder')}
            onMinimize={() => minimizeWindow('isobuilder')}
            onToggleMaximize={() => toggleMaximize('isobuilder')}
            onFocus={() => focusWindow('isobuilder')}
            onMove={(pos) => moveWindow('isobuilder', pos)}
          >
            <IsoBuilderApp onPreviewBootVideo={() => setIsBootVideoActive(true)} />
          </WindowFrame>
        </div>

        {/* LinuxPedia API & Encyclopedia App */}
        <div className="pointer-events-auto">
          <WindowFrame
            window={windows.linuxpedia}
            icon={<BookOpen className="w-3.5 h-3.5 text-emerald-400" />}
            onClose={() => closeWindow('linuxpedia')}
            onMinimize={() => minimizeWindow('linuxpedia')}
            onToggleMaximize={() => toggleMaximize('linuxpedia')}
            onFocus={() => focusWindow('linuxpedia')}
            onMove={(pos) => moveWindow('linuxpedia', pos)}
          >
            <LinuxPediaApp />
          </WindowFrame>
        </div>
      </main>

      {/* macOS Floating Glass Dock at Bottom */}
      <Dock
        openAppIds={openAppIds}
        activeAppId={activeAppId}
        onOpenApp={openApp}
        onCloseApp={closeWindow}
        onMinimizeApp={minimizeWindow}
        onToggleLauncher={() => setIsLauncherOpen(!isLauncherOpen)}
        isLauncherOpen={isLauncherOpen}
        dockPinnedApps={dockPinnedApps}
        onTogglePinDock={handleTogglePinDock}
        onClearDockExceptLauncher={handleClearDockExceptLauncher}
        onResetDockDefault={handleResetDockDefault}
        showOpenWindowsInDock={showOpenWindowsInDock}
        onToggleShowOpenWindows={handleToggleShowOpenWindows}
      />

      {/* Spotlight Search Modal */}
      <SpotlightSearch
        isOpen={isSpotlightOpen}
        onClose={() => setIsSpotlightOpen(false)}
        onOpenApp={openApp}
      />

      {/* Control Center Dropdown */}
      <ControlCenter
        isOpen={isControlCenterOpen}
        onClose={() => setIsControlCenterOpen(false)}
        stats={stats}
        gpuEnabled={gpuEnabled}
        onToggleGpu={() => setGpuEnabled(!gpuEnabled)}
        onOpenApp={openApp}
      />

      {/* App Launcher / Launchpad Overlay Modal */}
      <AppLauncher
        isOpen={isLauncherOpen}
        onClose={() => setIsLauncherOpen(false)}
        onOpenApp={openApp}
        desktopPinnedApps={desktopPinnedApps}
        onTogglePinDesktop={handleTogglePinDesktop}
        dockPinnedApps={dockPinnedApps}
        onTogglePinDock={handleTogglePinDock}
        onClearDockExceptLauncher={handleClearDockExceptLauncher}
        onResetDockDefault={handleResetDockDefault}
        showOpenWindowsInDock={showOpenWindowsInDock}
        onToggleShowOpenWindows={handleToggleShowOpenWindows}
      />

      {/* Boot Initialization Cinematic Video Splash (Live ISO & Web Startup) */}
      {isBootVideoActive && (
        <BootVideoSplash
          onComplete={() => setIsBootVideoActive(false)}
          autoDismiss={true}
          canSkip={true}
        />
      )}
    </div>
  );
}
