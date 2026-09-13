#!/usr/bin/env bash
# ==============================================================================
# INOVECLOUD OS - SCRIPT OFICIAL DE CRIAÇÃO DA DISTRIBUIÇÃO LINUX NATIVA
# Base: Ubuntu 24.04 LTS (Noble Numbat)
# Ambiente Gráfico: KDE Plasma 6 Desktop (Breeze Dark / Liquid Glass)
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
echo -e "${C_CYAN}    INOVECLOUD OS LINUX - UBUNTU 24.04 LTS + KDE PLASMA 6 BUILD         ${C_RESET}"
echo -e "${C_CYAN}========================================================================${C_RESET}"

# 1. Verificação de Permissões de Root
if [ "$(id -u)" -ne 0 ]; then
  echo -e "${C_RED}[ERRO] Este script precisa ser executado como root (sudo).${C_RESET}"
  echo "Uso: sudo ./build-inovecloud.sh"
  exit 1
fi

# Diretórios de Trabalho
WORK_DIR="$(pwd)/inovecloud-build"
ROOTFS_DIR="${WORK_DIR}/rootfs"
LIVE_DIR="${WORK_DIR}/live-iso"
OUTPUT_DIR="$(pwd)/dist-iso"
ISO_NAME="inovecloud-os-2026.1-ubuntu24-kde-amd64.iso"
UBUNTU_MIRROR="http://archive.ubuntu.com/ubuntu"
UBUNTU_RELEASE="noble"

mkdir -p "${WORK_DIR}"
mkdir -p "${OUTPUT_DIR}"

echo -e "${C_BLUE}[1/8] Instalando dependências de compilação no sistema host...${C_RESET}"
apt-get update -y
DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
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
  wget \
  rsync

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

# 2. Bootstrap do Sistema Base Ubuntu 24.04 LTS (Noble)
if [ ! -d "${ROOTFS_DIR}/bin" ]; then
  echo -e "${C_BLUE}[2/8] Baixando base Ubuntu 24.04 LTS (${UBUNTU_RELEASE}) via debootstrap...${C_RESET}"
  debootstrap --arch=amd64 --variant=minbase "${UBUNTU_RELEASE}" "${ROOTFS_DIR}" "${UBUNTU_MIRROR}"
else
  echo -e "${C_GREEN}[2/8] Base Ubuntu já presente em ${ROOTFS_DIR}.${C_RESET}"
fi

# Montar sistemas de arquivos virtuais para o ambiente chroot
echo -e "${C_BLUE}[3/8] Montando subsistemas chroot...${C_RESET}"
mount -t proc /proc "${ROOTFS_DIR}/proc"
mount -t sysfs /sys "${ROOTFS_DIR}/sys"
mount --bind /dev "${ROOTFS_DIR}/dev"
mount --bind /dev/pts "${ROOTFS_DIR}/dev/pts"

# Configuração de Repositórios Oficiais do Ubuntu (Main, Restricted, Universe, Multiverse)
cat << 'EOF' > "${ROOTFS_DIR}/etc/apt/sources.list"
deb http://archive.ubuntu.com/ubuntu noble main restricted universe multiverse
deb http://archive.ubuntu.com/ubuntu noble-updates main restricted universe multiverse
deb http://security.ubuntu.com/ubuntu noble-security main restricted universe multiverse
deb http://archive.ubuntu.com/ubuntu noble-backports main restricted universe multiverse
EOF

# Configurar DNS e Hostname no Chroot
echo "nameserver 1.1.1.1" > "${ROOTFS_DIR}/etc/resolv.conf"
echo "nameserver 8.8.8.8" >> "${ROOTFS_DIR}/etc/resolv.conf"
echo "inovecloud-os" > "${ROOTFS_DIR}/etc/hostname"

cat << 'EOF' > "${ROOTFS_DIR}/etc/hosts"
127.0.0.1   localhost
127.0.1.1   inovecloud-os
EOF

