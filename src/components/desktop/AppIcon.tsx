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
 * IconsClub / Dezi Gallery 3D Skeuomorphic Squircle Icons
 *
 * Reproduz fielmente a estética visual premium solicitada pelo usuário:
 * - Squircles perfeitos com curvatura contínua (Apple-style squircle)
 * - Iluminação tridimensional realista, chanfros ópticos e relevo sutil
 * - Calculadora com teclas tácteis (+, ×, −, = laranja)
 * - Calendário com folha dobrada/destacável e tipografia de alto contraste
 * - Relógio analógico nítido com ponteiro de segundos azul elétrico
 * - Terminal obsidian com prompt neon verde '>_'
 * - Notas pautadas com linha de margem vermelha
 * - Zíper metálico para compactadores / ISO
 * - Engrenagem usinada de precisão para Configurações
 * - Foguete 3D inclinado para App Store / Flathub
 * - Lente óptica multi-revestida para Câmera / Máquinas Virtuais
 * - Envelope postal sombreado para WebApps / Email
 * - Nota musical brilhante com relevo para Multimídia
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

  // Render SVG correspondente à coleção de ícones de alta fidelidade
  const renderIconSvg = () => {
    switch (appId) {
      // 1. CALCULADORA -> Squircle preto fosco com botões tácteis (+, ×, −, = laranja)
      case 'calculator':
      case 'calc':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
            <defs>
              <linearGradient id="calc-bg" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#242426" />
                <stop offset="100%" stopColor="#121214" />
              </linearGradient>
              <linearGradient id="calc-btn-dark" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#48484a" />
                <stop offset="100%" stopColor="#2c2c2e" />
              </linearGradient>
              <linearGradient id="calc-btn-orange" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ff9f0a" />
                <stop offset="100%" stopColor="#e07b00" />
              </linearGradient>
              <filter id="calc-shadow" x="-10%" y="-10%" width="120%" height="130%">
                <feDropShadow dx="0" dy="2" stdDeviation="1.5" floodColor="#000" floodOpacity="0.4" />
              </filter>
            </defs>
            {/* Fundo Squircle */}
            <rect width="100" height="100" rx="28" fill="url(#calc-bg)" />
            {/* Grade de 4 botões redondos de alta definição */}
            <g filter="url(#calc-shadow)">
              <circle cx="31" cy="31" r="18" fill="url(#calc-btn-dark)" />
              <path d="M31 23 L31 39 M23 31 L39 31" stroke="#ffffff" strokeWidth="4.5" strokeLinecap="round" />
            </g>
            <g filter="url(#calc-shadow)">
              <circle cx="69" cy="31" r="18" fill="url(#calc-btn-dark)" />
              <path d="M62 24 L76 38 M76 24 L62 38" stroke="#ffffff" strokeWidth="4.5" strokeLinecap="round" />
            </g>
            <g filter="url(#calc-shadow)">
              <circle cx="31" cy="69" r="18" fill="url(#calc-btn-dark)" />
              <path d="M23 69 L39 69" stroke="#ffffff" strokeWidth="4.5" strokeLinecap="round" />
            </g>
            <g filter="url(#calc-shadow)">
              <circle cx="69" cy="69" r="18" fill="url(#calc-btn-orange)" />
              <path d="M61 65 L77 65 M61 73 L77 73" stroke="#ffffff" strokeWidth="4.5" strokeLinecap="round" />
            </g>
          </svg>
        );

      // 1.0 PROJETOS / DEVELOPER TOOLS (Apple Xcode / Developer Hammer - Fundo Azul com Martelo Branco)
      case 'projects':
      case 'developer':
      case 'tools':
      case 'build':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
            <defs>
              <linearGradient id="dev-hammer-bg" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#4da9ff" />
                <stop offset="50%" stopColor="#1e86ff" />
                <stop offset="100%" stopColor="#0b63d6" />
              </linearGradient>
              <filter id="hammer-shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="2.5" stdDeviation="2" floodColor="#002d72" floodOpacity="0.35" />
              </filter>
            </defs>
            {/* Fundo Azul Squircle Apple Developer */}
            <rect width="100" height="100" rx="28" fill="url(#dev-hammer-bg)" />
            {/* Martelo Branco Clássico Tilted */}
            <g filter="url(#hammer-shadow)">
              {/* Cabo do Martelo */}
              <path
                d="M32 78 L53 51"
                stroke="#ffffff"
                strokeWidth="7.5"
                strokeLinecap="round"
              />
              {/* Empunhadura inferior com detalhe arredondado */}
              <circle cx="30" cy="80.5" r="4" fill="#ffffff" />
              {/* Cabeça do Martelo / Bloco de impacto e garra curvada */}
              <path
                d="M44 40 L64 24 C67 21.5 71 22.5 72.5 25.5 L75 30.5 C76.5 33.5 75.5 37.5 72.5 39.5 L56 52.5"
                stroke="#ffffff"
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              {/* Face de impacto cilíndrica */}
              <path
                d="M41 42.5 L36 36 L43 31 L48 37.5 Z"
                fill="#ffffff"
                stroke="#ffffff"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              {/* Garra de fenda traseira */}
              <path
                d="M74 32 C82 35 84 44 80 50 C76 46 72 44 67 43"
                stroke="#ffffff"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </g>
          </svg>
        );

      // 1.1 MONITOR / TELEMETRIA & PERFORMANCE -> Verde Apple Vibrante com Raio Branco 3D
      case 'monitor':
      case 'telemetry':
      case 'performance':
      case 'fast':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
            <defs>
              <linearGradient id="bolt-bg" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#3cd563" />
                <stop offset="100%" stopColor="#22b548" />
              </linearGradient>
              <filter id="bolt-shadow" x="-10%" y="-10%" width="120%" height="120%">
                <feDropShadow dx="0" dy="2.5" stdDeviation="2" floodColor="#000" floodOpacity="0.25" />
              </filter>
            </defs>
            <rect width="100" height="100" rx="28" fill="url(#bolt-bg)" />
            {/* Raio Branco com pontas arredondadas e proporção exata da captura */}
            <g filter="url(#bolt-shadow)">
              <path
                d="M59 12 L26 56 C24.5 58 26 61 28.8 61 L43 61 L37 87 C36.2 90.5 40.5 92.5 42.8 89.8 L74 46 C75.5 44 74 41 71.2 41 L57 41 L63 14.8 C63.8 11.5 59.5 9.5 59 12 Z"
                fill="#ffffff"
                stroke="#ffffff"
                strokeWidth="4"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            </g>
          </svg>
        );

      // 2. CALENDÁRIO / DATA -> Folha branca com dobra / rasgo inferior e cabeçalho vermelho TUE / 9
      case 'calendar':
      case 'date':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
            <defs>
              <linearGradient id="cal-bg" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#ededed" />
              </linearGradient>
              <filter id="cal-shadow" x="-10%" y="-10%" width="120%" height="120%">
                <feDropShadow dx="0" dy="3" stdDeviation="2" floodColor="#000" floodOpacity="0.25" />
              </filter>
            </defs>
            <rect width="100" height="100" rx="28" fill="url(#cal-bg)" />
            {/* Efeito de folha destacada / sombra no canto inferior */}
            <path d="M80 82 C88 78 94 84 94 92 L76 92 C74 86 76 83 80 82 Z" fill="#b0b0b5" opacity="0.6" />
            {/* Texto TUE em Vermelho com linhas estilizadas */}
            <text x="50" y="30" textAnchor="middle" fill="#ff3b30" fontSize="16" fontWeight="900" fontFamily="-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif" letterSpacing="1.5">
              TUE
            </text>
            <line x1="26" y1="21" x2="74" y2="21" stroke="#ff3b30" strokeWidth="1.5" strokeOpacity="0.3" />
            <line x1="26" y1="33" x2="74" y2="33" stroke="#ff3b30" strokeWidth="1.5" strokeOpacity="0.3" />
            {/* Número 9 / Dia em preto bold */}
            <text x="50" y="77" textAnchor="middle" fill="#111111" fontSize="48" fontWeight="800" fontFamily="-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif">
              9
            </text>
          </svg>
        );

      // 3. RELÓGIO ANALÓGICO -> Marcadores nítidos 12, 3, 6, 9 e ponteiro de segundo azul vibrante
      case 'clock':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
            <defs>
              <linearGradient id="clock-bg" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#f3f3f5" />
              </linearGradient>
            </defs>
            <rect width="100" height="100" rx="28" fill="url(#clock-bg)" />
            {/* Números e pontos do mostrador */}
            <text x="50" y="24" textAnchor="middle" fill="#1c1c1e" fontSize="11" fontWeight="700" fontFamily="sans-serif">12</text>
            <text x="82" y="54" textAnchor="middle" fill="#1c1c1e" fontSize="11" fontWeight="700" fontFamily="sans-serif">3</text>
            <text x="50" y="84" textAnchor="middle" fill="#1c1c1e" fontSize="11" fontWeight="700" fontFamily="sans-serif">6</text>
            <text x="18" y="54" textAnchor="middle" fill="#1c1c1e" fontSize="11" fontWeight="700" fontFamily="sans-serif">9</text>
            <circle cx="50" cy="50" r="1.5" fill="#8e8e93" />
            {/* Marca d'água sutil / Tipografia decorativa */}
            <text x="50" y="44" textAnchor="middle" fill="#d1d1d6" fontSize="10" fontWeight="900" fontStyle="italic" opacity="0.6">inove</text>
            <text x="50" y="62" textAnchor="middle" fill="#d1d1d6" fontSize="10" fontWeight="900" fontStyle="italic" opacity="0.6">cloud</text>
            {/* Ponteiro das Horas (Preto) */}
            <line x1="50" y1="50" x2="35" y2="38" stroke="#1c1c1e" strokeWidth="4.5" strokeLinecap="round" />
            {/* Ponteiro dos Minutos (Preto) */}
            <line x1="50" y1="50" x2="68" y2="34" stroke="#1c1c1e" strokeWidth="3.5" strokeLinecap="round" />
            {/* Ponteiro dos Segundos (Azul Royal Elétrico) */}
            <line x1="50" y1="50" x2="74" y2="30" stroke="#007aff" strokeWidth="2" strokeLinecap="round" />
            <circle cx="50" cy="50" r="3.5" fill="#007aff" />
            <circle cx="50" cy="50" r="1.5" fill="#ffffff" />
          </svg>
        );

      // 4. TERMINAL SSH / SHELL -> Squircle Obsidian preto com prompt neon verde '>_'
      case 'terminal':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
            <defs>
              <linearGradient id="term-bg" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#1e1e20" />
                <stop offset="100%" stopColor="#0b0b0c" />
              </linearGradient>
              <filter id="term-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <rect width="100" height="100" rx="28" fill="url(#term-bg)" />
            {/* Borda interna acetinada */}
            <rect x="4" y="4" width="92" height="92" rx="24" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" />
            {/* Glifo >_ em Verde Neon vibrante com brilho */}
            <g filter="url(#term-glow)">
              {/* Chevron > */}
              <path
                d="M26 34 L46 50 L26 66"
                stroke="#30d158"
                strokeWidth="8.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Cursor Blinking _ */}
              <rect x="52" y="60" width="22" height="7.5" rx="3" fill="#30d158" />
            </g>
          </svg>
        );

      // 5. USUÁRIO & IDaaS / CONTA -> Azul Cobalto / Safira com avatar em relevo 3D
      case 'user':
      case 'idaas':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
            <defs>
              <linearGradient id="user-bg" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#0a84ff" />
                <stop offset="100%" stopColor="#0055d4" />
              </linearGradient>
              <filter id="user-shadow" x="-10%" y="-10%" width="120%" height="120%">
                <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.25" />
              </filter>
            </defs>
            <rect width="100" height="100" rx="28" fill="url(#user-bg)" />
            {/* Anel Externo Branco */}
            <g filter="url(#user-shadow)">
              <circle cx="50" cy="50" r="32" stroke="#ffffff" strokeWidth="6" fill="none" />
              {/* Cabeça do Avatar */}
              <circle cx="50" cy="40" r="10" fill="#ffffff" />
              {/* Ombros / Corpo */}
              <path
                d="M30 68 C30 56 38 52 50 52 C62 52 70 56 70 68 Z"
                fill="#ffffff"
              />
            </g>
          </svg>
        );

      // 6. GERADOR DE ISO / COMPACTADOR / ZIP (icpkg) -> Verde Relva com Zíper Metálico Central
      case 'isobuilder':
      case 'archive':
      case 'zip':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
            <defs>
              <linearGradient id="zip-bg" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#43b827" />
                <stop offset="100%" stopColor="#2e8019" />
              </linearGradient>
              <linearGradient id="metal-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="50%" stopColor="#d1d1d6" />
                <stop offset="100%" stopColor="#8e8e93" />
              </linearGradient>
            </defs>
            <rect width="100" height="100" rx="28" fill="url(#zip-bg)" />
            {/* Trilho do Zíper vertical */}
            <line x1="50" y1="12" x2="50" y2="88" stroke="#1e5c0e" strokeWidth="8" strokeLinecap="round" />
            {/* Dentes metálicos alternados do zíper */}
            <rect x="44" y="16" width="6" height="4" rx="1" fill="url(#metal-grad)" />
            <rect x="50" y="22" width="6" height="4" rx="1" fill="url(#metal-grad)" />
            <rect x="44" y="28" width="6" height="4" rx="1" fill="url(#metal-grad)" />
            <rect x="50" y="34" width="6" height="4" rx="1" fill="url(#metal-grad)" />
            <rect x="44" y="40" width="6" height="4" rx="1" fill="url(#metal-grad)" />
            <rect x="50" y="46" width="6" height="4" rx="1" fill="url(#metal-grad)" />
            <rect x="44" y="52" width="6" height="4" rx="1" fill="url(#metal-grad)" />
            <rect x="50" y="58" width="6" height="4" rx="1" fill="url(#metal-grad)" />
            {/* Cursor / Puxador do Zíper 3D */}
            <g filter="drop-shadow(0 2px 3px rgba(0,0,0,0.3))">
              <rect x="43" y="64" width="14" height="16" rx="4" fill="url(#metal-grad)" stroke="#ffffff" strokeWidth="1" />
              <rect x="46" y="67" width="8" height="10" rx="2" fill="#787880" />
            </g>
          </svg>
        );

      // 7. APLICAÇÕES WEB & MENSAGENS / EMAIL -> Azul Céu com Envelope Postal 3D Iluminado
      case 'webapps':
      case 'mail':
      case 'email':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
            <defs>
              <linearGradient id="mail-bg" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#0a84ff" />
                <stop offset="100%" stopColor="#0060df" />
              </linearGradient>
              <linearGradient id="mail-flap" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#dce8f8" />
              </linearGradient>
              <filter id="mail-shadow" x="-10%" y="-10%" width="120%" height="120%">
                <feDropShadow dx="0" dy="3" stdDeviation="2" floodColor="#000" floodOpacity="0.3" />
              </filter>
            </defs>
            <rect width="100" height="100" rx="28" fill="url(#mail-bg)" />
            {/* Envelope 3D com dobras e sombras */}
            <g filter="url(#mail-shadow)">
              {/* Corpo base do envelope */}
              <rect x="18" y="28" width="64" height="46" rx="9" fill="#93c5fd" />
              <rect x="18" y="28" width="64" height="46" rx="9" stroke="#ffffff" strokeWidth="2.5" fill="none" />
              {/* Dobra inferior com abas cruzadas */}
              <path d="M19 72 L44 48 L19 32" stroke="#60a5fa" strokeWidth="2" fill="none" />
              <path d="M81 72 L56 48 L81 32" stroke="#60a5fa" strokeWidth="2" fill="none" />
              <path d="M19 72 L50 47 L81 72" fill="#bfdbfe" opacity="0.9" />
              {/* Aba superior triangular aberta / translúcida */}
              <path
                d="M20 30 L50 56 L80 30 Z"
                fill="url(#mail-flap)"
                stroke="#ffffff"
                strokeWidth="2"
                strokeLinejoin="round"
              />
            </g>
          </svg>
        );

      // 8. NOTAS / LINUXPEDIA / DOCUMENTOS -> Folha de bloco pautada com margem vermelha
      case 'linuxpedia':
      case 'notes':
      case 'docs':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
            <defs>
              <linearGradient id="notes-bg" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#ededed" />
              </linearGradient>
            </defs>
            <rect width="100" height="100" rx="28" fill="url(#notes-bg)" />
            {/* Linhas horizontais pautadas de caderno */}
            <line x1="16" y1="28" x2="84" y2="28" stroke="#d1d1d6" strokeWidth="2" />
            <line x1="16" y1="40" x2="84" y2="40" stroke="#d1d1d6" strokeWidth="2" />
            <line x1="16" y1="52" x2="84" y2="52" stroke="#d1d1d6" strokeWidth="2" />
            <line x1="16" y1="64" x2="84" y2="64" stroke="#d1d1d6" strokeWidth="2" />
            <line x1="16" y1="76" x2="84" y2="76" stroke="#d1d1d6" strokeWidth="2" />
            {/* Linha vertical de margem em Vermelho Clássico */}
            <line x1="28" y1="12" x2="28" y2="88" stroke="#ff3b30" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        );

      // 8.1 GALERIA & EDITOR DE FOTOS PRO (Baseado na Foto 1: ProKnockout P-Cutout Gradient)
      case 'gallery':
      case 'photos':
      case 'proknockout':
      case 'photoeditor':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              {/* Mesh Gradiente vibrante: Topo-Esquerda Azul, Topo-Direita Coral/Laranja, Fundo Roxo/Violeta */}
              <linearGradient id="gallery-bg-base" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#5ba0f8" />
                <stop offset="35%" stopColor="#8752f3" />
                <stop offset="70%" stopColor="#9b2deb" />
                <stop offset="100%" stopColor="#7916e5" />
              </linearGradient>
              <radialGradient id="gallery-top-right" cx="95%" cy="5%" r="70%">
                <stop offset="0%" stopColor="#ff7b88" stopOpacity="0.95" />
                <stop offset="40%" stopColor="#ff8a65" stopOpacity="0.8" />
                <stop offset="80%" stopColor="#8a3ffc" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="gallery-top-left" cx="5%" cy="5%" r="65%">
                <stop offset="0%" stopColor="#4facfe" stopOpacity="0.95" />
                <stop offset="50%" stopColor="#00f2fe" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#5b51d8" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="gallery-bottom" cx="50%" cy="100%" r="70%">
                <stop offset="0%" stopColor="#6700ea" stopOpacity="1" />
                <stop offset="60%" stopColor="#8900f2" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#a100f2" stopOpacity="0" />
              </radialGradient>
              {/* Sombra de camada e profundidade para o recorte "P" */}
              <filter id="p-shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="2.5" stdDeviation="2.5" floodColor="#2a0060" floodOpacity="0.35" />
              </filter>
              <filter id="p-inner-layer-shadow" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="-1.5" dy="1.5" stdDeviation="2" floodColor="#1e0040" floodOpacity="0.25" />
              </filter>
            </defs>
            {/* Fundo Squircle com gradiente multi-fase */}
            <rect width="100" height="100" rx="28" fill="url(#gallery-bg-base)" />
            <rect width="100" height="100" rx="28" fill="url(#gallery-top-right)" />
            <rect width="100" height="100" rx="28" fill="url(#gallery-top-left)" />
            <rect width="100" height="100" rx="28" fill="url(#gallery-bottom)" />

            {/* Glifo "P" estilizado em 2 camadas cruzadas com recorte óptico (ProKnockout Cutout) */}
            <g filter="url(#p-shadow)">
              {/* Asa/Curva inferior esquerda que cruza por trás */}
              <path
                d="M16 66 C16.5 54 26 49 35 49 L50 49 C46 56 39 66 16 66 Z"
                fill="#ffffff"
                opacity="0.96"
              />
              {/* Corpo principal do "P": Loop superior contínuo que desce na ponta curva */}
              <path
                d="M50 16 C30 16 34 32 34 50 L34 84 C38 84 51 81 51 69 L51 49 C68 49 84 48 84 32.5 C84 17 68 16 50 16 Z M50 34 C58 34 66 34 66 32.5 C66 31 58 31 50 31 C46 31 46 34 50 34 Z"
                fill="#ffffff"
                fillRule="evenodd"
              />
              {/* Centro do laço 'P' vazado com suavidade exata */}
              <path
                d="M51 34 C57 34 66 36 66 43 C66 50 57 52 51 52 L51 34 Z"
                fill="none"
              />
              {/* Corpo do P de alto brilho com loop vazado central */}
              <path
                d="M 50 16.5 C 31.5 16.5 34 32 34 50 L 34 83.5 C 40 82 51 76 51 68 L 51 49 C 68 49 84 47 84 32.5 C 84 17 68 16.5 50 16.5 Z M 51 49 L 51 34 C 57 34 66 35.5 66 41.5 C 66 47.5 57 49 51 49 Z"
                fill="#ffffff"
              />
            </g>
          </svg>
        );

      // 8.2 PLAYER DE VÍDEO (Baseado na Foto 2: Red/Orange Gradient Clapper Play)
      case 'videoplayer':
      case 'videoeditor':
      case 'videoproducer':
      case 'video':
      case 'player':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              {/* Gradiente Solar Vibrante: Topo Laranja/Âmbar para Rodapé Rosa Neon/Magenta */}
              <linearGradient id="video-bg" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ff7a18" />
                <stop offset="35%" stopColor="#ff5232" />
                <stop offset="70%" stopColor="#ff1b6b" />
                <stop offset="100%" stopColor="#ea0069" />
              </linearGradient>
              <filter id="video-shadow" x="-15%" y="-15%" width="130%" height="130%">
                <feDropShadow dx="0" dy="3" stdDeviation="2.5" floodColor="#800020" floodOpacity="0.3" />
              </filter>
            </defs>
            {/* Fundo Squircle */}
            <rect width="100" height="100" rx="28" fill="url(#video-bg)" />

            {/* Ícone Retângulo de Vídeo com 3 janelas superiores e Play Central */}
            <g filter="url(#video-shadow)">
              {/* Cartão retangular arredondado principal (tela de vídeo/claquete) */}
              <rect x="20" y="24" width="60" height="52" rx="9" fill="#ffffff" />
              
              {/* 3 Janelas/Entalhes superiores recortados (estilo rolo de filme/timeline) */}
              <rect x="24" y="28" width="14" height="6.5" rx="1.8" fill="url(#video-bg)" />
              <rect x="42" y="28" width="15" height="6.5" rx="1.8" fill="url(#video-bg)" />
              <rect x="61" y="28" width="15" height="6.5" rx="1.8" fill="url(#video-bg)" />

              {/* Botão Play Triangular estilizado em degradê solar correspondente ao corte vazado */}
              <path
                d="M43 43 C43 41.5 44.6 40.5 45.9 41.3 L61.2 50.8 C62.4 51.5 62.4 53.3 61.2 54.1 L45.9 63.5 C44.6 64.3 43 63.3 43 61.8 Z"
                fill="url(#video-bg)"
              />
            </g>
          </svg>
        );

      // 9. PRODUTOR & PLAYER DE MÚSICA (Baseado na Foto 3: Red Squircle com Nota Musical 3D Apple-Style)
      case 'music':
      case 'audio':
      case 'musicproducer':
      case 'daw':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              {/* Fundo Vermelho Carmesim Vibrante de alta saturação */}
              <linearGradient id="music-red-bg" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ff334b" />
                <stop offset="50%" stopColor="#fa1938" />
                <stop offset="100%" stopColor="#e00024" />
              </linearGradient>
              {/* Sombra 3D realista da nota musical */}
              <filter id="music-note-shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="3.5" stdDeviation="2.5" floodColor="#60000e" floodOpacity="0.45" />
              </filter>
            </defs>
            {/* Fundo Squircle */}
            <rect width="100" height="100" rx="28" fill="url(#music-red-bg)" />

            {/* Glifo Exato da Nota Musical Dupla em Relevo Branco da Foto 3 */}
            <g filter="url(#music-note-shadow)">
              {/* Cabeça da nota esquerda (oval inclinada) */}
              <circle cx="46.5" cy="73.5" r="9" fill="#ffffff" />
              {/* Haste esquerda vertical */}
              <rect x="52" y="38" width="7" height="36" rx="2" fill="#ffffff" />

              {/* Cabeça da nota direita (oval inclinada) */}
              <circle cx="71.5" cy="67.5" r="9" fill="#ffffff" />
              {/* Haste direita vertical */}
              <rect x="77" y="34.5" width="7" height="34" rx="2" fill="#ffffff" />

              {/* Barra transversal superior em ângulo com acabamento arredondado */}
              <path
                d="M 52 42.5 L 84 34.5 L 84 43 L 52 51 Z"
                fill="#ffffff"
              />
              {/* Curvatura / corte elegante */}
              <path
                d="M 52 41 C 52 38.5 53.5 36.8 56 36 L 81 30.5 C 83.2 30 84 31.2 84 33.5 L 84 40.5 L 52 48.5 Z"
                fill="#ffffff"
              />
            </g>
          </svg>
        );

      // 10. MEUS ARQUIVOS / CLOUD STORAGE -> Fundo Branco com Pasta Azul e Lupa / Arquivo
      case 'storage':
      case 'files':
      case 'nautilus':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
            <defs>
              <linearGradient id="files-bg" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#f2f2f7" />
              </linearGradient>
              <linearGradient id="folder-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#007aff" />
                <stop offset="100%" stopColor="#005ecb" />
              </linearGradient>
              <filter id="folder-shadow" x="-10%" y="-10%" width="120%" height="120%">
                <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.2" />
              </filter>
            </defs>
            <rect width="100" height="100" rx="28" fill="url(#files-bg)" />
            {/* Pasta Azul Estilo Apple macOS Finder */}
            <g filter="url(#folder-shadow)">
              {/* Aba traseira da pasta */}
              <path d="M22 26 C22 23 24 21 27 21 L43 21 C45 21 48 23 50 25 L54 30 L77 30 C80 30 82 32 82 35 L82 72 C82 75 80 77 77 77 L27 77 C24 77 22 75 22 72 Z" fill="#0056b3" />
              {/* Aba frontal da pasta */}
              <path d="M18 35 C18 32 20 30 23 30 L77 30 C80 30 82 32 82 35 L82 72 C82 75 80 77 77 77 L23 77 C20 77 18 75 18 72 Z" fill="url(#folder-grad)" />
              {/* Lupa Branca Central */}
              <circle cx="48" cy="52" r="10" stroke="#ffffff" strokeWidth="4" fill="none" />
              <line x1="55" y1="59" x2="65" y2="69" stroke="#ffffff" strokeWidth="4.5" strokeLinecap="round" />
            </g>
          </svg>
        );

      // 11. CONFIGURAÇÕES & AJUSTES -> Metal Titanium Escovado com Engrenagem Mecânica 3D
      case 'settings':
      case 'control':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
            <defs>
              <linearGradient id="gear-bg" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#9a9a9e" />
                <stop offset="100%" stopColor="#636366" />
              </linearGradient>
              <linearGradient id="gear-metal" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#d1d1d6" />
              </linearGradient>
              <filter id="gear-shadow" x="-15%" y="-15%" width="130%" height="130%">
                <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.4" />
              </filter>
            </defs>
            <rect width="100" height="100" rx="28" fill="url(#gear-bg)" />
            {/* Engrenagem Mecânica de Precisão */}
            <g filter="url(#gear-shadow)">
              {/* Núcleo escuro rebaixado */}
              <circle cx="50" cy="50" r="22" fill="#3a3a3c" />
              {/* Dentes da engrenagem com anel chanfrado */}
              <circle
                cx="50"
                cy="50"
                r="30"
                stroke="url(#gear-metal)"
                strokeWidth="7.5"
                strokeDasharray="13 4"
                fill="none"
              />
              <circle cx="50" cy="50" r="16" stroke="url(#gear-metal)" strokeWidth="4.5" fill="none" />
              {/* Raios / 3 braços da engrenagem */}
              <line x1="50" y1="50" x2="50" y2="28" stroke="url(#gear-metal)" strokeWidth="4.5" strokeLinecap="round" />
              <line x1="50" y1="50" x2="31" y2="61" stroke="url(#gear-metal)" strokeWidth="4.5" strokeLinecap="round" />
              <line x1="50" y1="50" x2="69" y2="61" stroke="url(#gear-metal)" strokeWidth="4.5" strokeLinecap="round" />
              {/* Eixo central */}
              <circle cx="50" cy="50" r="5" fill="#3a3a3c" stroke="url(#gear-metal)" strokeWidth="2.5" />
            </g>
          </svg>
        );

      // 12. AGENTE IA / COPILOT / MENSAGENS -> Verde Esmeralda Apple com Balão de Chat Branco 3D
      case 'aiagent':
      case 'chat':
      case 'messages':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
            <defs>
              <linearGradient id="chat-bg" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#34c759" />
                <stop offset="100%" stopColor="#248a3d" />
              </linearGradient>
              <filter id="chat-shadow" x="-10%" y="-10%" width="120%" height="120%">
                <feDropShadow dx="0" dy="2.5" stdDeviation="2" floodColor="#000" floodOpacity="0.25" />
              </filter>
            </defs>
            <rect width="100" height="100" rx="28" fill="url(#chat-bg)" />
            {/* Balão de fala branco suave em relevo */}
            <g filter="url(#chat-shadow)">
              <path
                d="M50 18 C30 18 16 32 16 48 C16 57 21 65 29 70 C28 76 25 80 22 82 C28 82 36 79 41 75 C44 76 47 76 50 76 C70 76 84 62 84 48 C84 32 70 18 50 18 Z"
                fill="#ffffff"
              />
            </g>
          </svg>
        );

      // 13. CÂMERA HD -> Bisel de Titânio com Lente Óptica Reflexiva Multi-Revestida
      case 'camera':
      case 'photo':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
            <defs>
              <linearGradient id="lens-bezel" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#9a9a9e" />
                <stop offset="100%" stopColor="#636366" />
              </linearGradient>
              <linearGradient id="lens-glass" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#2c2c2e" />
                <stop offset="100%" stopColor="#000000" />
              </linearGradient>
              <radialGradient id="lens-flare" cx="50%" cy="30%" r="50%">
                <stop offset="0%" stopColor="#70a6ff" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#2a45a6" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0" />
              </radialGradient>
            </defs>
            <rect width="100" height="100" rx="28" fill="url(#lens-bezel)" />
            {/* Anel de metal externo */}
            <circle cx="50" cy="50" r="36" fill="#1c1c1e" stroke="#aeaeb2" strokeWidth="2" />
            <circle cx="50" cy="50" r="31" fill="#2c2c2e" />
            {/* Vidro óptico com tratamento anti-reflexo */}
            <circle cx="50" cy="50" r="26" fill="url(#lens-glass)" />
            {/* Reflexos esféricos azulados/prateados da lente */}
            <ellipse cx="50" cy="38" rx="16" ry="7" fill="url(#lens-flare)" />
            <ellipse cx="50" cy="62" rx="16" ry="7" fill="url(#lens-flare)" transform="rotate(180 50 62)" />
            {/* Pupila central */}
            <circle cx="50" cy="50" r="10" fill="#000000" />
            <circle cx="46" cy="46" r="3" fill="#ffffff" opacity="0.6" />
          </svg>
        );

      // 13.0 MÁQUINAS VIRTUAIS & KVM HYPERVISOR (vn) -> Azul Marinho / Indigo com Servidor Blade e Nodes Virtuais 3D
      case 'vn':
      case 'kvm':
      case 'virtualnode':
      case 'vms':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
            <defs>
              <linearGradient id="vn-kvm-bg" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#1e3a8a" />
                <stop offset="50%" stopColor="#1e293b" />
                <stop offset="100%" stopColor="#0f172a" />
              </linearGradient>
              <filter id="vn-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <rect width="100" height="100" rx="28" fill="url(#vn-kvm-bg)" />
            {/* Servidor Blade 1 (Superior) */}
            <g filter="url(#vn-glow)">
              <rect x="18" y="20" width="64" height="16" rx="4" fill="#334155" stroke="#38bdf8" strokeWidth="1.5" />
              <circle cx="26" cy="28" r="3" fill="#34d399" />
              <circle cx="35" cy="28" r="2.5" fill="#38bdf8" />
              <line x1="45" y1="28" x2="74" y2="28" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round" />
            </g>
            {/* Servidor Blade 2 (Central) */}
            <g filter="url(#vn-glow)">
              <rect x="18" y="42" width="64" height="16" rx="4" fill="#334155" stroke="#818cf8" strokeWidth="1.5" />
              <circle cx="26" cy="50" r="3" fill="#34d399" />
              <circle cx="35" cy="50" r="2.5" fill="#a855f7" />
              <line x1="45" y1="50" x2="74" y2="50" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round" />
            </g>
            {/* Servidor Blade 3 (Inferior) */}
            <g filter="url(#vn-glow)">
              <rect x="18" y="64" width="64" height="16" rx="4" fill="#334155" stroke="#38bdf8" strokeWidth="1.5" />
              <circle cx="26" cy="72" r="3" fill="#34d399" />
              <circle cx="35" cy="72" r="2.5" fill="#fbbf24" />
              <line x1="45" y1="72" x2="74" y2="72" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round" />
            </g>
          </svg>
        );

      // 13.1 VNC / CONECTAR PC REMOTO -> Azul Real com Computador Desktop 'www' 3D
      case 'vnc':
      case 'remote':
      case 'desktop-remote':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
            <defs>
              <linearGradient id="vnc-bg" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#007aff" />
                <stop offset="100%" stopColor="#005ecb" />
              </linearGradient>
              <filter id="vnc-shadow" x="-10%" y="-10%" width="120%" height="120%">
                <feDropShadow dx="0" dy="2.5" stdDeviation="2" floodColor="#000" floodOpacity="0.3" />
              </filter>
            </defs>
            <rect width="100" height="100" rx="28" fill="url(#vnc-bg)" />
            {/* Monitor iMac com www na tela e botão circular */}
            <g filter="url(#vnc-shadow)">
              {/* Moldura externa branca do monitor com suporte */}
              <path
                d="M20 18 C14.5 18 10 22.5 10 28 L10 66 C10 71.5 14.5 76 20 76 L43 76 L40 85 L33 85 C31.3 85 30 86.3 30 88 C30 89.7 31.3 91 33 91 L67 91 C68.7 91 70 89.7 70 88 C70 86.3 68.7 85 67 85 L60 85 L57 76 L80 76 C85.5 76 90 71.5 90 66 L90 28 C90 22.5 85.5 18 80 18 Z"
                fill="#ffffff"
              />
              {/* Área interna da tela em azul escuro suave */}
              <rect x="16" y="24" width="68" height="42" rx="4" fill="#0062db" />
              {/* Texto 'www' na tela */}
              <text
                x="50"
                y="52"
                textAnchor="middle"
                fill="#ffffff"
                fontSize="21"
                fontWeight="500"
                fontFamily="-apple-system, BlinkMacSystemFont, 'SF Pro Display', Roboto, sans-serif"
                letterSpacing="1"
              >
                www
              </text>
              {/* Ponto / botão indicador central no queixo do monitor */}
              <circle cx="50" cy="71" r="3" fill="#0062db" />
            </g>
          </svg>
        );

      // 14. FLATHUB / APP STORE (Oficial Flathub - https://flathub.org) -> Fundo Azul Oficial com 4 Glifos Geométricos Brancos (Círculo, Triângulo Play, Quadrado Squircle, Sinal +)
      case 'appstore':
      case 'flathub':
      case 'flatpak':
      case 'store':
      case 'launcher':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="flathub-bg" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#4A86CF" />
                <stop offset="100%" stopColor="#4B8FE2" />
              </linearGradient>
            </defs>
            {/* Fundo Oficial Flathub */}
            <rect width="100" height="100" rx="28" fill="url(#flathub-bg)" />

            {/* 1. Círculo Superior Esquerdo */}
            <circle cx="36" cy="36" r="11.8" fill="#FFFFFF" />

            {/* 2. Triângulo / Play Arredondado Superior Direito */}
            <path
              d="M 55.5 25.5 C 55.5 23.4 57.8 22.1 59.6 23.2 L 75.8 33.8 C 77.4 34.8 77.4 37.2 75.8 38.2 L 59.6 48.8 C 57.8 49.9 55.5 48.6 55.5 46.5 Z"
              fill="#FFFFFF"
            />

            {/* 3. Quadrado Arredondado / Squircle Inferior Esquerdo */}
            <rect x="25.5" y="52.5" width="21.5" height="21.5" rx="6.5" fill="#FFFFFF" />

            {/* 4. Sinal de Mais (+) Arredondado Inferior Direito */}
            <rect x="53" y="60.2" width="22" height="6.6" rx="3.3" fill="#FFFFFF" />
            <rect x="60.7" y="52.5" width="6.6" height="22" rx="3.3" fill="#FFFFFF" />
          </svg>
        );

      // 15. NAVEGADOR WEB / INTERNET (BROWSER) -> Azul Cobalto com Globo Terrestre e Continentes 3D
      case 'browser':
      case 'web':
      case 'internet':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
            <defs>
              <linearGradient id="globe-bg" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#0a84ff" />
                <stop offset="100%" stopColor="#005fd9" />
              </linearGradient>
              <filter id="globe-shadow" x="-10%" y="-10%" width="120%" height="120%">
                <feDropShadow dx="0" dy="2.5" stdDeviation="2.5" floodColor="#000" floodOpacity="0.3" />
              </filter>
            </defs>
            <rect width="100" height="100" rx="28" fill="url(#globe-bg)" />
            {/* Globo Terrestre com Continentes em Silhueta Branca Exata */}
            <g filter="url(#globe-shadow)">
              {/* Fundo do Globo */}
              <circle cx="50" cy="50" r="37" fill="#005fd9" />
              
              {/* Continentes recortados sobre o círculo */}
              <g clipPath="url(#globe-clip)">
                <clipPath id="globe-clip">
                  <circle cx="50" cy="50" r="37" />
                </clipPath>
                {/* América do Norte, Central e Groenlândia */}
                <path
                  d="M10 32 C14 26 22 18 30 14 C36 15 42 12 47 15 C48 19 43 23 41 27 C46 29 48 34 43 37 C37 39 34 33 27 36 C23 40 28 47 22 51 C18 49 14 41 10 32 Z"
                  fill="#ffffff"
                />
                {/* América do Sul */}
                <path
                  d="M23 52 C27 52 34 54 37 61 C39 69 36 79 31 85 C27 89 23 88 22 84 C20 78 18 70 20 62 C19 56 20 53 23 52 Z"
                  fill="#ffffff"
                />
                {/* Europa, África e Ásia */}
                <path
                  d="M55 12 C62 13 74 13 80 18 C87 23 89 29 89 39 C89 49 85 57 82 67 C78 79 72 85 66 87 C59 85 57 76 60 68 C62 62 68 55 66 47 C64 41 58 39 56 31 C54 25 52 17 55 12 Z"
                  fill="#ffffff"
                />
                {/* Ilhas e detalhes oceânicos */}
                <circle cx="48" cy="24" r="3" fill="#ffffff" />
                <path d="M12 42 C15 44 14 47 11 46 Z" fill="#ffffff" />
              </g>

              {/* Borda / Anel de acabamento brilhante do globo */}
              <circle cx="50" cy="50" r="37" stroke="#ffffff" strokeWidth="2.5" fill="none" opacity="0.95" />
            </g>
          </svg>
        );

      // 16. PREFERÊNCIAS / SWITCHES (Interruptores ON / OFF)
      case 'switches':
      case 'toggles':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
            <defs>
              <linearGradient id="switch-bg" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#f2f2f7" />
              </linearGradient>
            </defs>
            <rect width="100" height="100" rx="28" fill="url(#switch-bg)" />
            {/* Interruptor Superior LIGADO (Azul) */}
            <g filter="drop-shadow(0 2px 3px rgba(0,0,0,0.15))">
              <rect x="20" y="24" width="60" height="24" rx="12" fill="#007aff" />
              <circle cx="68" cy="36" r="10" fill="#ffffff" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.25))" />
            </g>
            {/* Interruptor Inferior DESLIGADO (Cinza Claro) */}
            <g filter="drop-shadow(0 2px 3px rgba(0,0,0,0.15))">
              <rect x="20" y="52" width="60" height="24" rx="12" fill="#e5e5ea" />
              <circle cx="32" cy="64" r="10" fill="#ffffff" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.2))" />
            </g>
          </svg>
        );

      // 18. TEMAS & WALLPAPERS / PERSONALIZAÇÃO -> Gradiente Multi-Cor Vibrante com Pincel 3D
      case 'themes':
      case 'theme':
      case 'wallpaper':
      case 'personalization':
      case 'appearance':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
            <defs>
              {/* Mesh multi-gradiente de 4 cantos correspondente à captura */}
              <linearGradient id="theme-base" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ff0066" />
                <stop offset="30%" stopColor="#aa00ff" />
                <stop offset="70%" stopColor="#0066ff" />
                <stop offset="100%" stopColor="#00e5a3" />
              </linearGradient>
              <radialGradient id="mesh-pink" cx="15%" cy="15%" r="65%">
                <stop offset="0%" stopColor="#ff1493" stopOpacity="1" />
                <stop offset="60%" stopColor="#ff0055" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#ff0000" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="mesh-blue" cx="85%" cy="15%" r="65%">
                <stop offset="0%" stopColor="#1e3a8a" stopOpacity="0.9" />
                <stop offset="50%" stopColor="#2563eb" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="mesh-cyan" cx="85%" cy="85%" r="65%">
                <stop offset="0%" stopColor="#00f5a0" stopOpacity="1" />
                <stop offset="55%" stopColor="#00d8f6" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="mesh-red" cx="15%" cy="85%" r="65%">
                <stop offset="0%" stopColor="#ff1111" stopOpacity="1" />
                <stop offset="55%" stopColor="#e11d48" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#9f1239" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="brush-frost" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
                <stop offset="50%" stopColor="#ffffff" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0.45" />
              </linearGradient>
              <filter id="brush-shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="3.5" stdDeviation="2.5" floodColor="#000000" floodOpacity="0.35" />
              </filter>
            </defs>
            {/* Fundo Squircle com blend multi-color */}
            <rect width="100" height="100" rx="28" fill="url(#theme-base)" />
            <rect width="100" height="100" rx="28" fill="url(#mesh-pink)" />
            <rect width="100" height="100" rx="28" fill="url(#mesh-blue)" />
            <rect width="100" height="100" rx="28" fill="url(#mesh-cyan)" />
            <rect width="100" height="100" rx="28" fill="url(#mesh-red)" />

            {/* Pincel / Espátula de pintura 3D */}
            <g filter="url(#brush-shadow)">
              {/* Bloco superior de cerdas / corpo com gradiente translúcido */}
              <rect x="29" y="24" width="42" height="29" rx="6" fill="url(#brush-frost)" />
              {/* Linha de reflexo sutil no topo do bloco de cerdas */}
              <rect x="31" y="26" width="38" height="2" rx="1" fill="#ffffff" fillOpacity="0.8" />

              {/* Base sólida branca do pincel (ferrule) + cabo inferior arredondado */}
              <path
                d="M33 52 C30.2 52 28 54.2 28 57 C28 59.8 30.2 62 33 62 L43 62 L43 78 C43 82 46 85 50 85 C54 85 57 82 57 78 L57 62 L67 62 C69.8 62 72 59.8 72 57 C72 54.2 69.8 52 67 52 Z"
                fill="#ffffff"
              />
            </g>
          </svg>
        );

      // 17. PREVISÃO DO TEMPO / WEATHER -> Azul Cerúleo com Sol Dourado e Nuvem 3D Macia
      case 'weather':
      default:
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
            <defs>
              <linearGradient id="weather-bg" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#3ca5ff" />
                <stop offset="100%" stopColor="#007aff" />
              </linearGradient>
              <linearGradient id="sun-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffdf00" />
                <stop offset="100%" stopColor="#ff9500" />
              </linearGradient>
              <filter id="cloud-shadow" x="-10%" y="-10%" width="120%" height="120%">
                <feDropShadow dx="0" dy="3" stdDeviation="2.5" floodColor="#000" floodOpacity="0.25" />
              </filter>
            </defs>
            <rect width="100" height="100" rx="28" fill="url(#weather-bg)" />
            {/* Sol Brilhante ao fundo */}
            <circle cx="68" cy="38" r="15" fill="url(#sun-grad)" filter="drop-shadow(0 0 8px #ffcc00)" />
            {/* Nuvem Branca Flutuante 3D */}
            <g filter="url(#cloud-shadow)">
              <path
                d="M32 72 L72 72 C79 72 84 66 84 59 C84 53 79 48 73 48 C72 41 66 36 58 36 C52 36 47 40 45 44 C42 42 38 42 35 44 C30 46 26 51 26 57 C26 65 31 72 32 72 Z"
                fill="#ffffff"
              />
            </g>
          </svg>
        );
    }
  };

  return (
    <div
      className={`relative select-none flex-shrink-0 transition-all duration-300 ease-out hover:scale-110 hover:-translate-y-1.5 active:scale-95 active:translate-y-0 cursor-pointer ${currentSize.box} ${className}`}
      style={{
        filter:
          'drop-shadow(0 8px 16px rgba(0, 0, 0, 0.32)) drop-shadow(0 2px 4px rgba(0, 0, 0, 0.18))',
      }}
    >
      <div className="w-full h-full overflow-hidden rounded-[inherit] relative shadow-inner ring-1 ring-white/20">
        {renderIconSvg()}

        {/* Reflexo de vidro líquido / specular highlights estilo Apple & Dezi Gallery */}
        <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/30 via-white/10 to-transparent rounded-t-[inherit] pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-black/15 to-transparent rounded-b-[inherit] pointer-events-none" />
      </div>

      {showBadge && (
        <div className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-gradient-to-r from-rose-500 to-red-600 text-white font-bold text-[10px] rounded-full flex items-center justify-center shadow-lg border border-white/80 animate-bounce z-20">
          {badgeContent || '1'}
        </div>
      )}
    </div>
  );
};

