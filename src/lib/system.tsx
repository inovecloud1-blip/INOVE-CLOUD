import React, { createContext, useContext, useState, useEffect } from 'react';

interface SystemInfo {
  ok: boolean;
  hostname: string;
  kernel: string;
  platform: string;
  uptime: number;
}

interface SystemContextType {
  live: boolean;
  info: SystemInfo | null;
  stats: {
    cpu: number;
    ram: { totalBytes: number; usedBytes: number; percent: number };
    disk: { totalBytes: number; usedBytes: number; percent: number };
    network: { upKb: number; downKb: number };
  } | null;
  refreshStats: () => void;
}

const SystemContext = createContext<SystemContextType>({
  live: false,
  info: null,
  stats: null,
  refreshStats: () => {},
});

export const SystemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [live, setLive] = useState<boolean>(false);
  const [info, setInfo] = useState<SystemInfo | null>(null);
  const [stats, setStats] = useState<SystemContextType['stats']>(null);

  const checkHealth = async () => {
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        if (data.ok) {
          setLive(true);
          setInfo(data);
          return;
        }
      }
    } catch (e) {
      // Not in live server environment (Demo mode)
    }
    setLive(false);
    setInfo(null);
  };

  const fetchStats = async () => {
    if (!live) return;
    try {
      const res = await fetch('/api/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (e) {}
  };

  useEffect(() => {
    checkHealth();
    const healthInterval = setInterval(checkHealth, 5000);
    return () => clearInterval(healthInterval);
  }, []);

  useEffect(() => {
    if (live) {
      fetchStats();
      const statsInterval = setInterval(fetchStats, 2000);
      return () => clearInterval(statsInterval);
    }
  }, [live]);

  return (
    <SystemContext.Provider value={{ live, info, stats, refreshStats: fetchStats }}>
      {children}
    </SystemContext.Provider>
  );
};

export const useSystem = () => useContext(SystemContext);
