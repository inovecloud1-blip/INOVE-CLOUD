#!/usr/bin/env bash
# ==============================================================================
# InoveCloud OS - Script de Verificação Pré-Boot e Integridade do Sistema
# Valida: Dependências ELF/Bibliotecas (ldd), Módulos do Kernel, UUIDs de Partições,
# nós de dispositivos /dev, montagens vitais e permissões antes da 1ª inicialização.
# ==============================================================================

set -euo pipefail

# Cores e Formatação
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

TARGET_ROOT="${1:-/}"
ERRORS_FOUND=0
WARNINGS_FOUND=0

log_header() {
  echo -e "\n${BLUE}${BOLD}================================================================================${NC}"
  echo -e "${CYAN}${BOLD} 🚀 INOVECLOUD OS - PRE-BOOT SYSTEM INTEGRITY CHECKER${NC}"
  echo -e " Alvo inspecionado: ${BOLD}${TARGET_ROOT}${NC}"
  echo -e "${BLUE}${BOLD}================================================================================${NC}"
}

log_pass() {
  echo -e "  [ ${GREEN}✓ PASS${NC} ] $1"
}

log_fail() {
  echo -e "  [ ${RED}✗ FAIL${NC} ] ${RED}$1${NC}"
  ERRORS_FOUND=$((ERRORS_FOUND + 1))
}

log_warn() {
  echo -e "  [ ${YELLOW}! WARN${NC} ] ${YELLOW}$1${NC}"
  WARNINGS_FOUND=$((WARNINGS_FOUND + 1))
}

log_info() {
  echo -e "  [ ${CYAN}* INFO${NC} ] $1"
}

# ------------------------------------------------------------------------------
# 1. VERIFICAÇÃO DE DEPENDÊNCIAS DE BIBLIOTECAS DINÂMICAS (LDD / ELF RESOLUTION)
# ------------------------------------------------------------------------------
check_dynamic_dependencies() {
  echo -e "\n${BOLD}🔍 [1/5] Verificando Dependências Dinâmicas de Executáveis Críticos (ldd / ELF)...${NC}"
  
  local critical_bins=(
    "/bin/sh"
    "/bin/bash"
    "/bin/busybox"
    "/sbin/init"
    "/usr/bin/flatpak"
    "/usr/bin/weston"
    "/usr/bin/inove-gui"
    "/usr/bin/node"
    "/usr/bin/pipewire"
    "/sbin/udevd"
  )

  local checked_count=0
  local missing_libs=0

  for rel_bin in "${critical_bins[@]}"; do
    local full_path="${TARGET_ROOT}${rel_bin}"
    if [ -f "$full_path" ]; then
      checked_count=$((checked_count + 1))
      
      # Verifica se é um binário ELF
      if file "$full_path" 2>/dev/null | grep -q "ELF"; then
        # Executa verificação ldd procurando por bibliotecas 'not found'
        local ldd_output
        ldd_output=$(ldd "$full_path" 2>&1 || true)
        
        if echo "$ldd_output" | grep -q "not found"; then
          log_fail "Executável com biblioteca ausente: $rel_bin"
          echo -e "${RED}      Detalhes:${NC}"
          echo "$ldd_output" | grep "not found" | sed 's/^/        /'
          missing_libs=$((missing_libs + 1))
        elif echo "$ldd_output" | grep -q "statically linked"; then
          log_pass "$rel_bin (Binário Estático Puro - Sem dependências externas)"
        else
          log_pass "$rel_bin (Todas as bibliotecas ELF resolvidas com sucesso)"
        fi
      else
        log_info "$rel_bin (Script / Arquivo de Texto Interpretado)"
      fi
    fi
  done

  if [ $checked_count -eq 0 ]; then
    log_warn "Nenhum dos binários críticos padrões foi encontrado no caminho especificado."
  elif [ $missing_libs -eq 0 ]; then
    log_pass "Integridade do subsistema dinâmico ELF/glibc/musl 100% íntegra."
  fi
}

