#!/usr/bin/env bash
# ==============================================================================
# InoveCloud OS - Script de Diagnóstico e Validação do GRUB & Partição EFI
# Valida a integridade sintática e referencial do grub.cfg, a montagem da
# partição EFI (ESP), a presença de binários EFI/GRUB e a existência dos alvos
# do Kernel (vmlinuz) e Initramfs (initramfs.igz) antes do boot.
# ==============================================================================

set -uo pipefail

# Cores e Formatação de Terminal
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
BOLD='\033[1m'
NC='\033[0m'

# Diretório raiz alvo ou ponto de montagem (padrão: / ou passado como argumento)
TARGET_DIR="${1:-/}"
ERRORS=0
WARNINGS=0

print_banner() {
  echo -e "\n${BLUE}${BOLD}================================================================================${NC}"
  echo -e "${CYAN}${BOLD} 🛡️  INOVECLOUD OS - DIAGNÓSTICO DE INTEGRIDADE GRUB & EFI (PRE-BOOT)${NC}"
  echo -e " Ponto de Inspeção: ${BOLD}${TARGET_DIR}${NC}"
  echo -e " Data do Teste: $(date '+%Y-%m-%d %H:%M:%S')"
  echo -e "${BLUE}${BOLD}================================================================================${NC}\n"
}

log_pass() {
  echo -e "  [ ${GREEN}✓ PASS${NC} ] $1"
}

log_fail() {
  echo -e "  [ ${RED}✗ FAIL${NC} ] ${RED}$1${NC}"
  ERRORS=$((ERRORS + 1))
}

log_warn() {
  echo -e "  [ ${YELLOW}! WARN${NC} ] ${YELLOW}$1${NC}"
  WARNINGS=$((WARNINGS + 1))
}

log_info() {
  echo -e "  [ ${CYAN}* INFO${NC} ] $1"
}

# ------------------------------------------------------------------------------
# 1. VALIDAÇÃO DE MONTAGEM E SISTEMA DE ARQUIVOS DA PARTIÇÃO EFI
# ------------------------------------------------------------------------------
check_efi_partition() {
  echo -e "${BOLD}${MAGENTA}▶ [1/4] Verificando Partição EFI (ESP - EFI System Partition)...${NC}"

  local efi_paths=(
    "${TARGET_DIR}/boot/efi"
    "${TARGET_DIR}/boot/EFI"
    "${TARGET_DIR}/EFI"
    "${TARGET_DIR}/efi"
  )

  local found_efi=""
  for p in "${efi_paths[@]}"; do
    if [ -d "$p" ]; then
      found_efi="$p"
      break
    fi
  done

  if [ -z "$found_efi" ]; then
    log_fail "Diretório EFI não encontrado em /boot/efi ou /EFI no alvo (${TARGET_DIR})."
  else
    log_pass "Diretório EFI localizado em: ${found_efi}"
    
    # Verificar se há montagem ativa do tipo vfat/fat/msdos se estivermos no sistema rodando
    if [ "${TARGET_DIR}" = "/" ] && command -v findmnt &>/dev/null; then
      local fstype
      fstype=$(findmnt -n -o FSTYPE -T "$found_efi" 2>/dev/null || true)
      if [[ "$fstype" == "vfat" || "$fstype" == "msdos" || "$fstype" == "fat" || "$fstype" == "iso9660" ]]; then
        log_pass "Sistema de arquivos da partição EFI é válido: ${fstype}"
      else
        log_warn "Partição EFI montada com sistema de arquivos incomum: '${fstype}' (Esperado: vfat/FAT32 ou iso9660 para Live)."
      fi
    fi

    # Verificar binários carregadores EFI
    local efi_binaries=(
      "bootx64.efi"
      "BOOTX64.EFI"
      "grubx64.efi"
      "grub.efi"
    )
    local found_bin=0
    for bin in "${efi_binaries[@]}"; do
      if find "$found_efi" -iname "$bin" | grep -q .; then
        log_pass "Carregador de boot UEFI encontrado: ${bin}"
        found_bin=1
      fi
    done

    if [ "$found_bin" -eq 0 ]; then
      log_warn "Nenhum executável EFI comum (bootx64.efi / grubx64.efi) encontrado na árvore ${found_efi}."
    fi
  fi
}

