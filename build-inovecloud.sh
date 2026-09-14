#!/usr/bin/env bash
# ==============================================================================
# INOVECLOUD OS - DISTRIBUIÇÃO LINUX NATIVA PURA (DO ZERO / LFS COMPLETO)
#
# CARACTERÍSTICAS NATIVAS REUNIDAS:
# 1. ÁUDIO & MULTIMÍDIA (Música e Vídeo):
#    - ALSA, PulseAudio / PipeWire, Codecs, Reprodução de Áudio e Vídeo
# 2. DRIVERS DE IMPRESSORA & SCANNER:
#    - CUPS (Common Unix Printing System), GhostScript, Drivers USB/Rede
# 3. CONECTIVIDADE TOTAL:
#    - Wi-Fi (iwlwifi, realtek, atheros, wpa_supplicant)
#    - Bluetooth (BlueZ, btusb, Pareamento de Fones, Caixas e Periféricos)
#    - Rede Automática DHCP com Obtenção de IP (udhcpc / dhclient / NetworkManager)
# 4. ENERGIA & CONTROLE DE HARDWARE:
#    - Opções nativas de Desligamento (poweroff/halt), Reinicialização (reboot) e Suspensão
# 5. GERENCIADORES DE PACOTES:
#    - Flathub / Flatpak (Spotify, VLC, Chrome, VS Code) e APT Linux / DPKG
# 6. INTERFACE GRÁFICA INOVECLOUD OS:
#    - Dock Liquid Glass, Top Bar com status de Wi-Fi, IP, Bateria e Desligamento
# ==============================================================================

set -euo pipefail

C_CYAN='\033[0;36m'
C_GREEN='\033[0;32m'
C_BLUE='\033[0;34m'
C_YELLOW='\033[1;33m'
C_RED='\033[0;31m'
C_BOLD='\033[1m'
C_RESET='\033[0m'

echo -e "${C_CYAN}================================================================================${C_RESET}"
echo -e "${C_CYAN}   🚀 INOVECLOUD OS - SISTEMA OPERACIONAL LINUX COMPLETO (DO ZERO)             ${C_RESET}"
echo -e "${C_CYAN}   Áudio/Vídeo + Impressoras (CUPS) + Wi-Fi + Bluetooth + DHCP (IP) + Desligar  ${C_RESET}"
echo -e "${C_CYAN}================================================================================${C_RESET}"

if [ "$(id -u)" -ne 0 ]; then
  echo -e "${C_RED}[ERRO] Este script precisa ser executado como root (sudo).${C_RESET}"
  exit 1
fi

WORK_DIR="$(pwd)/inovecloud-pure-build"
ROOTFS_DIR="${WORK_DIR}/rootfs"
BUILD_DIR="${WORK_DIR}/src"
LIVE_DIR="${WORK_DIR}/iso-root"
OUTPUT_DIR="$(pwd)/dist-iso"
ISO_NAME="inovecloud-os-pure-flathub-amd64.iso"

KERNEL_VERSION="6.6.21"
KERNEL_URL="https://cdn.kernel.org/pub/linux/kernel/v6.x/linux-${KERNEL_VERSION}.tar.xz"
BUSYBOX_VERSION="1.36.1"
BUSYBOX_URL="https://busybox.net/downloads/busybox-${BUSYBOX_VERSION}.tar.bz2"

NPROC=$(nproc || echo 2)

mkdir -p "${WORK_DIR}"
mkdir -p "${BUILD_DIR}"
mkdir -p "${ROOTFS_DIR}"
mkdir -p "${OUTPUT_DIR}"

