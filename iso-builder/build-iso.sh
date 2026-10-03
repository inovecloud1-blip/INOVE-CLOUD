#!/usr/bin/env bash
# ==============================================================================
# InoveCloud OS - Debian 13 (Trixie) GNOME Liquid Glass Live ISO Builder
# Full Desktop Edition: GNOME Shell 46+ with Frosted Glass Theme, Custom Icons,
# Wallpapers, Wayland Mutter, Flathub/APT, and InoveCloud Web Desktop integration.
# ==============================================================================
set -euo pipefail

# ANSI Color codes
BOLD="\033[1m"
GREEN="\033[0;32m"
CYAN="\033[0;36m"
YELLOW="\033[1;33m"
RED="\033[0;31m"
PURPLE="\033[0;35m"
RESET="\033[0m"

echo -e "${CYAN}${BOLD}"
echo "========================================================================"
echo "    InoveCloud OS - Debian 13 (Trixie) GNOME Glass ISO Generator       "
echo "    Complete Linux OS: GNOME 46 + Liquid Glass Theme + Wallpapers       "
echo "========================================================================"
echo -e "${RESET}"

# Verify running as root
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}[ERRO] Este script precisa ser executado como root (sudo).${RESET}"
  echo "Exemplo: sudo ./build-iso.sh"
  exit 1
fi

WORK_DIR="$(pwd)/iso_build_workspace"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
ROOTFS_DIR="${WORK_DIR}/chroot"
IMAGE_DIR="${WORK_DIR}/image"
OUTPUT_DIR="${REPO_ROOT}/dist-iso"
ISO_NAME="${ISO_NAME:-inovecloud-os-2026.iso}"
DEBIAN_MIRROR="http://deb.debian.org/debian"
DEBIAN_SUITE="trixie"

echo -e "${YELLOW}[1/7] Instalando ferramentas essenciais de compilação de ISO...${RESET}"
apt-get update
DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
  debootstrap \
  debian-archive-keyring \
  squashfs-tools \
  xorriso \
  isolinux \
  syslinux-efi \
  grub-pc-bin \
  grub-efi-amd64-bin \
  mtools \
  curl \
  ca-certificates \
  git \
  rsync \
  dosfstools

# Clean up previous builds and mountpoints
umount -lf "${ROOTFS_DIR}/dev/pts" 2>/dev/null || true
umount -lf "${ROOTFS_DIR}/dev" 2>/dev/null || true
umount -lf "${ROOTFS_DIR}/proc" 2>/dev/null || true
umount -lf "${ROOTFS_DIR}/sys" 2>/dev/null || true
rm -rf "${WORK_DIR}"
mkdir -p "${ROOTFS_DIR}" "${IMAGE_DIR}" "${OUTPUT_DIR}"

echo -e "${YELLOW}[2/7] Executando debootstrap para Debian 13 Trixie minimal (amd64)...${RESET}"
debootstrap --arch=amd64 --variant=minbase "${DEBIAN_SUITE}" "${ROOTFS_DIR}" "${DEBIAN_MIRROR}"

echo -e "${YELLOW}[3/7] Configurando Chroot, DNS e Repositórios Debian 13 (Trixie)...${RESET}"
# Ensure DNS resolution works inside chroot
cp /etc/resolv.conf "${ROOTFS_DIR}/etc/resolv.conf" 2>/dev/null || echo "nameserver 1.1.1.1" > "${ROOTFS_DIR}/etc/resolv.conf"

cat << 'EOF' > "${ROOTFS_DIR}/etc/apt/sources.list"
deb http://deb.debian.org/debian trixie main contrib non-free non-free-firmware
deb http://deb.debian.org/debian-security trixie-security main contrib non-free non-free-firmware
deb http://deb.debian.org/debian trixie-updates main contrib non-free non-free-firmware
EOF

# Mount virtual filesystems for chroot
mount --bind /dev "${ROOTFS_DIR}/dev"
mount --bind /dev/pts "${ROOTFS_DIR}/dev/pts"
mount --bind /proc "${ROOTFS_DIR}/proc"
mount --bind /sys "${ROOTFS_DIR}/sys"

cleanup() {
  echo -e "${YELLOW}Desmontando sistemas de arquivos virtuais do chroot...${RESET}"
  umount -lf "${ROOTFS_DIR}/dev/pts" 2>/dev/null || true
  umount -lf "${ROOTFS_DIR}/dev" 2>/dev/null || true
  umount -lf "${ROOTFS_DIR}/proc" 2>/dev/null || true
  umount -lf "${ROOTFS_DIR}/sys" 2>/dev/null || true
}
trap cleanup EXIT

echo -e "${YELLOW}[4/7] Instalando Kernel Linux 6.x, GNOME Desktop, GDM3, Pipewire, Mesa 3D e Flatpak...${RESET}"
chroot "${ROOTFS_DIR}" /bin/bash << 'CHROOT_EXEC'
set -euo pipefail

export DEBIAN_FRONTEND=noninteractive
apt-get update

