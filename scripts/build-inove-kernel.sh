#!/usr/bin/env bash
# ==============================================================================
# InoveCloud OS - Script de Configuração e Compilação Automática do Kernel Linux 6.12+
# - Kernel Minimalista & Otimizado para Boot Ultrarrápido (< 2s)
# - Drivers DRM/KMS Diretos (Intel, AMD, NVIDIA, VirtualBox, QEMU, VMWare)
# - Suporte Nativo a Inove Init, AppImage (FUSE) e Sandboxing (Namespaces/Flatpak)
# ==============================================================================

set -euo pipefail

# Paleta de Cores
C_CYAN='\033[0;36m'
C_GREEN='\033[0;32m'
C_BLUE='\033[0;34m'
C_YELLOW='\033[1;33m'
C_RED='\033[0;31m'
C_BOLD='\033[1m'
C_RESET='\033[0m'

KERNEL_VERSION="6.12.16"
KERNEL_MAJOR="v6.x"
WORK_DIR="${PWD}/inove-kernel-build"
SRC_DIR="${WORK_DIR}/linux-${KERNEL_VERSION}"
OUT_DIR="${WORK_DIR}/output"
NPROC=$(nproc || echo 4)

echo -e "\n${C_BLUE}${C_BOLD}================================================================================${C_RESET}"
echo -e "${C_CYAN}${C_BOLD}   🚀 INOVECLOUD OS - LINUX KERNEL 6.12+ DRM/KMS & INOVE INIT COMPILER          ${C_RESET}"
echo -e "   Versão Alvo  : Linux ${KERNEL_VERSION} LTS"
echo -e "   Threads      : ${NPROC} núcleos ativos"
echo -e "   Destino      : ${OUT_DIR}"
echo -e "${C_BLUE}${C_BOLD}================================================================================${C_RESET}\n"

# 1. Instalar Dependências do Compilador
echo -e "${C_BLUE}[1/5] Verificando dependências de compilação do host...${C_RESET}"
if command -v apt-get >/dev/null 2>&1; then
  sudo apt-get update -qq && sudo apt-get install -y -qq \
    build-essential libncurses-dev bison flex libssl-dev libelf-dev \
    bc cpio kmod zstd liblz4-tool wget tar xz-utils git
elif command -v dnf >/dev/null 2>&1; then
  sudo dnf install -y gcc make bison flex openssl-devel elfutils-libelf-devel bc ncurses-devel zstd
elif command -v pacman >/dev/null 2>&1; then
  sudo pacman -S --needed --noconfirm base-devel bc kmod cpio libelf zstd
fi

# 2. Download e Extração do Código-Fonte Oficial
mkdir -p "${WORK_DIR}" "${OUT_DIR}"
cd "${WORK_DIR}"

if [ ! -d "${SRC_DIR}" ]; then
  TARBALL="linux-${KERNEL_VERSION}.tar.xz"
  if [ ! -f "${TARBALL}" ]; then
    echo -e "${C_BLUE}[2/5] Baixando código-fonte oficial do Kernel ${KERNEL_VERSION}...${C_RESET}"
    wget -c "https://cdn.kernel.org/pub/linux/kernel/${KERNEL_MAJOR}/${TARBALL}"
  fi
  echo -e "${C_BLUE}[2/5] Extraindo código-fonte do Kernel...${C_RESET}"
  tar -xf "${TARBALL}"
fi

cd "${SRC_DIR}"

# 3. Configuração Minimalista do Kernel (.config)
echo -e "${C_BLUE}[3/5] Aplicando configuração do Kernel minimalista DRM/KMS & Inove Init...${C_RESET}"

# Gera base x86_64 limpa
make defconfig

# --- A. INOVE INIT & BOOT ESSENTIALS ---
scripts/config --enable CONFIG_BINFMT_ELF
scripts/config --enable CONFIG_BINFMT_SCRIPT
scripts/config --enable CONFIG_BINFMT_MISC
scripts/config --enable CONFIG_DEVTMPFS
scripts/config --enable CONFIG_DEVTMPFS_MOUNT
scripts/config --enable CONFIG_TMPFS
scripts/config --enable CONFIG_TMPFS_POSIX_ACL
scripts/config --enable CONFIG_PRINTK
scripts/config --enable CONFIG_PRINTK_TIME
scripts/config --enable CONFIG_EARLY_PRINTK
scripts/config --set-val CONFIG_PANIC_TIMEOUT 5

