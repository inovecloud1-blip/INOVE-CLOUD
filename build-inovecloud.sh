#!/usr/bin/env bash
# ==============================================================================
# INOVECLOUD OS - SCRIPT OFICIAL DE CRIAÇÃO DA DISTRIBUIÇÃO LINUX NATIVA
# Base: Debian 13 (Trixie) / Ubuntu LTS - GNOME Desktop Puro com Wayland & X11
# Identidade Visual: Modern Dark Mode, Floating Centered Dock & Flathub
# ==============================================================================

set -euo pipefail

# Definições de Cores
C_CYAN='\033[0;36m'
C_GREEN='\033[0;32m'
C_BLUE='\033[0;34m'
C_YELLOW='\033[1;33m'
C_RED='\033[0;31m'
C_RESET='\033[0m'

echo -e "${C_CYAN}========================================================================${C_RESET}"
echo -e "${C_CYAN}        INOVECLOUD OS LINUX - BUILD DA DISTRIBUIÇÃO NATIVA              ${C_RESET}"
echo -e "${C_CYAN}========================================================================${C_RESET}"

# 1. Verificação de Permissões de Root
if [ "$(id -u)" -ne 0 ]; then
  echo -e "${C_RED}[ERRO] Este script precisa ser executado como root (sudo).${C_RESET}"
  exit 1
fi

# Diretórios de Trabalho
WORK_DIR="$(pwd)/inovecloud-build"
ROOTFS_DIR="${WORK_DIR}/rootfs"
LIVE_DIR="${WORK_DIR}/live-iso"
OUTPUT_DIR="$(pwd)/dist-iso"
ISO_NAME="inovecloud-os-2026.1-gnome-amd64.iso"
DEBIAN_MIRROR="http://deb.debian.org/debian"
DEBIAN_RELEASE="trixie"

mkdir -p "${WORK_DIR}"
mkdir -p "${OUTPUT_DIR}"

echo -e "${C_BLUE}[1/8] Instalando dependências de compilação no host...${C_RESET}"
apt-get update -y
apt-get install -y --no-install-recommends \
  debootstrap \
  squashfs-tools \
  xorriso \
  isolinux \
  syslinux-efi \
  grub-pc-bin \
  grub-efi-amd64-bin \
  mtools \
  dosfstools \
  ca-certificates \
  curl \
  wget

# Função de limpeza de montagens
cleanup_mounts() {
  echo -e "${C_YELLOW}[LIMPEZA] Desmontando sistemas de arquivos virtuais...${C_RESET}"
  for m in dev/pts dev proc sys; do
    if mountpoint -q "${ROOTFS_DIR}/${m}" 2>/dev/null; then
      umount -lf "${ROOTFS_DIR}/${m}" || true
    fi
  done
}
trap cleanup_mounts EXIT INT TERM

# 2. Bootstrap do Sistema Base Debian 13 (Trixie)
if [ ! -d "${ROOTFS_DIR}/bin" ]; then
  echo -e "${C_BLUE}[2/8] Criando sistema base Debian 13 (${DEBIAN_RELEASE}) via debootstrap...${C_RESET}"
  debootstrap --arch=amd64 --variant=minbase "${DEBIAN_RELEASE}" "${ROOTFS_DIR}" "${DEBIAN_MIRROR}"
else
  echo -e "${C_GREEN}[2/8] Base Debian já presente em ${ROOTFS_DIR}.${C_RESET}"
fi

# Montar sistemas de arquivos virtuais para o ambiente chroot
echo -e "${C_BLUE}[3/8] Preparando ambiente chroot...${C_RESET}"
mount -t proc /proc "${ROOTFS_DIR}/proc"
mount -t sysfs /sys "${ROOTFS_DIR}/sys"
mount --bind /dev "${ROOTFS_DIR}/dev"
mount --bind /dev/pts "${ROOTFS_DIR}/dev/pts"

# Configuração de Repositórios Oficiais do Debian
cat << 'EOF' > "${ROOTFS_DIR}/etc/apt/sources.list"
deb http://deb.debian.org/debian trixie main contrib non-free non-free-firmware
deb http://deb.debian.org/debian-security trixie-security main contrib non-free non-free-firmware
deb http://deb.debian.org/debian trixie-updates main contrib non-free non-free-firmware
EOF

# Configurar DNS no Chroot
echo "nameserver 1.1.1.1" > "${ROOTFS_DIR}/etc/resolv.conf"
echo "nameserver 8.8.8.8" >> "${ROOTFS_DIR}/etc/resolv.conf"
echo "inovecloud-os" > "${ROOTFS_DIR}/etc/hostname"