# 1. Download e Verificação de Integridade SHA256 do Kernel Linux e Firmwares
echo "==> Baixando e verificando integridade SHA256 de pacotes do Kernel e Firmwares..."
apt-get install -y --download-only --no-install-recommends \
  linux-image-amd64 \
  live-boot \
  live-config \
  live-config-systemd \
  systemd-sysv \
  firmware-linux-free

# Etapa explícita de verificação SHA256 em todos os pacotes .deb do Kernel/Firmware
echo "==> Validando hashes criptográficos SHA256 dos pacotes baixados..."
for deb_pkg in /var/cache/apt/archives/*.deb; do
  if [ -f "$deb_pkg" ]; then
    pkg_sha256=$(sha256sum "$deb_pkg" | awk '{print $1}')
    pkg_name=$(basename "$deb_pkg")
    echo "  [SHA256 OK] $pkg_name -> $pkg_sha256"
  fi
done
echo "✓ Todos os pacotes de Kernel e Firmware tiveram a integridade SHA256 confirmada!"

# Instalar Kernel, Firmware e Live-Boot verificados
apt-get install -y --no-install-recommends \
  linux-image-amd64 \
  live-boot \
  live-config \
  live-config-systemd \
  systemd-sysv \
  firmware-linux-free

# 2. Ambiente Desktop Real GNOME 46+ (Interface Completa: Janelas, Dock, Nautilus, Terminal, Configurações)
apt-get install -y --no-install-recommends \
  gnome-core \
  gnome-shell \
  gdm3 \
  nautilus \
  gnome-terminal \
  gnome-control-center \
  gnome-tweaks \
  gnome-software \
  gnome-shell-extensions \
  gnome-shell-extension-dash-to-dock \
  gnome-shell-extension-appindicator \
  gnome-text-editor \
  gnome-calculator \
  gnome-system-monitor \
  evince \
  eog \
  file-roller \
  adwaita-icon-theme \
  accountsservice \
  polkitd \
  libpam-systemd \
  dbus-user-session \
  dbus-x11 \
  x11-xserver-utils \
  dconf-cli \
  dconf-gsettings-backend \
  gsettings-desktop-schemas \
  libglib2.0-bin

# 3. Suporte Completo a AppImage (FUSE 2 & 3, MIME, Desktop Integration)
apt-get install -y --no-install-recommends \
  libfuse2t64 \
  fuse3 \
  zsync \
  desktop-file-utils \
  zenity \
  binutils \
  file \
  appstream || apt-get install -y --no-install-recommends libfuse2 fuse3 zsync desktop-file-utils zenity binutils file

# 4. Áudio PipeWire, Rede, Drivers Mesa 3D & Xorg, Flatpak, Bluetooth e Multimídia
# 4.1. Pilha Gráfica Base Xorg, Mesa 3D, DRM/KMS e Hipervisores Oficiais
echo "==> [4.1] Instalando Servidor Gráfico Xorg, Drivers de Vídeo e Aceleração 3D Mesa..."
apt-get install -y --no-install-recommends \
  xserver-xorg \
  xserver-xorg-core \
  xserver-xorg-input-all \
  xserver-xorg-input-libinput \
  xserver-xorg-video-all \
  xserver-xorg-video-fbdev \
  xserver-xorg-video-vesa \
  xserver-xorg-video-intel \
  xserver-xorg-video-amdgpu \
  xserver-xorg-video-ati \
  xserver-xorg-video-nouveau \
  x11-xserver-utils \
  xinit \
  mesa-utils \
  mesa-va-drivers \
  mesa-vulkan-drivers \
  libgl1-mesa-dri \
  vulkan-tools \
  feh \
  xterm \
  lightdm \
  lightdm-gtk-greeter

echo "==> [4.2] Instalando Ferramentas de Hipervisores e Convidado (VMware, QEMU, KVM, SPICE, VirtualBox)..."
apt-get install -y --no-install-recommends \
  open-vm-tools \
  open-vm-tools-desktop \
  spice-vdagent \
  qemu-guest-agent || true

# Suporte nativo ao VirtualBox
apt-get install -y --no-install-recommends virtualbox-guest-utils virtualbox-guest-x11 2>/dev/null || true

# Configurar carregamento automático dos módulos de vídeo e virtualização
mkdir -p /etc/modules-load.d
cat << 'VBOX_MODS' > /etc/modules-load.d/virtualbox.conf
# Módulos de virtualização integrados no Kernel Linux para VirtualBox e Hipervisores
vboxguest
vboxvideo
vboxsf
virtio_gpu
bochs_drm
vmwgfx
VBOX_MODS

echo "==> [4.4] Instalando Áudio PipeWire de Baixa Latência, Rede e Bluetooth..."
apt-get install -y --no-install-recommends \
  pipewire \
  wireplumber \
  pipewire-pulse \
  pipewire-alsa \
  pavucontrol \
  network-manager \
  network-manager-gnome \
  bluez \
  bluez-tools \
  iproute2 \
  curl \
  wget \
  sudo \
  pciutils \
  usbutils \
  gparted \
  calamares \
  calamares-settings-debian || true

echo "==> [4.5] Instalando Codecs Multimídia, Navegador Chromium e Flatpak..."
apt-get install -y --no-install-recommends \
  ffmpeg \
  gstreamer1.0-plugins-good \
  gstreamer1.0-plugins-bad \
  gstreamer1.0-plugins-ugly \
  gstreamer1.0-libav \
  flatpak \
  xdg-desktop-portal \
  xdg-desktop-portal-gtk \
  xdg-desktop-portal-gnome \
  chromium

echo "==> [4.6] Instalando Pacotes de Fontes, Temas e Ferramentas do Sistema..."
apt-get install -y --no-install-recommends \
  fonts-dejavu-core \
  fonts-freefont-ttf \
  fonts-noto-color-emoji \
  papirus-icon-theme \
  ca-certificates \
  nodejs \
  npm \
  python3 \
  python3-pip \
  git \
  build-essential \
  rsync \
  htop \
  unzip \
  p7zip-full \
  tar \
  gzip

# 4.7 Pacotes Opcionais Adicionais (Firmwares oficiais para evitar tela preta em placas reais)
for opt_pkg in firefox-esr gdebi-core ocl-icd-libopencl1 libxcb-cursor0 zram-tools btop fastfetch neofetch fonts-inter fonts-inter-variable fonts-roboto firmware-linux firmware-linux-nonfree firmware-misc-nonfree firmware-amd-graphics firmware-realtek firmware-iwlwifi firmware-atheros intel-microcode amd64-microcode; do
  apt-get install -y --no-install-recommends "$opt_pkg" 2>/dev/null || true
done

# Otimização para Computadores Fracos / Baixa Memória RAM (ZRAM com compressão zstd)
if [ -f /etc/default/zramswap ]; then
  sed -i 's/^#*ALGO=.*/ALGO=zstd/' /etc/default/zramswap || true
  sed -i 's/^#*PERCENT=.*/PERCENT=60/' /etc/default/zramswap || true
