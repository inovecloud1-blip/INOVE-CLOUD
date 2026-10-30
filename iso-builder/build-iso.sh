#!/usr/bin/env bash
# ==============================================================================
# InoveCloud OS Glass - Real Debian 12 Desktop Live ISO Builder
# Xorg + LXDE + Node.js Backend API + Full Desktop Environment
# ==============================================================================
set -euo pipefail

BOLD="\033[1m"
GREEN="\033[0;32m"
CYAN="\033[0;36m"
YELLOW="\033[1;33m"
RED="\033[0;31m"
RESET="\033[0m"

echo -e "${CYAN}${BOLD}"
echo "========================================================================"
echo "    InoveCloud OS Glass - Real Debian 12 Desktop Live ISO Builder       "
echo "    Xorg + LXDE + Node.js API + Full Desktop Session                    "
echo "========================================================================"
echo -e "${RESET}"

if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}[ERRO] Este script precisa ser executado como root (sudo).${RESET}"
  exit 1
fi

WORK_DIR="$(pwd)/iso_build_workspace"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
ROOTFS_DIR="${WORK_DIR}/chroot"
IMAGE_DIR="${WORK_DIR}/image"
OUTPUT_DIR="${REPO_ROOT}/dist-iso"
ISO_NAME="inovecloud-os-glass-amd64.iso"
DEBIAN_MIRROR="http://deb.debian.org/debian"
DEBIAN_SUITE="bookworm"

echo "[INOVE_PROGRESS: 10%] [1/6] Instalando ferramentas de debootstrap e empacotamento de ISO..."
apt-get update -y
DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
  debootstrap debian-archive-keyring squashfs-tools xorriso grub-pc-bin grub-efi-amd64-bin mtools dosfstools curl wget rsync

rm -rf "${WORK_DIR}"
mkdir -p "${ROOTFS_DIR}" "${IMAGE_DIR}/boot/grub" "${IMAGE_DIR}/casper" "${OUTPUT_DIR}"

echo "[INOVE_PROGRESS: 30%] [2/6] Executando debootstrap para Debian 12 (Bookworm) minimal..."
debootstrap --arch=amd64 --variant=minbase "${DEBIAN_SUITE}" "${ROOTFS_DIR}" "${DEBIAN_MIRROR}"

echo "[INOVE_PROGRESS: 50%] [3/6] Configurando chroot, repositórios e instalando pacotes gráficos & Node.js..."
cp /etc/resolv.conf "${ROOTFS_DIR}/etc/resolv.conf" 2>/dev/null || echo "nameserver 1.1.1.1" > "${ROOTFS_DIR}/etc/resolv.conf"

cat << 'EOF' > "${ROOTFS_DIR}/etc/apt/sources.list"
deb http://deb.debian.org/debian bookworm main contrib non-free non-free-firmware
deb http://deb.debian.org/debian-security bookworm-security main contrib non-free non-free-firmware
deb http://deb.debian.org/debian bookworm-updates main contrib non-free non-free-firmware
EOF

mount --bind /dev "${ROOTFS_DIR}/dev"
mount --bind /dev/pts "${ROOTFS_DIR}/dev/pts"
mount --bind /proc "${ROOTFS_DIR}/proc"
mount --bind /sys "${ROOTFS_DIR}/sys"

cleanup() {
  umount -lf "${ROOTFS_DIR}/dev/pts" 2>/dev/null || true
  umount -lf "${ROOTFS_DIR}/dev" 2>/dev/null || true
  umount -lf "${ROOTFS_DIR}/proc" 2>/dev/null || true
  umount -lf "${ROOTFS_DIR}/sys" 2>/dev/null || true
}
trap cleanup EXIT

chroot "${ROOTFS_DIR}" /bin/bash << 'CHROOT_INSTALL'
export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get install -y --no-install-recommends \
  locales xserver-xorg xserver-xorg-legacy lxde lxterminal pcmanfm chromium \
  nodejs npm dbus libpam-systemd alsa-utils brightnessctl \
  firmware-misc-nonfree firmware-iwlwifi firmware-realtek network-manager sudo \
  live-boot initramfs-tools linux-image-amd64

locale-gen en_US.UTF-8 pt_BR.UTF-8
update-locale LANG=en_US.UTF-8

useradd -m -s /bin/bash -G audio,video,netdev,sudo inove
echo "inove:inove" | chpasswd

mkdir -p /etc/sudoers.d
echo "inove ALL=(ALL) NOPASSWD: /bin/systemctl reboot, /bin/systemctl poweroff, /usr/bin/brightnessctl" > /etc/sudoers.d/inovecloud-api
chmod 0440 /etc/sudoers.d/inovecloud-api

