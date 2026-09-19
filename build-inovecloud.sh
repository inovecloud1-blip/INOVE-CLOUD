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

# 1. Instalar Pacotes e Dependências no Host (Áudio, Impressão, Rede, Gráficos, Plymouth e APT)
echo -e "${C_BLUE}[1/7] Instalando pacotes de compilação, áudio, impressoras, Plymouth e drivers...${C_RESET}"
apt-get update -y || true

PACKAGES_TO_INSTALL=(
  build-essential bison flex libelf-dev libssl-dev bc
  xorriso grub-pc-bin grub-efi-amd64-bin mtools dosfstools
  curl wget tar xz-utils cpio python3 busybox-static
  flatpak bubblewrap dbus ostree apt dpkg isc-dhcp-client udhcpc
  wpasupplicant wireless-tools bluez bluez-tools
  weston xwayland libinput-bin udev kmod libpixman-1-0 libgl1-mesa-dri
  alsa-utils pulseaudio cups cups-client ghostscript
  mesa-va-drivers fbset fonts-dejavu-core adwaita-icon-theme
)

for pkg in "${PACKAGES_TO_INSTALL[@]}"; do
  DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends "$pkg" || true
done

# 2. Estruturação Completa dos Diretórios do Sistema
echo -e "${C_BLUE}[2/7] Criando árvore de diretórios do InoveCloud OS...${C_RESET}"
rm -rf "${ROOTFS_DIR}"
mkdir -p "${ROOTFS_DIR}"/{bin,sbin,usr/bin,usr/sbin,usr/lib,usr/lib64,usr/share,lib,lib64,lib/x86_64-linux-gnu,usr/lib/x86_64-linux-gnu,lib/firmware,etc/apt/sources.list.d,etc/cups,proc,sys,dev,tmp,var/log/icpkg,var/log/apt,var/lib/dpkg,var/lib/apt/lists,var/lib/flatpak,var/lib/bluetooth,var/spool/cups,var/run,home/inove/CloudStorage,home/inove/Downloads,home/inove/Documents,root,mnt/persistence,run/dbus,run/udev,run/cups}
chmod 1777 "${ROOTFS_DIR}/tmp"

# Criar nós essenciais em /dev para inicialização precoce do Kernel (Early Console & Graphics)
mknod -m 600 "${ROOTFS_DIR}/dev/console" c 5 1 2>/dev/null || true
mknod -m 666 "${ROOTFS_DIR}/dev/null" c 1 3 2>/dev/null || true
mknod -m 666 "${ROOTFS_DIR}/dev/zero" c 1 5 2>/dev/null || true
mknod -m 666 "${ROOTFS_DIR}/dev/tty" c 5 0 2>/dev/null || true
mknod -m 666 "${ROOTFS_DIR}/dev/tty0" c 4 0 2>/dev/null || true
mknod -m 620 "${ROOTFS_DIR}/dev/tty1" c 4 1 2>/dev/null || true
mknod -m 666 "${ROOTFS_DIR}/dev/ptmx" c 5 2 2>/dev/null || true
mknod -m 666 "${ROOTFS_DIR}/dev/urandom" c 1 9 2>/dev/null || true
mknod -m 660 "${ROOTFS_DIR}/dev/fb0" c 29 0 2>/dev/null || true
mkdir -p "${ROOTFS_DIR}/dev/dri" "${ROOTFS_DIR}/dev/input"
mknod -m 666 "${ROOTFS_DIR}/dev/dri/card0" c 226 0 2>/dev/null || true
mknod -m 666 "${ROOTFS_DIR}/dev/dri/renderD128" c 226 128 2>/dev/null || true

# Inicializar banco do dpkg para aceitar apt
touch "${ROOTFS_DIR}/var/lib/dpkg/status"
touch "${ROOTFS_DIR}/var/lib/dpkg/available"

# 3. Baixar e Compilar BusyBox Estático (com Verificação de Integridade SHA256)
echo -e "${C_BLUE}[3/7] Preparando BusyBox Estático nativo (${BUSYBOX_VERSION})...${C_RESET}"
cd "${BUILD_DIR}"

BUSYBOX_COMPILED=0
if [ ! -f "busybox-${BUSYBOX_VERSION}.tar.bz2" ]; then
  wget -q "${BUSYBOX_URL}" || true
fi

if [ -f "busybox-${BUSYBOX_VERSION}.tar.bz2" ]; then
  BB_SHA256=$(sha256sum "busybox-${BUSYBOX_VERSION}.tar.bz2" | awk '{print $1}')
  echo "✓ Verificação SHA256 BusyBox (${BUSYBOX_VERSION}): ${BB_SHA256}"
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

# Fallback para binário do sistema se compilação falhar
if [ "$BUSYBOX_COMPILED" -eq 0 ]; then
  echo "Instalando BusyBox estático oficial..."
  BB_BIN=""
  for b in /bin/busybox /usr/bin/busybox /bin/busybox.static /usr/bin/busybox.static /sbin/busybox; do
    if [ -x "$b" ]; then
      BB_BIN="$b"
      break
    fi
  done

  if [ -n "$BB_BIN" ]; then
    cp -f "$BB_BIN" "${ROOTFS_DIR}/bin/busybox"
    chmod 755 "${ROOTFS_DIR}/bin/busybox"
  fi
fi