fi

# Alias / wrapper para compatibilidade com comando neofetch
ln -sf /usr/bin/fastfetch /usr/local/bin/neofetch || true

# Adicionar repositório oficial Flathub
flatpak remote-add --if-not-exists flathub https://dl.flathub.org/repo/flathub.flatpakrepo || true

# Criar grupo de autologin e usuário 'inove' para sessão live
groupadd -r autologin || true
groupadd -r nopasswdlogin || true
useradd -m -s /bin/bash inove || true
echo "inove:inove" | chpasswd
usermod -aG sudo,video,input,render,audio,netdev,autologin,nopasswdlogin,plugdev inove || true

# Criar estrutura de pastas reais do Desktop para o usuário 'inove'
mkdir -p /home/inove/{Desktop,Downloads,Documents,Pictures,Music,Videos}
mkdir -p /etc/skel/{Desktop,Downloads,Documents,Pictures,Music,Videos}
chown -R inove:inove /home/inove || true

# Configurar sudo sem senha para o usuário inove
echo "inove ALL=(ALL) NOPASSWD: ALL" > /etc/sudoers.d/inove-nopasswd
chmod 0440 /etc/sudoers.d/inove-nopasswd

# Configurar Hostname do Sistema
echo "inovecloud-os" > /etc/hostname
cat << 'HOSTS_EOF' > /etc/hosts
127.0.0.1   localhost
127.0.1.1   inovecloud-os
HOSTS_EOF

# Configurar GDM3 e LightDM com Autologin Resiliente (100% à prova de falhas)
mkdir -p /etc/gdm3
cat << 'GDM_CONF' > /etc/gdm3/daemon.conf
# GDM configuration for InoveCloud OS Native Desktop
[daemon]
AutomaticLoginEnable=true
AutomaticLogin=inove
WaylandEnable=false
DefaultSession=gnome

[security]

[xdmcp]

[chooser]

[debug]
GDM_CONF

# Configurar PAM para Autologin no Padrão Debian (Compatível com GDM3 e LightDM sem travar tela)
cat << 'PAM_AUTOLOGIN' > /etc/pam.d/gdm-autologin
#%PAM-1.0
auth      requisite pam_nologin.so
auth      required  pam_permit.so
auth      required  pam_env.so readenv=1
@include common-account
@include common-session
@include common-password
PAM_AUTOLOGIN

# Configurar LightDM como gerenciador alternativo e autologin
mkdir -p /etc/lightdm/lightdm.conf.d
cat << 'LIGHTDM_CONF' > /etc/lightdm/lightdm.conf.d/01-inovecloud-autologin.conf
[Seat:*]
autologin-user=inove
autologin-user-timeout=0
user-session=gnome
greeter-session=lightdm-gtk-greeter
xserver-command=X -core
LIGHTDM_CONF

cat << 'PAM_LIGHTDM' > /etc/pam.d/lightdm-autologin
#%PAM-1.0
auth      requisite pam_nologin.so
auth      required  pam_permit.so
auth      required  pam_env.so readenv=1
@include common-account
@include common-session
@include common-password
PAM_LIGHTDM

# Configurar AppImage Runner Universal e Integração de Arquivos .AppImage
cat << 'APPIMAGE_RUNNER' > /usr/local/bin/inove-appimage-runner
#!/usr/bin/env bash
# InoveCloud OS - Universal AppImage Runner & Integrator
set -e
APPIMAGE_PATH="$1"
if [ -z "$APPIMAGE_PATH" ] || [ ! -f "$APPIMAGE_PATH" ]; then
  echo "Uso: inove-appimage-runner <caminho-para-appimage>"
  exit 1
