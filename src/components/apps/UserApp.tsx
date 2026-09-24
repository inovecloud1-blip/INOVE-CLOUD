import React, { useState, useRef } from 'react';
import {
  User,
  Shield,
  Key,
  Lock,
  Mail,
  Smartphone,
  Laptop,
  Globe,
  Upload,
  Check,
  Plus,
  Trash2,
  RefreshCw,
  LogOut,
  Edit2,
  Sparkles,
  ShieldCheck,
  Layers,
  Activity,
  Award,
  KeyRound,
  Eye,
  EyeOff,
  AlertTriangle
} from 'lucide-react';
import { UserProfile } from '../../types';
import { useSystemSettings } from '../../context/SystemSettingsContext';

interface SshKey {
  id: string;
  title: string;
  fingerprint: string;
  type: 'ed25519' | 'rsa';
  addedDate: string;
}

interface ActiveSession {
  id: string;
  device: string;
  browser: string;
  ip: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

interface UserAppProps {
  onLockScreen?: () => void;
}

export const UserApp: React.FC<UserAppProps> = ({ onLockScreen }) => {
  // Current user state
  const [profile, setProfile] = useState<UserProfile>({
    id: 'usr-root-1',
    name: 'InoveCloud Admin',
    email: 'inovecloud1@gmail.com',
    role: 'Root Administrator & Cloud Architect',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    status: 'online',
    bio: 'Gestor principal da infraestrutura de nós virtuais, redes e aplicações do cluster InoveCloud OS.',
    sshKeysCount: 2,
    mfaEnabled: true,
    twoFactorType: 'Google Authenticator (TOTP) + YubiKey FIDO2',
    lastLogin: 'Hoje às 14:52',
    currentIp: '189.44.120.5',
    region: 'São Paulo, Brasil (sa-east-1)',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(profile.name);
  const [editEmail, setEditEmail] = useState(profile.email);
  const [editBio, setEditBio] = useState(profile.bio);
  const [editRole, setEditRole] = useState(profile.role);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // System settings password management
  const { userPin, setUserPin, removeUserPin, lockScreen } = useSystemSettings();
  const [showPinModal, setShowPinModal] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPinText, setShowPinText] = useState(false);
  const [pinError, setPinError] = useState<string | null>(null);

  const hasPassword = Boolean(userPin && userPin.trim().length > 0);

  const handleSavePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPin.trim()) {
      setPinError('A senha não pode ser vazia.');
      return;
    }
    if (newPin !== confirmPin) {
      setPinError('As senhas digitadas não coincidem.');
      return;
    }
    setUserPin(newPin.trim());
    setShowPinModal(false);
    setNewPin('');
    setConfirmPin('');
    setPinError(null);
    triggerNotify('🔒 Senha configurada! O sistema agora só abrirá se a senha for digitada.');
  };

  const handleRemovePin = () => {
    removeUserPin();
    triggerNotify('🔓 Senha removida! Modo livre ativado (desbloqueio por mouse ou Enter).');
  };

  // SSH Keys
  const [sshKeys, setSshKeys] = useState<SshKey[]>([
    {
      id: 'ssh-1',
      title: 'Workstation-Principal-ed25519',
      fingerprint: 'SHA256:7fXq8N0rWbL+0P/52jKZ9u1vCgEmV3qYb',
      type: 'ed25519',
      addedDate: '10/08/2026',
    },
    {
      id: 'ssh-2',
      title: 'MacBookPro-M3-DeployKey',
      fingerprint: 'SHA256:4tMv9KlX2eZ8aW0/84dQ7x1mNjOqT2pZb',
      type: 'ed25519',
      addedDate: '24/08/2026',
    },
  ]);

  const [showAddKeyModal, setShowAddKeyModal] = useState(false);
  const [newKeyTitle, setNewKeyTitle] = useState('');
  const [newKeyContent, setNewKeyContent] = useState('');

  // Active Sessions
  const [sessions, setSessions] = useState<ActiveSession[]>([
    {
      id: 'sess-1',
      device: 'Desktop Workstation (InoveCloud OS)',
      browser: 'Chrome 128 / macOS & Linux',
      ip: '189.44.120.5',
      location: 'São Paulo, SP - Brasil',
      lastActive: 'Agora (Sessão Atual)',
      isCurrent: true,
    },
    {
      id: 'sess-2',
      device: 'Notebook Dell Precision',
      browser: 'Firefox Developer Edition',
      ip: '192.168.1.105',
      location: 'Rede Local LAN',
      lastActive: '2 horas atrás',
      isCurrent: false,
    },
    {
      id: 'sess-3',
      device: 'iPhone 16 Pro (Mobile App)',
      browser: 'Safari Mobile',
      ip: '177.18.90.12',
      location: 'São Paulo, SP - Brasil',
      lastActive: 'Ontem',
      isCurrent: false,
    },
  ]);

