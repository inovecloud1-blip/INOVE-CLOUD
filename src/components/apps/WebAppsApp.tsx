import React, { useState } from 'react';
import {
  Globe,
  ShieldCheck,
  ShieldAlert,
  Plus,
  ExternalLink,
  RotateCw,
  GitBranch,
  Terminal,
  Layers,
  CheckCircle2,
  Lock,
  Zap,
  Activity
} from 'lucide-react';
import { WebApp } from '../../types';

interface WebAppsAppProps {
  webApps: WebApp[];
  onToggleHttps: (id: string) => void;
  onDeployWebApp: (newApp: Omit<WebApp, 'id' | 'requestsPerMin' | 'latencyMs' | 'lastDeployed'>) => void;
}

export const WebAppsApp: React.FC<WebAppsAppProps> = ({
  webApps,
  onToggleHttps,
  onDeployWebApp,
}) => {
  const [selectedAppId, setSelectedAppId] = useState<string>(webApps[0]?.id || '');
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [browserPreviewUrl, setBrowserPreviewUrl] = useState<string | null>(null);

  // New App Form State
  const [appName, setAppName] = useState('');
  const [appDomain, setAppDomain] = useState('');
  const [appPort, setAppPort] = useState(3000);
  const [appFramework, setAppFramework] = useState<WebApp['framework']>('Next.js');
  const [appRepo, setAppRepo] = useState('');
  const [appHttps, setAppHttps] = useState(true);

  const selectedApp = webApps.find((a) => a.id === selectedAppId) || webApps[0];

  const handleDeploySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!appName || !appDomain) return;

    onDeployWebApp({
      name: appName,
      domain: appDomain,
      internalPort: appPort,
      status: 'online',
      framework: appFramework,
      httpsEnabled: appHttps,
      sslExpiryDays: 90,
      gitRepo: appRepo || 'github.com/inovecloud/custom-app',
    });

    setAppName('');
    setAppDomain('');
    setShowDeployModal(false);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100">
      {/* Top Umbrel 2.0 Style Header with HTTPS ON Highlight */}
      <div className="p-4 bg-gradient-to-r from-slate-900 via-sky-950/40 to-slate-900 border-b border-white/10 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-sky-500/20 border border-sky-400/30 flex items-center justify-center">
              <Globe className="w-4 h-4 text-sky-400" />
            </div>
            <h2 className="text-base font-bold text-white tracking-wide">
              Aplicações Web & Edge Gateway
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Nginx & Traefik Reverse Proxy
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Gerenciador de microserviços, roteamento de domínios e certificados SSL automatizados.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Big Umbrel-Style HTTPS ON Toggle */}
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-emerald-500/40 shadow-sm">
            <div className="flex items-center space-x-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold text-white tracking-wider">https</span>
              <span className="px-1.5 py-0.2 rounded bg-emerald-500 text-slate-950 font-black text-[10px]">
                ON
              </span>
            </div>
            <span className="text-[10px] text-slate-400 pl-1 border-l border-white/10">
              Let's Encrypt Wildcard
            </span>
          </div>

          <button
            onClick={() => setShowDeployModal(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-lg shadow-sky-600/30 transition active:scale-95 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Implantar Web App</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left List of Apps */}
        <div className="w-full md:w-80 border-r border-white/10 flex flex-col bg-slate-900/40">
          <div className="p-3 border-b border-white/10 text-xs font-bold text-slate-300 flex items-center justify-between">
            <span>Aplicações Ativas ({webApps.length})</span>
            <span className="text-[11px] text-emerald-400">100% Saudáveis</span>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {webApps.map((app) => {
              const isSelected = app.id === selectedApp?.id;

              return (
                <div
                  key={app.id}
                  onClick={() => setSelectedAppId(app.id)}
                  className={`p-3 rounded-xl border transition cursor-pointer ${
                    isSelected
                      ? 'bg-sky-600/15 border-sky-500/50 shadow-md'
                      : 'bg-slate-900/50 border-white/5 hover:bg-white/5 hover:border-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 truncate">
                      <div className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span className="font-semibold text-xs text-white truncate">
                        {app.name}
                      </span>
                    </div>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-white/10 text-slate-300">
                      {app.framework}
                    </span>
                  </div>

                  <div className="mt-1.5 text-[11px] text-sky-400 font-mono truncate flex items-center space-x-1">
                    {app.httpsEnabled ? <Lock className="w-2.5 h-2.5 text-emerald-400" /> : null}
                    <span>{app.domain}</span>
                  </div>

                  <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                    <span>Porta :{app.internalPort}</span>
                    <span className="text-emerald-400">{app.requestsPerMin} req/m</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Details Panel */}
        {selectedApp ? (
          <div className="flex-1 flex flex-col overflow-y-auto bg-slate-950 p-5 space-y-5">
            {/* App Card Header */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-white/10 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-bold text-white">{selectedApp.name}</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Online
                  </span>
                </div>
                <div className="text-xs text-slate-400 mt-1 flex items-center space-x-2">
                  <GitBranch className="w-3.5 h-3.5 text-slate-500" />
                  <span className="font-mono text-slate-300">{selectedApp.gitRepo}</span>
                  <span>•</span>
                  <span>Último deploy: {selectedApp.lastDeployed}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onToggleHttps(selectedApp.id)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                    selectedApp.httpsEnabled
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30'
                      : 'bg-amber-500/20 border-amber-500/40 text-amber-300 hover:bg-amber-500/30'
                  }`}
                  title="Alternar SSL Automático"
                >
                  {selectedApp.httpsEnabled ? (
                    <>
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>HTTPS Ativo</span>
                    </>
                  ) : (
                    <>
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                      <span>Ativar HTTPS</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => setBrowserPreviewUrl(selectedApp.domain)}
                  className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-md transition cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Testar Rota</span>
                </button>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 bg-slate-900/60 rounded-xl border border-white/10">
                <div className="text-[11px] text-slate-400 flex items-center space-x-1">
                  <Activity className="w-3.5 h-3.5 text-sky-400" />
                  <span>Tráfego ao Vivo</span>
                </div>
                <div className="text-xl font-bold text-white mt-1">
                  {selectedApp.requestsPerMin}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">requisições/min</div>
              </div>

              <div className="p-3.5 bg-slate-900/60 rounded-xl border border-white/10">
                <div className="text-[11px] text-slate-400 flex items-center space-x-1">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Latência Média</span>
                </div>
                <div className="text-xl font-bold text-emerald-400 mt-1">
                  {selectedApp.latencyMs} ms
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Tempo de Resposta P95</div>
              </div>

              <div className="p-3.5 bg-slate-900/60 rounded-xl border border-white/10">
                <div className="text-[11px] text-slate-400 flex items-center space-x-1">
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Certificado TLS</span>
                </div>
                <div className="text-xl font-bold text-white mt-1">
                  {selectedApp.httpsEnabled ? `${selectedApp.sslExpiryDays}d` : 'Inativo'}
                </div>
                <div className="text-[10px] text-emerald-400 mt-0.5">Renovação Auto Let's Encrypt</div>
              </div>

              <div className="p-3.5 bg-slate-900/60 rounded-xl border border-white/10">
                <div className="text-[11px] text-slate-400 flex items-center space-x-1">
                  <Layers className="w-3.5 h-3.5 text-purple-400" />
                  <span>Porta Contêiner</span>
                </div>
                <div className="text-xl font-bold font-mono text-cyan-400 mt-1">
                  :{selectedApp.internalPort}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Roteado via Reverse Proxy</div>
              </div>
            </div>

            {/* InoveCloud Cloudflare/Nginx Edge Rules */}
            <div className="p-4 bg-slate-900/40 rounded-xl border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Configurações de DNS & Roteamento
                </h4>
                <span className="text-[11px] text-slate-400">DNS Propagado</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-2.5 bg-black/40 rounded-lg flex items-center justify-between font-mono">
                  <span className="text-slate-400">Registro CNAME</span>
                  <span className="text-slate-200">{selectedApp.domain} ➜ edge.inovecloud.io</span>
                </div>
                <div className="p-2.5 bg-black/40 rounded-lg flex items-center justify-between font-mono">
                  <span className="text-slate-400">Compressão</span>
                  <span className="text-emerald-400">Brotli + Gzip (Ativado)</span>
                </div>
                <div className="p-2.5 bg-black/40 rounded-lg flex items-center justify-between font-mono">
                  <span className="text-slate-400">WAF & Anti-DDoS</span>
                  <span className="text-emerald-400">Proteção Ativa L7</span>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Modal: Deploy Novo Web App */}
      {showDeployModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/15 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center space-x-2">
                <Globe className="w-5 h-5 text-sky-400" />
                <h3 className="font-bold text-sm text-white">Implantar Nova Aplicação Web</h3>
              </div>
              <button
                onClick={() => setShowDeployModal(false)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleDeploySubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-medium">Nome da Aplicação</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Meu SaaS ou API de Pagamento"
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-lg text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Domínio / Subdomínio</label>
                <input
                  type="text"
                  required
                  placeholder="app.seudominio.com ou nomedaapp.inovecloud.io"
                  value={appDomain}
                  onChange={(e) => setAppDomain(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-lg text-white focus:outline-none focus:border-sky-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Stack / Framework</label>
                  <select
                    value={appFramework}
                    onChange={(e) => setAppFramework(e.target.value as any)}
                    className="w-full px-2 py-1.5 bg-slate-950 border border-white/10 rounded text-white"
                  >
                    <option value="Next.js">Next.js</option>
                    <option value="Node.js">Node.js</option>
                    <option value="Python">Python / FastAPI</option>
                    <option value="Go">Go / Gin</option>
                    <option value="Docker">Docker Container</option>
                    <option value="Static">Static SPA / React</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Porta do Contêiner</label>
                  <input
                    type="number"
                    value={appPort}
                    onChange={(e) => setAppPort(Number(e.target.value))}
                    className="w-full px-2 py-1.5 bg-slate-950 border border-white/10 rounded text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Repositório Git (Opcional)</label>
                <input
                  type="text"
                  placeholder="github.com/usuario/repositorio"
                  value={appRepo}
                  onChange={(e) => setAppRepo(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-lg text-white focus:outline-none focus:border-sky-500 font-mono"
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="httpsAuto"
                  checked={appHttps}
                  onChange={(e) => setAppHttps(e.target.checked)}
                  className="rounded bg-slate-950 border-white/20 text-sky-600 focus:ring-0"
                />
                <label htmlFor="httpsAuto" className="text-slate-300 cursor-pointer flex items-center space-x-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Emitir Certificado SSL HTTPS Grátis (Let's Encrypt)</span>
                </label>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowDeployModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold shadow-lg shadow-sky-600/30 cursor-pointer"
                >
                  Implantar no Cluster
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Simulated Browser Preview Modal */}
      {browserPreviewUrl && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/20 rounded-2xl w-full max-w-3xl h-[480px] shadow-2xl flex flex-col overflow-hidden">
            {/* Browser top address bar */}
            <div className="h-10 bg-slate-800 border-b border-white/10 flex items-center justify-between px-3">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setBrowserPreviewUrl(null)}
                  className="w-3 h-3 rounded-full bg-red-500 cursor-pointer"
                />
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
              </div>

              <div className="flex-1 max-w-md mx-4 px-3 py-1 bg-slate-950/80 rounded-lg border border-white/10 flex items-center space-x-2 text-xs text-slate-300 font-mono">
                <Lock className="w-3 h-3 text-emerald-400" />
                <span>https://{browserPreviewUrl}</span>
              </div>

              <button
                onClick={() => setBrowserPreviewUrl(null)}
                className="text-xs text-slate-400 hover:text-white cursor-pointer"
              >
                Fechar
              </button>
            </div>

            {/* Browser Content */}
            <div className="flex-1 bg-slate-950 p-8 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
                <Globe className="w-8 h-8 text-white" />
              </div>
              <div className="space-y-1 max-w-md">
                <h4 className="text-base font-bold text-white">
                  Aplicação Online no InoveCloud Edge!
                </h4>
                <p className="text-xs text-slate-400">
                  Roteada com sucesso com certificado SSL válido de 2048-bit e balanceamento de carga automático via InoveCloud OS.
                </p>
              </div>
              <div className="p-3 bg-slate-900 rounded-xl border border-white/10 font-mono text-xs text-emerald-400 flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>HTTP 200 OK • InoveCloud-Proxy/2.4 (SSL Verified)</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