mkdir -p /etc/X11
echo "allowed_users=anybody" > /etc/X11/Xwrapper.config
echo "needs_root_rights=yes" >> /etc/X11/Xwrapper.config

update-initramfs -u -k all || true
CHROOT_INSTALL

echo "[INOVE_PROGRESS: 70%] [4/6] Copiando servidor Node.js e configurando LXDE Desktop..."
mkdir -p "${ROOTFS_DIR}/opt/inovecloud"
if [ -f "${SCRIPT_DIR}/server/server.js" ]; then
  cp "${SCRIPT_DIR}/server/server.js" "${ROOTFS_DIR}/opt/inovecloud/server.js"
else
  echo "console.log('InoveCloud API fallback');" > "${ROOTFS_DIR}/opt/inovecloud/server.js"
fi

if [ -d "${REPO_ROOT}/dist" ]; then
  mkdir -p "${ROOTFS_DIR}/iso-builder/public"
  cp -a "${REPO_ROOT}/dist/"* "${ROOTFS_DIR}/iso-builder/public/"
else
  mkdir -p "${ROOTFS_DIR}/iso-builder/public"
  echo "<h1>InoveCloud OS Glass Loading...</h1>" > "${ROOTFS_DIR}/iso-builder/public/index.html"
fi

cat << 'EOF' > "${ROOTFS_DIR}/home/inove/.xinitrc"
#!/bin/sh
node /opt/inovecloud/server.js &
sleep 2
chromium --no-sandbox --disable-infobars http://127.0.0.1:3000 &
exec startlxde
EOF
chmod +x "${ROOTFS_DIR}/home/inove/.xinitrc"
chown -R 1000:1000 "${ROOTFS_DIR}/home/inove"

cat << 'EOF' > "${ROOTFS_DIR}/home/inove/.bash_profile"
if [ -z "$DISPLAY" ] && [ "$(tty)" = "/dev/tty1" ]; then
  exec startx
fi
EOF
chown 1000:1000 "${ROOTFS_DIR}/home/inove/.bash_profile"

echo "[INOVE_PROGRESS: 80%] Desmontando sistemas de arquivos virtuais do chroot..."
umount -lf "${ROOTFS_DIR}/dev/pts" 2>/dev/null || true
umount -lf "${ROOTFS_DIR}/dev" 2>/dev/null || true
umount -lf "${ROOTFS_DIR}/proc" 2>/dev/null || true
umount -lf "${ROOTFS_DIR}/sys" 2>/dev/null || true

rm -rf "${ROOTFS_DIR}/proc/"*
rm -rf "${ROOTFS_DIR}/sys/"*
rm -rf "${ROOTFS_DIR}/dev/"*
mkdir -p "${ROOTFS_DIR}/proc" "${ROOTFS_DIR}/sys" "${ROOTFS_DIR}/dev"

echo "[INOVE_PROGRESS: 85%] [5/6] Compactando RootFS em SquashFS (filesystem.squashfs)..."
mkdir -p dist-iso "${IMAGE_DIR}/casper"
mksquashfs "${ROOTFS_DIR}" "${IMAGE_DIR}/casper/filesystem.squashfs" -comp zstd -b 1M -no-progress

echo "[INOVE_PROGRESS: 95%] [6/6] Configurando GRUB e gerando ISO (${ISO_NAME})..."
mkdir -p "${IMAGE_DIR}/boot/grub"
cat << 'EOF' > "${IMAGE_DIR}/boot/grub/grub.cfg"
set timeout=3
set default=0

menuentry "InoveCloud OS Glass - Real Debian 12 LXDE Desktop" {
    linux /boot/vmlinuz boot=live components quiet splash
    initrd /boot/initrd.img
}
EOF

if [ -f "${ROOTFS_DIR}/boot/vmlinuz-"* ]; then
  cp "${ROOTFS_DIR}/boot/vmlinuz-"* "${IMAGE_DIR}/boot/vmlinuz"
  cp "${ROOTFS_DIR}/boot/initrd.img-"* "${IMAGE_DIR}/boot/initrd.img"
else
  cp /boot/vmlinuz-$(uname -r) "${IMAGE_DIR}/boot/vmlinuz"
  cp /boot/initrd.img-$(uname -r) "${IMAGE_DIR}/boot/initrd.img"
fi

grub-mkrescue -o "${OUTPUT_DIR}/${ISO_NAME}" "${IMAGE_DIR}"

ISO_SIZE=$(du -h "${OUTPUT_DIR}/${ISO_NAME}" | awk '{print $1}')
echo "[INOVE_PROGRESS: 100%] [SUCESSO] ISO Real LXDE Desktop gerada em: ${OUTPUT_DIR}/${ISO_NAME} (${ISO_SIZE})"