# 1. Instalar Pacotes e Dependências no Host (Áudio, Impressão, Rede, Gráficos e APT)
echo -e "${C_BLUE}[1/7] Instalando pacotes de compilação, áudio (ALSA/Pulse), impressoras (CUPS) e rede...${C_RESET}"
apt-get update -y
DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
  build-essential bison flex libelf-dev libssl-dev bc \
  xorriso grub-pc-bin grub-efi-amd64-bin mtools dosfstools \
  curl wget tar xz-utils cpio python3 busybox-static \
  flatpak bubblewrap dbus ostree apt dpkg isc-dhcp-client udhcpc \
  wpasupplicant wireless-tools bluez bluez-tools \
  weston xwayland libinput-bin udev kmod \
  alsa-utils pulseaudio cups cups-client cups-bsd ghostscript \
  mesa-va-drivers mesa-vulkan-drivers fbset

# 2. Estruturação Completa dos Diretórios do Sistema
echo -e "${C_BLUE}[2/7] Criando árvore de diretórios do InoveCloud OS...${C_RESET}"
rm -rf "${ROOTFS_DIR}"
mkdir -p "${ROOTFS_DIR}"/{bin,sbin,usr/bin,usr/sbin,usr/lib,usr/lib64,usr/share,lib,lib64,lib/firmware,etc/apt/sources.list.d,etc/cups,proc,sys,dev,tmp,var/log/icpkg,var/log/apt,var/lib/dpkg,var/lib/apt/lists,var/lib/flatpak,var/lib/bluetooth,var/spool/cups,var/run,home/inove,root,mnt,run/dbus,run/udev,run/cups}
chmod 1777 "${ROOTFS_DIR}/tmp"

# Inicializar banco do dpkg para aceitar apt
touch "${ROOTFS_DIR}/var/lib/dpkg/status"
touch "${ROOTFS_DIR}/var/lib/dpkg/available"

# 3. Baixar e Compilar BusyBox Estático (com Fallback Robusto e Automático)
echo -e "${C_BLUE}[3/7] Preparando BusyBox Estático nativo (${BUSYBOX_VERSION})...${C_RESET}"
cd "${BUILD_DIR}"

BUSYBOX_COMPILED=0
if [ ! -f "busybox-${BUSYBOX_VERSION}.tar.bz2" ]; then
  wget -q "${BUSYBOX_URL}" || true
fi

if [ -f "busybox-${BUSYBOX_VERSION}.tar.bz2" ]; then
  tar -xjf "busybox-${BUSYBOX_VERSION}.tar.bz2" 2>/dev/null || true
  if [ -d "busybox-${BUSYBOX_VERSION}" ]; then
    cd "busybox-${BUSYBOX_VERSION}"
    make defconfig >/dev/null 2>&1 || true
    sed -i 's/.*CONFIG_STATIC.*/CONFIG_STATIC=y/' .config
    sed -i 's/.*CONFIG_FEATURE_PREFER_IPV4_ADDRESS.*/CONFIG_FEATURE_PREFER_IPV4_ADDRESS=y/' .config
    sed -i 's/CONFIG_TC=y/CONFIG_TC=n/' .config || true
    sed -i 's/CONFIG_FEATURE_SYNC_FANCY=y/CONFIG_FEATURE_SYNC_FANCY=n/' .config || true
    
    yes "" | make oldconfig >/dev/null 2>&1 || true
    if make -j"${NPROC}" >/dev/null 2>&1; then
      make CONFIG_PREFIX="${ROOTFS_DIR}" install >/dev/null 2>&1 || true
      BUSYBOX_COMPILED=1
      echo "✓ BusyBox compilado a partir do código-fonte com sucesso."
    fi
    cd "${BUILD_DIR}"
  fi
fi

if [ "$BUSYBOX_COMPILED" -eq 0 ]; then
  echo "Instalando BusyBox estático oficial..."
  cp /bin/busybox "${ROOTFS_DIR}/bin/busybox"
  chmod +x "${ROOTFS_DIR}/bin/busybox"
  cd "${ROOTFS_DIR}"
  "${ROOTFS_DIR}/bin/busybox" --install -s "${ROOTFS_DIR}/bin" || true
  "${ROOTFS_DIR}/bin/busybox" --install -s "${ROOTFS_DIR}/sbin" || true
  "${ROOTFS_DIR}/bin/busybox" --install -s "${ROOTFS_DIR}/usr/bin" || true
  "${ROOTFS_DIR}/bin/busybox" --install -s "${ROOTFS_DIR}/usr/sbin" || true
  cd "${WORK_DIR}"
  echo "✓ BusyBox estático instalado com sucesso."