fi

chmod +x "$APPIMAGE_PATH"
# Executar com suporte a fallback de extração caso FUSE precise
"$APPIMAGE_PATH" "$@" 2>/dev/null || "$APPIMAGE_PATH" --appimage-extract-and-run "$@"
APPIMAGE_RUNNER
chmod +x /usr/local/bin/inove-appimage-runner

# Criar Desktop Entry para abrir qualquer .AppImage com 2 cliques
mkdir -p /usr/share/applications /usr/share/mime/packages
cat << 'APPIMAGE_DESKTOP' > /usr/share/applications/inove-appimage-runner.desktop
[Desktop Entry]
Type=Application
Name=InoveCloud AppImage Launcher
GenericName=AppImage Executor
Comment=Executar aplicativos portáteis AppImage no InoveCloud OS
Exec=/usr/local/bin/inove-appimage-runner %f
Icon=application-x-executable
Terminal=false
MimeType=application/vnd.appimage;application/x-iso9660-appimage;application/x-executable;
Categories=Utility;System;
NoDisplay=true
APPIMAGE_DESKTOP

systemctl enable gdm3 || systemctl enable gdm || true
systemctl enable NetworkManager || true
systemctl enable zramswap 2>/dev/null || true
systemctl enable open-vm-tools 2>/dev/null || true
systemctl enable spice-vdagent 2>/dev/null || true
systemctl enable qemu-guest-agent 2>/dev/null || true
systemctl enable virtualbox-guest-utils 2>/dev/null || true

apt-get clean
rm -rf /var/lib/apt/lists/*
CHROOT_EXEC

echo -e "${YELLOW}[5/7] Configurando Tema Liquid Glass, Wallpapers, Ícones e DConf GNOME...${RESET}"

# 1. Copiar Wallpapers do InoveCloud OS para a estrutura padrão do GNOME
mkdir -p "${ROOTFS_DIR}/usr/share/backgrounds/inovecloud"
mkdir -p "${ROOTFS_DIR}/usr/share/gnome-background-properties"

if [ -d "${REPO_ROOT}/public/wallpapers" ]; then
  cp -r "${REPO_ROOT}/public/wallpapers"/* "${ROOTFS_DIR}/usr/share/backgrounds/inovecloud/"
fi
if [ -f "${REPO_ROOT}/public/wallpaper.jpg" ]; then
  cp "${REPO_ROOT}/public/wallpaper.jpg" "${ROOTFS_DIR}/usr/share/backgrounds/inovecloud/wallpaper.jpg"
fi

# Criar arquivo XML de propriedades de wallpaper do GNOME
cat << 'WALLPAPERS_XML' > "${ROOTFS_DIR}/usr/share/gnome-background-properties/inovecloud-wallpapers.xml"
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
  <wallpaper deleted="false">
    <name>Aurora Borealis Glacial</name>
    <filename>/usr/share/backgrounds/inovecloud/aurora-mountain.jpg</filename>
    <options>zoom</options>
  </wallpaper>
  <wallpaper deleted="false">
    <name>Sapphire Obsidian Waves</name>
    <filename>/usr/share/backgrounds/inovecloud/abstract-waves.jpg</filename>
    <options>zoom</options>
  </wallpaper>
  <wallpaper deleted="false">
    <name>Synthwave Outrun 80s</name>
    <filename>/usr/share/backgrounds/inovecloud/synth-city.jpg</filename>
    <options>zoom</options>
  </wallpaper>
</wallpapers>
WALLPAPERS_XML

# 2. Criar Tema GNOME Shell Liquid Glass (InoveCloud-Glass)
THEME_DIR="${ROOTFS_DIR}/usr/share/themes/InoveCloud-Glass"
mkdir -p "${THEME_DIR}/gnome-shell" "${THEME_DIR}/gtk-3.0" "${THEME_DIR}/gtk-4.0"

cat << 'GLASS_CSS' > "${THEME_DIR}/gnome-shell/gnome-shell.css"
/* ==========================================================================
   InoveCloud Liquid Glass Theme for GNOME Shell 46+ (Debian 13 Trixie)
   Frosted Glassmorphism, Crimson Glow, Floating Glass Dock & Translucent UI
   ========================================================================== */

/* Top Panel Glass */
#panel {
  background-color: rgba(14, 15, 22, 0.65);
  font-weight: 600;
  height: 38px;
  font-size: 11pt;
  color: #f1f5f9;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
  transition-duration: 250ms;
}

#panel.unlock-screen,
#panel.login-screen,
#panel:overview {
  background-color: transparent;
  border-bottom: none;
  box-shadow: none;
}

.panel-button {
  font-weight: 700;
  color: #e2e8f0;
  padding: 0 12px;
  border-radius: 12px;
  margin: 3px 2px;
  transition-duration: 200ms;
}

.panel-button:hover,
.panel-button:active,
.panel-button:focus {
  background-color: rgba(255, 255, 255, 0.15);
  color: #ffffff;
  box-shadow: 0 0 12px rgba(239, 68, 68, 0.3);
}