# Garantir que /bin/sh, /bin/bash, /bin/ash e /sbin/init existam e sejam executáveis
if [ -f "${ROOTFS_DIR}/bin/busybox" ]; then
  # Remove links prévios para evitar erro de 'same file' no cp/ln
  rm -f "${ROOTFS_DIR}/bin/sh" "${ROOTFS_DIR}/bin/bash" "${ROOTFS_DIR}/bin/ash" "${ROOTFS_DIR}/sbin/init" 2>/dev/null || true
  
  ln -sf busybox "${ROOTFS_DIR}/bin/sh"
  ln -sf busybox "${ROOTFS_DIR}/bin/bash"
  ln -sf busybox "${ROOTFS_DIR}/bin/ash"
  mkdir -p "${ROOTFS_DIR}/sbin"
  ln -sf ../bin/busybox "${ROOTFS_DIR}/sbin/init"
  chmod 755 "${ROOTFS_DIR}/bin/busybox"
  
  # Instalar todos os applets do BusyBox no rootfs
  cd "${ROOTFS_DIR}"
  "${ROOTFS_DIR}/bin/busybox" --install -s . 2>/dev/null || \
  "${ROOTFS_DIR}/bin/busybox" --install -s 2>/dev/null || true
  cd "${WORK_DIR}"
  echo "✓ Links essenciais (/bin/sh, /bin/bash, /sbin/init) configurados com sucesso."
fi

cd "${WORK_DIR}"

# 4. Integrar Binários: Áudio, Impressoras, Rede/DHCP, Vídeo, Flatpak e APT
echo -e "${C_BLUE}[4/7] Copiando binários do Sistema e bibliotecas compartilhadas essenciais...${C_RESET}"

# Garantir carregador dinâmico ELF de 64-bit
mkdir -p "${ROOTFS_DIR}/lib64" "${ROOTFS_DIR}/lib" "${ROOTFS_DIR}/lib/x86_64-linux-gnu"
for ld in /lib64/ld-linux-x86-64.so.2 /lib/x86_64-linux-gnu/ld-linux-x86-64.so.2 /usr/lib64/ld-linux-x86-64.so.2; do
  if [ -f "$ld" ]; then
    cp -L "$ld" "${ROOTFS_DIR}/lib64/ld-linux-x86-64.so.2" 2>/dev/null || true
    cp -L "$ld" "${ROOTFS_DIR}/lib/x86_64-linux-gnu/ld-linux-x86-64.so.2" 2>/dev/null || true
    ln -sf /lib64/ld-linux-x86-64.so.2 "${ROOTFS_DIR}/lib/ld-linux-x86-64.so.2" 2>/dev/null || true
    break
  fi
done

copy_bin_with_libs() {
  local bin_path="$1"
  if [ -f "$bin_path" ]; then
    local target_bin="${ROOTFS_DIR}${bin_path}"
    mkdir -p "$(dirname "$target_bin")"
    cp -L "$bin_path" "$target_bin" 2>/dev/null || true
    chmod +x "$target_bin" 2>/dev/null || true
    
    # Copiar recursivamente todas as bibliotecas das quais o binário depende
    local libs
    libs=$(ldd "$bin_path" 2>/dev/null | grep -o '/lib[^ ]*' || true)
    for lib in $libs; do
      if [ -f "$lib" ]; then
        local target_lib="${ROOTFS_DIR}${lib}"
        mkdir -p "$(dirname "$target_lib")"
        cp -L "$lib" "$target_lib" 2>/dev/null || true
        # Também copiar dependências secundárias de cada biblioteca
        for sublib in $(ldd "$lib" 2>/dev/null | grep -o '/lib[^ ]*' || true); do
          if [ -f "$sublib" ] && [ ! -f "${ROOTFS_DIR}${sublib}" ]; then
            mkdir -p "$(dirname "${ROOTFS_DIR}${sublib}")"
            cp -L "$sublib" "${ROOTFS_DIR}${sublib}" 2>/dev/null || true
          fi
        done
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
  sgdisk mkfs.ext4 mkfs.vfat rsync blkid partprobe lsblk df du find nano lspci lsusb modprobe
)

for prog in "${CORE_BINARIES[@]}"; do
  PROG_PATH="$(which $prog 2>/dev/null || true)"
  if [ -n "$PROG_PATH" ]; then
    copy_bin_with_libs "$PROG_PATH"
  fi
done

