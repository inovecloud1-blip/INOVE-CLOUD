#!/usr/bin/env bash
# ==============================================================================
# INOVECLOUD OS - INSTALADOR OFICIAL DE DISCO NATIVO (SSD / NVMe / HDD)
# Copia o sistema Live para o disco, particiona (GPT/UEFI + BIOS) e instala o GRUB
# ==============================================================================

set -euo pipefail

C_CYAN='\033[0;36m'
C_GREEN='\033[0;32m'
C_BLUE='\033[0;34m'
C_YELLOW='\033[1;33m'
C_RED='\033[0;31m'
C_BOLD='\033[1m'
C_RESET='\033[0m'

clear
echo -e "${C_CYAN}========================================================================${C_RESET}"
echo -e "${C_CYAN}   🚀 INOVECLOUD OS - INSTALADOR NATIVO DE DISCO (CLI / GUI CALL)       ${C_RESET}"
echo -e "${C_CYAN}========================================================================${C_RESET}"

if [ "$(id -u)" -ne 0 ]; then
  echo -e "${C_RED}[ERRO] O instalador precisa ser executado com privilégios de root (sudo).${C_RESET}"
  exit 1
fi

# 1. Listagem dos Discos Disponíveis
echo -e "${C_BLUE}\n[1/5] Detectando unidades de armazenamento disponíveis...${C_RESET}\n"
lsblk -d -p -n -l -o NAME,SIZE,MODEL,TRAN,TYPE | grep -E "disk" || true
echo ""

# 2. Seleção do Disco Alvo
read -rp "Digite o caminho do disco para instalar o InoveCloud OS (ex: /dev/sda ou /dev/nvme0n1): " TARGET_DISK

if [ ! -b "${TARGET_DISK}" ]; then
  echo -e "${C_RED}[ERRO] Dispositivo ${TARGET_DISK} inválido ou não encontrado!${C_RESET}"
  exit 1
fi

echo -e "${C_RED}${C_BOLD}"
echo "⚠️  ATENÇÃO: TODOS OS DADOS EM ${TARGET_DISK} SERÃO APAGADOS PERMANENTEMENTE!"
echo -e "${C_RESET}"
read -rp "Tem certeza que deseja continuar a instalação? (digite 'sim' para prosseguir): " CONFIRM
if [ "${CONFIRM}" != "sim" ]; then
  echo -e "${C_YELLOW}Instalação cancelada pelo usuário.${C_RESET}"
  exit 0
fi

# 3. Particionamento Automático GPT (UEFI + Boot + Root ext4)
echo -e "${C_BLUE}\n[2/5] Criando tabela de partições GPT e formatando...${C_RESET}"

# Desmontar partições ativas no disco alvo
umount "${TARGET_DISK}"* 2>/dev/null || true

# Limpar tabela anterior
wipefs -a "${TARGET_DISK}"
sgdisk -Z "${TARGET_DISK}"

# Criar partição EFI (512M) e partição Root (Restante do disco)
sgdisk -n 1:0:+512M -t 1:ef00 -c 1:"EFI System Partition" "${TARGET_DISK}"
sgdisk -n 2:0:0     -t 2:8300 -c 2:"InoveCloud Root" "${TARGET_DISK}"

# Atualizar kernel sobre nova tabela
partprobe "${TARGET_DISK}"
sleep 2

# Determinar nomes das partições
if [[ "${TARGET_DISK}" =~ nvme|mmcblk ]]; then
  PART_EFI="${TARGET_DISK}p1"
  PART_ROOT="${TARGET_DISK}p2"
else
  PART_EFI="${TARGET_DISK}1"
  PART_ROOT="${TARGET_DISK}2"
fi

echo -e "${C_BLUE}Formatando partição EFI (${PART_EFI}) em FAT32...${C_RESET}"
mkfs.vfat -F32 "${PART_EFI}"

