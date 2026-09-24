import React, { useState, useEffect, useRef } from 'react';
import {
  Lock,
  Unlock,
  Power,
  RotateCw,
  Moon,
  Wifi,
  WifiOff,
  Battery,
  BatteryCharging,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  ArrowRight,
  Shield,
  Keyboard,
  Globe,
  HelpCircle,
  Sparkles,
  UserCheck,
  MousePointer,
  KeyRound
} from 'lucide-react';
import { useSystemSettings } from '../../context/SystemSettingsContext';
import { SlideToUnlock } from '../ui/SlideToUnlock';

interface LockScreenProps {
  wallpaper: string;
}

export const LockScreen: React.FC<LockScreenProps> = ({ wallpaper }) => {
  const {
    isScreenLocked,
    unlockScreen,
    resetSecurityAndUnlock,
    userName,
    userEmail,
    userAvatar,
    userPin,
    wifiEnabled,
    connectedSsid,
    speakerVolume,
    isMuted,
    requestShutdown,
    requestRestart,
    requestSleep,
    playFeedbackTone,
  } = useSystemSettings();

  const [timeStr, setTimeStr] = useState('');
  const [secondsStr, setSecondsStr] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorShake, setErrorShake] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [showNumpad, setShowNumpad] = useState(false);

  const hasPassword = Boolean(userPin && userPin.trim().length > 0);
  const [unlockMethod, setUnlockMethod] = useState<'slide' | 'password'>(() => (hasPassword ? 'password' : 'slide'));
  const inputRef = useRef<HTMLInputElement>(null);

  // Live Clock & Date in Portuguese
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
        })
      );
      setSecondsStr(
        now.toLocaleTimeString('pt-BR', {
          second: '2-digit',
        })
      );
      // Format: Segunda-feira, 14 de Setembro de 2026
      const dateFormatted = now.toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
      // Capitalize first letter of weekday
      setDateStr(dateFormatted.charAt(0).toUpperCase() + dateFormatted.slice(1));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Update default unlock mode and focus when lock state changes
  useEffect(() => {
    if (isScreenLocked) {
      setPinInput('');
      setErrorMessage(null);
      setUnlockMethod(hasPassword ? 'password' : 'slide');
      if (hasPassword) {
        const timer = setTimeout(() => {
          inputRef.current?.focus();
        }, 300);
        return () => clearTimeout(timer);
      }
    }
  }, [isScreenLocked, hasPassword]);

  // Global listener: Pressionar ENTER
  // Se NÃO tiver senha: abre o sistema.
  // Se TIVER senha: exige que a senha correta seja digitada e valida!
  useEffect(() => {
    if (!isScreenLocked || isUnlocking) return;

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        const activeTag = document.activeElement?.tagName.toLowerCase();
        const activeInput = document.activeElement as HTMLInputElement;

        // Se o sistema possui senha:
        if (hasPassword) {
          // Se o usuário já está com foco no input e tem texto digitado, o form cuidará
          if (activeTag === 'input' && activeInput?.value && activeInput.value.trim().length > 0) {
            return;
          }

          // Se tentou dar Enter com campo vazio ou no modo slide: BLOQUEIA!
          e.preventDefault();
          setErrorShake(true);
          setErrorMessage('🔒 Acesso negado: Este sistema exige senha para ser aberto!');
          setTimeout(() => setErrorShake(false), 700);
          setUnlockMethod('password');
          setTimeout(() => inputRef.current?.focus(), 150);
          return;
        }

        // Se o usuário NÃO cadastrou senha: abre diretamente!
        e.preventDefault();
        handleDirectUnlock();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isScreenLocked, isUnlocking, pinInput, hasPassword]);

  if (!isScreenLocked) return null;

  const handleDirectUnlock = () => {
    // Se o sistema possui senha configurada, BLOQUEIA o acesso direto!
    if (hasPassword) {
      setErrorShake(true);
      setErrorMessage('🔒 Segurança e Privacidade: Digite a senha cadastrada para entrar.');
      setTimeout(() => setErrorShake(false), 700);
      setUnlockMethod('password');
      setTimeout(() => inputRef.current?.focus(), 150);
      return;
    }

    setIsUnlocking(true);
    playFeedbackTone();
    setTimeout(() => {
      unlockScreen('');
      setIsUnlocking(false);
    }, 250);
  };

  const handleUnlockAttempt = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (hasPassword && (!pinInput || pinInput.trim() === '')) {
      setErrorShake(true);
      setErrorMessage('🔒 Por favor, digite sua senha.');
      setTimeout(() => setErrorShake(false), 700);
      inputRef.current?.focus();
      return;
    }
    
    setIsUnlocking(true);
    const success = unlockScreen(pinInput);

    if (!success) {
      setIsUnlocking(false);
      setErrorShake(true);
      setErrorMessage('🔒 Senha incorreta! Acesso bloqueado para proteger seus dados.');
      setTimeout(() => setErrorShake(false), 800);
      setPinInput('');
      inputRef.current?.focus();
    } else {
      setErrorMessage(null);
      setTimeout(() => {
        setIsUnlocking(false);
      }, 300);
    }
  };

  const handleNumpadPress = (digit: string) => {
    playFeedbackTone();
    setPinInput((prev) => prev + digit);
  };

  const handleNumpadBackspace = () => {
    playFeedbackTone();
    setPinInput((prev) => prev.slice(0, -1));
  };

  return (
    <div
      id="inovecloud-lock-screen"
      className="fixed inset-0 z-[99999] flex flex-col justify-between text-white select-none overflow-hidden animate-fade-in"
      style={{
        backgroundImage: `url(${wallpaper})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Acrylic Glass Tint & Deep Blur Overlay */}
      <div className="absolute inset-0 bg-slate-950/45 backdrop-blur-2xl backdrop-saturate-150 transition-all duration-500" />

      {/* Top Status Bar of Lock Screen */}
      <header className="relative z-10 w-full px-6 py-4 flex items-center justify-between text-xs font-medium text-white/90 drop-shadow-md">
        <div className="flex items-center space-x-2.5">
          <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg">
            <Shield className="w-3 h-3 text-white" />
          </div>
          <span className="font-bold tracking-wide text-sm">InoveCloud OS</span>
          <span className="px-2 py-0.5 rounded-full bg-white/10 text-[10px] text-cyan-300 font-mono border border-white/15">
            Sessão Segura
          </span>
        </div>

        <div className="flex items-center space-x-5">
          {/* Wi-Fi Status */}
          <div className="flex items-center space-x-1.5 text-xs text-white/90" title={wifiEnabled ? `Conectado: ${connectedSsid}` : 'Wi-Fi Desativado'}>
            {wifiEnabled ? (
              <>
                <Wifi className="w-4 h-4 text-cyan-300" />
                <span className="hidden sm:inline-block text-[11px] font-medium">{connectedSsid}</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 text-slate-400" />
                <span className="hidden sm:inline-block text-[11px] text-slate-400">Offline</span>
              </>
            )}
          </div>

          {/* Sound status */}
          <div className="flex items-center space-x-1" title={`Volume: ${speakerVolume}%`}>
            {isMuted || speakerVolume === 0 ? (
              <VolumeX className="w-4 h-4 text-slate-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            )}
            <span className="text-[11px]">{isMuted ? 'Mudo' : `${speakerVolume}%`}</span>
          </div>

          {/* Battery status */}
          <div className="flex items-center space-x-1.5 text-xs" title="Bateria: 100% (Conectado à energia)">
            <BatteryCharging className="w-4 h-4 text-emerald-400" />
            <span className="text-[11px]">100%</span>
          </div>

          {/* Language badge */}
          <div className="flex items-center space-x-1 px-2 py-0.5 rounded-md bg-white/10 text-[11px] border border-white/10">
            <Globe className="w-3 h-3 text-slate-300" />
            <span>PT-BR</span>
          </div>
        </div>
      </header>

      {/* Main Center Section: Live Digital Clock, Date & Unlock Form */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 -mt-4">
        {/* Prominent Digital Clock */}
        <div className="text-center space-y-1 mb-8">
          <div className="flex items-baseline justify-center">
            <h1 className="text-7xl sm:text-8xl md:text-9xl font-light tracking-tight text-white drop-shadow-2xl font-sans">
              {timeStr || '12:00'}
            </h1>
            <span className="text-2xl sm:text-3xl font-light text-cyan-300/80 ml-2 font-mono drop-shadow">
              {secondsStr ? `:${secondsStr}` : ''}
            </span>
          </div>
          <p className="text-base sm:text-lg md:text-xl font-medium text-slate-200 tracking-wide drop-shadow-md">
            {dateStr || 'Carregando data...'}
          </p>
        </div>

        {/* User Card & Unlock Controls */}
        <div
          className={`w-full max-w-sm rounded-3xl p-6 liquid-glass border border-white/20 shadow-2xl space-y-4 backdrop-blur-3xl transition-transform duration-300 ${
            errorShake ? 'animate-shake ring-2 ring-red-500' : ''
          }`}
        >
          {/* User Avatar & Name */}
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-700 flex items-center justify-center text-3xl shadow-xl ring-4 ring-white/30">
                {userAvatar || '👑'}
              </div>
              <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-emerald-500 border-2 border-slate-950 flex items-center justify-center text-white" title="Status: Online">
                <UserCheck className="w-3 h-3" />
              </div>
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">{userName || 'Administrador Inove'}</h2>
              <p className="text-xs text-slate-300">{userEmail || 'inovecloud1@gmail.com'}</p>
            </div>

            {/* Security Status Badge */}
            {hasPassword ? (
              <div className="flex items-center justify-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] font-semibold">
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                <span>Privacidade Ativa: Protegido por Senha</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Modo Sem Senha: Deslize ou dê Enter</span>
              </div>
            )}
          </div>

          {/* Unlock Method Selector (Deslizar Mouse vs Senha/PIN) */}
          <div className="flex items-center p-1 rounded-2xl bg-slate-900/80 border border-white/10 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setUnlockMethod('slide')}
              className={`flex-1 py-1.5 px-2 rounded-xl flex items-center justify-center space-x-1.5 transition ${
                unlockMethod === 'slide'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <MousePointer className="w-3.5 h-3.5" />
              <span>Deslizar Mouse</span>
            </button>
            <button
              type="button"
              onClick={() => setUnlockMethod('password')}
              className={`flex-1 py-1.5 px-2 rounded-xl flex items-center justify-center space-x-1.5 transition ${
                unlockMethod === 'password'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Senha / PIN</span>
            </button>
          </div>

          {/* METHOD 1: SLIDE TO UNLOCK (@evilbuttons/slide-to-detonate pattern) */}
          {unlockMethod === 'slide' && (
            <div className="space-y-3 pt-1">
              <SlideToUnlock
                onConfirm={handleDirectUnlock}
                onUnlock={handleDirectUnlock}
                onBlocked={() => {
                  setErrorShake(true);
                  setErrorMessage('🔒 Acesso negado: Este sistema exige senha para ser aberto!');
                  setTimeout(() => setErrorShake(false), 800);
                  setUnlockMethod('password');
                  setTimeout(() => inputRef.current?.focus(), 150);
                }}
                label={hasPassword ? '🔒 Senha Obrigatória (Arraste)' : 'Deslize o mouse para desbloquear'}
                successLabel={hasPassword ? 'Senha Necessária!' : 'Desbloqueado!'}
                threshold={0.8}
                variant={hasPassword ? 'detonate' : 'unlock'}
                allowEnterKey={!hasPassword}
                requirePassword={hasPassword}
              />
              <div className="text-center space-y-1.5">
                {hasPassword ? (
                  <div className="space-y-1">
                    <p className="text-[11px] text-amber-300 font-medium flex items-center justify-center space-x-1">
                      <Lock className="w-3 h-3 text-amber-400 inline" />
                      <span>Sistema com senha (Padrão: <strong>1234</strong>)</span>
                    </p>
                    <button
                      type="button"
                      onClick={() => resetSecurityAndUnlock()}
                      className="text-[11px] text-cyan-400 hover:text-cyan-300 hover:underline transition font-semibold"
                    >
                      Redefinir Senha e Entrar Agora 🔓
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleDirectUnlock}
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 hover:underline transition font-semibold"
                  >
                    Entrar direto sem senha (Pressione Enter ↵)
                  </button>
                )}
              </div>
            </div>
          )}

          {/* METHOD 2: TRADITIONAL PASSWORD / PIN */}
          {unlockMethod === 'password' && (
            <form onSubmit={handleUnlockAttempt} className="space-y-3">
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  ref={inputRef}
                  type={showPassword ? 'text' : 'password'}
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder={hasPassword ? 'Digite sua senha cadastrada...' : 'Sem senha: dê Enter ou digite nova senha...'}
                  className="w-full pl-10 pr-20 py-2.5 rounded-xl bg-slate-900/70 border border-white/20 text-white placeholder-slate-400 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent shadow-inner transition"
                />
                <div className="absolute right-2 flex items-center space-x-1">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
                    title={showPassword ? 'Ocultar senha' : 'Ver senha'}
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    type="submit"
                    disabled={isUnlocking}
                    className="p-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition shadow-md active:scale-95 disabled:opacity-50"
                    title="Desbloquear sessão"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {errorMessage && (
                <div className="p-2.5 rounded-xl bg-red-950/80 border border-red-500/40 text-center text-xs text-red-300 font-semibold animate-pulse shadow-md space-y-1">
                  <div>{errorMessage}</div>
                  <div className="text-[10px] text-slate-300 font-normal">
                    Dica: Digite <span className="text-cyan-300 font-mono font-bold">1234</span> ou clique em Redefinir Senha abaixo.
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between text-[11px] text-slate-300 pt-1">
                <button
                  type="button"
                  onClick={() => setShowNumpad(!showNumpad)}
                  className="flex items-center space-x-1 hover:text-cyan-300 transition"
                >
                  <Keyboard className="w-3.5 h-3.5" />
                  <span>{showNumpad ? 'Ocultar Teclado' : 'Teclado Virtual'}</span>
                </button>
                {hasPassword ? (
                  <button
                    type="button"
                    onClick={() => {
                      resetSecurityAndUnlock();
                    }}
                    className="text-cyan-400 hover:text-cyan-300 hover:underline transition font-semibold"
                    title="Remover senha e entrar imediatamente"
                  >
                    Esqueci / Redefinir e Entrar 🔓
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleDirectUnlock}
                    className="text-cyan-400 hover:text-cyan-300 hover:underline transition font-semibold"
                  >
                    Entrar sem Senha (Enter ↵)
                  </button>
                )}
              </div>

              {hasPassword && (
                <div className="pt-2 border-t border-white/10 flex items-center justify-center space-x-2 text-[11px]">
                  <button
                    type="button"
                    onClick={() => {
                      setPinInput('1234');
                      unlockScreen('1234');
                    }}
                    className="px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-cyan-300 transition font-mono font-semibold"
                  >
                    Entrar com PIN Padrão (1234)
                  </button>
                </div>
              )}

              {/* Virtual Numpad for PIN / Touch screens */}
              {showNumpad && (
                <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-white/10 animate-fade-in">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map((btn) => (
                    <button
                      key={btn}
                      type="button"
                      onClick={() => {
                        if (btn === 'C') setPinInput('');
                        else if (btn === '⌫') handleNumpadBackspace();
                        else handleNumpadPress(btn);
                      }}
                      className="py-2 rounded-xl bg-white/10 hover:bg-white/20 active:bg-cyan-500 active:text-slate-950 text-white font-bold text-sm transition shadow-sm"
                    >
                      {btn}
                    </button>
                  ))}
                </div>
              )}
            </form>
          )}
        </div>
      </main>

      {/* Bottom Power & Accessibility Controls */}
      <footer className="relative z-10 w-full px-6 py-5 flex items-center justify-between text-xs text-slate-300">
        <div className="flex items-center space-x-2 text-[11px] text-slate-400">
          <span>Pressione qualquer tecla ou </span>
          <kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/15 text-slate-200 font-mono text-[10px]">
            Enter
          </kbd>
          <span> para desbloquear</span>
        </div>

        {/* Quick Power Actions */}
        <div className="flex items-center space-x-3">
          {/* Sleep */}
          <button
            onClick={requestSleep}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl liquid-glass hover:bg-white/15 text-slate-200 hover:text-white transition shadow-md active:scale-95 text-xs font-medium border border-white/10"
            title="Suspender sessão do computador"
          >
            <Moon className="w-3.5 h-3.5 text-indigo-400" />
            <span>Suspender</span>
          </button>

          {/* Restart */}
          <button
            onClick={requestRestart}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl liquid-glass hover:bg-white/15 text-amber-300 hover:text-amber-200 transition shadow-md active:scale-95 text-xs font-medium border border-white/10"
            title="Reiniciar InoveCloud OS"
          >
            <RotateCw className="w-3.5 h-3.5 text-amber-400" />
            <span>Reiniciar</span>
          </button>

          {/* Shutdown / Power Off */}
          <button
            onClick={requestShutdown}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-red-600/80 hover:bg-red-500 text-white transition shadow-lg shadow-red-600/30 active:scale-95 text-xs font-bold border border-red-400/30"
            title="Desligar o computador"
          >
            <Power className="w-3.5 h-3.5" />
            <span>Desligar</span>
          </button>
        </div>
      </footer>
    </div>
  );
};
export default LockScreen;
