import React from 'react';

interface RealAppIconProps {
  type: string;
  className?: string;
  size?: number | string;
  rounded?: string;
}

export const RealAppIcon: React.FC<RealAppIconProps> = ({
  type,
  className = 'w-16 h-16',
  rounded = 'rounded-2xl',
}) => {
  switch (type.toLowerCase()) {
    // 1. FLATHUB OFFICIAL LOGO
    case 'flathub':
      return (
        <div className={`${className} ${rounded} bg-[#4A86CF] flex items-center justify-center p-2 shrink-0 shadow-md`}>
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
            <circle cx="36" cy="36" r="11.8" fill="#FFFFFF" />
            <path
              d="M 55.5 25.5 C 55.5 23.4 57.8 22.1 59.6 23.2 L 75.8 33.8 C 77.4 34.8 77.4 37.2 75.8 38.2 L 59.6 48.8 C 57.8 49.9 55.5 48.6 55.5 46.5 Z"
              fill="#FFFFFF"
            />
            <rect x="25.5" y="52.5" width="21.5" height="21.5" rx="6.5" fill="#FFFFFF" />
            <rect x="53" y="60.2" width="22" height="6.6" rx="3.3" fill="#FFFFFF" />
            <rect x="60.7" y="52.5" width="6.6" height="22" rx="3.3" fill="#FFFFFF" />
          </svg>
        </div>
      );

    // 2. ANDROID STUDIO
    case 'android-studio':
      return (
        <div className={`${className} ${rounded} bg-[#3DDC84]/10 border border-[#3DDC84]/30 flex items-center justify-center p-2.5 shrink-0`}>
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
            <circle cx="50" cy="50" r="44" fill="#3DDC84" />
            {/* Compass & Robot Legs */}
            <path d="M50 22 L30 76 L40 76 L46 58 L54 58 L60 76 L70 76 Z" fill="#202124" />
            <circle cx="50" cy="40" r="7" fill="#4285F4" />
            <rect x="42" y="52" width="16" height="4" rx="2" fill="#FFFFFF" />
          </svg>
        </div>
      );

    // 3. LASER (CD Ripper)
    case 'laser':
      return (
        <div className={`${className} ${rounded} bg-gradient-to-br from-[#42424a] to-[#2b2b32] flex items-center justify-center p-2 shrink-0 border border-white/10 shadow-lg`}>
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
            {/* CD Disc */}
            <circle cx="50" cy="50" r="38" fill="#D2D6DC" />
            <circle cx="50" cy="50" r="34" fill="none" stroke="#E5E7EB" strokeWidth="2" />
            <path d="M 50 16 A 34 34 0 0 1 78 68 L 65 59 A 18 18 0 0 0 50 32 Z" fill="#93C5FD" opacity="0.6" />
            <path d="M 50 84 A 34 34 0 0 1 22 32 L 35 41 A 18 18 0 0 0 50 68 Z" fill="#FCA5A5" opacity="0.6" />
            <circle cx="50" cy="50" r="14" fill="#4B5563" />
            <circle cx="50" cy="50" r="8" fill="#1F2937" />
            {/* Red recording LED */}
            <circle cx="78" cy="78" r="6" fill="#EF4444" />
            <circle cx="78" cy="78" r="3" fill="#FCA5A5" />
          </svg>
        </div>
      );

    // 4. SOBER (Roblox)
    case 'sober':
      return (
        <div className={`${className} ${rounded} bg-gradient-to-br from-[#53b848] to-[#3a9630] flex items-center justify-center p-2 shrink-0 shadow-md`}>
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
            {/* Roblox tilted cube icon */}
            <rect
              x="25"
              y="25"
              width="50"
              height="50"
              rx="8"
              transform="rotate(18 50 50)"
              fill="#2E7D32"
            />
            <rect
              x="38"
              y="38"
              width="24"
              height="24"
              rx="4"
              transform="rotate(18 50 50)"
              fill="#1B5E20"
            />
          </svg>
        </div>
      );

    // 5. FIREFOX
    case 'firefox':
      return (
        <div className={`${className} ${rounded} bg-gradient-to-br from-[#FF3B00] via-[#FF8800] to-[#8000FF] flex items-center justify-center p-2 shrink-0 shadow-md`}>
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
            {/* Firefox Globe and Fox */}
            <circle cx="50" cy="50" r="38" fill="#0055D4" />
            <path
              d="M 22 36 C 28 20, 52 14, 68 22 C 84 30, 88 52, 78 68 C 70 82, 50 88, 34 82 C 24 76, 18 64, 20 52 C 24 64, 38 72, 52 70 C 66 68, 74 56, 70 42 C 68 34, 60 28, 50 28 C 38 28, 26 38, 22 36 Z"
              fill="#FF9500"
            />
            <path
              d="M 50 28 C 42 28, 34 34, 30 42 C 32 40, 36 38, 42 40 C 34 46, 32 58, 38 66 C 42 72, 50 74, 58 72 C 68 68, 72 56, 68 46 C 64 36, 56 30, 50 28 Z"
              fill="#FFD200"
            />
          </svg>
        </div>
      );

    // 6. DISCORD
    case 'discord':
      return (
        <div className={`${className} ${rounded} bg-[#5865F2] flex items-center justify-center p-2.5 shrink-0 shadow-md`}>
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="white">
            <path d="M78 28 C72 25 66 23 59 22 C58 24 57 27 56 29 C49 28 42 28 36 29 C35 27 34 24 33 22 C26 23 20 25 14 28 C3 44 0 60 2 76 C9 81 16 85 23 87 C25 84 27 81 28 78 C25 77 23 76 21 74 C21 74 22 74 22 73 C37 80 54 80 69 73 C70 74 70 74 71 74 C69 76 66 77 64 78 C65 81 67 84 69 87 C76 85 83 81 90 76 C92 57 87 42 78 28 Z M35 64 C30 64 26 60 26 55 C26 50 30 46 35 46 C40 46 44 50 44 55 C44 60 40 64 35 64 Z M57 64 C52 64 48 60 48 55 C48 50 52 46 57 46 C62 46 66 50 66 55 C66 60 62 64 57 64 Z" />
          </svg>
        </div>
      );

    // 7. GOOGLE CHROME
    case 'chrome':
      return (
        <div className={`${className} ${rounded} bg-white flex items-center justify-center p-2 shrink-0 shadow-md`}>
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle cx="50" cy="50" r="42" fill="#EA4335" />
            <path d="M 50 50 L 86.4 50 A 42 42 0 0 1 50 92 L 29 55.6 Z" fill="#34A853" />
            <path d="M 50 50 L 29 55.6 A 42 42 0 0 1 50 8 L 71 44.4 Z" fill="#FBBC05" />
            <circle cx="50" cy="50" r="22" fill="#FFFFFF" />
            <circle cx="50" cy="50" r="16" fill="#4285F4" />
          </svg>
        </div>
      );

    // 8. BRAVE
    case 'brave':
      return (
        <div className={`${className} ${rounded} bg-gradient-to-br from-[#FB542B] to-[#FF2E00] flex items-center justify-center p-2.5 shrink-0 shadow-md`}>
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="white">
            {/* Brave Lion Head outline */}
            <path d="M50 12 L72 28 L66 48 L76 66 L50 90 L24 66 L34 48 L28 28 Z" fill="white" />
            <path d="M50 26 L64 36 L50 48 L36 36 Z" fill="#FB542B" />
            <circle cx="42" cy="50" r="4" fill="#FB542B" />
            <circle cx="58" cy="50" r="4" fill="#FB542B" />
            <path d="M46 64 L50 68 L54 64 L50 60 Z" fill="#FB542B" />
          </svg>
        </div>
      );

    // 9. GARRAFAS (Bottles)
    case 'bottles':
      return (
        <div className={`${className} ${rounded} bg-[#32303c] flex items-center justify-center p-2 shrink-0 shadow-md border border-white/10`}>
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
            {/* Yellow bottle */}
            <rect x="22" y="36" width="16" height="42" rx="4" fill="#FBBF24" />
            <rect x="26" y="24" width="8" height="12" rx="2" fill="#F59E0B" />
            {/* Blue bottle */}
            <rect x="42" y="28" width="16" height="50" rx="4" fill="#38BDF8" />
            <rect x="46" y="16" width="8" height="12" rx="2" fill="#0284C7" />
            {/* Red bottle */}
            <rect x="62" y="34" width="16" height="44" rx="4" fill="#F87171" />
            <rect x="66" y="22" width="8" height="12" rx="2" fill="#DC2626" />
          </svg>
        </div>
      );

    // 10. SPOTIFY
    case 'spotify':
      return (
        <div className={`${className} ${rounded} bg-[#1DB954] flex items-center justify-center p-2.5 shrink-0 shadow-md`}>
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="#121212">
            <path d="M 28 38 C 44 32, 64 34, 76 42" stroke="#121212" strokeWidth="9" strokeLinecap="round" fill="none" />
            <path d="M 32 50 C 46 45, 62 47, 72 54" stroke="#121212" strokeWidth="7.5" strokeLinecap="round" fill="none" />
            <path d="M 35 62 C 46 58, 59 60, 68 65" stroke="#121212" strokeWidth="6" strokeLinecap="round" fill="none" />
          </svg>
        </div>
      );

    // 11. VLC
    case 'vlc':
      return (
        <div className={`${className} ${rounded} bg-[#282630] flex items-center justify-center p-2 shrink-0 border border-white/10 shadow-md`}>
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
            {/* Traffic Cone */}
            <path d="M 44 14 L 56 14 L 62 36 L 38 36 Z" fill="#FF8800" />
            <path d="M 38 36 L 62 36 L 67 54 L 33 54 Z" fill="#FFFFFF" />
            <path d="M 33 54 L 67 54 L 72 72 L 28 72 Z" fill="#FF8800" />
            <path d="M 28 72 L 72 72 L 75 80 L 25 80 Z" fill="#FFFFFF" />
            <rect x="18" y="80" width="64" height="8" rx="4" fill="#FF8800" />
          </svg>
        </div>
      );

    // 12. STEAM
    case 'steam':
      return (
        <div className={`${className} ${rounded} bg-gradient-to-br from-[#171a21] via-[#1b2838] to-[#2a475e] flex items-center justify-center p-2 shrink-0 shadow-md border border-white/10`}>
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="white">
            <circle cx="50" cy="50" r="42" fill="none" stroke="white" strokeWidth="4" />
            <circle cx="68" cy="38" r="12" fill="white" />
            <circle cx="68" cy="38" r="7" fill="#1b2838" />
            <path d="M 38 68 L 68 38" stroke="white" strokeWidth="10" strokeLinecap="round" />
            <circle cx="38" cy="68" r="16" fill="white" />
            <circle cx="38" cy="68" r="10" fill="#1b2838" />
          </svg>
        </div>
      );

    // 13. HEROIC
    case 'heroic':
      return (
        <div className={`${className} ${rounded} bg-[#14151C] flex items-center justify-center p-2 shrink-0 shadow-md border border-white/10`}>
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
            {/* Shield with sword */}
            <path d="M 50 14 L 80 26 C 80 60, 50 86, 50 86 C 50 86, 20 60, 20 26 Z" fill="#0078F2" />
            <path d="M 50 28 L 50 72 M 42 38 L 58 38 M 46 76 L 54 76" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" />
          </svg>
        </div>
      );

    // 14. FLATSEAL
    case 'flatseal':
      return (
        <div className={`${className} ${rounded} bg-[#4A4755] flex items-center justify-center p-2.5 shrink-0 shadow-md`}>
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
            {/* Tape Roll */}
            <circle cx="50" cy="50" r="36" fill="#F0ECE1" />
            <circle cx="50" cy="50" r="22" fill="#D8D0C5" />
            <circle cx="50" cy="50" r="14" fill="#8C7A6B" />
            <path d="M 50 86 L 82 86 L 86 64 L 50 86 Z" fill="#F0ECE1" />
          </svg>
        </div>
      );

    // 15. OBS STUDIO
    case 'obs':
      return (
        <div className={`${className} ${rounded} bg-[#212126] flex items-center justify-center p-2.5 shrink-0 shadow-md border border-white/10`}>
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
            {/* OBS 3-swirl logo */}
            <circle cx="50" cy="50" r="42" stroke="white" strokeWidth="5" />
            <circle cx="50" cy="36" r="12" fill="white" />
            <circle cx="38" cy="58" r="12" fill="white" />
            <circle cx="62" cy="58" r="12" fill="white" />
          </svg>
        </div>
      );

    // 16. PRISM LAUNCHER
    case 'prismlauncher':
      return (
        <div className={`${className} ${rounded} bg-[#1E232A] flex items-center justify-center p-2 shrink-0 shadow-md border border-white/10`}>
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
            {/* Isometric Minecraft Grass Prism */}
            <path d="M 50 18 L 82 36 L 50 54 L 18 36 Z" fill="#66BB6A" />
            <path d="M 18 36 L 50 54 L 50 82 L 18 64 Z" fill="#8D6E63" />
            <path d="M 82 36 L 50 54 L 50 82 L 82 64 Z" fill="#6D4C41" />
            {/* Prism triangle highlight */}
            <polygon points="50,28 66,42 34,42" fill="#C8E6C9" opacity="0.8" />
          </svg>
        </div>
      );

    // 17. SEABIRD (Kubernetes)
    case 'seabird':
      return (
        <div className={`${className} ${rounded} bg-[#2563EB] flex items-center justify-center p-2 shrink-0 shadow-md`}>
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
            <circle cx="50" cy="50" r="40" fill="#1D4ED8" />
            {/* Seagull head / K8s helm icon */}
            <path d="M 32 38 C 32 26, 68 26, 68 38 L 68 68 C 68 76, 32 76, 32 68 Z" fill="white" />
            <polygon points="50,56 42,70 58,70" fill="#F59E0B" />
            <circle cx="42" cy="44" r="3" fill="#1E293B" />
            <circle cx="58" cy="44" r="3" fill="#1E293B" />
          </svg>
        </div>
      );

    // 18. RUFIN (Record player)
    case 'rufin':
      return (
        <div className={`${className} ${rounded} bg-[#EA580C] flex items-center justify-center p-2 shrink-0 shadow-md`}>
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
            {/* Turntable */}
            <circle cx="46" cy="50" r="30" fill="#1E293B" />
            <circle cx="46" cy="50" r="22" fill="none" stroke="#334155" strokeWidth="2" />
            <circle cx="46" cy="50" r="10" fill="#DC2626" />
            <circle cx="46" cy="50" r="3" fill="white" />
            {/* Tonearm */}
            <path d="M 76 26 L 76 46 L 56 60" stroke="white" strokeWidth="4" strokeLinecap="round" />
            <circle cx="76" cy="26" r="6" fill="#94A3B8" />
          </svg>
        </div>
      );

    // 19. FOTOS (GNOME Loupe)
    case 'fotos':
      return (
        <div className={`${className} ${rounded} bg-gradient-to-br from-[#E11D48] via-[#FB7185] to-[#F43F5E] flex items-center justify-center p-2 shrink-0 shadow-md`}>
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
            <rect x="18" y="22" width="64" height="56" rx="8" fill="#1E293B" />
            <circle cx="34" cy="38" r="6" fill="#FACC15" />
            <polygon points="26,68 46,44 62,60 74,48 82,68" fill="#38BDF8" />
          </svg>
        </div>
      );

    // 20. GITTE (Bell Git)
    case 'gitte':
      return (
        <div className={`${className} ${rounded} bg-gradient-to-br from-[#F59E0B] to-[#D97706] flex items-center justify-center p-2 shrink-0 shadow-md`}>
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
            {/* Golden bell */}
            <path d="M 50 18 C 36 18, 30 36, 26 58 L 20 68 L 80 68 L 74 58 C 70 36, 64 18, 50 18 Z" fill="#FDE047" stroke="#CA8A04" strokeWidth="3" />
            <rect x="28" y="68" width="44" height="8" rx="4" fill="#EAB308" />
            <circle cx="50" cy="14" r="5" fill="#EAB308" />
            <circle cx="50" cy="50" r="4" fill="#854D0E" />
            <path d="M 40 56 L 50 50 L 60 56" stroke="#854D0E" strokeWidth="3" fill="none" />
          </svg>
        </div>
      );

    // 21. SKRIBISTO
    case 'skribisto':
      return (
        <div className={`${className} ${rounded} bg-gradient-to-br from-[#15803D] to-[#166534] flex items-center justify-center p-2 shrink-0 shadow-md`}>
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
            <circle cx="50" cy="50" r="38" fill="#0284C7" />
            <path d="M 24 50 C 32 32, 68 32, 76 50 C 68 68, 32 68, 24 50 Z" fill="#22C55E" opacity="0.8" />
            {/* Quill pen */}
            <path d="M 76 22 L 32 68 L 26 76 L 34 70 L 76 22 Z" fill="#F97316" stroke="white" strokeWidth="2" />
          </svg>
        </div>
      );

    // 22. FLOOD IT
    case 'floodit':
      return (
        <div className={`${className} ${rounded} bg-[#1F2937] flex items-center justify-center p-2 shrink-0 shadow-md border border-white/10`}>
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* 3x3 Grid of color tiles */}
            <rect x="18" y="18" width="18" height="18" rx="4" fill="#EF4444" />
            <rect x="41" y="18" width="18" height="18" rx="4" fill="#F59E0B" />
            <rect x="64" y="18" width="18" height="18" rx="4" fill="#10B981" />
            <rect x="18" y="41" width="18" height="18" rx="4" fill="#EC4899" />
            <rect x="41" y="41" width="18" height="18" rx="4" fill="#3B82F6" />
            <rect x="64" y="41" width="18" height="18" rx="4" fill="#8B5CF6" />
            <rect x="18" y="64" width="18" height="18" rx="4" fill="#F97316" />
            <rect x="41" y="64" width="18" height="18" rx="4" fill="#06B6D4" />
            <rect x="64" y="64" width="18" height="18" rx="4" fill="#84CC16" />
          </svg>
        </div>
      );

    // 23. RATIC
    case 'ratic':
      return (
        <div className={`${className} ${rounded} bg-[#115E59] flex items-center justify-center p-2 shrink-0 shadow-md`}>
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
            {/* Mandala floral shape with music note */}
            <circle cx="50" cy="50" r="38" stroke="#2DD4BF" strokeWidth="3" />
            <path d="M 50 14 L 60 40 L 86 50 L 60 60 L 50 86 L 40 60 L 14 50 L 40 40 Z" stroke="#5EEAD4" strokeWidth="3" fill="none" />
            <circle cx="44" cy="58" r="6" fill="#2DD4BF" />
            <circle cx="60" cy="52" r="6" fill="#2DD4BF" />
            <path d="M 50 58 L 50 36 L 66 32 L 66 52" stroke="#2DD4BF" strokeWidth="4" strokeLinecap="round" />
          </svg>
        </div>
      );

    // 24. TYPINGMASTER
    case 'typingmaster':
      return (
        <div className={`${className} ${rounded} bg-[#FBBF24] flex items-center justify-center p-2 shrink-0 shadow-md`}>
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
            <rect x="18" y="28" width="64" height="44" rx="8" fill="#18181B" />
            {/* Keyboard keys */}
            <circle cx="28" cy="40" r="3" fill="white" />
            <circle cx="38" cy="40" r="3" fill="white" />
            <circle cx="48" cy="40" r="3" fill="white" />
            <circle cx="58" cy="40" r="3" fill="white" />
            <circle cx="68" cy="40" r="3" fill="white" />
            <circle cx="30" cy="50" r="3" fill="white" />
            <circle cx="40" cy="50" r="3" fill="white" />
            <circle cx="50" cy="50" r="3" fill="white" />
            <circle cx="60" cy="50" r="3" fill="white" />
            <circle cx="70" cy="50" r="3" fill="white" />
            <rect x="36" y="60" width="28" height="4" rx="2" fill="white" />
          </svg>
        </div>
      );

    // 25. MORSE
    case 'morse':
      return (
        <div className={`${className} ${rounded} bg-[#78350F] flex items-center justify-center p-2 shrink-0 shadow-md`}>
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
            {/* Morse Key */}
            <rect x="16" y="46" width="68" height="34" rx="6" fill="#451A03" stroke="#92400E" strokeWidth="2" />
            <rect x="22" y="38" width="56" height="8" rx="2" fill="#D97706" />
            <circle cx="30" cy="30" r="8" fill="#F59E0B" />
            <circle cx="68" cy="38" r="4" fill="#3B82F6" />
            <circle cx="78" cy="38" r="4" fill="#EF4444" />
          </svg>
        </div>
      );

    // 26. PLATEN
    case 'platen':
      return (
        <div className={`${className} ${rounded} bg-[#F8FAFC] flex items-center justify-center p-2 shrink-0 shadow-md border border-gray-300`}>
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
            {/* White paper with equations on teal tray */}
            <rect x="20" y="16" width="60" height="58" rx="6" fill="white" stroke="#CBD5E1" strokeWidth="2" />
            <path d="M 28 32 L 34 32 L 40 44 L 46 24 L 54 24" stroke="#DC2626" strokeWidth="3" strokeLinecap="round" fill="none" />
            <path d="M 30 52 L 70 52" stroke="#64748B" strokeWidth="3" strokeLinecap="round" />
            <path d="M 30 62 L 58 62" stroke="#94A3B8" strokeWidth="3" strokeLinecap="round" />
            {/* Teal tray base */}
            <path d="M 14 74 L 86 74 L 80 84 L 20 84 Z" fill="#0D9488" />
            <polygon points="50,84 46,92 54,92" fill="#0D9488" />
          </svg>
        </div>
      );

    // 27. HELIO
    case 'helio':
      return (
        <div className={`${className} ${rounded} bg-[#1E1B4B] flex items-center justify-center p-2 shrink-0 shadow-md border border-white/10`}>
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
            {/* Piano roll steps */}
            <rect x="20" y="68" width="16" height="12" rx="2" fill="white" />
            <rect x="30" y="56" width="16" height="12" rx="2" fill="white" opacity="0.9" />
            <rect x="40" y="44" width="16" height="12" rx="2" fill="white" opacity="0.8" />
            <rect x="50" y="32" width="16" height="12" rx="2" fill="white" opacity="0.7" />
            <rect x="60" y="20" width="16" height="12" rx="2" fill="white" opacity="0.6" />
          </svg>
        </div>
      );

    // 28. CHORUS
    case 'chorus':
      return (
        <div className={`${className} ${rounded} bg-[#0284C7] flex items-center justify-center p-2 shrink-0 shadow-md`}>
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
            {/* Rounded lyric lines */}
            <rect x="24" y="32" width="52" height="10" rx="5" fill="white" />
            <rect x="30" y="48" width="40" height="10" rx="5" fill="white" opacity="0.9" />
            <rect x="36" y="64" width="28" height="10" rx="5" fill="white" opacity="0.7" />
          </svg>
        </div>
      );

    // 29. PROTONUP-QT
    case 'protonup-qt':
      return (
        <div className={`${className} ${rounded} bg-white flex items-center justify-center p-2 shrink-0 shadow-md border border-gray-200`}>
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
            <circle cx="50" cy="50" r="42" fill="#F0FDF4" stroke="#22C55E" strokeWidth="4" />
            {/* Green arrow */}
            <path d="M 50 18 L 70 42 L 58 42 L 58 64 L 42 64 L 42 42 L 30 42 Z" fill="#16A34A" />
            <text x="50" y="78" textAnchor="middle" fill="#15803D" fontSize="12" fontWeight="bold" fontFamily="sans-serif">PUPGUI</text>
          </svg>
        </div>
      );

    // 30. GERENCIADOR DE EXTENSÕES
    case 'extension-manager':
      return (
        <div className={`${className} ${rounded} bg-[#2563EB] flex items-center justify-center p-2 shrink-0 shadow-md`}>
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
            {/* Puzzle Piece */}
            <path
              d="M 30 30 L 44 30 C 44 24, 56 24, 56 30 L 70 30 L 70 44 C 76 44, 76 56, 70 56 L 70 70 L 56 70 C 56 76, 44 76, 44 70 L 30 70 L 30 56 C 24 56, 24 44, 30 44 Z"
              fill="#93C5FD"
              stroke="white"
              strokeWidth="3"
            />
          </svg>
        </div>
      );

    // 31. ZEN BROWSER
    case 'zen':
      return (
        <div className={`${className} ${rounded} bg-[#18181B] flex items-center justify-center p-2 shrink-0 shadow-md border border-white/10`}>
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
            {/* Concentric rings */}
            <circle cx="50" cy="50" r="36" stroke="white" strokeWidth="4" />
            <circle cx="50" cy="50" r="26" stroke="white" strokeWidth="4" />
            <circle cx="50" cy="50" r="16" stroke="white" strokeWidth="4" />
            <circle cx="50" cy="50" r="6" fill="white" />
          </svg>
        </div>
      );

    // 32. GIMP
    case 'gimp':
      return (
        <div className={`${className} ${rounded} bg-[#3F3F46] flex items-center justify-center p-2 shrink-0 shadow-md border border-white/10`}>
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
            {/* Wilber coyote head */}
            <ellipse cx="46" cy="52" rx="28" ry="24" fill="#71717A" />
            <circle cx="36" cy="46" r="8" fill="white" />
            <circle cx="36" cy="46" r="4" fill="black" />
            <circle cx="56" cy="46" r="8" fill="white" />
            <circle cx="56" cy="46" r="4" fill="black" />
            <polygon points="26,32 18,18 36,26" fill="#52525B" />
            <circle cx="48" cy="62" r="5" fill="#18181B" />
            {/* Paint brush in mouth */}
            <path d="M 52 64 L 78 78" stroke="#EAB308" strokeWidth="4" strokeLinecap="round" />
            <polygon points="78,78 84,84 76,86" fill="#EF4444" />
          </svg>
        </div>
      );

    // 33. DOLPHIN EMULATOR
    case 'dolphin-emu':
      return (
        <div className={`${className} ${rounded} bg-[#0284C7] flex items-center justify-center p-2 shrink-0 shadow-md`}>
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
            {/* Jumping Cyan Dolphin */}
            <path
              d="M 20 62 C 30 40, 56 30, 78 38 C 84 40, 88 44, 82 50 C 70 54, 58 56, 46 68 L 38 72 L 40 64 L 28 66 Z"
              fill="#38BDF8"
              stroke="white"
              strokeWidth="2"
            />
            <circle cx="68" cy="42" r="3" fill="#0F172A" />
          </svg>
        </div>
      );

    // 34. QBITTORRENT
    case 'qbittorrent':
      return (
        <div className={`${className} ${rounded} bg-[#1E40AF] flex items-center justify-center p-2 shrink-0 shadow-md`}>
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
            <circle cx="50" cy="50" r="40" fill="#3B82F6" />
            <text x="50" y="62" textAnchor="middle" fill="white" fontSize="34" fontWeight="bold" fontFamily="sans-serif">qb</text>
          </svg>
        </div>
      );

    // 35. GEAR LEVER
    case 'gearlever':
      return (
        <div className={`${className} ${rounded} bg-[#334155] flex items-center justify-center p-2 shrink-0 shadow-md border border-white/10`}>
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
            {/* Gear with down arrow */}
            <circle cx="50" cy="62" r="22" fill="#64748B" stroke="#94A3B8" strokeWidth="4" />
            <path d="M 50 18 L 50 56 M 36 44 L 50 58 L 64 44" stroke="#38BDF8" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      );

    // 36. LIBREOFFICE
    case 'libreoffice':
      return (
        <div className={`${className} ${rounded} bg-white flex items-center justify-center p-2 shrink-0 shadow-md border border-gray-200`}>
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
            {/* Folded paper */}
            <path d="M 28 20 L 56 20 L 74 38 L 74 80 L 28 80 Z" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="3" />
            <polygon points="56,20 56,38 74,38" fill="#CBD5E1" />
          </svg>
        </div>
      );

    // 37. VS CODE
    case 'vscode':
      return (
        <div className={`${className} ${rounded} bg-[#18181B] flex items-center justify-center p-2 shrink-0 shadow-md border border-white/10`}>
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
            <path d="M72 16 L32 46 L18 36 L12 40 L26 50 L12 60 L18 64 L32 54 L72 84 L88 76 L88 24 Z" fill="#007ACC" />
            <path d="M72 16 L88 24 L88 76 L72 84 L52 50 Z" fill="#0065A9" />
          </svg>
        </div>
      );

    // 38. PPSSPP
    case 'ppsspp':
      return (
        <div className={`${className} ${rounded} bg-[#0284C7] flex items-center justify-center p-2 shrink-0 shadow-md`}>
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
            {/* Blue PSP Cross D-pad diamond */}
            <rect x="42" y="16" width="16" height="68" rx="4" fill="#38BDF8" />
            <rect x="16" y="42" width="68" height="16" rx="4" fill="#38BDF8" />
            <polygon points="50,22 62,34 38,34" fill="white" />
            <polygon points="50,78 62,66 38,66" fill="white" />
            <polygon points="22,50 34,38 34,62" fill="white" />
            <polygon points="78,50 66,38 66,62" fill="white" />
          </svg>
        </div>
      );

    // 39. PROTON VPN
    case 'protonvpn':
      return (
        <div className={`${className} ${rounded} bg-white flex items-center justify-center p-2 shrink-0 shadow-md border border-gray-200`}>
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
            {/* Proton gradient triangle */}
            <path d="M 50 20 L 78 74 L 22 74 Z" fill="url(#protonGrad)" />
            <defs>
              <linearGradient id="protonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6D4AFF" />
                <stop offset="100%" stopColor="#3B82F6" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      );

    // 40. LUTRIS
    case 'lutris':
      return (
        <div className={`${className} ${rounded} bg-[#D97706] flex items-center justify-center p-2 shrink-0 shadow-md`}>
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
            {/* Lutris Bear / Game shape */}
            <ellipse cx="50" cy="50" rx="36" ry="34" fill="#F59E0B" />
            <circle cx="34" cy="30" r="12" fill="#78350F" />
            <circle cx="66" cy="30" r="12" fill="#78350F" />
            <circle cx="38" cy="46" r="5" fill="#1C1917" />
            <circle cx="62" cy="46" r="5" fill="#1C1917" />
            <path d="M 44 60 C 44 66, 56 66, 56 60 Z" fill="#1C1917" />
          </svg>
        </div>
      );

    default:
      return (
        <div className={`${className} ${rounded} bg-slate-700 flex items-center justify-center text-white font-bold`}>
          {type.slice(0, 2).toUpperCase()}
        </div>
      );
  }
};