cat << 'EOF' > "${ROOTFS_DIR}/etc/hosts"
127.0.0.1   localhost
127.0.1.1   inovecloud-os
EOF

# 3. Instalação de Pacotes do Sistema Operacional Nativo no Chroot
echo -e "${C_BLUE}[4/8] Instalando Kernel Linux, GNOME Desktop, Drivers e Ferramentas...${C_RESET}"
cat << 'EOF' | chroot "${ROOTFS_DIR}" /bin/bash
export DEBIAN_FRONTEND=noninteractive

apt-get update -y

# Kernel Linux e Suporte a Live Boot
apt-get install -y --no-install-recommends \
  linux-image-amd64 \
  live-boot \
  systemd-sysv \
  firmware-linux \
  firmware-linux-nonfree \
  firmware-misc-nonfree

# Ambiente GNOME Desktop Puro e Display Manager
apt-get install -y --no-install-recommends \
  gnome-core \
  gnome-shell \
  gdm3 \
  gnome-session \
  gnome-terminal \
  nautilus \
  gnome-control-center \
  gnome-software \
  gnome-software-plugin-flatpak \
  gnome-tweaks \
  gnome-shell-extensions \
  gnome-shell-extension-dash-to-dock \
  gnome-shell-extension-appindicator \
  dconf-cli \
  dconf-gsettings-backend \
  gsettings-desktop-schemas

# Drivers de Vídeo, Rede, Áudio e Ferramentas Nativas
apt-get install -y --no-install-recommends \
  pipewire \
  pipewire-audio \
  pipewire-pulse \
  pipewire-alsa \
  wireplumber \
  network-manager \
  network-manager-gnome \
  iproute2 \
  mesa-va-drivers \
  mesa-vulkan-drivers \
  libgl1-mesa-dri \
  pciutils \
  usbutils \
  sudo \
  curl \
  wget \
  unzip \
  htop \
  fastfetch \
  papirus-icon-theme \
  fonts-inter \
  fonts-noto-color-emoji \
  fonts-dejavu-core \
  flatpak

# Instalar Navegador Web Nativo
apt-get install -y --no-install-recommends chromium || apt-get install -y --no-install-recommends firefox-esr || true

# Configurar Integração Oficial com o Flathub
flatpak remote-add --if-not-exists flathub https://dl.flathub.org/repo/flathub.flatpakrepo || true

