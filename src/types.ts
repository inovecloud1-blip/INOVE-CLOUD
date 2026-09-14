export type AppId =
  | 'vn'
  | 'webapps'
  | 'idaas'
  | 'appstore'
  | 'storage'
  | 'terminal'
  | 'aiagent'
  | 'settings'
  | 'projects'
  | 'monitor'
  | 'vnc'
  | 'browser'
  | 'user'
  | 'isobuilder'
  | 'linuxpedia';

export type AppCategory =
  | 'Infraestrutura & KVM'
  | 'Navegação & Web'
  | 'Segurança & IDaaS'
  | 'Storage & Produtividade'
  | 'Sistema & Monitoramento';

export interface LauncherAppInfo {
  id: AppId;
  name: string;
  category: AppCategory;
  description: string;
  badge?: string;
  badgeColor?: string;
  iconName: string;
  gradient: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  status: 'online' | 'away' | 'busy';
  bio: string;
  sshKeysCount: number;
  mfaEnabled: boolean;
  twoFactorType: string;
  lastLogin: string;
  currentIp: string;
  region: string;
}

export interface VirtualNode {
  id: string;
  name: string;
  os: 'ubuntu' | 'windows' | 'debian' | 'alpine' | 'android';
  version: string;
  status: 'running' | 'stopped' | 'restarting' | 'error';
  ip: string;
  vCpu: number;
  ramGb: number;
  diskGb: number;
  gpuAccelerated?: boolean;
  uptime: string;
  usageCpu: number;
  usageRam: number;
  notes?: string;
  ports: number[];
}

export interface WebApp {
  id: string;
  name: string;
  domain: string;
  internalPort: number;
  status: 'online' | 'degraded' | 'offline' | 'deploying';
  framework: 'Next.js' | 'Node.js' | 'Python' | 'Go' | 'Docker' | 'Static';
  httpsEnabled: boolean;
  sslExpiryDays: number;
  requestsPerMin: number;
  latencyMs: number;
  lastDeployed: string;
  gitRepo: string;
}

export interface IdaasUser {
  id: string;
  name: string;
  email: string;
  role: 'SuperAdmin' | 'DevOps Engineer' | 'Cloud Architect' | 'Security Analyst' | 'Viewer';
  avatar: string;
  status: 'active' | 'suspended' | 'invited';
  mfaEnabled: boolean;
  lastLogin: string;
  assignedVns: string[];
}

export interface IdaasSsoProvider {
  id: string;
  name: string;
  type: 'google' | 'microsoft' | 'github' | 'saml' | 'oidc';
  enabled: boolean;
  domains: string[];
  icon: string;
}

export interface AppStoreItem {
  id: string;
  name: string;
  tagline: string;
  category: 'Cloud & DevOps' | 'Databases' | 'AI & ML' | 'Media' | 'Security';
  version: string;
  developer: string;
  iconBg: string;
  installed: boolean;
  running?: boolean;
  rating: number;
  downloads: string;
  description: string;
  ports: string;
}

export interface StorageItem {
  id: string;
  name: string;
  type: 'photo' | 'backup' | 'iso' | 'config' | 'folder' | 'document' | 'code' | 'archive';
  size: string;
  date: string;
  source?: 's3' | 'gdrive' | 'dropbox' | 'local';
  folder?: string;
  tags?: string[];
  url?: string;
  previewUrl?: string;
  thumbnail?: string;
  synced?: boolean;
  content?: string;
}

export interface CustomWebShortcut {
  id: string;
  name: string;
  url: string;
  icon: string;
  iconBg?: string;
  category: string;
  openMode: 'window' | 'tab';
}

export interface WindowState {
  id: AppId;
  title: string;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  position: { x: number; y: number };
  size: { width: number; height: number };
}

export type DesktopWidgetId = 'clock' | 'ram' | 'apps' | 'shortcuts' | 'kvm';

export const DEFAULT_WIDGET_ORDER: DesktopWidgetId[] = [
  'clock',
  'ram',
  'apps',
  'shortcuts',
  'kvm',
];

export interface DesktopWidgetsConfig {
  showTopBar: boolean;
  showClockWidget: boolean;
  showRamWidget: boolean;
  showDesktopAppsWidget: boolean;
  showWebShortcutsWidget: boolean;
  showKvmWidget: boolean;
  widgetOrder?: DesktopWidgetId[];
}

export const DEFAULT_DESKTOP_WIDGETS_CONFIG: DesktopWidgetsConfig = {
  showTopBar: true,
  showClockWidget: true,
  showRamWidget: true,
  showDesktopAppsWidget: true,
  showWebShortcutsWidget: true,
  showKvmWidget: true,
  widgetOrder: DEFAULT_WIDGET_ORDER,
};

export interface SystemStats {
  cpuUsage: number;
  ramUsage: number;
  ramTotal: number;
  storageUsageGb: number;
  storageTotalGb: number;
  networkUpKbps: number;
  networkDownKbps: number;
  gpuLoad: number;
  vnsRunning: number;
  vnsTotal: number;
  webAppsOnline: number;
  httpsCount: number;
}
