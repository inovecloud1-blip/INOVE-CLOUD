export interface FlathubAppDetail {
  id: string;
  appId: string;
  name: string;
  tagline: string;
  description: string;
  category: string;
  version: string;
  developer: string;
  developerUrl?: string;
  size: string;
  rating: number;
  reviewsCount: number;
  downloads: string;
  installed: boolean;
  packageManager: 'flatpak' | 'apt';
  executable?: string;
  verified: boolean;
  license: string;
  releaseDate: string;
  memoryUsage: string;
  iconType: string;
  iconBg?: string;
  bannerImage?: string;
  screenshots: {
    title: string;
    description: string;
    caption: string;
    type: 'ui_mock' | 'code' | 'dashboard' | 'media' | 'chat' | 'game' | 'editor';
    themeColor: string;
  }[];
  permissions: string[];
  features: string[];
  hotTrending?: boolean;
}

export const FLATHUB_APPS: FlathubAppDetail[] = [
  // --- BANNER APPS ---
  {
    id: 'android-studio',
    appId: 'com.google.AndroidStudio',
    name: 'Android Studio',
    tagline: 'IDE for Android app development',
    description: 'O Android Studio oferece as ferramentas mais rápidas para criar aplicativos em todos os tipos de dispositivos Android. Com um editor de código inteligente, emulador flexível e ambiente unificado.',
    category: 'Desenvolvimento',
    version: '2024.1.2',
    developer: 'Google LLC',
    developerUrl: 'https://developer.android.com/studio',
    size: '1.1 GB',
    rating: 4.9,
    reviewsCount: 8420,
    downloads: '32.4M',
    installed: false,
    packageManager: 'flatpak',
    executable: 'studio',
    verified: true,
    license: 'Apache-2.0',
    releaseDate: '12 Setembro 2026',
    memoryUsage: '1.4 GB RAM',
    iconType: 'android-studio',
    hotTrending: true,
    features: [
      'Editor de código inteligente com suporte a Kotlin e Java',
      'Layout Editor visual com prévia em tempo real de XML e Jetpack Compose',
      'Emulador Android rápido com aceleração por hardware KVM',
      'Analisador de APK e ferramentas de perfil de memória e CPU'
    ],
    permissions: ['Acesso ao Sistema de Arquivos (host)', 'Rede (LAN & WAN)', 'Aceleração KVM / Virtualização'],
    screenshots: [
      {
        title: 'Editor de Layout XML & Jetpack Compose',
        description: 'Visualização split em tempo real do código XML/Kotlin com a renderização instantânea da interface mobile.',
        caption: 'Design surface com preview de activity_main.xml e Material Design 3',
        type: 'editor',
        themeColor: '#3DDC84'
      },
      {
        title: 'Depurador & Logcat Integrado',
        description: 'Painel de logs com filtragem por tags e telemetria de consumo de memória em tempo real.',
        caption: 'Depuração de código com breakpoints condicionais e inspectores',
        type: 'code',
        themeColor: '#4285F4'
      }
    ]
  },
  {
    id: 'laser',
    appId: 'io.github.laser.Laser',
    name: 'Laser',
    tagline: 'Rip CDs with ease',
    description: 'Um utilitário moderno, limpo e extremamente rápido para extrair e converter músicas de CDs de áudio para FLAC, MP3, Opus e AAC com busca automática de metadados no MusicBrainz.',
    category: 'Áudio e Vídeo',
    version: '1.2.0',
    developer: 'Laser Team',
    size: '28.4 MB',
    rating: 4.8,
    reviewsCount: 340,
    downloads: '120k',
    installed: false,
    packageManager: 'flatpak',
    executable: 'laser',
    verified: true,
    license: 'GPL-3.0',
    releaseDate: '08 Setembro 2026',
    memoryUsage: '95 MB RAM',
    iconType: 'laser',
    features: [
      'Extração de áudio sem perda de qualidade bit-perfect (AccurateRip)',
      'Preenchimento automático de capa, artista e faixas via MusicBrainz',
      'Conversão para FLAC, ALAC, Opus, MP3 e Ogg Vorbis',
      'Design nativo GNOME Libadwaita com suporte a tema escuro'
    ],
    permissions: ['Acesso a Drive Óptico / CD-ROM', 'Rede para metadados', 'Acesso à Pasta de Músicas'],
    screenshots: [
      {
        title: 'Extração de Faixas de Áudio',
        description: 'Lista de faixas identificadas automaticamente com tags ID3 e progresso de conversão de áudio.',
        caption: 'Tela de cópia de CD com extração direta em FLAC 24-bit',
        type: 'media',
        themeColor: '#D32F2F'
      }
    ]
  },

  // --- SCREENSHOT 1 & 2: POPULARES & JOGOS ---
  {
    id: 'sober',
    appId: 'org.vinegarhq.Sober',
    name: 'Sober',
    tagline: 'Play, chat & explore on Roblox',
    description: 'Sober é um cliente nativo e de alto desempenho para rodar o universo Roblox no Linux com aceleração Vulkan completa e baixa latência.',
    category: 'Jogos',
    version: '0.2.14',
    developer: 'VinegarHQ',
    size: '112 MB',
    rating: 4.9,
    reviewsCount: 5200,
    downloads: '8.1M',
    installed: true,
    packageManager: 'flatpak',
    executable: 'sober',
    verified: true,
    license: 'GPL-3.0',
    releaseDate: '14 Setembro 2026',
    memoryUsage: '350 MB RAM',
    iconType: 'sober',
    features: ['Aceleração gráfica Vulkan nativa', 'Suporte a controles Xbox/DualSense', 'Chat de voz integrado'],
    permissions: ['Aceleração GPU (Vulkan/OpenGL)', 'Dispositivos de Entrada', 'Áudio PipeWire'],
    screenshots: [
      {
        title: 'Launcher Roblox & Exploração',
        description: 'Interface rápida para iniciar qualquer experiência Roblox com taxa de quadros desbloqueada.',
        caption: 'Catálogo de jogos com suporte a Ray Tracing e shaders',
        type: 'game',
        themeColor: '#58CC02'
      }
    ]
  },
  {
    id: 'firefox',
    appId: 'org.mozilla.firefox',
    name: 'Firefox',
    tagline: 'Fast, Private & Safe Web Browser',
    description: 'Navegador web rápido, seguro e focado na privacidade. Bloqueia mais de 2.000 rastreadores por padrão com proteção total de cookies.',
    category: 'Internet',
    version: '130.0',
    developer: 'Mozilla Corporation',
    size: '89.5 MB',
    rating: 4.9,
    reviewsCount: 15800,
    downloads: '58.2M',
    installed: true,
    packageManager: 'flatpak',
    executable: 'firefox',
    verified: true,
    license: 'MPL-2.0',
    releaseDate: '15 Setembro 2026',
    memoryUsage: '340 MB RAM',
    iconType: 'firefox',
    features: ['Bloqueio rigoroso de rastreadores', 'Suporte a Wayland nativo', 'Isolamento de abas Multi-Account Containers'],
    permissions: ['Acesso à Rede', 'Áudio e Vídeo VA-API', 'Notificações'],
    screenshots: [
      {
        title: 'Navegação Segura & Privada',
        description: 'Visualização de abas com proteção aprimorada contra rastreamento ativada por padrão.',
        caption: 'Navegador com renderização WebRender acelerada por GPU',
        type: 'ui_mock',
        themeColor: '#FF7139'
      }
    ]
  },
  {
    id: 'discord',
    appId: 'com.discordapp.Discord',
    name: 'Discord',
    tagline: 'Talk, play, hang out',
    description: 'O Discord é o lugar perfeito para conversar com amigos e comunidades através de voz, vídeo e texto de baixa latência.',
    category: 'Comunicação',
    version: '0.0.62',
    developer: 'Discord Inc.',
    size: '104 MB',
    rating: 4.8,
    reviewsCount: 12400,
    downloads: '44.0M',
    installed: false,
    packageManager: 'flatpak',
    executable: 'discord',
    verified: true,
    license: 'Proprietary',
    releaseDate: '10 Setembro 2026',
    memoryUsage: '280 MB RAM',
    iconType: 'discord',
    features: ['Canais de voz com supressão de ruído Krisp', 'Compartilhamento de tela em 1080p 60fps', 'Servidores comunitários'],
    permissions: ['Rede', 'Microfone & Câmera', 'Notificações'],
    screenshots: [
      {
        title: 'Servidores & Canais de Voz',
        description: 'Interface de chat e chamadas com canais de áudio de alta fidelidade e bots interativos.',
        caption: 'Comunicação em grupo com canais de voz integrados',
        type: 'chat',
        themeColor: '#5865F2'
      }
    ]
  },
  {
    id: 'chrome',
    appId: 'com.google.Chrome',
    name: 'Google Chrome',
    tagline: 'The browser built to be yours',
    description: 'O navegador web mais utilizado no mundo, rápido, seguro e com sincronização de senhas, favoritos e histórico na Conta Google.',
    category: 'Internet',
    version: '128.0.6613.137',
    developer: 'Google LLC',
    size: '115 MB',
    rating: 4.7,
    reviewsCount: 9200,
    downloads: '39.5M',
    installed: true,
    packageManager: 'apt',
    executable: 'google-chrome',
    verified: true,
    license: 'Proprietary',
    releaseDate: '11 Setembro 2026',
    memoryUsage: '380 MB RAM',
    iconType: 'chrome',
    features: ['Sincronização com Conta Google', 'Tradução automática de páginas', 'Chrome Web Store integrada'],
    permissions: ['Rede', 'Aceleração Gráfica', 'Impressão'],
    screenshots: [
      {
        title: 'Navegação com Abas Rápidas',
        description: 'Barra de pesquisa inteligente Omnibox e sincronização de favoritos.',
        caption: 'Interface rápida com gerenciamento de abas agrupadas',
        type: 'ui_mock',
        themeColor: '#4285F4'
      }
    ]
  },
  {
    id: 'brave',
    appId: 'com.brave.Browser',
    name: 'Brave',
    tagline: 'Fast Internet, AI, Adblock',
    description: 'Navegador com foco absoluto em privacidade e bloqueador de anúncios/rastreadores nativo Brave Shields ativado por padrão.',
    category: 'Internet',
    version: '1.69.162',
    developer: 'Brave Software',
    size: '110 MB',
    rating: 4.9,
    reviewsCount: 8100,
    downloads: '26.8M',
    installed: false,
    packageManager: 'flatpak',
    executable: 'brave',
    verified: true,
    license: 'MPL-2.0',
    releaseDate: '13 Setembro 2026',
    memoryUsage: '320 MB RAM',
    iconType: 'brave',
    features: ['Brave Shields bloqueador de anúncios', 'Brave Leo AI integrado', 'Rede Tor privada embutida'],
    permissions: ['Rede', 'Notificações', 'Armazenamento'],
    screenshots: [
      {
        title: 'Brave Shields & Bloqueio',
        description: 'Relatório em tempo real de anúncios bloqueados e tempo economizado.',
        caption: 'Navegação sem rastreadores nem propagandas abusivas',
        type: 'ui_mock',
        themeColor: '#FB542B'
      }
    ]
  },
  {
    id: 'bottles',
    appId: 'com.usebottles.bottles',
    name: 'Garrafas',
    tagline: 'Run Windows software',
    description: 'Execute programas e jogos do Windows no Linux com gerenciamento fácil de prefixos Wine, runners Proton, DXVK e dependências em um clique.',
    category: 'Utilitários',
    version: '51.15',
    developer: 'Bottles Contributors',
    size: '145 MB',
    rating: 4.9,
    reviewsCount: 6100,
    downloads: '14.2M',
    installed: false,
    packageManager: 'flatpak',
    executable: 'bottles',
    verified: true,
    license: 'GPL-3.0',
    releaseDate: '09 Setembro 2026',
    memoryUsage: '180 MB RAM',
    iconType: 'bottles',
    features: ['Gerenciamento de garrafas para jogos e apps', 'Instalação em 1 clique de DLLs e dependências', 'Integração com DXVK e VKD3D'],
    permissions: ['Sistema de Arquivos', 'Aceleração GPU', 'Wayland'],
    screenshots: [
      {
        title: 'Painel de Garrafas Wine',
        description: 'Criação e execução de executáveis .exe/.msi com configurações isoladas.',
        caption: 'Ambiente Windows sandbox com runners customizados',
        type: 'ui_mock',
        themeColor: '#E65100'
      }
    ]
  },
  {
    id: 'spotify',
    appId: 'com.spotify.Client',
    name: 'Spotify',
    tagline: 'Online music streaming service',
    description: 'Milhões de faixas de áudio, podcasts e playlists com áudio de alta fidelidade e recomendações personalizadas.',
    category: 'Áudio e Vídeo',
    version: '1.2.45',
    developer: 'Spotify AB',
    size: '185 MB',
    rating: 4.8,
    reviewsCount: 16500,
    downloads: '52.0M',
    installed: true,
    packageManager: 'flatpak',
    executable: 'spotify',
    verified: true,
    license: 'Proprietary',
    releaseDate: '05 Setembro 2026',
    memoryUsage: '260 MB RAM',
    iconType: 'spotify',
    features: ['Streaming sem perdas', 'Controle Spotify Connect', 'Letras sincronizadas'],
    permissions: ['Áudio PipeWire', 'Rede', 'Notificações'],
    screenshots: [
      {
        title: 'Player & Playlists',
        description: 'Catálogo de músicas com visualizador de letras e capas de álbuns.',
        caption: 'Reprodução com suporte a Spotify Connect',
        type: 'media',
        themeColor: '#1DB954'
      }
    ]
  },
  {
    id: 'vlc',
    appId: 'org.videolan.VLC',
    name: 'VLC',
    tagline: 'VLC media player, the open-source multimedia player',
    description: 'O reprodutor multimídia livre e de código aberto que roda a grande maioria dos codecs (MKV, MP4, AVI, FLV, WebM, MP3) sem precisar baixar pacotes adicionais.',
    category: 'Áudio e Vídeo',
    version: '3.0.21',
    developer: 'VideoLAN Organization',
    size: '56 MB',
    rating: 4.9,
    reviewsCount: 11200,
    downloads: '48.9M',
    installed: false,
    packageManager: 'flatpak',
    executable: 'vlc',
    verified: true,
    license: 'GPL-2.0',
    releaseDate: '07 Setembro 2026',
    memoryUsage: '120 MB RAM',
    iconType: 'vlc',
    features: ['Suporte a todos os formatos de áudio/vídeo', 'Aceleração por hardware VA-API', 'Sincronização de legendas e equalizador'],
    permissions: ['Sistema de Arquivos', 'Aceleração de Vídeo', 'Áudio'],
    screenshots: [
      {
        title: 'Reprodução de Vídeo em 4K',
        description: 'Controle preciso de faixas de áudio, legendas automáticas e filtros de cor.',
        caption: 'Player leve com aceleração por hardware ativada',
        type: 'media',
        themeColor: '#FF8800'
      }
    ]
  },
  {
    id: 'steam',
    appId: 'com.valvesoftware.Steam',
    name: 'Steam',
    tagline: 'Jogue jogos populares e os últimos lançamentos',
    description: 'A plataforma definitiva para jogos de computador com Proton integrado para rodar títulos Windows com velocidade nativa no Linux.',
    category: 'Jogos',
    version: '1.0.0.79',
    developer: 'Valve Corporation',
    size: '220 MB',
    rating: 4.9,
    reviewsCount: 22000,
    downloads: '64.0M',
    installed: false,
    packageManager: 'flatpak',
    executable: 'steam',
    verified: true,
    license: 'Proprietary',
    releaseDate: '10 Setembro 2026',
    memoryUsage: '340 MB RAM',
    iconType: 'steam',
    features: ['Compatibilidade Proton para jogos Windows', 'Steam Cloud Saves', 'Modo Big Picture para TVs'],
    permissions: ['Aceleração Vulkan', 'Gamepads e Dispositivos USB', 'Rede'],
    screenshots: [
      {
        title: 'Biblioteca de Jogos Steam',
        description: 'Visualização da biblioteca com status de compatibilidade Steam Deck / Linux.',
        caption: 'Gerenciador de jogos com downloads automáticos',
        type: 'game',
        themeColor: '#171a21'
      }
    ]
  },
  {
    id: 'heroic',
    appId: 'com.heroicgameslauncher.hgl',
    name: 'Heroic',
    tagline: 'Jogue jogos da Epic, GOG e Amazon',
    description: 'Um launcher de jogos de código aberto nativo para Linux para acessar seus catálogos da Epic Games Store, GOG e Amazon Prime Gaming com Wine e Proton.',
    category: 'Jogos',
    version: '2.14.1',
    developer: 'Heroic Games Launcher Authors',
    size: '118 MB',
    rating: 4.9,
    reviewsCount: 4800,
    downloads: '11.5M',
    installed: false,
    packageManager: 'flatpak',
    executable: 'heroic',
    verified: true,
    license: 'GPL-3.0',
    releaseDate: '06 Setembro 2026',
    memoryUsage: '210 MB RAM',
    iconType: 'heroic',
    features: ['Suporte a Epic Games, GOG e Amazon', 'Download automático de Proton-GE', 'Cloud sync de saves com Epic e GOG'],
    permissions: ['Sistema de Arquivos', 'Aceleração GPU Vulkan', 'Rede'],
    screenshots: [
      {
        title: 'Catálogo de Jogos Epic & GOG',
        description: 'Painel unificado com todas as suas bibliotecas de jogos em uma interface moderna.',
        caption: 'Launcher de jogos com suporte a Wine-GE e DXVK',
        type: 'game',
        themeColor: '#0078F2'
      }
    ]
  },
  {
    id: 'flatseal',
    appId: 'com.github.tchx84.Flatseal',
    name: 'Flatseal',
    tagline: 'Gerencie as permissões de Flatpaks',
    description: 'Utilitário gráfico simples e elegante para revisar e modificar permissões de segurança de todos os aplicativos Flatpak instalados.',
    category: 'Utilitários',
    version: '2.2.1',
    developer: 'tchx84',
    size: '14 MB',
    rating: 5.0,
    reviewsCount: 7800,
    downloads: '19.4M',
    installed: true,
    packageManager: 'flatpak',
    executable: 'flatseal',
    verified: true,
    license: 'GPL-3.0',
    releaseDate: '12 Setembro 2026',
    memoryUsage: '65 MB RAM',
    iconType: 'flatseal',
    features: ['Controle de acesso ao sistema de arquivos', 'Ativação/desativação de rede e Wayland', 'Modo de redefinição para padrão em 1 clique'],
    permissions: ['Acesso ao daemon Flatpak (permissões de sistema)'],
    screenshots: [
      {
        title: 'Gerenciamento de Sandbox',
        description: 'Lista de chaves de permissão para sockets, GPU, dispositivos e diretórios.',
        caption: 'Controle granular de segurança para cada app',
        type: 'ui_mock',
        themeColor: '#5C5470'
      }
    ]
  },
  {
    id: 'obs',
    appId: 'com.obsproject.Studio',
    name: 'OBS Studio',
    tagline: 'Live stream and record videos',
    description: 'Suíte profissional para gravação de tela e transmissão ao vivo para YouTube, Twitch e Kick com suporte nativo a Wayland e PipeWire.',
    category: 'Áudio e Vídeo',
    version: '30.2.2',
    developer: 'OBS Project',
    size: '142 MB',
    rating: 4.9,
    reviewsCount: 9400,
    downloads: '31.0M',
    installed: false,
    packageManager: 'flatpak',
    executable: 'obs',
    verified: true,
    license: 'GPL-2.0',
    releaseDate: '04 Setembro 2026',
    memoryUsage: '310 MB RAM',
    iconType: 'obs',
    features: ['Captura de tela nativa no Wayland', 'Codificação NVENC, VA-API e QuickSync', 'Mixer de áudio multipista'],
    permissions: ['Captura PipeWire', 'Câmeras V4L2', 'Microfone'],
    screenshots: [
      {
        title: 'Mesa de Corte & Transmissão',
        description: 'Prévia de cena em tempo real com fontes de webcam e captura de jogo.',
        caption: 'Transmissão em alta taxa de bits sem perda de frames',
        type: 'ui_mock',
        themeColor: '#302C34'
      }
    ]
  },
  {
    id: 'prismlauncher',
    appId: 'org.prismlauncher.PrismLauncher',
    name: 'Prism Launcher',
    tagline: 'An open-source Minecraft launcher',
    description: 'Launcher customizado para Minecraft com suporte a múltiplas instâncias, instalação direta de mods do CurseForge e Modrinth.',
    category: 'Jogos',
    version: '8.4',
    developer: 'Prism Launcher Team',
    size: '32 MB',
    rating: 5.0,
    reviewsCount: 3900,
    downloads: '6.8M',
    installed: false,
    packageManager: 'flatpak',
    executable: 'prismlauncher',
    verified: true,
    license: 'GPL-3.0',
    releaseDate: '08 Setembro 2026',
    memoryUsage: '140 MB RAM',
    iconType: 'prismlauncher',
    features: ['Download de mods Modrinth e CurseForge', 'Gerenciamento de instâncias separadas', 'Suporte a Java 8, 17 e 21'],
    permissions: ['Rede', 'Sistema de Arquivos', 'Aceleração OpenGL'],
    screenshots: [
      {
        title: 'Gerenciador de Instâncias & Mods',
        description: 'Instalação de modpacks Fabric, Forge e Neoforge em 1 clique.',
        caption: 'Painel com controle de alocação de memória RAM',
        type: 'game',
        themeColor: '#00AA00'
      }
    ]
  },

  // --- SCREENSHOT 3: NOVOS APPS & FERRAMENTAS ---
  {
    id: 'seabird',
    appId: 'io.github.getseabird.seabird',
    name: 'Seabird',
    tagline: 'Work with Kubernetes',
    description: 'Um cliente desktop nativo e moderno para gerenciar clusters Kubernetes com suporte a múltiplos contextos, visualização de pods e logs em tempo real.',
    category: 'Desenvolvimento',
    version: '0.6.2',
    developer: 'Seabird Team',
    size: '38 MB',
    rating: 4.9,
    reviewsCount: 650,
    downloads: '450k',
    installed: false,
    packageManager: 'flatpak',
    executable: 'seabird',
    verified: true,
    license: 'GPL-3.0',
    releaseDate: '11 Setembro 2026',
    memoryUsage: '110 MB RAM',
    iconType: 'seabird',
    features: ['Visualização em tempo real de pods e deployments', 'Streaming de logs de contêineres', 'Editor de manifestos YAML'],
    permissions: ['Rede', 'Acesso a ~/.kube/config'],
    screenshots: [
      {
        title: 'Painel de Clusters & Pods',
        description: 'Status de saúde de nós, réplicas e consumo de CPU/Memória.',
        caption: 'Gerenciamento de namespaces e recursos Kubernetes',
        type: 'dashboard',
        themeColor: '#326CE5'
      }
    ]
  },
  {
    id: 'rufin',
    appId: 'org.rufin.Rufin',
    name: 'Rufin',
    tagline: 'Feel at home with your music',
    description: 'Um player de música local minimalista e sofisticado com suporte a coleções de vinil, scrobbling Last.fm e design Libadwaita.',
    category: 'Áudio e Vídeo',
    version: '1.4.0',
    developer: 'Rufin Project',
    size: '22 MB',
    rating: 4.8,
    reviewsCount: 410,
    downloads: '280k',
    installed: false,
    packageManager: 'flatpak',
    executable: 'rufin',
    verified: true,
    license: 'GPL-3.0',
    releaseDate: '09 Setembro 2026',
    memoryUsage: '85 MB RAM',
    iconType: 'rufin',
    features: ['Efeito visual de toca-discos retrô', 'Equalizador de 10 bandas', 'Leitura instantânea de tags FLAC e MP3'],
    permissions: ['Acesso à Pasta de Músicas', 'Áudio'],
    screenshots: [
      {
        title: 'Player Toca-Discos & Álbuns',
        description: 'Interface elegante com vinil animado durante a reprodução.',
        caption: 'Músicas organizadas por artistas e gêneros',
        type: 'media',
        themeColor: '#E65100'
      }
    ]
  },
  {
    id: 'fotos',
    appId: 'org.gnome.Loupe',
    name: 'Fotos',
    tagline: 'Galeria de imagens',
    description: 'O visualizador de imagens oficial do GNOME. Rápido, com suporte a gestos multitoque em touchpads, renderização vetorial SVG e decodificação GPU.',
    category: 'Gráficos',
    version: '47.0',
    developer: 'GNOME Design Team',
    size: '18 MB',
    rating: 4.9,
    reviewsCount: 1800,
    downloads: '14.0M',
    installed: true,
    packageManager: 'flatpak',
    executable: 'loupe',
    verified: true,
    license: 'GPL-3.0',
    releaseDate: '13 Setembro 2026',
    memoryUsage: '60 MB RAM',
    iconType: 'fotos',
    features: ['Zoom fluido com gestos', 'Visualização de metadados EXIF', 'Suporte a formatos modernos AVIF, HEIC e WebP'],
    permissions: ['Sistema de Arquivos'],
    screenshots: [
      {
        title: 'Galeria de Fotos em Alta Resolução',
        description: 'Navegação por teclado e touchpad com visualização de detalhes de câmera e ISO.',
        caption: 'Visualizador de imagens leve e rápido',
        type: 'ui_mock',
        themeColor: '#3584E4'
      }
    ]
  },
  {
    id: 'gitte',
    appId: 'io.github.gitte.Gitte',
    name: 'Gitte',
    tagline: 'Manage your code history',
    description: 'Um cliente Git gráfico moderno focado em simplicidade, commits sem esforço, visualização de branches e resolução de conflitos.',
    category: 'Desenvolvimento',
    version: '0.9.4',
    developer: 'Gitte Devs',
    size: '26 MB',
    rating: 4.7,
    reviewsCount: 320,
    downloads: '180k',
    installed: false,
    packageManager: 'flatpak',
    executable: 'gitte',
    verified: true,
    license: 'GPL-3.0',
    releaseDate: '07 Setembro 2026',
    memoryUsage: '95 MB RAM',
    iconType: 'gitte',
    features: ['Histórico de commits em grafo visual', 'Staging parcial de linhas de código', 'Criação rápida de branches e merges'],
    permissions: ['Sistema de Arquivos', 'Git SSH'],
    screenshots: [
      {
        title: 'Grafo de Commits & Diffs',
        description: 'Visualização clara das alterações linha por linha com syntax highlighting.',
        caption: 'Interface moderna para controle de versão Git',
        type: 'code',
        themeColor: '#FFB300'
      }
    ]
  },
  {
    id: 'skribisto',
    appId: 'eu.skribisto.Skribisto',
    name: 'Skribisto',
    tagline: 'Software for writing',
    description: 'Software completo para escritores, romancistas e roteiristas organizarem personagens, linhas do tempo e capítulos sem distrações.',
    category: 'Produtividade',
    version: '1.0.8',
    developer: 'Skribisto Community',
    size: '75 MB',
    rating: 4.8,
    reviewsCount: 520,
    downloads: '320k',
    installed: false,
    packageManager: 'flatpak',
    executable: 'skribisto',
    verified: true,
    license: 'GPL-3.0',
    releaseDate: '02 Setembro 2026',
    memoryUsage: '140 MB RAM',
    iconType: 'skribisto',
    features: ['Organização de capítulos e fichas de personagens', 'Modo de escrita focado sem distrações', 'Exportação para PDF, ePub e DOCX'],
    permissions: ['Sistema de Arquivos'],
    screenshots: [
      {
        title: 'Árvore de Capítulos & Rascunhos',
        description: 'Painel com notas laterais, mapas mentais e contagem de palavras.',
        caption: 'Ambiente de criação de livros e roteiros',
        type: 'editor',
        themeColor: '#2E7D32'
      }
    ]
  },
  {
    id: 'floodit',
    appId: 'io.github.floodit.FloodIt',
    name: 'Flood It',
    tagline: 'Inunde o tabuleiro',
    description: 'Jogo clássico e viciante de quebra-cabeça de cores. Seu objetivo é preencher todo o tabuleiro com uma única cor dentro do limite de movimentos.',
    category: 'Jogos',
    version: '1.2.1',
    developer: 'FloodIt Team',
    size: '12 MB',
    rating: 4.9,
    reviewsCount: 780,
    downloads: '590k',
    installed: false,
    packageManager: 'flatpak',
    executable: 'floodit',
    verified: true,
    license: 'MIT',
    releaseDate: '10 Setembro 2026',
    memoryUsage: '45 MB RAM',
    iconType: 'floodit',
    features: ['Modos fácil, médio e difícil', 'Gerador de tabuleiros aleatórios', 'Animações fluidas de preenchimento'],
    permissions: ['Nenhuma permissão especial necessária'],
    screenshots: [
      {
        title: 'Tabuleiro de Cores & Movimentos',
        description: 'Partida em andamento com paleta de cores inferior para selecionar o próximo movimento.',
        caption: 'Quebra-cabeça minimalista e relaxante',
        type: 'game',
        themeColor: '#9C27B0'
      }
    ]
  },
  {
    id: 'ratic',
    appId: 'io.github.ratic.Ratic',
    name: 'Ratic',
    tagline: 'Complete music player',
    description: 'Player de áudio rico em recursos com gerenciador de listas de reprodução, letras automáticas, suporte a rádio online e equalizador.',
    category: 'Áudio e Vídeo',
    version: '2.1.0',
    developer: 'Ratic Audio',
    size: '34 MB',
    rating: 4.8,
    reviewsCount: 390,
    downloads: '210k',
    installed: false,
    packageManager: 'flatpak',
    executable: 'ratic',
    verified: true,
    license: 'GPL-3.0',
    releaseDate: '06 Setembro 2026',
    memoryUsage: '90 MB RAM',
    iconType: 'ratic',
    features: ['Rádios online mundiais', 'Suporte a arquivos CUE sheet', 'Visualizador de espectro sonoro'],
    permissions: ['Acesso à pasta Músicas', 'Rede', 'Áudio'],
    screenshots: [
      {
        title: 'Visualizador de Áudio & Letras',
        description: 'Interface escura com gráficos de frequência e lista de reprodução inteligente.',
        caption: 'Player de alta performance com equalizador',
        type: 'media',
        themeColor: '#00897B'
      }
    ]
  },
  {
    id: 'typingmaster',
    appId: 'com.typingmaster.Linux',
    name: 'TypingMaster',
    tagline: 'Digitação e teste de velocidade',
    description: 'Treine sua digitação com lições interativas, jogos de velocidade e testes de palavras por minuto (WPM) com precisão de teclas.',
    category: 'Educação',
    version: '3.0.1',
    developer: 'TypingMaster Devs',
    size: '24 MB',
    rating: 4.9,
    reviewsCount: 890,
    downloads: '740k',
    installed: false,
    packageManager: 'flatpak',
    executable: 'typingmaster',
    verified: true,
    license: 'GPL-3.0',
    releaseDate: '12 Setembro 2026',
    memoryUsage: '70 MB RAM',
    iconType: 'typingmaster',
    features: ['Teclado visual com posicionamento correto dos dedos', 'Estatísticas de PPM (palavras por minuto) e acurácia', 'Lições progressivas em Português'],
    permissions: ['Armazenamento de Estatísticas'],
    screenshots: [
      {
        title: 'Teste de Digitação com Teclado na Tela',
        description: 'Acompanhamento do tempo e precisão com destaque de erros em vermelho e acertos em verde.',
        caption: 'Treinamento de datilografia e velocidade',
        type: 'ui_mock',
        themeColor: '#FFB300'
      }
    ]
  },
  {
    id: 'morse',
    appId: 'org.morse.LearnMorse',
    name: 'Morse',
    tagline: 'Aprenda Código Morse',
    description: 'Aplicativo interativo para aprender e praticar Código Morse com transmissor sonoro, decodificador em tempo real e jogos de escuta.',
    category: 'Educação',
    version: '1.5.0',
    developer: 'Morse Open Project',
    size: '16 MB',
    rating: 4.9,
    reviewsCount: 420,
    downloads: '190k',
    installed: false,
    packageManager: 'flatpak',
    executable: 'morse',
    verified: true,
    license: 'GPL-3.0',
    releaseDate: '01 Setembro 2026',
    memoryUsage: '50 MB RAM',
    iconType: 'morse',
    features: ['Tradução instantânea de texto para código Morse', 'Sintetizador de beeps de alta precisão com controle WPM', 'Modo de prática por escuta de áudio'],
    permissions: ['Áudio'],
    screenshots: [
      {
        title: 'Transmissor Telegráfico & Tabela Morse',
        description: 'Painel com chave telegráfica virtual e tabela completa do alfabeto e números.',
        caption: 'Aprenda a transmitir e receber código Morse',
        type: 'ui_mock',
        themeColor: '#795548'
      }
    ]
  },
  {
    id: 'platen',
    appId: 'org.platen.Platen',
    name: 'Platen',
    tagline: 'Edit equations for slides and more',
    description: 'Editor visual de equações matemáticas e fórmulas em LaTeX com exportação direta para SVG, PNG e apresentações.',
    category: 'Produtividade',
    version: '2.0.4',
    developer: 'Platen Science',
    size: '30 MB',
    rating: 4.8,
    reviewsCount: 310,
    downloads: '150k',
    installed: false,
    packageManager: 'flatpak',
    executable: 'platen',
    verified: true,
    license: 'GPL-3.0',
    releaseDate: '05 Setembro 2026',
    memoryUsage: '80 MB RAM',
    iconType: 'platen',
    features: ['Visualização em tempo real de fórmulas LaTeX', 'Exportação vetorial SVG sem perda de resolução', 'Paleta rápida de símbolos matemáticos e gregos'],
    permissions: ['Sistema de Arquivos'],
    screenshots: [
      {
        title: 'Editor de Fórmulas Matemáticas',
        description: 'Campo de digitação com renderização KaTeX de matrizes, integrais e somatórios.',
        caption: 'Criação de equações para artigos e slides',
        type: 'editor',
        themeColor: '#E91E63'
      }
    ]
  },
  {
    id: 'helio',
    appId: 'fm.helio.Workstation',
    name: 'Helio',
    tagline: 'Helio, free and cross-platform lightweight music sequencer',
    description: 'Sequenciador de música MIDI e estação de áudio digital (DAW) ultra leve com interface em rolo de piano linear e controle de tempo intuitivo.',
    category: 'Áudio e Vídeo',
    version: '3.14',
    developer: 'Helio Workstation',
    size: '28 MB',
    rating: 4.9,
    reviewsCount: 940,
    downloads: '620k',
    installed: false,
    packageManager: 'flatpak',
    executable: 'helio',
    verified: true,
    license: 'GPL-3.0',
    releaseDate: '04 Setembro 2026',
    memoryUsage: '110 MB RAM',
    iconType: 'helio',
    features: ['Piano Roll com controle de velocidade e harmonia', 'Exportação para MIDI, WAV e FLAC', 'Integração com instrumentos VST/LV2'],
    permissions: ['Áudio PipeWire/ALSA', 'Sistema de Arquivos'],
    screenshots: [
      {
        title: 'Piano Roll & Composição MIDI',
        description: 'Trilha musical com acordes coloridos e controle de compassos.',
        caption: 'Sequenciador musical rápido e intuitivo',
        type: 'editor',
        themeColor: '#3F51B5'
      }
    ]
  },
  {
    id: 'chorus',
    appId: 'io.github.chorus.Chorus',
    name: 'Chorus',
    tagline: 'Sing along to your music',
    description: 'Exibidor flutuante de letras de música sincronizadas linha por linha com suporte a Spotify, VLC, MPRIS e busca automática.',
    category: 'Áudio e Vídeo',
    version: '1.1.2',
    developer: 'Chorus App',
    size: '19 MB',
    rating: 4.9,
    reviewsCount: 560,
    downloads: '380k',
    installed: false,
    packageManager: 'flatpak',
    executable: 'chorus',
    verified: true,
    license: 'GPL-3.0',
    releaseDate: '10 Setembro 2026',
    memoryUsage: '55 MB RAM',
    iconType: 'chorus',
    features: ['Sincronização automática com reprodutor em execução via MPRIS', 'Modo karaokê com letra destacada no tempo certo', 'Janela compacta sempre no topo (Picture in Picture)'],
    permissions: ['Rede para letras', 'MPRIS Media Control'],
    screenshots: [
      {
        title: 'Modo Karaokê com Letras Sincronizadas',
        description: 'Texto animado destacando a linha da estrofe atual da música em execução.',
        caption: 'Acompanhe as letras em tempo real',
        type: 'media',
        themeColor: '#2196F3'
      }
    ]
  },

  // --- SCREENSHOT 4: FERRAMENTAS AVANÇADAS, JOGOS & PRODUTIVIDADE ---
  {
    id: 'protonup-qt',
    appId: 'net.davidotek.pupgui2',
    name: 'ProtonUp-Qt',
    tagline: 'Install Wine- and Proton-based compatibility tools',
    description: 'Instale e atualize ferramentas de compatibilidade como GE-Proton, Luxtorpeda, Boxtron e Wine-GE para Steam, Lutris e Heroic em 1 clique.',
    category: 'Utilitários',
    version: '2.10.0',
    developer: 'DavidoTek',
    size: '22 MB',
    rating: 5.0,
    reviewsCount: 6800,
    downloads: '16.5M',
    installed: false,
    packageManager: 'flatpak',
    executable: 'protonup-qt',
    verified: true,
    license: 'GPL-3.0',
    releaseDate: '11 Setembro 2026',
    memoryUsage: '65 MB RAM',
    iconType: 'protonup-qt',
    features: ['Download automático de GE-Proton para Steam', 'Compatibilidade com Heroic, Lutris e Bottles', 'Limpeza de versões antigas'],
    permissions: ['Sistema de Arquivos (~/.steam, ~/.local/share)'],
    screenshots: [
      {
        title: 'Gerenciador de Versões GE-Proton',
        description: 'Lista de runners instalados com opções para baixar a versão mais recente.',
        caption: 'Atualização fácil de ferramentas de compatibilidade de jogos',
        type: 'ui_mock',
        themeColor: '#00C853'
      }
    ]
  },
  {
    id: 'extension-manager',
    appId: 'com.mattjakeman.ExtensionManager',
    name: 'Gerenciador de Extensões',
    tagline: 'Install GNOME Extensions',
    description: 'Procure, instale e configure extensões do GNOME Shell diretamente da loja extensions.gnome.org sem precisar de extensão de navegador.',
    category: 'Utilitários',
    version: '0.5.1',
    developer: 'Matthew Jakeman',
    size: '15 MB',
    rating: 5.0,
    reviewsCount: 9100,
    downloads: '21.0M',
    installed: true,
    packageManager: 'flatpak',
    executable: 'extension-manager',
    verified: true,
    license: 'GPL-3.0',
    releaseDate: '14 Setembro 2026',
    memoryUsage: '60 MB RAM',
    iconType: 'extension-manager',
    features: ['Busca integrada em extensions.gnome.org', 'Atualização em 1 clique de todas as extensões', 'Verificação de compatibilidade com a versão do Shell'],
    permissions: ['D-Bus GNOME Shell', 'Rede'],
    screenshots: [
      {
        title: 'Catálogo de Extensões GNOME',
        description: 'Instalação de extensões populares como Dash to Dock, Blur my Shell e AppIndicator.',
        caption: 'Personalização do desktop em segundos',
        type: 'ui_mock',
        themeColor: '#1976D2'
      }
    ]
  },
  {
    id: 'zen',
    appId: 'app.zen_browser.zen',
    name: 'Zen',
    tagline: 'Stay focused, browse faster',
    description: 'Um navegador web incrivelmente rápido e elegante baseado em Firefox com abas verticais nativas, espaços de trabalho (workspaces) e divisão de tela.',
    category: 'Internet',
    version: '1.0.0-a.38',
    developer: 'Zen Browser Team',
    size: '95 MB',
    rating: 4.9,
    reviewsCount: 4300,
    downloads: '4.8M',
    installed: false,
    packageManager: 'flatpak',
    executable: 'zen',
    verified: true,
    license: 'MPL-2.0',
    releaseDate: '15 Setembro 2026',
    memoryUsage: '310 MB RAM',
    iconType: 'zen',
    features: ['Abas verticais retráteis', 'Divisão de tela com 2 ou 4 páginas ao mesmo tempo', 'Proteção nativa contra fingerprinting'],
    permissions: ['Rede', 'Aceleração Gráfica', 'Áudio'],
    screenshots: [
      {
        title: 'Navegação com Abas Verticais & Split View',
        description: 'Barra lateral minimalista e múltiplas visualizações em uma única janela.',
        caption: 'Navegador moderno com foco e produtividade',
        type: 'ui_mock',
        themeColor: '#2B2A33'
      }
    ]
  },
  {
    id: 'gimp',
    appId: 'org.gimp.GIMP',
    name: 'Programa de manipulação de imagem',
    tagline: 'High-end image creation and manipulation',
    description: 'O editor profissional de imagens livres líder mundial. Suporte avançado a camadas, máscaras, pincéis dinâmicos e filtros de cor CMYK e GEGL.',
    category: 'Gráficos',
    version: '2.10.38',
    developer: 'The GIMP Team',
    size: '180 MB',
    rating: 4.9,
    reviewsCount: 14000,
    downloads: '38.5M',
    installed: false,
    packageManager: 'flatpak',
    executable: 'gimp',
    verified: true,
    license: 'GPL-3.0',
    releaseDate: '03 Setembro 2026',
    memoryUsage: '280 MB RAM',
    iconType: 'gimp',
    features: ['Pintura digital e retoque de fotos de nível profissional', 'Processamento de imagem em ponto flutuante de 32 bits GEGL', 'Suporte a centenas de plugins e formatos (PSD, RAW, WebP)'],
    permissions: ['Sistema de Arquivos', 'Tablets Gráficos'],
    screenshots: [
      {
        title: 'Área de Pintura & Camadas GIMP',
        description: 'Painel com ferramentas de seleção, curvas de tom e efeitos de iluminação.',
        caption: 'Edição de fotos e criação gráfica completa',
        type: 'editor',
        themeColor: '#795548'
      }
    ]
  },
  {
    id: 'dolphin-emu',
    appId: 'org.DolphinEmu.dolphin-emu',
    name: 'Dolphin Emulator',
    tagline: 'GameCube / Wii / Triforce Emulator',
    description: 'Emulador dos consoles GameCube e Nintendo Wii com melhorias gráficas em 4K, suporte a controles originais e salvamento de estado instantâneo.',
    category: 'Jogos',
    version: '2407',
    developer: 'Dolphin Emulator Project',
    size: '48 MB',
    rating: 5.0,
    reviewsCount: 8200,
    downloads: '18.2M',
    installed: false,
    packageManager: 'flatpak',
    executable: 'dolphin-emu',
    verified: true,
    license: 'GPL-2.0',
    releaseDate: '09 Setembro 2026',
    memoryUsage: '320 MB RAM',
    iconType: 'dolphin-emu',
    features: ['Upscaling para resolução 4K Ultra HD', 'Suporte a Wiimotes originais via Bluetooth', 'Netplay para multiplayer online'],
    permissions: ['Aceleração Vulkan/OpenGL', 'Bluetooth / USB Gamepads', 'Armazenamento de Jogos'],
    screenshots: [
      {
        title: 'Configuração Gráfica & Lista de Jogos',
        description: 'Seleção de jogos com capas 3D e filtros de textura anisotropic 16x.',
        caption: 'Emulação de alta fidelidade com taxa de quadros perfeita',
        type: 'game',
        themeColor: '#00BCD4'
      }
    ]
  },
  {
    id: 'qbittorrent',
    appId: 'org.qbittorrent.qBittorrent',
    name: 'qBittorrent',
    tagline: 'An open-source Bittorrent client',
    description: 'Cliente BitTorrent leve, sem anúncios nem rastreadores, com motor de busca de torrents embutido, reprodutor de mídia sequencial e controle remoto web.',
    category: 'Internet',
    version: '4.6.5',
    developer: 'The qBittorrent project',
    size: '36 MB',
    rating: 4.9,
    reviewsCount: 9800,
    downloads: '29.0M',
    installed: false,
    packageManager: 'flatpak',
    executable: 'qbittorrent',
    verified: true,
    license: 'GPL-2.0',
    releaseDate: '08 Setembro 2026',
    memoryUsage: '95 MB RAM',
    iconType: 'qbittorrent',
    features: ['Busca integrada de arquivos torrent', 'Suporte a Torrent Sequencial (para assistir enquanto baixa)', 'Interface web de controle remoto'],
    permissions: ['Rede', 'Sistema de Arquivos (pasta Downloads)'],
    screenshots: [
      {
        title: 'Gerenciador de Downloads & Transferências',
        description: 'Tabela com velocidade de upload/download, peers e sementes ativas.',
        caption: 'Cliente de torrent leve e seguro',
        type: 'ui_mock',
        themeColor: '#2B579A'
      }
    ]
  },
  {
    id: 'gearlever',
    appId: 'it.mijorus.gearlever',
    name: 'Gear Lever',
    tagline: 'Manage AppImages',
    description: 'Gerencie arquivos AppImage facilmente: integre-os ao menu de aplicativos do sistema, atualize versões e mova-os para um local seguro com 1 clique.',
    category: 'Utilitários',
    version: '2.4.2',
    developer: 'Mijorus',
    size: '18 MB',
    rating: 4.9,
    reviewsCount: 3100,
    downloads: '5.2M',
    installed: false,
    packageManager: 'flatpak',
    executable: 'gearlever',
    verified: true,
    license: 'GPL-3.0',
    releaseDate: '10 Setembro 2026',
    memoryUsage: '55 MB RAM',
    iconType: 'gearlever',
    features: ['Integração automática ao menu de aplicativos', 'Verificação de atualizações de AppImages', 'Organização automática em ~/Applications'],
    permissions: ['Sistema de Arquivos'],
    screenshots: [
      {
        title: 'Lista de AppImages Integrados',
        description: 'Exibição dos executáveis com ícones e status de atualização.',
        caption: 'Gerencie todos os seus AppImages no mesmo lugar',
        type: 'ui_mock',
        themeColor: '#607D8B'
      }
    ]
  },
  {
    id: 'libreoffice',
    appId: 'org.libreoffice.LibreOffice',
    name: 'LibreOffice',
    tagline: 'The LibreOffice productivity suite',
    description: 'A suíte de escritório livre mais poderosa do mundo com editor de texto (Writer), planilhas (Calc), apresentações (Impress) e diagramas (Draw).',
    category: 'Produtividade',
    version: '24.8.1',
    developer: 'The Document Foundation',
    size: '280 MB',
    rating: 4.8,
    reviewsCount: 13000,
    downloads: '42.0M',
    installed: true,
    packageManager: 'apt',
    executable: 'libreoffice',
    verified: true,
    license: 'MPL-2.0',
    releaseDate: '06 Setembro 2026',
    memoryUsage: '220 MB RAM',
    iconType: 'libreoffice',
    features: ['Totalmente compatível com arquivos Microsoft Office (.docx, .xlsx, .pptx)', 'Exportação nativa para PDF e formulários', 'Editor de equações e macros embutido'],
    permissions: ['Sistema de Arquivos', 'Impressão'],
    screenshots: [
      {
        title: 'LibreOffice Writer & Planilhas Calc',
        description: 'Interface rica com réguas, verificação ortográfica e estilos avançados.',
        caption: 'Suíte completa para documentos e relatórios',
        type: 'editor',
        themeColor: '#18A303'
      }
    ]
  },
  {
    id: 'vscode',
    appId: 'com.visualstudio.code',
    name: 'Visual Studio Code',
    tagline: 'Code editing. Redefined.',
    description: 'Editor de código-fonte de alta performance com suporte a depuração, Git integrado, terminal de comando e milhares de extensões.',
    category: 'Desenvolvimento',
    version: '1.93.1',
    developer: 'Microsoft Corporation',
    size: '98 MB',
    rating: 4.9,
    reviewsCount: 28000,
    downloads: '68.0M',
    installed: true,
    packageManager: 'flatpak',
    executable: 'code',
    verified: true,
    license: 'MIT',
    releaseDate: '15 Setembro 2026',
    memoryUsage: '260 MB RAM',
    iconType: 'vscode',
    features: ['IntelliSense e autocompletar inteligente', 'Terminal integrado com bash e zsh', 'Marketplace completo de extensões'],
    permissions: ['Sistema de Arquivos (host)', 'Rede', 'Wayland'],
    screenshots: [
      {
        title: 'Workspace de Programação & Extensões',
        description: 'Ambiente de desenvolvimento com destaque de sintaxe e minimapa lateral.',
        caption: 'Editor completo com depuração integrada',
        type: 'code',
        themeColor: '#007ACC'
      }
    ]
  },
  {
    id: 'ppsspp',
    appId: 'org.ppsspp.PPSSPP',
    name: 'PPSSPP',
    tagline: 'A PlayStation Portable emulator',
    description: 'Emulador de PlayStation Portable (PSP) de altíssima velocidade. Jogue seus games em resolução Full HD com texturas aprimoradas e suporte a controles.',
    category: 'Jogos',
    version: '1.17.1',
    developer: 'Henrik Rydgård',
    size: '35 MB',
    rating: 5.0,
    reviewsCount: 7100,
    downloads: '15.4M',
    installed: false,
    packageManager: 'flatpak',
    executable: 'ppsspp',
    verified: true,
    license: 'GPL-2.0',
    releaseDate: '01 Setembro 2026',
    memoryUsage: '180 MB RAM',
    iconType: 'ppsspp',
    features: ['Renderização em alta resolução (1080p / 4K)', 'Mapeamento de botões para controles de Xbox e PlayStation', 'Save states e modo turbo'],
    permissions: ['Aceleração Vulkan/OpenGL', 'Controles USB', 'Armazenamento'],
    screenshots: [
      {
        title: 'Menu de Jogos PSP & Configurações',
        description: 'Interface gráfica com seleção de shaders e taxa de renderização.',
        caption: 'Emulação de PSP em 60 quadros por segundo',
        type: 'game',
        themeColor: '#2196F3'
      }
    ]
  },
  {
    id: 'protonvpn',
    appId: 'com.protonvpn.www',
    name: 'Proton VPN',
    tagline: 'Secures your internet and protects your online privacy',
    description: 'VPN de alta velocidade desenvolvida pelos cientistas do CERN com proteção rigorosa contra vazamento de DNS, sem registros (no-logs) e servidores seguros.',
    category: 'Internet',
    version: '4.4.2',
    developer: 'Proton AG',
    size: '42 MB',
    rating: 4.8,
    reviewsCount: 5400,
    downloads: '12.0M',
    installed: false,
    packageManager: 'flatpak',
    executable: 'protonvpn',
    verified: true,
    license: 'GPL-3.0',
    releaseDate: '12 Setembro 2026',
    memoryUsage: '85 MB RAM',
    iconType: 'protonvpn',
    features: ['Criptografia WireGuard e OpenVPN', 'Política estrita de não registro de dados', 'Conexão rápida em mais de 90 países'],
    permissions: ['Rede e Interface TUN/TAP'],
    screenshots: [
      {
        title: 'Mapa Global de Servidores VPN',
        description: 'Painel com seleção de país, velocidade de ping e alternador de Kill Switch.',
        caption: 'Conexão criptografada segura em 1 toque',
        type: 'ui_mock',
        themeColor: '#6D4AFF'
      }
    ]
  },
  {
    id: 'lutris',
    appId: 'net.lutris.Lutris',
    name: 'Lutris',
    tagline: 'Plataforma de preservação de video games',
    description: 'Gerenciador universal de jogos para Linux. Instale e organize títulos do Steam, GOG, Epic Games, emuladores e jogos clássicos do Windows com scripts comunitários.',
    category: 'Jogos',
    version: '0.5.17',
    developer: 'The Lutris Team',
    size: '62 MB',
    rating: 4.9,
    reviewsCount: 8900,
    downloads: '24.0M',
    installed: false,
    packageManager: 'flatpak',
    executable: 'lutris',
    verified: true,
    license: 'GPL-3.0',
    releaseDate: '07 Setembro 2026',
    memoryUsage: '190 MB RAM',
    iconType: 'lutris',
    features: ['Scripts de instalação automática de jogos antigos', 'Integração com Wine, Proton, ScummVM e MAME', 'Sincronização de biblioteca'],
    permissions: ['Sistema de Arquivos', 'Aceleração GPU', 'Rede'],
    screenshots: [
      {
        title: 'Biblioteca Unificada de Jogos',
        description: 'Capas em grade com filtros por plataforma e inicialização em 1 clique.',
        caption: 'Todos os seus jogos em um só lugar',
        type: 'game',
        themeColor: '#FF6F00'
      }
    ]
  }
];