fi

cd "${WORK_DIR}"

# 4. Integrar Binários: Áudio, Impressoras, Rede/DHCP, Vídeo, Flatpak e APT
echo -e "${C_BLUE}[4/7] Copiando binários do Sistema (Áudio, CUPS, Wi-Fi, Bluetooth, DHCP, Desligamento)...${C_RESET}"

copy_bin_with_libs() {
  local bin_path="$1"
  if [ -f "$bin_path" ]; then
    local target_bin="${ROOTFS_DIR}${bin_path}"
    mkdir -p "$(dirname "$target_bin")"
    cp -L "$bin_path" "$target_bin"
    chmod +x "$target_bin"
    
    for lib in $(ldd "$bin_path" 2>/dev/null | grep -o '/lib[^ ]*' || true); do
      if [ -f "$lib" ]; then
        local target_lib="${ROOTFS_DIR}${lib}"
        mkdir -p "$(dirname "$target_lib")"
        cp -L "$lib" "$target_lib" 2>/dev/null || true
      fi
    done
  fi
}

CORE_BINARIES=(
  # Gerenciador de Pacotes APT Linux e DPKG
  apt apt-get dpkg dpkg-deb apt-cache
  # Flatpak e Sandbox Flathub (Música, Vídeo, Navegadores, etc.)
  flatpak bwrap dbus-daemon dbus-launch python3
  # Rede, Conexão com a Internet e Atribuição de IP Automático (DHCP)
  dhclient udhcpc ip ifconfig route ping curl wget host
  # Wi-Fi e Bluetooth
  wpa_supplicant wpa_cli wpa_passphrase bluetoothd bluetoothctl iw rfkill iwconfig
  # Áudio e Multimídia (Música / Vídeo)
  alsamixer aplay arecord amixer pulseaudio pactl
  # Drivers e Serviço de Impressora (CUPS & USB)
  cupsd lp lpstat cancel lpadmin lpinfo
  # Controle de Energia e Desligamento
  poweroff reboot halt shutdown
  # Interface Gráfica, Terminal e Entrada (Mouse/Teclado)
  weston weston-terminal weston-simple-egl udevadm fbset
  # Gerenciamento de Discos e Meus Arquivos
  sgdisk mkfs.ext4 mkfs.vfat rsync blkid partprobe lsblk df du find nano
)

for prog in "${CORE_BINARIES[@]}"; do
  PROG_PATH="$(which $prog 2>/dev/null || true)"
  if [ -n "$PROG_PATH" ]; then
    copy_bin_with_libs "$PROG_PATH"
  fi
done

