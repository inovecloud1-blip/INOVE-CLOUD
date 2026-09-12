import React, { useState } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  CheckCircle2,
  Server,
  Layers,
  ShieldCheck,
  Terminal
} from 'lucide-react';

interface Message {
  sender: 'user' | 'agent';
  text: string;
  actionTaken?: string;
  timestamp: string;
}

interface AiAgentAppProps {
  onInstallApp: (name: string) => void;
  onCreateVnAction: () => void;
  onEnableHttpsAction: () => void;
}

export const AiAgentApp: React.FC<AiAgentAppProps> = ({
  onInstallApp,
  onCreateVnAction,
  onEnableHttpsAction,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'agent',
      text: 'Olá! Sou o InoveCloud AI Agent com protocolo MCP (Model Context Protocol). Posso instalar apps no cluster, gerenciar VNs (máquinas virtuais), monitorar métricas e configurar domínios HTTPS para você.',
      timestamp: '12:00',
    },
    {
      sender: 'user',
      text: 'Você pode verificar a integridade do cluster e os nós ativos?',
      timestamp: '12:01',
    },
    {
      sender: 'agent',
      text: 'Feito! Verifiquei 5 Nós Virtuais (4 em execução, 1 parado). O uso de vCPU está em 28%, a memória em 64% e todos os certificados Let\'s Encrypt estão válidos.',
      actionTaken: 'Status do cluster auditado com sucesso.',
      timestamp: '12:01',
    },
  ]);

  const [input, setInput] = useState('');

  const handleSend = (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query) return;

    const time = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const userMsg: Message = { sender: 'user', text: query, timestamp: time };

    const lower = query.toLowerCase();
    let replyText = 'Entendido! Analisei o comando e executei a operação necessária no InoveCloud OS.';
    let action: string | undefined = undefined;

    if (lower.includes('plex') || lower.includes('instalar plex')) {
      replyText = 'Pronto! O contêiner do Plex Media Server foi implantado via Docker com aceleração de hardware GPU ativada na porta :32400.';
      action = 'Instalação do Plex Media Server concluída.';
      onInstallApp('app-plex');
    } else if (lower.includes('redis') || lower.includes('instalar redis')) {
      replyText = 'Concluído! Redis Stack Server instalado com persistência AOF e RedisInsight na porta :6379.';
      action = 'Redis Stack provisionado.';
      onInstallApp('app-redis');
    } else if (lower.includes('vn') || lower.includes('máquina') || lower.includes('criar')) {
      replyText = 'Iniciei o provisionamento de um novo nó virtual Ubuntu 24.04 LTS com 4 vCPUs e 8GB de RAM.';
      action = 'Nova VN provisionada.';
      onCreateVnAction();
    } else if (lower.includes('https') || lower.includes('ssl')) {
      replyText = 'Certificados SSL Let\'s Encrypt wildcard renovados e forçados com HTTP/2 e HTTP/3 (QUIC) em todas as rotas.';
      action = 'HTTPS wildcard revalidado.';
      onEnableHttpsAction();
    } else {
      replyText = `Compreendi a solicitação: "${query}". O subsistema InoveCloud OS MCP processou a instrução com sucesso.`;
    }

    const agentMsg: Message = {
      sender: 'agent',
      text: replyText,
      actionTaken: action,
      timestamp: time,
    };

    setMessages((prev) => [...prev, userMsg, agentMsg]);
    setInput('');
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100">
      {/* Top Banner (Umbrel 2.0 AI MCP Inspired) */}
      <div className="p-4 bg-gradient-to-r from-fuchsia-950/50 via-purple-950/40 to-slate-900 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-fuchsia-600 to-indigo-600 p-2 flex items-center justify-center shadow-lg shadow-fuchsia-600/30">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-sm font-bold text-white">InoveCloud AI Cloud Agent</h2>
              <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30">
                MCP Protocol
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Gerencie todo o seu sistema InoveCloud conversando em linguagem natural.
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center space-x-1 text-emerald-400 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>Modelo Autônomo Ativo</span>
        </div>
      </div>

      {/* Suggested Quick Prompts */}
      <div className="px-4 py-2 bg-slate-900/40 border-b border-white/5 flex items-center space-x-2 overflow-x-auto text-[11px]">
        <span className="text-slate-400 font-semibold shrink-0">Sugestões:</span>
        {[
          'Can you install Plex?',
          'Instalar Redis Stack',
          'Criar uma nova VN Ubuntu',
          'Ativar HTTPS em todos os Web Apps',
        ].map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSend(prompt)}
            className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 whitespace-nowrap transition cursor-pointer"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex flex-col ${
              msg.sender === 'user' ? 'items-end' : 'items-start'
            }`}
          >
            <div
              className={`max-w-xl p-3.5 rounded-2xl text-xs leading-relaxed shadow-md ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-slate-900/90 text-slate-200 border border-white/10 rounded-bl-none'
              }`}
            >
              <div className="flex items-center space-x-1.5 mb-1 opacity-75 text-[10px]">
                {msg.sender === 'agent' ? (
                  <>
                    <Sparkles className="w-3 h-3 text-fuchsia-400" />
                    <span className="font-bold text-fuchsia-300">InoveCloud AI</span>
                  </>
                ) : (
                  <span className="font-bold">Você (DevOps)</span>
                )}
                <span>• {msg.timestamp}</span>
              </div>

              <p>{msg.text}</p>

              {msg.actionTaken && (
                <div className="mt-2.5 p-2 bg-black/40 rounded-lg border border-emerald-500/30 flex items-center space-x-2 text-emerald-300 text-[11px] font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{msg.actionTaken}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Input Field */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 border-t border-white/10 bg-slate-900/60 flex items-center space-x-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Peça para o agente instalar um app, reiniciar uma VN, verificar métricas..."
          className="flex-1 px-3.5 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-fuchsia-500"
        />
        <button
          type="submit"
          className="p-2.5 rounded-xl bg-gradient-to-r from-fuchsia-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 text-white shadow-md shadow-fuchsia-600/30 transition cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
