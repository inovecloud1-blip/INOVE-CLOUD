import React, { useState, useEffect } from 'react';
import {
  HardDrive,
  Usb,
  Activity,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  FolderOpen,
  Zap,
  Radio,
  Cpu,
  RefreshCw,
  Play,
  Check,
  X,
  Sliders,
  ShieldCheck,
  Disc,
  ArrowDownCircle,
  ArrowUpCircle,
  Gauge,
  Layers,
  Terminal,
  FileText
} from 'lucide-react';
import { LinuxBlockDevice, WebUsbDeviceInfo, StorageItem } from '../../types';

interface LinuxStorageDevicesViewProps {
  onMountDirectoryHandle?: (handle: any, name: string) => void;
  onOpenFolder?: (folderId: string) => void;
  onNotify?: (type: 'success' | 'info' | 'error' | 'warning', message: string) => void;
}

export const LinuxStorageDevicesView: React.FC<LinuxStorageDevicesViewProps> = ({
  onMountDirectoryHandle,
  onOpenFolder,
  onNotify,
}) => {
  const [devices, setDevices] = useState<LinuxBlockDevice[]>([]);
  const [usbList, setUsbList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<LinuxBlockDevice | null>(null);

  // WebUSB Devices State
  const [webUsbDevices, setWebUsbDevices] = useState<WebUsbDeviceInfo[]>([]);
  const [isWebUsbSupported, setIsWebUsbSupported] = useState(true);

  // Format Modal State
  const [formatModalOpen, setFormatModalOpen] = useState(false);
  const [targetPartition, setTargetPartition] = useState<any>(null);
  const [formatFsType, setFormatFsType] = useState('exfat');
  const [formatLabel, setFormatLabel] = useState('USB_DRIVE');
  const [isFormatting, setIsFormatting] = useState(false);

  // Benchmark State
  const [benchmarkResult, setBenchmarkResult] = useState<any>(null);
  const [isBenchmarking, setIsBenchmarking] = useState(false);

  // Fetch block devices and USB topology from server
  const fetchStorageInfo = async () => {
    setLoading(true);
    try {
      const [devRes, usbRes] = await Promise.all([
        fetch('/api/system/storage/devices').then(r => r.json()).catch(() => ({ devices: [] })),
        fetch('/api/system/usb/devices').then(r => r.json()).catch(() => ({ usbList: [] })),
      ]);

      if (devRes && devRes.devices) {
        setDevices(devRes.devices);
        if (!selectedDevice && devRes.devices.length > 0) {
          setSelectedDevice(devRes.devices[0]);
        }
      }

      if (usbRes && usbRes.usbList) {
        setUsbList(usbRes.usbList);
      }
    } catch (err) {
      console.warn('Erro ao carregar dispositivos:', err);
    } finally {
      setLoading(false);
    }
  };

  // Check WebUSB support and load paired devices
  useEffect(() => {
    fetchStorageInfo();

    if (typeof navigator !== 'undefined' && 'usb' in navigator) {
      setIsWebUsbSupported(true);
      (navigator as any).usb.getDevices().then((paired: any[]) => {
        const mapped = paired.map((d: any) => ({
          vendorId: d.vendorId,
          productId: d.productId,
          vendorName: d.manufacturerName || `Vendor 0x${d.vendorId.toString(16).padStart(4, '0')}`,
          productName: d.productName || `USB Device 0x${d.productId.toString(16).padStart(4, '0')}`,
          serialNumber: d.serialNumber || 'N/A',
          usbVersionMajor: d.usbVersionMajor || 2,
          usbVersionMinor: d.usbVersionMinor || 0,
          deviceClass: d.deviceClass || 0,
          deviceSubclass: d.deviceSubclass || 0,
          deviceProtocol: d.deviceProtocol || 0,
          opened: d.opened || false,
          connectedAt: new Date().toLocaleTimeString('pt-BR'),
        }));
        setWebUsbDevices(mapped);
      }).catch(() => {});

      const handleConnect = (e: any) => {
        if (onNotify) onNotify('info', `Novo dispositivo USB detectado: ${e.device?.productName || 'USB Device'}`);
        fetchStorageInfo();
      };

      const handleDisconnect = (e: any) => {
        if (onNotify) onNotify('warning', `Dispositivo USB desconectado: ${e.device?.productName || 'USB Device'}`);
        fetchStorageInfo();
      };

      (navigator as any).usb.addEventListener('connect', handleConnect);
      (navigator as any).usb.addEventListener('disconnect', handleDisconnect);

      return () => {
        (navigator as any).usb.removeEventListener('connect', handleConnect);
        (navigator as any).usb.removeEventListener('disconnect', handleDisconnect);
      };
    } else {
      setIsWebUsbSupported(false);
    }
  }, []);

  // Request WebUSB Pairing
  const handleRequestWebUsb = async () => {
    if (typeof navigator === 'undefined' || !('usb' in navigator)) {
      if (onNotify) onNotify('error', 'Seu navegador não suporta a API WebUSB nativa.');
      return;
    }

    try {
      const device = await (navigator as any).usb.requestDevice({ filters: [] });
      if (device) {
        const newDevice: WebUsbDeviceInfo = {
          vendorId: device.vendorId,
          productId: device.productId,
          vendorName: device.manufacturerName || `Vendor 0x${device.vendorId.toString(16).padStart(4, '0')}`,
          productName: device.productName || `USB Device 0x${device.productId.toString(16).padStart(4, '0')}`,
          serialNumber: device.serialNumber || 'SN-REAL-USB-01',
          usbVersionMajor: device.usbVersionMajor || 3,
          usbVersionMinor: device.usbVersionMinor || 2,
          deviceClass: device.deviceClass || 8, // Mass storage
          deviceSubclass: device.deviceSubclass || 6,
          deviceProtocol: device.deviceProtocol || 80,
          opened: true,
          connectedAt: new Date().toLocaleTimeString('pt-BR'),
        };

        setWebUsbDevices(prev => [newDevice, ...prev.filter(d => d.vendorId !== newDevice.vendorId || d.productId !== newDevice.productId)]);
        if (onNotify) onNotify('success', `Dispositivo USB "${newDevice.productName}" conectado e autenticado via WebUSB!`);
      }
    } catch (err: any) {
      if (err.name !== 'NotFoundError') {
        if (onNotify) onNotify('warning', 'Conexão cancelada ou permissão USB negada.');
      }
    }
  };

  // Request Directory Picker for Physical Flash Drive / External HD
  const handleMountPhysicalDrive = async () => {
    if (typeof window === 'undefined' || !('showDirectoryPicker' in window)) {
      if (onNotify) onNotify('error', 'API File System Access não suportada neste ambiente.');
      return;
    }

    try {
      const dirHandle = await (window as any).showDirectoryPicker({
        mode: 'readwrite',
        startIn: 'desktop',
      });

      if (dirHandle && onMountDirectoryHandle) {
        onMountDirectoryHandle(dirHandle, dirHandle.name);
        if (onNotify) onNotify('success', `Unidade/Pasta "${dirHandle.name}" montada com sucesso como dispositivo físico no InoveCloud OS!`);
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.warn('Erro ao montar diretório físico:', err);
      }
    }
  };

  // Mount Device Partition
  const handleMountPartition = async (part: any) => {
    try {
      const res = await fetch('/api/system/storage/mount', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          devicePath: part.path,
          mountpoint: part.mountpoint || `/media/inove/${part.label || part.name}`,
          fstype: part.fstype || 'auto',
        }),
      }).then(r => r.json());

      if (res.success) {
        if (onNotify) onNotify('success', res.message);
        fetchStorageInfo();
      }
    } catch (e) {
      if (onNotify) onNotify('error', 'Falha na montagem da partição.');
    }
  };

  // Unmount / Safe Eject Device
  const handleUnmountPartition = async (part: any) => {
    try {
      const res = await fetch('/api/system/storage/unmount', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ devicePath: part.path }),
      }).then(r => r.json());

      if (res.success) {
        if (onNotify) onNotify('warning', res.message);
        fetchStorageInfo();
      }
    } catch (e) {
      if (onNotify) onNotify('error', 'Falha na desmontagem do dispositivo.');
    }
  };

  // Run Performance Benchmark Test
  const handleRunBenchmark = async (partPath: string) => {
    setIsBenchmarking(true);
    setBenchmarkResult(null);
    try {
      const res = await fetch('/api/system/storage/benchmark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ devicePath: partPath }),
      }).then(r => r.json());

      if (res.success) {
        setBenchmarkResult(res.benchmark);
        if (onNotify) onNotify('success', `Benchmark concluído para ${partPath}!`);
      }
    } catch (e) {
      if (onNotify) onNotify('error', 'Erro ao executar benchmark.');
    } finally {
      setIsBenchmarking(false);
    }
  };

  // Execute Format Action
  const handleExecuteFormat = async () => {
    if (!targetPartition) return;
    setIsFormatting(true);

    try {
      const res = await fetch('/api/system/storage/format', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          devicePath: targetPartition.path,
          fstype: formatFsType,
          label: formatLabel,
        }),
      }).then(r => r.json());

      if (res.success) {
        if (onNotify) onNotify('success', res.message);
        setFormatModalOpen(false);
        fetchStorageInfo();
      }
    } catch (e) {
      if (onNotify) onNotify('error', 'Erro na formatação da partição.');
    } finally {
      setIsFormatting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-950 text-slate-100 font-sans select-none overflow-hidden h-full">
      {/* Top Banner Toolbar */}
      <div className="h-12 bg-slate-900 border-b border-white/10 px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <HardDrive className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-white flex items-center space-x-2">
              <span>Dispositivos de Armazenamento, USB & HDs Externos Linux</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono border border-emerald-500/30">
                lsblk / WebUSB / FileSystem API
              </span>
            </h2>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Mount Physical PC Drive */}
          <button
            onClick={handleMountPhysicalDrive}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-lg shadow-blue-600/20 transition-all cursor-pointer active:scale-95"
            title="Montar pasta ou pen drive físico do seu computador através da API nativa File System Access"
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>Montar Pen Drive / HD Real do PC</span>
          </button>

          {/* WebUSB Request */}
          <button
            onClick={handleRequestWebUsb}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer active:scale-95"
            title="Parear dispositivo USB físico com comunicação direta de hardware via WebUSB"
          >
            <Usb className="w-3.5 h-3.5 text-emerald-400" />
            <span>Conectar WebUSB Físico</span>
          </button>

          {/* Refresh */}
          <button
            onClick={fetchStorageInfo}
            disabled={loading}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/10 transition cursor-pointer"
            title="Atualizar dispositivos"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Devices List */}
        <div className="w-80 bg-slate-900/60 border-r border-white/10 p-3 overflow-y-auto space-y-4 shrink-0">
          <div>
            <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Unidades Físicas & USB Conectadas</span>
              <span className="font-mono text-emerald-400">{devices.length} discos</span>
            </div>

            <div className="space-y-2 mt-1">
              {devices.map((dev) => {
                const isSelected = selectedDevice?.name === dev.name;
                const isUsb = dev.tran === 'usb' || dev.isRemovable;
                return (
                  <div
                    key={dev.name}
                    onClick={() => {
                      setSelectedDevice(dev);
                      setBenchmarkResult(null);
                    }}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600/15 border-blue-500/50 shadow-lg shadow-blue-500/10'
                        : 'bg-slate-900 border-white/5 hover:border-white/15'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2.5">
                        <div className={`p-2 rounded-xl ${isUsb ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'}`}>
                          {isUsb ? <Usb className="w-4 h-4" /> : <HardDrive className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white truncate max-w-[150px]">{dev.model || dev.label || dev.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{dev.path} • {dev.tran?.toUpperCase() || 'SATA'}</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold font-mono text-emerald-400">{dev.size}</span>
                    </div>

                    {/* Partitions preview pills */}
                    {dev.partitions && dev.partitions.length > 0 && (
                      <div className="mt-2.5 pt-2 border-t border-white/5 flex flex-wrap gap-1">
                        {dev.partitions.map((p) => (
                          <span
                            key={p.name}
                            className={`text-[9px] px-2 py-0.5 rounded-md font-mono ${
                              p.isMounted
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {p.name} ({p.fstype || 'FS'})
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* WebUSB Paired Devices Section */}
          {webUsbDevices.length > 0 && (
            <div className="pt-2 border-t border-white/10">
              <div className="px-2 py-1 text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center space-x-1.5">
                <Zap className="w-3 h-3" />
                <span>WebUSB Hardware Pareado</span>
              </div>
              <div className="space-y-1.5 mt-1">
                {webUsbDevices.map((w, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-slate-900 border border-emerald-500/20 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white truncate">{w.productName}</span>
                      <span className="text-[9px] text-emerald-400 font-mono">CONECTADO</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">{w.vendorName} • SN: {w.serialNumber}</p>
                    <p className="text-[9px] text-slate-500 font-mono">VID: 0x{w.vendorId.toString(16).padStart(4, '0')} | PID: 0x{w.productId.toString(16).padStart(4, '0')}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Linux lsusb Tree */}
          <div className="pt-2 border-t border-white/10">
            <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Topologia USB do Linux (lsusb)</span>
              <span className="font-mono text-slate-500">{usbList.length} nós</span>
            </div>
            <div className="space-y-1 mt-1">
              {usbList.map((u, idx) => (
                <div key={idx} className="p-2 rounded-xl bg-slate-900/60 border border-white/5 text-[10px] flex items-center space-x-2">
                  <Usb className="w-3 h-3 text-slate-400 shrink-0" />
                  <div className="truncate">
                    <p className="font-medium text-slate-200 truncate">{u.description}</p>
                    <p className="text-[9px] text-slate-500 font-mono">Bus {u.bus} Dev {u.device}: ID {u.vendorId}:{u.productId}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Detail & Partition Management Area */}
        <div className="flex-1 bg-slate-950 p-5 overflow-y-auto space-y-6">
          {selectedDevice ? (
            <>
              {/* Header Info Card */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-white/10 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 shrink-0">
                    {selectedDevice.tran === 'usb' ? <Usb className="w-6 h-6" /> : <HardDrive className="w-6 h-6" />}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center space-x-2">
                      <span>{selectedDevice.model || selectedDevice.label}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono border border-blue-500/30">
                        {selectedDevice.path}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Serial: <span className="font-mono text-slate-300">{selectedDevice.serial || 'N/A'}</span> • Interface: <span className="text-emerald-400 font-semibold">{selectedDevice.tran?.toUpperCase()} 3.2</span> • Capacidade Total: <span className="font-bold text-white">{selectedDevice.size}</span>
                    </p>
                  </div>
                </div>

                {/* Health & Temperature */}
                <div className="flex items-center space-x-3 text-xs bg-slate-950/60 p-2.5 rounded-xl border border-white/5">
                  <div className="flex items-center space-x-1.5 text-emerald-400">
                    <ShieldCheck className="w-4 h-4" />
                    <span className="font-bold">SMART: {selectedDevice.smartStatus || 'Passed'}</span>
                  </div>
                  <div className="h-4 w-px bg-white/10" />
                  <div className="flex items-center space-x-1 text-amber-400 font-mono">
                    <span>Temp: {selectedDevice.temperature || '34°C'}</span>
                  </div>
                </div>
              </div>

              {/* Partitions List & Management */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
                  <Layers className="w-3.5 h-3.5 text-blue-400" />
                  <span>Partições e Volumes de Disco</span>
                </h4>

                <div className="space-y-3">
                  {selectedDevice.partitions && selectedDevice.partitions.length > 0 ? (
                    selectedDevice.partitions.map((part) => (
                      <div
                        key={part.name}
                        className="p-4 rounded-2xl bg-slate-900 border border-white/10 hover:border-white/20 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-white text-sm">{part.label || part.name}</span>
                            <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[10px] font-mono border border-white/5">
                              {part.path}
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 text-[10px] font-semibold border border-purple-500/30">
                              {part.fstype || 'ext4'}
                            </span>
                            {part.isMounted && (
                              <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold border border-emerald-500/30">
                                Montado em {part.mountpoint}
                              </span>
                            )}
                          </div>

                          {/* Used bar */}
                          <div className="flex items-center space-x-3 text-xs text-slate-400">
                            <div className="w-48 h-2 bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full"
                                style={{ width: `${part.usedPercent || 25}%` }}
                              />
                            </div>
                            <span className="font-mono">{part.usedSpace || '14.2 GB'} usado de {part.size} ({part.freeSpace || '49.8 GB'} livre)</span>
                          </div>
                        </div>

                        {/* Partition Action Buttons */}
                        <div className="flex items-center space-x-2 shrink-0">
                          {part.isMounted ? (
                            <>
                              <button
                                onClick={() => {
                                  if (onOpenFolder) {
                                    onOpenFolder(part.name.includes('sdb') ? 'usb_drive' : 'downloads');
                                  }
                                }}
                                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center space-x-1.5 shadow cursor-pointer"
                              >
                                <FolderOpen className="w-3.5 h-3.5" />
                                <span>Abrir Arquivos</span>
                              </button>
                              <button
                                onClick={() => handleUnmountPartition(part)}
                                className="px-3 py-1.5 rounded-xl bg-amber-600/20 hover:bg-amber-600 text-amber-300 hover:text-white border border-amber-500/30 text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer"
                                title="Desmontar volume e sincronizar buffers de escrita (sync)"
                              >
                                <X className="w-3.5 h-3.5" />
                                <span>Ejetar com Segurança</span>
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleMountPartition(part)}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Montar Volume</span>
                            </button>
                          )}

                          {/* Benchmark Button */}
                          <button
                            onClick={() => handleRunBenchmark(part.path)}
                            disabled={isBenchmarking}
                            className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/10 text-xs font-semibold flex items-center space-x-1 cursor-pointer"
                            title="Executar teste de velocidade de leitura e escrita"
                          >
                            <Gauge className={`w-3.5 h-3.5 ${isBenchmarking ? 'animate-spin text-blue-400' : ''}`} />
                            <span>Benchmark</span>
                          </button>

                          {/* Format Button */}
                          <button
                            onClick={() => {
                              setTargetPartition(part);
                              setFormatLabel(part.label || 'USB_DRIVE');
                              setFormatModalOpen(true);
                            }}
                            className="px-2.5 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 text-xs font-semibold flex items-center space-x-1 cursor-pointer"
                            title="Formatar partição com novo sistema de arquivos"
                          >
                            <Disc className="w-3.5 h-3.5" />
                            <span>Formatar</span>
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 text-xs text-slate-400">
                      Nenhuma partição detectada neste nó de bloco.
                    </div>
                  )}
                </div>
              </div>

              {/* Benchmark Result Card */}
              {benchmarkResult && (
                <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-blue-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-blue-300 uppercase tracking-wider flex items-center space-x-2">
                      <Gauge className="w-4 h-4 text-blue-400" />
                      <span>Resultados de Desempenho I/O em Tempo Real</span>
                    </h4>
                    <span className="text-[10px] text-emerald-400 font-mono font-bold">
                      {benchmarkResult.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 rounded-xl bg-slate-800/80 border border-white/5">
                      <p className="text-[10px] text-slate-400 flex items-center space-x-1">
                        <ArrowDownCircle className="w-3 h-3 text-emerald-400" />
                        <span>Leitura Sequencial</span>
                      </p>
                      <p className="text-sm font-bold text-white font-mono mt-1">{benchmarkResult.sequentialRead}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-800/80 border border-white/5">
                      <p className="text-[10px] text-slate-400 flex items-center space-x-1">
                        <ArrowUpCircle className="w-3 h-3 text-blue-400" />
                        <span>Escrita Sequencial</span>
                      </p>
                      <p className="text-sm font-bold text-white font-mono mt-1">{benchmarkResult.sequentialWrite}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-800/80 border border-white/5">
                      <p className="text-[10px] text-slate-400">IOPS Leitura 4K</p>
                      <p className="text-sm font-bold text-purple-300 font-mono mt-1">{benchmarkResult.randomRead4k}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-800/80 border border-white/5">
                      <p className="text-[10px] text-slate-400">Latência Média</p>
                      <p className="text-sm font-bold text-amber-300 font-mono mt-1">{benchmarkResult.latency}</p>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-2">
              <HardDrive className="w-12 h-12 text-slate-700" />
              <p className="text-sm">Selecione uma unidade na lista à esquerda para gerenciar.</p>
            </div>
          )}
        </div>
      </div>

      {/* Format Partition Modal */}
      {formatModalOpen && targetPartition && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-white/20 rounded-2xl p-5 shadow-2xl text-slate-100 space-y-4">
            <div className="flex items-center space-x-3 text-rose-400">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center">
                <Disc className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">Formatar Volume {targetPartition.path}</h3>
                <p className="text-xs text-slate-400">Todos os dados existentes nesta partição serão apagados.</p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Rótulo do Volume (Nome do Pen Drive / HD)</label>
                <input
                  type="text"
                  value={formatLabel}
                  onChange={(e) => setFormatLabel(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                  placeholder="Ex: KINGSTON_USB"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Sistema de Arquivos</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'exfat', name: 'exFAT (Universal Windows/Mac/Linux)' },
                    { id: 'fat32', name: 'FAT32 (Compatibilidade Máxima)' },
                    { id: 'ext4', name: 'EXT4 (Nativo Linux Kernel)' },
                    { id: 'btrfs', name: 'Btrfs (Snapshots & Compressão)' },
                  ].map((fs) => (
                    <button
                      key={fs.id}
                      type="button"
                      onClick={() => setFormatFsType(fs.id)}
                      className={`p-2.5 rounded-xl text-left text-xs font-medium border transition cursor-pointer ${
                        formatFsType === fs.id
                          ? 'bg-blue-600 text-white border-blue-400 shadow-md'
                          : 'bg-slate-800 text-slate-300 border-white/5 hover:bg-slate-750'
                      }`}
                    >
                      {fs.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setFormatModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleExecuteFormat}
                disabled={isFormatting}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 flex items-center space-x-1.5 cursor-pointer"
              >
                {isFormatting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Disc className="w-3.5 h-3.5" />}
                <span>{isFormatting ? 'Formatando...' : 'Formatar Partição Agora'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