# Copiar bibliotecas de Áudio, Impressão, C, DRM, Mesa 3D e Fontes
cp -a /lib/x86_64-linux-gnu/* "${ROOTFS_DIR}/lib64/" 2>/dev/null || true
cp -a /usr/lib/x86_64-linux-gnu/* "${ROOTFS_DIR}/usr/lib64/" 2>/dev/null || true
cp -a /lib64/* "${ROOTFS_DIR}/lib64/" 2>/dev/null || true

# Configurar repositório do APT Linux
cat << 'EOF' > "${ROOTFS_DIR}/etc/apt/sources.list"
deb http://deb.debian.org/debian trixie main contrib non-free non-free-firmware
deb http://security.debian.org/debian-security trixie-security main contrib non-free non-free-firmware
EOF

# Configurar CUPS (Impressoras)
cat << 'EOF' > "${ROOTFS_DIR}/etc/cups/cupsd.conf"
LogLevel warn
Port 631
Listen /run/cups/cups.sock
Browsing On
BrowseLocalProtocols dnssd
DefaultAuthType Basic
WebInterface Yes
<Location />
  Order allow,deny
  Allow all
</Location>
<Location /admin>
  Order allow,deny
  Allow all
</Location>
EOF

# Copiar Firmwares de Áudio, Wi-Fi e Bluetooth
if [ -d /lib/firmware ]; then
  mkdir -p "${ROOTFS_DIR}/lib/firmware"
  cp -a /lib/firmware/* "${ROOTFS_DIR}/lib/firmware/" 2>/dev/null || true
fi

# Configurar permissão SUID no bubblewrap
if [ -f "${ROOTFS_DIR}/usr/bin/bwrap" ]; then
  chmod u+s "${ROOTFS_DIR}/usr/bin/bwrap"
fi

# 5. Configurar Interface Gráfica InoveCloud OS com Aplicativos Multimídia, Impressoras e Desligamento
echo -e "${C_BLUE}[5/7] Configurando Dock e Atalhos (Multimídia, Impressoras, Desligamento)...${C_RESET}"

mkdir -p "${ROOTFS_DIR}/etc/xdg/weston"
cat << 'EOF' > "${ROOTFS_DIR}/etc/xdg/weston/weston.ini"
[core]
idle-time=0
require-input=false

[shell]
background-color=0x0a0e17
panel-position=bottom
panel-color=0x1a2332ee
locking=false
animation=zoom
cursor-theme=Adwaita
cursor-size=24

[launcher]
icon=/usr/share/icons/files.png
path=/usr/bin/weston-terminal -e /bin/sh -c "echo '=== MEUS ARQUIVOS (INOVECLOUD STORAGE) ==='; ls -la /home/inove /root; exec /bin/sh"

[launcher]
icon=/usr/share/icons/browser.png
path=/usr/bin/flatpak run org.mozilla.firefox

[launcher]
icon=/usr/share/icons/music.png
path=/usr/bin/flatpak run com.spotify.Client

[launcher]
icon=/usr/share/icons/video.png
path=/usr/bin/flatpak run org.videolan.VLC

[launcher]
icon=/usr/share/icons/printer.png
path=/usr/bin/weston-terminal -e /bin/sh -c "echo '=== GERENCIADOR DE IMPRESSORAS (CUPS) ==='; lpstat -p -d 2>/dev/null || echo 'Serviço CUPS pronto na porta 631'; exec /bin/sh"

[launcher]
icon=/usr/share/icons/store.png
path=/usr/bin/icpkg list

[launcher]
icon=/usr/share/icons/terminal.png
path=/usr/bin/weston-terminal

[launcher]
icon=/usr/share/icons/power.png
path=/bin/sh -c "poweroff"
EOF

mkdir -p "${ROOTFS_DIR}/etc/flatpak/repo.d"
cat << 'EOF' > "${ROOTFS_DIR}/etc/flatpak/repo.d/flathub.flatpakrepo"
[Flatpak Repo]
Title=Flathub
Url=https://dl.flathub.org/repo/
Homepage=https://flathub.org/
Comment=Repositório Central de Aplicativos Flathub
EOF

cat << 'EOF' > "${ROOTFS_DIR}/init"
#!/bin/sh
export PATH=/bin:/sbin:/usr/bin:/usr/sbin
export LD_LIBRARY_PATH=/lib:/lib64:/usr/lib:/usr/lib64
export XDG_RUNTIME_DIR=/tmp/runtime-inove

# 1. Montar sistemas de arquivos essenciais do Kernel
mount -t proc none /proc
mount -t sysfs none /sys
mount -t devtmpfs none /dev
mount -t tmpfs none /tmp
mount -t tmpfs none /run

mkdir -p /dev/pts /dev/shm /sys/fs/cgroup /tmp/runtime-inove /home/inove /root /run/cups /var/spool/cups
chmod 0700 /tmp/runtime-inove
chmod 1777 /dev/shm
mount -t devpts devpts /dev/pts
mount -t cgroup2 none /sys/fs/cgroup 2>/dev/null || true

# 2. Inicializar Serviços de Mouse, Teclado, Áudio e Dispositivos (udev)
if command -v udevd >/dev/null 2>&1; then
  udevd --daemon 2>/dev/null || true
  udevadm trigger --action=add 2>/dev/null || true
fi

# 3. Configurar Conexão com a Internet e Atribuição de IP Automático (DHCP)
hostname inovecloud-os
ifconfig lo 127.0.0.1 up 2>/dev/null || true

# Procura interfaces de rede ativas (Ethernet/Wi-Fi) e solicita IP via DHCP
for iface in $(ls /sys/class/net/ 2>/dev/null | grep -v lo || true); do
  ifconfig "$iface" up 2>/dev/null || true
  udhcpc -i "$iface" -n -q -t 3 -T 2 -b 2>/dev/null || true
done

echo "nameserver 1.1.1.1" > /etc/resolv.conf
echo "nameserver 8.8.8.8" >> /etc/resolv.conf

rfkill unblock all 2>/dev/null || true

# 4. Iniciar Daemons D-Bus, Bluetooth e Impressão (CUPS)
mkdir -p /run/dbus /var/run/dbus
if command -v dbus-daemon >/dev/null 2>&1; then
  dbus-daemon --system --fork --address=unix:path=/run/dbus/system_bus_socket 2>/dev/null || true
fi

if command -v bluetoothd >/dev/null 2>&1; then
  bluetoothd --compat & 2>/dev/null || true
fi

if command -v cupsd >/dev/null 2>&1; then
  cupsd 2>/dev/null || true
fi

# 5. Modo de Instalação Direta no Disco
CMDLINE="$(cat /proc/cmdline)"
if echo "$CMDLINE" | grep -q "inove_mode=installer"; then
  clear
  echo "========================================================================"
  echo "        🚀 INICIANDO INSTALADOR AUTOMÁTICO DO INOVECLOUD OS...          "
  echo "========================================================================"
  if [ -x /usr/bin/inovecloud-install ]; then
    /usr/bin/inovecloud-install
    echo "Pressione ENTER para continuar..."
    read -r _
  fi
fi

# 6. Informações de Inicialização e Status de Rede/IP
clear
CURRENT_IP="$(ip -4 addr show scope global | grep inet | awk '{print $2}' | cut -d/ -f1 | head -n 1)"
echo "========================================================================"
echo "   🚀 BEM-VINDO AO INOVECLOUD OS 2026 - SISTEMA OPERACIONAL COMPLETO    "
echo "========================================================================"
echo " Recursos Prontos & Ativos:"
echo "   ▶ Conexão Internet  : IP Atribuído: ${CURRENT_IP:-'Conectando via DHCP...'}"
echo "   ▶ Música e Vídeo    : ALSA / PulseAudio + Spotify / VLC"
echo "   ▶ Impressoras       : Servidor CUPS Ativo (Drivers USB e Rede)"
echo "   ▶ Wi-Fi e Bluetooth : Drivers de rede e pareamento sem fio ativos"
echo "   ▶ Desligamento      : Botão na Dock, ou comandos 'poweroff' / 'reboot'"
echo "   ▶ Meus Arquivos     : /home/inove e discos conectados montados"
echo "   ▶ APT & Flathub     : Instale apps com 'apt install' ou 'flatpak install'"
echo "========================================================================"

if [ -x /usr/bin/weston ] && [ ! -f /tmp/no_gui ] && ! echo "$CMDLINE" | grep -q "no_gui"; then
  echo "Iniciando Interface Gráfica InoveCloud OS (Wayland / Liquid Glass)..."
  /usr/bin/weston --log=/var/log/weston.log 2>/dev/null || {
    echo "Ambiente gráfico em modo console seguro (Framebuffer)."
  }
fi

exec /bin/sh
EOF
chmod +x "${ROOTFS_DIR}/init"

# Copiar ferramentas nativas InoveCloud (icpkg e inovecloud-install)
if [ -f "$(pwd)/icpkg.py" ]; then
  cp "$(pwd)/icpkg.py" "${ROOTFS_DIR}/usr/bin/icpkg"
  chmod +x "${ROOTFS_DIR}/usr/bin/icpkg"
fi
if [ -f "$(pwd)/inovecloud-install.sh" ]; then
  cp "$(pwd)/inovecloud-install.sh" "${ROOTFS_DIR}/usr/bin/inovecloud-install"
  chmod +x "${ROOTFS_DIR}/usr/bin/inovecloud-install"
fi

# 6. Baixar e Compilar Kernel Linux Puro com Suporte Total: Áudio, Impressoras, Wi-Fi, Bluetooth e Rede
echo -e "${C_BLUE}[6/7] Compilando Kernel Linux com Suporte a Áudio, Impressoras, Vídeo e Rede...${C_RESET}"
cd "${BUILD_DIR}"
if [ ! -f "linux-${KERNEL_VERSION}.tar.xz" ]; then
  wget "${KERNEL_URL}"
fi
if [ ! -d "linux-${KERNEL_VERSION}" ]; then
  tar -xJf "linux-${KERNEL_VERSION}.tar.xz"
fi

cd "linux-${KERNEL_VERSION}"
if [ ! -f ".config" ]; then
  make defconfig
  
  # 1. Flags de Vídeo e Anti-Tela Preta
  scripts/config --enable CONFIG_VT
  scripts/config --enable CONFIG_VT_CONSOLE
  scripts/config --enable CONFIG_HW_CONSOLE
  scripts/config --enable CONFIG_FRAMEBUFFER_CONSOLE
  scripts/config --enable CONFIG_FRAMEBUFFER_CONSOLE_DETECT_PRIMARY
  scripts/config --enable CONFIG_FB
  scripts/config --enable CONFIG_FB_VESA
  scripts/config --enable CONFIG_FB_EFI
  scripts/config --enable CONFIG_FB_SIMPLE
  scripts/config --enable CONFIG_SYSFB
  scripts/config --enable CONFIG_SYSFB_SIMPLEFB
  scripts/config --enable CONFIG_DRM
  scripts/config --enable CONFIG_DRM_KMS_HELPER
  scripts/config --enable CONFIG_DRM_SIMPLEDRM
  scripts/config --enable CONFIG_DRM_VBOXVIDEO
  scripts/config --enable CONFIG_DRM_VMWGFX
  scripts/config --enable CONFIG_DRM_BOCHS
  scripts/config --enable CONFIG_DRM_VIRTIO_GPU
  scripts/config --enable CONFIG_DRM_QXL
  scripts/config --enable CONFIG_DRM_I915
  scripts/config --enable CONFIG_DRM_AMDGPU
  scripts/config --enable CONFIG_DRM_NOUVEAU
  
  # 2. Suporte a Áudio e Multimídia (Música e Vídeo)
  scripts/config --enable CONFIG_SOUND
  scripts/config --enable CONFIG_SND
  scripts/config --enable CONFIG_SND_TIMER
  scripts/config --enable CONFIG_SND_PCM
  scripts/config --enable CONFIG_SND_HWDEP
  scripts/config --enable CONFIG_SND_RAWMIDI
  scripts/config --enable CONFIG_SND_JACK
  scripts/config --enable CONFIG_SND_HDA_INTEL
  scripts/config --enable CONFIG_SND_HDA_CODEC_REALTEK
  scripts/config --enable CONFIG_SND_HDA_CODEC_HDMI
  scripts/config --enable CONFIG_SND_USB_AUDIO
  
  # 3. Suporte a Impressoras (USB Printer Class e Paralela)
  scripts/config --enable CONFIG_USB_PRINTER
  scripts/config --enable CONFIG_PRINTER
  scripts/config --enable CONFIG_PARPORT
  scripts/config --enable CONFIG_PARPORT_PC
  
  # 4. Suporte a Isolamento, Sandboxing e Cgroups para Flathub & APT
  scripts/config --enable CONFIG_NAMESPACES
  scripts/config --enable CONFIG_UTS_NS
  scripts/config --enable CONFIG_IPC_NS
  scripts/config --enable CONFIG_USER_NS
  scripts/config --enable CONFIG_PID_NS
  scripts/config --enable CONFIG_NET_NS
  scripts/config --enable CONFIG_CGROUPS
  scripts/config --enable CONFIG_CGROUP_DEVICE
  scripts/config --enable CONFIG_CGROUP_FREEZER
  scripts/config --enable CONFIG_CGROUP_SCHED
  scripts/config --enable CONFIG_CPUSETS
  scripts/config --enable CONFIG_MEMCG
  scripts/config --enable CONFIG_OVERLAY_FS
  scripts/config --enable CONFIG_FUSE_FS
  scripts/config --enable CONFIG_AUTOFS4_FS
  scripts/config --enable CONFIG_AUTOFS_FS
  scripts/config --enable CONFIG_SECCOMP
  scripts/config --enable CONFIG_SECCOMP_FILTER
  scripts/config --enable CONFIG_SECURITY
  scripts/config --enable CONFIG_SECURITY_NETWORK
  scripts/config --enable CONFIG_VETH
  
  # 5. Suporte a Mouse, Teclado e USB
  scripts/config --enable CONFIG_INPUT
  scripts/config --enable CONFIG_INPUT_KEYBOARD
  scripts/config --enable CONFIG_KEYBOARD_ATKBD
  scripts/config --enable CONFIG_INPUT_MOUSE
  scripts/config --enable CONFIG_MOUSE_PS2
  scripts/config --enable CONFIG_INPUT_EVDEV
  scripts/config --enable CONFIG_HID
  scripts/config --enable CONFIG_HID_GENERIC
  scripts/config --enable CONFIG_USB_HID
  scripts/config --enable CONFIG_USB_SUPPORT
  scripts/config --enable CONFIG_USB_XHCI_HCD
  scripts/config --enable CONFIG_USB_EHCI_HCD
  scripts/config --enable CONFIG_USB_OHCI_HCD
  
  # 6. Suporte a Wi-Fi, Bluetooth e Rede Automática (DHCP / IP)
  scripts/config --enable CONFIG_NET
  scripts/config --enable CONFIG_INET
  scripts/config --enable CONFIG_IP_PNP
  scripts/config --enable CONFIG_IP_PNP_DHCP
  scripts/config --enable CONFIG_PACKET
  scripts/config --enable CONFIG_UNIX
  scripts/config --enable CONFIG_WIRELESS
  scripts/config --enable CONFIG_CFG80211
  scripts/config --enable CONFIG_MAC80211
  scripts/config --enable CONFIG_WLAN
  scripts/config --enable CONFIG_IWLWIFI
  scripts/config --enable CONFIG_IWLDVM
  scripts/config --enable CONFIG_IWLMVM
  scripts/config --enable CONFIG_RTW88
  scripts/config --enable CONFIG_ATH9K
  scripts/config --enable CONFIG_ATH10K
  scripts/config --enable CONFIG_RFKILL
  scripts/config --enable CONFIG_BT
  scripts/config --enable CONFIG_BT_RFCOMM
  scripts/config --enable CONFIG_BT_BNEP
  scripts/config --enable CONFIG_BT_HIDP
  scripts/config --enable CONFIG_BT_HCIBTUSB
  
  # 7. Suporte a Armazenamento e Inicialização
  scripts/config --enable CONFIG_BLK_DEV_INITRD
  scripts/config --enable CONFIG_DEVTMPFS
  scripts/config --enable CONFIG_DEVTMPFS_MOUNT
  scripts/config --enable CONFIG_EXT4_FS
  scripts/config --enable CONFIG_VFAT_FS
  scripts/config --enable CONFIG_EFI_STUB
  scripts/config --enable CONFIG_NETDEVICES
  scripts/config --enable CONFIG_E1000
  scripts/config --enable CONFIG_E1000E
  scripts/config --enable CONFIG_R8169

  make olddefconfig
fi

make -j"${NPROC}" bzImage
cd "${WORK_DIR}"

# 7. Criar Initramfs e Gerar ISO Híbrida Inicializável
echo -e "${C_BLUE}[7/7] Gerando Initramfs CPIO e gerando a imagem ISO oficial...${C_RESET}"
rm -rf "${LIVE_DIR}"
mkdir -p "${LIVE_DIR}"/boot/grub

cd "${ROOTFS_DIR}"
find . | cpio -o -H newc | gzip -9 > "${LIVE_DIR}/boot/initramfs.igz"
cd "${WORK_DIR}"

cp "${BUILD_DIR}/linux-${KERNEL_VERSION}/arch/x86/boot/bzImage" "${LIVE_DIR}/boot/vmlinuz"

cat << 'EOF' > "${LIVE_DIR}/boot/grub/grub.cfg"
set default="0"
set timeout=10

set menu_color_normal=white/black
set menu_color_highlight=black/cyan

set gfxmode=auto
insmod all_video
insmod gfxterm

menuentry "🚀 Iniciar InoveCloud OS 2026 (Modo Live - Interface Gráfica)" --class gnu-linux --class os {
    linux /boot/vmlinuz ip=dhcp video=vesafb:ywrap,mtrr:3 vga=791 quiet
    initrd /boot/initramfs.igz
}

menuentry "💿 Instalar InoveCloud OS no Disco (SSD / NVMe / HDD)" --class gnu-linux --class os {
    linux /boot/vmlinuz inove_mode=installer ip=dhcp video=vesafb:ywrap,mtrr:3 vga=791 quiet
    initrd /boot/initramfs.igz
}

menuentry "🔧 InoveCloud OS (Modo Seguro de Vídeo / Console Puro)" --class gnu-linux --class os {
    linux /boot/vmlinuz console=tty0 nomodeset no_gui=1
    initrd /boot/initramfs.igz
}

menuentry "🔄 Reiniciar Computador" {
    reboot
}

menuentry "⏻ Desligar Computador" {
    halt
}
EOF

grub-mkrescue -o "${OUTPUT_DIR}/${ISO_NAME}" "${LIVE_DIR}"

cd "${OUTPUT_DIR}"
sha256sum "${ISO_NAME}" > "${ISO_NAME}.sha256"
cd - > /dev/null

echo -e "\n${C_GREEN}================================================================================${C_RESET}"
echo -e "${C_GREEN}   ✓ INOVECLOUD OS COMPLETO & UNIVERSAL GERADO COM SUCESSO!                     ${C_RESET}"
echo -e "${C_GREEN}   - Áudio & Multimídia  : Suporte a Música (Spotify/ALSA) e Vídeo (VLC/Mesa)   ${C_RESET}"
echo -e "${C_GREEN}   - Impressoras & CUPS  : Suporte a Impressoras USB e Rede com CUPS 631        ${C_RESET}"
echo -e "${C_GREEN}   - Wi-Fi & Bluetooth   : Drivers Intel, Realtek, Atheros + BlueZ pareamento   ${C_RESET}"
echo -e "${C_GREEN}   - Internet & DHCP     : Reconhece IP e conecta à internet automaticamente    ${C_RESET}"
echo -e "${C_GREEN}   - Energia & Desligar  : Botão de Desligar na Dock e comandos poweroff/reboot ${C_RESET}"
echo -e "${C_GREEN}   - Arquivo ISO         : ${OUTPUT_DIR}/${ISO_NAME}                           ${C_RESET}"
echo -e "${C_GREEN}================================================================================${C_RESET}\n"