# Limpar cache do APT
apt-get clean
rm -rf /var/lib/apt/lists/*
EOF

# 4. Criação do Usuário Padrão 'inove' e Autologin no GDM3
echo -e "${C_BLUE}[5/8] Configurando usuário 'inove' e login automático no GNOME...${C_RESET}"
cat << 'EOF' | chroot "${ROOTFS_DIR}" /bin/bash
# Criar usuário padrão inove
if ! id "inove" &>/dev/null; then
  useradd -m -s /bin/bash inove
  echo "inove:inove" | chpasswd
  usermod -aG sudo,video,audio,input,render,netdev inove
fi

# Configurar Sudo sem senha para o usuário inove
echo "inove ALL=(ALL) NOPASSWD: ALL" > /etc/sudoers.d/inove-nopasswd
chmod 0440 /etc/sudoers.d/inove-nopasswd

# Configurar Autologin no GDM3
mkdir -p /etc/gdm3
cat << 'GDM_EOF' > /etc/gdm3/daemon.conf
[daemon]
AutomaticLoginEnable=true
AutomaticLogin=inove
WaylandEnable=true

[security]

[xdmcp]

[chooser]

[debug]
GDM_EOF
EOF

# 5. Configuração Nativa da Interface GNOME via DConf (Dark Mode + Dock Centralizada + Apps Fixados)
echo -e "${C_BLUE}[6/8] Aplicando configurações nativas de sistema (DConf / Dark Mode / Dock)...${C_RESET}"
mkdir -p "${ROOTFS_DIR}/etc/dconf/profile"
mkdir -p "${ROOTFS_DIR}/etc/dconf/db/local.d"

# Perfil DConf do Usuário
cat << 'EOF' > "${ROOTFS_DIR}/etc/dconf/profile/user"
user-db:user
system-db:local
EOF

# Configurações Globais do GNOME (Tema Escuro, Dock Centralizada na parte inferior, Atalhos Fixados)
cat << 'EOF' > "${ROOTFS_DIR}/etc/dconf/db/local.d/01-inovecloud-desktop"
[org/gnome/desktop/interface]
color-scheme='prefer-dark'
gtk-theme='Adwaita-dark'
icon-theme='Papirus-Dark'
font-name='Inter 10'
document-font-name='Inter 10'
monospace-font-name='Monospace 10'
show-battery-percentage=true
clock-show-weekday=true
clock-show-seconds=false
clock-format='24h'
enable-animations=true

[org/gnome/desktop/wm/preferences]
theme='Adwaita-dark'
button-layout='appmenu:minimize,maximize,close'
titlebar-font='Inter Bold 10'
focus-mode='click'
action-double-click-titlebar='toggle-maximize'

[org/gnome/desktop/background]
picture-options='zoom'
primary-color='#0a0c14'
secondary-color='#141724'

[org/gnome/desktop/screensaver]
primary-color='#0a0c14'
secondary-color='#141724'

[org/gnome/shell]
enabled-extensions=['dash-to-dock@vswitch.org', 'appindicatorsupport@rgcjonas.gmail.com']
favorite-apps=['org.gnome.Nautilus.desktop', 'org.gnome.Terminal.desktop', 'chromium.desktop', 'org.gnome.Software.desktop', 'gnome-control-center.desktop']

[org/gnome/shell/extensions/dash-to-dock]
dock-position='BOTTOM'
dock-fixed=false
autohide=true
intellihide=true
dash-max-icon-size=48
extend-height=false
apply-custom-theme=false
transparency-mode='FIXED'
background-opacity=0.8
custom-background-color=true
background-color='rgb(16,18,28)'
custom-theme-shrink=true
show-show-apps-button=true
show-trash=false
show-mounts=false
running-indicator-style='DOTS'
click-action='focus-minimize-or-previews'
scroll-action='cycle-windows'
isolate-workspaces=false
EOF

# Compilar o banco de dados DConf dentro do Chroot
chroot "${ROOTFS_DIR}" dconf update

# 6. Criação do SquashFS Comprimido (Live Filesystem)
echo -e "${C_BLUE}[7/8] Gerando imagem comprimida SquashFS do sistema operacional...${C_RESET}"
mkdir -p "${LIVE_DIR}/live"
mkdir -p "${LIVE_DIR}/boot/grub"

# Copiar Kernel e Initrd para o diretório de Boot da ISO
VMLINUZ="$(ls -t "${ROOTFS_DIR}/boot"/vmlinuz* | head -n1)"
INITRD="$(ls -t "${ROOTFS_DIR}/boot"/initrd.img* | head -n1)"

cp "${VMLINUZ}" "${LIVE_DIR}/live/vmlinuz"
cp "${INITRD}" "${LIVE_DIR}/live/initrd"

# Gerar o arquivo filesystem.squashfs
rm -f "${LIVE_DIR}/live/filesystem.squashfs"
mksquashfs "${ROOTFS_DIR}" "${LIVE_DIR}/live/filesystem.squashfs" \
  -e boot \
  -comp xz \
  -Xbcj x86 \
  -b 1048576 \
  -noappend

# 7. Configuração do Bootloader GRUB (UEFI e BIOS Híbrido)
echo -e "${C_BLUE}[8/8] Configurando GRUB e gravando a ISO híbrida final...${C_RESET}"
cat << 'EOF' > "${LIVE_DIR}/boot/grub/grub.cfg"
set default="0"
set timeout=5

insmod font
if loadfont /boot/grub/fonts/unicode.pf2 ; then
    insmod gfxterm
    set gfxmode=auto
    terminal_output gfxterm
fi

set color_normal=light-gray/black
set color_highlight=white/red

menuentry "InoveCloud OS 2026.1 (Debian 13 Trixie - GNOME Desktop Live)" --class gnu-linux --class os {
    linux /live/vmlinuz boot=live quiet splash components username=inove hostname=inovecloud-os
    initrd /live/initrd
}

menuentry "InoveCloud OS (Modo Seguro / Fallback Graphics)" --class gnu-linux --class os {
    linux /live/vmlinuz boot=live components nomodeset username=inove hostname=inovecloud-os
    initrd /live/initrd
}
EOF

# Criar Imagem ISO Híbrida Inicializável
grub-mkrescue -o "${OUTPUT_DIR}/${ISO_NAME}" "${LIVE_DIR}"

echo -e "${C_GREEN}========================================================================${C_RESET}"
echo -e "${C_GREEN}   ✓ ISO DO INOVECLOUD OS GERADA COM SUCESSO!                         ${C_RESET}"
echo -e "${C_GREEN}   Arquivo: ${OUTPUT_DIR}/${ISO_NAME}                                 ${C_RESET}"
echo -e "${C_GREEN}========================================================================${C_RESET}"
