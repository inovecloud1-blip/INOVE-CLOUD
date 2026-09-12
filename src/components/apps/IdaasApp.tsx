import React, { useState } from 'react';
import {
  Users,
  Shield,
  Key,
  UserPlus,
  Lock,
  CheckCircle,
  AlertTriangle,
  FileText,
  Clock,
  ExternalLink,
  Smartphone,
  Server
} from 'lucide-react';
import { IdaasUser, IdaasSsoProvider } from '../../types';

interface IdaasAppProps {
  users: IdaasUser[];
  ssoProviders: IdaasSsoProvider[];
  onToggleSso: (id: string) => void;
  onAddUser: (user: Omit<IdaasUser, 'id' | 'lastLogin'>) => void;
  onToggleUserMfa: (id: string) => void;
}

export const IdaasApp: React.FC<IdaasAppProps> = ({
  users,
  ssoProviders,
  onToggleSso,
  onAddUser,
  onToggleUserMfa,
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'sso' | 'security' | 'audit'>('users');
  const [showAddUserModal, setShowAddUserModal] = useState(false);

  // Form State
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<IdaasUser['role']>('DevOps Engineer');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail) return;

    onAddUser({
      name: newName,
      email: newEmail,
      role: newRole,
      avatar: `https://images.unsplash.com/photo-${1535713875002 + Math.floor(Math.random() * 1000)}?w=150&auto=format&fit=crop&q=80`,
      status: 'active',
      mfaEnabled: true,
      assignedVns: ['vn-ubuntu-prod'],
    });

    setNewName('');
    setNewEmail('');
    setShowAddUserModal(false);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100">
      {/* Top Banner (Umbrel 2.0 Multiple Accounts Inspired) */}
      <div className="p-4 bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900 border-b border-white/10 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center">
              <Users className="w-4 h-4 text-emerald-400" />
            </div>
            <h2 className="text-base font-bold text-white tracking-wide">
              InoveCloud IDaaS — Identidade & Contas
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Múltiplas Contas & SSO Ativo
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Gerenciamento centralizado de identidades, controle de acesso baseado em funções (RBAC) e Single Sign-On corporativo.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowAddUserModal(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/30 transition active:scale-95 cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Adicionar Usuário</span>
          </button>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="px-5 border-b border-white/10 flex space-x-6 text-xs font-semibold text-slate-400 bg-slate-900/30">
        <button
          onClick={() => setActiveTab('users')}
          className={`py-3 border-b-2 transition cursor-pointer flex items-center space-x-1.5 ${
            activeTab === 'users' ? 'border-emerald-500 text-white' : 'border-transparent hover:text-slate-200'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Usuários & Equipes ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('sso')}
          className={`py-3 border-b-2 transition cursor-pointer flex items-center space-x-1.5 ${
            activeTab === 'sso' ? 'border-emerald-500 text-white' : 'border-transparent hover:text-slate-200'
          }`}
        >
          <Key className="w-3.5 h-3.5" />
          <span>Provedores SSO & SAML</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`py-3 border-b-2 transition cursor-pointer flex items-center space-x-1.5 ${
            activeTab === 'security' ? 'border-emerald-500 text-white' : 'border-transparent hover:text-slate-200'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Políticas de MFA & Segurança</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`py-3 border-b-2 transition cursor-pointer flex items-center space-x-1.5 ${
            activeTab === 'audit' ? 'border-emerald-500 text-white' : 'border-transparent hover:text-slate-200'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Trilha de Auditoria</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-5 bg-slate-950">
        {/* USERS TAB */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 hover:border-white/20 transition flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-11 h-11 rounded-full object-cover border-2 border-emerald-500/50"
                        onError={(e) => {
                          // Fallback if image fails to load
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      <div>
                        <div className="font-bold text-xs text-white flex items-center space-x-1.5">
                          <span>{user.name}</span>
                          {user.role === 'SuperAdmin' && (
                            <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[9px] font-semibold border border-amber-500/30">
                              Admin
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400">{user.email}</div>
                        <div className="text-[10px] text-emerald-400 font-medium mt-0.5">
                          Função: {user.role}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => onToggleUserMfa(user.id)}
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold flex items-center space-x-1 cursor-pointer transition ${
                        user.mfaEnabled
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                      title="Clique para alternar status do MFA"
                    >
                      <Smartphone className="w-3 h-3" />
                      <span>{user.mfaEnabled ? 'MFA Ativo' : 'Sem MFA'}</span>
                    </button>
                  </div>

                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                    <div className="flex items-center space-x-1">
                      <Server className="w-3 h-3 text-slate-500" />
                      <span>VNs com acesso: {user.assignedVns.length} nós</span>
                    </div>
                    <div>Último login: {user.lastLogin}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SSO PROVIDERS TAB */}
        {activeTab === 'sso' && (
          <div className="space-y-4">
            <p className="text-xs text-slate-400">
              Habilite provedores corporativos para que colaboradores façam login via Single Sign-On (SSO) com suas credenciais organizacionais.
            </p>

            <div className="space-y-3">
              {ssoProviders.map((provider) => (
                <div
                  key={provider.id}
                  className="p-4 rounded-xl bg-slate-900/60 border border-white/10 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-bold text-xs text-white">
                      {provider.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center space-x-2">
                        <span>{provider.name}</span>
                        {provider.enabled && (
                          <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[10px]">
                            Conectado
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
                        Domínios permitidos: {provider.domains.join(', ')}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onToggleSso(provider.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      provider.enabled
                        ? 'bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30'
                        : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-md'
                    }`}
                  >
                    {provider.enabled ? 'Desativar' : 'Habilitar'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECURITY & MFA TAB */}
        {activeTab === 'security' && (
          <div className="space-y-4 max-w-2xl">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-white/10 space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Exigências de Autenticação Multifator (MFA)
              </h4>
              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex items-center justify-between p-2.5 bg-black/40 rounded-lg">
                  <span>Exigir MFA para todas as contas de administrador</span>
                  <span className="text-emerald-400 font-semibold">Obrigatório</span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-black/40 rounded-lg">
                  <span>Suporte a Chaves de Segurança FIDO2 / TouchID / Passkeys</span>
                  <span className="text-emerald-400 font-semibold">Ativado</span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-black/40 rounded-lg">
                  <span>Tempo limite de inatividade da sessão</span>
                  <span className="text-slate-300 font-mono">45 minutos</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AUDIT LOG TAB */}
        {activeTab === 'audit' && (
          <div className="space-y-2">
            {[
              { event: 'Sessão SSH iniciada em vn-ubuntu-prod', user: 'carlos.mendes@inovecloud.io', time: 'Há 12 min', status: 'OK' },
              { event: 'Deploy do Web App inove-portal aprovado', user: 'inovecloud1@gmail.com', time: 'Há 45 min', status: 'OK' },
              { event: 'Tentativa de login com senha incorreta', user: 'desconhecido@ip-187.32.1.4', time: 'Há 2 horas', status: 'Bloqueado' },
              { event: 'Certificado HTTPS renovado para api.inovecloud.io', user: 'Sistema Automático', time: 'Hoje 03:00', status: 'OK' },
            ].map((log, i) => (
              <div
                key={i}
                className="p-3 rounded-lg bg-slate-900/40 border border-white/5 flex items-center justify-between text-xs"
              >
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      log.status === 'OK' ? 'bg-emerald-400' : 'bg-red-400'
                    }`}
                  />
                  <span className="text-white font-medium">{log.event}</span>
                  <span className="text-slate-500 font-mono">({log.user})</span>
                </div>
                <div className="flex items-center space-x-3 text-slate-400 text-[11px]">
                  <span>{log.time}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded font-semibold ${
                      log.status === 'OK' ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10'
                    }`}
                  >
                    {log.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/15 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center space-x-2">
                <UserPlus className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-sm text-white">Convidar Novo Usuário IDaaS</h3>
              </div>
              <button
                onClick={() => setShowAddUserModal(false)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-medium">Nome Completo</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Gabriela Costa"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">E-mail Corporativo</label>
                <input
                  type="email"
                  required
                  placeholder="usuario@inovecloud.io"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Função / Perfil de Acesso</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as any)}
                  className="w-full px-2 py-1.5 bg-slate-950 border border-white/10 rounded text-white"
                >
                  <option value="SuperAdmin">SuperAdmin (Acesso Total)</option>
                  <option value="DevOps Engineer">DevOps Engineer (Gestão de VNs e Deploys)</option>
                  <option value="Cloud Architect">Cloud Architect (Infraestrutura & Redes)</option>
                  <option value="Security Analyst">Security Analyst (Auditoria & SSO)</option>
                  <option value="Viewer">Viewer (Apenas Visualização)</option>
                </select>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-lg shadow-emerald-600/30 cursor-pointer"
                >
                  Enviar Convite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