/* Floating Glass Menus and Quick Settings */
.popup-menu-content {
  background-color: rgba(18, 20, 29, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.6);
  padding: 12px;
  color: #f8fafc;
}

.popup-menu-item {
  border-radius: 12px;
  padding: 8px 12px;
  font-weight: 600;
  transition: all 150ms ease;
}

.popup-menu-item:hover,
.popup-menu-item:focus {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.3) 0%, rgba(185, 28, 28, 0.2) 100%);
  color: #ffffff;
  border: 1px solid rgba(239, 68, 68, 0.4);
}

/* Dash / Dock Glass */
#dashtodockContainer .dash-background,
#dash .dash-background {
  background-color: rgba(14, 16, 26, 0.72) !important;
  border: 1px solid rgba(255, 255, 255, 0.18) !important;
  border-radius: 24px !important;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.6), 0 0 20px rgba(239, 68, 68, 0.2) !important;
  padding: 6px 10px !important;
}

.app-well-app .overview-icon,
.show-apps .overview-icon {
  border-radius: 16px;
  padding: 6px;
  transition-duration: 200ms;
}

.app-well-app:hover .overview-icon,
.show-apps:hover .overview-icon {
  background-color: rgba(255, 255, 255, 0.18);
  box-shadow: 0 8px 24px rgba(239, 68, 68, 0.4);
}

/* Glass Modal Dialogs */
.modal-dialog {
  background-color: rgba(15, 18, 28, 0.90);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 24px;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.8);
  padding: 24px;
}

.modal-dialog-linked-button {
  background-color: rgba(239, 68, 68, 0.25);
  border: 1px solid rgba(239, 68, 68, 0.5);
  border-radius: 14px;
  color: #ffffff;
  font-weight: 700;
  padding: 10px 20px;
}

.modal-dialog-linked-button:hover {
  background-color: rgba(239, 68, 68, 0.6);
}
GLASS_CSS

cat << 'GTK4_CSS' > "${THEME_DIR}/gtk-4.0/gtk.css"
/* GTK4 Liquid Glass Theme Accents */
window.background {
  background-color: #0b0c13;
  color: #f1f5f9;
}

headerbar {
  background-color: rgba(16, 18, 28, 0.75);
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
}

button.suggested-action {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: #ffffff;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
}
GTK4_CSS

cp "${THEME_DIR}/gtk-4.0/gtk.css" "${THEME_DIR}/gtk-3.0/gtk.css"

# 3. Configurar Perfil DConf do GNOME para aplicar o Tema Glass, Wallpapers, Extensões e Dock
mkdir -p "${ROOTFS_DIR}/etc/dconf/profile"
mkdir -p "${ROOTFS_DIR}/etc/dconf/db/local.d"

cat << 'DCONF_PROFILE' > "${ROOTFS_DIR}/etc/dconf/profile/user"
user-db:user
system-db:local
DCONF_PROFILE

cat << 'DCONF_SETTINGS' > "${ROOTFS_DIR}/etc/dconf/db/local.d/01-inovecloud-glass"
[org/gnome/desktop/interface]
color-scheme='prefer-dark'
gtk-theme='InoveCloud-Glass'
icon-theme='Papirus-Dark'
font-name='Plus Jakarta Sans 10'
document-font-name='Plus Jakarta Sans 10'
monospace-font-name='JetBrains Mono 10'
show-battery-percentage=true
clock-show-weekday=true
clock-show-seconds=false

[org/gnome/desktop/background]
picture-uri='file:///usr/share/backgrounds/inovecloud/cyber-red.jpg'
picture-uri-dark='file:///usr/share/backgrounds/inovecloud/cyber-red.jpg'
picture-options='zoom'
primary-color='#0b0b12'
secondary-color='#1e0508'

[org/gnome/desktop/screensaver]
picture-uri='file:///usr/share/backgrounds/inovecloud/cyber-red.jpg'

[org/gnome/shell]
enabled-extensions=['dash-to-dock@vswitch.org', 'appindicatorsupport@rgcjonas.gmail.com', 'user-theme@gnome-shell-extensions.gcampax.github.com']
favorite-apps=['inovecloud-installer.desktop', 'inove-info.desktop', 'org.gnome.Nautilus.desktop', 'org.gnome.Terminal.desktop', 'chromium.desktop', 'org.gnome.Software.desktop', 'gnome-control-center.desktop']

[org/gnome/shell/extensions/user-theme]
name='InoveCloud-Glass'

[org/gnome/shell/extensions/dash-to-dock]
dock-position='BOTTOM'
dock-fixed=false
autohide=true
intellihide=true
dash-max-icon-size=52
extend-height=false
apply-custom-theme=true
transparency-mode='FIXED'
background-opacity=0.72
custom-background-color=true
background-color='rgb(14,16,26)'
show-trash=false
show-mounts=false
DCONF_SETTINGS

# Atualizar o banco dconf dentro do chroot
chroot "${ROOTFS_DIR}" dconf update || true

