#!/usr/bin/env bash
# ==============================================================================
# INOVECLOUD OS - BUILD ULTRARRÁPIDO BASEADO EM ARCH LINUX / ARCHISO
# Interface: XFCE4 + Plank Dock (Liquid Glass Dark Mode)
# Tempo de compilação: ~3 a 5 minutos (10x mais rápido que debootstrap Ubuntu/Debian)
# ==============================================================================

set -euo pipefail

C_CYAN='\033[0;36m'
C_GREEN='\033[0;32m'
C_BLUE='\033[0;34m'
C_YELLOW='\033[1;33m'
C_RED='\033[0;31m'
C_RESET='\033[0m'

echo -e "${C_CYAN}========================================================================${C_RESET}"
echo -e "${C_CYAN}   INOVECLOUD OS LINUX - BUILD ULTRARRÁPIDO (ARCHISO / DARK DOCK)       ${C_RESET}"
echo -e "${C_CYAN}========================================================================${C_RESET}"

if [ "$(id -u)" -ne 0 ]; then
  echo -e "${C_RED}[ERRO] Este script precisa ser executado como root (sudo).${C_RESET}"
  exit 1
fi

WORK_DIR="$(pwd)/inovecloud-arch-build"
PROFILE_DIR="${WORK_DIR}/archiso-profile"
OUTPUT_DIR="$(pwd)/dist-iso"
ISO_NAME="inovecloud-os-2026.1-fast-amd64.iso"

mkdir -p "${WORK_DIR}"
mkdir -p "${OUTPUT_DIR}"

# 1. Instalar archiso no host (suporta Arch, Manjaro ou Ubuntu com container)
echo -e "${C_BLUE}[1/5] Verificando ferramentas de compilação archiso...${C_RESET}"
if command -v pacman &>/dev/null; then
  pacman -Sy --noconfirm archiso zstd xorriso
else
  # Se estiver rodando no Ubuntu/Debian, usar imagem docker leve do Arch Linux para rodar em 3 minutos
  echo -e "${C_YELLOW}[INFO] Host não-Arch detectado. Usando motor nativo Arch Docker para build relâmpago...${C_RESET}"
  cat << 'DOCKER_EOF' > "${WORK_DIR}/Dockerfile"
FROM archlinux:latest
RUN pacman -Syu --noconfirm && \
    pacman -S --noconfirm archiso git sudo xorriso zstd
WORKDIR /build
DOCKER_EOF
  docker build -t inovecloud-arch-builder "${WORK_DIR}"
  docker run --privileged --rm \
    -v "$(pwd)":/repo \
    -w /repo \
    inovecloud-arch-builder bash -c "./build-inovecloud.sh --internal-arch"
  exit 0
fi

# 2. Criar perfil customizado leve do InoveCloud OS
echo -e "${C_BLUE}[2/5] Estruturando perfil leve do InoveCloud OS...${C_RESET}"
rm -rf "${PROFILE_DIR}"
cp -r /usr/share/archiso/configs/releng "${PROFILE_DIR}"

# Lista de pacotes essenciais e leves (sem inchaço)
cat << 'EOF' >> "${PROFILE_DIR}/packages.x86_64"
# Desktop Gráfico Leve & Moderno
xfce4
xfce4-goodies
plank
lightdm
lightdm-gtk-greeter

# Drivers de Vídeo e Áudio
mesa
xf86-video-intel
xf86-video-amdgpu
pipewire
pipewire-pulse
pipewire-alsa
wireplumber
networkmanager
network-manager-applet

# Aplicativos Nacionais e Suporte
firefox
thunar
xfce4-terminal
pavucontrol
flatpak
sudo
fastfetch
papirus-icon-theme
arc-gtk-theme
ttf-inter
noto-fonts-emoji
EOF

# 3. Configurar Usuário Padrão 'inove' e Autologin
echo -e "${C_BLUE}[3/5] Configurando usuário 'inove', sudoers e autologin...${C_RESET}"
mkdir -p "${PROFILE_DIR}/airootfs/etc/lightdm"
cat << 'EOF' > "${PROFILE_DIR}/airootfs/etc/lightdm/lightdm.conf"
[Seat:*]
autologin-user=inove
autologin-user-timeout=0
autologin-session=xfce
greeter-session=lightdm-gtk-greeter
EOF

mkdir -p "${PROFILE_DIR}/airootfs/etc/sudoers.d"
echo "inove ALL=(ALL) NOPASSWD: ALL" > "${PROFILE_DIR}/airootfs/etc/sudoers.d/inove-nopasswd"
chmod 0440 "${PROFILE_DIR}/airootfs/etc/sudoers.d/inove-nopasswd"

