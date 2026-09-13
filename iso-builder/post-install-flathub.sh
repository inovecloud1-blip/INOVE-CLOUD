#!/usr/bin/env bash
# ==============================================================================
# InoveCloud OS - Script de Pós-Instalação e Integração Flathub
# Base: Debian 13 (Trixie) com GNOME Software
# ==============================================================================

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
RESET='\033[0m'

echo -e "${CYAN}================================================================${RESET}"
echo -e "${CYAN}       INOVECLOUD OS - ATIVAÇÃO E INTEGRAÇÃO FLATHUB NATIVA     ${RESET}"
echo -e "${CYAN}================================================================${RESET}"

# 1. Verificar se o Flatpak está instalado
if ! command -v flatpak &>/dev/null; then
  echo -e "${BLUE}[1/4] Instalando Flatpak e Plugin para GNOME Software...${RESET}"
  apt-get update
  apt-get install -y --no-install-recommends flatpak gnome-software-plugin-flatpak
fi

# 2. Adicionar o repositório oficial Flathub
echo -e "${BLUE}[2/4] Registrando repositório oficial Flathub...${RESET}"
flatpak remote-add --if-not-exists flathub https://dl.flathub.org/repo/flathub.flatpakrepo

# 3. Atualizar metadados dos repositórios Flatpak
echo -e "${BLUE}[3/4] Sincronizando catálogo de aplicativos...${RESET}"
flatpak update --appstream || true

# 4. Configurar permissões padrão para o ambiente gráfico
echo -e "${BLUE}[4/4] Ajustando permissões de Wayland e temas para Flatpaks...${RESET}"
flatpak override --system --filesystem=xdg-config/gtk-3.0:ro --filesystem=xdg-config/gtk-4.0:ro || true

echo -e "${GREEN}✓ Flathub configurado e 100% integrado ao GNOME Software e InoveCloud OS!${RESET}"
