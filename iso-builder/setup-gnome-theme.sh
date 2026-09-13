#!/usr/bin/env bash
# ==============================================================================
# InoveCloud OS - Script Nativo de Configuração Visual e Sistema GNOME 46+
# Base: Debian 13 (Trixie) / Ubuntu 24.04+
# Identidade Visual: Liquid Glass (Dark Mode, Glassmorphism, Floating Dock)
# ==============================================================================

set -e

# Cores para saída no terminal
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RESET='\033[0m'

echo -e "${CYAN}================================================================${RESET}"
echo -e "${CYAN}   INOVECLOUD OS - CONFIGURADOR VISUAL & DCONF GNOME NATIVO     ${RESET}"
echo -e "${CYAN}================================================================${RESET}"

# Verificar privilégios de Root
if [ "$(id -u)" -ne 0 ]; then
  echo -e "${RED}[ERRO] Este script precisa ser executado como root (sudo).${RESET}"
  exit 1
fi

TARGET_ROOT="${1:-/}"

echo -e "${BLUE}[1/6] Criando diretórios do sistema e dconf em ${TARGET_ROOT}...${RESET}"
mkdir -p "${TARGET_ROOT}/etc/dconf/profile"
mkdir -p "${TARGET_ROOT}/etc/dconf/db/local.d"
mkdir -p "${TARGET_ROOT}/etc/dconf/db/local.d/locks"
mkdir -p "${TARGET_ROOT}/usr/share/themes/InoveCloud-Glass/gnome-shell"
mkdir -p "${TARGET_ROOT}/usr/share/themes/InoveCloud-Glass/gtk-3.0"
mkdir -p "${TARGET_ROOT}/usr/share/themes/InoveCloud-Glass/gtk-4.0"
mkdir -p "${TARGET_ROOT}/usr/share/backgrounds/inovecloud"
mkdir -p "${TARGET_ROOT}/usr/share/gnome-background-properties"

# ==============================================================================
# 1. PERFIL DCONF DO SISTEMA (/etc/dconf/profile/user)
# ==============================================================================
echo -e "${BLUE}[2/6] Configurando Perfil DConf do Usuário...${RESET}"
cat << 'EOF' > "${TARGET_ROOT}/etc/dconf/profile/user"
user-db:user
system-db:local
EOF

# ==============================================================================
# 2. CONFIGURAÇÕES DCONF NATIVAS (/etc/dconf/db/local.d/01-inovecloud-desktop)
# ==============================================================================
echo -e "${BLUE}[3/6] Gerando arquivos de configuração DConf nativos...${RESET}"
cat << 'EOF' > "${TARGET_ROOT}/etc/dconf/db/local.d/01-inovecloud-desktop"
# ==============================================================================
# INOVECLOUD OS - CONFIGURAÇÕES GLOBAIS DE INTERFACE (GNOME 46+ DEBIAN 13)
# ==============================================================================

[org/gnome/desktop/interface]
color-scheme='prefer-dark'
gtk-theme='InoveCloud-Glass'
icon-theme='Papirus-Dark'
cursor-theme='Adwaita'
font-name='Inter 10'
document-font-name='Inter 10'
monospace-font-name='JetBrains Mono 10'
show-battery-percentage=true
clock-show-weekday=true
clock-show-seconds=false
clock-format='24h'
enable-animations=true
scaling-factor=uint32 1

[org/gnome/desktop/wm/preferences]
theme='InoveCloud-Glass'
button-layout='appmenu:minimize,maximize,close'
titlebar-font='Inter Bold 10'
focus-mode='click'
action-double-click-titlebar='toggle-maximize'

[org/gnome/desktop/wm/keybindings]
close=['<Super>q', '<Alt>F4']
maximize=['<Super>Up']
unmaximize=['<Super>Down']

[org/gnome/desktop/background]
picture-uri='file:///usr/share/backgrounds/inovecloud/cyber-red.jpg'
picture-uri-dark='file:///usr/share/backgrounds/inovecloud/cyber-red.jpg'
picture-options='zoom'
primary-color='#0b0b12'
secondary-color='#1e0508'

[org/gnome/desktop/screensaver]
picture-uri='file:///usr/share/backgrounds/inovecloud/cyber-red.jpg'
primary-color='#0b0b12'
secondary-color='#1e0508'

