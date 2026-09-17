import React, { useState } from 'react';
import {
  X,
  Download,
  CheckCircle2,
  Trash2,
  Play,
  Star,
  ShieldCheck,
  Globe,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Check,
  Terminal,
  Cpu,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { FlathubAppDetail } from '../../data/flathubAppsData';
import { RealAppIcon } from './RealAppIcon';

interface AppScreenshotModalProps {
  app: FlathubAppDetail | null;
  isOpen: boolean;
  onClose: () => void;
  onInstall: (app: FlathubAppDetail) => void;
  onUninstall: (app: FlathubAppDetail) => void;
  onLaunch: (app: FlathubAppDetail) => void;
  isInstalling: boolean;
  installProgress: number;
  installStage: string;
  isUninstalling: boolean;
  uninstallProgress: number;
  uninstallStage: string;
}

export const AppScreenshotModal: React.FC<AppScreenshotModalProps> = ({
  app,
  isOpen,
  onClose,
  onInstall,
  onUninstall,
  onLaunch,
  isInstalling,
  installProgress,
  installStage,
  isUninstalling,
  uninstallProgress,
  uninstallStage,
}) => {
  const [activeScreenshotIdx, setActiveScreenshotIdx] = useState(0);
  const [isFullScreenScreenshot, setIsFullScreenScreenshot] = useState(false);

  if (!isOpen || !app) return null;

  const currentScreenshot = app.screenshots[activeScreenshotIdx] || app.screenshots[0];

  const handleNextScreenshot = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveScreenshotIdx((prev) => (prev + 1) % app.screenshots.length);
  };

  const handlePrevScreenshot = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveScreenshotIdx((prev) => (prev - 1 + app.screenshots.length) % app.screenshots.length);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-5xl bg-[#1e1c24] border border-[#3e3b4a] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        >
          {/* Top Bar with Flathub header style */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#2e2c38] bg-[#19171f]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#4A86CF] flex items-center justify-center p-1.5 shadow">
                <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
                  <circle cx="36" cy="36" r="11.8" fill="#FFFFFF" />
                  <path d="M 55.5 25.5 C 55.5 23.4 57.8 22.1 59.6 23.2 L 75.8 33.8 C 77.4 34.8 77.4 37.2 75.8 38.2 L 59.6 48.8 C 57.8 49.9 55.5 48.6 55.5 46.5 Z" fill="#FFFFFF" />
                  <rect x="25.5" y="52.5" width="21.5" height="21.5" rx="6.5" fill="#FFFFFF" />
                  <rect x="53" y="60.2" width="22" height="6.6" rx="3.3" fill="#FFFFFF" />
                  <rect x="60.7" y="52.5" width="6.6" height="22" rx="3.3" fill="#FFFFFF" />
                </svg>
              </div>
              <span className="text-sm font-semibold text-gray-300">Flathub &bull; {app.category}</span>
              <span className="text-xs text-gray-500 font-mono hidden sm:inline">{app.appId}</span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
            
            {/* Header Hero Profile */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-[#2e2c38]">
              <div className="flex items-center gap-5">
                <RealAppIcon type={app.iconType} className="w-20 h-20 shadow-xl" rounded="rounded-2xl" />
                <div>
                  <div className="flex items-center gap-2.5">
                    <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{app.name}</h1>
                    {app.verified && (
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#4A86CF] text-white" title="Desenvolvedor Verificado no Flathub">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <p className="text-sm sm:text-base text-gray-300 mt-1">{app.tagline}</p>
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-400">
                    <span className="text-blue-400 hover:underline cursor-pointer flex items-center gap-1">
                      {app.developer} <ExternalLink className="w-3 h-3" />
                    </span>
                    <span>&bull;</span>
                    <span className="bg-[#2b2836] px-2 py-0.5 rounded text-gray-300 font-mono">v{app.version}</span>
                    <span>&bull;</span>
                    <span>Licença {app.license}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons & Status */}
              <div className="flex flex-col items-stretch sm:items-end gap-2 w-full md:w-auto">
                {isInstalling ? (
                  <div className="w-full sm:w-64 bg-[#141318] p-3 rounded-xl border border-blue-500/30">
                    <div className="flex justify-between text-xs text-blue-400 mb-1.5 font-medium">
                      <span>{installStage}</span>
                      <span>{installProgress}%</span>
                    </div>
                    <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300"
                        style={{ width: `${installProgress}%` }}
                      />
                    </div>
                  </div>
                ) : isUninstalling ? (
                  <div className="w-full sm:w-64 bg-[#141318] p-3 rounded-xl border border-red-500/30">
                    <div className="flex justify-between text-xs text-red-400 mb-1.5 font-medium">
                      <span>{uninstallStage}</span>
                      <span>{uninstallProgress}%</span>
                    </div>
                    <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-red-500 transition-all duration-300"
                        style={{ width: `${uninstallProgress}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    {app.installed ? (
                      <>
                        <button
                          onClick={() => onLaunch(app)}
                          className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30 transition-all cursor-pointer"
                        >
                          <Play className="w-4 h-4 fill-white" />
                          Abrir App
                        </button>
                        <button
                          onClick={() => onUninstall(app)}
                          className="p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all cursor-pointer"
                          title="Desinstalar do sistema"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => onInstall(app)}
                        className="w-full sm:w-auto px-8 py-3 rounded-xl bg-[#4A86CF] hover:bg-[#3D72B4] text-white font-semibold flex items-center justify-center gap-2.5 shadow-lg shadow-blue-500/25 transition-all active:scale-95 cursor-pointer text-base"
                      >
                        <Download className="w-5 h-5" />
                        Instalar Flatpak
                      </button>
                    )}
                  </div>
                )}
                
                <div className="text-xs text-gray-500 flex items-center gap-2 justify-end">
                  <span>Tamanho: <strong className="text-gray-300">{app.size}</strong></span>
                  <span>&bull;</span>
                  <span>Memória: <strong className="text-gray-300">{app.memoryUsage}</strong></span>
                </div>
              </div>
            </div>

            {/* SCREENSHOTS SHOWCASE (High-Fidelity) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-400" />
                  Capturas de Tela em Alta Resolução
                </h3>
                <span className="text-xs text-gray-400">
                  {activeScreenshotIdx + 1} de {app.screenshots.length} capturas
                </span>
              </div>

              {/* Main Display Window */}
              <div className="relative group rounded-2xl overflow-hidden bg-[#111015] border border-[#3e3b4a] shadow-2xl aspect-video max-h-[440px] flex flex-col">
                {/* Fake Window Titlebar */}
                <div className="flex items-center justify-between px-4 py-2 bg-[#1b1922] border-b border-[#2e2c38]">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                    <span className="ml-2 text-xs font-mono text-gray-400 truncate max-w-xs">{app.name} &mdash; {currentScreenshot.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">Wayland / GPU 60fps</span>
                    <button
                      onClick={() => setIsFullScreenScreenshot(!isFullScreenScreenshot)}
                      className="text-gray-400 hover:text-white p-1"
                      title="Tela cheia"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Screenshot Realistic Interface Mock */}
                <div className="flex-1 relative p-4 flex items-center justify-center bg-gradient-to-br from-[#16151c] to-[#0e0d12] overflow-hidden select-none">
                  {currentScreenshot.type === 'editor' && (
                    <div className="w-full h-full bg-[#1e1e2e] rounded-lg p-4 font-mono text-xs text-gray-300 flex flex-col border border-white/5 shadow-inner">
                      <div className="flex items-center justify-between pb-2 border-b border-gray-700/50 text-[11px] text-gray-400">
                        <span>activity_main.xml &bull; Layout Editor</span>
                        <span className="text-emerald-400">Compilação: OK</span>
                      </div>
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                        <div className="bg-[#181825] p-3 rounded text-gray-300 text-[11px] overflow-hidden leading-relaxed">
                          <p className="text-blue-400">&lt;androidx.coordinatorlayout.widget.CoordinatorLayout</p>
                          <p className="pl-4 text-emerald-300">xmlns:android="http://schemas.android.com/apk/res/android"</p>
                          <p className="pl-4 text-emerald-300">android:layout_width="match_parent"</p>
                          <p className="pl-4 text-emerald-300">android:layout_height="match_parent"&gt;</p>
                          <p className="pl-8 text-blue-400">&lt;com.google.android.material.button.MaterialButton</p>
                          <p className="pl-12 text-yellow-300">android:text="Configurar Flathub" /&gt;</p>
                          <p className="text-blue-400">&lt;/androidx.coordinatorlayout.widget.CoordinatorLayout&gt;</p>
                        </div>
                        <div className="bg-[#24273a] rounded-lg p-4 flex flex-col items-center justify-center text-center border border-white/10">
                          <RealAppIcon type={app.iconType} className="w-12 h-12 mb-2" />
                          <h4 className="font-bold text-white text-sm">{app.name}</h4>
                          <p className="text-xs text-gray-400 mt-1 max-w-[200px]">{app.tagline}</p>
                          <div className="mt-3 px-4 py-1.5 rounded-full bg-blue-500 text-white text-xs font-semibold">
                            Interagir
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {currentScreenshot.type === 'game' && (
                    <div className="w-full h-full bg-[#121118] rounded-lg p-4 flex flex-col justify-between border border-white/5 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
                      <div className="z-20 flex justify-between items-center">
                        <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold font-mono">
                          VULKAN VSYNC 120 FPS
                        </span>
                        <span className="text-xs text-gray-400">Game Mode: Ativo</span>
                      </div>
                      <div className="z-20 flex items-end justify-between">
                        <div>
                          <h4 className="text-xl font-bold text-white">{app.name} Engine</h4>
                          <p className="text-xs text-gray-300">{currentScreenshot.caption}</p>
                        </div>
                        <div className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-xs font-bold shadow-lg">
                          Play Online
                        </div>
                      </div>
                    </div>
                  )}

                  {currentScreenshot.type === 'media' && (
                    <div className="w-full h-full bg-[#161320] rounded-lg p-4 flex flex-col justify-between border border-white/5">
                      <div className="flex items-center gap-4">
                        <RealAppIcon type={app.iconType} className="w-14 h-14" />
                        <div>
                          <h4 className="text-base font-bold text-white">{app.name} Studio</h4>
                          <p className="text-xs text-gray-400">Áudio Hi-Res Lossless 24-bit / 192kHz</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-10 w-full flex items-end gap-1 px-2 py-1 bg-black/30 rounded-lg">
                          {[40, 65, 80, 50, 90, 75, 60, 85, 95, 70, 55, 80, 60, 45, 90, 85, 65, 40, 75, 90].map((h, i) => (
                            <div key={i} className="flex-1 bg-gradient-to-t from-blue-500 to-indigo-400 rounded-t" style={{ height: `${h}%` }} />
                          ))}
                        </div>
                        <div className="flex justify-between text-[11px] text-gray-400 font-mono">
                          <span>01:42</span>
                          <span className="text-blue-400">PipeWire Bit-Perfect</span>
                          <span>04:30</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {['ui_mock', 'chat', 'dashboard', 'code'].includes(currentScreenshot.type) && (
                    <div className="w-full h-full bg-[#181722] rounded-lg p-4 flex flex-col border border-white/5 justify-between">
                      <div className="flex items-center justify-between pb-3 border-b border-gray-800">
                        <div className="flex items-center gap-2">
                          <RealAppIcon type={app.iconType} className="w-6 h-6" rounded="rounded-md" />
                          <span className="text-xs font-bold text-white">{app.name}</span>
                        </div>
                        <span className="text-xs text-gray-400">{currentScreenshot.caption}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-3 my-2">
                        <div className="bg-[#211f2c] p-3 rounded-lg border border-white/5">
                          <p className="text-[10px] text-gray-400 uppercase font-mono">Conexão</p>
                          <p className="text-xs font-bold text-emerald-400 mt-1">Protegida / SSL</p>
                        </div>
                        <div className="bg-[#211f2c] p-3 rounded-lg border border-white/5">
                          <p className="text-[10px] text-gray-400 uppercase font-mono">Sandbox</p>
                          <p className="text-xs font-bold text-blue-400 mt-1">Bubblewrap Ativo</p>
                        </div>
                        <div className="bg-[#211f2c] p-3 rounded-lg border border-white/5">
                          <p className="text-[10px] text-gray-400 uppercase font-mono">Atualizações</p>
                          <p className="text-xs font-bold text-yellow-400 mt-1">Flathub Remote</p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-300 italic">{currentScreenshot.description}</p>
                    </div>
                  )}

                  {/* Navigation Arrows */}
                  <button
                    onClick={handlePrevScreenshot}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white transition-all shadow-lg backdrop-blur-sm cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleNextScreenshot}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white transition-all shadow-lg backdrop-blur-sm cursor-pointer"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>

                {/* Screenshot Caption Footer */}
                <div className="px-4 py-2.5 bg-[#17161f] border-t border-[#2e2c38] flex items-center justify-between text-xs text-gray-300">
                  <span className="font-medium text-white">{currentScreenshot.title}</span>
                  <span className="text-gray-400 truncate max-w-md hidden sm:inline">{currentScreenshot.caption}</span>
                </div>
              </div>

              {/* Thumbnails row */}
              <div className="flex gap-3 overflow-x-auto pb-2">
                {app.screenshots.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveScreenshotIdx(idx)}
                    className={`px-4 py-2 rounded-xl text-xs font-medium border transition-all cursor-pointer whitespace-nowrap ${
                      activeScreenshotIdx === idx
                        ? 'bg-[#4A86CF] text-white border-blue-400 shadow-md'
                        : 'bg-[#25232e] text-gray-300 border-white/5 hover:bg-[#2f2c3b]'
                    }`}
                  >
                    {s.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Description & Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-4">
                <h3 className="text-lg font-bold text-white">Sobre este aplicativo</h3>
                <p className="text-sm text-gray-300 leading-relaxed">{app.description}</p>
                
                <h4 className="text-sm font-bold text-gray-200 mt-4">Recursos Principais</h4>
                <ul className="space-y-2">
                  {app.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-gray-300">
                      <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Technical Metadata Sidebar */}
              <div className="bg-[#25232e] p-5 rounded-2xl border border-[#3e3b4a] space-y-4 text-xs">
                <h4 className="font-bold text-white text-sm pb-2 border-b border-white/10 flex items-center gap-2">
                  <Info className="w-4 h-4 text-blue-400" />
                  Detalhes Técnicos
                </h4>

                <div>
                  <span className="text-gray-400 block">ID do Aplicativo:</span>
                  <span className="font-mono text-gray-200 break-all">{app.appId}</span>
                </div>

                <div>
                  <span className="text-gray-400 block">Gerenciador de Pacotes:</span>
                  <span className="font-semibold text-blue-400 uppercase">{app.packageManager} (OCI Flatpak)</span>
                </div>

                <div>
                  <span className="text-gray-400 block">Lançamento:</span>
                  <span className="text-gray-200">{app.releaseDate}</span>
                </div>

                <div>
                  <span className="text-gray-400 block">Downloads no Flathub:</span>
                  <span className="text-gray-200">{app.downloads}</span>
                </div>

                <div className="pt-2 border-t border-white/10">
                  <span className="text-gray-400 block mb-1">Permissões de Sandbox:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {app.permissions.map((perm, pIdx) => (
                      <span key={pIdx} className="px-2 py-0.5 rounded bg-black/40 text-gray-300 text-[10px] border border-white/5">
                        {perm}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