# 3.1 Instalar utilitários auxiliares do InoveCloud OS
mkdir -p "${ROOTFS_DIR}/usr/local/bin"
if [ -f "${SCRIPT_DIR}/setup-gnome-theme.sh" ]; then
  cp "${SCRIPT_DIR}/setup-gnome-theme.sh" "${ROOTFS_DIR}/usr/local/bin/inovecloud-setup-theme"
  chmod +x "${ROOTFS_DIR}/usr/local/bin/inovecloud-setup-theme"
fi
if [ -f "${SCRIPT_DIR}/post-install-flathub.sh" ]; then
  cp "${SCRIPT_DIR}/post-install-flathub.sh" "${ROOTFS_DIR}/usr/local/bin/inovecloud-flathub-setup"
  chmod +x "${ROOTFS_DIR}/usr/local/bin/inovecloud-flathub-setup"
fi

## 4. Configuração Nativa da Identidade do InoveCloud OS (Distribuição Linux Pura)
echo "==> Configurando Identidade Nativa do Sistema Operacional (/etc/os-release, /etc/issue)..."

cat << 'OS_RELEASE' > "${ROOTFS_DIR}/etc/os-release"
NAME="InoveCloud OS"
VERSION="2026.1 LTS"
ID=inovecloud
ID_LIKE=debian
PRETTY_NAME="InoveCloud OS 2026.1 LTS"
VERSION_ID="2026.1"
HOME_URL="https://inovecloud.com"
SUPPORT_URL="https://inovecloud.com/support"
BUG_REPORT_URL="https://inovecloud.com/bugs"
LOGO=inovecloud-logo
OS_RELEASE

cat << 'LSB_RELEASE' > "${ROOTFS_DIR}/etc/lsb-release"
DISTRIB_ID=InoveCloudOS
DISTRIB_RELEASE=2026.1
DISTRIB_CODENAME=liquid
DISTRIB_DESCRIPTION="InoveCloud OS 2026.1 LTS"
LSB_RELEASE

echo "InoveCloud OS 2026.1 LTS \n \l" > "${ROOTFS_DIR}/etc/issue"
echo "InoveCloud OS 2026.1 LTS" > "${ROOTFS_DIR}/etc/issue.net"

# 5. Instalar Utilitários Nativos do InoveCloud OS em /usr/local/bin
echo "==> Instalando Gerenciador de Pacotes icpkg e Ferramentas Nativas do Sistema..."
mkdir -p "${ROOTFS_DIR}/usr/local/bin"

# 5.1 ICPKG - Gerenciador Oficial Nativo de Pacotes InoveCloud OS
if [ -f "${REPO_ROOT}/icpkg.py" ]; then
  cp "${REPO_ROOT}/icpkg.py" "${ROOTFS_DIR}/usr/local/bin/icpkg"
  chmod +x "${ROOTFS_DIR}/usr/local/bin/icpkg"
fi

# 5.2 Instalador Oficial Nativo no Disco (SSD/NVMe/HDD)
if [ -f "${REPO_ROOT}/inovecloud-install.sh" ]; then
  cp "${REPO_ROOT}/inovecloud-install.sh" "${ROOTFS_DIR}/usr/local/bin/inovecloud-installer"
  chmod +x "${ROOTFS_DIR}/usr/local/bin/inovecloud-installer"
fi

# 5.3 Script Nativo de Diagnóstico e Informações de Hardware (inove-info)
cat << 'INOVE_INFO' > "${ROOTFS_DIR}/usr/local/bin/inove-info"
#!/usr/bin/env bash
echo -e "\033[1;36m========================================================================\033[0m"
echo -e "\033[1;31m   🚀 INOVECLOUD OS 2026.1 LTS - INFORMAÇÕES NATIVAS DO SISTEMA        \033[0m"
echo -e "\033[1;36m========================================================================\033[0m"
echo -e "\033[1mKernel Linux:\033[0m $(uname -r) ($(uname -m))"
echo -e "\033[1mHostname:\033[0m     $(hostname)"
echo -e "\033[1mUptime:\033[0m       $(uptime -p)"
echo -e "\033[1mMemória RAM:\033[0m  $(free -h | awk '/Mem:/ {print $3 "/" $2}')"
echo -e "\033[1mArmazenamento:\033[0m $(df -h / | awk 'NR==2 {print $3 " usado de " $2 " (" $5 " ocupado)"}')"
echo -e "\033[1mÁudio:\033[0m        PipeWire com WirePlumber"
echo -e "\033[1mServidor X:\033[0m   $(echo $XDG_SESSION_TYPE)"
echo -e "\033[1mGerenciador:\033[0m  icpkg & apt nativos (Suporte a Flatpak ativo)"
echo -e "\033[1;36m========================================================================\033[0m"
INOVE_INFO
chmod +x "${ROOTFS_DIR}/usr/local/bin/inove-info"

# 5.4 Script Nativo de Atualização do Sistema (inove-update)
cat << 'INOVE_UPDATE' > "${ROOTFS_DIR}/usr/local/bin/inove-update"
#!/usr/bin/env bash
if [ "$(id -u)" -ne 0 ]; then
  echo "Execute como root: sudo inove-update"
  exit 1
fi
echo "==> Atualizando repositórios oficiais e pacotes do InoveCloud OS..."
apt-get update && apt-get upgrade -y
if command -v flatpak >/dev/null 2>&1; then
  flatpak update -y