[org/gnome/desktop/sound]
theme-name='freedesktop'
event-sounds=true
input-feedback-sounds=false

# ==============================================================================
# GNOME SHELL, EXTENSÕES E ATALHOS PADRÃO DA DOCK
# ==============================================================================
[org/gnome/shell]
enabled-extensions=['dash-to-dock@vswitch.org', 'appindicatorsupport@rgcjonas.gmail.com', 'user-theme@gnome-shell-extensions.gcampax.github.com']
favorite-apps=['org.gnome.Nautilus.desktop', 'org.gnome.Terminal.desktop', 'chromium.desktop', 'org.gnome.Software.desktop', 'gnome-control-center.desktop', 'inovecloud-desktop.desktop']

[org/gnome/shell/extensions/user-theme]
name='InoveCloud-Glass'

# ==============================================================================
# DOCK CENTRALIZADA FLUTUANTE (DASH TO DOCK - LIQUID GLASS STYLE)
# ==============================================================================
[org/gnome/shell/extensions/dash-to-dock]
dock-position='BOTTOM'
dock-fixed=false
autohide=true
intellihide=true
intellihide-mode='ALL_WINDOWS'
dash-max-icon-size=52
extend-height=false
apply-custom-theme=true
transparency-mode='FIXED'
background-opacity=0.75
custom-background-color=true
background-color='rgb(12,14,24)'
custom-theme-shrink=true
show-show-apps-button=true
show-apps-at-top=false
show-trash=false
show-mounts=false
running-indicator-style='DOTS'
click-action='focus-minimize-or-previews'
scroll-action='cycle-windows'
isolate-workspaces=false
isolate-monitors=false
EOF

# ==============================================================================
# 3. TEMA GNOME SHELL NATIVO LIQUID GLASS (CSS)
# ==============================================================================
echo -e "${BLUE}[4/6] Escrevendo estilos Liquid Glass para GNOME Shell e GTK...${RESET}"
cat << 'EOF' > "${TARGET_ROOT}/usr/share/themes/InoveCloud-Glass/gnome-shell/gnome-shell.css"
/* ==========================================================================
   InoveCloud Liquid Glass Theme for GNOME Shell 46+ (Debian 13 Trixie)
   Frosted Glassmorphism, Crimson Red Glow, Floating Glass Dock & Translucent UI
   ========================================================================== */

/* Top Panel Glassmorphism */
#panel {
  background-color: rgba(12, 14, 24, 0.70) !important;
  font-weight: 600;
  height: 38px;
  font-size: 11pt;
  color: #f1f5f9;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.45);
  transition-duration: 250ms;
}

#panel.unlock-screen,
#panel.login-screen,
#panel:overview {
  background-color: transparent !important;
  border-bottom: none;
  box-shadow: none;
}

.panel-button {
  font-weight: 700;
  color: #e2e8f0;
  padding: 0 14px;
  border-radius: 12px;
  margin: 3px 2px;
  transition-duration: 180ms;
}

.panel-button:hover,
.panel-button:active,
.panel-button:focus {
  background-color: rgba(255, 255, 255, 0.15) !important;
  color: #ffffff !important;
  box-shadow: 0 0 14px rgba(239, 68, 68, 0.35);
}

/* Relógio Centralizado e Indicadores */
#panel .clock-display {
  font-weight: 800;
  letter-spacing: 0.3px;
}

/* Menus de Configurações Rápidas Flutuantes (Quick Settings) */
.popup-menu-content {
  background-color: rgba(16, 18, 30, 0.88) !important;
  border: 1px solid rgba(255, 255, 255, 0.16) !important;
  border-radius: 22px !important;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.7) !important;
  padding: 12px !important;
  color: #f8fafc;
}

.popup-menu-item {
  border-radius: 12px;
  padding: 8px 14px;
  font-weight: 600;
  transition: all 150ms ease;
}

.popup-menu-item:hover,
.popup-menu-item:focus {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.35) 0%, rgba(185, 28, 28, 0.25) 100%) !important;
  color: #ffffff !important;
  border: 1px solid rgba(239, 68, 68, 0.45);
}