export const FlathubIcon: React.FC<{ className?: string; rx?: number | string }> = ({
  className = 'w-6 h-6',
  rx = 22,
}) => (
  <svg
    viewBox="0 0 100 100"
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="flathub-direct-bg" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#4A86CF" />
        <stop offset="100%" stopColor="#4B8FE2" />
      </linearGradient>
    </defs>
    {/* Fundo Azul Flathub */}
    <rect width="100" height="100" rx={rx} fill="url(#flathub-direct-bg)" />

    {/* 1. Círculo Superior Esquerdo */}
    <circle cx="36" cy="36" r="11.8" fill="#FFFFFF" />

    {/* 2. Triângulo / Play Arredondado Superior Direito */}
    <path
      d="M 55.5 25.5 C 55.5 23.4 57.8 22.1 59.6 23.2 L 75.8 33.8 C 77.4 34.8 77.4 37.2 75.8 38.2 L 59.6 48.8 C 57.8 49.9 55.5 48.6 55.5 46.5 Z"
      fill="#FFFFFF"
    />

    {/* 3. Quadrado Arredondado / Squircle Inferior Esquerdo */}
    <rect x="25.5" y="52.5" width="21.5" height="21.5" rx="6.5" fill="#FFFFFF" />

    {/* 4. Sinal de Mais (+) Arredondado Inferior Direito */}
    <rect x="53" y="60.2" width="22" height="6.6" rx="3.3" fill="#FFFFFF" />
    <rect x="60.7" y="52.5" width="6.6" height="22" rx="3.3" fill="#FFFFFF" />
  </svg>
);

export default AppIcon;