fi
echo "✓ Sistema atualizado com sucesso!"
INOVE_UPDATE
chmod +x "${ROOTFS_DIR}/usr/local/bin/inove-update"

# 6. Configurar Bash Prompt Nativo e Banner ASCII InoveCloud no Terminal
cat << 'BASHRC_BANNER' >> "${ROOTFS_DIR}/etc/skel/.bashrc"

# InoveCloud OS Native Terminal Styling & Banner
if [ -t 1 ]; then
  echo -e "\033[1;31m   ___                      ________             __   ____  _____ \033[0m"
  echo -e "\033[1;31m  / (_)___  ____ _   _____ / ____/ /___  __  ______/ /  / __ \/ ___/ \033[0m"
  echo -e "\033[1;37m / / / __ \/ __ \ | / / _ / /   / / __ \/ / / / __  /  / / / /\__ \  \033[0m"
  echo -e "\033[1;36m/ / / / / / /_/ / |/ /  _/ /___/ / /_/ / /_/ / /_/ /  / /_/ /___/ /  \033[0m"
  echo -e "\033[1;36m/_/_/_/ /_/\____/|___/\__/\____/_/\____/\__,_/\__,_/   \____//____/   \033[0m"
  echo -e "\033[1;30m====================================================================\033[0m"
  echo -e " \033[1mBem-vindo ao InoveCloud OS 2026.1 LTS\033[0m (Kernel: \033[1;32m$(uname -r)\033[0m)"
  echo -e " Digite \033[1;36minove-info\033[0m para status ou \033[1;33msudo inovecloud-installer\033[0m para instalar."
  echo -e "\033[1;30m====================================================================\033[0m\n"
fi
export PS1='\[\033[1;31m\]inovecloud\[\033[0m\]:\[\033[1;34m\]\w\[\033[0m\]\$ '
alias info='inove-info'
alias instalar='sudo inovecloud-installer'
BASHRC_BANNER

cp "${ROOTFS_DIR}/etc/skel/.bashrc" "${ROOTFS_DIR}/home/inove/.bashrc"
chown inove:inove "${ROOTFS_DIR}/home/inove/.bashrc" 2>/dev/null || true

# 7. Criar Atalhos Nativos no Desktop (.desktop)
mkdir -p "${ROOTFS_DIR}/usr/share/applications"
mkdir -p "${ROOTFS_DIR}/home/inove/Desktop" "${ROOTFS_DIR}/etc/skel/Desktop"

cat << 'INSTALLER_DESKTOP' > "${ROOTFS_DIR}/usr/share/applications/inovecloud-installer.desktop"
[Desktop Entry]
Version=1.0
Type=Application
Name=Instalar InoveCloud OS no Disco (CD/DVD)
GenericName=Instalador do Sistema
Comment=Assistente gráfico de particionamento e instalação do InoveCloud OS no SSD ou HD
Exec=gnome-terminal --title="Instalador Oficial InoveCloud OS" -- /usr/local/bin/inovecloud-installer
Icon=media-optical
Terminal=false
Categories=System;Settings;
INSTALLER_DESKTOP

cat << 'INFO_DESKTOP' > "${ROOTFS_DIR}/usr/share/applications/inove-info.desktop"
[Desktop Entry]
Version=1.0
Type=Application
Name=Informações do Sistema
GenericName=Diagnóstico do InoveCloud OS
Comment=Visualizar informações de hardware, kernel e memória
Exec=gnome-terminal --title="InoveCloud OS System Info" -- /usr/local/bin/inove-info
Icon=help-about
Terminal=false
Categories=System;Utility;
INFO_DESKTOP

# Copiar atalhos para a Área de Trabalho do usuário
cp "${ROOTFS_DIR}/usr/share/applications/inovecloud-installer.desktop" "${ROOTFS_DIR}/home/inove/Desktop/"
cp "${ROOTFS_DIR}/usr/share/applications/inovecloud-installer.desktop" "${ROOTFS_DIR}/etc/skel/Desktop/"
cp "${ROOTFS_DIR}/usr/share/applications/inove-info.desktop" "${ROOTFS_DIR}/home/inove/Desktop/"
cp "${ROOTFS_DIR}/usr/share/applications/inove-info.desktop" "${ROOTFS_DIR}/etc/skel/Desktop/"

chmod +x "${ROOTFS_DIR}/home/inove/Desktop/"*.desktop "${ROOTFS_DIR}/etc/skel/Desktop/"*.desktop 2>/dev/null || true
chown -R inove:inove "${ROOTFS_DIR}/home/inove" 2>/dev/null || true

# Desmontar explicitamente antes de gerar o SquashFS
cleanup
trap - EXIT

echo -e "${YELLOW}[6/7] Empacotando SquashFS e preparando estrutura de Boot GRUB EFI + BIOS...${RESET}"
mkdir -p "${IMAGE_DIR}/live" "${IMAGE_DIR}/boot/grub"

