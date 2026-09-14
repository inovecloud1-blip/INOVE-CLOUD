# Arquitetura e Guia Técnico: Compilação X11 / Wayland / Weston do Zero com BusyBox
Este documento fornece o passo a passo completo para integrar um servidor gráfico leve compilado do zero em distribuições independentes (BusyBox / LFS / Musl / Glibc).

---

## 1. Arquitetura da Stack Gráfica do Zero

```
+-------------------------------------------------------------+
|               Aplicativos (Firefox / Term / Flathub)        |
+-------------------------------------------------------------+
|    Window Manager / Compositor (Openbox / Weston / Labwc)   |
+-------------------------------------------------------------+
|  Display Server (Xorg Server 21.x / Wayland libwayland)     |
+-------------------------------------------------------------+
|  Drivers de Aceleração 3D (Mesa DRI / Gallium / Vulkan)    |
+-------------------------------------------------------------+
|  Kernel Linux Puro (DRM / KMS / Direct Rendering Manager)    |
+-------------------------------------------------------------+
```

---

## 2. Dependências Essenciais para Compilação no GitHub Actions

Para compilar o servidor gráfico a partir do código-fonte (C/C++), as seguintes bibliotecas são necessárias:

```bash
# Ferramentas de compilação
build-essential meson ninja-build cmake pkg-config bison flex

# Bibliotecas Core do Wayland e DRM
libdrm-dev libwayland-dev wayland-protocols libxkbcommon-dev libinput-dev libudev-dev libseat-dev

# Aceleração Gráfica e Shaders
libegl1-mesa-dev libgles2-mesa-dev libgbm-dev libpixman-1-dev
```

---

## 3. Passo a Passo de Compilação Automatizada (Workflow Script)

### A. Compilar libdrm (Direct Rendering Manager)
```bash
git clone https://gitlab.freedesktop.org/mesa/drm.git --depth=1
cd drm
meson build --prefix=/usr --buildtype=release -Dudev=true -Damdgpu=enabled -Dradeon=enabled -Dnouveau=enabled -Dintel=enabled
ninja -C build install
```

### B. Compilar Wayland e Protocolos
```bash
git clone https://gitlab.freedesktop.org/wayland/wayland.git --depth=1
cd wayland
meson build --prefix=/usr --buildtype=release -Ddocumentation=false
ninja -C build install

git clone https://gitlab.freedesktop.org/wayland/wayland-protocols.git --depth=1
cd wayland-protocols
meson build --prefix=/usr --buildtype=release
ninja -C build install
```

### C. Compilar Weston (Compositor Gráfico Wayland de Alta Performance)
```bash
git clone https://gitlab.freedesktop.org/wayland/weston.git --depth=1
cd weston
meson build --prefix=/usr --buildtype=release \
  -Dbackend-drm=true \
  -Dbackend-headless=false \
  -Dbackend-wayland=true \
  -Dbackend-x11=false \
  -Drenderer-gl=true \
  -Dlauncher-libseat=true \
  -Dpipewire=false
ninja -C build install
```

### D. Inicialização Automática no Boot (BusyBox inittab)
Adicione ao `/etc/inittab`:
```
::respawn:/usr/bin/weston --modules=systemd-notify.so --log=/var/log/weston.log
```
E no `/etc/xdg/weston/weston.ini`:
```ini
[core]
idle-time=0
require-input=false

[shell]
background-color=0x0a0c14
panel-position=bottom
locking=false
animation=zoom

[launcher]
icon=/usr/share/icons/terminal.png
path=/bin/sh

[launcher]
icon=/usr/share/icons/browser.png
path=/usr/bin/firefox
```