echo -e "${C_BLUE}Formatando partição Root (${PART_ROOT}) em ext4 de alta performance...${C_RESET}"
mkfs.ext4 -F -O fast_commit,dir_index -L "INOVECLOUD_ROOT" "${PART_ROOT}"

# 4. Montagem e Cópia do Sistema Operacional Live
echo -e "${C_BLUE}\n[3/5] Montando partições e transferindo arquivos do sistema...${C_RESET}"
MOUNT_TARGET="/mnt/inovecloud_install"
mkdir -p "${MOUNT_TARGET}"
mount "${PART_ROOT}" "${MOUNT_TARGET}"
mkdir -p "${MOUNT_TARGET}/boot/efi"
mount "${PART_EFI}" "${MOUNT_TARGET}/boot/efi"

# Sincronizar arquivos do sistema atual para o disco rígido
echo -e "${C_YELLOW}Copiando arquivos essenciais para o SSD/HD (aguarde)...${C_RESET}"
rsync -aAXv --delete \
  --exclude={"/dev/*","/proc/*","/sys/*","/tmp/*","/run/*","/mnt/*","/media/*","/lost+found"} \
  / "${MOUNT_TARGET}/"

# 5. Geração de fstab e Instalação do Bootloader GRUB
echo -e "${C_BLUE}\n[4/5] Configurando Inicialização e GRUB UEFI/BIOS...${C_RESET}"

UUID_ROOT=$(blkid -s UUID -o value "${PART_ROOT}")
UUID_EFI=$(blkid -s UUID -o value "${PART_EFI}")

cat << EOF > "${MOUNT_TARGET}/etc/fstab"
# /etc/fstab: Configuração de montagem do InoveCloud OS
UUID=${UUID_ROOT}   /           ext4    defaults,noatime,commit=60  0 1
UUID=${UUID_EFI}    /boot/efi   vfat    umask=0077                  0 2
tmpfs               /tmp        tmpfs   defaults,noatime,mode=1777  0 0
EOF

# Montar binds para o ambiente de instalação do GRUB
mount --bind /dev "${MOUNT_TARGET}/dev"
mount --bind /dev/pts "${MOUNT_TARGET}/dev/pts"
mount --bind /proc "${MOUNT_TARGET}/proc"
mount --bind /sys "${MOUNT_TARGET}/sys"

# Instalar GRUB EFI dentro do chroot
chroot "${MOUNT_TARGET}" /bin/bash -c "
  if [ -d /sys/firmware/efi ]; then
    echo 'Instalando GRUB para modo UEFI...'
    grub-install --target=x86_64-efi --efi-directory=/boot/efi --bootloader-id=InoveCloudOS --recheck || true
  else
    echo 'Instalando GRUB para modo BIOS Legacy...'
    grub-install --target=i386-pc ${TARGET_DISK} || true
  fi
  grub-mkconfig -o /boot/grub/grub.cfg || update-grub || true
"

# 6. Finalização e Limpeza
echo -e "${C_BLUE}\n[5/5] Finalizando instalação e desmontando unidades...${C_RESET}"
umount -lf "${MOUNT_TARGET}/dev/pts" 2>/dev/null || true
umount -lf "${MOUNT_TARGET}/dev" 2>/dev/null || true
umount -lf "${MOUNT_TARGET}/proc" 2>/dev/null || true
umount -lf "${MOUNT_TARGET}/sys" 2>/dev/null || true
umount -lf "${MOUNT_TARGET}/boot/efi" 2>/dev/null || true
umount -lf "${MOUNT_TARGET}" 2>/dev/null || true

echo -e "\n${C_GREEN}========================================================================${C_RESET}"
echo -e "${C_GREEN}   ✓ INOVECLOUD OS INSTALADO COM SUCESSO NO DISCO!                      ${C_RESET}"
echo -e "${C_GREEN}   Você já pode reiniciar o computador e remover o pendrive.            ${C_RESET}"
echo -e "${C_GREEN}========================================================================${C_RESET}\n"