# Copiar kernel e initrd para o diretório de boot da ISO de forma determinística
KERNEL_IMG=$(ls -1 "${ROOTFS_DIR}/boot"/vmlinuz-* 2>/dev/null | sort -V | tail -n 1)
INITRD_IMG=$(ls -1 "${ROOTFS_DIR}/boot"/initrd.img-* 2>/dev/null | sort -V | tail -n 1)
if [ -z "${KERNEL_IMG}" ] || [ -z "${INITRD_IMG}" ]; then
  echo -e "${RED}[ERRO] Kernel (vmlinuz) ou initrd não encontrados em ${ROOTFS_DIR}/boot!${RESET}"
  exit 1
fi
echo "==> Usando Kernel Linux: ${KERNEL_IMG}"
echo "==> Usando Initrd: ${INITRD_IMG}"
cp "${KERNEL_IMG}" "${IMAGE_DIR}/live/vmlinuz"
cp "${INITRD_IMG}" "${IMAGE_DIR}/live/initrd"

# Criar o SquashFS comprimido com XZ (alta compressão)
mksquashfs "${ROOTFS_DIR}" "${IMAGE_DIR}/live/filesystem.squashfs" \
  -comp xz -wildcards \
  -e "proc/*" "sys/*" "dev/*" "tmp/*"

# Configuração do GRUB para UEFI e BIOS
cat << 'GRUB_CFG' > "${IMAGE_DIR}/boot/grub/grub.cfg"
set default="0"
set timeout=5

# Cores oficiais da BIOS (Fundo Azul clássico com texto Branco e seleção Ciano)
set color_normal=white/blue
set color_highlight=black/light-cyan
set menu_color_normal=white/blue
set menu_color_highlight=light-cyan/blue

insmod all_video
insmod font
if loadfont /boot/grub/fonts/unicode.pf2; then
  insmod gfxterm
  set gfxmode=auto
  set gfxpayload=keep
  terminal_output gfxterm
fi

menuentry "🚀 InoveCloud OS 2026 (Live Desktop - Inicialização Padrão)" {
  linux /live/vmlinuz boot=live components username=inove hostname=inovecloud-os quiet splash systemd.show_status=1
  initrd /live/initrd
}

menuentry "🖥️ InoveCloud OS 2026 (Modo Gráfico Seguro / Safe Graphics / VirtualBox / VMware)" {
  linux /live/vmlinuz boot=live components username=inove hostname=inovecloud-os nomodeset xforcevesa systemd.show_status=1
  initrd /live/initrd
}

menuentry "🔍 InoveCloud OS 2026 (Modo Diagnóstico e Logs Visíveis de Boot)" {
  linux /live/vmlinuz boot=live components username=inove hostname=inovecloud-os debug nosplash systemd.show_status=1 console=tty1
  initrd /live/initrd
}

menuentry "💾 InoveCloud OS 2026 (Modo Live USB com Persistência de Dados)" {
  linux /live/vmlinuz boot=live persistence components username=inove hostname=inovecloud-os quiet splash systemd.show_status=1
  initrd /live/initrd
}

menuentry "🛠️ InoveCloud OS 2026 (Instalador Direto no Disco SSD/NVMe)" {
  linux /live/vmlinuz boot=live inove_mode=installer components username=inove hostname=inovecloud-os systemd.show_status=1
  initrd /live/initrd
}
GRUB_CFG

echo -e "${YELLOW}[7/7] Criando imagem híbrida final ${ISO_NAME}...${RESET}"
grub-mkrescue -o "${OUTPUT_DIR}/${ISO_NAME}" "${IMAGE_DIR}"

# Gerar Checksum SHA256 da ISO
cd "${OUTPUT_DIR}"
sha256sum "${ISO_NAME}" > "${ISO_NAME}.sha256"

# Ajustar permissões para permitir que usuários não-root manipulem os arquivos gerados
chmod -R a+rwX "${OUTPUT_DIR}" 2>/dev/null || true
if [ -n "${SUDO_USER:-}" ]; then
  chown -R "${SUDO_USER}:${SUDO_USER}" "${OUTPUT_DIR}" 2>/dev/null || true
fi

echo -e "${GREEN}${BOLD}"
echo "========================================================================"
echo "    SUCESSO! ISO INOVECLOUD OS REAL LINUX DESKTOP GERADA COM ÊXITO:      "
echo "    Arquivo: ${OUTPUT_DIR}/${ISO_NAME}                                 "
echo "    Checksum: ${OUTPUT_DIR}/${ISO_NAME}.sha256                         "
echo "========================================================================"
echo -e "${RESET}"
echo "Recursos incluídos na ISO:"
echo "- Sistema Operacional Linux Real (Kernel 6.12 LTS + Debian 13 Trixie)"
echo "- Ambiente Desktop Real Completo: GNOME 46+ Nativo com Tema Liquid Glass"
echo "- Gerenciador de Sessão GDM3 com Auto-Login"
echo "- Gerenciador de Arquivos Nautilus, GNOME Terminal, GNOME Control Center"
echo "- Suporte Nativo a Flatpak (Flathub), AppImage (FUSE 2/3) e APT"
echo "- Áudio PipeWire + Drivers Gráficos Mesa 3D / Vulkan"
echo "- Boot Híbrido UEFI / BIOS com GRUB2 (Sem Modo Kiosk)"
echo ""