# ------------------------------------------------------------------------------
# 2. LOCALIZAÇÃO E SINTAXE DO ARQUIVO GRUB.CFG
# ------------------------------------------------------------------------------
check_grub_config_syntax() {
  echo -e "\n${BOLD}${MAGENTA}▶ [2/4] Validando Arquivo grub.cfg e Módulos Essenciais...${NC}"

  local grub_cfg_candidates=(
    "${TARGET_DIR}/boot/grub/grub.cfg"
    "${TARGET_DIR}/boot/grub2/grub.cfg"
    "${TARGET_DIR}/EFI/BOOT/grub.cfg"
    "${TARGET_DIR}/boot/efi/EFI/BOOT/grub.cfg"
    "${TARGET_DIR}/isolinux/grub.cfg"
  )

  local grub_cfg=""
  for cfg in "${grub_cfg_candidates[@]}"; do
    if [ -f "$cfg" ]; then
      grub_cfg="$cfg"
      break
    fi
  done

  if [ -z "$grub_cfg" ]; then
    log_fail "Arquivo grub.cfg não encontrado nos diretórios padrão (/boot/grub/, /EFI/BOOT/)."
    return
  fi

  log_pass "Arquivo de configuração do GRUB encontrado: ${grub_cfg} ($(wc -c < "$grub_cfg") bytes)"

  # Checagem de sintaxe com grub-script-check se instalado
  if command -v grub-script-check &>/dev/null; then
    if grub-script-check "$grub_cfg"; then
      log_pass "Sintaxe do arquivo grub.cfg validada com sucesso pelo utilitário grub-script-check."
    else
      log_fail "Erro de sintaxe detectado pelo grub-script-check no arquivo ${grub_cfg}."
    fi
  else
    log_info "grub-script-check não encontrado no host; aplicando validação estática de blocos."
    # Validação estática de chaves { } e blocos menuentry
    local opens
    local closes
    opens=$(grep -o "{" "$grub_cfg" | wc -l)
    closes=$(grep -o "}" "$grub_cfg" | wc -l)

    if [ "$opens" -eq "$closes" ]; then
      log_pass "Balanceamento de blocos e chaves { } íntegro (${opens} blocos abertos e fechados)."
    else
      log_fail "Inconsistência de sintaxe: ${opens} chaves de abertura '{' contra ${closes} de fechamento '}'."
    fi
  fi

  # Verificar presença de menuentry
  local menu_entries
  menu_entries=$(grep -c "^[[:space:]]*menuentry" "$grub_cfg" || true)
  if [ "$menu_entries" -gt 0 ]; then
    log_pass "Encontradas ${menu_entries} entradas de inicialização (menuentry) registradas."
  else
    log_fail "Nenhuma entrada 'menuentry' encontrada no arquivo grub.cfg."
  fi

  # Validar módulos críticos para boot em VM e Disco
  local essential_modules=("linux" "iso9660" "part_msdos" "part_gpt")
  for mod in "${essential_modules[@]}"; do
    if grep -q "insmod[[:space:]]\+${mod}" "$grub_cfg"; then
      log_pass "Módulo crítico do GRUB carregado: insmod ${mod}"
    else
      log_warn "Módulo 'insmod ${mod}' ausente no grub.cfg (Pode causar 'Unknown filesystem' ou 'Kernel not found' em certas VMs)."
    fi
  done
}

# ------------------------------------------------------------------------------
# 3. VERIFICAÇÃO DE ALVOS REFERENCIADOS (KERNEL VMLINUZ E INITRAMFS)
# ------------------------------------------------------------------------------
check_kernel_and_initrd_references() {
  echo -e "\n${BOLD}${MAGENTA}▶ [3/4] Verificando Referências de Kernel e Imagem Initramfs...${NC}"

  local grub_cfg=""
  for cfg in "${TARGET_DIR}/boot/grub/grub.cfg" "${TARGET_DIR}/boot/grub2/grub.cfg" "${TARGET_DIR}/EFI/BOOT/grub.cfg"; do
    if [ -f "$cfg" ]; then
      grub_cfg="$cfg"
      break
    fi
  done

  if [ -z "$grub_cfg" ]; then
    log_warn "Pulando verificação cruzada de caminhos pois grub.cfg não foi encontrado."
    return
  fi

  # Extrair caminhos do kernel (linhas 'linux' ou 'linux16' ou 'linuxefi')
  local kernel_lines
  kernel_lines=$(grep -E "^[[:space:]]*(linux|linux16|linuxefi)[[:space:]]+" "$grub_cfg" | awk '{print $2}' | sort -u || true)

  if [ -z "$kernel_lines" ]; then
    log_fail "Nenhuma diretiva 'linux' apontando para o binário do Kernel foi encontrada no grub.cfg."
  else
    while IFS= read -r kpath; do
      [ -z "$kpath" ] && continue
      local full_kpath="${TARGET_DIR}/${kpath#/}"
      if [ -f "$full_kpath" ]; then
        local ksize
        ksize=$(du -h "$full_kpath" | awk '{print $1}')
        log_pass "Kernel referenciado existe: ${kpath} (Tamanho: ${ksize})"
      else
        log_fail "Arquivo do Kernel NÃO existe no caminho apontado: ${kpath} (Tentado em: ${full_kpath})"
      fi
    done <<< "$kernel_lines"
  fi

  # Extrair caminhos de initrd (linhas 'initrd' ou 'initrd16' ou 'initrdefi')
  local initrd_lines
  initrd_lines=$(grep -E "^[[:space:]]*(initrd|initrd16|initrdefi)[[:space:]]+" "$grub_cfg" | awk '{print $2}' | sort -u || true)

  if [ -z "$initrd_lines" ]; then
    log_warn "Nenhuma diretiva 'initrd' encontrada no grub.cfg."
  else
    while IFS= read -r ipath; do
      [ -z "$ipath" ] && continue
      local full_ipath="${TARGET_DIR}/${ipath#/}"
      if [ -f "$full_ipath" ]; then
        local isize
        isize=$(du -h "$full_ipath" | awk '{print $1}')
        log_pass "Initramfs referenciado existe: ${ipath} (Tamanho: ${isize})"
      else
        log_fail "Arquivo de Initramfs NÃO existe no caminho apontado: ${ipath} (Tentado em: ${full_ipath})"
      fi
    done <<< "$initrd_lines"
  fi
}