/* Dash / Dock Flutuante Liquid Glass */
#dashtodockContainer .dash-background,
#dash .dash-background {
  background-color: rgba(12, 14, 24, 0.75) !important;
  border: 1px solid rgba(255, 255, 255, 0.18) !important;
  border-radius: 26px !important;
  box-shadow: 0 14px 45px rgba(0, 0, 0, 0.65), 0 0 24px rgba(239, 68, 68, 0.25) !important;
  padding: 6px 12px !important;
}

.app-well-app .overview-icon,
.show-apps .overview-icon {
  border-radius: 16px;
  padding: 6px;
  transition-duration: 200ms;
}

.app-well-app:hover .overview-icon,
.show-apps:hover .overview-icon {
  background-color: rgba(255, 255, 255, 0.18) !important;
  box-shadow: 0 8px 24px rgba(239, 68, 68, 0.45);
}

.app-well-app.focused .overview-icon {
  background-color: rgba(239, 68, 68, 0.28) !important;
  border-bottom: 2px solid #ef4444;
}

/* Caixas de Diálogo e Modais Glass */
.modal-dialog {
  background-color: rgba(14, 16, 28, 0.92) !important;
  border: 1px solid rgba(255, 255, 255, 0.20) !important;
  border-radius: 24px !important;
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.85) !important;
  padding: 24px !important;
}

.modal-dialog-linked-button {
  background-color: rgba(239, 68, 68, 0.3) !important;
  border: 1px solid rgba(239, 68, 68, 0.5) !important;
  border-radius: 14px !important;
  color: #ffffff !important;
  font-weight: 700;
  padding: 10px 22px;
}

.modal-dialog-linked-button:hover {
  background-color: rgba(239, 68, 68, 0.65) !important;
}
EOF

cat << 'EOF' > "${TARGET_ROOT}/usr/share/themes/InoveCloud-Glass/gtk-4.0/gtk.css"
/* GTK4 Liquid Glass Theme Accents */
window.background {
  background-color: #0b0c13;
  color: #f1f5f9;
}

headerbar {
  background-color: rgba(14, 16, 26, 0.80);
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.35);
}

button.suggested-action {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: #ffffff;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 14px rgba(239, 68, 68, 0.45);
}
EOF

cp "${TARGET_ROOT}/usr/share/themes/InoveCloud-Glass/gtk-4.0/gtk.css" "${TARGET_ROOT}/usr/share/themes/InoveCloud-Glass/gtk-3.0/gtk.css"

# ==============================================================================
# 4. XML DE PROPRIEDADES DE WALLPAPERS DO GNOME
# ==============================================================================
echo -e "${BLUE}[5/6] Configurando XML de Wallpapers do GNOME...${RESET}"
cat << 'EOF' > "${TARGET_ROOT}/usr/share/gnome-background-properties/inovecloud-wallpapers.xml"
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE wallpapers SYSTEM "gnome-wp-list.dtd">
<wallpapers>
  <wallpaper deleted="false">
    <name>InoveCloud Cyber Red (Glass Edition)</name>
    <filename>/usr/share/backgrounds/inovecloud/cyber-red.jpg</filename>
    <options>zoom</options>
    <pcolor>#0b0b12</pcolor>
    <scolor>#1e0508</scolor>
  </wallpaper>
  <wallpaper deleted="false">
    <name>Gemini Garden Prism</name>
    <filename>/usr/share/backgrounds/inovecloud/garden-prism.jpg</filename>
    <options>zoom</options>
  </wallpaper>
  <wallpaper deleted="false">
    <name>Cosmos Deep Nebula</name>
    <filename>/usr/share/backgrounds/inovecloud/deep-nebula.jpg</filename>
    <options>zoom</options>
  </wallpaper>
</wallpapers>
EOF

# ==============================================================================
# 5. ATUALIZAR BANCO DE DADOS DCONF
# ==============================================================================
echo -e "${BLUE}[6/6] Compilando banco de dados DConf (dconf update)...${RESET}"
if command -v dconf &>/dev/null; then
  if [ "$TARGET_ROOT" = "/" ]; then
    dconf update
  else
    chroot "${TARGET_ROOT}" dconf update || true
  fi
fi

echo -e "${GREEN}✓ Identidade visual GNOME Liquid Glass instalada com sucesso!${RESET}"