# --- B. SUBSISTEMA DRM / KMS & FRAMEBUFFER (GRÁFICOS SEM GNOME) ---
scripts/config --enable CONFIG_DRM
scripts/config --enable CONFIG_DRM_KMS_HELPER
scripts/config --enable CONFIG_DRM_FBDEV_EMULATION
scripts/config --enable CONFIG_FB
scripts/config --enable CONFIG_FB_VESA
scripts/config --enable CONFIG_FB_EFI
scripts/config --enable CONFIG_FB_SIMPLE
scripts/config --enable CONFIG_FRAMEBUFFER_CONSOLE
scripts/config --enable CONFIG_FRAMEBUFFER_CONSOLE_DETECT_PRIMARY
scripts/config --enable CONFIG_DRM_SIMPLEDRM

# Drivers GPU (Físico & Virtualização)
scripts/config --enable CONFIG_DRM_I915              # Intel HD/Iris/Xe
scripts/config --enable CONFIG_DRM_AMDGPU            # AMD Radeon Moderno
scripts/config --enable CONFIG_DRM_RADEON            # AMD Radeon Legado
scripts/config --enable CONFIG_DRM_NOUVEAU           # NVIDIA Open-source
scripts/config --enable CONFIG_DRM_VBOXVIDEO         # VirtualBox VBoxSVGA/VBoxVGA
scripts/config --enable CONFIG_DRM_VMWGFX            # VMware SVGAII
scripts/config --enable CONFIG_DRM_BOCHS             # QEMU Standard VGA
scripts/config --enable CONFIG_DRM_QXL               # QEMU / KVM QXL
scripts/config --enable CONFIG_DRM_VIRTIO_GPU        # KVM / Cloud VirtIO GPU

# --- C. DISCOS, NVME, CONTROLADORES SATA & INITRAMFS ---
scripts/config --enable CONFIG_BLK_DEV_INITRD
scripts/config --enable CONFIG_RD_GZIP
scripts/config --enable CONFIG_RD_XZ
scripts/config --enable CONFIG_RD_ZSTD
scripts/config --enable CONFIG_BLK_DEV_NVME
scripts/config --enable CONFIG_ATA
scripts/config --enable CONFIG_SATA_AHCI
scripts/config --enable CONFIG_PCI
scripts/config --enable CONFIG_PCI_MSI
scripts/config --enable CONFIG_VIRTIO
scripts/config --enable CONFIG_VIRTIO_PCI
scripts/config --enable CONFIG_VIRTIO_BLK
scripts/config --enable CONFIG_VIRTIO_NET

# --- D. SISTEMAS DE ARQUIVOS & FUSE (CHROME / APPIMAGE) ---
scripts/config --enable CONFIG_EXT4_FS
scripts/config --enable CONFIG_EXT4_FS_POSIX_ACL
scripts/config --enable CONFIG_BTRFS_FS
scripts/config --enable CONFIG_VFAT_FS
scripts/config --enable CONFIG_ISO9660_FS
scripts/config --enable CONFIG_OVERLAY_FS
scripts/config --enable CONFIG_SQUASHFS
scripts/config --enable CONFIG_SQUASHFS_XZ
scripts/config --enable CONFIG_SQUASHFS_ZSTD
scripts/config --enable CONFIG_FUSE_FS               # Essencial para execução de AppImages

# --- E. ISOLAMENTO & SANDBOXING (FLATHUB & CHROME) ---
scripts/config --enable CONFIG_NAMESPACES
scripts/config --enable CONFIG_UTS_NS
scripts/config --enable CONFIG_IPC_NS
scripts/config --enable CONFIG_USER_NS              # Permite Bubblewrap/Flatpak rodar em espaço de usuário
scripts/config --enable CONFIG_PID_NS
scripts/config --enable CONFIG_NET_NS
scripts/config --enable CONFIG_CGROUPS
scripts/config --enable CONFIG_MEMCG
scripts/config --enable CONFIG_SECCOMP
scripts/config --enable CONFIG_SECCOMP_FILTER