# ------------------------------------------------------------------------------
# 4. VALIDAÇÃO DE PARÂMETROS DA LINHA DE COMANDO DO KERNEL (CMDLINE)
# ------------------------------------------------------------------------------
check_kernel_cmdline() {
  echo -e "\n${BOLD}${MAGENTA}▶ [4/4] Analisando Argumentos de Linha de Comando do Kernel (CMDLINE)...${NC}"

  local grub_cfg=""
  for cfg in "${TARGET_DIR}/boot/grub/grub.cfg" "${TARGET_DIR}/boot/grub2/grub.cfg" "${TARGET_DIR}/EFI/BOOT/grub.cfg"; do
    if [ -f "$cfg" ]; then
      grub_cfg="$cfg"
      break
    fi
  done

  [ -z "$grub_cfg" ] && return

  # Verificar parâmetros recomendados para compatibilidade e diagnóstico
  if grep -E "^[[:space:]]*linux" "$grub_cfg" | grep -q "console=tty"; then
    log_pass "Console TTY configurado para saída em tela (console=tty1)."
  else
    log_warn "Parâmetro 'console=tty1' ausente nas linhas do kernel."
  fi

  if grep -E "^[[:space:]]*linux" "$grub_cfg" | grep -q "nomodeset"; then
    log_pass "Opção de vídeo seguro 'nomodeset' presente para suporte amplo a VMs (VirtualBox/QEMU)."
  else
    log_info "Nenhum 'nomodeset' detectado. Certifique-se de que os drivers DRM/KMS estejam habilitados."
  fi

  if grep -E "^[[:space:]]*linux" "$grub_cfg" | grep -q "earlyprintk"; then
    log_pass "Diagnóstico antecipado ativado (earlyprintk) para depurar travamentos na BIOS/UEFI."
  fi
}

# ------------------------------------------------------------------------------
# RELATÓRIO FINAL
# ------------------------------------------------------------------------------
print_summary() {
  echo -e "\n${BLUE}${BOLD}================================================================================${NC}"
  echo -e "${BOLD}📋 RESUMO DO DIAGNÓSTICO DO GRUB & EFI${NC}"
  echo -e "${BLUE}${BOLD}================================================================================${NC}"
  echo -e "  Erros Críticos Encontrados: ${BOLD}$([ $ERRORS -gt 0 ] && echo -e "${RED}${ERRORS}" || echo -e "${GREEN}0")${NC}"
  echo -e "  Avisos / Recomendações:     ${BOLD}$([ $WARNINGS -gt 0 ] && echo -e "${YELLOW}${WARNINGS}" || echo -e "${GREEN}0")${NC}"
  
  if [ "$ERRORS" -eq 0 ]; then
    echo -e "\n${GREEN}${BOLD}✓ APROVADO:${NC} A configuração do GRUB e a estrutura EFI estão válidas para inicialização segura."
    echo -e "${BLUE}================================================================================${NC}\n"
    return 0
  else
    echo -e "\n${RED}${BOLD}✗ REPROVADO:${NC} Foram identificados problemas críticos que podem impedir o boot do sistema."
    echo -e "${BLUE}================================================================================${NC}\n"
    return 1
  fi
}

# Execução principal
print_banner
check_efi_partition
check_grub_config_syntax
check_kernel_and_initrd_references
check_kernel_cmdline
print_summary
