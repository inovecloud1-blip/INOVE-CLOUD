import React, { useState, useRef } from 'react';
import {
  Globe,
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Home,
  Lock,
  Plus,
  X,
  Star,
  ExternalLink,
  Search,
  ShieldCheck,
  Code,
  Sliders,
  Terminal,
  Server,
  Zap,
  Check,
  Bookmark
} from 'lucide-react';

interface BrowserTab {
  id: string;
  title: string;
  url: string;
  favicon: string;
  isLoading: boolean;
}

interface QuickBookmark {
  name: string;
  url: string;
  icon: string;
  category: 'Local' | 'Cluster' | 'Web';
}

export const BrowserApp: React.FC = () => {
  const defaultBookmarks: QuickBookmark[] = [
    { name: 'Cluster Dashboard', url: 'http://192.168.1.100:8080', icon: '☁️', category: 'Local' },
    { name: 'Portainer Docker', url: 'http://192.168.1.100:9000', icon: '🐳', category: 'Local' },
    { name: 'Grafana Metrics', url: 'http://192.168.1.100:3001', icon: '📊', category: 'Cluster' },
    { name: 'API Health Check', url: '/api/health', icon: '⚡', category: 'Local' },
    { name: 'ChatGPT / OpenAI', url: 'https://chatgpt.com', icon: '🤖', category: 'Web' },
    { name: 'GitHub Repos', url: 'https://github.com', icon: '🐙', category: 'Web' },
    { name: 'Wikipedia Livre', url: 'https://pt.wikipedia.org', icon: '📚', category: 'Web' },
  ];

  const [tabs, setTabs] = useState<BrowserTab[]>([
    {
      id: 'tab-1',
      title: 'InoveCloud Local Hub',
      url: 'http://192.168.1.100:8080',
      favicon: '☁️',
      isLoading: false,
    },
    {
      id: 'tab-2',
      title: 'Portainer CE (Docker)',
      url: 'http://192.168.1.100:9000',
      favicon: '🐳',
      isLoading: false,
    },
  ]);

  const [activeTabId, setActiveTabId] = useState<string>('tab-1');
  const [urlInput, setUrlInput] = useState('http://192.168.1.100:8080');
  const [showDevTools, setShowDevTools] = useState(false);
  const [devToolsTab, setDevToolsTab] = useState<'console' | 'network' | 'headers'>('headers');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleNavigate = (targetUrl: string) => {
    let finalUrl = targetUrl.trim();
    if (!finalUrl) return;

    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://') && !finalUrl.startsWith('/')) {
      if (finalUrl.includes('.') && !finalUrl.includes(' ')) {
        finalUrl = 'https://' + finalUrl;
      } else {
        // Search query
        finalUrl = `https://www.google.com/search?q=${encodeURIComponent(finalUrl)}`;
      }
    }

    setUrlInput(finalUrl);

    setTabs((prev) =>
      prev.map((tab) => {
        if (tab.id === activeTabId) {
          let title = 'Navegação';
          let favicon = '🌐';

          if (finalUrl.includes('192.168') || finalUrl.includes('localhost') || finalUrl.startsWith('/')) {
            title = 'Serviço Local InoveCloud';
            favicon = '🏠';
          } else if (finalUrl.includes('github')) {
            title = 'GitHub Repositories';
            favicon = '🐙';
          } else if (finalUrl.includes('chatgpt')) {
            title = 'ChatGPT AI';
            favicon = '🤖';
          } else if (finalUrl.includes('google')) {
            title = 'Google Search';
            favicon = '🔍';
          } else {
            try {
              title = new URL(finalUrl).hostname;
            } catch (e) {
              title = finalUrl;
            }
          }

          return { ...tab, url: finalUrl, title, favicon, isLoading: true };
        }
        return tab;
      })
    );

    setTimeout(() => {
      setTabs((prev) =>
        prev.map((t) => (t.id === activeTabId ? { ...t, isLoading: false } : t))
      );
    }, 600);
  };

  const handleNewTab = () => {
    const newId = `tab-${Date.now()}`;
    const newTab: BrowserTab = {
      id: newId,
      title: 'Nova Aba',
      url: 'about:blank',
      favicon: '⚡',
      isLoading: false,
    };
    setTabs([...tabs, newTab]);
    setActiveTabId(newId);
    setUrlInput('');
  };

  const handleCloseTab = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (tabs.length === 1) return; // Keep at least one tab
    const nextTabs = tabs.filter((t) => t.id !== id);
    setTabs(nextTabs);
    if (activeTabId === id) {
      setActiveTabId(nextTabs[0].id);
      setUrlInput(nextTabs[0].url);
    }
  };

  const isLocalUrl = activeTab?.url.includes('192.168') || activeTab?.url.includes('localhost') || activeTab?.url.startsWith('/');

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 select-none overflow-hidden">
      {/* Top Tab Bar (macOS / Chrome style) */}
      <div className="pt-2 px-2 bg-slate-900/90 border-b border-white/10 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTabId;
            return (
              <div
                key={tab.id}
                onClick={() => {
                  setActiveTabId(tab.id);
                  setUrlInput(tab.url === 'about:blank' ? '' : tab.url);
                }}
                className={`group relative flex items-center space-x-2 px-3.5 py-1.5 rounded-t-xl text-xs font-medium cursor-pointer transition max-w-[200px] border-t border-x ${
                  isActive
                    ? 'bg-slate-950 text-white border-white/20 shadow-md'
                    : 'bg-white/5 text-slate-400 hover:bg-white/10 border-transparent hover:text-white'
                }`}
              >
                <span>{tab.favicon}</span>
                <span className="truncate max-w-[120px]">{tab.title}</span>

                {tabs.length > 1 && (
                  <button
                    onClick={(e) => handleCloseTab(tab.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-0.5 rounded-full hover:bg-white/20 text-slate-400 hover:text-white transition"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}

          {/* New Tab Button */}
          <button
            onClick={handleNewTab}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
            title="Abrir Nova Aba"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* DevTools Toggle Button */}
        <button
          onClick={() => setShowDevTools(!showDevTools)}
          className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[11px] font-bold border transition cursor-pointer ${
            showDevTools
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
              : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
          }`}
          title="Ferramentas do Desenvolvedor (DevTools / Inspecionar)"
        >
          <Code className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">DevTools</span>
        </button>
      </div>

      {/* Navigation Toolbar (Back, Forward, Refresh, URL Bar, Security) */}
      <div className="p-2.5 bg-slate-900 border-b border-white/10 flex items-center space-x-2 shrink-0">
        <div className="flex items-center space-x-1 text-slate-400">
          <button
            onClick={() => triggerToast('Voltar na navegação')}
            className="p-1 rounded-lg hover:bg-white/10 hover:text-white transition cursor-pointer"
            title="Voltar"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => triggerToast('Avançar')}
            className="p-1 rounded-lg hover:bg-white/10 hover:text-white transition cursor-pointer"
            title="Avançar"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleNavigate(urlInput)}
            className="p-1 rounded-lg hover:bg-white/10 hover:text-white transition cursor-pointer"
            title="Recarregar Página"
          >
            <RotateCw className={`w-4 h-4 ${activeTab?.isLoading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
          <button
            onClick={() => handleNavigate('http://192.168.1.100:8080')}
            className="p-1 rounded-lg hover:bg-white/10 hover:text-white transition cursor-pointer"
            title="Página Inicial Local"
          >
            <Home className="w-4 h-4" />
          </button>
        </div>

        {/* Address Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleNavigate(urlInput);
          }}
          className="flex-1 flex items-center bg-slate-950 border border-white/15 rounded-xl px-3 py-1.5 text-xs text-white focus-within:border-cyan-500 transition shadow-inner"
        >
          <div className="flex items-center space-x-1.5 text-slate-400 mr-2 shrink-0">
            {isLocalUrl ? (
              <span className="flex items-center space-x-1 text-cyan-400 font-mono text-[11px] font-bold">
                <Server className="w-3.5 h-3.5" />
                <span>LAN</span>
              </span>
            ) : (
              <span className="flex items-center space-x-1 text-emerald-400">
                <Lock className="w-3.5 h-3.5" />
              </span>
            )}
          </div>

          <input
            type="text"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="Digite uma URL local, IP ou pesquise na web..."
            className="w-full bg-transparent text-white placeholder-slate-500 focus:outline-none font-mono text-xs"
          />

          {urlInput && (
            <button
              type="button"
              onClick={() => setUrlInput('')}
              className="p-0.5 text-slate-500 hover:text-white mr-1"
            >
              <X className="w-3 h-3" />
            </button>
          )}

          <button
            type="submit"
            className="p-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white transition cursor-pointer"
          >
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <button
          onClick={() => triggerToast('Página adicionada aos favoritos!')}
          className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-yellow-400 transition"
          title="Favoritar Página"
        >
          <Star className="w-4 h-4" />
        </button>
      </div>

      {/* Bookmarks Bar */}
      <div className="px-3 py-1 bg-slate-900/60 border-b border-white/5 flex items-center space-x-2 text-[11px] overflow-x-auto no-scrollbar shrink-0">
        <span className="text-slate-500 flex items-center space-x-1">
          <Bookmark className="w-3 h-3" />
          <span>Favoritos:</span>
        </span>

        {defaultBookmarks.map((bm, i) => (
          <button
            key={i}
            onClick={() => handleNavigate(bm.url)}
            className="flex items-center space-x-1 px-2 py-0.5 rounded-md hover:bg-white/10 text-slate-300 hover:text-white transition cursor-pointer whitespace-nowrap"
          >
            <span>{bm.icon}</span>
            <span>{bm.name}</span>
          </button>
        ))}
      </div>

      {/* Main Viewport */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Web Content Render Area */}
        <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden relative">
          {activeTab?.isLoading && (
            <div className="absolute top-0 left-0 right-0 h-1 bg-cyan-500 animate-pulse z-20" />
          )}

          {/* If about:blank or empty, show Speed Dial Home */}
          {(!activeTab?.url || activeTab.url === 'about:blank') ? (
            <div className="flex-1 overflow-y-auto p-8 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center shadow-xl shadow-cyan-500/20 mb-4">
                <Globe className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white mb-1">
                InoveCloud Local Web Browser
              </h2>
              <p className="text-xs text-slate-400 max-w-md mb-6">
                Navegue com velocidade em servidores locais, dashboards de infraestrutura e serviços na nuvem com isolamento seguro.
              </p>

              {/* Speed dial grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-xl w-full">
                {defaultBookmarks.map((bm, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleNavigate(bm.url)}
                    className="p-3.5 rounded-2xl liquid-glass-card border border-white/10 hover:border-cyan-400/40 cursor-pointer transition text-center group flex flex-col items-center space-y-2 hover:-translate-y-1"
                  >
                    <span className="text-2xl">{bm.icon}</span>
                    <span className="text-xs font-semibold text-white group-hover:text-cyan-300 transition">
                      {bm.name}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono truncate max-w-full">
                      {bm.url}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : isLocalUrl ? (
            /* Local Server Simulation Panel */
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="liquid-glass-card rounded-3xl p-6 border border-white/15 shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300">
                      <Server className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-sm font-bold text-white">
                          Serviço Local & Dashboard InoveCloud
                        </h3>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          200 OK
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">
                        {activeTab.url}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleNavigate(activeTab.url)}
                      className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition cursor-pointer"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      <span>Atualizar</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-black/40 rounded-xl">
                    <span className="text-slate-400">Latência Local</span>
                    <div className="font-mono font-bold text-emerald-400 text-sm mt-1">1.2 ms (Loopback)</div>
                  </div>
                  <div className="p-3 bg-black/40 rounded-xl">
                    <span className="text-slate-400">Servidor Web</span>
                    <div className="font-mono font-bold text-white text-sm mt-1">Nginx 1.25 / Node 22</div>
                  </div>
                  <div className="p-3 bg-black/40 rounded-xl">
                    <span className="text-slate-400">Segurança de Rede</span>
                    <div className="font-mono font-bold text-cyan-300 text-sm mt-1">Rede Privada Isolada</div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-black/60 border border-white/10 font-mono text-xs text-slate-300 space-y-2">
                  <div className="text-cyan-400 font-bold">// Resposta HTTP do Gateway Local</div>
                  <div>HTTP/1.1 200 OK</div>
                  <div>Content-Type: application/json; charset=utf-8</div>
                  <div>Server: InoveCloud Edge Gateway v2.5</div>
                  <div>Access-Control-Allow-Origin: *</div>
                  <div className="pt-2 text-emerald-400">
                    {`{"status": "online", "cluster": "inovecloud-sa-east", "active_vns": 5, "gateway": "192.168.1.1"}`}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Embedded Live Webframe */
            <div className="flex-1 flex flex-col relative">
              <iframe
                src={activeTab.url}
                title={activeTab.title}
                className="w-full h-full border-0 bg-white"
                sandbox="allow-scripts allow-same-origin allow-forms"
              />
              <div className="p-2 bg-slate-900/95 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
                <span className="truncate">Exibindo: <strong className="text-white">{activeTab.url}</strong></span>
                <a
                  href={activeTab.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 text-cyan-400 hover:underline font-semibold"
                >
                  <span>Abrir em aba externa</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* DevTools Drawer (Right Side) */}
        {showDevTools && (
          <div className="w-80 border-l border-white/10 bg-slate-900 flex flex-col text-xs shrink-0 animate-fade-in">
            <div className="p-3 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center space-x-2 text-white font-bold">
                <Code className="w-4 h-4 text-cyan-400" />
                <span>DevTools & Inspetor</span>
              </div>
              <button
                onClick={() => setShowDevTools(false)}
                className="p-1 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* DevTools Tabs */}
            <div className="flex border-b border-white/10 bg-black/30">
              <button
                onClick={() => setDevToolsTab('headers')}
                className={`flex-1 py-1.5 text-center font-semibold transition ${
                  devToolsTab === 'headers' ? 'text-cyan-400 border-b-2 border-cyan-400 bg-white/5' : 'text-slate-400 hover:text-white'
                }`}
              >
                Headers
              </button>
              <button
                onClick={() => setDevToolsTab('network')}
                className={`flex-1 py-1.5 text-center font-semibold transition ${
                  devToolsTab === 'network' ? 'text-cyan-400 border-b-2 border-cyan-400 bg-white/5' : 'text-slate-400 hover:text-white'
                }`}
              >
                Network
              </button>
              <button
                onClick={() => setDevToolsTab('console')}
                className={`flex-1 py-1.5 text-center font-semibold transition ${
                  devToolsTab === 'console' ? 'text-cyan-400 border-b-2 border-cyan-400 bg-white/5' : 'text-slate-400 hover:text-white'
                }`}
              >
                Console
              </button>
            </div>

            <div className="flex-1 p-3 overflow-y-auto font-mono text-[11px] space-y-2">
              {devToolsTab === 'headers' && (
                <div className="space-y-2 text-slate-300">
                  <div className="text-cyan-300 font-bold">General:</div>
                  <div>Request URL: {activeTab?.url}</div>
                  <div>Request Method: GET</div>
                  <div>Status Code: 200 OK</div>
                  <div className="pt-2 text-cyan-300 font-bold">Response Headers:</div>
                  <div>content-type: text/html; charset=UTF-8</div>
                  <div>cache-control: no-cache</div>
                  <div>x-frame-options: SAMEORIGIN</div>
                  <div>x-inovecloud-proxy: true</div>
                </div>
              )}

              {devToolsTab === 'network' && (
                <div className="space-y-1.5">
                  {[
                    { name: 'document.html', status: '200', time: '14ms', size: '4.2 KB' },
                    { name: 'bundle.js', status: '200', time: '28ms', size: '142 KB' },
                    { name: 'styles.css', status: '200', time: '9ms', size: '18 KB' },
                    { name: 'favicon.ico', status: '200', time: '5ms', size: '1.2 KB' },
                  ].map((req, i) => (
                    <div key={i} className="flex items-center justify-between p-1.5 bg-black/40 rounded-lg text-[10px]">
                      <span className="text-white truncate max-w-[100px]">{req.name}</span>
                      <span className="text-emerald-400">{req.status}</span>
                      <span className="text-slate-400">{req.time}</span>
                      <span className="text-slate-400">{req.size}</span>
                    </div>
                  ))}
                </div>
              )}

              {devToolsTab === 'console' && (
                <div className="space-y-1 text-slate-300">
                  <div className="text-slate-500">// InoveCloud Browser v1.0 DevConsole</div>
                  <div className="text-emerald-400">[info] Sandbox environment initialized.</div>
                  <div className="text-cyan-400">[log] Navigation to {activeTab?.url} completed.</div>
                  <div className="text-amber-400">[warn] Mixed-content policy enforced.</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Toast notification */}
      {toastMsg && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-slate-900/95 text-white border border-white/20 rounded-xl text-xs font-semibold shadow-2xl flex items-center space-x-2 animate-fade-in z-50">
          <Check className="w-3.5 h-3.5 text-cyan-400" />
          <span>{toastMsg}</span>
        </div>
      )}
    </div>
  );
};