# 4. Configurar Visual Dark Mode & Dock Centralizada (Plank)
echo -e "${C_BLUE}[4/5] Aplicando tema Dark e Dock flutuante na parte inferior...${C_RESET}"
mkdir -p "${PROFILE_DIR}/airootfs/etc/skel/.config/plank/dock1"
mkdir -p "${PROFILE_DIR}/airootfs/etc/skel/.config/autostart"

# Configuração da Dock Plank (centralizada, tema escuro, atalhos rápidos)
cat << 'EOF' > "${PROFILE_DIR}/airootfs/etc/skel/.config/plank/dock1/settings"
[PlankDockPreferences]
Theme=Transparent
Position=Bottom
Alignment=Center
IconSize=48
HideMode=Auto
ZoomEnabled=true
ZoomPercent=130
DockItems=thunar.dockitem;;xfce4-terminal.dockitem;;firefox.dockitem;;xfce4-settings-manager.dockitem
EOF

# Iniciar Plank no autostart do usuário
cat << 'EOF' > "${PROFILE_DIR}/airootfs/etc/skel/.config/autostart/plank.desktop"
[Desktop Entry]
Type=Application
Exec=plank
Hidden=false
NoDisplay=false
X-GNOME-Autostart-enabled=true
Name=Plank Dock
EOF

# Configuração de Tema Escuro no XFCE (Arc-Dark + Papirus-Dark)
mkdir -p "${PROFILE_DIR}/airootfs/etc/skel/.config/xfce4/xfconf/xfce-perchannel-xml"
cat << 'EOF' > "${PROFILE_DIR}/airootfs/etc/skel/.config/xfce4/xfconf/xfce-perchannel-xml/xsettings.xml"
<?xml version="1.0" encoding="UTF-8"?>
<channel name="xsettings" version="1.0">
  <property name="Net" type="empty">
    <property name="ThemeName" type="string" value="Arc-Dark"/>
    <property name="IconThemeName" type="string" value="Papirus-Dark"/>
    <property name="FontName" type="string" value="Inter 10"/>
    <property name="EnableEventSounds" type="bool" value="false"/>
    <property name="EnableInputFeedbackSounds" type="bool" value="false"/>
  </property>
</channel>
EOF

# Script de primeiro boot para criar o usuário inove e ativar serviços
cat << 'EOF' > "${PROFILE_DIR}/airootfs/root/customize_airootfs.sh"
#!/usr/bin/env bash
systemctl enable lightdm
systemctl enable NetworkManager
systemctl enable systemd-timesyncd

# Criar usuário inove
if ! id "inove" &>/dev/null; then
  useradd -m -s /bin/bash inove
  echo "inove:inove" | chpasswd
  usermod -aG wheel,video,audio,input,render,storage inove
fi

# Copiar configurações para o usuário inove
cp -r /etc/skel/. /home/inove/
chown -R inove:inove /home/inove

# Habilitar Flathub
flatpak remote-add --if-not-exists flathub https://dl.flathub.org/repo/flathub.flatpakrepo || true
EOF
chmod +x "${PROFILE_DIR}/airootfs/root/customize_airootfs.sh"

# 5. Compilação da ISO com mkarchiso (Ultra Rápido com compressão paralela zstd)
echo -e "${C_BLUE}[5/5] Compilando a imagem ISO ultrarrápida com mkarchiso...${C_RESET}"
mkarchiso -v -w "${WORK_DIR}/work" -o "${OUTPUT_DIR}" "${PROFILE_DIR}"

# Renomear para o padrão InoveCloud OS
cd "${OUTPUT_DIR}"
LATEST_ISO="$(ls -t *.iso | head -n1)"
mv "${LATEST_ISO}" "${ISO_NAME}"
sha256sum "${ISO_NAME}" > "${ISO_NAME}.sha256"
cd - > /dev/null

echo -e "${C_GREEN}========================================================================${C_RESET}"
echo -e "${C_GREEN}   ✓ ISO ULTRARRÁPIDA DO INOVECLOUD OS GERADA COM SUCESSO!            ${C_RESET}"
echo -e "${C_GREEN}   Tempo estimado de build: ~3 a 5 minutos                            ${C_RESET}"
echo -e "${C_GREEN}   Arquivo: ${OUTPUT_DIR}/${ISO_NAME}                                 ${C_RESET}"
echo -e "${C_GREEN}   Base: Arch Linux + XFCE Dark + Plank Floating Dock                 ${C_RESET}"
echo -e "${C_GREEN}========================================================================${C_RESET}"
