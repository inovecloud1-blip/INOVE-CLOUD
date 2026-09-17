import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  Video,
  Sparkles,
  Download,
  Trash2,
  Maximize2,
  RefreshCw,
  Image as ImageIcon,
  Sliders,
  Check,
  Zap,
  Play,
  Square,
  Eye,
  AlertCircle,
  Cpu,
  SlidersHorizontal,
  Sun,
  Contrast as ContrastIcon,
  Palette,
  Layers,
  Crosshair,
  ShieldCheck,
  Grid,
  FlipHorizontal,
  Moon,
  Info,
  Film
} from 'lucide-react';

interface CapturedPhoto {
  id: string;
  dataUrl: string;
  timestamp: string;
  filter: string;
  resolution: string;
}

interface CapturedVideo {
  id: string;
  blobUrl: string;
  timestamp: string;
  duration: number;
  sizeMb: string;
}

type CameraFilter = 'none' | 'vintage' | 'cyberpunk' | 'noir' | 'thermal' | 'hdr' | 'nightvision';

export const CameraApp: React.FC = () => {
  const [activeMode, setActiveMode] = useState<'photo' | 'video' | 'gallery'>('photo');
  const [activeFilter, setActiveFilter] = useState<CameraFilter>('none');
  
  // Image Tuning Parameters (Configurações de Imagem)
  const [brightness, setBrightness] = useState<number>(100); // 50 to 150%
  const [contrast, setContrast] = useState<number>(100); // 50 to 150%
  const [saturate, setSaturate] = useState<number>(100); // 0 to 200%
  const [sharpness, setSharpness] = useState<number>(0); // 0 to 100%
  const [iso, setIso] = useState<string>('auto');
  const [whiteBalance, setWhiteBalance] = useState<string>('auto');
  const [zoomLevel, setZoomLevel] = useState<number>(1.0); // 1.0 to 5.0
  const [resolution, setResolution] = useState<'4K' | '1080p' | '720p'>('1080p');
  const [frameRate, setFrameRate] = useState<60 | 30 | 24>(60);
  const [isMirrored, setIsMirrored] = useState<boolean>(false);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showFaceTracker, setShowFaceTracker] = useState<boolean>(true);
  const [showSettingsDrawer, setShowSettingsDrawer] = useState<boolean>(false);

  // Gallery & Media
  const [photos, setPhotos] = useState<CapturedPhoto[]>(() => {
    try {
      const saved = localStorage.getItem('inovecloud_camera_photos');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [];
  });
  const [videos, setVideos] = useState<CapturedVideo[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<CapturedPhoto | null>(null);

  // Recording & Hardware States
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordDuration, setRecordDuration] = useState<number>(0);
  const [isFlashActive, setIsFlashActive] = useState<boolean>(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isSimulatedStream, setIsSimulatedStream] = useState<boolean>(false);
  const [dmaLatency, setDmaLatency] = useState<number>(3.8);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const animFrameRef = useRef<number | null>(null);

  // V4L2 Hardware Probe & Kernel Stream Initialization
  useEffect(() => {
    let stream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const width = resolution === '4K' ? 3840 : resolution === '1080p' ? 1920 : 1280;
          const height = resolution === '4K' ? 2160 : resolution === '1080p' ? 1080 : 720;
          
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: { ideal: width },
              height: { ideal: height },
              frameRate: { ideal: frameRate },
            },
            audio: activeMode === 'video',
          });

          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
          }
          setHasCameraPermission(true);
          setIsSimulatedStream(false);
        } else {
          throw new Error('Hardware camera API unavailable');
        }
      } catch (err) {
        console.warn('Hardware camera not accessible or denied in preview, switching to Linux V4L2 simulated ISP buffer.', err);
        setHasCameraPermission(false);
        setIsSimulatedStream(true);
      }
    };

    startCamera();

    // Linux DMA-BUF latency fluctuation simulation
    const timer = setInterval(() => {
      setDmaLatency(+(3.2 + Math.random() * 0.9).toFixed(1));
    }, 2000);

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      clearInterval(timer);
    };
  }, [resolution, frameRate, activeMode]);

  // Virtual Canvas Feed Renderer
  useEffect(() => {
    if (!isSimulatedStream || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let step = 0;
    const renderVirtualFeed = () => {
      step += 0.03;
      const w = canvas.width;
      const h = canvas.height;

      // Dark futuristic background gradient
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, '#0a0f1d');
      grad.addColorStop(0.5, '#151c33');
      grad.addColorStop(1, '#050814');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Grid mesh
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Animated target circles
      const cx = w / 2 + Math.sin(step) * 35;
      const cy = h / 2 + Math.cos(step) * 25;

      ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, 65, 0, Math.PI * 2);
      ctx.stroke();

      // Face tracking box simulation
      if (showFaceTracker) {
        ctx.strokeStyle = 'rgba(52, 211, 153, 0.85)';
        ctx.lineWidth = 2;
        ctx.strokeRect(cx - 55, cy - 55, 110, 110);

        ctx.fillStyle = '#34d399';
        ctx.font = '11px monospace';
        ctx.fillText(`TARGET: FACE LOCK (99.4%)`, cx - 50, cy - 65);
      }

      // Live metrics text
      ctx.fillStyle = '#38bdf8';
      ctx.font = '12px monospace';
      ctx.fillText(`V4L2 ISP ZERO-COPY DMA-BUF [/dev/video0]`, 25, 35);
      ctx.fillText(`RES: ${resolution} @ ${frameRate}FPS | ISO: ${iso} | WB: ${whiteBalance}`, 25, 55);
      ctx.fillText(`DMA LATENCY: ${dmaLatency}ms | CPU IRQ CORE #2 | DROP: 0`, 25, h - 25);

      animFrameRef.current = requestAnimationFrame(renderVirtualFeed);
    };

    renderVirtualFeed();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isSimulatedStream, resolution, frameRate, iso, whiteBalance, dmaLatency, showFaceTracker]);

  // Video recording timer
  useEffect(() => {
    let interval: any = null;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordDuration(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  // CSS Filter Generator based on user sliders & filters
  const getComputedFilter = () => {
    let filterStr = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturate}%)`;
    switch (activeFilter) {
      case 'vintage':
        filterStr += ' sepia(0.6) contrast(1.2)';
        break;
      case 'cyberpunk':
        filterStr += ' hue-rotate(180deg) saturate(2) contrast(1.3)';
        break;
      case 'noir':
        filterStr += ' grayscale(1) contrast(1.6) brightness(0.9)';
        break;
      case 'thermal':
        filterStr += ' invert(1) hue-rotate(90deg) saturate(3)';
        break;
      case 'hdr':
        filterStr += ' contrast(1.35) saturate(1.4) brightness(1.05)';
        break;
      case 'nightvision':
        filterStr += ' sepia(1) hue-rotate(85deg) saturate(3) brightness(1.2) contrast(1.4)';
        break;
      default:
        break;
    }
    return filterStr;
  };

  const takeSnapshot = () => {
    setIsFlashActive(true);
    setTimeout(() => setIsFlashActive(false), 200);

    const canvas = document.createElement('canvas');
    canvas.width = resolution === '4K' ? 3840 : resolution === '1080p' ? 1920 : 1280;
    canvas.height = resolution === '4K' ? 2160 : resolution === '1080p' ? 1080 : 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.filter = getComputedFilter();

    if (isMirrored) {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    if (!isSimulatedStream && videoRef.current) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    } else if (canvasRef.current) {
      ctx.drawImage(canvasRef.current, 0, 0, canvas.width, canvas.height);
    }

    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    const newPhoto: CapturedPhoto = {
      id: String(Date.now()),
      dataUrl,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      filter: activeFilter,
      resolution,
    };

    const updated = [newPhoto, ...photos];
    setPhotos(updated);
    try {
      localStorage.setItem('inovecloud_camera_photos', JSON.stringify(updated.slice(0, 30)));
    } catch (e) {
      console.error(e);
    }
  };

  // Video Recording Logic
  const startVideoRecording = () => {
    try {
      let stream: MediaStream | null = null;
      if (!isSimulatedStream && videoRef.current && (videoRef.current.srcObject as MediaStream)) {
        stream = videoRef.current.srcObject as MediaStream;
      } else if (canvasRef.current) {
        stream = canvasRef.current.captureStream(frameRate);
      }

      if (!stream) return;

      recordedChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9,opus' });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const blobUrl = URL.createObjectURL(blob);
        const newVid: CapturedVideo = {
          id: String(Date.now()),
          blobUrl,
          timestamp: new Date().toLocaleTimeString('pt-BR'),
          duration: recordDuration,
          sizeMb: (blob.size / (1024 * 1024)).toFixed(2),
        };
        setVideos((prev) => [newVid, ...prev]);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (e) {
      console.error('Recording error:', e);
      setIsRecording(true);
    }
  };

  const stopVideoRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const downloadPhoto = (photo: CapturedPhoto) => {
    const a = document.createElement('a');
    a.href = photo.dataUrl;
    a.download = `inove-snapshot-${photo.id}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const downloadVideo = (vid: CapturedVideo) => {
    const a = document.createElement('a');
    a.href = vid.blobUrl;
    a.download = `inove-video-${vid.id}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const deletePhoto = (id: string) => {
    const updated = photos.filter((p) => p.id !== id);
    setPhotos(updated);
    if (selectedPhoto?.id === id) setSelectedPhoto(null);
    try {
      localStorage.setItem('inovecloud_camera_photos', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const resetImageSettings = () => {
    setBrightness(100);
    setContrast(100);
    setSaturate(100);
    setSharpness(0);
    setIso('auto');
    setWhiteBalance('auto');
    setZoomLevel(1.0);
    setIsMirrored(false);
    setActiveFilter('none');
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 text-white font-sans select-none overflow-hidden relative">
      {/* Flash overlay */}
      {isFlashActive && <div className="absolute inset-0 bg-white z-50 animate-pulse pointer-events-none" />}

      {/* Top Controls Bar */}
      <div className="p-3 bg-slate-900/90 border-b border-white/10 flex items-center justify-between flex-wrap gap-2 z-10">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30 flex items-center justify-center shadow-md">
            <Camera className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xs font-bold text-white tracking-wide">Câmera & Vídeo V4L2 ISP</h2>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                /dev/video0 DMA
              </span>
            </div>
            <div className="text-[10px] text-slate-400 flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${isSimulatedStream ? 'bg-amber-400' : 'bg-emerald-400'}`} />
              <span>{isSimulatedStream ? 'Linux Virtual ISP Engine (Mesa 3D)' : 'Hardware Real Conectado'}</span>
              <span>• Latência: {dmaLatency}ms</span>
            </div>
          </div>
        </div>

        {/* Center: Mode selector */}
        <div className="flex items-center space-x-1 bg-black/50 p-1 rounded-xl border border-white/10 text-[11px]">
          <button
            onClick={() => setActiveMode('photo')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer font-semibold ${
              activeMode === 'photo' ? 'bg-red-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Foto
          </button>
          <button
            onClick={() => setActiveMode('video')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer font-semibold ${
              activeMode === 'video' ? 'bg-red-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Vídeo
          </button>
          <button
            onClick={() => setActiveMode('gallery')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 font-semibold ${
              activeMode === 'gallery' ? 'bg-red-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Galeria ({photos.length + videos.length})</span>
          </button>
        </div>

        {/* Right Action: Toggle Settings Panel */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowSettingsDrawer(!showSettingsDrawer)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition cursor-pointer ${
              showSettingsDrawer
                ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/30'
                : 'bg-white/10 hover:bg-white/20 text-slate-200 border-white/10'
            }`}
            title="Ajustes de Imagem, ISP & Driver"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Configurações de Imagem</span>
          </button>
        </div>
      </div>

      {/* Main Viewport Container */}
      <div className="flex-1 flex overflow-hidden relative bg-black">
        {activeMode === 'gallery' ? (
          /* GALLERY VIEW */
          <div className="flex-1 p-6 overflow-y-auto space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="text-sm font-bold text-white flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-red-400" />
                Galeria de Fotos e Gravações de Vídeo
              </span>
              {(photos.length > 0 || videos.length > 0) && (
                <button
                  onClick={() => {
                    setPhotos([]);
                    setVideos([]);
                    localStorage.removeItem('inovecloud_camera_photos');
                  }}
                  className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Limpar Galeria</span>
                </button>
              )}
            </div>

            {photos.length === 0 && videos.length === 0 ? (
              <div className="text-center py-20 text-slate-500 space-y-3">
                <Camera className="w-12 h-12 mx-auto text-slate-600" />
                <p className="text-sm font-medium">Nenhuma captura realizada ainda.</p>
                <button
                  onClick={() => setActiveMode('photo')}
                  className="px-4 py-2 rounded-xl bg-red-600 text-white font-bold text-xs shadow-lg shadow-red-600/30"
                >
                  Capturar Agora
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Videos */}
                {videos.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Film className="w-3.5 h-3.5 text-red-400" />
                      <span>Vídeos Gravados ({videos.length})</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {videos.map((vid) => (
                        <div key={vid.id} className="p-3 rounded-2xl bg-slate-900 border border-white/10 space-y-2">
                          <video src={vid.blobUrl} controls className="w-full h-40 rounded-xl bg-black object-cover" />
                          <div className="flex items-center justify-between text-[11px] text-slate-400">
                            <span className="font-mono">{vid.timestamp} • {vid.sizeMb} MB</span>
                            <button
                              onClick={() => downloadVideo(vid)}
                              className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center gap-1"
                            >
                              <Download className="w-3 h-3" />
                              <span>Baixar WebM</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Photos */}
                {photos.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Fotos Capturadas ({photos.length})</span>
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {photos.map((photo) => (
                        <div
                          key={photo.id}
                          onClick={() => setSelectedPhoto(photo)}
                          className="group relative rounded-xl overflow-hidden border border-white/10 hover:border-red-500/50 transition cursor-pointer bg-slate-900"
                        >
                          <img src={photo.dataUrl} alt="Snapshot" className="w-full h-36 object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent opacity-0 group-hover:opacity-100 transition p-2 flex items-end justify-between">
                            <span className="text-[10px] text-white font-mono">{photo.timestamp}</span>
                            <div className="flex space-x-1" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => downloadPhoto(photo)}
                                className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white"
                                title="Baixar JPEG"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => deletePhoto(photo.id)}
                                className="p-1.5 rounded-lg bg-red-600/80 hover:bg-red-600 text-white"
                                title="Excluir"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          /* LIVE CAMERA VIEWFINDER */
          <div className="flex-1 flex flex-col items-center justify-center relative p-3">
            <div
              className="relative w-full max-w-4xl h-[460px] rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-slate-900 flex items-center justify-center"
              style={{
                transform: `scale(${zoomLevel})`,
                transition: 'transform 0.2s ease-out',
              }}
            >
              {/* Real Hardware Video Stream */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover transition-all ${
                  isSimulatedStream ? 'hidden' : 'block'
                } ${isMirrored ? 'scale-x-[-1]' : ''}`}
                style={{ filter: getComputedFilter() }}
              />

              {/* Simulated DRM Feed Canvas */}
              <canvas
                ref={canvasRef}
                width={1920}
                height={1080}
                className={`w-full h-full object-cover ${isSimulatedStream ? 'block' : 'hidden'} ${
                  isMirrored ? 'scale-x-[-1]' : ''
                }`}
                style={{ filter: getComputedFilter() }}
              />

              {/* 3x3 Composition Grid */}
              {showGrid && (
                <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 border border-white/10">
                  <div className="border-r border-b border-white/10" />
                  <div className="border-r border-b border-white/10" />
                  <div className="border-b border-white/10" />
                  <div className="border-r border-b border-white/10" />
                  <div className="border-r border-b border-white/10" />
                  <div className="border-b border-white/10" />
                  <div className="border-r border-white/10" />
                  <div className="border-r border-white/10" />
                  <div className="" />
                </div>
              )}

              {/* Viewfinder HUD Overlays */}
              <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <div className="px-3 py-1.5 rounded-xl bg-black/70 backdrop-blur-md border border-white/10 text-[11px] font-mono text-white flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                    <span>REC [{resolution} {frameRate}FPS]</span>
                  </div>

                  {isRecording && (
                    <div className="px-4 py-1.5 rounded-full bg-red-600 text-white font-mono font-bold text-xs shadow-lg shadow-red-600/50 animate-pulse flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                      <span>
                        GRAVANDO ● {String(Math.floor(recordDuration / 60)).padStart(2, '0')}:
                        {String(recordDuration % 60).padStart(2, '0')}
                      </span>
                    </div>
                  )}

                  <div className="px-3 py-1.5 rounded-xl bg-black/70 backdrop-blur-md border border-white/10 text-[11px] font-mono text-cyan-300">
                    FILTRO: {activeFilter.toUpperCase()} • ZOOM: {zoomLevel.toFixed(1)}x
                  </div>
                </div>

                {/* Center Crosshair Focus Reticle */}
                <div className="self-center w-28 h-28 border border-white/30 rounded-xl flex items-center justify-center">
                  <Crosshair className="w-6 h-6 text-white/50 animate-pulse" />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-300 font-mono bg-black/60 px-3 py-1.5 rounded-xl backdrop-blur-md border border-white/10">
                  <span>RAW • PROCESSOR ISP ZERO-COPY</span>
                  <span>ISO: {iso.toUpperCase()} • WB: {whiteBalance.toUpperCase()}</span>
                </div>
              </div>
            </div>

            {/* Bottom Shutter & Capture Bar */}
            <div className="mt-4 flex items-center justify-center space-x-6">
              {/* Photo thumbnail */}
              {photos.length > 0 ? (
                <button
                  onClick={() => setActiveMode('gallery')}
                  className="w-12 h-12 rounded-xl overflow-hidden border-2 border-white/20 hover:border-white transition shadow"
                  title="Abrir Galeria"
                >
                  <img src={photos[0].dataUrl} alt="Last" className="w-full h-full object-cover" />
                </button>
              ) : (
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-600">
                  <ImageIcon className="w-5 h-5" />
                </div>
              )}

              {/* Shutter Button */}
              {activeMode === 'photo' ? (
                <button
                  onClick={takeSnapshot}
                  className="w-16 h-16 rounded-full bg-white hover:bg-slate-100 p-1 shadow-2xl shadow-white/30 transition active:scale-90 flex items-center justify-center cursor-pointer border-4 border-slate-700"
                  title="Capturar Foto"
                >
                  <div className="w-12 h-12 rounded-full bg-white border-2 border-slate-900" />
                </button>
              ) : (
                <button
                  onClick={() => {
                    if (isRecording) {
                      stopVideoRecording();
                    } else {
                      startVideoRecording();
                    }
                  }}
                  className={`w-16 h-16 rounded-full p-1 shadow-2xl transition active:scale-90 flex items-center justify-center cursor-pointer border-4 border-slate-700 ${
                    isRecording ? 'bg-red-600 shadow-red-600/50' : 'bg-red-600 hover:bg-red-500'
                  }`}
                  title={isRecording ? 'Parar Gravação' : 'Iniciar Gravação'}
                >
                  {isRecording ? <Square className="w-6 h-6 text-white" /> : <Video className="w-6 h-6 text-white" />}
                </button>
              )}

              {/* Mode switch helper */}
              <button
                onClick={() => setActiveMode(activeMode === 'photo' ? 'video' : 'photo')}
                className="w-12 h-12 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white flex items-center justify-center transition cursor-pointer"
                title="Alternar Modo Foto / Vídeo"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* SIDEBAR DRAWER: CONFIGURAÇÕES DE IMAGEM & PROCESSADOR */}
        {showSettingsDrawer && (
          <div className="w-80 border-l border-white/10 bg-slate-900/95 backdrop-blur-xl p-4 overflow-y-auto space-y-5 text-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <span>Configurações de Imagem</span>
              </h3>
              <button
                onClick={resetImageSettings}
                className="text-[10px] text-cyan-400 hover:underline cursor-pointer"
              >
                Resetar
              </button>
            </div>

            {/* Presets / Filtros ISP */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-300">Filtro / Perfil de Cor ISP</label>
              <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                {[
                  { id: 'none', label: 'Normal' },
                  { id: 'hdr', label: 'HDR Pro' },
                  { id: 'nightvision', label: 'Visão Noturna IR' },
                  { id: 'vintage', label: 'Vintage' },
                  { id: 'cyberpunk', label: 'Cyberpunk' },
                  { id: 'noir', label: 'Preto & Branco' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setActiveFilter(f.id as any)}
                    className={`p-2 rounded-xl border text-center font-medium transition cursor-pointer ${
                      activeFilter === f.id
                        ? 'bg-blue-600 text-white border-blue-400 font-bold'
                        : 'bg-white/5 border-white/5 hover:bg-white/10 text-slate-300'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Brightness, Contrast & Saturation Sliders */}
            <div className="space-y-3 p-3 rounded-2xl bg-white/5 border border-white/10">
              {/* Brilho */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="flex items-center gap-1"><Sun className="w-3.5 h-3.5 text-amber-400" /> Brilho</span>
                  <span className="font-mono text-cyan-300">{brightness}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="150"
                  value={brightness}
                  onChange={(e) => setBrightness(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>

              {/* Contraste */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="flex items-center gap-1"><ContrastIcon className="w-3.5 h-3.5 text-indigo-400" /> Contraste</span>
                  <span className="font-mono text-cyan-300">{contrast}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="150"
                  value={contrast}
                  onChange={(e) => setContrast(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-400"
                />
              </div>

              {/* Saturação */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="flex items-center gap-1"><Palette className="w-3.5 h-3.5 text-rose-400" /> Saturação</span>
                  <span className="font-mono text-cyan-300">{saturate}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={saturate}
                  onChange={(e) => setSaturate(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-400"
                />
              </div>

              {/* Zoom Digital */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="flex items-center gap-1"><Maximize2 className="w-3.5 h-3.5 text-emerald-400" /> Zoom Digital</span>
                  <span className="font-mono text-emerald-300">{zoomLevel.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="5.0"
                  step="0.1"
                  value={zoomLevel}
                  onChange={(e) => setZoomLevel(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                />
              </div>
            </div>

            {/* Resolution & FPS */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-300">Resolução do Sensor</label>
              <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                {(['4K', '1080p', '720p'] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setResolution(r)}
                    className={`py-1.5 rounded-lg border text-center font-bold transition cursor-pointer ${
                      resolution === r ? 'bg-cyan-600 text-white border-cyan-400' : 'bg-white/5 border-white/5 text-slate-300'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Exposure / ISO */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-300">Sensibilidade ISO</label>
              <select
                value={iso}
                onChange={(e) => setIso(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="auto">Automático (Sensor Auto-Gain)</option>
                <option value="100">ISO 100 (Ambiente Externo Claro)</option>
                <option value="200">ISO 200</option>
                <option value="400">ISO 400 (Ambiente Interno)</option>
                <option value="800">ISO 800</option>
                <option value="1600">ISO 1600 (Pouca Luz)</option>
                <option value="3200">ISO 3200 (Noturno)</option>
              </select>
            </div>

            {/* White Balance */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-300">Balanço de Branco (WB)</label>
              <select
                value={whiteBalance}
                onChange={(e) => setWhiteBalance(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="auto">Automático (AWB)</option>
                <option value="5500K">Luz do Dia (5500K)</option>
                <option value="4000K">Fluorescente (4000K)</option>
                <option value="3200K">Incandescente / Tungstênio (3200K)</option>
                <option value="6500K">Nublado (6500K)</option>
              </select>
            </div>

            {/* Overlays & Toggles */}
            <div className="space-y-2 pt-2 border-t border-white/10">
              <label className="text-[11px] font-bold text-slate-300">Recursos de Assistência</label>
              
              <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 text-xs">
                <span className="flex items-center gap-2"><Grid className="w-3.5 h-3.5 text-slate-400" /> Grade 3x3</span>
                <input
                  type="checkbox"
                  checked={showGrid}
                  onChange={() => setShowGrid(!showGrid)}
                  className="rounded accent-cyan-500"
                />
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 text-xs">
                <span className="flex items-center gap-2"><FlipHorizontal className="w-3.5 h-3.5 text-slate-400" /> Espelhar Câmera</span>
                <input
                  type="checkbox"
                  checked={isMirrored}
                  onChange={() => setIsMirrored(!isMirrored)}
                  className="rounded accent-cyan-500"
                />
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 text-xs">
                <span className="flex items-center gap-2"><Crosshair className="w-3.5 h-3.5 text-emerald-400" /> Rastreamento Facial AI</span>
                <input
                  type="checkbox"
                  checked={showFaceTracker}
                  onChange={() => setShowFaceTracker(!showFaceTracker)}
                  className="rounded accent-emerald-500"
                />
              </div>
            </div>

            {/* Driver & Processor Hardware Info */}
            <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/30 space-y-1.5 text-[10px]">
              <div className="font-bold text-cyan-300 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5" />
                <span>Integração Processador Linux V4L2</span>
              </div>
              <p className="text-slate-300">Driver: <span className="font-mono text-white">uvcvideo / v4l2loopback</span></p>
              <p className="text-slate-300">Pipeline: <span className="font-mono text-emerald-400">Zero-Copy DMA-BUF Direct</span></p>
              <p className="text-slate-300">Aceleração: <span className="font-mono text-cyan-400">OpenGL ES 3.2 / Vulkan Video</span></p>
            </div>
          </div>
        )}
      </div>

      {/* Fullscreen Photo Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="max-w-4xl w-full bg-slate-900 rounded-2xl overflow-hidden border border-white/20 shadow-2xl space-y-3 p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <div>
                <h3 className="text-sm font-bold text-white">Captura ISP InoveCloud OS</h3>
                <span className="text-[11px] text-slate-400 font-mono">{selectedPhoto.timestamp} • {selectedPhoto.resolution}</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => downloadPhoto(selectedPhoto)}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Baixar JPEG</span>
                </button>
                <button
                  onClick={() => deletePhoto(selectedPhoto.id)}
                  className="px-3 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Excluir</span>
                </button>
                <button
                  onClick={() => setSelectedPhoto(null)}
                  className="p-1.5 rounded-lg bg-white/10 text-white hover:bg-white/20"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="rounded-xl overflow-hidden bg-black flex items-center justify-center max-h-[70vh]">
              <img src={selectedPhoto.dataUrl} alt="Snapshot Full" className="max-h-full max-w-full object-contain" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
