import React from 'react';
import { AppId } from '../../types';

interface AppIconProps {
  appId: AppId | string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  showBadge?: boolean;
  badgeContent?: React.ReactNode;
}

/**
 * Candy Craze / Pastel Neon 3D Squircle Icons
 *
 * Reproduz fielmente o estilo icônico enviado pelo usuário:
 * - Squircles ultra-arredondados com curvatura suave
 * - Gradientes bicolores/tricolores ricos em pastel vibrante (Cyan/Lilás/Amarelo, Rosa/Laranja/Amarelo, Roxo/Azul/Amarelo, Azul/Amarelo, etc.)
 * - Glifos em linhas espessas (thick stroke 3.2px+) brancos leitosos com cantos redondos e transparência suave (rgba(255,255,255,0.92))
 * - Efeito de relevo em baixo relevo / alto relevo e iluminação interna
 * - Sombra inferior suave simulando elevação tridimensional sobre a mesa de trabalho
 */
export const AppIcon: React.FC<AppIconProps> = ({
  appId,
  size = 'md',
  className = '',
  showBadge = false,
  badgeContent,
}) => {
  const sizeMap = {
    xs: { box: 'w-6 h-6 rounded-[7px]', svgSize: 'w-4 h-4' },
    sm: { box: 'w-8 h-8 rounded-[9px]', svgSize: 'w-5 h-5' },
    md: { box: 'w-11 h-11 rounded-[13px]', svgSize: 'w-7 h-7' },
    lg: { box: 'w-14 h-14 rounded-[17px]', svgSize: 'w-9 h-9' },
    xl: { box: 'w-16 h-16 rounded-[20px]', svgSize: 'w-11 h-11' },
    '2xl': { box: 'w-20 h-20 rounded-[25px]', svgSize: 'w-14 h-14' },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  // Render SVG com gradiente de fundo fiel e vetor com traço grosso estilizado
  const renderIconSvg = () => {
    switch (appId) {
      // 1. FLATHUB / APP STORE -> Sacola de compras / Loja exata do print (icon 11)
      case 'appstore':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
            <defs>
              <linearGradient id="grad-appstore" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4de2f8" />
                <stop offset="50%" stopColor="#9b91f5" />
                <stop offset="100%" stopColor="#f5df8e" />
              </linearGradient>
            </defs>
            <rect width="100" height="100" rx="28" fill="url(#grad-appstore)" />
            {/* Outline sacola de compras com traço leitoso e cantos redondos */}
            <path
              d="M34 26 L22 36 L22 74 C22 77.3 24.7 80 28 80 L72 80 C75.3 80 78 77.3 78 74 L78 36 L66 26 Z"
              stroke="#ffffff"
              strokeWidth="7"
              strokeLinejoin="round"
              strokeLinecap="round"
              fill="rgba(255, 255, 255, 0.28)"
            />
            {/* Linha superior de dobra */}
            <path
              d="M32 36 L68 36"
              stroke="#ffffff"
              strokeWidth="6"
              strokeLinecap="round"
            />
            {/* Alça / sorriso da sacola */}
            <path
              d="M37 42 C37 53 43 60 50 60 C57 60 63 53 63 42"
              stroke="#ffffff"
              strokeWidth="7"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
        );

      // 2. AGENTE IA / COPILOT -> Robô exato com antena e olhos pílula do print (icon 10)
      case 'aiagent':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
            <defs>
              <linearGradient id="grad-aiagent" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#a843e6" />
                <stop offset="50%" stopColor="#8795f5" />
                <stop offset="100%" stopColor="#fae792" />
              </linearGradient>
            </defs>
            <rect width="100" height="100" rx="28" fill="url(#grad-aiagent)" />
            {/* Antena dobrada no topo */}
            <path
              d="M40 26 C40 24 41 23 43 23 L51 23 C53.5 23 55 24.5 55 27 L55 35 L47 35 L47 31"
              stroke="#ffffff"
              strokeWidth="7"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            {/* Orelhas / pinos laterais */}
            <path d="M19 55 L25 55" stroke="#ffffff" strokeWidth="7" strokeLinecap="round" />
            <path d="M75 55 L81 55" stroke="#ffffff" strokeWidth="7" strokeLinecap="round" />
            {/* Corpo / Cabeça arredondada com janela translúcida */}
            <rect
              x="25"
              y="35"
              width="50"
              height="40"
              rx="14"
              stroke="#ffffff"
              strokeWidth="7"
              strokeLinejoin="round"
              fill="rgba(255, 255, 255, 0.3)"
            />
            {/* Olhos pílula brancos */}
            <rect x="38" y="49" width="7" height="13" rx="3.5" fill="#ffffff" />
            <rect x="55" y="49" width="7" height="13" rx="3.5" fill="#ffffff" />
          </svg>
        );

      // 3. MEUS ARQUIVOS / CLOUD STORAGE -> Pasta com traço de abertura central exata do print (icon 9)
      case 'storage':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
            <defs>
              <linearGradient id="grad-storage" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2862f6" />
                <stop offset="45%" stopColor="#31bdf9" />
                <stop offset="100%" stopColor="#fae787" />
              </linearGradient>
            </defs>
            <rect width="100" height="100" rx="28" fill="url(#grad-storage)" />
            {/* Contorno da pasta com aba esquerda estilizada */}
            <path
              d="M26 29 C26 25 29 22 33 22 L41 22 C44 22 47 24 49 26 L53 31 L73 31 C77.4 31 81 34.6 81 39 L81 72 C81 76.4 77.4 80 73 80 L27 80 C22.6 80 19 76.4 19 72 L19 36 C19 32.1 22.1 29 26 29 Z"
              stroke="#ffffff"
              strokeWidth="7"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="rgba(255, 255, 255, 0.28)"
            />
            {/* Traço pílula horizontal central */}
            <rect x="39" y="50" width="22" height="7" rx="3.5" fill="#ffffff" />
          </svg>
        );

      // 4. LINUXPEDIA / DOCUMENTOS -> Folha dobrada com selo/círculo exata do print (icon 8)
      case 'linuxpedia':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
            <defs>
              <linearGradient id="grad-linuxpedia" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#5542f6" />
                <stop offset="50%" stopColor="#b4a7d6" />
                <stop offset="100%" stopColor="#fae082" />
              </linearGradient>
            </defs>
            <rect width="100" height="100" rx="28" fill="url(#grad-linuxpedia)" />
            {/* Documento com dobra na aba superior direita e base chanfrada */}
            <path
              d="M32 20 L58 20 L75 37 L75 74 C75 78.4 71.4 82 67 82 L33 82 C28.6 82 25 78.4 25 74 L25 27 C25 23.1 28.1 20 32 20 Z"
              stroke="#ffffff"
              strokeWidth="7"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="rgba(255, 255, 255, 0.25)"
            />
            {/* Linha da orelha dobrada */}
            <path
              d="M58 20 L58 37 L75 37"
              stroke="#ffffff"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Círculo / Selo central vazado */}
            <circle cx="44" cy="53" r="8" stroke="#ffffff" strokeWidth="6" fill="rgba(255,255,255,0.4)" />
            {/* Dobra decorativa inferior */}
            <path
              d="M44 74 L68 56"
              stroke="#ffffff"
              strokeWidth="6"
              strokeLinecap="round"
            />
          </svg>
        );

      // 5. GERADOR DE ISO & DISCO -> CD / Disco de vinil com anéis exato do print (icon 7)
      case 'isobuilder':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
            <defs>
              <linearGradient id="grad-isobuilder" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f35987" />
                <stop offset="50%" stopColor="#f7a379" />
                <stop offset="100%" stopColor="#faee5e" />
              </linearGradient>
            </defs>
            <rect width="100" height="100" rx="28" fill="url(#grad-isobuilder)" />
            {/* Círculo externo grosso leitoso com preenchimento sutil */}
            <circle
              cx="50"
              cy="50"
              r="31"
              stroke="#ffffff"
              strokeWidth="7"
              fill="rgba(255, 255, 255, 0.2)"
            />
            {/* Círculo do centro com furo */}
            <circle cx="50" cy="50" r="7" fill="#ffffff" />
            <circle cx="50" cy="50" r="14" stroke="#ffffff" strokeWidth="3" strokeOpacity="0.4" />
            {/* Arcos do reflexo de gravação do disco */}
            <path
              d="M38 36 C33 41 31 46 32 52"
              stroke="#ffffff"
              strokeWidth="6"
              strokeLinecap="round"
            />
            <path
              d="M62 64 C67 59 69 54 68 48"
              stroke="#ffffff"
              strokeWidth="6"
              strokeLinecap="round"
            />
          </svg>
        );

      // 6. MONITOR / CALCULADORA & TELEMETRIA -> Grade de teclas e visor exata do print (icon 4)
      case 'monitor':
      case 'projects':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
            <defs>
              <linearGradient id="grad-calc" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ecdb44" />
                <stop offset="50%" stopColor="#694178" />
                <stop offset="100%" stopColor="#048cfc" />
              </linearGradient>
            </defs>
            <rect width="100" height="100" rx="28" fill="url(#grad-calc)" />
            {/* Caixa externa arredondada */}
            <rect
              x="25"
              y="19"
              width="50"
              height="62"
              rx="15"
              stroke="#ffffff"
              strokeWidth="6.5"
              strokeLinejoin="round"
              fill="rgba(255, 255, 255, 0.22)"
            />
            {/* Display / Visor superior em pílula */}
            <rect x="35" y="29" width="30" height="7" rx="3.5" fill="#ffffff" />
            {/* Botões redondos */}
            <circle cx="39" cy="45" r="4.5" fill="#ffffff" />
            <circle cx="50" cy="45" r="4.5" fill="#ffffff" />
            <circle cx="61" cy="45" r="4.5" fill="#ffffff" />

            <circle cx="39" cy="56" r="4.5" fill="#ffffff" />
            <circle cx="50" cy="56" r="4.5" fill="#ffffff" />

            <circle cx="39" cy="67" r="4.5" fill="#ffffff" />
            <circle cx="50" cy="67" r="4.5" fill="#ffffff" />

            {/* Tecla Enter / Barra vertical alta */}
            <rect x="58" y="53" width="7" height="18" rx="3.5" fill="#ffffff" />
          </svg>
        );

      // 7. MÁQUINAS VIRTUAIS (KVM / QEMU) -> Hypervisor / Servidor em pastel Safira + Turquesa + Ouro
      case 'vn':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
            <defs>
              <linearGradient id="grad-vn" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2563eb" />
                <stop offset="55%" stopColor="#60a5fa" />
                <stop offset="100%" stopColor="#fde047" />
              </linearGradient>
            </defs>
            <rect width="100" height="100" rx="28" fill="url(#grad-vn)" />
            {/* Rack de servidores em lâminas leitosas */}
            <rect x="22" y="22" width="56" height="22" rx="7" stroke="#ffffff" strokeWidth="6" fill="rgba(255,255,255,0.25)" />
            <circle cx="32" cy="33" r="3" fill="#ffffff" />
            <circle cx="41" cy="33" r="3" fill="#ffffff" />
            <rect x="52" y="31.5" width="18" height="3" rx="1.5" fill="#ffffff" />

            <rect x="22" y="52" width="56" height="22" rx="7" stroke="#ffffff" strokeWidth="6" fill="rgba(255,255,255,0.25)" />
            <circle cx="32" cy="63" r="3" fill="#ffffff" />
            <circle cx="41" cy="63" r="3" fill="#ffffff" />
            <rect x="52" y="61.5" width="18" height="3" rx="1.5" fill="#ffffff" />

            <path d="M50 44 L50 52" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" />
          </svg>
        );

      // 8. TERMINAL SSH / SHELL -> Terminal com prompt ">_" em degrade Obsidian + Turquesa + Lima
      case 'terminal':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
            <defs>
              <linearGradient id="grad-term" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1e293b" />
                <stop offset="50%" stopColor="#0f766e" />
                <stop offset="100%" stopColor="#a3e635" />
              </linearGradient>
            </defs>
            <rect width="100" height="100" rx="28" fill="url(#grad-term)" />
            {/* Borda da janela de terminal */}
            <rect x="20" y="22" width="60" height="56" rx="12" stroke="#ffffff" strokeWidth="6.5" fill="rgba(0,0,0,0.3)" />
            {/* Barra superior com 3 bolinhas */}
            <circle cx="31" cy="32" r="2.5" fill="#ffffff" />
            <circle cx="39" cy="32" r="2.5" fill="#ffffff" />
            <circle cx="47" cy="32" r="2.5" fill="#ffffff" />
            {/* Prompt de comando chevron > */}
            <path d="M32 46 L42 54 L32 62" stroke="#ffffff" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
            {/* Cursor piscante sublinhado */}
            <rect x="47" y="58" width="14" height="5" rx="2" fill="#ffffff" />
          </svg>
        );

      // 9. NAVEGADOR WEB LOCAL (BROWSER) -> Bússola elegante com agulha e meridianos
      case 'browser':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
            <defs>
              <linearGradient id="grad-browser" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0284c7" />
                <stop offset="50%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#fde047" />
              </linearGradient>
            </defs>
            <rect width="100" height="100" rx="28" fill="url(#grad-browser)" />
            <circle cx="50" cy="50" r="30" stroke="#ffffff" strokeWidth="6.5" fill="rgba(255,255,255,0.2)" />
            {/* Ponteiro diamante da bússola inclinado 45 graus */}
            <path d="M50 26 L58 46 L50 44 Z" fill="#ffffff" />
            <path d="M50 74 L42 54 L50 56 Z" fill="rgba(255,255,255,0.7)" />
            <circle cx="50" cy="50" r="4.5" fill="#ffffff" />
          </svg>
        );

      // 10. CONECTAR PC (VNC / RDP) -> Monitor Desktop com suporte
      case 'vnc':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
            <defs>
              <linearGradient id="grad-vnc" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="50%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#f472b6" />
              </linearGradient>
            </defs>
            <rect width="100" height="100" rx="28" fill="url(#grad-vnc)" />
            <rect x="22" y="24" width="56" height="42" rx="10" stroke="#ffffff" strokeWidth="6.5" fill="rgba(255,255,255,0.25)" />
            {/* Suporte do monitor */}
            <path d="M50 66 L50 76" stroke="#ffffff" strokeWidth="6" strokeLinecap="round" />
            <path d="M38 76 L62 76" stroke="#ffffff" strokeWidth="6" strokeLinecap="round" />
            {/* Sinal Wi-Fi / Conexão dentro da tela */}
            <path d="M42 46 C47 42 53 42 58 46" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
            <circle cx="50" cy="52" r="2.5" fill="#ffffff" />
          </svg>
        );

      // 11. APLICAÇÕES WEB & SSL -> Globo com meridiano e escudo de segurança
      case 'webapps':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
            <defs>
              <linearGradient id="grad-webapps" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0ea5e9" />
                <stop offset="50%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#facc15" />
              </linearGradient>
            </defs>
            <rect width="100" height="100" rx="28" fill="url(#grad-webapps)" />
            <circle cx="50" cy="50" r="30" stroke="#ffffff" strokeWidth="6.5" fill="rgba(255,255,255,0.2)" />
            <ellipse cx="50" cy="50" rx="13" ry="30" stroke="#ffffff" strokeWidth="5.5" fill="none" />
            <path d="M20 50 L80 50" stroke="#ffffff" strokeWidth="5.5" strokeLinecap="round" />
          </svg>
        );

      // 12. CONFIGURAÇÕES DO PC & OS -> Engrenagem moderna com furo central
      case 'settings':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
            <defs>
              <linearGradient id="grad-settings" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#e11d48" />
                <stop offset="50%" stopColor="#fb923c" />
                <stop offset="100%" stopColor="#fde047" />
              </linearGradient>
            </defs>
            <rect width="100" height="100" rx="28" fill="url(#grad-settings)" />
            {/* Engrenagem suave */}
            <circle cx="50" cy="50" r="28" stroke="#ffffff" strokeWidth="6.5" fill="rgba(255,255,255,0.22)" strokeDasharray="14 8" />
            <circle cx="50" cy="50" r="16" stroke="#ffffff" strokeWidth="6" fill="none" />
            <circle cx="50" cy="50" r="7" fill="#ffffff" />
          </svg>
        );

      // 13. USUÁRIO & IDaaS -> Avatar de usuário com silhueta e crachá
      case 'user':
      case 'idaas':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
            <defs>
              <linearGradient id="grad-user" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#7c3aed" />
                <stop offset="50%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#f472b6" />
              </linearGradient>
            </defs>
            <rect width="100" height="100" rx="28" fill="url(#grad-user)" />
            {/* Cabeça do avatar */}
            <circle cx="50" cy="38" r="14" stroke="#ffffff" strokeWidth="6.5" fill="rgba(255,255,255,0.3)" />
            {/* Ombros / Corpo */}
            <path
              d="M26 76 C26 62 36 57 50 57 C64 57 74 62 74 76"
              stroke="#ffffff"
              strokeWidth="6.5"
              strokeLinecap="round"
              fill="rgba(255,255,255,0.25)"
            />
          </svg>
        );

      // Fallback gracioso com estrela suave
      default:
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
            <defs>
              <linearGradient id="grad-default" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="50%" stopColor="#ec4899" />
                <stop offset="100%" stopColor="#fbbf24" />
              </linearGradient>
            </defs>
            <rect width="100" height="100" rx="28" fill="url(#grad-default)" />
            <path
              d="M50 24 L56 40 L74 42 L60 54 L65 72 L50 62 L35 72 L40 54 L26 42 L44 40 Z"
              stroke="#ffffff"
              strokeWidth="6"
              strokeLinejoin="round"
              fill="rgba(255,255,255,0.3)"
            />
          </svg>
        );
    }
  };

  return (
    <div
      className={`relative select-none flex-shrink-0 transition-all duration-300 ease-out hover:scale-105 hover:-translate-y-1 active:scale-95 active:translate-y-0 cursor-pointer ${currentSize.box} ${className}`}
      style={{
        filter:
          'drop-shadow(0 6px 12px rgba(0, 0, 0, 0.28)) drop-shadow(0 2px 4px rgba(0, 0, 0, 0.18))',
      }}
    >
      <div className="w-full h-full overflow-hidden rounded-[inherit] relative shadow-inner">
        {renderIconSvg()}

        {/* Reflexo de luz suave superior (efeito vidro translúcido do pack) */}
        <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-white/25 via-white/10 to-transparent rounded-t-[inherit] pointer-events-none" />
      </div>

      {showBadge && (
        <div className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-gradient-to-r from-rose-500 to-red-600 text-white font-bold text-[10px] rounded-full flex items-center justify-center shadow-lg border border-white/80 animate-bounce z-20">
          {badgeContent || '1'}
        </div>
      )}
    </div>
  );
};

export default AppIcon;