# --- F. ENTRADA (MOUSE, TECLADO, TOUCHPAD) ---
scripts/config --enable CONFIG_INPUT
scripts/config --enable CONFIG_INPUT_KEYBOARD
scripts/config --enable CONFIG_KEYBOARD_ATKBD
scripts/config --enable CONFIG_INPUT_MOUSE
scripts/config --enable CONFIG_MOUSE_PS2
scripts/config --enable CONFIG_INPUT_EVDEV
scripts/config --enable CONFIG_HID
scripts/config --enable CONFIG_HID_GENERIC
scripts/config --enable CONFIG_USB_HID

# --- G. REDE & WI-FI ---
scripts/config --enable CONFIG_NET
scripts/config --enable CONFIG_INET
scripts/config --enable CONFIG_IP_PNP
scripts/config --enable CONFIG_IP_PNP_DHCP
scripts/config --enable CONFIG_NETDEVICES
scripts/config --enable CONFIG_ETHERNET
scripts/config --enable CONFIG_NET_CORE
scripts/config --enable CONFIG_E1000
scripts/config --enable CONFIG_E1000E
scripts/config --enable CONFIG_R8169
scripts/config --enable CONFIG_CFG80211
scripts/config --enable CONFIG_MAC80211

# --- H. DEV-TOOLS & MONITORAMENTO (docs.kernel.org/dev-tools) ---
scripts/config --enable CONFIG_BPF
scripts/config --enable CONFIG_BPF_SYSCALL
scripts/config --enable CONFIG_BPF_JIT
scripts/config --enable CONFIG_TRACING
scripts/config --enable CONFIG_FTRACE
scripts/config --enable CONFIG_KPROBES
scripts/config --enable CONFIG_PERF_EVENTS
scripts/config --enable CONFIG_DEBUG_FS
scripts/config --enable CONFIG_MAGIC_SYSRQ

# --- I. OTIMIZAÇÕES DE TAMANHO & COMPILAÇÃO ---
scripts/config --disable CONFIG_DEBUG_INFO_DWARF_TOOLCHAIN_DEFAULT
scripts/config --disable CONFIG_DEBUG_INFO_DWARF4
scripts/config --disable CONFIG_DEBUG_INFO_DWARF5
scripts/config --enable CONFIG_KERNEL_ZSTD

# Atualiza e valida o .config sem prompts
make olddefconfig

# 4. Compilação Paralela do Kernel
echo -e "\n${C_BLUE}[4/5] Compilando o Kernel Linux (bzImage & módulos) com ${NPROC} threads...${C_RESET}"
make -j"${NPROC}" bzImage modules

# 5. Exportar Binários & Módulos
echo -e "\n${C_BLUE}[5/5] Exportando Kernel e Módulos para ${OUT_DIR}...${C_RESET}"
mkdir -p "${OUT_DIR}/modules"

cp arch/x86/boot/bzImage "${OUT_DIR}/vmlinuz-6.12-inovecloud"
make INSTALL_MOD_PATH="${OUT_DIR}/modules" modules_install

echo -e "\n${C_GREEN}${C_BOLD}================================================================================${C_RESET}"
echo -e "${C_GREEN}${C_BOLD}   ✓ KERNEL LINUX 6.12+ COMPILADO COM SUCESSO!                                  ${C_RESET}"
echo -e "   - Imagem do Kernel : ${C_BOLD}${OUT_DIR}/vmlinuz-6.12-inovecloud${C_RESET}"
echo -e "   - Módulos          : ${C_BOLD}${OUT_DIR}/modules/lib/modules/${KERNEL_VERSION}${C_RESET}"
echo -e "   - Tamanho Final    : $(du -h "${OUT_DIR}/vmlinuz-6.12-inovecloud" | cut -f1)"
echo -e "   - Suporte DRM/KMS  : Intel, AMD, NVIDIA, VirtualBox, VMware, QEMU (Ativo)"
echo -e "   - Inove Init & App : Suporte FUSE (AppImage) e Namespaces (Flatpak/Chrome)"
echo -e "${C_GREEN}${C_BOLD}================================================================================${C_RESET}\n"