  const triggerNotify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // Avatar upload from PC
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      triggerNotify('Erro: Escolha um arquivo de imagem válido.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setProfile((prev) => ({ ...prev, avatar: result }));
        triggerNotify('Foto de perfil atualizada com sucesso!');
      }
    };
    reader.readAsDataURL(file);
  };

  // Save profile edits
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfile((prev) => ({
      ...prev,
      name: editName,
      email: editEmail,
      bio: editBio,
      role: editRole,
    }));
    setIsEditing(false);
    triggerNotify('Dados do perfil salvos com sucesso!');
  };

  // Add SSH Key
  const handleAddSshKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyTitle.trim() || !newKeyContent.trim()) return;

    const newKey: SshKey = {
      id: `ssh-${Date.now()}`,
      title: newKeyTitle.trim(),
      fingerprint: `SHA256:${Math.random().toString(36).substring(2, 15)}...`,
      type: newKeyContent.includes('ed25519') ? 'ed25519' : 'rsa',
      addedDate: 'Hoje',
    };

    setSshKeys([...sshKeys, newKey]);
    setNewKeyTitle('');
    setNewKeyContent('');
    setShowAddKeyModal(false);
    triggerNotify('Nova chave pública SSH registrada com sucesso!');
  };

  const handleDeleteSshKey = (id: string) => {
    setSshKeys(sshKeys.filter((k) => k.id !== id));
    triggerNotify('Chave SSH revogada com sucesso.');
  };

  const handleRevokeSession = (id: string) => {
    setSessions(sessions.filter((s) => s.id !== id));
    triggerNotify('Sessão remota desconectada.');
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 overflow-y-auto p-6 space-y-6 select-none">
      {/* Top Banner */}
      <div className="border-b border-white/10 pb-4 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-base font-bold text-white flex items-center space-x-2">
            <User className="w-5 h-5 text-cyan-400" />
            <span>Perfil do Usuário & Contas InoveCloud</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Gerenciamento da conta principal, credenciais SSH, autenticação em 2 fatores e sessões ativas.
          </p>
        </div>

        {onLockScreen && (
          <button
            onClick={onLockScreen}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-xs font-semibold text-slate-200 transition cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>Bloquear Sessão</span>
          </button>
        )}
      </div>

      {/* Hero Profile Card */}
      <div className="p-6 rounded-3xl liquid-glass-card border border-white/15 shadow-2xl relative overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 pb-5 border-b border-white/10">
          <div className="flex items-center space-x-4">
            {/* Avatar with upload overlay */}
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <img
                src={profile.avatar}
                alt={profile.name}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-cyan-400/40 shadow-xl group-hover:opacity-80 transition"
              />
              <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition">
                <Upload className="w-5 h-5 text-cyan-300" />
              </div>
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-950 shadow-md" title="Status Online" />
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarUpload}
              accept="image/*"
              className="hidden"
            />

            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-extrabold text-white">{profile.name}</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center space-x-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Conta Verificada</span>
                </span>
              </div>
              <p className="text-xs text-cyan-400 font-semibold">{profile.role}</p>
              <p className="text-xs text-slate-400 font-mono mt-0.5">{profile.email}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                setIsEditing(!isEditing);
                setEditName(profile.name);
                setEditEmail(profile.email);
                setEditBio(profile.bio);
                setEditRole(profile.role);
              }}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>{isEditing ? 'Cancelar Edição' : 'Editar Perfil'}</span>
            </button>
          </div>
        </div>

        {/* Bio / Description or Edit Form */}
        {isEditing ? (
          <form onSubmit={handleSaveProfile} className="mt-5 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nome Completo</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-slate-950 border border-white/15 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">E-mail</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-white/15 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Função / Cargo</label>
                <input
                  type="text"
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  className="w-full bg-slate-950 border border-white/15 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Bio / Resumo</label>
                <input
                  type="text"
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full bg-slate-950 border border-white/15 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition cursor-pointer shadow-lg shadow-cyan-600/30"
              >
                Salvar Alterações
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-4 text-xs text-slate-300 leading-relaxed">
            <p>{profile.bio}</p>
          </div>
        )}

        {/* Quick telemetry pills */}
        <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-2.5 rounded-xl bg-black/40">
            <span className="text-slate-400 text-[11px]">IP da Sessão</span>
            <div className="font-mono font-bold text-white mt-0.5">{profile.currentIp}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-black/40">
            <span className="text-slate-400 text-[11px]">Localização</span>
            <div className="font-semibold text-white mt-0.5">{profile.region}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-black/40">
            <span className="text-slate-400 text-[11px]">Último Acesso</span>
            <div className="font-semibold text-white mt-0.5">{profile.lastLogin}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-black/40">
            <span className="text-slate-400 text-[11px]">2FA / MFA</span>
            <div className="font-semibold text-emerald-400 mt-0.5">Ativo (YubiKey + TOTP)</div>
          </div>
        </div>
      </div>

      {/* Security & Lock Screen Password Section */}
      <div className="p-5 rounded-3xl liquid-glass-card border border-white/15 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/10 flex-wrap gap-2">
          <div className="flex items-center space-x-2.5">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              hasPassword 
                ? 'bg-amber-500/20 border border-amber-400/30 text-amber-300' 
                : 'bg-emerald-500/20 border border-emerald-400/30 text-emerald-300'
            }`}>
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Segurança, Senha & Privacidade da Tela de Bloqueio
              </h3>
              <p className="text-[10px] text-slate-400">
                Controle se o sistema exige senha rigorosa ou se permite acesso rápido com mouse / Enter
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {hasPassword ? (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center space-x-1">
                <Lock className="w-3 h-3" />
                <span>Protegido por Senha</span>
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center space-x-1">
                <Sparkles className="w-3 h-3" />
                <span>Modo Livre (Sem Senha)</span>
              </span>
            )}
          </div>
        </div>

        {/* Current status explanation */}
        <div className={`p-4 rounded-2xl border text-xs leading-relaxed space-y-2 ${
          hasPassword 
            ? 'bg-amber-950/20 border-amber-500/30 text-amber-200/90' 
            : 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200/90'
        }`}>
          {hasPassword ? (
            <div>
              <p className="font-semibold text-white flex items-center space-x-1.5 mb-1">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>Privacidade Rigorosa Ativa:</span>
              </p>
              <p>
                Este sistema possui senha cadastrada. Quando a tela for bloqueada, ela <strong>NÃO abre</strong> se o usuário tentar deslizar o mouse ou pressionar Enter sem digitar a senha correta. O acesso só é liberado com a senha exata.
              </p>
            </div>
          ) : (
            <div>
              <p className="font-semibold text-white flex items-center space-x-1.5 mb-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Modo Rápido sem Senha:</span>
              </p>
              <p>
                Nenhuma senha está cadastrada no momento. Você pode entrar e desbloquear a tela livremente deslizando o mouse da esquerda para a direita ou apenas pressionando a tecla <strong>Enter ↵</strong>.
              </p>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between flex-wrap gap-3 pt-1">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                setNewPin('');
                setConfirmPin('');
                setPinError(null);
                setShowPinModal(true);
              }}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition cursor-pointer shadow-md shadow-cyan-600/20"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>{hasPassword ? 'Alterar Senha' : 'Criar Senha de Proteção'}</span>
            </button>

            {hasPassword && (
              <button
                onClick={handleRemovePin}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-300 text-xs font-bold transition cursor-pointer"
                title="Remover senha para habilitar desbloqueio direto por mouse ou Enter"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remover Senha (Usar Modo Livre)</span>
              </button>
            )}
          </div>

          <button
            onClick={() => lockScreen()}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>Bloquear Agora para Testar</span>
          </button>
        </div>

        {/* Modal: Define or Change Password */}
        {showPinModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
            <div className="w-full max-w-sm rounded-3xl p-6 bg-slate-900 border border-white/20 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-bold text-white">
                    {hasPassword ? 'Alterar Senha' : 'Criar Senha'}
                  </h4>
                </div>
                <button
                  onClick={() => setShowPinModal(false)}
                  className="text-slate-400 hover:text-white text-sm"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSavePin} className="space-y-3.5">
                <p className="text-xs text-slate-300 leading-relaxed">
                  Digite sua nova senha. Uma vez cadastrada, a tela de bloqueio exigirá esta senha e não abrirá apenas deslizando ou dando Enter.
                </p>

                <div className="space-y-2">
                  <label className="text-[11px] font-semibold text-slate-300 block">
                    Nova Senha / PIN:
                  </label>
                  <div className="relative">
                    <input
                      type={showPinText ? 'text' : 'password'}
                      value={newPin}
                      onChange={(e) => setNewPin(e.target.value)}
                      placeholder="Digite a nova senha..."
                      className="w-full px-3 py-2 pr-10 rounded-xl bg-slate-950 border border-white/20 text-white text-xs focus:outline-none focus:border-cyan-400"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPinText(!showPinText)}
                      className="absolute right-2.5 top-2 text-slate-400 hover:text-white"
                    >
                      {showPinText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-semibold text-slate-300 block">
                    Confirmar Senha:
                  </label>
                  <input
                    type={showPinText ? 'text' : 'password'}
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value)}
                    placeholder="Repita a nova senha..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/20 text-white text-xs focus:outline-none focus:border-cyan-400"
                  />
                </div>

                {pinError && (
                  <div className="p-2 rounded-xl bg-red-500/20 border border-red-500/30 text-xs text-red-300 font-medium">
                    {pinError}
                  </div>
                )}

                <div className="flex items-center justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowPinModal(false)}
                    className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 text-xs font-semibold transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition shadow-md"
                  >
                    Salvar Senha
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* SSH Keys Management Section */}
      <div className="p-5 rounded-3xl liquid-glass-card border border-white/15 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Chaves Públicas SSH do Usuário
              </h3>
              <p className="text-[10px] text-slate-400">
                Acesso seguro via terminal sem senha aos nós virtuais e servidores do cluster
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowAddKeyModal(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition cursor-pointer shadow-md"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Adicionar Chave SSH</span>
          </button>
        </div>

        <div className="space-y-2">
          {sshKeys.map((key) => (
            <div
              key={key.id}
              className="p-3 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between text-xs"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-indigo-400">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-white">{key.title}</span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase">
                      {key.type}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                    {key.fingerprint}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-3 text-slate-400">
                <span className="text-[11px]">Adicionada em: {key.addedDate}</span>
                <button
                  onClick={() => handleDeleteSshKey(key.id)}
                  className="p-1 hover:bg-red-500/20 text-slate-400 hover:text-red-300 rounded-lg transition"
                  title="Revogar Chave SSH"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Sessions & Security */}
      <div className="p-5 rounded-3xl liquid-glass-card border border-white/15 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Sessões Ativas & Auditoria de Acesso
              </h3>
              <p className="text-[10px] text-slate-400">
                Dispositivos autenticados no InoveCloud OS
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {sessions.map((sess) => (
            <div
              key={sess.id}
              className={`p-3 rounded-2xl border flex items-center justify-between text-xs ${
                sess.isCurrent ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-black/40 border-white/10'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-emerald-400">
                  <Laptop className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-white">{sess.device}</span>
                    {sess.isCurrent && (
                      <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Sessão Atual
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                    {sess.browser} • {sess.ip} ({sess.location})
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-3 text-slate-400">
                <span className="text-[11px] font-medium">{sess.lastActive}</span>
                {!sess.isCurrent && (
                  <button
                    onClick={() => handleRevokeSession(sess.id)}
                    className="p-1 hover:bg-red-500/20 text-slate-400 hover:text-red-300 rounded-lg transition text-[11px] font-semibold"
                    title="Desconectar Sessão Remota"
                  >
                    Desconectar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal: Adicionar Chave SSH */}
      {showAddKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="w-full max-w-lg liquid-glass-card rounded-3xl p-6 border border-white/20 shadow-2xl text-white animate-fade-in">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
              <div className="flex items-center space-x-2">
                <Key className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">Adicionar Chave Pública SSH</h3>
              </div>
              <button
                onClick={() => setShowAddKeyModal(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSshKey} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Título / Rótulo da Chave</label>
                <input
                  type="text"
                  value={newKeyTitle}
                  onChange={(e) => setNewKeyTitle(e.target.value)}
                  placeholder="Ex: Notebook Pessoal, Servidor CI/CD"
                  required
                  className="w-full bg-slate-950/80 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Chave Pública (Conteúdo)</label>
                <textarea
                  value={newKeyContent}
                  onChange={(e) => setNewKeyContent(e.target.value)}
                  placeholder="ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAI... usuario@pc"
                  rows={4}
                  required
                  className="w-full bg-slate-950/80 border border-white/15 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddKeyModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 font-semibold text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-white shadow-lg shadow-indigo-600/30"
                >
                  Registrar Chave
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Notification Toast */}
      {notification && (
        <div className="fixed bottom-6 right-6 px-4 py-2.5 rounded-2xl bg-slate-900/95 text-white border border-white/20 shadow-2xl text-xs font-semibold flex items-center space-x-2 animate-fade-in z-50">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}
    </div>
  );
};