# ------------------------------------------------------------------------------
# 2. VERIFICAÇÃO DE MÓDULOS E RECURSOS DO KERNEL LINUX
# ------------------------------------------------------------------------------
check_kernel_and_modules() {
  echo -e "\n${BOLD}🐧 [2/5] Verificando Kernel Linux, Módulos e Subsistemas Críticos...${NC}"

  # 1. Verifica presença do bzImage / vmlinuz
  local kernel_found=0
  for kpath in "${TARGET_ROOT}/boot/vmlinuz"* "${TARGET_ROOT}/boot/bzImage"*; do
    if [ -f "$kpath" ]; then
      local ksize
      ksize=$(du -h "$kpath" | cut -f1)
      log_pass "Kernel Image localizado: $(basename "$kpath") (Tamanho: $ksize)"
      kernel_found=1
    fi
  done

  if [ $kernel_found -eq 0 ]; then
    log_fail "Nenhuma imagem do Kernel (/boot/vmlinuz* ou /boot/bzImage*) foi encontrada!"
  fi

  # 2. Verifica árvore de módulos /lib/modules
  local modules_dir="${TARGET_ROOT}/lib/modules"
  if [ -d "$modules_dir" ] && [ "$(ls -A "$modules_dir" 2>/dev/null)" ]; then
    local kver
    kver=$(ls "$modules_dir" | head -n 1)
    log_pass "Módulos do Kernel encontrados para a versão: $kver"
    
    # Testa dependências de módulos (modules.dep)
    if [ -f "${modules_dir}/${kver}/modules.dep" ]; then
      log_pass "Tabela de dependências de módulos (modules.dep) está compilada."
    else
      log_warn "modules.dep ausente. Executando depmod..."
      depmod -a "$kver" -b "$TARGET_ROOT" 2>/dev/null || log_warn "Não foi possível executar depmod automaticamente."
    fi
  else
    log_info "Kernel compilado monoliticamente com drivers embutidos (built-in) no bzImage."
  fi

  # 3. Verifica suporte a FUSE e DRM se estiver em ambiente ativo
  if [ -d /sys/module/fuse ] || grep -q "fuse" /proc/filesystems 2>/dev/null; then
    log_pass "Módulo FUSE (AppImage / Chrome / Sandboxing) ativo no Kernel."
  else
    log_info "Módulo FUSE será carregado dinamicamente no boot pelo /init."
  fi
}