# 3. Instalação de Pacotes do Sistema Operacional Nativo no Chroot
echo -e "${C_BLUE}[4/8] Instalando Kernel Linux, KDE Plasma 6 Desktop, Drivers e Ferramentas...${C_RESET}"
cat << 'EOF' | chroot "${ROOTFS_DIR}" /bin/bash
export DEBIAN_FRONTEND=noninteractive

apt-get update -y

# Kernel Ubuntu e Suporte a Live Boot (Casper)
apt-get install -y --no-install-recommends \
  linux-generic \
  casper \
  systemd-sysv \
  ubuntu-drivers-common \
  linux-firmware

# Ambiente KDE Plasma 6 Desktop Puro e Gerenciador de Sessão SDDM
apt-get install -y --no-install-recommends \
  plasma-desktop \
  plasma-workspace \
  plasma-nm \
  plasma-pa \
  sddm \
  sddm-theme-breeze \
  kde-config-gtk-style \
  kde-config-screenlocker \
  kwin-wayland \
  kwin-x11 \
  dolphin \
  konsole \
  discover \
  plasma-discover-backend-flatpak \
  plasma-discover-backend-snap \
  systemsettings

# Drivers de Vídeo, Rede, Áudio PipeWire e Ferramentas Nativas
apt-get install -y --no-install-recommends \
  pipewire \
  pipewire-audio \
  pipewire-pulse \
  pipewire-alsa \
  wireplumber \
  network-manager \
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
  flatpak \
  snapd

# Instalar Navegador Web Nativo
apt-get install -y --no-install-recommends firefox || apt-get install -y --no-install-recommends chromium-browser || true

# Configurar Integração Oficial com o Flathub
flatpak remote-add --if-not-exists flathub https://dl.flathub.org/repo/flathub.flatpakrepo || true