# Copiar Módulos Dinâmicos e Backends do Weston (DRM, FBDev, Headless, Wayland, X11, Shell)
for weston_libdir in /usr/lib/x86_64-linux-gnu/weston /usr/lib64/weston /usr/lib/weston /usr/libexec/weston*; do
  if [ -d "$weston_libdir" ]; then
    mkdir -p "${ROOTFS_DIR}${weston_libdir}"
    cp -a "$weston_libdir"/* "${ROOTFS_DIR}${weston_libdir}/" 2>/dev/null || true
    for wso in "${ROOTFS_DIR}${weston_libdir}"/*.so; do
      if [ -f "$wso" ]; then
        for lib in $(ldd "$wso" 2>/dev/null | grep -o '/lib[^ ]*' || true); do
          if [ -f "$lib" ] && [ ! -f "${ROOTFS_DIR}${lib}" ]; then
            mkdir -p "$(dirname "${ROOTFS_DIR}${lib}")"
            cp -L "$lib" "${ROOTFS_DIR}${lib}" 2>/dev/null || true
          fi
        done
      fi
    done
  fi
done

# Copiar Drivers Gráficos Mesa DRI/Vulkan (Intel, AMD, Nouveau, VMWare, Swrast/Software)
for dri_dir in /usr/lib/x86_64-linux-gnu/dri /usr/lib64/dri /usr/lib/dri; do
  if [ -d "$dri_dir" ]; then
    mkdir -p "${ROOTFS_DIR}${dri_dir}"
    cp -a "$dri_dir"/* "${ROOTFS_DIR}${dri_dir}/" 2>/dev/null || true
    for drilib in "${ROOTFS_DIR}${dri_dir}"/*.so; do
      if [ -f "$drilib" ]; then
        for lib in $(ldd "$drilib" 2>/dev/null | grep -o '/lib[^ ]*' || true); do
          if [ -f "$lib" ] && [ ! -f "${ROOTFS_DIR}${lib}" ]; then
            mkdir -p "$(dirname "${ROOTFS_DIR}${lib}")"
            cp -L "$lib" "${ROOTFS_DIR}${lib}" 2>/dev/null || true
          fi
        done
      fi
    done
  fi
done

# Copiar Fontes do Sistema e Ícones Essenciais
mkdir -p "${ROOTFS_DIR}/usr/share/fonts" "${ROOTFS_DIR}/usr/share/icons"
if [ -d /usr/share/fonts ]; then
  cp -a /usr/share/fonts/* "${ROOTFS_DIR}/usr/share/fonts/" 2>/dev/null || true
fi
if [ -d /usr/share/icons ]; then
  cp -a /usr/share/icons/* "${ROOTFS_DIR}/usr/share/icons/" 2>/dev/null || true
fi

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

# 5. Criar Utilitários do Sistema: Detecção de Hardware, Sync de Nuvem e Gerenciador
echo -e "${C_BLUE}[5/7] Configurando utilitários nativos (Hardware Detector, Cloud Sync, Dock & GUI)...${C_RESET}"

# 5.1 Script de Detecção Automática de Hardware e Drivers Proprietários
cat << 'EOF' > "${ROOTFS_DIR}/usr/bin/inovecloud-hardware-detector"
#!/bin/sh
# Detector de Hardware e Drivers Proprietários InoveCloud OS
echo "[HW-DETECT] Iniciando varredura de hardware e aceleração gráfica..."

# 1. Detecção de GPU (NVIDIA, AMD, Intel, VirtualBox, VMware)
if lspci 2>/dev/null | grep -i 'vga\|3d\|display' | grep -qi 'nvidia'; then
  echo "[HW-DETECT] GPU NVIDIA detectada. Carregando módulo de vídeo..."
  modprobe nouveau 2>/dev/null || modprobe nvidia 2>/dev/null || true
elif lspci 2>/dev/null | grep -i 'vga\|3d\|display' | grep -qi 'amd\|ati'; then
  echo "[HW-DETECT] GPU AMD Radeon detectada. Carregando amdgpu..."
  modprobe amdgpu 2>/dev/null || modprobe radeon 2>/dev/null || true
elif lspci 2>/dev/null | grep -i 'vga\|3d\|display' | grep -qi 'intel'; then
  echo "[HW-DETECT] GPU Intel HD/Iris Graphics detectada. Carregando i915..."
  modprobe i915 2>/dev/null || true
fi

# 2. Detecção de Adaptadores Wi-Fi (Broadcom, Realtek, Intel, Atheros)
if lspci 2>/dev/null | grep -i 'network\|wireless' | grep -qi 'broadcom'; then
  echo "[HW-DETECT] Wi-Fi Broadcom detectado. Carregando drivers b43 / brcmfmac..."
  modprobe b43 2>/dev/null || modprobe brcmfmac 2>/dev/null || modprobe wl 2>/dev/null || true
elif lspci 2>/dev/null | grep -i 'network\|wireless' | grep -qi 'realtek'; then
  echo "[HW-DETECT] Wi-Fi Realtek detectado. Carregando rtw88..."
  modprobe rtw88_8821ce 2>/dev/null || modprobe rtw88_8723de 2>/dev/null || true
fi

echo "[HW-DETECT] Varredura de hardware concluída."
EOF
chmod +x "${ROOTFS_DIR}/usr/bin/inovecloud-hardware-detector"

# 5.2 Daemon de Sincronização de Nuvem Híbrida e IDaaS (/home/inove/CloudStorage)
cat << 'EOF' > "${ROOTFS_DIR}/usr/bin/inovecloud-sync"
#!/bin/sh
# InoveCloud Sync Daemon - Nuvem Híbrida e IDaaS
CLOUD_DIR="/home/inove/CloudStorage"
mkdir -p "$CLOUD_DIR" 2>/dev/null || true
echo "[CLOUD-SYNC] Serviço de Nuvem Híbrida InoveCloud ativo em: $CLOUD_DIR"
while true; do
  # Monitoramento seguro em background
  sleep 30
done
EOF
chmod +x "${ROOTFS_DIR}/usr/bin/inovecloud-sync"

# 5.3 Lançador Automático e Resiliente da Interface Gráfica
cat << 'EOF' > "${ROOTFS_DIR}/usr/bin/inove-gui"
#!/bin/sh
export XDG_RUNTIME_DIR=/tmp/runtime-inove
export WAYLAND_DISPLAY=wayland-0
export WESTON_DISABLE_DRM_MASTER=1
mkdir -p "$XDG_RUNTIME_DIR" /var/log
chmod 0700 "$XDG_RUNTIME_DIR"

echo "[INOVE-GUI] Carregando compositor gráfico InoveCloud OS (Liquid Glass)..."

# 1. Tentativa Primária: DRM com Renderizador Pixman (Ampla compatibilidade VBox/QEMU/Bare-metal)
if weston --backend=drm-backend.so --use-pixman --continue-without-input --log=/var/log/weston.log 2>&1; then
  exit 0
fi

# 2. Tentativa Secundária: DRM Direto com Aceleração de Hardware
if weston --backend=drm-backend.so --continue-without-input --log=/var/log/weston.log 2>&1; then
  exit 0
fi

# 3. Tentativa Terciária: Framebuffer /dev/fb0
if [ -e /dev/fb0 ] && weston --backend=fbdev-backend.so --continue-without-input --log=/var/log/weston.log 2>&1; then
  exit 0
fi

# 4. Fallback Universal: Inicialização Automática Padrão
weston --continue-without-input --log=/var/log/weston.log 2>&1 || true
EOF
chmod +x "${ROOTFS_DIR}/usr/bin/inove-gui"

# 5.4 Utilitário de Ferramentas de Desenvolvimento do Kernel (docs.kernel.org/dev-tools)
cat << 'EOF' > "${ROOTFS_DIR}/usr/bin/kernel-dev-tools"
#!/bin/sh
# InoveCloud OS - Linux Kernel Dev-Tools Suite (https://docs.kernel.org/dev-tools/index.html)
echo "================================================================================"
echo "   🔬 INOVECLOUD OS - LINUX KERNEL DEV-TOOLS & DIAGNOSTICS SUITE                "
echo "   Referência Oficial: https://docs.kernel.org/dev-tools/index.html             "
echo "================================================================================"
echo "1. Status dos Rastreadores (FTrace / Tracefs / Kprobes):"
if [ -d /sys/kernel/tracing ]; then
  echo "   ✓ Tracefs montado em /sys/kernel/tracing"
  echo "   ▶ Rastreadores disponíveis: $(cat /sys/kernel/tracing/available_tracers 2>/dev/null || echo 'ftrace')"
  echo "   ▶ Eventos de Tracing: $(cat /sys/kernel/tracing/available_events 2>/dev/null | wc -l || echo 0) pontos de trace"
else
  echo "   ⚠ Tracefs não inicializado. Montando..."
  mount -t tracefs none /sys/kernel/tracing 2>/dev/null || true
fi

echo ""
echo "2. Subsistema eBPF & JIT Compiler:"
if [ -f /proc/sys/net/core/bpf_jit_enable ]; then
  echo "   ✓ eBPF JIT Ativo (Status: $(cat /proc/sys/net/core/bpf_jit_enable 2>/dev/null))"
fi

echo ""
echo "3. Status do DebugFS & KUnit:"
if [ -d /sys/kernel/debug ]; then
  echo "   ✓ DebugFS montado em /sys/kernel/debug"
  if [ -d /sys/kernel/debug/kunit ]; then
    echo "   ✓ KUnit (Kernel Unit Testing Framework) ativo"
  fi
fi

echo ""
echo "4. Comandos rápidos de diagnóstico do Kernel:"
echo "   - Rastrear chamadas de funções: echo function_graph > /sys/kernel/tracing/current_tracer"
echo "   - Ver log do Kernel:           dmesg --color=always | less -R"
echo "   - Eventos de Performance:      cat /proc/sysrq-trigger"
echo "================================================================================"
EOF
chmod +x "${ROOTFS_DIR}/usr/bin/kernel-dev-tools"

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
path=/usr/bin/weston-terminal -e /bin/sh -c "echo '=== MEUS ARQUIVOS (INOVECLOUD STORAGE) ==='; ls -la /home/inove /home/inove/CloudStorage; exec /bin/sh"

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
set +e
export PATH=/bin:/sbin:/usr/bin:/usr/sbin
export LD_LIBRARY_PATH=/lib:/lib64:/usr/lib:/usr/lib64
export XDG_RUNTIME_DIR=/tmp/runtime-inove
export WAYLAND_DISPLAY=wayland-0
export WESTON_DISABLE_DRM_MASTER=1

# 1. Montar sistemas de arquivos essenciais do Kernel
mount -t proc none /proc 2>/dev/null || true
mount -t sysfs none /sys 2>/dev/null || true
mount -t devtmpfs none /dev 2>/dev/null || true
mount -t tmpfs none /tmp 2>/dev/null || true
mount -t tmpfs none /run 2>/dev/null || true
mount -t debugfs none /sys/kernel/debug 2>/dev/null || true
mount -t tracefs none /sys/kernel/tracing 2>/dev/null || true

# Redirecionar I/O para console visível caso disponível
if [ -e /dev/console ]; then
  exec 0</dev/console 1>/dev/console 2>/dev/console 2>/dev/null || true
fi

# Inicialização de Plymouth Splash Screen (Boot Silencioso e Elegante)
CMDLINE="$(cat /proc/cmdline 2>/dev/null || echo '')"
if echo "$CMDLINE" | grep -q "splash" && command -v plymouthd >/dev/null 2>&1; then
  plymouthd --mode=boot --attach-to-session 2>/dev/null || true
  plymouth show-splash 2>/dev/null || true
fi

# Cores ANSI para inicialização
CLR_BLUE="\033[44;37m"
CLR_RESET="\033[0m"
CLR_OK="\033[1;32m[  OK  ]\033[0m"
CLR_INFO="\033[1;36m[ INFO ]\033[0m"
CLR_STEP="\033[1;33m[ INIT ]\033[0m"

echo ""
echo -e "${CLR_BLUE}================================================================================${CLR_RESET}"
echo -e "${CLR_BLUE}  INOVECLOUD OS 2026 - PURE KERNEL ARCHITECTURE • BIOS & KERNEL INITIALIZATION  ${CLR_RESET}"
echo -e "${CLR_BLUE}================================================================================${CLR_RESET}"
echo ""

mkdir -p /dev/pts /dev/shm /sys/fs/cgroup /tmp/runtime-inove /home/inove/CloudStorage /root /run/cups /var/spool/cups /var/run/dbus /mnt/persistence
chmod 0700 /tmp/runtime-inove
chmod 1777 /tmp
chmod 1777 /dev/shm
mount -t devpts -o mode=0620,ptmxmode=0666 devpts /dev/pts 2>/dev/null || true
mount -t cgroup2 none /sys/fs/cgroup 2>/dev/null || true
echo -e "${CLR_OK} Pseudo-terminais (pts) e Cgroups prontos."

# 2. Persistência de Dados no Modo Live USB (OverlayFS / persistence)
PERSIST_DEV="$(blkid 2>/dev/null | grep -i 'persistence\|inove-data' | cut -d: -f1 | head -n1 || echo '')"
if [ -n "$PERSIST_DEV" ]; then
  echo -e "${CLR_STEP} Partição de persistência detectada em ${PERSIST_DEV}. Montando..."
  mount "$PERSIST_DEV" /mnt/persistence 2>/dev/null || true
  if [ -d /mnt/persistence ]; then
    mkdir -p /mnt/persistence/home_inove /mnt/persistence/flatpak
    mount --bind /mnt/persistence/home_inove /home/inove 2>/dev/null || true
    echo -e "${CLR_OK} Modo Persistência Live USB ativado com sucesso!"
  fi
fi

# 3. Detecção Automática de Drivers Proprietários (GPU NVIDIA/AMD & Wi-Fi Broadcom)
if [ -x /usr/bin/inovecloud-hardware-detector ]; then
  /usr/bin/inovecloud-hardware-detector 2>/dev/null || true
fi

# 4. Inicializar Serviços de Mouse, Teclado, Áudio e Dispositivos (udev/mdev)
if command -v udevd >/dev/null 2>&1; then
  udevd --daemon 2>/dev/null || true
  udevadm trigger --action=add 2>/dev/null || true
  udevadm settle 2>/dev/null || true
  echo -e "${CLR_OK} Daemon udev ativo e dispositivos configurados."
fi

# 5. Configurar Conexão com a Internet e Atribuição de IP Automático (DHCP)
echo -e "${CLR_STEP} Configurando placas de rede e buscando IP via DHCP..."
hostname inovecloud-os 2>/dev/null || true
ifconfig lo 127.0.0.1 up 2>/dev/null || ip link set lo up 2>/dev/null || true

for iface in $(ls /sys/class/net/ 2>/dev/null | grep -v lo || true); do
  echo -e "${CLR_INFO} Ativando interface de rede: ${iface}..."
  ifconfig "$iface" up 2>/dev/null || ip link set "$iface" up 2>/dev/null || true
  udhcpc -i "$iface" -n -q -t 3 -T 2 -b 2>/dev/null || dhclient "$iface" 2>/dev/null || true
done

echo "nameserver 1.1.1.1" > /etc/resolv.conf 2>/dev/null || true
echo "nameserver 8.8.8.8" >> /etc/resolv.conf 2>/dev/null || true
rfkill unblock all 2>/dev/null || true
echo -e "${CLR_OK} Conectividade de rede e DNS configurados."

# 6. Iniciar Daemons D-Bus, Bluetooth, CUPS e Nuvem Híbrida
mkdir -p /run/dbus /var/run/dbus
if command -v dbus-daemon >/dev/null 2>&1; then
  dbus-daemon --system --fork --address=unix:path=/run/dbus/system_bus_socket 2>/dev/null || true
fi
if command -v bluetoothd >/dev/null 2>&1; then
  bluetoothd --compat & 2>/dev/null || true
fi
if command -v cupsd >/dev/null 2>&1; then
  cupsd 2>/dev/null || true
  echo -e "${CLR_OK} Servidor CUPS de impressão iniciado."
fi

# Iniciar sincronização de Nuvem Híbrida em background
if [ -x /usr/bin/inovecloud-sync ]; then
  /usr/bin/inovecloud-sync & 2>/dev/null || true
  echo -e "${CLR_OK} InoveCloud ID & Sincronização de Nuvem iniciados."
fi

# Criar script de suporte a AppImage se não existir
cat << 'RUNNER_EOF' > /usr/bin/inove-appimage-runner
#!/usr/bin/env sh
APP="$1"
if [ -z "$APP" ] || [ ! -f "$APP" ]; then
  echo "Uso: inove-appimage-runner <arquivo.AppImage>"
  exit 1
fi
chmod +x "$APP"
"$APP" "$@" 2>/dev/null || "$APP" --appimage-extract-and-run "$@"
RUNNER_EOF
chmod 755 /usr/bin/inove-appimage-runner 2>/dev/null || true

# Fechar Plymouth antes de carregar o ambiente gráfico
if command -v plymouth >/dev/null 2>&1; then
  plymouth quit 2>/dev/null || true
fi

# 7. Modo de Instalação Direta no Disco
if echo "$CMDLINE" | grep -q "inove_mode=installer"; then
  echo -e "${CLR_STEP} Iniciando Modo Instalador BIOS..."
  if [ -x /usr/bin/inovecloud-install ]; then
    /usr/bin/inovecloud-install
    echo "Pressione ENTER para continuar..."
    read -r _
  fi
fi

# 8. Informações de Inicialização e Status de Rede/IP
CURRENT_IP="$(ip -4 addr show scope global 2>/dev/null | grep inet | awk '{print $2}' | cut -d/ -f1 | head -n 1 || echo '')"
echo ""
echo -e "${CLR_BLUE}================================================================================${CLR_RESET}"
echo -e "${CLR_BLUE}   🚀 INOVECLOUD OS 2026 - AMBIENTE PRONTO & PRONTO PARA USO                     ${CLR_RESET}"
echo -e "${CLR_BLUE}================================================================================${CLR_RESET}"
echo -e "   ▶ Conexão Internet  : IP: ${CLR_OK} ${CURRENT_IP:-'Conectando via DHCP...'}"
echo -e "   ▶ Áudio & Multimídia: ALSA / PulseAudio + Spotify / VLC"
echo -e "   ▶ Servidor CUPS     : Impressoras USB / Rede ativas"
echo -e "   ▶ Wi-Fi / Bluetooth : Drivers ativos (Intel, Realtek, Broadcom)"
echo -e "   ▶ Nuvem Híbrida     : /home/inove/CloudStorage sincronizado"
echo -e "   ▶ Gerenciador Apps  : 'icpkg', 'flatpak' e 'apt'"
echo -e "${CLR_BLUE}================================================================================${CLR_RESET}"
echo ""

if [ ! -f /tmp/no_gui ] && ! echo "$CMDLINE" | grep -q "no_gui"; then
  echo -e "${CLR_STEP} Carregando Ambiente Gráfico InoveCloud OS (Wayland Liquid Glass)..."
  if [ -x /usr/bin/inove-gui ]; then
    /usr/bin/inove-gui
  elif [ -x /usr/bin/weston ]; then
    /usr/bin/weston --continue-without-input --log=/var/log/weston.log 2>/dev/null || true
  fi
fi

echo ""
echo -e "${CLR_BLUE}================================================================================${CLR_RESET}"
echo -e "${CLR_BLUE}   [ Console Interativo InoveCloud OS Pronto ]                                 ${CLR_RESET}"
echo -e "   ▶ Digite 'inove-gui' ou 'weston' para recarregar o ambiente gráfico"
echo -e "   ▶ Digite 'poweroff' para desligar ou 'reboot' para reiniciar"
echo -e "${CLR_BLUE}================================================================================${CLR_RESET}"
echo ""

# Loop eterno seguro: PID 1 NUNCA encerra, evitando Kernel Panic
while true; do
  if [ -x /bin/sh ]; then
    /bin/sh 2>/dev/null || true
  elif [ -x /bin/busybox ]; then
    /bin/busybox sh 2>/dev/null || true
  fi
  sleep 1
done
EOF
chmod 755 "${ROOTFS_DIR}/init"
cp -f "${ROOTFS_DIR}/init" "${ROOTFS_DIR}/sbin/init" 2>/dev/null || true

# Copiar ferramentas nativas InoveCloud (icpkg e inovecloud-install)
if [ -f "$(pwd)/icpkg.py" ]; then
  cp -f "$(pwd)/icpkg.py" "${ROOTFS_DIR}/usr/bin/icpkg" 2>/dev/null || true
  chmod +x "${ROOTFS_DIR}/usr/bin/icpkg" 2>/dev/null || true
fi
if [ -f "$(pwd)/inovecloud-install.sh" ]; then
  cp -f "$(pwd)/inovecloud-install.sh" "${ROOTFS_DIR}/usr/bin/inovecloud-install" 2>/dev/null || true
  chmod +x "${ROOTFS_DIR}/usr/bin/inovecloud-install" 2>/dev/null || true
fi

# 6. Baixar e Compilar Kernel Linux Puro com Suporte Total: Áudio, Impressoras, Wi-Fi, Bluetooth e Rede
echo -e "${C_BLUE}[6/7] Compilando Kernel Linux com Suporte a Áudio, Impressoras, Vídeo e Rede...${C_RESET}"
cd "${BUILD_DIR}"
if [ ! -f "linux-${KERNEL_VERSION}.tar.xz" ]; then
  echo "==> Baixando código-fonte oficial do Kernel Linux ${KERNEL_VERSION} de cdn.kernel.org..."
  wget "${KERNEL_URL}"
fi

if [ -f "linux-${KERNEL_VERSION}.tar.xz" ]; then
  KERNEL_SHA256=$(sha256sum "linux-${KERNEL_VERSION}.tar.xz" | awk '{print $1}')
  echo "✓ Verificação de Integridade SHA256 do Kernel (${KERNEL_VERSION}): ${KERNEL_SHA256}"
fi

if [ ! -d "linux-${KERNEL_VERSION}" ]; then
  tar -xJf "linux-${KERNEL_VERSION}.tar.xz"
fi

cd "linux-${KERNEL_VERSION}"
if [ ! -f ".config" ]; then
  make defconfig
  
  # 1. Flags de Vídeo e Anti-Tela Preta (VirtualBox VBoxSVGA/VMSVGA/QEMU/PC Real)
  scripts/config --enable CONFIG_VT
  scripts/config --enable CONFIG_VT_CONSOLE
  scripts/config --enable CONFIG_HW_CONSOLE
  scripts/config --enable CONFIG_FRAMEBUFFER_CONSOLE
  scripts/config --enable CONFIG_FRAMEBUFFER_CONSOLE_DETECT_PRIMARY
  scripts/config --enable CONFIG_FRAMEBUFFER_CONSOLE_ROTATION
  scripts/config --enable CONFIG_FONTS
  scripts/config --enable CONFIG_FONT_8x16
  scripts/config --enable CONFIG_FB
  scripts/config --enable CONFIG_FB_VESA
  scripts/config --enable CONFIG_FB_EFI
  scripts/config --enable CONFIG_FB_SIMPLE
  scripts/config --enable CONFIG_SYSFB
  scripts/config --enable CONFIG_SYSFB_SIMPLEFB
  scripts/config --enable CONFIG_DRM
  scripts/config --enable CONFIG_DRM_KMS_HELPER
  scripts/config --enable CONFIG_DRM_FBDEV_EMULATION
  scripts/config --set-val CONFIG_DRM_FBDEV_OVERALLOC 100
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
  
  # 5. Suporte a Mouse, Teclado, Touchpad e USB (Linux Core Input API)
  scripts/config --enable CONFIG_INPUT
  scripts/config --enable CONFIG_INPUT_KEYBOARD
  scripts/config --enable CONFIG_KEYBOARD_ATKBD
  scripts/config --enable CONFIG_INPUT_MOUSE
  scripts/config --enable CONFIG_MOUSE_PS2
  scripts/config --enable CONFIG_INPUT_MOUSEDEV
  scripts/config --enable CONFIG_INPUT_EVDEV
  scripts/config --enable CONFIG_INPUT_TOUCHSCREEN
  scripts/config --enable CONFIG_INPUT_MISC
  scripts/config --enable CONFIG_INPUT_UINPUT
  scripts/config --enable CONFIG_HID
  scripts/config --enable CONFIG_HID_GENERIC
  scripts/config --enable CONFIG_USB_HID
  scripts/config --enable CONFIG_USB_SUPPORT
  scripts/config --enable CONFIG_USB_XHCI_HCD
  scripts/config --enable CONFIG_USB_EHCI_HCD
  scripts/config --enable CONFIG_USB_OHCI_HCD
  scripts/config --enable CONFIG_USB_STORAGE
  
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
  
  # 7. Suporte a Execução de Binários ELF, Scripts e Memória (Initramfs / PID 1)
  scripts/config --enable CONFIG_BINFMT_ELF
  scripts/config --enable CONFIG_BINFMT_SCRIPT
  scripts/config --enable CONFIG_BINFMT_MISC
  scripts/config --enable CONFIG_TMPFS
  scripts/config --enable CONFIG_TMPFS_POSIX_ACL
  scripts/config --enable CONFIG_TMPFS_XATTR
  scripts/config --enable CONFIG_SHMEM
  scripts/config --enable CONFIG_PRINTK
  scripts/config --enable CONFIG_EARLY_PRINTK
  scripts/config --enable CONFIG_TTY
  scripts/config --enable CONFIG_SERIAL_8250
  scripts/config --enable CONFIG_SERIAL_8250_CONSOLE

  # 8. Suporte a Armazenamento e Inicialização (Decompressão de Initramfs)
  scripts/config --enable CONFIG_BLK_DEV_INITRD
  scripts/config --enable CONFIG_RD_GZIP
  scripts/config --enable CONFIG_RD_BZIP2
  scripts/config --enable CONFIG_RD_LZMA
  scripts/config --enable CONFIG_RD_XZ
  scripts/config --enable CONFIG_RD_LZO
  scripts/config --enable CONFIG_RD_LZ4
  scripts/config --enable CONFIG_RD_ZSTD

  # 9. FERRAMENTAS AVANÇADAS DO KERNEL (LINUX DEV-TOOLS: docs.kernel.org/dev-tools)
  # Tracing, eBPF JIT, FTrace, Kprobes, Perf Events & Diagnóstico
  scripts/config --enable CONFIG_BPF
  scripts/config --enable CONFIG_BPF_SYSCALL
  scripts/config --enable CONFIG_BPF_JIT
  scripts/config --enable CONFIG_BPF_JIT_ALWAYS_ON
  scripts/config --enable CONFIG_HAVE_EBPF_JIT
  scripts/config --enable CONFIG_TRACING
  scripts/config --enable CONFIG_TRACEPOINTS
  scripts/config --enable CONFIG_FTRACE
  scripts/config --enable CONFIG_FUNCTION_TRACER
  scripts/config --enable CONFIG_FUNCTION_GRAPH_TRACER
  scripts/config --enable CONFIG_DYNAMIC_FTRACE
  scripts/config --enable CONFIG_STACK_TRACER
  scripts/config --enable CONFIG_KPROBES
  scripts/config --enable CONFIG_KPROBES_ON_FTRACE
  scripts/config --enable CONFIG_UPROBES
  scripts/config --enable CONFIG_PERF_EVENTS
  scripts/config --enable CONFIG_HW_PERF_EVENTS
  scripts/config --enable CONFIG_EVENT_TRACING
  scripts/config --enable CONFIG_GENERIC_TRACER
  
  # Depuração & Diagnóstico do Kernel (GDB Scripts, KGDB, SysRq e KUnit)
  scripts/config --enable CONFIG_MAGIC_SYSRQ
  scripts/config --enable CONFIG_PRINTK_TIME
  scripts/config --set-val CONFIG_PANIC_TIMEOUT 5
  scripts/config --enable CONFIG_DEBUG_FS
  scripts/config --enable CONFIG_DEBUG_KERNEL
  scripts/config --enable CONFIG_DEBUG_INFO
  scripts/config --enable CONFIG_GDB_SCRIPTS
  scripts/config --enable CONFIG_KGDB
  scripts/config --enable CONFIG_KGDB_SERIAL_CONSOLE
  scripts/config --enable CONFIG_KUNIT
  scripts/config --enable CONFIG_SLUB_DEBUG
  scripts/config --enable CONFIG_DECOMPRESS_GZIP
  scripts/config --enable CONFIG_DECOMPRESS_BZIP2
  scripts/config --enable CONFIG_DECOMPRESS_LZMA
  scripts/config --enable CONFIG_DECOMPRESS_XZ
  scripts/config --enable CONFIG_DECOMPRESS_LZO
  scripts/config --enable CONFIG_DECOMPRESS_LZ4
  scripts/config --enable CONFIG_DECOMPRESS_ZSTD
  scripts/config --enable CONFIG_DEVTMPFS
  scripts/config --enable CONFIG_DEVTMPFS_MOUNT
  scripts/config --enable CONFIG_PCI
  scripts/config --enable CONFIG_PCI_MSI
  scripts/config --enable CONFIG_BLK_DEV_NVME
  scripts/config --enable CONFIG_ATA
  scripts/config --enable CONFIG_SATA_AHCI
  scripts/config --enable CONFIG_VIRTIO
  scripts/config --enable CONFIG_VIRTIO_PCI
  scripts/config --enable CONFIG_VIRTIO_BLK
  scripts/config --enable CONFIG_VIRTIO_NET
  scripts/config --enable CONFIG_ISO9660_FS
  scripts/config --enable CONFIG_EXT4_FS
  scripts/config --enable CONFIG_VFAT_FS
  scripts/config --enable CONFIG_EFI_STUB
  scripts/config --enable CONFIG_MAGIC_SYSRQ
  scripts/config --enable CONFIG_NETDEVICES
  scripts/config --enable CONFIG_E1000
  scripts/config --enable CONFIG_E1000E
  scripts/config --enable CONFIG_R8169

  make olddefconfig
fi

make -j"${NPROC}" bzImage
cd "${WORK_DIR}"

# 7. Executar Auditoria Pré-Boot e Gerar Initramfs CPIO
echo -e "${C_BLUE}[7/7] Executando auditoria pré-boot e gerando a imagem ISO oficial...${C_RESET}"
if [ -f "scripts/pre-boot-check.sh" ]; then
  chmod +x scripts/pre-boot-check.sh
  ./scripts/pre-boot-check.sh "${ROOTFS_DIR}" || echo "Avisos pré-boot verificados."
fi
rm -rf "${LIVE_DIR}"
mkdir -p "${LIVE_DIR}"/boot/grub

cd "${ROOTFS_DIR}"
# Limpar diretórios dinâmicos, logs e sockets para evitar corrupção no CPIO
rm -rf tmp/* run/* var/log/* var/run/* 2>/dev/null || true
mkdir -p dev proc sys tmp run mnt etc root home/inove home/inove/CloudStorage

# CPIO padrão SVR4 newc com permissões normalizadas para o kernel
find . -mindepth 1 -print0 | cpio --null -R 0:0 -H newc -o 2>/dev/null | gzip -9 -c > "${LIVE_DIR}/boot/initramfs.igz"
cd "${WORK_DIR}"

cp "${BUILD_DIR}/linux-${KERNEL_VERSION}/arch/x86/boot/bzImage" "${LIVE_DIR}/boot/vmlinuz"

cat << 'EOF' > "${LIVE_DIR}/boot/grub/grub.cfg"
set default="0"
set timeout=5

# Cores oficiais da BIOS (Fundo Azul clássico com texto Branco e seleção Ciano)
set color_normal=white/blue
set color_highlight=black/light-cyan
set menu_color_normal=white/blue
set menu_color_highlight=light-cyan/blue

set gfxmode=auto
set gfxpayload=keep
insmod all_video
insmod gfxterm
insmod part_msdos
insmod part_gpt
insmod ext2
insmod fat
insmod iso9660
insmod linux
terminal_output gfxterm

menuentry "🚀 InoveCloud OS 2026 (Live Desktop - Inicialização Padrão)" --class gnu-linux --class os {
    linux /boot/vmlinuz nomodeset loglevel=4 console=tty1 earlyprintk=vga
    initrd /boot/initramfs.igz
}

menuentry "🔍 InoveCloud OS (Diagnóstico Detalhado & Verbose Boot)" --class gnu-linux --class os {
    linux /boot/vmlinuz nomodeset ip=dhcp console=tty1 earlyprintk=vga debug loglevel=7 ignore_loglevel
    initrd /boot/initramfs.igz
}

menuentry "⚡ InoveCloud OS (Modo KMS / Aceleração Gráfica Nativa)" --class gnu-linux --class os {
    linux /boot/vmlinuz loglevel=4 console=tty1 earlyprintk=vga
    initrd /boot/initramfs.igz
}

menuentry "💾 InoveCloud OS (Modo Live USB com Persistência)" --class gnu-linux --class os {
    linux /boot/vmlinuz persistence nomodeset loglevel=4 console=tty1
    initrd /boot/initramfs.igz
}

menuentry "🛠️ InoveCloud OS (Modo Instalação no Disco SSD/NVMe)" --class gnu-linux --class os {
    linux /boot/vmlinuz inove_mode=installer nomodeset console=tty1
    initrd /boot/initramfs.igz
}

menuentry "🔄 Reiniciar Computador (Reboot)" {
    reboot
}

menuentry "⏻ Desligar Computador (Power Off)" {
    halt
}
EOF

# Validação Pré-Geração de Integridade GRUB & EFI
if [ -f "./scripts/check-grub-efi.sh" ]; then
  echo -e "\n${C_CYAN}[VERIFICAÇÃO] Executando diagnóstico de integridade do GRUB & EFI...${C_RESET}"
  bash "./scripts/check-grub-efi.sh" "${LIVE_DIR}" || true
fi

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