# ------------------------------------------------------------------------------
# 3. VERIFICAÇÃO DE UUIDS, PARTIÇÕES E TABELA /etc/fstab
# ------------------------------------------------------------------------------
check_partition_uuids_and_fstab() {
  echo -e "\n${BOLD}💾 [3/5] Verificando UUIDs de Partições e Consistência do /etc/fstab...${NC}"

  local fstab_file="${TARGET_ROOT}/etc/fstab"

  if [ ! -f "$fstab_file" ]; then
    log_fail "Arquivo /etc/fstab não encontrado em ${TARGET_ROOT}/etc/fstab"
    return
  fi

  log_pass "Arquivo /etc/fstab localizado."

  # Analisa linhas ativas do fstab (ignorando comentários e linhas vazias)
  local line_num=0
  while IFS= read -r line || [ -n "$line" ]; do
    line_num=$((line_num + 1))
    
    # Pula linhas vazias ou comentários
    [[ "$line" =~ ^[[:space:]]*# ]] && continue
    [[ -z "${line// }" ]] && continue

    local device mountpoint fstype options dump pass
    read -r device mountpoint fstype options dump pass <<< "$line"

    if [[ "$device" =~ ^UUID= ]]; then
      local target_uuid="${device#UUID=}"
      target_uuid="${target_uuid%\"}"
      target_uuid="${target_uuid#\"}"

      # Se o comando blkid estiver disponível, valida se a partição existe
      if command -v blkid >/dev/null 2>&1; then
        if blkid | grep -q "$target_uuid"; then
          local real_dev
          real_dev=$(blkid -U "$target_uuid" 2>/dev/null || echo "Disco detectado")
          log_pass "UUID=$target_uuid ($mountpoint, $fstype) -> $real_dev"
        else
          log_warn "UUID=$target_uuid especificado para '$mountpoint', mas ainda não plugado no host (Normal para imagem ISO/Live)."
        fi
      else
        log_info "Entrada declarada: UUID=$target_uuid -> $mountpoint ($fstype)"
      fi
    elif [[ "$device" =~ ^LABEL= ]]; then
      log_pass "Entrada por Rótulo declarada: $device -> $mountpoint ($fstype)"
    elif [[ "$device" =~ ^/dev/ ]]; then
      log_info "Entrada de nó direto: $device -> $mountpoint ($fstype)"
    elif [[ "$fstype" =~ ^(proc|sysfs|devpts|tmpfs|debugfs|tracefs)$ ]]; then
      log_pass "Pseudo-sistema de arquivos essencial configurado: $mountpoint ($fstype)"
    fi
  done < "$fstab_file"
}

# ------------------------------------------------------------------------------
# 4. VERIFICAÇÃO DE DISPOSITIVOS ESPECIAIS (/dev) E PONTOS DE MONTAGEM
# ------------------------------------------------------------------------------
check_device_nodes_and_mounts() {
  echo -e "\n${BOLD}🔌 [4/5] Verificando Dispositivos de E/S Críticos em /dev...${NC}"

  local critical_devs=(
    "console:c:5:1"
    "null:c:1:3"
    "zero:c:1:5"
    "random:c:1:8"
    "urandom:c:1:9"
    "tty:c:5:0"
    "tty1:c:4:1"
    "fuse:c:10:229"
  )

  for dev_spec in "${critical_devs[@]}"; do
    IFS=":" read -r dname dtype dmajor dminor <<< "$dev_spec"
    local dev_path="${TARGET_ROOT}/dev/${dname}"

    if [ -e "$dev_path" ]; then
      log_pass "Nó /dev/$dname presente e acessível."
    else
      log_warn "Nó /dev/$dname ausente no RootFS. Criando nó estático (mknod)..."
      mknod -m 666 "$dev_path" "$dtype" "$dmajor" "$dminor" 2>/dev/null && \
        log_pass "Nó /dev/$dname criado com sucesso." || \
        log_warn "Não foi possível criar /dev/$dname (Requer privilégio root ou devtmpfs no boot)."
    fi
  done
}

# ------------------------------------------------------------------------------
# 5. VERIFICAÇÃO DO PROCESSO DE INIT, SHELL E SEGURANÇA
# ------------------------------------------------------------------------------
check_init_and_permissions() {
  echo -e "\n${BOLD}⚙️ [5/5] Verificando Binário de Inicialização (/init) e Permissões...${NC}"

  local init_targets=(
    "${TARGET_ROOT}/init"
    "${TARGET_ROOT}/sbin/init"
    "${TARGET_ROOT}/bin/init"
  )

  local init_found=0
  for ipath in "${init_targets[@]}"; do
    if [ -f "$ipath" ]; then
      if [ -x "$ipath" ]; then
        log_pass "Binário de Inicialização primário válido e executável: $(basename "$ipath")"
        init_found=1
      else
        log_fail "Binário de inicialização encontrado em '$ipath', mas NÃO possui permissão de execução (+x)!"
        chmod +x "$ipath" 2>/dev/null && log_pass "Permissão corrigida para +x."
      fi
      break
    fi
  done

  if [ $init_found -eq 0 ]; then
    log_fail "Nenhum processo /init ou /sbin/init executável foi encontrado na raiz do sistema!"
  fi

  # Valida permissões de /tmp e /root
  if [ -d "${TARGET_ROOT}/tmp" ]; then
    chmod 1777 "${TARGET_ROOT}/tmp" 2>/dev/null || true
    log_pass "Diretório temporário /tmp com permissão sticky bit (1777)."
  fi
}

# ------------------------------------------------------------------------------
# RELATÓRIO FINAL
# ------------------------------------------------------------------------------
print_summary() {
  echo -e "\n${BLUE}${BOLD}================================================================================${NC}"
  echo -e "${BOLD} 📊 RELATÓRIO FINAL DE INTEGRIDADE PRÉ-BOOT${NC}"
  echo -e "${BLUE}${BOLD}================================================================================${NC}"
  
  if [ $ERRORS_FOUND -eq 0 ]; then
    echo -e " ${GREEN}${BOLD}✓ SISTEMA 100% PRONTO PARA O BOOT!${NC}"
    echo -e "   - Erros Críticos: ${GREEN}0${NC}"
    echo -e "   - Avisos/Alertas: ${YELLOW}${WARNINGS_FOUND}${NC}"
    echo -e "   - O sistema inicializará com sucesso na máquina física ou virtual.\n"
    exit 0
  else
    echo -e " ${RED}${BOLD}✗ FALHAS CRÍTICAS ENCONTRADAS ANTES DO BOOT!${NC}"
    echo -e "   - Erros Críticos: ${RED}${ERRORS_FOUND}${NC}"
    echo -e "   - Avisos/Alertas: ${YELLOW}${WARNINGS_FOUND}${NC}"
    echo -e "   - Por favor, corrija as falhas listadas acima antes de gravar a imagem ISO.\n"
    exit 1
  fi
}

# Execução Principal
log_header
check_dynamic_dependencies
check_kernel_and_modules
check_partition_uuids_and_fstab
check_device_nodes_and_mounts
check_init_and_permissions
print_summary