# Limpar cache do APT
apt-get clean
rm -rf /var/lib/apt/lists/*
EOF

# 4. Criação do Usuário Padrão 'inove' e Autologin no SDDM (KDE Plasma)
echo -e "${C_BLUE}[5/8] Configurando usuário 'inove' e autologin no KDE Plasma...${C_RESET}"
cat << 'EOF' | chroot "${ROOTFS_DIR}" /bin/bash
if ! id "inove" &>/dev/null; then
  useradd -m -s /bin/bash inove
  echo "inove:inove" | chpasswd
  usermod -aG sudo,video,audio,input,render,netdev inove
fi

# Configurar Sudo sem senha para o usuário inove
echo "inove ALL=(ALL) NOPASSWD: ALL" > /etc/sudoers.d/inove-nopasswd
chmod 0440 /etc/sudoers.d/inove-nopasswd

# Configurar Autologin no SDDM
mkdir -p /etc/sddm.conf.d
cat << 'SDDM_EOF' > /etc/sddm.conf.d/autologin.conf
[Autologin]
User=inove
Session=plasma
Relogin=false
SDDM_EOF
EOF

# 5. Configuração Nativa da Interface KDE Plasma (Dark Mode Breeze + Dock Centralizada)
echo -e "${C_BLUE}[6/8] Configurando tema Breeze Dark, ícones e layout de Dock flutuante...${C_RESET}"
mkdir -p "${ROOTFS_DIR}/etc/skel/.config"

# Configuração Global do KDE (Breeze Dark)
cat << 'EOF' > "${ROOTFS_DIR}/etc/skel/.config/kdeglobals"
[General]
ColorScheme=BreezeDark
Name=Breeze Dark

[KDE]
lookAndFeelPackage=org.kde.breezedark.desktop

[Icons]
Theme=Papirus-Dark
EOF

# Configuração do Gerenciador de Janelas KWin (Efeitos Blur e Bordas Suaves)
cat << 'EOF' > "${ROOTFS_DIR}/etc/skel/.config/kwinrc"
[Plugins]
blurEnabled=true
contrastEnabled=true
translucencyEnabled=true

[Windows]
BorderlessMaximizedWindows=false
FocusPolicy=FocusOnClick
EOF

# Configuração de Painéis do Plasma (Dock Centralizada Flutuante + Barra Superior)
cat << 'EOF' > "${ROOTFS_DIR}/etc/skel/.config/plasma-org.kde.plasma.desktop-appletsrc"
[ActionPlugins][0]
RightButton;NoModifier=org.kde.contextmenu

[Containments][1]
activityId=
formfactor=2
immutability=1
lastScreen=0
location=4
plugin=org.kde.panel

[Containments][1][Applets][2]
immutability=1
plugin=org.kde.plasma.kickoff

[Containments][1][Applets][3]
immutability=1
plugin=org.kde.plasma.icontasks

[Containments][1][Applets][3][Configuration][General]
launchers=applications:org.kde.dolphin.desktop,applications:org.kde.konsole.desktop,applications:firefox.desktop,applications:org.kde.discover.desktop,applications:systemsettings.desktop

[Containments][1][Applets][4]
immutability=1
plugin=org.kde.plasma.systemtray

[Containments][1][Applets][5]
immutability=1
plugin=org.kde.plasma.digitalclock
EOF

# Replicar as configurações para o usuário inove já criado
mkdir -p "${ROOTFS_DIR}/home/inove/.config"
cp -r "${ROOTFS_DIR}/etc/skel/.config/"* "${ROOTFS_DIR}/home/inove/.config/" || true
chroot "${ROOTFS_DIR}" chown -R inove:inove /home/inove

# 6. Criação do SquashFS Comprimido (Live Filesystem)
echo -e "${C_BLUE}[7/8] Gerando imagem comprimida SquashFS do sistema operacional...${C_RESET}"
mkdir -p "${LIVE_DIR}/casper"
mkdir -p "${LIVE_DIR}/boot/grub"

VMLINUZ="$(ls -t "${ROOTFS_DIR}/boot"/vmlinuz* | head -n1)"
INITRD="$(ls -t "${ROOTFS_DIR}/boot"/initrd.img* | head -n1)"

cp "${VMLINUZ}" "${LIVE_DIR}/casper/vmlinuz"
cp "${INITRD}" "${LIVE_DIR}/casper/initrd"

rm -f "${LIVE_DIR}/casper/filesystem.squashfs"
mksquashfs "${ROOTFS_DIR}" "${LIVE_DIR}/casper/filesystem.squashfs" \
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

menuentry "InoveCloud OS 2026.1 (Ubuntu 24.04 LTS - KDE Plasma 6 Live)" --class gnu-linux --class os {
    linux /casper/vmlinuz boot=casper quiet splash ---
    initrd /casper/initrd
}

menuentry "InoveCloud OS (Modo Seguro / Fallback Graphics)" --class gnu-linux --class os {
    linux /casper/vmlinuz boot=casper nomodeset ---
    initrd /casper/initrd
}
EOF

# Criar Imagem ISO Híbrida Inicializável
grub-mkrescue -o "${OUTPUT_DIR}/${ISO_NAME}" "${LIVE_DIR}"

# Gerar Checksum SHA256
cd "${OUTPUT_DIR}"
sha256sum "${ISO_NAME}" > "${ISO_NAME}.sha256"
cd - > /dev/null

echo -e "${C_GREEN}========================================================================${C_RESET}"
echo -e "${C_GREEN}   ✓ ISO DO INOVECLOUD OS GERADA COM SUCESSO!                         ${C_RESET}"
echo -e "${C_GREEN}   Base: Ubuntu 24.04 LTS (Noble) + KDE Plasma 6                      ${C_RESET}"
echo -e "${C_GREEN}   Arquivo: ${OUTPUT_DIR}/${ISO_NAME}                                 ${C_RESET}"
echo -e "${C_GREEN}   Checksum: ${OUTPUT_DIR}/${ISO_NAME}.sha256                         ${C_RESET}"
echo -e "${C_GREEN}========================================================================${C_RESET}"
